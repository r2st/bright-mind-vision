/**
 * Inventory Service with Embeddings
 * Stores all inventory data as embeddings for LLM semantic search
 */

import { createClient } from '@libsql/client';
import llmProvider from './llmProvider.js';

class InventoryService {
  constructor() {
    this.client = null;
    this.initialized = false;
    
    // Initialize if Turso is available
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      try {
        this.client = createClient({
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN
        });
        this.initialized = true;
        console.log('✅ Inventory Service initialized (Turso)');
        this.createTables();
      } catch (error) {
        console.error('❌ Failed to initialize Inventory Service:', error);
        this.initialized = false;
      }
    } else {
      console.warn('⚠️ Inventory Service: Turso credentials not found, using in-memory fallback');
    }
  }

  isAvailable() {
    return this.initialized && this.client !== null;
  }

  async createTables() {
    if (!this.isAvailable()) {
      console.warn('⚠️ Inventory Service: Client not initialized, cannot create tables');
      return;
    }

    try {
      // Inventory items table
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS inventory (
          sku TEXT PRIMARY KEY,
          product_name TEXT NOT NULL,
          brand TEXT,
          category TEXT,
          quantity INTEGER NOT NULL DEFAULT 0,
          reserved_quantity INTEGER NOT NULL DEFAULT 0,
          available_quantity INTEGER NOT NULL DEFAULT 0,
          location TEXT,
          last_restocked_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);

      // Inventory embeddings table for semantic search
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS inventory_embeddings (
          sku TEXT PRIMARY KEY,
          embedding TEXT NOT NULL,
          search_text TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (sku) REFERENCES inventory(sku) ON DELETE CASCADE
        )
      `);

      // Inventory transactions (restocks, adjustments, reservations)
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS inventory_transactions (
          transaction_id TEXT PRIMARY KEY,
          sku TEXT NOT NULL,
          transaction_type TEXT NOT NULL,
          quantity_change INTEGER NOT NULL,
          quantity_before INTEGER NOT NULL,
          quantity_after INTEGER NOT NULL,
          reason TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (sku) REFERENCES inventory(sku) ON DELETE CASCADE
        )
      `);

      // Indexes
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_inventory_brand ON inventory(brand)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(available_quantity)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_transactions_sku ON inventory_transactions(sku)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON inventory_transactions(transaction_type)
      `);

      console.log('✅ Inventory tables created successfully');
    } catch (error) {
      console.error('❌ Error creating inventory tables:', error);
      throw error;
    }
  }

  /**
   * Convert inventory item to searchable text for embedding
   */
  inventoryToSearchText(item) {
    return `${item.product_name} ${item.brand || ''} ${item.category || ''} ${item.sku} quantity ${item.available_quantity} in stock ${item.location || ''}`.trim();
  }

  /**
   * Generate and store embedding for inventory item
   * Only regenerates if search text changed (cost optimization)
   */
  async generateAndStoreEmbedding(sku, itemData, timestamp) {
    if (!this.isAvailable()) return;

    try {
      const newSearchText = this.inventoryToSearchText(itemData);
      
      // Check if embedding exists and search text hasn't changed
      const existing = await this.client.execute({
        sql: 'SELECT search_text FROM inventory_embeddings WHERE sku = ?',
        args: [sku]
      });
      
      if (existing.rows.length > 0 && existing.rows[0][0] === newSearchText) {
        // Search text unchanged, skip regeneration (save API calls)
        if (process.env.DEBUG_EMBEDDINGS === 'true') {
          console.log(`✅ Embedding unchanged for ${sku}, skipping regeneration`);
        }
        // Update timestamp only
        await this.client.execute({
          sql: 'UPDATE inventory_embeddings SET updated_at = ? WHERE sku = ?',
          args: [timestamp, sku]
        });
        return;
      }
      
      // Generate embedding only if search text changed
      const embedding = await llmProvider.generateEmbedding(newSearchText);
      
      // Validate embedding
      if (!Array.isArray(embedding) || embedding.length === 0) {
        console.warn(`⚠️ Invalid embedding for ${sku}, skipping storage`);
        return;
      }

      await this.client.execute({
        sql: `
          INSERT OR REPLACE INTO inventory_embeddings 
          (sku, embedding, search_text, created_at, updated_at)
          VALUES (?, ?, ?, COALESCE((SELECT created_at FROM inventory_embeddings WHERE sku = ?), ?), ?)
        `,
        args: [
          sku,
          JSON.stringify(embedding),
          newSearchText,
          sku, // For COALESCE
          timestamp, // Fallback if new
          timestamp
        ]
      });
    } catch (error) {
      console.warn('⚠️ Failed to generate inventory embedding (non-critical):', error.message);
      // Don't throw - embeddings are optional
    }
  }

  /**
   * Add or update inventory item
   */
  async upsertInventory(sku, data) {
    if (!this.isAvailable()) {
      throw new Error('Inventory Service not available');
    }

    const timestamp = new Date().toISOString();
    const availableQuantity = (data.quantity || 0) - (data.reserved_quantity || 0);

    try {
      // Check if exists
      const existing = await this.client.execute({
        sql: 'SELECT * FROM inventory WHERE sku = ?',
        args: [sku]
      });

      if (existing.rows.length > 0) {
        // Update existing
        await this.client.execute({
          sql: `
            UPDATE inventory 
            SET product_name = ?, brand = ?, category = ?, quantity = ?, 
                reserved_quantity = ?, available_quantity = ?, location = ?,
                last_restocked_at = ?, updated_at = ?
            WHERE sku = ?
          `,
          args: [
            data.product_name,
            data.brand || null,
            data.category || null,
            data.quantity || 0,
            data.reserved_quantity || 0,
            availableQuantity,
            data.location || null,
            data.last_restocked_at || null,
            timestamp,
            sku
          ]
        });

        // Record transaction if quantity changed
        const oldQuantity = existing.rows[0][3]; // quantity column
        if (oldQuantity !== data.quantity) {
          await this.recordTransaction(sku, 'adjustment', data.quantity - oldQuantity, oldQuantity, data.quantity, 'Inventory update');
        }
      } else {
        // Insert new
        await this.client.execute({
          sql: `
            INSERT INTO inventory 
            (sku, product_name, brand, category, quantity, reserved_quantity, 
             available_quantity, location, last_restocked_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            sku,
            data.product_name,
            data.brand || null,
            data.category || null,
            data.quantity || 0,
            data.reserved_quantity || 0,
            availableQuantity,
            data.location || null,
            data.last_restocked_at || null,
            timestamp,
            timestamp
          ]
        });

        // Record initial transaction
        await this.recordTransaction(sku, 'initial', data.quantity || 0, 0, data.quantity || 0, 'Initial inventory');
      }

      // Generate and store embedding
      const itemData = {
        sku,
        product_name: data.product_name,
        brand: data.brand,
        category: data.category,
        available_quantity: availableQuantity,
        location: data.location
      };
      await this.generateAndStoreEmbedding(sku, itemData, timestamp);

      return { success: true, sku, available_quantity: availableQuantity };
    } catch (error) {
      console.error('Error upserting inventory:', error);
      throw error;
    }
  }

  /**
   * Record inventory transaction
   */
  async recordTransaction(sku, type, quantityChange, quantityBefore, quantityAfter, reason = null) {
    if (!this.isAvailable()) return;

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    try {
      await this.client.execute({
        sql: `
          INSERT INTO inventory_transactions 
          (transaction_id, sku, transaction_type, quantity_change, quantity_before, 
           quantity_after, reason, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          transactionId,
          sku,
          type,
          quantityChange,
          quantityBefore,
          quantityAfter,
          reason,
          timestamp
        ]
      });
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }

  /**
   * Check stock for a product
   */
  async checkStock(sku) {
    if (!this.isAvailable()) {
      // Fallback: return mock data
      return {
        sku,
        in_stock: true,
        stock_level: 10,
        available_quantity: 10
      };
    }

    try {
      const result = await this.client.execute({
        sql: 'SELECT * FROM inventory WHERE sku = ?',
        args: [sku]
      });

      if (result.rows.length === 0) {
        // Product not found in inventory - return null to indicate "not found" vs "out of stock"
        // This allows graceful degradation (allow cart addition even if inventory not synced)
        return {
          sku,
          in_stock: null, // null = not found, false = out of stock, true = in stock
          stock_level: null,
          available_quantity: null,
          product_name: null,
          brand: null,
          category: null
        };
      }

      const row = result.rows[0];
      
      // Turso can return rows as objects (with column names) or arrays (with indices)
      // Handle both cases
      let totalQuantity, reservedQuantity, availableQuantity, location, productName, brand, category;
      
      // Check if row is an object with column names
      if (typeof row === 'object' && !Array.isArray(row) && row.quantity !== undefined) {
        // Row is an object with column names (e.g., { sku: '...', quantity: 10, ... })
        totalQuantity = row.quantity || 0;
        reservedQuantity = row.reserved_quantity || 0;
        availableQuantity = row.available_quantity || 0;
        location = row.location || null;
        productName = row.product_name || null;
        brand = row.brand || null;
        category = row.category || null;
      } else if (result.columns && result.columns.length > 0) {
        // Row is an array, use column metadata to map
        const rowObj = {};
        result.columns.forEach((col, idx) => {
          rowObj[col] = row[idx];
        });
        totalQuantity = rowObj.quantity || 0;
        reservedQuantity = rowObj.reserved_quantity || 0;
        availableQuantity = rowObj.available_quantity || 0;
        location = rowObj.location || null;
        productName = rowObj.product_name || null;
        brand = rowObj.brand || null;
        category = rowObj.category || null;
      } else {
        // Fallback to index-based access
        // Column order: sku, product_name, brand, category, quantity, reserved_quantity, available_quantity, location, ...
        // Index:        0    1             2      3         4         5                   6                  7
        totalQuantity = row[4] || 0;
        reservedQuantity = row[5] || 0;
        availableQuantity = row[6] || 0;
        location = row[7] || null;
        productName = row[1] || null;
        brand = row[2] || null;
        category = row[3] || null;
      }

      console.log(`📊 Inventory check for ${sku}:`, {
        quantity: totalQuantity,
        reserved_quantity: reservedQuantity,
        available_quantity: availableQuantity,
        in_stock: availableQuantity > 0,
        location: location
      });

      return {
        sku,
        product_name: productName,
        brand: brand,
        category: category,
        in_stock: availableQuantity > 0, // true if available, false if 0
        stock_level: totalQuantity,
        available_quantity: availableQuantity,
        reserved_quantity: reservedQuantity,
        location: location
      };
    } catch (error) {
      console.error('Error checking stock:', error);
      return {
        sku,
        in_stock: false,
        stock_level: 0,
        available_quantity: 0
      };
    }
  }

  /**
   * Reserve inventory (for cart/order)
   */
  async reserveInventory(sku, quantity) {
    if (!this.isAvailable()) {
      return { success: true, reserved: quantity };
    }

    try {
      const result = await this.client.execute({
        sql: 'SELECT quantity, reserved_quantity, available_quantity FROM inventory WHERE sku = ?',
        args: [sku]
      });

      if (result.rows.length === 0) {
        return { success: false, message: 'Product not found in inventory' };
      }

      const row = result.rows[0];
      const currentQuantity = row[0] || 0;
      const currentReserved = row[1] || 0;
      const currentAvailable = row[2] || 0;

      if (currentAvailable < quantity) {
        return { success: false, message: 'Insufficient stock available' };
      }

      const newReserved = currentReserved + quantity;
      const newAvailable = currentAvailable - quantity;

      await this.client.execute({
        sql: 'UPDATE inventory SET reserved_quantity = ?, available_quantity = ?, updated_at = ? WHERE sku = ?',
        args: [newReserved, newAvailable, new Date().toISOString(), sku]
      });

      await this.recordTransaction(sku, 'reservation', quantity, currentAvailable, newAvailable, 'Reserved for order');

      // Update embedding
      const itemData = await this.client.execute({
        sql: 'SELECT * FROM inventory WHERE sku = ?',
        args: [sku]
      });
      if (itemData.rows.length > 0) {
        const item = itemData.rows[0];
        await this.generateAndStoreEmbedding(sku, {
          sku,
          product_name: item[1],
          brand: item[2],
          category: item[3],
          available_quantity: newAvailable,
          location: item[7]
        }, new Date().toISOString());
      }

      return { success: true, reserved: quantity, available_quantity: newAvailable };
    } catch (error) {
      console.error('Error reserving inventory:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Release reserved inventory (for cancelled orders)
   */
  async releaseInventory(sku, quantity) {
    if (!this.isAvailable()) {
      return { success: true };
    }

    try {
      const result = await this.client.execute({
        sql: 'SELECT reserved_quantity, available_quantity FROM inventory WHERE sku = ?',
        args: [sku]
      });

      if (result.rows.length === 0) {
        return { success: false, message: 'Product not found' };
      }

      const row = result.rows[0];
      const currentReserved = row[0] || 0;
      const currentAvailable = row[1] || 0;

      const newReserved = Math.max(0, currentReserved - quantity);
      const newAvailable = currentAvailable + quantity;

      await this.client.execute({
        sql: 'UPDATE inventory SET reserved_quantity = ?, available_quantity = ?, updated_at = ? WHERE sku = ?',
        args: [newReserved, newAvailable, new Date().toISOString(), sku]
      });

      await this.recordTransaction(sku, 'release', quantity, currentAvailable, newAvailable, 'Released from reservation');

      return { success: true, available_quantity: newAvailable };
    } catch (error) {
      console.error('Error releasing inventory:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Semantic search inventory using embeddings
   */
  async searchInventory(query, limit = 10) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      // Generate embedding for query
      const queryEmbedding = await llmProvider.generateEmbedding(query);

      // Get all inventory embeddings
      const result = await this.client.execute({
        sql: `
          SELECT ie.sku, ie.embedding, ie.search_text, 
                 i.product_name, i.brand, i.category, i.available_quantity, i.location
          FROM inventory_embeddings ie
          JOIN inventory i ON ie.sku = i.sku
        `
      });

      if (result.rows.length === 0) {
        return [];
      }

      // Calculate cosine similarity
      const similarities = [];
      for (const row of result.rows) {
        const itemEmbedding = JSON.parse(row[1]);
        const similarity = this.cosineSimilarity(queryEmbedding, itemEmbedding);
        
        similarities.push({
          sku: row[0],
          similarity: similarity,
          product_name: row[3],
          brand: row[4],
          category: row[5],
          available_quantity: row[6],
          location: row[7]
        });
      }

      // Sort by similarity and return top results
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      return similarities.slice(0, limit).filter(item => item.similarity > 0.3);
    } catch (error) {
      console.error('Error searching inventory:', error);
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();


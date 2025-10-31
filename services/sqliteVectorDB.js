import Database from 'better-sqlite3';
import path from 'path';

/**
 * SQLite Vector Database Service
 * Handles product embeddings storage and retrieval for RAG system
 */
class SQLiteVectorDB {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.cwd(), 'data', 'product_embeddings.db');
    this.init();
  }

  init() {
    try {
      // Ensure data directory exists
      const fs = require('fs');
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new Database(this.dbPath);
      this.createTables();
      console.log('✅ SQLite Vector Database initialized');
    } catch (error) {
      console.error('❌ SQLite Vector Database initialization failed:', error);
    }
  }

  createTables() {
    if (!this.db) {
      console.error('❌ Cannot create tables: Database not initialized');
      return;
    }

    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        brand TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        price REAL NOT NULL,
        currency TEXT NOT NULL,
        description TEXT,
        tags TEXT,
        rating REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Embeddings table for vector storage
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        embedding_type TEXT NOT NULL, -- 'title', 'description', 'combined'
        embedding BLOB NOT NULL, -- Store as JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    // Indexes for performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
      CREATE INDEX IF NOT EXISTS idx_embeddings_product_id ON embeddings(product_id);
      CREATE INDEX IF NOT EXISTS idx_embeddings_type ON embeddings(embedding_type);
    `);
  }

  // Insert or update product
  upsertProduct(product) {
    if (!this.db) {
      console.warn('⚠️ VectorDB: Database not initialized, skipping product upsert');
      return null;
    }

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO products 
        (sku, title, brand, category, subcategory, price, currency, description, tags, rating, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      const result = stmt.run(
        product.sku,
        product.title,
        product.brand,
        JSON.stringify(product.category),
        product.subcategory || null,
        product.price?.amount || 0,
        product.price?.currency || 'AED',
        product.description || '',
        JSON.stringify(product.tags || []),
        product.rating || 0
      );
      return result.lastInsertRowid;
    } catch (error) {
      console.error('Error upserting product:', error);
      return null;
    }
  }

  // Store embedding for a product
  storeEmbedding(productId, embeddingType, embedding) {
    if (!this.db) {
      console.warn('⚠️ VectorDB: Database not initialized, skipping embedding storage');
      return false;
    }

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO embeddings 
        (product_id, embedding_type, embedding)
        VALUES (?, ?, ?)
      `);

      stmt.run(productId, embeddingType, JSON.stringify(embedding));
      return true;
    } catch (error) {
      console.error('Error storing embedding:', error);
      return false;
    }
  }

  // Get all products
  getAllProducts() {
    if (!this.db) {
      console.warn('⚠️ VectorDB: Database not initialized, returning empty array');
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM products ORDER BY updated_at DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Error getting all products:', error);
      return [];
    }
  }

  // Get product by SKU
  getProductBySku(sku) {
    if (!this.db) {
      console.warn('⚠️ VectorDB: Database not initialized, returning null');
      return null;
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM products WHERE sku = ?
      `);
      return stmt.get(sku);
    } catch (error) {
      console.error('Error getting product by SKU:', error);
      return null;
    }
  }

  // Get products by category
  getProductsByCategory(category) {
    if (!this.db) {
      console.warn('⚠️ VectorDB: Database not initialized, returning empty array');
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM products WHERE category LIKE ? ORDER BY rating DESC
      `);
      return stmt.all(`%${category}%`);
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  // Get embeddings for a product
  getEmbeddings(productId) {
    if (!this.db) {
      console.warn('⚠️ VectorDB: Database not initialized, returning empty array');
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT embedding_type, embedding FROM embeddings WHERE product_id = ?
      `);
      const results = stmt.all(productId);
      return results.map(row => ({
        type: row.embedding_type,
        embedding: JSON.parse(row.embedding)
      }));
    } catch (error) {
      console.error('Error getting embeddings:', error);
      return [];
    }
  }

  // Search products by text (simple LIKE search)
  searchProducts(query) {
    if (!this.db) {
      console.warn('⚠️ VectorDB: Database not initialized, returning empty array');
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM products 
        WHERE title LIKE ? OR description LIKE ? OR tags LIKE ?
        ORDER BY rating DESC
      `);
      const searchTerm = `%${query}%`;
      return stmt.all(searchTerm, searchTerm, searchTerm);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Get product count
  getProductCount() {
    if (!this.db) {
      console.warn('⚠️ VectorDB: Database not initialized, returning 0');
      return 0;
    }

    try {
      const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM products`);
      return stmt.get().count;
    } catch (error) {
      console.error('Error getting product count:', error);
      return 0;
    }
  }

  // Get embedding count
  getEmbeddingCount() {
    if (!this.db) {
      console.warn('⚠️ VectorDB: Database not initialized, returning 0');
      return 0;
    }

    try {
      const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM embeddings`);
      return stmt.get().count;
    } catch (error) {
      console.error('Error getting embedding count:', error);
      return 0;
    }
  }

  // Clear all data
  clearAll() {
    if (!this.db) {
      console.warn('⚠️ VectorDB: Database not initialized, cannot clear');
      return;
    }

    try {
      this.db.exec(`DELETE FROM embeddings`);
      this.db.exec(`DELETE FROM products`);
      console.log('🗑️ All data cleared from vector database');
    } catch (error) {
      console.error('Error clearing database:', error);
    }
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const vectorDB = new SQLiteVectorDB();
export default vectorDB;

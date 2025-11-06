import { createClient } from '@libsql/client';
import llmProvider from './llmProvider.js';

/**
 * Turso Order Service
 * Handles orders, carts, and returns using Turso (serverless-compatible)
 * Includes embeddings for semantic search on order history
 * Falls back to local SQLite if Turso is not available
 */
class TursoOrderService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      const databaseUrl = process.env.TURSO_DATABASE_URL;
      const authToken = process.env.TURSO_AUTH_TOKEN;

      if (!databaseUrl || !authToken) {
        console.warn('⚠️ Turso Order Service: Credentials not found. Orders will use local SQLite fallback.');
        return;
      }

      this.client = createClient({
        url: databaseUrl,
        authToken: authToken,
      });

      this.initialized = true;
      console.log('✅ Turso Order Service initialized');
    } catch (error) {
      console.error('❌ Turso Order Service initialization failed:', error);
      this.client = null;
    }
  }

  isAvailable() {
    return this.client !== null && this.initialized;
  }

  async createTables() {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso Order Service: Client not initialized, cannot create tables');
      return;
    }

    try {
      // Shopping carts
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS carts (
          cart_id TEXT PRIMARY KEY,
          customer_id TEXT NOT NULL,
          items TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          abandoned_at TEXT
        )
      `);

      // Orders
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id TEXT PRIMARY KEY,
          customer_id TEXT NOT NULL,
          cart_id TEXT,
          items TEXT NOT NULL,
          subtotal REAL NOT NULL,
          shipping_cost REAL NOT NULL,
          tax REAL NOT NULL,
          discount REAL NOT NULL,
          total REAL NOT NULL,
          currency TEXT NOT NULL,
          status TEXT NOT NULL,
          shipping_address TEXT NOT NULL,
          billing_address TEXT NOT NULL,
          payment_method TEXT,
          payment_status TEXT NOT NULL,
          payment_transaction_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          shipped_at TEXT,
          delivered_at TEXT
        )
      `);

      // Returns and refunds
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS returns (
          return_id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          customer_id TEXT NOT NULL,
          items TEXT NOT NULL,
          reason TEXT NOT NULL,
          status TEXT NOT NULL,
          refund_amount REAL NOT NULL,
          refund_status TEXT NOT NULL,
          created_at TEXT NOT NULL,
          processed_at TEXT
        )
      `);

      // Indexes for performance
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_carts_updated_at ON carts(updated_at)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_returns_customer_id ON returns(customer_id)
      `);

      // Embeddings tables for semantic search
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS cart_embeddings (
          cart_id TEXT PRIMARY KEY,
          customer_id TEXT NOT NULL,
          embedding TEXT NOT NULL,
          search_text TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE
        )
      `);

      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS order_embeddings (
          order_id TEXT PRIMARY KEY,
          customer_id TEXT NOT NULL,
          embedding TEXT NOT NULL,
          search_text TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
        )
      `);

      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS return_embeddings (
          return_id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          customer_id TEXT NOT NULL,
          embedding TEXT NOT NULL,
          search_text TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (return_id) REFERENCES returns(return_id) ON DELETE CASCADE
        )
      `);

      // Indexes for embeddings
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_cart_embeddings_customer_id ON cart_embeddings(customer_id)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_order_embeddings_customer_id ON order_embeddings(customer_id)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_return_embeddings_customer_id ON return_embeddings(customer_id)
      `);

      console.log('✅ Turso order tables created successfully');
    } catch (error) {
      console.error('❌ Error creating Turso order tables:', error);
      throw error;
    }
  }

  // Cart Management
  async getCart(customerId) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso not available for cart retrieval');
      return null; // Will fallback to local SQLite
    }

    if (!customerId) {
      console.error('❌ Customer ID is required for cart retrieval');
      return { items: [], total: 0, currency: 'AED' };
    }

    try {
      console.log(`🛒 Fetching cart from Turso for customer: ${customerId}`);
      
      const result = await this.client.execute({
        sql: `SELECT * FROM carts WHERE customer_id = ? ORDER BY updated_at DESC LIMIT 1`,
        args: [customerId]
      });

      console.log(`🛒 Turso query result:`, {
        rowsFound: result.rows.length,
        customerId: customerId
      });

      if (result.rows.length === 0) {
        console.log(`🛒 No cart found for customer: ${customerId}`);
        return { items: [], total: 0, currency: 'AED' };
      }

      const row = result.rows[0];
      const itemsJson = row.items || '[]';
      let items = [];
      
      try {
        items = JSON.parse(itemsJson);
      } catch (parseError) {
        console.error('❌ Error parsing cart items JSON:', parseError);
        console.error('❌ Raw items data:', itemsJson);
        return { items: [], total: 0, currency: 'AED' };
      }
      
      const total = items.reduce((sum, item) => {
        const price = typeof item.price === 'object' ? item.price.amount : item.price;
        return sum + (price * (item.quantity || 1));
      }, 0);

      console.log(`✅ Cart retrieved from Turso:`, {
        cartId: row.cart_id,
        itemsCount: items.length,
        total: total,
        customerId: customerId
      });

      return {
        cart_id: row.cart_id,
        items: items,
        total: total,
        currency: 'AED',
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error('❌ Error getting cart from Turso:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        customerId: customerId
      });
      return null;
    }
  }

  async updateCart(customerId, items) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso not available for cart update');
      return null;
    }

    if (!customerId) {
      console.error('❌ Customer ID is required for cart update');
      return null;
    }

    try {
      console.log(`🛒 Updating cart in Turso for customer: ${customerId}`, {
        itemsCount: items.length,
        items: items.map(item => ({ sku: item.sku, title: item.title, quantity: item.quantity }))
      });
      
      const existingCart = await this.getCart(customerId);
      const cartId = existingCart.cart_id || `cart_${customerId}_${Date.now()}`;
      const now = new Date().toISOString();

      const itemsJson = JSON.stringify(items);
      console.log(`🛒 Cart update payload:`, {
        cartId,
        customerId,
        itemsJsonLength: itemsJson.length,
        itemsCount: items.length
      });

      await this.client.execute({
        sql: `
          INSERT INTO carts (cart_id, customer_id, items, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(cart_id) DO UPDATE SET
            items = excluded.items,
            updated_at = excluded.updated_at,
            abandoned_at = NULL
        `,
        args: [
          cartId,
          customerId,
          itemsJson,
          existingCart.created_at || now,
          now
        ]
      });

      console.log(`✅ Cart updated in Turso: ${cartId}`);

      // Verify the update by fetching the cart back
      const verifyCart = await this.getCart(customerId);
      console.log(`🔍 Cart verification after update:`, {
        cartId: verifyCart?.cart_id,
        itemsCount: verifyCart?.items?.length || 0,
        matches: verifyCart?.items?.length === items.length
      });

      // Generate and store embedding for semantic search
      await this.generateAndStoreCartEmbedding(cartId, customerId, items, now);

      return { cart_id: cartId, items, updated_at: now };
    } catch (error) {
      console.error('❌ Error updating cart in Turso:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        customerId: customerId,
        itemsCount: items.length
      });
      return null;
    }
  }

  /**
   * Convert cart items to searchable text
   */
  cartToSearchText(items) {
    if (!items || items.length === 0) {
      return 'Empty cart';
    }
    
    const itemDescriptions = items.map(item => {
      const quantity = item.quantity || 1;
      const title = item.title || item.name || '';
      const brand = item.brand || '';
      return `${quantity}x ${brand} ${title}`.trim();
    });
    
    return `Cart with ${items.length} items: ${itemDescriptions.join(', ')}`;
  }

  /**
   * Generate and store embedding for cart
   * Only regenerates if search text changed (cost optimization)
   */
  async generateAndStoreCartEmbedding(cartId, customerId, items, timestamp) {
    if (!this.isAvailable()) return;

    try {
      const newSearchText = this.cartToSearchText(items);
      
      // Check if embedding exists and search text hasn't changed
      const existing = await this.client.execute({
        sql: 'SELECT search_text FROM cart_embeddings WHERE cart_id = ?',
        args: [cartId]
      });
      
      if (existing.rows.length > 0 && existing.rows[0][0] === newSearchText) {
        // Search text unchanged, skip regeneration (save API calls)
        if (process.env.DEBUG_EMBEDDINGS === 'true') {
          console.log(`✅ Cart embedding unchanged for ${cartId}, skipping regeneration`);
        }
        // Update timestamp only
        await this.client.execute({
          sql: 'UPDATE cart_embeddings SET updated_at = ? WHERE cart_id = ?',
          args: [timestamp, cartId]
        });
        return;
      }
      
      // Generate embedding only if search text changed
      const embedding = await llmProvider.generateEmbedding(newSearchText);
      
      // Validate embedding
      if (!Array.isArray(embedding) || embedding.length === 0) {
        console.warn(`⚠️ Invalid cart embedding for ${cartId}, skipping storage`);
        return;
      }

      await this.client.execute({
        sql: `
          INSERT OR REPLACE INTO cart_embeddings 
          (cart_id, customer_id, embedding, search_text, created_at, updated_at)
          VALUES (?, ?, ?, ?, COALESCE((SELECT created_at FROM cart_embeddings WHERE cart_id = ?), ?), ?)
        `,
        args: [
          cartId,
          customerId,
          JSON.stringify(embedding),
          newSearchText,
          cartId, // For COALESCE
          timestamp, // Fallback if new
          timestamp
        ]
      });
    } catch (error) {
      console.warn('⚠️ Failed to generate cart embedding (non-critical):', error.message);
      // Don't throw - embeddings are optional
    }
  }

  async clearCart(customerId) {
    if (!this.isAvailable()) {
      return;
    }

    try {
      await this.client.execute({
        sql: `
          UPDATE carts SET items = ?, updated_at = ?, abandoned_at = ?
          WHERE customer_id = ?
        `,
        args: ['[]', new Date().toISOString(), new Date().toISOString(), customerId]
      });
    } catch (error) {
      console.error('Error clearing cart in Turso:', error);
    }
  }

  async markCartAbandoned(customerId) {
    if (!this.isAvailable()) {
      return;
    }

    try {
      await this.client.execute({
        sql: `
          UPDATE carts SET abandoned_at = ? WHERE customer_id = ? AND abandoned_at IS NULL
        `,
        args: [new Date().toISOString(), customerId]
      });
    } catch (error) {
      console.error('Error marking cart as abandoned in Turso:', error);
    }
  }

  // Order Management
  async createOrder(orderData) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const orderId = orderData.order_id || `order_${orderData.customer_id}_${Date.now()}`;
      const now = new Date().toISOString();

      await this.client.execute({
        sql: `
          INSERT INTO orders (
            order_id, customer_id, cart_id, items, subtotal, shipping_cost, tax, discount, total, currency,
            status, shipping_address, billing_address, payment_method, payment_status, payment_transaction_id,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          orderId,
          orderData.customer_id,
          orderData.cart_id || null,
          JSON.stringify(orderData.items || []),
          orderData.subtotal || 0,
          orderData.shipping_cost || 0,
          orderData.tax || 0,
          orderData.discount || 0,
          orderData.total || 0,
          orderData.currency || 'AED',
          orderData.status || 'pending',
          JSON.stringify(orderData.shipping_address || {}),
          JSON.stringify(orderData.billing_address || {}),
          orderData.payment_method || null,
          orderData.payment_status || 'pending',
          orderData.payment_transaction_id || null,
          now,
          now
        ]
      });

      // Generate and store embedding for semantic search
      await this.generateAndStoreOrderEmbedding(orderId, orderData.customer_id, orderData, now);

      return orderId;
    } catch (error) {
      console.error('Error creating order in Turso:', error);
      return null;
    }
  }

  /**
   * Convert order data to searchable text
   */
  orderToSearchText(orderData) {
    const items = orderData.items || [];
    const status = orderData.status || 'pending';
    const total = orderData.total || 0;
    const currency = orderData.currency || 'AED';
    
    const itemDescriptions = items.map(item => {
      const quantity = item.quantity || 1;
      const title = item.title || item.name || '';
      const brand = item.brand || '';
      return `${quantity}x ${brand} ${title}`.trim();
    }).join(', ');
    
    const date = orderData.created_at ? new Date(orderData.created_at).toLocaleDateString() : '';
    
    return `Order ${status}: ${items.length} items (${itemDescriptions}) - Total ${total} ${currency} on ${date}`;
  }

  /**
   * Generate and store embedding for order
   * Only regenerates if search text changed (cost optimization)
   * Note: Orders typically created once, so this is mostly for updates
   */
  async generateAndStoreOrderEmbedding(orderId, customerId, orderData, timestamp) {
    if (!this.isAvailable()) return;

    try {
      const newSearchText = this.orderToSearchText(orderData);
      
      // Check if embedding exists and search text hasn't changed
      const existing = await this.client.execute({
        sql: 'SELECT search_text FROM order_embeddings WHERE order_id = ?',
        args: [orderId]
      });
      
      if (existing.rows.length > 0 && existing.rows[0][0] === newSearchText) {
        // Search text unchanged, skip regeneration (save API calls)
        if (process.env.DEBUG_EMBEDDINGS === 'true') {
          console.log(`✅ Order embedding unchanged for ${orderId}, skipping regeneration`);
        }
        // Update timestamp only
        await this.client.execute({
          sql: 'UPDATE order_embeddings SET updated_at = ? WHERE order_id = ?',
          args: [timestamp, orderId]
        });
        return;
      }
      
      // Generate embedding only if search text changed
      const embedding = await llmProvider.generateEmbedding(newSearchText);
      
      // Validate embedding
      if (!Array.isArray(embedding) || embedding.length === 0) {
        console.warn(`⚠️ Invalid order embedding for ${orderId}, skipping storage`);
        return;
      }

      await this.client.execute({
        sql: `
          INSERT OR REPLACE INTO order_embeddings 
          (order_id, customer_id, embedding, search_text, created_at, updated_at)
          VALUES (?, ?, ?, ?, COALESCE((SELECT created_at FROM order_embeddings WHERE order_id = ?), ?), ?)
        `,
        args: [
          orderId,
          customerId,
          JSON.stringify(embedding),
          newSearchText,
          orderId, // For COALESCE
          timestamp, // Fallback if new
          timestamp
        ]
      });
    } catch (error) {
      console.warn('⚠️ Failed to generate order embedding (non-critical):', error.message);
      // Don't throw - embeddings are optional
    }
  }

  async getOrder(orderId) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const result = await this.client.execute({
        sql: `SELECT * FROM orders WHERE order_id = ?`,
        args: [orderId]
      });

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        order_id: row.order_id,
        customer_id: row.customer_id,
        cart_id: row.cart_id,
        items: JSON.parse(row.items || '[]'),
        subtotal: row.subtotal,
        shipping_cost: row.shipping_cost,
        tax: row.tax,
        discount: row.discount,
        total: row.total,
        currency: row.currency,
        status: row.status,
        shipping_address: JSON.parse(row.shipping_address || '{}'),
        billing_address: JSON.parse(row.billing_address || '{}'),
        payment_method: row.payment_method,
        payment_status: row.payment_status,
        payment_transaction_id: row.payment_transaction_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        shipped_at: row.shipped_at,
        delivered_at: row.delivered_at
      };
    } catch (error) {
      console.error('Error getting order from Turso:', error);
      return null;
    }
  }

  async getOrderHistory(customerId, limit = 10) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const result = await this.client.execute({
        sql: `
          SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ?
        `,
        args: [customerId, limit]
      });

      return result.rows.map(row => ({
        order_id: row.order_id,
        items: JSON.parse(row.items || '[]'),
        total: row.total,
        currency: row.currency,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error('Error getting order history from Turso:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId, status, additionalData = {}) {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const updates = ['status = ?', 'updated_at = ?'];
      const values = [status, new Date().toISOString()];

      if (status === 'shipped' && !additionalData.shipped_at) {
        updates.push('shipped_at = ?');
        values.push(new Date().toISOString());
      }
      if (status === 'delivered' && !additionalData.delivered_at) {
        updates.push('delivered_at = ?');
        values.push(new Date().toISOString());
      }
      if (additionalData.payment_status) {
        updates.push('payment_status = ?');
        values.push(additionalData.payment_status);
      }
      if (additionalData.payment_transaction_id) {
        updates.push('payment_transaction_id = ?');
        values.push(additionalData.payment_transaction_id);
      }

      values.push(orderId);
      await this.client.execute({
        sql: `UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?`,
        args: values
      });
    } catch (error) {
      console.error('Error updating order status in Turso:', error);
    }
  }

  // Returns and Refunds
  async createReturn(returnData) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const returnId = returnData.return_id || `return_${returnData.order_id}_${Date.now()}`;
      const now = new Date().toISOString();

      await this.client.execute({
        sql: `
          INSERT INTO returns (
            return_id, order_id, customer_id, items, reason, status, refund_amount, refund_status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          returnId,
          returnData.order_id,
          returnData.customer_id,
          JSON.stringify(returnData.items || []),
          returnData.reason || '',
          returnData.status || 'pending',
          returnData.refund_amount || 0,
          returnData.refund_status || 'pending',
          now
        ]
      });

      // Generate and store embedding for semantic search
      await this.generateAndStoreReturnEmbedding(returnId, returnData.customer_id, returnData, now);

      return returnId;
    } catch (error) {
      console.error('Error creating return in Turso:', error);
      return null;
    }
  }

  /**
   * Convert return data to searchable text
   */
  returnToSearchText(returnData) {
    const items = returnData.items || [];
    const reason = returnData.reason || '';
    const status = returnData.status || 'pending';
    const refundAmount = returnData.refund_amount || 0;
    
    const itemDescriptions = items.map(item => {
      const quantity = item.quantity || 1;
      const title = item.title || item.name || '';
      return `${quantity}x ${title}`.trim();
    }).join(', ');
    
    return `Return ${status}: ${items.length} items (${itemDescriptions}) - Reason: ${reason} - Refund: ${refundAmount} AED`;
  }

  /**
   * Generate and store embedding for return
   * Only regenerates if search text changed (cost optimization)
   */
  async generateAndStoreReturnEmbedding(returnId, customerId, returnData, timestamp) {
    if (!this.isAvailable()) return;

    try {
      const newSearchText = this.returnToSearchText(returnData);
      
      // Check if embedding exists and search text hasn't changed
      const existing = await this.client.execute({
        sql: 'SELECT search_text FROM return_embeddings WHERE return_id = ?',
        args: [returnId]
      });
      
      if (existing.rows.length > 0 && existing.rows[0][0] === newSearchText) {
        // Search text unchanged, skip regeneration (save API calls)
        if (process.env.DEBUG_EMBEDDINGS === 'true') {
          console.log(`✅ Return embedding unchanged for ${returnId}, skipping regeneration`);
        }
        return; // Returns don't typically update, so no timestamp update needed
      }
      
      // Generate embedding only if search text changed
      const embedding = await llmProvider.generateEmbedding(newSearchText);
      
      // Validate embedding
      if (!Array.isArray(embedding) || embedding.length === 0) {
        console.warn(`⚠️ Invalid return embedding for ${returnId}, skipping storage`);
        return;
      }

      await this.client.execute({
        sql: `
          INSERT OR REPLACE INTO return_embeddings 
          (return_id, order_id, customer_id, embedding, search_text, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          returnId,
          returnData.order_id,
          customerId,
          JSON.stringify(embedding),
          newSearchText,
          timestamp
        ]
      });
    } catch (error) {
      console.warn('⚠️ Failed to generate return embedding (non-critical):', error.message);
      // Don't throw - embeddings are optional
    }
  }

  async updateReturnStatus(returnId, status, refundStatus = null) {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const updates = ['status = ?'];
      const values = [status];

      if (refundStatus) {
        updates.push('refund_status = ?');
        values.push(refundStatus);
        if (refundStatus === 'completed') {
          updates.push('processed_at = ?');
          values.push(new Date().toISOString());
        }
      }

      values.push(returnId);
      await this.client.execute({
        sql: `UPDATE returns SET ${updates.join(', ')} WHERE return_id = ?`,
        args: values
      });
    } catch (error) {
      console.error('Error updating return status in Turso:', error);
    }
  }

  // Semantic Search Methods

  /**
   * Semantic search on order history using embeddings
   * @param {string} customerId - Customer ID
   * @param {string} query - Natural language query
   * @param {number} limit - Maximum number of results
   * @returns {Array} Array of matching orders with similarity scores
   */
  async searchOrderHistory(customerId, query, limit = 10) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      // Generate embedding for query
      const queryEmbedding = await llmProvider.generateEmbedding(query);

      // Get all order embeddings for this customer
      const result = await this.client.execute({
        sql: `
          SELECT oe.order_id, oe.embedding, oe.search_text, o.items, o.total, o.currency, o.status, o.created_at
          FROM order_embeddings oe
          JOIN orders o ON oe.order_id = o.order_id
          WHERE oe.customer_id = ?
        `,
        args: [customerId]
      });

      if (result.rows.length === 0) {
        return [];
      }

      // Calculate cosine similarity for each order
      const similarities = [];
      for (const row of result.rows) {
        const orderEmbedding = JSON.parse(row[1]);
        const similarity = this.cosineSimilarity(queryEmbedding, orderEmbedding);
        
        similarities.push({
          order_id: row[0],
          similarity: similarity,
          search_text: row[2],
          items: JSON.parse(row[3] || '[]'),
          total: row[4],
          currency: row[5],
          status: row[6],
          created_at: row[7]
        });
      }

      // Sort by similarity and return top results
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      return similarities.slice(0, limit).filter(item => item.similarity > 0.3); // Threshold for relevance
    } catch (error) {
      console.error('Error searching order history:', error);
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Convert search results to natural language using LLM
   * This is called only when displaying results to user
   */
  async formatOrderHistoryAsText(searchResults, query) {
    if (!searchResults || searchResults.length === 0) {
      return 'No matching orders found.';
    }

    try {
      // Format results for LLM
      const resultsText = searchResults.map((result, index) => {
        const items = result.items.map(item => 
          `${item.quantity}x ${item.title || item.name}`
        ).join(', ');
        return `${index + 1}. Order ${result.order_id}: ${items} - ${result.total} ${result.currency} - Status: ${result.status} - ${new Date(result.created_at).toLocaleDateString()}`;
      }).join('\n');

      // Use LLM to generate natural language response
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: 'You are a helpful assistant that formats order history in a natural, conversational way.'
        },
        {
          role: 'user',
          content: `User asked: "${query}"\n\nHere are the matching orders:\n${resultsText}\n\nFormat this as a natural, friendly response to the user's query.`
        }
      ], {
        model: 'versatile',
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error formatting order history:', error);
      // Fallback to simple format
      return searchResults.map((r, i) => 
        `${i + 1}. Order ${r.order_id}: ${r.items.length} items, ${r.total} ${r.currency} - ${r.status}`
      ).join('\n');
    }
  }
}

export const tursoOrderService = new TursoOrderService();
export default tursoOrderService;


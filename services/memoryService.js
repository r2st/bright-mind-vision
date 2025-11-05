import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { tursoOrderService } from './tursoOrderService.js';

/**
 * Memory Service for AI Shopping Assistant
 * Provides short-term and long-term memory capabilities
 * Uses Turso for orders/carts (serverless-compatible) when available
 * Falls back to local SQLite for development
 */
class MemoryService {
  constructor() {
    this.db = null; // Initialize to null
    this.dbPath = path.join(process.cwd(), 'data', 'conversation_memory.db');
    this.tursoOrderService = tursoOrderService;
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new Database(this.dbPath);
      this.createTables();
      console.log('✅ Memory Service initialized');
    } catch (error) {
      console.error('❌ Memory Service initialization failed:', error);
    }
  }

  createTables() {
    // Conversation memory (short-term)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        conversation_id TEXT PRIMARY KEY,
        customer_id TEXT,
        created_at TEXT,
        updated_at TEXT,
        context TEXT
      )
    `);

    // Customer preferences (long-term)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customer_preferences (
        customer_id TEXT PRIMARY KEY,
        preferred_categories TEXT,
        preferred_brands TEXT,
        price_range TEXT,
        last_interaction TEXT,
        purchase_history TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    // Conversation messages (episodic memory)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT,
        role TEXT,
        content TEXT,
        timestamp TEXT,
        metadata TEXT,
        FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
      )
    `);

    // Shopping carts
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS carts (
        cart_id TEXT PRIMARY KEY,
        customer_id TEXT,
        items TEXT,
        created_at TEXT,
        updated_at TEXT,
        abandoned_at TEXT,
        FOREIGN KEY (customer_id) REFERENCES customer_preferences(customer_id)
      )
    `);

    // Orders
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        customer_id TEXT,
        cart_id TEXT,
        items TEXT,
        subtotal REAL,
        shipping_cost REAL,
        tax REAL,
        discount REAL,
        total REAL,
        currency TEXT,
        status TEXT,
        shipping_address TEXT,
        billing_address TEXT,
        payment_method TEXT,
        payment_status TEXT,
        payment_transaction_id TEXT,
        created_at TEXT,
        updated_at TEXT,
        shipped_at TEXT,
        delivered_at TEXT,
        FOREIGN KEY (customer_id) REFERENCES customer_preferences(customer_id),
        FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
      )
    `);

    // Returns and refunds
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS returns (
        return_id TEXT PRIMARY KEY,
        order_id TEXT,
        customer_id TEXT,
        items TEXT,
        reason TEXT,
        status TEXT,
        refund_amount REAL,
        refund_status TEXT,
        created_at TEXT,
        processed_at TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (customer_id) REFERENCES customer_preferences(customer_id)
      )
    `);
  }

  // Get or create conversation context
  getConversationContext(conversationId, customerId = null) {
      // Safe fallback if database is not available
      if (!this.db) {
        console.warn('⚠️ Memory Service: Database not initialized, using in-memory context');
        return {
          lastCategory: null,
          conversationId,
          customerId,
          timestamp: new Date().toISOString(),
          messageCount: 0,
          previousInterests: [],
          conversationFlow: [],
          customerName: null,
          currentProduct: null,
          recentProducts: [],
          conversationState: 'browsing'
        };
      }

    try {
      const stmt = this.db.prepare(`
        SELECT context FROM conversations WHERE conversation_id = ?
      `);
      const result = stmt.get(conversationId);
      
      if (result) {
        return JSON.parse(result.context || '{}');
      }
      
      // Create new conversation
      const newContext = {
        lastCategory: null,
        conversationId,
        customerId,
        timestamp: new Date().toISOString(),
        messageCount: 0,
        previousInterests: [],
        conversationFlow: [],
        customerName: null,
        currentProduct: null,
        recentProducts: [],
        conversationState: 'browsing' // browsing, product_detail, comparing, recommending
      };
      
      const insertStmt = this.db.prepare(`
        INSERT INTO conversations (conversation_id, customer_id, created_at, updated_at, context)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        conversationId,
        customerId,
        new Date().toISOString(),
        new Date().toISOString(),
        JSON.stringify(newContext)
      );
      
      return newContext;
    } catch (error) {
      console.error('Error in getConversationContext:', error);
      // Return safe fallback
      return {
        lastCategory: null,
        conversationId,
        customerId,
        timestamp: new Date().toISOString(),
        messageCount: 0,
        previousInterests: [],
        conversationFlow: [],
        customerName: null,
        currentProduct: null,
        recentProducts: [],
        conversationState: 'browsing'
      };
    }
  }

  // Update conversation context
  updateConversationContext(conversationId, context) {
    if (!this.db) {
      console.warn('⚠️ Memory Service: Database not initialized, skipping context update');
      return;
    }

    try {
      const updateStmt = this.db.prepare(`
        UPDATE conversations 
        SET context = ?, updated_at = ?
        WHERE conversation_id = ?
      `);
      updateStmt.run(
        JSON.stringify(context),
        new Date().toISOString(),
        conversationId
      );
    } catch (error) {
      console.error('Error updating conversation context:', error);
    }
  }

  // Store message
  storeMessage(conversationId, role, content, metadata = {}) {
    if (!this.db) {
      console.warn('⚠️ Memory Service: Database not initialized, skipping message storage');
      return;
    }

    try {
      const stmt = this.db.prepare(`
        INSERT INTO messages (conversation_id, role, content, timestamp, metadata)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        conversationId,
        role,
        content,
        new Date().toISOString(),
        JSON.stringify(metadata)
      );
    } catch (error) {
      console.error('Error storing message:', error);
    }
  }

  // Get conversation history
  getConversationHistory(conversationId, limit = 10) {
    if (!this.db) {
      console.warn('⚠️ Memory Service: Database not initialized, returning empty history');
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT role, content, timestamp, metadata
        FROM messages
        WHERE conversation_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `);
      return stmt.all(conversationId, limit).reverse();
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  // Get customer preferences
  getCustomerPreferences(customerId) {
    if (!this.db) {
      console.warn('⚠️ Memory Service: Database not initialized, returning default preferences');
      return {
        preferred_categories: [],
        preferred_brands: [],
        price_range: null,
        purchase_history: []
      };
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM customer_preferences WHERE customer_id = ?
      `);
      const result = stmt.get(customerId);
      
      if (!result) {
        return {
          preferred_categories: [],
          preferred_brands: [],
          price_range: null,
          purchase_history: []
        };
      }
      
      return {
        preferred_categories: JSON.parse(result.preferred_categories || '[]'),
        preferred_brands: JSON.parse(result.preferred_brands || '[]'),
        price_range: result.price_range ? JSON.parse(result.price_range) : null,
        purchase_history: JSON.parse(result.purchase_history || '[]')
      };
    } catch (error) {
      console.error('Error getting customer preferences:', error);
      return {
        preferred_categories: [],
        preferred_brands: [],
        price_range: null,
        purchase_history: []
      };
    }
  }

  // Update customer preferences
  updateCustomerPreferences(customerId, preferences) {
    if (!this.db) {
      console.warn('⚠️ Memory Service: Database not initialized, skipping preferences update');
      return;
    }

    try {
      const stmt = this.db.prepare(`
        INSERT INTO customer_preferences 
          (customer_id, preferred_categories, preferred_brands, price_range, last_interaction, purchase_history, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(customer_id) DO UPDATE SET
          preferred_categories = excluded.preferred_categories,
          preferred_brands = excluded.preferred_brands,
          price_range = excluded.price_range,
          last_interaction = excluded.last_interaction,
          purchase_history = excluded.purchase_history,
          updated_at = excluded.updated_at
      `);
      
      stmt.run(
        customerId,
        JSON.stringify(preferences.preferred_categories || []),
        JSON.stringify(preferences.preferred_brands || []),
        preferences.price_range ? JSON.stringify(preferences.price_range) : null,
        new Date().toISOString(),
        JSON.stringify(preferences.purchase_history || []),
        new Date().toISOString(),
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Error updating customer preferences:', error);
    }
  }

  // Add to purchase history
  addPurchaseHistory(customerId, product) {
    const preferences = this.getCustomerPreferences(customerId);
    preferences.purchase_history.push({
      product,
      timestamp: new Date().toISOString()
    });
    this.updateCustomerPreferences(customerId, preferences);
  }

  // Cart Management
  async getCart(customerId) {
    // Try Turso first (serverless-compatible)
    if (this.tursoOrderService.isAvailable()) {
      const tursoCart = await this.tursoOrderService.getCart(customerId);
      if (tursoCart !== null) {
        return tursoCart;
      }
    }

    // Fallback to local SQLite
    if (!this.db) {
      return { items: [], total: 0, currency: 'AED' };
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM carts WHERE customer_id = ? ORDER BY updated_at DESC LIMIT 1
      `);
      const result = stmt.get(customerId);
      
      if (!result) {
        return { items: [], total: 0, currency: 'AED' };
      }

      const items = JSON.parse(result.items || '[]');
      const total = items.reduce((sum, item) => {
        const price = typeof item.price === 'object' ? item.price.amount : item.price;
        return sum + (price * item.quantity);
      }, 0);

      return {
        cart_id: result.cart_id,
        items: items,
        total: total,
        currency: 'AED',
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Error getting cart:', error);
      return { items: [], total: 0, currency: 'AED' };
    }
  }

  async updateCart(customerId, items) {
    // Try Turso first (serverless-compatible)
    if (this.tursoOrderService.isAvailable()) {
      const tursoResult = await this.tursoOrderService.updateCart(customerId, items);
      if (tursoResult !== null) {
        return tursoResult;
      }
    }

    // Fallback to local SQLite
    if (!this.db) {
      console.warn('⚠️ Memory Service: Database not initialized, skipping cart update');
      return;
    }

    try {
      // Get existing cart or create new
      const existingCart = await this.getCart(customerId);
      const cartId = existingCart.cart_id || `cart_${customerId}_${Date.now()}`;

      const stmt = this.db.prepare(`
        INSERT INTO carts (cart_id, customer_id, items, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(cart_id) DO UPDATE SET
          items = excluded.items,
          updated_at = excluded.updated_at,
          abandoned_at = NULL
      `);

      const now = new Date().toISOString();
      stmt.run(
        cartId,
        customerId,
        JSON.stringify(items),
        existingCart.created_at || now,
        now
      );

      return { cart_id: cartId, items, updated_at: now };
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  async clearCart(customerId) {
    // Try Turso first
    if (this.tursoOrderService.isAvailable()) {
      await this.tursoOrderService.clearCart(customerId);
      return;
    }

    // Fallback to local SQLite
    if (!this.db) {
      return;
    }

    try {
      const stmt = this.db.prepare(`
        UPDATE carts SET items = ?, updated_at = ?, abandoned_at = ?
        WHERE customer_id = ?
      `);
      stmt.run('[]', new Date().toISOString(), new Date().toISOString(), customerId);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  async markCartAbandoned(customerId) {
    // Try Turso first
    if (this.tursoOrderService.isAvailable()) {
      await this.tursoOrderService.markCartAbandoned(customerId);
      return;
    }

    // Fallback to local SQLite
    if (!this.db) {
      return;
    }

    try {
      const stmt = this.db.prepare(`
        UPDATE carts SET abandoned_at = ? WHERE customer_id = ? AND abandoned_at IS NULL
      `);
      stmt.run(new Date().toISOString(), customerId);
    } catch (error) {
      console.error('Error marking cart as abandoned:', error);
    }
  }

  // Order Management
  async createOrder(orderData) {
    // Try Turso first (serverless-compatible)
    if (this.tursoOrderService.isAvailable()) {
      const tursoOrderId = await this.tursoOrderService.createOrder(orderData);
      if (tursoOrderId !== null) {
        return tursoOrderId;
      }
    }

    // Fallback to local SQLite
    if (!this.db) {
      console.warn('⚠️ Memory Service: Database not initialized, skipping order creation');
      return null;
    }

    try {
      const orderId = orderData.order_id || `order_${orderData.customer_id}_${Date.now()}`;
      const stmt = this.db.prepare(`
        INSERT INTO orders (
          order_id, customer_id, cart_id, items, subtotal, shipping_cost, tax, discount, total, currency,
          status, shipping_address, billing_address, payment_method, payment_status, payment_transaction_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      stmt.run(
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
      );

      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  async getOrder(orderId) {
    // Try Turso first
    if (this.tursoOrderService.isAvailable()) {
      const tursoOrder = await this.tursoOrderService.getOrder(orderId);
      if (tursoOrder !== null) {
        return tursoOrder;
      }
    }

    // Fallback to local SQLite
    if (!this.db) {
      return null;
    }

    try {
      const stmt = this.db.prepare(`SELECT * FROM orders WHERE order_id = ?`);
      const result = stmt.get(orderId);
      
      if (!result) {
        return null;
      }

      return {
        order_id: result.order_id,
        customer_id: result.customer_id,
        cart_id: result.cart_id,
        items: JSON.parse(result.items || '[]'),
        subtotal: result.subtotal,
        shipping_cost: result.shipping_cost,
        tax: result.tax,
        discount: result.discount,
        total: result.total,
        currency: result.currency,
        status: result.status,
        shipping_address: JSON.parse(result.shipping_address || '{}'),
        billing_address: JSON.parse(result.billing_address || '{}'),
        payment_method: result.payment_method,
        payment_status: result.payment_status,
        payment_transaction_id: result.payment_transaction_id,
        created_at: result.created_at,
        updated_at: result.updated_at,
        shipped_at: result.shipped_at,
        delivered_at: result.delivered_at
      };
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }

  async getOrderHistory(customerId, limit = 10) {
    // Try Turso first
    if (this.tursoOrderService.isAvailable()) {
      const tursoHistory = await this.tursoOrderService.getOrderHistory(customerId, limit);
      if (tursoHistory !== null && tursoHistory !== undefined) {
        return tursoHistory;
      }
    }

    // Fallback to local SQLite
    if (!this.db) {
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ?
      `);
      const results = stmt.all(customerId, limit);
      
      return results.map(result => ({
        order_id: result.order_id,
        items: JSON.parse(result.items || '[]'),
        total: result.total,
        currency: result.currency,
        status: result.status,
        created_at: result.created_at,
        updated_at: result.updated_at
      }));
    } catch (error) {
      console.error('Error getting order history:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId, status, additionalData = {}) {
    // Try Turso first
    if (this.tursoOrderService.isAvailable()) {
      await this.tursoOrderService.updateOrderStatus(orderId, status, additionalData);
      return;
    }

    // Fallback to local SQLite
    if (!this.db) {
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
      const stmt = this.db.prepare(`
        UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?
      `);
      stmt.run(...values);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }

  // Returns and Refunds
  async createReturn(returnData) {
    // Try Turso first
    if (this.tursoOrderService.isAvailable()) {
      const tursoReturnId = await this.tursoOrderService.createReturn(returnData);
      if (tursoReturnId !== null) {
        return tursoReturnId;
      }
    }

    // Fallback to local SQLite
    if (!this.db) {
      return null;
    }

    try {
      const returnId = returnData.return_id || `return_${returnData.order_id}_${Date.now()}`;
      const stmt = this.db.prepare(`
        INSERT INTO returns (
          return_id, order_id, customer_id, items, reason, status, refund_amount, refund_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      stmt.run(
        returnId,
        returnData.order_id,
        returnData.customer_id,
        JSON.stringify(returnData.items || []),
        returnData.reason || '',
        returnData.status || 'pending',
        returnData.refund_amount || 0,
        returnData.refund_status || 'pending',
        now
      );

      return returnId;
    } catch (error) {
      console.error('Error creating return:', error);
      return null;
    }
  }

  async updateReturnStatus(returnId, status, refundStatus = null) {
    // Try Turso first
    if (this.tursoOrderService.isAvailable()) {
      await this.tursoOrderService.updateReturnStatus(returnId, status, refundStatus);
      return;
    }

    // Fallback to local SQLite
    if (!this.db) {
      return;
    }

    try {
      const updates = ['status = ?', 'updated_at = ?'];
      const values = [status, new Date().toISOString()];

      if (refundStatus) {
        updates.push('refund_status = ?');
        values.push(refundStatus);
        if (refundStatus === 'completed') {
          updates.push('processed_at = ?');
          values.push(new Date().toISOString());
        }
      }

      values.push(returnId);
      const stmt = this.db.prepare(`
        UPDATE returns SET ${updates.join(', ')} WHERE return_id = ?
      `);
      stmt.run(...values);
    } catch (error) {
      console.error('Error updating return status:', error);
    }
  }
}

export const memoryService = new MemoryService();
export default memoryService;

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * Memory Service for AI Shopping Assistant
 * Provides short-term and long-term memory capabilities
 */
class MemoryService {
  constructor() {
    this.db = null; // Initialize to null
    this.dbPath = path.join(process.cwd(), 'data', 'conversation_memory.db');
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
        messageCount: 0
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
        messageCount: 0
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
        messageCount: 0
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
}

export const memoryService = new MemoryService();
export default memoryService;

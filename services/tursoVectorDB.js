import { createClient } from '@libsql/client';

/**
 * Turso Vector Database Service
 * SQLite-compatible database over HTTP - perfect for serverless environments
 * 
 * Turso is libSQL (SQLite fork) hosted in the cloud with HTTP API access
 */
class TursoVectorDB {
  constructor() {
    this.client = null;
    this.dbPath = null;
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      // Check if Turso credentials are available
      const databaseUrl = process.env.TURSO_DATABASE_URL;
      const authToken = process.env.TURSO_AUTH_TOKEN;

      if (!databaseUrl || !authToken) {
        console.warn('⚠️ Turso: Credentials not found. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
        return;
      }

      this.client = createClient({
        url: databaseUrl,
        authToken: authToken,
      });

      console.log('✅ Turso Vector Database client initialized');
      this.initialized = true;
    } catch (error) {
      console.error('❌ Turso Vector Database initialization failed:', error);
      this.client = null;
    }
  }

  // Check if Turso is available
  isAvailable() {
    return this.client !== null && this.initialized;
  }

  // Create tables (same schema as SQLite version)
  async createTables() {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, cannot create tables');
      return;
    }

    try {
      // Products table
      await this.client.execute(`
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
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS embeddings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          embedding_type TEXT NOT NULL,
          embedding TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )
      `);

      // Indexes for performance
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_embeddings_product_id ON embeddings(product_id)
      `);
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_embeddings_type ON embeddings(embedding_type)
      `);

      console.log('✅ Turso tables created successfully');
    } catch (error) {
      console.error('❌ Error creating Turso tables:', error);
      throw error;
    }
  }

  // Insert or update product
  async upsertProduct(product) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, skipping product upsert');
      return null;
    }

    try {
      const result = await this.client.execute({
        sql: `
          INSERT OR REPLACE INTO products 
          (sku, title, brand, category, subcategory, price, currency, description, tags, rating, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [
          product.sku,
          product.title,
          product.brand,
          typeof product.category === 'string' ? product.category : JSON.stringify(product.category || []),
          product.subcategory || null,
          typeof product.price === 'object' ? product.price.amount : product.price,
          typeof product.price === 'object' ? product.price.currency : (product.currency || 'AED'),
          product.description || '',
          typeof product.tags === 'string' ? product.tags : JSON.stringify(product.tags || []),
          product.rating || 0
        ]
      });

      // Get the last inserted ID
      if (result.lastInsertRowid) {
        return Number(result.lastInsertRowid);
      }
      
      // If replace, get existing ID
      const existing = await this.client.execute({
        sql: 'SELECT id FROM products WHERE sku = ?',
        args: [product.sku]
      });
      
      return existing.rows.length > 0 ? Number(existing.rows[0].id) : null;
    } catch (error) {
      console.error('Error upserting product in Turso:', error);
      return null;
    }
  }

  // Store embedding for a product
  async storeEmbedding(productId, embeddingType, embedding) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, skipping embedding storage');
      return false;
    }

    try {
      await this.client.execute({
        sql: `
          INSERT OR REPLACE INTO embeddings 
          (product_id, embedding_type, embedding)
          VALUES (?, ?, ?)
        `,
        args: [productId, embeddingType, JSON.stringify(embedding)]
      });
      return true;
    } catch (error) {
      console.error('Error storing embedding in Turso:', error);
      return false;
    }
  }

  // Get all products
  async getAllProducts() {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, returning empty array');
      return [];
    }

    try {
      const result = await this.client.execute({
        sql: 'SELECT * FROM products ORDER BY updated_at DESC'
      });
      
      // Debug: Check result structure
      if (result.rows && result.rows.length > 0 && (!result.columns || result.columns.length === 0)) {
        console.warn('⚠️ Turso: No columns metadata, attempting manual mapping');
        // Try to get column names from a schema query
        const schemaResult = await this.client.execute({
          sql: "PRAGMA table_info(products)"
        });
        // Fallback: use common column names
        const commonColumns = ['id', 'sku', 'title', 'brand', 'category', 'subcategory', 'price', 'currency', 'description', 'tags', 'rating', 'created_at', 'updated_at'];
        return this.rowsToObjects(result.rows, commonColumns);
      }
      
      return this.rowsToObjects(result.rows, result.columns);
    } catch (error) {
      console.error('Error getting all products from Turso:', error);
      return [];
    }
  }

  // Get product by SKU
  async getProductBySku(sku) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, returning null');
      return null;
    }

    try {
      const result = await this.client.execute({
        sql: 'SELECT * FROM products WHERE sku = ?',
        args: [sku]
      });
      const rows = this.rowsToObjects(result.rows, result.columns);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting product by SKU from Turso:', error);
      return null;
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, returning empty array');
      return [];
    }

    try {
      const result = await this.client.execute({
        sql: 'SELECT * FROM products WHERE category LIKE ? ORDER BY rating DESC',
        args: [`%${category}%`]
      });
      return this.rowsToObjects(result.rows, result.columns);
    } catch (error) {
      console.error('Error getting products by category from Turso:', error);
      return [];
    }
  }

  // Get embeddings for a product
  async getEmbeddings(productId) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, returning empty array');
      return [];
    }

    try {
      const result = await this.client.execute({
        sql: 'SELECT embedding_type, embedding FROM embeddings WHERE product_id = ?',
        args: [productId]
      });
      
      return this.rowsToObjects(result.rows, result.columns).map(row => ({
        type: row.embedding_type,
        embedding: JSON.parse(row.embedding)
      }));
    } catch (error) {
      console.error('Error getting embeddings from Turso:', error);
      return [];
    }
  }

  // Search products by text (simple LIKE search)
  async searchProducts(query) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, returning empty array');
      return [];
    }

    try {
      const searchTerm = `%${query}%`;
      const result = await this.client.execute({
        sql: `
          SELECT * FROM products 
          WHERE title LIKE ? OR description LIKE ? OR tags LIKE ?
          ORDER BY rating DESC
        `,
        args: [searchTerm, searchTerm, searchTerm]
      });
      return this.rowsToObjects(result.rows, result.columns);
    } catch (error) {
      console.error('Error searching products in Turso:', error);
      return [];
    }
  }

  // Get product count
  async getProductCount() {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, returning 0');
      return 0;
    }

    try {
      const result = await this.client.execute({
        sql: 'SELECT COUNT(*) as count FROM products'
      });
      
      // Handle count query - result.rows[0] is an array, first element is the count
      if (result.rows && result.rows.length > 0) {
        const count = result.rows[0][0]; // First row, first column
        return Number(count) || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting product count from Turso:', error);
      return 0;
    }
  }

  // Get embedding count
  async getEmbeddingCount() {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, returning 0');
      return 0;
    }

    try {
      const result = await this.client.execute({
        sql: 'SELECT COUNT(*) as count FROM embeddings'
      });
      
      // Handle count query - result.rows[0] is an array, first element is the count
      if (result.rows && result.rows.length > 0) {
        const count = result.rows[0][0]; // First row, first column
        return Number(count) || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting embedding count from Turso:', error);
      return 0;
    }
  }

  // Vector similarity search (when libSQL vector extension is enabled)
  async vectorSearch(queryEmbedding, limit = 5) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, returning empty array');
      return [];
    }

    try {
      // Note: This requires libSQL vector extension
      // For now, fallback to regular search
      // TODO: Implement when vector extension is available
      console.warn('⚠️ Vector search not yet implemented - requires libSQL vector extension');
      return [];
    } catch (error) {
      console.error('Error in vector search:', error);
      return [];
    }
  }

  // Clear all data
  async clearAll() {
    if (!this.isAvailable()) {
      console.warn('⚠️ Turso: Client not initialized, cannot clear');
      return;
    }

    try {
      await this.client.execute('DELETE FROM embeddings');
      await this.client.execute('DELETE FROM products');
      console.log('🗑️ All data cleared from Turso database');
    } catch (error) {
      console.error('Error clearing Turso database:', error);
    }
  }

  // Helper: Convert Turso rows to objects
  rowsToObjects(rows, columns) {
    if (!rows || rows.length === 0) return [];
    
    return rows.map(row => {
      const obj = {};
      if (columns && columns.length > 0) {
        columns.forEach((col, index) => {
          // Handle both column object with .name and string column names
          let colName;
          if (typeof col === 'string') {
            colName = col;
          } else if (col && typeof col === 'object') {
            colName = col.name || col.column || col;
          } else {
            colName = `col_${index}`;
          }
          
          // Safely get value
          const value = row[index];
          obj[colName] = value !== undefined ? value : null;
        });
      } else {
        // Fallback: use default column names for products table
        const defaultColumns = ['id', 'sku', 'title', 'brand', 'category', 'subcategory', 'price', 'currency', 'description', 'tags', 'rating', 'created_at', 'updated_at'];
        defaultColumns.forEach((colName, index) => {
          if (index < row.length) {
            obj[colName] = row[index] !== undefined ? row[index] : null;
          }
        });
      }
      
      // Safety: ensure required fields exist
      if (!obj.title && obj.sku) {
        console.warn(`⚠️ Product ${obj.sku} missing title field`);
      }
      
      return obj;
    });
  }

  // Close connection (not needed for HTTP client, but kept for compatibility)
  async close() {
    // HTTP client doesn't need explicit closing
    this.client = null;
    this.initialized = false;
  }
}

// Export singleton instance
export const tursoVectorDB = new TursoVectorDB();
export default tursoVectorDB;


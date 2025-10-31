/**
 * Pinecone Vector Database Service
 * Hybrid approach: Keep products in Turso, use Pinecone for vector search
 * 
 * Architecture:
 * - Products → Turso (fast, reliable storage)
 * - Embeddings → Pinecone (fast vector search)
 * - Query Flow: Search Pinecone → Get product IDs → Fetch from Turso
 */

class PineconeVectorDB {
  constructor() {
    this.client = null;
    this.indexName = process.env.PINECONE_INDEX_NAME || 'products';
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      const apiKey = process.env.PINECONE_API_KEY;
      const environment = process.env.PINECONE_ENVIRONMENT || 'us-east1-gcp';
      
      if (!apiKey) {
        console.warn('⚠️ Pinecone: API key not found. Set PINECONE_API_KEY to enable.');
        return;
      }

      // Dynamic import for Pinecone client
      const { Pinecone } = await import('@pinecone-database/pinecone');
      
      this.client = new Pinecone({
        apiKey: apiKey,
      });

      // Get or create index
      this.index = this.client.index(this.indexName);
      this.initialized = true;
      console.log(`✅ Pinecone Vector Database initialized (index: ${this.indexName})`);
    } catch (error) {
      console.error('❌ Pinecone initialization failed:', error);
      this.client = null;
    }
  }

  isAvailable() {
    return this.client !== null && this.initialized && this.index !== null;
  }

  /**
   * Upsert product embedding to Pinecone
   * @param {string} productId - Product ID
   * @param {Array} embedding - Vector embedding
   * @param {Object} metadata - Product metadata (title, brand, category, etc.)
   */
  async upsertEmbedding(productId, embedding, metadata = {}) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Pinecone: Client not initialized, skipping embedding upsert');
      return false;
    }

    try {
      await this.index.upsert([
        {
          id: `product_${productId}`,
          values: embedding,
          metadata: {
            productId: productId,
            ...metadata
          }
        }
      ]);
      return true;
    } catch (error) {
      console.error('Error upserting embedding to Pinecone:', error);
      return false;
    }
  }

  /**
   * Search for similar products using vector similarity
   * @param {Array} queryEmbedding - Query vector
   * @param {number} topK - Number of results to return
   * @param {Object} filter - Optional metadata filter
   * @returns {Array} Array of product IDs with similarity scores
   */
  async vectorSearch(queryEmbedding, topK = 5, filter = null) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Pinecone: Client not initialized, returning empty array');
      return [];
    }

    try {
      const queryRequest = {
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
      };

      if (filter) {
        queryRequest.filter = filter;
      }

      const queryResponse = await this.index.query(queryRequest);
      
      // Transform Pinecone results to our format
      return queryResponse.matches.map(match => ({
        productId: match.metadata?.productId || match.id.replace('product_', ''),
        similarity: match.score,
        metadata: match.metadata || {}
      }));
    } catch (error) {
      console.error('Error in Pinecone vector search:', error);
      return [];
    }
  }

  /**
   * Delete embedding for a product
   */
  async deleteEmbedding(productId) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.index.deleteOne(`product_${productId}`);
      return true;
    } catch (error) {
      console.error('Error deleting embedding from Pinecone:', error);
      return false;
    }
  }

  /**
   * Get index statistics
   */
  async getStats() {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const stats = await this.index.describeIndexStats();
      return stats;
    } catch (error) {
      console.error('Error getting Pinecone stats:', error);
      return null;
    }
  }
}

// Export singleton
export const pineconeVectorDB = new PineconeVectorDB();
export default pineconeVectorDB;


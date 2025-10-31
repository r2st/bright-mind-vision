// Script to reset and repopulate vector database
// Usage: node scripts/reset-vector-db.mjs

import { vectorDB } from '../services/sqliteVectorDB.js';
import { normalizedProductCatalog } from '../data/normalizedProductCatalog.js';
import { enhancedRAGService } from '../services/enhancedRAGService.js';

async function resetDatabase() {
  try {
    console.log('🗑️ Clearing vector database...');
    vectorDB.clearAll();
    
    console.log('📦 Repopulating database with all products...');
    await enhancedRAGService.populateDatabase();
    
    const finalCount = vectorDB.getProductCount();
    const embeddingCount = vectorDB.getEmbeddingCount();
    
    console.log(`✅ Database reset complete!`);
    console.log(`   Products: ${finalCount}`);
    console.log(`   Embeddings: ${embeddingCount}`);
    console.log(`   Expected products: ${normalizedProductCatalog.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();


#!/usr/bin/env node

/**
 * Populate Pinecone with Product Embeddings
 * Hybrid approach: Products in Turso, embeddings in Pinecone
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple .env loader
function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      // Skip comments and empty lines
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.startsWith('#')) return;
      
      const match = cleanLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        
        // Remove quotes if present
        value = value.replace(/^["']|["']$/g, '');
        
        // Remove inline comments (everything after #)
        const commentIndex = value.indexOf(' #');
        if (commentIndex > 0) {
          value = value.substring(0, commentIndex).trim();
        }
        
        if (!process.env[key] && value) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

const pineconeApiKey = process.env.PINECONE_API_KEY;
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!pineconeApiKey) {
  console.error('❌ Missing Pinecone credentials!');
  console.error('Set PINECONE_API_KEY in .env.local');
  process.exit(1);
}

if (!tursoUrl || !tursoToken) {
  console.error('❌ Missing Turso credentials!');
  console.error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
  process.exit(1);
}

async function populatePinecone() {
  console.log('🚀 Populating Pinecone with product embeddings...');
  
  try {
    // Import services
    const { createClient } = await import('@libsql/client');
    const { Pinecone } = await import('@pinecone-database/pinecone');
    const { llmProvider } = await import('../services/llmProvider.js');
    
    // Initialize Turso client
    const tursoClient = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    
    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: pineconeApiKey,
    });
    
    const indexName = process.env.PINECONE_INDEX_NAME || 'products';
    const index = pinecone.index(indexName);
    
    console.log(`📡 Connected to Pinecone index: ${indexName}`);
    
    // Get all products from Turso
    const productsResult = await tursoClient.execute(`
      SELECT id, sku, title, brand, category, description 
      FROM products 
      ORDER BY id
    `);
    
    const products = productsResult.rows.map(row => ({
      id: row[0],
      sku: row[1],
      title: row[2] || '',
      brand: row[3] || '',
      category: row[4] || '[]',
      description: row[5] || ''
    }));
    
    console.log(`📦 Found ${products.length} products to process\n`);
    
    let processedCount = 0;
    let errorCount = 0;
    const batchSize = 100; // Pinecone supports batch upserts
    
    // Process in batches
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const vectors = [];
      
      for (const product of batch) {
        try {
          // Get or generate combined embedding
          let embedding;
          
          // Check if embedding exists in Turso
          const existingEmbedding = await tursoClient.execute({
            sql: 'SELECT embedding FROM embeddings WHERE product_id = ? AND embedding_type = ?',
            args: [product.id, 'combined']
          });
          
          if (existingEmbedding.rows.length > 0) {
            // Use existing embedding
            embedding = JSON.parse(existingEmbedding.rows[0][0]);
          } else {
            // Generate new embedding
            let categoryText = '';
            try {
              const categoryArray = typeof product.category === 'string' 
                ? JSON.parse(product.category) 
                : (Array.isArray(product.category) ? product.category : []);
              categoryText = Array.isArray(categoryArray) ? categoryArray.join(' ') : '';
            } catch (e) {
              categoryText = '';
            }
            
            const combinedText = `${product.title} ${product.brand} ${categoryText} ${product.description || ''}`.trim();
            embedding = await llmProvider.generateEmbedding(combinedText);
            
            // Store in Turso for future use
            await tursoClient.execute({
              sql: 'INSERT OR REPLACE INTO embeddings (product_id, embedding_type, embedding) VALUES (?, ?, ?)',
              args: [product.id, 'combined', JSON.stringify(embedding)]
            });
          }
          
          if (embedding && Array.isArray(embedding) && embedding.length > 0) {
            vectors.push({
              id: `product_${product.id}`,
              values: embedding,
              metadata: {
                productId: product.id,
                sku: product.sku,
                title: product.title,
                brand: product.brand,
                category: product.category
              }
            });
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error processing ${product.sku}:`, error.message);
        }
      }
      
      // Upsert batch to Pinecone
      if (vectors.length > 0) {
        try {
          await index.upsert(vectors);
          processedCount += vectors.length;
          console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}: ${vectors.length} embeddings`);
        } catch (error) {
          console.error(`❌ Error upserting batch:`, error.message);
          errorCount += vectors.length;
        }
      }
      
      // Rate limiting
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n📊 Pinecone Population Summary:`);
    console.log(`   ✅ Processed: ${processedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    // Get index stats
    try {
      const stats = await index.describeIndexStats();
      console.log(`\n📊 Pinecone Index Stats:`);
      console.log(`   Total vectors: ${stats.totalRecordCount || 'N/A'}`);
    } catch (error) {
      console.warn('Could not fetch index stats');
    }
    
    console.log('\n✅ Pinecone population completed!');
    
  } catch (error) {
    console.error('❌ Error populating Pinecone:', error);
    process.exit(1);
  }
}

populatePinecone();


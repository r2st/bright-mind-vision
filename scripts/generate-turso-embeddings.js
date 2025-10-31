#!/usr/bin/env node

/**
 * Generate and Store Embeddings in Turso
 * Creates vector embeddings for products using the embedding service
 */

import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple .env loader (since we're using ES modules)
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

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl || !authToken) {
  console.error('❌ Missing Turso credentials!');
  process.exit(1);
}

// Generate embedding using LLM provider
async function generateEmbedding(text) {
  try {
    const { llmProvider } = await import('../services/llmProvider.js');
    
    // Use the LLM provider's embedding method
    const embedding = await llmProvider.generateEmbedding(text);
    
    if (Array.isArray(embedding) && embedding.length > 0) {
      return embedding;
    }
    
    throw new Error('Embedding generation returned empty or invalid result');
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    return null;
  }
}

async function generateEmbeddings() {
  console.log('🚀 Generating embeddings for products in Turso...');
  console.log(`📡 Connecting to: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  try {
    // Get all products with full details
    const productsResult = await client.execute(`
      SELECT id, sku, title, brand, category, description, tags 
      FROM products 
      ORDER BY id
    `);
    
    // Parse rows to objects (Turso returns rows as arrays)
    const products = productsResult.rows.map(row => {
      // Parse category if it's a JSON string
      let category = row[4] || '[]';
      try {
        if (typeof category === 'string') {
          category = JSON.parse(category);
        }
      } catch (e) {
        category = [];
      }
      
      return {
        id: row[0],
        sku: row[1],
        title: row[2] || '',
        brand: row[3] || '',
        category: category,
        description: row[5] || '',
        tags: row[6] || '[]'
      };
    });

    console.log(`📦 Found ${products.length} products to process\n`);

    let processedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Check if embeddings already exist
        const existingEmbeddings = await client.execute({
          sql: 'SELECT COUNT(*) as count FROM embeddings WHERE product_id = ?',
          args: [product.id]
        });
        
        const hasEmbeddings = existingEmbeddings.rows[0]?.[0] > 0;
        
        if (hasEmbeddings) {
          console.log(`⏭️  [${processedCount + 1}/${products.length}] Skipping ${product.sku} (embeddings exist)`);
          processedCount++;
          continue;
        }

        // Generate embeddings
        console.log(`🔄 [${processedCount + 1}/${products.length}] Generating embeddings for ${product.sku}: ${product.title.substring(0, 40)}...`);
        
        // Generate title embedding
        const titleEmbedding = await generateEmbedding(product.title);
        if (titleEmbedding) {
          await client.execute({
            sql: 'INSERT OR REPLACE INTO embeddings (product_id, embedding_type, embedding) VALUES (?, ?, ?)',
            args: [product.id, 'title', JSON.stringify(titleEmbedding)]
          });
          process.stdout.write('  ✓ Title embedding');
        }
        
        // Generate description embedding (if available)
        if (product.description && product.description.trim()) {
          const descEmbedding = await generateEmbedding(product.description);
          if (descEmbedding) {
            await client.execute({
              sql: 'INSERT OR REPLACE INTO embeddings (product_id, embedding_type, embedding) VALUES (?, ?, ?)',
              args: [product.id, 'description', JSON.stringify(descEmbedding)]
            });
            process.stdout.write(' ✓ Description embedding');
          }
        }
        
        // Generate combined embedding (most useful for search)
        // Include title, description, brand, category for comprehensive search
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
        if (combinedText) {
          const combinedEmbedding = await generateEmbedding(combinedText);
          if (combinedEmbedding) {
            await client.execute({
              sql: 'INSERT OR REPLACE INTO embeddings (product_id, embedding_type, embedding) VALUES (?, ?, ?)',
              args: [product.id, 'combined', JSON.stringify(combinedEmbedding)]
            });
            process.stdout.write(' ✓ Combined embedding');
          }
        }
        
        console.log(''); // New line after all embeddings
        processedCount++;
        
        // Rate limiting (respect API limits)
        // Gemini: 60 requests/minute, Groq: varies
        await new Promise(resolve => setTimeout(resolve, 150));
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ${product.sku}:`, error.message);
      }
    }

    // Verify embeddings were stored
    const embeddingCountResult = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM embeddings'
    });
    const embeddingCount = embeddingCountResult.rows[0]?.[0] || 0;
    
    console.log(`\n📊 Embedding Generation Summary:`);
    console.log(`   ✅ Processed: ${processedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Embeddings in database: ${embeddingCount}`);

    if (embeddingCount > 0) {
      console.log('\n✅ Embeddings successfully generated and stored in Turso!');
      console.log('💡 Vector search is now enabled for your products.');
      console.log(`   You have ${embeddingCount} embeddings ready for semantic search.`);
    } else {
      console.log('\n⚠️  No embeddings were stored. Check LLM provider configuration.');
      console.log('   Make sure LLM_EMBEDDING_PROVIDER is set (gemini recommended)');
      console.log('   And LLM_GEMINI_API_KEY is configured for embeddings.');
      console.log('   Note: If LLM_PROVIDER has inline comments, they will be stripped automatically.');
    }

  } catch (error) {
    console.error('❌ Error generating embeddings:', error);
    process.exit(1);
  }
}

generateEmbeddings();


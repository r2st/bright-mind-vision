#!/usr/bin/env node

/**
 * Migrate Products to Turso Database
 * Populates Turso with products from normalizedProductCatalog
 */

import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

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
  console.error('');
  console.error('Please set the following environment variables:');
  console.error('  TURSO_DATABASE_URL=libsql://your-db-name.turso.io');
  console.error('  TURSO_AUTH_TOKEN=your-auth-token');
  process.exit(1);
}

// Load product catalog
let normalizedProductCatalog;
try {
  const catalogPath = join(__dirname, '..', 'data', 'normalizedProductCatalog.js');
  
  // Use dynamic import to load the catalog module
  const catalogModule = await import('file://' + catalogPath);
  
  // Handle different export formats
  normalizedProductCatalog = 
    catalogModule.default || 
    catalogModule.normalizedProductCatalog || 
    catalogModule.products ||
    [];
    
  if (!Array.isArray(normalizedProductCatalog)) {
    throw new Error('Catalog is not an array');
  }
  
  console.log(`✅ Loaded ${normalizedProductCatalog.length} products from catalog`);
} catch (error) {
  console.error('❌ Error loading product catalog:', error);
  console.error('💡 Make sure data/normalizedProductCatalog.js exists and exports the catalog');
  console.error('   Error details:', error.message);
  process.exit(1);
}

if (!normalizedProductCatalog || normalizedProductCatalog.length === 0) {
  console.error('❌ Product catalog is empty!');
  process.exit(1);
}

async function migrateProducts() {
  console.log('🚀 Migrating products to Turso database...');
  console.log(`📡 Connecting to: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);
  console.log(`📦 Products to migrate: ${normalizedProductCatalog.length}`);

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  try {
    // Check existing products
    const countResult = await client.execute('SELECT COUNT(*) as count FROM products');
    const existingCount = countResult.rows[0]?.[0] || 0;
    console.log(`📊 Existing products in database: ${existingCount}`);

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    console.log('\n🔄 Migrating products...\n');

    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < normalizedProductCatalog.length; i += batchSize) {
      const batch = normalizedProductCatalog.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (product, index) => {
        const globalIndex = i + index + 1;
        
        try {
          // Prepare product data
          const category = typeof product.category === 'string' 
            ? product.category 
            : JSON.stringify(product.category || []);
          
          const tags = typeof product.tags === 'string'
            ? product.tags
            : JSON.stringify(product.tags || []);
          
          const price = typeof product.price === 'object' 
            ? product.price.amount 
            : product.price || 0;
          
          const currency = typeof product.price === 'object'
            ? product.price.currency
            : (product.currency || 'AED');

          // Check if product already exists
          const existing = await client.execute({
            sql: 'SELECT id FROM products WHERE sku = ?',
            args: [product.sku]
          });

          if (existing.rows.length > 0) {
            // Update existing product
            await client.execute({
              sql: `
                UPDATE products SET
                  title = ?,
                  brand = ?,
                  category = ?,
                  subcategory = ?,
                  price = ?,
                  currency = ?,
                  description = ?,
                  tags = ?,
                  rating = ?,
                  updated_at = CURRENT_TIMESTAMP
                WHERE sku = ?
              `,
              args: [
                product.title,
                product.brand,
                category,
                product.subcategory || null,
                price,
                currency,
                product.description || '',
                tags,
                product.rating || 0,
                product.sku
              ]
            });
            skipCount++;
            process.stdout.write(`\r✅ [${globalIndex}/${normalizedProductCatalog.length}] Updated: ${product.title.substring(0, 40)}...`);
          } else {
            // Insert new product
            const result = await client.execute({
              sql: `
                INSERT INTO products 
                (sku, title, brand, category, subcategory, price, currency, description, tags, rating)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `,
              args: [
                product.sku,
                product.title,
                product.brand,
                category,
                product.subcategory || null,
                price,
                currency,
                product.description || '',
                tags,
                product.rating || 0
              ]
            });
            successCount++;
            process.stdout.write(`\r✅ [${globalIndex}/${normalizedProductCatalog.length}] Added: ${product.title.substring(0, 40)}...`);
          }
        } catch (error) {
          errorCount++;
          console.error(`\n❌ [${globalIndex}] Error migrating ${product.sku}:`, error.message);
        }
      }));

      // Small delay between batches
      if (i + batchSize < normalizedProductCatalog.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n\n📊 Migration Summary:');
    console.log(`   ✅ Added: ${successCount}`);
    console.log(`   🔄 Updated: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Total: ${normalizedProductCatalog.length}`);

    // Verify final count
    const finalCountResult = await client.execute('SELECT COUNT(*) as count FROM products');
    const finalCount = finalCountResult.rows[0]?.[0] || 0;
    console.log(`\n📊 Final product count in database: ${finalCount}`);

    if (errorCount === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log(`\n⚠️  Migration completed with ${errorCount} errors`);
    }

    console.log('\n💡 Next step: Run generate-turso-embeddings.js to create vector embeddings');

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateProducts();


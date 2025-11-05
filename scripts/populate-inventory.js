#!/usr/bin/env node

/**
 * Populate Inventory with Products from Catalog
 * 
 * This script initializes the inventory system with product data from the catalog.
 * It sets default stock levels and creates inventory records for all products.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple .env loader
function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.startsWith('#')) return;
      
      const match = cleanLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        value = value.replace(/^["']|["']$/g, '');
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
  const catalogModule = await import('file://' + catalogPath);
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
  process.exit(1);
}

async function populateInventory() {
  console.log('🚀 Populating inventory with products...\n');
  
  const client = createClient({
    url: databaseUrl,
    authToken: authToken
  });

  try {
    // Verify inventory table exists
    const tableCheck = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='inventory'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.error('❌ Inventory table does not exist!');
      console.error('💡 Run: npm run turso:inventory first');
      process.exit(1);
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Default stock settings
    const defaultQuantity = 10; // Default stock level
    const defaultLocation = 'Dubai Warehouse'; // Default location

    for (const product of normalizedProductCatalog) {
      const sku = product.sku;
      const productName = product.title;
      const brand = product.brand || null;
      const category = Array.isArray(product.category) 
        ? product.category.join(', ') 
        : (product.category || null);
      
      // Check if already exists
      const existing = await client.execute({
        sql: 'SELECT sku FROM inventory WHERE sku = ?',
        args: [sku]
      });

      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping ${sku} (already exists)`);
        skipCount++;
        continue;
      }

      try {
        const timestamp = new Date().toISOString();
        const quantity = defaultQuantity;
        const reservedQuantity = 0;
        const availableQuantity = quantity - reservedQuantity;

        // Insert inventory record
        await client.execute({
          sql: `
            INSERT INTO inventory 
            (sku, product_name, brand, category, quantity, reserved_quantity, 
             available_quantity, location, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            sku,
            productName,
            brand,
            category,
            quantity,
            reservedQuantity,
            availableQuantity,
            defaultLocation,
            timestamp,
            timestamp
          ]
        });

        // Record initial transaction
        await client.execute({
          sql: `
            INSERT INTO inventory_transactions 
            (transaction_id, sku, transaction_type, quantity_change, 
             quantity_before, quantity_after, reason, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            `init_${sku}_${Date.now()}`,
            sku,
            'initial',
            quantity,
            0,
            quantity,
            'Initial inventory setup',
            timestamp
          ]
        });

        console.log(`✅ Added ${sku}: ${productName} (${quantity} in stock)`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding ${sku}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Inventory Population Summary\n');
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`⏭️  Skipped (already exists): ${skipCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📦 Total processed: ${normalizedProductCatalog.length} products`);
    console.log('\n✅ Inventory population complete!');

  } catch (error) {
    console.error('❌ Error populating inventory:', error);
    throw error;
  } finally {
    client.close();
  }
}

// Run the population
populateInventory().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});



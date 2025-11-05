/**
 * Initialize Turso Inventory Tables
 * Creates inventory, inventory_embeddings, and inventory_transactions tables
 */

import { createClient } from '@libsql/client';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

async function initInventory() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    process.exit(1);
  }

  console.log('🔌 Connecting to Turso...');
  const client = createClient({
    url,
    authToken
  });

  try {
    // Create inventory table
    console.log('📦 Creating inventory table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        sku TEXT PRIMARY KEY,
        product_name TEXT NOT NULL,
        brand TEXT,
        category TEXT,
        quantity INTEGER NOT NULL DEFAULT 0,
        reserved_quantity INTEGER NOT NULL DEFAULT 0,
        available_quantity INTEGER NOT NULL DEFAULT 0,
        location TEXT,
        last_restocked_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create inventory embeddings table
    console.log('📦 Creating inventory_embeddings table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS inventory_embeddings (
        sku TEXT PRIMARY KEY,
        embedding TEXT NOT NULL,
        search_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (sku) REFERENCES inventory(sku) ON DELETE CASCADE
      )
    `);

    // Create inventory transactions table
    console.log('📦 Creating inventory_transactions table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        transaction_id TEXT PRIMARY KEY,
        sku TEXT NOT NULL,
        transaction_type TEXT NOT NULL,
        quantity_change INTEGER NOT NULL,
        quantity_before INTEGER NOT NULL,
        quantity_after INTEGER NOT NULL,
        reason TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (sku) REFERENCES inventory(sku) ON DELETE CASCADE
      )
    `);

    // Create indexes
    console.log('📦 Creating indexes...');
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_inventory_brand ON inventory(brand)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(available_quantity)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_transactions_sku ON inventory_transactions(sku)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON inventory_transactions(transaction_type)
    `);

    console.log('✅ Inventory tables initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing inventory tables:', error);
    process.exit(1);
  }
}

initInventory().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});



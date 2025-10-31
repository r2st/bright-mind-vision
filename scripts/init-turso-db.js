#!/usr/bin/env node

/**
 * Initialize Turso Database
 * Creates tables and schema for products and embeddings
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
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
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
  console.error('');
  console.error('Add them to .env.local or export them before running this script.');
  process.exit(1);
}

async function initializeDatabase() {
  console.log('🚀 Initializing Turso database...');
  console.log(`📡 Connecting to: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  try {
    // Test connection
    await client.execute('SELECT 1');
    console.log('✅ Connected to Turso database');

    // Create products table
    console.log('\n📦 Creating products table...');
    await client.execute(`
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
    console.log('✅ Products table created');

    // Create embeddings table
    console.log('📦 Creating embeddings table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        embedding_type TEXT NOT NULL,
        embedding TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Embeddings table created');

    // Create indexes
    console.log('📦 Creating indexes...');
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_embeddings_product_id ON embeddings(product_id)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_embeddings_type ON embeddings(embedding_type)
    `);
    console.log('✅ Indexes created');

    // Check existing product count
    const countResult = await client.execute('SELECT COUNT(*) as count FROM products');
    const existingCount = countResult.rows[0]?.[0] || 0;
    
    console.log(`\n📊 Current product count: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('⚠️  Database already has products. Run migrate-turso-products.js to add/update products.');
    } else {
      console.log('✅ Database is empty and ready for migration.');
    }

    console.log('\n✅ Turso database initialized successfully!');
    console.log('\nNext step: Run migrate-turso-products.js to populate products');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    if (error.message?.includes('database')) {
      console.error('\n💡 Tip: Make sure the database exists in Turso dashboard');
    }
    process.exit(1);
  }
}

initializeDatabase();


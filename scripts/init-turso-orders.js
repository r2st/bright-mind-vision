/**
 * Initialize Turso Order Tables
 * Creates tables for carts, orders, and returns in Turso
 */

import { createClient } from '@libsql/client';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
  console.error('');
  console.error('Add them to .env.local or export them before running this script.');
  process.exit(1);
}

async function initializeOrderTables() {
  console.log('🚀 Initializing Turso order tables...');
  console.log(`📡 Connecting to: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  try {
    // Test connection
    await client.execute('SELECT 1');
    console.log('✅ Connected to Turso database');

    // Create carts table
    console.log('\n📦 Creating carts table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS carts (
        cart_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        items TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        abandoned_at TEXT
      )
    `);
    console.log('✅ Carts table created');

    // Create orders table
    console.log('📦 Creating orders table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        cart_id TEXT,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        shipping_cost REAL NOT NULL,
        tax REAL NOT NULL,
        discount REAL NOT NULL,
        total REAL NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        billing_address TEXT NOT NULL,
        payment_method TEXT,
        payment_status TEXT NOT NULL,
        payment_transaction_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        shipped_at TEXT,
        delivered_at TEXT
      )
    `);
    console.log('✅ Orders table created');

    // Create returns table
    console.log('📦 Creating returns table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS returns (
        return_id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        items TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL,
        refund_amount REAL NOT NULL,
        refund_status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        processed_at TEXT
      )
    `);
    console.log('✅ Returns table created');

    // Create indexes
    console.log('📦 Creating indexes...');
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_carts_updated_at ON carts(updated_at)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_returns_customer_id ON returns(customer_id)
    `);
    console.log('✅ Indexes created');

    // Create embeddings tables for semantic search
    console.log('📦 Creating embedding tables...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS cart_embeddings (
        cart_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        embedding TEXT NOT NULL,
        search_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    await client.execute(`
      CREATE TABLE IF NOT EXISTS order_embeddings (
        order_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        embedding TEXT NOT NULL,
        search_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    await client.execute(`
      CREATE TABLE IF NOT EXISTS return_embeddings (
        return_id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        embedding TEXT NOT NULL,
        search_text TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    
// Indexes for embeddings
await client.execute(`
  CREATE INDEX IF NOT EXISTS idx_cart_embeddings_customer_id ON cart_embeddings(customer_id)
`);
await client.execute(`
  CREATE INDEX IF NOT EXISTS idx_order_embeddings_customer_id ON order_embeddings(customer_id)
`);
await client.execute(`
  CREATE INDEX IF NOT EXISTS idx_return_embeddings_customer_id ON return_embeddings(customer_id)
`);

// Composite indexes for common query patterns (performance optimization)
console.log('📦 Creating composite indexes...');
await client.execute(`
  CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders(customer_id, created_at DESC)
`);
await client.execute(`
  CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC)
`);
await client.execute(`
  CREATE INDEX IF NOT EXISTS idx_carts_customer_updated ON carts(customer_id, updated_at DESC)
`);
    console.log('✅ Embedding tables created');
    console.log('✅ Composite indexes created');

    console.log('\n✅ Turso order tables initialized successfully!');
    console.log('📊 Semantic search enabled for order history!');
    console.log('⚡ Performance optimizations: Composite indexes for common queries');
    console.log('💰 Cost optimizations: Embedding change detection enabled');
    console.log('\nThe order system will now use Turso for serverless deployments.');

  } catch (error) {
    console.error('❌ Error initializing order tables:', error);
    if (error.message?.includes('database')) {
      console.error('\n💡 Tip: Make sure the database exists in Turso dashboard');
    }
    process.exit(1);
  }
}

initializeOrderTables();


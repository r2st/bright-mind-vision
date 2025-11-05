// Inventory Transactions API
// GET: Get transaction history with filters

import { inventoryService } from '../../../services/inventoryService.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!inventoryService.isAvailable()) {
    return res.status(503).json({ 
      error: 'Inventory service not available',
      message: 'Turso database not configured'
    });
  }

  try {
    const { sku, type, limit = 100 } = req.query;

    let sql = 'SELECT * FROM inventory_transactions WHERE 1=1';
    const args = [];

    if (sku) {
      sql += ' AND sku = ?';
      args.push(sku);
    }

    if (type) {
      sql += ' AND transaction_type = ?';
      args.push(type);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    args.push(parseInt(limit));

    const result = await inventoryService.client.execute({ sql, args });

    const columns = result.columns || ['transaction_id', 'sku', 'transaction_type', 'quantity_change', 'quantity_before', 'quantity_after', 'reason', 'created_at'];
    const transactions = result.rows.map(row => {
      const tx = {};
      columns.forEach((col, idx) => {
        tx[col] = row[idx];
      });
      return tx;
    });

    return res.status(200).json({
      success: true,
      transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    return res.status(500).json({ 
      error: 'Failed to get transactions',
      details: error.message 
    });
  }
}



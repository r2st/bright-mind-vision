// Inventory Item API
// GET: Get specific inventory item
// PUT: Update inventory item
// DELETE: Delete inventory item

import { inventoryService } from '../../../services/inventoryService.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!inventoryService.isAvailable()) {
    return res.status(503).json({ 
      error: 'Inventory service not available',
      message: 'Turso database not configured'
    });
  }

  // Get SKU from query parameter (Next.js dynamic route)
  const sku = req.query.sku;

  if (!sku) {
    return res.status(400).json({ error: 'SKU parameter is required' });
  }

  try {
    if (req.method === 'GET') {
      return await handleGetItem(req, res, sku);
    } else if (req.method === 'PUT') {
      return await handleUpdateItem(req, res, sku);
    } else if (req.method === 'DELETE') {
      return await handleDeleteItem(req, res, sku);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Inventory item API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function handleGetItem(req, res, sku) {
  try {
    const stock = await inventoryService.checkStock(sku);
    
    if (stock.in_stock === null) {
      return res.status(404).json({ 
        error: 'Item not found',
        sku 
      });
    }

    // Get transaction history
    const transactions = await inventoryService.client.execute({
      sql: `
        SELECT * FROM inventory_transactions 
        WHERE sku = ? 
        ORDER BY created_at DESC 
        LIMIT 50
      `,
      args: [sku]
    });

    const transactionColumns = transactions.columns || ['transaction_id', 'sku', 'transaction_type', 'quantity_change', 'quantity_before', 'quantity_after', 'reason', 'created_at'];
    const transactionHistory = transactions.rows.map(row => {
      const tx = {};
      transactionColumns.forEach((col, idx) => {
        tx[col] = row[idx];
      });
      return tx;
    });

    return res.status(200).json({
      success: true,
      item: stock,
      transactions: transactionHistory
    });
  } catch (error) {
    console.error('Error getting inventory item:', error);
    return res.status(500).json({ 
      error: 'Failed to get inventory item',
      details: error.message 
    });
  }
}

async function handleUpdateItem(req, res, sku) {
  try {
    const { 
      product_name, 
      brand, 
      category, 
      quantity, 
      reserved_quantity,
      location 
    } = req.body;

    // Get current item
    const currentStock = await inventoryService.checkStock(sku);
    if (currentStock.in_stock === null) {
      return res.status(404).json({ 
        error: 'Item not found',
        sku 
      });
    }

    // Calculate quantity change
    const currentQuantity = currentStock.stock_level || 0;
    const newQuantity = quantity !== undefined ? parseInt(quantity) : currentQuantity;
    const quantityChange = newQuantity - currentQuantity;

    // Update inventory
    const updateData = {
      product_name: product_name || currentStock.product_name,
      brand: brand !== undefined ? brand : currentStock.brand,
      category: category !== undefined ? category : currentStock.category,
      quantity: newQuantity,
      reserved_quantity: reserved_quantity !== undefined ? parseInt(reserved_quantity) : currentStock.reserved_quantity,
      location: location !== undefined ? location : currentStock.location
    };

    const result = await inventoryService.upsertInventory(sku, updateData);

    // Record transaction if quantity changed
    if (quantityChange !== 0) {
      await inventoryService.recordTransaction(
        sku,
        'adjustment',
        quantityChange,
        currentQuantity,
        newQuantity,
        req.body.reason || 'Manual inventory update'
      );
    }

    if (result && result.success) {
      return res.status(200).json({
        success: true,
        message: 'Inventory item updated successfully',
        item: result
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to update inventory item' 
      });
    }
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return res.status(500).json({ 
      error: 'Failed to update inventory item',
      details: error.message 
    });
  }
}

async function handleDeleteItem(req, res, sku) {
  try {
    // Check if item exists
    const stock = await inventoryService.checkStock(sku);
    if (stock.in_stock === null) {
      return res.status(404).json({ 
        error: 'Item not found',
        sku 
      });
    }

    // Delete item (cascade will delete transactions and embeddings)
    await inventoryService.client.execute({
      sql: 'DELETE FROM inventory WHERE sku = ?',
      args: [sku]
    });

    return res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return res.status(500).json({ 
      error: 'Failed to delete inventory item',
      details: error.message 
    });
  }
}


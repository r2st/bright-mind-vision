// Inventory Management API
// GET: List all inventory items
// POST: Create new inventory item

import { inventoryService } from '../../../services/inventoryService.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return await handleGetInventory(req, res);
    } else if (req.method === 'POST') {
      return await handleCreateInventory(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Inventory API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function handleGetInventory(req, res) {
  if (!inventoryService.isAvailable()) {
    return res.status(503).json({ 
      error: 'Inventory service not available',
      message: 'Turso database not configured'
    });
  }

  try {
    const { search, category, brand, lowStock, inStock } = req.query;

    // Get all inventory or search
    let items = [];
    
    if (search) {
      // Semantic search
      items = await inventoryService.searchInventory(search, 100);
    } else {
      // Get all items
      const result = await inventoryService.client.execute({
        sql: 'SELECT * FROM inventory ORDER BY updated_at DESC'
      });

      // Convert rows to objects
      if (result.rows.length > 0) {
        const columns = result.columns || ['sku', 'product_name', 'brand', 'category', 'quantity', 'reserved_quantity', 'available_quantity', 'location', 'last_restocked_at', 'created_at', 'updated_at'];
        
        items = result.rows.map(row => {
          const item = {};
          columns.forEach((col, idx) => {
            item[col] = row[idx];
          });
          return item;
        });
      }
    }

    // Apply filters
    if (category) {
      items = items.filter(item => 
        item.category && item.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (brand) {
      items = items.filter(item => 
        item.brand && item.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }

    if (inStock === 'true') {
      items = items.filter(item => item.available_quantity > 0);
    }

    if (lowStock === 'true') {
      items = items.filter(item => item.available_quantity <= 5 && item.available_quantity > 0);
    }

    return res.status(200).json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    console.error('Error getting inventory:', error);
    return res.status(500).json({ 
      error: 'Failed to get inventory',
      details: error.message 
    });
  }
}

async function handleCreateInventory(req, res) {
  if (!inventoryService.isAvailable()) {
    return res.status(503).json({ 
      error: 'Inventory service not available',
      message: 'Turso database not configured'
    });
  }

  try {
    const { 
      sku, 
      product_name, 
      brand, 
      category, 
      quantity, 
      location 
    } = req.body;

    if (!sku || !product_name || quantity === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: sku, product_name, quantity' 
      });
    }

    const result = await inventoryService.upsertInventory(sku, {
      product_name,
      brand: brand || null,
      category: category || null,
      quantity: parseInt(quantity) || 0,
      location: location || null
    });

    if (result && result.success) {
      return res.status(201).json({
        success: true,
        message: 'Inventory item created successfully',
        item: result
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to create inventory item' 
      });
    }
  } catch (error) {
    console.error('Error creating inventory:', error);
    return res.status(500).json({ 
      error: 'Failed to create inventory item',
      details: error.message 
    });
  }
}



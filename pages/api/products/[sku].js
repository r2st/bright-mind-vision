// Product Management API - Single Product
// GET: Get product by SKU
// PUT: Update product with automatic embedding regeneration
// DELETE: Delete product

import { tursoVectorDB } from '../../../services/tursoVectorDB.js';
import llmProvider from '../../../services/llmProvider.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { sku } = req.query;

  if (!sku) {
    return res.status(400).json({ error: 'SKU is required' });
  }

  try {
    if (req.method === 'GET') {
      return await handleGetProduct(req, res, sku);
    } else if (req.method === 'PUT') {
      return await handleUpdateProduct(req, res, sku);
    } else if (req.method === 'DELETE') {
      return await handleDeleteProduct(req, res, sku);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Product API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function handleGetProduct(req, res, sku) {
  if (!tursoVectorDB.isAvailable()) {
    return res.status(503).json({ 
      error: 'Product service not available',
      message: 'Turso database not configured'
    });
  }

  try {
    const product = await tursoVectorDB.getProductBySku(sku);

    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        sku 
      });
    }

    // Format product response
    const formattedProduct = {
      ...product,
      category: typeof product.category === 'string' 
        ? JSON.parse(product.category || '[]') 
        : (product.category || []),
      tags: typeof product.tags === 'string' 
        ? JSON.parse(product.tags || '[]') 
        : (product.tags || []),
      price: {
        amount: product.price || 0,
        currency: product.currency || 'AED'
      }
    };

    return res.status(200).json({
      success: true,
      product: formattedProduct
    });
  } catch (error) {
    console.error('Error getting product:', error);
    return res.status(500).json({ 
      error: 'Failed to get product',
      details: error.message 
    });
  }
}

async function handleUpdateProduct(req, res, sku) {
  if (!tursoVectorDB.isAvailable()) {
    return res.status(503).json({ 
      error: 'Product service not available',
      message: 'Turso database not configured'
    });
  }

  try {
    const { 
      title,
      brand,
      category,
      subcategory,
      price,
      currency,
      description,
      tags,
      rating
    } = req.body;

    // Get existing product
    const existingProduct = await tursoVectorDB.getProductBySku(sku);
    if (!existingProduct) {
      return res.status(404).json({ 
        error: 'Product not found',
        sku 
      });
    }

    // Normalize category and tags
    const categoryArray = category !== undefined
      ? (Array.isArray(category) ? category : (category ? [category] : []))
      : (typeof existingProduct.category === 'string' 
          ? JSON.parse(existingProduct.category || '[]') 
          : (existingProduct.category || []));

    const tagsArray = tags !== undefined
      ? (Array.isArray(tags) ? tags : (tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [tags]) : []))
      : (typeof existingProduct.tags === 'string' 
          ? JSON.parse(existingProduct.tags || '[]') 
          : (existingProduct.tags || []));

    // Normalize price
    const priceAmount = price !== undefined
      ? (typeof price === 'object' ? (price.amount || price.value || 0) : price)
      : existingProduct.price;
    const priceCurrency = currency || (typeof price === 'object' ? price.currency : null) || existingProduct.currency || 'AED';

    // Prepare updated product data
    const productData = {
      sku,
      title: title || existingProduct.title,
      brand: brand || existingProduct.brand,
      category: categoryArray,
      subcategory: subcategory !== undefined ? subcategory : existingProduct.subcategory,
      price: priceAmount,
      currency: priceCurrency,
      description: description !== undefined ? description : existingProduct.description,
      tags: tagsArray,
      rating: rating !== undefined ? rating : existingProduct.rating
    };

    // Update product in database
    const productId = await tursoVectorDB.upsertProduct(productData);

    if (!productId) {
      return res.status(500).json({ 
        error: 'Failed to update product in database' 
      });
    }

    // Regenerate embeddings if product data changed
    console.log(`🔄 Regenerating embeddings for updated product: ${sku} (ID: ${productId})`);
    try {
      // Generate title embedding
      const titleEmbedding = await llmProvider.generateEmbedding(productData.title);
      await tursoVectorDB.storeEmbedding(productId, 'title', titleEmbedding);

      // Generate description embedding (if description exists)
      if (productData.description && productData.description.trim()) {
        const descEmbedding = await llmProvider.generateEmbedding(productData.description);
        await tursoVectorDB.storeEmbedding(productId, 'description', descEmbedding);
      }

      // Generate combined embedding
      const categoryText = categoryArray.join(' ');
      const tagsText = tagsArray.join(' ');
      const combinedText = `${productData.title} ${productData.description || ''} ${productData.brand} ${categoryText} ${tagsText}`.trim();
      const combinedEmbedding = await llmProvider.generateEmbedding(combinedText);
      await tursoVectorDB.storeEmbedding(productId, 'combined', combinedEmbedding);
      console.log(`✅ Embeddings regenerated for ${sku}`);
    } catch (embeddingError) {
      console.warn(`⚠️ Failed to regenerate embeddings for ${sku}:`, embeddingError.message);
      // Don't fail the request if embeddings fail
    }

    // Get the updated product
    const updatedProduct = await tursoVectorDB.getProductBySku(sku);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully with embeddings regenerated',
      product: {
        ...updatedProduct,
        category: categoryArray,
        tags: tagsArray,
        price: {
          amount: priceAmount,
          currency: priceCurrency
        }
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message 
    });
  }
}

async function handleDeleteProduct(req, res, sku) {
  if (!tursoVectorDB.isAvailable()) {
    return res.status(503).json({ 
      error: 'Product service not available',
      message: 'Turso database not configured'
    });
  }

  try {
    // Get product ID first
    const product = await tursoVectorDB.getProductBySku(sku);
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        sku 
      });
    }

    // Delete product (embeddings will be cascade deleted due to foreign key)
    if (!tursoVectorDB.isAvailable()) {
      return res.status(503).json({ 
        error: 'Product service not available',
        message: 'Turso database not configured'
      });
    }

    await tursoVectorDB.client.execute({
      sql: 'DELETE FROM products WHERE sku = ?',
      args: [sku]
    });

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      sku
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ 
      error: 'Failed to delete product',
      details: error.message 
    });
  }
}


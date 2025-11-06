// Product Management API
// GET: List all products
// POST: Create new product with automatic embedding generation

import { tursoVectorDB } from '../../../services/tursoVectorDB.js';
import { enhancedRAGService } from '../../../services/enhancedRAGService.js';
import llmProvider from '../../../services/llmProvider.js';

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
      return await handleGetProducts(req, res);
    } else if (req.method === 'POST') {
      return await handleCreateProduct(req, res);
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

async function handleGetProducts(req, res) {
  if (!tursoVectorDB.isAvailable()) {
    return res.status(503).json({ 
      error: 'Product service not available',
      message: 'Turso database not configured'
    });
  }

  try {
    const { search, category, brand, sku } = req.query;

    let products = [];

    if (sku) {
      // Get single product by SKU
      const product = await tursoVectorDB.getProductBySku(sku);
      products = product ? [product] : [];
    } else if (search) {
      // Semantic search using embeddings
      try {
        const queryEmbedding = await llmProvider.generateEmbedding(search);
        products = await tursoVectorDB.vectorSearch(queryEmbedding, 50);
      } catch (embeddingError) {
        console.warn('Semantic search failed, falling back to text search:', embeddingError.message);
        products = await tursoVectorDB.searchProducts(search);
      }
    } else {
      // Get all products
      products = await tursoVectorDB.getAllProducts();
    }

    // Apply filters
    if (category) {
      products = products.filter(product => {
        const productCategory = typeof product.category === 'string' 
          ? JSON.parse(product.category || '[]') 
          : (product.category || []);
        return Array.isArray(productCategory) 
          ? productCategory.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
          : false;
      });
    }

    if (brand) {
      products = products.filter(product => 
        product.brand && product.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }

    // Parse JSON fields for response
    const formattedProducts = products.map(product => ({
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
    }));

    return res.status(200).json({
      success: true,
      products: formattedProducts,
      count: formattedProducts.length
    });
  } catch (error) {
    console.error('Error getting products:', error);
    return res.status(500).json({ 
      error: 'Failed to get products',
      details: error.message 
    });
  }
}

async function handleCreateProduct(req, res) {
  if (!tursoVectorDB.isAvailable()) {
    return res.status(503).json({ 
      error: 'Product service not available',
      message: 'Turso database not configured'
    });
  }

  try {
    const { 
      sku, 
      title,
      brand,
      category,
      subcategory,
      price,
      currency,
      description,
      tags,
      rating,
      reviews,
      attributes,
      badges,
      images,
      pdp_url,
      region,
      in_stock
    } = req.body;

    // Validate required fields
    if (!sku || !title || !brand) {
      return res.status(400).json({ 
        error: 'Missing required fields: sku, title, brand' 
      });
    }

    // Normalize category (ensure it's an array)
    const categoryArray = Array.isArray(category) 
      ? category 
      : (category ? [category] : []);

    // Normalize tags (ensure it's an array)
    const tagsArray = Array.isArray(tags) 
      ? tags 
      : (tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [tags]) : []);

    // Normalize price
    const priceAmount = typeof price === 'object' 
      ? (price.amount || price.value || 0)
      : (price || 0);
    const priceCurrency = typeof price === 'object' 
      ? (price.currency || currency || 'AED')
      : (currency || 'AED');

    // Prepare product data
    const productData = {
      sku,
      title,
      brand,
      category: categoryArray,
      subcategory: subcategory || null,
      price: priceAmount,
      currency: priceCurrency,
      description: description || '',
      tags: tagsArray,
      rating: rating || 0
    };

    // Upsert product in database
    const productId = await tursoVectorDB.upsertProduct(productData);

    if (!productId) {
      return res.status(500).json({ 
        error: 'Failed to create/update product in database' 
      });
    }

    // Generate and store embeddings automatically
    console.log(`🔄 Generating embeddings for product: ${sku} (ID: ${productId})`);
    try {
      // Generate title embedding
      const titleEmbedding = await llmProvider.generateEmbedding(title);
      await tursoVectorDB.storeEmbedding(productId, 'title', titleEmbedding);
      console.log(`✅ Title embedding generated for ${sku}`);

      // Generate description embedding (if description exists)
      if (description && description.trim()) {
        const descEmbedding = await llmProvider.generateEmbedding(description);
        await tursoVectorDB.storeEmbedding(productId, 'description', descEmbedding);
        console.log(`✅ Description embedding generated for ${sku}`);
      }

      // Generate combined embedding (most important for semantic search)
      // Include attributes, badges for better semantic search
      const categoryText = categoryArray.join(' ');
      const tagsText = tagsArray.join(' ');
      const badgesText = Array.isArray(badges) ? badges.join(' ') : (badges || '');
      const attributesText = attributes && typeof attributes === 'object' 
        ? Object.values(attributes).join(' ') 
        : '';
      const combinedText = `${title} ${description || ''} ${brand} ${categoryText} ${tagsText} ${badgesText} ${attributesText}`.trim();
      const combinedEmbedding = await llmProvider.generateEmbedding(combinedText);
      await tursoVectorDB.storeEmbedding(productId, 'combined', combinedEmbedding);
      console.log(`✅ Combined embedding generated for ${sku}`);
    } catch (embeddingError) {
      console.warn(`⚠️ Failed to generate embeddings for ${sku}:`, embeddingError.message);
      // Don't fail the request if embeddings fail - product is still created
    }

      // Get the created product
      const createdProduct = await tursoVectorDB.getProductBySku(sku);

      // Format response with all product data
      const formattedProduct = {
        ...createdProduct,
        category: categoryArray,
        tags: tagsArray,
        price: {
          amount: priceAmount,
          currency: priceCurrency
        },
        attributes: attributes || {},
        badges: Array.isArray(badges) ? badges : (badges ? [badges] : []),
        images: Array.isArray(images) ? images : (images ? [images] : []),
        reviews: reviews || 0,
        urls: pdp_url ? { pdp: pdp_url } : {},
        availability: {
          region: region ? [region] : ['UAE'],
          in_stock: in_stock !== false
        }
      };

      return res.status(201).json({
        success: true,
        message: 'Product created/updated successfully with embeddings',
        product: formattedProduct
      });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message 
    });
  }
}


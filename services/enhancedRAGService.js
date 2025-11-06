import { llmProvider } from './llmProvider.js';
import { vectorDB } from './sqliteVectorDB.js';
import { tursoVectorDB } from './tursoVectorDB.js';
import { pineconeVectorDB } from './pineconeVectorDB.js';
import { synonymService } from './synonymService.js';
import { normalizedProductCatalog } from '../data/normalizedProductCatalog.js';

/**
 * Enhanced RAG Service with SQLite Vector Database and Groq LLM
 * Provides intelligent product recommendations using semantic search
 */
class EnhancedRAGService {
  constructor() {
    this.models = llmProvider.getModels();
    this.initialized = false;
  }

  // Helper method to get products - uses Turso → SQLite → Catalog fallback chain
  async getAllProducts() {
    // Priority 1: Try Turso (serverless-friendly, works on Netlify)
    if (tursoVectorDB.isAvailable()) {
      try {
        const products = await tursoVectorDB.getAllProducts();
        if (products && products.length > 0) {
          console.log(`✅ RAG Service: Found ${products.length} products in Turso`);
          return products;
        } else {
          console.warn(`⚠️ RAG Service: Turso returned ${products?.length || 0} products, trying fallback...`);
          console.warn(`⚠️ Turso connection status:`, {
            isAvailable: tursoVectorDB.isAvailable(),
            hasClient: !!tursoVectorDB.client,
            environment: process.env.NODE_ENV || 'development'
          });
        }
      } catch (error) {
        console.warn('⚠️ RAG Service: Turso unavailable, trying SQLite fallback:', error.message);
        console.warn('⚠️ Turso error details:', {
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n'),
          environment: process.env.NODE_ENV || 'development'
        });
      }
    } else {
      console.warn(`⚠️ RAG Service: Turso not available (isAvailable: ${tursoVectorDB.isAvailable()}), using fallback`);
    }

    // Priority 2: Try local SQLite (works locally)
    try {
      const dbProducts = vectorDB.getAllProducts();
      if (dbProducts && dbProducts.length > 0) {
        console.log(`✅ RAG Service: Found ${dbProducts.length} products in SQLite`);
        return dbProducts;
      } else {
        console.warn(`⚠️ RAG Service: SQLite returned ${dbProducts?.length || 0} products, using catalog fallback`);
      }
    } catch (error) {
      console.warn('⚠️ RAG Service: SQLite unavailable, using catalog fallback:', error.message);
    }
    
    // Priority 3: Fallback to catalog when all databases unavailable or empty
    console.log(`📦 RAG Service: Using product catalog directly (${normalizedProductCatalog.length} products)`);
    return normalizedProductCatalog.map((product, index) => ({
      id: index + 1,
      sku: product.sku,
      title: product.title,
      brand: product.brand,
      category: typeof product.category === 'string' ? product.category : JSON.stringify(product.category || []),
      subcategory: product.subcategory || null,
      price: typeof product.price === 'object' ? product.price.amount : product.price,
      currency: typeof product.price === 'object' ? product.price.currency : (product.currency || 'AED'),
      description: product.description || '',
      tags: typeof product.tags === 'string' ? product.tags : JSON.stringify(product.tags || []),
      rating: product.rating || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Populate database with products if empty or if catalog has more products
      const productCount = vectorDB.getProductCount();
      const catalogSize = normalizedProductCatalog.length;
      
      if (productCount === 0) {
        console.log('📦 Populating vector database with products...');
        await this.populateDatabase();
      } else if (catalogSize > productCount) {
        console.log(`📦 Catalog has ${catalogSize} products but DB has ${productCount}. Adding new products...`);
        await this.syncNewProducts();
      }
      
      this.initialized = true;
      
      // Log product count from available database
      let finalCount = 0;
      let dbType = 'Catalog';
      
      if (tursoVectorDB.isAvailable()) {
        try {
          finalCount = await tursoVectorDB.getProductCount();
          dbType = 'Turso';
        } catch (error) {
          console.warn('⚠️ Could not get Turso count, trying SQLite:', error.message);
        }
      }
      
      if (finalCount === 0 && vectorDB) {
        try {
          finalCount = vectorDB.getProductCount();
          if (finalCount > 0) {
            dbType = 'SQLite';
          }
        } catch (error) {
          // Fallback to catalog
        }
      }
      
      if (finalCount === 0 || isNaN(finalCount)) {
        finalCount = normalizedProductCatalog.length;
        dbType = 'Catalog (fallback)';
      }
      
      console.log(`✅ Enhanced RAG Service initialized with ${finalCount} products (${dbType})`);
    } catch (error) {
      console.error('❌ Enhanced RAG Service initialization failed:', error);
    }
  }

  async populateDatabase() {
    for (const product of normalizedProductCatalog) {
      const productId = vectorDB.upsertProduct(product);
      if (productId) {
        // Generate embeddings for the product
        await this.generateAndStoreEmbeddings(productId, product);
      }
    }
    console.log(`✅ Populated database with ${normalizedProductCatalog.length} products`);
  }

  async syncNewProducts() {
    // Get all existing SKUs from database (or catalog if DB unavailable)
    const existingProducts = await this.getAllProducts(); // Now async
    const existingSkus = new Set(existingProducts.map(p => p.sku));
    
    // Find new products not in DB
    const newProducts = normalizedProductCatalog.filter(p => !existingSkus.has(p.sku));
    
    if (newProducts.length > 0) {
      console.log(`📦 Adding ${newProducts.length} new products to database...`);
      for (const product of newProducts) {
        try {
          const productId = vectorDB.upsertProduct(product);
          if (productId) {
            // Check if embeddings already exist, if not generate them
            const existingEmbeddings = vectorDB.getEmbeddings(productId);
            if (existingEmbeddings.length === 0) {
              await this.generateAndStoreEmbeddings(productId, product);
            }
          }
        } catch (error) {
          console.error(`Error adding product ${product.sku}:`, error);
        }
      }
      console.log(`✅ Added ${newProducts.length} new products with embeddings`);
    } else {
      console.log('✅ All products are already in database');
      // Also check if existing products are missing embeddings
      let missingEmbeddings = 0;
      for (const product of existingProducts) {
        const embeddings = vectorDB.getEmbeddings(product.id);
        if (embeddings.length === 0) {
          missingEmbeddings++;
          const catalogProduct = normalizedProductCatalog.find(p => p.sku === product.sku);
          if (catalogProduct) {
            await this.generateAndStoreEmbeddings(product.id, catalogProduct);
          }
        }
      }
      if (missingEmbeddings > 0) {
        console.log(`✅ Generated embeddings for ${missingEmbeddings} products that were missing them`);
      }
    }
  }

  async generateAndStoreEmbeddings(productId, product) {
    try {
      // Generate title embedding
      const titleEmbedding = await this.generateEmbedding(product.title);
      vectorDB.storeEmbedding(productId, 'title', titleEmbedding);

      // Generate description embedding
      if (product.description) {
        const descEmbedding = await this.generateEmbedding(product.description);
        vectorDB.storeEmbedding(productId, 'description', descEmbedding);
      }

      // Generate combined embedding
      const combinedText = `${product.title} ${product.description} ${product.brand} ${product.category.join(' ')}`;
      const combinedEmbedding = await this.generateEmbedding(combinedText);
      vectorDB.storeEmbedding(productId, 'combined', combinedEmbedding);

    } catch (error) {
      console.error('Error generating embeddings for product:', product.sku, error);
    }
  }

  async generateEmbedding(text) {
    try {
      // Delegate embedding generation to provider abstraction (Gemini embeddings if configured)
      const vec = await llmProvider.generateEmbedding(text);
      if (Array.isArray(vec) && vec.length > 0) return vec;
      return this.createSimpleEmbedding(text);
    } catch (error) {
      console.error('Error generating embedding:', error);
      return this.createSimpleEmbedding(text);
    }
  }

  createSimpleEmbedding(text) {
    // Simple hash-based embedding as fallback
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(128).fill(0);
    
    words.forEach(word => {
      const hash = this.simpleHash(word);
      const index = hash % 128;
      embedding[index] += 1;
    });
    
    // Normalize
    const sum = embedding.reduce((a, b) => a + b, 0);
    return embedding.map(val => sum > 0 ? val / sum : 0);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async classifyIntent(query) {
    try {
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `You are an intent classifier for a luxury product recommendation system.
          Classify the user query into one of these categories:
          - product_search: User wants to find specific products
          - category_browse: User wants to browse a category
          - brand_inquiry: User is asking about a specific brand
          - price_inquiry: User is asking about pricing
          - comparison: User wants to compare products
          - general_help: User needs general assistance
          - non_product: User is asking about something not related to products (greetings, casual conversation, etc.)
          
          Examples:
          - "how are you?" -> non_product
          - "hi there" -> non_product
          - "luxury bags" -> product_search
          - "show me watches" -> category_browse
          
          Return only the category name.`
        },
        {
          role: 'user',
          content: query
        }
      ], {
        model: 'primary',
        temperature: 0
      });

      const intent = response.choices[0].message.content.trim().toLowerCase();
      return intent;
    } catch (error) {
      console.error('Error classifying intent:', error);
      return 'product_search';
    }
  }

  async searchProducts(query, context = {}) {
    await this.initialize();

    // Expand query with synonyms for better matching
    const expandedQueries = synonymService.expandQuery(query);
    const primaryQuery = query;
    
    // Performance optimization: Skip intent classification if we have explicit category context
    if (context.lastCategory && context.skipIntentClassification) {
      const products = await this.strictCategorySearch(context.lastCategory, context);
      // Ensure products is always an array
      const safeProducts = Array.isArray(products) ? products : [];
      return safeProducts.slice(0, 5);
    }

    const intent = await this.classifyIntent(query);
    console.log(`🎯 Intent classified as: ${intent}`);

    let products = [];

    if (intent === 'non_product') {
      // For searchProducts, return no products for non-product intents
      return [];
    } else if (intent === 'product_search' || intent === 'category_browse') {
      // Use strict category search for better filtering (with synonym expansion)
      products = await this.strictCategorySearch(query, { ...context, expandedQueries });
    } else if (intent === 'brand_inquiry') {
      // Search by brand (with synonyms)
      products = await this.searchByBrand(query);
    } else if (intent === 'price_inquiry') {
      // Search by price range
      products = await this.searchByPrice(query);
    } else {
      // Fallback to text search - use catalog if DB unavailable
      const dbProducts = vectorDB.searchProducts(query);
      if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
        products = dbProducts;
      } else {
        products = await this.searchProductsInCatalog(query);
      }
    }

    // Ensure products is always an array before slicing
    const safeProducts = Array.isArray(products) ? products : [];
    return safeProducts.slice(0, 5); // Return top 5 results
  }

  handleNonProductQuery(query) {
    const queryLower = query.toLowerCase();
    
    // Handle greetings and casual conversation
    if (queryLower.includes('hello') || queryLower.includes('hi') || 
        queryLower.includes('hey') || queryLower.includes('how are you') ||
        queryLower.includes('how are you doing') || queryLower.includes('what\'s up')) {
      return {
        opening: "Hello! I'm doing great, thank you for asking! 😊 I'm here to help you find the perfect luxury products. What would you like to explore today?",
        items: [],
        cta: "I can help you discover luxury handbags, watches, jewelry, skincare, and wellness products.",
        quick_replies: ["Show me handbags", "Browse watches", "Explore jewelry", "View all products"]
      };
    }
    
    // Handle other non-product queries
    return {
      opening: "I'm here to help you find luxury products! I specialize in high-end fashion, watches, jewelry, skincare, and wellness items.",
      items: [],
      cta: "What type of luxury products are you interested in?",
      quick_replies: ["Luxury handbags", "Premium watches", "Fine jewelry", "Show me everything"]
    };
  }

  async strictCategorySearch(query, context) {
    const queryLower = query.toLowerCase();
    const allProducts = await this.getAllProducts(); // Use helper method with fallback (now async)
    const debug = process.env.DEBUG_RAG === 'true';
    
    // Ensure allProducts is an array
    const safeProducts = Array.isArray(allProducts) ? allProducts : [];
    
    // Priority: Use explicit category from context if provided (performance optimization)
    let targetCategory = context?.lastCategory || null;
    
    // Fallback: Determine target category from query if not in context
    // IMPORTANT: Check jewelry first (before watches) since "watch" might appear in other contexts
    if (!targetCategory) {
      if (queryLower.includes('jewelry') || queryLower.includes('jewellery') || queryLower.includes('necklace') || queryLower.includes('ring') || queryLower.includes('bracelet') || queryLower.includes('earring') || queryLower.includes('earrings') || queryLower.includes('explore jewelry')) {
        targetCategory = 'jewelry';
      } else if (queryLower.includes('handbag') || queryLower.includes('bag') || queryLower.includes('purse') || queryLower.includes('tote') || queryLower.includes('clutch') || queryLower.includes('crossbody') || queryLower.includes('satchel')) {
        targetCategory = 'handbags';
      } else if (queryLower.includes('watch') || queryLower.includes('timepiece') || queryLower.includes('browse watches')) {
        targetCategory = 'watches';
      } else if (queryLower.includes('skincare') || queryLower.includes('skin care') || queryLower.includes('skin') || queryLower.includes('treatment') || queryLower.includes('serum') || queryLower.includes('essence') || queryLower.includes('moisturizer') || queryLower.includes('cream')) {
        targetCategory = 'skincare';
      } else if (queryLower.includes('wellness') || queryLower.includes('health') || queryLower.includes('spa') || queryLower.includes('relaxation')) {
        targetCategory = 'wellness';
      }
    }
    if (debug) console.log('[RAG] strictCategorySearch', { query, targetCategory, all: safeProducts?.length });
    
    // First filter by category if we have a target category
    let filteredProducts = safeProducts;
    if (targetCategory) {
      filteredProducts = safeProducts.filter(product => {
        // Safety check - skip products with missing required fields
        if (!product || !product.title) {
          return false;
        }
        
        // Safely parse category - handle both string and already parsed
        let categoryArray;
        try {
          categoryArray = typeof product.category === 'string' 
            ? JSON.parse(product.category) 
            : (Array.isArray(product.category) ? product.category : []);
        } catch (e) {
          categoryArray = [];
        }
        const productCategories = categoryArray.join(' ').toLowerCase();
        const title = (product.title || '').toLowerCase();
        
        // Strict category matching
        if (targetCategory === 'handbags') {
          // Relax requirement: accept common handbag synonyms in categories or title
          return (
            productCategories.includes('bag') ||
            productCategories.includes('handbag') ||
            productCategories.includes('tote') ||
            title.includes('bag') ||
            title.includes('handbag') ||
            title.includes('tote') ||
            title.includes('purse') ||
            title.includes('clutch')
          );
        } else if (targetCategory === 'watches') {
          return productCategories.includes('watch') || title.includes('watch') || title.includes('timepiece');
        } else if (targetCategory === 'jewelry') {
          return productCategories.includes('jewelry') || title.includes('necklace') || title.includes('ring') || title.includes('bracelet') || title.includes('earring');
        } else if (targetCategory === 'skincare') {
          return productCategories.includes('skincare') || title.includes('skin') || title.includes('treatment') || title.includes('serum') || title.includes('essence') || title.includes('moisturizer') || title.includes('cream');
        } else if (targetCategory === 'wellness') {
          return productCategories.includes('wellness') || title.includes('spa') || title.includes('relaxation') || title.includes('candle') || title.includes('bath');
        }
        return false;
      });
      if (debug) console.log('[RAG] after strict filter', { count: filteredProducts.length });
    }
    
    // If no products found with strict filtering, fall back to broader search
    if (filteredProducts.length === 0) {
      filteredProducts = safeProducts;
      if (debug) console.log('[RAG] fallback to all products');
    }
    
    // Score the filtered products
    const scoredProducts = filteredProducts.map(product => {
      // Safety check
      if (!product || !product.title || !product.brand) {
        return { ...product, score: 0 };
      }
      
      let score = 0;
      const title = (product.title || '').toLowerCase();
      const brand = (product.brand || '').toLowerCase();
      
      // Safely parse category
      let category = '';
      try {
        const catArray = typeof product.category === 'string' 
          ? JSON.parse(product.category) 
          : (Array.isArray(product.category) ? product.category : []);
        category = catArray.join(' ').toLowerCase();
      } catch (e) {
        category = '';
      }
      
      const description = (product.description || '').toLowerCase();
      
      // Category-specific scoring (higher weight for matching categories)
      if (targetCategory === 'handbags') {
        if (category.includes('bag') || category.includes('handbag') || category.includes('tote')) score += 20;
        if (title.includes('bag') || title.includes('handbag') || title.includes('tote') || title.includes('purse') || title.includes('clutch')) score += 15;
      } else if (targetCategory === 'watches') {
        if (category.includes('watch')) score += 20;
        if (title.includes('watch') || title.includes('timepiece')) score += 15;
      } else if (targetCategory === 'jewelry') {
        if (category.includes('jewelry')) score += 20;
        if (title.includes('jewelry') || title.includes('jewellery') || title.includes('necklace') || title.includes('ring') || title.includes('bracelet') || title.includes('earring')) score += 15;
      } else if (targetCategory === 'skincare') {
        if (category.includes('skincare')) score += 20;
        if (title.includes('skincare') || title.includes('skin') || title.includes('treatment') || title.includes('serum') || title.includes('essence') || title.includes('moisturizer') || title.includes('cream')) score += 15;
      } else if (targetCategory === 'wellness') {
        if (category.includes('wellness')) score += 20;
        if (title.includes('wellness') || title.includes('health') || title.includes('spa') || title.includes('relaxation') || title.includes('candle') || title.includes('bath')) score += 15;
      }
      
      // General matching (with synonym expansion)
      const expandedQueries = context.expandedQueries || [queryLower];
      
      expandedQueries.forEach(expandedQuery => {
        if (title.includes(expandedQuery)) score += 10;
        if (brand.includes(expandedQuery)) score += 8;
        if (category.includes(expandedQuery)) score += 6;
        if (description.includes(expandedQuery)) score += 4;
      });
      
      // Word-by-word matching with synonyms
      const queryWords = queryLower.split(/\s+/);
      queryWords.forEach(word => {
        // Check exact match
        if (title.includes(word)) score += 3;
        if (brand.includes(word)) score += 2;
        if (category.includes(word)) score += 1;
        
        // Check synonym matches
        const synonyms = synonymService.getSynonyms(word);
        synonyms.forEach(synonym => {
          if (synonym !== word) { // Don't double-count
            if (title.includes(synonym)) score += 2; // Slightly less than exact match
            if (brand.includes(synonym)) score += 1.5;
            if (category.includes(synonym)) score += 0.5;
          }
        });
      });
      
      // Apply synonym service score enhancement
      score = synonymService.enhanceScore(product, queryLower, score);
      
      // Context boost
      if (context.lastCategory) {
        let productCategories;
        try {
          productCategories = typeof product.category === 'string'
            ? JSON.parse(product.category)
            : (Array.isArray(product.category) ? product.category : []);
        } catch (e) {
          productCategories = [];
        }
        if (productCategories.some(cat => cat.toLowerCase().includes(context.lastCategory.toLowerCase()))) {
          score += 2;
        }
      }
      
      // Rating boost
      score += (product.rating || 0) * 0.5;
      
      return { ...product, score };
    });

    return scoredProducts
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  async semanticSearch(query, context) {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Priority 1: Try Pinecone (best performance for vector search)
      if (pineconeVectorDB.isAvailable()) {
        try {
          const pineconeResults = await pineconeVectorDB.vectorSearch(queryEmbedding, 5);
          if (pineconeResults && pineconeResults.length > 0) {
            console.log('✅ Using Pinecone vector search');
            // Fetch full product data from Turso using product IDs
            const productIds = pineconeResults.map(r => r.productId);
            const allProducts = await this.getAllProducts();
            const products = productIds.map(id => allProducts.find(p => p.id == id || p.sku === id)).filter(Boolean);
            return products.map((product, index) => ({
              ...product,
              similarity: pineconeResults[index]?.similarity || 0
            }));
          }
        } catch (error) {
          console.warn('⚠️ Pinecone vector search failed, trying Turso:', error.message);
        }
      }
      
      // Priority 2: Try vector search from Turso (if available)
      if (tursoVectorDB.isAvailable()) {
        try {
          const vectorResults = await tursoVectorDB.vectorSearch(queryEmbedding, 5);
          if (vectorResults && vectorResults.length > 0) {
            console.log('✅ Using Turso vector search');
            return vectorResults;
          }
        } catch (error) {
          console.warn('⚠️ Turso vector search failed, trying fallback:', error.message);
        }
      }
      
      // Fallback: Manual semantic search with SQLite or catalog
      const allProducts = await this.getAllProducts();
      const scoredProducts = [];
      
      // Check if we have embeddings (try SQLite first)
      let hasEmbeddings = false;
      for (const product of allProducts) {
        let embeddings = [];
        
        // Try to get embeddings from SQLite (local)
        try {
          embeddings = vectorDB.getEmbeddings(product.id);
        } catch (e) {
          // SQLite not available or no embeddings
        }
        
        // Try Turso embeddings if SQLite had none
        if (embeddings.length === 0 && tursoVectorDB.isAvailable()) {
          try {
            embeddings = await tursoVectorDB.getEmbeddings(product.id);
          } catch (e) {
            // Turso embeddings not available
          }
        }
        
        if (embeddings.length === 0) continue;
        hasEmbeddings = true;

        // Calculate similarity score
        let maxSimilarity = 0;
        for (const embedding of embeddings) {
          const similarity = this.cosineSimilarity(queryEmbedding, embedding.embedding);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }

        // Apply context filtering
        let contextScore = 1;
        if (context.lastCategory) {
          let productCategories;
          try {
            productCategories = typeof product.category === 'string'
              ? JSON.parse(product.category)
              : (Array.isArray(product.category) ? product.category : []);
          } catch (e) {
            productCategories = [];
          }
          if (productCategories.some(cat => cat.toLowerCase().includes(context.lastCategory.toLowerCase()))) {
            contextScore = 1.2; // Boost score for context-relevant products
          }
        }

        scoredProducts.push({
          ...product,
          similarity: maxSimilarity * contextScore
        });
      }

      // If no embeddings available, fall back to catalog search
      if (!hasEmbeddings) {
        console.warn('⚠️ No embeddings available, falling back to catalog search');
        const catalogProducts = await this.searchProductsInCatalog(query);
        const safeProducts = Array.isArray(catalogProducts) ? catalogProducts : [];
        return safeProducts.slice(0, 5);
      }

      // Sort by similarity score
      const safeProducts = Array.isArray(scoredProducts) ? scoredProducts : [];
      return safeProducts
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
        .slice(0, 5);

    } catch (error) {
      console.error('Error in semantic search:', error);
      const dbProducts = vectorDB.searchProducts(query);
      return Array.isArray(dbProducts) ? dbProducts : [];
    }
  }

  async searchByBrand(query) {
    const allProducts = await this.getAllProducts(); // Use helper method with fallback (now async)
    const queryLower = query.toLowerCase();
    const safeProducts = Array.isArray(allProducts) ? allProducts : [];
    
    return safeProducts.filter(product => 
      product.brand && product.brand.toLowerCase().includes(queryLower)
    ).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  async searchByPrice(query) {
    // Extract price range from query
    const priceMatch = query.match(/(\d+)\s*-\s*(\d+)/);
    if (priceMatch) {
      const minPrice = parseInt(priceMatch[1]);
      const maxPrice = parseInt(priceMatch[2]);
      
      const allProducts = await this.getAllProducts(); // Use helper method with fallback (now async)
      const safeProducts = Array.isArray(allProducts) ? allProducts : [];
      return safeProducts.filter(product => {
        const price = typeof product.price === 'object' ? product.price.amount : product.price;
        return price >= minPrice && price <= maxPrice;
      }).sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      });
    }
    
    // Fallback to text search
    const catalogProducts = await this.searchProductsInCatalog(query);
    return Array.isArray(catalogProducts) ? catalogProducts : [];
  }

  // Search products in catalog when database is unavailable
  async searchProductsInCatalog(query) {
    const queryLower = query.toLowerCase();
    const allProducts = await this.getAllProducts();
    
    return allProducts.filter(product => {
      const title = product.title.toLowerCase();
      const description = (product.description || '').toLowerCase();
      const brand = product.brand.toLowerCase();
      const category = typeof product.category === 'string' 
        ? product.category 
        : JSON.stringify(product.category || []).toLowerCase();
      const tags = typeof product.tags === 'string'
        ? product.tags
        : JSON.stringify(product.tags || []).toLowerCase();
      
      return title.includes(queryLower) ||
             description.includes(queryLower) ||
             brand.includes(queryLower) ||
             category.includes(queryLower) ||
             tags.includes(queryLower);
    }).sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    });
  }

  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async generateResponse(query, products, context = {}, generationOptions = {}) {
    try {
      const productList = products.map(p => {
        // Handle different price formats
        let priceAmount = 0;
        let priceCurrency = 'AED';
        
        if (typeof p.price === 'object' && p.price !== null) {
          priceAmount = p.price.amount || 0;
          priceCurrency = p.price.currency || 'AED';
        } else if (typeof p.price === 'number') {
          priceAmount = p.price;
          priceCurrency = p.currency || 'AED';
        }
        
        const formattedPrice = `${priceAmount} ${priceCurrency}`;
        
        return {
          title: p.title,
          brand: p.brand,
          price: formattedPrice,
          description: p.description,
          category: typeof p.category === 'string' ? JSON.parse(p.category) : p.category
        };
      });

      // Build conversation history context if available
      const conversationHistory = context.conversationHistory || [];
      const previousInterests = context.previousInterests || [];
      const customerName = context.customerName;
      const lastCategory = context.lastCategory;
      
      // Build personalized greeting if customer name is available
      const nameGreeting = customerName ? ` ${customerName}` : '';
      
      // Build context awareness notes
      let contextNotes = '';
      if (previousInterests.length > 0 && lastCategory && previousInterests.includes(lastCategory)) {
        contextNotes = `\n\nCONTEXT: The user has shown interest in ${previousInterests.join(', ')} before. They're currently exploring ${lastCategory}.`;
      } else if (previousInterests.length > 0) {
        contextNotes = `\n\nCONTEXT: The user has previously shown interest in: ${previousInterests.join(', ')}.`;
      }
      
      if (conversationHistory.length > 0) {
        const recentContext = conversationHistory.slice(-3).map(m => 
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n');
        contextNotes += `\n\nRECENT CONVERSATION:\n${recentContext}\n\nUse this context to make your response more natural and context-aware. Reference previous interactions when relevant, but keep it subtle and human-like.`;
      }

      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `You are a luxury shopping assistant for a high-end boutique in Dubai.
          Generate a natural, engaging, and context-aware response that:
          1. ACKNOWLEDGES the user's specific query in the opening message (e.g., if they asked for "bags", say "Here are some bags for you:" or "I've found some beautiful bags:")
          2. Uses natural, conversational language that reflects what the user asked for
          3. References previous conversation context when relevant (e.g., "As you were interested in..." or "Building on our earlier conversation...")
          4. Uses the customer's name${nameGreeting ? ` (${customerName})` : ''} naturally when appropriate, but don't overuse it
          5. Presents the recommended products in an appealing way
          6. Uses the EXACT prices provided in the product data (already formatted as "amount AED")
          7. Provides context-appropriate quick replies
          8. Maintains a luxury, personalized, and friendly tone
          9. Sounds like a real human conversation - references previous interactions naturally
          
          IMPORTANT RULES FOR OPENING MESSAGE:
          - CRITICAL: The opening message MUST match the user's query. If they ask for "skincare", the opening MUST mention skincare, not watches or bags
          - If the user asks for "bags" or "handbags", say something like "Here are some beautiful bags for you:" or "I've curated some luxury handbags for you:"
          - If they ask for "watches", say "Here are some exquisite watches:" or "I found some stunning timepieces for you:"
          - If they ask for "skincare" or "skin care", say "Here are some premium skincare products:" or "I've selected some luxury skincare items for you:"
          - Match the user's language and tone - be natural and conversational
          - Reference previous interests naturally when switching categories (e.g., "I see you're also interested in..." or "While you were looking at watches earlier...")
          - Never use generic phrases like "Here are some luxury products I found for you:" when the user was specific
          - NEVER use an opening about a different product category than what the user asked for (e.g., don't say "watches" if they asked for "skincare")
          - Double-check that your opening message matches the category of products you're showing
          - DO NOT use trailing ellipsis (...) - keep responses complete and natural, like a human would write
          - Sound human and conversational - avoid robotic phrases like "Let me find..." or "Discovering..." at the start
          - If context shows previous interests, subtly acknowledge them (e.g., "I see you're exploring different categories today" or "Building on your interest in luxury items...")
          
          Format your response as JSON with:
          - opening: Natural, context-aware welcome message that reflects the user's query and optionally references previous context
          - items: Array of product recommendations
          - cta: Call to action
          - quick_replies: Array of 3 quick reply options
          
          Each item should have: headline, price (use the exact price from product data), one_liner, image (emoji)
          IMPORTANT: Use the exact price format provided in the product data. Do not modify or reformat prices.
          For one_liner: Provide a descriptive, engaging product description (up to 200 characters). Include key features and benefits to help customers make informed decisions.`
        },
        {
          role: 'user',
          content: `User Query: "${query}"${nameGreeting ? `\nCustomer Name: ${customerName}` : ''}${contextNotes}
          
          Products to recommend (use EXACT price format):
          ${productList.map(p => `- ${p.title} by ${p.brand} - ${p.price} - ${p.description}`).join('\n')}
          
          Generate a natural, context-aware response. The opening message should acknowledge what the user specifically asked for. Use the conversation context to make references to previous interactions when relevant, but keep it natural and human-like. For example, if they asked for "bags", start with "Here are some bags for you:" or similar natural phrasing that matches their query.`
        }
      ], {
        model: this.pickNlgModel(query, productList, generationOptions),
        temperature: generationOptions.temperature ?? 0.7,
        provider: process.env.LLM_PROVIDER_NLG || null,
        modelName: generationOptions.modelName || null
      });

      const content = response.choices[0].message.content;
      try {
        const parsed = JSON.parse(content);
        
        // Validate and fix the opening message to match the query context
        if (parsed.opening) {
          const queryLower = query.toLowerCase();
          const openingLower = parsed.opening.toLowerCase();
          
          // If opening doesn't match query context, regenerate it
          if (queryLower.includes('bag') || queryLower.includes('handbag')) {
            if (!openingLower.includes('bag') && !openingLower.includes('handbag')) {
              parsed.opening = "Here are some beautiful bags for you:";
            }
          } else if (queryLower.includes('jewelry') || queryLower.includes('jewellery') || queryLower.includes('explore jewelry')) {
            if (!openingLower.includes('jewelry') && !openingLower.includes('jewellery')) {
              parsed.opening = "Here are some stunning jewelry pieces for you:";
            }
          } else if (queryLower.includes('watch') || queryLower.includes('timepiece') || queryLower.includes('browse watches')) {
            if (!openingLower.includes('watch') && !openingLower.includes('timepiece')) {
              parsed.opening = "Here are some exquisite watches for you:";
            }
          } else if (queryLower.includes('skincare') || queryLower.includes('skin care') || queryLower.includes('beauty')) {
            if (!openingLower.includes('skincare') && !openingLower.includes('skin') && !openingLower.includes('beauty')) {
              parsed.opening = "Here are some premium skincare products for you:";
            }
          } else if (queryLower.includes('wellness')) {
            if (!openingLower.includes('wellness')) {
              parsed.opening = "Here are some wellness products for you:";
            }
          } else if (queryLower.includes('fragrance') || queryLower.includes('perfume')) {
            if (!openingLower.includes('fragrance') && !openingLower.includes('perfume')) {
              parsed.opening = "Here are some luxury fragrances for you:";
            }
          }
        }
        
        // Fix prices in the response
        if (parsed.items && Array.isArray(parsed.items)) {
          parsed.items = parsed.items.map((item, index) => {
            if (products[index]) {
              const p = products[index];
              let priceAmount = 0;
              let priceCurrency = 'AED';
              
              if (typeof p.price === 'object' && p.price !== null) {
                priceAmount = p.price.amount || 0;
                priceCurrency = p.price.currency || 'AED';
              } else if (typeof p.price === 'number') {
                priceAmount = p.price;
                priceCurrency = p.currency || 'AED';
              }
              
              return {
                ...item,
                price: `${priceAmount} ${priceCurrency}`,
                sku: p.sku || null,
                brand: p.brand || null
              };
            }
            return item;
          });
        }
        
        return parsed;
      } catch {
        // Fallback response - include query in context for better context-aware messages
        return this.generateFallbackResponse(products, { ...context, query });
      }
    } catch (error) {
      console.error('Error generating response:', error);
      // Fallback response - include query in context for better context-aware messages
      return this.generateFallbackResponse(products, { ...context, query });
    }
  }

  pickNlgModel(query, productList, generationOptions) {
    if (generationOptions.model === 'primary' || generationOptions.model === 'versatile') {
      return generationOptions.model;
    }
    const qLen = (query || '').length;
    const count = productList.length;
    const complex = qLen > 40 || count >= 3;
    return complex ? 'versatile' : 'primary';
  }

  generateFallbackResponse(products, context) {
    // Generate context-aware opening
    let opening = "Here are some luxury products I found for you:";
    
    if (context.lastCategory) {
      const category = context.lastCategory.toLowerCase();
      if (category.includes('bag') || category.includes('handbag')) {
        opening = "Here are some beautiful bags for you:";
      } else if (category.includes('watch')) {
        opening = "Here are some exquisite watches for you:";
      } else if (category.includes('jewelry') || category.includes('jewellery')) {
        opening = "Here are some stunning jewelry pieces for you:";
      } else if (category.includes('skincare') || category.includes('beauty')) {
        opening = "Here are some premium skincare products for you:";
      } else if (category.includes('wellness')) {
        opening = "Here are some wellness products for you:";
      } else {
        opening = `Here are some ${context.lastCategory} products for you:`;
      }
    } else if (context.query) {
      const query = context.query.toLowerCase();
      if (query.includes('bag') || query.includes('handbag')) {
        opening = "Here are some beautiful bags for you:";
      } else if (query.includes('watch') || query.includes('timepiece')) {
        opening = "Here are some exquisite watches for you:";
      } else if (query.includes('jewelry') || query.includes('jewellery')) {
        opening = "Here are some stunning jewelry pieces for you:";
      } else if (query.includes('skincare') || query.includes('beauty')) {
        opening = "Here are some premium skincare products for you:";
      } else if (query.includes('wellness')) {
        opening = "Here are some wellness products for you:";
      } else if (query.includes('fragrance') || query.includes('perfume')) {
        opening = "Here are some luxury fragrances for you:";
      }
    }

    // Ensure products is an array
    const safeProducts = Array.isArray(products) ? products : [];
    const items = safeProducts.slice(0, 3).map((product, index) => {
      let priceAmount = 0;
      let priceCurrency = 'AED';
      
      if (typeof product.price === 'object' && product.price !== null) {
        priceAmount = product.price.amount || 0;
        priceCurrency = product.price.currency || 'AED';
      } else if (typeof product.price === 'number') {
        priceAmount = product.price;
        priceCurrency = product.currency || 'AED';
      }
      
      return {
        headline: product.title,
        price: `${priceAmount} ${priceCurrency}`,
        one_liner: product.description || 'Luxury product',
        image: '🛍️',
        sku: product.sku || null,
        brand: product.brand || null
      };
    });

    return {
      opening,
      items,
      cta: "Which product interests you most?",
      quick_replies: [
        "Show me more products",
        "View different category", 
        "Get help"
      ]
    };
  }
}

export const enhancedRAGService = new EnhancedRAGService();
export default enhancedRAGService;

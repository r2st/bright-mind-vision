import { llmProvider } from './llmProvider.js';
import { vectorDB } from './sqliteVectorDB.js';
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
      console.log(`✅ Enhanced RAG Service initialized with ${vectorDB.getProductCount()} products`);
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
    // Get all existing SKUs from database
    const existingProducts = vectorDB.getAllProducts();
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

    // Performance optimization: Skip intent classification if we have explicit category context
    if (context.lastCategory && context.skipIntentClassification) {
      const products = await this.strictCategorySearch(context.lastCategory, context);
      return products.slice(0, 5);
    }

    const intent = await this.classifyIntent(query);
    console.log(`🎯 Intent classified as: ${intent}`);

    let products = [];

    if (intent === 'non_product') {
      // For searchProducts, return no products for non-product intents
      return [];
    } else if (intent === 'product_search' || intent === 'category_browse') {
      // Use strict category search for better filtering
      products = await this.strictCategorySearch(query, context);
    } else if (intent === 'brand_inquiry') {
      // Search by brand
      products = await this.searchByBrand(query);
    } else if (intent === 'price_inquiry') {
      // Search by price range
      products = await this.searchByPrice(query);
    } else {
      // Fallback to text search
      products = vectorDB.searchProducts(query);
    }

    return products.slice(0, 5); // Return top 5 results
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
    const allProducts = vectorDB.getAllProducts();
    const debug = process.env.DEBUG_RAG === 'true';
    
    // Priority: Use explicit category from context if provided (performance optimization)
    let targetCategory = context?.lastCategory || null;
    
    // Fallback: Determine target category from query if not in context
    if (!targetCategory) {
      if (queryLower.includes('handbag') || queryLower.includes('bag') || queryLower.includes('purse') || queryLower.includes('tote') || queryLower.includes('clutch') || queryLower.includes('crossbody') || queryLower.includes('satchel')) {
        targetCategory = 'handbags';
      } else if (queryLower.includes('watch') || queryLower.includes('timepiece')) {
        targetCategory = 'watches';
      } else if (queryLower.includes('jewelry') || queryLower.includes('jewellery') || queryLower.includes('necklace') || queryLower.includes('ring') || queryLower.includes('bracelet') || queryLower.includes('earring') || queryLower.includes('earrings')) {
        targetCategory = 'jewelry';
      } else if (queryLower.includes('skincare') || queryLower.includes('skin') || queryLower.includes('treatment') || queryLower.includes('serum') || queryLower.includes('essence') || queryLower.includes('moisturizer') || queryLower.includes('cream')) {
        targetCategory = 'skincare';
      } else if (queryLower.includes('wellness') || queryLower.includes('health') || queryLower.includes('spa') || queryLower.includes('relaxation')) {
        targetCategory = 'wellness';
      }
    }
    if (debug) console.log('[RAG] strictCategorySearch', { query, targetCategory, all: allProducts?.length });
    
    // First filter by category if we have a target category
    let filteredProducts = allProducts;
    if (targetCategory) {
      filteredProducts = allProducts.filter(product => {
        const productCategories = JSON.parse(product.category).join(' ').toLowerCase();
        const title = product.title.toLowerCase();
        
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
      filteredProducts = allProducts;
      if (debug) console.log('[RAG] fallback to all products');
    }
    
    // Score the filtered products
    const scoredProducts = filteredProducts.map(product => {
      let score = 0;
      const title = product.title.toLowerCase();
      const brand = product.brand.toLowerCase();
      const category = JSON.parse(product.category).join(' ').toLowerCase();
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
      
      // General matching
      if (title.includes(queryLower)) score += 10;
      if (brand.includes(queryLower)) score += 8;
      if (category.includes(queryLower)) score += 6;
      if (description.includes(queryLower)) score += 4;
      
      // Word-by-word matching
      const queryWords = queryLower.split(/\s+/);
      queryWords.forEach(word => {
        if (title.includes(word)) score += 3;
        if (brand.includes(word)) score += 2;
        if (category.includes(word)) score += 1;
      });
      
      // Context boost
      if (context.lastCategory) {
        const productCategories = JSON.parse(product.category);
        if (productCategories.some(cat => cat.toLowerCase().includes(context.lastCategory.toLowerCase()))) {
          score += 2;
        }
      }
      
      // Rating boost
      score += product.rating * 0.5;
      
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
      
      // Get all products with embeddings
      const allProducts = vectorDB.getAllProducts();
      const scoredProducts = [];

      for (const product of allProducts) {
        const embeddings = vectorDB.getEmbeddings(product.id);
        if (embeddings.length === 0) continue;

        // Calculate similarity score
        let maxSimilarity = 0;
        for (const embedding of embeddings) {
          const similarity = this.cosineSimilarity(queryEmbedding, embedding.embedding);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }

        // Apply context filtering
        let contextScore = 1;
        if (context.lastCategory) {
          const productCategories = JSON.parse(product.category);
          if (productCategories.some(cat => cat.toLowerCase().includes(context.lastCategory.toLowerCase()))) {
            contextScore = 1.2; // Boost score for context-relevant products
          }
        }

        scoredProducts.push({
          ...product,
          similarity: maxSimilarity * contextScore
        });
      }

      // Sort by similarity score
      return scoredProducts
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

    } catch (error) {
      console.error('Error in semantic search:', error);
      return vectorDB.searchProducts(query);
    }
  }

  async searchByBrand(query) {
    const allProducts = vectorDB.getAllProducts();
    const queryLower = query.toLowerCase();
    
    return allProducts.filter(product => 
      product.brand.toLowerCase().includes(queryLower)
    ).sort((a, b) => b.rating - a.rating);
  }

  async searchByPrice(query) {
    // Extract price range from query
    const priceMatch = query.match(/(\d+)\s*-\s*(\d+)/);
    if (priceMatch) {
      const minPrice = parseInt(priceMatch[1]);
      const maxPrice = parseInt(priceMatch[2]);
      
      const allProducts = vectorDB.getAllProducts();
      return allProducts.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      ).sort((a, b) => b.rating - a.rating);
    }
    
    return vectorDB.searchProducts(query);
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

      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `You are a luxury shopping assistant for a high-end boutique in Dubai.
          Generate a natural, engaging response that:
          1. Acknowledges the user's query
          2. Presents the recommended products in an appealing way
          3. Uses the EXACT prices provided in the product data (already formatted as "amount AED")
          4. Provides context-appropriate quick replies
          5. Maintains a luxury, personalized tone
          
          Format your response as JSON with:
          - opening: Welcome message
          - items: Array of product recommendations
          - cta: Call to action
          - quick_replies: Array of 3 quick reply options
          
          Each item should have: headline, price (use the exact price from product data), one_liner, image (emoji)
          IMPORTANT: Use the exact price format provided in the product data. Do not modify or reformat prices.
          For one_liner: Provide a descriptive, engaging product description (up to 200 characters). Include key features and benefits to help customers make informed decisions.`
        },
        {
          role: 'user',
          content: `Query: "${query}"
          Context: ${JSON.stringify(context)}
          
          Products to recommend (use EXACT price format):
          ${productList.map(p => `- ${p.title} by ${p.brand} - ${p.price} - ${p.description}`).join('\n')}
          
          Generate a response using these products with their exact prices.`
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
                price: `${priceAmount} ${priceCurrency}`
              };
            }
            return item;
          });
        }
        
        return parsed;
      } catch {
        // Fallback response
        return this.generateFallbackResponse(products, context);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateFallbackResponse(products, context);
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
    const opening = context.lastCategory 
      ? `Here are some ${context.lastCategory} products for you:`
      : "Here are some luxury products I found for you:";

    const items = products.slice(0, 3).map((product, index) => {
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
        image: '🛍️'
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

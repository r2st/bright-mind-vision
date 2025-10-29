import Groq from 'groq-sdk';
import { vectorDB } from './sqliteVectorDB.js';
import { normalizedProductCatalog } from '../data/normalizedProductCatalog.js';

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

/**
 * Optimized RAG Service with Fast Performance
 * Uses simplified embeddings and caching for speed
 */
class OptimizedRAGService {
  constructor() {
    this.models = {
      primary: 'llama-3.1-8b-instant',
      versatile: 'llama-3.3-70b-versatile'
    };
    this.initialized = false;
    this.cache = new Map();
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Populate database with products if empty
      const productCount = vectorDB.getProductCount();
      if (productCount === 0) {
        console.log('📦 Populating vector database with products...');
        await this.populateDatabase();
      }
      
      this.initialized = true;
      console.log('✅ Optimized RAG Service initialized');
    } catch (error) {
      console.error('❌ Optimized RAG Service initialization failed:', error);
    }
  }

  async populateDatabase() {
    for (const product of normalizedProductCatalog) {
      const productId = vectorDB.upsertProduct(product);
      if (productId) {
        // Generate simple embeddings for the product
        await this.generateAndStoreEmbeddings(productId, product);
      }
    }
    console.log(`✅ Populated database with ${normalizedProductCatalog.length} products`);
  }

  async generateAndStoreEmbeddings(productId, product) {
    try {
      // Generate simple combined embedding
      const combinedText = `${product.title} ${product.brand} ${product.category.join(' ')} ${product.description || ''}`;
      const embedding = this.createSimpleEmbedding(combinedText);
      vectorDB.storeEmbedding(productId, 'combined', embedding);

    } catch (error) {
      console.error('Error generating embeddings for product:', product.sku, error);
    }
  }

  createSimpleEmbedding(text) {
    // Fast hash-based embedding
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(64).fill(0); // Smaller embedding for speed
    
    words.forEach(word => {
      const hash = this.simpleHash(word);
      const index = hash % 64;
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
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  async classifyIntent(query) {
    // Check cache first
    const cacheKey = `intent_${query}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await groq.chat.completions.create({
        model: this.models.primary,
        temperature: 0,
        max_tokens: 100,
        messages: [
          {
            role: 'system',
            content: `Classify this query as: product_search, category_browse, brand_inquiry, price_inquiry, non_product. Return only the category.`
          },
          {
            role: 'user',
            content: query
          }
        ]
      });

      const intent = response.choices[0].message.content.trim().toLowerCase();
      this.cache.set(cacheKey, intent);
      return intent;
    } catch (error) {
      console.error('Error classifying intent:', error);
      return 'product_search';
    }
  }

  async searchProducts(query, context = {}) {
    await this.initialize();

    const intent = await this.classifyIntent(query);
    console.log(`🎯 Intent: ${intent}`);

    if (intent === 'non_product') {
      return this.handleNonProductQuery(query);
    }

    // Fast text-based search with category filtering
    let products = await this.fastTextSearch(query, context);
    
    // Apply intent-specific filtering
    if (intent === 'brand_inquiry') {
      products = this.filterByBrand(products, query);
    } else if (intent === 'price_inquiry') {
      products = this.filterByPrice(products, query);
    }

    // Ensure products is an array and slice it
    if (Array.isArray(products)) {
      return products.slice(0, 5);
    } else {
      return [];
    }
  }

  async fastTextSearch(query, context) {
    const queryLower = query.toLowerCase();
    const allProducts = vectorDB.getAllProducts();
    
    const scoredProducts = allProducts.map(product => {
      let score = 0;
      const title = product.title.toLowerCase();
      const brand = product.brand.toLowerCase();
      const category = JSON.parse(product.category).join(' ').toLowerCase();
      const description = (product.description || '').toLowerCase();
      
      // Title match gets highest score
      if (title.includes(queryLower)) score += 10;
      
      // Brand match
      if (brand.includes(queryLower)) score += 8;
      
      // Category match
      if (category.includes(queryLower)) score += 6;
      
      // Description match
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

  filterByBrand(products, query) {
    const queryLower = query.toLowerCase();
    const brandKeywords = ['chanel', 'hermes', 'louis vuitton', 'gucci', 'rolex', 'bulgari'];
    
    // Find the brand mentioned in the query
    const mentionedBrand = brandKeywords.find(brand => queryLower.includes(brand));
    
    if (mentionedBrand) {
      return products.filter(product => 
        product.brand.toLowerCase().includes(mentionedBrand)
      );
    }
    
    return products;
  }

  filterByPrice(products, query) {
    // Extract price range from query
    const priceMatch = query.match(/(\d+)\s*-\s*(\d+)/);
    if (priceMatch) {
      const minPrice = parseInt(priceMatch[1]);
      const maxPrice = parseInt(priceMatch[2]);
      return products.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      );
    }
    
    // Look for "under" or "below" keywords
    const underMatch = query.match(/under\s+(\d+)|below\s+(\d+)/i);
    if (underMatch) {
      const maxPrice = parseInt(underMatch[1] || underMatch[2]);
      return products.filter(product => product.price <= maxPrice);
    }
    
    return products;
  }

  handleNonProductQuery(query) {
    return [];
  }

  async generateResponse(query, products, context = {}) {
    try {
      // Handle non-product queries
      if (Array.isArray(products) && products.length === 0 && this.isNonProductQuery(query.toLowerCase())) {
        return {
          opening: "I'm a luxury shopping assistant focused on helping you find premium products. I can help you discover luxury handbags, watches, jewelry, skincare, and wellness items. What would you like to explore?",
          items: [],
          cta: "Let me know what luxury products you're interested in!",
          quick_replies: [
            "Luxury handbags",
            "Premium watches", 
            "Fine jewelry"
          ]
        };
      }
      
      // Fast response generation without LLM for speed
      if (products.length === 0) {
        return {
          opening: "I couldn't find any products matching your search. Let me help you explore our luxury collection!",
          items: [],
          cta: "What type of luxury products are you looking for?",
          quick_replies: [
            "Luxury handbags",
            "Premium watches",
            "Fine jewelry"
          ]
        };
      }

      const opening = this.generateOpening(query, products, context);
      const items = this.generateItems(products);
      const quickReplies = this.generateQuickReplies(context);

      return {
        opening,
        items,
        cta: "Which product interests you most?",
        quick_replies: quickReplies
      };

    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateFallbackResponse(products, context);
    }
  }

  generateOpening(query, products, context) {
    const category = this.detectCategory(products);
    
    if (context.lastCategory) {
      return `Here are some ${context.lastCategory} products for you:`;
    } else if (category) {
      return `Here are some luxury ${category} products I found for you:`;
    } else {
      return "Here are some luxury products I found for you:";
    }
  }

  generateItems(products) {
    return products.slice(0, 3).map((product, index) => ({
      headline: product.title,
      price: `${product.price} ${product.currency}`,
      one_liner: product.description?.substring(0, 60) + '...' || 'Luxury product',
      image: this.getCategoryEmoji(product.category)
    }));
  }

  generateQuickReplies(context) {
    if (context.lastCategory) {
      return [
        `More ${context.lastCategory}`,
        "Different category",
        "All products"
      ];
    }
    return [
      "Luxury handbags",
      "Premium watches", 
      "Fine jewelry"
    ];
  }

  detectCategory(products) {
    if (products.length === 0) return null;
    
    const categories = products.map(p => JSON.parse(p.category)[0]);
    const categoryCount = {};
    categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    return Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b
    );
  }

  getCategoryEmoji(categoryArray) {
    const category = categoryArray[0]?.toLowerCase();
    if (category?.includes('fashion') || category?.includes('bag')) return '👜';
    if (category?.includes('watch')) return '⌚';
    if (category?.includes('jewelry')) return '💎';
    if (category?.includes('skincare')) return '🧴';
    if (category?.includes('wellness')) return '🌿';
    return '🛍️';
  }

  generateFallbackResponse(products, context) {
    return {
      opening: "Here are some luxury products I found for you:",
      items: products.slice(0, 3).map(p => ({
        headline: p.title,
        price: `${p.price} ${p.currency}`,
        one_liner: p.description?.substring(0, 60) + '...' || 'Luxury product',
        image: '🛍️'
      })),
      cta: "Which product interests you most?",
      quick_replies: ["Show me more", "Different category", "Get help"]
    };
  }

  isNonProductQuery(query) {
    const nonProductKeywords = [
      'weather', 'time', 'date', 'news', 'sports', 'politics',
      'car', 'house', 'food', 'restaurant', 'hotel', 'travel',
      'hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye'
    ];
    return nonProductKeywords.some(keyword => query.includes(keyword));
  }
}

export const optimizedRAGService = new OptimizedRAGService();
export default optimizedRAGService;

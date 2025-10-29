import { optimizedRAGService } from './optimizedRAGService.js';

/**
 * Optimized Agent Orchestrator
 * Fast, efficient AI agent coordination with minimal LLM calls
 */
class OptimizedAgentOrchestrator {
  constructor() {
    this.cache = new Map();
  }

  async processQuery(query, context = {}) {
    try {
      console.log('⚡ Optimized Agent processing query:', query);

      // Step 1: Fast Intent Analysis
      const intent = await this.fastIntentAnalysis(query);
      console.log('🎯 Intent:', intent);

      // Step 2: Context Management
      const updatedContext = this.updateContext(query, context, intent);

      // Step 3: Handle non-product queries directly
      if (intent === 'non_product') {
        const response = {
          opening: "I'm doing great, thank you for asking! 😊 I'm here to help you find luxury products. I can help you discover luxury handbags, watches, jewelry, skincare, and wellness items. What would you like to explore today?",
          items: [],
          cta: "Let me know what luxury products you're interested in!",
          quick_replies: [
            "Luxury handbags",
            "Premium watches", 
            "Fine jewelry"
          ]
        };
        
        return {
          success: true,
          naturalResponse: response,
          metadata: {
            intent,
            context: updatedContext,
            productsFound: 0,
            timestamp: new Date().toISOString()
          }
        };
      }

      // Step 4: Product Search
      const products = await optimizedRAGService.searchProducts(query, updatedContext);
      console.log('🔍 Products found:', products.length);

      // Step 5: Response Generation
      const response = await optimizedRAGService.generateResponse(query, products, updatedContext);

      return {
        success: true,
        naturalResponse: response,
        metadata: {
          intent,
          context: updatedContext,
          productsFound: products.length,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Optimized Agent error:', error);
      return {
        success: false,
        error: error.message,
        naturalResponse: {
          opening: "I'm having trouble processing your request right now.",
          items: [],
          cta: "Please try again or ask me something else.",
          quick_replies: ["Try again", "Get help", "Start over"]
        }
      };
    }
  }

  async fastIntentAnalysis(query) {
    const cacheKey = `intent_${query}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Rule-based intent classification for speed
    const queryLower = query.toLowerCase();
    
    // Non-product queries
    if (this.isNonProductQuery(queryLower)) {
      this.cache.set(cacheKey, 'non_product');
      return 'non_product';
    }
    
    // Brand queries
    if (this.isBrandQuery(queryLower)) {
      this.cache.set(cacheKey, 'brand_inquiry');
      return 'brand_inquiry';
    }
    
    // Price queries
    if (this.isPriceQuery(queryLower)) {
      this.cache.set(cacheKey, 'price_inquiry');
      return 'price_inquiry';
    }
    
    // Category queries
    if (this.isCategoryQuery(queryLower)) {
      this.cache.set(cacheKey, 'category_browse');
      return 'category_browse';
    }
    
    // Default to product search
    this.cache.set(cacheKey, 'product_search');
    return 'product_search';
  }

  isNonProductQuery(query) {
    // First check if it's a product-related query (these should NOT be filtered out)
    const productKeywords = [
      'bag', 'handbag', 'watch', 'jewelry', 'skincare', 'skin', 'treatment', 'wellness',
      'luxury', 'product', 'shop', 'buy', 'purchase', 'suggest', 'show', 'recommend',
      'chanel', 'hermes', 'gucci', 'rolex', 'bulgari', 'la mer', 'sk-ii'
    ];
    
    // If query contains product keywords, it's NOT a non-product query
    if (productKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      return false;
    }
    
    // Now check for actual non-product queries
    const nonProductKeywords = [
      'weather', 'time', 'date', 'news', 'sports', 'politics',
      'car', 'house', 'food', 'restaurant', 'hotel', 'travel',
      'hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye',
      'how are you', 'how are you doing', 'what\'s up', 'whats up',
      'good morning', 'good afternoon', 'good evening', 'good night'
    ];
    return nonProductKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  isBrandQuery(query) {
    const luxuryBrands = [
      'chanel', 'hermes', 'louis vuitton', 'gucci', 'rolex', 'bulgari',
      'cartier', 'patek philippe', 'audemars piguet', 'la mer', 'sk-ii'
    ];
    return luxuryBrands.some(brand => query.includes(brand));
  }

  isPriceQuery(query) {
    const priceKeywords = [
      'under', 'below', 'less than', 'budget', 'affordable', 'cheap',
      'expensive', 'price', 'cost', 'aed', 'dollar', 'dirham'
    ];
    return priceKeywords.some(keyword => query.includes(keyword)) || 
           /\d+.*\d+/.test(query); // Contains number patterns
  }

  isCategoryQuery(query) {
    const categories = [
      'bags', 'handbags', 'watches', 'jewelry', 'skincare', 'wellness',
      'fashion', 'accessories', 'fragrance', 'perfume', 'cosmetics'
    ];
    return categories.some(category => query.includes(category));
  }

  updateContext(query, context, intent) {
    const updatedContext = { ...context };
    
    // Update last query
    updatedContext.lastQuery = query;
    updatedContext.timestamp = new Date().toISOString();
    
    // Update category based on intent and query
    if (intent === 'category_browse' || intent === 'product_search') {
      const detectedCategory = this.detectCategoryFromQuery(query);
      if (detectedCategory) {
        updatedContext.lastCategory = detectedCategory;
      }
    }
    
    return updatedContext;
  }

  detectCategoryFromQuery(query) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('bag') || queryLower.includes('handbag')) return 'bags';
    if (queryLower.includes('watch') || queryLower.includes('timepiece')) return 'watches';
    if (queryLower.includes('jewelry') || queryLower.includes('jewellery')) return 'jewelry';
    if (queryLower.includes('skincare') || queryLower.includes('skin')) return 'skincare';
    if (queryLower.includes('wellness') || queryLower.includes('health')) return 'wellness';
    
    return null;
  }

  async handleQuickReply(quickReplyNumber, context) {
    try {
      // Define specific queries for each quick reply
      const quickReplyQueries = {
        1: 'luxury handbags', // Always handbags for quick reply 1
        2: 'luxury watches',  // Always watches for quick reply 2
        3: 'luxury jewelry'   // Always jewelry for quick reply 3
      };

      const query = quickReplyQueries[quickReplyNumber] || 'luxury products';
      console.log(`🎯 Quick Reply ${quickReplyNumber}: "${query}"`);
      
      return await this.processQuery(query, context);
    } catch (error) {
      console.error('Quick reply handler error:', error);
      return {
        success: false,
        error: error.message,
        naturalResponse: {
          opening: "I'm having trouble processing that request.",
          items: [],
          cta: "Please try again.",
          quick_replies: ["Try again", "Get help", "Start over"]
        }
      };
    }
  }
}

export const optimizedAgentOrchestrator = new OptimizedAgentOrchestrator();
export default optimizedAgentOrchestrator;

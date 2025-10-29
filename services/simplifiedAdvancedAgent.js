// Simplified Advanced Multi-Agent System
import Groq from 'groq-sdk';
import { GROQ_CONFIG } from '../config/groq-config.js';
import { enhancedLuxuryProducts } from '../data/enhancedLuxuryProducts.js';

const groq = new Groq({ apiKey: GROQ_CONFIG.apiKey });

// Simplified State Management with Caching
class SimpleState {
  constructor() {
    this.userQuery = '';
    this.intent = null;
    this.products = [];
    this.recommendations = [];
    this.response = null;
    this.errors = [];
    this.metadata = {};
    this.cache = new Map();
  }
}

// Simple Cache for frequently accessed data
class SimpleCache {
  constructor(maxSize = 100, ttl = 300000) { // 5 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Global cache instance
const globalCache = new SimpleCache();

// Simplified Agent Base Class
class SimpleAgent {
  constructor(name, model = GROQ_CONFIG.models.primary) {
    this.name = name;
    this.model = model;
    this.groq = groq;
  }

  async callLLM(messages, temperature = 0.3) {
    try {
      const startTime = Date.now();
      const response = await this.groq.chat.completions.create({
        model: this.model,
        temperature,
        response_format: { type: 'json_object' },
        messages,
        max_tokens: 1000 // Limit tokens for faster response
      });
      
      const duration = Date.now() - startTime;
      console.log(`⚡ ${this.name} LLM call completed in ${duration}ms`);
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error(`${this.name} LLM call failed:`, error);
      // Return fallback response instead of throwing
      return this.getFallbackResponse();
    }
  }

  getFallbackResponse() {
    // Return appropriate fallback based on agent type
    if (this.name === 'IntentAgent') {
      return { intent: 'product_search', confidence: 0.5, entities: [] };
    }
    if (this.name === 'CurationAgent') {
      return { recommendations: [] };
    }
    if (this.name === 'ResponseAgent') {
      return { 
        opening: "Welcome to our luxury boutique! How can I help you today?",
        items: [],
        cta: "What would you like to explore?",
        quick_replies: ["View Products", "Get Help", "Contact Us"]
      };
    }
    return {};
  }
}

// 1. Intent Classification Agent
class SimpleIntentAgent extends SimpleAgent {
  constructor() {
    super('IntentAgent', GROQ_CONFIG.models.primary);
  }

  async execute(state) {
    console.log('🎯 IntentAgent: Classifying intent...');
    
    try {
      // Check cache first
      const cacheKey = `intent_${state.userQuery.toLowerCase()}`;
      const cachedResult = globalCache.get(cacheKey);
      
      if (cachedResult) {
        console.log('⚡ IntentAgent: Using cached result');
        state.intent = cachedResult;
        return state;
      }

      // Simple rule-based classification for common queries (faster than LLM)
      const query = state.userQuery.toLowerCase().trim();
      
      // Quick rule-based classification
      if (['hi', 'hello', 'hey', 'good morning', 'good afternoon'].includes(query)) {
        state.intent = { intent: 'greeting', confidence: 0.9, entities: [] };
      } else if (/^[1-9]$/.test(query)) {
        state.intent = { intent: 'quick_reply', confidence: 0.9, entities: [] };
      } else if (['help', 'what can you do', 'assistance'].includes(query)) {
        state.intent = { intent: 'help', confidence: 0.9, entities: [] };
      } else if (query.includes('car') || query.includes('house') || query.includes('food') || query.includes('weather')) {
        state.intent = { intent: 'non_product', confidence: 0.8, entities: [] };
      } else {
        // Use LLM for complex queries
        const messages = [
          {
            role: 'system',
            content: `Classify the user query into one of these categories:
            - greeting: "hi", "hello", "hey"
            - help: "help", "what can you do"
            - quick_reply: single numbers "1", "2", "3", "4"
            - product_search: ANY query about products, shopping, bags, watches, jewelry, skincare, wellness, luxury items, brands, fashion, accessories, etc.
            - non_product: queries about cars, houses, food, weather, news, etc.
            
            IMPORTANT: "bags", "luxury bags", "handbags", "watches", "jewelry", "skincare", "wellness" are ALL product_search queries.
            
            Return JSON: {"intent": "category", "confidence": 0.0-1.0, "entities": []}`
          },
          {
            role: 'user',
            content: state.userQuery
          }
        ];

        const result = await this.callLLM(messages);
        state.intent = result;
        
        // Cache the result
        globalCache.set(cacheKey, result);
      }
      
      console.log(`✅ IntentAgent: Classified as ${state.intent.intent}`);
      return state;
    } catch (error) {
      console.error('❌ IntentAgent failed:', error);
      state.intent = { intent: 'product_search', confidence: 0.5, entities: [] };
      state.errors.push({ agent: this.name, error: error.message });
      return state;
    }
  }
}

// 2. Product Discovery Agent
class SimpleProductAgent extends SimpleAgent {
  constructor() {
    super('ProductAgent', GROQ_CONFIG.models.primary);
  }

  async execute(state) {
    console.log('🔍 ProductAgent: Finding products...');
    
    try {
      // Skip product search only for specific non-product queries
      if (state.intent.intent === 'non_product' && 
          (state.userQuery.toLowerCase().includes('car') || 
           state.userQuery.toLowerCase().includes('house') || 
           state.userQuery.toLowerCase().includes('food') ||
           state.userQuery.toLowerCase().includes('weather'))) {
        state.products = [];
        return state;
      }

      // Advanced product search with intelligent matching
      const query = state.userQuery.toLowerCase();
      const queryTerms = query.split(/\s+/).filter(term => term.length > 1);
      
      // Enhanced search mappings with synonyms
      const searchMappings = {
        'bags': ['handbags', 'handbag', 'bag', 'purse', 'tote'],
        'bag': ['handbags', 'handbag', 'bags', 'purse', 'tote'],
        'handbag': ['handbags', 'bags', 'bag', 'purse', 'tote'],
        'luxury bags': ['handbags', 'handbag', 'bags', 'purse', 'tote'],
        'luxury-bags': ['handbags', 'handbag', 'bags', 'purse', 'tote'],
        'watches': ['watch', 'timepiece', 'wristwatch'],
        'watch': ['watches', 'timepiece', 'wristwatch'],
        'jewelry': ['jewellery', 'jewelry', 'accessories', 'bracelet', 'necklace', 'ring'],
        'jewellery': ['jewelry', 'accessories', 'bracelet', 'necklace', 'ring'],
        'skincare': ['skincare', 'beauty', 'cosmetics', 'cream', 'serum'],
        'skincare-products': ['skincare', 'beauty', 'cosmetics', 'cream', 'serum'],
        'wellness': ['wellness', 'health', 'spa', 'relaxation'],
        'wellness-items': ['wellness', 'health', 'spa', 'relaxation'],
        'fragrance': ['perfume', 'fragrance', 'scent', 'eau de parfum'],
        'perfume': ['fragrance', 'perfume', 'scent', 'eau de parfum']
      };
      
      // Get search terms for the query
      const getSearchTerms = (query) => {
        const directMatch = searchMappings[query];
        if (directMatch) return directMatch;
        
        // Check for partial matches
        for (const [key, values] of Object.entries(searchMappings)) {
          if (query.includes(key) || key.includes(query)) {
            return values;
          }
        }
        
        return [query];
      };
      
      const searchTerms = getSearchTerms(query);
      
      const products = enhancedLuxuryProducts.filter(product => {
        const searchText = [
          product.name,
          product.description,
          product.category,
          product.subcategory,
          product.brand,
          ...product.tags,
          ...product.keywords,
          ...product.benefits,
          ...product.affordances
        ].join(' ').toLowerCase();
        
        // Check for exact brand match first
        if (queryTerms.some(term => product.brand.toLowerCase().includes(term))) {
          return true;
        }
        
        // Check for search term matches
        const hasSearchTermMatch = searchTerms.some(term => 
          searchText.includes(term.toLowerCase())
        );
        
        if (hasSearchTermMatch) return true;
        
        // Check for individual query term matches with better scoring
        const termMatches = queryTerms.filter(term => {
          // Exact matches get higher priority
          if (searchText.includes(term)) return true;
          
          // Check tags and keywords
          return product.tags.some(tag => tag.includes(term)) ||
                 product.keywords.some(keyword => keyword.includes(term)) ||
                 product.affordances.some(affordance => affordance.includes(term));
        });
        
        // Return true if at least 30% of terms match (lowered threshold)
        return termMatches.length >= Math.ceil(queryTerms.length * 0.3);
      });

      // Score and rank products
      const scoredProducts = products.map(product => {
        const relevanceScore = this.calculateRelevanceScore(product, query);
        const qualityScore = product.rating / 5;
        const combinedScore = (relevanceScore * 0.7) + (qualityScore * 0.3);
        
        return {
          ...product,
          relevanceScore,
          qualityScore,
          combinedScore
        };
      });

      state.products = scoredProducts
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, 10);

      // If no products found, try category-specific fallback
      if (state.products.length === 0) {
        console.log('⚠️ No products found, trying category-specific fallback');
        
        // Try to find products by category based on query
        let fallbackProducts = [];
        
        if (queryLower.includes('skincare') || queryLower.includes('beauty') || queryLower.includes('la mer')) {
          fallbackProducts = enhancedLuxuryProducts
            .filter(p => p.category.toLowerCase().includes('skincare'))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
        } else if (queryLower.includes('wellness') || queryLower.includes('spa') || queryLower.includes('relaxation')) {
          fallbackProducts = enhancedLuxuryProducts
            .filter(p => p.category.toLowerCase().includes('wellness'))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
        } else if (queryLower.includes('bags') || queryLower.includes('handbags')) {
          fallbackProducts = enhancedLuxuryProducts
            .filter(p => p.subcategory.toLowerCase().includes('handbags'))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
        } else if (queryLower.includes('watches')) {
          fallbackProducts = enhancedLuxuryProducts
            .filter(p => p.category.toLowerCase().includes('watches'))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
        } else if (queryLower.includes('jewelry')) {
          fallbackProducts = enhancedLuxuryProducts
            .filter(p => p.category.toLowerCase().includes('jewelry'))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
        }
        
        // If still no products, show top luxury products
        if (fallbackProducts.length === 0) {
          fallbackProducts = enhancedLuxuryProducts
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
        }
        
        state.products = fallbackProducts.map(product => ({
          ...product,
          relevanceScore: 0.3,
          qualityScore: product.rating / 5,
          combinedScore: 0.3
        }));
      }

      console.log(`✅ ProductAgent: Found ${state.products.length} products`);
      return state;
    } catch (error) {
      console.error('❌ ProductAgent failed:', error);
      state.products = [];
      state.errors.push({ agent: this.name, error: error.message });
      return state;
    }
  }

  calculateRelevanceScore(product, query) {
    const queryTerms = query.split(/\s+/).filter(term => term.length > 1);
    const productText = [
      product.name,
      product.description,
      product.category,
      product.subcategory,
      product.brand,
      ...product.tags,
      ...product.keywords,
      ...product.benefits,
      ...product.affordances
    ].join(' ').toLowerCase();
    
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Exact query match gets highest score
    if (productText.includes(queryLower)) {
      score += 0.4;
    }
    
    // Brand exact match gets very high score
    if (product.brand.toLowerCase().includes(queryLower)) {
      score += 0.5;
    }
    
    // Product name exact match gets high score
    if (product.name.toLowerCase().includes(queryLower)) {
      score += 0.4;
    }
    
    // Category and subcategory matches
    if (product.category.toLowerCase().includes(queryLower)) {
      score += 0.3;
    }
    if (product.subcategory.toLowerCase().includes(queryLower)) {
      score += 0.2;
    }
    
    // Individual term matches with weighted scoring
    queryTerms.forEach(term => {
      const termLower = term.toLowerCase();
      
      // Name matches get higher weight
      if (product.name.toLowerCase().includes(termLower)) {
        score += 0.15;
      }
      
      // Brand matches get higher weight
      if (product.brand.toLowerCase().includes(termLower)) {
        score += 0.2;
      }
      
      // Description matches
      if (product.description.toLowerCase().includes(termLower)) {
        score += 0.1;
      }
      
      // Tag matches
      if (product.tags.some(tag => tag.toLowerCase().includes(termLower))) {
        score += 0.08;
      }
      
      // Keyword matches
      if (product.keywords.some(keyword => keyword.toLowerCase().includes(termLower))) {
        score += 0.08;
      }
      
      // Affordance matches
      if (product.affordances.some(affordance => affordance.toLowerCase().includes(termLower))) {
        score += 0.06;
      }
    });
    
    // Luxury brand bonus
    const luxuryBrands = ['chanel', 'hermes', 'louis vuitton', 'gucci', 'rolex', 'bulgari', 'la mer'];
    if (luxuryBrands.some(brand => product.brand.toLowerCase().includes(brand))) {
      score += 0.1;
    }
    
    // High rating bonus
    if (product.rating >= 4.5) {
      score += 0.05;
    }
    
    return Math.min(score, 1.0);
  }
}

// 3. Product Curation Agent
class SimpleCurationAgent extends SimpleAgent {
  constructor() {
    super('CurationAgent', GROQ_CONFIG.models.versatile);
  }

  async execute(state) {
    console.log('🎨 CurationAgent: Curating recommendations...');
    
    try {
      if (state.products.length === 0) {
        state.recommendations = [];
        return state;
      }

      // Use simple rule-based curation for better reliability
      const sortedProducts = state.products
        .sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0))
        .slice(0, 5); // Take top 5 products

      const recommendations = sortedProducts.map((product, index) => ({
        productId: product.id,
        confidence: Math.max(0.7, 0.9 - (index * 0.1)), // Decreasing confidence
        reason: this.getRecommendationReason(product, state.userQuery),
        product: product
      }));

      state.recommendations = recommendations;
      console.log(`✅ CurationAgent: Curated ${recommendations.length} recommendations`);
      return state;
    } catch (error) {
      console.error('❌ CurationAgent failed:', error);
      state.recommendations = state.products.slice(0, 3).map((product, index) => ({
        productId: product.id,
        confidence: 0.7,
        reason: 'Top recommendation',
        product: product
      }));
      state.errors.push({ agent: this.name, error: error.message });
      return state;
    }
  }

  getRecommendationReason(product, query) {
    const queryLower = query.toLowerCase();
    
    if (product.brand.toLowerCase().includes(queryLower)) {
      return `Exact brand match for ${product.brand}`;
    }
    
    if (product.name.toLowerCase().includes(queryLower)) {
      return `Product name matches query`;
    }
    
    if (product.category.toLowerCase().includes(queryLower)) {
      return `Category match for ${product.category}`;
    }
    
    if (product.subcategory.toLowerCase().includes(queryLower)) {
      return `Subcategory match for ${product.subcategory}`;
    }
    
    if (product.tags.some(tag => queryLower.includes(tag))) {
      return `Tag match for luxury products`;
    }
    
    if (product.rating >= 4.5) {
      return `High-rated luxury product`;
    }
    
    return `Top recommendation based on relevance`;
  }
}

// 4. Response Generation Agent
class SimpleResponseAgent extends SimpleAgent {
  constructor() {
    super('ResponseAgent', GROQ_CONFIG.models.versatile);
  }

  async execute(state) {
    console.log('💬 ResponseAgent: Generating response...');
    
    try {
      // Use fast rule-based response generation instead of LLM
      const products = state.recommendations.slice(0, 3); // Show max 3 products
      
      const items = products.map(rec => ({
        id: rec.productId,
        headline: rec.product.name,
        one_liner: `${rec.product.description.substring(0, 60)}... - ${rec.product.price} AED`
      }));

      const quickReplies = this.generateQuickReplies(state.userQuery, products);

      state.response = {
        opening: this.generateOpening(state.userQuery, products.length),
        items: items,
        cta: "Which product interests you most?",
        quick_replies: quickReplies
      };
      
      console.log('✅ ResponseAgent: Generated response');
      return state;
    } catch (error) {
      console.error('❌ ResponseAgent failed:', error);
      state.response = {
        opening: "Welcome to our luxury boutique! How can I help you today?",
        items: [],
        cta: "What would you like to explore?",
        quick_replies: ["View Products", "Get Help", "Contact Us"]
      };
      state.errors.push({ agent: this.name, error: error.message });
      return state;
    }
  }

  generateOpening(query, productCount) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('hermes') || queryLower.includes('hermès')) {
      return "Welcome to our Hermès collection! We have exquisite luxury pieces for you.";
    } else if (queryLower.includes('gucci')) {
      return "Discover our Gucci luxury collection! Here are some of our finest pieces.";
    } else if (queryLower.includes('chanel')) {
      return "Explore our Chanel collection! Timeless elegance awaits you.";
    } else if (queryLower.includes('louis vuitton') || queryLower.includes('louis-vuitton')) {
      return "Welcome to Louis Vuitton! Classic luxury and modern style combined.";
    } else if (queryLower.includes('bags') || queryLower.includes('handbags')) {
      return "Welcome to our luxury handbag collection! Here are our top picks for you.";
    } else if (queryLower.includes('watches')) {
      return "Discover our luxury timepieces! Precision meets elegance.";
    } else if (queryLower.includes('jewelry')) {
      return "Explore our luxury jewelry collection! Sparkling elegance awaits.";
    } else if (queryLower.includes('skincare')) {
      return "Welcome to our luxury skincare collection! Premium beauty products for you.";
    } else if (queryLower.includes('wellness')) {
      return "Discover our wellness collection! Luxury products for your well-being.";
    } else {
      return `Welcome to our luxury boutique! We found ${productCount} perfect products for you.`;
    }
  }

  generateQuickReplies(query, products) {
    const queryLower = query.toLowerCase();
    const brands = [...new Set(products.map(p => p.product.brand))];
    
    if (brands.length >= 2) {
      return [
        `View ${brands[0]} Collection`,
        `Explore ${brands[1]} Products`,
        "Show me everything"
      ];
    } else if (queryLower.includes('bags')) {
      return [
        "More luxury handbags",
        "View accessories",
        "Show me everything"
      ];
    } else if (queryLower.includes('watches')) {
      return [
        "More luxury watches",
        "View jewelry",
        "Show me everything"
      ];
    } else if (queryLower.includes('skincare')) {
      return [
        "More skincare products",
        "View wellness items",
        "Show me everything"
      ];
    } else if (queryLower.includes('jewelry')) {
      return [
        "More luxury jewelry",
        "View watches",
        "Show me everything"
      ];
    } else {
      return [
        "View more products",
        "Get help",
        "Contact us"
      ];
    }
  }
}

// Simplified Multi-Agent Orchestrator
class SimpleMultiAgentOrchestrator {
  constructor() {
    this.agents = [
      new SimpleIntentAgent(),
      new SimpleProductAgent(),
      new SimpleCurationAgent(),
      new SimpleResponseAgent()
    ];
  }

  async processQuery(userQuery, context = {}) {
    console.log('🚀 SimpleMultiAgentOrchestrator: Starting processing...');
    
    const state = new SimpleState();
    state.userQuery = userQuery;
    state.metadata = { startTime: Date.now() };

    try {
      // Execute agents in sequence
      for (const agent of this.agents) {
        console.log(`🔄 Executing ${agent.name}...`);
        await agent.execute(state);
        
        // Early exit for non-product queries
        if (agent.name === 'IntentAgent' && state.intent.intent === 'non_product') {
          break;
        }
      }

      // Prepare final response
      const response = {
        success: state.errors.length === 0,
        message: state.response?.opening || 'I\'m here to help you find luxury products!',
        recommendations: state.recommendations,
        naturalResponse: state.response,
        metadata: {
          intent: state.intent,
          totalProducts: state.products.length,
          selectedProducts: state.recommendations.length,
          errors: state.errors,
          agents: this.agents.map(a => a.name),
          processingTime: Date.now() - state.metadata.startTime
        },
        timestamp: new Date().toISOString()
      };

      console.log('✅ SimpleMultiAgentOrchestrator: Processing complete');
      return response;

    } catch (error) {
      console.error('❌ SimpleMultiAgentOrchestrator failed:', error);
      return {
        success: false,
        message: 'I encountered an error while processing your request. Please try again.',
        recommendations: [],
        naturalResponse: null,
        metadata: {
          error: error.message,
          agents: this.agents.map(a => a.name)
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export the orchestrator
export const simpleMultiAgentOrchestrator = new SimpleMultiAgentOrchestrator();
export { SimpleState, SimpleAgent, SimpleIntentAgent, SimpleProductAgent, SimpleCurationAgent, SimpleResponseAgent };

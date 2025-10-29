// Advanced Multi-Agent System with LangGraph Patterns and AutoGen Group Chat
import Groq from 'groq-sdk';
import { GROQ_CONFIG } from '../config/groq-config.js';
import { 
  enhancedLuxuryProducts, 
  searchProducts, 
  getProductById, 
  getProductsByCategory,
  getProductsByBrand,
  getFeaturedProducts,
  getInvestmentProducts,
  getExclusiveProducts
} from '../data/enhancedLuxuryProducts.js';

const groq = new Groq({ apiKey: GROQ_CONFIG.apiKey });

// Advanced State Management with LangGraph patterns
class ConversationState {
  constructor() {
    this.userQuery = '';
    this.userId = null;
    this.sessionId = null;
    this.conversationHistory = [];
    this.userPreferences = {
      budget: null,
      categories: [],
      brands: [],
      occasions: [],
      styles: []
    };
    this.context = {
      currentIntent: null,
      previousIntent: null,
      conversationStage: 'greeting', // greeting, browsing, considering, purchasing
      productFocus: null,
      lastRecommendations: [],
      userSatisfaction: null
    };
    this.agentStates = {
      intentAgent: { status: 'idle', result: null, confidence: 0 },
      productAgent: { status: 'idle', result: null, products: [] },
      curationAgent: { status: 'idle', result: null, recommendations: [] },
      responseAgent: { status: 'idle', result: null, response: null },
      qualityAgent: { status: 'idle', result: null, validation: null }
    };
    this.errors = [];
    this.metadata = {
      startTime: Date.now(),
      totalAgents: 0,
      successfulAgents: 0,
      failedAgents: 0
    };
  }

  updateAgentState(agentName, status, result = null) {
    this.agentStates[agentName] = { status, result, timestamp: Date.now() };
    this.metadata.totalAgents++;
    if (status === 'success') this.metadata.successfulAgents++;
    if (status === 'error') this.metadata.failedAgents++;
  }

  addToHistory(role, content, metadata = {}) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now(),
      metadata
    });
  }

  getContextualHistory(limit = 5) {
    return this.conversationHistory.slice(-limit);
  }
}

// Base Agent with enhanced capabilities
class AdvancedAgent {
  constructor(name, model = GROQ_CONFIG.models.primary, capabilities = []) {
    this.name = name;
    this.model = model;
    this.capabilities = capabilities;
    this.groq = groq;
    this.retryCount = 0;
    this.maxRetries = 2;
  }

  async execute(state) {
    throw new Error('Execute method must be implemented by subclass');
  }

  async callLLM(messages, temperature = 0.3, retries = 0) {
    try {
      const response = await this.groq.chat.completions.create({
        model: this.model,
        temperature,
        response_format: { type: 'json_object' },
        messages
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error(`${this.name} LLM call failed (attempt ${retries + 1}):`, error);
      if (retries < this.maxRetries) {
        await this.delay(1000 * (retries + 1));
        return this.callLLM(messages, temperature, retries + 1);
      }
      throw error;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  canHandle(state) {
    return true; // Override in subclasses
  }
}

// 1. Advanced Intent Classification Agent
class IntentClassificationAgent extends AdvancedAgent {
  constructor() {
    super('IntentClassificationAgent', GROQ_CONFIG.models.primary, [
      'intent_classification',
      'entity_extraction',
      'sentiment_analysis',
      'context_understanding'
    ]);
  }

  async execute(state) {
    console.log('🎯 IntentClassificationAgent: Analyzing user intent...');
    
    try {
      const messages = [
        {
          role: 'system',
          content: `You are an expert intent classifier for a luxury e-commerce system in Dubai, UAE.

          Analyze the user query and classify it into one of these categories:
          
          INTENT TYPES:
          - greeting: "hi", "hello", "hey", "good morning", "good afternoon"
          - help: "help", "what can you do", "how does this work", "assistance"
          - quick_reply: single numbers "1", "2", "3", "4", "5"
          - product_search: specific product queries like "luxury bags", "watches", "perfume"
          - product_inquiry: questions about specific products "tell me about Chanel bag"
          - comparison: "compare", "vs", "difference between", "which is better"
          - price_inquiry: "how much", "price", "cost", "budget", "affordable"
          - availability: "in stock", "available", "when can I get", "delivery"
          - recommendation: "recommend", "suggest", "what should I buy", "help me choose"
          - clarification: "what do you mean", "can you explain", "more details"
          - non_product: queries about cars, houses, food, travel, etc.
          - complaint: "problem", "issue", "complaint", "not working"
          - compliment: "thank you", "great", "amazing", "love it"
          
          CONVERSATION STAGE DETECTION:
          - greeting: First interaction
          - browsing: Looking at products
          - considering: Comparing options
          - purchasing: Ready to buy
          - post_purchase: After purchase
          
          ENTITY EXTRACTION:
          - Extract product categories, brands, price ranges, occasions, styles
          - Extract user preferences and constraints
          - Extract emotional indicators
          
          Return JSON:
          {
            "intent": "category",
            "confidence": 0.0-1.0,
            "entities": ["entity1", "entity2"],
            "sentiment": "positive|neutral|negative",
            "conversation_stage": "stage",
            "user_preferences": {"budget": "range", "categories": [], "brands": []},
            "requires_clarification": true/false,
            "urgency": "low|medium|high",
            "complexity": "simple|medium|complex"
          }`
        },
        {
          role: 'user',
          content: `User Query: "${state.userQuery}"
          
          Conversation History: ${JSON.stringify(state.getContextualHistory(3))}
          Current Context: ${JSON.stringify(state.context)}
          User Preferences: ${JSON.stringify(state.userPreferences)}`
        }
      ];

      const result = await this.callLLM(messages, 0.1);
      
      // Update state
      state.context.currentIntent = result.intent;
      state.context.conversationStage = result.conversation_stage;
      state.userPreferences = { ...state.userPreferences, ...result.user_preferences };
      
      // Add to history
      state.addToHistory('assistant', `Intent classified as: ${result.intent}`, { 
        agent: this.name, 
        confidence: result.confidence,
        entities: result.entities 
      });
      
      state.updateAgentState(this.name, 'success', result);
      console.log(`✅ IntentClassificationAgent: Classified as ${result.intent} (confidence: ${result.confidence})`);
      
      return state;
    } catch (error) {
      console.error('❌ IntentClassificationAgent failed:', error);
      state.updateAgentState(this.name, 'error', { error: error.message });
      state.errors.push({ agent: this.name, error: error.message, timestamp: Date.now() });
      
      // Fallback classification
      const fallbackIntent = this.getFallbackIntent(state.userQuery);
      state.context.currentIntent = fallbackIntent;
      state.updateAgentState(this.name, 'success', fallbackIntent);
      
      return state;
    }
  }

  getFallbackIntent(query) {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('hi') || lowerQuery.includes('hello')) return 'greeting';
    if (lowerQuery.includes('help')) return 'help';
    if (/^[1-5]$/.test(query.trim())) return 'quick_reply';
    if (lowerQuery.includes('bag') || lowerQuery.includes('watch') || lowerQuery.includes('perfume')) return 'product_search';
    return 'product_search';
  }
}

// 2. Advanced Product Discovery Agent
class ProductDiscoveryAgent extends AdvancedAgent {
  constructor() {
    super('ProductDiscoveryAgent', GROQ_CONFIG.models.primary, [
      'product_search',
      'semantic_matching',
      'filtering',
      'ranking'
    ]);
  }

  async execute(state) {
    console.log('🔍 ProductDiscoveryAgent: Discovering products...');
    
    try {
      const intent = state.context.currentIntent;
      
      if (intent === 'non_product') {
        state.agentStates.productAgent.products = [];
        state.updateAgentState(this.name, 'success', { products: [] });
        return state;
      }

      let products = [];
      
      // Advanced product search based on intent
      switch (intent) {
        case 'product_search':
          products = this.searchProducts(state.userQuery, state.userPreferences);
          break;
        case 'product_inquiry':
          products = this.searchSpecificProduct(state.userQuery);
          break;
        case 'recommendation':
          products = this.getRecommendations(state.userPreferences);
          break;
        case 'comparison':
          products = this.getComparisonProducts(state.userQuery);
          break;
        case 'price_inquiry':
          products = this.getProductsByPriceRange(state.userQuery);
          break;
        default:
          products = this.searchProducts(state.userQuery, state.userPreferences);
      }

      // Enhanced scoring and ranking
      const scoredProducts = products.map(product => {
        const relevanceScore = this.calculateRelevanceScore(product, state.userQuery, state.userPreferences);
        const qualityScore = this.calculateQualityScore(product);
        const popularityScore = this.calculatePopularityScore(product);
        const combinedScore = (relevanceScore * 0.4) + (qualityScore * 0.3) + (popularityScore * 0.3);
        
        return {
          ...product,
          relevanceScore,
          qualityScore,
          popularityScore,
          combinedScore
        };
      });

      // Sort by combined score
      const rankedProducts = scoredProducts
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, 15);

      state.agentStates.productAgent.products = rankedProducts;
      state.updateAgentState(this.name, 'success', { 
        products: rankedProducts,
        totalFound: products.length,
        topScore: rankedProducts[0]?.combinedScore || 0
      });
      
      console.log(`✅ ProductDiscoveryAgent: Found ${rankedProducts.length} products`);
      return state;
    } catch (error) {
      console.error('❌ ProductDiscoveryAgent failed:', error);
      state.updateAgentState(this.name, 'error', { error: error.message });
      state.errors.push({ agent: this.name, error: error.message, timestamp: Date.now() });
      return state;
    }
  }

  searchProducts(query, preferences) {
    const filters = {
      category: preferences.categories[0],
      brand: preferences.brands[0],
      minPrice: preferences.budget?.min,
      maxPrice: preferences.budget?.max,
      inStock: true
    };
    
    return searchProducts(query, filters);
  }

  searchSpecificProduct(query) {
    // Look for specific product mentions
    const productMentions = enhancedLuxuryProducts.filter(product => 
      query.toLowerCase().includes(product.name.toLowerCase()) ||
      query.toLowerCase().includes(product.brand.toLowerCase())
    );
    
    if (productMentions.length > 0) {
      return productMentions;
    }
    
    // Fallback to general search
    return searchProducts(query);
  }

  getRecommendations(preferences) {
    if (preferences.categories.includes('investment')) {
      return getInvestmentProducts();
    }
    if (preferences.categories.includes('exclusive')) {
      return getExclusiveProducts();
    }
    return getFeaturedProducts(10);
  }

  getComparisonProducts(query) {
    // Extract comparison terms
    const comparisonTerms = query.toLowerCase().split(/vs|versus|compare|comparison/);
    const products = [];
    
    comparisonTerms.forEach(term => {
      const found = searchProducts(term.trim());
      products.push(...found);
    });
    
    return [...new Set(products.map(p => p.id))].map(id => 
      enhancedLuxuryProducts.find(p => p.id === id)
    ).filter(Boolean);
  }

  getProductsByPriceRange(query) {
    const priceMatch = query.match(/(\d+)\s*-\s*(\d+)|under\s*(\d+)|over\s*(\d+)|around\s*(\d+)/i);
    if (priceMatch) {
      const [, min, max, under, over, around] = priceMatch;
      const filters = {};
      
      if (under) filters.maxPrice = parseInt(under);
      if (over) filters.minPrice = parseInt(over);
      if (around) {
        const aroundPrice = parseInt(around);
        filters.minPrice = aroundPrice * 0.8;
        filters.maxPrice = aroundPrice * 1.2;
      }
      if (min && max) {
        filters.minPrice = parseInt(min);
        filters.maxPrice = parseInt(max);
      }
      
      return searchProducts('', filters);
    }
    
    return getFeaturedProducts(10);
  }

  calculateRelevanceScore(product, query, preferences) {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const productText = [
      product.name,
      product.description,
      product.category,
      product.brand,
      ...product.tags,
      ...product.keywords
    ].join(' ').toLowerCase();
    
    let score = 0;
    queryTerms.forEach(term => {
      if (productText.includes(term)) score += 1;
    });
    
    // Boost for preferences
    if (preferences.categories.includes(product.category.toLowerCase())) score += 2;
    if (preferences.brands.includes(product.brand.toLowerCase())) score += 2;
    
    return Math.min(score / queryTerms.length, 1);
  }

  calculateQualityScore(product) {
    return (product.rating / 5) * 0.6 + (product.reviews / 200) * 0.4;
  }

  calculatePopularityScore(product) {
    const popularityFactors = {
      'Very High': 1.0,
      'High': 0.8,
      'Medium': 0.6,
      'Low': 0.4
    };
    
    return popularityFactors[product.investmentValue] || 0.5;
  }
}

// 3. Advanced Product Curation Agent
class ProductCurationAgent extends AdvancedAgent {
  constructor() {
    super('ProductCurationAgent', GROQ_CONFIG.models.versatile, [
      'product_curation',
      'personalization',
      'ranking',
      'reasoning'
    ]);
  }

  async execute(state) {
    console.log('🎨 ProductCurationAgent: Curating recommendations...');
    
    try {
      const products = state.agentStates.productAgent.products;
      
      if (products.length === 0) {
        state.agentStates.curationAgent.recommendations = [];
        state.updateAgentState(this.name, 'success', { recommendations: [] });
        return state;
      }

      const messages = [
        {
          role: 'system',
          content: `You are an expert luxury product curator for a high-end e-commerce platform in Dubai, UAE.

          Your task is to select the best 3-5 products from the provided list based on:
          
          CURATION CRITERIA:
          1. User Query Relevance - How well does the product match the user's request?
          2. Product Quality - Rating, reviews, brand reputation, materials
          3. Value Proposition - Price vs. value, investment potential
          4. User Preferences - Budget, categories, brands, occasions, styles
          5. Contextual Fit - Occasion appropriateness, seasonal relevance
          6. Diversity - Ensure variety in categories, price points, styles
          7. Availability - Stock levels, exclusivity
          8. Social Proof - Celebrity endorsements, popularity
          
          PERSONALIZATION FACTORS:
          - Budget consciousness vs. luxury focus
          - Investment vs. immediate gratification
          - Classic vs. trendy preferences
          - Practical vs. statement pieces
          - Brand loyalty vs. exploration
          
          Return JSON:
          {
            "selectedProducts": [
              {
                "productId": "P001",
                "confidence": 0.0-1.0,
                "reason": "Detailed explanation of why this product was selected",
                "priority": 1-5,
                "personalization": "How this matches user preferences",
                "valueProposition": "What makes this product special",
                "occasion": "When/where to use this product"
              }
            ],
            "curationStrategy": "Explanation of the overall curation approach",
            "diversityScore": 0.0-1.0,
            "personalizationScore": 0.0-1.0
          }`
        },
        {
          role: 'user',
          content: `User Query: "${state.userQuery}"
          
          User Preferences: ${JSON.stringify(state.userPreferences)}
          Conversation Context: ${JSON.stringify(state.context)}
          
          Available Products (${products.length}):
          ${products.map((p, i) => `${i + 1}. ${p.name} - ${p.brand} - ${p.price} AED (Rating: ${p.rating}, Score: ${p.combinedScore?.toFixed(2)})`).join('\n')}
          
          Previous Recommendations: ${JSON.stringify(state.context.lastRecommendations.slice(0, 3))}`
        }
      ];

      const result = await this.callLLM(messages, 0.4);
      
      // Map curated products to full product objects
      const recommendations = result.selectedProducts.map(selection => {
        const product = products.find(p => p.id === selection.productId);
        if (!product) return null;
        
        return {
          productId: selection.productId,
          confidence: selection.confidence,
          reason: selection.reason,
          priority: selection.priority,
          personalization: selection.personalization,
          valueProposition: selection.valueProposition,
          occasion: selection.occasion,
          product: product
        };
      }).filter(Boolean);

      state.agentStates.curationAgent.recommendations = recommendations;
      state.context.lastRecommendations = recommendations;
      
      state.updateAgentState(this.name, 'success', { 
        recommendations,
        strategy: result.curationStrategy,
        diversityScore: result.diversityScore,
        personalizationScore: result.personalizationScore
      });
      
      console.log(`✅ ProductCurationAgent: Curated ${recommendations.length} recommendations`);
      return state;
    } catch (error) {
      console.error('❌ ProductCurationAgent failed:', error);
      state.updateAgentState(this.name, 'error', { error: error.message });
      state.errors.push({ agent: this.name, error: error.message, timestamp: Date.now() });
      
      // Fallback: return top 3 products
      const fallbackRecommendations = products.slice(0, 3).map((product, index) => ({
        productId: product.id,
        confidence: 0.7,
        reason: 'Top recommendation based on relevance',
        priority: index + 1,
        personalization: 'General recommendation',
        valueProposition: 'High-quality luxury product',
        occasion: 'Versatile use',
        product: product
      }));
      
      state.agentStates.curationAgent.recommendations = fallbackRecommendations;
      state.updateAgentState(this.name, 'success', { recommendations: fallbackRecommendations });
      
      return state;
    }
  }
}

// 4. Advanced Response Generation Agent
class ResponseGenerationAgent extends AdvancedAgent {
  constructor() {
    super('ResponseGenerationAgent', GROQ_CONFIG.models.versatile, [
      'natural_language_generation',
      'conversation_management',
      'personalization',
      'emotional_intelligence'
    ]);
  }

  async execute(state) {
    console.log('💬 ResponseGenerationAgent: Generating response...');
    
    try {
      const recommendations = state.agentStates.curationAgent.recommendations;
      const intent = state.context.currentIntent;
      const conversationStage = state.context.conversationStage;
      
      const messages = [
        {
          role: 'system',
          content: `You are a sophisticated luxury shopping assistant for a high-end e-commerce platform in Dubai, UAE.

          Generate a natural, engaging, and personalized response based on the user query and recommendations.
          
          RESPONSE GUIDELINES:
          1. Tone: Sophisticated, knowledgeable, warm, and helpful
          2. Language: Professional yet approachable, luxury-focused
          3. Personalization: Reference user preferences and context
          4. Engagement: Ask relevant follow-up questions
          5. Education: Provide valuable product insights
          6. Urgency: Create appropriate sense of exclusivity
          
          CONVERSATION STAGES:
          - Greeting: Welcome and introduction
          - Browsing: Show products, explain features
          - Considering: Help with decisions, comparisons
          - Purchasing: Facilitate buying process
          - Post-purchase: Follow-up, care instructions
          
          INTENT-SPECIFIC RESPONSES:
          - Product Search: Show relevant products with details
          - Comparison: Highlight differences and similarities
          - Price Inquiry: Focus on value and investment potential
          - Recommendation: Provide curated suggestions with reasoning
          - Help: Explain capabilities and guide user
          
          RESPONSE FORMAT:
          {
            "opening": "Engaging opening message",
            "items": [
              {
                "id": "P001",
                "headline": "Product name",
                "one_liner": "Compelling description",
                "highlights": ["key feature 1", "key feature 2"],
                "value_proposition": "Why this is special"
              }
            ],
            "cta": "Call to action",
            "quick_replies": ["Option 1", "Option 2", "Option 3"],
            "follow_up": "Suggested next question or action",
            "personalization": "How this relates to user preferences",
            "urgency": "Exclusivity or limited availability message"
          }`
        },
        {
          role: 'user',
          content: `User Query: "${state.userQuery}"
          
          Intent: ${intent}
          Conversation Stage: ${conversationStage}
          User Preferences: ${JSON.stringify(state.userPreferences)}
          
          Recommendations (${recommendations.length}):
          ${recommendations.map(r => ({
            id: r.productId,
            name: r.product.name,
            price: r.product.price,
            brand: r.product.brand,
            reason: r.reason,
            valueProposition: r.valueProposition,
            occasion: r.occasion
          }))}
          
          Conversation History: ${JSON.stringify(state.getContextualHistory(2))}
          
          Context: ${JSON.stringify(state.context)}`
        }
      ];

      const result = await this.callLLM(messages, 0.6);
      
      state.agentStates.responseAgent.response = result;
      state.updateAgentState(this.name, 'success', { response: result });
      
      // Add to conversation history
      state.addToHistory('assistant', result.opening, { 
        agent: this.name,
        recommendations: recommendations.length,
        intent: intent
      });
      
      console.log(`✅ ResponseGenerationAgent: Generated response`);
      return state;
    } catch (error) {
      console.error('❌ ResponseGenerationAgent failed:', error);
      state.updateAgentState(this.name, 'error', { error: error.message });
      state.errors.push({ agent: this.name, error: error.message, timestamp: Date.now() });
      
      // Fallback response
      const fallbackResponse = {
        opening: "I'm here to help you find the perfect luxury products! Let me show you some of our finest selections.",
        items: recommendations.slice(0, 3).map(r => ({
          id: r.productId,
          headline: r.product.name,
          one_liner: r.reason || 'Excellent choice for your needs',
          highlights: r.product.benefits?.slice(0, 2) || [],
          value_proposition: r.valueProposition || 'High-quality luxury product'
        })),
        cta: "What would you like to explore next?",
        quick_replies: ["View more products", "Get recommendations", "Ask questions"],
        follow_up: "Is there anything specific you'd like to know about these products?",
        personalization: "I've selected these based on your preferences",
        urgency: "These are our most popular items"
      };
      
      state.agentStates.responseAgent.response = fallbackResponse;
      state.updateAgentState(this.name, 'success', { response: fallbackResponse });
      
      return state;
    }
  }
}

// 5. Advanced Quality Assurance Agent
class QualityAssuranceAgent extends AdvancedAgent {
  constructor() {
    super('QualityAssuranceAgent', GROQ_CONFIG.models.primary, [
      'quality_validation',
      'consistency_check',
      'error_detection',
      'performance_monitoring'
    ]);
  }

  async execute(state) {
    console.log('🔍 QualityAssuranceAgent: Validating response...');
    
    try {
      const response = state.agentStates.responseAgent.response;
      const recommendations = state.agentStates.curationAgent.recommendations;
      
      const validation = {
        responseStructure: this.validateResponseStructure(response),
        productData: this.validateProductData(recommendations),
        pricingConsistency: this.validatePricingConsistency(recommendations),
        personalization: this.validatePersonalization(response, state.userPreferences),
        engagement: this.validateEngagement(response),
        errors: []
      };

      // Fix any issues found
      if (validation.errors.length > 0) {
        console.warn(`⚠️ QualityAssuranceAgent: Found ${validation.errors.length} issues`);
        this.fixIssues(state, validation);
      }

      state.agentStates.qualityAgent.validation = validation;
      state.updateAgentState(this.name, 'success', { validation });
      
      console.log(`✅ QualityAssuranceAgent: Response validated`);
      return state;
    } catch (error) {
      console.error('❌ QualityAssuranceAgent failed:', error);
      state.updateAgentState(this.name, 'error', { error: error.message });
      state.errors.push({ agent: this.name, error: error.message, timestamp: Date.now() });
      return state;
    }
  }

  validateResponseStructure(response) {
    const required = ['opening', 'items', 'cta', 'quick_replies'];
    const missing = required.filter(field => !response[field]);
    return {
      valid: missing.length === 0,
      missing,
      score: (required.length - missing.length) / required.length
    };
  }

  validateProductData(recommendations) {
    const issues = [];
    recommendations.forEach(rec => {
      if (!rec.product) issues.push(`Missing product data for ${rec.productId}`);
      if (!rec.product.price || rec.product.price <= 0) issues.push(`Invalid price for ${rec.productId}`);
      if (!rec.reason) issues.push(`Missing reason for ${rec.productId}`);
    });
    return {
      valid: issues.length === 0,
      issues,
      score: Math.max(0, 1 - (issues.length / recommendations.length))
    };
  }

  validatePricingConsistency(recommendations) {
    const prices = recommendations.map(r => r.product?.price).filter(Boolean);
    const hasValidPrices = prices.every(price => price > 0);
    const hasConsistentFormat = prices.every(price => typeof price === 'number');
    return {
      valid: hasValidPrices && hasConsistentFormat,
      score: hasValidPrices && hasConsistentFormat ? 1 : 0.5
    };
  }

  validatePersonalization(response, preferences) {
    const hasPersonalization = response.personalization && response.personalization.length > 0;
    const hasUserContext = response.items.some(item => 
      item.highlights && item.highlights.length > 0
    );
    return {
      valid: hasPersonalization && hasUserContext,
      score: (hasPersonalization ? 0.5 : 0) + (hasUserContext ? 0.5 : 0)
    };
  }

  validateEngagement(response) {
    const hasCTA = response.cta && response.cta.length > 0;
    const hasQuickReplies = response.quick_replies && response.quick_replies.length >= 3;
    const hasFollowUp = response.follow_up && response.follow_up.length > 0;
    return {
      valid: hasCTA && hasQuickReplies && hasFollowUp,
      score: (hasCTA ? 0.33 : 0) + (hasQuickReplies ? 0.33 : 0) + (hasFollowUp ? 0.34 : 0)
    };
  }

  fixIssues(state, validation) {
    // Implement fixes for common issues
    const response = state.agentStates.responseAgent.response;
    
    if (!response.quick_replies || response.quick_replies.length < 3) {
      response.quick_replies = [
        "View more products",
        "Get recommendations", 
        "Ask questions"
      ];
    }
    
    if (!response.cta) {
      response.cta = "What would you like to explore next?";
    }
  }
}

// Advanced Multi-Agent Orchestrator with LangGraph patterns
class AdvancedMultiAgentOrchestrator {
  constructor() {
    this.agents = [
      new IntentClassificationAgent(),
      new ProductDiscoveryAgent(),
      new ProductCurationAgent(),
      new ResponseGenerationAgent(),
      new QualityAssuranceAgent()
    ];
    
    this.workflow = this.createWorkflow();
  }

  createWorkflow() {
    // LangGraph-inspired workflow definition
    return {
      nodes: {
        intent: 'IntentClassificationAgent',
        discovery: 'ProductDiscoveryAgent',
        curation: 'ProductCurationAgent',
        response: 'ResponseGenerationAgent',
        quality: 'QualityAssuranceAgent'
      },
      edges: [
        { from: 'intent', to: 'discovery', condition: 'intent_success' },
        { from: 'discovery', to: 'curation', condition: 'products_found' },
        { from: 'curation', to: 'response', condition: 'recommendations_ready' },
        { from: 'response', to: 'quality', condition: 'response_generated' },
        { from: 'quality', to: 'end', condition: 'validation_complete' }
      ],
      conditions: {
        intent_success: (state) => state.agentStates.intentAgent.status === 'success',
        products_found: (state) => state.agentStates.productAgent.products.length > 0,
        recommendations_ready: (state) => state.agentStates.curationAgent.recommendations.length > 0,
        response_generated: (state) => state.agentStates.responseAgent.response !== null,
        validation_complete: (state) => state.agentStates.qualityAgent.status === 'success'
      }
    };
  }

  async processQuery(userQuery, context = {}) {
    console.log('🚀 AdvancedMultiAgentOrchestrator: Starting processing...');
    
    // Initialize state
    const state = new ConversationState();
    state.userQuery = userQuery;
    state.userId = context.userId;
    state.sessionId = context.sessionId || `session_${Date.now()}`;
    state.context = { ...state.context, ...context };
    
    try {
      // Execute agents in sequence with workflow logic
      for (const agent of this.agents) {
        console.log(`🔄 Executing ${agent.name}...`);
        
        // Check if agent can handle current state
        if (!agent.canHandle(state)) {
          console.log(`⏭️ Skipping ${agent.name} - cannot handle current state`);
          continue;
        }
        
        // Execute agent
        await agent.execute(state);
        
        // Check for critical errors
        if (state.errors.some(e => e.agent === agent.name)) {
          console.warn(`⚠️ ${agent.name} encountered errors, continuing with next agent`);
        }
        
        // Early exit conditions
        if (agent.name === 'IntentClassificationAgent' && 
            state.context.currentIntent === 'non_product') {
          break;
        }
      }

      // Prepare final response
      const response = this.prepareFinalResponse(state);
      
      console.log('✅ AdvancedMultiAgentOrchestrator: Processing complete');
      return response;

    } catch (error) {
      console.error('❌ AdvancedMultiAgentOrchestrator failed:', error);
      return this.prepareErrorResponse(state, error);
    }
  }

  prepareFinalResponse(state) {
    const response = state.agentStates.responseAgent.response;
    const recommendations = state.agentStates.curationAgent.recommendations;
    const validation = state.agentStates.qualityAgent.validation;
    
    return {
      success: state.errors.length === 0,
      message: response?.opening || 'I\'m here to help you find luxury products!',
      recommendations: recommendations,
      naturalResponse: response,
      metadata: {
        intent: state.context.currentIntent,
        conversationStage: state.context.conversationStage,
        userPreferences: state.userPreferences,
        totalProducts: state.agentStates.productAgent.products.length,
        selectedProducts: recommendations.length,
        qualityScore: validation?.responseStructure?.score || 0,
        personalizationScore: validation?.personalization?.score || 0,
        engagementScore: validation?.engagement?.score || 0,
        errors: state.errors,
        agents: this.agents.map(a => a.name),
        processingTime: Date.now() - state.metadata.startTime,
        successfulAgents: state.metadata.successfulAgents,
        failedAgents: state.metadata.failedAgents
      },
      timestamp: new Date().toISOString()
    };
  }

  prepareErrorResponse(state, error) {
    return {
      success: false,
      message: 'I encountered an error while processing your request. Please try again.',
      recommendations: [],
      naturalResponse: {
        opening: "I'm having trouble processing your request right now.",
        items: [],
        cta: "Please try again or contact support.",
        quick_replies: ["Try again", "Get help", "Contact support"]
      },
      metadata: {
        error: error.message,
        agents: this.agents.map(a => a.name),
        processingTime: Date.now() - state.metadata.startTime,
        errors: state.errors
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Export the orchestrator
export const advancedMultiAgentOrchestrator = new AdvancedMultiAgentOrchestrator();
export { 
  ConversationState, 
  AdvancedAgent, 
  IntentClassificationAgent, 
  ProductDiscoveryAgent, 
  ProductCurationAgent, 
  ResponseGenerationAgent, 
  QualityAssuranceAgent 
};

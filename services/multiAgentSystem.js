// Multi-Agent RAG System using LangGraph-like Architecture
import Groq from 'groq-sdk';
import { GROQ_CONFIG } from '../config/groq-config.js';
import { enhancedProducts, filterProducts, calculateBM25Score, calculateBusinessScore } from '../data/enhancedProducts.js';

const groq = new Groq({ apiKey: GROQ_CONFIG.apiKey });

// Agent State Management
class AgentState {
  constructor() {
    this.userQuery = '';
    this.intent = null;
    this.products = [];
    this.recommendations = [];
    this.conversationHistory = [];
    this.userPreferences = {};
    this.context = {};
    this.errors = [];
    this.metadata = {};
  }
}

// Base Agent Class
class BaseAgent {
  constructor(name, model = GROQ_CONFIG.models.primary) {
    this.name = name;
    this.model = model;
    this.groq = groq;
  }

  async execute(state) {
    throw new Error('Execute method must be implemented by subclass');
  }

  async callLLM(messages, temperature = 0.3) {
    try {
      const response = await this.groq.chat.completions.create({
        model: this.model,
        temperature,
        response_format: { type: 'json_object' },
        messages
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error(`${this.name} LLM call failed:`, error);
      throw error;
    }
  }
}

// 1. Intent Classification Agent
class IntentAgent extends BaseAgent {
  constructor() {
    super('IntentAgent', GROQ_CONFIG.models.primary);
  }

  async execute(state) {
    console.log('🎯 IntentAgent: Classifying user intent...');
    
    const messages = [
      {
        role: 'system',
        content: `You are an expert intent classifier for a luxury e-commerce system.
        
        Classify the user query into one of these categories:
        - greeting: "hi", "hello", "hey", "good morning"
        - help: "help", "what can you do", "how does this work"
        - quick_reply: single numbers "1", "2", "3", "4"
        - product_request: specific product queries
        - non_product: queries about cars, houses, food, etc.
        - clarification: "what do you mean", "can you explain"
        - comparison: "compare", "vs", "difference between"
        - price_inquiry: "how much", "price", "cost"
        - availability: "in stock", "available", "when can I get"
        
        Return JSON: {"type": "category", "confidence": 0.0-1.0, "entities": [], "intent_details": {}}`
      },
      {
        role: 'user',
        content: state.userQuery
      }
    ];

    try {
      const result = await this.callLLM(messages);
      state.intent = result;
      console.log(`✅ IntentAgent: Classified as ${result.type} (confidence: ${result.confidence})`);
      return state;
    } catch (error) {
      console.error('❌ IntentAgent failed:', error);
      state.intent = { type: 'product_request', confidence: 0.5, entities: [], intent_details: {} };
      state.errors.push({ agent: 'IntentAgent', error: error.message });
      return state;
    }
  }
}

// 2. Product Retrieval Agent
class ProductRetrievalAgent extends BaseAgent {
  constructor() {
    super('ProductRetrievalAgent', GROQ_CONFIG.models.primary);
  }

  async execute(state) {
    console.log('🔍 ProductRetrievalAgent: Retrieving products...');
    
    if (state.intent.type === 'non_product') {
      state.products = [];
      return state;
    }

    try {
      // Enhanced product filtering based on intent
      let candidates = this.filterProductsByIntent(state.intent, state.userQuery);
      
      // Score and rank products
      const scoredCandidates = candidates.map(product => {
        const bm25Score = calculateBM25Score(product, state.userQuery, state.intent.entities || []);
        const businessScore = calculateBusinessScore(product);
        const combinedScore = (bm25Score * 0.5) + (businessScore * 0.3) + (product.rating / 5 * 0.2);
        
        return {
          ...product,
          bm25Score,
          businessScore,
          combinedScore
        };
      });

      // Sort by combined score
      state.products = scoredCandidates
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, 10);

      console.log(`✅ ProductRetrievalAgent: Retrieved ${state.products.length} products`);
      return state;
    } catch (error) {
      console.error('❌ ProductRetrievalAgent failed:', error);
      state.products = [];
      state.errors.push({ agent: 'ProductRetrievalAgent', error: error.message });
      return state;
    }
  }

  filterProductsByIntent(intent, query) {
    const categoryKeywords = {
      'fashion_accessories': ['bag', 'handbag', 'purse', 'bags', 'clutch', 'tote'],
      'jewelry_watches': ['watch', 'timepiece', 'watches', 'jewelry', 'necklace'],
      'beauty_skincare': ['skincare', 'beauty', 'cream', 'serum', 'moisturizer'],
      'fragrance': ['perfume', 'fragrance', 'cologne', 'scent'],
      'home_decor': ['home', 'decor', 'decoration', 'furniture', 'lamp'],
      'wellness_general': ['wellness', 'health', 'supplement', 'vitamin']
    };

    // Determine primary category
    let primaryCategory = 'luxury';
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
        primaryCategory = category;
        break;
      }
    }

    return filterProducts(enhancedProducts, primaryCategory, intent.entities || []);
  }
}

// 3. Product Curation Agent
class ProductCurationAgent extends BaseAgent {
  constructor() {
    super('ProductCurationAgent', GROQ_CONFIG.models.versatile);
  }

  async execute(state) {
    console.log('🎨 ProductCurationAgent: Curating recommendations...');
    
    if (state.products.length === 0) {
      state.recommendations = [];
      return state;
    }

    try {
      const messages = [
        {
          role: 'system',
          content: `You are an expert product curator for a luxury e-commerce system.
          
          Select the best 3-5 products from the provided list based on:
          - User query relevance
          - Product quality and ratings
          - Price appropriateness
          - Brand reputation
          - User preferences (if available)
          
          For each selected product, provide:
          - productId: the product ID
          - confidence: 0.0-1.0 confidence score
          - reason: why this product is recommended
          - priority: 1-5 priority ranking
          
          Return JSON: {"selectedProducts": [{"productId": "P001", "confidence": 0.9, "reason": "...", "priority": 1}]}`
        },
        {
          role: 'user',
          content: `User Query: ${state.userQuery}
          
          Available Products:
          ${state.products.map(p => `${p.id}: ${p.name} - ${p.price} AED (Rating: ${p.rating})`).join('\n')}
          
          User Preferences: ${JSON.stringify(state.userPreferences)}`
        }
      ];

      const result = await this.callLLM(messages);
      
      // Map curated products to full product objects
      state.recommendations = result.selectedProducts.map(selection => {
        const product = state.products.find(p => p.id === selection.productId);
        return {
          productId: selection.productId,
          confidence: selection.confidence,
          reason: selection.reason,
          priority: selection.priority,
          product: product
        };
      }).filter(rec => rec.product); // Only include products that exist

      console.log(`✅ ProductCurationAgent: Curated ${state.recommendations.length} recommendations`);
      return state;
    } catch (error) {
      console.error('❌ ProductCurationAgent failed:', error);
      // Fallback: return top 3 products
      state.recommendations = state.products.slice(0, 3).map((product, index) => ({
        productId: product.id,
        confidence: 0.7,
        reason: 'Top recommendation based on relevance',
        priority: index + 1,
        product: product
      }));
      state.errors.push({ agent: 'ProductCurationAgent', error: error.message });
      return state;
    }
  }
}

// 4. Response Generation Agent
class ResponseGenerationAgent extends BaseAgent {
  constructor() {
    super('ResponseGenerationAgent', GROQ_CONFIG.models.versatile);
  }

  async execute(state) {
    console.log('💬 ResponseGenerationAgent: Generating response...');
    
    try {
      const messages = [
        {
          role: 'system',
          content: `You are a professional shopping assistant for luxury products in Dubai, UAE.
          
          Generate a natural, helpful response based on the user query and recommendations.
          
          Rules:
          - All prices in AED (UAE Dirham)
          - Use actual product names in quick replies
          - Be conversational and helpful
          - Include relevant product details
          - Provide clear next steps
          
          Response format:
          {
            "opening": "Welcome message",
            "items": [{"id": "P001", "headline": "Product Name", "one_liner": "Description"}],
            "cta": "Call to action",
            "quick_replies": ["Option 1", "Option 2", "Option 3"]
          }`
        },
        {
          role: 'user',
          content: `User Query: ${state.userQuery}
          
          Intent: ${JSON.stringify(state.intent)}
          
          Recommendations: ${JSON.stringify(state.recommendations.map(r => ({
            id: r.productId,
            name: r.product.name,
            price: r.product.price,
            category: r.product.category,
            reason: r.reason
          })))}
          
          Conversation History: ${JSON.stringify(state.conversationHistory.slice(-3))}`
        }
      ];

      const result = await this.callLLM(messages, 0.5);
      state.response = result;
      
      console.log(`✅ ResponseGenerationAgent: Generated response`);
      return state;
    } catch (error) {
      console.error('❌ ResponseGenerationAgent failed:', error);
      // Fallback response
      state.response = {
        opening: "I'm here to help you find the perfect luxury products!",
        items: state.recommendations.slice(0, 3).map(r => ({
          id: r.productId,
          headline: r.product.name,
          one_liner: r.reason
        })),
        cta: "What would you like to explore next?",
        quick_replies: ["View more products", "Get recommendations", "Ask questions"]
      };
      state.errors.push({ agent: 'ResponseGenerationAgent', error: error.message });
      return state;
    }
  }
}

// 5. Quality Assurance Agent
class QualityAssuranceAgent extends BaseAgent {
  constructor() {
    super('QualityAssuranceAgent', GROQ_CONFIG.models.primary);
  }

  async execute(state) {
    console.log('🔍 QualityAssuranceAgent: Validating response...');
    
    try {
      // Validate response structure
      if (!state.response || !state.response.opening) {
        throw new Error('Invalid response structure');
      }

      // Validate product data
      const invalidProducts = state.recommendations.filter(r => 
        !r.product || !r.product.price || r.product.price <= 0
      );

      if (invalidProducts.length > 0) {
        console.warn(`⚠️ QualityAssuranceAgent: Found ${invalidProducts.length} invalid products`);
        state.recommendations = state.recommendations.filter(r => 
          r.product && r.product.price && r.product.price > 0
        );
      }

      // Validate pricing format
      const hasInvalidPricing = state.recommendations.some(r => 
        r.product && (r.product.price === 0 || typeof r.product.price !== 'number')
      );

      if (hasInvalidPricing) {
        console.warn('⚠️ QualityAssuranceAgent: Found invalid pricing');
        state.recommendations = state.recommendations.filter(r => 
          r.product && r.product.price > 0
        );
      }

      console.log(`✅ QualityAssuranceAgent: Response validated`);
      return state;
    } catch (error) {
      console.error('❌ QualityAssuranceAgent failed:', error);
      state.errors.push({ agent: 'QualityAssuranceAgent', error: error.message });
      return state;
    }
  }
}

// Multi-Agent Orchestrator
class MultiAgentOrchestrator {
  constructor() {
    this.agents = [
      new IntentAgent(),
      new ProductRetrievalAgent(),
      new ProductCurationAgent(),
      new ResponseGenerationAgent(),
      new QualityAssuranceAgent()
    ];
  }

  async processQuery(userQuery, context = {}) {
    console.log('🚀 MultiAgentOrchestrator: Starting processing...');
    
    // Initialize state
    const state = new AgentState();
    state.userQuery = userQuery;
    state.context = context;
    state.conversationHistory = context.conversationHistory || [];
    state.userPreferences = context.userPreferences || {};

    try {
      // Execute agents in sequence
      for (const agent of this.agents) {
        console.log(`🔄 Executing ${agent.name}...`);
        await agent.execute(state);
        
        // Early exit if critical error
        if (state.errors.length > 0 && state.errors.some(e => e.agent === 'IntentAgent')) {
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
          agents: this.agents.map(a => a.name)
        },
        timestamp: new Date().toISOString()
      };

      console.log('✅ MultiAgentOrchestrator: Processing complete');
      return response;

    } catch (error) {
      console.error('❌ MultiAgentOrchestrator failed:', error);
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
export const multiAgentOrchestrator = new MultiAgentOrchestrator();
export { AgentState, BaseAgent, IntentAgent, ProductRetrievalAgent, ProductCurationAgent, ResponseGenerationAgent, QualityAssuranceAgent };

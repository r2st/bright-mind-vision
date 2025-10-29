// LangChain-style Agent Implementation
import Groq from 'groq-sdk';
import { GROQ_CONFIG } from '../config/groq-config.js';
import { enhancedProducts, filterProducts, calculateBM25Score, calculateBusinessScore } from '../data/enhancedProducts.js';

const groq = new Groq({ apiKey: GROQ_CONFIG.apiKey });

// LangChain-style Tools
class ProductSearchTool {
  constructor() {
    this.name = 'product_search';
    this.description = 'Search for luxury products based on query and filters';
  }

  async execute(query, filters = {}) {
    console.log('🔍 ProductSearchTool: Searching products...');
    
    const candidates = filterProducts(enhancedProducts, filters.category || 'luxury', filters.tags || []);
    
    const scoredCandidates = candidates.map(product => {
      const bm25Score = calculateBM25Score(product, query, filters.tags || []);
      const businessScore = calculateBusinessScore(product);
      const combinedScore = (bm25Score * 0.5) + (businessScore * 0.3) + (product.rating / 5 * 0.2);
      
      return {
        ...product,
        bm25Score,
        businessScore,
        combinedScore
      };
    });

    return scoredCandidates
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 10);
  }
}

class ProductCurationTool {
  constructor() {
    this.name = 'product_curation';
    this.description = 'Curate and rank products based on user preferences and context';
  }

  async execute(products, userQuery, preferences = {}) {
    console.log('🎨 ProductCurationTool: Curating products...');
    
    const messages = [
      {
        role: 'system',
        content: `You are an expert product curator. Select the best 3-5 products from the provided list.
        
        Consider:
        - User query relevance
        - Product quality and ratings
        - Price appropriateness
        - Brand reputation
        - User preferences
        
        Return JSON: {"selectedProducts": [{"productId": "P001", "confidence": 0.9, "reason": "..."}]}`
      },
      {
        role: 'user',
        content: `Query: ${userQuery}
        Products: ${products.map(p => `${p.id}: ${p.name} - ${p.price} AED`).join('\n')}
        Preferences: ${JSON.stringify(preferences)}`
      }
    ];

    try {
      const response = await groq.chat.completions.create({
        model: GROQ_CONFIG.models.versatile,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return result.selectedProducts.map(selection => {
        const product = products.find(p => p.id === selection.productId);
        return {
          productId: selection.productId,
          confidence: selection.confidence,
          reason: selection.reason,
          product: product
        };
      }).filter(rec => rec.product);
    } catch (error) {
      console.error('ProductCurationTool failed:', error);
      return products.slice(0, 3).map((product, index) => ({
        productId: product.id,
        confidence: 0.7,
        reason: 'Top recommendation',
        product: product
      }));
    }
  }
}

class ResponseGenerationTool {
  constructor() {
    this.name = 'response_generation';
    this.description = 'Generate natural language responses for product recommendations';
  }

  async execute(userQuery, recommendations, context = {}) {
    console.log('💬 ResponseGenerationTool: Generating response...');
    
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
        
        Return JSON:
        {
          "opening": "Welcome message",
          "items": [{"id": "P001", "headline": "Product Name", "one_liner": "Description"}],
          "cta": "Call to action",
          "quick_replies": ["Option 1", "Option 2", "Option 3"]
        }`
      },
      {
        role: 'user',
        content: `Query: ${userQuery}
        Recommendations: ${JSON.stringify(recommendations.map(r => ({
          id: r.productId,
          name: r.product.name,
          price: r.product.price,
          reason: r.reason
        })))}
        Context: ${JSON.stringify(context)}`
      }
    ];

    try {
      const response = await groq.chat.completions.create({
        model: GROQ_CONFIG.models.versatile,
        temperature: 0.5,
        response_format: { type: 'json_object' },
        messages
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('ResponseGenerationTool failed:', error);
      return {
        opening: "I'm here to help you find luxury products!",
        items: recommendations.slice(0, 3).map(r => ({
          id: r.productId,
          headline: r.product.name,
          one_liner: r.reason
        })),
        cta: "What would you like to explore next?",
        quick_replies: ["View more products", "Get recommendations", "Ask questions"]
      };
    }
  }
}

// LangChain-style Agent
class LangChainAgent {
  constructor() {
    this.tools = [
      new ProductSearchTool(),
      new ProductCurationTool(),
      new ResponseGenerationTool()
    ];
    this.groq = groq;
  }

  async execute(userQuery, context = {}) {
    console.log('🤖 LangChainAgent: Processing query...');
    
    try {
      // Step 1: Intent Classification
      const intent = await this.classifyIntent(userQuery);
      console.log('🎯 Intent classified:', intent);
      
      // Step 2: Tool Selection and Execution
      let products = [];
      let recommendations = [];
      
      if (intent.type === 'product_request') {
        // Use ProductSearchTool
        const searchTool = this.tools.find(t => t.name === 'product_search');
        products = await searchTool.execute(userQuery, {
          category: intent.category,
          tags: intent.entities
        });
        
        // Use ProductCurationTool
        const curationTool = this.tools.find(t => t.name === 'product_curation');
        recommendations = await curationTool.execute(products, userQuery, context.preferences);
      }
      
      // Step 3: Response Generation
      const responseTool = this.tools.find(t => t.name === 'response_generation');
      const naturalResponse = await responseTool.execute(userQuery, recommendations, context);
      
      return {
        success: true,
        message: naturalResponse.opening,
        recommendations,
        naturalResponse,
        metadata: {
          intent,
          totalProducts: products.length,
          selectedProducts: recommendations.length,
          tools: this.tools.map(t => t.name)
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('LangChainAgent failed:', error);
      return {
        success: false,
        message: 'I encountered an error while processing your request.',
        recommendations: [],
        naturalResponse: null,
        metadata: {
          error: error.message,
          tools: this.tools.map(t => t.name)
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async classifyIntent(userQuery) {
    const messages = [
      {
        role: 'system',
        content: `Classify the user query into one of these categories:
        - greeting: "hi", "hello", "hey"
        - help: "help", "what can you do"
        - product_request: specific product queries
        - non_product: queries about cars, houses, etc.
        
        Return JSON: {"type": "category", "confidence": 0.0-1.0, "entities": [], "category": "fashion"}`
      },
      {
        role: 'user',
        content: userQuery
      }
    ];

    try {
      const response = await this.groq.chat.completions.create({
        model: GROQ_CONFIG.models.primary,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Intent classification failed:', error);
      return { type: 'product_request', confidence: 0.5, entities: [], category: 'luxury' };
    }
  }
}

// Export the agent
export const langChainAgent = new LangChainAgent();
export { ProductSearchTool, ProductCurationTool, ResponseGenerationTool, LangChainAgent };

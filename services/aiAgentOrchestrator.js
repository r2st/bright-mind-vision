import { enhancedRAGService } from './enhancedRAGService.js';
import Groq from 'groq-sdk';

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

/**
 * AI Agent Orchestrator
 * Coordinates multiple specialized AI agents for intelligent product recommendations
 */
class AIAgentOrchestrator {
  constructor() {
    this.models = {
      primary: 'llama-3.1-8b-instant',
      versatile: 'llama-3.3-70b-versatile',
      guard: 'meta-llama/llama-guard-4-12b'
    };
  }

  async processQuery(query, context = {}) {
    try {
      console.log('🤖 AI Agent Orchestrator processing query:', query);

      // Step 1: Intent Analysis Agent
      const intent = await this.intentAnalysisAgent(query);
      console.log('🎯 Intent Analysis:', intent);

      // Step 2: Context Management Agent
      const updatedContext = await this.contextManagementAgent(query, context, intent);
      console.log('📝 Context Management:', updatedContext);

      // Step 3: Product Search Agent
      const products = await this.productSearchAgent(query, updatedContext);
      console.log('🔍 Product Search found:', products.length, 'products');

      // Step 4: Response Generation Agent
      const response = await this.responseGenerationAgent(query, products, updatedContext);
      console.log('💬 Response Generation completed');

      // Step 5: Quality Assurance Agent
      const finalResponse = await this.qualityAssuranceAgent(response, updatedContext);
      console.log('✅ Quality Assurance completed');

      return {
        success: true,
        naturalResponse: finalResponse,
        metadata: {
          intent,
          context: updatedContext,
          productsFound: products.length,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ AI Agent Orchestrator error:', error);
      return {
        success: false,
        error: error.message,
        naturalResponse: {
          opening: "I apologize, but I'm having trouble processing your request right now.",
          items: [],
          cta: "Please try again or ask me something else.",
          quick_replies: ["Try again", "Get help", "Start over"]
        }
      };
    }
  }

  async intentAnalysisAgent(query) {
    try {
      const response = await groq.chat.completions.create({
        model: this.models.primary,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `You are an intent analysis agent for a luxury shopping assistant.
            Analyze the user query and determine:
            1. Primary intent (product_search, category_browse, brand_inquiry, price_inquiry, comparison, general_help, non_product)
            2. Product categories mentioned (bags, watches, jewelry, skincare, wellness, fashion)
            3. Brands mentioned (Chanel, Hermès, Louis Vuitton, Rolex, etc.)
            4. Price sensitivity (budget_conscious, luxury_focused, price_agnostic)
            5. Urgency level (immediate, browsing, research)
            
            Return JSON format with these fields.`
          },
          {
            role: 'user',
            content: query
          }
        ]
      });

      const content = response.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch {
        return {
          primary_intent: 'product_search',
          categories: [],
          brands: [],
          price_sensitivity: 'luxury_focused',
          urgency: 'browsing'
        };
      }
    } catch (error) {
      console.error('Intent Analysis Agent error:', error);
      return {
        primary_intent: 'product_search',
        categories: [],
        brands: [],
        price_sensitivity: 'luxury_focused',
        urgency: 'browsing'
      };
    }
  }

  async contextManagementAgent(query, context, intent) {
    try {
      const response = await groq.chat.completions.create({
        model: this.models.primary,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `You are a context management agent. Update the conversation context based on:
            1. Current query
            2. Previous context
            3. Intent analysis
            
            Maintain conversation flow and update relevant context fields.
            Return JSON with updated context.`
          },
          {
            role: 'user',
            content: `Query: "${query}"
            Previous Context: ${JSON.stringify(context)}
            Intent: ${JSON.stringify(intent)}`
          }
        ]
      });

      const content = response.choices[0].message.content;
      try {
        const updatedContext = JSON.parse(content);
        return {
          ...context,
          ...updatedContext,
          lastQuery: query,
          timestamp: new Date().toISOString()
        };
      } catch {
        return {
          ...context,
          lastQuery: query,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Context Management Agent error:', error);
      return {
        ...context,
        lastQuery: query,
        timestamp: new Date().toISOString()
      };
    }
  }

  async productSearchAgent(query, context) {
    try {
      // Use the enhanced RAG service for product search
      const products = await enhancedRAGService.searchProducts(query, context);
      
      // Convert database products to the expected format
      return products.map(product => ({
        sku: product.sku,
        title: product.title,
        brand: product.brand,
        category: JSON.parse(product.category),
        price: {
          amount: product.price,
          currency: product.currency
        },
        description: product.description,
        rating: product.rating,
        tags: JSON.parse(product.tags || '[]'),
        similarity: product.similarity || 0
      }));
    } catch (error) {
      console.error('Product Search Agent error:', error);
      return [];
    }
  }

  async responseGenerationAgent(query, products, context) {
    try {
      // Use the enhanced RAG service for response generation
      return await enhancedRAGService.generateResponse(query, products, context);
    } catch (error) {
      console.error('Response Generation Agent error:', error);
      return {
        opening: "Here are some luxury products I found for you:",
        items: products.slice(0, 3).map(p => ({
          headline: p.title,
          price: `${p.price.amount} ${p.price.currency}`,
          one_liner: p.description?.substring(0, 60) + '...' || 'Luxury product',
          image: '🛍️'
        })),
        cta: "Which product interests you most?",
        quick_replies: ["Show me more", "Different category", "Get help"]
      };
    }
  }

  async qualityAssuranceAgent(response, context) {
    try {
      const responseText = JSON.stringify(response);
      
      const qaResponse = await groq.chat.completions.create({
        model: this.models.guard,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `You are a quality assurance agent. Review the response for:
            1. Appropriate content (no harmful or inappropriate material)
            2. Correct pricing format (AED currency)
            3. Proper product information
            4. Appropriate quick replies
            5. Professional tone
            
            Return the response as-is if it passes QA, or return an improved version.
            Always return valid JSON format.`
          },
          {
            role: 'user',
            content: responseText
          }
        ]
      });

      const content = qaResponse.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch {
        return response; // Return original if parsing fails
      }
    } catch (error) {
      console.error('Quality Assurance Agent error:', error);
      return response; // Return original if QA fails
    }
  }

  // Quick reply handler with AI context
  async handleQuickReply(quickReplyNumber, context) {
    try {
      const quickReplyQueries = {
        1: context.lastCategory ? `more ${context.lastCategory} products` : 'luxury handbags',
        2: context.lastCategory ? 'related products' : 'luxury skincare',
        3: context.lastCategory ? 'all luxury products' : 'wellness products'
      };

      const query = quickReplyQueries[quickReplyNumber] || 'luxury products';
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

export const aiAgentOrchestrator = new AIAgentOrchestrator();
export default aiAgentOrchestrator;

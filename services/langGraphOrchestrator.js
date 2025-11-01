import { llmProvider } from './llmProvider.js';
import { memoryService } from './memoryService.js';
import { enhancedRAGService } from './enhancedRAGService.js';

/**
 * LangGraph-inspired State-Based Orchestrator
 * Implements function calling, memory, and state management
 */
class LangGraphOrchestrator {
  constructor() {
    this.models = llmProvider.getModels();
    
    // Define available tools/functions
    this.tools = [
      {
        type: 'function',
        function: {
          name: 'search_products',
          description: 'Search for luxury products by category, brand, or keyword',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Product category (handbags, watches, jewelry, skincare, wellness)'
              },
              brand: {
                type: 'string',
                description: 'Specific brand name'
              },
              keyword: {
                type: 'string',
                description: 'Search keyword'
              },
              price_range: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' }
                }
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_customer_preferences',
          description: 'Retrieve customer preferences and purchase history',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID'
              }
            },
            required: ['customer_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'update_preferences',
          description: 'Update customer preferences based on interaction',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID'
              },
              category: {
                type: 'string',
                description: 'Preferred category'
              },
              brand: {
                type: 'string',
                description: 'Preferred brand'
              }
            },
            required: ['customer_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'check_stock',
          description: 'Check product availability and stock levels',
          parameters: {
            type: 'object',
            properties: {
              product_sku: {
                type: 'string',
                description: 'Product SKU to check'
              },
              product_name: {
                type: 'string',
                description: 'Product name to check'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'compare_products',
          description: 'Compare multiple products side by side',
          parameters: {
            type: 'object',
            properties: {
              product_skus: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of product SKUs to compare'
              },
              comparison_criteria: {
                type: 'array',
                items: { type: 'string' },
                description: 'Criteria to compare (price, rating, features, etc.)'
              }
            },
            required: ['product_skus']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_product_details',
          description: 'Get detailed information about a specific product',
          parameters: {
            type: 'object',
            properties: {
              product_sku: {
                type: 'string',
                description: 'Product SKU'
              },
              product_name: {
                type: 'string',
                description: 'Product name'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_wishlist',
          description: 'Add products to customer wishlist',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID'
              },
              product_sku: {
                type: 'string',
                description: 'Product SKU to add'
              },
              product_name: {
                type: 'string',
                description: 'Product name'
              }
            },
            required: ['customer_id', 'product_sku']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_wishlist',
          description: 'Retrieve customer wishlist',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID'
              }
            },
            required: ['customer_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'calculate_shipping',
          description: 'Calculate shipping costs and delivery time',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID'
              },
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    sku: { type: 'string' },
                    quantity: { type: 'number' }
                  }
                },
                description: 'Products to calculate shipping for'
              },
              destination: {
                type: 'string',
                description: 'Delivery destination'
              }
            },
            required: ['customer_id', 'products']
          }
        }
      }
    ];
  }

  // Tool handlers
  async handleToolCall(toolName, arguments_) {
    try {
      switch (toolName) {
        case 'search_products':
          return await this.handleSearchProducts(arguments_);
        case 'get_customer_preferences':
          return await this.handleGetCustomerPreferences(arguments_);
        case 'update_preferences':
          return await this.handleUpdatePreferences(arguments_);
        case 'check_stock':
          return await this.handleCheckStock(arguments_);
        case 'compare_products':
          return await this.handleCompareProducts(arguments_);
        case 'get_product_details':
          return await this.handleGetProductDetails(arguments_);
        case 'create_wishlist':
          return await this.handleCreateWishlist(arguments_);
        case 'get_wishlist':
          return await this.handleGetWishlist(arguments_);
        case 'calculate_shipping':
          return await this.handleCalculateShipping(arguments_);
        default:
          return { error: `Unknown tool: ${toolName}` };
      }
    } catch (error) {
      console.error(`Error handling tool ${toolName}:`, error);
      return { error: error.message };
    }
  }

  async handleSearchProducts(args) {
    let query = '';
    if (args.category) query += args.category + ' ';
    if (args.brand) query += args.brand + ' ';
    if (args.keyword) query += args.keyword;
    
    const products = await enhancedRAGService.searchProducts(query || 'luxury products', {});
    return {
      success: true,
      products: products.slice(0, 5).map(p => ({
        title: p.title,
        brand: p.brand,
        price: typeof p.price === 'object' ? p.price : { amount: p.price || 0, currency: p.currency || 'AED' },
        description: p.description
      }))
    };
  }

  async handleGetCustomerPreferences(args) {
    const preferences = memoryService.getCustomerPreferences(args.customer_id);
    return {
      success: true,
      preferences
    };
  }

  async handleUpdatePreferences(args) {
    const preferences = memoryService.getCustomerPreferences(args.customer_id);
    
    if (args.category && !preferences.preferred_categories.includes(args.category)) {
      preferences.preferred_categories.push(args.category);
    }
    if (args.brand && !preferences.preferred_brands.includes(args.brand)) {
      preferences.preferred_brands.push(args.brand);
    }
    
    memoryService.updateCustomerPreferences(args.customer_id, preferences);
    return {
      success: true,
      message: 'Preferences updated'
    };
  }

  async handleCheckStock(args) {
    // Simulate stock check - in real implementation, this would query inventory system
    const products = await enhancedRAGService.searchProducts(
      args.product_name || args.product_sku || 'luxury products', 
      {}
    );
    
    const product = products.find(p => 
      p.sku === args.product_sku || 
      p.title.toLowerCase().includes((args.product_name || '').toLowerCase())
    );
    
    if (!product) {
      return {
        success: false,
        message: 'Product not found'
      };
    }
    
    // Simulate stock levels
    const stockLevel = Math.floor(Math.random() * 10) + 1;
    const isInStock = stockLevel > 0;
    
    return {
      success: true,
      product: {
        sku: product.sku,
        title: product.title,
        in_stock: isInStock,
        stock_level: stockLevel,
        estimated_delivery: isInStock ? '2-3 business days' : 'Out of stock'
      }
    };
  }

  async handleCompareProducts(args) {
    const { product_skus, comparison_criteria = ['price', 'rating', 'features'] } = args;
    
    // Get products by SKUs
    const products = [];
    for (const sku of product_skus) {
      const searchResults = await enhancedRAGService.searchProducts(sku, {});
      const product = searchResults.find(p => p.sku === sku);
      if (product) {
        products.push(product);
      }
    }
    
    if (products.length === 0) {
      return {
        success: false,
        message: 'No products found for comparison'
      };
    }
    
    // Create comparison table
    const comparison = {
      criteria: comparison_criteria,
      products: products.map(p => ({
        sku: p.sku,
        title: p.title,
        brand: p.brand,
        price: typeof p.price === 'object' ? p.price : { amount: p.price || 0, currency: p.currency || 'AED' },
        rating: p.rating,
        description: p.description
      }))
    };
    
    return {
      success: true,
      comparison
    };
  }

  async handleGetProductDetails(args) {
    const products = await enhancedRAGService.searchProducts(
      args.product_name || args.product_sku || 'luxury products', 
      {}
    );
    
    const product = products.find(p => 
      p.sku === args.product_sku || 
      p.title.toLowerCase().includes((args.product_name || '').toLowerCase())
    );
    
    if (!product) {
      return {
        success: false,
        message: 'Product not found'
      };
    }
    
    return {
      success: true,
      product: {
        sku: product.sku,
        title: product.title,
        brand: product.brand,
        price: typeof product.price === 'object' ? product.price : { amount: product.price || 0, currency: product.currency || 'AED' },
        description: product.description,
        rating: product.rating,
        category: typeof product.category === 'string' ? JSON.parse(product.category) : product.category,
        tags: typeof product.tags === 'string' ? JSON.parse(product.tags || '[]') : (product.tags || [])
      }
    };
  }

  async handleCreateWishlist(args) {
    const { customer_id, product_sku, product_name } = args;
    
    // Get product details
    const products = await enhancedRAGService.searchProducts(product_name || product_sku, {});
    const product = products.find(p => p.sku === product_sku);
    
    if (!product) {
      return {
        success: false,
        message: 'Product not found'
      };
    }
    
    // Add to wishlist (stored in customer preferences)
    const preferences = memoryService.getCustomerPreferences(customer_id);
    if (!preferences.wishlist) {
      preferences.wishlist = [];
    }
    
    const wishlistItem = {
      sku: product.sku,
      title: product.title,
      brand: product.brand,
      price: typeof product.price === 'object' ? product.price : { amount: product.price || 0, currency: product.currency || 'AED' },
      added_at: new Date().toISOString()
    };
    
    // Check if already in wishlist
    const exists = preferences.wishlist.some(item => item.sku === product_sku);
    if (!exists) {
      preferences.wishlist.push(wishlistItem);
      memoryService.updateCustomerPreferences(customer_id, preferences);
    }
    
    return {
      success: true,
      message: exists ? 'Product already in wishlist' : 'Product added to wishlist',
      wishlist_item: wishlistItem
    };
  }

  async handleGetWishlist(args) {
    const preferences = memoryService.getCustomerPreferences(args.customer_id);
    const wishlist = preferences.wishlist || [];
    
    return {
      success: true,
      wishlist,
      count: wishlist.length
    };
  }

  async handleCalculateShipping(args) {
    const { customer_id, products, destination = 'UAE' } = args;
    
    // Simulate shipping calculation
    const baseShipping = 50; // AED
    const perItemShipping = 25; // AED per item
    const totalItems = products.reduce((sum, item) => sum + item.quantity, 0);
    
    let shippingCost = baseShipping + (perItemShipping * totalItems);
    let deliveryTime = '2-3 business days';
    
    // Premium shipping for luxury items
    if (totalItems > 3) {
      shippingCost = baseShipping + (perItemShipping * totalItems) + 100; // Premium fee
      deliveryTime = '1-2 business days (Express)';
    }
    
    // Free shipping over certain amount
    const totalValue = products.reduce((sum, item) => {
      // This would normally calculate from actual product prices
      return sum + (item.quantity * 1000); // Simulated price
    }, 0);
    
    if (totalValue > 10000) {
      shippingCost = 0;
      deliveryTime = '1-2 business days (Free Express)';
    }
    
    return {
      success: true,
      shipping: {
        cost: shippingCost,
        currency: 'AED',
        delivery_time: deliveryTime,
        destination,
        free_shipping_threshold: 10000,
        total_items: totalItems,
        estimated_total_value: totalValue
      }
    };
  }

  // State definition
  getInitialState(conversationId, customerId) {
    return {
      conversationId,
      customerId,
      messages: [],
      currentIntent: null,
      products: [],
      context: {},
      memory: memoryService.getConversationContext(conversationId, customerId),
      preferences: customerId ? memoryService.getCustomerPreferences(customerId) : null,
      step: 'intent_classification'
    };
  }

  // State transitions (LangGraph-style nodes)
  async processQuery(query, conversationId, customerId = null) {
    // Initialize state
    let state = this.getInitialState(conversationId, customerId);
    
    // IMPORTANT: Store the query in state so it's available throughout the pipeline
    state.query = query;
    
    // Load conversation history
    const history = memoryService.getConversationHistory(conversationId, 5);
    state.messages = history;
    
    // Add current message
    memoryService.storeMessage(conversationId, 'user', query);
    
    // Handle special quick reply queries
    const queryLower = query.toLowerCase().trim();
    if (queryLower === 'show me more' || queryLower.includes('more')) {
      // Retrieve last category from memory
      const context = memoryService.getConversationContext(conversationId, customerId);
      if (context.lastCategory) {
        query = context.lastCategory; // Use last category for "more"
      }
    } else if (queryLower === 'different category' || queryLower.includes('different category')) {
      // Show category selection options
      return {
        success: true,
        naturalResponse: {
          opening: "Great! What category would you like to explore?",
          items: [],
          cta: "Choose a category to browse:",
          quick_replies: ["Show me handbags", "Browse watches", "Explore jewelry", "Skincare products", "Wellness items", "View all products"]
        },
        metadata: {
          intent: 'category_selection',
          conversationId,
          timestamp: new Date().toISOString()
        }
      };
    } else if (queryLower === 'get help' || (queryLower.includes('help') && !queryLower.includes('find'))) {
      // Show help options
      return {
        success: true,
        naturalResponse: {
          opening: "I'm here to help you find the perfect luxury products! How can I assist you?",
          items: [],
          cta: "What would you like to do?",
          quick_replies: ["Show me handbags", "Browse watches", "Explore jewelry", "View all products"]
        },
        metadata: {
          intent: 'help',
          conversationId,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    try {
      // Step 1: Intent Classification
      state = await this.intentClassificationNode(state, query);
      
      // Step 2: Memory Retrieval
      state = await this.memoryRetrievalNode(state);
      
      // Step 3: Tool Selection & Execution
      state = await this.toolExecutionNode(state, query);
      
      // Step 4: Response Generation
      state = await this.responseGenerationNode(state);
      
      // Step 5: Memory Update (includes lastCategory extraction)
      await this.memoryUpdateNode(state);
      
      // Step 6: Generate final response
      return this.formatResponse(state);
      
    } catch (error) {
      console.error('❌ Error in LangGraph orchestrator:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Query was:', query);
      try {
        console.error('❌ State at error:', JSON.stringify(state, null, 2));
      } catch (jsonError) {
        console.error('❌ Could not serialize state (may contain circular refs)');
        console.error('❌ State keys:', Object.keys(state || {}));
      }
      return {
        success: false,
        error: error.message,
        naturalResponse: {
          opening: "I'm sorry, I encountered an error. Please try again.",
          items: [],
          cta: "How can I help you find luxury products?",
          quick_replies: ["Show me handbags", "Browse watches", "Explore jewelry"]
        }
      };
    }
  }

  async intentClassificationNode(state, query) {
    // Quick, non-LLM classification for resilience (handles greetings without LLM)
    const q = (query || '').toLowerCase().trim();
    const isGreeting = /^(hi|hello|hey|hola|how are you\b|good (morning|afternoon|evening)\b)/i.test(q);
    if (isGreeting) {
      state.currentIntent = 'greeting';
      return state;
    }

    // Try LLM-based classification, but guard against provider errors
    try {
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `Classify the user's intent. Options: 
          - product_search: User wants to find products
          - category_browse: User wants to browse categories
          - brand_inquiry: User asks about specific brands
          - price_inquiry: User asks about pricing
          - stock_check: User wants to check product availability
          - product_comparison: User wants to compare products
          - product_details: User wants detailed product information
          - wishlist_operation: User wants to manage wishlist
          - shipping_calculation: User wants shipping information
          - preference_update: User wants to update preferences
          - greeting: User says hello, how are you, etc.
          - casual_conversation: General conversation not related to shopping
          
          Return JSON with intent field.`
        },
        {
          role: 'user',
          content: query
        }
      ], {
        model: 'primary',
        temperature: 0
      });

      try {
        const intent = JSON.parse(response.choices[0].message.content);
        state.currentIntent = intent.intent || 'product_search';
      } catch {
        // Parse fallback
        const queryLower = q;
        if (queryLower.includes('prefer') || queryLower.includes('like')) {
          state.currentIntent = 'preference_update';
        } else {
          state.currentIntent = 'product_search';
        }
      }
    } catch (e) {
      // Provider error fallback – avoid throwing, select sensible default
      const queryLower = q;
      if (queryLower.includes('prefer') || queryLower.includes('like')) {
        state.currentIntent = 'preference_update';
      } else {
        state.currentIntent = 'product_search';
      }
    }

    return state;
  }

  async memoryRetrievalNode(state) {
    // Retrieve relevant context from memory
    if (state.customerId) {
      state.preferences = memoryService.getCustomerPreferences(state.customerId);
    }
    
    // Use conversation history to inform context
    const recentMessages = state.messages.slice(-3);
    state.context.recentMessages = recentMessages.map(m => `${m.role}: ${m.content}`);
    
    // Extract lastCategory from memory to maintain context for "Show me more"
    if (state.memory && state.memory.lastCategory) {
      state.context.lastCategory = state.memory.lastCategory;
    }
    
    return state;
  }

  async toolExecutionNode(state, query) {
    // Store query in state for later use
    state.query = query;
    
    // Handle non-product queries directly
    if (state.currentIntent === 'greeting' || state.currentIntent === 'casual_conversation') {
      state.products = [];
      state.toolResponse = null;
      return state;
    }
    
    try {
      // Use LLM with function calling to determine which tools to use
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `You are a luxury shopping assistant with access to powerful tools. Use the appropriate tools based on the user's request:

          - For product searches: use search_products
          - For stock checks: use check_stock  
          - For product comparisons: use compare_products
          - For detailed product info: use get_product_details
          - For wishlist operations: use create_wishlist or get_wishlist
          - For shipping calculations: use calculate_shipping
          - For preference updates: use update_preferences
          
          Current intent: ${state.currentIntent}
          Customer preferences: ${JSON.stringify(state.preferences)}
          
          Always use tools when the user asks for specific actions like "check stock", "compare", "add to wishlist", etc.`
        },
        {
          role: 'user',
          content: query
        }
      ], {
        model: 'versatile',
        temperature: 0.3,
        tools: this.tools,
        tool_choice: 'auto'
      });

      const message = response.choices[0].message;
      
      // Execute tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolResults = [];
        
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          let args;
          try {
            args = typeof toolCall.function.arguments === 'string'
              ? JSON.parse(toolCall.function.arguments)
              : (toolCall.function.arguments || {});
          } catch (e) {
            console.warn('Failed to parse tool arguments, defaulting to {}', e);
            args = {};
          }
          
          // Inject customer_id if available
          if (state.customerId && !args.customer_id) {
            args.customer_id = state.customerId;
          }
          
          const result = await this.handleToolCall(toolName, args);
          toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolName,
            content: JSON.stringify(result)
          });
          
          // Store products if search_products was called
          if (toolName === 'search_products' && result.success) {
            state.products = result.products;
          }
        }
        
          // Get final response from LLM with tool results
          const finalResponse = await llmProvider.chatCompletion([
            {
              role: 'system',
              content: `Generate a natural, engaging response for a luxury shopping assistant. Use the tool results to provide accurate product recommendations.`
            },
            {
              role: 'user',
              content: query
            },
            ...toolResults,
            {
              role: 'user',
              content: 'Generate a response based on the tool results.'
            }
          ], {
            model: 'versatile',
            temperature: 0.7,
            // Ensure NLG uses the configured provider/model override (e.g., Gemini)
            provider: process.env.LLM_PROVIDER_NLG || null,
            modelName: process.env.LLM_NLG_MODEL || null
          });
        
        state.toolResponse = finalResponse.choices[0].message.content;
      } else {
        // No tool calls needed, use direct query
        const products = await enhancedRAGService.searchProducts(query, state.context);
        state.products = products;
      }
    } catch (e) {
      console.error('Tool selection/generation failed, falling back to RAG only:', e);
      const products = await enhancedRAGService.searchProducts(query, state.context);
      state.products = products;
    }

    return state;
  }

  async responseGenerationNode(state) {
    console.log('[LangGraph] responseGenerationNode - currentIntent:', state.currentIntent);
    console.log('[LangGraph] responseGenerationNode - has toolResponse:', !!state.toolResponse);
    console.log('[LangGraph] responseGenerationNode - query:', state.query);
    
    if (state.toolResponse) {
      // Use tool-generated response
      state.response = state.toolResponse;
      console.log('[LangGraph] Using toolResponse');
    } else if (state.currentIntent === 'greeting' || state.currentIntent === 'casual_conversation') {
      // Generate natural, varied greeting responses using LLM
      console.log('[LangGraph] Generating greeting response...');
      try {
        const greetingResponse = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `You are a friendly, luxury shopping assistant for a high-end boutique in Dubai. 
            When the user greets you, respond naturally and warmly. Match the tone of their greeting:
            - If they just say "hi" or "hello", greet them back enthusiastically and offer help
            - If they ask "how are you", respond naturally about how you're doing, then pivot to offering help
            - Keep responses warm, personal, and engaging
            - Always end by asking what they'd like to explore or offering to help them find products
            - DO NOT use trailing ellipsis (...) - keep responses complete and natural
            - Sound human and conversational, not robotic
            
            Return your response as a natural greeting that acknowledges what they said. Keep it conversational and friendly (2-3 sentences max).`
          },
          {
            role: 'user',
            content: state.query || 'Hello'
          }
        ], {
          model: 'primary',
          temperature: 0.8, // Higher temperature for more varied, natural responses
          provider: process.env.LLM_PROVIDER_NLG || null,
          modelName: process.env.LLM_NLG_MODEL || null
        });

        const greetingText = greetingResponse.choices[0].message.content.trim();
        
        state.response = {
          opening: greetingText,
          items: [],
          cta: "I can help you discover luxury handbags, watches, jewelry, skincare, and wellness products. What would you like to explore today?",
          quick_replies: ["Show me handbags", "Browse watches", "Explore jewelry", "View all products"]
        };
        console.log('[LangGraph] Greeting response generated:', JSON.stringify(state.response, null, 2));
      } catch (error) {
        console.error('[LangGraph] Error generating greeting response, using fallback:', error);
        // Fallback to varied responses based on query
        const queryLower = (state.query || '').toLowerCase();
        let opening;
        
        if (queryLower.includes('how are you') || queryLower.includes('how are you doing')) {
          opening = "I'm doing great, thank you for asking! 😊 I'm here and ready to help you find the perfect luxury products. What would you like to explore today?";
        } else if (queryLower.includes('good morning') || queryLower.includes('good afternoon') || queryLower.includes('good evening')) {
          opening = `Hello! ${queryLower.includes('morning') ? 'Good morning' : queryLower.includes('afternoon') ? 'Good afternoon' : 'Good evening'}! I'm here to help you discover amazing luxury products. What can I help you find today?`;
        } else {
          opening = "Hello! 👋 Welcome! I'm your AI shopping assistant and I'm excited to help you find the perfect luxury products. What would you like to explore today?";
        }
        
        state.response = {
          opening: opening,
          items: [],
          cta: "I can help you discover luxury handbags, watches, jewelry, skincare, and wellness products.",
          quick_replies: ["Show me handbags", "Browse watches", "Explore jewelry", "View all products"]
        };
        console.log('[LangGraph] Greeting fallback response set:', JSON.stringify(state.response, null, 2));
      }
    } else {
      // Generate response from products
      console.log('[LangGraph] Generating product response...');
      state.response = await enhancedRAGService.generateResponse(
        state.query || 'luxury products',
        state.products,
        state.context
      );
      console.log('[LangGraph] Product response generated:', state.response ? 'Yes' : 'No');
    }

    console.log('[LangGraph] Final state.response:', state.response ? {
      hasOpening: !!state.response.opening,
      itemsCount: state.response.items?.length || 0,
      hasCta: !!state.response.cta,
      hasQuickReplies: !!state.response.quick_replies
    } : 'NULL');
    
    return state;
  }

  async memoryUpdateNode(state) {
    // Extract category from products or query for context
    let lastCategory = state.context.lastCategory;
    if (!lastCategory && state.products && state.products.length > 0) {
      // Try to infer category from first product
      const firstProduct = state.products[0];
      if (firstProduct.category) {
        const categories = typeof firstProduct.category === 'string' 
          ? JSON.parse(firstProduct.category) 
          : firstProduct.category;
        if (Array.isArray(categories)) {
          // Map to simple category names
          const catLower = categories.join(' ').toLowerCase();
          if (catLower.includes('bag') || catLower.includes('handbag')) lastCategory = 'handbags';
          else if (catLower.includes('watch')) lastCategory = 'watches';
          else if (catLower.includes('jewelry')) lastCategory = 'jewelry';
          else if (catLower.includes('skincare')) lastCategory = 'skincare';
          else if (catLower.includes('wellness')) lastCategory = 'wellness';
        }
      }
    }
    // Also check query for category
    if (!lastCategory && state.query) {
      const q = state.query.toLowerCase();
      if (q.includes('handbag') || q.includes('bag')) lastCategory = 'handbags';
      else if (q.includes('watch')) lastCategory = 'watches';
      else if (q.includes('jewelry')) lastCategory = 'jewelry';
      else if (q.includes('skincare') || q.includes('skin')) lastCategory = 'skincare';
      else if (q.includes('wellness')) lastCategory = 'wellness';
    }
    
    // Update conversation context
    const context = {
      ...state.memory,
      lastCategory,
      messageCount: (state.memory.messageCount || 0) + 1,
      lastIntent: state.currentIntent,
      updatedAt: new Date().toISOString()
    };
    
    memoryService.updateConversationContext(state.conversationId, context);
    
    // Store bot response
    if (state.response && typeof state.response === 'object' && state.response.opening) {
      memoryService.storeMessage(
        state.conversationId,
        'assistant',
        state.response.opening,
        { products: state.products.length, category: lastCategory }
      );
    }

    return state;
  }

  formatResponse(state) {
    console.log('[LangGraph] formatResponse called - state.response:', state.response ? {
      type: typeof state.response,
      hasOpening: !!state.response.opening,
      keys: Object.keys(state.response || {})
    } : 'NULL');
    
    if (state.response && typeof state.response === 'object' && state.response.opening) {
      console.log('[LangGraph] formatResponse - returning state.response');
      return {
        success: true,
        naturalResponse: state.response,
        metadata: {
          intent: state.currentIntent,
          productsFound: state.products.length,
          context: state.memory,
          preferences: state.preferences
        }
      };
    }
    
    console.log('[LangGraph] formatResponse - using fallback response (state.response missing or invalid)');

    // Fallback response - make it context-aware
    // IMPORTANT: Always use current query first, not cached category
    const products = Array.isArray(state.products) ? state.products : [];
    const query = (state.query || '').toLowerCase();
    
    // For greetings, provide a welcoming fallback
    let opening;
    if (state.currentIntent === 'greeting' || state.currentIntent === 'casual_conversation') {
      if (query.includes('how are you') || query.includes('how are you doing')) {
        opening = "I'm doing great, thank you for asking! 😊 I'm here and ready to help you find the perfect luxury products. What would you like to explore today?";
      } else if (query.includes('good morning')) {
        opening = "Good morning! ☀️ I'm here to help you discover amazing luxury products. What can I help you find today?";
      } else if (query.includes('good afternoon')) {
        opening = "Good afternoon! 🌤️ I'm here to help you discover amazing luxury products. What can I help you find today?";
      } else if (query.includes('good evening')) {
        opening = "Good evening! 🌙 I'm here to help you discover amazing luxury products. What can I help you find today?";
      } else {
        opening = "Hello! 👋 Welcome! I'm your AI shopping assistant and I'm excited to help you find the perfect luxury products. What would you like to explore today?";
      }
    } else {
      // Generate context-aware opening based on CURRENT query (not cached category)
      // Check more specific categories first
      opening = "Here are some luxury products I found for you:";
      if (query.includes('jewelry') || query.includes('jewellery') || query.includes('necklace') || query.includes('ring') || query.includes('bracelet') || query.includes('earring') || query.includes('explore jewelry')) {
        opening = "Here are some stunning jewelry pieces for you:";
      } else if (query.includes('bag') || query.includes('handbag') || query.includes('purse')) {
        opening = "Here are some beautiful bags for you:";
      } else if (query.includes('watch') || query.includes('timepiece') || query.includes('browse watches')) {
        opening = "Here are some exquisite watches for you:";
      } else if (query.includes('skincare') || query.includes('skin care') || query.includes('beauty')) {
        opening = "Here are some premium skincare products for you:";
      } else if (query.includes('wellness')) {
        opening = "Here are some wellness products for you:";
      } else if (query.includes('fragrance') || query.includes('perfume')) {
        opening = "Here are some luxury fragrances for you:";
      } else if (state.memory?.lastCategory && !query) {
        // Only use cached category if there's no current query
        const category = state.memory.lastCategory;
        if (category === 'jewelry') opening = "Here are some stunning jewelry pieces for you:";
        else if (category === 'handbags') opening = "Here are some beautiful bags for you:";
        else if (category === 'watches') opening = "Here are some exquisite watches for you:";
        else if (category === 'skincare') opening = "Here are some premium skincare products for you:";
        else if (category === 'wellness') opening = "Here are some wellness products for you:";
      }
    }
    
    return {
      success: true,
      naturalResponse: {
        opening: opening,
        items: products.slice(0, 3).map(p => ({
          headline: p.title,
          price: `${p.price?.amount || p.price || 0} ${p.price?.currency || 'AED'}`,
          one_liner: p.description || 'Luxury product',
          image: '🛍️'
        })),
        cta: state.currentIntent === 'greeting' 
          ? "I can help you discover luxury handbags, watches, jewelry, skincare, and wellness products. What would you like to explore today?"
          : "Which product interests you most?",
        quick_replies: state.currentIntent === 'greeting'
          ? ["Show me handbags", "Browse watches", "Explore jewelry", "View all products"]
          : ["Show me more", "Different category", "Get help"]
      },
      metadata: {
        intent: state.currentIntent,
        productsFound: products.length
      }
    };
  }

  async handleContextualQuickReply(quickReplyNumber, conversationId, customerId, hasRecentCategory) {
    // Handle secondary menu quick replies (Show me more, Different category, Get help)
    if (hasRecentCategory && quickReplyNumber <= 3) {
      if (quickReplyNumber === 1) {
        // "Show me more" - use last category, skip LLM, fast response with pagination
        const context = memoryService.getConversationContext(conversationId, customerId);
        const category = context.lastCategory || 'luxury products';
        const viewCount = context.viewCount || 0; // Track how many times user viewed this category
        
        // Skip intent classification for faster response
        const allProducts = await enhancedRAGService.searchProducts(category, { lastCategory: category, skipIntentClassification: true });
        
        // Paginate: show different products each time
        const startIndex = (viewCount % Math.max(1, Math.floor(allProducts.length / 3))) * 3;
        const top = Array.isArray(allProducts) ? allProducts.slice(startIndex, startIndex + 3) : [];
        
        // Update view count
        context.viewCount = (viewCount || 0) + 1;
        memoryService.updateConversationContext(conversationId, context);
        
        return {
          success: true,
          naturalResponse: {
            opening: top.length > 0 ? 'Here are more luxury products I found for you:' : 'I could not find more products in this category right now.',
            items: top.map(p => ({
              headline: p.title,
              price: `${p.price?.amount || p.price || 0} ${p.price?.currency || 'AED'}`,
              one_liner: p.description || 'Luxury product',
              image: '🛍️'
            })),
            cta: 'Which product interests you most?',
            quick_replies: ['Show me more', 'Different category', 'Get help']
          },
          metadata: {
            intent: 'show_more',
            productsFound: top.length,
            category: context.lastCategory
          }
        };
      } else if (quickReplyNumber === 2) {
        // "Different category" - show category menu (already handled in processQuery, but ensure it works)
        return {
          success: true,
          naturalResponse: {
            opening: "Great! What category would you like to explore?",
            items: [],
            cta: "Choose a category to browse:",
            quick_replies: ["Show me handbags", "Browse watches", "Explore jewelry", "Skincare products", "Wellness items", "View all products"]
          },
          metadata: {
            intent: 'category_selection',
            conversationId
          }
        };
      } else if (quickReplyNumber === 3) {
        // "Get help" - show help menu
        return {
          success: true,
          naturalResponse: {
            opening: "I'm here to help you find the perfect luxury products! How can I assist you?",
            items: [],
            cta: "What would you like to do?",
            quick_replies: ["Show me handbags", "Browse watches", "Explore jewelry", "View all products"]
          },
          metadata: {
            intent: 'help',
            conversationId
          }
        };
      }
    }
    
    // Fallback to regular quick reply handling
    return this.handleQuickReply(quickReplyNumber, conversationId, customerId);
  }

  async handleQuickReply(quickReplyNumber, conversationId, customerId = null) {
    // Deterministic, LLM-free handling for reliability (primary menu)
    // Fast path: skip all LLM calls for category selection
    const quickReplyQueries = {
      1: 'luxury handbags',
      2: 'luxury watches',
      3: 'luxury jewelry',
      4: 'all luxury products'
    };

    const query = quickReplyQueries[quickReplyNumber] || 'luxury products';
    
    // Determine category for memory tracking
    let category = null;
    if (quickReplyNumber === 1) category = 'handbags';
    else if (quickReplyNumber === 2) category = 'watches';
    else if (quickReplyNumber === 3) category = 'jewelry';
    else if (quickReplyNumber === 4) category = 'all';

    try {
      // Ultra-fast path: skip intent classification, direct category search
      const products = await enhancedRAGService.searchProducts(query, { 
        lastCategory: category,
        skipIntentClassification: true 
      });
      const top = Array.isArray(products) ? products.slice(0, 3) : [];

      // Update memory with category
      const context = memoryService.getConversationContext(conversationId, customerId);
      context.lastCategory = category;
      context.viewCount = 0; // Reset view count for new category
      memoryService.updateConversationContext(conversationId, context);

      return {
        success: true,
        naturalResponse: {
          opening: top.length > 0 ? 'Here are some luxury products I found for you:' : 'I could not find products for that right now. Would you like to try another category?',
          items: top.map(p => ({
            headline: p.title,
            price: `${p.price?.amount || p.price || 0} ${p.price?.currency || 'AED'}`,
            one_liner: p.description || 'Luxury product',
            image: '🛍️'
          })),
          cta: 'Which product interests you most?',
          quick_replies: ['Show me more', 'Different category', 'Get help']
        },
        metadata: {
          intent: 'product_search',
          productsFound: top.length,
          category
        }
      };
    } catch (e) {
      // Graceful fallback
      return {
        success: false,
        error: e.message,
        naturalResponse: {
          opening: "I'm sorry, I encountered an error. Please try again.",
          items: [],
          cta: 'How can I help you find luxury products?',
          quick_replies: ['Show me handbags', 'Browse watches', 'Explore jewelry']
        }
      };
    }
  }
}

export const langGraphOrchestrator = new LangGraphOrchestrator();
export default langGraphOrchestrator;

import { llmProvider } from './llmProvider.js';
import { memoryService } from './memoryService.js';
import { enhancedRAGService } from './enhancedRAGService.js';
import { tursoOrderService } from './tursoOrderService.js';

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
      },
      {
        type: 'function',
        function: {
          name: 'answer_product_question',
          description: 'Answer questions about a specific product\'s attributes, features, or details. Use this when user asks about size, color, material, features, warranty, use case, or any product-specific question.',
          parameters: {
            type: 'object',
            properties: {
              product_sku: {
                type: 'string',
                description: 'Product SKU'
              },
              product_name: {
                type: 'string',
                description: 'Product name or title'
              },
              question: {
                type: 'string',
                description: 'The user\'s question about the product'
              },
              attribute_type: {
                type: 'string',
                enum: ['size', 'color', 'material', 'feature', 'price', 'warranty', 'use_case', 'general'],
                description: 'Type of attribute being asked about'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_product_variants',
          description: 'Get all available variants of a product (different colors, sizes, materials, etc.)',
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
              },
              variant_type: {
                type: 'string',
                enum: ['color', 'size', 'material', 'all'],
                description: 'Type of variant to retrieve'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'recommend_product_by_use_case',
          description: 'Recommend products based on use case, scenario, or requirements (e.g., daily use, travel, gift, specific needs)',
          parameters: {
            type: 'object',
            properties: {
              use_case: {
                type: 'string',
                description: 'Use case description (e.g., "daily use", "travel", "gift", "formal occasion")'
              },
              budget: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' }
                },
                description: 'Budget range'
              },
              requirements: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of requirements or preferences'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'handle_objection',
          description: 'Handle customer objections or concerns about products (price, value, quality, alternatives, return policy, etc.)',
          parameters: {
            type: 'object',
            properties: {
              product_sku: {
                type: 'string',
                description: 'Product SKU (if objection is about a specific product)'
              },
              product_name: {
                type: 'string',
                description: 'Product name (if objection is about a specific product)'
              },
              objection_type: {
                type: 'string',
                enum: ['price', 'value', 'quality', 'alternatives', 'return_policy', 'warranty', 'suitability', 'general'],
                description: 'Type of objection'
              },
              objection_text: {
                type: 'string',
                description: 'The customer\'s objection or concern'
              }
            },
            required: ['objection_text']
          }
        }
      },
        {
          type: 'function',
          function: {
            name: 'add_to_cart',
            description: 'Add a product to the shopping cart. You can use either product_sku or product_name. If product_name is provided, the system will find the matching product.',
            parameters: {
              type: 'object',
              properties: {
                customer_id: {
                  type: 'string',
                  description: 'Customer ID - automatically provided by system, do not use placeholder values like "customer_id"'
                },
              product_sku: {
                type: 'string',
                description: 'Product SKU to add (use if available)'
              },
              product_name: {
                type: 'string',
                description: 'Product name to add (use if SKU is not available). The system will find the product by name.'
              },
              quantity: {
                type: 'number',
                description: 'Quantity to add (default: 1)'
              }
            },
            required: ['customer_id']
          }
        }
      },
        {
          type: 'function',
          function: {
            name: 'remove_from_cart',
            description: 'Remove a product from the shopping cart. You can use either product_sku or product_name. If product_name is provided, the system will find the product in the cart.',
            parameters: {
              type: 'object',
              properties: {
                customer_id: {
                  type: 'string',
                  description: 'Customer ID - automatically provided by system, do not use placeholder values like "customer_id"'
                },
              product_sku: {
                type: 'string',
                description: 'Product SKU to remove (use if available)'
              },
              product_name: {
                type: 'string',
                description: 'Product name to remove (use if SKU is not available). The system will find the product in cart by name.'
              }
            },
            required: ['customer_id']
          }
        }
      },
        {
          type: 'function',
          function: {
            name: 'get_cart',
            description: 'Get the current shopping cart contents for the customer. The customer_id will be automatically provided by the system.',
            parameters: {
              type: 'object',
              properties: {
                customer_id: {
                  type: 'string',
                  description: 'Customer ID - this is automatically provided, do not use placeholder values'
                }
              },
              required: ['customer_id']
            }
          }
        },
      {
        type: 'function',
        function: {
          name: 'update_cart_item',
          description: 'Update the quantity of an item in the cart. You can use either product_sku or product_name. If product_name is provided, the system will find the product in the cart.',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID - automatically provided by system, do not use placeholder values like "customer_id"'
              },
              product_sku: {
                type: 'string',
                description: 'Product SKU to update (use if available)'
              },
              product_name: {
                type: 'string',
                description: 'Product name to update (use if SKU is not available). The system will find the product in cart by name.'
              },
              quantity: {
                type: 'number',
                description: 'New quantity'
              }
            },
            required: ['customer_id', 'quantity']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'clear_cart',
          description: 'Clear all items from the shopping cart',
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
          name: 'create_order',
          description: 'Create an order from the shopping cart. This initiates checkout and payment processing.',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID'
              },
              shipping_address: {
                type: 'object',
                description: 'Shipping address details'
              },
              billing_address: {
                type: 'object',
                description: 'Billing address details (optional, defaults to shipping address)'
              },
              payment_method: {
                type: 'string',
                description: 'Payment method (credit_card, debit_card, cash_on_delivery, etc.)'
              },
              coupon_code: {
                type: 'string',
                description: 'Optional coupon or promotional code'
              }
            },
            required: ['customer_id', 'shipping_address', 'payment_method']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_order_status',
          description: 'Get the status of an order',
          parameters: {
            type: 'object',
            properties: {
              order_id: {
                type: 'string',
                description: 'Order ID'
              },
              customer_id: {
                type: 'string',
                description: 'Customer ID (for verification)'
              }
            },
            required: ['order_id', 'customer_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_order_history',
          description: 'Get order history for a customer (returns all orders chronologically)',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID'
              },
              limit: {
                type: 'number',
                description: 'Number of orders to retrieve (default: 10)'
              }
            },
            required: ['customer_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'search_order_history',
          description: 'Semantic search on order history using natural language. Use this when user asks about specific orders like "my luxury handbag orders", "what did I order last month", "show me my Chanel purchases", etc.',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID'
              },
              query: {
                type: 'string',
                description: 'Natural language query describing what orders to find (e.g., "luxury handbags", "orders from last month", "Chanel products", "expensive items")'
              },
              limit: {
                type: 'number',
                description: 'Number of results to return (default: 10)'
              }
            },
            required: ['customer_id', 'query']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'cancel_order',
          description: 'Cancel an order (only if it hasn\'t been shipped yet)',
          parameters: {
            type: 'object',
            properties: {
              order_id: {
                type: 'string',
                description: 'Order ID to cancel'
              },
              customer_id: {
                type: 'string',
                description: 'Customer ID (for verification)'
              },
              reason: {
                type: 'string',
                description: 'Reason for cancellation'
              }
            },
            required: ['order_id', 'customer_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'process_return',
          description: 'Initiate a return for an order',
          parameters: {
            type: 'object',
            properties: {
              order_id: {
                type: 'string',
                description: 'Order ID'
              },
              customer_id: {
                type: 'string',
                description: 'Customer ID'
              },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    sku: { type: 'string' },
                    quantity: { type: 'number' }
                  }
                },
                description: 'Items to return'
              },
              reason: {
                type: 'string',
                description: 'Reason for return'
              }
            },
            required: ['order_id', 'customer_id', 'items', 'reason']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'apply_coupon',
          description: 'Apply a coupon or promotional code to the cart',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID'
              },
              coupon_code: {
                type: 'string',
                description: 'Coupon or promotional code'
              }
            },
            required: ['customer_id', 'coupon_code']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'suggest_complementary_products',
          description: 'Suggest complementary or upsell products based on cart contents',
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
      }
    ];
  }

  // Product reference detection utility
  detectProductReference(query, recentProducts, currentProduct) {
    const queryLower = query.toLowerCase().trim();
    
    // Check for numeric references (product 1, item 2, option 3, #1, etc.)
    // First check for explicit phrases like "first product", "second item", etc.
    const ordinalPhrases = [
      /(?:first|1st)\s+(?:product|item|option|one)/i,
      /(?:second|2nd)\s+(?:product|item|option|one)/i,
      /(?:third|3rd)\s+(?:product|item|option|one)/i,
      /(?:fourth|4th)\s+(?:product|item|option|one)/i,
      /(?:fifth|5th)\s+(?:product|item|option|one)/i
    ];
    
    for (let i = 0; i < ordinalPhrases.length; i++) {
      if (ordinalPhrases[i].test(queryLower) && recentProducts[i]) {
        return recentProducts[i];
      }
    }
    
    // Then check for numeric patterns
    const numberPatterns = [
      /(?:product|item|option|number|#)\s*(\d+)/i,
      /^(\d+)$/,
      /(\d+)(?:st|nd|rd|th)/i,
      /(?:first|second|third|fourth|fifth)/i
    ];
    
    for (const pattern of numberPatterns) {
      const match = queryLower.match(pattern);
      if (match) {
        let index = null;
        if (match[1]) {
          index = parseInt(match[1]) - 1; // Convert to 0-based index
        } else if (match[0]) {
          // Handle ordinal words
          const ordinals = {
            'first': 0, 'second': 1, 'third': 2, 'fourth': 3, 'fifth': 4,
            '1st': 0, '2nd': 1, '3rd': 2, '4th': 3, '5th': 4
          };
          const matchedText = match[0].toLowerCase();
          index = ordinals[matchedText];
        }
        
        if (index !== null && index >= 0 && recentProducts[index]) {
          return recentProducts[index];
        }
      }
    }
    
    // Check for "this" or "that" (referring to current product)
    if ((queryLower.includes('this') || queryLower.includes('that')) && currentProduct) {
      return currentProduct;
    }
    
    // Check for brand/product name mentions
    // Extract key words from query (remove common words like "add", "to", "cart", "the", etc.)
    const stopWords = new Set(['add', 'to', 'cart', 'the', 'a', 'an', 'this', 'that', 'put', 'remove', 'delete']);
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word));
    
    for (const product of recentProducts) {
      if (!product) continue;
      const productTitle = (product.title || '').toLowerCase();
      const productBrand = (product.brand || '').toLowerCase();
      const productSku = (product.sku || '').toLowerCase();
      
      // Exact title match
      if (productTitle && queryLower.includes(productTitle)) {
        return product;
      }
      
      // Partial title match - check if query words appear in product title
      if (productTitle && queryWords.length > 0) {
        const titleWords = productTitle.split(/\s+/);
        const matchingWords = queryWords.filter(word => titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord)));
        // If at least 2 words match or 1 word matches and it's a significant word (brand or key product term)
        if (matchingWords.length >= 2 || (matchingWords.length >= 1 && (productBrand.includes(matchingWords[0]) || matchingWords[0].length > 4))) {
          return product;
        }
      }
      
      // Brand match
      if (productBrand && queryLower.includes(productBrand)) {
        // If multiple products match, prefer the most recent
        return product;
      }
      
      // SKU match
      if (productSku && queryLower.includes(productSku)) {
        return product;
      }
    }
    
    return null;
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
        case 'answer_product_question':
          return await this.handleAnswerProductQuestion(arguments_);
        case 'get_product_variants':
          return await this.handleGetProductVariants(arguments_);
        case 'recommend_product_by_use_case':
          return await this.handleRecommendProductByUseCase(arguments_);
        case 'handle_objection':
          return await this.handleObjection(arguments_);
        case 'add_to_cart':
          return await this.handleAddToCart(arguments_);
        case 'remove_from_cart':
          return await this.handleRemoveFromCart(arguments_);
        case 'get_cart':
          return await this.handleGetCart(arguments_);
        case 'update_cart_item':
          return await this.handleUpdateCartItem(arguments_);
        case 'clear_cart':
          return await this.handleClearCart(arguments_);
        case 'create_order':
          return await this.handleCreateOrder(arguments_);
        case 'get_order_status':
          return await this.handleGetOrderStatus(arguments_);
        case 'get_order_history':
          return await this.handleGetOrderHistory(arguments_);
        case 'search_order_history':
          return await this.handleSearchOrderHistory(arguments_);
        case 'cancel_order':
          return await this.handleCancelOrder(arguments_);
        case 'process_return':
          return await this.handleProcessReturn(arguments_);
        case 'apply_coupon':
          return await this.handleApplyCoupon(arguments_);
        case 'suggest_complementary_products':
          return await this.handleSuggestComplementaryProducts(arguments_);
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
    const { product_sku, product_name } = args;
    
    // Use inventory service if available
    const inventoryService = (await import('./inventoryService.js')).inventoryService;
    
    if (inventoryService.isAvailable()) {
      try {
        // Try to find SKU first
        if (product_sku) {
          const stock = await inventoryService.checkStock(product_sku);
          if (stock && stock.in_stock !== undefined) {
            return {
              success: true,
              product: {
                sku: stock.sku,
                title: stock.product_name || product_name,
                brand: stock.brand,
                category: stock.category,
                in_stock: stock.in_stock,
                stock_level: stock.stock_level,
                available_quantity: stock.available_quantity,
                reserved_quantity: stock.reserved_quantity || 0,
                location: stock.location,
                estimated_delivery: stock.in_stock ? '2-3 business days' : 'Out of stock'
              }
            };
          }
        }
        
        // If SKU not found, try semantic search
        if (product_name) {
          const searchResults = await inventoryService.searchInventory(product_name, 1);
          if (searchResults.length > 0) {
            const item = searchResults[0];
            const stock = await inventoryService.checkStock(item.sku);
            return {
              success: true,
              product: {
                sku: stock.sku,
                title: stock.product_name || product_name,
                brand: stock.brand,
                category: stock.category,
                in_stock: stock.in_stock,
                stock_level: stock.stock_level,
                available_quantity: stock.available_quantity,
                reserved_quantity: stock.reserved_quantity || 0,
                location: stock.location,
                estimated_delivery: stock.in_stock ? '2-3 business days' : 'Out of stock'
              }
            };
          }
        }
      } catch (error) {
        console.error('Error checking inventory:', error);
        // Fall through to product search fallback
      }
    }
    
    // Fallback: search products and return mock stock
    const products = await enhancedRAGService.searchProducts(
      product_name || product_sku || 'luxury products', 
      {}
    );
    
    const product = products.find(p => 
      p.sku === product_sku || 
      p.title.toLowerCase().includes((product_name || '').toLowerCase())
    );
    
    if (!product) {
      return {
        success: false,
        message: 'Product not found'
      };
    }
    
    // Mock stock levels (for products not in inventory system)
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
    
    // Enhanced comparison with detailed attributes
    const comparison = {
      criteria: comparison_criteria,
      products: products.map(p => {
        const price = typeof p.price === 'object' ? p.price : { amount: p.price || 0, currency: p.currency || 'AED' };
        const attributes = p.attributes || {};
        
        return {
          sku: p.sku,
          title: p.title,
          brand: p.brand,
          price: price,
          rating: p.rating || 'N/A',
          description: p.description,
          // Include relevant attributes for comparison
          attributes: {
            material: attributes.material || 'N/A',
            size: attributes.size || 'N/A',
            color: attributes.color || 'N/A',
            features: attributes.water_resistance || attributes.movement || attributes.collection || 'N/A'
          },
          badges: p.badges || [],
          category: typeof p.category === 'string' ? JSON.parse(p.category) : p.category
        };
      })
    };
    
    // Use LLM to generate natural comparison summary
    try {
      const comparisonSummary = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `You are a luxury shopping assistant. Generate a natural, helpful comparison summary of the products provided. 
          Highlight key differences, strengths, and help the customer understand which product might be best for their needs.
          Be objective and focus on helping the customer make an informed decision.`
        },
        {
          role: 'user',
          content: `Compare these products:\n${products.map((p, i) => 
            `${i + 1}. ${p.title} by ${p.brand} - ${typeof p.price === 'object' ? `${p.price.amount} ${p.price.currency}` : `${p.price} AED`}\n   ${p.description}\n   Attributes: ${JSON.stringify(p.attributes || {})}`
          ).join('\n\n')}\n\nComparison criteria: ${comparison_criteria.join(', ')}\n\nProvide a clear, helpful comparison that highlights differences and helps the customer choose.`
        }
      ], {
        model: 'versatile',
        temperature: 0.5
      });
      
      comparison.summary = comparisonSummary.choices[0].message.content;
    } catch (error) {
      console.error('Error generating comparison summary:', error);
      comparison.summary = 'Here\'s a comparison of the products you selected.';
    }
    
    return {
      success: true,
      comparison
    };
  }

  async handleGetProductDetails(args) {
    let product = null;
    
    // STEP 1: If we have a SKU, search by SKU first (most reliable)
    if (args.product_sku) {
      console.log(`🔍 Searching for product by SKU: ${args.product_sku}`);
      const productsBySku = await enhancedRAGService.searchProducts(args.product_sku, {});
      product = productsBySku.find(p => p.sku === args.product_sku);
      if (product) {
        console.log(`✅ Found product by SKU: ${product.sku} - ${product.title}`);
      }
    }
    
    // STEP 2: If not found or no SKU, search by product name to get candidate products
    if (!product && args.product_name) {
      console.log(`🔍 Searching for product by name: "${args.product_name}"`);
      
      // First try direct catalog search to bypass intent classification
      let productsByName = await enhancedRAGService.searchProductsInCatalog(args.product_name);
      console.log(`📦 Catalog search found ${productsByName.length} candidate products for "${args.product_name}"`);
      
      // If catalog search doesn't find anything, try with intent-based search as fallback
      if (productsByName.length === 0) {
        console.log(`⚠️ Catalog search returned 0 results, trying intent-based search...`);
        productsByName = await enhancedRAGService.searchProducts(args.product_name, {});
        console.log(`📦 Intent-based search found ${productsByName.length} candidate products`);
      }
      
      if (productsByName.length > 0) {
        console.log(`📋 Candidate products:`, productsByName.map(p => `${p.sku} - ${p.title}`).join(', '));
      }
      
      // Try multiple matching strategies
      const productNameLower = args.product_name.toLowerCase().trim();
      
      // Strategy 1: Exact match (case-insensitive)
      product = productsByName.find(p => 
        p.title.toLowerCase() === productNameLower
      );
      if (product) {
        console.log(`✅ Exact match found: ${product.sku} - ${product.title}`);
      }
      
      // Strategy 2: Contains match (product name contains search term or vice versa)
      if (!product) {
        product = productsByName.find(p => {
          const titleLower = p.title.toLowerCase();
          return titleLower.includes(productNameLower) || 
                 productNameLower.includes(titleLower);
        });
        if (product) {
          console.log(`✅ Contains match found: ${product.sku} - ${product.title}`);
        }
      }
      
      // Strategy 3: Word match (all words in product name appear in title)
      if (!product && productNameLower.split(/\s+/).length > 1) {
        const searchWords = productNameLower.split(/\s+/).filter(w => w.length > 2);
        product = productsByName.find(p => {
          const titleLower = p.title.toLowerCase();
          return searchWords.every(word => titleLower.includes(word));
        });
        if (product) {
          console.log(`✅ Word match found: ${product.sku} - ${product.title}`);
        }
      }
      
      // Strategy 4: First result if we have any matches (fallback)
      if (!product && productsByName.length > 0) {
        product = productsByName[0];
        console.log(`⚠️ Using first search result as fallback: ${product.sku} - ${product.title}`);
      }
      
      // STEP 3: If we found a product by name, extract SKU and re-search with SKU for more reliable lookup
      if (product && product.sku && !args.product_sku) {
        console.log(`🔄 Re-searching with extracted SKU: ${product.sku}`);
        const productsBySku = await enhancedRAGService.searchProducts(product.sku, {});
        const exactMatch = productsBySku.find(p => p.sku === product.sku);
        if (exactMatch) {
          product = exactMatch;
          console.log(`✅ Confirmed product with SKU lookup: ${product.sku} - ${product.title}`);
        }
      }
    }
    
    if (!product) {
      console.error(`❌ Product not found: "${args.product_name || args.product_sku}"`);
      return {
        success: false,
        message: `Product "${args.product_name || args.product_sku}" not found. Could you please specify the product name or SKU?`
      };
    }
    
    console.log(`✅ Final product selected: ${product.sku} - ${product.title}`);
    
    const price = typeof product.price === 'object' ? product.price : { amount: product.price || 0, currency: product.currency || 'AED' };
    const attributes = product.attributes || {};
    
    // Generate comprehensive product details using LLM
    let comprehensiveDetails = null;
    try {
      const detailsResponse = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `You are a luxury shopping assistant. Generate comprehensive product details including:
          - Key features and highlights
          - Pros and cons (be honest and balanced)
          - Use case recommendations (when to use this product)
          - Care instructions (if applicable)
          - Warranty information (if available)
          - What makes this product special or worth the investment
          
          Keep it natural, engaging, and helpful. Format as a conversational description (3-4 sentences).`
        },
        {
          role: 'user',
          content: `Product: ${product.title} by ${product.brand}
Price: ${price.amount} ${price.currency}
Description: ${product.description}
Attributes: ${JSON.stringify(attributes)}
Rating: ${product.rating || 'N/A'}
Badges/Features: ${product.badges ? product.badges.join(', ') : 'N/A'}

Generate comprehensive product details that help the customer understand the product's value, use cases, and what makes it special.`
        }
      ], {
        model: 'versatile',
        temperature: 0.6
      });
      
      comprehensiveDetails = detailsResponse.choices[0].message.content;
    } catch (error) {
      console.error('Error generating comprehensive product details:', error);
      comprehensiveDetails = product.description; // Fallback to basic description
    }
    
    // Build pros and cons
    const pros = [];
    const cons = [];
    
    if (product.badges) {
      pros.push(...product.badges.map(b => b.charAt(0).toUpperCase() + b.slice(1)));
    }
    if (attributes.material) {
      pros.push(`Premium ${attributes.material}`);
    }
    if (product.rating && product.rating >= 4.5) {
      pros.push('Highly rated');
    }
    
    // Simple cons based on price (could be enhanced)
    const priceAmount = typeof price === 'object' ? price.amount : price;
    if (priceAmount > 30000) {
      cons.push('Premium pricing');
    }
    
    return {
      success: true,
      product: {
        sku: product.sku,
        title: product.title,
        brand: product.brand,
        price: price,
        description: product.description,
        comprehensiveDetails: comprehensiveDetails,
        rating: product.rating,
        category: typeof product.category === 'string' ? JSON.parse(product.category) : product.category,
        tags: typeof product.tags === 'string' ? JSON.parse(product.tags || '[]') : (product.tags || []),
        attributes: attributes,
        pros: pros,
        cons: cons,
        badges: product.badges || [],
        warranty: 'All products come with manufacturer warranty and our satisfaction guarantee',
        careInstructions: attributes.material ? `Care: Handle with care. For ${attributes.material.toLowerCase()}, avoid excessive moisture and store in a dust bag when not in use.` : 'Care: Handle with care and store properly when not in use.'
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

  async handleAnswerProductQuestion(args) {
    const { product_sku, product_name, question, attribute_type } = args;
    
    // Get product details
    let product = null;
    if (product_sku) {
      const products = await enhancedRAGService.searchProducts(product_sku, {});
      product = products.find(p => p.sku === product_sku);
    } else if (product_name) {
      const products = await enhancedRAGService.searchProducts(product_name, {});
      product = products.find(p => 
        p.title.toLowerCase().includes(product_name.toLowerCase())
      );
      if (!product && products.length > 0) {
        product = products[0];
      }
    }
    
    if (!product) {
      return {
        success: false,
        message: 'Product not found. Could you please specify which product you\'re asking about?'
      };
    }
    
    // Extract relevant information based on attribute type
    let answer = '';
    const attributes = product.attributes || {};
    
    switch (attribute_type) {
      case 'size':
        answer = attributes.size || attributes.dimensions || 'Size information not available';
        break;
      case 'color':
        answer = attributes.color || 'Color information not available';
        break;
      case 'material':
        answer = attributes.material || 'Material information not available';
        break;
      case 'feature':
        const features = [];
        if (attributes.water_resistance) features.push(`Water resistance: ${attributes.water_resistance}`);
        if (attributes.movement) features.push(`Movement: ${attributes.movement}`);
        if (product.badges) features.push(`Features: ${product.badges.join(', ')}`);
        answer = features.length > 0 ? features.join('\n') : (product.description || 'No specific features listed');
        break;
      case 'price':
        const price = typeof product.price === 'object' ? product.price : { amount: product.price || 0, currency: product.currency || 'AED' };
        answer = `${price.amount} ${price.currency}`;
        break;
      default:
        try {
          const response = await llmProvider.chatCompletion([
            {
              role: 'system',
              content: `You are a luxury shopping assistant. Answer the user's question about the product using the product information provided. Be concise, accurate, and helpful.`
            },
            {
              role: 'user',
              content: `Product: ${product.title} by ${product.brand}
Price: ${typeof product.price === 'object' ? `${product.price.amount} ${product.price.currency}` : `${product.price} ${product.currency || 'AED'}`}
Description: ${product.description}
Attributes: ${JSON.stringify(attributes)}
Rating: ${product.rating || 'N/A'}

Question: ${question}

Answer the question based on the product information above.`
            }
          ], {
            model: 'primary',
            temperature: 0.3
          });
          answer = response.choices[0].message.content;
        } catch (error) {
          console.error('Error generating product Q&A answer:', error);
          answer = `Based on the product information: ${product.description || 'Please refer to the product details for more information.'}`;
        }
    }
    
    return {
      success: true,
      product: {
        sku: product.sku,
        title: product.title,
        brand: product.brand
      },
      question: question,
      answer: answer,
      attribute_type: attribute_type
    };
  }

  async handleGetProductVariants(args) {
    const { product_sku, product_name, variant_type = 'all' } = args;
    
    let baseProduct = null;
    if (product_sku) {
      const products = await enhancedRAGService.searchProducts(product_sku, {});
      baseProduct = products.find(p => p.sku === product_sku);
    } else if (product_name) {
      const products = await enhancedRAGService.searchProducts(product_name, {});
      baseProduct = products.find(p => 
        p.title.toLowerCase().includes(product_name.toLowerCase())
      );
    }
    
    if (!baseProduct) {
      return {
        success: false,
        message: 'Product not found'
      };
    }
    
    const brand = baseProduct.brand;
    const baseTitle = baseProduct.title.split(' ').slice(0, -1).join(' ');
    
    const allProducts = await enhancedRAGService.searchProducts(brand, {});
    const variants = allProducts.filter(p => 
      p.brand === brand && 
      (p.title.toLowerCase().includes(baseTitle.toLowerCase()) || 
       p.sku.startsWith(baseProduct.sku.split('-').slice(0, -1).join('-')))
    );
    
    const groupedVariants = {
      color: [],
      size: [],
      material: [],
      all: variants
    };
    
    variants.forEach(v => {
      const attrs = v.attributes || {};
      if (attrs.color) groupedVariants.color.push(v);
      if (attrs.size) groupedVariants.size.push(v);
      if (attrs.material) groupedVariants.material.push(v);
    });
    
    return {
      success: true,
      base_product: {
        sku: baseProduct.sku,
        title: baseProduct.title
      },
      variants: groupedVariants[variant_type] || groupedVariants.all,
      variant_type: variant_type
    };
  }

  async handleRecommendProductByUseCase(args) {
    const { use_case, budget, requirements = [] } = args;
    
    let searchQuery = use_case;
    if (requirements.length > 0) {
      searchQuery += ' ' + requirements.join(' ');
    }
    
    const products = await enhancedRAGService.searchProducts(searchQuery, {});
    
    let filteredProducts = products;
    if (budget) {
      filteredProducts = products.filter(p => {
        const price = typeof p.price === 'object' ? p.price.amount : p.price;
        if (budget.min && price < budget.min) return false;
        if (budget.max && price > budget.max) return false;
        return true;
      });
    }
    
    try {
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `You are a luxury shopping assistant. Recommend the best products based on the use case and requirements. Rank products by relevance and explain why each is suitable.`
        },
        {
          role: 'user',
          content: `Use case: ${use_case}
Requirements: ${requirements.join(', ') || 'None'}
Budget: ${budget ? `${budget.min || 0} - ${budget.max || 'unlimited'} AED` : 'No budget constraint'}

Products to consider:
${filteredProducts.slice(0, 10).map((p, i) => 
  `${i + 1}. ${p.title} by ${p.brand} - ${typeof p.price === 'object' ? `${p.price.amount} ${p.price.currency}` : `${p.price} AED`} - ${p.description}`
).join('\n')}

Recommend the top 3 products with explanations.`
        }
      ], {
        model: 'versatile',
        temperature: 0.5
      });
      
      const recommendation = response.choices[0].message.content;
      
      return {
        success: true,
        use_case: use_case,
        recommendations: recommendation,
        products: filteredProducts.slice(0, 3).map(p => ({
          sku: p.sku,
          title: p.title,
          brand: p.brand,
          price: typeof p.price === 'object' ? p.price : { amount: p.price || 0, currency: p.currency || 'AED' },
          description: p.description
        }))
      };
    } catch (error) {
      console.error('Error generating use case recommendations:', error);
      return {
        success: true,
        use_case: use_case,
        recommendations: 'Based on your requirements, here are some suitable options:',
        products: filteredProducts.slice(0, 3).map(p => ({
          sku: p.sku,
          title: p.title,
          brand: p.brand,
          price: typeof p.price === 'object' ? p.price : { amount: p.price || 0, currency: p.currency || 'AED' },
          description: p.description
        }))
      };
    }
  }

  async handleObjection(args) {
    const { product_sku, product_name, objection_type, objection_text } = args;
    
    // Get product details if specified
    let product = null;
    if (product_sku || product_name) {
      const products = await enhancedRAGService.searchProducts(product_sku || product_name || '', {});
      product = products.find(p => 
        p.sku === product_sku || 
        (product_name && p.title.toLowerCase().includes(product_name.toLowerCase()))
      );
      if (!product && products.length > 0) {
        product = products[0];
      }
    }
    
    // Use LLM to generate empathetic, value-focused response
    try {
      const systemPrompt = `You are a luxury shopping assistant helping customers with concerns or objections. 
      Your responses should be:
      - Empathetic and understanding
      - Value-focused (explain why the product is worth the investment)
      - Honest and transparent
      - Offer alternatives when appropriate
      - Address specific concerns directly
      
      For price objections: Emphasize quality, craftsmanship, investment value, and long-term benefits.
      For value objections: Highlight unique features, brand heritage, resale value, and quality.
      For quality concerns: Explain materials, craftsmanship, warranty, and brand reputation.
      For alternatives: Suggest similar products at different price points if appropriate.
      For return policy: Explain the return/exchange policy clearly and reassuringly.`;
      
      let userPrompt = `Customer objection: "${objection_text}"\n`;
      userPrompt += `Objection type: ${objection_type || 'general'}\n`;
      
      if (product) {
        const price = typeof product.price === 'object' ? `${product.price.amount} ${product.price.currency}` : `${product.price} ${product.currency || 'AED'}`;
        userPrompt += `\nProduct: ${product.title} by ${product.brand}\n`;
        userPrompt += `Price: ${price}\n`;
        userPrompt += `Description: ${product.description}\n`;
        if (product.attributes) {
          userPrompt += `Attributes: ${JSON.stringify(product.attributes)}\n`;
        }
        if (product.badges) {
          userPrompt += `Features: ${product.badges.join(', ')}\n`;
        }
      }
      
      userPrompt += `\nGenerate a helpful, empathetic response that addresses the customer's concern while highlighting value. Keep it conversational and natural (2-3 sentences).`;
      
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ], {
        model: 'versatile',
        temperature: 0.7
      });
      
      const objectionResponse = response.choices[0].message.content;
      
      // Get alternative products if price objection
      let alternatives = [];
      if (objection_type === 'price' && product) {
        const productPrice = typeof product.price === 'object' ? product.price.amount : product.price;
        const lowerPriceProducts = await enhancedRAGService.searchProducts(product.brand || '', {});
        alternatives = lowerPriceProducts
          .filter(p => {
            const pPrice = typeof p.price === 'object' ? p.price.amount : p.price;
            return pPrice < productPrice && p.sku !== product.sku;
          })
          .slice(0, 3)
          .map(p => ({
            sku: p.sku,
            title: p.title,
            brand: p.brand,
            price: typeof p.price === 'object' ? p.price : { amount: p.price || 0, currency: p.currency || 'AED' },
            description: p.description
          }));
      }
      
      return {
        success: true,
        objection_type: objection_type || 'general',
        response: objectionResponse,
        product: product ? {
          sku: product.sku,
          title: product.title,
          brand: product.brand
        } : null,
        alternatives: alternatives.length > 0 ? alternatives : null,
        has_alternatives: alternatives.length > 0
      };
    } catch (error) {
      console.error('Error generating objection response:', error);
      
      // Fallback responses by objection type
      const fallbackResponses = {
        price: "I understand price is an important consideration. Our products represent exceptional craftsmanship and investment value. Would you like to see similar options at different price points?",
        value: "I appreciate your concern. Our luxury products are crafted with the finest materials and attention to detail, offering timeless value and quality that lasts. Would you like to know more about what makes this product special?",
        quality: "Quality is our top priority. All our products come with warranty and are backed by our commitment to excellence. I'd be happy to share more details about the craftsmanship and materials.",
        alternatives: "I'd be happy to show you alternative options that might better suit your needs. Let me find some great alternatives for you.",
        return_policy: "We offer a flexible return policy - you can return or exchange items within 30 days of purchase. I want you to be completely satisfied with your purchase.",
        general: "I understand your concern. Let me help address that - would you like more information, or would you prefer to see alternative options?"
      };
      
      return {
        success: true,
        objection_type: objection_type || 'general',
        response: fallbackResponses[objection_type] || fallbackResponses.general,
        product: product ? {
          sku: product.sku,
          title: product.title,
          brand: product.brand
        } : null
      };
    }
  }

  // Cart Management Handlers
  async handleAddToCart(args) {
    let { customer_id, product_sku, product_name, quantity = 1 } = args;

    // Safety check: if customer_id is the literal string 'customer_id', fix it
    if (customer_id === 'customer_id') {
      console.error(`❌ Invalid customer_id: literal string 'customer_id' detected in handleAddToCart`);
      if (this.state && this.state.customerId) {
        customer_id = this.state.customerId;
        console.warn(`⚠️ Fixed customer_id using state: ${customer_id}`);
      } else {
        return {
          success: false,
          message: 'Customer ID is required to add items to cart'
        };
      }
    }

    console.log(`🛒 Add to cart called:`, { customer_id, product_sku, product_name, quantity });

    // Get product details - try multiple search strategies
    let product = null;
    
    // Strategy 1: Direct SKU match
    if (product_sku) {
      const products = await enhancedRAGService.searchProducts(product_sku, {});
      product = products.find(p => p.sku === product_sku || p.sku?.toLowerCase() === product_sku.toLowerCase());
      if (product) {
        console.log(`✅ Found product by SKU: ${product.sku} - ${product.title}`);
      }
    }
    
    // Strategy 2: Search by name if SKU not found
    if (!product && product_name) {
      const products = await enhancedRAGService.searchProducts(product_name, {});
      console.log(`🔍 Searched by name "${product_name}", found ${products.length} products`);
      
      // Try exact name match first (case-insensitive)
      const exactMatch = products.find(p => 
        p.title?.toLowerCase().trim() === product_name.toLowerCase().trim()
      );
      
      if (exactMatch) {
        product = exactMatch;
        console.log(`✅ Found exact match: ${product.sku} - ${product.title}`);
      } else {
        // Try partial match (contains)
        const partialMatch = products.find(p => 
          p.title?.toLowerCase().includes(product_name.toLowerCase()) ||
          product_name.toLowerCase().includes(p.title?.toLowerCase())
        );
        
        if (partialMatch) {
          product = partialMatch;
          console.log(`✅ Found partial match: ${product.sku} - ${product.title}`);
        } else if (products.length > 0) {
          // Use first result as fallback
          product = products[0];
          console.log(`⚠️ Using first search result: ${product.sku} - ${product.title}`);
        }
      }
    }
    
    // Strategy 3: If still not found and we have SKU, try without strict matching
    if (!product && product_sku) {
      const products = await enhancedRAGService.searchProducts(product_sku, {});
      if (products.length > 0) {
        product = products[0]; // Use first result as fallback
        console.log(`⚠️ Using fallback search result: ${product.sku} - ${product.title}`);
      }
    }

    if (!product) {
      console.error(`❌ Product not found:`, { product_sku, product_name });
      return {
        success: false,
        message: `I couldn't find that product. Could you provide the product name or SKU, or would you like me to show you similar items?`
      };
    }

    console.log(`✅ Product found: ${product.sku} - ${product.title}`);

    // Check inventory if available - but don't block if inventory not initialized
    const inventoryService = (await import('./inventoryService.js')).inventoryService;
    if (inventoryService.isAvailable()) {
      try {
        console.log(`🔍 Checking inventory for SKU: ${product.sku}`);
        
        // OPTIMIZATION: Add timeout to inventory check (3 seconds max) to prevent slow queries
        const inventoryCheckPromise = inventoryService.checkStock(product.sku);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Inventory check timeout')), 3000)
        );
        
        const stock = await Promise.race([inventoryCheckPromise, timeoutPromise]);
        console.log(`📦 Inventory check result:`, { 
          sku: stock.sku, 
          in_stock: stock.in_stock, 
          available_quantity: stock.available_quantity,
          stock_level: stock.stock_level 
        });
        
        // Only block if explicitly marked as out of stock (not null/undefined)
        // null/undefined means product not found in inventory system (allow cart addition)
        // false with 0 quantity means product exists but is out of stock (block)
        if (stock && stock.in_stock === false && stock.available_quantity === 0 && stock.stock_level === 0) {
          // Product exists in inventory but is out of stock
          return {
            success: false,
            message: `I'm sorry, but this item is currently out of stock. Available: ${stock.available_quantity || 0}`,
            stock_info: stock
          };
        }
        
        // If product not found in inventory (in_stock === null), allow cart addition (graceful degradation)
        if (stock && stock.in_stock === null) {
          console.log(`⚠️ Product ${product.sku} not found in inventory, but allowing cart addition (graceful degradation)`);
        }
        
        // Only reserve if in stock and quantity available
        // OPTIMIZATION: Fire and forget reservation - don't block if slow
        if (stock && stock.in_stock && stock.available_quantity >= quantity) {
          // Fire and forget - don't wait for reservation to complete
          inventoryService.reserveInventory(product.sku, quantity).then(reserveResult => {
            if (!reserveResult.success) {
              console.warn(`⚠️ Failed to reserve inventory for ${product.sku}: ${reserveResult.message}`);
            } else {
              console.log(`✅ Reserved ${quantity} units of ${product.sku}`);
            }
          }).catch(err => {
            console.warn(`⚠️ Inventory reservation failed (non-critical): ${err.message}`);
          });
        } else if (stock && stock.in_stock && stock.available_quantity < quantity) {
          // Not enough stock available
          return {
            success: false,
            message: `I'm sorry, but we only have ${stock.available_quantity} available. Would you like to add ${stock.available_quantity} to your cart instead?`,
            stock_info: stock
          };
        }
      } catch (error) {
        // Don't block cart addition if inventory check fails or times out
        if (error.message === 'Inventory check timeout') {
          console.warn(`⚠️ Inventory check timed out (non-critical, allowing cart addition)`);
        } else {
          console.warn(`⚠️ Inventory check failed (non-critical, allowing cart addition): ${error.message}`);
        }
      }
    }

    // Get current cart
    const cart = await memoryService.getCart(customer_id);
    const existingItems = cart.items || [];
    
    // Check if product already in cart
    const existingItemIndex = existingItems.findIndex(item => item.sku === product.sku);
    
    const price = typeof product.price === 'object' ? product.price : { 
      amount: product.price || 0, 
      currency: product.currency || 'AED' 
    };

    const cartItem = {
      sku: product.sku,
      title: product.title,
      brand: product.brand,
      price: price,
      quantity: quantity,
      image: product.image || null,
      reserved: inventoryService.isAvailable() // Mark if inventory is reserved
    };

    if (existingItemIndex >= 0) {
      // Update quantity if already exists
      existingItems[existingItemIndex].quantity += quantity;
      if (inventoryService.isAvailable()) {
        existingItems[existingItemIndex].reserved = true;
      }
    } else {
      // Add new item
      existingItems.push(cartItem);
    }

    // Update cart
    await memoryService.updateCart(customer_id, existingItems);

    return {
      success: true,
      message: existingItemIndex >= 0 ? `Quantity updated in cart` : `Added to cart`,
      item: cartItem,
      cart: await memoryService.getCart(customer_id)
    };
  }

  async handleRemoveFromCart(args) {
    let { customer_id, product_sku, product_name } = args;

    // Safety check: if customer_id is the literal string 'customer_id', fix it
    if (customer_id === 'customer_id') {
      console.error(`❌ Invalid customer_id: literal string 'customer_id' detected in handleRemoveFromCart`);
      if (this.state && this.state.customerId) {
        customer_id = this.state.customerId;
        console.warn(`⚠️ Fixed customer_id using state: ${customer_id}`);
      } else {
        return {
          success: false,
          message: 'Customer ID is required to remove items from cart'
        };
      }
    }

    const cart = await memoryService.getCart(customer_id);
    const items = cart.items || [];
    
    let itemIndex = -1;
    
    // Find by SKU if provided
    if (product_sku) {
      itemIndex = items.findIndex(item => item.sku === product_sku || item.sku?.toLowerCase() === product_sku.toLowerCase());
    }
    
    // Find by name if SKU not found and product_name provided
    if (itemIndex === -1 && product_name) {
      const productNameLower = product_name.toLowerCase();
      itemIndex = items.findIndex(item => {
        const itemTitle = (item.title || item.product_name || '').toLowerCase();
        return itemTitle === productNameLower || 
               itemTitle.includes(productNameLower) ||
               productNameLower.includes(itemTitle);
      });
    }
    
    if (itemIndex === -1) {
      return {
        success: false,
        message: 'Item not found in cart'
      };
    }

    const removedItem = items[itemIndex];
    const quantityToRelease = removedItem.quantity || 1;
    const itemSku = removedItem.sku;
    
    // Release inventory if it was reserved (non-blocking - don't wait if slow)
    if (removedItem.reserved) {
      try {
        const inventoryService = (await import('./inventoryService.js')).inventoryService;
        if (inventoryService.isAvailable()) {
          // Fire and forget - don't block response if inventory release is slow
          inventoryService.releaseInventory(itemSku, quantityToRelease).catch(err => {
            console.warn(`⚠️ Failed to release inventory (non-critical): ${err.message}`);
          });
        }
      } catch (error) {
        console.warn(`⚠️ Inventory release failed (non-critical): ${error.message}`);
      }
    }
    
    const filteredItems = items.filter((item, index) => index !== itemIndex);
    await memoryService.updateCart(customer_id, filteredItems);

    return {
      success: true,
      message: 'Item removed from cart',
      removed_item: removedItem,
      cart: await memoryService.getCart(customer_id)
    };
  }

  async handleGetCart(args) {
    let { customer_id } = args;
    
    // Safety check: if customer_id is the literal string 'customer_id', log warning
    if (customer_id === 'customer_id') {
      console.error(`❌ Invalid customer_id: literal string 'customer_id' detected. This should have been injected by toolExecutionNode.`);
      // Try to get from state if available (though this shouldn't happen)
      if (this.state && this.state.customerId) {
        customer_id = this.state.customerId;
        console.warn(`⚠️ Using customerId from state: ${customer_id}`);
      } else {
        return {
          success: false,
          message: 'Customer ID is required to view cart',
          cart: { items: [], total: 0, currency: 'AED' }
        };
      }
    }
    
    if (!customer_id) {
      console.error(`❌ Missing customer_id in handleGetCart`);
      return {
        success: false,
        message: 'Customer ID is required to view cart',
        cart: { items: [], total: 0, currency: 'AED' }
      };
    }
    
    console.log(`🛒 Get cart called for customer: ${customer_id}`);
    
    const cart = await memoryService.getCart(customer_id);
    
    console.log(`🛒 Cart retrieved:`, {
      itemsCount: cart.items?.length || 0,
      total: cart.total,
      items: cart.items?.map(item => ({
        sku: item.sku,
        title: item.title,
        quantity: item.quantity,
        price: item.price
      }))
    });

    return {
      success: true,
      cart: cart,
      message: cart.items && cart.items.length > 0 
        ? `You have ${cart.items.length} item${cart.items.length !== 1 ? 's' : ''} in your cart`
        : 'Your cart is empty'
    };
  }

  async handleUpdateCartItem(args) {
    let { customer_id, product_sku, product_name, quantity } = args;

    // Safety check: if customer_id is the literal string 'customer_id', fix it
    if (customer_id === 'customer_id') {
      console.error(`❌ Invalid customer_id: literal string 'customer_id' detected in handleUpdateCartItem`);
      if (this.state && this.state.customerId) {
        customer_id = this.state.customerId;
        console.warn(`⚠️ Fixed customer_id using state: ${customer_id}`);
      } else {
        return {
          success: false,
          message: 'Customer ID is required to update cart items'
        };
      }
    }

    if (quantity <= 0) {
      return await this.handleRemoveFromCart({ customer_id, product_sku, product_name });
    }

    const cart = await memoryService.getCart(customer_id);
    const items = cart.items || [];
    
    let itemIndex = -1;
    
    // Find by SKU if provided
    if (product_sku) {
      itemIndex = items.findIndex(item => item.sku === product_sku || item.sku?.toLowerCase() === product_sku.toLowerCase());
    }
    
    // Find by name if SKU not found and product_name provided
    if (itemIndex === -1 && product_name) {
      const productNameLower = product_name.toLowerCase();
      itemIndex = items.findIndex(item => {
        const itemTitle = (item.title || item.product_name || '').toLowerCase();
        return itemTitle === productNameLower || 
               itemTitle.includes(productNameLower) ||
               productNameLower.includes(itemTitle);
      });
    }
    
    if (itemIndex < 0) {
      return {
        success: false,
        message: 'Product not found in cart'
      };
    }

    items[itemIndex].quantity = quantity;
    await memoryService.updateCart(customer_id, items);

    return {
      success: true,
      message: 'Cart item updated',
      cart: await memoryService.getCart(customer_id)
    };
  }

  async handleClearCart(args) {
    const { customer_id } = args;
    await memoryService.clearCart(customer_id);

    return {
      success: true,
      message: 'Cart cleared',
      cart: { items: [], total: 0, currency: 'AED' }
    };
  }

  // Order Management Handlers
  async handleCreateOrder(args) {
    const { customer_id, shipping_address, billing_address, payment_method, coupon_code } = args;

    // Get cart
    const cart = await memoryService.getCart(customer_id);
    
    if (!cart.items || cart.items.length === 0) {
      return {
        success: false,
        message: 'Cart is empty. Please add items to your cart before checkout.'
      };
    }

    // Calculate totals
    const subtotal = cart.total || cart.items.reduce((sum, item) => {
      const price = typeof item.price === 'object' ? item.price.amount : item.price;
      return sum + (price * item.quantity);
    }, 0);

    // Calculate shipping
    const shippingResult = await this.handleCalculateShipping({
      customer_id,
      products: cart.items.map(item => ({ sku: item.sku, quantity: item.quantity }))
    });
    const shippingCost = shippingResult.shipping?.cost || 0;

    // Apply coupon if provided
    let discount = 0;
    if (coupon_code) {
      // Simple coupon logic (can be enhanced)
      const couponDiscounts = {
        'WELCOME10': 0.1,
        'SAVE20': 0.2,
        'LUXURY15': 0.15
      };
      const discountPercent = couponDiscounts[coupon_code.toUpperCase()] || 0;
      discount = subtotal * discountPercent;
    }

    // Calculate tax (5% VAT for UAE)
    const tax = (subtotal - discount) * 0.05;
    const total = subtotal - discount + shippingCost + tax;

    // Create order
    const orderData = {
      customer_id,
      cart_id: cart.cart_id,
      items: cart.items,
      subtotal,
      shipping_cost: shippingCost,
      tax,
      discount,
      total,
      currency: 'AED',
      status: 'pending',
      shipping_address: shipping_address || {},
      billing_address: billing_address || shipping_address || {},
      payment_method: payment_method || 'cash_on_delivery',
      payment_status: 'pending',
      payment_transaction_id: null
    };

    const orderId = await memoryService.createOrder(orderData);

    if (!orderId) {
      return {
        success: false,
        message: 'Failed to create order. Please try again.'
      };
    }

    // Process payment (simulated - in production, this would call payment gateway)
    // For now, simulate successful payment
    const paymentStatus = payment_method === 'cash_on_delivery' ? 'pending' : 'completed';
    await memoryService.updateOrderStatus(orderId, 'confirmed', {
      payment_status: paymentStatus,
      payment_transaction_id: payment_method !== 'cash_on_delivery' ? `txn_${Date.now()}` : null
    });

    // Clear cart after successful order
    await memoryService.clearCart(customer_id);

    // Get final order details
    const order = await memoryService.getOrder(orderId);

    return {
      success: true,
      message: 'Order created successfully',
      order_id: orderId,
      order: order,
      payment_status: paymentStatus
    };
  }

  async handleGetOrderStatus(args) {
    const { order_id, customer_id } = args;

    const order = await memoryService.getOrder(order_id);

    if (!order) {
      return {
        success: false,
        message: 'Order not found'
      };
    }

    if (order.customer_id !== customer_id) {
      return {
        success: false,
        message: 'Unauthorized access to order'
      };
    }

    return {
      success: true,
      order: order
    };
  }

  async handleGetOrderHistory(args) {
    const { customer_id, limit = 10 } = args;

    const orders = await memoryService.getOrderHistory(customer_id, limit);

    return {
      success: true,
      orders: orders,
      count: orders.length
    };
  }

  async handleSearchOrderHistory(args) {
    const { customer_id, query, limit = 10 } = args;

    // Use semantic search if Turso is available
    if (tursoOrderService.isAvailable()) {
      try {
        const searchResults = await tursoOrderService.searchOrderHistory(customer_id, query, limit);
        
        if (searchResults.length === 0) {
          return {
            success: false,
            message: 'No matching orders found',
            orders: []
          };
        }

        // Format results using LLM for natural language
        const formattedText = await tursoOrderService.formatOrderHistoryAsText(searchResults, query);

        return {
          success: true,
          orders: searchResults.map(r => ({
            order_id: r.order_id,
            items: r.items,
            total: r.total,
            currency: r.currency,
            status: r.status,
            created_at: r.created_at,
            similarity: r.similarity
          })),
          count: searchResults.length,
          formatted_response: formattedText
        };
      } catch (error) {
        console.error('Error in semantic order search:', error);
        // Fallback to regular order history
        return await this.handleGetOrderHistory({ customer_id, limit });
      }
    }

    // Fallback to regular order history if semantic search not available
    return await this.handleGetOrderHistory({ customer_id, limit });
  }

  async handleCancelOrder(args) {
    const { order_id, customer_id, reason } = args;

    const order = await memoryService.getOrder(order_id);

    if (!order) {
      return {
        success: false,
        message: 'Order not found'
      };
    }

    if (order.customer_id !== customer_id) {
      return {
        success: false,
        message: 'Unauthorized access to order'
      };
    }

    // Only allow cancellation if order hasn't shipped
    if (order.status === 'shipped' || order.status === 'delivered') {
      return {
        success: false,
        message: 'Cannot cancel order that has already been shipped'
      };
    }

    await memoryService.updateOrderStatus(order_id, 'cancelled');

    return {
      success: true,
      message: 'Order cancelled successfully',
      order_id: order_id
    };
  }

  async handleProcessReturn(args) {
    const { order_id, customer_id, items, reason } = args;

    const order = await memoryService.getOrder(order_id);

    if (!order) {
      return {
        success: false,
        message: 'Order not found'
      };
    }

    if (order.customer_id !== customer_id) {
      return {
        success: false,
        message: 'Unauthorized access to order'
      };
    }

    // Calculate refund amount
    const refundAmount = items.reduce((sum, returnItem) => {
      const orderItem = order.items.find(item => item.sku === returnItem.sku);
      if (orderItem) {
        const price = typeof orderItem.price === 'object' ? orderItem.price.amount : orderItem.price;
        const quantity = Math.min(returnItem.quantity, orderItem.quantity);
        return sum + (price * quantity);
      }
      return sum;
    }, 0);

    // Create return
    const returnData = {
      order_id,
      customer_id,
      items,
      reason: reason || 'Not specified',
      status: 'pending',
      refund_amount: refundAmount,
      refund_status: 'pending'
    };

    const returnId = await memoryService.createReturn(returnData);

    if (!returnId) {
      return {
        success: false,
        message: 'Failed to process return'
      };
    }

    // Auto-approve return if within 30 days (simplified logic)
    const orderDate = new Date(order.created_at);
    const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceOrder <= 30) {
      await memoryService.updateReturnStatus(returnId, 'approved', 'pending');
    }

    return {
      success: true,
      message: 'Return request submitted successfully',
      return_id: returnId,
      refund_amount: refundAmount,
      status: daysSinceOrder <= 30 ? 'approved' : 'pending'
    };
  }

  async handleApplyCoupon(args) {
    const { customer_id, coupon_code } = args;

    // Simple coupon validation (can be enhanced with database)
    const validCoupons = {
      'WELCOME10': { discount: 0.1, description: '10% off your order' },
      'SAVE20': { discount: 0.2, description: '20% off your order' },
      'LUXURY15': { discount: 0.15, description: '15% off luxury items' }
    };

    const coupon = validCoupons[coupon_code.toUpperCase()];

    if (!coupon) {
      return {
        success: false,
        message: 'Invalid coupon code'
      };
    }

    // Store coupon in cart context (simplified - in production, this would be stored with cart)
    const cart = await memoryService.getCart(customer_id);
    
    return {
      success: true,
      message: `Coupon applied: ${coupon.description}`,
      coupon_code: coupon_code.toUpperCase(),
      discount_percent: coupon.discount * 100,
      cart: cart
    };
  }

  async handleSuggestComplementaryProducts(args) {
    const { customer_id } = args;

    const cart = await memoryService.getCart(customer_id);
    
    if (!cart.items || cart.items.length === 0) {
      return {
        success: false,
        message: 'Cart is empty. Add items to see complementary suggestions.'
      };
    }

    // Analyze cart items to suggest complementary products
    const cartCategories = new Set();
    const cartBrands = new Set();
    
    cart.items.forEach(item => {
      if (item.category) {
        const categories = Array.isArray(item.category) ? item.category : JSON.parse(item.category || '[]');
        categories.forEach(cat => cartCategories.add(cat));
      }
      if (item.brand) {
        cartBrands.add(item.brand);
      }
    });

    // Build search query from cart context
    let searchQuery = '';
    if (cartCategories.size > 0) {
      searchQuery = Array.from(cartCategories).join(' ');
    } else if (cartBrands.size > 0) {
      searchQuery = Array.from(cartBrands).join(' ');
    } else {
      searchQuery = 'luxury products';
    }

    // Get complementary products (different from cart items)
    const allProducts = await enhancedRAGService.searchProducts(searchQuery, {});
    const cartSkus = new Set(cart.items.map(item => item.sku));
    
    const complementaryProducts = allProducts
      .filter(p => !cartSkus.has(p.sku))
      .slice(0, 5);

    // Use LLM to generate personalized suggestions
    try {
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: 'You are a luxury shopping assistant. Suggest complementary products that would go well with items in the customer\'s cart. Be natural and persuasive.'
        },
        {
          role: 'user',
          content: `Cart items: ${cart.items.map(item => `${item.title} by ${item.brand}`).join(', ')}\n\nComplementary products: ${complementaryProducts.map(p => `${p.title} by ${p.brand} - ${typeof p.price === 'object' ? `${p.price.amount} ${p.price.currency}` : `${p.price} AED`}`).join('\n')}\n\nGenerate a natural suggestion message (2-3 sentences) that recommends these complementary products.`
        }
      ], {
        model: 'versatile',
        temperature: 0.7
      });

      return {
        success: true,
        suggestion: response.choices[0].message.content,
        products: complementaryProducts.map(p => ({
          sku: p.sku,
          title: p.title,
          brand: p.brand,
          price: typeof p.price === 'object' ? p.price : { amount: p.price || 0, currency: p.currency || 'AED' },
          description: p.description
        }))
      };
    } catch (error) {
      console.error('Error generating complementary suggestions:', error);
      return {
        success: true,
        suggestion: 'Here are some products that complement your cart:',
        products: complementaryProducts.map(p => ({
          sku: p.sku,
          title: p.title,
          brand: p.brand,
          price: typeof p.price === 'object' ? p.price : { amount: p.price || 0, currency: p.currency || 'AED' },
          description: p.description
        }))
      };
    }
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
    
    // Handle special deterministic queries that don't need LLM classification
    const queryLower = query.toLowerCase().trim();
    if (queryLower === 'different category' || queryLower.includes('different category')) {
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
      
      // Handle category_browse_more intent: replace query with last category
      if (state.currentIntent === 'category_browse_more') {
        const context = memoryService.getConversationContext(conversationId, customerId);
        if (context.lastCategory) {
          // Replace query with last category for browsing
          query = context.lastCategory;
          state.query = query; // Update state query as well
          // Normalize intent to category_browse for rest of pipeline
          state.currentIntent = 'category_browse';
          console.log(`🔄 category_browse_more detected: replaced query with last category "${context.lastCategory}"`);
        } else {
          // Fallback: if no last category, treat as general browse
          state.currentIntent = 'category_browse';
          console.log(`⚠️ category_browse_more detected but no last category, treating as category_browse`);
        }
      }
      
      // Step 2: Memory Retrieval
      state = await this.memoryRetrievalNode(state);
      
      // Step 3: Tool Selection & Execution
      state = await this.toolExecutionNode(state, state.query);
      
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
    // Store original query for logging
    const originalQuery = query || '';
    
    // Quick, non-LLM classification for resilience (handles greetings without LLM)
    const q = (query || '').toLowerCase().trim();
    const isGreeting = /^(hi|hello|hey|hola|how are you\b|good (morning|afternoon|evening)\b)/i.test(q);
    if (isGreeting) {
      state.currentIntent = 'greeting';
      return state;
    }
    
    console.log(`🔍 Intent classification - Query: "${originalQuery}"`);

    // Build conversation context for better intent classification
    const conversationContext = [];
    if (state.messages && state.messages.length > 0) {
      // Include last 3 messages for context
      const recentMessages = state.messages.slice(-3);
      conversationContext.push('Recent conversation:');
      recentMessages.forEach(msg => {
        conversationContext.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);
      });
    }
    
    // Load conversation context from memory for product context
    const memoryContext = memoryService.getConversationContext(state.conversationId, state.customerId);
    
    // Add product context if available
    const productContext = [];
    if (state.context?.currentProduct || memoryContext?.currentProduct) {
      const currentProduct = state.context?.currentProduct || memoryContext?.currentProduct;
      productContext.push(`Current product context: ${currentProduct.title || currentProduct.sku}`);
    }
    if ((state.context?.recentProducts && state.context.recentProducts.length > 0) || 
        (memoryContext?.recentProducts && memoryContext.recentProducts.length > 0)) {
      const recentProducts = state.context?.recentProducts || memoryContext?.recentProducts || [];
      const recentProductsList = recentProducts.slice(0, 3).map((p, i) => `${i + 1}. ${p.title || p.sku}`).join(', ');
      productContext.push(`Recently shown products: ${recentProductsList}`);
    }
    if (state.context?.lastCategory || memoryContext?.lastCategory) {
      const lastCategory = state.context?.lastCategory || memoryContext?.lastCategory;
      productContext.push(`Last category browsed: ${lastCategory}`);
    }

    // Try LLM-based classification with enhanced context
    // Regex patterns are kept only as fallbacks when LLM fails
    try {
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `You are an expert intent classifier for a luxury retail shopping assistant. Your ONLY job is to classify the user's query into ONE of the intent categories below.

STEP 1 - CHECK FOR SPECIFIC PRODUCT NAME:
If the query contains ANY of these patterns, it's ALWAYS product_details:
- "tell me more about [product name]" → product_details
- "tell me about [product name]" → product_details  
- "what is [product name]" → product_details
- "[product name] details" → product_details
- "[product name]" alone → product_details
- Any query with a specific brand + model combination (e.g., "Chanel Classic Flap", "Bulgari Serpenti", "Rolex Submariner") → product_details

Examples that MUST be product_details:
- "tell me more about Chanel Classic Flap Bag" → product_details
- "tell me more about 'Bulgari Serpenti Tubogas Watch'" → product_details
- "what is Bulgari Serpenti" → product_details
- "Rolex Submariner details" → product_details

STEP 2 - CHECK FOR OTHER KEYWORDS:
If no specific product name, check for these keywords:
- "cart" → cart_operation
- "order" → order_tracking or order_history
- "return" → return_request or return_policy_inquiry
- "warranty" → warranty_inquiry
- "size" → size_inquiry
- "gift" → gift_recommendation
- "compare" → product_comparison
- "checkout" or "buy now" → checkout
- And many more (see full list below)

STEP 3 - DEFAULT:
If no specific keywords match → product_search

KEY DISTINCTION:
- product_search: Generic search queries WITHOUT specific product names (e.g., "bags", "watches", "luxury handbags")
- product_details: Queries WITH specific product names (e.g., "Chanel Classic Flap", "Bulgari Serpenti Watch")

IMPORTANT RULES:
1. **CRITICAL**: "tell me more about [product name]" = product_details (NOT product_search)
2. **CRITICAL**: "tell me about [product name]" = product_details (NOT product_search)
3. **CRITICAL**: "[product name]" alone = product_details (NOT product_search)
4. Generic searches like "bags", "watches", "luxury products" = product_search
5. If "tell me more" without product name + has product context = product_follow_up
6. If "tell me more" without product name + has category context = category_browse_more
7. Size/fit questions = size_inquiry (not product_attribute_inquiry)
8. Warranty questions = warranty_inquiry (not product_qa)
9. Care/maintenance questions = care_instructions (not product_qa)
10. Styling questions = styling_advice
11. Gift ideas = gift_recommendation (not use_case_recommendation)

INTENT CATEGORIES:

**Product Discovery:**
- product_search: User wants to FIND/BROWSE products - GENERIC queries without specific product names (e.g., "find luxury bags", "search for watches", "show me handbags", "watches under 5000", "luxury products")
- category_browse: User wants to browse categories (e.g., "show me handbags", "browse jewelry")
- category_browse_more: User wants more products in current category (e.g., "show me more", "more please", "more bags")
- brand_inquiry: User asks about specific brands (e.g., "tell me about Chanel", "what brands do you have")

**Product Information:**
- product_details: User wants detailed information about a SPECIFIC NAMED PRODUCT (e.g., "tell me about Chanel Classic Flap Bag", "tell me more about Bulgari Serpenti Watch", "what is Rolex Submariner", "details on Chanel bag", "info about this specific watch")
  **KEY**: If the query contains a specific product name/model, it's ALWAYS product_details, not product_search
- product_attribute_inquiry: User asks about specific attributes (e.g., "what colors available", "what material is it")
- size_inquiry: User asks specifically about sizing/fit (e.g., "what size should I get", "does it run large", "size chart")
- product_qa: General product questions (e.g., "is it waterproof", "how long does it last")
- care_instructions: Product care/maintenance (e.g., "how do I clean it", "care instructions")
- warranty_inquiry: Warranty/guarantee questions (e.g., "what's the warranty", "guarantee period")
- product_customization: Customization options (e.g., "can I get it engraved", "monogramming available")
- styling_advice: Fashion/styling advice (e.g., "how do I style this", "what to wear with it")

**Product Selection:**
- product_recommendation_request: User asks for recommendation (e.g., "which one should I choose", "what do you recommend")
- gift_recommendation: Gift recommendations (e.g., "good gift for wife", "gift ideas for anniversary")
- special_occasion_inquiry: Products for special occasions (e.g., "wedding gift", "graduation present")
- use_case_recommendation: Recommendations based on use case (e.g., "bag for work", "watch for sports")
- product_comparison: Compare products (e.g., "compare these two", "difference between X and Y")
- product_objection_handling: User has concerns (e.g., "it's too expensive", "not sure about quality")
- product_follow_up: More info about current product (e.g., "tell me more", "what else", when referring to shown product)
- product_reference: References specific product (e.g., "the first one", "that Chanel bag", "number 2")

**Availability & Inventory:**
- stock_check: Check availability (e.g., "is it in stock", "available now")
- waitlist_request: Join waitlist (e.g., "notify me when available", "add to waitlist")
- product_alert: Stock alerts (e.g., "alert me when back in stock", "notify when available")

**Shopping Cart & Checkout:**
- cart_operation: Cart management (e.g., "add to cart", "remove from cart", "view cart", "show my cart")
- checkout: Checkout/place order (e.g., "checkout", "place order", "buy now")
- payment_options: Payment questions (e.g., "payment methods", "installments available", "financing options")

**Orders & Returns:**
- order_tracking: Track order (e.g., "where is my order", "track shipment", "order status")
- order_history: Order history (e.g., "my orders", "past purchases", "order history")
- order_cancellation: Cancel order (e.g., "cancel my order", "cancel order #123")
- return_request: Return items (e.g., "return this", "I want to return", "process return")
- return_policy_inquiry: Return policy questions (e.g., "return policy", "can I return", "refund policy")
- delivery_inquiry: Delivery questions (e.g., "when will it arrive", "delivery time", "shipping time")

**Services & Support:**
- shipping_calculation: Shipping costs (e.g., "shipping cost", "delivery fee")
- store_location: Store locations (e.g., "where is your store", "store locations", "store hours")
- appointment_booking: Book appointments (e.g., "book appointment", "schedule visit", "make appointment")
- loyalty_program_inquiry: Loyalty programs (e.g., "loyalty program", "rewards", "membership benefits")
- complaint_handling: Complaints (e.g., "I have a complaint", "problem with order", "not satisfied")
- price_match: Price matching (e.g., "price match", "competitor price", "price comparison")
- coupon_application: Apply coupons (e.g., "apply coupon", "use promo code", "discount code")

**Account & Preferences:**
- wishlist_operation: Manage wishlist (e.g., "add to wishlist", "my wishlist", "view wishlist")
- preference_update: Update preferences (e.g., "I prefer", "update my preferences", "save my preferences")
- upselling_request: Complementary products (e.g., "what else goes with this", "complementary items")

**General:**
- greeting: Hello, hi, how are you, etc.
- casual_conversation: General conversation not shopping-related

EXAMPLES (CRITICAL - FOLLOW THESE EXACTLY):

**product_details** (has specific product name):
- "tell me more about Chanel Classic Flap Bag" → product_details
- "tell me more about 'Bulgari Serpenti Tubogas Watch'" → product_details
- "tell me about Rolex Submariner" → product_details
- "what is Bulgari Serpenti" → product_details
- "details about Chanel Classic Flap" → product_details
- "Bulgari Serpenti Watch" → product_details
- "Chanel bag details" → product_details

**product_search** (generic search, NO specific product name):
- "bags" → product_search
- "luxury watches" → product_search
- "find me a handbag" → product_search
- "show me watches" → product_search
- "luxury products" → product_search

**product_follow_up** (no product name, has product context):
- "tell me more" (with product context, no specific name) → product_follow_up
- "what else" (with product context) → product_follow_up

**category_browse_more** (no product name, has category):
- "tell me more" (no product context, has category) → category_browse_more
- "show me more" → category_browse_more
User: "what size is it" → size_inquiry
User: "what colors are available" → product_attribute_inquiry
User: "is it waterproof" → product_qa
User: "how do I clean it" → care_instructions
User: "what's the warranty" → warranty_inquiry
User: "can I get it engraved" → product_customization
User: "good gift for my wife" → gift_recommendation
User: "show me more" → category_browse_more
User: "add to cart" → cart_operation
User: "where is my order" → order_tracking
User: "return policy" → return_policy_inquiry

${conversationContext.length > 0 ? conversationContext.join('\n') + '\n' : ''}
${productContext.length > 0 ? productContext.join('\n') + '\n' : ''}

ANALYZE THE USER QUERY STEP BY STEP:

1. FIRST: Look for a SPECIFIC PRODUCT NAME (brand + model). If found → product_details
   Examples of product names: "Chanel Classic Flap", "Bulgari Serpenti", "Rolex Submariner", "Prada Galleria"
   
2. SECOND: If no product name, check for intent keywords:
   - "cart" → cart_operation
   - "order" → order_tracking/order_history
   - "return" → return_request/return_policy_inquiry
   - "warranty" → warranty_inquiry
   - "size" → size_inquiry
   - "gift" → gift_recommendation
   - "compare" → product_comparison
   - "checkout"/"buy now" → checkout
   - "wishlist" → wishlist_operation
   - "appointment" → appointment_booking
   - "store" → store_location
   - "payment" → payment_options
   - "shipping" → shipping_calculation
   - "delivery" → delivery_inquiry
   - "complaint" → complaint_handling
   - "coupon"/"promo" → coupon_application
   - "loyalty"/"rewards" → loyalty_program_inquiry
   - "price match" → price_match
   - "stock"/"available" → stock_check
   - "waitlist" → waitlist_request
   - "alert" → product_alert
   - "cancel" → order_cancellation
   - "care"/"clean" → care_instructions
   - "style"/"wear" → styling_advice
   - "customize"/"engrave" → product_customization
   - "recommend" → product_recommendation_request
   - "occasion" → special_occasion_inquiry
   - "use case" → use_case_recommendation
   - "objection"/"expensive" → product_objection_handling
   - "colors"/"material" → product_attribute_inquiry
   - "waterproof"/"last" → product_qa
   - "brands" → brand_inquiry
   - "show me more"/"more" → category_browse_more
   - "browse"/"show me [category]" → category_browse

3. THIRD: If no keywords match → product_search

CRITICAL: If the query contains a product name (even if it also has other words), it's ALWAYS product_details, NOT product_search.

Return ONLY this JSON format: {"intent": "intent_name"}
Do NOT add explanations, comments, or any other text.`
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
        const rawContent = response.choices[0].message.content;
        console.log(`🔍 Raw LLM intent response: "${rawContent}"`);
        
        // Try to parse JSON - handle both JSON objects and JSON wrapped in markdown code blocks
        let intent;
        try {
          // Try direct JSON parse first
          intent = JSON.parse(rawContent);
        } catch (e) {
          // Try extracting JSON from markdown code blocks
          const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || rawContent.match(/\{[\s\S]*"intent"[\s\S]*\}/);
          if (jsonMatch) {
            intent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } else {
            // Try to extract intent from plain text response
            const intentMatch = rawContent.match(/"intent"\s*:\s*"([^"]+)"/i) || rawContent.match(/intent["\s:]+([a-z_]+)/i);
            if (intentMatch) {
              intent = { intent: intentMatch[1] };
            } else {
              throw new Error('Could not parse intent from response');
            }
          }
        }
        
        // Don't override cart_operation if it was already detected - ALWAYS preserve it
        const detectedIntent = intent.intent || 'product_search';
        console.log(`🎯 LLM detected intent: ${detectedIntent}`);
        
        // Validate intent is in our list of valid intents
        const validIntents = [
          'product_search', 'category_browse', 'category_browse_more', 'brand_inquiry',
          'price_inquiry', 'price_match', 'stock_check', 'product_comparison',
          'product_details', 'product_attribute_inquiry', 'size_inquiry', 'product_qa',
          'product_recommendation_request', 'gift_recommendation', 'special_occasion_inquiry',
          'product_objection_handling', 'product_follow_up', 'product_reference',
          'use_case_recommendation', 'styling_advice', 'care_instructions',
          'warranty_inquiry', 'product_customization', 'wishlist_operation',
          'waitlist_request', 'product_alert', 'shipping_calculation',
          'delivery_inquiry', 'return_policy_inquiry', 'payment_options',
          'store_location', 'appointment_booking', 'loyalty_program_inquiry',
          'preference_update', 'cart_operation', 'checkout',
          'order_tracking', 'order_history', 'order_cancellation',
          'return_request', 'complaint_handling', 'coupon_application',
          'upselling_request', 'greeting', 'casual_conversation'
        ];
        
        const finalIntent = validIntents.includes(detectedIntent) ? detectedIntent : 'product_search';
        
        if (state.currentIntent === 'cart_operation') {
          console.log(`🎯 Keeping cart_operation intent (LLM suggested: ${detectedIntent})`);
          // ALWAYS keep cart_operation - never override
          state.currentIntent = 'cart_operation';
        } else if (state.currentIntent === 'product_details') {
          console.log(`🎯 Keeping product_details intent (LLM suggested: ${detectedIntent}, product: ${state.detectedProductName || 'N/A'})`);
          // ALWAYS keep product_details - never override (we detected product name)
          state.currentIntent = 'product_details';
          // Log the final intent for debugging
          console.log(`✅ Final intent: product_details (protected from LLM override)`);
        } else {
          state.currentIntent = finalIntent;
          if (detectedIntent !== finalIntent) {
            console.log(`⚠️ Intent "${detectedIntent}" not valid, defaulting to "${finalIntent}"`);
          } else {
            console.log(`✅ Intent classified as: ${finalIntent}`);
          }
        }
      } catch (parseError) {
        // Parse fallback - LLM returned response but we couldn't parse it
        console.error(`⚠️ Intent classification parse error: ${parseError.message}`);
        console.error(`   Raw response was: "${rawContent?.substring(0, 200)}..."`);
        state.currentIntent = this.intelligentFallback(query, state);
      }
    } catch (llmError) {
      // Provider error fallback – LLM provider failed completely
      console.error(`❌ LLM provider error during intent classification:`, {
        error: llmError.message,
        errorType: llmError.name,
        stack: llmError.stack?.split('\n').slice(0, 3).join('\n'),
        query: query.substring(0, 100),
        provider: llmProvider.provider || 'unknown'
      });
      state.currentIntent = this.intelligentFallback(query, state);
    }

    return state;
  }

  /**
   * Intelligent fallback intent classification when LLM fails
   * Uses keyword-based heuristics to classify intent
   */
  intelligentFallback(query, state) {
    const queryLower = (query || '').toLowerCase().trim();
    console.log(`🔄 Using intelligent fallback for: "${query}"`);

    // Check for specific product names (brand + model patterns)
    const productNamePatterns = [
      /(?:tell me|about|details|what is|info about)\s+(?:the\s+)?(?:chane[^ls]|bulgari|rolex|prada|herm[eè]s|gucci|louis vuitton|dior|cartier|omega|audemars|piguet|vacheron|constantin|tiffany|van cleef|arpels|bvlgari|serpenti|classic flap|submariner|galler[ia]|birkin|kelly|saffiano|tubogas|datejust|daytona|speedmaster)/i,
      /(?:^|\s)(?:chane[^ls]|bulgari|rolex|prada|herm[eè]s|gucci|louis vuitton|dior|cartier|omega|audemars|piguet|vacheron|constantin|tiffany|van cleef|arpels|bvlgari)\s+(?:classic|serpenti|submariner|galler[ia]|birkin|kelly|saffiano|tubogas|datejust|daytona|speedmaster|flap|bag|watch)/i
    ];
    
    if (productNamePatterns.some(p => p.test(query))) {
      console.log(`   → Detected product name, classifying as product_details`);
      return 'product_details';
    }

    // Check for "tell me more about" pattern
    if (/tell\s+me\s+(?:more\s+)?about\s+/i.test(query)) {
      console.log(`   → Detected "tell me about" pattern, classifying as product_details`);
      return 'product_details';
    }

    // Intent keyword mappings (order matters - more specific first)
    const intentKeywords = {
      // Cart & Checkout
      cart_operation: ['cart', 'add to', 'remove from', 'delete from', 'view cart', 'show cart', 'my cart', 'empty cart', 'clear cart'],
      checkout: ['checkout', 'buy now', 'place order', 'purchase', 'complete purchase'],
      payment_options: ['payment', 'installment', 'financing', 'pay', 'credit', 'debit'],
      
      // Orders & Returns
      order_tracking: ['track', 'where is', 'order status', 'shipment', 'tracking'],
      order_history: ['my orders', 'order history', 'past purchases', 'previous orders'],
      order_cancellation: ['cancel order', 'cancel my'],
      return_request: ['return this', 'i want to return', 'process return'],
      return_policy_inquiry: ['return policy', 'refund policy', 'can i return', 'return?'],
      delivery_inquiry: ['when will it arrive', 'delivery time', 'delivery date', 'when delivered'],
      
      // Product Information
      size_inquiry: ['size', 'sizing', 'fit', 'measurement', 'size chart', 'does it run', 'too small', 'too large'],
      warranty_inquiry: ['warranty', 'guarantee', 'protection', 'covered'],
      care_instructions: ['care', 'clean', 'maintain', 'care instructions', 'how to clean', 'cleaning'],
      product_customization: ['engrave', 'monogram', 'customize', 'personalize', 'custom'],
      styling_advice: ['style', 'styling', 'how to wear', 'what to wear', 'outfit'],
      product_attribute_inquiry: ['color', 'colours', 'material', 'fabric', 'leather', 'metal', 'dimensions'],
      product_qa: ['waterproof', 'water resistant', 'how long', 'last', 'durable', 'quality'],
      
      // Product Selection
      gift_recommendation: ['gift', 'present', 'gift for', 'gift ideas', 'anniversary gift', 'wedding gift'],
      special_occasion_inquiry: ['wedding', 'anniversary', 'birthday', 'graduation', 'occasion'],
      product_comparison: ['compare', 'difference', 'vs', 'versus', 'better', 'which is'],
      product_recommendation_request: ['recommend', 'which one', 'suggest', 'what do you recommend'],
      use_case_recommendation: ['for work', 'for sports', 'for travel', 'for everyday', 'use case'],
      product_objection_handling: ['too expensive', 'not sure', 'concerned', 'worried', 'doubt'],
      
      // Availability
      stock_check: ['in stock', 'available', 'availability', 'have it', 'do you have'],
      waitlist_request: ['waitlist', 'notify when', 'alert when', 'let me know when'],
      product_alert: ['alert', 'notify', 'back in stock', 'when available'],
      
      // Services
      shipping_calculation: ['shipping', 'delivery cost', 'delivery fee', 'shipping fee'],
      store_location: ['store', 'location', 'where is your', 'store hours', 'address'],
      appointment_booking: ['appointment', 'schedule', 'book', 'visit', 'consultation'],
      loyalty_program_inquiry: ['loyalty', 'rewards', 'membership', 'points', 'program'],
      complaint_handling: ['complaint', 'problem', 'issue', 'not satisfied', 'disappointed'],
      price_match: ['price match', 'competitor price', 'match price'],
      coupon_application: ['coupon', 'promo', 'promotional', 'discount code', 'voucher'],
      
      // Account
      wishlist_operation: ['wishlist', 'wish list', 'save for later'],
      preference_update: ['prefer', 'preference', 'i like', 'update preferences'],
      upselling_request: ['complementary', 'goes with', 'pair with', 'also need'],
      
      // Product Discovery
      category_browse_more: ['more', 'show me more', 'more please', 'more products'],
      category_browse: ['browse', 'show me', 'display', 'list'],
      brand_inquiry: ['brands', 'what brands', 'which brands', 'tell me about [brand]'],
    };

    // Check keywords in order of specificity
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        console.log(`   → Detected keyword match for: ${intent}`);
        return intent;
      }
    }

    // Check for product details patterns
    if (/^(what is|tell me|details|info|about)\s+/i.test(query) && query.length > 10) {
      console.log(`   → Generic "about" query, classifying as product_details`);
      return 'product_details';
    }

    // Default fallback
    console.log(`   → No specific intent detected, defaulting to product_search`);
    return 'product_search';
  }

  async memoryRetrievalNode(state) {
    // Retrieve relevant context from memory
    if (state.customerId) {
      state.preferences = memoryService.getCustomerPreferences(state.customerId);
    }
    
    // Use conversation history to inform context (get more messages for better context)
    const recentMessages = state.messages.slice(-6); // Increased from 3 to 6 for better context
    state.context.recentMessages = recentMessages.map(m => `${m.role}: ${m.content}`);
    state.context.conversationHistory = recentMessages; // Store full history for LLM
    
    // Extract context from memory
    if (state.memory) {
      if (state.memory.lastCategory) {
        state.context.lastCategory = state.memory.lastCategory;
      }
      if (state.memory.previousInterests && state.memory.previousInterests.length > 0) {
        state.context.previousInterests = state.memory.previousInterests;
      }
      if (state.memory.customerName) {
        state.context.customerName = state.memory.customerName;
      }
      if (state.memory.conversationFlow && state.memory.conversationFlow.length > 0) {
        state.context.conversationFlow = state.memory.conversationFlow.slice(-5); // Last 5 flow steps
      }
      // Product context
      if (state.memory.currentProduct) {
        state.context.currentProduct = state.memory.currentProduct;
      }
      if (state.memory.recentProducts && state.memory.recentProducts.length > 0) {
        state.context.recentProducts = state.memory.recentProducts;
      }
      if (state.memory.conversationState) {
        state.context.conversationState = state.memory.conversationState;
      }
    }
    
    return state;
  }

  async toolExecutionNode(state, query) {
    // Store query in state for later use
    state.query = query;
    
    // Store state reference for handlers that need it
    this.state = state;
    
    // Handle non-product queries directly
    if (state.currentIntent === 'greeting' || state.currentIntent === 'casual_conversation') {
      state.products = [];
      state.toolResponse = null;
      return state;
    }
    
    // Detect product references for product-specific intents
    const recentProducts = state.context.recentProducts || [];
    const currentProduct = state.context.currentProduct;
    
    // For cart operations, extract SKU or product name from query
    if (state.currentIntent === 'cart_operation') {
      // Extract SKU-like patterns from query (e.g., "PRADA-GALLERIA-SAFFIANO", "CH-CFB-MED-BLK")
      const skuPattern = /[A-Z0-9]+(?:-[A-Z0-9]+)+/g;
      const skuMatches = query.match(skuPattern);
      if (skuMatches && skuMatches.length > 0) {
        const detectedSku = skuMatches[0];
        console.log(`🔍 Detected SKU in cart operation: ${detectedSku}`);
        // Try to find product with this SKU
        const productBySku = recentProducts.find(p => p.sku === detectedSku) ||
                            (currentProduct && currentProduct.sku === detectedSku ? currentProduct : null);
        if (productBySku) {
          state.referencedProduct = productBySku;
          state.context.currentProduct = productBySku;
        } else {
          // Store the SKU for later use even if product not found in context
          state.detectedSku = detectedSku;
        }
      } else {
        // Extract product name from "add [product name] to cart" pattern
        // Pattern: "add" followed by text until "to cart"
        const addToCartPattern = /add\s+(.+?)\s+to\s+cart/i;
        const addMatch = query.match(addToCartPattern);
        if (addMatch && addMatch[1]) {
          const detectedProductName = addMatch[1].trim();
          console.log(`🔍 Detected product name in cart operation: ${detectedProductName}`);
          
          // Try to find product in recent products by name
          const productByName = recentProducts.find(p => {
            const productTitle = (p.title || '').toLowerCase();
            const detectedLower = detectedProductName.toLowerCase();
            return productTitle === detectedLower || 
                   productTitle.includes(detectedLower) ||
                   detectedLower.includes(productTitle);
          });
          
          if (productByName) {
            state.referencedProduct = productByName;
            state.context.currentProduct = productByName;
            console.log(`✅ Found product by name: ${productByName.sku} - ${productByName.title}`);
          } else {
            // Store product name for later use
            state.detectedProductName = detectedProductName;
          }
        }
      }
    }
    
    // Handle product detection for various intents
    if (state.currentIntent === 'product_details' && state.detectedProductName) {
      // For product_details, use the detected product name
      // Try to find product in recent products or search for it
      const productByName = recentProducts.find(p => {
        const productTitle = (p.title || '').toLowerCase();
        const detectedLower = state.detectedProductName.toLowerCase();
        return productTitle === detectedLower || 
               productTitle.includes(detectedLower) ||
               detectedLower.includes(productTitle);
      });
      
      if (productByName) {
        state.referencedProduct = productByName;
        state.context.currentProduct = productByName;
        console.log(`✅ Found product for details: ${productByName.sku} - ${productByName.title}`);
      } else {
        // Store for later product search
        console.log(`📝 Product name detected for details query: ${state.detectedProductName}`);
      }
    }
    
    if (state.currentIntent === 'product_reference' || 
        state.currentIntent === 'product_attribute_inquiry' ||
        state.currentIntent === 'size_inquiry' ||
        state.currentIntent === 'product_qa' ||
        state.currentIntent === 'product_follow_up' ||
        state.currentIntent === 'care_instructions' ||
        state.currentIntent === 'warranty_inquiry' ||
        state.currentIntent === 'product_customization' ||
        state.currentIntent === 'styling_advice' ||
        state.currentIntent === 'cart_operation') {
      // Try to detect which product user is referring to
      const referencedProduct = this.detectProductReference(query, recentProducts, currentProduct);
      if (referencedProduct) {
        state.referencedProduct = referencedProduct;
        // Update current product context
        state.context.currentProduct = referencedProduct;
      }
    }
    
    // OPTIMIZATION: Skip LLM tool selection for cart operations when we can force execution
    // This saves 2-5 seconds per cart operation
    if (state.currentIntent === 'cart_operation') {
      const queryLower = (query || '').toLowerCase();
      const hasDirectProductInfo = state.detectedSku || state.detectedProductName || state.referencedProduct || 
                                   (state.context.currentProduct || (state.context.recentProducts && state.context.recentProducts.length > 0));
      
      // For simple cart operations with known product info, skip LLM and go straight to forced execution
      if (hasDirectProductInfo || queryLower.includes('show') || queryLower.includes('view') || queryLower.includes('see') || queryLower.includes('my')) {
        console.log('⚡ Skipping LLM tool selection for cart operation - using direct execution');
        // Skip LLM call and go directly to forced execution
        state.skipToolSelection = true;
      }
    }
    
    try {
      // Skip LLM tool selection if we can force execution directly
      let response;
      let message;
      
      if (state.skipToolSelection) {
        // Skip LLM call - we'll handle it in the forced execution block
        message = { tool_calls: null };
      } else {
        // Use LLM with function calling to determine which tools to use
        response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `You are a luxury shopping assistant with access to powerful tools. Use the appropriate tools based on the user's request:

          - For product searches: use search_products
          - For stock checks: use check_stock  
          - For product comparisons: use compare_products
          - For detailed product info: use get_product_details
          - For product questions (size, color, material, features): use answer_product_question
          - For sizing inquiries: use answer_product_question (focus on size/fit information)
          - For product variants (colors, sizes): use get_product_variants
          - For use case recommendations: use recommend_product_by_use_case
          - For gift recommendations: use recommend_product_by_use_case (with gift context)
          - For special occasion inquiries: use recommend_product_by_use_case (with occasion context)
          - For styling advice: use answer_product_question (focus on styling/how to wear)
          - For care instructions: use answer_product_question (focus on care/maintenance)
          - For warranty inquiries: use answer_product_question (focus on warranty/guarantee)
          - For product customization: use answer_product_question (focus on customization options)
          - For handling objections or concerns: use handle_objection
          - For waitlist/stock alerts: use check_stock (to check availability, then inform about waitlist)
          - For cart operations: use add_to_cart, remove_from_cart, get_cart, update_cart_item, clear_cart
          - For checkout: use create_order (requires shipping address and payment method)
          - For order tracking: use get_order_status or get_order_history
          - For semantic order search (e.g., "my luxury handbag orders", "what did I order last month"): use search_order_history
          - For returns: use process_return
          - For return policy inquiries: provide information about return policy (no tool needed)
          - For delivery inquiries: use calculate_shipping or get_order_status
          - For payment options: provide information about payment methods (no tool needed)
          - For store location inquiries: provide store location information (no tool needed)
          - For appointment booking: provide information about booking appointments (no tool needed)
          - For loyalty program inquiries: provide information about loyalty programs (no tool needed)
          - For complaints: acknowledge and provide support information (no tool needed)
          - For coupons: use apply_coupon
          - For upselling: use suggest_complementary_products
          - For wishlist operations: use create_wishlist or get_wishlist
          - For shipping calculations: use calculate_shipping
          - For preference updates: use update_preferences
          
          Current intent: ${state.currentIntent}
          Customer preferences: ${JSON.stringify(state.preferences)}
          ${state.context.currentProduct ? `Current product context: ${state.context.currentProduct.title || state.context.currentProduct.sku}` : ''}
          ${state.context.recentProducts && state.context.recentProducts.length > 0 ? `Recent products shown: ${state.context.recentProducts.slice(0, 3).map((p, i) => `${i + 1}. ${p.title || p.sku}`).join(', ')}` : ''}
          
          IMPORTANT: 
          - If user references a product by number ("first one", "product 1"), name, or says "this"/"that", use the product context to identify which product they're asking about.
          - For product-specific questions (size, color, material, features, warranty), use answer_product_question.
          - For cart operations (add to cart, remove from cart, update quantity, view cart), ALWAYS use the appropriate cart tool (add_to_cart, remove_from_cart, update_cart_item, get_cart). Do NOT just search for products.
          - If user says "add [product] to cart" or "add the first one to cart", use add_to_cart tool with the product_sku from recent products context.
          - If user says "update [product] quantity to [number]" or "change quantity to [number]", use update_cart_item tool with product_sku and quantity.
          - If user says "remove [product] from cart", use remove_from_cart tool with product_sku.
          - If user provides a SKU (e.g., "add PRADA-GALLERIA-SAFFIANO to cart"), use that SKU directly in the cart tool. SKUs are typically in format like "PRADA-GALLERIA-SAFFIANO" or "CH-CFB-MED-BLK".
          - For "show cart", "view cart", "my cart" queries, use get_cart tool.
          - Always use tools when the user asks for specific actions like "check stock", "compare", "add to cart", "update cart", "remove from cart", "add to wishlist", etc.`
        },
        {
          role: 'user',
          content: query
        }
      ], {
        model: 'versatile',
        temperature: 0.3,
        tools: this.tools,
        // Force tool calling for cart operations and product details
        tool_choice: (state.currentIntent === 'cart_operation' || state.currentIntent === 'product_details') ? 'required' : 'auto'
      });

        message = response.choices[0].message;
      }
      
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
          
          // Inject customer_id if available - ALWAYS override to ensure consistency
          // This prevents the LLM from using the literal string 'customer_id' or wrong IDs
          if (state.customerId) {
            // Always use the customer ID from state, not what LLM provided
            args.customer_id = state.customerId;
            console.log(`🔧 Injected customer_id: ${state.customerId} for tool: ${toolName}`);
          } else {
            console.warn(`⚠️ No customerId in state for tool: ${toolName}, args:`, args);
          }
          
          // Inject product reference for product-related tools if not provided
          if (toolName === 'answer_product_question' || 
              toolName === 'get_product_details' || 
              toolName === 'get_product_variants' ||
              toolName === 'handle_objection') {
            if (!args.product_sku && !args.product_name && state.referencedProduct) {
              args.product_sku = state.referencedProduct.sku;
              args.product_name = state.referencedProduct.title;
            } else if (!args.product_sku && !args.product_name && state.context.currentProduct) {
              args.product_sku = state.context.currentProduct.sku;
              args.product_name = state.context.currentProduct.title;
            }
          }
          
          // Inject product reference for cart operations if not provided
          if (toolName === 'add_to_cart' || toolName === 'remove_from_cart' || toolName === 'update_cart_item') {
            // First, check if we detected a SKU directly in the query
            if (!args.product_sku && state.detectedSku) {
              args.product_sku = state.detectedSku;
              console.log(`🔧 Injected detected SKU: ${state.detectedSku} for ${toolName}`);
            }
            
            // Check if we detected a product name directly in the query
            if (!args.product_name && state.detectedProductName) {
              args.product_name = state.detectedProductName;
              console.log(`🔧 Injected detected product name: ${state.detectedProductName} for ${toolName}`);
            }
            
            if (!args.product_sku && !args.product_name) {
              // Try referenced product first
              if (state.referencedProduct) {
                args.product_sku = state.referencedProduct.sku;
                args.product_name = state.referencedProduct.title;
                console.log(`🔧 Injected referenced product: ${args.product_sku || args.product_name} for ${toolName}`);
              } 
              // Then try current product
              else if (state.context.currentProduct) {
                args.product_sku = state.context.currentProduct.sku;
                args.product_name = state.context.currentProduct.title;
                console.log(`🔧 Injected current product: ${args.product_sku || args.product_name} for ${toolName}`);
              }
              // Finally try recent products (first one)
              else if (state.context.recentProducts && state.context.recentProducts.length > 0) {
                const firstProduct = state.context.recentProducts[0];
                args.product_sku = firstProduct.sku;
                args.product_name = firstProduct.title;
                console.log(`🔧 Injected first recent product: ${args.product_sku || args.product_name} for ${toolName}`);
              }
            }
            
            // Ensure at least product_name is set if we have it
            if (!args.product_sku && !args.product_name && state.detectedProductName) {
              args.product_name = state.detectedProductName;
            }
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
          
          // Store product Q&A result
          if (toolName === 'answer_product_question' && result.success) {
            state.productQAResult = result;
          }
          
          // Store recommendation result
          if (toolName === 'recommend_product_by_use_case' && result.success) {
            state.recommendationResult = result;
          }
          
          // Store objection handling result
          if (toolName === 'handle_objection' && result.success) {
            state.objectionResult = result;
          }
          
          // Store comparison result
          if (toolName === 'compare_products' && result.success) {
            state.comparisonResult = result;
          }
          
          // Store product variants result
          if (toolName === 'get_product_variants' && result.success) {
            state.variantResult = result;
          }
          
          // Store product details result
          if (toolName === 'get_product_details' && result.success) {
            state.productDetailsResult = result;
          }
          
          // Store cart results
          if (['add_to_cart', 'remove_from_cart', 'get_cart', 'update_cart_item', 'clear_cart'].includes(toolName) && result.success) {
            state.cartResult = result;
          }
          
          // Store order results
          if (['create_order', 'get_order_status', 'get_order_history', 'search_order_history', 'cancel_order'].includes(toolName) && result.success) {
            state.orderResult = result;
          }
          
          // Store return results
          if (toolName === 'process_return' && result.success) {
            state.returnResult = result;
          }
          
          // Store coupon results
          if (toolName === 'apply_coupon' && result.success) {
            state.couponResult = result;
          }
          
          // Store complementary product suggestions
          if (toolName === 'suggest_complementary_products' && result.success) {
            state.complementaryResult = result;
          }
        }
        
          // OPTIMIZATION: Skip LLM response generation for structured results - we already have structured responses
          // This saves 2-4 seconds per operation
          if (state.currentIntent === 'cart_operation' && state.cartResult) {
            console.log('⚡ Skipping LLM response generation for cart operation - using direct response');
            // Skip LLM call - response will be generated directly in responseGenerationNode
            state.toolResponse = state.cartResult.message || JSON.stringify(state.cartResult);
          } else if (state.currentIntent === 'product_details' && state.productDetailsResult) {
            console.log('⚡ Skipping LLM response generation for product details - using structured response');
            // Skip LLM call - response will be generated directly from productDetailsResult in responseGenerationNode
            // Don't set toolResponse - let productDetailsResult be handled separately
          } else {
            // Get final response from LLM with tool results
            const finalResponse = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `Generate a natural, engaging response for a luxury shopping assistant. Use the tool results to provide accurate product recommendations.
          
          Context awareness:
          - Reference previous conversation if relevant (e.g., "As we discussed earlier..." or "Building on your interest in...")
          - Use the customer's name if provided to personalize the response
          - Maintain conversation flow and acknowledge context switches naturally
          - Sound human and conversational, not robotic`
        },
        ...(state.context.conversationHistory && state.context.conversationHistory.length > 0 ? [
          {
            role: 'system',
            content: `Previous conversation context:
${state.context.conversationHistory.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}

Use this context to make responses more natural and context-aware. Reference previous interactions when relevant, but don't force it.`
          }
        ] : []),
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
        
        const responseContent = finalResponse.choices[0].message.content;
        // Try to parse JSON if it's a JSON string
        try {
          const parsed = JSON.parse(responseContent);
          if (parsed && typeof parsed === 'object') {
            state.toolResponse = parsed;
          } else {
            state.toolResponse = responseContent;
          }
        } catch (e) {
          // Not JSON, use as string
          state.toolResponse = responseContent;
        }
          }
      } else {
        // No tool calls made - check if we should force tool execution
        // Force get_product_details for product_details intent
        if (state.currentIntent === 'product_details') {
          console.log('⚠️ No tool calls for product_details, forcing get_product_details execution');
          
          const toolArgs = { customer_id: state.customerId };
          
          // Use detected product name first
          if (state.detectedProductName) {
            toolArgs.product_name = state.detectedProductName;
            console.log(`🔧 Using detected product name: ${state.detectedProductName}`);
            
            // IMPROVEMENT: Search first to get SKU, then pass both for more reliable lookup
            // Use direct catalog search to bypass intent classification issues
            try {
              console.log(`🔍 Pre-search: Looking up products for "${state.detectedProductName}"`);
              
              // Bypass intent classification by using searchProductsInCatalog directly
              // This ensures we search by product title, not just brand
              const candidateProducts = await enhancedRAGService.searchProductsInCatalog(state.detectedProductName);
              console.log(`📦 Pre-search found ${candidateProducts.length} candidate products from catalog`);
              
              if (candidateProducts.length > 0) {
                // Try to find exact or close match
                const productNameLower = state.detectedProductName.toLowerCase().trim();
                let matchedProduct = candidateProducts.find(p => 
                  p.title.toLowerCase() === productNameLower
                ) || candidateProducts.find(p => {
                  const titleLower = p.title.toLowerCase();
                  return titleLower.includes(productNameLower) || productNameLower.includes(titleLower);
                });
                
                // If found, extract SKU and pass both
                if (matchedProduct && matchedProduct.sku) {
                  toolArgs.product_sku = matchedProduct.sku;
                  toolArgs.product_name = matchedProduct.title; // Use exact title from catalog
                  console.log(`✅ Pre-search matched: ${matchedProduct.sku} - ${matchedProduct.title}`);
                  console.log(`🔧 Will use both SKU and name for reliable lookup`);
                } else if (candidateProducts.length > 0) {
                  // Use first result as fallback
                  const firstProduct = candidateProducts[0];
                  toolArgs.product_sku = firstProduct.sku;
                  toolArgs.product_name = firstProduct.title;
                  console.log(`⚠️ Pre-search using first result: ${firstProduct.sku} - ${firstProduct.title}`);
                }
              }
            } catch (error) {
              console.warn(`⚠️ Pre-search failed, will use product name only:`, error.message);
              // Continue with product_name only
            }
          }
          // Use referenced product if available
          else if (state.referencedProduct) {
            toolArgs.product_sku = state.referencedProduct.sku;
            toolArgs.product_name = state.referencedProduct.title;
            console.log(`🔧 Using referenced product: ${state.referencedProduct.title}`);
          }
          // Use current product if available
          else if (state.context.currentProduct) {
            toolArgs.product_sku = state.context.currentProduct.sku;
            toolArgs.product_name = state.context.currentProduct.title;
            console.log(`🔧 Using current product: ${state.context.currentProduct.title}`);
          }
          // Use first recent product as fallback
          else if (state.context.recentProducts && state.context.recentProducts.length > 0) {
            const firstProduct = state.context.recentProducts[0];
            toolArgs.product_sku = firstProduct.sku;
            toolArgs.product_name = firstProduct.title;
            console.log(`🔧 Using first recent product: ${firstProduct.title}`);
          }
          
          if (toolArgs.product_name || toolArgs.product_sku) {
            console.log(`🔧 Forcing get_product_details with args:`, toolArgs);
            const result = await this.handleToolCall('get_product_details', toolArgs);
            if (result.success) {
              state.productDetailsResult = result;
              // Don't set toolResponse for structured results - let productDetailsResult be handled separately
              console.log(`✅ Product details retrieved: ${result.product?.title || 'Unknown'}`);
            } else {
              state.toolResponse = result.message || 'Product not found';
              console.warn(`⚠️ Product details not found: ${result.message}`);
            }
          } else {
            console.warn('⚠️ No product information available for get_product_details');
            state.toolResponse = 'I couldn\'t identify which product you\'re asking about. Could you please specify the product name?';
          }
        }
        // Force cart tool execution for cart operations
        else if (state.currentIntent === 'cart_operation') {
          console.log('⚠️ No tool calls for cart operation, forcing cart tool execution');
          
          // Determine which cart tool to use based on query
          const queryLower = (query || '').toLowerCase();
          let toolToCall = null;
          let toolArgs = { customer_id: state.customerId };
          
          if (queryLower.includes('show') || queryLower.includes('view') || queryLower.includes('see') || queryLower.includes('my')) {
            toolToCall = 'get_cart';
          } else if (queryLower.includes('add') || queryLower.includes('put')) {
            toolToCall = 'add_to_cart';
            // Use detected SKU if available
            if (state.detectedSku) {
              toolArgs.product_sku = state.detectedSku;
            } 
            // Use detected product name if available
            else if (state.detectedProductName) {
              toolArgs.product_name = state.detectedProductName;
            }
            // Use referenced product if available
            else if (state.referencedProduct) {
              toolArgs.product_sku = state.referencedProduct.sku;
              toolArgs.product_name = state.referencedProduct.title;
            } 
            // Use current product if available
            else if (state.context.currentProduct) {
              toolArgs.product_sku = state.context.currentProduct.sku;
              toolArgs.product_name = state.context.currentProduct.title;
            } 
            // Use first recent product as fallback
            else if (state.context.recentProducts && state.context.recentProducts.length > 0) {
              const firstProduct = state.context.recentProducts[0];
              toolArgs.product_sku = firstProduct.sku;
              toolArgs.product_name = firstProduct.title;
            }
            toolArgs.quantity = 1;
          } else if (queryLower.includes('remove') || queryLower.includes('delete')) {
            toolToCall = 'remove_from_cart';
            if (state.detectedSku) {
              toolArgs.product_sku = state.detectedSku;
            } else if (state.detectedProductName) {
              toolArgs.product_name = state.detectedProductName;
            } else if (state.referencedProduct) {
              toolArgs.product_sku = state.referencedProduct.sku;
              toolArgs.product_name = state.referencedProduct.title;
            }
          } else if (queryLower.includes('update') || queryLower.includes('change') || queryLower.includes('modify')) {
            toolToCall = 'update_cart_item';
            
            // Extract quantity from query (e.g., "to quantity 2", "to 2", "quantity 2")
            const quantityPatterns = [
              /(?:to|set|change|update).*?quantity.*?(\d+)/i,
              /(?:to|set|change|update).*?(\d+)/i,
              /quantity.*?(\d+)/i,
              /(\d+)(?:\s*$|\s*items?|\s*units?)/i
            ];
            
            let extractedQuantity = null;
            for (const pattern of quantityPatterns) {
              const match = query.match(pattern);
              if (match && match[1]) {
                extractedQuantity = parseInt(match[1], 10);
                if (!isNaN(extractedQuantity) && extractedQuantity > 0) {
                  break;
                }
              }
            }
            
            if (extractedQuantity) {
              toolArgs.quantity = extractedQuantity;
              console.log(`🔧 Extracted quantity: ${extractedQuantity}`);
            } else {
              // Default to 1 if no quantity found
              toolArgs.quantity = 1;
              console.warn('⚠️ No quantity found in update query, defaulting to 1');
            }
            
            // Set product SKU or name
            if (state.detectedSku) {
              toolArgs.product_sku = state.detectedSku;
            } else if (state.detectedProductName) {
              toolArgs.product_name = state.detectedProductName;
            } else if (state.referencedProduct) {
              toolArgs.product_sku = state.referencedProduct.sku;
              toolArgs.product_name = state.referencedProduct.title;
            } else if (state.context.currentProduct) {
              toolArgs.product_sku = state.context.currentProduct.sku;
              toolArgs.product_name = state.context.currentProduct.title;
            }
          }
          
          if (toolToCall) {
            console.log(`🔧 Forcing ${toolToCall} with args:`, toolArgs);
            const result = await this.handleToolCall(toolToCall, toolArgs);
            if (result.success) {
              state.cartResult = result;
              state.toolResponse = result.message || JSON.stringify(result);
            }
          } else {
            // Fallback: try get_cart
            console.log('🔧 Falling back to get_cart');
            const result = await this.handleToolCall('get_cart', { customer_id: state.customerId });
            if (result.success) {
              state.cartResult = result;
              state.toolResponse = result.message || JSON.stringify(result);
            }
          }
        } else {
          // No tool calls needed, use direct query
          const products = await enhancedRAGService.searchProducts(query, state.context);
          state.products = products;
        }
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
    console.log('[LangGraph] responseGenerationNode - has productDetailsResult:', !!state.productDetailsResult);
    console.log('[LangGraph] responseGenerationNode - query:', state.query);
    
    // Check structured results FIRST (before generic toolResponse)
    if (state.productDetailsResult) {
      // Handle enhanced product detail responses
      console.log('[LangGraph] Generating enhanced product detail response...');
      const detailsResult = state.productDetailsResult.product;
      
      if (!detailsResult) {
        console.warn('[LangGraph] productDetailsResult exists but product is missing');
        // Fall through to toolResponse handling
      } else {
        let opening = `Here are the details for ${detailsResult.title}:\n\n`;
        opening += `${detailsResult.comprehensiveDetails || detailsResult.detailedDescription || detailsResult.description || 'No description available'}\n\n`;
        
        // Add features if available
        if (detailsResult.features && detailsResult.features.length > 0) {
          opening += `✨ Features: ${detailsResult.features.join(', ')}\n\n`;
        }
        
        // Add pros if available
        if (detailsResult.pros && detailsResult.pros.length > 0) {
          opening += `✨ Highlights: ${detailsResult.pros.join(', ')}\n\n`;
        }
        
        // Add key attributes
        if (detailsResult.attributes) {
          const attrs = detailsResult.attributes;
          const attrInfo = [];
          if (attrs.size || attrs.dimensions) attrInfo.push(`Size: ${attrs.size || attrs.dimensions}`);
          if (attrs.color) attrInfo.push(`Color: ${attrs.color}`);
          if (attrs.material) attrInfo.push(`Material: ${attrs.material}`);
          if (attrs.weight) attrInfo.push(`Weight: ${attrs.weight}`);
          if (attrInfo.length > 0) {
            opening += `📋 ${attrInfo.join(' • ')}\n\n`;
          }
        }
        
        const price = typeof detailsResult.price === 'object' 
          ? `${detailsResult.price.amount} ${detailsResult.price.currency}` 
          : `${detailsResult.price || 'N/A'} AED`;
        opening += `💰 Price: ${price}\n`;
        if (detailsResult.rating) {
          opening += `⭐ Rating: ${detailsResult.rating}/5`;
          if (detailsResult.reviews) {
            opening += ` (${detailsResult.reviews} reviews)`;
          }
          opening += `\n`;
        }
        
        // Add use cases if available
        if (detailsResult.useCases && detailsResult.useCases.length > 0) {
          opening += `\n💼 Perfect for: ${detailsResult.useCases.join(', ')}\n`;
        }
        
        state.response = {
          opening: opening.trim(),
          items: [],
          cta: detailsResult.careInstructions 
            ? `${detailsResult.careInstructions}\n\nWould you like to know more about this product, see variants, or add it to your wishlist?`
            : "Would you like to know more about this product, see variants, or add it to your wishlist?",
          quick_replies: ["Add to cart", "Show variants", "Compare with similar"]
        };
        console.log('[LangGraph] Enhanced product detail response generated');
        return state; // Exit early - response is set
      }
    }
    
    if (state.toolResponse) {
      // Use tool-generated response
      // If toolResponse is a string, try to parse it as JSON
      if (typeof state.toolResponse === 'string') {
        try {
          const parsed = JSON.parse(state.toolResponse);
          if (parsed && typeof parsed === 'object' && parsed.opening) {
            state.response = parsed;
          } else {
            // If parsed but doesn't have opening, treat as opening text
            state.response = {
              opening: state.toolResponse,
              items: state.products?.slice(0, 5).map(p => ({
                headline: p.title,
                price: typeof p.price === 'object' ? `${p.price.amount} ${p.price.currency}` : `${p.price} AED`,
                one_liner: p.description || 'Luxury product',
                image: '🛍️',
                sku: p.sku || null,
                brand: p.brand || null
              })) || [],
              cta: "Would you like to know more?",
              quick_replies: ["Tell me more", "Show similar", "Add to cart"]
            };
          }
        } catch (e) {
          // Not JSON, treat as opening text
          state.response = {
            opening: state.toolResponse,
            items: state.products?.slice(0, 5).map(p => ({
              headline: p.title,
              price: typeof p.price === 'object' ? `${p.price.amount} ${p.price.currency}` : `${p.price} AED`,
              one_liner: p.description || 'Luxury product',
              image: '🛍️'
            })) || [],
            cta: "Would you like to know more?",
            quick_replies: ["Tell me more", "Show similar", "Add to cart"]
          };
        }
      } else if (typeof state.toolResponse === 'object') {
        // Already an object
        state.response = state.toolResponse;
      } else {
        // Fallback
        state.response = {
          opening: String(state.toolResponse),
          items: state.products?.slice(0, 5).map(p => ({
            headline: p.title,
            price: typeof p.price === 'object' ? `${p.price.amount} ${p.price.currency}` : `${p.price} AED`,
            one_liner: p.description || 'Luxury product',
            image: '🛍️'
          })) || [],
          cta: "Would you like to know more?",
          quick_replies: ["Tell me more", "Show similar", "Add to cart"]
        };
      }
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
    } else if (state.productQAResult) {
        // Handle product Q&A responses
        console.log('[LangGraph] Generating product Q&A response...');
        const qaResult = state.productQAResult;
        state.response = {
          opening: `${qaResult.product.title}: ${qaResult.answer}`,
          items: [],
          cta: "Would you like to know more about this product or explore other options?",
          quick_replies: ["Tell me more", "Show similar products", "Add to wishlist"]
        };
        console.log('[LangGraph] Product Q&A response generated');
      } else if (state.recommendationResult) {
        // Handle use case recommendations
        console.log('[LangGraph] Generating recommendation response...');
        const recResult = state.recommendationResult;
        const items = recResult.products.map(p => ({
          headline: p.title,
          price: typeof p.price === 'object' ? `${p.price.amount} ${p.price.currency}` : `${p.price} AED`,
          one_liner: p.description || 'Luxury product',
          image: '🛍️'
        }));
        state.response = {
          opening: recResult.recommendations,
          items: items,
          cta: "Which product interests you most?",
          quick_replies: ["Tell me more", "Compare products", "Different options"]
        };
        console.log('[LangGraph] Recommendation response generated');
      } else if (state.objectionResult) {
        // Handle objection responses
        console.log('[LangGraph] Generating objection response...');
        const objResult = state.objectionResult;
        let items = [];
        
        // Include alternatives if available
        if (objResult.alternatives && objResult.alternatives.length > 0) {
          items = objResult.alternatives.map(p => ({
            headline: p.title,
            price: typeof p.price === 'object' ? `${p.price.amount} ${p.price.currency}` : `${p.price} AED`,
            one_liner: p.description || 'Alternative option',
            image: '🛍️'
          }));
        }
        
        state.response = {
          opening: objResult.response,
          items: items,
          cta: objResult.has_alternatives 
            ? "Would you like to know more about any of these alternatives, or would you prefer to discuss the original product further?"
            : "Is there anything else I can help clarify about this product?",
          quick_replies: objResult.has_alternatives 
            ? ["Tell me more", "Compare options", "Show original"]
            : ["Tell me more", "Show alternatives", "Get help"]
        };
        console.log('[LangGraph] Objection response generated');
      } else if (state.comparisonResult) {
        // Handle comparison responses
        console.log('[LangGraph] Generating comparison response...');
        const compResult = state.comparisonResult.comparison;
        const items = compResult.products.map(p => ({
          headline: p.title,
          price: typeof p.price === 'object' ? `${p.price.amount} ${p.price.currency}` : `${p.price} AED`,
          one_liner: `${p.brand} - ${p.description || 'Luxury product'}`,
          image: '🛍️'
        }));
        
        state.response = {
          opening: compResult.summary || 'Here\'s a comparison of the products:',
          items: items,
          cta: "Would you like more details about any of these products, or help deciding which one is right for you?",
          quick_replies: ["Tell me more", "Show details", "Get recommendation"]
        };
        console.log('[LangGraph] Comparison response generated');
      } else if (state.variantResult) {
        // Handle product variant responses
        console.log('[LangGraph] Generating variant response...');
        const variantResult = state.variantResult;
        const variants = variantResult.variants || [];
        
        let opening = '';
        if (variantResult.variant_type === 'color') {
          opening = `The ${variantResult.base_product.title} is available in ${variants.length} color${variants.length > 1 ? 's' : ''}:\n\n`;
        } else if (variantResult.variant_type === 'size') {
          opening = `The ${variantResult.base_product.title} is available in ${variants.length} size${variants.length > 1 ? 's' : ''}:\n\n`;
        } else {
          opening = `Here are the available variants for ${variantResult.base_product.title}:\n\n`;
        }
        
        const items = variants.slice(0, 5).map((v, index) => {
          const price = typeof v.price === 'object' ? `${v.price.amount} ${v.price.currency}` : `${v.price} AED`;
          const attrs = v.attributes || {};
          const variantInfo = [];
          if (attrs.color) variantInfo.push(`Color: ${attrs.color}`);
          if (attrs.size) variantInfo.push(`Size: ${attrs.size}`);
          if (attrs.material) variantInfo.push(`Material: ${attrs.material}`);
          
          return {
            headline: `${v.title}`,
            price: price,
            one_liner: variantInfo.length > 0 ? variantInfo.join(' • ') : v.description || 'Available variant',
            image: '🛍️'
          };
        });
        
        state.response = {
          opening: opening,
          items: items,
          cta: variants.length > 0 
            ? "Would you like to know more about any of these variants?"
            : "I can help you find similar products or check availability.",
          quick_replies: ["Tell me more", "Show details", "Check availability"]
        };
        console.log('[LangGraph] Variant response generated');
      } else if (state.productDetailsResult && !state.toolResponse) {
        // This should not be reached if we handled it above, but keep as fallback
        console.log('[LangGraph] Fallback: Generating enhanced product detail response...');
        const detailsResult = state.productDetailsResult.product;
        
        if (detailsResult) {
          let opening = `Here are the details for ${detailsResult.title}:\n\n`;
          opening += `${detailsResult.comprehensiveDetails || detailsResult.detailedDescription || detailsResult.description}\n\n`;
          
          // Add pros if available
          if (detailsResult.pros && detailsResult.pros.length > 0) {
            opening += `✨ Highlights: ${detailsResult.pros.join(', ')}\n\n`;
          }
          
          // Add key attributes
          if (detailsResult.attributes) {
            const attrs = detailsResult.attributes;
            const attrInfo = [];
            if (attrs.size) attrInfo.push(`Size: ${attrs.size}`);
            if (attrs.color) attrInfo.push(`Color: ${attrs.color}`);
            if (attrs.material) attrInfo.push(`Material: ${attrs.material}`);
            if (attrInfo.length > 0) {
              opening += `📋 ${attrInfo.join(' • ')}\n\n`;
            }
          }
          
          const price = typeof detailsResult.price === 'object' ? `${detailsResult.price.amount} ${detailsResult.price.currency}` : `${detailsResult.price} AED`;
          opening += `💰 Price: ${price}\n`;
          if (detailsResult.rating) {
            opening += `⭐ Rating: ${detailsResult.rating}/5\n`;
          }
          
          state.response = {
            opening: opening.trim(),
            items: [],
            cta: detailsResult.careInstructions 
              ? `${detailsResult.careInstructions}\n\nWould you like to know more about this product, see variants, or add it to your wishlist?`
              : "Would you like to know more about this product, see variants, or add it to your wishlist?",
            quick_replies: ["Show variants", "Add to wishlist", "Compare with similar"]
          };
          console.log('[LangGraph] Enhanced product detail response generated (fallback)');
        }
      } else if (state.cartResult) {
        // OPTIMIZATION: Generate cart response directly without LLM call
        // This saves 2-4 seconds per cart operation
        console.log('[LangGraph] Generating cart response (optimized - no LLM)...');
        const cartOp = state.cartResult;
        const cart = cartOp.cart || { items: [], total: 0 };
        
        // More natural, human-like responses
        let opening = '';
        if (!cartOp.success) {
          // Handle failures more naturally
          if (cartOp.message && cartOp.message.includes('stock')) {
            opening = `I'm sorry, but ${cartOp.message.toLowerCase()}. `;
            opening += `Would you like me to check when this item will be back in stock, or would you prefer to see similar alternatives?`;
          } else {
            opening = cartOp.message || "I wasn't able to complete that request. Could you try again or let me know what you'd like to do?";
          }
        } else if (cartOp.message && cartOp.message.includes('Added')) {
          // Successfully added to cart
          const itemName = cartOp.item?.title || cartOp.item?.product_name || 'item';
          opening = `Perfect! I've added ${itemName} to your cart. `;
          if (cart.items && cart.items.length > 1) {
            opening += `You now have ${cart.items.length} items in your cart.`;
          }
        } else if (cartOp.message && cartOp.message.includes('removed')) {
          opening = `Done! I've removed ${cartOp.removed_item?.title || cartOp.removed_item?.product_name || 'the item'} from your cart.`;
        } else if (cartOp.message && cartOp.message.includes('updated')) {
          const itemName = cartOp.item?.title || cartOp.item?.product_name || 'item';
          opening = `Great! I've updated the quantity of ${itemName} in your cart.`;
        } else if (cart && cart.items && cart.items.length > 0) {
          // Cart view with items - show actual cart contents
          opening = `Here's what's in your cart:\n\n`;
          cart.items.forEach((item, index) => {
            const price = typeof item.price === 'object' 
              ? `${item.price.amount} ${item.price.currency}` 
              : (typeof item.price === 'number' ? `${item.price} AED` : `${item.price || '0'} AED`);
            opening += `${index + 1}. ${item.title || item.product_name || 'Item'} - ${price} x ${item.quantity || 1}\n`;
          });
          
          // Calculate total if not provided
          const total = cart.total || cart.items.reduce((sum, item) => {
            const itemPrice = typeof item.price === 'object' ? item.price.amount : (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0);
            return sum + (itemPrice * (item.quantity || 1));
          }, 0);
          
          opening += `\nTotal: ${total.toFixed(2)} ${cart.currency || 'AED'}`;
        } else {
          // Empty cart
          opening = `Your cart is currently empty. Would you like to start shopping? I'd be happy to help you find something that suits your taste!`;
        }
        
        state.response = {
          opening: opening.trim(),
          items: [],
          cta: cart.items && cart.items.length > 0 
            ? "Would you like to checkout, add more items, or continue browsing?"
            : "What kind of products are you interested in today?",
          quick_replies: cart.items && cart.items.length > 0
            ? ["Checkout", "Continue shopping", "View cart"]
            : ["Show me handbags", "Browse watches", "Explore jewelry"]
        };
        console.log('[LangGraph] Cart response generated (optimized)');
      } else if (state.orderResult) {
        // Handle order operation responses
        console.log('[LangGraph] Generating order response...');
        const orderOp = state.orderResult;
        
        if (orderOp.order_id) {
          // Order created
          const order = orderOp.order || {};
          let opening = `✅ ${orderOp.message || 'Order created successfully!'}\n\n`;
          opening += `Order ID: ${orderOp.order_id}\n`;
          opening += `Total: ${order.total || 0} ${order.currency || 'AED'}\n`;
          opening += `Status: ${order.status || 'confirmed'}\n`;
          opening += `Payment: ${order.payment_status || 'pending'}\n`;
          
          if (order.items && order.items.length > 0) {
            opening += `\nItems:\n`;
            order.items.forEach((item, index) => {
              opening += `${index + 1}. ${item.title} x${item.quantity}\n`;
            });
          }
          
          state.response = {
            opening: opening.trim(),
            items: [],
            cta: "Your order has been confirmed! You'll receive updates on your order status. Anything else I can help you with?",
            quick_replies: ["Track order", "Browse more", "Order history"]
          };
        } else if (orderOp.order) {
          // Order status
          const order = orderOp.order;
          let opening = `Order Status: ${order.status || 'Unknown'}\n\n`;
          opening += `Order ID: ${order.order_id}\n`;
          opening += `Total: ${order.total || 0} ${order.currency || 'AED'}\n`;
          opening += `Payment: ${order.payment_status || 'pending'}\n`;
          
          if (order.shipped_at) {
            opening += `Shipped: ${new Date(order.shipped_at).toLocaleDateString()}\n`;
          }
          if (order.delivered_at) {
            opening += `Delivered: ${new Date(order.delivered_at).toLocaleDateString()}\n`;
          }
          
          state.response = {
            opening: opening.trim(),
            items: [],
            cta: "Is there anything else you'd like to know about your order?",
            quick_replies: ["Order history", "Browse products", "Get help"]
          };
        } else if (orderOp.orders) {
          // Order history (regular or semantic search)
          if (orderOp.formatted_response) {
            // Semantic search result - use LLM-formatted response
            state.response = {
              opening: orderOp.formatted_response,
              items: [],
              cta: "Would you like to see details for any specific order?",
              quick_replies: ["Track order", "Browse products", "Get help"]
            };
          } else {
            // Regular order history
            const orders = orderOp.orders || [];
            let opening = `Your Order History (${orders.length} order${orders.length !== 1 ? 's' : ''}):\n\n`;
            
            orders.forEach((order, index) => {
              opening += `${index + 1}. Order ${order.order_id} - ${order.total || 0} ${order.currency || 'AED'} (${order.status || 'Unknown'})\n`;
            });
            
            state.response = {
              opening: opening.trim(),
              items: [],
              cta: "Would you like to see details for any specific order?",
              quick_replies: ["Track order", "Browse products", "Get help"]
            };
          }
        } else {
          state.response = {
            opening: orderOp.message || 'Order operation completed',
            items: [],
            cta: "How else can I help you?",
            quick_replies: ["Browse products", "View cart", "Get help"]
          };
        }
        console.log('[LangGraph] Order response generated');
      } else if (state.returnResult) {
        // Handle return responses
        console.log('[LangGraph] Generating return response...');
        const returnOp = state.returnResult;
        
        let opening = `✅ ${returnOp.message || 'Return request submitted'}\n\n`;
        opening += `Return ID: ${returnOp.return_id}\n`;
        opening += `Refund Amount: ${returnOp.refund_amount || 0} AED\n`;
        opening += `Status: ${returnOp.status || 'pending'}\n`;
        
        state.response = {
          opening: opening.trim(),
          items: [],
          cta: returnOp.status === 'approved' 
            ? "Your return has been approved! The refund will be processed shortly. Anything else I can help with?"
            : "Your return request is being processed. We'll update you soon. Is there anything else I can help with?",
          quick_replies: ["Order history", "Browse products", "Get help"]
        };
        console.log('[LangGraph] Return response generated');
      } else if (state.couponResult) {
        // Handle coupon responses
        console.log('[LangGraph] Generating coupon response...');
        const couponOp = state.couponResult;
        
        state.response = {
          opening: `✅ ${couponOp.message || 'Coupon applied'}\n\nDiscount: ${couponOp.discount_percent || 0}% off`,
          items: [],
          cta: "Would you like to proceed to checkout or add more items?",
          quick_replies: ["View cart", "Checkout", "Continue shopping"]
        };
        console.log('[LangGraph] Coupon response generated');
      } else if (state.complementaryResult) {
        // Handle complementary product suggestions
        console.log('[LangGraph] Generating complementary products response...');
        const compResult = state.complementaryResult;
        
        const items = compResult.products.map(p => ({
          headline: p.title,
          price: typeof p.price === 'object' ? `${p.price.amount} ${p.price.currency}` : `${p.price} AED`,
          one_liner: p.description || 'Complementary product',
          image: '🛍️'
        }));
        
        state.response = {
          opening: compResult.suggestion || 'Here are some products that complement your cart:',
          items: items,
          cta: "Would you like to add any of these to your cart?",
          quick_replies: ["Add to cart", "View cart", "Tell me more"]
        };
        console.log('[LangGraph] Complementary products response generated');
      } else {
        // Generate response from products with full context
        console.log('[LangGraph] Generating product response...');
        // Pass full context including conversation history and customer info
        const responseContext = {
          ...state.context,
          conversationHistory: state.context.conversationHistory || [],
          previousInterests: state.context.previousInterests || [],
          customerName: state.context.customerName,
          preferences: state.preferences
        };
        state.response = await enhancedRAGService.generateResponse(
          state.query || 'luxury products',
          state.products,
          responseContext
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
    // Defensive check: ensure state exists
    if (!state) {
      console.error('[LangGraph] memoryUpdateNode called with undefined state');
      return;
    }
    
    // Ensure context exists
    if (!state.context) {
      state.context = {};
    }
    
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
    
    // Track previous interests
    const previousInterests = state.memory.previousInterests || [];
    if (lastCategory && !previousInterests.includes(lastCategory)) {
      previousInterests.push(lastCategory);
      // Keep only last 5 interests
      if (previousInterests.length > 5) {
        previousInterests.shift();
      }
    }
    
    // Track conversation flow
    const conversationFlow = state.memory.conversationFlow || [];
    conversationFlow.push({
      intent: state.currentIntent,
      query: state.query,
      category: lastCategory,
      timestamp: new Date().toISOString()
    });
    // Keep only last 10 flow steps
    if (conversationFlow.length > 10) {
      conversationFlow.shift();
    }
    
    // Track products shown in response
    let recentProducts = state.memory.recentProducts || [];
    let currentProduct = state.memory.currentProduct;
    
    // If products were shown, add them to recent products
    if (state.products && state.products.length > 0) {
      const newProducts = state.products.map((p, index) => ({
        sku: p.sku || `product_${index}`,
        title: p.title || p.headline || 'Product',
        brand: p.brand || '',
        price: p.price,
        index: index + 1,
        viewedAt: new Date().toISOString()
      }));
      
      // Add new products, avoiding duplicates
      newProducts.forEach(newProd => {
        const exists = recentProducts.find(p => p.sku === newProd.sku);
        if (!exists) {
          recentProducts.push(newProd);
        }
      });
      
      // Keep only last 10 products
      if (recentProducts.length > 10) {
        recentProducts = recentProducts.slice(-10);
      }
    }
    
    // Update current product if a specific product was referenced or shown
    if (state.referencedProduct) {
      currentProduct = {
        sku: state.referencedProduct.sku,
        title: state.referencedProduct.title,
        brand: state.referencedProduct.brand,
        viewedAt: new Date().toISOString()
      };
    } else if (state.context.currentProduct) {
      currentProduct = state.context.currentProduct;
    } else if (state.products && state.products.length > 0 && (state.currentIntent === 'product_details' || state.currentIntent === 'product_follow_up')) {
      // If user asked for product details, set first product as current
      const firstProduct = state.products[0];
      currentProduct = {
        sku: firstProduct.sku,
        title: firstProduct.title || firstProduct.headline,
        brand: firstProduct.brand,
        viewedAt: new Date().toISOString()
      };
    }
    
    // Update conversation state based on intent
    let conversationState = state.memory.conversationState || 'browsing';
    if (state.currentIntent === 'product_details' || 
        state.currentIntent === 'product_attribute_inquiry' ||
        state.currentIntent === 'size_inquiry' ||
        state.currentIntent === 'product_qa' ||
        state.currentIntent === 'product_follow_up' ||
        state.currentIntent === 'care_instructions' ||
        state.currentIntent === 'warranty_inquiry' ||
        state.currentIntent === 'product_customization' ||
        state.currentIntent === 'styling_advice') {
      conversationState = 'product_detail';
    } else if (state.currentIntent === 'product_comparison') {
      conversationState = 'comparing';
    } else if (state.currentIntent === 'product_search' || 
               state.currentIntent === 'category_browse' ||
               state.currentIntent === 'category_browse_more' ||
               state.currentIntent === 'gift_recommendation' ||
               state.currentIntent === 'special_occasion_inquiry' ||
               state.currentIntent === 'use_case_recommendation' ||
               state.currentIntent === 'product_recommendation_request') {
      conversationState = 'browsing';
    } else if (state.currentIntent === 'cart_operation' || 
               state.currentIntent === 'checkout' ||
               state.currentIntent === 'payment_options') {
      conversationState = 'checkout';
    } else if (state.currentIntent === 'order_tracking' ||
               state.currentIntent === 'order_history' ||
               state.currentIntent === 'return_request' ||
               state.currentIntent === 'delivery_inquiry') {
      conversationState = 'order_management';
    }
    
    // Update conversation context
    const context = {
      ...state.memory,
      lastCategory,
      previousInterests,
      conversationFlow,
      messageCount: (state.memory.messageCount || 0) + 1,
      lastIntent: state.currentIntent,
      updatedAt: new Date().toISOString(),
      currentProduct: currentProduct,
      recentProducts: recentProducts,
      conversationState: conversationState
    };
    
    // Preserve customer name if it exists
    if (state.memory.customerName) {
      context.customerName = state.memory.customerName;
    }
    
    memoryService.updateConversationContext(state.conversationId, context);
    
    // Store bot response
    if (state.response && typeof state.response === 'object' && state.response.opening) {
      memoryService.storeMessage(
        state.conversationId,
        'assistant',
        state.response.opening,
        { products: state.products.length, category: lastCategory, intent: state.currentIntent }
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
    
    // Get cart data if available
    let cartData = null;
    if (state.cartResult && state.cartResult.cart) {
      cartData = state.cartResult.cart;
    } else if (state.customerId) {
      // Try to fetch cart if not in result but we have customer ID
      // (async operations can't be done here, so this is a fallback)
      // The cart should already be in cartResult from tool execution
    }
    
    if (state.response && typeof state.response === 'object' && state.response.opening) {
      console.log('[LangGraph] formatResponse - returning state.response');
      const metadata = {
        intent: state.currentIntent,
        productsFound: state.products.length,
        context: state.memory,
        preferences: state.preferences
      };
      
      // Add cart to metadata if available
      if (cartData) {
        metadata.cart = cartData;
      }
      
      return {
        success: true,
        naturalResponse: state.response,
        metadata: metadata
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
          image: '🛍️',
          sku: p.sku || null,
          brand: p.brand || null
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
            image: '🛍️',
            sku: p.sku || null,
            brand: p.brand || null
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


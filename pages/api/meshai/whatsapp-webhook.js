// WhatsApp Business API Webhook Handler
// Handles incoming messages and triggers AI product recommendations
// Now using Groq LLM + RAG + Multi-Agent System

export default async function handler(req, res) {
  console.log('🔍 WhatsApp webhook called with method:', req.method);
  console.log('🔍 Request headers:', req.headers);
  console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));

  // Handle webhook verification (GET request)
  if (req.method === 'GET') {
    return handleWebhookVerification(req, res);
  }

  // Handle incoming messages (POST request)
  if (req.method === 'POST') {
    return handleIncomingWebhook(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Handle webhook verification from WhatsApp
async function handleWebhookVerification(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Webhook verification request:', { mode, token, challenge });

  // Get verify token from environment or use default for testing
  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'test-verify-token-123';
  
  console.log('🔍 Expected verify token:', expectedToken);
  console.log('🔍 Provided verify token:', token);

  // Check if mode and token are correct
  if (mode === 'subscribe' && token === expectedToken) {
    console.log('✅ Webhook verified successfully');
    return res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    console.log('❌ Mode check:', mode === 'subscribe');
    console.log('❌ Token check:', token === expectedToken);
    return res.status(403).json({ 
      error: 'Forbidden',
      details: {
        expectedToken: expectedToken,
        providedToken: token,
        mode: mode,
        challenge: challenge
      }
    });
  }
}

// Handle incoming webhook data
async function handleIncomingWebhook(req, res) {
  try {
    const { body } = req;
    
    // Verify webhook signature for security
    if (!verifyWebhookSignature(req)) {
      console.log('❌ Webhook signature verification failed');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('✅ Webhook signature verified');

    // Process incoming message
    if (body.object === 'whatsapp_business_account') {
      console.log('📱 Processing WhatsApp Business Account webhook');
      
      for (const entry of body.entry) {
        console.log('📝 Processing entry:', entry.id);
        
        for (const change of entry.changes) {
          console.log('🔄 Processing change:', change.field);
          
          if (change.field === 'messages') {
            await processIncomingMessages(change.value);
          }
        }
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Verify webhook signature for security
function verifyWebhookSignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  
  if (!signature || !appSecret) {
    console.log('⚠️ Missing signature or app secret for verification');
    // In development, allow requests without signature
    return process.env.NODE_ENV !== 'production';
  }

  // Create expected signature using HMAC-SHA256
  const crypto = require('crypto');
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  // Compare signatures
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  console.log('🔐 Signature verification:', { 
    provided: signature, 
    expected: expectedSignature, 
    isValid 
  });

  return isValid;
}

// Process incoming WhatsApp messages
async function processIncomingMessages(value) {
  console.log('📨 Processing incoming messages:', JSON.stringify(value, null, 2));
  
  if (value.messages) {
    for (const message of value.messages) {
      const contact = value.contacts ? value.contacts[0] : null;
      await handleIncomingMessage(message, contact);
    }
  }
}

// Handle individual incoming message
async function handleIncomingMessage(message, contact) {
  try {
    console.log('📱 Handling incoming message:', JSON.stringify(message, null, 2));
    console.log('👤 Contact info:', JSON.stringify(contact, null, 2));

    const messageData = {
      id: message.id,
      from: message.from,
      name: contact?.profile?.name || 'Unknown',
      message: message.text?.body || '',
      timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      type: message.type,
      status: 'unread',
      aiProcessed: false
    };

    console.log('📝 Processed message data:', messageData);

    // Only process text messages
    if (message.type !== 'text' || !messageData.message.trim()) {
      console.log('⏭️ Skipping non-text or empty message');
      return;
    }

    // Store message in database (implement your preferred storage solution)
    await storeMessage(messageData);

    // Check if this is a quick reply response (numbered response)
    const quickReplyAction = handleQuickReply(messageData.message);
    if (quickReplyAction) {
      console.log('🔢 Quick reply detected:', quickReplyAction);
      await sendTypingIndicator(messageData.from);
      await handleQuickReplyAction(quickReplyAction, messageData.from);
      await markMessageAsProcessed(messageData.id);
      return;
    }

    // Show typing indicator before processing
    await sendTypingIndicator(messageData.from);
    
    // Trigger AI product recommendation using production API
    await triggerAIIntegratedRecommendation(messageData);

    console.log('✅ Successfully processed WhatsApp message:', messageData.id);
  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
  }
}

// Handle quick reply responses (numbered responses)
function handleQuickReply(message) {
  const trimmedMessage = message.trim();
  
  // Check for numbered responses (1, 2, 3, etc.)
  if (/^[1-9]$/.test(trimmedMessage)) {
    const number = parseInt(trimmedMessage);
    
    // Map quick reply numbers to specific actions based on context
    const quickReplyActions = {
      1: "handbags",     // Align with web: 1 → handbags
      2: "watches",      // 2 → watches
      3: "jewelry",      // 3 → jewelry
      4: "all-products"  // 4 → all products
    };
    
    return quickReplyActions[number] || null;
  }
  
  // Check for common quick reply phrases
  const quickReplyPhrases = {
    'view all products': "all-products",
    'show me handbags': "handbags",
    'browse watches': "watches",
    'explore jewelry': "jewelry",
    'get help': "help"
  };
  
  const lowerMessage = trimmedMessage.toLowerCase();
  for (const [phrase, action] of Object.entries(quickReplyPhrases)) {
    if (lowerMessage.includes(phrase)) {
      return action;
    }
  }
  
  return null; // Not a quick reply
}

// Handle quick reply actions with specific responses
async function handleQuickReplyAction(action, from) {
  try {
    console.log('🎯 Handling quick reply action:', action);
    
    // Use LangGraph endpoint; send action as a descriptive message to avoid numeric misrouting
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/meshai/langgraph-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: getActionMessage(action),
        customerId: `whatsapp-${from}`,
        context: {
          source: 'whatsapp',
          quickReplyAction: action,
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Quick reply API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🎯 Quick reply result:', JSON.stringify(result, null, 2));
    
    if (result.success && result.naturalResponse) {
      const { naturalResponse } = result;
      const formatted = formatProductionResponse(naturalResponse);
      await sendWhatsAppMessage(from, formatted);
    } else {
      const fallbackMessage = getFallbackMessage(action);
      await sendWhatsAppMessage(from, fallbackMessage);
    }
    
  } catch (error) {
    console.error('❌ Error handling quick reply action:', error);
    const errorMessage = "I'm having trouble processing your request right now. Please try again in a moment.";
    await sendWhatsAppMessage(from, errorMessage);
  }
}

// Get action-specific message for RAG
function getActionMessage(action) {
  const actionMessages = {
    'handbags': 'Show me luxury handbags',
    'watches': 'Show me luxury watches',
    'jewelry': 'Show me luxury jewelry',
    'skincare': 'Show me luxury skincare products',
    'wellness': 'Show me wellness products',
    'all-products': 'Show me all luxury products across all categories including fashion, watches, jewelry, skincare, and wellness',
    'louis-vuitton': 'Show me Louis Vuitton products including bags, accessories, and luxury items',
    'chanel': 'Show me Chanel products including handbags, accessories, and luxury items',
    'hermes': 'Show me Hermès products including handbags, accessories, and luxury items',
    'fashion': 'Show me all fashion products including bags, accessories, and luxury items',
    'brands': 'Show me products from luxury brands like Chanel, Hermès, Gucci, Louis Vuitton, Rolex, and La Mer',
    'price': 'Show me luxury products at different price ranges',
    'handbags': 'Show me luxury handbags and bags from top brands',
    'more': 'Show me more luxury products in different categories',
    'home': 'Welcome! Show me your luxury product collection'
  };
  
  return actionMessages[action] || 'Show me luxury products';
}

// Get fallback message for quick reply actions
function getFallbackMessage(action) {
  const fallbackMessages = {
    'louis-vuitton': "Here's our Louis Vuitton collection! Let me show you the best luxury items from Louis Vuitton.",
    'chanel': "Perfect! Let me show you our Chanel collection including handbags and accessories.",
    'hermes': "Excellent! Here's our Hermès collection featuring luxury handbags and accessories.",
    'all-products': "Wonderful! Let me show you our complete luxury collection across all categories.",
    'fashion': "Here are our top fashion products! Let me show you the best luxury items from our collection.",
    'brands': "Perfect! Let me show you products from our luxury brand partners like Chanel, Hermès, Gucci, and more.",
    'price': "Great! Let me show you luxury products at different price points to fit your budget.",
    'handbags': "Excellent! Here's our premium handbag collection from top luxury brands.",
    'more': "Wonderful! Let me show you more options from our luxury collection.",
    'home': "Welcome back! How can I help you find the perfect luxury products today?"
  };
  
  return fallbackMessages[action] || "Thanks for your selection! Let me help you with that.";
}

// Generate contextual response based on message content
function generateContextualResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Greeting responses
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return "Hello! 👋 Welcome to our luxury shopping experience. I'm here to help you find the perfect products. What would you like to explore today?";
  }
  
  // Help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "I'm your personal shopping assistant! 🛍️ I can help you find luxury products across categories like fashion, skincare, wellness, and more. What type of products are you looking for?";
  }
  
  // Product category requests
  if (lowerMessage.includes('bag') || lowerMessage.includes('handbag') || lowerMessage.includes('purse')) {
    return "Great choice! I have an amazing collection of luxury handbags from top brands like Chanel, Hermès, Gucci, and Louis Vuitton. What style are you looking for?";
  }
  
  if (lowerMessage.includes('watch') || lowerMessage.includes('timepiece')) {
    return "Excellent! I can show you luxury watches from Rolex, Cartier, Bulgari, and other premium brands. Are you looking for something classic or modern?";
  }
  
  if (lowerMessage.includes('skincare') || lowerMessage.includes('beauty') || lowerMessage.includes('cream')) {
    return "Perfect! I have premium skincare products from La Mer, La Prairie, and other luxury brands. What's your main skincare concern?";
  }
  
  if (lowerMessage.includes('fragrance') || lowerMessage.includes('perfume') || lowerMessage.includes('cologne')) {
    return "Wonderful! I can help you find luxury fragrances from Tom Ford, Chanel, Dior, and other exclusive brands. What type of scent do you prefer?";
  }
  
  // Handle non-product queries gracefully
  if (lowerMessage.includes('car') || lowerMessage.includes('vehicle') || lowerMessage.includes('automobile')) {
    return "I specialize in luxury fashion, skincare, wellness, and lifestyle products. While I don't have cars, I can help you find luxury accessories, watches, or other premium items. What interests you?";
  }
  
  if (lowerMessage.includes('house') || lowerMessage.includes('home') || lowerMessage.includes('property')) {
    return "I focus on luxury personal products like fashion, skincare, and wellness items. For home decor, I have some beautiful luxury pieces. What type of personal luxury items are you looking for?";
  }
  
  // General product requests
  if (lowerMessage.includes('luxury') || lowerMessage.includes('premium') || lowerMessage.includes('high-end')) {
    return "I love that you're looking for luxury items! I have an exclusive collection of premium products. What specific category interests you most?";
  }
  
  // Budget-related
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive')) {
    return "I understand you're thinking about budget. I have luxury products at various price points. What's your preferred price range?";
  }
  
  // Default contextual response
  return "I'd love to help you find the perfect products! Could you tell me more about what you're looking for? I have luxury items in fashion, skincare, wellness, and more.";
}

// Store message in database
async function storeMessage(messageData) {
  // Implement database storage
  // This could be MongoDB, PostgreSQL, or any other database
  console.log('Storing message:', messageData);
  
  // For now, just log the message
  // In production, save to your database
}

// Trigger AI-Integrated recommendation using Groq LLM + RAG + Multi-Agent
async function triggerAIIntegratedRecommendation(messageData) {
  try {
    console.log('🤖 Triggering AI-integrated recommendation for:', messageData.from);
    
    const message = messageData.text?.body || '';
    const quickReply = handleQuickReply(message);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const payload = quickReply
      ? { message: getActionMessage(quickReply) }
      : { message };
    
    const response = await fetch(`${baseUrl}/api/meshai/langgraph-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        customerId: `whatsapp-${messageData.from}`,
        context: {
          source: 'whatsapp',
          conversationId: `wa_${messageData.from}`,
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`LangGraph API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ AI recommendation failed:', result.error);
      await sendErrorMessage(messageData.from);
      return;
    }
    
    // Send the AI-generated response (naturalResponse)
    if (result.naturalResponse) {
      const formatted = formatProductionResponse(result.naturalResponse);
      await sendWhatsAppMessage(messageData.from, formatted);
    } else {
      await sendWhatsAppMessage(messageData.from, "I'm here to help you find luxury products. What would you like to explore?");
    }
    
    // Quick reply handling - initialize filteredProducts
    let filteredProducts = [];
    if (quickReply || /^[1-4]$/.test(message)) {
      const quickReplyNumber = parseInt(message);
      console.log(`📱 Quick reply detected: ${quickReplyNumber}`);
      
      const mappings = {
        1: { 
          category: "Fashion", 
          subcategory: "Bags", 
          query: "luxury handbags",
          brands: ["Chanel", "Hermès", "Louis Vuitton", "Gucci"]
        },
        2: { 
          category: "Skincare", 
          query: "luxury skincare",
          brands: ["La Mer", "SK-II", "Chanel"]
        },
        3: { 
          category: "Wellness", 
          query: "wellness relaxation",
          brands: ["Aromatherapy Associates", "Jo Malone", "This Works"]
        },
        4: { 
          query: "luxury products",
          brands: ["Chanel", "Hermès", "Louis Vuitton", "Rolex", "Bulgari"]
        }
      };
      
      const mapping = mappings[quickReplyNumber];
      if (mapping) {
        console.log(`🎯 Mapping:`, mapping);
        
        if (mapping.category) {
          // Filter by category first
          filteredProducts = normalizedProductCatalog.filter(product => {
            if (mapping.subcategory) {
              // For bags, look for products that have both "Fashion" and "Bags" in categories
              return product.category.some(cat => cat.toLowerCase().includes(mapping.category.toLowerCase())) &&
                     product.category.some(cat => cat.toLowerCase().includes(mapping.subcategory.toLowerCase()));
            } else {
              return product.category.some(cat => cat.toLowerCase().includes(mapping.category.toLowerCase()));
            }
          });
          
          // If no products found by category, try by brand
          if (filteredProducts.length === 0 && mapping.brands) {
            console.log(`🔍 No products found by category, trying brands:`, mapping.brands);
            filteredProducts = normalizedProductCatalog.filter(product => 
              mapping.brands.some(brand => 
                product.brand.toLowerCase().includes(brand.toLowerCase())
              )
            );
          }
          
          console.log(`🔍 Filtered products for ${mapping.category}: ${filteredProducts.length}`);
        } else if (mapping.brands) {
          // Filter by brands for "show everything"
          filteredProducts = normalizedProductCatalog.filter(product => 
            mapping.brands.some(brand => 
              product.brand.toLowerCase().includes(brand.toLowerCase())
            )
          );
          console.log(`🔍 Filtered products by brands: ${filteredProducts.length}`);
        }
      }
    } else {
      // Text-based filtering
      const queryLower = message.toLowerCase();
      
      if (queryLower.includes('bags') || queryLower.includes('handbags')) {
        filteredProducts = normalizedProductCatalog.filter(product => 
          product.category.some(cat => cat.toLowerCase().includes('bags')) ||
          product.subcategory && product.subcategory.toLowerCase().includes('handbags')
        );
      } else if (queryLower.includes('skincare') || queryLower.includes('beauty')) {
        filteredProducts = normalizedProductCatalog.filter(product => 
          product.category.some(cat => cat.toLowerCase().includes('skincare'))
        );
      } else if (queryLower.includes('wellness') || queryLower.includes('spa')) {
        filteredProducts = normalizedProductCatalog.filter(product => 
          product.category.some(cat => cat.toLowerCase().includes('wellness'))
        );
      } else if (queryLower.includes('watches')) {
        filteredProducts = normalizedProductCatalog.filter(product => 
          product.category.some(cat => cat.toLowerCase().includes('watches'))
        );
      } else if (queryLower.includes('jewelry')) {
        filteredProducts = normalizedProductCatalog.filter(product => 
          product.category.some(cat => cat.toLowerCase().includes('jewelry'))
        );
      }
    }
    
    // Take top 3 products
    const topProducts = filteredProducts.slice(0, 3);
    
    // Generate response
    const quickReplyNumber = quickReply || (/^[1-4]$/.test(message) ? parseInt(message) : null);
    const recommendationResponse = {
      success: true,
      naturalResponse: {
        opening: generateOpening(message, topProducts.length, quickReplyNumber),
        items: topProducts.map(product => ({
          id: product.sku,
          headline: product.title,
          one_liner: `${product.description.substring(0, 60)}... - ${product.price.amount} ${product.price.currency}`,
          price: `${product.price.amount} ${product.price.currency}`,
          brand: product.brand,
          category: product.category[0],
          sku: product.sku,
          rating: product.rating,
          badges: product.badges.slice(0, 2),
          image: product.images[0] || "🛍️"
        })),
        cta: "Which product interests you most?",
        quick_replies: generateQuickReplies(message, topProducts, quickReplyNumber),
        metadata: {
          totalProducts: filteredProducts.length,
          displayedProducts: topProducts.length,
          region: "UAE",
          currency: "AED",
          timestamp: new Date().toISOString()
        }
      }
    };

    console.log('✅ Generated response with', topProducts.length, 'products');
    
    if (recommendationResponse.success && recommendationResponse.naturalResponse) {
      const formattedMessage = formatProductionResponse(recommendationResponse.naturalResponse);
      await sendWhatsAppMessage(messageData.from, formattedMessage);
    } else {
      await sendWhatsAppMessage(messageData.from, "I'm here to help you find luxury products. What would you like to explore?");
    }
    
  } catch (error) {
    console.error('❌ Production AI recommendation failed:', error);
    await sendWhatsAppMessage(messageData.from, "I'm here to help you find luxury products. What would you like to explore?");
  }
}

// Helper functions for direct implementation
function generateOpening(query, productCount, quickReplyNumber = null) {
  const queryLower = query.toLowerCase();
  
  // Handle quick replies first
  if (quickReplyNumber) {
    const quickReplyMessages = {
      1: "Welcome to our luxury handbag collection! Here are our top picks for you.",
      2: "Welcome to our luxury skincare collection! Premium beauty products for you.",
      3: "Discover our wellness collection! Luxury products for your well-being.",
      4: "Welcome to our luxury boutique! Here are our finest products across all categories."
    };
    return quickReplyMessages[quickReplyNumber] || `Welcome to our luxury boutique! We found ${productCount} perfect products for you.`;
  }
  
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

function generateQuickReplies(query, products, quickReplyNumber = null) {
  const queryLower = query.toLowerCase();
  const brands = [...new Set(products.map(p => p.brand))];
  
  // Handle quick replies first
  if (quickReplyNumber) {
    const quickReplyOptions = {
      1: ["More luxury handbags", "View accessories", "Show me everything"],
      2: ["More skincare products", "View wellness items", "Show me everything"],
      3: ["More wellness products", "View spa items", "Show me everything"],
      4: ["View more products", "Get help", "Contact us"]
    };
    return quickReplyOptions[quickReplyNumber] || ["View more products", "Get help", "Contact us"];
  }
  
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

// Format production response for WhatsApp
function formatProductionResponse(response) {
  const { opening, items, cta, quick_replies } = response;
  
  let message = `${opening}\n\n`;
  
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.image} ${item.headline} - ${item.price}\n`;
      message += `   ${item.one_liner}\n\n`;
    });
  }
  
  message += `💬 ${cta}\n\n`;
  message += `Quick replies:\n`;
  quick_replies.forEach((reply, index) => {
    message += `${index + 1}. ${reply}\n`;
  });
  
  return message;
}

// Legacy AI recommendation (kept for fallback)
async function triggerAIRecommendation(messageData) {
  try {
    console.log('🤖 Triggering AI recommendation for message:', messageData.message);
    
    // Call the Simplified Advanced Multi-Agent AI recommendation API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/meshai/simplified-advanced-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageData.message,
        customerId: `whatsapp-${messageData.from}`,
        context: {
          source: 'whatsapp',
          customerName: messageData.name,
          timestamp: messageData.timestamp
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI recommendation API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🤖 AI recommendation result:', JSON.stringify(result, null, 2));
    
    if (result.success && result.recommendations && result.recommendations.length > 0) {
      // Store recommendation
      await storeRecommendation({
        messageId: messageData.id,
        customerName: messageData.name,
        originalMessage: messageData.message,
        recommendedProducts: result.recommendations,
        timestamp: new Date().toISOString(),
        status: 'active'
      });

      // Format natural response for WhatsApp
      const naturalMessage = formatNaturalResponseForWhatsApp(result);
      
      // Send natural recommendation back to customer via WhatsApp
      await sendWhatsAppMessage(messageData.from, naturalMessage);
    } else {
      // Send a context-aware response based on the message content
      const contextResponse = generateContextualResponse(messageData.message);
      await sendWhatsAppMessage(messageData.from, contextResponse);
    }

    // Mark message as AI processed
    await markMessageAsProcessed(messageData.id);
    
  } catch (error) {
    console.error('❌ Error generating AI recommendation:', error);
    // Send error message to customer
    await sendWhatsAppMessage(messageData.from, "I'm having trouble processing your request right now. Please try again in a moment.");
  }
}


// Store recommendation in database
async function storeRecommendation(recommendationData) {
  // Implement database storage for recommendations
  console.log('Storing recommendation:', recommendationData);
}

// Mark message as AI processed
async function markMessageAsProcessed(messageId) {
  // Update message status in database
  console.log('Marking message as processed:', messageId);
}

// Send typing indicator
async function sendTypingIndicator(to) {
  try {
    console.log('⌨️ Sending typing indicator to:', to);
    
    const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: '...'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Typing indicator failed:', response.status, errorData);
      return false;
    }

    console.log('✅ Typing indicator sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending typing indicator:', error);
    return false;
  }
}

// Send WhatsApp message
async function sendWhatsAppMessage(to, message) {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
      console.error('WhatsApp credentials not configured');
      return;
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('WhatsApp message sent:', result);
    
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

// Format natural response for WhatsApp
function formatNaturalResponseForWhatsApp(result) {
  if (!result.naturalResponse) {
    return formatRecommendationMessage(result.recommendations, result.metadata);
  }

  const { naturalResponse, recommendations } = result;
  
  let message = `🤖 *AI Product Recommendations*\n\n`;
  message += `${naturalResponse.opening}\n\n`;
  
  naturalResponse.items.forEach((item, index) => {
    const rec = recommendations.find(r => (r.productId || r.id) === item.id);
    const price = rec?.product?.price || rec?.price || 0;
    const emoji = rec?.product?.image || rec?.image || '🛍️';
    
    message += `${index + 1}. ${emoji} *${item.headline}* - ${price} AED\n`;
    message += `   ${item.one_liner}\n\n`;
  });
  
  message += `💬 ${naturalResponse.cta}\n\n`;
  message += `Quick replies:\n`;
  naturalResponse.quick_replies.forEach((reply, index) => {
    message += `${index + 1}. ${reply}\n`;
  });
  
  return message;
}

// Format recommendation message for WhatsApp (fallback)
function formatRecommendationMessage(recommendations, metadata) {
  if (!recommendations || recommendations.length === 0) {
    return "Thank you for your message! I'm here to help you find the perfect products. Could you tell me more about what you're looking for?";
  }

  let message = "🤖 *AI Product Recommendations*\n\n";
  message += "Based on your message, here are my top recommendations:\n\n";

  recommendations.slice(0, 3).forEach((rec, index) => {
    if (rec.product) {
      message += `${index + 1}. *${rec.product.name}* - ${rec.product.price} AED\n`;
      message += `   ${rec.reason || 'Great product for you'}\n`;
      message += `   Confidence: ${(rec.confidence * 100).toFixed(0)}%\n`;
      message += `   Category: ${rec.product.category}\n\n`;
    }
  });

  if (metadata && metadata.overallConfidence) {
    message += `Overall confidence: ${(metadata.overallConfidence * 100).toFixed(0)}%\n`;
  }

  message += "\nWould you like more information about any of these products?";
  
  return message;
}

// Helper function to get product by ID
function getProductById(productId) {
  const products = [
    { id: 'P001', name: 'Organic Green Tea', price: 12.99 },
    { id: 'P002', name: 'Himalayan Salt Lamp', price: 29.99 },
    { id: 'P003', name: 'Essential Oil Diffuser', price: 45.99 },
    { id: 'P004', name: 'Yoga Mat Premium', price: 39.99 },
    { id: 'P005', name: 'Meditation Cushion', price: 24.99 },
    { id: 'P006', name: 'Herbal Sleep Tea', price: 15.99 }
  ];
  
  return products.find(p => p.id === productId);
}

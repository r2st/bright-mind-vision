// WhatsApp Business API Webhook Handler
// Handles incoming messages and triggers AI product recommendations

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
    const quickReplyResponse = handleQuickReply(messageData.message);
    if (quickReplyResponse) {
      console.log('🔢 Quick reply detected:', quickReplyResponse);
      await sendWhatsAppMessage(messageData.from, quickReplyResponse);
      await markMessageAsProcessed(messageData.id);
      return;
    }

    // Trigger AI product recommendation
    await triggerAIRecommendation(messageData);

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
    
    // Map quick reply numbers to responses
    const quickReplyMap = {
      1: "Great choice! Let me show you more options in that category.",
      2: "Excellent! I'll help you explore that area in more detail.",
      3: "Perfect! Let me find the best options for you.",
      4: "Wonderful! I'll show you our top recommendations.",
      5: "Fantastic! Let me help you discover more products."
    };
    
    return quickReplyMap[number] || "Thanks for your selection! Let me help you with that.";
  }
  
  // Check for common quick reply phrases
  const quickReplyPhrases = {
    'view all fashion': "Here are our top fashion products! Let me show you the best luxury items.",
    'explore handbags': "Perfect! Let me show you our premium handbag collection.",
    'discover luxury brands': "Excellent! I'll introduce you to our luxury brand partners.",
    'more options': "Great! Let me show you more options in that category.",
    'fashion collection': "Here's our complete fashion collection for you to explore.",
    'back to home': "Welcome back! How can I help you find the perfect products today?"
  };
  
  const lowerMessage = trimmedMessage.toLowerCase();
  for (const [phrase, response] of Object.entries(quickReplyPhrases)) {
    if (lowerMessage.includes(phrase)) {
      return response;
    }
  }
  
  return null; // Not a quick reply
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

// Trigger AI product recommendation with natural response
async function triggerAIRecommendation(messageData) {
  try {
    console.log('🤖 Triggering AI recommendation for message:', messageData.message);
    
    // Call the enhanced RAG-based AI recommendation API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/meshai/ai-recommendation-rag`, {
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
    
    message += `${index + 1}. ${emoji} *${item.headline}* - $${price}\n`;
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
      message += `${index + 1}. *${rec.product.name}* - $${rec.product.price}\n`;
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

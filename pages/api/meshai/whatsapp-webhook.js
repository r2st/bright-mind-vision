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

    // Trigger AI product recommendation
    await triggerAIRecommendation(messageData);

    console.log('✅ Successfully processed WhatsApp message:', messageData.id);
  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
  }
}

// Store message in database
async function storeMessage(messageData) {
  // Implement database storage
  // This could be MongoDB, PostgreSQL, or any other database
  console.log('Storing message:', messageData);
  
  // For now, just log the message
  // In production, save to your database
}

// Trigger AI product recommendation
async function triggerAIRecommendation(messageData) {
  try {
    console.log('🤖 Triggering AI recommendation for message:', messageData.message);
    
    // Call the existing AI recommendation API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/meshai/ai-recommendation`, {
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
    
    if (result.success && result.recommendations && result.recommendations.products.length > 0) {
      // Store recommendation
      await storeRecommendation({
        messageId: messageData.id,
        customerName: messageData.name,
        originalMessage: messageData.message,
        recommendedProducts: result.recommendations.products,
        timestamp: new Date().toISOString(),
        status: 'active'
      });

      // Send recommendation back to customer via WhatsApp
      await sendWhatsAppMessage(messageData.from, formatRecommendationMessage(result.recommendations));
    } else {
      // Send a helpful response even if no specific recommendations
      await sendWhatsAppMessage(messageData.from, "Thank you for your message! I'm here to help you find the perfect products. Could you tell me more about what you're looking for?");
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

// Format recommendation message for WhatsApp
function formatRecommendationMessage(recommendation) {
  if (!recommendation.products || recommendation.products.length === 0) {
    return "Thank you for your message! I'm here to help you find the perfect products. Could you tell me more about what you're looking for?";
  }

  let message = "🤖 *AI Product Recommendations*\n\n";
  message += "Based on your message, here are my top recommendations:\n\n";

  recommendation.products.slice(0, 3).forEach((rec, index) => {
    const product = getProductById(rec.productId);
    if (product) {
      message += `${index + 1}. *${product.name}* - $${product.price}\n`;
      message += `   ${rec.primaryReason || rec.reasons?.[0] || 'Great product for you'}\n`;
      message += `   Confidence: ${(rec.confidence * 100).toFixed(0)}%\n\n`;
    }
  });

  message += "Would you like more information about any of these products?";
  
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

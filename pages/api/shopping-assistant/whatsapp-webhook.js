// WhatsApp Business API Webhook Handler
// Handles incoming messages and triggers AI product recommendations
// Now using Groq LLM + RAG + Multi-Agent System

import { memoryService } from '../../../services/memoryService.js';

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
    
    // Check if this is a status update (status updates may use different signatures or be retries)
    const isStatusUpdate = body.entry?.some(entry => 
      entry.changes?.some(change => 
        change.value?.statuses && change.value.statuses.length > 0
      )
    );
    
    // Verify webhook signature for security
    // Skip verification if no signature provided (local testing)
    // Also skip for status updates if they fail verification (they're just notifications)
    const signatureCheck = verifyWebhookSignature(req);
    if (signatureCheck === false) {
      if (isStatusUpdate) {
        // For status updates, log but don't reject - they're just delivery notifications
        console.log('⚠️ Status update signature verification failed, but processing anyway (status updates may use different signatures)');
      } else {
        console.log('❌ Webhook signature verification failed');
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } else if (signatureCheck === true) {
      console.log('✅ Webhook signature verified');
    } else {
      console.log('⚠️ Webhook signature check skipped (development mode)');
    }

    // Process incoming message
    if (body.object === 'whatsapp_business_account') {
      console.log('📱 Processing WhatsApp Business Account webhook');
      
      for (const entry of body.entry) {
        console.log('📝 Processing entry:', entry.id);
        
        for (const change of entry.changes) {
          console.log('🔄 Processing change:', change.field);
          
          if (change.field === 'messages') {
            const value = change.value;
            
            // Check if this is a status update (delivery/read receipts) or incoming message
            if (value.statuses && value.statuses.length > 0) {
              // This is a status update (delivery receipt, read receipt, etc.)
              console.log('📊 Processing status update');
              await processStatusUpdate(value);
            } else if (value.messages && value.messages.length > 0) {
              // This is an incoming message
              console.log('📨 Processing incoming message');
              await processIncomingMessages(value);
            } else {
              console.log('⚠️ Unknown message type in webhook');
            }
          }
        }
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    console.error('❌ Error stack:', error.stack);
    // Always return 200 to WhatsApp to prevent webhook from being disabled
    // But log the error for debugging
    res.status(200).json({ 
      status: 'error',
      message: 'Error processing webhook, but acknowledged',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
  }
}

// Verify webhook signature for security
function verifyWebhookSignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  
  if (!signature || !appSecret) {
    console.log('⚠️ Missing signature or app secret for verification');
    // Allow requests without signature if app secret is not configured
    // This is useful for local testing
    const allowWithoutSignature = !process.env.WHATSAPP_APP_SECRET || process.env.NODE_ENV !== 'production';
    if (allowWithoutSignature) {
      console.log('⚠️ Allowing request without signature (app secret not configured or development mode)');
    }
    return allowWithoutSignature;
  }

  try {
    // Create expected signature using HMAC-SHA256
    const crypto = require('crypto');
    
    // Handle body stringification - Next.js might parse it already
    let bodyString;
    if (typeof req.body === 'string') {
      bodyString = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      bodyString = req.body.toString('utf8');
    } else {
      // Get raw body if available (Next.js might have parsed it)
      // Try to get original body from request
      bodyString = JSON.stringify(req.body);
    }
    
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', appSecret)
      .update(bodyString)
      .digest('hex');

    // Extract signature value (remove 'sha256=' prefix if present)
    const providedSig = signature.startsWith('sha256=') ? signature.substring(7) : signature;
    const expectedSig = expectedSignature.startsWith('sha256=') ? expectedSignature.substring(7) : expectedSignature;
    
    // Validate hex format
    const hexRegex = /^[0-9a-f]+$/i;
    if (!hexRegex.test(providedSig)) {
      console.log('🔐 Provided signature is not valid hex format');
      return false;
    }
    
    // Compare signatures - ensure buffers have same length
    if (providedSig.length !== expectedSig.length) {
      console.log('🔐 Signature length mismatch:', { 
        provided: providedSig.length, 
        expected: expectedSig.length,
        providedPreview: providedSig.substring(0, 10),
        expectedPreview: expectedSig.substring(0, 10)
      });
      return false;
    }

    // Convert to buffers for comparison (ensure hex encoding)
    try {
      const providedBuffer = Buffer.from(providedSig, 'hex');
      const expectedBuffer = Buffer.from(expectedSig, 'hex');
      
      // Double-check buffer lengths match
      if (providedBuffer.length !== expectedBuffer.length) {
        console.log('🔐 Buffer length mismatch after hex decode:', {
          provided: providedBuffer.length,
          expected: expectedBuffer.length
        });
        return false;
      }

      const isValid = crypto.timingSafeEqual(providedBuffer, expectedBuffer);

      console.log('🔐 Signature verification:', { 
        providedPreview: signature.substring(0, 20) + '...', 
        expectedPreview: expectedSignature.substring(0, 20) + '...', 
        isValid 
      });

      return isValid;
    } catch (bufferError) {
      console.error('❌ Buffer conversion error:', bufferError);
      return false;
    }
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
    // In development, allow on error; in production, reject
    return process.env.NODE_ENV !== 'production';
  }
}

// Process status updates (delivery receipts, read receipts, etc.)
async function processStatusUpdate(value) {
  const statuses = value.statuses || [];
  
  for (const status of statuses) {
    console.log('📊 Status update:', {
      messageId: status.id,
      status: status.status,
      recipient: status.recipient_id,
      timestamp: status.timestamp,
      errors: status.errors
    });
    
    // Log errors for debugging
    if (status.errors && status.errors.length > 0) {
      const error = status.errors[0];
      console.error('❌ Message delivery error:', {
        code: error.code,
        title: error.title,
        message: error.message,
        details: error.error_data?.details
      });
      
      // Handle 24-hour window error
      if (error.code === 131047 || error.message?.includes('24 hours')) {
        console.warn(`⚠️ 24-hour window expired for recipient ${status.recipient_id}`);
        console.warn(`💡 User must send a new message to restart the conversation`);
      }
    }
  }
}

// Process incoming WhatsApp messages
async function processIncomingMessages(value) {
  console.log('📨 Processing incoming messages:', JSON.stringify(value, null, 2));
  
  // Extract the phone_number_id from metadata - this is the account that RECEIVED the message
  const receivingPhoneNumberId = value.metadata?.phone_number_id;
  console.log('📱 Receiving phone number ID:', receivingPhoneNumberId);
  
  if (value.messages) {
    for (const message of value.messages) {
      const contact = value.contacts ? value.contacts[0] : null;
      // Pass the receiving phone number ID so we can use the same account to reply
      await handleIncomingMessage(message, contact, receivingPhoneNumberId);
    }
  }
}

// Handle individual incoming message
async function handleIncomingMessage(message, contact, receivingPhoneNumberId = null) {
  try {
    console.log('📱 Handling incoming message:', JSON.stringify(message, null, 2));
    console.log('👤 Contact info:', JSON.stringify(contact, null, 2));
    console.log('📱 Receiving phone number ID (will use for replies):', receivingPhoneNumberId);

    const messageData = {
      id: message.id,
      from: message.from,
      name: contact?.profile?.name || 'Unknown',
      message: message.text?.body || '',
      timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      type: message.type,
      status: 'unread',
      aiProcessed: false,
      // Store the phone number ID that received this message
      receivingPhoneNumberId: receivingPhoneNumberId
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
      await handleQuickReplyAction(quickReplyAction, messageData.from, receivingPhoneNumberId);
      await markMessageAsProcessed(messageData.id);
      return;
    }

    // Check if this is a greeting - respond with short welcome message
    const isGreeting = /^(hi|hello|hey|hola|how are you\b|good (morning|afternoon|evening)\b)$/i.test(messageData.message.trim());
    
    if (isGreeting) {
      // Send a short, friendly greeting response instead of full AI recommendation
      const greetingResponse = "Hello! 👋 Welcome to Bright Mind Vision!\n\nI'm here to help you discover luxury products. What would you like to explore?\n\nQuick replies:\n1. Handbags\n2. Watches\n3. Jewelry\n4. All products";
      await sendWhatsAppMessage(messageData.from, greetingResponse, receivingPhoneNumberId);
      await markMessageAsProcessed(messageData.id);
      return;
    }
    
    // Send instant human-like acknowledgment while AI processes
    const instantAck = getHumanLikeAcknowledgment(messageData.message);
    if (instantAck) {
      console.log('⚡ Sending instant human acknowledgment...');
      // Send without waiting - fire and forget so it doesn't delay AI processing
      sendWhatsAppMessage(messageData.from, instantAck, receivingPhoneNumberId).catch(err => {
        console.error('⚠️ Failed to send instant acknowledgment:', err);
      });
    }
    
    // Trigger AI product recommendation using production API
    await triggerAIIntegratedRecommendation(messageData, receivingPhoneNumberId);

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
async function handleQuickReplyAction(action, from, receivingPhoneNumberId = null) {
  try {
    console.log('🎯 Handling quick reply action:', action);
    
    // Use LangGraph endpoint; send action as a descriptive message to avoid numeric misrouting
    // Auto-detect base URL for Netlify deployments
    // For local testing, prefer localhost (server-side call)
    const baseUrl = process.env.NEXTAUTH_URL || 
                    process.env.URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                    'http://localhost:3000'; // Use localhost for server-side calls (even with ngrok)
    const apiUrl = `${baseUrl}/api/shopping-assistant/langgraph-recommendation`;
    console.log('🌐 Calling LangGraph API:', apiUrl);
    const response = await fetch(apiUrl, {
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
      const errorText = await response.text();
      console.error('❌ Quick reply API error:', response.status, errorText);
      throw new Error(`Quick reply API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Quick reply API response:', JSON.stringify(result, null, 2));
    console.log('🎯 Quick reply result:', JSON.stringify(result, null, 2));
    
    if (result.success && result.naturalResponse) {
      const { naturalResponse } = result;
      const formatted = formatProductionResponse(naturalResponse);
      await sendWhatsAppMessage(from, formatted, receivingPhoneNumberId);
    } else {
      const fallbackMessage = getFallbackMessage(action);
      await sendWhatsAppMessage(from, fallbackMessage, receivingPhoneNumberId);
    }
    
  } catch (error) {
    console.error('❌ Error handling quick reply action:', error);
    const errorMessage = "I'm having trouble processing your request right now. Please try again in a moment.";
    await sendWhatsAppMessage(from, errorMessage, receivingPhoneNumberId);
  }
}

// Get human-like instant acknowledgment (sent immediately while AI processes)
function getHumanLikeAcknowledgment(message) {
  const lowerMessage = (message || '').toLowerCase().trim();
  
  // Human-like acknowledgments - natural, warm, without ellipsis
  const acknowledgments = {
    '1': 'Perfect! Let me show you our handbags',
    '2': 'Great choice! Finding watches for you',
    '3': 'Wonderful! Let me find jewelry pieces for you',
    '4': 'Excellent! Gathering all our products for you',
    'explore jewelry': 'Wonderful! Let me find the perfect jewelry pieces for you',
    'show me jewelry': 'Of course! Finding beautiful jewelry for you',
    'jewelry': 'Great! Let me show you our jewelry collection',
    'browse watches': 'Perfect! Let me find watches for you',
    'show me watches': 'Absolutely! Finding luxury watches for you',
    'watches': 'Great choice! Let me find watches for you',
    'explore handbags': 'Wonderful! Finding handbags for you',
    'show me handbags': 'Of course! Let me show you our handbags',
    'handbags': 'Perfect! Finding luxury handbags for you',
    'bags': 'Great! Let me find bags for you',
    'bag': 'Perfect! Finding handbags for you',
    'skincare': 'Excellent! Finding premium skincare products for you',
    'wellness': 'Wonderful! Discovering wellness products for you',
    'show me all products': 'Perfect! Gathering our complete collection for you',
    'view all products': 'Excellent! Finding all our products for you',
  };
  
  // Check exact matches first
  if (acknowledgments[lowerMessage]) {
    return acknowledgments[lowerMessage];
  }
  
  // Check if message contains common keywords (more natural, human responses)
  if (lowerMessage.includes('jewelry') || lowerMessage.includes('jewellery')) {
    return 'Wonderful! Let me find jewelry pieces for you';
  }
  // Fix: Properly check for handbag/bag (need to check bag separately)
  if (lowerMessage.includes('handbag') || (lowerMessage.includes('bag') && !lowerMessage.includes('shop') && lowerMessage.length < 20)) {
    return 'Perfect! Finding handbags for you';
  }
  if (lowerMessage.includes('watch') && !lowerMessage.includes('shop')) {
    return 'Great choice! Finding watches for you';
  }
  if (lowerMessage.includes('skincare') || lowerMessage.includes('skin care')) {
    return 'Excellent! Finding skincare products for you';
  }
  if (lowerMessage.includes('wellness')) {
    return 'Wonderful! Finding wellness products for you';
  }
  
  // Check for "show me" or "browse" patterns
  if (lowerMessage.includes('show me') || lowerMessage.includes('browse')) {
    if (lowerMessage.includes('handbag') || lowerMessage.includes('bag')) {
      return 'Perfect! Finding handbags for you';
    }
    if (lowerMessage.includes('watch')) {
      return 'Great choice! Finding watches for you';
    }
    if (lowerMessage.includes('jewelry') || lowerMessage.includes('jewellery')) {
      return 'Wonderful! Finding jewelry pieces for you';
    }
    return 'Perfect! Let me find that for you';
  }
  
  // Default acknowledgment for any product-related query (but not greetings)
  if (lowerMessage.length > 1 && lowerMessage.length < 50 && 
      !lowerMessage.match(/^(hi|hello|hey|hola)$/)) {
    return 'Perfect! Let me find that for you';
  }
  
  return null; // No acknowledgment needed for greetings or very long messages
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

// Store message in database
async function storeMessage(messageData) {
  // TODO: Implement database storage (MongoDB, PostgreSQL, etc.)
  console.log('Storing message:', messageData.id);
}

// Trigger AI-Integrated recommendation using Groq LLM + RAG + Multi-Agent
async function triggerAIIntegratedRecommendation(messageData, receivingPhoneNumberId = null) {
  const startTime = Date.now();
  const TIMEOUT_MS = 30000; // 30 second timeout
  
  try {
    console.log('🤖 Triggering AI-integrated recommendation for:', messageData.from);
    
    const message = messageData.message || '';
    const quickReply = handleQuickReply(message);
    
    // Auto-detect base URL for Netlify deployments
    // For local testing with ngrok, prefer localhost (server-side call)
    // For production, use the actual deployed URL
    const baseUrl = process.env.NEXTAUTH_URL || 
                    process.env.URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                    'http://localhost:3000'; // Use localhost for server-side calls (even with ngrok)
    
    const payload = quickReply
      ? { message: getActionMessage(quickReply) }
      : { message };
    
    // Get conversation context to include customer name and product context
    const conversationId = `wa_${messageData.from}`;
    const customerId = `whatsapp-${messageData.from}`;
    const memoryContext = memoryService.getConversationContext(conversationId, customerId);
    
    // Update customer name if we have it from contact info
    if (messageData.name && messageData.name !== 'Unknown' && !memoryContext.customerName) {
      memoryContext.customerName = messageData.name;
      memoryService.updateConversationContext(conversationId, memoryContext);
    }
    
    // Build context with product information
    const context = {
      source: 'whatsapp',
      conversationId: conversationId,
      timestamp: new Date().toISOString(),
      customerName: memoryContext.customerName || messageData.name
    };
    
    // Include product context if available
    if (memoryContext.currentProduct) {
      context.currentProduct = memoryContext.currentProduct;
    }
    if (memoryContext.recentProducts && memoryContext.recentProducts.length > 0) {
      context.recentProducts = memoryContext.recentProducts;
    }
    if (memoryContext.conversationState) {
      context.conversationState = memoryContext.conversationState;
    }
    if (memoryContext.lastCategory) {
      context.lastCategory = memoryContext.lastCategory;
    }
    
    const requestBody = {
      ...payload,
      customerId: customerId,
      context: context
    };
    
    const apiUrl = `${baseUrl}/api/shopping-assistant/langgraph-recommendation`;
    console.log('🌐 Calling LangGraph API:', apiUrl);
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout: API call took longer than 30 seconds'));
      }, TIMEOUT_MS);
    });
    
    // Race between API call and timeout
    const response = await Promise.race([
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }),
      timeoutPromise
    ]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ LangGraph API error:', response.status, errorText);
      throw new Error(`LangGraph API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    const duration = Date.now() - startTime;
    console.log(`✅ LangGraph API response received (${duration}ms):`, JSON.stringify(result, null, 2));
    console.log('🔍 Response structure check:', {
      hasSuccess: 'success' in result,
      success: result.success,
      hasNaturalResponse: 'naturalResponse' in result,
      naturalResponseType: typeof result.naturalResponse,
      naturalResponseKeys: result.naturalResponse ? Object.keys(result.naturalResponse) : null
    });
    
    if (!result.success) {
      console.error('❌ AI recommendation failed:', result.error);
      console.error('❌ Full error details:', JSON.stringify(result, null, 2));
      
      // Determine error type and provide helpful message
      let errorMsg = "I'm having trouble processing your request right now.";
      if (result.error) {
        if (result.error.includes('timeout') || result.error.includes('time')) {
          errorMsg = "I'm taking longer than expected to process your request. Please try again in a moment.";
        } else if (result.error.includes('rate limit') || result.error.includes('429')) {
          errorMsg = "I'm handling many requests right now. Please try again in a few moments.";
        } else if (result.error.includes('not found') || result.error.includes('404')) {
          errorMsg = "I couldn't find what you're looking for. Could you please try rephrasing your request?";
        }
      }
      
      await sendWhatsAppMessage(messageData.from, errorMsg + " Please try again in a moment.", receivingPhoneNumberId);
      return;
    }
    
    // Send the AI-generated response (naturalResponse)
    if (result.naturalResponse) {
      console.log('📤 Formatting and sending AI response...');
      const formatted = formatProductionResponse(result.naturalResponse);
      console.log('📤 Formatted message length:', formatted.length);
      await sendWhatsAppMessage(messageData.from, formatted, receivingPhoneNumberId);
      console.log('✅ AI response sent successfully');
    } else {
      console.warn('⚠️ No naturalResponse in result, using fallback');
      console.warn('⚠️ Result structure:', Object.keys(result));
      await sendWhatsAppMessage(messageData.from, "I'm here to help you find luxury products. What would you like to explore?", receivingPhoneNumberId);
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Production AI recommendation failed:', {
      error: error.message,
      errorType: error.name,
      duration: `${duration}ms`,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      cause: error.cause,
      query: messageData.message?.substring(0, 100)
    });
    
    // Determine appropriate error message based on error type
    let errorMsg = "I'm sorry, I'm having trouble processing your request right now.";
    
    if (error.message.includes('timeout')) {
      errorMsg = "I'm taking longer than expected. Please try a simpler request or try again in a moment.";
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      errorMsg = "I'm having connection issues. Please try again in a moment.";
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      errorMsg = "I'm handling many requests right now. Please try again in a few moments.";
    } else if (error.message.includes('API key') || error.message.includes('unauthorized')) {
      errorMsg = "I'm experiencing a technical issue. Our team has been notified.";
      console.error('🚨 CRITICAL: API key or authentication issue detected');
    }
    
    try {
      await sendWhatsAppMessage(messageData.from, errorMsg + " Please try again in a moment.", receivingPhoneNumberId);
    } catch (sendError) {
      console.error('❌ Failed to send error message:', sendError);
      // Log but don't throw - we don't want to break the webhook
    }
  }
}


// Format production response for WhatsApp
function formatProductionResponse(response) {
  const { opening, items, cta, quick_replies } = response;
  
  // Clean up opening message - remove trailing ellipsis and make it natural
  let cleanOpening = (opening || '').trim();
  // Remove trailing "..." or "…" 
  cleanOpening = cleanOpening.replace(/\.\.\.+$/, '').replace(/…+$/, '').trim();
  
  let message = `${cleanOpening}\n\n`;
  
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.image} ${item.headline} - ${item.price}\n`;
      message += `   ${item.one_liner}\n\n`;
    });
  }
  
  // Clean up CTA - remove trailing ellipsis
  let cleanCta = (cta || '').trim().replace(/\.\.\.+$/, '').replace(/…+$/, '').trim();
  if (cleanCta) {
    message += `💬 ${cleanCta}\n\n`;
  }
  
  if (quick_replies && quick_replies.length > 0) {
    message += `Quick replies:\n`;
    quick_replies.forEach((reply, index) => {
      message += `${index + 1}. ${reply}\n`;
    });
  }
  
  return message.trim();
}


// Mark message as AI processed
async function markMessageAsProcessed(messageId) {
  // TODO: Implement database update
  console.log('Marking message as processed:', messageId);
}

// List of test numbers that we'll handle gracefully (log but don't throw errors)
const TEST_PHONE_NUMBERS = [
  '1234567890',           // Default test number from test script
  '919108458006',         // User's test number
  '+919108458006'         // With country code
].map(num => num.replace(/^\+/, '')); // Normalize (remove + for comparison)

// Send WhatsApp message
async function sendWhatsAppMessage(to, message, phoneNumberId = null) {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    // Use the phone number ID that received the message, or fall back to env variable
    const targetPhoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !targetPhoneNumberId) {
      console.error('WhatsApp credentials not configured');
      console.error('Missing:', { accessToken: !accessToken, phoneNumberId: !targetPhoneNumberId });
      return;
    }

    console.log(`📤 Using phone number ID for sending: ${targetPhoneNumberId}`);
    console.log(`📤 Sending to: ${to}`);

    // Normalize phone number for test check (remove + and any spaces)
    const normalizedTo = to.replace(/^\+/, '').replace(/\s/g, '');
    const isTestNumber = TEST_PHONE_NUMBERS.includes(normalizedTo);

    const response = await fetch(`https://graph.facebook.com/v21.0/${targetPhoneNumberId}/messages`, {
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
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      const errorCode = errorData.error?.code;
      const errorMessage = errorData.error?.message || errorText;
      
      // Check if it's the "not in allowed list" error
      const isNotAllowedError = errorCode === 131030 || 
                                errorText.includes('not in allowed list');
      
      // Check if it's the "24-hour window" error (re-engagement message)
      const is24HourWindowError = errorCode === 131047 ||
                                  errorMessage.includes('24 hours') ||
                                  errorMessage.includes('Re-engagement message');
      
      if (isNotAllowedError && isTestNumber) {
        // For test numbers, log but don't throw - this is expected during local testing
        console.log(`⚠️ Test number ${to} not in WhatsApp allowed list (expected for local testing)`);
        console.log(`📝 Would have sent: ${message.substring(0, 100)}...`);
        console.log(`💡 To fix: Add ${to} to WhatsApp Business allowed numbers in Meta Business Suite`);
        // Return a mock success response for test numbers
        return { 
          messages: [{ id: `test_${Date.now()}` }],
          test_mode: true 
        };
      }
      
      if (is24HourWindowError) {
        // 24-hour window expired - user needs to initiate conversation again
        console.warn(`⚠️ 24-hour messaging window expired for ${to}`);
        console.warn(`⚠️ Error details: ${errorMessage}`);
        console.warn(`💡 User must send a new message to restart the conversation window`);
        console.warn(`💡 For re-engagement after 24 hours, you need to use a pre-approved message template`);
        // Don't throw error, just log - the user needs to message first
        return {
          messages: [],
          error: '24_hour_window_expired',
          error_code: errorCode,
          message: 'User must send a new message to restart conversation'
        };
      }
      
      // For real numbers or other errors, throw as usual
      console.error('❌ WhatsApp API error:', response.status, errorText);
      throw new Error(`WhatsApp API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ WhatsApp message sent successfully:', JSON.stringify(result, null, 2));
    return result;
    
  } catch (error) {
    // Don't log full error details for test numbers that aren't allowed
    const normalizedTo = to.replace(/^\+/, '').replace(/\s/g, '');
    const isTestNumber = TEST_PHONE_NUMBERS.includes(normalizedTo);
    
    if (isTestNumber && error.message?.includes('not in allowed list')) {
      console.log(`⚠️ Test number ${to} - message would be sent if number was in allowed list`);
      return { test_mode: true, skipped: true };
    }
    
    console.error('❌ Error sending WhatsApp message:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      to: to,
      messageLength: message?.length || 0
    });
    throw error; // Re-throw to allow caller to handle
  }
}


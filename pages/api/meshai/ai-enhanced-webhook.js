// AI-Enhanced WhatsApp Business API Webhook Handler
// Uses Groq LLM, RAG system, and Multi-Agent architecture

import { aiAgentOrchestrator } from '../../services/aiAgentOrchestrator.js';

export default async function handler(req, res) {
  console.log('🤖 AI-Enhanced WhatsApp webhook called with method:', req.method);
  console.log('🤖 Request headers:', req.headers);
  console.log('🤖 Request body:', JSON.stringify(req.body, null, 2));

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
        expectedMode: 'subscribe'
      }
    });
  }
}

// Handle incoming webhook messages
async function handleIncomingWebhook(req, res) {
  try {
    const body = req.body;
    console.log('📨 Incoming webhook body:', JSON.stringify(body, null, 2));

    // Check if this is a WhatsApp webhook
    if (body.object === 'whatsapp_business_account') {
      console.log('✅ WhatsApp webhook received');
      
      // Process each entry
      if (body.entry && body.entry.length > 0) {
        for (const entry of body.entry) {
          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              if (change.field === 'messages') {
                await processMessages(change.value);
              }
            }
          }
        }
      }
      
      return res.status(200).json({ status: 'success' });
    } else {
      console.log('❌ Not a WhatsApp webhook');
      return res.status(400).json({ error: 'Invalid webhook' });
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Process incoming messages
async function processMessages(value) {
  try {
    console.log('📨 Processing messages:', JSON.stringify(value, null, 2));

    if (value.messages && value.messages.length > 0) {
      for (const message of value.messages) {
        await processMessage(message);
      }
    }
  } catch (error) {
    console.error('❌ Error processing messages:', error);
  }
}

// Process individual message
async function processMessage(messageData) {
  try {
    console.log('💬 Processing message:', JSON.stringify(messageData, null, 2));

    const messageText = messageData.text?.body || '';
    const fromNumber = messageData.from;
    const messageId = messageData.id;

    console.log(`📱 Message from ${fromNumber}: "${messageText}"`);

    // Send typing indicator
    await sendTypingIndicator(fromNumber);

    // Process with AI system
    let result;
    
    if (isQuickReply(messageText)) {
      const quickReplyNumber = parseInt(messageText.trim());
      result = await aiAgentOrchestrator.handleQuickReply(quickReplyNumber, {});
    } else {
      result = await aiAgentOrchestrator.processQuery(messageText, {});
    }

    // Send response
    if (result.success) {
      await sendAIResponse(fromNumber, result.naturalResponse);
    } else {
      await sendErrorMessage(fromNumber);
    }

  } catch (error) {
    console.error('❌ Error processing message:', error);
    await sendErrorMessage(messageData.from);
  }
}

// Check if message is a quick reply
function isQuickReply(message) {
  const trimmed = message.trim();
  return /^[1-4]$/.test(trimmed);
}

// Send typing indicator
async function sendTypingIndicator(to) {
  try {
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

    if (response.ok) {
      console.log('✅ Typing indicator sent');
    } else {
      console.error('❌ Failed to send typing indicator:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error sending typing indicator:', error);
  }
}

// Send AI response
async function sendAIResponse(to, naturalResponse) {
  try {
    // Format response for WhatsApp
    let responseText = naturalResponse.opening + '\n\n';
    
    if (naturalResponse.items && naturalResponse.items.length > 0) {
      naturalResponse.items.forEach((item, index) => {
        responseText += `${index + 1}. ${item.image || '🛍️'} ${item.headline} - ${item.price}\n`;
        if (item.one_liner) {
          responseText += `   ${item.one_liner}\n`;
        }
        responseText += '\n';
      });
    }
    
    if (naturalResponse.cta) {
      responseText += naturalResponse.cta + '\n\n';
    }
    
    if (naturalResponse.quick_replies && naturalResponse.quick_replies.length > 0) {
      responseText += 'Quick replies:\n';
      naturalResponse.quick_replies.forEach((reply, index) => {
        responseText += `${index + 1}. ${reply}\n`;
      });
    }

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
          body: responseText
        }
      })
    });

    if (response.ok) {
      console.log('✅ AI response sent successfully');
    } else {
      console.error('❌ Failed to send AI response:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error sending AI response:', error);
  }
}

// Send error message
async function sendErrorMessage(to) {
  try {
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
          body: "I apologize, but I'm having trouble processing your request right now. Please try again later."
        }
      })
    });

    if (response.ok) {
      console.log('✅ Error message sent');
    } else {
      console.error('❌ Failed to send error message:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error sending error message:', error);
  }
}

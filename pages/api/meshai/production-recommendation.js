// Production-Grade Recommendation API
// Implements the recommended architecture with strict data flow

import { ProductionAgentOrchestrator } from '../../../services/productionAgentOrchestrator.js';

const orchestrator = new ProductionAgentOrchestrator();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, quickReply } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`🎯 Production API: Processing "${message}"`);
    
    // Process the query through the production pipeline
    const result = await orchestrator.processQuery(message, { quickReply });
    
    // Format response for WhatsApp
    const whatsappResponse = {
      success: result.success,
      naturalResponse: result.response,
      metadata: result.metadata,
      timestamp: result.timestamp
    };

    // Add WhatsApp-specific formatting
    if (result.success && result.response) {
      whatsappResponse.formattedMessage = formatForWhatsApp(result.response);
    }

    console.log(`✅ Production API: Completed in ${result.metadata?.processingTime || 0}ms`);
    
    return res.status(200).json(whatsappResponse);
    
  } catch (error) {
    console.error('❌ Production API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      naturalResponse: {
        opening: "I'm sorry, I encountered an error. Please try again.",
        items: [],
        cta: "How can I help you?",
        quick_replies: ["Search products", "Get help", "Contact us"]
      },
      metadata: {
        processingTime: 0,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
}

// Format response for WhatsApp display
function formatForWhatsApp(response) {
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

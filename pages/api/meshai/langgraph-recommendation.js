// LangGraph-based AI Recommendation API
// Uses function calling, memory, and state-based workflow

import { langGraphOrchestrator } from '../../../services/langGraphOrchestrator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, quickReply, context, customerId } = req.body;
    
    if (!message && !quickReply) {
      return res.status(400).json({ 
        error: 'Message or quickReply is required' 
      });
    }

    // Extract conversation ID from context or generate new one
    const conversationId = context?.conversationId || `conv_${Date.now()}`;
    const customer = customerId || context?.customerId || null;

    console.log('🤖 LangGraph API called:', { message, quickReply, conversationId, customer });

    let result;

    if (quickReply) {
      // Handle quick reply
      result = await langGraphOrchestrator.handleQuickReply(quickReply, conversationId, customer);
    } else {
      // Detect numeric messages as quick replies
      let detectedQuickReply = null;
      if (/^[1-9]$/.test(message.trim())) {
        detectedQuickReply = parseInt(message.trim(), 10);
      }
      
      if (detectedQuickReply) {
        result = await langGraphOrchestrator.handleQuickReply(detectedQuickReply, conversationId, customer);
      } else {
        // Process natural language query
        result = await langGraphOrchestrator.processQuery(message, conversationId, customer);
      }
    }

    // Ensure naturalResponse exists
    if (!result.naturalResponse) {
      result.naturalResponse = {
        opening: "Here are some luxury products I found for you:",
        items: [],
        cta: "How can I help you find luxury products?",
        quick_replies: ["Show me handbags", "Browse watches", "Explore jewelry"]
      };
    }

    // Update metadata
    result.metadata = {
      ...result.metadata,
      api_version: 'langgraph-v1.0',
      conversationId,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ LangGraph API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      naturalResponse: {
        opening: "I'm sorry, I encountered an error. Please try again.",
        items: [],
        cta: "How can I help you find luxury products?",
        quick_replies: ["Try again", "Get help", "Start over"]
      }
    });
  }
}

// LangGraph-based AI Recommendation API
// Uses function calling, memory, and state-based workflow

import { langGraphOrchestrator } from '../../../services/langGraphOrchestrator.js';
import { memoryService } from '../../../services/memoryService.js';

export default async function handler(req, res) {
  // Set CORS headers for mobile compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      naturalResponse: {
        opening: "I'm sorry, I encountered an error. Please try again.",
        items: [],
        cta: "How can I help you find luxury products?",
        quick_replies: ["Try again", "Get help", "Start over"]
      }
    });
  }

  try {
    // Ensure body is parsed correctly
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('Failed to parse body:', e);
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON in request body',
          naturalResponse: {
            opening: "I'm sorry, I encountered an error. Please try again.",
            items: [],
            cta: "How can I help you find luxury products?",
            quick_replies: ["Try again", "Get help", "Start over"]
          }
        });
      }
    }

    const { message, quickReply, context, customerId } = body;
    
    if (!message && !quickReply) {
      return res.status(400).json({ 
        success: false,
        error: 'Message or quickReply is required',
        naturalResponse: {
          opening: "I'm sorry, I need a message to help you. Please try again.",
          items: [],
          cta: "How can I help you find luxury products?",
          quick_replies: ["Show me handbags", "Browse watches", "Explore jewelry"]
        }
      });
    }

    // Extract conversation ID from context or generate new one
    const conversationId = context?.conversationId || `conv_${Date.now()}`;
    const customer = customerId || context?.customerId || null;

    console.log('🤖 LangGraph API called:', { message, quickReply, conversationId, customer });

    let result;

    // Check if this is a context-aware quick reply (secondary menu)
    const memoryContext = memoryService.getConversationContext(conversationId, customer);
    const hasRecentCategory = memoryContext.lastCategory;
    
    if (quickReply) {
      // Handle quick reply with context awareness
      result = await langGraphOrchestrator.handleContextualQuickReply(quickReply, conversationId, customer, hasRecentCategory);
    } else {
      // Detect numeric messages as quick replies
      let detectedQuickReply = null;
      if (/^[1-9]$/.test(message.trim())) {
        detectedQuickReply = parseInt(message.trim(), 10);
      }
      
      if (detectedQuickReply) {
        // Context-aware: If we have a recent category, numbers 1-3 might be secondary menu
        if (hasRecentCategory && detectedQuickReply <= 3) {
          // Likely secondary menu: 1=Show me more, 2=Different category, 3=Get help
          result = await langGraphOrchestrator.handleContextualQuickReply(detectedQuickReply, conversationId, customer, hasRecentCategory);
        } else {
          // Primary menu: category selection
          result = await langGraphOrchestrator.handleQuickReply(detectedQuickReply, conversationId, customer);
        }
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
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request details:', { message, quickReply, conversationId, customer });
    
    // Log specific error types
    if (error.message) {
      console.error('❌ Error message details:', error.message);
    }
    if (error.cause) {
      console.error('❌ Error cause:', error.cause);
    }
    
    // Ensure we always return valid JSON
    try {
      // Include detailed error information for debugging
      const errorDetails = {
        success: false,
        error: error.message || 'Unknown error occurred',
        errorType: error.name || 'Error',
        // Include stack trace only in development
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
        naturalResponse: {
          opening: process.env.NODE_ENV === 'production' 
            ? "I'm sorry, I encountered an error. Please try again."
            : `I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
          items: [],
          cta: "How can I help you find luxury products?",
          quick_replies: ["Try again", "Get help", "Start over"]
        },
        // Include metadata for debugging
        metadata: {
          timestamp: new Date().toISOString(),
          conversationId,
          hasMessage: !!message,
          hasQuickReply: !!quickReply,
          // Include environment info for debugging
          ...(process.env.NODE_ENV !== 'production' && {
            environment: process.env.NODE_ENV,
            hasGroqKey: !!process.env.LLM_GROQ_API_KEY,
            hasGeminiKey: !!process.env.LLM_GEMINI_API_KEY,
            provider: process.env.LLM_PROVIDER || 'groq'
          })
        }
      };
      
      return res.status(500).json(errorDetails);
    } catch (jsonError) {
      // Fallback if JSON serialization fails
      console.error('Failed to send JSON response:', jsonError);
      res.status(500).end('Internal server error');
    }
  }
}

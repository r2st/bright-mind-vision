// LangGraph-based AI Recommendation API
// Uses function calling, memory, and state-based workflow

import { langGraphOrchestrator } from '../../../services/langGraphOrchestrator.js';
import { memoryService } from '../../../services/memoryService.js';

// Wrapper to ensure all errors return JSON
async function handleRequest(req, res) {
  // Set CORS headers for mobile compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json'); // Always return JSON

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

    // Validate body exists
    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        naturalResponse: {
          opening: "I'm sorry, I encountered an error. Please try again.",
          items: [],
          cta: "How can I help you find luxury products?",
          quick_replies: ["Try again", "Get help", "Start over"]
        }
      });
    }

    const { message, quickReply, context, customerId } = body || {};
    
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
      if (message && typeof message === 'string' && /^[1-9]$/.test(message.trim())) {
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
    // Safely get variables that might not be defined yet
    const safeMessage = typeof message !== 'undefined' ? message : null;
    const safeQuickReply = typeof quickReply !== 'undefined' ? quickReply : null;
    const safeConversationId = typeof conversationId !== 'undefined' ? conversationId : null;
    const safeCustomer = typeof customer !== 'undefined' ? customer : null;
    
    // Comprehensive error logging for debugging - print all details
    console.error('========================================');
    console.error('❌ LANGGRAPH API ERROR - FULL DETAILS');
    console.error('========================================');
    console.error('❌ Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('❌ Error Type:', error.name || 'Unknown');
    console.error('❌ Error Message:', error.message || 'No message');
    console.error('❌ Error Stack:', error.stack || 'No stack trace');
    if (error.cause) {
      console.error('❌ Error Cause:', error.cause);
    }
    console.error('❌ Request Method:', req.method);
    console.error('❌ Request Body:', JSON.stringify(req.body, null, 2));
    console.error('❌ Request Headers:', JSON.stringify(req.headers, null, 2));
    console.error('❌ Extracted Variables:', {
      message: safeMessage,
      quickReply: safeQuickReply,
      conversationId: safeConversationId,
      customer: safeCustomer
    });
    console.error('========================================');
    
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
          opening: "I'm sorry, I encountered an error. Please try again.",
          items: [],
          cta: "How can I help you find luxury products?",
          quick_replies: ["Try again", "Get help", "Start over"]
        },
        // Include metadata for debugging (always include key info)
        metadata: {
          timestamp: new Date().toISOString(),
          conversationId: safeConversationId || 'unknown',
          hasMessage: !!safeMessage,
          hasQuickReply: !!safeQuickReply,
          messageLength: safeMessage ? safeMessage.length : 0,
          // Always include environment info for Netlify debugging
          environment: process.env.NODE_ENV || 'unknown',
          hasGroqKey: !!process.env.LLM_GROQ_API_KEY,
          hasGeminiKey: !!process.env.LLM_GEMINI_API_KEY,
          provider: process.env.LLM_PROVIDER || 'groq',
          // Include a hint about what might be missing
          diagnostics: {
            apiKeysConfigured: !!(process.env.LLM_GROQ_API_KEY || process.env.LLM_GEMINI_API_KEY),
            provider: process.env.LLM_PROVIDER || 'groq (default)'
          },
          // Include request details for debugging
          requestInfo: {
            method: req.method,
            hasBody: !!req.body,
            bodyType: typeof req.body
          }
        }
      };
      
      return res.status(500).json(errorDetails);
    } catch (jsonError) {
      // Fallback if JSON serialization fails
      console.error('Failed to send JSON response:', jsonError);
      res.status(500).json({
        success: false,
        error: 'Failed to serialize error response',
        errorType: 'SerializationError',
        naturalResponse: {
          opening: "I encountered an error. Please try again.",
          items: [],
          cta: "How can I help you find luxury products?",
          quick_replies: ["Try again", "Get help", "Start over"]
        }
      });
    }
  }
}

// Export with error wrapper to catch any unhandled errors
export default async function handler(req, res) {
  try {
    await handleRequest(req, res);
  } catch (unhandledError) {
    // Catch any errors that escaped the main try-catch
    console.error('❌❌❌ UNHANDLED ERROR (escaped try-catch):', unhandledError);
    console.error('❌ Error stack:', unhandledError.stack);
    
    // Always return JSON, even for unhandled errors
    try {
      return res.status(500).json({
        success: false,
        error: unhandledError.message || 'Unhandled server error',
        errorType: unhandledError.name || 'UnhandledError',
        metadata: {
          timestamp: new Date().toISOString(),
          unhandled: true
        },
        naturalResponse: {
          opening: "I encountered an unexpected error. Please try again.",
          items: [],
          cta: "How can I help you find luxury products?",
          quick_replies: ["Try again", "Get help", "Start over"]
        }
      });
    } catch {
      // Absolute last resort - should never happen
      res.status(500).end(JSON.stringify({
        success: false,
        error: 'Critical server error'
      }));
    }
  }
}

// AI-Enhanced Recommendation API
// Uses Groq LLM, RAG system, and Multi-Agent architecture

import { optimizedAgentOrchestrator } from '../../../services/optimizedAgentOrchestrator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, quickReply, context } = req.body;
    
    if (!message && !quickReply) {
      return res.status(400).json({ 
        error: 'Message or quickReply is required' 
      });
    }

    console.log('🤖 AI-Enhanced API called with:', { message, quickReply, context });

    let result;

    if (quickReply) {
      // Handle quick reply with AI context
      result = await optimizedAgentOrchestrator.handleQuickReply(quickReply, context || {});
    } else {
      // Process natural language query with AI
      result = await optimizedAgentOrchestrator.processQuery(message, context || {});
    }

    // Add metadata
    result.metadata = {
      ...result.metadata,
      api_version: 'ai-enhanced-v1.0',
      timestamp: new Date().toISOString(),
      processing_time: Date.now() - (context?.timestamp ? new Date(context.timestamp).getTime() : Date.now())
    };

    console.log('✅ AI-Enhanced API response generated');
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ AI-Enhanced API error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      naturalResponse: {
        opening: "I apologize, but I'm experiencing technical difficulties.",
        items: [],
        cta: "Please try again in a moment.",
        quick_replies: ["Try again", "Get help", "Start over"]
      },
      metadata: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}

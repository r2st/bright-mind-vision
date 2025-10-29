// Optimized AI Recommendation API
// Fast, efficient AI system with minimal LLM calls and caching

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

    console.log('⚡ Optimized AI API called with:', { message, quickReply, context });

    const startTime = Date.now();
    let result;

    if (quickReply) {
      // Handle quick reply
      result = await optimizedAgentOrchestrator.handleQuickReply(quickReply, context || {});
    } else {
      // Process natural language query
      result = await optimizedAgentOrchestrator.processQuery(message, context || {});
    }

    const processingTime = Date.now() - startTime;

    // Add performance metadata
    result.metadata = {
      ...result.metadata,
      api_version: 'optimized-ai-v1.0',
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Optimized AI API completed in ${processingTime}ms`);
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Optimized AI API error:', error);
    
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

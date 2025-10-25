// Enhanced RAG-based AI Product Recommendation Service using Groq with Natural Language Generation
import { getGroqRecommendationsWithNaturalResponse } from '../../../services/enhancedGroqRAGService.js';

export default async function handler(req, res) {
  console.log('🔍 RAG AI Recommendation API called with method:', req.method);
  console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, customerId, context } = req.body;
    console.log('🔍 Parsed request:', { message, customerId, context });

    if (!message) {
      console.log('❌ Message is required');
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🔍 Generating enhanced RAG recommendations with natural language for message:', message);
    
    // Use enhanced Groq RAG system with natural language generation
    const result = await getGroqRecommendationsWithNaturalResponse(message, customerId, context);
    console.log('🔍 Generated enhanced RAG recommendations:', JSON.stringify(result, null, 2));

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message,
        recommendations: []
      });
    }

    const response = {
      success: true,
      message: result.message,
      recommendations: result.recommendations,
      naturalResponse: result.naturalResponse,
      metadata: result.metadata,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Sending RAG response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ RAG recommendation error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

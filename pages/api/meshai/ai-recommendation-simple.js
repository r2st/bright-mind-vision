// Simple RAG-based AI Product Recommendation Service (fallback)
import { getGroqRecommendations } from '../../../services/groqRAGService.js';

export default async function handler(req, res) {
  console.log('🔍 Simple RAG AI Recommendation API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, customerId, context } = req.body;
    console.log('🔍 Parsed request:', { message, customerId, context });

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🔍 Generating simple RAG recommendations for message:', message);
    
    // Use simple Groq RAG system for recommendations
    const result = await getGroqRecommendations(message, customerId, context);
    console.log('🔍 Generated simple RAG recommendations:', JSON.stringify(result, null, 2));

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
      metadata: result.metadata,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Sending simple RAG response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Simple RAG recommendation error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

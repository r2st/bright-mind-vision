// Enhanced AI Product Recommendation Service with LLM Integration
// Supports both LLM-powered and rule-based recommendations

import { generateLLMRecommendations, validateLLMConfig, testLLMConnection } from './llm-integration';

export default async function handler(req, res) {
  console.log('🔍 AI Recommendation API (LLM) called with method:', req.method);
  console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, customerId, context, useLLM } = req.body;
    console.log('🔍 Parsed request:', { message, customerId, context, useLLM });

    if (!message) {
      console.log('❌ Message is required');
      return res.status(400).json({ error: 'Message is required' });
    }

    let recommendations;
    
    // Check if LLM should be used
    const shouldUseLLM = useLLM !== false && process.env.USE_LLM !== 'false';
    
    if (shouldUseLLM) {
      console.log('🤖 Using LLM for recommendations');
      recommendations = await generateLLMRecommendations(message, customerId, context);
    } else {
      console.log('📋 Using rule-based recommendations');
      // Import and use the original rule-based system
      const { generateAIRecommendations } = await import('./ai-recommendation');
      recommendations = await generateAIRecommendations(message, customerId, context);
    }

    console.log('🔍 Generated recommendations:', JSON.stringify(recommendations, null, 2));

    const response = {
      success: true,
      recommendations,
      metadata: {
        method: shouldUseLLM ? 'llm' : 'rule-based',
        provider: shouldUseLLM ? process.env.LLM_PROVIDER || 'openai' : 'rule-based',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('✅ Sending response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ AI recommendation error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      fallback: 'Consider using rule-based system'
    });
  }
}

// Configuration endpoint
export async function getConfig(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = validateLLMConfig();
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ error: 'Configuration error', details: error.message });
  }
}

// Test endpoint
export async function testConnection(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await testLLMConnection();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
}

// Multi-Agent RAG Recommendation API
import { multiAgentOrchestrator } from '../../../services/multiAgentSystem.js';

export default async function handler(req, res) {
  console.log('🤖 Multi-Agent RAG API called with method:', req.method);
  console.log('🤖 Request body:', JSON.stringify(req.body, null, 2));
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, customerId, context } = req.body;
    console.log('🤖 Parsed request:', { message, customerId, context });

    if (!message) {
      console.log('❌ Message is required');
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🤖 Processing with multi-agent system...');
    
    // Process with multi-agent system
    const result = await multiAgentOrchestrator.processQuery(message, {
      customerId,
      ...context,
      source: 'whatsapp'
    });
    
    console.log('🤖 Multi-agent result:', JSON.stringify(result, null, 2));

    // Return response
    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Multi-agent recommendation error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: error.message,
      recommendations: [],
      naturalResponse: null
    });
  }
}

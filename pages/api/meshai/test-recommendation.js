// Test endpoint for AI recommendation system
// Allows testing the recommendation engine without WhatsApp integration

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, customerId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Import the AI recommendation function
    const { generateAIRecommendations } = await import('./ai-recommendation');
    
    // Generate recommendations
    const recommendations = await generateAIRecommendations(message, customerId);

    // Format response for testing
    const response = {
      success: true,
      input: {
        message,
        customerId: customerId || 'test-customer'
      },
      recommendations: {
        products: recommendations.products.map(rec => ({
          productId: rec.productId,
          confidence: (rec.confidence * 100).toFixed(1) + '%',
          reason: rec.primaryReason,
          algorithms: [...new Set(rec.algorithms)]
        })),
        overallConfidence: (recommendations.confidence * 100).toFixed(1) + '%',
        reasoning: recommendations.reasoning,
        alternatives: recommendations.alternatives?.map(rec => ({
          productId: rec.productId,
          confidence: (rec.confidence * 100).toFixed(1) + '%',
          reason: rec.primaryReason
        })) || []
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Test recommendation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Simple test endpoint for quick WhatsApp message testing
// Use this for quick testing without running the full test suite

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simulate WhatsApp message processing
    const simulatedMessage = {
      id: `test-${Date.now()}`,
      from: '+1234567890',
      name: 'Test Customer',
      message: message,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'unread',
      aiProcessed: false
    };

    // Process the message through AI recommendation
    const recommendation = await generateProductRecommendation(message);
    
    // Format response similar to WhatsApp webhook
    const response = {
      success: true,
      message: {
        id: simulatedMessage.id,
        from: simulatedMessage.from,
        name: simulatedMessage.name,
        originalMessage: message,
        timestamp: simulatedMessage.timestamp,
        aiProcessed: true
      },
      recommendations: {
        products: recommendation.products.map(rec => ({
          productId: rec.productId,
          confidence: (rec.confidence * 100).toFixed(1) + '%',
          reason: rec.reason
        })),
        overallConfidence: (recommendation.confidence * 100).toFixed(1) + '%',
        totalRecommendations: recommendation.products.length
      },
      whatsappResponse: formatRecommendationMessage(recommendation),
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Simple test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: error.message 
    });
  }
}

// Generate product recommendation (simplified version)
async function generateProductRecommendation(message) {
  const products = [
    {
      id: 'P001',
      name: 'Organic Green Tea',
      category: 'Beverages',
      price: 12.99,
      tags: ['organic', 'healthy', 'antioxidant', 'natural']
    },
    {
      id: 'P002',
      name: 'Himalayan Salt Lamp',
      category: 'Wellness',
      price: 29.99,
      tags: ['wellness', 'air-purification', 'mood', 'natural']
    },
    {
      id: 'P003',
      name: 'Essential Oil Diffuser',
      category: 'Aromatherapy',
      price: 45.99,
      tags: ['aromatherapy', 'relaxation', 'LED', 'timer']
    },
    {
      id: 'P004',
      name: 'Yoga Mat Premium',
      category: 'Fitness',
      price: 39.99,
      tags: ['fitness', 'yoga', 'non-slip', 'premium']
    },
    {
      id: 'P005',
      name: 'Meditation Cushion',
      category: 'Wellness',
      price: 24.99,
      tags: ['meditation', 'comfort', 'buckwheat', 'wellness']
    },
    {
      id: 'P006',
      name: 'Herbal Sleep Tea',
      category: 'Beverages',
      price: 15.99,
      tags: ['sleep', 'herbal', 'chamomile', 'lavender']
    }
  ];

  const messageLower = message.toLowerCase();
  const recommendations = [];
  
  // Relaxation keywords
  if (messageLower.includes('relax') || messageLower.includes('stress') || messageLower.includes('calm')) {
    recommendations.push({
      productId: 'P002',
      confidence: 0.92,
      reason: 'Himalayan salt lamp provides natural relaxation and mood enhancement'
    });
    recommendations.push({
      productId: 'P003',
      confidence: 0.88,
      reason: 'Essential oil diffuser with aromatherapy for stress relief'
    });
    recommendations.push({
      productId: 'P005',
      confidence: 0.85,
      reason: 'Meditation cushion for mindfulness and relaxation practices'
    });
  }
  
  // Tea keywords
  if (messageLower.includes('tea') || messageLower.includes('organic') || messageLower.includes('healthy')) {
    recommendations.push({
      productId: 'P001',
      confidence: 0.95,
      reason: 'Organic green tea matches preference for healthy and natural products'
    });
    recommendations.push({
      productId: 'P006',
      confidence: 0.78,
      reason: 'Herbal sleep tea is also organic and natural'
    });
  }
  
  // Yoga/Fitness keywords
  if (messageLower.includes('yoga') || messageLower.includes('fitness') || messageLower.includes('exercise')) {
    recommendations.push({
      productId: 'P004',
      confidence: 0.96,
      reason: 'Premium yoga mat perfect for home practice'
    });
  }
  
  // Aromatherapy keywords
  if (messageLower.includes('aromatherapy') || messageLower.includes('essential oil') || messageLower.includes('diffuser')) {
    recommendations.push({
      productId: 'P003',
      confidence: 0.94,
      reason: 'Essential oil diffuser with LED lights and timer'
    });
    recommendations.push({
      productId: 'P002',
      confidence: 0.82,
      reason: 'Himalayan salt lamp complements aromatherapy setup'
    });
  }
  
  // Sleep keywords
  if (messageLower.includes('sleep') || messageLower.includes('bedtime') || messageLower.includes('insomnia')) {
    recommendations.push({
      productId: 'P006',
      confidence: 0.91,
      reason: 'Blend of chamomile, lavender, and valerian for better sleep'
    });
    recommendations.push({
      productId: 'P002',
      confidence: 0.79,
      reason: 'Soft glow helps create relaxing bedtime atmosphere'
    });
  }
  
  // Meditation keywords
  if (messageLower.includes('meditation') || messageLower.includes('mindfulness') || messageLower.includes('zen')) {
    recommendations.push({
      productId: 'P005',
      confidence: 0.96,
      reason: 'Comfortable meditation cushion filled with buckwheat hulls'
    });
    recommendations.push({
      productId: 'P002',
      confidence: 0.80,
      reason: 'Calming salt lamp for meditation space'
    });
  }
  
  // If no specific matches, provide popular recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      {
        productId: 'P001',
        confidence: 0.60,
        reason: 'Popular organic green tea for overall wellness'
      },
      {
        productId: 'P002',
        confidence: 0.55,
        reason: 'Best-selling Himalayan salt lamp for relaxation'
      },
      {
        productId: 'P003',
        confidence: 0.50,
        reason: 'Highly-rated essential oil diffuser'
      }
    );
  }
  
  return {
    products: recommendations.slice(0, 3), // Return top 3 recommendations
    confidence: recommendations.length > 0 ? Math.max(...recommendations.map(r => r.confidence)) : 0
  };
}

// Format recommendation message for WhatsApp
function formatRecommendationMessage(recommendation) {
  if (!recommendation.products || recommendation.products.length === 0) {
    return "Thank you for your message! I'm here to help you find the perfect products. Could you tell me more about what you're looking for?";
  }

  let message = "🤖 *AI Product Recommendations*\n\n";
  message += "Based on your message, here are my top recommendations:\n\n";

  recommendation.products.forEach((rec, index) => {
    const product = getProductById(rec.productId);
    if (product) {
      message += `${index + 1}. *${product.name}* - $${product.price}\n`;
      message += `   ${rec.reason}\n`;
      message += `   Confidence: ${(rec.confidence * 100).toFixed(0)}%\n\n`;
    }
  });

  message += "Would you like more information about any of these products?";
  
  return message;
}

// Helper function to get product by ID
function getProductById(productId) {
  const products = [
    { id: 'P001', name: 'Organic Green Tea', price: 12.99 },
    { id: 'P002', name: 'Himalayan Salt Lamp', price: 29.99 },
    { id: 'P003', name: 'Essential Oil Diffuser', price: 45.99 },
    { id: 'P004', name: 'Yoga Mat Premium', price: 39.99 },
    { id: 'P005', name: 'Meditation Cushion', price: 24.99 },
    { id: 'P006', name: 'Herbal Sleep Tea', price: 15.99 }
  ];
  
  return products.find(p => p.id === productId);
}

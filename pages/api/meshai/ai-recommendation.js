// AI Product Recommendation Service
// Advanced AI-powered product recommendation engine

export default async function handler(req, res) {
  console.log('🔍 AI Recommendation API called with method:', req.method);
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

    console.log('🔍 Generating AI recommendations for message:', message);
    // Generate AI-powered product recommendations
    const recommendations = await generateAIRecommendations(message, customerId, context);
    console.log('🔍 Generated recommendations:', JSON.stringify(recommendations, null, 2));

    const response = {
      success: true,
      recommendations,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Sending response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ AI recommendation error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Advanced AI recommendation engine
async function generateAIRecommendations(message, customerId = null, context = {}) {
  try {
    // Get all available products
    const products = await getProducts();
    
    // Analyze message intent and extract keywords
    const analysis = await analyzeMessage(message);
    
    // Get customer preferences if available
    const customerPreferences = customerId ? await getCustomerPreferences(customerId) : {};
    
    // Generate recommendations using multiple algorithms
    const recommendations = await generateRecommendations({
      message,
      analysis,
      products,
      customerPreferences,
      context
    });

    // Rank and filter recommendations
    const rankedRecommendations = await rankRecommendations(recommendations, analysis);

    return {
      products: rankedRecommendations.slice(0, 5), // Top 5 recommendations
      confidence: calculateOverallConfidence(rankedRecommendations),
      reasoning: generateReasoning(rankedRecommendations, analysis),
      alternatives: rankedRecommendations.slice(5, 8) // Alternative options
    };

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return { products: [], confidence: 0, reasoning: 'Unable to generate recommendations' };
  }
}

// Analyze message for intent and keywords
async function analyzeMessage(message) {
  const messageLower = message.toLowerCase();
  
  // Intent classification
  const intents = {
    relaxation: ['relax', 'stress', 'calm', 'peaceful', 'unwind', 'decompress'],
    wellness: ['healthy', 'wellness', 'natural', 'organic', 'holistic'],
    fitness: ['yoga', 'exercise', 'fitness', 'workout', 'active', 'sport'],
    sleep: ['sleep', 'bedtime', 'insomnia', 'tired', 'rest', 'dream'],
    aromatherapy: ['aromatherapy', 'essential oil', 'diffuser', 'scent', 'fragrance'],
    meditation: ['meditation', 'mindfulness', 'zen', 'spiritual', 'contemplation'],
    tea: ['tea', 'beverage', 'drink', 'herbal', 'infusion'],
    gift: ['gift', 'present', 'surprise', 'birthday', 'anniversary']
  };

  const detectedIntents = [];
  const confidence = {};

  for (const [intent, keywords] of Object.entries(intents)) {
    const matches = keywords.filter(keyword => messageLower.includes(keyword));
    if (matches.length > 0) {
      detectedIntents.push(intent);
      confidence[intent] = matches.length / keywords.length;
    }
  }

  // Extract product categories mentioned
  const categories = {
    beverages: ['tea', 'coffee', 'drink', 'beverage', 'infusion'],
    wellness: ['lamp', 'salt', 'crystal', 'healing', 'therapy'],
    aromatherapy: ['diffuser', 'oil', 'scent', 'aroma', 'fragrance'],
    fitness: ['mat', 'yoga', 'exercise', 'workout', 'fitness'],
    meditation: ['cushion', 'pillow', 'meditation', 'zen', 'mindfulness']
  };

  const detectedCategories = [];
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      detectedCategories.push(category);
    }
  }

  // Extract price range if mentioned
  const priceRange = extractPriceRange(message);

  // Extract urgency level
  const urgency = detectUrgency(message);

  return {
    intents: detectedIntents,
    categories: detectedCategories,
    confidence,
    priceRange,
    urgency,
    keywords: extractKeywords(message),
    sentiment: analyzeSentiment(message)
  };
}

// Generate recommendations using multiple algorithms
async function generateRecommendations({ message, analysis, products, customerPreferences, context }) {
  const recommendations = [];

  // Algorithm 1: Intent-based matching
  const intentRecommendations = await getIntentBasedRecommendations(analysis, products);
  recommendations.push(...intentRecommendations);

  // Algorithm 2: Category-based matching
  const categoryRecommendations = await getCategoryBasedRecommendations(analysis, products);
  recommendations.push(...categoryRecommendations);

  // Algorithm 3: Keyword-based matching
  const keywordRecommendations = await getKeywordBasedRecommendations(analysis, products);
  recommendations.push(...keywordRecommendations);

  // Algorithm 4: Collaborative filtering (if customer data available)
  if (customerPreferences && Object.keys(customerPreferences).length > 0) {
    const collaborativeRecommendations = await getCollaborativeRecommendations(customerPreferences, products);
    recommendations.push(...collaborativeRecommendations);
  }

  // Algorithm 5: Popularity-based recommendations
  const popularityRecommendations = await getPopularityBasedRecommendations(products);
  recommendations.push(...popularityRecommendations);

  return recommendations;
}

// Intent-based recommendations
async function getIntentBasedRecommendations(analysis, products) {
  const recommendations = [];
  
  for (const intent of analysis.intents) {
    const confidence = analysis.confidence[intent] || 0.8; // Increase base confidence
    
    switch (intent) {
      case 'relaxation':
        recommendations.push(
          { productId: 'P002', confidence: 0.95, reason: 'Himalayan salt lamp creates a calming atmosphere', algorithm: 'intent' },
          { productId: 'P003', confidence: 0.90, reason: 'Essential oil diffuser with relaxing aromatherapy', algorithm: 'intent' },
          { productId: 'P005', confidence: 0.85, reason: 'Meditation cushion for peaceful relaxation', algorithm: 'intent' }
        );
        break;
        
      case 'wellness':
        recommendations.push(
          { productId: 'P001', confidence: 0.92, reason: 'Organic green tea for natural wellness', algorithm: 'intent' },
          { productId: 'P002', confidence: 0.88, reason: 'Himalayan salt lamp for air purification', algorithm: 'intent' },
          { productId: 'P006', confidence: 0.80, reason: 'Herbal sleep tea for natural wellness', algorithm: 'intent' }
        );
        break;
        
      case 'fitness':
        recommendations.push(
          { productId: 'P004', confidence: 0.96, reason: 'Premium yoga mat for fitness activities', algorithm: 'intent' },
          { productId: 'P005', confidence: 0.75, reason: 'Meditation cushion for post-workout relaxation', algorithm: 'intent' }
        );
        break;
        
      case 'sleep':
        recommendations.push(
          { productId: 'P006', confidence: 0.94, reason: 'Herbal sleep tea with natural sleep aids', algorithm: 'intent' },
          { productId: 'P002', confidence: 0.82, reason: 'Soft glow for bedtime atmosphere', algorithm: 'intent' },
          { productId: 'P003', confidence: 0.78, reason: 'Lavender essential oils for better sleep', algorithm: 'intent' }
        );
        break;
        
      case 'aromatherapy':
        recommendations.push(
          { productId: 'P003', confidence: 0.98, reason: 'Essential oil diffuser for aromatherapy', algorithm: 'intent' },
          { productId: 'P002', confidence: 0.85, reason: 'Himalayan salt lamp complements aromatherapy', algorithm: 'intent' }
        );
        break;
        
      case 'meditation':
        recommendations.push(
          { productId: 'P005', confidence: 0.96, reason: 'Comfortable meditation cushion', algorithm: 'intent' },
          { productId: 'P002', confidence: 0.80, reason: 'Calming salt lamp for meditation space', algorithm: 'intent' },
          { productId: 'P003', confidence: 0.75, reason: 'Essential oils for meditation ambiance', algorithm: 'intent' }
        );
        break;
        
      case 'tea':
        recommendations.push(
          { productId: 'P001', confidence: 0.95, reason: 'Premium organic green tea', algorithm: 'intent' },
          { productId: 'P006', confidence: 0.88, reason: 'Herbal sleep tea blend', algorithm: 'intent' }
        );
        break;
    }
  }
  
  return recommendations;
}

// Category-based recommendations
async function getCategoryBasedRecommendations(analysis, products) {
  const recommendations = [];
  
  for (const category of analysis.categories) {
    const categoryProducts = products.filter(p => p.category.toLowerCase() === category);
    
    categoryProducts.forEach(product => {
      recommendations.push({
        productId: product.id,
        confidence: 0.7,
        reason: `Matches your interest in ${category} products`,
        algorithm: 'category'
      });
    });
  }
  
  return recommendations;
}

// Keyword-based recommendations
async function getKeywordBasedRecommendations(analysis, products) {
  const recommendations = [];
  
  for (const keyword of analysis.keywords) {
    products.forEach(product => {
      if (product.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))) {
        recommendations.push({
          productId: product.id,
          confidence: 0.6,
          reason: `Matches keyword: ${keyword}`,
          algorithm: 'keyword'
        });
      }
    });
  }
  
  return recommendations;
}

// Collaborative filtering recommendations
async function getCollaborativeRecommendations(customerPreferences, products) {
  const recommendations = [];
  
  // This would typically use machine learning models
  // For now, we'll use simple preference matching
  
  if (customerPreferences.preferredCategories) {
    customerPreferences.preferredCategories.forEach(category => {
      const categoryProducts = products.filter(p => p.category.toLowerCase() === category);
      categoryProducts.forEach(product => {
        recommendations.push({
          productId: product.id,
          confidence: 0.8,
          reason: `Based on your preference for ${category}`,
          algorithm: 'collaborative'
        });
      });
    });
  }
  
  return recommendations;
}

// Popularity-based recommendations
async function getPopularityBasedRecommendations(products) {
  // Sort products by rating and reviews
  const popularProducts = products
    .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
    .slice(0, 3);
  
  return popularProducts.map(product => ({
    productId: product.id,
    confidence: 0.5,
    reason: 'Popular choice among customers',
    algorithm: 'popularity'
  }));
}

// Rank recommendations by combining multiple factors
async function rankRecommendations(recommendations, analysis) {
  // Group by product ID and combine scores
  const productScores = {};
  
  recommendations.forEach(rec => {
    if (!productScores[rec.productId]) {
      productScores[rec.productId] = {
        productId: rec.productId,
        confidence: 0,
        reasons: [],
        algorithms: []
      };
    }
    
    // Weight different algorithms differently
    const algorithmWeight = {
      'intent': 1.0,
      'category': 0.8,
      'keyword': 0.6,
      'collaborative': 0.9,
      'popularity': 0.3
    };
    
    const weightedConfidence = rec.confidence * (algorithmWeight[rec.algorithm] || 0.5);
    productScores[rec.productId].confidence = Math.max(productScores[rec.productId].confidence, weightedConfidence);
    productScores[rec.productId].reasons.push(rec.reason);
    productScores[rec.productId].algorithms.push(rec.algorithm);
  });
  
  // Normalize confidence scores
  Object.values(productScores).forEach(score => {
    score.confidence = Math.min(score.confidence, 1.0);
    score.primaryReason = score.reasons[0];
  });
  
  // Sort by confidence
  return Object.values(productScores)
    .sort((a, b) => b.confidence - a.confidence);
}

// Helper functions
function extractPriceRange(message) {
  const pricePattern = /\$?(\d+)(?:-\$?(\d+))?/g;
  const matches = [...message.matchAll(pricePattern)];
  
  if (matches.length > 0) {
    const prices = matches.map(match => parseInt(match[1]));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
  
  return null;
}

function detectUrgency(message) {
  const urgentKeywords = ['urgent', 'asap', 'quickly', 'fast', 'immediately'];
  const messageLower = message.toLowerCase();
  
  return urgentKeywords.some(keyword => messageLower.includes(keyword)) ? 'high' : 'normal';
}

function extractKeywords(message) {
  // Simple keyword extraction (in production, use NLP libraries)
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  return message.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
}

function analyzeSentiment(message) {
  // Simple sentiment analysis (in production, use proper NLP)
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'poor'];
  
  const messageLower = message.toLowerCase();
  const positiveCount = positiveWords.filter(word => messageLower.includes(word)).length;
  const negativeCount = negativeWords.filter(word => messageLower.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function calculateOverallConfidence(recommendations) {
  if (recommendations.length === 0) return 0;
  
  const totalConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0);
  return totalConfidence / recommendations.length;
}

function generateReasoning(recommendations, analysis) {
  if (recommendations.length === 0) {
    return 'No specific recommendations found. Please provide more details about what you\'re looking for.';
  }
  
  const topRecommendation = recommendations[0];
  const intentText = analysis.intents.length > 0 ? `Based on your interest in ${analysis.intents.join(', ')}` : 'Based on your message';
  
  return `${intentText}, I recommend ${topRecommendation.primaryReason}. This recommendation has a ${(topRecommendation.confidence * 100).toFixed(0)}% confidence score.`;
}

// Get products (same as in webhook)
async function getProducts() {
  return [
    {
      id: 'P001',
      name: 'Organic Green Tea',
      category: 'Beverages',
      price: 12.99,
      stock: 150,
      description: 'Premium organic green tea with antioxidant properties',
      tags: ['organic', 'healthy', 'antioxidant', 'natural'],
      rating: 4.8,
      reviews: 234
    },
    {
      id: 'P002',
      name: 'Himalayan Salt Lamp',
      category: 'Wellness',
      price: 29.99,
      stock: 45,
      description: 'Natural Himalayan salt lamp for air purification and mood enhancement',
      tags: ['wellness', 'air-purification', 'mood', 'natural'],
      rating: 4.6,
      reviews: 189
    },
    {
      id: 'P003',
      name: 'Essential Oil Diffuser',
      category: 'Aromatherapy',
      price: 45.99,
      stock: 78,
      description: 'Ultrasonic essential oil diffuser with LED lights and timer',
      tags: ['aromatherapy', 'relaxation', 'LED', 'timer'],
      rating: 4.7,
      reviews: 312
    },
    {
      id: 'P004',
      name: 'Yoga Mat Premium',
      category: 'Fitness',
      price: 39.99,
      stock: 92,
      description: 'Non-slip premium yoga mat with carrying strap',
      tags: ['fitness', 'yoga', 'non-slip', 'premium'],
      rating: 4.9,
      reviews: 456
    },
    {
      id: 'P005',
      name: 'Meditation Cushion',
      category: 'Wellness',
      price: 24.99,
      stock: 67,
      description: 'Comfortable meditation cushion filled with buckwheat hulls',
      tags: ['meditation', 'comfort', 'buckwheat', 'wellness'],
      rating: 4.5,
      reviews: 178
    },
    {
      id: 'P006',
      name: 'Herbal Sleep Tea',
      category: 'Beverages',
      price: 15.99,
      stock: 123,
      description: 'Blend of chamomile, lavender, and valerian for better sleep',
      tags: ['sleep', 'herbal', 'chamomile', 'lavender'],
      rating: 4.4,
      reviews: 267
    }
  ];
}

// Get customer preferences (placeholder)
async function getCustomerPreferences(customerId) {
  // In production, this would fetch from your database
  return {
    preferredCategories: ['Wellness', 'Beverages'],
    purchaseHistory: [],
    preferences: {}
  };
}

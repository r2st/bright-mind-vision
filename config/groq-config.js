// Groq RAG Configuration
export const GROQ_CONFIG = {
  // API Configuration
  apiKey: process.env.GROQ_API_KEY,
  
  // Model Selection Strategy
  models: {
    primary: process.env.GROQ_PRIMARY_MODEL || 'llama-3.1-8b-instant',
    versatile: process.env.GROQ_VERSATILE_MODEL || 'llama-3.3-70b-versatile',
    guard: process.env.GROQ_GUARD_MODEL || 'meta-llama/llama-guard-4-12b'
  },
  
  // RAG Configuration
  rag: {
    bm25Weight: parseFloat(process.env.RAG_BM25_WEIGHT) || 0.4,
    vectorWeight: parseFloat(process.env.RAG_VECTOR_WEIGHT) || 0.4,
    businessWeight: parseFloat(process.env.RAG_BUSINESS_WEIGHT) || 0.2,
    maxCandidates: parseInt(process.env.RAG_MAX_CANDIDATES) || 20,
    finalRecommendations: parseInt(process.env.RAG_FINAL_RECOMMENDATIONS) || 5
  },
  
  // Safety Configuration
  safety: {
    enabled: process.env.ENABLE_SAFETY_GUARD === 'true',
    threshold: parseFloat(process.env.SAFETY_THRESHOLD) || 0.7
  }
};

// Optimized Model Selection Logic
export function pickModels({ needComplexity, scoreSpread, queryLength }) {
  // Use faster model for simple queries and when we have good candidate diversity
  const primary = (needComplexity === 'high' || scoreSpread < 3 || queryLength > 50)
    ? GROQ_CONFIG.models.versatile
    : GROQ_CONFIG.models.primary;

  const guard = GROQ_CONFIG.models.guard;
  return { primary, guard };
}

// Need → Affordances Glossary
export const NEED_AFFORDANCES = {
  'relaxation_and_stress_relief': [
    'calming', 'aromatherapy', 'ambience', 'meditation', 'stress-relief',
    'relaxation', 'zen', 'peaceful', 'tranquil', 'serene'
  ],
  'sleep_support': [
    'sleep', 'melatonin-free', 'white-noise', 'aromatherapy', 'bedtime',
    'insomnia', 'sleep-aid', 'restful', 'slumber', 'dreamy'
  ],
  'organic': [
    'organic', 'natural', 'no-additives', 'pure', 'chemical-free',
    'eco-friendly', 'sustainable', 'green', 'clean', 'wholesome'
  ],
  'wellness_general': [
    'wellness', 'health', 'vitamins', 'self-care', 'fitness',
    'nutrition', 'supplements', 'holistic', 'mindfulness', 'balance'
  ],
  'luxury': [
    'luxury', 'premium', 'exclusive', 'high-end', 'sophisticated',
    'elegant', 'refined', 'upscale', 'deluxe', 'opulent'
  ],
  'beauty_skincare': [
    'beauty', 'skincare', 'anti-aging', 'moisturizing', 'cleansing',
    'serum', 'cream', 'lotion', 'cosmetics', 'glamour'
  ],
  'fragrance': [
    'fragrance', 'perfume', 'cologne', 'scent', 'aroma',
    'essential-oils', 'parfum', 'eau-de-parfum', 'cologne', 'attar'
  ],
  'home_decor': [
    'home', 'decor', 'interior', 'furniture', 'lighting',
    'crystal', 'art', 'sculpture', 'vase', 'chandelier'
  ],
  'jewelry_watches': [
    'jewelry', 'watch', 'timepiece', 'diamond', 'gold',
    'silver', 'platinum', 'necklace', 'ring', 'bracelet'
  ],
  'fashion_accessories': [
    'fashion', 'handbag', 'purse', 'clutch', 'accessories',
    'leather', 'designer', 'couture', 'style', 'elegance'
  ]
};

// Intent Classification
export function classifyIntent(userQuery) {
  const query = userQuery.toLowerCase();
  
  // Enhanced product category detection with higher priority
  const categoryKeywords = {
    'fashion_accessories': ['bag', 'handbag', 'purse', 'bags', 'clutch', 'tote', 'shoulder bag', 'crossbody', 'satchel', 'backpack'],
    'jewelry_watches': ['watch', 'timepiece', 'watches', 'jewelry', 'necklace', 'bracelet', 'ring', 'earrings', 'pendant'],
    'beauty_skincare': ['skincare', 'beauty', 'cream', 'serum', 'moisturizer', 'cleanser', 'toner', 'mask', 'anti-aging'],
    'fragrance': ['perfume', 'fragrance', 'cologne', 'scent', 'eau de parfum', 'eau de toilette', 'parfum'],
    'home_decor': ['home', 'decor', 'decoration', 'furniture', 'lamp', 'candle', 'vase', 'art', 'sculpture'],
    'wellness_general': ['wellness', 'health', 'supplement', 'vitamin', 'organic', 'natural', 'holistic']
  };
  
  // Check for non-product queries first
  const nonProductKeywords = ['car', 'vehicle', 'automobile', 'house', 'home', 'property', 'real estate', 'food', 'restaurant', 'hotel', 'travel', 'flight'];
  if (nonProductKeywords.some(keyword => query.includes(keyword))) {
    return {
      primaryNeed: 'non_product',
      matchedAffordances: nonProductKeywords.filter(keyword => query.includes(keyword)),
      confidence: 0.9
    };
  }
  
  // Check for specific product categories first (highest priority)
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter(keyword => query.includes(keyword));
    if (matches.length > 0) {
      return {
        primaryNeed: category,
        matchedAffordances: matches,
        confidence: Math.min(0.9, 0.6 + (matches.length * 0.1))
      };
    }
  }
  
  // Check for luxury indicators
  if (query.includes('luxury') || query.includes('premium') || query.includes('high-end') || query.includes('designer')) {
    // If luxury is mentioned with a specific category, prioritize that category
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => query.includes(keyword));
      if (matches.length > 0) {
        return {
          primaryNeed: category,
          matchedAffordances: [...matches, 'luxury'],
          confidence: 0.95
        };
      }
    }
    
    // If just luxury without specific category, return luxury with high confidence
    return {
      primaryNeed: 'luxury',
      matchedAffordances: ['luxury', 'premium'],
      confidence: 0.8
    };
  }
  
  // Check for specific needs and affordances
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [need, affordances] of Object.entries(NEED_AFFORDANCES)) {
    const matches = affordances.filter(affordance => 
      query.includes(affordance.toLowerCase())
    );
    
    if (matches.length > 0) {
      const score = matches.length / affordances.length;
      if (score > bestScore) {
        bestMatch = {
          primaryNeed: need,
          matchedAffordances: matches,
          confidence: score
        };
        bestScore = score;
      }
    }
  }
  
  // If we found a match, return it
  if (bestMatch && bestMatch.confidence > 0.3) {
    return bestMatch;
  }
  
  // Default to general wellness with low confidence
  return {
    primaryNeed: 'wellness_general',
    matchedAffordances: ['wellness', 'health'],
    confidence: 0.3
  };
}

// Complexity Assessment
export function assessComplexity(intent, query) {
  const complexKeywords = [
    'complex', 'multiple', 'various', 'different', 'range',
    'combination', 'mix', 'variety', 'assortment'
  ];
  
  const hasComplexKeywords = complexKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
  
  const hasMultipleNeeds = Object.keys(NEED_AFFORDANCES).filter(need => 
    query.toLowerCase().includes(need.replace('_', ' '))
  ).length > 1;
  
  return {
    isComplex: hasComplexKeywords || hasMultipleNeeds,
    complexity: hasComplexKeywords ? 'high' : hasMultipleNeeds ? 'medium' : 'low'
  };
}

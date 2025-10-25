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

// Model Selection Logic
export function pickModels({ needComplexity, scoreSpread }) {
  const primary = (needComplexity === 'high' || scoreSpread < 5)
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
  
  // Check for specific needs and find the best match
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
  if (bestMatch) {
    return bestMatch;
  }
  
  // Special handling for common product categories
  if (query.includes('watch') || query.includes('timepiece')) {
    return {
      primaryNeed: 'jewelry_watches',
      matchedAffordances: ['watch', 'timepiece'],
      confidence: 0.8
    };
  }
  
  if (query.includes('bag') || query.includes('handbag') || query.includes('purse')) {
    return {
      primaryNeed: 'fashion_accessories',
      matchedAffordances: ['handbag', 'bag'],
      confidence: 0.8
    };
  }
  
  if (query.includes('luxury') || query.includes('premium')) {
    return {
      primaryNeed: 'luxury',
      matchedAffordances: ['luxury', 'premium'],
      confidence: 0.7
    };
  }
  
  // Default to general wellness
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

// Enhanced Product Data Model for RAG System
// Comprehensive product attributes for luxury brands popular in Dubai
// Updated with Dubai luxury products and UAE Dirham pricing

export const enhancedProducts = [
  // FASHION & ACCESSORIES
  {
    id: 'P001',
    name: 'Chanel Classic Flap Bag',
    category: 'Fashion',
    price: 38500, // AED
    stock: 3,
    description: 'Iconic quilted lambskin leather handbag with chain strap and CC lock.',
    image: '👜',
    tags: ['luxury', 'chanel', 'handbag', 'classic', 'investment', 'timeless'],
    benefits: ['timeless design', 'high resale value', 'versatile', 'status symbol'],
    materials: ['lambskin leather', 'gold-tone metal'],
    is_organic: false,
    rating: 4.9,
    reviews: 120,
    supplier: 'Chanel Boutique Dubai Mall',
    sku: 'CH-CFB-001',
    affordances: ['elegance', 'timeless', 'special-occasion', 'fashion', 'luxury', 'investment'],
    location: 'Dubai Mall',
    brand: 'Chanel',
    origin: 'France'
  },
  {
    id: 'P002',
    name: 'Hermès Birkin 30',
    category: 'Fashion',
    price: 55000, // AED
    stock: 1,
    description: 'The ultimate luxury handbag - handcrafted in France with exceptional attention to detail.',
    image: '👜',
    tags: ['luxury', 'hermes', 'birkin', 'investment', 'exclusive', 'handcrafted'],
    benefits: ['ultimate luxury', 'investment value', 'exclusive', 'handcrafted'],
    materials: ['premium leather', 'palladium hardware'],
    is_organic: false,
    rating: 4.9,
    reviews: 89,
    supplier: 'Hermès Dubai Mall',
    sku: 'HE-B30-001',
    affordances: ['luxury', 'exclusive', 'investment', 'status', 'fashion'],
    location: 'Dubai Mall',
    brand: 'Hermès',
    origin: 'France'
  },
  {
    id: 'P003',
    name: 'Louis Vuitton Neverfull MM',
    category: 'Fashion',
    price: 12500, // AED
    stock: 8,
    description: 'Iconic Louis Vuitton tote bag in monogram canvas with leather trim.',
    image: '👜',
    tags: ['luxury', 'louis-vuitton', 'tote', 'monogram', 'versatile', 'classic'],
    benefits: ['versatile', 'durable', 'classic design', 'brand recognition'],
    materials: ['monogram canvas', 'leather trim'],
    is_organic: false,
    rating: 4.7,
    reviews: 256,
    supplier: 'Louis Vuitton Dubai Mall',
    sku: 'LV-NF-MM-001',
    affordances: ['fashion', 'versatile', 'classic', 'luxury'],
    location: 'Dubai Mall',
    brand: 'Louis Vuitton',
    origin: 'France'
  },
  {
    id: 'P004',
    name: 'Gucci GG Marmont Matelassé',
    category: 'Fashion',
    price: 8500, // AED
    stock: 5,
    description: 'Quilted leather shoulder bag with iconic GG hardware.',
    image: '👜',
    tags: ['luxury', 'gucci', 'marmont', 'quilted', 'shoulder-bag', 'trendy'],
    benefits: ['trendy design', 'versatile', 'brand recognition', 'quality'],
    materials: ['leather', 'gold-tone hardware'],
    is_organic: false,
    rating: 4.6,
    reviews: 189,
    supplier: 'Gucci Dubai Mall',
    sku: 'GU-GG-MM-001',
    affordances: ['fashion', 'trendy', 'luxury', 'versatile'],
    location: 'Dubai Mall',
    brand: 'Gucci',
    origin: 'Italy'
  },

  // WATCHES & JEWELRY
  {
    id: 'P005',
    name: 'Rolex Submariner Date',
    category: 'Watches',
    price: 45000, // AED
    stock: 2,
    description: 'Iconic diving watch with automatic movement and water resistance.',
    image: '⌚',
    tags: ['luxury', 'rolex', 'submariner', 'diving', 'automatic', 'investment'],
    benefits: ['investment value', 'durable', 'precise', 'status symbol'],
    materials: ['stainless steel', 'ceramic bezel', 'sapphire crystal'],
    is_organic: false,
    rating: 4.9,
    reviews: 78,
    supplier: 'Rolex Boutique Dubai Mall',
    sku: 'RO-SUB-001',
    affordances: ['luxury', 'investment', 'status', 'precision', 'durability'],
    location: 'Dubai Mall',
    brand: 'Rolex',
    origin: 'Switzerland'
  },
  {
    id: 'P006',
    name: 'Cartier Santos',
    category: 'Watches',
    price: 35000, // AED
    stock: 4,
    description: 'Elegant square watch with distinctive design and Swiss movement.',
    image: '⌚',
    tags: ['luxury', 'cartier', 'santos', 'square', 'elegant', 'swiss'],
    benefits: ['elegant design', 'Swiss precision', 'versatile', 'heritage'],
    materials: ['stainless steel', 'sapphire crystal', 'leather strap'],
    is_organic: false,
    rating: 4.8,
    reviews: 95,
    supplier: 'Cartier Dubai Mall',
    sku: 'CA-SAN-001',
    affordances: ['luxury', 'elegance', 'precision', 'heritage'],
    location: 'Dubai Mall',
    brand: 'Cartier',
    origin: 'France'
  },
  {
    id: 'P007',
    name: 'Bulgari Serpenti',
    category: 'Jewelry',
    price: 25000, // AED
    stock: 3,
    description: 'Iconic snake-inspired bracelet in rose gold with diamonds.',
    image: '🐍',
    tags: ['luxury', 'bulgari', 'serpenti', 'snake', 'diamonds', 'rose-gold'],
    benefits: ['unique design', 'diamond accents', 'luxury feel', 'statement piece'],
    materials: ['rose gold', 'diamonds', 'enamel'],
    is_organic: false,
    rating: 4.7,
    reviews: 45,
    supplier: 'Bulgari Dubai Mall',
    sku: 'BU-SER-001',
    affordances: ['luxury', 'unique', 'statement', 'elegance'],
    location: 'Dubai Mall',
    brand: 'Bulgari',
    origin: 'Italy'
  },

  // SKINCARE & BEAUTY
  {
    id: 'P008',
    name: 'La Mer The Concentrate',
    category: 'Skincare',
    price: 3200, // AED
    stock: 12,
    description: 'Ultra-luxury anti-aging serum with Miracle Broth™ technology.',
    image: '💎',
    tags: ['luxury', 'la-mer', 'anti-aging', 'serum', 'concentrate', 'miracle-broth'],
    benefits: ['anti-aging', 'luxury feel', 'premium ingredients', 'visible results'],
    materials: ['miracle broth', 'marine extracts', 'vitamins'],
    is_organic: false,
    rating: 4.8,
    reviews: 156,
    supplier: 'La Mer Dubai Mall',
    sku: 'LM-CON-001',
    affordances: ['luxury', 'anti-aging', 'premium', 'skincare'],
    location: 'Dubai Mall',
    brand: 'La Mer',
    origin: 'USA'
  },
  {
    id: 'P009',
    name: 'La Prairie Cellular Cream',
    category: 'Skincare',
    price: 2400, // AED
    stock: 8,
    description: 'Advanced anti-aging cream with cellular therapy technology.',
    image: '✨',
    tags: ['luxury', 'la-prairie', 'anti-aging', 'cellular', 'premium', 'swiss'],
    benefits: ['cellular therapy', 'anti-aging', 'luxury feel', 'Swiss quality'],
    materials: ['cellular extracts', 'peptides', 'vitamins'],
    is_organic: false,
    rating: 4.7,
    reviews: 134,
    supplier: 'La Prairie Dubai Mall',
    sku: 'LP-CC-001',
    affordances: ['luxury', 'anti-aging', 'premium', 'cellular-therapy'],
    location: 'Dubai Mall',
    brand: 'La Prairie',
    origin: 'Switzerland'
  },
  {
    id: 'P010',
    name: 'Sisley Black Rose Cream',
    category: 'Skincare',
    price: 1800, // AED
    stock: 6,
    description: 'Luxury anti-aging cream with black rose extract and precious oils.',
    image: '🌹',
    tags: ['luxury', 'sisley', 'black-rose', 'anti-aging', 'precious-oils', 'french'],
    benefits: ['black rose extract', 'precious oils', 'anti-aging', 'luxury feel'],
    materials: ['black rose extract', 'precious oils', 'botanical extracts'],
    is_organic: true,
    rating: 4.6,
    reviews: 98,
    supplier: 'Sisley Dubai Mall',
    sku: 'SI-BR-001',
    affordances: ['luxury', 'organic', 'anti-aging', 'precious'],
    location: 'Dubai Mall',
    brand: 'Sisley',
    origin: 'France'
  },

  // FRAGRANCE
  {
    id: 'P011',
    name: 'Tom Ford Black Orchid',
    category: 'Fragrance',
    price: 1650, // AED
    stock: 15,
    description: 'Luxury unisex fragrance with oriental and floral notes.',
    image: '🌸',
    tags: ['luxury', 'tom-ford', 'black-orchid', 'unisex', 'oriental', 'floral'],
    benefits: ['long-lasting', 'unique scent', 'versatile', 'premium quality'],
    materials: ['oriental notes', 'floral extracts', 'premium alcohol'],
    is_organic: false,
    rating: 4.6,
    reviews: 203,
    supplier: 'Tom Ford Dubai Mall',
    sku: 'TF-BO-001',
    affordances: ['luxury', 'unique', 'versatile', 'sophisticated'],
    location: 'Dubai Mall',
    brand: 'Tom Ford',
    origin: 'USA'
  },
  {
    id: 'P012',
    name: 'Creed Aventus',
    category: 'Fragrance',
    price: 2200, // AED
    stock: 10,
    description: 'Legendary masculine fragrance with pineapple and blackcurrant notes.',
    image: '🍍',
    tags: ['luxury', 'creed', 'aventus', 'masculine', 'pineapple', 'legendary'],
    benefits: ['legendary scent', 'long-lasting', 'masculine', 'premium'],
    materials: ['pineapple extract', 'blackcurrant', 'premium alcohol'],
    is_organic: false,
    rating: 4.8,
    reviews: 167,
    supplier: 'Creed Dubai Mall',
    sku: 'CR-AV-001',
    affordances: ['luxury', 'legendary', 'masculine', 'premium'],
    location: 'Dubai Mall',
    brand: 'Creed',
    origin: 'France'
  },
  {
    id: 'P013',
    name: 'Maison Francis Kurkdjian Baccarat Rouge 540',
    category: 'Fragrance',
    price: 2800, // AED
    stock: 7,
    description: 'Exclusive luxury fragrance created for Baccarat crystal house.',
    image: '💎',
    tags: ['luxury', 'mfk', 'baccarat', 'rouge-540', 'exclusive', 'crystal'],
    benefits: ['exclusive', 'luxury', 'unique', 'long-lasting'],
    materials: ['saffron', 'amber', 'premium alcohol'],
    is_organic: false,
    rating: 4.9,
    reviews: 89,
    supplier: 'MFK Dubai Mall',
    sku: 'MFK-BR-001',
    affordances: ['luxury', 'exclusive', 'unique', 'premium'],
    location: 'Dubai Mall',
    brand: 'Maison Francis Kurkdjian',
    origin: 'France'
  },

  // HOME & LIFESTYLE
  {
    id: 'P014',
    name: 'Diptyque Baies Candle',
    category: 'Home',
    price: 450, // AED
    stock: 20,
    description: 'Luxury scented candle with blackcurrant and rose notes.',
    image: '🕯️',
    tags: ['luxury', 'diptyque', 'candle', 'baies', 'scented', 'french'],
    benefits: ['long-lasting', 'luxury scent', 'elegant', 'home ambiance'],
    materials: ['paraffin wax', 'cotton wick', 'fragrance oils'],
    is_organic: false,
    rating: 4.5,
    reviews: 234,
    supplier: 'Diptyque Dubai Mall',
    sku: 'DP-BA-001',
    affordances: ['luxury', 'ambiance', 'elegance', 'home'],
    location: 'Dubai Mall',
    brand: 'Diptyque',
    origin: 'France'
  },
  {
    id: 'P015',
    name: 'Jo Malone London Lime Basil & Mandarin',
    category: 'Fragrance',
    price: 650, // AED
    stock: 18,
    description: 'Fresh and zesty fragrance with lime, basil, and mandarin notes.',
    image: '🍋',
    tags: ['luxury', 'jo-malone', 'lime-basil', 'fresh', 'citrus', 'british'],
    benefits: ['fresh scent', 'versatile', 'long-lasting', 'elegant'],
    materials: ['lime extract', 'basil', 'mandarin', 'premium alcohol'],
    is_organic: false,
    rating: 4.7,
    reviews: 189,
    supplier: 'Jo Malone Dubai Mall',
    sku: 'JM-LB-001',
    affordances: ['luxury', 'fresh', 'versatile', 'elegant'],
    location: 'Dubai Mall',
    brand: 'Jo Malone London',
    origin: 'UK'
  },

  // WELLNESS & SPA
  {
    id: 'P016',
    name: 'Aromatherapy Associates Deep Relax',
    category: 'Wellness',
    price: 320, // AED
    stock: 25,
    description: 'Luxury aromatherapy bath oil for deep relaxation and stress relief.',
    image: '🛁',
    tags: ['luxury', 'aromatherapy', 'relaxation', 'bath-oil', 'stress-relief', 'wellness'],
    benefits: ['stress relief', 'relaxation', 'luxury feel', 'aromatherapy'],
    materials: ['essential oils', 'carrier oils', 'natural extracts'],
    is_organic: true,
    rating: 4.6,
    reviews: 156,
    supplier: 'Aromatherapy Associates Dubai Mall',
    sku: 'AA-DR-001',
    affordances: ['relaxation', 'stress-relief', 'wellness', 'luxury'],
    location: 'Dubai Mall',
    brand: 'Aromatherapy Associates',
    origin: 'UK'
  },
  {
    id: 'P017',
    name: 'This Works Deep Sleep Pillow Spray',
    category: 'Wellness',
    price: 180, // AED
    stock: 30,
    description: 'Luxury pillow spray with lavender and chamomile for better sleep.',
    image: '💤',
    tags: ['luxury', 'sleep', 'pillow-spray', 'lavender', 'chamomile', 'wellness'],
    benefits: ['better sleep', 'relaxation', 'natural', 'luxury feel'],
    materials: ['lavender oil', 'chamomile extract', 'water'],
    is_organic: true,
    rating: 4.5,
    reviews: 203,
    supplier: 'This Works Dubai Mall',
    sku: 'TW-DS-001',
    affordances: ['sleep', 'relaxation', 'wellness', 'natural'],
    location: 'Dubai Mall',
    brand: 'This Works',
    origin: 'UK'
  },

  // GOURMET & LIFESTYLE
  {
    id: 'P018',
    name: 'Fortnum & Mason Royal Blend Tea',
    category: 'Beverages',
    price: 120, // AED
    stock: 40,
    description: 'Premium English breakfast tea blend created for the British Royal Family.',
    image: '☕',
    tags: ['luxury', 'fortnum-mason', 'royal-blend', 'tea', 'british', 'premium'],
    benefits: ['royal heritage', 'premium quality', 'traditional', 'luxury'],
    materials: ['black tea leaves', 'natural flavors'],
    is_organic: true,
    rating: 4.8,
    reviews: 145,
    supplier: 'Fortnum & Mason Dubai Mall',
    sku: 'FM-RB-001',
    affordances: ['luxury', 'royal', 'premium', 'traditional'],
    location: 'Dubai Mall',
    brand: 'Fortnum & Mason',
    origin: 'UK'
  },
  {
    id: 'P019',
    name: 'Godiva Dark Chocolate Truffles',
    category: 'Gourmet',
    price: 280, // AED
    stock: 35,
    description: 'Luxury Belgian dark chocolate truffles in elegant gift box.',
    image: '🍫',
    tags: ['luxury', 'godiva', 'chocolate', 'truffles', 'belgian', 'gift'],
    benefits: ['premium chocolate', 'elegant presentation', 'luxury gift', 'belgian quality'],
    materials: ['dark chocolate', 'cocoa', 'cream', 'natural flavors'],
    is_organic: false,
    rating: 4.7,
    reviews: 178,
    supplier: 'Godiva Dubai Mall',
    sku: 'GO-DT-001',
    affordances: ['luxury', 'gift', 'premium', 'indulgence'],
    location: 'Dubai Mall',
    brand: 'Godiva',
    origin: 'Belgium'
  },

  // AUTOMOTIVE & LIFESTYLE
  {
    id: 'P020',
    name: 'Bentley Motors Fragrance',
    category: 'Fragrance',
    price: 850, // AED
    stock: 12,
    description: 'Luxury automotive-inspired fragrance with leather and wood notes.',
    image: '🚗',
    tags: ['luxury', 'bentley', 'automotive', 'leather', 'wood', 'masculine'],
    benefits: ['automotive luxury', 'unique scent', 'masculine', 'premium'],
    materials: ['leather extract', 'wood notes', 'premium alcohol'],
    is_organic: false,
    rating: 4.4,
    reviews: 67,
    supplier: 'Bentley Dubai Mall',
    sku: 'BE-FR-001',
    affordances: ['luxury', 'automotive', 'masculine', 'unique'],
    location: 'Dubai Mall',
    brand: 'Bentley',
    origin: 'UK'
  }
];

// Helper functions for product filtering and scoring
export function filterProducts(products, primaryNeed, affordances) {
  if (!products || products.length === 0) return [];
  
  return products.filter(product => {
    // Enhanced category mapping for better filtering
    const categoryMap = {
      'fashion_accessories': ['Fashion'],
      'jewelry_watches': ['Watches', 'Jewelry'],
      'beauty_skincare': ['Skincare', 'Beauty'],
      'fragrance': ['Fragrance'],
      'home_decor': ['Home', 'Decor'],
      'wellness_general': ['Wellness', 'Health'],
      'luxury': ['Fashion', 'Watches', 'Jewelry', 'Fragrance', 'Skincare', 'Home']
    };
    
    // Get target categories for the primary need
    const targetCategories = categoryMap[primaryNeed] || [primaryNeed];
    
    // Check if product category matches
    const categoryMatch = targetCategories.some(cat => 
      product.category === cat || 
      product.category.toLowerCase().includes(cat.toLowerCase())
    );
    
    if (!categoryMatch) return false;
    
    // Special handling for specific product types
    if (primaryNeed === 'fashion_accessories') {
      // For bags/handbags, only return actual bags
      if (affordances.some(aff => ['bag', 'handbag', 'purse', 'bags'].includes(aff))) {
        return product.tags?.includes('handbag') || 
               product.tags?.includes('bag') ||
               product.name.toLowerCase().includes('bag') ||
               product.name.toLowerCase().includes('handbag') ||
               product.name.toLowerCase().includes('purse');
      }
      // For other fashion accessories, return all fashion items
      return true;
    }
    
    if (primaryNeed === 'jewelry_watches') {
      // For watches, prioritize actual watches
      if (affordances.some(aff => ['watch', 'timepiece', 'watches'].includes(aff))) {
        return product.category === 'Watches' || 
               (product.category === 'Jewelry' && 
                (product.tags?.includes('watch') || product.name.toLowerCase().includes('watch')));
      }
      // For jewelry, return jewelry items
      return product.category === 'Jewelry' || product.category === 'Watches';
    }
    
    // For luxury queries, ensure high-end products
    if (primaryNeed === 'luxury') {
      return product.tags?.includes('luxury') || 
             product.price > 1000 || 
             ['Chanel', 'Hermès', 'Rolex', 'Cartier', 'Bulgari', 'La Mer', 'La Prairie'].includes(product.brand);
    }
    
    // Filter by affordances for better matching
    const affordanceMatch = affordances.some(affordance => 
      product.affordances?.includes(affordance) ||
      product.tags?.some(tag => tag.includes(affordance)) ||
      product.benefits?.some(benefit => benefit.includes(affordance)) ||
      product.name.toLowerCase().includes(affordance)
    );
    
    return affordanceMatch;
  });
}

export function calculateBM25Score(product, query, affordances = []) {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  let score = 0;
  
  // Weighted search fields for better relevance
  const searchFields = [
    { text: product.name, weight: 3.0 },
    { text: product.description, weight: 2.0 },
    { text: product.category, weight: 2.5 },
    { text: (product.tags || []).join(' '), weight: 1.5 },
    { text: (product.benefits || []).join(' '), weight: 1.0 },
    { text: (product.affordances || []).join(' '), weight: 2.0 },
    { text: product.brand || '', weight: 1.5 }
  ];
  
  // Calculate term frequency with field weights
  queryTerms.forEach(term => {
    searchFields.forEach(field => {
      const termCount = (field.text.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      if (termCount > 0) {
        score += termCount * field.weight;
      }
    });
  });
  
  // Boost score for exact affordance matches
  affordances.forEach(affordance => {
    if (product.affordances?.includes(affordance) || 
        product.tags?.includes(affordance) ||
        product.name.toLowerCase().includes(affordance)) {
      score += 2.0;
    }
  });
  
  // Boost score for luxury products when luxury is mentioned
  if (query.includes('luxury') && product.tags?.includes('luxury')) {
    score += 1.5;
  }
  
  // Normalize score
  return Math.min(score / 10, 1.0);
}

export function calculateBusinessScore(product) {
  let score = 0;
  
  // Rating score
  if (product.rating) {
    score += product.rating * 2; // 0-10 points
  }
  
  // Stock availability
  if (product.stock > 0) {
    score += 1;
  }
  
  // Luxury brand bonus
  const luxuryBrands = ['chanel', 'hermes', 'louis vuitton', 'gucci', 'rolex', 'cartier', 'bulgari', 'la mer', 'la prairie'];
  if (luxuryBrands.some(brand => product.brand?.toLowerCase().includes(brand))) {
    score += 2;
  }
  
  // Price tier (higher price = more luxury)
  if (product.price > 10000) score += 3;
  else if (product.price > 5000) score += 2;
  else if (product.price > 1000) score += 1;
  
  return score;
}
// Enhanced product data model for RAG system
export const enhancedProducts = [
  // Luxury Fashion & Accessories
  {
    id: 'P001',
    name: 'Chanel Classic Flap Bag',
    category: 'Fashion',
    price: 8500.00,
    stock: 12,
    description: 'Iconic Chanel Classic Flap Bag in black caviar leather with gold hardware',
    image: '👜',
    tags: ['luxury', 'chanel', 'handbag', 'classic', 'investment', 'elegant', 'sophisticated'],
    benefits: ['status-symbol', 'investment-value', 'timeless-design', 'versatile'],
    materials: ['caviar-leather', 'gold-hardware'],
    is_organic: false,
    rating: 4.9,
    reviews: 1247,
    supplier: 'Chanel Boutique Dubai Mall',
    sku: 'CHN-CFB-001',
    brand: 'Chanel',
    origin: 'France',
    color: 'Black',
    size: 'Medium',
    contraindications: ['budget-conscious', 'minimalist-lifestyle'],
    affordances: ['luxury', 'fashion', 'handbag', 'elegant', 'sophisticated', 'investment']
  },
  {
    id: 'P002',
    name: 'Rolex Submariner Date',
    category: 'Watches',
    price: 12500.00,
    stock: 8,
    description: 'Luxury diving watch with automatic movement and 300m water resistance',
    image: '⌚',
    tags: ['luxury', 'rolex', 'diving', 'automatic', 'investment', 'prestige', 'sporty'],
    benefits: ['investment-value', 'water-resistance', 'precision', 'durability'],
    materials: ['oystersteel', 'ceramic', 'sapphire-crystal'],
    is_organic: false,
    rating: 4.8,
    reviews: 892,
    supplier: 'Rolex Boutique DIFC',
    sku: 'RLX-SUB-002',
    brand: 'Rolex',
    origin: 'Switzerland',
    color: 'Black',
    movement: 'Automatic',
    contraindications: ['budget-conscious', 'casual-wear-only'],
    affordances: ['luxury', 'jewelry', 'watch', 'investment', 'prestige', 'sporty']
  },
  {
    id: 'P003',
    name: 'Hermès Birkin 30',
    category: 'Fashion',
    price: 15000.00,
    stock: 3,
    description: 'Ultra-luxury Hermès Birkin 30 in Togo leather with palladium hardware',
    image: '👜',
    tags: ['luxury', 'hermes', 'birkin', 'exclusive', 'investment', 'ultra-premium'],
    benefits: ['exclusivity', 'investment-value', 'craftsmanship', 'status-symbol'],
    materials: ['togo-leather', 'palladium-hardware'],
    is_organic: false,
    rating: 4.9,
    reviews: 456,
    supplier: 'Hermès Dubai Mall',
    sku: 'HMS-BIR-003',
    brand: 'Hermès',
    origin: 'France',
    color: 'Gold',
    size: '30cm',
    contraindications: ['budget-conscious', 'practical-only'],
    affordances: ['luxury', 'fashion', 'handbag', 'exclusive', 'investment', 'ultra-premium']
  },

  // Luxury Beauty & Fragrance
  {
    id: 'P005',
    name: 'Tom Ford Black Orchid',
    category: 'Fragrance',
    price: 450.00,
    stock: 45,
    description: 'Luxury unisex fragrance with notes of black orchid, patchouli, and vanilla',
    image: '🌸',
    tags: ['luxury', 'tom-ford', 'unisex', 'oriental', 'exclusive', 'sophisticated'],
    benefits: ['long-lasting', 'unique-scent', 'versatile', 'premium-quality'],
    materials: ['synthetic-fragrance', 'alcohol-base'],
    is_organic: false,
    rating: 4.6,
    reviews: 1234,
    supplier: 'Tom Ford Beauty Dubai',
    sku: 'TF-BO-005',
    brand: 'Tom Ford',
    origin: 'USA',
    size: '100ml',
    type: 'Eau de Parfum',
    notes: 'Black Orchid, Patchouli, Vanilla',
    contraindications: ['sensitive-skin', 'allergies'],
    affordances: ['luxury', 'fragrance', 'sophisticated', 'exclusive', 'oriental']
  },
  {
    id: 'P006',
    name: 'La Mer The Concentrate',
    category: 'Skincare',
    price: 850.00,
    stock: 28,
    description: 'Ultra-luxury anti-aging serum with Miracle Broth™ and diamond powder',
    image: '💎',
    tags: ['luxury', 'la-mer', 'anti-aging', 'serum', 'premium', 'exclusive'],
    benefits: ['anti-aging', 'luxury-feel', 'premium-ingredients', 'visible-results'],
    materials: ['miracle-broth', 'diamond-powder', 'marine-ingredients'],
    is_organic: false,
    rating: 4.8,
    reviews: 567,
    supplier: 'La Mer Counter Harvey Nichols',
    sku: 'LM-TC-006',
    brand: 'La Mer',
    origin: 'USA',
    size: '30ml',
    type: 'Serum',
    skinType: 'All',
    contraindications: ['sensitive-skin', 'budget-conscious'],
    affordances: ['luxury', 'beauty', 'skincare', 'anti-aging', 'premium', 'exclusive']
  },
  {
    id: 'P007',
    name: 'Creed Aventus',
    category: 'Fragrance',
    price: 380.00,
    stock: 32,
    description: 'Iconic masculine fragrance with pineapple, blackcurrant, and birch',
    image: '🍍',
    tags: ['luxury', 'creed', 'masculine', 'fresh', 'woody', 'sophisticated'],
    benefits: ['long-lasting', 'unique-scent', 'masculine-appeal', 'versatile'],
    materials: ['natural-ingredients', 'alcohol-base'],
    is_organic: false,
    rating: 4.7,
    reviews: 1890,
    supplier: 'Creed Boutique Dubai Mall',
    sku: 'CRD-AV-007',
    brand: 'Creed',
    origin: 'France',
    size: '100ml',
    type: 'Eau de Parfum',
    notes: 'Pineapple, Blackcurrant, Birch',
    contraindications: ['sensitive-skin', 'allergies'],
    affordances: ['luxury', 'fragrance', 'masculine', 'sophisticated', 'fresh']
  },

  // Luxury Home & Lifestyle
  {
    id: 'P008',
    name: 'Baccarat Crystal Chandelier',
    category: 'Home',
    price: 25000.00,
    stock: 2,
    description: 'Handcrafted Baccarat crystal chandelier with 24 lights and Swarovski crystals',
    image: '💎',
    tags: ['luxury', 'baccarat', 'crystal', 'chandelier', 'handcrafted', 'exclusive'],
    benefits: ['luxury-ambience', 'artistic-value', 'prestige', 'investment'],
    materials: ['crystal', 'swarovski-crystals', 'brass'],
    is_organic: false,
    rating: 4.9,
    reviews: 23,
    supplier: 'Baccarat Dubai Showroom',
    sku: 'BAC-CH-008',
    brand: 'Baccarat',
    origin: 'France',
    lights: 24,
    diameter: '120cm',
    contraindications: ['small-spaces', 'budget-conscious'],
    affordances: ['luxury', 'home', 'decor', 'crystal', 'exclusive', 'artistic']
  },
  {
    id: 'P009',
    name: 'Versace Home Silk Cushions',
    category: 'Home',
    price: 850.00,
    stock: 18,
    description: 'Luxury silk cushions with iconic Versace Medusa print',
    image: '🛋️',
    tags: ['luxury', 'versace', 'silk', 'medusa', 'home', 'designer'],
    benefits: ['luxury-comfort', 'designer-prestige', 'elegant-appeal', 'versatile'],
    materials: ['silk', 'cotton-lining'],
    is_organic: false,
    rating: 4.5,
    reviews: 89,
    supplier: 'Versace Home Dubai',
    sku: 'VRS-SC-009',
    brand: 'Versace',
    origin: 'Italy',
    size: '50x50cm',
    pattern: 'Medusa',
    contraindications: ['budget-conscious', 'minimalist-style'],
    affordances: ['luxury', 'home', 'decor', 'silk', 'designer', 'elegant']
  },

  // Wellness & Organic Products
  {
    id: 'P020',
    name: 'La Prairie Cellular Cream',
    category: 'Skincare',
    price: 650.00,
    stock: 35,
    description: 'Ultra-luxury anti-aging cream with cellular therapy',
    image: '✨',
    tags: ['luxury', 'la-prairie', 'anti-aging', 'cellular', 'premium', 'exclusive'],
    benefits: ['anti-aging', 'cellular-therapy', 'luxury-feel', 'visible-results'],
    materials: ['cellular-ingredients', 'peptides', 'vitamins'],
    is_organic: false,
    rating: 4.7,
    reviews: 445,
    supplier: 'La Prairie Counter Harvey Nichols',
    sku: 'LP-CC-020',
    brand: 'La Prairie',
    origin: 'Switzerland',
    size: '50ml',
    type: 'Cream',
    skinType: 'Mature',
    contraindications: ['sensitive-skin', 'budget-conscious'],
    affordances: ['luxury', 'beauty', 'skincare', 'anti-aging', 'premium', 'exclusive']
  },
  {
    id: 'P021',
    name: 'Organic Himalayan Salt Lamp',
    category: 'Wellness',
    price: 89.99,
    stock: 45,
    description: 'Natural Himalayan salt lamp for air purification and mood enhancement',
    image: '🕯️',
    tags: ['organic', 'himalayan-salt', 'wellness', 'air-purification', 'natural'],
    benefits: ['air-purification', 'mood-enhancement', 'natural-light', 'wellness'],
    materials: ['himalayan-salt', 'wood-base', 'bulb'],
    is_organic: true,
    rating: 4.6,
    reviews: 189,
    supplier: 'Himalayan Wellness Co.',
    sku: 'HWC-SL-021',
    brand: 'Himalayan Wellness',
    origin: 'Himalayas',
    color: 'Pink',
    size: 'Medium',
    contraindications: ['humidity-sensitive', 'electrical-allergies'],
    affordances: ['organic', 'wellness', 'relaxation', 'natural', 'air-purification']
  },
  {
    id: 'P022',
    name: 'Essential Oil Diffuser',
    category: 'Wellness',
    price: 45.99,
    stock: 78,
    description: 'Ultrasonic essential oil diffuser with LED lights and timer',
    image: '💨',
    tags: ['aromatherapy', 'relaxation', 'LED', 'timer', 'wellness', 'natural'],
    benefits: ['aromatherapy', 'relaxation', 'mood-enhancement', 'air-humidification'],
    materials: ['plastic', 'LED-lights', 'ultrasonic'],
    is_organic: false,
    rating: 4.7,
    reviews: 312,
    supplier: 'AromaTech Solutions',
    sku: 'ATS-ED-022',
    brand: 'AromaTech',
    origin: 'China',
    color: 'White',
    size: 'Medium',
    contraindications: ['essential-oil-allergies', 'pets'],
    affordances: ['wellness', 'aromatherapy', 'relaxation', 'natural', 'mood-enhancement']
  },
  {
    id: 'P023',
    name: 'Meditation Cushion',
    category: 'Wellness',
    price: 24.99,
    stock: 67,
    description: 'Comfortable meditation cushion filled with buckwheat hulls',
    image: '🪑',
    tags: ['meditation', 'comfort', 'buckwheat', 'wellness', 'mindfulness'],
    benefits: ['comfort', 'posture-support', 'mindfulness', 'relaxation'],
    materials: ['buckwheat-hulls', 'cotton-cover'],
    is_organic: true,
    rating: 4.5,
    reviews: 178,
    supplier: 'Zen Living Co.',
    sku: 'ZLC-MC-023',
    brand: 'Zen Living',
    origin: 'India',
    color: 'Natural',
    size: 'Medium',
    contraindications: ['buckwheat-allergies'],
    affordances: ['wellness', 'meditation', 'relaxation', 'mindfulness', 'comfort']
  },
  {
    id: 'P024',
    name: 'Herbal Sleep Tea',
    category: 'Beverages',
    price: 15.99,
    stock: 123,
    description: 'Blend of chamomile, lavender, and valerian for better sleep',
    image: '🌙',
    tags: ['sleep', 'herbal', 'chamomile', 'lavender', 'organic', 'natural'],
    benefits: ['sleep-support', 'relaxation', 'natural', 'caffeine-free'],
    materials: ['chamomile', 'lavender', 'valerian', 'organic'],
    is_organic: true,
    rating: 4.4,
    reviews: 267,
    supplier: 'SleepWell Teas',
    sku: 'SWT-ST-024',
    brand: 'SleepWell',
    origin: 'Germany',
    size: '50g',
    type: 'Herbal Tea',
    contraindications: ['pregnancy', 'medication-interactions'],
    affordances: ['wellness', 'sleep-support', 'organic', 'natural', 'relaxation']
  }
];

// Product filtering functions
export function filterProducts(filters) {
  let filtered = [...enhancedProducts];
  
  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category);
  }
  
  if (filters.is_organic !== undefined) {
    filtered = filtered.filter(p => p.is_organic === filters.is_organic);
  }
  
  if (filters.maxPrice) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice);
  }
  
  if (filters.minRating) {
    filtered = filtered.filter(p => p.rating >= filters.minRating);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(p => 
      filters.tags.some(tag => p.tags.includes(tag))
    );
  }
  
  if (filters.affordances && filters.affordances.length > 0) {
    filtered = filtered.filter(p => 
      filters.affordances.some(affordance => p.affordances.includes(affordance))
    );
  }
  
  return filtered;
}

// BM25-style scoring
export function calculateBM25Score(product, query, affordances) {
  const queryTerms = query.toLowerCase().split(' ');
  const productText = [
    product.name,
    product.description,
    ...product.tags,
    ...product.benefits,
    ...product.affordances
  ].join(' ').toLowerCase();
  
  let score = 0;
  
  // Exact matches in name and description get higher scores
  queryTerms.forEach(term => {
    if (product.name.toLowerCase().includes(term)) score += 3;
    if (product.description.toLowerCase().includes(term)) score += 2;
    if (product.tags.includes(term)) score += 1;
    if (product.affordances.includes(term)) score += 1.5;
  });
  
  // Affordance matches get bonus points
  affordances.forEach(affordance => {
    if (product.affordances.includes(affordance)) score += 2;
  });
  
  return score;
}

// Business signals scoring
export function calculateBusinessScore(product) {
  let score = 0;
  
  // Stock availability
  if (product.stock > 20) score += 1;
  else if (product.stock > 10) score += 0.5;
  else if (product.stock < 5) score -= 1;
  
  // Rating
  score += product.rating * 0.5;
  
  // Review count (social proof)
  if (product.reviews > 1000) score += 1;
  else if (product.reviews > 500) score += 0.5;
  else if (product.reviews > 100) score += 0.2;
  
  // Price positioning
  if (product.price > 10000) score += 0.5; // Ultra-luxury bonus
  else if (product.price > 1000) score += 0.3; // Luxury bonus
  
  return score;
}

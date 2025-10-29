// Normalized Product Catalog - Single Source of Truth
// Based on ChatGPT's recommended schema for production-grade shopping AI

export const normalizedProductCatalog = [
  {
    sku: "CH-CFB-MED-BLK",
    title: "Chanel Classic Flap Bag Medium",
    brand: "Chanel",
    category: ["Fashion", "Bags", "Handbags"],
    price: { amount: 38500, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Lambskin Leather",
      color: "Black",
      gender: "Women",
      collection: "Classic",
      size: "Medium",
      hardware: "Gold-tone"
    },
    badges: ["iconic", "high_resale", "investment"],
    images: ["👜"],
    urls: { pdp: "/products/chanel-classic-flap-bag" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Iconic quilted lambskin leather handbag with chain strap and CC lock. The most coveted handbag in the world.",
    tags: ["luxury", "chanel", "handbag", "classic", "investment", "timeless"],
    rating: 4.9,
    reviews: 120
  },
  {
    sku: "LV-NEVERFULL-MM-DA",
    title: "Louis Vuitton Neverfull MM",
    brand: "Louis Vuitton",
    category: ["Fashion", "Bags", "Tote"],
    price: { amount: 12500, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Coated Canvas",
      color: "Damier Azur",
      gender: "Women",
      collection: "Classic",
      size: "MM"
    },
    badges: ["iconic", "versatile", "spacious"],
    images: ["🛍️"],
    urls: { pdp: "/products/louis-vuitton-neverfull-mm" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Spacious and chic handbag perfect for everyday use or travel.",
    tags: ["luxury", "louis-vuitton", "tote", "spacious", "versatile"],
    rating: 4.7,
    reviews: 89
  },
  {
    sku: "HM-BIRKIN-30-BLK",
    title: "Hermès Birkin 30",
    brand: "Hermès",
    category: ["Fashion", "Bags", "Handbags"],
    price: { amount: 55000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Togo Leather",
      color: "Black",
      gender: "Women",
      collection: "Birkin",
      size: "30cm"
    },
    badges: ["exclusive", "investment", "waitlist"],
    images: ["👜"],
    urls: { pdp: "/products/hermes-birkin-30" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Experience ultimate luxury with an investment piece that exudes exclusivity and craftsmanship.",
    tags: ["luxury", "hermes", "birkin", "exclusive", "investment"],
    rating: 4.8,
    reviews: 45
  },
  {
    sku: "RLX-SUBMARINER-DATE",
    title: "Rolex Submariner Date",
    brand: "Rolex",
    category: ["Watches", "Luxury Watches", "Diving"],
    price: { amount: 45000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Stainless Steel",
      color: "Black",
      gender: "Unisex",
      collection: "Professional",
      movement: "Automatic",
      water_resistance: "300m"
    },
    badges: ["iconic", "investment", "professional"],
    images: ["⌚"],
    urls: { pdp: "/products/rolex-submariner-date" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Investment-worthy and precise, this automatic watch is a status symbol for the discerning individual.",
    tags: ["luxury", "rolex", "submariner", "diving", "automatic"],
    rating: 4.9,
    reviews: 156
  },
  {
    sku: "LM-CONCENTRATE-30ML",
    title: "La Mer The Concentrate",
    brand: "La Mer",
    category: ["Skincare", "Anti-Aging", "Serums"],
    price: { amount: 3200, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      skin_type: "All",
      concern: "Anti-Aging",
      size: "30ml",
      texture: "Serum"
    },
    badges: ["luxury", "anti-aging", "premium"],
    images: ["💎"],
    urls: { pdp: "/products/la-mer-concentrate" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Experience the power of premium ingredients and visible results with this anti-aging serum.",
    tags: ["luxury", "la-mer", "skincare", "anti-aging", "serum"],
    rating: 4.7,
    reviews: 203
  },
  {
    sku: "SK-II-FTE-230ML",
    title: "SK-II Facial Treatment Essence",
    brand: "SK-II",
    category: ["Skincare", "Essence", "Anti-Aging"],
    price: { amount: 1800, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      skin_type: "All",
      concern: "Anti-Aging",
      size: "230ml",
      texture: "Essence"
    },
    badges: ["luxury", "japanese", "essence"],
    images: ["✨"],
    urls: { pdp: "/products/sk-ii-essence" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "The iconic Japanese essence with Pitera™ for radiant, youthful-looking skin. A cult-favorite luxury skincare essential.",
    tags: ["luxury", "sk-ii", "skincare", "essence", "japanese"],
    rating: 4.8,
    reviews: 234
  },
  {
    sku: "CHANEL-SUBLIMAGE-50ML",
    title: "Chanel Sublimage La Crème",
    brand: "Chanel",
    category: ["Skincare", "Moisturizer", "Anti-Aging"],
    price: { amount: 2800, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      skin_type: "Dry",
      concern: "Anti-Aging",
      size: "50ml",
      texture: "Cream"
    },
    badges: ["luxury", "chanel", "premium"],
    images: ["🌹"],
    urls: { pdp: "/products/chanel-sublimage" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Ultra-luxurious anti-aging cream with vanilla planifolia extract for deeply nourished, radiant skin.",
    tags: ["luxury", "chanel", "skincare", "moisturizer", "anti-aging"],
    rating: 4.7,
    reviews: 189
  },
  {
    sku: "BG-SERPENTI-ROSE-GOLD",
    title: "Bulgari Serpenti",
    brand: "Bulgari",
    category: ["Jewelry", "Necklaces", "Luxury"],
    price: { amount: 25000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "18k Rose Gold",
      color: "Rose Gold",
      gender: "Women",
      collection: "Serpenti",
      stones: "Diamonds"
    },
    badges: ["iconic", "statement", "diamonds"],
    images: ["🐍"],
    urls: { pdp: "/products/bulgari-serpenti" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Iconic snake necklace with diamond accents and rose gold. A statement piece of luxury jewelry.",
    tags: ["luxury", "bulgari", "serpenti", "diamonds", "rose-gold"],
    rating: 4.7,
    reviews: 89
  },
  {
    sku: "AA-DEEP-RELAX-55ML",
    title: "Aromatherapy Associates Deep Relax Bath & Shower Oil",
    brand: "Aromatherapy Associates",
    category: ["Wellness", "Spa & Relaxation", "Bath"],
    price: { amount: 850, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      size: "55ml",
      type: "Bath Oil",
      scent: "Lavender & Chamomile",
      organic: true
    },
    badges: ["organic", "relaxation", "spa"],
    images: ["🛁"],
    urls: { pdp: "/products/aromatherapy-deep-relax" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Luxury aromatherapy bath oil with essential oils for deep relaxation and stress relief.",
    tags: ["wellness", "aromatherapy", "relaxation", "bath", "organic"],
    rating: 4.6,
    reviews: 78
  },
  {
    sku: "JM-LIME-BASIL-CANDLE-200G",
    title: "Jo Malone London Lime Basil & Mandarin Candle",
    brand: "Jo Malone London",
    category: ["Wellness", "Home Fragrance", "Candles"],
    price: { amount: 650, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      size: "200g",
      type: "Candle",
      scent: "Lime Basil & Mandarin",
      burn_time: "45 hours"
    },
    badges: ["luxury", "home-fragrance", "long-lasting"],
    images: ["🕯️"],
    urls: { pdp: "/products/jo-malone-lime-basil-candle" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Luxury scented candle with refreshing lime, basil, and mandarin notes for home wellness.",
    tags: ["wellness", "jo-malone", "candle", "home-fragrance", "lime-basil"],
    rating: 4.7,
    reviews: 92
  },
  {
    sku: "TW-DEEP-SLEEP-SPRAY-75ML",
    title: "This Works Deep Sleep Pillow Spray",
    brand: "This Works",
    category: ["Wellness", "Sleep & Relaxation", "Sprays"],
    price: { amount: 420, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      size: "75ml",
      type: "Pillow Spray",
      scent: "Lavender & Chamomile",
      organic: true
    },
    badges: ["organic", "sleep-aid", "natural"],
    images: ["💤"],
    urls: { pdp: "/products/this-works-deep-sleep" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Luxury pillow spray with lavender and chamomile for better sleep and relaxation.",
    tags: ["wellness", "sleep", "relaxation", "lavender", "organic"],
    rating: 4.5,
    reviews: 156
  }
];

// Helper functions for the normalized catalog
export function getProductsByCategory(category) {
  return normalizedProductCatalog.filter(product => 
    product.category.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
  );
}

export function getProductsByBrand(brand) {
  return normalizedProductCatalog.filter(product => 
    product.brand.toLowerCase().includes(brand.toLowerCase())
  );
}

export function getProductsByPriceRange(minPrice, maxPrice) {
  return normalizedProductCatalog.filter(product => 
    product.price.amount >= minPrice && product.price.amount <= maxPrice
  );
}

export function getProductsInStock() {
  return normalizedProductCatalog.filter(product => 
    product.availability.in_stock && product.availability.region.includes("UAE")
  );
}

export function searchProducts(query) {
  const searchTerms = query.toLowerCase().split(/\s+/);
  return normalizedProductCatalog.filter(product => {
    const searchableText = [
      product.title,
      product.brand,
      product.description,
      ...product.tags,
      ...product.category
    ].join(' ').toLowerCase();
    
    return searchTerms.some(term => searchableText.includes(term));
  });
}

export function getProductBySku(sku) {
  return normalizedProductCatalog.find(product => product.sku === sku);
}

export default normalizedProductCatalog;

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
  },
  {
    sku: "GUCCI-GG-MARMONT-MED",
    title: "Gucci GG Marmont Matelassé Shoulder Bag",
    brand: "Gucci",
    category: ["Fashion", "Bags", "Handbags"],
    price: { amount: 21500, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Calfskin Leather",
      color: "Black",
      gender: "Women",
      collection: "GG Marmont",
      size: "Medium"
    },
    badges: ["iconic", "trendy", "versatile"],
    images: ["👜"],
    urls: { pdp: "/products/gucci-gg-marmont" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Sophisticated quilted shoulder bag with iconic GG hardware. A timeless Gucci classic.",
    tags: ["luxury", "gucci", "handbag", "marmont", "quilted"],
    rating: 4.6,
    reviews: 145
  },
  {
    sku: "DIOR-LADY-DIOR-MED",
    title: "Dior Lady Dior Medium",
    brand: "Dior",
    category: ["Fashion", "Bags", "Handbags"],
    price: { amount: 32000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Cannage Lambskin",
      color: "Black",
      gender: "Women",
      collection: "Lady Dior",
      size: "Medium"
    },
    badges: ["iconic", "elegant", "heritage"],
    images: ["👜"],
    urls: { pdp: "/products/dior-lady-dior" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "The iconic Lady Dior bag with signature Cannage pattern and 'D.I.O.R' charms. A symbol of Parisian elegance.",
    tags: ["luxury", "dior", "handbag", "lady-dior", "cannage"],
    rating: 4.8,
    reviews: 98
  },
  {
    sku: "PRADA-GALLERIA-SAFFIANO",
    title: "Prada Galleria Saffiano Leather Bag",
    brand: "Prada",
    category: ["Fashion", "Bags", "Handbags"],
    price: { amount: 18500, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Saffiano Leather",
      color: "Black",
      gender: "Women",
      collection: "Galleria",
      size: "Medium"
    },
    badges: ["classic", "professional", "durable"],
    images: ["👜"],
    urls: { pdp: "/products/prada-galleria" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Elegant Saffiano leather bag with triangular logo plaque. Perfect for work or weekend.",
    tags: ["luxury", "prada", "handbag", "saffiano", "professional"],
    rating: 4.7,
    reviews: 112
  },
  {
    sku: "CARTIER-SANTOS-WATCH",
    title: "Cartier Santos de Cartier Watch",
    brand: "Cartier",
    category: ["Watches", "Luxury Watches", "Classic"],
    price: { amount: 28000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Stainless Steel",
      color: "Silver",
      gender: "Unisex",
      collection: "Santos",
      movement: "Automatic",
      water_resistance: "100m"
    },
    badges: ["iconic", "elegant", "heritage"],
    images: ["⌚"],
    urls: { pdp: "/products/cartier-santos" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "The first wristwatch created by Cartier. A timeless classic with square case and exposed screws.",
    tags: ["luxury", "cartier", "santos", "classic", "automatic"],
    rating: 4.8,
    reviews: 203
  },
  {
    sku: "OMEGA-SPEEDMASTER-MOONWATCH",
    title: "Omega Speedmaster Moonwatch",
    brand: "Omega",
    category: ["Watches", "Luxury Watches", "Chronograph"],
    price: { amount: 22000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Stainless Steel",
      color: "Black",
      gender: "Unisex",
      collection: "Speedmaster",
      movement: "Manual Winding",
      water_resistance: "50m"
    },
    badges: ["iconic", "heritage", "space"],
    images: ["⌚"],
    urls: { pdp: "/products/omega-speedmaster" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "The legendary watch worn on the moon. Professional chronograph with tachymeter bezel.",
    tags: ["luxury", "omega", "speedmaster", "moonwatch", "chronograph"],
    rating: 4.9,
    reviews: 278
  },
  {
    sku: "TIFFANY-HEART-TAG-NECKLACE",
    title: "Tiffany & Co. Heart Tag Pendant",
    brand: "Tiffany & Co.",
    category: ["Jewelry", "Necklaces", "Pendants"],
    price: { amount: 18000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "18k Yellow Gold",
      color: "Yellow Gold",
      gender: "Women",
      collection: "Return to Tiffany",
      stones: "None"
    },
    badges: ["iconic", "sentimental", "classic"],
    images: ["💎"],
    urls: { pdp: "/products/tiffany-heart-tag" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "The iconic Return to Tiffany heart tag pendant in 18k yellow gold. A beloved classic.",
    tags: ["luxury", "tiffany", "necklace", "heart", "gold"],
    rating: 4.6,
    reviews: 167
  },
  {
    sku: "CARTIER-LOVE-BRACELET",
    title: "Cartier Love Bracelet",
    brand: "Cartier",
    category: ["Jewelry", "Bracelets", "Luxury"],
    price: { amount: 35000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "18k Yellow Gold",
      color: "Yellow Gold",
      gender: "Unisex",
      collection: "Love",
      stones: "None"
    },
    badges: ["iconic", "symbolic", "investment"],
    images: ["💎"],
    urls: { pdp: "/products/cartier-love-bracelet" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "The legendary Love bracelet with screw motifs. A symbol of eternal love and commitment.",
    tags: ["luxury", "cartier", "bracelet", "love", "gold"],
    rating: 4.9,
    reviews: 312
  },
  {
    sku: "VCA-ALHAMBRA-NECKLACE",
    title: "Van Cleef & Arpels Alhambra Vintage Necklace",
    brand: "Van Cleef & Arpels",
    category: ["Jewelry", "Necklaces", "Luxury"],
    price: { amount: 42000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "18k Yellow Gold",
      color: "Yellow Gold",
      gender: "Women",
      collection: "Alhambra",
      stones: "Mother of Pearl"
    },
    badges: ["iconic", "elegant", "heritage"],
    images: ["💎"],
    urls: { pdp: "/products/vca-alhambra" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "The iconic four-leaf clover motif in mother of pearl and yellow gold. A timeless symbol of luck and elegance.",
    tags: ["luxury", "van-cleef-arpels", "necklace", "alhambra", "mother-of-pearl"],
    rating: 4.8,
    reviews: 145
  },
  {
    sku: "LP-CELLULAR-PLATINUM-CREAM-50ML",
    title: "La Prairie Cellular Platinum Rare Haute-Rejuvenation Protocol",
    brand: "La Prairie",
    category: ["Skincare", "Moisturizer", "Anti-Aging"],
    price: { amount: 8500, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      skin_type: "All",
      concern: "Anti-Aging",
      size: "50ml",
      texture: "Cream"
    },
    badges: ["luxury", "premium", "platinum"],
    images: ["✨"],
    urls: { pdp: "/products/la-prairie-platinum" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Ultra-premium anti-aging cream with platinum complex and cellular extracts for ultimate rejuvenation.",
    tags: ["luxury", "la-prairie", "skincare", "moisturizer", "platinum"],
    rating: 4.8,
    reviews: 89
  },
  {
    sku: "SISLEY-BLACK-ROSE-CREAM-50ML",
    title: "Sisley Paris Black Rose Cream Mask",
    brand: "Sisley",
    category: ["Skincare", "Masks", "Hydrating"],
    price: { amount: 2800, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      skin_type: "Dry",
      concern: "Hydration",
      size: "50ml",
      texture: "Mask"
    },
    badges: ["luxury", "hydrating", "rose"],
    images: ["🌹"],
    urls: { pdp: "/products/sisley-black-rose" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Intensive hydrating mask with black rose extract for instant radiance and plumping effect.",
    tags: ["luxury", "sisley", "skincare", "mask", "hydrating"],
    rating: 4.7,
    reviews: 156
  },
  {
    sku: "LA-MER-THE-MOISTURIZER-60ML",
    title: "La Mer The Moisturizing Cream",
    brand: "La Mer",
    category: ["Skincare", "Moisturizer", "Luxury"],
    price: { amount: 4200, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      skin_type: "Dry",
      concern: "Hydration",
      size: "60ml",
      texture: "Cream"
    },
    badges: ["luxury", "iconic", "miracle-broth"],
    images: ["💎"],
    urls: { pdp: "/products/la-mer-moisturizer" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "The iconic cream with Miracle Broth™. Deeply hydrates and transforms skin with legendary ingredients.",
    tags: ["luxury", "la-mer", "skincare", "moisturizer", "cream"],
    rating: 4.9,
    reviews: 456
  },
  {
    sku: "TOM-FORD-BLACK-ORCHID-50ML",
    title: "Tom Ford Black Orchid Eau de Parfum",
    brand: "Tom Ford",
    category: ["Fragrance", "Perfume", "Luxury"],
    price: { amount: 2800, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      size: "50ml",
      type: "Eau de Parfum",
      scent: "Oriental Floral",
      gender: "Unisex"
    },
    badges: ["luxury", "iconic", "sensual"],
    images: ["🌸"],
    urls: { pdp: "/products/tom-ford-black-orchid" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Luxurious and intoxicating fragrance with black orchid, truffle, and dark chocolate notes.",
    tags: ["luxury", "tom-ford", "fragrance", "perfume", "black-orchid"],
    rating: 4.7,
    reviews: 234
  },
  {
    sku: "CREED-AVENTUS-100ML",
    title: "Creed Aventus Cologne",
    brand: "Creed",
    category: ["Fragrance", "Cologne", "Luxury"],
    price: { amount: 3200, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      size: "100ml",
      type: "Eau de Parfum",
      scent: "Fruity Woody",
      gender: "Men"
    },
    badges: ["luxury", "iconic", "powerful"],
    images: ["🌸"],
    urls: { pdp: "/products/creed-aventus" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Legendary fragrance with pineapple, blackcurrant, and birch. A modern classic for the confident man.",
    tags: ["luxury", "creed", "fragrance", "cologne", "aventus"],
    rating: 4.8,
    reviews: 389
  },
  {
    sku: "BYREDO-BLANCHE-CANDLE-240G",
    title: "Byredo Blanche Candle",
    brand: "Byredo",
    category: ["Wellness", "Home Fragrance", "Candles"],
    price: { amount: 1200, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      size: "240g",
      type: "Candle",
      scent: "White Flowers & Musk",
      burn_time: "60 hours"
    },
    badges: ["luxury", "minimalist", "long-lasting"],
    images: ["🕯️"],
    urls: { pdp: "/products/byredo-blanche" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Minimalist luxury candle with clean white floral notes. Creates an elegant and serene atmosphere.",
    tags: ["wellness", "byredo", "candle", "home-fragrance", "minimalist"],
    rating: 4.6,
    reviews: 98
  },
  {
    sku: "DIOR-SADDLE-BAG-MED",
    title: "Dior Saddle Bag Medium",
    brand: "Dior",
    category: ["Fashion", "Bags", "Handbags"],
    price: { amount: 38000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Calfskin Leather",
      color: "Black",
      gender: "Women",
      collection: "Saddle",
      size: "Medium"
    },
    badges: ["iconic", "trendy", "statement"],
    images: ["👜"],
    urls: { pdp: "/products/dior-saddle" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "The iconic Saddle bag with distinctive curved shape and D-ring hardware. A modern Dior classic.",
    tags: ["luxury", "dior", "handbag", "saddle", "trendy"],
    rating: 4.7,
    reviews: 134
  },
  {
    sku: "BVLGARI-SERPENTI-WATCH",
    title: "Bulgari Serpenti Tubogas Watch",
    brand: "Bulgari",
    category: ["Watches", "Luxury Watches", "Fashion"],
    price: { amount: 32000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "18k Rose Gold",
      color: "Rose Gold",
      gender: "Women",
      collection: "Serpenti",
      movement: "Quartz",
      water_resistance: "30m"
    },
    badges: ["iconic", "artistic", "statement"],
    images: ["⌚"],
    urls: { pdp: "/products/bulgari-serpenti-watch" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Artistic timepiece with serpent-inspired Tubogas bracelet in rose gold. A masterpiece of design.",
    tags: ["luxury", "bulgari", "serpenti", "watch", "tubogas"],
    rating: 4.8,
    reviews: 167
  },
  {
    sku: "HERMES-KELLY-28-ETOUPE",
    title: "Hermès Kelly 28",
    brand: "Hermès",
    category: ["Fashion", "Bags", "Handbags"],
    price: { amount: 68000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Togo Leather",
      color: "Étoupe",
      gender: "Women",
      collection: "Kelly",
      size: "28cm"
    },
    badges: ["exclusive", "investment", "heritage"],
    images: ["👜"],
    urls: { pdp: "/products/hermes-kelly-28" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "The legendary Kelly bag in elegant Étoupe. The ultimate symbol of luxury and exclusivity.",
    tags: ["luxury", "hermes", "kelly", "exclusive", "investment"],
    rating: 4.9,
    reviews: 67
  },
  {
    sku: "DIOR-ROSE-DIOR-BAG",
    title: "Dior Rose Dior Bag",
    brand: "Dior",
    category: ["Fashion", "Bags", "Handbags"],
    price: { amount: 29000, currency: "AED" },
    availability: { region: ["UAE"], in_stock: true },
    attributes: {
      material: "Cannage Lambskin",
      color: "Pink",
      gender: "Women",
      collection: "Rose Dior",
      size: "Medium"
    },
    badges: ["feminine", "elegant", "romantic"],
    images: ["👜"],
    urls: { pdp: "/products/dior-rose-dior" },
    compliance: { age_restricted: false },
    updated_at: "2025-10-29T09:12:00Z",
    description: "Feminine bag with rose embroidery on Cannage pattern. A delicate and romantic design.",
    tags: ["luxury", "dior", "handbag", "rose", "feminine"],
    rating: 4.6,
    reviews: 89
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

// Working Production Recommendation API
// Fixed version with proper error handling and simplified logic

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, quickReply, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`🎯 Working Production API: Processing "${message}" with context:`, context);
    
    // Import the normalized catalog
    const { normalizedProductCatalog } = await import('../../../data/normalizedProductCatalog.js');
    
    if (!normalizedProductCatalog || !Array.isArray(normalizedProductCatalog)) {
      throw new Error('Product catalog not available');
    }
    
    // Simple product filtering based on query
    let filteredProducts = normalizedProductCatalog;
    
    // Context-aware quick reply handling
    const currentContext = context || {};
    const lastCategory = currentContext.lastCategory || null;
    
    if (quickReply || /^[1-4]$/.test(message)) {
      const quickReplyNumber = parseInt(message);
      console.log(`📱 Quick reply detected: ${quickReplyNumber} in context: ${lastCategory}`);
      
      // Context-aware mappings
      let mappings = {};
      
      if (lastCategory === 'wellness') {
        mappings = {
          1: { category: "Wellness", query: "more wellness products", brands: ["Aromatherapy Associates", "Jo Malone", "This Works"] },
          2: { category: "Skincare", query: "skincare products", brands: ["La Mer", "SK-II", "Chanel"] },
          3: { query: "all luxury products", brands: ["Chanel", "Hermès", "Louis Vuitton", "Rolex", "Bulgari"] }
        };
      } else if (lastCategory === 'skincare') {
        mappings = {
          1: { category: "Skincare", query: "more skincare products", brands: ["La Mer", "SK-II", "Chanel"] },
          2: { category: "Wellness", query: "wellness products", brands: ["Aromatherapy Associates", "Jo Malone", "This Works"] },
          3: { query: "all luxury products", brands: ["Chanel", "Hermès", "Louis Vuitton", "Rolex", "Bulgari"] }
        };
      } else if (lastCategory === 'bags' || lastCategory === 'fashion') {
        mappings = {
          1: { category: "Fashion", subcategory: "Bags", query: "more luxury handbags", brands: ["Chanel", "Hermès", "Louis Vuitton", "Gucci"] },
          2: { category: "Fashion", query: "luxury accessories", brands: ["Chanel", "Hermès", "Louis Vuitton", "Gucci"] },
          3: { query: "all luxury products", brands: ["Chanel", "Hermès", "Louis Vuitton", "Rolex", "Bulgari"] }
        };
      } else if (lastCategory === 'watches') {
        mappings = {
          1: { category: "Watches", query: "more luxury watches", brands: ["Rolex", "Cartier", "Omega"] },
          2: { category: "Jewelry", query: "luxury jewelry", brands: ["Bulgari", "Cartier", "Tiffany"] },
          3: { query: "all luxury products", brands: ["Chanel", "Hermès", "Louis Vuitton", "Rolex", "Bulgari"] }
        };
      } else {
        // Default mappings for new conversations
        mappings = {
          1: { category: "Fashion", subcategory: "Bags", query: "luxury handbags", brands: ["Chanel", "Hermès", "Louis Vuitton", "Gucci"] },
          2: { category: "Skincare", query: "luxury skincare", brands: ["La Mer", "SK-II", "Chanel"] },
          3: { category: "Wellness", query: "wellness relaxation", brands: ["Aromatherapy Associates", "Jo Malone", "This Works"] },
          4: { query: "luxury products", brands: ["Chanel", "Hermès", "Louis Vuitton", "Rolex", "Bulgari"] }
        };
      }
      
      const mapping = mappings[quickReplyNumber];
      if (mapping) {
        console.log(`🎯 Context-aware mapping:`, mapping);
        
        if (mapping.category) {
          // Filter by category first
          filteredProducts = normalizedProductCatalog.filter(product => {
            if (mapping.subcategory) {
              // For bags, look for products that have both "Fashion" and "Bags" in categories
              return product.category.some(cat => cat.toLowerCase().includes(mapping.category.toLowerCase())) &&
                     product.category.some(cat => cat.toLowerCase().includes(mapping.subcategory.toLowerCase()));
            } else {
              return product.category.some(cat => cat.toLowerCase().includes(mapping.category.toLowerCase()));
            }
          });
          
          // If no products found by category, try by brand
          if (filteredProducts.length === 0 && mapping.brands) {
            console.log(`🔍 No products found by category, trying brands:`, mapping.brands);
            filteredProducts = normalizedProductCatalog.filter(product => 
              mapping.brands.some(brand => 
                product.brand.toLowerCase().includes(brand.toLowerCase())
              )
            );
          }
          
          console.log(`🔍 Filtered products for ${mapping.category}: ${filteredProducts.length}`);
        } else if (mapping.brands) {
          // Filter by brands for "show everything"
          filteredProducts = normalizedProductCatalog.filter(product => 
            mapping.brands.some(brand => 
              product.brand.toLowerCase().includes(brand.toLowerCase())
            )
          );
          console.log(`🔍 Filtered products by brands: ${filteredProducts.length}`);
        }
      }
    } else {
      // Text-based filtering
      const queryLower = message.toLowerCase();
      
      if (queryLower.includes('bags') || queryLower.includes('handbags')) {
        filteredProducts = normalizedProductCatalog.filter(product => 
          product.category.some(cat => cat.toLowerCase().includes('bags')) ||
          product.subcategory && product.subcategory.toLowerCase().includes('handbags')
        );
      } else if (queryLower.includes('skincare') || queryLower.includes('beauty')) {
        filteredProducts = normalizedProductCatalog.filter(product => 
          product.category.some(cat => cat.toLowerCase().includes('skincare'))
        );
      } else if (queryLower.includes('wellness') || queryLower.includes('spa')) {
        filteredProducts = normalizedProductCatalog.filter(product => 
          product.category.some(cat => cat.toLowerCase().includes('wellness'))
        );
      } else if (queryLower.includes('watches')) {
        filteredProducts = normalizedProductCatalog.filter(product => 
          product.category.some(cat => cat.toLowerCase().includes('watches'))
        );
      } else if (queryLower.includes('jewelry')) {
        filteredProducts = normalizedProductCatalog.filter(product => 
          product.category.some(cat => cat.toLowerCase().includes('jewelry'))
        );
      }
    }
    
    // Take top 3 products
    const topProducts = filteredProducts.slice(0, 3);
    
    // Determine current category for context
    let currentCategory = lastCategory;
    
    // For quick replies, determine category based on the mapping
    if (quickReply || /^[1-4]$/.test(message)) {
      const quickReplyNumber = parseInt(message);
      
      // Determine category based on context and quick reply
      if (lastCategory === 'wellness') {
        if (quickReplyNumber === 1) currentCategory = 'wellness';
        else if (quickReplyNumber === 2) currentCategory = 'skincare';
        else if (quickReplyNumber === 3) currentCategory = null; // Show all
      } else if (lastCategory === 'skincare') {
        if (quickReplyNumber === 1) currentCategory = 'skincare';
        else if (quickReplyNumber === 2) currentCategory = 'wellness';
        else if (quickReplyNumber === 3) currentCategory = null; // Show all
      } else if (lastCategory === 'bags' || lastCategory === 'fashion') {
        if (quickReplyNumber === 1) currentCategory = 'bags';
        else if (quickReplyNumber === 2) currentCategory = 'fashion';
        else if (quickReplyNumber === 3) currentCategory = null; // Show all
      } else if (lastCategory === 'watches') {
        if (quickReplyNumber === 1) currentCategory = 'watches';
        else if (quickReplyNumber === 2) currentCategory = 'jewelry';
        else if (quickReplyNumber === 3) currentCategory = null; // Show all
      } else {
        // Default mappings for new conversations
        if (quickReplyNumber === 1) currentCategory = 'bags';
        else if (quickReplyNumber === 2) currentCategory = 'skincare';
        else if (quickReplyNumber === 3) currentCategory = 'wellness';
        else if (quickReplyNumber === 4) currentCategory = null; // Show all
      }
      
      // For "show all" (currentCategory = null), maintain the previous category context
      if (currentCategory === null && lastCategory) {
        currentCategory = lastCategory;
      }
      
      // Special case: when selecting wellness (3) from any context, set to wellness
      if (quickReplyNumber === 3 && lastCategory !== 'wellness') {
        currentCategory = 'wellness';
      }
    } else if (topProducts.length > 0) {
      // For text queries, determine category from products
      const firstProduct = topProducts[0];
      if (firstProduct.category.some(cat => cat.toLowerCase().includes('wellness'))) {
        currentCategory = 'wellness';
      } else if (firstProduct.category.some(cat => cat.toLowerCase().includes('skincare'))) {
        currentCategory = 'skincare';
      } else if (firstProduct.category.some(cat => cat.toLowerCase().includes('bags'))) {
        currentCategory = 'bags';
      } else if (firstProduct.category.some(cat => cat.toLowerCase().includes('watches'))) {
        currentCategory = 'watches';
      } else if (firstProduct.category.some(cat => cat.toLowerCase().includes('jewelry'))) {
        currentCategory = 'jewelry';
      }
    }
    
    // Generate response with quick reply context
    const quickReplyNumber = quickReply || (/^[1-4]$/.test(message) ? parseInt(message) : null);
    const response = {
      success: true,
      naturalResponse: {
        opening: generateOpening(message, topProducts.length, quickReplyNumber, currentCategory),
        items: topProducts.map(product => ({
          id: product.sku,
          headline: product.title,
          one_liner: `${product.description.substring(0, 60)}... - ${product.price.amount} ${product.price.currency}`,
          price: `${product.price.amount} ${product.price.currency}`,
          brand: product.brand,
          category: product.category[0],
          sku: product.sku,
          rating: product.rating,
          badges: product.badges.slice(0, 2),
          image: product.images[0] || "🛍️"
        })),
        cta: "Which product interests you most?",
        quick_replies: generateQuickReplies(message, topProducts, quickReplyNumber, currentCategory),
        metadata: {
          totalProducts: filteredProducts.length,
          displayedProducts: topProducts.length,
          region: "UAE",
          currency: "AED",
          timestamp: new Date().toISOString(),
          context: {
            lastCategory: currentCategory, // Use the determined category
            conversationId: context?.conversationId || `conv_${Date.now()}`
          }
        }
      },
      metadata: {
        processingTime: 5,
        filteredCount: filteredProducts.length,
        displayedCount: topProducts.length
      },
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Working Production API: Completed successfully`);
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Working Production API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      naturalResponse: {
        opening: "I'm sorry, I encountered an error. Please try again.",
        items: [],
        cta: "How can I help you?",
        quick_replies: ["Search products", "Get help", "Contact us"]
      },
      metadata: {
        processingTime: 0,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
}

// Helper functions
function generateOpening(query, productCount, quickReplyNumber = null, currentCategory = null) {
  const queryLower = query.toLowerCase();
  
  // Handle quick replies with context awareness
  if (quickReplyNumber) {
    if (currentCategory === 'wellness') {
      const wellnessMessages = {
        1: "Here are more wellness products for your relaxation and well-being.",
        2: "Let me show you some luxury skincare products that complement your wellness routine.",
        3: "Explore our complete luxury collection across all categories."
      };
      return wellnessMessages[quickReplyNumber] || "Here are more wellness products for you.";
    } else if (currentCategory === 'skincare') {
      const skincareMessages = {
        1: "Here are more luxury skincare products for your beauty routine.",
        2: "Let me show you some wellness products that enhance your skincare routine.",
        3: "Explore our complete luxury collection across all categories."
      };
      return skincareMessages[quickReplyNumber] || "Here are more skincare products for you.";
    } else if (currentCategory === 'bags' || currentCategory === 'fashion') {
      const fashionMessages = {
        1: "Here are more luxury handbags from our collection.",
        2: "Let me show you some luxury accessories to complement your style.",
        3: "Explore our complete luxury collection across all categories."
      };
      return fashionMessages[quickReplyNumber] || "Here are more luxury handbags for you.";
    } else if (currentCategory === 'watches') {
      const watchMessages = {
        1: "Here are more luxury timepieces from our collection.",
        2: "Let me show you some luxury jewelry to complement your watch.",
        3: "Explore our complete luxury collection across all categories."
      };
      return watchMessages[quickReplyNumber] || "Here are more luxury watches for you.";
    } else {
      // Default messages for new conversations
      const defaultMessages = {
        1: "Welcome to our luxury handbag collection! Here are our top picks for you.",
        2: "Welcome to our luxury skincare collection! Premium beauty products for you.",
        3: "Discover our wellness collection! Luxury products for your well-being.",
        4: "Welcome to our luxury boutique! Here are our finest products across all categories."
      };
      return defaultMessages[quickReplyNumber] || `Welcome to our luxury boutique! We found ${productCount} perfect products for you.`;
    }
  }
  
  if (queryLower.includes('hermes') || queryLower.includes('hermès')) {
    return "Welcome to our Hermès collection! We have exquisite luxury pieces for you.";
  } else if (queryLower.includes('gucci')) {
    return "Discover our Gucci luxury collection! Here are some of our finest pieces.";
  } else if (queryLower.includes('chanel')) {
    return "Explore our Chanel collection! Timeless elegance awaits you.";
  } else if (queryLower.includes('louis vuitton') || queryLower.includes('louis-vuitton')) {
    return "Welcome to Louis Vuitton! Classic luxury and modern style combined.";
  } else if (queryLower.includes('bags') || queryLower.includes('handbags')) {
    return "Welcome to our luxury handbag collection! Here are our top picks for you.";
  } else if (queryLower.includes('watches')) {
    return "Discover our luxury timepieces! Precision meets elegance.";
  } else if (queryLower.includes('jewelry')) {
    return "Explore our luxury jewelry collection! Sparkling elegance awaits.";
  } else if (queryLower.includes('skincare')) {
    return "Welcome to our luxury skincare collection! Premium beauty products for you.";
  } else if (queryLower.includes('wellness')) {
    return "Discover our wellness collection! Luxury products for your well-being.";
  } else {
    return `Welcome to our luxury boutique! We found ${productCount} perfect products for you.`;
  }
}

function generateQuickReplies(query, products, quickReplyNumber = null, currentCategory = null) {
  const queryLower = query.toLowerCase();
  const brands = [...new Set(products.map(p => p.brand))];
  
  // Handle quick replies with context awareness
  if (quickReplyNumber) {
    if (currentCategory === 'wellness') {
      return ["More wellness products", "View skincare items", "Show me everything"];
    } else if (currentCategory === 'skincare') {
      return ["More skincare products", "View wellness items", "Show me everything"];
    } else if (currentCategory === 'bags' || currentCategory === 'fashion') {
      return ["More luxury handbags", "View accessories", "Show me everything"];
    } else if (currentCategory === 'watches') {
      return ["More luxury watches", "View jewelry", "Show me everything"];
    } else {
      // Default options for new conversations
      const quickReplyOptions = {
        1: ["More luxury handbags", "View accessories", "Show me everything"],
        2: ["More skincare products", "View wellness items", "Show me everything"],
        3: ["More wellness products", "View spa items", "Show me everything"],
        4: ["View more products", "Get help", "Contact us"]
      };
      return quickReplyOptions[quickReplyNumber] || ["View more products", "Get help", "Contact us"];
    }
  }
  
  if (brands.length >= 2) {
    return [
      `View ${brands[0]} Collection`,
      `Explore ${brands[1]} Products`,
      "Show me everything"
    ];
  } else if (queryLower.includes('bags')) {
    return [
      "More luxury handbags",
      "View accessories",
      "Show me everything"
    ];
  } else if (queryLower.includes('watches')) {
    return [
      "More luxury watches",
      "View jewelry",
      "Show me everything"
    ];
  } else if (queryLower.includes('skincare')) {
    return [
      "More skincare products",
      "View wellness items",
      "Show me everything"
    ];
  } else if (queryLower.includes('jewelry')) {
    return [
      "More luxury jewelry",
      "View watches",
      "Show me everything"
    ];
  } else {
    return [
      "View more products",
      "Get help",
      "Contact us"
    ];
  }
}

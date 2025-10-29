// Working Production Recommendation API
// Fixed version with proper error handling and simplified logic

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, quickReply } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`🎯 Working Production API: Processing "${message}"`);
    
    // Import the normalized catalog
    const { normalizedProductCatalog } = await import('../../../data/normalizedProductCatalog.js');
    
    if (!normalizedProductCatalog || !Array.isArray(normalizedProductCatalog)) {
      throw new Error('Product catalog not available');
    }
    
    // Simple product filtering based on query
    let filteredProducts = normalizedProductCatalog;
    
    // Quick reply handling
    if (quickReply || /^[1-4]$/.test(message)) {
      const quickReplyNumber = parseInt(message);
      console.log(`📱 Quick reply detected: ${quickReplyNumber}`);
      
      const mappings = {
        1: { category: "Fashion", subcategory: "Bags", query: "luxury handbags" },
        2: { category: "Skincare", query: "luxury skincare" },
        3: { category: "Wellness", query: "wellness relaxation" },
        4: { query: "luxury products" }
      };
      
      const mapping = mappings[quickReplyNumber];
      if (mapping) {
        console.log(`🎯 Mapping:`, mapping);
        if (mapping.category) {
          filteredProducts = normalizedProductCatalog.filter(product => {
            // For bags, look for products that have both "Fashion" and "Bags" in categories
            if (mapping.subcategory) {
              return product.category.some(cat => cat.toLowerCase().includes(mapping.category.toLowerCase())) &&
                     product.category.some(cat => cat.toLowerCase().includes(mapping.subcategory.toLowerCase()));
            } else {
              return product.category.some(cat => cat.toLowerCase().includes(mapping.category.toLowerCase()));
            }
          });
          console.log(`🔍 Filtered products for ${mapping.category}: ${filteredProducts.length}`);
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
    
    // Pre-generate common responses for speed
    const quickReplies = generateQuickReplies(message, topProducts);
    const opening = generateOpening(message, topProducts.length);
    
    // Generate response
    const response = {
      success: true,
      naturalResponse: {
        opening,
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
        quick_replies: quickReplies,
        metadata: {
          totalProducts: filteredProducts.length,
          displayedProducts: topProducts.length,
          region: "UAE",
          currency: "AED",
          timestamp: new Date().toISOString()
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
function generateOpening(query, productCount) {
  const queryLower = query.toLowerCase();
  
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

function generateQuickReplies(query, products) {
  const queryLower = query.toLowerCase();
  const brands = [...new Set(products.map(p => p.brand))];
  
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

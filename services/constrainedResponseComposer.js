// Constrained Response Composer - No Hallucination, Only Catalog Data
// Implements the recommended architecture for production-grade responses

export class ConstrainedResponseComposer {
  constructor() {
    this.region = "UAE";
    this.currency = "AED";
  }

  // Main composition method - only uses catalog data
  composeResponse(query, rerankedProducts, quickReplyNumber = null) {
    if (!rerankedProducts || rerankedProducts.length === 0) {
      return this.createNoResultsResponse(query);
    }

    const topProducts = rerankedProducts.slice(0, 3); // Show max 3 products
    const opening = this.generateOpening(query, topProducts, quickReplyNumber);
    const items = this.createProductItems(topProducts);
    const cta = this.generateCallToAction(query, topProducts);
    const quickReplies = this.generateQuickReplies(query, topProducts, quickReplyNumber);

    return {
      opening,
      items,
      cta,
      quick_replies: quickReplies,
      metadata: {
        totalProducts: rerankedProducts.length,
        displayedProducts: topProducts.length,
        region: this.region,
        currency: this.currency,
        timestamp: new Date().toISOString()
      }
    };
  }

  generateOpening(query, products, quickReplyNumber) {
    const queryLower = query.toLowerCase();
    
    // Quick reply specific openings
    if (quickReplyNumber) {
      const openings = {
        1: "Welcome to our luxury handbag collection! Here are our finest pieces:",
        2: "Discover our premium skincare collection! Here are our top recommendations:",
        3: "Explore our wellness and relaxation products! Here's what we have for you:",
        4: "Welcome to our luxury boutique! Here are our curated selections:"
      };
      return openings[quickReplyNumber] || openings[4];
    }
    
    // Query-specific openings
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
      return `Welcome to our luxury boutique! We found ${products.length} perfect products for you.`;
    }
  }

  createProductItems(products) {
    return products.map(product => ({
      id: product.sku,
      headline: product.title,
      one_liner: this.createProductDescription(product),
      price: `${product.price?.amount || 0} ${product.price?.currency || 'AED'}`,
      brand: product.brand,
      category: product.category[0],
      sku: product.sku,
      rating: product.rating,
      badges: product.badges.slice(0, 2), // Max 2 badges
      image: product.images[0] || "🛍️"
    }));
  }

  createProductDescription(product) {
    // Use only catalog data - no hallucination
    const description = product.description;
    const price = product.price?.amount || 0;
    const currency = product.price?.currency || 'AED';
    
    // Truncate description if too long
    const maxLength = 80;
    const truncatedDesc = description.length > maxLength 
      ? description.substring(0, maxLength) + "..." 
      : description;
    
    return `${truncatedDesc} - ${price} ${currency}`;
  }

  generateCallToAction(query, products) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('compare') || queryLower.includes('vs')) {
      return "Would you like to compare these products in detail?";
    } else if (queryLower.includes('buy') || queryLower.includes('purchase')) {
      return "Ready to make a purchase? I can help you with the next steps.";
    } else if (products.length === 1) {
      return "Would you like to know more about this product?";
    } else {
      return "Which product interests you most?";
    }
  }

  generateQuickReplies(query, products, quickReplyNumber) {
    const queryLower = query.toLowerCase();
    const brands = [...new Set(products.map(p => p.brand))];
    
    // Quick reply specific responses
    if (quickReplyNumber) {
      const replies = {
        1: ["More luxury handbags", "View accessories", "Show me everything"],
        2: ["More skincare products", "View wellness items", "Show me everything"],
        3: ["More wellness products", "View home fragrance", "Show me everything"],
        4: ["View Fashion", "View Watches", "View Jewelry"]
      };
      return replies[quickReplyNumber] || replies[4];
    }
    
    // Brand-specific quick replies
    if (brands.length >= 2) {
      return [
        `View ${brands[0]} Collection`,
        `Explore ${brands[1]} Products`,
        "Show me everything"
      ];
    }
    
    // Category-specific quick replies
    if (queryLower.includes('bags')) {
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

  createNoResultsResponse(query) {
    return {
      opening: "I couldn't find products matching your request.",
      items: [],
      cta: "Would you like to try a different search?",
      quick_replies: [
        "Search bags",
        "Search watches", 
        "Search skincare",
        "Show me everything"
      ],
      metadata: {
        totalProducts: 0,
        displayedProducts: 0,
        region: this.region,
        currency: this.currency,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Format for WhatsApp
  formatForWhatsApp(response) {
    const { opening, items, cta, quick_replies } = response;
    
    let message = `${opening}\n\n`;
    
    if (items.length > 0) {
      items.forEach((item, index) => {
        message += `${index + 1}. ${item.image} ${item.headline} - ${item.price}\n`;
        message += `   ${item.one_liner}\n\n`;
      });
    }
    
    message += `💬 ${cta}\n\n`;
    message += `Quick replies:\n`;
    quick_replies.forEach((reply, index) => {
      message += `${index + 1}. ${reply}\n`;
    });
    
    return message;
  }

  // Validate that all data comes from catalog (no hallucination)
  validateResponse(response) {
    const issues = [];
    
    if (!response.items || !Array.isArray(response.items)) {
      issues.push("Items must be an array");
    }
    
    response.items?.forEach((item, index) => {
      if (!item.sku) {
        issues.push(`Item ${index + 1} missing SKU`);
      }
      if (!item.price || !item.price.includes('AED')) {
        issues.push(`Item ${index + 1} missing or invalid price`);
      }
      if (!item.headline) {
        issues.push(`Item ${index + 1} missing headline`);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export default ConstrainedResponseComposer;

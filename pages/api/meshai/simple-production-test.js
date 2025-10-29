// Simple Production Test API - Minimal Implementation
// To isolate the error and test basic functionality

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`🎯 Simple Production Test: Processing "${message}"`);
    
    // Simple hardcoded response for testing
    const response = {
      success: true,
      naturalResponse: {
        opening: "Welcome to our luxury boutique! Here are some products:",
        items: [
          {
            id: "CH-CFB-MED-BLK",
            headline: "Chanel Classic Flap Bag Medium",
            one_liner: "Iconic quilted lambskin leather handbag - 38500 AED",
            price: "38500 AED",
            brand: "Chanel",
            category: "Fashion",
            sku: "CH-CFB-MED-BLK",
            rating: 4.9,
            badges: ["iconic", "investment"],
            image: "👜"
          },
          {
            id: "LV-NEVERFULL-MM-DA",
            headline: "Louis Vuitton Neverfull MM",
            one_liner: "Spacious and chic handbag perfect for everyday use - 12500 AED",
            price: "12500 AED",
            brand: "Louis Vuitton",
            category: "Fashion",
            sku: "LV-NEVERFULL-MM-DA",
            rating: 4.7,
            badges: ["iconic", "versatile"],
            image: "🛍️"
          }
        ],
        cta: "Which product interests you most?",
        quick_replies: [
          "More luxury handbags",
          "View accessories",
          "Show me everything"
        ],
        metadata: {
          totalProducts: 2,
          displayedProducts: 2,
          region: "UAE",
          currency: "AED",
          timestamp: new Date().toISOString()
        }
      },
      metadata: {
        processingTime: 5,
        testMode: true
      },
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Simple Production Test: Completed successfully`);
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Simple Production Test Error:', error);
    
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

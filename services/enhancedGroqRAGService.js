// Enhanced Groq RAG Service with Natural Language Generation
import Groq from 'groq-sdk';
import { GROQ_CONFIG, pickModels, classifyIntent, assessComplexity } from '../config/groq-config.js';
import { enhancedProducts, filterProducts, calculateBM25Score, calculateBusinessScore } from '../data/enhancedProducts.js';
import { 
  generateNaturalResponse, 
  formatForWhatsApp, 
  formatForWeb, 
  getStyleConfig, 
  detectIntentForTemplates 
} from './naturalResponseService.js';

const groq = new Groq({ apiKey: GROQ_CONFIG.apiKey });

// Intent Normalizer - Maps free-text to canonical need + constraints
export async function normalizeIntent(userQuery) {
  try {
    const response = await groq.chat.completions.create({
      model: GROQ_CONFIG.models.primary,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an intent classifier for a luxury product recommendation system. 
          
          FIRST: Check if this is a quick reply number or specific interaction:
          - If the message is just a single number like "1", "2", "3", etc. → return {"type": "quick_reply", "primaryNeed": "quick_reply", "number": 1, "confidence": 0.9}
          - If the message is just "hi", "hello", "hey", "good morning", etc. → return {"type": "greeting", "primaryNeed": "greeting", "confidence": 0.9}
          - If the message is asking for help like "help", "what can you do", "how does this work" → return {"type": "help", "primaryNeed": "help", "confidence": 0.9}
          - If the message is about non-product categories (cars, houses, food, travel, etc.) → return {"type": "non_product", "primaryNeed": "non_product", "confidence": 0.9}
          - If the message contains "luxury" + product category (watches, bags, etc.), prioritize the product category
          - If the message is a product request, continue with normal classification
          
          For product requests, return a JSON object with:
          - type: "product_request"
          - primaryNeed: the main need category (relaxation_and_stress_relief, sleep_support, organic, wellness_general, luxury, beauty_skincare, fragrance, home_decor, jewelry_watches, fashion_accessories)
          - constraints: array of constraints (budget_conscious, organic_only, luxury_only, specific_category, etc.)
          - affordances: array of relevant affordances from the query
          - confidence: confidence score (0-1)
          
          Be precise and conservative in classification.`
        },
        {
          role: 'user',
          content: userQuery
        }
      ]
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Fallback to rule-based classification if LLM fails
    if (!result.primaryNeed) {
      console.log('🔄 LLM intent detection failed, using rule-based fallback');
      const ruleBased = classifyIntent(userQuery);
      return {
        type: 'product_request',
        primaryNeed: ruleBased.primaryNeed,
        constraints: [],
        affordances: ruleBased.matchedAffordances,
        confidence: ruleBased.confidence
      };
    }
    
    return result;
  } catch (error) {
    console.error('Intent normalization failed:', error);
    console.log('🔄 Using rule-based fallback due to error');
    // Fallback to rule-based classification
    const ruleBased = classifyIntent(userQuery);
    return {
      type: 'product_request',
      primaryNeed: ruleBased.primaryNeed,
      constraints: [],
      affordances: ruleBased.matchedAffordances,
      confidence: ruleBased.confidence
    };
  }
}

// Product Retrieval - BM25 + Business Signals
export function retrieveProducts(intent, userQuery) {
  const { primaryNeed, constraints, affordances } = intent;
  
  // Build filters based on intent
  const filters = {};
  
  if (constraints.includes('organic_only')) {
    filters.is_organic = true;
  }
  
  if (constraints.includes('luxury_only')) {
    filters.minPrice = 1000;
  }
  
  if (constraints.includes('budget_conscious')) {
    filters.maxPrice = 500;
  }
  
  console.log(`🔍 Retrieving products for: ${primaryNeed} with affordances: ${affordances.join(', ')}`);
  
  // Filter products using enhanced filtering
  let candidates = filterProducts(enhancedProducts, primaryNeed, affordances);
  console.log(`📦 Found ${candidates.length} candidates after filtering`);
  
  if (candidates.length === 0) {
    console.log('❌ No candidates found, trying broader search');
    // Fallback to broader search
    candidates = enhancedProducts.filter(product => 
      product.tags?.some(tag => affordances.some(aff => tag.includes(aff))) ||
      product.name.toLowerCase().includes(userQuery.toLowerCase().split(' ')[0])
    );
  }
  
  // Calculate enhanced scores
  const scoredCandidates = candidates.map(product => {
    const bm25Score = calculateBM25Score(product, userQuery, affordances);
    const businessScore = calculateBusinessScore(product);
    
    // Enhanced combined scoring
    const combinedScore = (bm25Score * 0.5) + (businessScore * 0.3) + (product.rating / 5 * 0.2);
    
    return {
      ...product,
      bm25Score,
      businessScore,
      combinedScore
    };
  });
  
  // Sort by combined score and return top candidates
  const sortedCandidates = scoredCandidates.sort((a, b) => b.combinedScore - a.combinedScore);
  console.log(`🎯 Top 3 candidates: ${sortedCandidates.slice(0, 3).map(p => `${p.name} (${p.combinedScore.toFixed(2)})`).join(', ')}`);
  
  return sortedCandidates.slice(0, GROQ_CONFIG.rag.maxCandidates);
}

// Product Curator - LLM selects final recommendations
export async function curateProducts(candidates, userQuery, intent) {
  const { primaryNeed, affordances } = intent;
  const complexity = assessComplexity(intent, userQuery);
  
  // Select model based on complexity
  const { primary } = pickModels({ 
    needComplexity: complexity.complexity, 
    scoreSpread: calculateScoreSpread(candidates) 
  });
  
  try {
    const response = await groq.chat.completions.create({
      model: primary,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a luxury product curator. Select 3-5 products from the provided candidates that best match the user's needs.
          
          Requirements:
          - Pick ONLY from the provided product IDs
          - Ensure category diversity (don't recommend all from same category)
          - Consider the user's primary need: ${primaryNeed}
          - Match affordances: ${affordances.join(', ')}
          - Provide 1-line reasoning for each selection
          
          Return JSON with:
          - selectedProducts: array of {productId, confidence, reason}
          - categoryDiversity: boolean
          - overallConfidence: number (0-1)`
        },
        {
          role: 'user',
          content: JSON.stringify({
            userQuery,
            primaryNeed,
            affordances,
            candidates: candidates.map(p => ({
              id: p.id,
              name: p.name,
              category: p.category,
              price: p.price,
              tags: p.tags,
              benefits: p.benefits,
              affordances: p.affordances,
              combinedScore: p.combinedScore
            }))
          })
        }
      ]
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Validate selections are from provided candidates
    const validSelections = result.selectedProducts.filter(selection => 
      candidates.some(c => c.id === selection.productId)
    );
    
    return {
      selectedProducts: validSelections,
      categoryDiversity: result.categoryDiversity || false,
      overallConfidence: result.overallConfidence || 0.7,
      model: primary
    };
  } catch (error) {
    console.error('Product curation failed:', error);
    // Fallback to top-scored products
    return {
      selectedProducts: candidates.slice(0, 5).map(p => ({
        productId: p.id,
        confidence: p.combinedScore / 10, // Normalize score
        reason: `Top recommendation based on ${p.category} category`
      })),
      categoryDiversity: false,
      overallConfidence: 0.6,
      model: 'fallback'
    };
  }
}

// Safety Guard - Content moderation
export async function safetyCheck(recommendations) {
  if (!GROQ_CONFIG.safety.enabled) {
    return { safe: true, score: 1.0 };
  }
  
  try {
    const response = await groq.chat.completions.create({
      model: GROQ_CONFIG.models.guard,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'Classify the following product recommendations for policy compliance and safety. Return JSON with safe: boolean and score: number (0-1).'
        },
        {
          role: 'user',
          content: JSON.stringify({
            recommendations: recommendations.map(r => ({
              productId: r.productId,
              reason: r.reason
            }))
          })
        }
      ]
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      safe: result.safe && result.score >= GROQ_CONFIG.safety.threshold,
      score: result.score || 0.5
    };
  } catch (error) {
    console.error('Safety check failed:', error);
    return { safe: true, score: 0.5 }; // Default to safe
  }
}

// Enhanced RAG Pipeline with Natural Language Generation
export async function getGroqRecommendationsWithNaturalResponse(userQuery, customerId = null, context = {}) {
  try {
    console.log('🔍 Starting enhanced RAG pipeline for:', userQuery);
    
  // Step 1: Intent Normalization
  const intent = await normalizeIntent(userQuery);
  console.log('📝 Intent normalized:', intent);
  
  // Handle non-product queries
  if (intent.primaryNeed === 'non_product') {
    return {
      success: false,
      message: 'Query is not related to our product categories',
      recommendations: [],
      naturalResponse: {
        opening: "I specialize in luxury fashion, skincare, wellness, and lifestyle products. While I don't have that category, I can help you find luxury accessories, watches, or other premium items.",
        items: [],
        cta: "What type of luxury personal products are you looking for?",
        quick_replies: [
          "Luxury bags",
          "Premium watches", 
          "Skincare products",
          "Show me everything"
        ]
      },
      metadata: {
        intent,
        type: 'non_product',
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // Handle quick replies, greetings and help requests
  if (intent.type === 'quick_reply') {
      const quickReplyActions = {
        1: 'fashion',
        2: 'brands', 
        3: 'price',
        4: 'all'
      };
      
      const action = quickReplyActions[intent.number] || 'general';
      const actionMessages = {
        'fashion': 'Show me luxury fashion products including bags, handbags, and accessories',
        'brands': 'Show me products from luxury brands like Chanel, Hermès, Gucci, Louis Vuitton, Rolex, and La Mer',
        'price': 'Show me luxury products at different price ranges',
        'all': 'Show me all luxury products across all categories',
        'general': 'Show me luxury products'
      };
      
      // Process the quick reply as a new product request
      const quickReplyQuery = actionMessages[action];
      console.log('🔢 Processing quick reply:', action, '→', quickReplyQuery);
      
      // Recursively call the function with the action message
      return await getGroqRecommendationsWithNaturalResponse(quickReplyQuery, customerId, context);
    }
    
    if (intent.type === 'greeting') {
      return {
        success: true,
        message: 'Greeting detected',
        recommendations: [],
        naturalResponse: {
          opening: "Hello! 👋 Welcome to our luxury shopping experience. I'm here to help you find the perfect products.",
          items: [],
          cta: "What would you like to shop for today?",
          quick_replies: [
            "Luxury bags",
            "Skincare products", 
            "Wellness items",
            "Show me everything"
          ]
        },
        metadata: {
          intent,
          type: 'greeting',
          timestamp: new Date().toISOString()
        }
      };
    }
    
    if (intent.type === 'help') {
      return {
        success: true,
        message: 'Help request detected',
        recommendations: [],
        naturalResponse: {
          opening: "I'm your personal shopping assistant! 🛍️ I can help you find luxury products across categories like fashion, skincare, wellness, and more.",
          items: [],
          cta: "What type of products are you looking for?",
          quick_replies: [
            "Luxury fashion",
            "Premium skincare",
            "Wellness products",
            "Home decor",
            "Tell me more"
          ]
        },
        metadata: {
          intent,
          type: 'help',
          timestamp: new Date().toISOString()
        }
      };
    }
    
  // Step 2: Product Retrieval
  const candidates = retrieveProducts(intent, userQuery);
  console.log(`🎯 Retrieved ${candidates.length} candidates`);
  
  if (candidates.length === 0) {
    return {
      success: false,
      message: 'No products found matching your criteria',
      recommendations: [],
      naturalResponse: null
    };
  }
  
  // Step 3: Product Curation with improved model selection
  const scoreSpread = Math.max(...candidates.map(c => c.combinedScore)) - Math.min(...candidates.map(c => c.combinedScore));
  const models = pickModels({ 
    needComplexity: intent.primaryNeed === 'luxury' ? 'high' : 'medium', 
    scoreSpread,
    queryLength: userQuery.length
  });
  
  const curation = await curateProducts(candidates, userQuery, intent, models);
  console.log('🎨 Products curated:', curation.selectedProducts.length);
    
    // Step 4: Safety Check
    const safety = await safetyCheck(curation.selectedProducts);
    console.log('🛡️ Safety check:', safety);
    
    if (!safety.safe) {
      return {
        success: false,
        message: 'Recommendations failed safety check',
        recommendations: [],
        naturalResponse: null
      };
    }
    
    // Step 5: Format RAG Results
    const recommendations = curation.selectedProducts.map(selection => {
      const product = candidates.find(c => c.id === selection.productId);
      return {
        productId: selection.productId,
        confidence: selection.confidence,
        reason: selection.reason,
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image,
          tags: product.tags,
          benefits: product.benefits,
          is_organic: product.is_organic,
          rating: product.rating
        }
      };
    });
    
    // Step 6: Generate Natural Response
    const channel = context.source === 'whatsapp' ? 'whatsapp' : 'web';
    const style = getStyleConfig(channel);
    const intentForTemplates = detectIntentForTemplates(userQuery);
    
    console.log('💬 Generating natural response...');
    
    // Filter out invalid products before generating natural response
    const validRecommendations = recommendations.filter(r => 
      r.product && r.product.price && r.product.price > 0 && r.product.name
    );
    
    const naturalResponse = await generateNaturalResponse({
      userQuery,
      picks: validRecommendations,
      style,
      intent: intentForTemplates
    });
    
    console.log('✅ Natural response generated');
    
    return {
      success: true,
      message: `Found ${recommendations.length} recommendations for your query`,
      recommendations,
      naturalResponse,
      metadata: {
        intent,
        totalCandidates: candidates.length,
        categoryDiversity: curation.categoryDiversity,
        overallConfidence: curation.overallConfidence,
        model: curation.model,
        safetyScore: safety.score,
        style,
        intentForTemplates
      }
    };
    
  } catch (error) {
    console.error('Enhanced RAG pipeline failed:', error);
    return {
      success: false,
      message: 'Recommendation system temporarily unavailable',
      recommendations: [],
      naturalResponse: null,
      error: error.message
    };
  }
}

// Format response for different channels
export function formatResponseForChannel(response, channel = 'whatsapp') {
  if (!response.success || !response.naturalResponse) {
    return {
      success: false,
      message: response.message || 'No recommendations available',
      formattedResponse: null
    };
  }
  
  try {
    let formattedResponse;
    
    if (channel === 'whatsapp') {
      formattedResponse = formatForWhatsApp(response.naturalResponse, response.recommendations);
    } else {
      formattedResponse = formatForWeb(response.naturalResponse, response.recommendations);
    }
    
    return {
      success: true,
      message: response.message,
      formattedResponse,
      recommendations: response.recommendations,
      metadata: response.metadata
    };
    
  } catch (error) {
    console.error('Response formatting failed:', error);
    return {
      success: false,
      message: 'Response formatting failed',
      formattedResponse: null,
      error: error.message
    };
  }
}

// Helper function to calculate score spread
function calculateScoreSpread(candidates) {
  if (candidates.length < 2) return 0;
  
  const scores = candidates.map(c => c.combinedScore);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  
  return max - min;
}

// Export the main functions
export default getGroqRecommendationsWithNaturalResponse;

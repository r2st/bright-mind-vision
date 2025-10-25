import Groq from 'groq-sdk';
import { GROQ_CONFIG, pickModels, classifyIntent, assessComplexity } from '../config/groq-config.js';
import { enhancedProducts, filterProducts, calculateBM25Score, calculateBusinessScore } from '../data/enhancedProducts.js';

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
          Analyze the user query and return a JSON object with:
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
      const ruleBased = classifyIntent(userQuery);
      return {
        primaryNeed: ruleBased.primaryNeed,
        constraints: [],
        affordances: ruleBased.matchedAffordances,
        confidence: ruleBased.confidence
      };
    }
    
    return result;
  } catch (error) {
    console.error('Intent normalization failed:', error);
    // Fallback to rule-based classification
    const ruleBased = classifyIntent(userQuery);
    return {
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
  
  // Filter products
  let candidates = filterProducts(filters);
  
  // Calculate scores
  const scoredCandidates = candidates.map(product => {
    const bm25Score = calculateBM25Score(product, userQuery, affordances);
    const businessScore = calculateBusinessScore(product);
    
    // Combined score
    const combinedScore = 
      GROQ_CONFIG.rag.bm25Weight * bm25Score +
      GROQ_CONFIG.rag.businessWeight * businessScore;
    
    return {
      ...product,
      bm25Score,
      businessScore,
      combinedScore
    };
  });
  
  // Sort by combined score and return top candidates
  return scoredCandidates
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, GROQ_CONFIG.rag.maxCandidates);
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

// Main RAG Pipeline
export async function recommendProducts(userQuery) {
  try {
    console.log('🔍 Starting RAG pipeline for:', userQuery);
    
    // Step 1: Intent Normalization
    const intent = await normalizeIntent(userQuery);
    console.log('📝 Intent normalized:', intent);
    
    // Step 2: Product Retrieval
    const candidates = retrieveProducts(intent, userQuery);
    console.log(`🎯 Retrieved ${candidates.length} candidates`);
    
    if (candidates.length === 0) {
      return {
        success: false,
        message: 'No products found matching your criteria',
        recommendations: []
      };
    }
    
    // Step 3: Product Curation
    const curation = await curateProducts(candidates, userQuery, intent);
    console.log('🎨 Products curated:', curation.selectedProducts.length);
    
    // Step 4: Safety Check
    const safety = await safetyCheck(curation.selectedProducts);
    console.log('🛡️ Safety check:', safety);
    
    if (!safety.safe) {
      return {
        success: false,
        message: 'Recommendations failed safety check',
        recommendations: []
      };
    }
    
    // Step 5: Format Results
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
          benefits: product.benefits
        }
      };
    });
    
    return {
      success: true,
      message: `Found ${recommendations.length} recommendations for your query`,
      recommendations,
      metadata: {
        intent,
        totalCandidates: candidates.length,
        categoryDiversity: curation.categoryDiversity,
        overallConfidence: curation.overallConfidence,
        model: curation.model,
        safetyScore: safety.score
      }
    };
    
  } catch (error) {
    console.error('RAG pipeline failed:', error);
    return {
      success: false,
      message: 'Recommendation system temporarily unavailable',
      recommendations: [],
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

// Export the main function
export default recommendProducts;

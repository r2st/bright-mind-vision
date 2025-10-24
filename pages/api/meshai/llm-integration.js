// LLM Integration for AI Product Recommendations
// Supports multiple LLM providers: OpenAI, Anthropic, Local models

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// LLM Configuration
const LLM_CONFIG = {
  provider: process.env.LLM_PROVIDER || 'openai', // 'openai', 'anthropic', 'local', 'hybrid'
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 1000
  },
  local: {
    baseURL: process.env.LOCAL_LLM_URL || 'http://localhost:11434',
    model: process.env.LOCAL_MODEL || 'llama2',
    temperature: 0.7
  }
};

// Initialize LLM clients
let openaiClient = null;
let anthropicClient = null;

if (LLM_CONFIG.provider === 'openai' && LLM_CONFIG.openai.apiKey) {
  openaiClient = new OpenAI({
    apiKey: LLM_CONFIG.openai.apiKey
  });
}

if (LLM_CONFIG.provider === 'anthropic' && LLM_CONFIG.anthropic.apiKey) {
  anthropicClient = new Anthropic({
    apiKey: LLM_CONFIG.anthropic.apiKey
  });
}

// Product catalog for LLM context
const PRODUCT_CATALOG = [
  {
    id: 'P001',
    name: 'Organic Green Tea',
    category: 'Beverages',
    price: 12.99,
    description: 'Premium organic green tea with antioxidant properties',
    tags: ['organic', 'healthy', 'antioxidant', 'natural'],
    benefits: ['antioxidants', 'energy', 'wellness', 'natural']
  },
  {
    id: 'P002',
    name: 'Himalayan Salt Lamp',
    category: 'Wellness',
    price: 29.99,
    description: 'Natural Himalayan salt lamp for air purification and mood enhancement',
    tags: ['wellness', 'air-purification', 'mood', 'natural'],
    benefits: ['relaxation', 'air purification', 'mood enhancement', 'natural light']
  },
  {
    id: 'P003',
    name: 'Essential Oil Diffuser',
    category: 'Aromatherapy',
    price: 45.99,
    description: 'Ultrasonic essential oil diffuser with LED lights and timer',
    tags: ['aromatherapy', 'relaxation', 'LED', 'timer'],
    benefits: ['aromatherapy', 'relaxation', 'stress relief', 'mood enhancement']
  },
  {
    id: 'P004',
    name: 'Yoga Mat Premium',
    category: 'Fitness',
    price: 39.99,
    description: 'Non-slip premium yoga mat with carrying strap',
    tags: ['fitness', 'yoga', 'non-slip', 'premium'],
    benefits: ['fitness', 'yoga practice', 'exercise', 'wellness']
  },
  {
    id: 'P005',
    name: 'Meditation Cushion',
    category: 'Wellness',
    price: 24.99,
    description: 'Comfortable meditation cushion filled with buckwheat hulls',
    tags: ['meditation', 'comfort', 'buckwheat', 'wellness'],
    benefits: ['meditation', 'mindfulness', 'comfort', 'spiritual practice']
  },
  {
    id: 'P006',
    name: 'Herbal Sleep Tea',
    category: 'Beverages',
    price: 15.99,
    description: 'Blend of chamomile, lavender, and valerian for better sleep',
    tags: ['sleep', 'herbal', 'chamomile', 'lavender'],
    benefits: ['sleep aid', 'relaxation', 'natural', 'bedtime routine']
  }
];

// LLM-powered recommendation generation
export async function generateLLMRecommendations(message, customerId = null, context = {}) {
  try {
    console.log('🤖 Using LLM for recommendations:', LLM_CONFIG.provider);
    
    const systemPrompt = createSystemPrompt();
    const userPrompt = createUserPrompt(message, customerId, context);
    
    let recommendations;
    
    switch (LLM_CONFIG.provider) {
      case 'openai':
        recommendations = await generateOpenAIRecommendations(systemPrompt, userPrompt);
        break;
      case 'anthropic':
        recommendations = await generateAnthropicRecommendations(systemPrompt, userPrompt);
        break;
      case 'local':
        recommendations = await generateLocalLLMRecommendations(systemPrompt, userPrompt);
        break;
      case 'hybrid':
        recommendations = await generateHybridRecommendations(message, customerId, context);
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${LLM_CONFIG.provider}`);
    }
    
    return recommendations;
    
  } catch (error) {
    console.error('❌ LLM recommendation error:', error);
    // Fallback to rule-based system
    return await generateFallbackRecommendations(message);
  }
}

// Create system prompt for LLM
function createSystemPrompt() {
  return `You are an expert product recommendation AI for a wellness and lifestyle store. 

PRODUCT CATALOG:
${JSON.stringify(PRODUCT_CATALOG, null, 2)}

TASK:
Analyze customer messages and recommend the most relevant products from the catalog.

REQUIREMENTS:
1. Understand customer intent and needs
2. Match products based on benefits, tags, and descriptions
3. Provide confidence scores (0.0 to 1.0)
4. Give clear reasoning for each recommendation
5. Consider price sensitivity and product combinations
6. Prioritize products that directly address customer needs

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "products": [
    {
      "productId": "P001",
      "confidence": 0.95,
      "reason": "Detailed explanation of why this product matches the customer's needs",
      "algorithm": "llm"
    }
  ],
  "confidence": 0.92,
  "reasoning": "Overall explanation of the recommendation strategy",
  "intent": "detected_customer_intent",
  "alternatives": [
    {
      "productId": "P002",
      "confidence": 0.78,
      "reason": "Alternative option explanation"
    }
  ]
}

GUIDELINES:
- Be specific about how each product addresses customer needs
- Consider product combinations for complex requests
- Provide 3-5 top recommendations
- Include 1-2 alternative options
- Use natural, helpful language in reasoning
- Confidence scores should reflect how well the product matches the request`;
}

// Create user prompt with customer message
function createUserPrompt(message, customerId, context) {
  return `Customer Message: "${message}"

Customer ID: ${customerId || 'anonymous'}
Context: ${JSON.stringify(context, null, 2)}

Please analyze this message and provide product recommendations following the system prompt requirements.`;
}

// OpenAI Integration
async function generateOpenAIRecommendations(systemPrompt, userPrompt) {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized');
  }
  
  const response = await openaiClient.chat.completions.create({
    model: LLM_CONFIG.openai.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: LLM_CONFIG.openai.temperature,
    max_tokens: LLM_CONFIG.openai.maxTokens,
    response_format: { type: "json_object" }
  });
  
  const content = response.choices[0].message.content;
  return JSON.parse(content);
}

// Anthropic Integration
async function generateAnthropicRecommendations(systemPrompt, userPrompt) {
  if (!anthropicClient) {
    throw new Error('Anthropic client not initialized');
  }
  
  const response = await anthropicClient.messages.create({
    model: LLM_CONFIG.anthropic.model,
    max_tokens: LLM_CONFIG.anthropic.maxTokens,
    temperature: LLM_CONFIG.anthropic.temperature,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  });
  
  const content = response.content[0].text;
  return JSON.parse(content);
}

// Local LLM Integration (Ollama, etc.)
async function generateLocalLLMRecommendations(systemPrompt, userPrompt) {
  const response = await fetch(`${LLM_CONFIG.local.baseURL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_CONFIG.local.model,
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      temperature: LLM_CONFIG.local.temperature,
      stream: false,
      format: 'json'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Local LLM API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return JSON.parse(data.response);
}

// Hybrid approach: LLM + Rule-based
async function generateHybridRecommendations(message, customerId, context) {
  try {
    // Try LLM first
    const llmRecommendations = await generateLLMRecommendations(message, customerId, context);
    
    // Enhance with rule-based validation
    const enhancedRecommendations = await enhanceWithRuleBased(llmRecommendations, message);
    
    return enhancedRecommendations;
  } catch (error) {
    console.log('🔄 LLM failed, falling back to rule-based system');
    return await generateFallbackRecommendations(message);
  }
}

// Enhance LLM recommendations with rule-based validation
async function enhanceWithRuleBased(llmRecommendations, message) {
  // Import the existing rule-based system
  const { generateAIRecommendations } = await import('./ai-recommendation');
  const ruleBasedRecommendations = await generateAIRecommendations(message);
  
  // Combine and rank both approaches
  const combinedRecommendations = {
    ...llmRecommendations,
    products: llmRecommendations.products.map(llmRec => {
      // Find matching rule-based recommendation
      const ruleRec = ruleBasedRecommendations.products.find(
        r => r.productId === llmRec.productId
      );
      
      if (ruleRec) {
        // Average confidence scores
        const avgConfidence = (llmRec.confidence + ruleRec.confidence) / 2;
        return {
          ...llmRec,
          confidence: avgConfidence,
          algorithms: ['llm', 'rule-based'],
          hybridScore: avgConfidence
        };
      }
      
      return {
        ...llmRec,
        algorithms: ['llm'],
        hybridScore: llmRec.confidence * 0.8 // Slight penalty for no rule-based match
      };
    })
  };
  
  // Sort by hybrid score
  combinedRecommendations.products.sort((a, b) => b.hybridScore - a.hybridScore);
  
  return combinedRecommendations;
}

// Fallback to rule-based system
async function generateFallbackRecommendations(message) {
  console.log('🔄 Using fallback rule-based recommendations');
  const { generateAIRecommendations } = await import('./ai-recommendation');
  return await generateAIRecommendations(message);
}

// Configuration validation
export function validateLLMConfig() {
  const issues = [];
  
  switch (LLM_CONFIG.provider) {
    case 'openai':
      if (!LLM_CONFIG.openai.apiKey) {
        issues.push('OPENAI_API_KEY environment variable is required');
      }
      break;
    case 'anthropic':
      if (!LLM_CONFIG.anthropic.apiKey) {
        issues.push('ANTHROPIC_API_KEY environment variable is required');
      }
      break;
    case 'local':
      if (!LLM_CONFIG.local.baseURL) {
        issues.push('LOCAL_LLM_URL environment variable is required');
      }
      break;
  }
  
  return {
    valid: issues.length === 0,
    issues,
    config: LLM_CONFIG
  };
}

// Test LLM connection
export async function testLLMConnection() {
  try {
    const testMessage = "I need something to help me relax after work";
    const recommendations = await generateLLMRecommendations(testMessage);
    
    return {
      success: true,
      provider: LLM_CONFIG.provider,
      recommendations: recommendations.products.length,
      confidence: recommendations.confidence
    };
  } catch (error) {
    return {
      success: false,
      provider: LLM_CONFIG.provider,
      error: error.message
    };
  }
}

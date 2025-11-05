/**
 * LLM Configuration
 * Centralized configuration for LLM providers and models
 * 
 * Configuration Priority (highest to lowest):
 * 1. Environment variables (override everything)
 * 2. This config file
 * 3. Hardcoded defaults in code
 */

export const LLM_CONFIG = {
  // Provider selection
  provider: process.env.LLM_PROVIDER || 'gemini', // 'groq' or 'gemini'
  
  // Model Configuration
  models: {
    // Groq Models
    groq: {
      primary: process.env.LLM_INTENT_MODEL || process.env.GROQ_PRIMARY_MODEL || 'llama-3.1-8b-instant',
      versatile: process.env.LLM_NLG_MODEL || process.env.GROQ_VERSATILE_MODEL || 'llama-3.3-70b-versatile',
      guard: process.env.GROQ_GUARD_MODEL || 'meta-llama/llama-guard-4-12b'
    },
    
    // Gemini Models
    gemini: {
      // Recommended: gemini-2.5-flash (stable, fast, best for e-commerce)
      // Options: gemini-2.5-flash, gemini-2.5-pro, gemini-flash-latest, gemini-pro-latest, gemini-2.0-flash
      primary: process.env.LLM_INTENT_MODEL || 'gemini-2.5-flash',
      versatile: process.env.LLM_NLG_MODEL || 'gemini-2.5-flash',
      guard: process.env.LLM_GUARD_MODEL || 'gemini-2.5-flash'
    }
  },
  
  // Model Selection Hints
  modelSelection: {
    // When to use Flash vs Pro
    useFlash: [
      'fast responses',
      'e-commerce',
      'product queries',
      'cart management',
      'customer support',
      'high volume'
    ],
    usePro: [
      'complex reasoning',
      'deep analysis',
      'long context',
      'advanced coding',
      'document analysis'
    ]
  },
  
  // Available Gemini Models (from API query)
  availableGeminiModels: [
    'gemini-2.5-flash',        // Stable Flash (RECOMMENDED for e-commerce)
    'gemini-2.5-pro',          // Stable Pro (for complex tasks)
    'gemini-flash-latest',     // Always latest Flash
    'gemini-pro-latest',       // Always latest Pro
    'gemini-2.0-flash',        // Older stable Flash
    'gemini-2.0-flash-001'    // Older stable Flash
  ]
};

/**
 * Get the recommended model for a use case
 */
export function getRecommendedModel(useCase = 'e-commerce') {
  const provider = LLM_CONFIG.provider;
  
  if (provider === 'gemini') {
    // For e-commerce, Flash is recommended (fast, cheap, sufficient)
    if (useCase === 'e-commerce' || useCase === 'chatbot') {
      return LLM_CONFIG.models.gemini.primary; // defaults to gemini-2.5-flash
    }
    // For complex tasks, use Pro
    return 'gemini-2.5-pro';
  }
  
  // Groq models
  return LLM_CONFIG.models.groq.primary;
}

/**
 * Validate model name for provider
 */
export function validateModelName(provider, modelName) {
  if (provider === 'gemini') {
    return LLM_CONFIG.availableGeminiModels.includes(modelName) || 
           modelName.includes('gemini');
  }
  // For Groq, any model name that doesn't contain 'gemini' is valid
  return !modelName.includes('gemini');
}


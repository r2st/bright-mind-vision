/**
 * LLM Provider Service
 * Configurable LLM provider that can switch between Groq, Gemini, and OpenAI
 */

import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { LLM_CONFIG } from '../config/llm-config.js';

class LLMProvider {
  constructor() {
    // Use centralized config (which respects environment variables)
    this.provider = LLM_CONFIG.provider;
    this.groq = null;
    this.gemini = null;
    this.openai = null;
    this.initialized = false;
    
    // Rate limiting for Gemini Free Tier (15 requests/minute per model)
    this.rateLimiter = {
      requests: new Map(), // model -> [{ timestamp, ... }]
      maxRequestsPerMinute: 15,
      windowMs: 60 * 1000 // 1 minute
    };
    
    this.initializeProvider();
  }
  
  /**
   * Check if we can make a request (rate limit check)
   */
  canMakeRequest(model) {
    const now = Date.now();
    const modelKey = model || 'default';
    const requests = this.rateLimiter.requests.get(modelKey) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = requests.filter(r => (now - r.timestamp) < this.rateLimiter.windowMs);
    
    // Update the map
    this.rateLimiter.requests.set(modelKey, recentRequests);
    
    // Check if we're under the limit
    return recentRequests.length < this.rateLimiter.maxRequestsPerMinute;
  }
  
  /**
   * Record a request for rate limiting
   */
  recordRequest(model) {
    const modelKey = model || 'default';
    const requests = this.rateLimiter.requests.get(modelKey) || [];
    requests.push({ timestamp: Date.now() });
    this.rateLimiter.requests.set(modelKey, requests);
  }
  
  /**
   * Get time until next request slot is available
   */
  getTimeUntilNextSlot(model) {
    const now = Date.now();
    const modelKey = model || 'default';
    const requests = this.rateLimiter.requests.get(modelKey) || [];
    
    // Remove old requests
    const recentRequests = requests.filter(r => (now - r.timestamp) < this.rateLimiter.windowMs);
    
    if (recentRequests.length < this.rateLimiter.maxRequestsPerMinute) {
      return 0; // Can make request now
    }
    
    // Find oldest request in window
    const oldestRequest = recentRequests.reduce((oldest, req) => 
      req.timestamp < oldest.timestamp ? req : oldest, recentRequests[0]);
    
    // Calculate when that request will expire (1 minute after it was made)
    const expiresAt = oldestRequest.timestamp + this.rateLimiter.windowMs;
    return Math.max(0, expiresAt - now);
  }

  initializeProvider() {
    try {
      if (this.provider === 'groq') {
        const apiKey = process.env.LLM_GROQ_API_KEY;
        if (!apiKey) {
          console.warn('⚠️ LLM_GROQ_API_KEY not set - provider will be initialized lazily');
          return;
        }
        this.groq = new Groq({
          apiKey: apiKey
        });
        this.initialized = true;
        console.log('✅ Groq LLM Provider initialized');
      } else if (this.provider === 'gemini') {
        const apiKey = process.env.LLM_GEMINI_API_KEY;
        if (!apiKey) {
          console.warn('⚠️ LLM_GEMINI_API_KEY not set - attempting fallback to Groq');
          // Fallback to Groq if available
          if (process.env.LLM_GROQ_API_KEY) {
            this.provider = 'groq';
            this.groq = new Groq({
              apiKey: process.env.LLM_GROQ_API_KEY
            });
            this.initialized = true;
            console.log('🔄 Fallback to Groq provider');
          } else {
            console.warn('⚠️ No LLM API keys available - provider will be initialized lazily');
            return;
          }
        } else {
          this.gemini = new GoogleGenerativeAI(apiKey);
          this.initialized = true;
          console.log('✅ Gemini LLM Provider initialized');
          
          // Also initialize Groq as fallback if available (for rate limit fallback)
          if (process.env.LLM_GROQ_API_KEY && !this.groq) {
            try {
              this.groq = new Groq({
                apiKey: process.env.LLM_GROQ_API_KEY
              });
              console.log('✅ Groq initialized as fallback for Gemini rate limits');
            } catch (error) {
              console.warn('⚠️ Failed to initialize Groq fallback (non-critical):', error.message);
            }
          }
          
          // Also initialize OpenAI as final fallback if available
          if (process.env.LLM_OPENAI_API_KEY && !this.openai) {
            try {
              this.openai = new OpenAI({
                apiKey: process.env.LLM_OPENAI_API_KEY
              });
              console.log('✅ OpenAI initialized as final fallback for rate limits');
            } catch (error) {
              console.warn('⚠️ Failed to initialize OpenAI fallback (non-critical):', error.message);
            }
          }
        }
      } else {
        throw new Error(`Unsupported LLM provider: ${this.provider}`);
      }
    } catch (error) {
      console.error(`❌ Failed to initialize ${this.provider} provider:`, error.message);
      // Don't throw - allow lazy initialization
      this.initialized = false;
    }
  }

  ensureGeminiInitialized() {
    if (!this.gemini) {
      try {
        const apiKey = process.env.LLM_GEMINI_API_KEY;
        if (!apiKey) throw new Error('LLM_GEMINI_API_KEY is not set');
        this.gemini = new GoogleGenerativeAI(apiKey);
        console.log('✅ Gemini LLM Provider initialized (lazy)');
      } catch (error) {
        console.error('❌ Failed to lazy-initialize Gemini provider:', error);
      }
    }
    
    // Also ensure Groq is initialized for fallback (if available)
    this.ensureGroqInitialized();
  }

  ensureGroqInitialized() {
    if (!this.groq && process.env.LLM_GROQ_API_KEY) {
      try {
        this.groq = new Groq({
          apiKey: process.env.LLM_GROQ_API_KEY
        });
        console.log('✅ Groq LLM Provider initialized (lazy, for fallback)');
      } catch (error) {
        console.warn('⚠️ Failed to lazy-initialize Groq fallback (non-critical):', error.message);
      }
    }
  }
  
  ensureOpenAIInitialized() {
    if (!this.openai && process.env.LLM_OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.LLM_OPENAI_API_KEY
        });
        console.log('✅ OpenAI LLM Provider initialized (lazy, for fallback)');
      } catch (error) {
        console.warn('⚠️ Failed to lazy-initialize OpenAI fallback (non-critical):', error.message);
      }
    }
  }

  normalizeModelForProvider(provider, modelName, role) {
    const isGeminiName = (name) => typeof name === 'string' && name.toLowerCase().includes('gemini');
    const isGroqName = (name) => typeof name === 'string' && (name.toLowerCase().includes('llama') || name.toLowerCase().includes('mixtral'));
    const stripLatest = (name) => (typeof name === 'string' ? name.replace(/-latest$/i, '') : name);
    
    if (!modelName) {
      // If no model name provided, return default based on provider and role
      if (provider === 'gemini') {
        return role === 'primary' || role === 'intent' 
          ? (process.env.LLM_INTENT_MODEL || 'gemini-1.5-flash')
          : (process.env.LLM_NLG_MODEL || 'gemini-1.5-flash');
      } else {
        return 'llama-3.1-8b-instant';
      }
    }
    
    modelName = stripLatest(modelName);
    
    if (provider === 'groq') {
      // Never send a Gemini model name to Groq
      if (isGeminiName(modelName)) {
        return process.env.LLM_NLG_MODEL_GROQ_FALLBACK || 'llama-3.3-70b-versatile';
      }
      return modelName;
    }
    
    if (provider === 'gemini') {
      // Never send a Groq model name to Gemini - ALWAYS convert
      if (isGroqName(modelName)) {
        // Use centralized config defaults
        return role === 'primary' || role === 'intent' 
          ? LLM_CONFIG.models.gemini.primary
          : LLM_CONFIG.models.gemini.versatile;
      }
      
      // If it's already a Gemini model, normalize it to supported models
      if (isGeminiName(modelName)) {
        const cleanModel = modelName.replace(/-latest$/i, '');
        
        // Map old/unsupported model names to supported ones
        if (cleanModel.includes('1.5-flash') || (cleanModel.includes('flash') && !cleanModel.includes('2.5') && !cleanModel.includes('2.0'))) {
          // Old 1.5 models → use 2.5-flash
          return 'gemini-2.5-flash';
        } else if (cleanModel.includes('1.5-pro') || (cleanModel.includes('pro') && !cleanModel.includes('2.5') && !cleanModel.includes('2.0'))) {
          // Old 1.5 pro → use 2.5-pro
          return 'gemini-2.5-pro';
        } else if (cleanModel.includes('2.5-flash')) {
          return 'gemini-2.5-flash';
        } else if (cleanModel.includes('2.5-pro')) {
          return 'gemini-2.5-pro';
        } else if (cleanModel.includes('2.0-flash')) {
          return 'gemini-2.0-flash';
        } else if (cleanModel === 'gemini-flash' || cleanModel === 'gemini-flash-latest') {
          return 'gemini-flash-latest';
        } else if (cleanModel === 'gemini-pro' || cleanModel === 'gemini-pro-latest') {
          return 'gemini-pro-latest';
        }
        
        // If it's already a valid model name, return as-is
        return cleanModel;
      }
      
      // Default for Gemini if unspecified - use config default
      return LLM_CONFIG.models.gemini.primary;
    }
    
    return modelName;
  }

  getModels() {
    // Always use current provider to ensure correct models are returned
    const currentProvider = this.provider || LLM_CONFIG.provider;
    
    if (currentProvider === 'groq') {
      return {
        primary: LLM_CONFIG.models.groq.primary,
        versatile: (process.env.LLM_PROVIDER_NLG === 'groq' || !process.env.LLM_PROVIDER_NLG)
          ? LLM_CONFIG.models.groq.versatile
          : LLM_CONFIG.models.groq.versatile,
        guard: LLM_CONFIG.models.groq.guard
      };
    } else {
      // Gemini provider
      return {
        primary: LLM_CONFIG.models.gemini.primary,
        versatile: LLM_CONFIG.models.gemini.versatile,
        guard: LLM_CONFIG.models.gemini.guard
      };
    }
  }

  ensureInitialized() {
    if (!this.initialized) {
      // Try to initialize now
      this.initializeProvider();
      if (!this.initialized) {
        throw new Error(`LLM provider not initialized. Please set LLM_GROQ_API_KEY or LLM_GEMINI_API_KEY environment variable.`);
      }
    }
  }

  async chatCompletion(messages, options = {}) {
    const {
      model = 'primary',
      temperature = 0.7,
      max_tokens = 1000,
      tools = null,
      tool_choice = 'auto',
      provider: overrideProvider = null,
      modelName: overrideModelName = null,
      _fallbackFrom = null // Internal flag to prevent circular fallback
    } = options;

    // Ensure provider is initialized before use
    this.ensureInitialized();

    const resolvedProvider = overrideProvider || this.provider;
    const baseModels = this.getModels();
    let modelName = overrideModelName || baseModels[model] || baseModels.primary;
    modelName = this.normalizeModelForProvider(resolvedProvider, modelName, model);

    try {
      // Light observability to verify mixed-model behavior
      console.log(`🧠 LLM call → provider: ${resolvedProvider}, role: ${model}, model: ${modelName}`);
      if (resolvedProvider === 'groq') {
        if (!this.groq) {
          throw new Error('Groq client not initialized. Please set LLM_GROQ_API_KEY environment variable.');
        }
        return await this.groqChatCompletion(messages, modelName, temperature, max_tokens, tools, tool_choice, 0, _fallbackFrom);
      } else if (resolvedProvider === 'gemini') {
        try {
          this.ensureGeminiInitialized();
          return await this.geminiChatCompletion(messages, modelName, temperature, max_tokens, tools, tool_choice, _fallbackFrom);
        } catch (err) {
          // If Gemini fails (404, 429, or other errors), try Groq fallback (but not if we're already falling back from Groq)
          const isRateLimit = err.status === 429 || (err.message && err.message.includes('rate limit'));
          const isModelNotFound = err.status === 404;
          
          if ((isRateLimit || isModelNotFound) && process.env.LLM_GROQ_API_KEY && this.groq && _fallbackFrom !== 'groq') {
            console.warn(`   🔄 Gemini ${isRateLimit ? 'rate limited' : 'model not found'}, switching to Groq...`);
            try {
              // Use versatile large model on Groq for better parity
              const groqFallbackModel = process.env.LLM_NLG_MODEL_GROQ_FALLBACK || 'llama-3.3-70b-versatile';
              console.log(`   ✅ Using Groq (${groqFallbackModel}) as fallback`);
              return await this.groqChatCompletion(messages, groqFallbackModel, temperature, max_tokens, tools, tool_choice, 0, 'gemini');
            } catch (groqError) {
              console.error('   ❌ Groq fallback also failed:', groqError.message);
              throw err; // Re-throw original Gemini error
            }
          }
          
          // If no Groq fallback available, throw original error
          throw err;
        }
      }
    } catch (error) {
      console.error(`Error in ${this.provider} chat completion:`, error);
      throw error;
    }
  }

  async groqChatCompletion(messages, model, temperature, max_tokens, tools, tool_choice, retryCount = 0, _fallbackFrom = null) {
    const requestOptions = {
      model,
      temperature,
      max_tokens,
      messages
    };

    if (tools) {
      requestOptions.tools = tools;
      requestOptions.tool_choice = tool_choice;
    }

    try {
      const response = await this.groq.chat.completions.create(requestOptions);
      return response;
    } catch (error) {
      // Handle rate limit errors (429) - skip retries and go straight to Gemini fallback (but prevent circular fallback)
      if (error.status === 429 || (error.message && error.message.includes('rate limit'))) {
        // For rate limits, skip retries (they're usually too long) and go straight to Gemini
        // BUT: Prevent circular fallback - if we're already falling back from Gemini, try OpenAI
        if (_fallbackFrom === 'gemini') {
          // Both Groq and Gemini are rate-limited, try OpenAI as final fallback
          if (process.env.LLM_OPENAI_API_KEY) {
            try {
              this.ensureOpenAIInitialized();
              console.log('🔄 Both Groq and Gemini rate-limited, using OpenAI as final fallback');
              const openaiModel = process.env.LLM_OPENAI_MODEL || 'gpt-4o-mini';
              return await this.openaiChatCompletion(messages, openaiModel, temperature, max_tokens, tools, tool_choice);
            } catch (openaiError) {
              console.error('❌ OpenAI fallback also failed:', openaiError.message);
              throw error; // Re-throw original Groq error
            }
          } else {
            console.error('   ❌ Both Groq and Gemini are rate-limited. OpenAI not configured.');
            throw error; // Re-throw the error instead of infinite loop
          }
        }
        
        console.warn('⚠️ Groq rate limit reached, skipping retries and attempting fallback to Gemini...');
        
        // Only fallback to Gemini if it's available and we have the API key
        if (process.env.LLM_GEMINI_API_KEY) {
          try {
            this.ensureGeminiInitialized();
            console.log('🔄 Using Gemini as fallback for rate-limited request');
            // Convert Groq model name to Gemini model name
            // IMPORTANT: Groq models (llama, mixtral) cannot be used with Gemini
            // Use gemini-1.5-flash for fast operations, gemini-1.5-pro for complex tasks
            let geminiModel = 'gemini-1.5-flash'; // Use Flash by default (faster, more reliable)
            const modelLower = (model || '').toLowerCase();
            
            // Prefer Flash for reliability (Pro may not be available in all API versions)
            // Only use Pro if explicitly requested or for very large models
            if (modelLower.includes('gemini')) {
              // Already a Gemini model name - remove -latest suffix if present
              geminiModel = model.replace(/-latest$/i, '');
              // If it's Pro, keep it; otherwise default to Flash
              if (!geminiModel.includes('pro') && !geminiModel.includes('flash')) {
                geminiModel = 'gemini-1.5-flash';
              }
            } else if (modelLower.includes('versatile') || modelLower.includes('70b')) {
              // For large Groq models, try Pro but fallback to Flash if needed
              geminiModel = process.env.LLM_NLG_MODEL || 'gemini-1.5-flash';
            }
            
            // Final safety check: never use a Groq model name with Gemini API
            const finalModelLower = geminiModel.toLowerCase();
            if (finalModelLower.includes('llama') || finalModelLower.includes('mixtral')) {
              console.warn(`   ⚠️ Safety check: Detected Groq model name "${geminiModel}", using Gemini Flash`);
              geminiModel = 'gemini-1.5-flash';
            }
            
            console.log(`   Using Gemini model: ${geminiModel} (converted from Groq model: ${model})`);
            return await this.geminiChatCompletion(messages, geminiModel, temperature, max_tokens, tools, tool_choice, 'groq');
          } catch (geminiError) {
            // If Gemini also fails with rate limit, try OpenAI
            const isGeminiRateLimit = geminiError.status === 429 || (geminiError.message && geminiError.message.includes('rate limit'));
            if (isGeminiRateLimit && process.env.LLM_OPENAI_API_KEY) {
              try {
                this.ensureOpenAIInitialized();
                console.log('🔄 Both Groq and Gemini rate-limited, using OpenAI as final fallback');
                const openaiModel = process.env.LLM_OPENAI_MODEL || 'gpt-4o-mini';
                return await this.openaiChatCompletion(messages, openaiModel, temperature, max_tokens, tools, tool_choice);
              } catch (openaiError) {
                console.error('❌ OpenAI fallback also failed:', openaiError.message);
                throw error; // Re-throw original Groq error
              }
            }
            console.error('❌ Gemini fallback also failed:', geminiError);
            // Re-throw original Groq error if Gemini also fails
            throw error;
          }
        }
      }
      
      // Re-throw original error if not rate limit or no Gemini fallback
      throw error;
    }
  }

  async geminiChatCompletion(messages, model, temperature, max_tokens, tools, tool_choice, _fallbackFrom = null) {
    const genAI = this.gemini;
    
    // Final safety check: ensure we never use Groq model names with Gemini
    const isGroqName = (name) => typeof name === 'string' && (name.toLowerCase().includes('llama') || name.toLowerCase().includes('mixtral'));
    let modelName = model;
    
    if (isGroqName(modelName)) {
      console.warn(`⚠️ Detected Groq model name "${modelName}" in Gemini call, converting to gemini-1.5-flash`);
      modelName = 'gemini-1.5-flash';
    }
    
    // Normalize model names to supported models
    // Based on API query, available models are: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-flash-latest, gemini-pro-latest
    if (modelName) {
      const cleanModel = modelName.replace(/-latest$/i, '');
      
      // Map to supported models
      if (cleanModel.includes('1.5-flash') || (cleanModel.includes('flash') && !cleanModel.includes('2.5') && !cleanModel.includes('2.0'))) {
        // Old 1.5 or generic flash → use 2.5-flash
        modelName = 'gemini-2.5-flash';
      } else if (cleanModel.includes('1.5-pro') || (cleanModel.includes('pro') && !cleanModel.includes('2.5') && !cleanModel.includes('2.0'))) {
        // Old 1.5 pro → use 2.5-pro
        modelName = 'gemini-2.5-pro';
      } else if (cleanModel.includes('2.5-flash')) {
        modelName = 'gemini-2.5-flash';
      } else if (cleanModel.includes('2.5-pro')) {
        modelName = 'gemini-2.5-pro';
      } else if (cleanModel.includes('2.0-flash')) {
        modelName = 'gemini-2.0-flash';
      } else if (cleanModel === 'gemini-flash') {
        modelName = 'gemini-flash-latest';
      } else if (cleanModel === 'gemini-pro') {
        modelName = 'gemini-pro-latest';
      } else if (!modelName.includes('gemini')) {
        // Default to config default if not a valid Gemini model name
        modelName = LLM_CONFIG.models.gemini.primary;
      } else {
        // Keep as-is if it's already a valid model name
        modelName = cleanModel;
      }
    } else {
      // Default to config default
      modelName = LLM_CONFIG.models.gemini.primary;
    }
    
    console.log(`   Using Gemini model: ${modelName} (normalized from: ${model})`);

    // Convert messages to Gemini format
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const toolMessages = messages.filter(m => m.role === 'tool');

    let prompt = '';
    if (systemMessage) {
      prompt += systemMessage.content + '\n\n';
    }

    // Add conversation history
    for (let i = 0; i < Math.max(userMessages.length, assistantMessages.length); i++) {
      if (userMessages[i]) {
        prompt += `User: ${userMessages[i].content}\n`;
      }
      if (assistantMessages[i]) {
        prompt += `Assistant: ${assistantMessages[i].content}\n`;
      }
    }

    // Add tool messages
    toolMessages.forEach(msg => {
      prompt += `Tool Result: ${msg.content}\n`;
    });

    // Add tools information if provided
    if (tools && tools.length > 0) {
      prompt += '\nAvailable tools:\n';
      tools.forEach(tool => {
        prompt += `- ${tool.function.name}: ${tool.function.description}\n`;
      });
      prompt += '\nUse the appropriate tool when needed.\n';
    }

    // Rate limiting: Check if we can make a request
    // If we're close to the limit (>= 13/15), proactively switch to Groq to avoid waiting
    const now = Date.now();
    const modelKey = modelName || 'default';
    const requests = this.rateLimiter.requests.get(modelKey) || [];
    const recentRequests = requests.filter(r => (now - r.timestamp) < this.rateLimiter.windowMs);
    const requestCount = recentRequests.length;
    const waitTime = this.getTimeUntilNextSlot(modelName);
    
    // Proactive fallback: If we're at 13+ requests (close to limit) or waiting > 5s, switch to Groq
    // Note: _fallbackFrom is checked in inner loop, not here
    if (requestCount >= 13 || waitTime > 5000) {
      if (process.env.LLM_GROQ_API_KEY) {
        // Ensure Groq is initialized
        if (!this.groq) {
          this.ensureGroqInitialized();
        }
        
        if (this.groq) {
          const groqFallbackModel = process.env.LLM_NLG_MODEL_GROQ_FALLBACK || 'llama-3.3-70b-versatile';
          console.log(`   🔄 Proactively switching to Groq (${groqFallbackModel}) - ${requestCount}/15 requests used, ${waitTime > 0 ? `waiting ${Math.ceil(waitTime / 1000)}s` : 'approaching limit'}`);
          return await this.groqChatCompletion(messages, groqFallbackModel, temperature, max_tokens, tools, tool_choice, 0, 'gemini');
        }
      }
    }
    
    // If we need to wait but Groq not available, wait
    if (waitTime > 0) {
      console.log(`   ⏳ Rate limit: Waiting ${Math.ceil(waitTime / 1000)}s before request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime + 100)); // Add small buffer
    }
    
    // Try to generate content, and if it fails with 404 or 429, try alternative models or retry
    // Use available models from config
    let lastError;
    const modelsToTry = [
      modelName, // Try the normalized model first
      LLM_CONFIG.models.gemini.primary, // Config default
      ...LLM_CONFIG.availableGeminiModels.filter(m => m !== modelName && m !== LLM_CONFIG.models.gemini.primary)
    ];
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const tryModel = modelsToTry[i];
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount <= maxRetries) {
        try {
          // Check rate limit before each attempt - proactive Groq switch if approaching limit
          const now = Date.now();
          const modelKey = tryModel || 'default';
          const requests = this.rateLimiter.requests.get(modelKey) || [];
          const recentRequests = requests.filter(r => (now - r.timestamp) < this.rateLimiter.windowMs);
          const requestCount = recentRequests.length;
          const waitTime = this.getTimeUntilNextSlot(tryModel);
          
          // Proactive fallback if approaching limit (but prevent circular fallback)
          if ((requestCount >= 13 || waitTime > 5000) && _fallbackFrom !== 'groq') {
            if (process.env.LLM_GROQ_API_KEY && retryCount === 0) {
              if (!this.groq) {
                this.ensureGroqInitialized();
              }
              if (this.groq) {
                const groqFallbackModel = process.env.LLM_NLG_MODEL_GROQ_FALLBACK || 'llama-3.3-70b-versatile';
                console.log(`   🔄 Proactively switching to Groq (${groqFallbackModel}) - ${requestCount}/15 requests used`);
                return await this.groqChatCompletion(messages, groqFallbackModel, temperature, max_tokens, tools, tool_choice, 0, 'gemini');
              }
            }
          }
          
          // If we need to wait but Groq not available, wait
          if (waitTime > 0 && retryCount === 0) {
            console.log(`   ⏳ Rate limit: Waiting ${Math.ceil(waitTime / 1000)}s before request to ${tryModel}...`);
            await new Promise(resolve => setTimeout(resolve, waitTime + 100));
          }
          
          // Create model with current try
          const currentModel = genAI.getGenerativeModel({ 
            model: tryModel,
            generationConfig: {
              temperature,
              maxOutputTokens: max_tokens,
            }
          });
          
          if (tryModel !== modelName && i === 0 && retryCount === 0) {
            // Only log if we had to try an alternative
            console.log(`   Trying alternative model: ${tryModel}`);
          }
          
          // Record request attempt
          this.recordRequest(tryModel);
          
          const result = await currentModel.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          if (tryModel !== modelName) {
            console.log(`   ✅ Successfully used model: ${tryModel}`);
          }

          // Convert Gemini response to Groq-like format
          return {
            choices: [{
              message: {
                content: text,
                role: 'assistant'
              }
            }]
          };
        } catch (error) {
          lastError = error;
          
          // Handle 429 (rate limit) - immediately fallback to Groq if available
          if (error.status === 429) {
            console.warn(`   ⚠️ Rate limit (429) for ${tryModel}, attempting fallback to Groq...`);
            
            // Try Groq fallback if available (skip long retries)
            if (process.env.LLM_GROQ_API_KEY) {
              // Ensure Groq is initialized
              if (!this.groq) {
                try {
                  this.groq = new Groq({
                    apiKey: process.env.LLM_GROQ_API_KEY
                  });
                  console.log('   ✅ Groq initialized for fallback');
                } catch (initError) {
                  console.error('   ❌ Failed to initialize Groq:', initError.message);
                }
              }
              
              if (this.groq) {
                try {
                  // Use versatile model for better parity
                  const groqFallbackModel = process.env.LLM_NLG_MODEL_GROQ_FALLBACK || 'llama-3.3-70b-versatile';
                  console.log(`   🔄 Switching to Groq (${groqFallbackModel}) to avoid Gemini rate limits`);
                  return await this.groqChatCompletion(messages, groqFallbackModel, temperature, max_tokens, tools, tool_choice, 0, 'gemini');
                } catch (groqError) {
                  // If Groq also fails with rate limit, try OpenAI
                  const isGroqRateLimit = groqError.status === 429 || (groqError.message && groqError.message.includes('rate limit'));
                  if (isGroqRateLimit && process.env.LLM_OPENAI_API_KEY) {
                    try {
                      this.ensureOpenAIInitialized();
                      console.log('   🔄 Both Gemini and Groq rate-limited, using OpenAI as final fallback');
                      const openaiModel = process.env.LLM_OPENAI_MODEL || 'gpt-4o-mini';
                      return await this.openaiChatCompletion(messages, openaiModel, temperature, max_tokens, tools, tool_choice);
                    } catch (openaiError) {
                      console.error('   ❌ OpenAI fallback also failed:', openaiError.message);
                      // Continue to try other Gemini models or retry
                    }
                  } else {
                    console.error('   ❌ Groq fallback also failed:', groqError.message);
                  }
                }
              }
            }
            
            // If Groq not available or failed, try retrying with delay (but only once)
            if (retryCount === 0) {
              // Extract retry delay from error response
              let retryDelay = 5000; // Default 5 seconds
              if (error.errorDetails) {
                const retryInfo = error.errorDetails.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
                if (retryInfo && retryInfo.retryDelay) {
                  retryDelay = Math.ceil(parseFloat(retryInfo.retryDelay) * 1000) + 1000;
                }
              }
              
              // Only retry once if no Groq fallback, then try next model
              console.warn(`   ⏳ Retrying Gemini in ${Math.ceil(retryDelay / 1000)}s... (attempt 1/1)`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              retryCount++;
              continue;
            } else {
              // Already retried, try next Gemini model
              console.warn(`   ⚠️ Rate limit persists, trying next Gemini model...`);
              break; // Break inner loop, try next model
            }
          }
          
          // Handle 404 (model not found) - try next model
          if (error.status === 404 && i < modelsToTry.length - 1) {
            console.warn(`   ⚠️ Model ${tryModel} not found (404), trying next...`);
            break; // Break inner retry loop, try next model
          }
          
          // For other errors or last model, throw
          if (i === modelsToTry.length - 1 || error.status !== 404) {
            throw error;
          }
          
          // Shouldn't reach here, but break just in case
          break;
        }
      }
    }
    
    // Should never reach here, but just in case
    throw new Error(`No valid Gemini model found. Tried: ${modelsToTry.join(', ')}. Last error: ${lastError?.message}`);
  }

  async generateEmbedding(text) {
    const embeddingProvider = process.env.LLM_EMBEDDING_PROVIDER || this.provider;
    const embeddingModel = process.env.LLM_EMBEDDING_MODEL || 'gemini-embedding-001';

    // Prefer Gemini embeddings if configured
    if (embeddingProvider === 'gemini') {
      try {
        const apiKey = process.env.LLM_GEMINI_API_KEY;
        if (!apiKey) throw new Error('LLM_GEMINI_API_KEY is not set');

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${embeddingModel}:embedContent`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: `models/${embeddingModel}`,
            content: { parts: [{ text }] }
          })
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`Gemini embeddings error: ${resp.status} ${resp.statusText} - ${errText}`);
        }

        const data = await resp.json();
        // data.embeddings[0].values is expected shape per docs
        const values = (data.embeddings && data.embeddings[0] && data.embeddings[0].values) || null;
        if (Array.isArray(values) && values.length > 0) {
          return values;
        }
        // Fallback normalize if provided in different shape
        if (Array.isArray(data.values)) return data.values;
        return this.simpleHashEmbedding(text);
      } catch (e) {
        console.error('Gemini embedding failed, falling back to simple hash:', e);
        return this.simpleHashEmbedding(text);
      }
    }

    // Groq: no public embeddings in SDK → fallback
    return this.simpleHashEmbedding(text);
  }

  async openaiChatCompletion(messages, model, temperature, max_tokens, tools, tool_choice) {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Please set LLM_OPENAI_API_KEY environment variable.');
    }

    try {
      // Convert messages to OpenAI format
      // OpenAI requires tool messages to immediately follow assistant messages with tool_calls
      // We need to clean up the message structure
      const openaiMessages = [];
      
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        if (msg.role === 'system') {
          openaiMessages.push({ role: 'system', content: msg.content });
        } else if (msg.role === 'user') {
          openaiMessages.push({ role: 'user', content: msg.content });
        } else if (msg.role === 'assistant') {
          const assistantMsg = { 
            role: 'assistant', 
            content: msg.content || (msg.tool_calls ? null : '') 
          };
          
          // Only include tool_calls if they exist
          if (msg.tool_calls && msg.tool_calls.length > 0) {
            assistantMsg.tool_calls = msg.tool_calls;
          }
          
          openaiMessages.push(assistantMsg);
        } else if (msg.role === 'tool') {
          // OpenAI requires tool messages to have a valid tool_call_id
          // Skip if tool_call_id is missing or invalid
          if (msg.tool_call_id && msg.tool_call_id !== 'default') {
            openaiMessages.push({ 
              role: 'tool', 
              content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
              tool_call_id: msg.tool_call_id
            });
          } else {
            // Skip tool messages without valid tool_call_id
            console.warn('⚠️ Skipping tool message without valid tool_call_id');
          }
        } else {
          // Include other message types as-is (but skip tool messages without proper structure)
          if (msg.role !== 'tool') {
            openaiMessages.push(msg);
          }
        }
      }
      
      // If we have tools but no tool messages, remove any orphaned tool messages
      // OpenAI requires: assistant with tool_calls → tool messages → user message
      const cleanedMessages = [];
      let pendingToolCalls = null;
      
      for (let i = 0; i < openaiMessages.length; i++) {
        const msg = openaiMessages[i];
        
        if (msg.role === 'assistant' && msg.tool_calls) {
          pendingToolCalls = msg.tool_calls;
          cleanedMessages.push(msg);
        } else if (msg.role === 'tool') {
          // Only include if we have pending tool calls
          if (pendingToolCalls) {
            cleanedMessages.push(msg);
          } else {
            console.warn('⚠️ Skipping orphaned tool message');
          }
        } else {
          // User/system messages reset pending tool calls
          if (msg.role === 'user' || msg.role === 'system') {
            pendingToolCalls = null;
          }
          cleanedMessages.push(msg);
        }
      }
      
      // Use cleaned messages
      const finalMessages = cleanedMessages.length > 0 ? cleanedMessages : openaiMessages;

      const requestOptions = {
        model: model || 'gpt-4o-mini',
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000,
        messages: finalMessages
      };

      // Add tools if provided
      if (tools && tools.length > 0) {
        requestOptions.tools = tools;
        // Convert tool_choice format
        if (tool_choice === 'required') {
          requestOptions.tool_choice = 'required';
        } else if (tool_choice === 'none') {
          requestOptions.tool_choice = 'none';
        } else if (typeof tool_choice === 'object' && tool_choice.type === 'function') {
          requestOptions.tool_choice = tool_choice;
        } else {
          requestOptions.tool_choice = 'auto';
        }
      }

      console.log(`   Using OpenAI model: ${requestOptions.model}`);
      const response = await this.openai.chat.completions.create(requestOptions);
      return response;
    } catch (error) {
      console.error('❌ OpenAI chat completion error:', error.message);
      throw error;
    }
  }

  simpleHashEmbedding(text) {
    // Simple hash-based embedding for fallback
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0);
    
    words.forEach(word => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff;
      }
      const index = Math.abs(hash) % 384;
      embedding[index] += 1;
    });
    
    // Normalize
    const sum = embedding.reduce((a, b) => a + b, 0);
    return embedding.map(val => sum > 0 ? val / sum : 0);
  }

  getProvider() {
    return this.provider;
  }

  isGroq() {
    return this.provider === 'groq';
  }

  isGemini() {
    return this.provider === 'gemini';
  }
}

export const llmProvider = new LLMProvider();
export default llmProvider;

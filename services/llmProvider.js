/**
 * LLM Provider Service
 * Configurable LLM provider that can switch between Groq and Gemini
 */

import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

class LLMProvider {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'groq'; // 'groq' or 'gemini'
    this.initializeProvider();
  }

  initializeProvider() {
    try {
      if (this.provider === 'groq') {
        this.groq = new Groq({
          apiKey: process.env.LLM_GROQ_API_KEY
        });
        console.log('✅ Groq LLM Provider initialized');
      } else if (this.provider === 'gemini') {
        this.gemini = new GoogleGenerativeAI(process.env.LLM_GEMINI_API_KEY);
        console.log('✅ Gemini LLM Provider initialized');
      } else {
        throw new Error(`Unsupported LLM provider: ${this.provider}`);
      }
    } catch (error) {
      console.error(`❌ Failed to initialize ${this.provider} provider:`, error);
      // Fallback to Groq if Gemini fails
      if (this.provider === 'gemini') {
        this.provider = 'groq';
        this.groq = new Groq({
          apiKey: process.env.LLM_GROQ_API_KEY
        });
        console.log('🔄 Fallback to Groq provider');
      }
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
  }

  normalizeModelForProvider(provider, modelName, role) {
    const isGeminiName = (name) => typeof name === 'string' && name.toLowerCase().includes('gemini');
    const isGroqName = (name) => typeof name === 'string' && (name.toLowerCase().includes('llama') || name.toLowerCase().includes('mixtral'));
    const stripLatest = (name) => (typeof name === 'string' ? name.replace(/-latest$/i, '') : name);
    modelName = stripLatest(modelName);
    if (provider === 'groq') {
      // Never send a Gemini model name to Groq
      if (isGeminiName(modelName)) {
        return process.env.LLM_NLG_MODEL_GROQ_FALLBACK || 'llama-3.3-70b-versatile';
      }
      return modelName;
    }
    if (provider === 'gemini') {
      // Never send a Groq model name to Gemini
      if (isGroqName(modelName)) {
        return (process.env.LLM_NLG_MODEL && stripLatest(process.env.LLM_NLG_MODEL)) || 'gemini-1.5-pro';
      }
      // Default for Gemini if unspecified
      return modelName || 'gemini-1.5-pro';
    }
    return modelName;
  }

  getModels() {
    if (this.provider === 'groq') {
      return {
        primary: process.env.LLM_INTENT_MODEL || 'llama-3.1-8b-instant',
        // Keep Groq-compatible model here so Groq tool/selection calls don't pick a Gemini name
        versatile: (process.env.LLM_PROVIDER_NLG === 'groq' || !process.env.LLM_PROVIDER_NLG)
          ? (process.env.LLM_NLG_MODEL || 'llama-3.3-70b-versatile')
          : 'llama-3.3-70b-versatile',
        guard: 'meta-llama/llama-guard-4-12b'
      };
    } else if (this.provider === 'gemini') {
      return {
        primary: process.env.LLM_INTENT_MODEL || 'gemini-1.5-flash-latest',
        versatile: process.env.LLM_NLG_MODEL || 'gemini-1.5-pro-latest',
        guard: 'gemini-1.5-flash-latest'
      };
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
      modelName: overrideModelName = null
    } = options;

    const resolvedProvider = overrideProvider || this.provider;
    const baseModels = this.getModels();
    let modelName = overrideModelName || baseModels[model] || baseModels.primary;
    modelName = this.normalizeModelForProvider(resolvedProvider, modelName, model);

    try {
      // Light observability to verify mixed-model behavior
      console.log(`🧠 LLM call → provider: ${resolvedProvider}, role: ${model}, model: ${modelName}`);
      if (resolvedProvider === 'groq') {
        return await this.groqChatCompletion(messages, modelName, temperature, max_tokens, tools, tool_choice);
      } else if (resolvedProvider === 'gemini') {
        try {
          this.ensureGeminiInitialized();
          return await this.geminiChatCompletion(messages, modelName, temperature, max_tokens, tools, tool_choice);
        } catch (err) {
          // If Gemini fails (e.g., 404 model), soft-fallback to Groq for this call
          console.error('Error in gemini chat completion, falling back to Groq:', err);
          if (this.groq) {
            // Use versatile large model on Groq for better parity
            const groqFallbackModel = 'llama-3.3-70b-versatile';
            return await this.groqChatCompletion(messages, groqFallbackModel, temperature, max_tokens, tools, tool_choice);
          }
          throw err;
        }
      }
    } catch (error) {
      console.error(`Error in ${this.provider} chat completion:`, error);
      throw error;
    }
  }

  async groqChatCompletion(messages, model, temperature, max_tokens, tools, tool_choice) {
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
      // Handle rate limit errors (429) - automatically fallback to Gemini if available
      if (error.status === 429 || (error.message && error.message.includes('rate limit'))) {
        console.warn('⚠️ Groq rate limit reached, attempting fallback to Gemini...');
        
        // Only fallback to Gemini if it's available and we have the API key
        if (process.env.LLM_GEMINI_API_KEY) {
          try {
            this.ensureGeminiInitialized();
            console.log('🔄 Using Gemini as fallback for rate-limited request');
            // Convert Groq model name to Gemini model name
            // IMPORTANT: Groq models (llama, mixtral) cannot be used with Gemini
            let geminiModel = 'gemini-1.5-pro'; // Safe default
            const modelLower = (model || '').toLowerCase();
            
            if (modelLower.includes('llama') || modelLower.includes('mixtral')) {
              // Definitely a Groq model - always use Gemini default
              geminiModel = 'gemini-1.5-pro';
            } else if (modelLower.includes('gemini')) {
              // Already a Gemini model name - use it (strip -latest if present)
              geminiModel = model.replace(/-latest$/i, '');
            } else {
              // Unknown model, use safe default (don't use LLM_NLG_MODEL as it might be set to Groq model)
              geminiModel = 'gemini-1.5-pro';
            }
            
            // Final safety check: never use a Groq model name with Gemini API
            const finalModelLower = geminiModel.toLowerCase();
            if (finalModelLower.includes('llama') || finalModelLower.includes('mixtral')) {
              console.warn(`   ⚠️ Safety check: Detected Groq model name "${geminiModel}", forcing Gemini default`);
              geminiModel = 'gemini-1.5-pro';
            }
            
            console.log(`   Using Gemini model: ${geminiModel} (converted from Groq model: ${model})`);
            return await this.geminiChatCompletion(messages, geminiModel, temperature, max_tokens, tools, tool_choice);
          } catch (geminiError) {
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

  async geminiChatCompletion(messages, model, temperature, max_tokens, tools, tool_choice) {
    const genAI = this.gemini;
    const genModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: max_tokens,
      }
    });

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

    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Convert Gemini response to Groq-like format
    return {
      choices: [{
        message: {
          content: text,
          role: 'assistant'
        }
      }]
    };
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

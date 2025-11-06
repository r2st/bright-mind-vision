/**
 * Advanced Intent Detection Pipeline
 * Production-grade intent detection following industry best practices
 * 
 * Pipeline: Preprocess → Multi-Features → Hierarchical Classifier → 
 *           Embedding Matching → LLM Verification → Context Refinement → Action
 */

import { llmProvider } from './llmProvider.js';
import { memoryService } from './memoryService.js';

class AdvancedIntentDetector {
  constructor() {
    this.intentPrototypes = new Map(); // Intent name → { examples, embeddings }
    this.initializeIntentPrototypes();
  }

  /**
   * STEP 1: Pre-Processing
   * Clean text, normalize punctuation, handle emojis, detect language
   */
  preprocessText(text) {
    if (!text || typeof text !== 'string') return { cleaned: '', metadata: {} };
    
    const original = text;
    
    // Extract emojis (keep meaningful ones, remove decorative)
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = text.match(emojiRegex) || [];
    const meaningfulEmojis = emojis.filter(emoji => {
      // Keep shopping-related emojis (🛍️, 💰, 🎁, etc.)
      const shoppingEmojis = ['🛍️', '💰', '🎁', '💎', '⌚', '👛', '👜', '💍', '✨', '⭐', '❤️', '👍', '👎'];
      return shoppingEmojis.includes(emoji);
    });
    
    // Normalize whitespace and punctuation
    let cleaned = text
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/[“”]/g, '"') // Smart quotes to regular
      .replace(/['']/g, "'") // Smart apostrophes
      .trim();
    
    // Normalize casing (preserve proper nouns)
    const lowercased = cleaned.toLowerCase();
    
    // Detect language (simple heuristic - can be enhanced with proper library)
    const language = this.detectLanguage(cleaned);
    
    // Extract metadata
    const metadata = {
      originalLength: original.length,
      cleanedLength: cleaned.length,
      hasEmojis: emojis.length > 0,
      meaningfulEmojis: meaningfulEmojis,
      language: language,
      hasPunctuation: /[.,!?;:]/.test(cleaned),
      wordCount: cleaned.split(/\s+/).filter(w => w.length > 0).length
    };
    
    return {
      cleaned: cleaned,
      lowercased: lowercased,
      metadata: metadata
    };
  }

  detectLanguage(text) {
    // Simple heuristic - can be enhanced with proper language detection library
    const arabicRegex = /[\u0600-\u06FF]/;
    const chineseRegex = /[\u4e00-\u9fff]/;
    
    if (arabicRegex.test(text)) return 'ar';
    if (chineseRegex.test(text)) return 'zh';
    // Default to English for now
    return 'en';
  }

  /**
   * STEP 2: Multi-Signal Encoding
   * Combine semantic embeddings, keyword features, metadata, conversation state, emotion
   */
  async encodeMultiSignals(query, state, preprocessed) {
    const signals = {};
    
    // Signal 1: Semantic Embedding
    try {
      signals.semanticEmbedding = await llmProvider.generateEmbedding(preprocessed.cleaned);
    } catch (error) {
      console.warn('⚠️ Semantic embedding generation failed:', error.message);
      signals.semanticEmbedding = null;
    }
    
    // Signal 2: Keyword Features
    signals.keywordFeatures = this.extractKeywordFeatures(preprocessed.lowercased);
    
    // Signal 3: Metadata Features
    signals.metadataFeatures = {
      length: preprocessed.metadata.wordCount,
      hasEmojis: preprocessed.metadata.hasEmojis ? 1 : 0,
      hasPunctuation: preprocessed.metadata.hasPunctuation ? 1 : 0,
      language: preprocessed.metadata.language === 'en' ? 1 : 0
    };
    
    // Signal 4: Conversation State
    signals.conversationState = {
      isFirstMessage: !state.messages || state.messages.length === 0 ? 1 : 0,
      hasProductContext: !!(state.context?.currentProduct || state.context?.recentProducts?.length) ? 1 : 0,
      hasCategoryContext: !!state.context?.lastCategory ? 1 : 0,
      messageCount: state.messages?.length || 0
    };
    
    // Signal 5: Emotion Tone (simple heuristic - can be enhanced with emotion detection model)
    signals.emotionTone = this.detectEmotionTone(preprocessed.lowercased);
    
    return signals;
  }

  extractKeywordFeatures(text) {
    const keywordCategories = {
      cart: ['cart', 'add to', 'remove', 'delete', 'empty', 'clear'],
      order: ['order', 'track', 'status', 'shipment', 'delivery'],
      return: ['return', 'refund', 'exchange'],
      product: ['product', 'item', 'bag', 'watch', 'jewelry'],
      inquiry: ['what', 'how', 'when', 'where', 'why', 'tell me', 'show me'],
      purchase: ['buy', 'purchase', 'checkout', 'pay'],
      comparison: ['compare', 'difference', 'vs', 'versus', 'better'],
      recommendation: ['recommend', 'suggest', 'which', 'should i']
    };
    
    const features = {};
    for (const [category, keywords] of Object.entries(keywordCategories)) {
      features[category] = keywords.some(kw => text.includes(kw)) ? 1 : 0;
    }
    
    return features;
  }

  detectEmotionTone(text) {
    // Simple emotion detection - can be enhanced with proper emotion model
    const positiveWords = ['love', 'great', 'amazing', 'perfect', 'excellent', 'wonderful', 'happy'];
    const negativeWords = ['hate', 'terrible', 'awful', 'bad', 'disappointed', 'angry', 'frustrated'];
    const urgentWords = ['urgent', 'asap', 'immediately', 'now', 'quickly', 'fast'];
    
    const positive = positiveWords.some(w => text.includes(w)) ? 1 : 0;
    const negative = negativeWords.some(w => text.includes(w)) ? 1 : 0;
    const urgent = urgentWords.some(w => text.includes(w)) ? 1 : 0;
    
    return { positive, negative, urgent, neutral: (positive === 0 && negative === 0 && urgent === 0) ? 1 : 0 };
  }

  /**
   * STEP 3: Hierarchical Intent Classification
   * Level 1: Broad categories → Level 2: Specific intents
   */
  async hierarchicalClassification(query, signals, state) {
    // Level 1: Classify into broad category
    const level1Categories = [
      'greeting',
      'product_discovery',
      'product_information',
      'purchase_intent',
      'order_management',
      'support_inquiry',
      'small_talk'
    ];
    
    const level1Intent = await this.classifyLevel1(query, signals, level1Categories);
    
    // Level 2: Classify into specific intent within category
    const level2Intent = await this.classifyLevel2(query, signals, level1Intent, state);
    
    return {
      level1: level1Intent,
      level2: level2Intent,
      confidence: this.calculateConfidence(signals, level1Intent, level2Intent)
    };
  }

  async classifyLevel1(query, signals, categories) {
    try {
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `Classify this query into ONE broad category: ${categories.join(', ')}.

Categories:
- greeting: Hello, hi, how are you
- product_discovery: Finding/browsing products
- product_information: Questions about specific products
- purchase_intent: Ready to buy, checkout, payment
- order_management: Orders, tracking, returns
- support_inquiry: Help, complaints, policies
- small_talk: Casual conversation

Respond with ONLY the category name.`
        },
        {
          role: 'user',
          content: query
        }
      ], {
        model: 'primary',
        temperature: 0.1,
        max_tokens: 15
      });
      
      const category = response.choices[0].message.content.trim().toLowerCase();
      return categories.includes(category) ? category : 'product_discovery';
    } catch (error) {
      console.warn('⚠️ Level 1 classification failed:', error.message);
      // Fallback based on keyword features
      if (signals.keywordFeatures.cart || signals.keywordFeatures.purchase) return 'purchase_intent';
      if (signals.keywordFeatures.order || signals.keywordFeatures.return) return 'order_management';
      return 'product_discovery';
    }
  }

  async classifyLevel2(query, signals, level1Category, state) {
    const level2Mapping = {
      'greeting': ['greeting', 'casual_conversation'],
      'product_discovery': ['product_search', 'category_browse', 'category_browse_more', 'brand_inquiry'],
      'product_information': ['product_details', 'product_attribute_inquiry', 'size_inquiry', 'product_qa', 
                             'care_instructions', 'warranty_inquiry', 'styling_advice'],
      'purchase_intent': ['cart_operation', 'checkout', 'payment_options'],
      'order_management': ['order_tracking', 'order_history', 'order_cancellation', 'return_request', 
                          'return_policy_inquiry', 'delivery_inquiry'],
      'support_inquiry': ['shipping_calculation', 'store_location', 'appointment_booking', 
                         'complaint_handling', 'loyalty_program_inquiry'],
      'small_talk': ['casual_conversation']
    };
    
    const possibleIntents = level2Mapping[level1Category] || ['product_search'];
    
    try {
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `Classify this query into ONE specific intent from: ${possibleIntents.join(', ')}.

Context: ${level1Category}

Respond with ONLY the intent name.`
        },
        {
          role: 'user',
          content: query
        }
      ], {
        model: 'primary',
        temperature: 0.1,
        max_tokens: 30
      });
      
      const intent = response.choices[0].message.content.trim().toLowerCase();
      return possibleIntents.includes(intent) ? intent : possibleIntents[0];
    } catch (error) {
      console.warn('⚠️ Level 2 classification failed:', error.message);
      return possibleIntents[0];
    }
  }

  calculateConfidence(signals, level1, level2) {
    // Simple confidence calculation based on signal strength
    let confidence = 0.5; // Base confidence
    
    // Boost if we have semantic embedding
    if (signals.semanticEmbedding) confidence += 0.2;
    
    // Boost if keyword features match
    if (level2 === 'cart_operation' && signals.keywordFeatures.cart) confidence += 0.2;
    if (level2 === 'order_tracking' && signals.keywordFeatures.order) confidence += 0.2;
    
    // Boost if context matches
    if (level2 === 'product_details' && signals.conversationState.hasProductContext) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }

  /**
   * STEP 4: Similarity Search With Intent Prototypes
   * Compare query embedding with intent prototype embeddings
   */
  async similaritySearchWithPrototypes(queryEmbedding, threshold = 0.75) {
    if (!queryEmbedding) return null;
    
    const matches = [];
    
    for (const [intent, prototype] of this.intentPrototypes.entries()) {
      if (!prototype.embedding) continue;
      
      const similarity = this.cosineSimilarity(queryEmbedding, prototype.embedding);
      
      if (similarity >= threshold) {
        matches.push({
          intent: intent,
          similarity: similarity,
          example: prototype.example
        });
      }
    }
    
    // Sort by similarity and return top match
    matches.sort((a, b) => b.similarity - a.similarity);
    
    return matches.length > 0 ? matches[0] : null;
  }

  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * STEP 5: LLM-Based Intent Verification
   * Verify if the detected intent is correct
   */
  async verifyIntent(query, detectedIntent, similarityMatch, state) {
    try {
      const response = await llmProvider.chatCompletion([
        {
          role: 'system',
          content: `Verify if the detected intent is correct for this query.

Detected intent: ${detectedIntent}
${similarityMatch ? `Similarity match: ${similarityMatch.intent} (${(similarityMatch.similarity * 100).toFixed(1)}% similar)` : ''}

Respond with ONLY one word:
- "confirm" if the intent is correct
- "reject" if the intent is wrong
- Or suggest the correct intent name if different

Example responses:
- "confirm"
- "reject"
- "product_details" (if you think it should be product_details instead)`
        },
        {
          role: 'user',
          content: query
        }
      ], {
        model: 'primary',
        temperature: 0.1,
        max_tokens: 20
      });
      
      const verification = response.choices[0].message.content.trim().toLowerCase();
      
      if (verification === 'confirm') {
        return { verified: true, intent: detectedIntent };
      } else if (verification === 'reject') {
        return { verified: false, intent: null };
      } else {
        // LLM suggested a different intent
        return { verified: false, intent: verification };
      }
    } catch (error) {
      console.warn('⚠️ Intent verification failed:', error.message);
      return { verified: true, intent: detectedIntent }; // Default to accepting
    }
  }

  /**
   * STEP 6: Conflict Resolution
   * Priority: LLM Verification > Similarity > Hierarchical Classifier > Keywords
   */
  resolveConflict(hierarchicalResult, similarityMatch, verificationResult, keywordFallback) {
    // Priority 1: LLM Verification
    if (verificationResult && verificationResult.verified && verificationResult.intent) {
      return {
        intent: verificationResult.intent,
        source: 'llm_verification',
        confidence: 0.95
      };
    }
    
    // Priority 2: Similarity Match
    if (similarityMatch && similarityMatch.similarity >= 0.75) {
      return {
        intent: similarityMatch.intent,
        source: 'similarity_match',
        confidence: similarityMatch.similarity
      };
    }
    
    // Priority 3: Hierarchical Classifier
    if (hierarchicalResult && hierarchicalResult.level2) {
      return {
        intent: hierarchicalResult.level2,
        source: 'hierarchical_classifier',
        confidence: hierarchicalResult.confidence
      };
    }
    
    // Priority 4: Keyword Fallback
    return {
      intent: keywordFallback || 'product_search',
      source: 'keyword_fallback',
      confidence: 0.5
    };
  }

  /**
   * STEP 7: Context-Aware Intent Refinement
   * Refine intent based on conversation history
   */
  refineWithContext(intent, query, state) {
    const memoryContext = memoryService.getConversationContext(state.conversationId, state.customerId);
    
    // Example: If last message was about stress, and current is "something natural?"
    // Refine to "organic stress-relief products"
    if (state.messages && state.messages.length > 0) {
      const lastUserMessage = state.messages
        .filter(m => m.role === 'user')
        .slice(-1)[0]?.content?.toLowerCase() || '';
      
      if (lastUserMessage.includes('stress') && query.toLowerCase().includes('natural')) {
        return 'product_search'; // Refined to search for organic stress products
      }
      
      if (lastUserMessage.includes('product') && query.toLowerCase().includes('more')) {
        return 'product_follow_up';
      }
    }
    
    return intent;
  }

  /**
   * Initialize Intent Prototypes with Golden Examples
   */
  async initializeIntentPrototypes() {
    const prototypes = {
      'product_details': { example: 'tell me more about Chanel Classic Flap Bag', embedding: null },
      'product_search': { example: 'show me luxury handbags', embedding: null },
      'cart_operation': { example: 'add to cart', embedding: null },
      'order_tracking': { example: 'where is my order', embedding: null },
      'size_inquiry': { example: 'what size should I get', embedding: null },
      'gift_recommendation': { example: 'good gift for my wife', embedding: null },
      'product_comparison': { example: 'compare these two products', embedding: null },
      'greeting': { example: 'hello, how are you', embedding: null }
    };
    
    // Generate embeddings for prototypes
    for (const [intent, prototype] of Object.entries(prototypes)) {
      try {
        prototype.embedding = await llmProvider.generateEmbedding(prototype.example);
        this.intentPrototypes.set(intent, prototype);
      } catch (error) {
        console.warn(`⚠️ Failed to generate embedding for intent prototype: ${intent}`, error.message);
      }
    }
    
    console.log(`✅ Initialized ${this.intentPrototypes.size} intent prototypes`);
  }

  /**
   * STEP 8: Main Detection Pipeline
   */
  async detectIntent(query, state) {
    const startTime = Date.now();
    
    // Step 1: Preprocess
    const preprocessed = this.preprocessText(query);
    
    // Step 2: Multi-signal encoding
    const signals = await this.encodeMultiSignals(query, state, preprocessed);
    
    // Step 3: Hierarchical classification
    const hierarchicalResult = await this.hierarchicalClassification(preprocessed.cleaned, signals, state);
    
    // Step 4: Similarity search with prototypes
    const similarityMatch = signals.semanticEmbedding 
      ? await this.similaritySearchWithPrototypes(signals.semanticEmbedding, 0.75)
      : null;
    
    // Step 5: LLM verification
    const verificationResult = await this.verifyIntent(
      preprocessed.cleaned,
      hierarchicalResult.level2,
      similarityMatch,
      state
    );
    
    // Step 6: Conflict resolution
    const keywordFallback = this.getKeywordFallback(preprocessed.lowercased, signals);
    const resolvedIntent = this.resolveConflict(
      hierarchicalResult,
      similarityMatch,
      verificationResult,
      keywordFallback
    );
    
    // Step 7: Context-aware refinement
    const finalIntent = this.refineWithContext(resolvedIntent.intent, query, state);
    
    const duration = Date.now() - startTime;
    
    return {
      intent: finalIntent,
      confidence: resolvedIntent.confidence,
      source: resolvedIntent.source,
      level1: hierarchicalResult.level1,
      metadata: {
        preprocessing: preprocessed.metadata,
        signals: {
          hasSemanticEmbedding: !!signals.semanticEmbedding,
          keywordFeatures: signals.keywordFeatures,
          emotionTone: signals.emotionTone
        },
        similarityMatch: similarityMatch ? {
          intent: similarityMatch.intent,
          similarity: similarityMatch.similarity
        } : null,
        verification: verificationResult,
        duration: `${duration}ms`
      }
    };
  }

  getKeywordFallback(text, signals) {
    if (signals.keywordFeatures.cart) return 'cart_operation';
    if (signals.keywordFeatures.order) return 'order_tracking';
    if (signals.keywordFeatures.return) return 'return_policy_inquiry';
    if (text.includes('size') || text.includes('fit')) return 'size_inquiry';
    if (text.includes('gift')) return 'gift_recommendation';
    if (text.includes('compare')) return 'product_comparison';
    return 'product_search';
  }

  /**
   * STEP 9: Feedback Loop (for future implementation)
   */
  logIntentDetection(query, detectedIntent, userCorrection = null, success = true) {
    // TODO: Implement logging to database/analytics
    console.log(`📊 Intent Detection Log:`, {
      query: query.substring(0, 100),
      detectedIntent,
      userCorrection,
      success,
      timestamp: new Date().toISOString()
    });
  }
}

export const advancedIntentDetector = new AdvancedIntentDetector();


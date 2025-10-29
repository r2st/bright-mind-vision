// Production-Grade Agent Orchestrator
// Implements the recommended architecture with strict data flow

import { HybridRetrievalService } from './hybridRetrievalService.js';
import { RerankerService } from './rerankerService.js';
import { ConstrainedResponseComposer } from './constrainedResponseComposer.js';

export class ProductionAgentOrchestrator {
  constructor() {
    this.retrievalService = new HybridRetrievalService();
    this.rerankerService = new RerankerService();
    this.responseComposer = new ConstrainedResponseComposer();
    this.region = "UAE";
    this.currency = "AED";
  }

  // Main processing pipeline
  async processQuery(userQuery, context = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`🎯 Processing query: "${userQuery}"`);
      
      // Step 1: NLU (Natural Language Understanding)
      const nluResult = await this.processNLU(userQuery, context);
      console.log(`📋 NLU Result:`, nluResult);
      
      // Step 2: Hybrid Retrieval
      const candidates = await this.retrieveProducts(nluResult);
      console.log(`🔍 Retrieved ${candidates?.length || 0} candidates`);
      
      // Step 3: Reranking
      const rerankedProducts = await this.rerankProducts(userQuery, candidates || [], nluResult.quickReplyNumber);
      console.log(`📊 Reranked to ${rerankedProducts?.length || 0} products`);
      
      // Step 4: Policy/Eligibility Filter
      const eligibleProducts = this.applyPolicyFilter(rerankedProducts || []);
      console.log(`✅ ${eligibleProducts?.length || 0} products passed policy filter`);
      
      // Step 5: Constrained Response Generation
      const response = this.responseComposer.composeResponse(
        userQuery, 
        eligibleProducts, 
        nluResult.quickReplyNumber
      );
      
      // Step 6: Validation
      const validation = this.responseComposer.validateResponse(response);
      if (!validation.isValid) {
        console.warn(`⚠️ Response validation issues:`, validation.issues);
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        response,
        metadata: {
          ...response.metadata,
          processingTime,
          nluResult,
          candidatesCount: candidates.length,
          rerankedCount: rerankedProducts.length,
          eligibleCount: eligibleProducts.length,
          validation
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Production Agent Error:', error);
      return {
        success: false,
        error: error.message,
        response: this.responseComposer.createNoResultsResponse(userQuery),
        metadata: {
          processingTime: Date.now() - startTime,
          error: error.message
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // NLU Processing (simplified for MVP)
  async processNLU(query, context) {
    const queryLower = query.toLowerCase().trim();
    
    // Quick reply detection
    if (/^[1-4]$/.test(queryLower)) {
      const quickReplyNumber = parseInt(queryLower);
      return {
        intent: 'quick_reply',
        quickReplyNumber,
        category: this.getCategoryForQuickReply(quickReplyNumber),
        facets: {},
        query_terms: this.getQueryTermsForQuickReply(quickReplyNumber),
        top_k: 20
      };
    }
    
    // Intent detection
    let intent = 'product_search';
    if (queryLower.includes('help') || queryLower.includes('support')) {
      intent = 'help';
    } else if (queryLower.includes('compare')) {
      intent = 'compare';
    } else if (queryLower.includes('buy') || queryLower.includes('purchase')) {
      intent = 'purchase';
    }
    
    // Category detection
    let category = null;
    if (queryLower.includes('bags') || queryLower.includes('handbags')) {
      category = 'Bags';
    } else if (queryLower.includes('watches') || queryLower.includes('timepiece')) {
      category = 'Watches';
    } else if (queryLower.includes('jewelry') || queryLower.includes('jewellery')) {
      category = 'Jewelry';
    } else if (queryLower.includes('skincare') || queryLower.includes('beauty')) {
      category = 'Skincare';
    } else if (queryLower.includes('wellness') || queryLower.includes('spa')) {
      category = 'Wellness';
    }
    
    // Brand detection
    const brands = [];
    const brandKeywords = ['chanel', 'hermes', 'louis vuitton', 'rolex', 'bulgari', 'la mer', 'gucci'];
    brandKeywords.forEach(brand => {
      if (queryLower.includes(brand)) {
        brands.push(brand);
      }
    });
    
    // Price range detection
    let priceMin = null;
    let priceMax = null;
    const priceMatch = queryLower.match(/(\d+)\s*-\s*(\d+)/);
    if (priceMatch) {
      priceMin = parseInt(priceMatch[1]);
      priceMax = parseInt(priceMatch[2]);
    } else {
      const underMatch = queryLower.match(/under\s*(\d+)/);
      if (underMatch) {
        priceMax = parseInt(underMatch[1]);
      }
    }
    
    return {
      intent,
      category,
      facets: {
        brand: brands,
        price_min_aed: priceMin,
        price_max_aed: priceMax
      },
      query_terms: queryLower.split(/\s+/).filter(term => term.length > 1),
      top_k: 60
    };
  }

  getCategoryForQuickReply(quickReplyNumber) {
    const mappings = {
      1: 'Bags',
      2: 'Skincare', 
      3: 'Wellness',
      4: null
    };
    return mappings[quickReplyNumber];
  }

  getQueryTermsForQuickReply(quickReplyNumber) {
    const mappings = {
      1: ['luxury', 'handbags', 'bags'],
      2: ['luxury', 'skincare', 'beauty'],
      3: ['wellness', 'relaxation', 'spa'],
      4: ['luxury', 'products']
    };
    return mappings[quickReplyNumber] || [];
  }

  // Hybrid retrieval
  async retrieveProducts(nluResult) {
    try {
      const { category, facets, query_terms, top_k } = nluResult;
      
      if (nluResult.quickReplyNumber) {
        return this.retrievalService.searchByQuickReply(nluResult.quickReplyNumber, top_k);
      }
      
      const query = query_terms.join(' ');
      return this.retrievalService.hybridSearch(query, {
        category,
        brand: facets.brand?.[0],
        priceMin: facets.price_min_aed,
        priceMax: facets.price_max_aed,
        topK: top_k,
        region: this.region
      });
    } catch (error) {
      console.error('❌ Error in retrieveProducts:', error);
      return [];
    }
  }

  // Reranking
  async rerankProducts(query, candidates, quickReplyNumber) {
    if (quickReplyNumber) {
      return this.rerankerService.rerankForQuickReply(quickReplyNumber, candidates);
    }
    
    return this.rerankerService.rerank(query, candidates, 12);
  }

  // Policy/Eligibility filter
  applyPolicyFilter(products) {
    return products.filter(product => {
      // Must be in stock
      if (!product.product.availability.in_stock) return false;
      
      // Must be available in UAE
      if (!product.product.availability.region.includes(this.region)) return false;
      
      // Must have valid price
      if (!product.product.price || !product.product.price.amount || product.product.price.amount <= 0) return false;
      
      // Must have valid currency (AED)
      if (product.product.price.currency !== this.currency) return false;
      
      return true;
    });
  }

  // Quick reply processing
  async processQuickReply(quickReplyNumber) {
    return this.processQuery(quickReplyNumber.toString(), { quickReply: true });
  }

  // Direct product search
  async searchProducts(query, options = {}) {
    const nluResult = await this.processNLU(query);
    return this.processQuery(query, { ...nluResult, ...options });
  }
}

export default ProductionAgentOrchestrator;

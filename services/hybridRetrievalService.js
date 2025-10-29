// Hybrid Retrieval Service - BM25 + Vector Search
// Implements the recommended architecture for production-grade product search

import { normalizedProductCatalog } from '../data/normalizedProductCatalog.js';

export class HybridRetrievalService {
  constructor() {
    try {
      this.catalog = normalizedProductCatalog || [];
      this.initializeIndexes();
    } catch (error) {
      console.error('❌ Error initializing HybridRetrievalService:', error);
      this.catalog = [];
      this.termIndex = {};
      this.categoryIndex = {};
      this.brandIndex = {};
    }
  }

  initializeIndexes() {
    try {
      // Create BM25-style term frequency indexes
      this.termIndex = this.buildTermIndex();
      this.categoryIndex = this.buildCategoryIndex();
      this.brandIndex = this.buildBrandIndex();
    } catch (error) {
      console.error('❌ Error initializing indexes:', error);
      this.termIndex = {};
      this.categoryIndex = {};
      this.brandIndex = {};
    }
  }

  buildTermIndex() {
    try {
      const index = {};
      if (!this.catalog || !Array.isArray(this.catalog)) {
        console.error('❌ Catalog is not an array:', this.catalog);
        return index;
      }
      
      this.catalog.forEach((product, docId) => {
        try {
          const terms = this.extractTerms(product);
          if (terms && Array.isArray(terms)) {
            terms.forEach(term => {
              if (!index[term]) {
                index[term] = new Set();
              }
              index[term].add(docId);
            });
          }
        } catch (error) {
          console.error(`❌ Error processing product ${docId}:`, error);
        }
      });
      return index;
    } catch (error) {
      console.error('❌ Error in buildTermIndex:', error);
      return {};
    }
  }

  buildCategoryIndex() {
    try {
      const index = {};
      if (!this.catalog || !Array.isArray(this.catalog)) {
        console.error('❌ Catalog is not an array:', this.catalog);
        return index;
      }
      
      this.catalog.forEach((product, docId) => {
        try {
          if (product.category && Array.isArray(product.category)) {
            product.category.forEach(cat => {
              const normalizedCat = cat.toLowerCase();
              if (!index[normalizedCat]) {
                index[normalizedCat] = new Set();
              }
              index[normalizedCat].add(docId);
            });
          }
        } catch (error) {
          console.error(`❌ Error processing product category ${docId}:`, error);
        }
      });
      return index;
    } catch (error) {
      console.error('❌ Error in buildCategoryIndex:', error);
      return {};
    }
  }

  buildBrandIndex() {
    try {
      const index = {};
      if (!this.catalog || !Array.isArray(this.catalog)) {
        console.error('❌ Catalog is not an array:', this.catalog);
        return index;
      }
      
      this.catalog.forEach((product, docId) => {
        try {
          if (product.brand) {
            const brand = product.brand.toLowerCase();
            if (!index[brand]) {
              index[brand] = new Set();
            }
            index[brand].add(docId);
          }
        } catch (error) {
          console.error(`❌ Error processing product brand ${docId}:`, error);
        }
      });
      return index;
    } catch (error) {
      console.error('❌ Error in buildBrandIndex:', error);
      return {};
    }
  }

  extractTerms(product) {
    try {
      if (!product) return [];
      
      const text = [
        product.title || '',
        product.brand || '',
        product.description || '',
        ...(product.tags || []),
        ...(product.category || []),
        ...Object.values(product.attributes || {}).filter(v => typeof v === 'string')
      ].join(' ').toLowerCase();
      
      return text.split(/\s+/).filter(term => term.length > 2);
    } catch (error) {
      console.error('❌ Error in extractTerms:', error);
      return [];
    }
  }

  // BM25 Scoring (simplified version)
  calculateBM25Score(queryTerms, product, docId) {
    try {
      const productTerms = this.extractTerms(product);
      const termFreq = {};
      productTerms.forEach(term => {
        termFreq[term] = (termFreq[term] || 0) + 1;
      });

      let score = 0;
      const k1 = 1.2;
      const b = 0.75;
      const avgDocLength = this.catalog.reduce((sum, p) => sum + this.extractTerms(p).length, 0) / this.catalog.length;
      const docLength = productTerms.length;

    queryTerms.forEach(term => {
      const tf = termFreq[term] || 0;
      if (tf > 0) {
        const idf = Math.log(this.catalog.length / (this.getTermDocumentCount(term) + 1));
        const bm25 = idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLength / avgDocLength)));
        score += bm25;
      }
    });

    return score;
    } catch (error) {
      console.error('❌ Error in calculateBM25Score:', error);
      return 0;
    }
  }

  getTermDocumentCount(term) {
    try {
      return this.termIndex[term]?.size || 0;
    } catch (error) {
      console.error('❌ Error in getTermDocumentCount:', error);
      return 0;
    }
  }

  // Vector similarity (simplified - in production use proper embeddings)
  calculateVectorScore(queryTerms, product) {
    try {
      const productTerms = this.extractTerms(product);
      const querySet = new Set(queryTerms);
      const productSet = new Set(productTerms);
      
      const intersection = new Set([...querySet].filter(x => productSet.has(x)));
      const union = new Set([...querySet, ...productSet]);
      
      return intersection.size / union.size; // Jaccard similarity
    } catch (error) {
      console.error('❌ Error in calculateVectorScore:', error);
      return 0;
    }
  }

  // Hybrid search combining BM25 and Vector scores
  hybridSearch(query, options = {}) {
    try {
      const {
        category = null,
        brand = null,
        priceMin = null,
        priceMax = null,
        topK = 60,
        region = "UAE"
      } = options;

      if (!this.catalog || !Array.isArray(this.catalog)) {
        console.error('❌ Catalog is not available for search');
        return [];
      }

      const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
    
    // Step 1: Apply hard filters
    let candidates = this.catalog.filter(product => {
      // Region filter
      if (!product.availability.region.includes(region)) return false;
      
      // Stock filter
      if (!product.availability.in_stock) return false;
      
      // Category filter
      if (category && !product.category.some(cat => 
        cat.toLowerCase().includes(category.toLowerCase())
      )) return false;
      
      // Brand filter
      if (brand && !product.brand.toLowerCase().includes(brand.toLowerCase())) return false;
      
      // Price filter
      if (priceMin && (!product.price || !product.price.amount || product.price.amount < priceMin)) return false;
      if (priceMax && (!product.price || !product.price.amount || product.price.amount > priceMax)) return false;
      
      return true;
    });

    // Step 2: Calculate hybrid scores
    const scoredCandidates = candidates.map((product, index) => {
      const bm25Score = this.calculateBM25Score(queryTerms, product, index);
      const vectorScore = this.calculateVectorScore(queryTerms, product);
      
      // Weighted combination (BM25: 0.6, Vector: 0.4)
      const hybridScore = (bm25Score * 0.6) + (vectorScore * 0.4);
      
      // Boost scores for exact matches
      let boost = 1.0;
      if (product.title.toLowerCase().includes(query.toLowerCase())) boost += 0.3;
      if (product.brand.toLowerCase().includes(query.toLowerCase())) boost += 0.2;
      if (product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) boost += 0.1;
      
      return {
        product,
        bm25Score,
        vectorScore,
        hybridScore: hybridScore * boost,
        sku: product.sku,
        source: 'hybrid_search',
        updated_at: product.updated_at
      };
    });

    // Step 3: Sort by hybrid score and return top K
    return scoredCandidates
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, topK);
    } catch (error) {
      console.error('❌ Error in hybridSearch:', error);
      return [];
    }
  }

  // Category-specific search
  searchByCategory(category, query = "", topK = 20) {
    return this.hybridSearch(query, { category, topK });
  }

  // Brand-specific search
  searchByBrand(brand, query = "", topK = 20) {
    return this.hybridSearch(query, { brand, topK });
  }

  // Price range search
  searchByPriceRange(minPrice, maxPrice, query = "", topK = 20) {
    return this.hybridSearch(query, { priceMin: minPrice, priceMax: maxPrice, topK });
  }

  // Quick reply mapping
  searchByQuickReply(quickReplyNumber, topK = 20) {
    try {
      const mappings = {
        1: { category: "Bags", query: "luxury handbags" },
        2: { category: "Skincare", query: "luxury skincare" },
        3: { category: "Wellness", query: "wellness relaxation" },
        4: { query: "luxury products" }
      };
      
      const mapping = mappings[quickReplyNumber];
      if (!mapping) return [];
      
      return this.hybridSearch(mapping.query, { 
        category: mapping.category, 
        topK 
      });
    } catch (error) {
      console.error('❌ Error in searchByQuickReply:', error);
      return [];
    }
  }
}

export default HybridRetrievalService;

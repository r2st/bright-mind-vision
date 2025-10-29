// Reranker Service - Cross-Encoder for Better Product Selection
// Implements MMR (Maximal Marginal Relevance) for diversity

export class RerankerService {
  constructor() {
    this.diversityWeight = 0.3; // Balance between relevance and diversity
  }

  // Cross-encoder style reranking (simplified for MVP)
  async rerank(query, candidates, topK = 12) {
    if (!candidates || candidates.length === 0) return [];

    // Calculate relevance scores for each candidate
    const scoredCandidates = candidates.map(candidate => ({
      ...candidate,
      relevanceScore: this.calculateRelevanceScore(query, candidate.product)
    }));

    // Sort by relevance first
    scoredCandidates.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply MMR for diversity
    const reranked = this.maximalMarginalRelevance(scoredCandidates, topK);

    return reranked.map((item, index) => ({
      ...item,
      finalRank: index + 1,
      confidence: this.calculateConfidence(item.relevanceScore, index)
    }));
  }

  calculateRelevanceScore(query, product) {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 1);
    
    let score = 0;
    
    // Exact title match gets highest score
    if (product.title.toLowerCase().includes(queryLower)) {
      score += 0.4;
    }
    
    // Brand exact match gets high score
    if (product.brand.toLowerCase().includes(queryLower)) {
      score += 0.3;
    }
    
    // Category matches
    const categoryMatch = product.category.some(cat => 
      cat.toLowerCase().includes(queryLower)
    );
    if (categoryMatch) {
      score += 0.2;
    }
    
    // Tag matches
    const tagMatches = product.tags.filter(tag => 
      tag.toLowerCase().includes(queryLower)
    ).length;
    score += tagMatches * 0.05;
    
    // Attribute matches
    const attributeMatches = Object.values(product.attributes).filter(attr => 
      typeof attr === 'string' && attr.toLowerCase().includes(queryLower)
    ).length;
    score += attributeMatches * 0.03;
    
    // Term-based scoring
    queryTerms.forEach(term => {
      if (product.title.toLowerCase().includes(term)) score += 0.1;
      if (product.brand.toLowerCase().includes(term)) score += 0.08;
      if (product.description.toLowerCase().includes(term)) score += 0.05;
      
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(term)) score += 0.03;
      });
    });
    
    // Boost for luxury brands
    const luxuryBrands = ['chanel', 'hermes', 'louis vuitton', 'rolex', 'bulgari', 'la mer'];
    if (luxuryBrands.some(brand => product.brand.toLowerCase().includes(brand))) {
      score += 0.1;
    }
    
    // Boost for high ratings
    if (product.rating >= 4.5) {
      score += 0.05;
    }
    
    return Math.min(score, 1.0);
  }

  // Maximal Marginal Relevance for diversity
  maximalMarginalRelevance(candidates, topK) {
    if (candidates.length <= topK) return candidates;
    
    const selected = [];
    const remaining = [...candidates];
    
    // Always select the top candidate
    selected.push(remaining.shift());
    
    while (selected.length < topK && remaining.length > 0) {
      let bestCandidate = null;
      let bestScore = -1;
      let bestIndex = -1;
      
      remaining.forEach((candidate, index) => {
        const relevanceScore = candidate.relevanceScore;
        const diversityScore = this.calculateDiversityScore(candidate, selected);
        const mmrScore = (1 - this.diversityWeight) * relevanceScore + 
                        this.diversityWeight * diversityScore;
        
        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestCandidate = candidate;
          bestIndex = index;
        }
      });
      
      if (bestCandidate) {
        selected.push(bestCandidate);
        remaining.splice(bestIndex, 1);
      } else {
        break;
      }
    }
    
    return selected;
  }

  calculateDiversityScore(candidate, selected) {
    if (selected.length === 0) return 1.0;
    
    const candidateBrand = candidate.product.brand.toLowerCase();
    const candidateCategory = candidate.product.category[0].toLowerCase();
    const candidatePrice = candidate.product.price?.amount || 0;
    
    let maxSimilarity = 0;
    
    selected.forEach(selectedItem => {
      const selectedBrand = selectedItem.product.brand.toLowerCase();
      const selectedCategory = selectedItem.product.category[0].toLowerCase();
      const selectedPrice = selectedItem.product.price?.amount || 0;
      
      let similarity = 0;
      
      // Brand similarity
      if (candidateBrand === selectedBrand) similarity += 0.4;
      
      // Category similarity
      if (candidateCategory === selectedCategory) similarity += 0.3;
      
      // Price similarity (normalized)
      const priceDiff = Math.abs(candidatePrice - selectedPrice);
      const maxPrice = Math.max(candidatePrice, selectedPrice);
      if (maxPrice > 0) {
        similarity += (1 - priceDiff / maxPrice) * 0.3;
      }
      
      maxSimilarity = Math.max(maxSimilarity, similarity);
    });
    
    return 1 - maxSimilarity; // Higher diversity = lower similarity
  }

  calculateConfidence(relevanceScore, rank) {
    // Confidence decreases with rank and increases with relevance
    const rankPenalty = rank * 0.05;
    const confidence = Math.max(0.1, relevanceScore - rankPenalty);
    return Math.min(confidence, 1.0);
  }

  // Quick reply specific reranking
  rerankForQuickReply(quickReplyNumber, candidates) {
    const mappings = {
      1: { preferredBrands: ['Chanel', 'Hermès', 'Louis Vuitton', 'Gucci'], category: 'Bags' },
      2: { preferredBrands: ['La Mer', 'SK-II', 'Chanel'], category: 'Skincare' },
      3: { preferredBrands: ['Aromatherapy Associates', 'Jo Malone', 'This Works'], category: 'Wellness' },
      4: { preferredBrands: [], category: null } // All products
    };
    
    const mapping = mappings[quickReplyNumber];
    if (!mapping) return this.rerank("", candidates);
    
    // Boost preferred brands and categories
    const boostedCandidates = candidates.map(candidate => {
      let boost = 1.0;
      
      if (mapping.preferredBrands.length > 0) {
        const brandMatch = mapping.preferredBrands.some(brand => 
          candidate.product.brand.toLowerCase().includes(brand.toLowerCase())
        );
        if (brandMatch) boost += 0.3;
      }
      
      if (mapping.category) {
        const categoryMatch = candidate.product.category.some(cat => 
          cat.toLowerCase().includes(mapping.category.toLowerCase())
        );
        if (categoryMatch) boost += 0.2;
      }
      
      return {
        ...candidate,
        hybridScore: candidate.hybridScore * boost
      };
    });
    
    return this.rerank("", boostedCandidates);
  }
}

export default RerankerService;

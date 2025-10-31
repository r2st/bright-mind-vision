/**
 * Synonym Service for Enhanced Text Search
 * Provides synonym expansion and query enhancement
 */

class SynonymService {
  constructor() {
    this.synonyms = {
      // Handbags
      'bag': ['handbag', 'purse', 'tote', 'clutch', 'satchel', 'crossbody', 'shoulder bag', 'evening bag'],
      'handbag': ['bag', 'purse', 'tote', 'clutch', 'satchel', 'crossbody'],
      'purse': ['bag', 'handbag', 'tote', 'clutch', 'satchel'],
      'tote': ['bag', 'handbag', 'purse', 'shopper'],
      'clutch': ['bag', 'handbag', 'purse', 'evening bag'],
      
      // Watches
      'watch': ['timepiece', 'wristwatch', 'chronograph', 'timepiece'],
      'timepiece': ['watch', 'wristwatch', 'chronograph'],
      'wristwatch': ['watch', 'timepiece'],
      
      // Jewelry
      'jewelry': ['jewellery', 'accessories', 'pieces', 'ornaments'],
      'jewellery': ['jewelry', 'accessories', 'pieces'],
      'necklace': ['pendant', 'chain', 'choker'],
      'ring': ['band', 'signet ring', 'engagement ring'],
      'bracelet': ['bangle', 'cuff', 'chain bracelet'],
      'earring': ['earrings', 'studs', 'hoops', 'drops'],
      
      // Skincare
      'skincare': ['skin care', 'skin treatment', 'facial care', 'beauty products'],
      'skin care': ['skincare', 'skin treatment', 'facial care'],
      'serum': ['treatment', 'essence', 'concentrate'],
      'cream': ['moisturizer', 'lotion', 'balm'],
      'moisturizer': ['cream', 'lotion', 'hydrating cream'],
      
      // Wellness
      'wellness': ['health', 'spa', 'relaxation', 'self-care'],
      'spa': ['wellness', 'relaxation', 'treatment'],
      'candle': ['scented candle', 'aromatherapy', 'fragrance'],
      
      // Brands (common misspellings)
      'chanel': ['chanell', 'coco chanel'],
      'hermes': ['hermès', 'hermes paris'],
      'louis vuitton': ['lv', 'louis vuitton'],
      'cartier': ['cartier paris'],
      
      // Luxury terms
      'luxury': ['premium', 'high-end', 'designer', 'exclusive'],
      'premium': ['luxury', 'high-end', 'designer'],
      'designer': ['luxury', 'premium', 'high-end'],
      'elegant': ['sophisticated', 'refined', 'classy'],
      'sophisticated': ['elegant', 'refined', 'classy'],
      
      // Colors
      'black': ['ebony', 'onyx', 'jet black'],
      'white': ['ivory', 'pearl', 'cream'],
      'gold': ['golden', 'yellow gold', 'rose gold'],
      
      // Product types
      'evening': ['formal', 'night', 'gala'],
      'casual': ['everyday', 'daytime', 'informal'],
      'classic': ['timeless', 'traditional', 'vintage'],
    };
    
    // Build reverse lookup for faster expansion
    this.reverseLookup = this.buildReverseLookup();
  }

  buildReverseLookup() {
    const lookup = new Map();
    for (const [key, values] of Object.entries(this.synonyms)) {
      // Add main term
      if (!lookup.has(key)) {
        lookup.set(key.toLowerCase(), [key, ...values]);
      }
      // Add each synonym
      values.forEach(synonym => {
        if (!lookup.has(synonym.toLowerCase())) {
          lookup.set(synonym.toLowerCase(), [synonym, key, ...values.filter(v => v !== synonym)]);
        }
      });
    }
    return lookup;
  }

  /**
   * Expand query with synonyms
   * @param {string} query - Original query
   * @returns {Array} Array of expanded query terms
   */
  expandQuery(query) {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const words = queryLower.split(/\s+/);
    const expandedTerms = new Set([queryLower]); // Include original query

    // Expand individual words
    words.forEach(word => {
      const synonyms = this.reverseLookup.get(word);
      if (synonyms) {
        synonyms.forEach(syn => expandedTerms.add(syn.toLowerCase()));
      }
    });

    // Expand multi-word phrases
    if (words.length > 1) {
      const phrase = queryLower;
      const phraseSynonyms = this.reverseLookup.get(phrase);
      if (phraseSynonyms) {
        phraseSynonyms.forEach(syn => expandedTerms.add(syn.toLowerCase()));
      }
    }

    return Array.from(expandedTerms);
  }

  /**
   * Check if two terms are synonyms
   */
  areSynonyms(term1, term2) {
    const t1 = term1.toLowerCase();
    const t2 = term2.toLowerCase();
    
    if (t1 === t2) return true;
    
    const synonyms1 = this.reverseLookup.get(t1) || [];
    const synonyms2 = this.reverseLookup.get(t2) || [];
    
    return synonyms1.includes(t2) || synonyms2.includes(t1);
  }

  /**
   * Get all synonyms for a term
   */
  getSynonyms(term) {
    const termLower = term.toLowerCase();
    return this.reverseLookup.get(termLower) || [term];
  }

  /**
   * Enhance search score based on synonym matches
   */
  enhanceScore(product, query, baseScore) {
    const queryLower = query.toLowerCase();
    const title = (product.title || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    
    // Check for synonym matches
    const queryWords = queryLower.split(/\s+/);
    let synonymBonus = 0;
    
    queryWords.forEach(word => {
      const synonyms = this.getSynonyms(word);
      
      synonyms.forEach(synonym => {
        if (title.includes(synonym)) {
          synonymBonus += 3; // Boost for synonym match in title
        }
        if (description.includes(synonym)) {
          synonymBonus += 1; // Boost for synonym match in description
        }
        if (brand.includes(synonym)) {
          synonymBonus += 2; // Boost for synonym match in brand
        }
      });
    });
    
    return baseScore + synonymBonus;
  }
}

// Export singleton
export const synonymService = new SynonymService();
export default synonymService;


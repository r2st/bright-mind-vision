/**
 * Web Search Detector Service
 * Intelligently determines when web search is needed vs. database-only
 */

class WebSearchDetector {
  constructor() {
    // Patterns that indicate web search is needed
    this.webSearchPatterns = [
      // Reviews and opinions
      /(latest|recent|current|what are|how are).*review/i,
      /(what do|what are|how do).*think|say|opinion/i,
      /(customer|user|people).*review/i,
      /(is|are).*good|worth|worth it/i,
      
      // Comparisons
      /compare.*with|vs|versus/i,
      /(better|best|difference).*between/i,
      /(which|what).*better/i,
      
      // Trends and updates
      /(latest|new|recent|updated|current).*model|version|edition/i,
      /(what's|what is).*new/i,
      /(still|still in).*fashion|trend|style/i,
      /(latest|current).*trend|fashion/i,
      
      // External validation
      /(what do|what are).*experts|critics|bloggers/i,
      /(expert|professional).*opinion|review/i,
      /(vogue|harpers|fashionista|gq|esquire).*say|review/i,
      
      // Real-world usage
      /(how|what).*people.*use|wearing|carrying/i,
      /(real|actual).*experience|review/i,
      
      // Price comparisons
      /(cheaper|price).*elsewhere|other|competitor/i,
      /(market|resale).*value|price/i,
      
      // Availability and stock
      /(where|can i).*buy|find|get/i,
      /(available|in stock).*elsewhere|other/i,
    ];

    // Patterns that indicate database-only is sufficient
    this.databaseOnlyPatterns = [
      // Basic specs
      /(what|tell me).*size|dimension|weight|measurement/i,
      /(what|tell me).*color|material|fabric/i,
      /(what|tell me).*features|specification|specs/i,
      
      // Price and availability
      /(what|how much).*price|cost/i,
      /(is|are).*available|in stock/i,
      
      // Basic info
      /(what is|tell me about|describe)/i,
      /(features|characteristics|attributes)/i,
      
      // Care instructions
      /(how|what).*care|clean|maintain/i,
      /(warranty|guarantee)/i,
    ];

    // Keywords that strongly suggest web search
    this.webSearchKeywords = [
      'review', 'reviews', 'opinion', 'compare', 'comparison',
      'vs', 'versus', 'better', 'best', 'latest', 'trend',
      'expert', 'critic', 'blogger', 'vogue', 'fashionista',
      'people say', 'customers', 'users', 'worth it'
    ];

    // Keywords that suggest database-only
    this.databaseOnlyKeywords = [
      'size', 'dimension', 'weight', 'color', 'material',
      'price', 'cost', 'specification', 'specs', 'features',
      'care', 'warranty', 'available', 'stock', 'inventory'
    ];
  }

  /**
   * Determine if web search is needed based on query
   */
  shouldUseWebSearch(query, product = null) {
    const queryLower = query.toLowerCase();
    
    // Check for explicit web search patterns
    const hasWebSearchPattern = this.webSearchPatterns.some(pattern => 
      pattern.test(queryLower)
    );
    
    if (hasWebSearchPattern) {
      return {
        shouldSearch: true,
        confidence: 0.9,
        reason: 'Query matches web search pattern'
      };
    }

    // Check for database-only patterns (strong indicator)
    const hasDatabaseOnlyPattern = this.databaseOnlyPatterns.some(pattern => 
      pattern.test(queryLower)
    );
    
    if (hasDatabaseOnlyPattern) {
      return {
        shouldSearch: false,
        confidence: 0.9,
        reason: 'Query matches database-only pattern'
      };
    }

    // Count keyword matches
    const webSearchKeywordCount = this.webSearchKeywords.filter(keyword =>
      queryLower.includes(keyword)
    ).length;
    
    const databaseOnlyKeywordCount = this.databaseOnlyKeywords.filter(keyword =>
      queryLower.includes(keyword)
    ).length;

    // If web search keywords dominate, use web search
    if (webSearchKeywordCount > databaseOnlyKeywordCount && webSearchKeywordCount > 0) {
      return {
        shouldSearch: true,
        confidence: 0.7,
        reason: 'Web search keywords detected'
      };
    }

    // If database keywords dominate, use database only
    if (databaseOnlyKeywordCount > webSearchKeywordCount && databaseOnlyKeywordCount > 0) {
      return {
        shouldSearch: false,
        confidence: 0.7,
        reason: 'Database-only keywords detected'
      };
    }

    // Default: use database only (fast, cost-effective)
    return {
      shouldSearch: false,
      confidence: 0.5,
      reason: 'Default to database-only for speed and cost'
    };
  }

  /**
   * Determine search query for web search
   */
  generateWebSearchQuery(query, product) {
    if (!product) {
      return query;
    }

    // Build optimized search query
    const brand = product.brand || '';
    const productName = product.title || product.product_name || '';
    
    // If query is generic, enhance it
    if (query.toLowerCase().includes('tell me more') || 
        query.toLowerCase().includes('about')) {
      return `${brand} ${productName} reviews features specifications`;
    }

    // Otherwise, combine query with product context
    return `${brand} ${productName} ${query}`;
  }

  /**
   * Extract relevant information from web search results
   */
  extractRelevantInfo(webResults, query) {
    if (!webResults || !webResults.results || webResults.results.length === 0) {
      return null;
    }

    // Combine top results
    const topResults = webResults.results.slice(0, 3);
    const combinedContent = topResults
      .map(result => `${result.title}: ${result.content}`)
      .join('\n\n');

    // Use answer if available (Tavily provides this)
    if (webResults.answer) {
      return {
        summary: webResults.answer,
        sources: topResults.map(r => ({ title: r.title, url: r.url })),
        fullContent: combinedContent
      };
    }

    return {
      summary: combinedContent.substring(0, 500), // First 500 chars
      sources: topResults.map(r => ({ title: r.title, url: r.url })),
      fullContent: combinedContent
    };
  }
}

// Export singleton instance
export const webSearchDetector = new WebSearchDetector();


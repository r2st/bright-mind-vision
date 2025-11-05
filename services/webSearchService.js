/**
 * Web Search Service
 * Provides optional web search integration for product enrichment
 * Uses Tavily API (optimized for AI applications)
 * Falls back to Serper API if Tavily is unavailable
 */

class WebSearchService {
  constructor() {
    this.tavilyApiKey = process.env.TAVILY_API_KEY;
    this.serperApiKey = process.env.SERPER_API_KEY;
    this.googleApiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    this.googleCx = process.env.GOOGLE_CUSTOM_SEARCH_CX;
    
    // Cache for web search results (in-memory, 24h TTL)
    this.cache = new Map();
    this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
    
    this.initialized = true;
    console.log('✅ Web Search Service initialized');
  }

  isAvailable() {
    return !!(this.tavilyApiKey || this.serperApiKey || (this.googleApiKey && this.googleCx));
  }

  /**
   * Get cached result if available
   */
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache search result
   */
  setCachedResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries (keep last 100)
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Search using Tavily API (preferred for AI applications)
   */
  async searchTavily(query, options = {}) {
    if (!this.tavilyApiKey) {
      throw new Error('Tavily API key not configured');
    }

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.tavilyApiKey,
          query: query,
          search_depth: options.search_depth || 'basic', // basic, advanced
          include_answer: true,
          include_raw_content: false,
          max_results: options.max_results || 5,
          include_domains: options.include_domains || [],
          exclude_domains: options.exclude_domains || []
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        provider: 'tavily',
        query: query,
        answer: data.answer || null,
        results: data.results?.map(result => ({
          title: result.title,
          url: result.url,
          content: result.content,
          score: result.score || 0
        })) || [],
        raw_content: data.raw_content || null
      };
    } catch (error) {
      console.error('Tavily search error:', error);
      throw error;
    }
  }

  /**
   * Search using Serper API
   */
  async searchSerper(query, options = {}) {
    if (!this.serperApiKey) {
      throw new Error('Serper API key not configured');
    }

    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': this.serperApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: options.max_results || 5
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Serper API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        provider: 'serper',
        query: query,
        answer: null,
        results: [
          ...(data.organic || []).map(result => ({
            title: result.title,
            url: result.link,
            content: result.snippet,
            score: 1.0
          })),
          ...(data.answerBox ? [{
            title: data.answerBox.title || '',
            url: data.answerBox.link || '',
            content: data.answerBox.answer || data.answerBox.snippet || '',
            score: 1.0
          }] : [])
        ]
      };
    } catch (error) {
      console.error('Serper search error:', error);
      throw error;
    }
  }

  /**
   * Search using Google Custom Search API
   */
  async searchGoogle(query, options = {}) {
    if (!this.googleApiKey || !this.googleCx) {
      throw new Error('Google Custom Search API key or CX not configured');
    }

    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.set('key', this.googleApiKey);
      url.searchParams.set('cx', this.googleCx);
      url.searchParams.set('q', query);
      url.searchParams.set('num', (options.max_results || 5).toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        provider: 'google',
        query: query,
        answer: null,
        results: (data.items || []).map(result => ({
          title: result.title,
          url: result.link,
          content: result.snippet,
          score: 1.0
        }))
      };
    } catch (error) {
      console.error('Google search error:', error);
      throw error;
    }
  }

  /**
   * Main search method with fallback chain
   */
  async search(query, options = {}) {
    // Check cache first
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log('✅ Using cached web search result');
      return cached;
    }

    // Try providers in order: Tavily → Serper → Google
    const providers = [
      { name: 'tavily', fn: () => this.searchTavily(query, options) },
      { name: 'serper', fn: () => this.searchSerper(query, options) },
      { name: 'google', fn: () => this.searchGoogle(query, options) }
    ];

    for (const provider of providers) {
      try {
        // Check if provider is configured
        if (provider.name === 'tavily' && !this.tavilyApiKey) continue;
        if (provider.name === 'serper' && !this.serperApiKey) continue;
        if (provider.name === 'google' && (!this.googleApiKey || !this.googleCx)) continue;

        console.log(`🔍 Searching web using ${provider.name}...`);
        const result = await provider.fn();
        
        // Cache the result
        this.setCachedResult(cacheKey, result);
        
        return result;
      } catch (error) {
        console.warn(`⚠️ ${provider.name} search failed:`, error.message);
        // Try next provider
        continue;
      }
    }

    // All providers failed
    return {
      success: false,
      error: 'All web search providers failed or not configured',
      results: []
    };
  }

  /**
   * Search specifically for product information
   */
  async searchProduct(productName, brand = null, options = {}) {
    let query = productName;
    if (brand) {
      query = `${brand} ${productName}`;
    }

    // Add context for product search
    const searchQuery = `${query} reviews features specifications comparison`;
    
    const searchOptions = {
      ...options,
      include_domains: options.include_domains || [
        'prada.com',
        'chanel.com',
        'hermes.com',
        'rolex.com',
        'vogue.com',
        'harpersbazaar.com',
        'fashionista.com'
      ]
    };

    return await this.search(searchQuery, searchOptions);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('✅ Web search cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: 100,
      ttl: this.cacheTTL
    };
  }
}

// Export singleton instance
export const webSearchService = new WebSearchService();


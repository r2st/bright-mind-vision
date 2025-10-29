import Groq from 'groq-sdk';
import { vectorDB } from './sqliteVectorDB.js';
import { normalizedProductCatalog } from '../data/normalizedProductCatalog.js';

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

/**
 * Enhanced RAG Service with SQLite Vector Database and Groq LLM
 * Provides intelligent product recommendations using semantic search
 */
class EnhancedRAGService {
  constructor() {
    this.models = {
      primary: 'llama-3.1-8b-instant',
      versatile: 'llama-3.3-70b-versatile',
      guard: 'meta-llama/llama-guard-4-12b'
    };
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Populate database with products if empty
      const productCount = vectorDB.getProductCount();
      if (productCount === 0) {
        console.log('📦 Populating vector database with products...');
        await this.populateDatabase();
      }
      
      this.initialized = true;
      console.log('✅ Enhanced RAG Service initialized');
    } catch (error) {
      console.error('❌ Enhanced RAG Service initialization failed:', error);
    }
  }

  async populateDatabase() {
    for (const product of normalizedProductCatalog) {
      const productId = vectorDB.upsertProduct(product);
      if (productId) {
        // Generate embeddings for the product
        await this.generateAndStoreEmbeddings(productId, product);
      }
    }
    console.log(`✅ Populated database with ${normalizedProductCatalog.length} products`);
  }

  async generateAndStoreEmbeddings(productId, product) {
    try {
      // Generate title embedding
      const titleEmbedding = await this.generateEmbedding(product.title);
      vectorDB.storeEmbedding(productId, 'title', titleEmbedding);

      // Generate description embedding
      if (product.description) {
        const descEmbedding = await this.generateEmbedding(product.description);
        vectorDB.storeEmbedding(productId, 'description', descEmbedding);
      }

      // Generate combined embedding
      const combinedText = `${product.title} ${product.description} ${product.brand} ${product.category.join(' ')}`;
      const combinedEmbedding = await this.generateEmbedding(combinedText);
      vectorDB.storeEmbedding(productId, 'combined', combinedEmbedding);

    } catch (error) {
      console.error('Error generating embeddings for product:', product.sku, error);
    }
  }

  async generateEmbedding(text) {
    try {
      // Use Groq to generate embeddings (simplified approach)
      // In production, you'd use a proper embedding model
      const response = await groq.chat.completions.create({
        model: this.models.primary,
        messages: [
          {
            role: 'system',
            content: 'Generate a numerical vector representation for the following text. Return only a JSON array of numbers between 0 and 1.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0,
        max_tokens: 1000
      });

      // Parse the response and create a simple embedding
      const content = response.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch {
        // Fallback: create a simple hash-based embedding
        return this.createSimpleEmbedding(text);
      }
    } catch (error) {
      console.error('Error generating embedding:', error);
      return this.createSimpleEmbedding(text);
    }
  }

  createSimpleEmbedding(text) {
    // Simple hash-based embedding as fallback
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(128).fill(0);
    
    words.forEach(word => {
      const hash = this.simpleHash(word);
      const index = hash % 128;
      embedding[index] += 1;
    });
    
    // Normalize
    const sum = embedding.reduce((a, b) => a + b, 0);
    return embedding.map(val => sum > 0 ? val / sum : 0);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async classifyIntent(query) {
    try {
      const response = await groq.chat.completions.create({
        model: this.models.primary,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `You are an intent classifier for a luxury product recommendation system.
            Classify the user query into one of these categories:
            - product_search: User wants to find specific products
            - category_browse: User wants to browse a category
            - brand_inquiry: User is asking about a specific brand
            - price_inquiry: User is asking about pricing
            - comparison: User wants to compare products
            - general_help: User needs general assistance
            - non_product: User is asking about something not related to products
            
            Return only the category name.`
          },
          {
            role: 'user',
            content: query
          }
        ]
      });

      return response.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
      console.error('Error classifying intent:', error);
      return 'product_search';
    }
  }

  async searchProducts(query, context = {}) {
    await this.initialize();

    const intent = await this.classifyIntent(query);
    console.log(`🎯 Intent classified as: ${intent}`);

    let products = [];

    if (intent === 'product_search' || intent === 'category_browse') {
      // Use semantic search
      products = await this.semanticSearch(query, context);
    } else if (intent === 'brand_inquiry') {
      // Search by brand
      products = await this.searchByBrand(query);
    } else if (intent === 'price_inquiry') {
      // Search by price range
      products = await this.searchByPrice(query);
    } else {
      // Fallback to text search
      products = vectorDB.searchProducts(query);
    }

    return products.slice(0, 5); // Return top 5 results
  }

  async semanticSearch(query, context) {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Get all products with embeddings
      const allProducts = vectorDB.getAllProducts();
      const scoredProducts = [];

      for (const product of allProducts) {
        const embeddings = vectorDB.getEmbeddings(product.id);
        if (embeddings.length === 0) continue;

        // Calculate similarity score
        let maxSimilarity = 0;
        for (const embedding of embeddings) {
          const similarity = this.cosineSimilarity(queryEmbedding, embedding.embedding);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }

        // Apply context filtering
        let contextScore = 1;
        if (context.lastCategory) {
          const productCategories = JSON.parse(product.category);
          if (productCategories.some(cat => cat.toLowerCase().includes(context.lastCategory.toLowerCase()))) {
            contextScore = 1.2; // Boost score for context-relevant products
          }
        }

        scoredProducts.push({
          ...product,
          similarity: maxSimilarity * contextScore
        });
      }

      // Sort by similarity score
      return scoredProducts
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

    } catch (error) {
      console.error('Error in semantic search:', error);
      return vectorDB.searchProducts(query);
    }
  }

  async searchByBrand(query) {
    const allProducts = vectorDB.getAllProducts();
    const queryLower = query.toLowerCase();
    
    return allProducts.filter(product => 
      product.brand.toLowerCase().includes(queryLower)
    ).sort((a, b) => b.rating - a.rating);
  }

  async searchByPrice(query) {
    // Extract price range from query
    const priceMatch = query.match(/(\d+)\s*-\s*(\d+)/);
    if (priceMatch) {
      const minPrice = parseInt(priceMatch[1]);
      const maxPrice = parseInt(priceMatch[2]);
      
      const allProducts = vectorDB.getAllProducts();
      return allProducts.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      ).sort((a, b) => b.rating - a.rating);
    }
    
    return vectorDB.searchProducts(query);
  }

  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    
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

  async generateResponse(query, products, context = {}) {
    try {
      const productList = products.map(p => ({
        title: p.title,
        brand: p.brand,
        price: `${p.price} ${p.currency}`,
        description: p.description,
        category: JSON.parse(p.category)
      }));

      const response = await groq.chat.completions.create({
        model: this.models.versatile,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `You are a luxury shopping assistant for a high-end boutique in Dubai.
            Generate a natural, engaging response that:
            1. Acknowledges the user's query
            2. Presents the recommended products in an appealing way
            3. Includes prices in AED
            4. Provides context-appropriate quick replies
            5. Maintains a luxury, personalized tone
            
            Format your response as JSON with:
            - opening: Welcome message
            - items: Array of product recommendations
            - cta: Call to action
            - quick_replies: Array of 3 quick reply options
            
            Each item should have: headline, price, one_liner, image (emoji)
            Keep responses concise but engaging.`
          },
          {
            role: 'user',
            content: `Query: "${query}"
            Context: ${JSON.stringify(context)}
            Products: ${JSON.stringify(productList)}`
          }
        ]
      });

      const content = response.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch {
        // Fallback response
        return this.generateFallbackResponse(products, context);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateFallbackResponse(products, context);
    }
  }

  generateFallbackResponse(products, context) {
    const opening = context.lastCategory 
      ? `Here are some ${context.lastCategory} products for you:`
      : "Here are some luxury products I found for you:";

    const items = products.slice(0, 3).map((product, index) => ({
      headline: product.title,
      price: `${product.price} ${product.currency}`,
      one_liner: product.description?.substring(0, 60) + '...' || 'Luxury product',
      image: '🛍️'
    }));

    return {
      opening,
      items,
      cta: "Which product interests you most?",
      quick_replies: [
        "Show me more products",
        "View different category", 
        "Get help"
      ]
    };
  }
}

export const enhancedRAGService = new EnhancedRAGService();
export default enhancedRAGService;

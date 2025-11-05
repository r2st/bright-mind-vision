/**
 * PATCH FILE: Update handleGetProductDetails and handleAnswerProductQuestion
 * 
 * This file contains the updated methods that should be integrated into
 * services/langGraphOrchestrator.js
 * 
 * Search for these methods and replace with the code below:
 */

// ============================================
// REPLACE handleGetProductDetails method
// ============================================
async handleGetProductDetails(args) {
  const products = await enhancedRAGService.searchProducts(
    args.product_name || args.product_sku || 'luxury products', 
    {}
  );
  
  const product = products.find(p => 
    p.sku === args.product_sku || 
    p.title.toLowerCase().includes((args.product_name || '').toLowerCase())
  );
  
  if (!product) {
    return {
      success: false,
      message: 'Product not found'
    };
  }
  
  const price = typeof product.price === 'object' ? product.price : { amount: product.price || 0, currency: product.currency || 'AED' };
  const attributes = product.attributes || {};
  
  // HYBRID APPROACH: Check if web search is needed
  const { webSearchService } = await import('./webSearchService.js');
  const { webSearchDetector } = await import('./webSearchDetector.js');
  
  const query = args.query || args.product_name || product.title;
  const searchDecision = webSearchDetector.shouldUseWebSearch(query, product);
  
  let webData = null;
  if (searchDecision.shouldSearch && webSearchService.isAvailable()) {
    try {
      console.log(`🌐 Web search needed for: ${query} (reason: ${searchDecision.reason})`);
      const searchQuery = webSearchDetector.generateWebSearchQuery(query, product);
      const webResults = await webSearchService.searchProduct(
        product.title,
        product.brand,
        { max_results: 5 }
      );
      
      if (webResults.success && webResults.results.length > 0) {
        webData = webSearchDetector.extractRelevantInfo(webResults, query);
        console.log(`✅ Web search completed: ${webResults.results.length} results found`);
      }
    } catch (error) {
      console.warn('⚠️ Web search failed (non-critical):', error.message);
      // Continue without web data - database-only response
    }
  }
  
  // Use enhanced product data from catalog if available
  const detailedDescription = product.detailedDescription || product.description;
  const features = product.features || [];
  const pros = product.pros || [];
  const cons = product.cons || [];
  const useCases = product.useCases || [];
  const careInstructions = product.careInstructions || 
    (attributes.material ? `Care: Handle with care. For ${attributes.material.toLowerCase()}, avoid excessive moisture and store in a dust bag when not in use.` : 
     'Care: Handle with care and store properly when not in use.');
  const warranty = product.warranty || 'All products come with manufacturer warranty and our satisfaction guarantee';
  
  // Generate comprehensive product details using LLM (enhanced with web data if available)
  let comprehensiveDetails = null;
  try {
    const systemPrompt = `You are a luxury shopping assistant. Generate comprehensive product details including:
    - Key features and highlights
    - Pros and cons (be honest and balanced)
    - Use case recommendations (when to use this product)
    - Care instructions (if applicable)
    - Warranty information (if available)
    - What makes this product special or worth the investment
    
    Keep it natural, engaging, and helpful. Format as a conversational description (3-4 sentences).`;
    
    let userPrompt = `Product: ${product.title} by ${product.brand}
Price: ${price.amount} ${price.currency}
Description: ${detailedDescription}
Attributes: ${JSON.stringify(attributes)}
Rating: ${product.rating || 'N/A'}
Badges/Features: ${product.badges ? product.badges.join(', ') : 'N/A'}`;
    
    // Add web search data if available
    if (webData && webData.summary) {
      userPrompt += `\n\nExternal Reviews/Information:\n${webData.summary}\n\nUse this additional information to enhance your response, but prioritize the product specifications above.`;
    }
    
    userPrompt += `\n\nGenerate comprehensive product details that help the customer understand the product's value, use cases, and what makes it special.`;
    
    const detailsResponse = await llmProvider.chatCompletion([
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ], {
      model: 'versatile',
      temperature: 0.6
    });
    
    comprehensiveDetails = detailsResponse.choices[0].message.content;
  } catch (error) {
    console.error('Error generating comprehensive product details:', error);
    comprehensiveDetails = detailedDescription || product.description; // Fallback
  }
  
  // Build pros and cons (enhance with database data)
  const finalPros = pros.length > 0 ? pros : [];
  if (finalPros.length === 0) {
    if (product.badges) {
      finalPros.push(...product.badges.map(b => b.charAt(0).toUpperCase() + b.slice(1)));
    }
    if (attributes.material) {
      finalPros.push(`Premium ${attributes.material}`);
    }
    if (product.rating && product.rating >= 4.5) {
      finalPros.push('Highly rated');
    }
  }
  
  const finalCons = cons.length > 0 ? cons : [];
  if (finalCons.length === 0) {
    const priceAmount = typeof price === 'object' ? price.amount : price;
    if (priceAmount > 30000) {
      finalCons.push('Premium pricing');
    }
  }
  
  return {
    success: true,
    product: {
      sku: product.sku,
      title: product.title,
      brand: product.brand,
      price: price,
      description: product.description,
      detailedDescription: detailedDescription,
      comprehensiveDetails: comprehensiveDetails,
      features: features,
      rating: product.rating,
      category: typeof product.category === 'string' ? JSON.parse(product.category) : product.category,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags || '[]') : (product.tags || []),
      attributes: attributes,
      pros: finalPros,
      cons: finalCons,
      useCases: useCases,
      badges: product.badges || [],
      warranty: warranty,
      careInstructions: careInstructions,
      reviewSummary: product.reviewSummary || null,
      styleNotes: product.styleNotes || null,
      investmentValue: product.investmentValue || null,
      // Web search data if available
      webEnrichment: webData ? {
        summary: webData.summary,
        sources: webData.sources
      } : null
    }
  };
}

// ============================================
// REPLACE handleAnswerProductQuestion method  
// ============================================
async handleAnswerProductQuestion(args) {
  const { product_sku, product_name, question, attribute_type } = args;
  
  // Get product details
  let product = null;
  if (product_sku) {
    const products = await enhancedRAGService.searchProducts(product_sku, {});
    product = products.find(p => p.sku === product_sku);
  } else if (product_name) {
    const products = await enhancedRAGService.searchProducts(product_name, {});
    product = products.find(p => 
      p.title.toLowerCase().includes(product_name.toLowerCase())
    );
    if (!product && products.length > 0) {
      product = products[0];
    }
  }
  
  if (!product) {
    return {
      success: false,
      message: 'Product not found. Could you please specify which product you\'re asking about?'
    };
  }
  
  // HYBRID APPROACH: Check if web search is needed for this question
  const { webSearchService } = await import('./webSearchService.js');
  const { webSearchDetector } = await import('./webSearchDetector.js');
  
  const fullQuery = question || `${product_name || product_sku} ${attribute_type || ''}`;
  const searchDecision = webSearchDetector.shouldUseWebSearch(fullQuery, product);
  
  let webData = null;
  if (searchDecision.shouldSearch && webSearchService.isAvailable()) {
    try {
      console.log(`🌐 Web search needed for question: ${fullQuery}`);
      const searchQuery = webSearchDetector.generateWebSearchQuery(fullQuery, product);
      const webResults = await webSearchService.searchProduct(
        product.title,
        product.brand,
        { max_results: 3 }
      );
      
      if (webResults.success && webResults.results.length > 0) {
        webData = webSearchDetector.extractRelevantInfo(webResults, fullQuery);
      }
    } catch (error) {
      console.warn('⚠️ Web search failed (non-critical):', error.message);
    }
  }
  
  // Extract relevant information based on attribute type
  let answer = '';
  const attributes = product.attributes || {};
  
  switch (attribute_type) {
    case 'size':
      answer = attributes.size || attributes.dimensions || 'Size information not available';
      break;
    case 'color':
      answer = attributes.color || 'Color information not available';
      break;
    case 'material':
      answer = attributes.material || 'Material information not available';
      break;
    case 'feature':
      const features = product.features || [];
      if (features.length > 0) {
        answer = features.join('\n');
      } else {
        const featureList = [];
        if (attributes.water_resistance) featureList.push(`Water resistance: ${attributes.water_resistance}`);
        if (attributes.movement) featureList.push(`Movement: ${attributes.movement}`);
        if (product.badges) featureList.push(`Features: ${product.badges.join(', ')}`);
        answer = featureList.length > 0 ? featureList.join('\n') : (product.description || 'No specific features listed');
      }
      break;
    case 'price':
      const price = typeof product.price === 'object' ? product.price : { amount: product.price || 0, currency: product.currency || 'AED' };
      answer = `${price.amount} ${price.currency}`;
      break;
    default:
      try {
        let userContent = `Product: ${product.title} by ${product.brand}
Price: ${typeof product.price === 'object' ? `${product.price.amount} ${product.price.currency}` : `${product.price} ${product.currency || 'AED'}`}
Description: ${product.detailedDescription || product.description}
Attributes: ${JSON.stringify(attributes)}
Rating: ${product.rating || 'N/A'}`;
        
        // Add enhanced product data if available
        if (product.features && product.features.length > 0) {
          userContent += `\nFeatures: ${product.features.join(', ')}`;
        }
        if (product.pros && product.pros.length > 0) {
          userContent += `\nPros: ${product.pros.join(', ')}`;
        }
        if (product.useCases && product.useCases.length > 0) {
          userContent += `\nUse Cases: ${product.useCases.join(', ')}`;
        }
        
        // Add web search data if available
        if (webData && webData.summary) {
          userContent += `\n\nAdditional Information:\n${webData.summary}`;
        }
        
        userContent += `\n\nQuestion: ${question}\n\nAnswer the question based on the product information above.`;
        
        const response = await llmProvider.chatCompletion([
          {
            role: 'system',
            content: `You are a luxury shopping assistant. Answer the user's question about the product using the product information provided. Be concise, accurate, and helpful. If web search information is provided, use it to enhance your answer but prioritize the product specifications.`
          },
          {
            role: 'user',
            content: userContent
          }
        ], {
          model: 'primary',
          temperature: 0.3
        });
        answer = response.choices[0].message.content;
      } catch (error) {
        console.error('Error generating product Q&A answer:', error);
        answer = `Based on the product information: ${product.detailedDescription || product.description || 'Please refer to the product details for more information.'}`;
      }
  }
  
  return {
    success: true,
    product: {
      sku: product.sku,
      title: product.title,
      brand: product.brand
    },
    answer: answer,
    attribute_type: attribute_type || 'general',
    webEnrichment: webData ? {
      summary: webData.summary,
      sources: webData.sources
    } : null
  };
}


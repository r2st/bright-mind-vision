#!/usr/bin/env node

// Simple test for RAG system components without Groq API calls
import { enhancedProducts, filterProducts, calculateBM25Score, calculateBusinessScore } from './data/enhancedProducts.js';
import { classifyIntent, assessComplexity, NEED_AFFORDANCES } from './config/groq-config.js';

console.log('🧪 Testing RAG System Components');
console.log('=' .repeat(50));

// Test 1: Product Data
console.log('\n📦 Test 1: Product Data');
console.log(`Total products: ${enhancedProducts.length}`);
console.log(`Categories: ${[...new Set(enhancedProducts.map(p => p.category))].join(', ')}`);
console.log(`Luxury products: ${enhancedProducts.filter(p => p.price > 1000).length}`);
console.log(`Organic products: ${enhancedProducts.filter(p => p.is_organic).length}`);

// Test 2: Intent Classification
console.log('\n🎯 Test 2: Intent Classification');
const testQueries = [
  "I need help with relaxation and stress relief",
  "Looking for luxury skincare products",
  "I want organic products",
  "Need a luxury handbag for special occasion"
];

testQueries.forEach((query, index) => {
  console.log(`\nQuery ${index + 1}: "${query}"`);
  const intent = classifyIntent(query);
  console.log(`  Primary need: ${intent.primaryNeed}`);
  console.log(`  Affordances: ${intent.matchedAffordances.join(', ')}`);
  console.log(`  Confidence: ${(intent.confidence * 100).toFixed(1)}%`);
  
  const complexity = assessComplexity(intent, query);
  console.log(`  Complexity: ${complexity.complexity} (${complexity.isComplex ? 'complex' : 'simple'})`);
});

// Test 3: Product Filtering
console.log('\n🔍 Test 3: Product Filtering');
const filters = {
  is_organic: true,
  maxPrice: 100
};
const organicProducts = filterProducts(filters);
console.log(`Organic products under $100: ${organicProducts.length}`);
organicProducts.forEach(p => {
  console.log(`  - ${p.name} ($${p.price})`);
});

// Test 4: BM25 Scoring
console.log('\n📊 Test 4: BM25 Scoring');
const query = "I need help with relaxation and stress relief";
const affordances = ["calming", "aromatherapy", "ambience", "meditation"];

const scoredProducts = enhancedProducts.map(product => {
  const bm25Score = calculateBM25Score(product, query, affordances);
  const businessScore = calculateBusinessScore(product);
  return {
    ...product,
    bm25Score,
    businessScore,
    combinedScore: 0.4 * bm25Score + 0.2 * businessScore
  };
}).sort((a, b) => b.combinedScore - a.combinedScore);

console.log(`Top 5 products for "${query}":`);
scoredProducts.slice(0, 5).forEach((product, index) => {
  console.log(`  ${index + 1}. ${product.name} ($${product.price})`);
  console.log(`     BM25: ${product.bm25Score.toFixed(2)}, Business: ${product.businessScore.toFixed(2)}, Combined: ${product.combinedScore.toFixed(2)}`);
});

// Test 5: Need → Affordances Mapping
console.log('\n🗺️ Test 5: Need → Affordances Mapping');
Object.entries(NEED_AFFORDANCES).forEach(([need, affordances]) => {
  console.log(`${need}: ${affordances.slice(0, 3).join(', ')}${affordances.length > 3 ? '...' : ''}`);
});

// Test 6: Product Categories and Tags
console.log('\n🏷️ Test 6: Product Categories and Tags');
const categories = [...new Set(enhancedProducts.map(p => p.category))];
categories.forEach(category => {
  const products = enhancedProducts.filter(p => p.category === category);
  console.log(`${category}: ${products.length} products`);
  console.log(`  Price range: $${Math.min(...products.map(p => p.price))} - $${Math.max(...products.map(p => p.price))}`);
  console.log(`  Tags: ${[...new Set(products.flatMap(p => p.tags))].slice(0, 5).join(', ')}`);
});

console.log('\n✅ RAG System Components Test Complete!');
console.log('\n📋 Next steps:');
console.log('1. Get your Groq API key from: https://console.groq.com/keys');
console.log('2. Update GROQ_API_KEY in .env.local');
console.log('3. Run: node test-rag-system.js');
console.log('4. Test the full RAG pipeline with Groq integration');

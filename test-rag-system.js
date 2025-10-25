#!/usr/bin/env node

// Test script for Groq RAG system
import recommendProducts from './services/groqRAGService.js';

// Test queries for different scenarios
const testQueries = [
  {
    query: "I need help with relaxation and stress relief",
    expected: "Should recommend relaxation products like salt lamps, diffusers, meditation cushions"
  },
  {
    query: "I can't sleep and need help",
    expected: "Should recommend sleep support products like herbal tea, aromatherapy, relaxation items"
  },
  {
    query: "Looking for organic products",
    expected: "Should recommend organic items like herbal tea, salt lamps, meditation cushions"
  },
  {
    query: "I want luxury skincare products",
    expected: "Should recommend luxury skincare like La Mer, La Prairie"
  },
  {
    query: "Need a luxury handbag for special occasion",
    expected: "Should recommend luxury handbags like Chanel, Hermès"
  },
  {
    query: "Looking for luxury watches with investment value",
    expected: "Should recommend luxury watches like Rolex, Cartier, Bulgari"
  },
  {
    query: "I want premium fragrances",
    expected: "Should recommend luxury fragrances like Tom Ford, Creed"
  },
  {
    query: "Need luxury home decor items",
    expected: "Should recommend luxury home items like Baccarat, Versace Home, Lalique"
  }
];

async function testRAGSystem() {
  console.log('🚀 Testing Groq RAG System');
  console.log('=' .repeat(50));
  
  for (let i = 0; i < testQueries.length; i++) {
    const { query, expected } = testQueries[i];
    console.log(`\n📝 Test ${i + 1}: "${query}"`);
    console.log(`🎯 Expected: ${expected}`);
    console.log('-'.repeat(50));
    
    try {
      const startTime = Date.now();
      const result = await recommendProducts(query);
      const endTime = Date.now();
      
      console.log(`⏱️  Response time: ${endTime - startTime}ms`);
      console.log(`✅ Success: ${result.success}`);
      
      if (result.success) {
        console.log(`📊 Recommendations: ${result.recommendations.length}`);
        console.log(`🎯 Overall confidence: ${(result.metadata.overallConfidence * 100).toFixed(1)}%`);
        console.log(`🤖 Model used: ${result.metadata.model}`);
        console.log(`🛡️ Safety score: ${(result.metadata.safetyScore * 100).toFixed(1)}%`);
        
        console.log('\n🏆 Top Recommendations:');
        result.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec.product.name} (${rec.product.category})`);
          console.log(`     💰 Price: $${rec.product.price}`);
          console.log(`     🎯 Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
          console.log(`     💡 Reason: ${rec.reason}`);
          console.log(`     🏷️  Tags: ${rec.product.tags.join(', ')}`);
        });
        
        console.log('\n📋 Intent Analysis:');
        console.log(`  Primary need: ${result.metadata.intent.primaryNeed}`);
        console.log(`  Affordances: ${result.metadata.intent.affordances.join(', ')}`);
        console.log(`  Confidence: ${(result.metadata.intent.confidence * 100).toFixed(1)}%`);
        
      } else {
        console.log(`❌ Error: ${result.message}`);
      }
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Add delay between tests to avoid rate limiting
    if (i < testQueries.length - 1) {
      console.log('⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 RAG System Testing Complete!');
}

// Run the tests
testRAGSystem().catch(console.error);

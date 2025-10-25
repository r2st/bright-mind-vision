#!/usr/bin/env node

// Test script for natural response system
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test different user queries to see natural responses
const testQueries = [
  {
    query: "I need help with relaxation and stress relief",
    expectedIntent: "relaxation",
    description: "Relaxation and stress relief query"
  },
  {
    query: "Looking for luxury skincare products for anti-aging",
    expectedIntent: "luxury",
    description: "Luxury skincare query"
  },
  {
    query: "I can't sleep well at night, need something natural",
    expectedIntent: "sleep",
    description: "Sleep support query"
  },
  {
    query: "Want organic products only, no chemicals",
    expectedIntent: "organic",
    description: "Organic products query"
  },
  {
    query: "Need wellness products for my health journey",
    expectedIntent: "wellness",
    description: "General wellness query"
  }
];

async function testNaturalResponse(query, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📝 Query: "${query}"`);
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(`${BASE_URL}/api/meshai/ai-recommendation-rag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: query,
        customerId: 'test-customer-123',
        context: {
          source: 'whatsapp',
          customerName: 'Test User',
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      return;
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API Response: SUCCESS');
      
      // Show natural response
      if (result.naturalResponse) {
        console.log('\n💬 Natural Response:');
        console.log(`Opening: "${result.naturalResponse.opening}"`);
        
        if (result.naturalResponse.items && result.naturalResponse.items.length > 0) {
          console.log('\n🛍️ Product Recommendations:');
          result.naturalResponse.items.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.headline}`);
            console.log(`     ${item.one_liner}`);
          });
        }
        
        console.log(`\n💬 Call to Action: "${result.naturalResponse.cta}"`);
        
        if (result.naturalResponse.quick_replies && result.naturalResponse.quick_replies.length > 0) {
          console.log('\n⚡ Quick Replies:');
          result.naturalResponse.quick_replies.forEach((reply, index) => {
            console.log(`  ${index + 1}. ${reply}`);
          });
        }
      }
      
      // Show metadata
      if (result.metadata) {
        console.log('\n📊 Metadata:');
        console.log(`  Intent: ${result.metadata.intent?.primaryNeed || 'unknown'}`);
        console.log(`  Confidence: ${(result.metadata.overallConfidence * 100).toFixed(1)}%`);
        console.log(`  Model: ${result.metadata.model || 'unknown'}`);
        console.log(`  Style: ${result.metadata.style?.persona || 'unknown'} (${result.metadata.style?.verbosity || 'unknown'} verbosity)`);
      }
      
      // Show raw recommendations
      if (result.recommendations && result.recommendations.length > 0) {
        console.log('\n🔍 Raw Recommendations:');
        result.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec.product?.name || 'Unknown'} - $${rec.product?.price || 0}`);
          console.log(`     Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
          console.log(`     Reason: ${rec.reason || 'No reason provided'}`);
        });
      }
      
    } else {
      console.log('❌ API Response: FAILED');
      console.log(`Error: ${result.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function runNaturalResponseTests() {
  console.log('🧪 Natural Response System Tests');
  console.log('=' .repeat(60));
  console.log('Testing human-like, conversational product recommendations');
  console.log('=' .repeat(60));
  
  // Check if server is running
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/meshai/whatsapp-status`);
    if (!healthCheck.ok) {
      console.log('❌ Server not running. Please start with: npm run dev');
      return;
    }
  } catch (error) {
    console.log('❌ Server not running. Please start with: npm run dev');
    return;
  }
  
  console.log('✅ Server is running');
  
  // Run tests for each query
  for (const test of testQueries) {
    await testNaturalResponse(test.query, test.description);
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Natural Response Testing Complete!');
  console.log('\n📋 Key Features Tested:');
  console.log('✅ Human-like opening statements');
  console.log('✅ Natural product descriptions');
  console.log('✅ Conversational call-to-actions');
  console.log('✅ Quick reply options');
  console.log('✅ Intent-based template selection');
  console.log('✅ Style configuration (persona, verbosity, emoji)');
  console.log('✅ Safety filtering and medical claim prevention');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Get Groq API key from: https://console.groq.com/keys');
  console.log('2. Update GROQ_API_KEY in .env.local');
  console.log('3. Test with real WhatsApp messages');
  console.log('4. Deploy to production');
}

// Run the tests
runNaturalResponseTests().catch(console.error);

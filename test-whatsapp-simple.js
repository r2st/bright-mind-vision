#!/usr/bin/env node

/**
 * Simple WhatsApp Test Script for brightmindvision.com
 * Quick tests for WhatsApp integration
 */

const https = require('https');

const BASE_URL = 'https://brightmindvision.com';
const WEBHOOK_VERIFY_TOKEN = '4ab273511eafcbe7911056e510a161c6';

// Simple HTTP request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
            raw: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            raw: data
          });
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function testWebhook() {
  console.log('🔗 Testing Webhook Verification...');
  const url = `${BASE_URL}/api/meshai/whatsapp-webhook?hub.mode=subscribe&hub.challenge=test-challenge&hub.verify_token=${WEBHOOK_VERIFY_TOKEN}`;
  
  try {
    const response = await makeRequest(url);
    if (response.raw === 'test-challenge') {
      console.log('✅ Webhook verification: PASSED');
      return true;
    } else {
      console.log('❌ Webhook verification: FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ Webhook verification: ERROR -', error.message);
    return false;
  }
}

async function testAIRecommendation() {
  console.log('🤖 Testing AI Recommendation...');
  const url = `${BASE_URL}/api/meshai/ai-recommendation`;
  
  try {
    const response = await makeRequest(url, {
      method: 'POST',
      body: {
        message: "I need help with relaxation and stress relief",
        phoneNumber: "+1234567890"
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ AI Recommendation: PASSED');
      console.log(`   Found ${response.data.recommendations.products.length} products`);
      console.log(`   Confidence: ${response.data.recommendations.confidence}`);
      return true;
    } else {
      console.log('❌ AI Recommendation: FAILED');
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ AI Recommendation: ERROR -', error.message);
    return false;
  }
}

async function testWhatsAppStatus() {
  console.log('📊 Testing WhatsApp Status...');
  const url = `${BASE_URL}/api/meshai/whatsapp-status`;
  
  try {
    const response = await makeRequest(url);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ WhatsApp Status: PASSED');
      const config = response.data.status.configuration;
      console.log('   Configuration:');
      Object.entries(config).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
      return true;
    } else {
      console.log('❌ WhatsApp Status: FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ WhatsApp Status: ERROR -', error.message);
    return false;
  }
}

async function testDifferentMessages() {
  console.log('💬 Testing Different Message Types...');
  const messages = [
    "I need help with sleep",
    "Looking for organic products", 
    "I want wellness products",
    "Can you recommend something for stress?",
    "I'm interested in health products"
  ];
  
  let successCount = 0;
  
  for (const message of messages) {
    try {
      const response = await makeRequest(`${BASE_URL}/api/meshai/ai-recommendation`, {
        method: 'POST',
        body: { message, phoneNumber: "+1234567890" }
      });
      
      if (response.status === 200 && response.data.success) {
        successCount++;
        console.log(`   ✅ "${message}" - ${response.data.recommendations.products.length} recommendations`);
      } else {
        console.log(`   ❌ "${message}" - Failed`);
      }
    } catch (error) {
      console.log(`   ❌ "${message}" - Error: ${error.message}`);
    }
  }
  
  console.log(`✅ Message Types Test: ${successCount}/${messages.length} passed`);
  return successCount === messages.length;
}

async function runTests() {
  console.log('🚀 WhatsApp Integration Test for brightmindvision.com');
  console.log('='.repeat(50));
  
  const results = [];
  
  results.push(await testWebhook());
  results.push(await testAIRecommendation());
  results.push(await testWhatsAppStatus());
  results.push(await testDifferentMessages());
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${total - passed}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your WhatsApp integration is ready!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Configure WhatsApp Business API with your webhook URL');
  console.log('2. Set webhook URL: https://brightmindvision.com/api/meshai/whatsapp-webhook');
  console.log('3. Set verify token: 4ab273511eafcbe7911056e510a161c6');
  console.log('4. Get a valid WhatsApp access token');
  console.log('5. Test with real WhatsApp messages');
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, makeRequest };

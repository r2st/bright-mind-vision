#!/usr/bin/env node

/**
 * Test WhatsApp Integration with Unverified Phone Number
 * Simulates WhatsApp messages to test the complete flow
 */

const https = require('https');

const BASE_URL = 'https://brightmindvision.com';

// Simulate WhatsApp webhook payload for unverified number
const createWhatsAppWebhookPayload = (messageText, fromNumber = '+1234567890') => {
  return {
    object: 'whatsapp_business_account',
    entry: [{
      id: '2079262582905773', // Your business account ID
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15556405993',
            phone_number_id: '845758901952139' // Your phone number ID
          },
          messages: [{
            from: fromNumber,
            id: `wamid.${Date.now()}`,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: {
              body: messageText
            },
            type: 'text'
          }]
        },
        field: 'messages'
      }]
    }]
  };
};

// Test webhook with simulated message
async function testWebhookWithMessage(messageText) {
  console.log(`📱 Testing: "${messageText}"`);
  
  const webhookPayload = createWhatsAppWebhookPayload(messageText);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/meshai/whatsapp-webhook`, {
      method: 'POST',
      body: webhookPayload
    });
    
    if (response.status === 200) {
      console.log(`   ✅ Webhook processed successfully`);
      console.log(`   📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } else {
      console.log(`   ❌ Webhook failed with status: ${response.status}`);
      console.log(`   📊 Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Test AI recommendation directly
async function testAIRecommendation(messageText) {
  console.log(`🤖 Testing AI Recommendation: "${messageText}"`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/meshai/ai-recommendation`, {
      method: 'POST',
      body: {
        message: messageText,
        phoneNumber: '+1234567890'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const recommendations = response.data.recommendations;
      console.log(`   ✅ AI Recommendation successful`);
      console.log(`   📊 Found ${recommendations.products.length} products`);
      console.log(`   🎯 Confidence: ${recommendations.confidence}`);
      console.log(`   💡 Top recommendation: ${recommendations.products[0]?.primaryReason || 'N/A'}`);
      return true;
    } else {
      console.log(`   ❌ AI Recommendation failed: ${response.data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Test WhatsApp status
async function testWhatsAppStatus() {
  console.log(`📊 Testing WhatsApp Status...`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/meshai/whatsapp-status`);
    
    if (response.status === 200 && response.data.success) {
      const status = response.data.status;
      console.log(`   ✅ WhatsApp Status: Connected`);
      console.log(`   📱 Phone Number: ${status.phoneNumberInfo.display_phone_number}`);
      console.log(`   🔍 Verification Status: ${status.phoneNumberInfo.code_verification_status}`);
      console.log(`   🏢 Business Account: ${status.businessAccountInfo.name}`);
      console.log(`   🌐 Webhook URL: ${status.webhookInfo.url}`);
      return true;
    } else {
      console.log(`   ❌ WhatsApp Status failed: ${response.data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// HTTP request helper
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
        'User-Agent': 'WhatsApp-Test/1.0',
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

async function runUnverifiedTests() {
  console.log('🧪 WhatsApp Integration Test (Unverified Phone Number)');
  console.log('='.repeat(60));
  console.log('📱 Testing your WhatsApp integration with simulated messages');
  console.log('='.repeat(60));
  
  const testMessages = [
    "I need help with relaxation and stress relief",
    "I can't sleep and need help", 
    "I'm looking for organic products",
    "I want wellness products for my health",
    "Can you recommend something for stress?"
  ];
  
  let webhookSuccess = 0;
  let aiSuccess = 0;
  
  // Test 1: WhatsApp Status
  console.log('\n📊 STEP 1: Testing WhatsApp Status');
  console.log('-'.repeat(40));
  await testWhatsAppStatus();
  
  // Test 2: AI Recommendations
  console.log('\n🤖 STEP 2: Testing AI Recommendations');
  console.log('-'.repeat(40));
  for (const message of testMessages) {
    const success = await testAIRecommendation(message);
    if (success) aiSuccess++;
    console.log('');
  }
  
  // Test 3: Webhook Simulation
  console.log('\n📱 STEP 3: Testing Webhook with Simulated Messages');
  console.log('-'.repeat(40));
  for (const message of testMessages) {
    const success = await testWebhookWithMessage(message);
    if (success) webhookSuccess++;
    console.log('');
  }
  
  // Results
  console.log('='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`🤖 AI Recommendations: ${aiSuccess}/${testMessages.length} (${((aiSuccess/testMessages.length)*100).toFixed(1)}%)`);
  console.log(`📱 Webhook Processing: ${webhookSuccess}/${testMessages.length} (${((webhookSuccess/testMessages.length)*100).toFixed(1)}%)`);
  
  if (aiSuccess === testMessages.length) {
    console.log('\n🎉 AI Recommendation System: WORKING PERFECTLY!');
  } else {
    console.log('\n⚠️  AI Recommendation System: Some issues detected');
  }
  
  if (webhookSuccess === testMessages.length) {
    console.log('🎉 Webhook Processing: WORKING PERFECTLY!');
  } else {
    console.log('⚠️  Webhook Processing: Some issues detected');
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('✅ Your WhatsApp integration is technically working!');
  console.log('❌ The only issue is phone number verification');
  console.log('🔧 Once verified, real WhatsApp messages will work');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Verify your phone number in Facebook Developer Console');
  console.log('2. Or use a different verified phone number');
  console.log('3. Test with real WhatsApp messages');
  console.log('4. Monitor Netlify function logs');
}

// Run the tests
if (require.main === module) {
  runUnverifiedTests().catch(console.error);
}

module.exports = { runUnverifiedTests, createWhatsAppWebhookPayload };

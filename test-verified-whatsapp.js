#!/usr/bin/env node

/**
 * Test WhatsApp Integration with Verified Phone Number
 * Tests the complete WhatsApp flow with your verified number
 */

const https = require('https');

const BASE_URL = 'https://brightmindvision.com';

// Your verified WhatsApp Business details
const WHATSAPP_CONFIG = {
  phoneNumber: '+91 99803 00360',
  phoneNumberId: '860584457139677',
  businessAccountId: '822989954020609',
  displayName: 'MeshAI-BMV'
};

// Create WhatsApp webhook payload with your verified number
const createVerifiedWhatsAppPayload = (messageText, fromNumber = '+1234567890') => {
  return {
    object: 'whatsapp_business_account',
    entry: [{
      id: WHATSAPP_CONFIG.businessAccountId,
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: WHATSAPP_CONFIG.phoneNumber.replace('+', ''),
            phone_number_id: WHATSAPP_CONFIG.phoneNumberId
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

// Test webhook with verified number
async function testVerifiedWebhook(messageText) {
  console.log(`📱 Testing with verified number: "${messageText}"`);
  
  const webhookPayload = createVerifiedWhatsAppPayload(messageText);
  
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

// Test AI recommendation
async function testAIRecommendation(messageText) {
  console.log(`🤖 Testing AI: "${messageText}"`);
  
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
        'User-Agent': 'WhatsApp-Verified-Test/1.0',
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

async function runVerifiedTests() {
  console.log('🎉 WhatsApp Integration Test (VERIFIED Phone Number)');
  console.log('='.repeat(60));
  console.log(`📱 Testing with your verified number: ${WHATSAPP_CONFIG.phoneNumber}`);
  console.log(`🏢 Business Account: ${WHATSAPP_CONFIG.displayName}`);
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
  
  // Test 3: Webhook with Verified Number
  console.log('\n📱 STEP 3: Testing Webhook with VERIFIED Number');
  console.log('-'.repeat(40));
  for (const message of testMessages) {
    const success = await testVerifiedWebhook(message);
    if (success) webhookSuccess++;
    console.log('');
  }
  
  // Results
  console.log('='.repeat(60));
  console.log('📊 VERIFIED WHATSAPP TEST RESULTS');
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
    console.log('🚀 Your WhatsApp integration is ready for production!');
  } else {
    console.log('⚠️  Webhook Processing: Some issues detected');
    console.log('🔧 Check webhook configuration and try again');
  }
  
  console.log('\n📱 REAL WHATSAPP TESTING:');
  console.log(`Send a message to: ${WHATSAPP_CONFIG.phoneNumber}`);
  console.log('Test messages:');
  testMessages.forEach((msg, index) => {
    console.log(`  ${index + 1}. "${msg}"`);
  });
  
  console.log('\n🎯 EXPECTED FLOW:');
  console.log('1. Send message to +91 99803 00360');
  console.log('2. WhatsApp sends webhook to your server');
  console.log('3. AI processes message and generates recommendations');
  console.log('4. AI response sent back to your phone');
}

// Run the tests
if (require.main === module) {
  runVerifiedTests().catch(console.error);
}

module.exports = { runVerifiedTests, createVerifiedWhatsAppPayload };

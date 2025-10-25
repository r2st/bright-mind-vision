#!/usr/bin/env node

/**
 * Mobile WhatsApp Testing Script
 * Simulates mobile phone testing for WhatsApp integration
 */

const https = require('https');

const BASE_URL = 'https://brightmindvision.com';

// Simulate mobile phone testing
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
        'User-Agent': 'WhatsApp-Mobile-Test/1.0',
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

// Simulate mobile phone messages
const mobileTestMessages = [
  {
    message: "I need help with relaxation and stress relief",
    expectedProducts: ["Himalayan salt lamp", "Essential oil diffuser", "Meditation cushion"],
    category: "Relaxation"
  },
  {
    message: "I can't sleep and need help",
    expectedProducts: ["Sleep products", "Relaxation items"],
    category: "Sleep"
  },
  {
    message: "I'm looking for organic products",
    expectedProducts: ["Organic green tea", "Natural products"],
    category: "Organic"
  },
  {
    message: "I want wellness products for my health",
    expectedProducts: ["Health products", "Wellness items"],
    category: "Wellness"
  },
  {
    message: "Can you recommend something for stress?",
    expectedProducts: ["Stress relief products", "Relaxation items"],
    category: "Stress Relief"
  }
];

async function testMobileMessage(messageData) {
  console.log(`📱 Testing: "${messageData.message}"`);
  console.log(`   Category: ${messageData.category}`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/meshai/ai-recommendation`, {
      method: 'POST',
      body: {
        message: messageData.message,
        phoneNumber: "+1234567890" // Simulated phone number
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const recommendations = response.data.recommendations;
      console.log(`   ✅ AI Response: ${recommendations.products.length} products found`);
      console.log(`   📊 Confidence: ${recommendations.confidence}`);
      console.log(`   🎯 Top Recommendation: ${recommendations.products[0]?.reason || 'N/A'}`);
      return true;
    } else {
      console.log(`   ❌ Failed: ${response.data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testWebhookFromMobile() {
  console.log('🔗 Testing Webhook (Mobile Simulation)...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/meshai/whatsapp-webhook?hub.mode=subscribe&hub.challenge=mobile-test&hub.verify_token=4ab273511eafcbe7911056e510a161c6`);
    
    if (response.raw === 'mobile-test') {
      console.log('   ✅ Webhook verification: PASSED');
      return true;
    } else {
      console.log('   ❌ Webhook verification: FAILED');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Webhook verification: ERROR -', error.message);
    return false;
  }
}

async function testWhatsAppStatus() {
  console.log('📊 Testing WhatsApp Status (Mobile View)...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/meshai/whatsapp-status`);
    
    if (response.status === 200 && response.data.success) {
      const status = response.data.status;
      console.log('   ✅ WhatsApp Status: PASSED');
      console.log('   📱 Mobile Configuration:');
      console.log(`     Access Token: ${status.configuration.accessToken}`);
      console.log(`     Phone Number: ${status.configuration.phoneNumberId}`);
      console.log(`     Business Account: ${status.configuration.businessAccountId}`);
      console.log(`     Webhook URL: ${status.webhookInfo.url}`);
      return true;
    } else {
      console.log('   ❌ WhatsApp Status: FAILED');
      return false;
    }
  } catch (error) {
    console.log('   ❌ WhatsApp Status: ERROR -', error.message);
    return false;
  }
}

async function runMobileTests() {
  console.log('📱 Mobile WhatsApp Integration Test');
  console.log('='.repeat(50));
  console.log('🎯 Simulating mobile phone testing for WhatsApp integration');
  console.log('='.repeat(50));
  
  const results = [];
  
  // Test webhook
  results.push(await testWebhookFromMobile());
  
  // Test WhatsApp status
  results.push(await testWhatsAppStatus());
  
  console.log('\n📱 Testing Mobile Messages:');
  console.log('-'.repeat(30));
  
  // Test mobile messages
  for (const messageData of mobileTestMessages) {
    const success = await testMobileMessage(messageData);
    results.push(success);
    console.log(''); // Empty line for readability
  }
  
  console.log('='.repeat(50));
  console.log('📊 MOBILE TEST RESULTS');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${total - passed}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All mobile tests passed!');
    console.log('📱 Your WhatsApp integration is ready for mobile testing!');
  } else {
    console.log('\n⚠️  Some mobile tests failed.');
    console.log('🔧 Check the configuration and try again.');
  }
  
  console.log('\n📋 Next Steps for Mobile Testing:');
  console.log('1. Configure WhatsApp Business API in Facebook Developer Console');
  console.log('2. Set webhook URL: https://brightmindvision.com/api/meshai/whatsapp-webhook');
  console.log('3. Set verify token: 4ab273511eafcbe7911056e510a161c6');
  console.log('4. Get a valid WhatsApp access token');
  console.log('5. Send test messages from your mobile phone to your WhatsApp Business number');
  console.log('6. Check Netlify function logs for incoming messages');
  
  console.log('\n📱 Mobile Test Messages to Send:');
  mobileTestMessages.forEach((msg, index) => {
    console.log(`${index + 1}. "${msg.message}"`);
  });
}

// Run the mobile tests
if (require.main === module) {
  runMobileTests().catch(console.error);
}

module.exports = { runMobileTests, mobileTestMessages };

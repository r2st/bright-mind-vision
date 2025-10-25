#!/usr/bin/env node

/**
 * WhatsApp Message Simulation
 * Simulates a WhatsApp message to test the complete flow
 */

const https = require('https');

const BASE_URL = 'https://brightmindvision.com';

// Simulate WhatsApp webhook payload
const simulateWhatsAppMessage = (messageText, fromNumber = '+1234567890') => {
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

// Send simulated webhook to your server
async function testWhatsAppFlow(messageText) {
  console.log(`📱 Simulating WhatsApp message: "${messageText}"`);
  
  const webhookPayload = simulateWhatsAppMessage(messageText);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/meshai/whatsapp-webhook`, {
      method: 'POST',
      body: webhookPayload
    });
    
    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log(`   ✅ Webhook processed successfully`);
      return true;
    } else {
      console.log(`   ❌ Webhook failed: ${response.data}`);
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
        'User-Agent': 'WhatsApp-Simulation/1.0',
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

async function runSimulation() {
  console.log('🧪 WhatsApp Message Simulation Test');
  console.log('='.repeat(50));
  console.log('📱 Simulating real WhatsApp messages to test your integration');
  console.log('='.repeat(50));
  
  const testMessages = [
    "I need help with relaxation and stress relief",
    "I can't sleep and need help",
    "I'm looking for organic products",
    "I want wellness products for my health",
    "Can you recommend something for stress?"
  ];
  
  let successCount = 0;
  
  for (const message of testMessages) {
    const success = await testWhatsAppFlow(message);
    if (success) successCount++;
    console.log(''); // Empty line
  }
  
  console.log('='.repeat(50));
  console.log('📊 SIMULATION RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${testMessages.length - successCount}`);
  console.log(`📈 Success Rate: ${((successCount / testMessages.length) * 100).toFixed(1)}%`);
  
  if (successCount === testMessages.length) {
    console.log('\n🎉 All simulations passed!');
    console.log('📱 Your WhatsApp integration is working correctly!');
    console.log('🔧 The issue is that your phone number needs to be verified in Facebook Developer Console.');
  } else {
    console.log('\n⚠️  Some simulations failed.');
    console.log('🔧 Check your webhook configuration and try again.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to Facebook Developer Console');
  console.log('2. Navigate to WhatsApp > API Setup');
  console.log('3. Verify your phone number: +15556405993');
  console.log('4. Test with real WhatsApp messages');
  console.log('5. Check Netlify function logs for incoming messages');
}

// Run the simulation
if (require.main === module) {
  runSimulation().catch(console.error);
}

module.exports = { runSimulation, simulateWhatsAppMessage };

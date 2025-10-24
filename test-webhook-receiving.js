#!/usr/bin/env node

/**
 * Test WhatsApp Webhook Receiving
 * 
 * This script helps you test the webhook by simulating incoming messages
 */

const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testWebhookReceiving() {
  log('\n🔍 Testing WhatsApp Webhook Receiving', 'cyan');
  log('====================================', 'cyan');
  
  const webhookUrl = 'http://localhost:3000/api/meshai/whatsapp-webhook';
  
  // Simulate incoming WhatsApp message
  const testMessage = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '123456789',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: '123456789'
              },
              messages: [
                {
                  from: '919108458006',
                  id: 'wamid.test123',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: {
                    body: 'I want to create a relaxing bedroom with tea and aromatherapy'
                  },
                  type: 'text'
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };
  
  log(`📤 Sending test message to webhook: ${webhookUrl}`, 'blue');
  log(`📱 Simulating message from: +919108458006`, 'blue');
  log(`💬 Message: "I want to create a relaxing bedroom with tea and aromatherapy"`, 'blue');
  
  try {
    const result = await sendWebhookTest(webhookUrl, testMessage);
    
    if (result.success) {
      log(`✅ Webhook test successful`, 'green');
      log(`📥 Response: ${result.response}`, 'blue');
    } else {
      log(`❌ Webhook test failed: ${result.error}`, 'red');
    }
    
  } catch (error) {
    log(`❌ Webhook test error: ${error.message}`, 'red');
  }
}

async function sendWebhookTest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({
            success: true,
            response: responseData
          });
        } else {
          resolve({
            success: false,
            error: `HTTP ${res.statusCode}: ${responseData}`
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

function main() {
  log('🧪 WhatsApp Webhook Test', 'bright');
  log('=======================', 'bright');
  
  log('\n📋 Instructions:', 'yellow');
  log('1. Make sure your development server is running: npm run dev', 'blue');
  log('2. This script will simulate an incoming WhatsApp message', 'blue');
  log('3. Check your server logs to see if the webhook processes the message', 'blue');
  log('4. The AI recommendation system should generate product suggestions', 'blue');
  
  testWebhookReceiving().catch(error => {
    log(`❌ Test failed: ${error.message}`, 'red');
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  testWebhookReceiving,
  sendWebhookTest
};

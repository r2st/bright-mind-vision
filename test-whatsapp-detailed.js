#!/usr/bin/env node

/**
 * Detailed WhatsApp Test Script
 * 
 * This script provides detailed debugging for WhatsApp message sending
 */

// Load environment variables manually
const fs = require('fs');
const path = require('path');

// Simple .env.local loader
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=');
            process.env[key] = value;
          }
        }
      });
    }
  } catch (error) {
    console.log('⚠️ Could not load .env.local file:', error.message);
  }
}

loadEnvFile();

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

async function testWhatsAppAPI() {
  log('\n🔍 Detailed WhatsApp API Test', 'cyan');
  log('============================', 'cyan');
  
  const phoneNumber = '+919108458006';
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  log(`\n📱 Testing with phone number: ${phoneNumber}`, 'blue');
  log(`🔑 Access Token: ${accessToken ? accessToken.substring(0, 20) + '...' : 'NOT SET'}`, 'blue');
  log(`📞 Phone Number ID: ${phoneNumberId}`, 'blue');
  
  // Test different message formats
  const testMessages = [
    {
      name: 'Simple Text',
      message: 'Hello! This is a test message from Meshai.'
    },
    {
      name: 'Emoji Message',
      message: '🧪 Test message from Meshai WhatsApp integration!'
    },
    {
      name: 'Product Recommendation',
      message: 'Based on your interest in relaxation, I recommend our Essential Oil Diffuser (98% confidence). Perfect for creating a calming atmosphere!'
    }
  ];
  
  for (const testMsg of testMessages) {
    log(`\n📤 Testing: ${testMsg.name}`, 'yellow');
    
    try {
      const result = await sendWhatsAppMessage(phoneNumber, testMsg.message, accessToken, phoneNumberId);
      
      if (result.success) {
        log(`✅ ${testMsg.name} sent successfully`, 'green');
        log(`📱 Message ID: ${result.messageId}`, 'blue');
      } else {
        log(`❌ ${testMsg.name} failed: ${result.error}`, 'red');
      }
      
      // Wait 2 seconds between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      log(`❌ ${testMsg.name} error: ${error.message}`, 'red');
    }
  }
}

async function sendWhatsAppMessage(phoneNumber, message, accessToken, phoneNumberId) {
  return new Promise((resolve, reject) => {
    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: message
      }
    };
    
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v21.0/${phoneNumberId}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    log(`📤 Sending to WhatsApp API:`, 'blue');
    log(`   URL: https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, 'blue');
    log(`   Phone: ${phoneNumber}`, 'blue');
    log(`   Message: ${message.substring(0, 50)}...`, 'blue');
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        log(`📥 Response Status: ${res.statusCode}`, 'blue');
        log(`📥 Response Data: ${data}`, 'blue');
        
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            resolve({
              success: true,
              messageId: result.messages?.[0]?.id || 'unknown',
              data: result
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Failed to parse response',
              data: data
            });
          }
        } else {
          resolve({
            success: false,
            error: `HTTP ${res.statusCode}: ${data}`,
            data: data
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
  log('🔍 WhatsApp Detailed Test', 'bright');
  log('========================', 'bright');
  
  testWhatsAppAPI().catch(error => {
    log(`❌ Test failed: ${error.message}`, 'red');
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  testWhatsAppAPI,
  sendWhatsAppMessage
};

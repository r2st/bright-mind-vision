#!/usr/bin/env node

/**
 * WhatsApp Business API Integration Test Script
 * 
 * This script tests the WhatsApp Business API integration for Meshai
 * Run with: node test-whatsapp-integration.js
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

// Configuration
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const API_ENDPOINTS = {
  status: '/api/meshai/whatsapp-status',
  send: '/api/meshai/whatsapp-send',
  test: '/api/meshai/whatsapp-test',
  webhook: '/api/meshai/whatsapp-webhook'
};

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

function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const options = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    log(`🌐 Making ${options.method} request to: ${url}`, 'blue');
    
    const req = client.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        log(`📥 Response received - Status: ${res.statusCode}`, 'blue');
        
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            raw: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            raw: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ Request error: ${error.message}`, 'red');
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testWhatsAppStatus() {
  log('\n🔍 Testing WhatsApp Status...', 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}${API_ENDPOINTS.status}`);
    
    if (response.statusCode === 200) {
      log('✅ Status check successful', 'green');
      log(`📊 Configuration Status:`, 'yellow');
      
      const config = response.data.status?.configuration || {};
      Object.entries(config).forEach(([key, value]) => {
        const icon = value.includes('✅') ? '✅' : '❌';
        log(`   ${icon} ${key}: ${value}`, value.includes('✅') ? 'green' : 'red');
      });
      
      return { success: true, data: response.data };
    } else {
      log(`❌ Status check failed: ${response.statusCode}`, 'red');
      return { success: false, error: response.data };
    }
  } catch (error) {
    log(`❌ Status check error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testWebhookVerification() {
  log('\n🔗 Testing Webhook Verification...', 'cyan');
  
  try {
    // Use the verify token from environment or fallback to test token
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'test-verify-token-123';
    const testUrl = `${BASE_URL}${API_ENDPOINTS.webhook}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test123`;
    
    log(`🔍 Testing with verify token: ${verifyToken}`, 'blue');
    log(`🔍 Environment token: ${process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'NOT SET'}`, 'blue');
    
    const response = await makeRequest(testUrl);
    
    if (response.statusCode === 200 && response.data === 'test123') {
      log('✅ Webhook verification successful', 'green');
      return { success: true, challenge: response.data };
    } else {
      log(`❌ Webhook verification failed: ${response.statusCode}`, 'red');
      log(`   Expected: test123, Got: ${response.data}`, 'red');
      log(`   Response details: ${JSON.stringify(response.data)}`, 'red');
      return { success: false, error: 'Challenge mismatch' };
    }
  } catch (error) {
    log(`❌ Webhook verification error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testSendMessage(phoneNumber) {
  log('\n📤 Testing Message Sending...', 'cyan');
  
  if (!phoneNumber) {
    log('⚠️ No phone number provided, skipping send test', 'yellow');
    return { success: true, skipped: true };
  }
  
  try {
    const testMessage = "🧪 Test message from Meshai WhatsApp integration! This is a test to verify your WhatsApp Business API is working correctly.";
    
    const response = await makeRequest(`${BASE_URL}${API_ENDPOINTS.send}`, {
      to: phoneNumber,
      message: testMessage,
      type: 'text'
    });
    
    if (response.statusCode === 200 && response.data.success) {
      log('✅ Message sent successfully', 'green');
      log(`📱 Message ID: ${response.data.messageId}`, 'blue');
      return { success: true, messageId: response.data.messageId };
    } else {
      log(`❌ Message send failed: ${response.statusCode}`, 'red');
      log(`   Error: ${JSON.stringify(response.data)}`, 'red');
      return { success: false, error: response.data };
    }
  } catch (error) {
    log(`❌ Message send error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testAIRecommendation() {
  log('\n🤖 Testing AI Recommendation Integration...', 'cyan');
  
  try {
    const testMessage = "I want to create a relaxing bedroom with tea and aromatherapy";
    
    const response = await makeRequest(`${BASE_URL}/api/meshai/ai-recommendation`, {
      message: testMessage,
      customerId: 'test-whatsapp-integration'
    });
    
    if (response.statusCode === 200 && response.data.success) {
      log('✅ AI recommendation successful', 'green');
      const products = response.data.recommendations?.products || [];
      log(`📦 Recommended ${products.length} products`, 'blue');
      
      products.slice(0, 3).forEach((product, index) => {
        log(`   ${index + 1}. ${product.productId} (${(product.confidence * 100).toFixed(0)}%)`, 'blue');
      });
      
      return { success: true, products: products };
    } else {
      log(`❌ AI recommendation failed: ${response.statusCode}`, 'red');
      return { success: false, error: response.data };
    }
  } catch (error) {
    log(`❌ AI recommendation error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runFullTest(phoneNumber) {
  log('\n🚀 Running Full WhatsApp Integration Test...', 'magenta');
  log('='.repeat(50), 'magenta');
  
  const results = {
    status: await testWhatsAppStatus(),
    webhook: await testWebhookVerification(),
    ai: await testAIRecommendation(),
    send: await testSendMessage(phoneNumber)
  };
  
  log('\n📊 Test Results Summary:', 'magenta');
  log('='.repeat(30), 'magenta');
  
  let passedTests = 0;
  let totalTests = 0;
  
  Object.entries(results).forEach(([testName, result]) => {
    totalTests++;
    if (result.success) {
      passedTests++;
      log(`✅ ${testName.toUpperCase()}: PASSED`, 'green');
    } else {
      log(`❌ ${testName.toUpperCase()}: FAILED`, 'red');
      if (result.error) {
        log(`   Error: ${result.error}`, 'red');
      }
    }
  });
  
  log('\n📈 Overall Results:', 'magenta');
  log(`   Tests Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! WhatsApp integration is ready!', 'green');
  } else {
    log('\n⚠️ Some tests failed. Please check the configuration.', 'yellow');
  }
  
  return results;
}

// Main execution
async function main() {
  log('🧪 WhatsApp Business API Integration Test', 'bright');
  log('==========================================', 'bright');
  
  const phoneNumber = process.argv[2]; // Get phone number from command line
  
  if (phoneNumber) {
    log(`📱 Testing with phone number: ${phoneNumber}`, 'blue');
  } else {
    log('⚠️ No phone number provided. Send tests will be skipped.', 'yellow');
    log('   Usage: node test-whatsapp-integration.js [+1234567890]', 'yellow');
  }
  
  try {
    await runFullTest(phoneNumber);
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testWhatsAppStatus,
  testWebhookVerification,
  testSendMessage,
  testAIRecommendation,
  runFullTest
};

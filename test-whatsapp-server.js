#!/usr/bin/env node

/**
 * WhatsApp Integration Test Script for brightmindvision.com
 * Tests all WhatsApp endpoints and functionality
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'https://brightmindvision.com';
const WEBHOOK_VERIFY_TOKEN = '4ab273511eafcbe7911056e510a161c6';

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp-Test-Script/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            rawData: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test function wrapper
async function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Testing: ${testName}`);
  console.log('─'.repeat(50));
  
  try {
    const result = await testFunction();
    if (result.success) {
      testResults.passed++;
      console.log(`✅ PASSED: ${testName}`);
      if (result.details) {
        console.log(`   ${result.details}`);
      }
    } else {
      testResults.failed++;
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${result.error}`);
    }
    testResults.details.push({
      name: testName,
      success: result.success,
      error: result.error,
      details: result.details
    });
  } catch (error) {
    testResults.failed++;
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Exception: ${error.message}`);
    testResults.details.push({
      name: testName,
      success: false,
      error: error.message,
      details: null
    });
  }
}

// Test 1: Webhook Verification
async function testWebhookVerification() {
  const url = `${BASE_URL}/api/meshai/whatsapp-webhook?hub.mode=subscribe&hub.challenge=test-challenge&hub.verify_token=${WEBHOOK_VERIFY_TOKEN}`;
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode === 200 && response.rawData === 'test-challenge') {
      return {
        success: true,
        details: `Webhook verification successful. Challenge: ${response.rawData}`
      };
    } else {
      return {
        success: false,
        error: `Expected challenge response, got: ${response.rawData}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test 2: Webhook Verification with Wrong Token
async function testWebhookVerificationWrongToken() {
  const url = `${BASE_URL}/api/meshai/whatsapp-webhook?hub.mode=subscribe&hub.challenge=test-challenge&hub.verify_token=wrong-token`;
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode === 403 || response.statusCode === 400) {
      return {
        success: true,
        details: 'Webhook correctly rejected invalid token'
      };
    } else {
      return {
        success: false,
        error: `Expected 403/400 status, got: ${response.statusCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test 3: AI Recommendation System
async function testAIRecommendation() {
  const url = `${BASE_URL}/api/meshai/ai-recommendation`;
  const testMessage = {
    message: "I need help with relaxation and stress relief",
    phoneNumber: "+1234567890"
  };
  
  try {
    const response = await makeRequest(url, {
      method: 'POST',
      body: testMessage
    });
    
    if (response.statusCode === 200 && response.data.success) {
      const recommendations = response.data.recommendations;
      return {
        success: true,
        details: `AI recommendations working. Found ${recommendations.products.length} products with ${recommendations.confidence} confidence`
      };
    } else {
      return {
        success: false,
        error: `AI recommendation failed: ${JSON.stringify(response.data)}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test 4: WhatsApp Status Check
async function testWhatsAppStatus() {
  const url = `${BASE_URL}/api/meshai/whatsapp-status`;
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode === 200 && response.data.success) {
      const status = response.data.status;
      const configStatus = status.configuration;
      const allConfigured = Object.values(configStatus).every(status => status.includes('✅'));
      
      return {
        success: true,
        details: `WhatsApp status check successful. Configuration: ${allConfigured ? 'All configured' : 'Some issues detected'}`
      };
    } else {
      return {
        success: false,
        error: `Status check failed: ${JSON.stringify(response.data)}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test 5: Test WhatsApp Messages Endpoint
async function testWhatsAppMessages() {
  const url = `${BASE_URL}/api/meshai/test-whatsapp-messages`;
  const testData = {
    testType: "custom",
    customMessage: "I'm looking for wellness products"
  };
  
  try {
    const response = await makeRequest(url, {
      method: 'POST',
      body: testData
    });
    
    if (response.statusCode === 200) {
      return {
        success: true,
        details: 'WhatsApp messages test endpoint accessible'
      };
    } else {
      return {
        success: false,
        error: `Test messages endpoint failed: ${response.statusCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test 6: Simple Recommendation Test
async function testSimpleRecommendation() {
  const url = `${BASE_URL}/api/meshai/test-simple`;
  const testData = {
    message: "I want to buy organic products"
  };
  
  try {
    const response = await makeRequest(url, {
      method: 'POST',
      body: testData
    });
    
    if (response.statusCode === 200) {
      return {
        success: true,
        details: 'Simple recommendation test working'
      };
    } else {
      return {
        success: false,
        error: `Simple recommendation failed: ${response.statusCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test 7: Test Different Message Types
async function testDifferentMessageTypes() {
  const testMessages = [
    "I need help with sleep",
    "Looking for organic products",
    "I want to buy something for my health",
    "Can you recommend something for stress?",
    "I'm interested in wellness products"
  ];
  
  let successCount = 0;
  const results = [];
  
  for (const message of testMessages) {
    try {
      const url = `${BASE_URL}/api/meshai/ai-recommendation`;
      const response = await makeRequest(url, {
        method: 'POST',
        body: { message, phoneNumber: "+1234567890" }
      });
      
      if (response.statusCode === 200 && response.data.success) {
        successCount++;
        results.push(`✅ "${message}" - ${response.data.recommendations.products.length} recommendations`);
      } else {
        results.push(`❌ "${message}" - Failed`);
      }
    } catch (error) {
      results.push(`❌ "${message}" - Error: ${error.message}`);
    }
  }
  
  return {
    success: successCount === testMessages.length,
    details: `Tested ${testMessages.length} message types. ${successCount} successful.`,
    results: results
  };
}

// Test 8: Error Handling
async function testErrorHandling() {
  const url = `${BASE_URL}/api/meshai/ai-recommendation`;
  
  try {
    // Test with empty message
    const response = await makeRequest(url, {
      method: 'POST',
      body: { message: "", phoneNumber: "+1234567890" }
    });
    
    if (response.statusCode === 400 || response.statusCode === 422) {
      return {
        success: true,
        details: 'Error handling working correctly for invalid input'
      };
    } else {
      return {
        success: false,
        error: `Expected error status for empty message, got: ${response.statusCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test 9: Performance Test
async function testPerformance() {
  const startTime = Date.now();
  const url = `${BASE_URL}/api/meshai/ai-recommendation`;
  
  try {
    const response = await makeRequest(url, {
      method: 'POST',
      body: { 
        message: "I need wellness products", 
        phoneNumber: "+1234567890" 
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.statusCode === 200 && responseTime < 5000) {
      return {
        success: true,
        details: `Performance test passed. Response time: ${responseTime}ms`
      };
    } else {
      return {
        success: false,
        error: `Performance test failed. Response time: ${responseTime}ms`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test 10: Website Accessibility
async function testWebsiteAccessibility() {
  try {
    const response = await makeRequest(BASE_URL);
    
    if (response.statusCode === 200) {
      return {
        success: true,
        details: 'Website is accessible and responding'
      };
    } else {
      return {
        success: false,
        error: `Website returned status: ${response.statusCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting WhatsApp Integration Tests for brightmindvision.com');
  console.log('='.repeat(60));
  console.log(`📡 Testing server: ${BASE_URL}`);
  console.log(`🔑 Using verify token: ${WEBHOOK_VERIFY_TOKEN}`);
  console.log('='.repeat(60));
  
  // Run all tests
  await runTest('Website Accessibility', testWebsiteAccessibility);
  await runTest('Webhook Verification (Correct Token)', testWebhookVerification);
  await runTest('Webhook Verification (Wrong Token)', testWebhookVerificationWrongToken);
  await runTest('AI Recommendation System', testAIRecommendation);
  await runTest('WhatsApp Status Check', testWhatsAppStatus);
  await runTest('WhatsApp Messages Endpoint', testWhatsAppMessages);
  await runTest('Simple Recommendation Test', testSimpleRecommendation);
  await runTest('Different Message Types', testDifferentMessageTypes);
  await runTest('Error Handling', testErrorHandling);
  await runTest('Performance Test', testPerformance);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
  }
  
  console.log('\n🎉 Test completed!');
  
  if (testResults.passed === testResults.total) {
    console.log('🚀 All tests passed! Your WhatsApp integration is ready!');
  } else {
    console.log('⚠️  Some tests failed. Check the details above.');
  }
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  makeRequest,
  testResults
};

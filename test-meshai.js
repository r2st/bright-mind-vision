#!/usr/bin/env node

/**
 * Meshai WhatsApp Message Testing Script
 * 
 * This script tests the WhatsApp message processing and AI recommendation system
 * Run with: node test-meshai.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const API_ENDPOINT = '/api/meshai/test-whatsapp-messages';

// Test scenarios
const testScenarios = [
  {
    name: 'Relaxation Request',
    message: 'Hi! I\'m looking for something to help me relax after work. Any recommendations?',
    expectedProducts: ['P002', 'P003', 'P005'] // Salt lamp, diffuser, meditation cushion
  },
  {
    name: 'Tea Inquiry',
    message: 'Do you have any organic teas? I prefer something healthy and natural.',
    expectedProducts: ['P001', 'P006'] // Green tea, sleep tea
  },
  {
    name: 'Yoga Equipment',
    message: 'I need a yoga mat for my home practice. What do you recommend?',
    expectedProducts: ['P004'] // Yoga mat
  },
  {
    name: 'Aromatherapy Setup',
    message: 'Looking for aromatherapy products for my office space.',
    expectedProducts: ['P003', 'P002'] // Diffuser, salt lamp
  },
  {
    name: 'Sleep Issues',
    message: 'Having trouble sleeping, what can help?',
    expectedProducts: ['P006', 'P002'] // Sleep tea, salt lamp
  },
  {
    name: 'Meditation Practice',
    message: 'Starting meditation practice, need a cushion',
    expectedProducts: ['P005', 'P002'] // Meditation cushion, salt lamp
  },
  {
    name: 'Complex Wellness Request',
    message: 'I want to create a relaxing bedroom with tea and aromatherapy',
    expectedProducts: ['P002', 'P003', 'P006', 'P001'] // Multiple products
  },
  {
    name: 'Generic Greeting',
    message: 'Hello',
    expectedProducts: [] // Should handle gracefully
  }
];

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

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    log(`🌐 Making HTTP request to: ${url}`, 'blue');
    
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    log(`📤 Request body: ${postData}`, 'blue');
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    log(`🔧 Request options: ${JSON.stringify(options, null, 2)}`, 'blue');

    const req = client.request(options, (res) => {
      log(`📥 Response received - Status: ${res.statusCode}`, 'blue');
      log(`📥 Response headers: ${JSON.stringify(res.headers, null, 2)}`, 'blue');
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
        log(`📥 Chunk received: ${chunk.length} bytes`, 'blue');
      });
      
      res.on('end', () => {
        log(`📥 Full response data: ${responseData}`, 'blue');
        try {
          const parsedData = JSON.parse(responseData);
          log(`✅ Successfully parsed JSON response`, 'green');
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          log(`❌ Failed to parse JSON: ${error.message}`, 'red');
          log(`❌ Raw response: ${responseData}`, 'red');
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ Request error: ${error.message}`, 'red');
      log(`❌ Error details: ${JSON.stringify(error, null, 2)}`, 'red');
      reject(error);
    });

    req.on('timeout', () => {
      log(`❌ Request timeout`, 'red');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.setTimeout(10000); // 10 second timeout
    
    log(`📤 Writing request data...`, 'blue');
    req.write(postData);
    req.end();
    log(`📤 Request sent`, 'blue');
  });
}

async function testSingleMessage(message, expectedProducts = []) {
  try {
    log(`\n🧪 Testing: "${message}"`, 'cyan');
    log(`🔍 Debug: Making request to ${BASE_URL}${API_ENDPOINT}`, 'blue');
    
    const requestData = {
      testType: 'custom',
      customMessage: message
    };
    
    log(`📤 Request data: ${JSON.stringify(requestData, null, 2)}`, 'blue');
    
    const response = await makeRequest(`${BASE_URL}${API_ENDPOINT}`, requestData);

    log(`📥 Response status: ${response.status}`, 'blue');
    log(`📥 Response data: ${JSON.stringify(response.data, null, 2)}`, 'blue');

    if (response.status !== 200) {
      log(`❌ API Error - Status: ${response.status}`, 'red');
      log(`❌ API Error - Data: ${JSON.stringify(response.data)}`, 'red');
      throw new Error(`API returned status ${response.status}: ${response.data.error || 'Unknown error'}`);
    }

    if (!response.data.results || response.data.results.length === 0) {
      log(`❌ No results in response`, 'red');
      throw new Error('No results returned from API');
    }

    const result = response.data.results[0];
    log(`🔍 Result: ${JSON.stringify(result, null, 2)}`, 'blue');
    
    if (result.error) {
      log(`❌ Error in result: ${result.error}`, 'red');
      return { success: false, error: result.error };
    }

    const recommendations = result.actualResults.products;
    const recommendedProductIds = recommendations.map(r => r.productId);
    
    // Check if expected products are recommended
    const matchingProducts = expectedProducts.filter(expectedId => 
      recommendedProductIds.includes(expectedId)
    );
    
    const accuracy = expectedProducts.length > 0 ? 
      (matchingProducts.length / expectedProducts.length) * 100 : 
      (recommendations.length > 0 ? 50 : 100);

    log(`📊 Results:`, 'blue');
    log(`   • Recommendations: ${recommendations.length}`, 'reset');
    log(`   • Expected: ${expectedProducts.length}`, 'reset');
    log(`   • Matching: ${matchingProducts.length}`, 'reset');
    log(`   • Accuracy: ${accuracy.toFixed(1)}%`, accuracy >= 70 ? 'green' : 'yellow');
    log(`   • Overall Confidence: ${(result.actualResults.overallConfidence * 100).toFixed(1)}%`, 'blue');
    
    if (recommendations.length > 0) {
      log(`\n🎯 Top Recommendations:`, 'magenta');
      recommendations.slice(0, 3).forEach((rec, index) => {
        const confidence = (rec.confidence * 100).toFixed(1);
        log(`   ${index + 1}. ${rec.productId} (${confidence}%) - ${rec.reason}`, 'reset');
      });
    }

    if (expectedProducts.length > 0 && matchingProducts.length < expectedProducts.length) {
      const missing = expectedProducts.filter(id => !recommendedProductIds.includes(id));
      log(`\n⚠️  Missing expected products: ${missing.join(', ')}`, 'yellow');
    }

    return {
      success: true,
      accuracy,
      recommendations: recommendations.length,
      confidence: result.actualResults.overallConfidence,
      matchingProducts: matchingProducts.length,
      expectedProducts: expectedProducts.length
    };

  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  try {
    log(`🚀 Starting Meshai WhatsApp Message Tests`, 'bright');
    log(`📍 Testing against: ${BASE_URL}${API_ENDPOINT}`, 'blue');
    log(`⏰ Started at: ${new Date().toISOString()}`, 'blue');
    
    const results = [];
    let totalAccuracy = 0;
    let successfulTests = 0;

    for (const scenario of testScenarios) {
      const result = await testSingleMessage(scenario.message, scenario.expectedProducts);
      results.push({
        name: scenario.name,
        ...result
      });

      if (result.success) {
        totalAccuracy += result.accuracy;
        successfulTests++;
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    log(`\n📈 Test Summary`, 'bright');
    log(`═══════════════════════════════════════`, 'blue');
    log(`Total Tests: ${testScenarios.length}`, 'reset');
    log(`Successful: ${successfulTests}`, 'green');
    log(`Failed: ${testScenarios.length - successfulTests}`, 'red');
    log(`Average Accuracy: ${successfulTests > 0 ? (totalAccuracy / successfulTests).toFixed(1) : 0}%`, 'blue');
    
    const successRate = (successfulTests / testScenarios.length) * 100;
    log(`Success Rate: ${successRate.toFixed(1)}%`, successRate >= 80 ? 'green' : 'yellow');

    // Detailed results
    log(`\n📋 Detailed Results:`, 'bright');
    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const accuracy = result.success ? `${result.accuracy.toFixed(1)}%` : 'N/A';
      log(`${status} ${result.name}: ${accuracy}`, result.success ? 'green' : 'red');
    });

    // Recommendations for improvement
    if (successRate < 80) {
      log(`\n💡 Recommendations:`, 'yellow');
      log(`   • Check AI recommendation algorithms`, 'reset');
      log(`   • Verify product data and tags`, 'reset');
      log(`   • Review intent detection logic`, 'reset');
      log(`   • Test with more diverse messages`, 'reset');
    }

    log(`\n⏰ Completed at: ${new Date().toISOString()}`, 'blue');
    
    return results;

  } catch (error) {
    log(`💥 Test suite failed: ${error.message}`, 'red');
    throw error;
  }
}

async function runComprehensiveTest() {
  try {
    log(`🧪 Running Comprehensive Test Suite`, 'bright');
    
    const response = await makeRequest(`${BASE_URL}${API_ENDPOINT}`, {
      testType: 'all'
    });

    if (response.status !== 200) {
      throw new Error(`API returned status ${response.status}: ${response.data.error || 'Unknown error'}`);
    }

    const data = response.data;
    
    log(`\n📊 Comprehensive Test Results:`, 'bright');
    log(`═══════════════════════════════════════`, 'blue');
    log(`Total Tests: ${data.totalTests}`, 'reset');
    log(`Success Rate: ${data.summary.successRate}`, 'green');
    log(`Average Confidence: ${data.summary.averageConfidence}`, 'blue');
    
    log(`\n📈 Category Performance:`, 'magenta');
    data.summary.categoryBreakdown.forEach(category => {
      const color = parseFloat(category.successRate) >= 80 ? 'green' : 
                   parseFloat(category.successRate) >= 60 ? 'yellow' : 'red';
      log(`   ${category.category}: ${category.successRate} (${category.passed}/${category.total})`, color);
    });

    if (data.summary.needsImprovement.length > 0) {
      log(`\n⚠️  Categories needing improvement: ${data.summary.needsImprovement.join(', ')}`, 'yellow');
    }

    return data;

  } catch (error) {
    log(`💥 Comprehensive test failed: ${error.message}`, 'red');
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  try {
    switch (command) {
      case 'all':
        await runAllTests();
        break;
      case 'comprehensive':
        await runComprehensiveTest();
        break;
      case 'single':
        const message = args[1];
        if (!message) {
          log('❌ Please provide a message to test', 'red');
          log('Usage: node test-meshai.js single "Your test message"', 'yellow');
          process.exit(1);
        }
        await testSingleMessage(message);
        break;
      default:
        log('❌ Unknown command', 'red');
        log('Available commands:', 'yellow');
        log('  all          - Run all predefined test scenarios', 'reset');
        log('  comprehensive - Run comprehensive test suite', 'reset');
        log('  single "msg" - Test a single custom message', 'reset');
        process.exit(1);
    }
  } catch (error) {
    log(`💥 Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testSingleMessage,
  runAllTests,
  runComprehensiveTest
};

#!/usr/bin/env node

/**
 * LLM vs Rule-Based Recommendation Comparison
 * 
 * This script compares the performance of LLM-powered vs rule-based recommendations
 * Run with: node test-llm-comparison.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

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
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
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

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(15000); // 15 second timeout for LLM requests
    
    req.write(postData);
    req.end();
  });
}

async function testRecommendationSystem(message, useLLM = false) {
  const startTime = Date.now();
  
  try {
    const endpoint = useLLM ? '/api/meshai/ai-recommendation-llm' : '/api/meshai/ai-recommendation';
    const response = await makeRequest(`${BASE_URL}${endpoint}`, {
      message,
      useLLM
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.status !== 200) {
      throw new Error(`API returned status ${response.status}: ${response.data.error || 'Unknown error'}`);
    }

    return {
      success: true,
      responseTime,
      recommendations: response.data.recommendations,
      method: useLLM ? 'LLM' : 'Rule-based',
      provider: response.data.metadata?.provider || 'rule-based'
    };

  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: false,
      responseTime,
      error: error.message,
      method: useLLM ? 'LLM' : 'Rule-based'
    };
  }
}

async function compareRecommendations(message) {
  log(`\n🧪 Testing: "${message}"`, 'cyan');
  log(`═══════════════════════════════════════`, 'blue');
  
  // Test rule-based system
  log(`\n📋 Testing Rule-Based System...`, 'yellow');
  const ruleBasedResult = await testRecommendationSystem(message, false);
  
  // Test LLM system
  log(`\n🤖 Testing LLM System...`, 'magenta');
  const llmResult = await testRecommendationSystem(message, true);
  
  // Display results
  log(`\n📊 Comparison Results:`, 'bright');
  log(`═══════════════════════════════════════`, 'blue');
  
  // Rule-based results
  if (ruleBasedResult.success) {
    log(`\n📋 Rule-Based System:`, 'yellow');
    log(`   ✅ Status: Success`, 'green');
    log(`   ⏱️  Response Time: ${ruleBasedResult.responseTime}ms`, 'blue');
    log(`   🎯 Recommendations: ${ruleBasedResult.recommendations.products.length}`, 'blue');
    log(`   📈 Confidence: ${(ruleBasedResult.recommendations.confidence * 100).toFixed(1)}%`, 'blue');
    
    if (ruleBasedResult.recommendations.products.length > 0) {
      log(`   🏆 Top Recommendation:`, 'green');
      const topRec = ruleBasedResult.recommendations.products[0];
      log(`      • ${topRec.productId} (${(topRec.confidence * 100).toFixed(1)}%)`, 'reset');
      log(`      • ${topRec.primaryReason || topRec.reason}`, 'reset');
    }
  } else {
    log(`\n📋 Rule-Based System:`, 'yellow');
    log(`   ❌ Status: Failed`, 'red');
    log(`   ⏱️  Response Time: ${ruleBasedResult.responseTime}ms`, 'blue');
    log(`   🚨 Error: ${ruleBasedResult.error}`, 'red');
  }
  
  // LLM results
  if (llmResult.success) {
    log(`\n🤖 LLM System:`, 'magenta');
    log(`   ✅ Status: Success`, 'green');
    log(`   ⏱️  Response Time: ${llmResult.responseTime}ms`, 'blue');
    log(`   🎯 Recommendations: ${llmResult.recommendations.products.length}`, 'blue');
    log(`   📈 Confidence: ${(llmResult.recommendations.confidence * 100).toFixed(1)}%`, 'blue');
    log(`   🔧 Provider: ${llmResult.provider}`, 'blue');
    
    if (llmResult.recommendations.products.length > 0) {
      log(`   🏆 Top Recommendation:`, 'green');
      const topRec = llmResult.recommendations.products[0];
      log(`      • ${topRec.productId} (${(topRec.confidence * 100).toFixed(1)}%)`, 'reset');
      log(`      • ${topRec.primaryReason || topRec.reason}`, 'reset');
    }
  } else {
    log(`\n🤖 LLM System:`, 'magenta');
    log(`   ❌ Status: Failed`, 'red');
    log(`   ⏱️  Response Time: ${llmResult.responseTime}ms`, 'blue');
    log(`   🚨 Error: ${llmResult.error}`, 'red');
  }
  
  // Performance comparison
  if (ruleBasedResult.success && llmResult.success) {
    log(`\n⚡ Performance Comparison:`, 'bright');
    const speedDiff = llmResult.responseTime - ruleBasedResult.responseTime;
    const confidenceDiff = llmResult.recommendations.confidence - ruleBasedResult.recommendations.confidence;
    
    if (speedDiff > 0) {
      log(`   🐌 LLM is ${speedDiff}ms slower than rule-based`, 'yellow');
    } else {
      log(`   🚀 LLM is ${Math.abs(speedDiff)}ms faster than rule-based`, 'green');
    }
    
    if (confidenceDiff > 0) {
      log(`   📈 LLM confidence is ${(confidenceDiff * 100).toFixed(1)}% higher`, 'green');
    } else {
      log(`   📉 LLM confidence is ${(Math.abs(confidenceDiff) * 100).toFixed(1)}% lower`, 'yellow');
    }
  }
  
  return {
    ruleBased: ruleBasedResult,
    llm: llmResult
  };
}

async function runComparisonTests() {
  const testMessages = [
    "I need something to help me relax after work",
    "Do you have any organic teas? I prefer something healthy and natural",
    "I want to create a relaxing bedroom with tea and aromatherapy",
    "Starting meditation practice, need a cushion",
    "Having trouble sleeping, what can help?",
    "Looking for aromatherapy products for my office space"
  ];
  
  log(`🚀 Starting LLM vs Rule-Based Comparison`, 'bright');
  log(`📍 Testing against: ${BASE_URL}`, 'blue');
  log(`⏰ Started at: ${new Date().toISOString()}`, 'blue');
  
  const results = [];
  let ruleBasedSuccess = 0;
  let llmSuccess = 0;
  let totalRuleBasedTime = 0;
  let totalLLMTime = 0;
  
  for (const message of testMessages) {
    const result = await compareRecommendations(message);
    results.push({ message, ...result });
    
    if (result.ruleBased.success) {
      ruleBasedSuccess++;
      totalRuleBasedTime += result.ruleBased.responseTime;
    }
    
    if (result.llm.success) {
      llmSuccess++;
      totalLLMTime += result.llm.responseTime;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  log(`\n📈 Overall Comparison Summary`, 'bright');
  log(`═══════════════════════════════════════`, 'blue');
  log(`Total Tests: ${testMessages.length}`, 'reset');
  log(`Rule-Based Success: ${ruleBasedSuccess}/${testMessages.length} (${((ruleBasedSuccess/testMessages.length)*100).toFixed(1)}%)`, 'yellow');
  log(`LLM Success: ${llmSuccess}/${testMessages.length} (${((llmSuccess/testMessages.length)*100).toFixed(1)}%)`, 'magenta');
  
  if (ruleBasedSuccess > 0) {
    log(`Average Rule-Based Response Time: ${(totalRuleBasedTime/ruleBasedSuccess).toFixed(0)}ms`, 'yellow');
  }
  
  if (llmSuccess > 0) {
    log(`Average LLM Response Time: ${(totalLLMTime/llmSuccess).toFixed(0)}ms`, 'magenta');
  }
  
  // Recommendations
  log(`\n💡 Recommendations:`, 'bright');
  if (llmSuccess === 0) {
    log(`   • LLM system is not configured or not working`, 'red');
    log(`   • Check environment variables and API keys`, 'yellow');
    log(`   • Use rule-based system as fallback`, 'green');
  } else if (ruleBasedSuccess === 0) {
    log(`   • Rule-based system has issues`, 'red');
    log(`   • Check API endpoints and dependencies`, 'yellow');
  } else {
    log(`   • Both systems are working correctly`, 'green');
    log(`   • Consider hybrid approach for best results`, 'blue');
    log(`   • Monitor costs if using paid LLM services`, 'yellow');
  }
  
  log(`\n⏰ Completed at: ${new Date().toISOString()}`, 'blue');
  
  return results;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  try {
    switch (command) {
      case 'all':
        await runComparisonTests();
        break;
      case 'single':
        const message = args[1];
        if (!message) {
          log('❌ Please provide a message to test', 'red');
          log('Usage: node test-llm-comparison.js single "Your test message"', 'yellow');
          process.exit(1);
        }
        await compareRecommendations(message);
        break;
      default:
        log('❌ Unknown command', 'red');
        log('Available commands:', 'yellow');
        log('  all          - Run comparison tests on all scenarios', 'reset');
        log('  single "msg" - Compare single message', 'reset');
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
  compareRecommendations,
  runComparisonTests
};

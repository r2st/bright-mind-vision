#!/usr/bin/env node

/**
 * Check WhatsApp Message Status
 * 
 * This script checks the delivery status of WhatsApp messages
 */

// Load environment variables manually
const fs = require('fs');
const path = require('path');

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

async function checkMessageStatus(messageId, accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v21.0/${messageId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    log(`🔍 Checking status for message: ${messageId}`, 'blue');
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        log(`📥 Status Response: ${res.statusCode}`, 'blue');
        log(`📥 Response Data: ${data}`, 'blue');
        
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            resolve({
              success: true,
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
    
    req.end();
  });
}

async function main() {
  log('\n🔍 WhatsApp Message Status Checker', 'cyan');
  log('==================================', 'cyan');
  
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  if (!accessToken) {
    log('❌ No access token found in environment', 'red');
    return;
  }
  
  // Recent message IDs from your tests
  const messageIds = [
    'wamid.HBgMOTE5MTA4NDU4MDA2FQIAERgSRDAzOUMyNEJFNzgyODI5Q0I4AA==',
    'wamid.HBgMOTE5MTA4NDU4MDA2FQIAERgSMzhGRDI3QTA5OERBREY0NUFFAA==',
    'wamid.HBgMOTE5MTA4NDU4MDA2FQIAERgSREZCODQ3REM3MEY4RDhFRDlEAA=='
  ];
  
  for (const messageId of messageIds) {
    log(`\n📱 Checking message: ${messageId}`, 'yellow');
    
    try {
      const result = await checkMessageStatus(messageId, accessToken);
      
      if (result.success) {
        log(`✅ Status retrieved successfully`, 'green');
        log(`📊 Message data: ${JSON.stringify(result.data, null, 2)}`, 'blue');
      } else {
        log(`❌ Failed to get status: ${result.error}`, 'red');
      }
      
    } catch (error) {
      log(`❌ Error checking status: ${error.message}`, 'red');
    }
    
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  log('\n💡 Troubleshooting Tips:', 'yellow');
  log('1. Check if your WhatsApp Business account is verified', 'blue');
  log('2. Ensure your phone number is in the test recipient list', 'blue');
  log('3. Try sending from Facebook Developer Console instead', 'blue');
  log('4. Check if you have WhatsApp Business app installed', 'blue');
  log('5. Verify the business account is not in test mode', 'blue');
}

if (require.main === module) {
  main();
}

module.exports = {
  checkMessageStatus
};

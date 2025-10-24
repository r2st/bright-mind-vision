#!/usr/bin/env node

/**
 * Get Real WhatsApp Business API Token
 * 
 * This script helps you get a real access token from Facebook Developer Console
 * Run with: node get-real-whatsapp-token.js
 */

const fs = require('fs');
const path = require('path');

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

function updateEnvironmentWithRealToken() {
  log('\n🔑 Getting Real WhatsApp Business API Token', 'cyan');
  log('===============================================', 'cyan');
  
  log('\n📋 Step-by-Step Instructions:', 'yellow');
  log('1. Go to: https://developers.facebook.com/apps/', 'blue');
  log('2. Select your WhatsApp Business app', 'blue');
  log('3. Go to WhatsApp > API Setup', 'blue');
  log('4. Find "Temporary access token" section', 'blue');
  log('5. Click "Generate Token" button', 'blue');
  log('6. Copy the generated token', 'blue');
  
  log('\n🔧 After getting your real token:', 'yellow');
  log('1. Update your .env.local file with the real token', 'blue');
  log('2. Replace WHATSAPP_ACCESS_TOKEN with your real token', 'blue');
  log('3. Also update WHATSAPP_PHONE_NUMBER_ID with your real phone number ID', 'blue');
  log('4. Update WHATSAPP_BUSINESS_ACCOUNT_ID with your real business account ID', 'blue');
  
  log('\n📝 Example .env.local update:', 'yellow');
  log('WHATSAPP_ACCESS_TOKEN=your_real_token_here', 'green');
  log('WHATSAPP_PHONE_NUMBER_ID=your_real_phone_number_id', 'green');
  log('WHATSAPP_BUSINESS_ACCOUNT_ID=your_real_business_account_id', 'green');
  
  log('\n⚠️ Important Notes:', 'red');
  log('• Temporary tokens expire in 24 hours', 'blue');
  log('• For production, use permanent tokens', 'blue');
  log('• Keep your tokens secure and never commit them to git', 'blue');
  
  log('\n🚀 After updating your .env.local:', 'yellow');
  log('1. Restart your development server: npm run dev', 'blue');
  log('2. Test again: node test-whatsapp-integration.js +15556405993', 'blue');
  
  log('\n💡 Need help?', 'cyan');
  log('• Facebook Developer Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started', 'blue');
  log('• WhatsApp Business API: https://developers.facebook.com/docs/whatsapp/cloud-api', 'blue');
}

function main() {
  log('🔑 WhatsApp Business API Token Helper', 'bright');
  log('====================================', 'bright');
  
  updateEnvironmentWithRealToken();
  
  log('\n🎯 Quick Test Commands:', 'yellow');
  log('node test-whatsapp-integration.js', 'blue');
  log('node test-whatsapp-integration.js +15556405993', 'blue');
}

// Run the helper
if (require.main === module) {
  main();
}

module.exports = {
  updateEnvironmentWithRealToken
};

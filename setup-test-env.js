#!/usr/bin/env node

/**
 * Setup Test Environment Variables for WhatsApp Integration
 * 
 * This script sets up test environment variables for WhatsApp integration testing
 * Run with: node setup-test-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function setupTestEnvironment() {
  log('\n🔧 Setting up test environment variables...', 'cyan');
  
  // Generate test tokens
  const verifyToken = generateSecureToken(16);
  const accessToken = 'test-access-token-' + generateSecureToken(20);
  const phoneNumberId = '123456789012345';
  const businessAccountId = '987654321098765';
  const appSecret = generateSecureToken(32);
  
  const envContent = `# WhatsApp Business API Test Configuration
# Generated for testing purposes

# WhatsApp API Credentials (Test Values)
WHATSAPP_ACCESS_TOKEN=${accessToken}
WHATSAPP_PHONE_NUMBER_ID=${phoneNumberId}
WHATSAPP_BUSINESS_ACCOUNT_ID=${businessAccountId}
WHATSAPP_APP_SECRET=${appSecret}

# Webhook Configuration
WHATSAPP_WEBHOOK_VERIFY_TOKEN=${verifyToken}
WHATSAPP_WEBHOOK_URL=http://localhost:3000

# Optional: Test Configuration
WHATSAPP_TEST_PHONE_NUMBER=+1234567890

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development

# Note: These are test values for development only
# Replace with real values when connecting to actual WhatsApp Business API
`;

  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    fs.writeFileSync(envPath, envContent);
    log(`✅ Test environment variables saved to: ${envPath}`, 'green');
    
    log('\n📋 Generated test values:', 'cyan');
    log(`   Verify Token: ${verifyToken}`, 'blue');
    log(`   Access Token: ${accessToken}`, 'blue');
    log(`   Phone Number ID: ${phoneNumberId}`, 'blue');
    log(`   Business Account ID: ${businessAccountId}`, 'blue');
    
    log('\n🎯 Next steps:', 'yellow');
    log('1. Restart your development server', 'blue');
    log('2. Run: node test-whatsapp-integration.js', 'blue');
    log('3. The webhook verification should now pass!', 'blue');
    
  } catch (error) {
    log(`❌ Error saving environment file: ${error.message}`, 'red');
    process.exit(1);
  }
}

function main() {
  log('🚀 WhatsApp Test Environment Setup', 'bright');
  log('==================================', 'bright');
  
  setupTestEnvironment();
  
  log('\n💡 Note:', 'yellow');
  log('These are test values for development only.', 'blue');
  log('When you get your real WhatsApp Business API credentials,', 'blue');
  log('replace these values with the actual ones from Facebook Developer Console.', 'blue');
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = {
  setupTestEnvironment,
  generateSecureToken
};

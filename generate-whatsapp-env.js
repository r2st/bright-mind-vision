#!/usr/bin/env node

/**
 * Quick WhatsApp Environment Variables Generator
 * 
 * Generates environment variables for WhatsApp Business API
 * Usage: node generate-whatsapp-env.js [options]
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

function generateVerifyToken() {
  return generateSecureToken(16);
}

function showHelp() {
  log('🔧 WhatsApp Environment Variables Generator', 'bright');
  log('==========================================', 'bright');
  log('');
  log('Usage:', 'cyan');
  log('  node generate-whatsapp-env.js [options]', 'blue');
  log('');
  log('Options:', 'cyan');
  log('  --help, -h          Show this help message', 'blue');
  log('  --example, -e       Generate .env.example file only', 'blue');
  log('  --template, -t      Generate template with placeholders', 'blue');
  log('  --verify-token      Generate a secure verify token', 'blue');
  log('  --all-tokens        Generate all secure tokens', 'blue');
  log('');
  log('Examples:', 'cyan');
  log('  node generate-whatsapp-env.js --example', 'blue');
  log('  node generate-whatsapp-env.js --verify-token', 'blue');
  log('  node generate-whatsapp-env.js --template', 'blue');
  log('');
}

function generateExampleEnv() {
  const verifyToken = generateVerifyToken();
  
  const content = `# WhatsApp Business API Configuration
# Copy this file to .env.local and fill in your actual values

# WhatsApp API Credentials
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_APP_SECRET=your_app_secret_here

# Webhook Configuration
WHATSAPP_WEBHOOK_VERIFY_TOKEN=${verifyToken}
WHATSAPP_WEBHOOK_URL=https://yourdomain.com

# Optional: Test Configuration
WHATSAPP_TEST_PHONE_NUMBER=+1234567890

# Next.js Configuration
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production

# Security Note: Keep these values secure and never commit them to version control!
`;

  return content;
}

function generateTemplateEnv() {
  const content = `# WhatsApp Business API Configuration Template
# Fill in your actual values from Facebook Developer Console

# 1. Go to Facebook Developers > Your App > WhatsApp > API Setup
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345

# 2. Go to Facebook Developers > Your App > Settings > Basic
WHATSAPP_APP_SECRET=your_app_secret_here

# 3. Webhook Configuration (auto-generated secure token)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=${generateVerifyToken()}
WHATSAPP_WEBHOOK_URL=https://yourdomain.com

# 4. Optional: Test Configuration
WHATSAPP_TEST_PHONE_NUMBER=+1234567890

# 5. Next.js Configuration
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production

# Where to find these values:
# - Access Token: Facebook Developers > Your App > WhatsApp > API Setup > Generate Token
# - Phone Number ID: Facebook Developers > Your App > WhatsApp > API Setup
# - Business Account ID: Facebook Developers > Your App > WhatsApp > API Setup
# - App Secret: Facebook Developers > Your App > Settings > Basic
# - Webhook URL: Your domain where the webhook is hosted
# - Verify Token: Use the generated token above or create your own
`;

  return content;
}

function generateSecureTokens() {
  const tokens = {
    verifyToken: generateVerifyToken(),
    appSecret: generateSecureToken(32),
    accessToken: generateSecureToken(40) // Simulated format
  };
  
  return tokens;
}

function saveFile(filename, content) {
  const filePath = path.join(process.cwd(), filename);
  
  try {
    fs.writeFileSync(filePath, content);
    log(`✅ File saved: ${filename}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error saving ${filename}: ${error.message}`, 'red');
    return false;
  }
}

function updateGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  try {
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    
    if (!gitignoreContent.includes('.env.local')) {
      gitignoreContent += '\n# Environment variables\n.env.local\n';
      fs.writeFileSync(gitignorePath, gitignoreContent);
      log('✅ Updated .gitignore to include .env.local', 'green');
    } else {
      log('✅ .gitignore already includes .env.local', 'green');
    }
  } catch (error) {
    log(`⚠️ Could not update .gitignore: ${error.message}`, 'yellow');
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--verify-token')) {
    const token = generateVerifyToken();
    log('🔐 Generated Secure Verify Token:', 'cyan');
    log(token, 'green');
    log('');
    log('Use this token for WHATSAPP_WEBHOOK_VERIFY_TOKEN in your .env.local', 'blue');
    return;
  }
  
  if (args.includes('--all-tokens')) {
    const tokens = generateSecureTokens();
    log('🔐 Generated Secure Tokens:', 'cyan');
    log('');
    log('Verify Token (for webhook verification):', 'yellow');
    log(tokens.verifyToken, 'green');
    log('');
    log('App Secret (example format):', 'yellow');
    log(tokens.appSecret, 'green');
    log('');
    log('Access Token (example format):', 'yellow');
    log(tokens.accessToken, 'green');
    return;
  }
  
  if (args.includes('--template') || args.includes('-t')) {
    log('📝 Generating WhatsApp environment template...', 'cyan');
    const content = generateTemplateEnv();
    
    if (saveFile('.env.template', content)) {
      log('');
      log('📋 Template created with detailed instructions!', 'green');
      log('Edit .env.template and rename to .env.local when ready.', 'blue');
    }
    return;
  }
  
  if (args.includes('--example') || args.includes('-e')) {
    log('📝 Generating WhatsApp environment example...', 'cyan');
    const content = generateExampleEnv();
    
    if (saveFile('.env.example', content)) {
      updateGitignore();
      log('');
      log('📋 Example file created!', 'green');
      log('Copy .env.example to .env.local and fill in your actual values.', 'blue');
    }
    return;
  }
  
  // Default: generate both example and template
  log('🚀 Generating WhatsApp environment files...', 'cyan');
  
  const exampleContent = generateExampleEnv();
  const templateContent = generateTemplateEnv();
  
  let success = true;
  
  if (saveFile('.env.example', exampleContent)) {
    log('📋 Example file created with secure verify token', 'green');
  } else {
    success = false;
  }
  
  if (saveFile('.env.template', templateContent)) {
    log('📋 Template file created with detailed instructions', 'green');
  } else {
    success = false;
  }
  
  if (success) {
    updateGitignore();
    log('');
    log('🎉 WhatsApp environment files generated successfully!', 'green');
    log('');
    log('Next steps:', 'cyan');
    log('1. Copy .env.example to .env.local', 'blue');
    log('2. Fill in your actual WhatsApp API credentials', 'blue');
    log('3. Run: node setup-whatsapp-env.js (for interactive setup)', 'blue');
    log('4. Test: node test-whatsapp-integration.js', 'blue');
  }
}

// Run the generator
if (require.main === module) {
  main();
}

module.exports = {
  generateExampleEnv,
  generateTemplateEnv,
  generateSecureTokens,
  generateVerifyToken,
  generateSecureToken
};

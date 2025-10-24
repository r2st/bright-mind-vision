#!/usr/bin/env node

/**
 * WhatsApp Environment Variables Setup Script
 * 
 * This script helps you generate and configure WhatsApp Business API environment variables
 * Run with: node setup-whatsapp-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateVerifyToken() {
  return generateSecureToken(16);
}

function validatePhoneNumber(phone) {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it starts with + and has 10-15 digits
  if (cleaned.startsWith('+') && cleaned.length >= 11 && cleaned.length <= 16) {
    return cleaned;
  }
  
  // If no +, add it
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return '+' + cleaned;
  }
  
  return null;
}

function validateUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateId(id) {
  // WhatsApp IDs are typically numeric strings
  return /^\d+$/.test(id);
}

async function collectWhatsAppCredentials() {
  log('\n🔧 WhatsApp Business API Environment Setup', 'bright');
  log('==========================================', 'bright');
  
  log('\n📋 This script will help you set up WhatsApp Business API environment variables.', 'cyan');
  log('You can find these values in your Facebook Developer Console.', 'cyan');
  
  const credentials = {};
  
  // Access Token
  log('\n1️⃣ WhatsApp Access Token', 'yellow');
  log('   Go to: Facebook Developers > Your App > WhatsApp > API Setup', 'blue');
  log('   Click "Generate Token" and copy the permanent access token', 'blue');
  credentials.accessToken = await askQuestion('   Enter your WhatsApp Access Token: ');
  
  if (!credentials.accessToken) {
    log('❌ Access token is required!', 'red');
    process.exit(1);
  }
  
  // Phone Number ID
  log('\n2️⃣ Phone Number ID', 'yellow');
  log('   Found in: Facebook Developers > Your App > WhatsApp > API Setup', 'blue');
  log('   Copy the "Phone number ID" (numeric string)', 'blue');
  credentials.phoneNumberId = await askQuestion('   Enter your Phone Number ID: ');
  
  if (!validateId(credentials.phoneNumberId)) {
    log('❌ Phone Number ID must be a numeric string!', 'red');
    process.exit(1);
  }
  
  // Business Account ID
  log('\n3️⃣ WhatsApp Business Account ID', 'yellow');
  log('   Found in: Facebook Developers > Your App > WhatsApp > API Setup', 'blue');
  log('   Copy the "WhatsApp Business Account ID" (numeric string)', 'blue');
  credentials.businessAccountId = await askQuestion('   Enter your Business Account ID: ');
  
  if (!validateId(credentials.businessAccountId)) {
    log('❌ Business Account ID must be a numeric string!', 'red');
    process.exit(1);
  }
  
  // App Secret
  log('\n4️⃣ App Secret', 'yellow');
  log('   Found in: Facebook Developers > Your App > Settings > Basic', 'blue');
  log('   Copy the "App Secret" (keep this secure!)', 'blue');
  credentials.appSecret = await askQuestion('   Enter your App Secret: ');
  
  if (!credentials.appSecret) {
    log('❌ App Secret is required for webhook security!', 'red');
    process.exit(1);
  }
  
  // Webhook URL
  log('\n5️⃣ Webhook URL', 'yellow');
  log('   This should be your domain where the webhook is hosted', 'blue');
  log('   Examples: https://yourdomain.com or https://your-app.vercel.app', 'blue');
  credentials.webhookUrl = await askQuestion('   Enter your Webhook URL: ');
  
  if (!validateUrl(credentials.webhookUrl)) {
    log('❌ Webhook URL must be a valid URL!', 'red');
    process.exit(1);
  }
  
  // Verify Token (generate or use custom)
  log('\n6️⃣ Webhook Verify Token', 'yellow');
  log('   This is used to verify webhook requests from WhatsApp', 'blue');
  const useGenerated = await askQuestion('   Use auto-generated secure token? (y/n): ');
  
  if (useGenerated.toLowerCase() === 'y' || useGenerated.toLowerCase() === 'yes') {
    credentials.verifyToken = generateVerifyToken();
    log(`   ✅ Generated secure token: ${credentials.verifyToken}`, 'green');
  } else {
    credentials.verifyToken = await askQuestion('   Enter your custom verify token: ');
    if (!credentials.verifyToken) {
      log('❌ Verify token is required!', 'red');
      process.exit(1);
    }
  }
  
  // Test Phone Number (optional)
  log('\n7️⃣ Test Phone Number (Optional)', 'yellow');
  log('   Enter a phone number for testing (include country code)', 'blue');
  log('   Example: +1234567890', 'blue');
  const testPhone = await askQuestion('   Enter test phone number (or press Enter to skip): ');
  
  if (testPhone) {
    const validatedPhone = validatePhoneNumber(testPhone);
    if (validatedPhone) {
      credentials.testPhoneNumber = validatedPhone;
      log(`   ✅ Validated phone number: ${validatedPhone}`, 'green');
    } else {
      log('   ⚠️ Invalid phone number format, skipping...', 'yellow');
    }
  }
  
  // Environment
  log('\n8️⃣ Environment', 'yellow');
  const environment = await askQuestion('   Environment (development/production): ');
  credentials.environment = environment.toLowerCase() === 'production' ? 'production' : 'development';
  
  return credentials;
}

function generateEnvFile(credentials) {
  const envContent = `# WhatsApp Business API Configuration
# Generated on ${new Date().toISOString()}

# WhatsApp API Credentials
WHATSAPP_ACCESS_TOKEN=${credentials.accessToken}
WHATSAPP_PHONE_NUMBER_ID=${credentials.phoneNumberId}
WHATSAPP_BUSINESS_ACCOUNT_ID=${credentials.businessAccountId}
WHATSAPP_APP_SECRET=${credentials.appSecret}

# Webhook Configuration
WHATSAPP_WEBHOOK_VERIFY_TOKEN=${credentials.verifyToken}
WHATSAPP_WEBHOOK_URL=${credentials.webhookUrl}

# Optional: Test Configuration
${credentials.testPhoneNumber ? `WHATSAPP_TEST_PHONE_NUMBER=${credentials.testPhoneNumber}` : '# WHATSAPP_TEST_PHONE_NUMBER=+1234567890'}

# Next.js Configuration
NEXTAUTH_URL=${credentials.webhookUrl}
NODE_ENV=${credentials.environment}

# Security Note: Keep these values secure and never commit them to version control!
`;

  return envContent;
}

function generateEnvExample() {
  return `# WhatsApp Business API Configuration
# Copy this file to .env.local and fill in your actual values

# WhatsApp API Credentials
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_APP_SECRET=your_app_secret_here

# Webhook Configuration
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_secure_verify_token_here
WHATSAPP_WEBHOOK_URL=https://yourdomain.com

# Optional: Test Configuration
WHATSAPP_TEST_PHONE_NUMBER=+1234567890

# Next.js Configuration
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
`;
}

async function saveEnvironmentFiles(credentials) {
  const envContent = generateEnvFile(credentials);
  const envExampleContent = generateEnvExample();
  
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  try {
    // Save .env.local
    fs.writeFileSync(envPath, envContent);
    log(`\n✅ Environment variables saved to: ${envPath}`, 'green');
    
    // Save .env.example
    fs.writeFileSync(envExamplePath, envExampleContent);
    log(`✅ Example file saved to: ${envExamplePath}`, 'green');
    
    // Update .gitignore if needed
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.env.local')) {
        fs.appendFileSync(gitignorePath, '\n# Environment variables\n.env.local\n');
        log('✅ Added .env.local to .gitignore', 'green');
      }
    } else {
      fs.writeFileSync(gitignorePath, '# Environment variables\n.env.local\n');
      log('✅ Created .gitignore with .env.local', 'green');
    }
    
  } catch (error) {
    log(`❌ Error saving files: ${error.message}`, 'red');
    process.exit(1);
  }
}

function displayNextSteps(credentials) {
  log('\n🎉 WhatsApp Environment Setup Complete!', 'green');
  log('=====================================', 'green');
  
  log('\n📋 Next Steps:', 'cyan');
  log('1. Verify your webhook configuration in Facebook Developers:', 'blue');
  log(`   - Webhook URL: ${credentials.webhookUrl}/api/meshai/whatsapp-webhook`, 'blue');
  log(`   - Verify Token: ${credentials.verifyToken}`, 'blue');
  log('   - Subscribe to: messages, message_deliveries, message_reads', 'blue');
  
  log('\n2. Test your integration:', 'blue');
  log('   node test-whatsapp-integration.js', 'blue');
  
  if (credentials.testPhoneNumber) {
    log(`   node test-whatsapp-integration.js ${credentials.testPhoneNumber}`, 'blue');
  }
  
  log('\n3. Deploy to production:', 'blue');
  log('   - Set environment variables in your hosting platform', 'blue');
  log('   - Ensure HTTPS is enabled', 'blue');
  log('   - Test webhook verification', 'blue');
  
  log('\n🔒 Security Reminders:', 'yellow');
  log('✅ Never commit .env.local to version control', 'green');
  log('✅ Keep your access tokens secure', 'green');
  log('✅ Use HTTPS in production', 'green');
  log('✅ Monitor API usage and costs', 'green');
  
  log('\n📚 Documentation:', 'cyan');
  log('📖 Setup Guide: docs/WHATSAPP_BUSINESS_SETUP.md', 'blue');
  log('📖 Integration Guide: docs/WHATSAPP_INTEGRATION_GUIDE.md', 'blue');
  log('📖 Environment Setup: docs/WHATSAPP_ENVIRONMENT_SETUP.md', 'blue');
}

async function main() {
  try {
    log('🚀 Welcome to WhatsApp Environment Setup!', 'bright');
    
    const credentials = await collectWhatsAppCredentials();
    
    log('\n📝 Summary of your configuration:', 'cyan');
    log(`   Access Token: ${credentials.accessToken.substring(0, 10)}...`, 'blue');
    log(`   Phone Number ID: ${credentials.phoneNumberId}`, 'blue');
    log(`   Business Account ID: ${credentials.businessAccountId}`, 'blue');
    log(`   App Secret: ${credentials.appSecret.substring(0, 10)}...`, 'blue');
    log(`   Webhook URL: ${credentials.webhookUrl}`, 'blue');
    log(`   Verify Token: ${credentials.verifyToken}`, 'blue');
    log(`   Environment: ${credentials.environment}`, 'blue');
    
    const confirm = await askQuestion('\n   Save these settings? (y/n): ');
    
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      await saveEnvironmentFiles(credentials);
      displayNextSteps(credentials);
    } else {
      log('❌ Setup cancelled.', 'red');
    }
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n\n❌ Setup cancelled by user.', 'red');
  rl.close();
  process.exit(0);
});

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  collectWhatsAppCredentials,
  generateEnvFile,
  generateEnvExample,
  saveEnvironmentFiles,
  generateSecureToken,
  generateVerifyToken,
  validatePhoneNumber,
  validateUrl,
  validateId
};

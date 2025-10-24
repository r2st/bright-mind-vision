#!/usr/bin/env node

/**
 * WhatsApp Business Verification Helper
 * 
 * This script helps you with the WhatsApp Business number verification process
 * Run with: node whatsapp-verification-helper.js
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

function showVerificationSteps() {
  log('\n🔑 WhatsApp Business Number Verification', 'bright');
  log('==========================================', 'bright');
  
  log('\n📱 Your Registration Code:', 'cyan');
  log('Cm8KKwiOu4SFu7H2AhIGZW50OndhIhJCcmlnaHQgTWluZCBWaXNpb25QtrLexwYaQKUW9oUMSUl76yTLHC64cIGXwULaeyeyx3gqzD6u3Y76Ok9RLzgvXA1xexpeMQWTVSuNdIacMtsWS9/uMFk6igMSL21bS+K52LGm81qyu5mlZCGVWeTlX8PwBfB+X4+LHPxpbHCLl+O8iTf73zeQW+os', 'green');
  
  log('\n📋 Step-by-Step Verification Process:', 'cyan');
  
  log('\n1️⃣ Download WhatsApp Business App', 'yellow');
  log('   📱 iOS: App Store', 'blue');
  log('   📱 Android: Google Play Store', 'blue');
  
  log('\n2️⃣ Register Your Business Number', 'yellow');
  log('   📞 Enter your business phone number', 'blue');
  log('   📱 Verify with SMS code', 'blue');
  log('   ✅ Complete business profile setup', 'blue');
  
  log('\n3️⃣ Enter Registration Code', 'yellow');
  log('   🌐 Go to: https://developers.facebook.com/', 'blue');
  log('   🔧 Navigate to your WhatsApp app', 'blue');
  log('   🔑 Enter the registration code above', 'blue');
  log('   ✅ Complete verification in Facebook Developer Console', 'blue');
  
  log('\n4️⃣ Complete Business Profile', 'yellow');
  log('   🏢 Business Name: Bright Mind Vision', 'blue');
  log('   📂 Business Category: Select appropriate category', 'blue');
  log('   📝 Business Description: Add your business description', 'blue');
  log('   📍 Business Address: Add your business address', 'blue');
  log('   🕒 Business Hours: Set operating hours', 'blue');
  log('   🌐 Business Website: Add your website URL', 'blue');
  
  log('\n5️⃣ Submit for Verification', 'yellow');
  log('   ✅ Review all information', 'blue');
  log('   📤 Submit for verification', 'blue');
  log('   ⏰ Wait for approval (24-48 hours)', 'blue');
}

function showPostVerificationSteps() {
  log('\n🎯 After Verification - Next Steps:', 'cyan');
  
  log('\n1️⃣ Get API Credentials', 'yellow');
  log('   🔧 Go to Facebook Developer Console', 'blue');
  log('   📱 Navigate to your WhatsApp app', 'blue');
  log('   🔑 Get Access Token, Phone Number ID, Business Account ID', 'blue');
  
  log('\n2️⃣ Configure Environment Variables', 'yellow');
  log('   🚀 Run: node setup-whatsapp-env.js', 'blue');
  log('   📝 Or: node generate-whatsapp-env.js', 'blue');
  
  log('\n3️⃣ Test Integration', 'yellow');
  log('   🧪 Run: node test-whatsapp-integration.js', 'blue');
  log('   📱 Test with your phone number', 'blue');
  
  log('\n4️⃣ Deploy to Production', 'yellow');
  log('   🌐 Set up webhook URL', 'blue');
  log('   🔒 Configure HTTPS', 'blue');
  log('   📊 Monitor integration', 'blue');
}

function showTroubleshooting() {
  log('\n🚨 Troubleshooting Common Issues:', 'cyan');
  
  log('\n❌ "Registration code invalid"', 'red');
  log('   ✅ Check if code is copied correctly', 'green');
  log('   ✅ Ensure you\'re using the right phone number', 'green');
  log('   ✅ Try again after a few minutes', 'green');
  
  log('\n❌ "Business verification failed"', 'red');
  log('   ✅ Ensure all business information is accurate', 'green');
  log('   ✅ Check that business name matches registration', 'green');
  log('   ✅ Verify business address and contact information', 'green');
  
  log('\n❌ "Phone number already in use"', 'red');
  log('   ✅ The number might already be registered', 'green');
  log('   ✅ Contact WhatsApp support if needed', 'green');
}

function showSecurityNotes() {
  log('\n🔒 Security Notes:', 'yellow');
  
  log('⚠️ Keep your registration code secure', 'red');
  log('⚠️ Don\'t share it publicly', 'red');
  log('⚠️ Use it only for your business number verification', 'red');
  log('⚠️ Business name must match: "Bright Mind Vision"', 'red');
}

function showHelp() {
  log('\n🔧 WhatsApp Business Verification Helper', 'bright');
  log('==========================================', 'bright');
  
  log('\nUsage:', 'cyan');
  log('  node whatsapp-verification-helper.js [options]', 'blue');
  
  log('\nOptions:', 'cyan');
  log('  --help, -h          Show this help message', 'blue');
  log('  --steps, -s         Show verification steps', 'blue');
  log('  --next, -n          Show post-verification steps', 'blue');
  log('  --troubleshoot, -t  Show troubleshooting guide', 'blue');
  log('  --security, -sec    Show security notes', 'blue');
  log('  --all, -a           Show all information', 'blue');
  
  log('\nExamples:', 'cyan');
  log('  node whatsapp-verification-helper.js --steps', 'blue');
  log('  node whatsapp-verification-helper.js --next', 'blue');
  log('  node whatsapp-verification-helper.js --all', 'blue');
}

function showAll() {
  showVerificationSteps();
  showPostVerificationSteps();
  showTroubleshooting();
  showSecurityNotes();
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--steps') || args.includes('-s')) {
    showVerificationSteps();
    return;
  }
  
  if (args.includes('--next') || args.includes('-n')) {
    showPostVerificationSteps();
    return;
  }
  
  if (args.includes('--troubleshoot') || args.includes('-t')) {
    showTroubleshooting();
    return;
  }
  
  if (args.includes('--security') || args.includes('-sec')) {
    showSecurityNotes();
    return;
  }
  
  if (args.includes('--all') || args.includes('-a')) {
    showAll();
    return;
  }
  
  // Default: show verification steps
  showVerificationSteps();
  log('\n💡 Use --help to see all options', 'cyan');
}

// Run the helper
if (require.main === module) {
  main();
}

module.exports = {
  showVerificationSteps,
  showPostVerificationSteps,
  showTroubleshooting,
  showSecurityNotes,
  showHelp,
  showAll
};

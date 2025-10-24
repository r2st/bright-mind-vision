#!/usr/bin/env node

/**
 * WhatsApp Registration Code Diagnostic Helper
 * 
 * This script helps you figure out where to enter your registration code
 * Run with: node whatsapp-diagnostic.js
 */

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

function showDiagnosticQuestions() {
  log('\n🔍 WhatsApp Registration Code Diagnostic', 'bright');
  log('==========================================', 'bright');
  
  log('\n📋 Let\'s figure out where to enter your registration code!', 'cyan');
  log('Please answer these questions about what you see:', 'cyan');
  
  log('\n1️⃣ Do you have a Facebook Developer account?', 'yellow');
  log('   ✅ Yes - I can access https://developers.facebook.com/', 'green');
  log('   ❌ No - I need to create one first', 'red');
  
  log('\n2️⃣ Do you have an app in Facebook Developer Console?', 'yellow');
  log('   ✅ Yes - I can see my app(s) in the dashboard', 'green');
  log('   ❌ No - I need to create an app first', 'red');
  
  log('\n3️⃣ What type of app do you have?', 'yellow');
  log('   📱 Consumer app', 'blue');
  log('   🏢 Business app', 'blue');
  log('   ❓ I don\'t know', 'yellow');
  
  log('\n4️⃣ Do you see WhatsApp in your app?', 'yellow');
  log('   ✅ Yes - I can see WhatsApp in the left sidebar', 'green');
  log('   ❌ No - I don\'t see WhatsApp anywhere', 'red');
  log('   ❓ I\'m not sure', 'yellow');
  
  log('\n5️⃣ If you see WhatsApp, what sections do you see?', 'yellow');
  log('   📋 API Setup', 'blue');
  log('   ⚙️ Configuration', 'blue');
  log('   📱 Phone Numbers', 'blue');
  log('   📝 Message Templates', 'blue');
  log('   ❓ I don\'t see any sections', 'yellow');
}

function showStepByStepGuide() {
  log('\n📖 Step-by-Step Guide Based on Your Situation:', 'cyan');
  
  log('\n🔧 If you DON\'T have a Facebook Developer account:', 'yellow');
  log('1. Go to https://developers.facebook.com/', 'blue');
  log('2. Click "Get Started" or "Create Account"', 'blue');
  log('3. Log in with your Facebook account', 'blue');
  log('4. Verify your account if prompted', 'blue');
  
  log('\n🔧 If you DON\'T have an app:', 'yellow');
  log('1. In Facebook Developer Console, click "Create App"', 'blue');
  log('2. Select "Business" as the app type', 'blue');
  log('3. Fill in app details:', 'blue');
  log('   - App Name: "Meshai WhatsApp Integration"', 'blue');
  log('   - App Contact Email: your email', 'blue');
  log('4. Click "Create App"', 'blue');
  
  log('\n🔧 If you have a CONSUMER app (not Business):', 'yellow');
  log('1. You need to create a new Business app', 'blue');
  log('2. Or convert your existing app to Business type', 'blue');
  log('3. WhatsApp Business API only works with Business apps', 'blue');
  
  log('\n🔧 If you DON\'T see WhatsApp in your app:', 'yellow');
  log('1. Make sure you have a Business app', 'blue');
  log('2. Look for "Add a Product" or "Products" section', 'blue');
  log('3. Find "WhatsApp" and click "Set up" or "Add"', 'blue');
  log('4. Refresh the page after adding WhatsApp', 'blue');
  
  log('\n🔧 If you see WhatsApp but no Phone Numbers section:', 'yellow');
  log('1. Click on "WhatsApp" in the left sidebar', 'blue');
  log('2. Look for "Phone Numbers" in the submenu', 'blue');
  log('3. If not there, try "API Setup" section', 'blue');
  log('4. Look for "Add Phone Number" button', 'blue');
}

function showCommonLocations() {
  log('\n📍 Common Locations for Registration Code:', 'cyan');
  
  log('\n🎯 Location 1: Phone Numbers Section', 'yellow');
  log('   Path: WhatsApp > Phone Numbers > Add Phone Number', 'blue');
  log('   Look for: "Registration Code" or "Phone Number Registration" field', 'blue');
  
  log('\n🎯 Location 2: API Setup Section', 'yellow');
  log('   Path: WhatsApp > API Setup > Phone Number', 'blue');
  log('   Look for: Registration code input field', 'blue');
  
  log('\n🎯 Location 3: Configuration Section', 'yellow');
  log('   Path: WhatsApp > Configuration > Phone Number', 'blue');
  log('   Look for: Registration or verification section', 'blue');
  
  log('\n🎯 Location 4: Direct in WhatsApp Dashboard', 'yellow');
  log('   Path: WhatsApp (main page) > Phone Number Setup', 'blue');
  log('   Look for: "Add Phone Number" or "Register Phone Number"', 'blue');
}

function showTroubleshooting() {
  log('\n🚨 Troubleshooting Common Issues:', 'cyan');
  
  log('\n❌ "I can\'t find WhatsApp anywhere"', 'red');
  log('   ✅ Make sure you have a Business app', 'green');
  log('   ✅ Add WhatsApp as a product to your app', 'green');
  log('   ✅ Check if you have admin permissions', 'green');
  
  log('\n❌ "I see WhatsApp but no Phone Numbers section"', 'red');
  log('   ✅ Try clicking on "WhatsApp" first', 'green');
  log('   ✅ Look for "Add Phone Number" button', 'green');
  log('   ✅ Check "API Setup" section', 'green');
  
  log('\n❌ "Registration code field not found"', 'red');
  log('   ✅ Click "Add Phone Number" first', 'green');
  log('   ✅ The field appears after clicking "Add Phone Number"', 'green');
  log('   ✅ Try different sections under WhatsApp', 'green');
  
  log('\n❌ "I get an error when entering the code"', 'red');
  log('   ✅ Check if the code is copied correctly', 'green');
  log('   ✅ Make sure there are no extra spaces', 'green');
  log('   ✅ Try refreshing the page', 'green');
}

function showYourRegistrationCode() {
  log('\n🔑 Your Registration Code:', 'cyan');
  log('Copy this code exactly (including all characters):', 'blue');
  log('');
  log('Cm8KKwiOu4SFu7H2AhIGZW50OndhIhJCcmlnaHQgTWluZCBWaXNpb25QtrLexwYaQKUW9oUMSUl76yTLHC64cIGXwULaeyeyx3gqzD6u3Y76Ok9RLzgvXA1xexpeMQWTVSuNdIacMtsWS9/uMFk6igMSL21bS+K52LGm81qyu5mlZCGVWeTlX8PwBfB+X4+LHPxpbHCLl+O8iTf73zeQW+os', 'green');
  log('');
  log('⚠️ Important: Copy the entire code including all characters', 'yellow');
}

function showNextSteps() {
  log('\n🎯 Next Steps After Finding the Field:', 'cyan');
  
  log('\n1️⃣ Enter your registration code', 'yellow');
  log('2️⃣ Complete any additional verification steps', 'yellow');
  log('3️⃣ Get your API credentials:', 'yellow');
  log('   - Access Token', 'blue');
  log('   - Phone Number ID', 'blue');
  log('   - Business Account ID', 'blue');
  
  log('\n4️⃣ Configure your Meshai system:', 'yellow');
  log('   node setup-whatsapp-env.js', 'blue');
  
  log('\n5️⃣ Test your integration:', 'yellow');
  log('   node test-whatsapp-integration.js', 'blue');
}

function main() {
  showDiagnosticQuestions();
  showStepByStepGuide();
  showCommonLocations();
  showTroubleshooting();
  showYourRegistrationCode();
  showNextSteps();
  
  log('\n💡 Still need help?', 'cyan');
  log('Please describe what you see in your Facebook Developer Console,', 'blue');
  log('and I can provide more specific guidance!', 'blue');
}

// Run the diagnostic
if (require.main === module) {
  main();
}

module.exports = {
  showDiagnosticQuestions,
  showStepByStepGuide,
  showCommonLocations,
  showTroubleshooting,
  showYourRegistrationCode,
  showNextSteps
};

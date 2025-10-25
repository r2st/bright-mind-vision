#!/usr/bin/env node

// Local webhook testing script
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test webhook verification (GET request)
async function testWebhookVerification() {
  console.log('🔍 Testing webhook verification...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/meshai/whatsapp-webhook?hub.mode=subscribe&hub.challenge=test-challenge&hub.verify_token=test-verify-token-123`);
    
    if (response.ok) {
      const challenge = await response.text();
      console.log('✅ Webhook verification successful');
      console.log(`📝 Challenge response: ${challenge}`);
      return true;
    } else {
      console.log('❌ Webhook verification failed');
      console.log(`Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Webhook verification error:', error.message);
    return false;
  }
}

// Test incoming message simulation (POST request)
async function testIncomingMessage(message, from = '+971501234567', name = 'Test User') {
  console.log(`📱 Testing incoming message: "${message}"`);
  
  const webhookPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: '123456789',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '919980300360',
            phone_number_id: '860584457139677'
          },
          messages: [{
            from: from,
            id: `wamid.${Date.now()}`,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: {
              body: message
            },
            type: 'text'
          }],
          contacts: [{
            profile: {
              name: name
            },
            wa_id: from
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    const response = await fetch(`${BASE_URL}/api/meshai/whatsapp-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Message processed successfully');
      console.log(`📝 Response: ${JSON.stringify(result, null, 2)}`);
      return true;
    } else {
      console.log('❌ Message processing failed');
      console.log(`Status: ${response.status}`);
      const error = await response.text();
      console.log(`Error: ${error}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Message processing error:', error.message);
    return false;
  }
}

// Test RAG recommendation API directly
async function testRAGRecommendation(message) {
  console.log(`🤖 Testing RAG recommendation: "${message}"`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/meshai/ai-recommendation-rag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        customerId: 'test-customer-123',
        context: {
          source: 'test',
          customerName: 'Test User',
          timestamp: new Date().toISOString()
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ RAG recommendation successful');
      console.log(`📝 Recommendations: ${result.recommendations?.length || 0} products`);
      if (result.recommendations && result.recommendations.length > 0) {
        result.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec.product?.name} - $${rec.product?.price} (${(rec.confidence * 100).toFixed(1)}%)`);
        });
      }
      return true;
    } else {
      console.log('❌ RAG recommendation failed');
      console.log(`Status: ${response.status}`);
      const error = await response.text();
      console.log(`Error: ${error}`);
      return false;
    }
  } catch (error) {
    console.error('❌ RAG recommendation error:', error.message);
    return false;
  }
}

// Test WhatsApp status API
async function testWhatsAppStatus() {
  console.log('📊 Testing WhatsApp status...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/meshai/whatsapp-status`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ WhatsApp status retrieved');
      console.log(`📝 Status: ${JSON.stringify(result, null, 2)}`);
      return true;
    } else {
      console.log('❌ WhatsApp status failed');
      console.log(`Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ WhatsApp status error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Local Webhook Tests');
  console.log('=' .repeat(50));
  
  // Check if server is running
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/meshai/whatsapp-status`);
    if (!healthCheck.ok) {
      console.log('❌ Server not running. Please start with: npm run dev');
      return;
    }
  } catch (error) {
    console.log('❌ Server not running. Please start with: npm run dev');
    return;
  }
  
  console.log('✅ Server is running');
  console.log('');
  
  // Test 1: Webhook verification
  console.log('🔍 Test 1: Webhook Verification');
  console.log('-'.repeat(30));
  await testWebhookVerification();
  console.log('');
  
  // Test 2: WhatsApp status
  console.log('📊 Test 2: WhatsApp Status');
  console.log('-'.repeat(30));
  await testWhatsAppStatus();
  console.log('');
  
  // Test 3: RAG recommendations (without Groq API)
  console.log('🤖 Test 3: RAG Recommendations (Direct API)');
  console.log('-'.repeat(30));
  const testMessages = [
    "I need help with relaxation and stress relief",
    "Looking for luxury skincare products",
    "I want organic products",
    "Need a luxury handbag for special occasion"
  ];
  
  for (const message of testMessages) {
    await testRAGRecommendation(message);
    console.log('');
  }
  
  // Test 4: Simulate incoming WhatsApp messages
  console.log('📱 Test 4: Simulate WhatsApp Messages');
  console.log('-'.repeat(30));
  const whatsappMessages = [
    {
      message: "Hi! I'm looking for a luxury handbag for a special occasion",
      from: "+971501234567",
      name: "Aisha Al-Rashid"
    },
    {
      message: "I need help with relaxation and stress relief",
      from: "+971507654321", 
      name: "Ahmed Hassan"
    },
    {
      message: "Looking for organic products",
      from: "+971501112233",
      name: "Fatima Al-Zahra"
    }
  ];
  
  for (const msg of whatsappMessages) {
    await testIncomingMessage(msg.message, msg.from, msg.name);
    console.log('');
  }
  
  console.log('🎉 Local webhook testing complete!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Set up Groq API key for full RAG functionality');
  console.log('2. Configure WhatsApp Business API for real testing');
  console.log('3. Use ngrok for external webhook testing');
}

// Run the tests
runTests().catch(console.error);

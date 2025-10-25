#!/usr/bin/env node

// Quick webhook test script
const BASE_URL = 'http://localhost:3000';

async function testWebhook() {
  console.log('🧪 Quick Webhook Test');
  console.log('=' .repeat(40));
  
  try {
    // Test 1: Webhook verification
    console.log('1️⃣ Testing webhook verification...');
    const verifyResponse = await fetch(`${BASE_URL}/api/meshai/whatsapp-webhook?hub.mode=subscribe&hub.challenge=test-challenge&hub.verify_token=4ab273511eafcbe7911056e510a161c6`);
    
    if (verifyResponse.ok) {
      const challenge = await verifyResponse.text();
      console.log('✅ Webhook verification: PASSED');
      console.log(`   Challenge: ${challenge}`);
    } else {
      console.log('❌ Webhook verification: FAILED');
    }
    
    // Test 2: RAG recommendation
    console.log('\n2️⃣ Testing RAG recommendation...');
    const ragResponse = await fetch(`${BASE_URL}/api/meshai/ai-recommendation-rag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "I need help with relaxation and stress relief",
        customerId: "test-123"
      })
    });
    
    if (ragResponse.ok) {
      const ragResult = await ragResponse.json();
      console.log('✅ RAG recommendation: PASSED');
      console.log(`   Found ${ragResult.recommendations?.length || 0} recommendations`);
      if (ragResult.recommendations?.length > 0) {
        console.log(`   Top recommendation: ${ragResult.recommendations[0].product.name} - $${ragResult.recommendations[0].product.price}`);
      }
    } else {
      console.log('❌ RAG recommendation: FAILED');
    }
    
    // Test 3: Simulated WhatsApp message
    console.log('\n3️⃣ Testing simulated WhatsApp message...');
    const webhookResponse = await fetch(`${BASE_URL}/api/meshai/whatsapp-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
                from: '+971501234567',
                id: 'wamid.test123',
                timestamp: Math.floor(Date.now() / 1000).toString(),
                text: { body: 'Looking for luxury skincare products' },
                type: 'text'
              }],
              contacts: [{
                profile: { name: 'Test User' },
                wa_id: '+971501234567'
              }]
            },
            field: 'messages'
          }]
        }]
      })
    });
    
    if (webhookResponse.ok) {
      const webhookResult = await webhookResponse.json();
      console.log('✅ WhatsApp webhook: PASSED');
      console.log(`   Status: ${webhookResult.status}`);
    } else {
      console.log('❌ WhatsApp webhook: FAILED');
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Get Groq API key from: https://console.groq.com/keys');
    console.log('2. Update GROQ_API_KEY in .env.local');
    console.log('3. Test with real WhatsApp Business API');
    console.log('4. Deploy to production');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your server is running: npm run dev');
  }
}

// Run the test
testWebhook();

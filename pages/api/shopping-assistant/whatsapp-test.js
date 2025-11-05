// WhatsApp Business API - Test Endpoint
// Allows testing WhatsApp integration with sample messages

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testType, phoneNumber } = req.body;

    console.log('🧪 WhatsApp test request:', { testType, phoneNumber });

    let result;

    switch (testType) {
      case 'status':
        result = await testStatus();
        break;
      
      case 'send':
        if (!phoneNumber) {
          return res.status(400).json({ error: 'Phone number required for send test' });
        }
        result = await testSendMessage(phoneNumber);
        break;
      
      case 'webhook':
        result = await testWebhook();
        break;
      
      case 'full':
        if (!phoneNumber) {
          return res.status(400).json({ error: 'Phone number required for full test' });
        }
        result = await testFullIntegration(phoneNumber);
        break;
      
      default:
        return res.status(400).json({ 
          error: 'Invalid test type. Use: status, send, webhook, or full' 
        });
    }

    res.status(200).json({
      success: true,
      testType: testType,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ WhatsApp test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: error.message 
    });
  }
}

// Test WhatsApp API status
async function testStatus() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/shopping-assistant/whatsapp-status`);
    const status = await response.json();
    
    return {
      status: 'success',
      message: 'Status check completed',
      data: status
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Status check failed',
      error: error.message
    };
  }
}

// Test sending a message
async function testSendMessage(phoneNumber) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const testMessage = "🧪 Test message from Shopping Assistant WhatsApp integration! This is a test to verify your WhatsApp Business API is working correctly.";
    
    const response = await fetch(`${baseUrl}/api/shopping-assistant/whatsapp-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: testMessage,
        type: 'text'
      })
    });

    const result = await response.json();
    
    return {
      status: 'success',
      message: 'Test message sent successfully',
      data: result
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to send test message',
      error: error.message
    };
  }
}

// Test webhook endpoint
async function testWebhook() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    // Test webhook verification
    const verifyUrl = `${baseUrl}/api/shopping-assistant/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=${process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN}&hub.challenge=test123`;
    
    const response = await fetch(verifyUrl);
    const challenge = await response.text();
    
    return {
      status: 'success',
      message: 'Webhook verification test completed',
      data: {
        challenge: challenge,
        expectedChallenge: 'test123',
        verificationPassed: challenge === 'test123'
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Webhook test failed',
      error: error.message
    };
  }
}

// Test full integration (status + send + webhook)
async function testFullIntegration(phoneNumber) {
  const results = {
    status: await testStatus(),
    send: await testSendMessage(phoneNumber),
    webhook: await testWebhook()
  };

  const allPassed = Object.values(results).every(result => result.status === 'success');

  return {
    status: allPassed ? 'success' : 'partial',
    message: allPassed ? 'All tests passed' : 'Some tests failed',
    results: results,
    summary: {
      totalTests: Object.keys(results).length,
      passedTests: Object.values(results).filter(r => r.status === 'success').length,
      failedTests: Object.values(results).filter(r => r.status === 'error').length
    }
  };
}

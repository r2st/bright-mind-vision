// WhatsApp Business API Configuration
// Handles webhook verification and configuration

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Webhook verification
    return handleWebhookVerification(req, res);
  } else if (req.method === 'POST') {
    // Handle configuration updates
    return handleConfigurationUpdate(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Handle webhook verification for WhatsApp Business API
async function handleWebhookVerification(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verify the webhook
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed');
    res.status(403).json({ error: 'Forbidden' });
  }
}

// Handle configuration updates
async function handleConfigurationUpdate(req, res) {
  try {
    const { action, config } = req.body;

    switch (action) {
      case 'update_webhook_url':
        await updateWebhookUrl(config.webhookUrl);
        break;
      case 'update_phone_number':
        await updatePhoneNumber(config.phoneNumberId);
        break;
      case 'update_access_token':
        await updateAccessToken(config.accessToken);
        break;
      case 'test_connection':
        const testResult = await testWhatsAppConnection();
        return res.status(200).json({ success: true, result: testResult });
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(200).json({ success: true, message: 'Configuration updated' });
  } catch (error) {
    console.error('Configuration update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update webhook URL
async function updateWebhookUrl(webhookUrl) {
  // In production, store this in your database
  console.log('Updating webhook URL:', webhookUrl);
  
  // You would typically call the WhatsApp Business API to update the webhook
  // This requires the WhatsApp Business API management endpoints
}

// Update phone number ID
async function updatePhoneNumber(phoneNumberId) {
  console.log('Updating phone number ID:', phoneNumberId);
  // Store in environment variables or database
}

// Update access token
async function updateAccessToken(accessToken) {
  console.log('Updating access token');
  // Store securely in environment variables or encrypted database
}

// Test WhatsApp connection
async function testWhatsAppConnection() {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      return { success: false, error: 'Missing credentials' };
    }

    // Test by getting phone number info
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        phoneNumber: data.display_phone_number,
        status: data.status
      };
    } else {
      return { success: false, error: 'API connection failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

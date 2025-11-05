// WhatsApp Business API - Status and Configuration Endpoint
// Provides information about WhatsApp Business API setup and status

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const status = await getWhatsAppStatus();
    
    res.status(200).json({
      success: true,
      status: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting WhatsApp status:', error);
    res.status(500).json({ 
      error: 'Failed to get status',
      details: error.message 
    });
  }
}

// Get WhatsApp Business API status and configuration
async function getWhatsAppStatus() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  const status = {
    configuration: {
      accessToken: accessToken ? '✅ Configured' : '❌ Missing',
      phoneNumberId: phoneNumberId ? '✅ Configured' : '❌ Missing',
      businessAccountId: businessAccountId ? '✅ Configured' : '❌ Missing',
      webhookUrl: webhookUrl ? '✅ Configured' : '❌ Missing',
      verifyToken: verifyToken ? '✅ Configured' : '❌ Missing'
    },
    apiStatus: 'unknown',
    phoneNumberInfo: null,
    businessAccountInfo: null,
    webhookInfo: null
  };

  // Check if we have the minimum required configuration
  const hasMinConfig = accessToken && phoneNumberId;

  if (!hasMinConfig) {
    status.apiStatus = 'not_configured';
    status.message = 'Missing required environment variables. Please configure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.';
    return status;
  }

  try {
    // Get phone number information
    const phoneResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (phoneResponse.ok) {
      status.phoneNumberInfo = await phoneResponse.json();
      status.apiStatus = 'connected';
    } else {
      status.apiStatus = 'error';
      status.phoneNumberError = await phoneResponse.text();
    }

    // Get business account information if available
    if (businessAccountId) {
      try {
        const businessResponse = await fetch(`https://graph.facebook.com/v18.0/${businessAccountId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (businessResponse.ok) {
          status.businessAccountInfo = await businessResponse.json();
        }
      } catch (error) {
        console.log('Could not fetch business account info:', error.message);
      }
    }

    // Webhook information
    if (webhookUrl && verifyToken) {
      status.webhookInfo = {
        url: webhookUrl,
        verifyToken: verifyToken ? '✅ Set' : '❌ Missing',
        endpoint: `${webhookUrl}/api/shopping-assistant/whatsapp-webhook`
      };
    }

  } catch (error) {
    status.apiStatus = 'error';
    status.error = error.message;
  }

  return status;
}

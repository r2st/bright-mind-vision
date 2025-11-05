// WhatsApp Business API - Send Message Endpoint
// Allows sending messages to WhatsApp users

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, message, type = 'text' } = req.body;

    if (!to || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, message' 
      });
    }

    console.log('📤 Sending WhatsApp message:', { to, message, type });

    const result = await sendWhatsAppMessage(to, message, type);

    res.status(200).json({
      success: true,
      messageId: result.messages?.[0]?.id,
      result: result
    });

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
}

// Send WhatsApp message using Business API
async function sendWhatsAppMessage(to, message, type = 'text') {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp credentials not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in your environment variables.');
  }

  // Format phone number (remove any non-digit characters except +)
  const formattedTo = to.replace(/[^\d+]/g, '');
  
  let messagePayload;

  switch (type) {
    case 'text':
      messagePayload = {
        messaging_product: 'whatsapp',
        to: formattedTo,
        type: 'text',
        text: {
          body: message
        }
      };
      break;
    
    case 'template':
      // For template messages (requires pre-approved templates)
      messagePayload = {
        messaging_product: 'whatsapp',
        to: formattedTo,
        type: 'template',
        template: {
          name: 'hello_world', // Replace with your approved template name
          language: {
            code: 'en_US'
          }
        }
      };
      break;
    
    default:
      throw new Error(`Unsupported message type: ${type}`);
  }

  console.log('📤 WhatsApp API payload:', JSON.stringify(messagePayload, null, 2));

  const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messagePayload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ WhatsApp API error:', errorData);
    throw new Error(`WhatsApp API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  console.log('✅ WhatsApp message sent successfully:', result);
  
  return result;
}

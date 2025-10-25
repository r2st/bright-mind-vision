// Netlify Function for Automatic Token Renewal
// This function runs automatically via Netlify's scheduled functions

exports.handler = async (event, context) => {
  console.log('🔄 Netlify scheduled function: Token renewal');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    const baseUrl = process.env.URL || 'https://brightmindvision.com';
    
    // Check token status
    const statusResponse = await fetch(`${baseUrl}/api/meshai/token-renewal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check' })
    });
    
    if (!statusResponse.ok) {
      throw new Error(`Status check failed: ${statusResponse.statusText}`);
    }
    
    const status = await statusResponse.json();
    console.log('📊 Token Status:', JSON.stringify(status, null, 2));
    
    if (status.status.needsRenewal) {
      console.log('⚠️ Token needs renewal, initiating renewal...');
      
      // Renew the token
      const renewResponse = await fetch(`${baseUrl}/api/meshai/token-renewal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'renew' })
      });
      
      if (renewResponse.ok) {
        console.log('✅ Token renewal successful');
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Token renewed successfully',
            timestamp: new Date().toISOString()
          })
        };
      } else {
        throw new Error('Token renewal failed');
      }
    } else {
      console.log('✅ Token is still valid');
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Token is valid, no renewal needed',
          timestamp: new Date().toISOString()
        })
      };
    }
    
  } catch (error) {
    console.error('❌ Token renewal error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

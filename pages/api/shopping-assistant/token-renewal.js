// WhatsApp Token Renewal API Endpoint
import tokenRenewalService from '../../../services/tokenRenewalService.js';

export default async function handler(req, res) {
  console.log('🔄 Token renewal API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action } = req.body;
    
    switch (action) {
      case 'check':
        // Check current token status
        const status = await tokenRenewalService.getTokenStatus();
        return res.status(200).json({
          success: true,
          status,
          timestamp: new Date().toISOString()
        });
        
      case 'renew':
        // Manually renew token
        console.log('🔄 Manual token renewal requested');
        await tokenRenewalService.checkAndRenewToken();
        return res.status(200).json({
          success: true,
          message: 'Token renewal initiated',
          timestamp: new Date().toISOString()
        });
        
      case 'start':
        // Start automatic renewal
        tokenRenewalService.startAutoRenewal();
        return res.status(200).json({
          success: true,
          message: 'Automatic token renewal started',
          timestamp: new Date().toISOString()
        });
        
      case 'stop':
        // Stop automatic renewal
        tokenRenewalService.stopAutoRenewal();
        return res.status(200).json({
          success: true,
          message: 'Automatic token renewal stopped',
          timestamp: new Date().toISOString()
        });
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use: check, renew, start, or stop'
        });
    }
    
  } catch (error) {
    console.error('❌ Token renewal API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Automatic WhatsApp Token Renewal Service
import fetch from 'node-fetch';

class TokenRenewalService {
  constructor() {
    this.appId = process.env.FACEBOOK_APP_ID;
    this.appSecret = process.env.FACEBOOK_APP_SECRET;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.currentToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.renewalInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.renewalTimer = null;
  }

  // Start automatic token renewal
  startAutoRenewal() {
    console.log('🔄 Starting automatic token renewal service...');
    
    // Check token validity immediately
    this.checkAndRenewToken();
    
    // Set up periodic renewal
    this.renewalTimer = setInterval(() => {
      this.checkAndRenewToken();
    }, this.renewalInterval);
    
    console.log('✅ Token renewal service started');
  }

  // Stop automatic token renewal
  stopAutoRenewal() {
    if (this.renewalTimer) {
      clearInterval(this.renewalTimer);
      this.renewalTimer = null;
      console.log('🛑 Token renewal service stopped');
    }
  }

  // Check token validity and renew if needed
  async checkAndRenewToken() {
    try {
      console.log('🔍 Checking token validity...');
      
      // Test current token
      const isValid = await this.validateToken(this.currentToken);
      
      if (!isValid) {
        console.log('⚠️ Token is invalid or expired, attempting renewal...');
        await this.renewToken();
      } else {
        console.log('✅ Token is valid');
      }
      
    } catch (error) {
      console.error('❌ Error checking token:', error.message);
    }
  }

  // Validate current token
  async validateToken(token) {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${token}`);
      return response.ok;
    } catch (error) {
      console.error('❌ Token validation error:', error.message);
      return false;
    }
  }

  // Renew the token
  async renewToken() {
    try {
      console.log('🔄 Renewing WhatsApp access token...');
      
      // Get new token using app credentials
      const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.appId,
          client_secret: this.appSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token renewal failed: ${response.statusText}`);
      }

      const data = await response.json();
      const newToken = data.access_token;
      
      if (newToken) {
        console.log('✅ Token renewed successfully');
        
        // Update environment variable (in production, you'd update your deployment)
        process.env.WHATSAPP_ACCESS_TOKEN = newToken;
        
        // Log the renewal
        console.log('📝 New token set:', newToken.substring(0, 20) + '...');
        
        // In production, you'd trigger a deployment update here
        await this.updateProductionToken(newToken);
        
        return newToken;
      } else {
        throw new Error('No token received from Facebook');
      }
      
    } catch (error) {
      console.error('❌ Token renewal failed:', error.message);
      throw error;
    }
  }

  // Update token in production (Netlify)
  async updateProductionToken(newToken) {
    try {
      console.log('🚀 Updating production token...');
      
      // In a real implementation, you would:
      // 1. Update Netlify environment variables via API
      // 2. Trigger a new deployment
      // 3. Or use a webhook to update your deployment system
      
      console.log('📝 Production token update would happen here');
      console.log('💡 Consider using Netlify API or deployment webhooks');
      
    } catch (error) {
      console.error('❌ Production token update failed:', error.message);
    }
  }

  // Get current token status
  async getTokenStatus() {
    try {
      const isValid = await this.validateToken(this.currentToken);
      const expiresIn = await this.getTokenExpiration();
      
      return {
        valid: isValid,
        expiresIn: expiresIn,
        needsRenewal: !isValid || expiresIn < 3600, // Less than 1 hour
        currentToken: this.currentToken ? this.currentToken.substring(0, 20) + '...' : 'Not set'
      };
    } catch (error) {
      return {
        valid: false,
        expiresIn: 0,
        needsRenewal: true,
        error: error.message
      };
    }
  }

  // Get token expiration time
  async getTokenExpiration() {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token_info?access_token=${this.currentToken}`);
      const data = await response.json();
      return data.expires_in || 0;
    } catch (error) {
      return 0;
    }
  }
}

// Export singleton instance
export default new TokenRenewalService();

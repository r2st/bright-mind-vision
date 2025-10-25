#!/usr/bin/env node

// WhatsApp Token Renewal Script
// Run this script via cron job every 12 hours

import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://brightmindvision.com';

async function renewToken() {
  console.log('🔄 Starting token renewal process...');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    // Check current token status
    console.log('1️⃣ Checking current token status...');
    const statusResponse = await fetch(`${PRODUCTION_URL}/api/meshai/token-renewal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check' })
    });
    
    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log('📊 Token Status:', JSON.stringify(status, null, 2));
      
      if (status.status.needsRenewal) {
        console.log('⚠️ Token needs renewal, initiating renewal...');
        
        // Renew the token
        const renewResponse = await fetch(`${PRODUCTION_URL}/api/meshai/token-renewal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'renew' })
        });
        
        if (renewResponse.ok) {
          console.log('✅ Token renewal successful');
        } else {
          console.log('❌ Token renewal failed');
        }
      } else {
        console.log('✅ Token is still valid, no renewal needed');
      }
    } else {
      console.log('❌ Failed to check token status');
    }
    
  } catch (error) {
    console.error('❌ Token renewal error:', error.message);
  }
  
  console.log('🏁 Token renewal process completed');
}

// Run the renewal
renewToken().catch(console.error);

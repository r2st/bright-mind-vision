// Simple test endpoint to verify Vapi API configuration
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if environment variable is set
    const apiKey = process.env.VAPI_API_KEY;
    
    res.status(200).json({
      success: true,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      message: apiKey ? 'API key found' : 'API key not found',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

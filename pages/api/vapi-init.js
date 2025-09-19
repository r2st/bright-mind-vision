// Server-side API endpoint for Vapi initialization
// This keeps the API key secure on the server

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the API keys from server-side environment variables
    const privateApiKey = process.env.VAPI_API_PRIVATE_KEY;
    const publicApiKey = process.env.VAPI_API_PUBLIC_KEY || process.env.VAPI_API_KEY || 'ef22cbd0-8219-484c-9f4e-8008a4ca43b7';
    
    // Check if this is a request for wellness partners (from the wellness demo page)
    const isWellnessRequest = req.headers.referer && req.headers.referer.includes('voice-wellness-partners');
    
    console.log('🔍 Vapi Init Request Details:');
    console.log('🔍 Referer:', req.headers.referer);
    console.log('🔍 Is Wellness Request:', isWellnessRequest);
    console.log('🔍 Private Key Available:', !!privateApiKey);
    console.log('🔍 Public Key Available:', !!publicApiKey);
    
    // If we have a public key associated with an assistant, we might not need private key operations
    let assistantId = null;
    let assistantName = isWellnessRequest ? "Wellness Assistant" : "Riley"; // The assistant name associated with the public key
    
    if (privateApiKey) {
      // First, try to get existing assistants
      try {
        console.log('🔍 Fetching existing assistants...');
        const getResponse = await fetch('https://api.vapi.ai/assistant', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${privateApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (getResponse.ok) {
          const assistants = await getResponse.json();
          console.log('🔍 Found existing assistants:', assistants.length);
          
          // Look for existing assistant based on request type
          let existingAssistant = null;
          if (isWellnessRequest) {
            // Look for wellness assistant (Riley or wellness-related)
            existingAssistant = assistants.find(a => 
              a.name.toLowerCase().includes('riley') || 
              a.name.toLowerCase().includes('wellness') ||
              a.name.toLowerCase().includes('appointment')
            );
          } else {
            // Look for hotel booking assistant
            existingAssistant = assistants.find(a => 
              a.name.toLowerCase().includes('hotel') || 
              a.name.toLowerCase().includes('booking')
            );
          }
          
          if (existingAssistant) {
            assistantId = existingAssistant.id;
            assistantName = existingAssistant.name;
            console.log(`✅ Using existing ${isWellnessRequest ? 'wellness' : 'hotel'} assistant:`, assistantId);
            console.log('✅ Assistant name:', assistantName);
          } else {
            console.log('🔍 No suitable existing assistant found, creating new one...');
          }
        }
      } catch (getError) {
        console.error('Error fetching existing assistants:', getError);
      }
      
      // If no existing assistant found, create a new one
      if (!assistantId) {
        try {
          // Create assistant based on request type
          const uniqueName = isWellnessRequest 
            ? `Wellness-Assistant-${Date.now()}` 
            : `Riley-Hotel-Booking-${Date.now()}`;
          console.log('Creating new assistant with name:', uniqueName);
        
        const createResponse = await fetch('https://api.vapi.ai/assistant', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${privateApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: uniqueName,
            model: {
              provider: "openai",
              model: "gpt-3.5-turbo",
              temperature: 0.7,
              messages: [{
                role: "system",
                content: isWellnessRequest 
                  ? "You are a wellness partners assistant. You help users find and book wellness services like massage therapy, yoga classes, nutrition counseling, and personal training. Keep responses concise and friendly. When users ask about wellness services, use the search_wellness_partners tool. You are EXCLUSIVELY for wellness and health services."
                  : "You are Riley, a hotel booking assistant for LuxuryStay. You ONLY help users find and book hotels. You understand hotel requirements like destination, dates, guests, and rooms. Keep responses concise and friendly. When users ask about hotels, use the search_hotels tool. NEVER mention wellness partners, medical appointments, doctors, healthcare, or any non-hotel services. You are EXCLUSIVELY for hotel bookings and travel accommodations."
              }]
            },
            voice: {
              provider: "11labs",
              voiceId: "shimmer"
            },
            firstMessage: isWellnessRequest 
              ? "Hi! I'm your wellness assistant. I can help you find wellness services like massage, yoga, nutrition, or fitness training. What service are you interested in?"
              : "Hi! I'm Riley, your hotel booking assistant. I can help you find the perfect hotel for your stay. What destination are you interested in?",
            endCallMessage: isWellnessRequest 
              ? "Thank you for using Wellness Partners! Take care of yourself!"
              : "Thank you for using LuxuryStay! Have a great trip!",
            endCallPhrases: ["goodbye", "bye", "end call", "hang up", "thank you", "that's all"],
            backgroundSound: "off",
            serverUrl: "https://bright-mind-vision.netlify.app/api/vapi-webhook",
            serverUrlSecret: isWellnessRequest ? "wellness-secret-2024" : "hotel-booking-secret-2024",
            tools: isWellnessRequest ? [{
              type: "function",
              function: {
                name: "search_wellness_partners",
                description: "Search for available wellness service providers based on service type, location, and preferred date",
                parameters: {
                  type: "object",
                  properties: {
                    service: {
                      type: "string",
                      description: "The type of wellness service (massage, yoga, nutrition, fitness, etc.)"
                    },
                    location: {
                      type: "string",
                      description: "The location or area where the user wants the service"
                    },
                    date: {
                      type: "string",
                      description: "Preferred date for the service"
                    }
                  },
                  required: ["service"]
                }
              }
            }] : [{
              type: "function",
              function: {
                name: "search_hotels",
                description: "Search for available hotels based on destination, check-in date, check-out date, number of guests, and number of rooms",
                parameters: {
                  type: "object",
                  properties: {
                    destination: {
                      type: "string",
                      description: "The destination city or location where the user wants to stay"
                    },
                    checkin: {
                      type: "string",
                      description: "Check-in date in YYYY-MM-DD format"
                    },
                    checkout: {
                      type: "string", 
                      description: "Check-out date in YYYY-MM-DD format"
                    },
                    guests: {
                      type: "string",
                      description: "Number of guests"
                    },
                    rooms: {
                      type: "string",
                      description: "Number of rooms needed"
                    }
                  },
                  required: ["destination", "checkin", "checkout", "guests", "rooms"]
                }
              }
            }]
          })
        });
        
        if (createResponse.ok) {
          const assistantData = await createResponse.json();
          assistantId = assistantData.id;
          console.log(`✅ Created new ${isWellnessRequest ? 'wellness' : 'hotel booking'} assistant:`, assistantId);
          console.log('✅ Assistant name:', assistantData.name);
          console.log('✅ Assistant first message:', assistantData.firstMessage);
          } else {
            const errorText = await createResponse.text();
            console.error('❌ Failed to create assistant:', createResponse.status, createResponse.statusText, errorText);
          }
        } catch (createError) {
          console.error('Error creating assistant:', createError);
        }
      }
    } else {
      console.log('No private key configured, using public key with Riley assistant');
    }

    res.status(200).json({
      success: true,
      apiKey: publicApiKey, // Use public key for frontend
      assistantId: assistantId, // Provide assistant ID if available
      assistantName: assistantName, // Provide assistant name
      message: 'Vapi configuration ready'
    });

  } catch (error) {
    console.error('Vapi initialization error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to initialize Vapi configuration' 
    });
  }
}

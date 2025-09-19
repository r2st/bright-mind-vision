export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    console.log('🔍 Vapi webhook received:', JSON.stringify(message, null, 2));

    if (message.type === 'function-call') {
      const { functionCall } = message;
      console.log('🔍 Function call received:', functionCall);

      if (functionCall.name === 'search_hotels') {
        const { destination, checkin, checkout, guests, rooms } = functionCall.parameters;
        console.log('🔍 Searching hotels with params:', { destination, checkin, checkout, guests, rooms });

        // Sample hotel data (in a real app, this would come from a database)
        const hotels = [
          {
            id: '1',
            name: 'Grand Plaza Hotel',
            location: 'New York, USA',
            pricePerNight: 250,
            amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
            checkin: '2024-01-15',
            checkout: '2024-01-17'
          },
          {
            id: '2',
            name: 'Parisian Dreams',
            location: 'Paris, France',
            pricePerNight: 180,
            amenities: ['WiFi', 'Breakfast', 'Spa', 'Bar'],
            checkin: '2024-01-15',
            checkout: '2024-01-17'
          },
          {
            id: '3',
            name: 'Thames View Hotel',
            location: 'London, UK',
            pricePerNight: 180,
            amenities: ['WiFi', 'Breakfast', 'Bar', 'Parking'],
            checkin: '2024-01-15',
            checkout: '2024-01-17'
          },
          {
            id: '4',
            name: 'Sakura Inn',
            location: 'Tokyo, Japan',
            pricePerNight: 200,
            amenities: ['WiFi', 'Spa', 'Restaurant', 'Garden'],
            checkin: '2024-01-15',
            checkout: '2024-01-17'
          },
          {
            id: '5',
            name: 'Sydney Harbor Hotel',
            location: 'Sydney, Australia',
            pricePerNight: 220,
            amenities: ['WiFi', 'Pool', 'Restaurant', 'Gym'],
            checkin: '2024-01-15',
            checkout: '2024-01-17'
          }
        ];

        // Filter hotels based on destination (simple matching)
        let filteredHotels = hotels;
        if (destination) {
          filteredHotels = hotels.filter(hotel => 
            hotel.location.toLowerCase().includes(destination.toLowerCase()) ||
            hotel.name.toLowerCase().includes(destination.toLowerCase())
          );
        }

        // If no exact match, return all hotels
        if (filteredHotels.length === 0) {
          filteredHotels = hotels;
        }

        // Format the response for the voice assistant
        const hotelList = filteredHotels.map(hotel => 
          `${hotel.name} in ${hotel.location} - $${hotel.pricePerNight} per night. Amenities: ${hotel.amenities.join(', ')}`
        ).join('. ');

        const response = {
          result: `I found ${filteredHotels.length} hotels for you: ${hotelList}. These are real hotels available for booking. Would you like me to help you book any of these hotels?`
        };

        console.log('🔍 Returning hotel search results:', response);
        return res.status(200).json(response);
      } else if (functionCall.name === 'search_wellness_partners') {
        const { service, location, date } = functionCall.parameters;
        console.log('🔍 Searching wellness partners with params:', { service, location, date });

        // Sample wellness partners data
        const wellnessPartners = [
          {
            id: '1',
            name: 'Serenity Spa',
            service: 'Massage Therapy',
            location: 'Downtown',
            rating: 4.8,
            price: '$120/hour',
            specialties: ['Deep Tissue', 'Swedish', 'Hot Stone']
          },
          {
            id: '2',
            name: 'Zen Yoga Studio',
            service: 'Yoga & Meditation',
            location: 'Westside',
            rating: 4.9,
            price: '$80/class',
            specialties: ['Hatha', 'Vinyasa', 'Meditation']
          },
          {
            id: '3',
            name: 'Vitality Nutrition',
            service: 'Nutrition Counseling',
            location: 'Midtown',
            rating: 4.7,
            price: '$150/session',
            specialties: ['Weight Management', 'Sports Nutrition', 'Wellness Coaching']
          },
          {
            id: '4',
            name: 'FitLife Training',
            service: 'Personal Training',
            location: 'Eastside',
            rating: 4.6,
            price: '$100/hour',
            specialties: ['Strength Training', 'Cardio', 'Rehabilitation']
          }
        ];

        // Filter wellness partners based on service (simple matching)
        let filteredPartners = wellnessPartners;
        if (service) {
          filteredPartners = wellnessPartners.filter(partner => 
            partner.service.toLowerCase().includes(service.toLowerCase()) ||
            partner.specialties.some(specialty => specialty.toLowerCase().includes(service.toLowerCase()))
          );
        }

        // If no exact match, return all partners
        if (filteredPartners.length === 0) {
          filteredPartners = wellnessPartners;
        }

        // Format the response for the voice assistant
        const partnerList = filteredPartners.map(partner => 
          `${partner.name} - ${partner.service} in ${partner.location}, rated ${partner.rating} stars, ${partner.price}. Specialties: ${partner.specialties.join(', ')}`
        ).join('. ');

        const response = {
          result: `I found ${filteredPartners.length} wellness partners for you: ${partnerList}. These are certified wellness professionals available for booking. Would you like me to help you book a session?`
        };

        console.log('🔍 Returning wellness partners search results:', response);
        return res.status(200).json(response);
      } else {
        // Handle other function calls
        console.log('🔍 Unknown function call:', functionCall.name);
        return res.status(200).json({
          result: "I can help you with hotels or wellness services. Please specify what you're looking for."
        });
      }
    }

    // Handle other message types
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('🔍 Vapi webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

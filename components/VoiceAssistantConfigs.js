// Voice Assistant Configuration Objects for Different Use Cases

// Wellness Partners Configuration
export const WELLNESS_CONFIG = {
  storageKeys: {
    ASSISTANT_ID: 'vapi_wellness_assistant_id',
    ASSISTANT_TIMESTAMP: 'vapi_wellness_assistant_timestamp'
  },
  apiEndpoint: '/api/vapi-init',
  assistant: {
    name: 'Wellness Assistant',
    description: 'I help you find and book wellness services',
    firstMessage: 'Hi! I\'m your wellness assistant. I can help you find wellness services like massage, yoga, nutrition, or fitness training. What service are you interested in?',
    endMessage: 'Thank you for using Wellness Partners! Take care of yourself!',
    systemPrompt: 'You are a wellness partners assistant. You help users find and book wellness services like massage therapy, yoga classes, nutrition counseling, and personal training. Keep responses concise and friendly.'
  },
  demo: {
    enabled: true,
    sampleCommands: [
      'I need a massage therapist',
      'Find yoga classes near me',
      'Book nutrition consultation',
      'Schedule personal training session',
      'I want to book a wellness appointment',
      'Can you help me find a personal trainer?',
      'I need a nutritionist consultation'
    ],
    results: {
      massage: [{ name: 'Serenity Spa', service: 'Massage Therapy', location: 'Downtown', rating: 4.8 }],
      yoga: [{ name: 'Zen Yoga Studio', service: 'Yoga & Meditation', location: 'Westside', rating: 4.9 }],
      nutrition: [{ name: 'Vitality Nutrition', service: 'Nutrition Counseling', location: 'Midtown', rating: 4.7 }],
      trainer: [{ name: 'FitLife Training', service: 'Personal Training', location: 'Eastside', rating: 4.6 }]
    },
    fallbackMessage: 'I\'m a wellness assistant. I can only help you find and book wellness services. Please ask me about services like massage, yoga, or nutrition.'
  },
  voice: {
    provider: 'openai',
    voiceId: 'alloy'
  },
  ui: {
    buttonText: 'Start Wellness Assistant',
    initialMessage: 'Click to start wellness assistant',
    unavailableMessage: 'Wellness Assistant Unavailable',
    unavailableDescription: 'Voice features require HTTPS connection and microphone access. Try using a modern browser with HTTPS enabled.'
  }
};

// Hotel Booking Configuration
export const HOTEL_CONFIG = {
  storageKeys: {
    ASSISTANT_ID: 'vapi_hotel_assistant_id',
    ASSISTANT_TIMESTAMP: 'vapi_hotel_assistant_timestamp'
  },
  apiEndpoint: '/api/vapi-init',
  assistant: {
    name: 'Hotel Booking Assistant',
    description: 'I help you find and book hotels',
    firstMessage: 'Hi! I\'m Riley, your hotel booking assistant. I can help you find the perfect hotel for your stay. What destination are you interested in?',
    endMessage: 'Thank you for using LuxuryStay! Have a great trip!',
    systemPrompt: 'You are Riley, a hotel booking assistant for LuxuryStay. You help users find and book hotels. You understand hotel requirements like destination, dates, guests, and rooms. Keep responses concise and friendly.'
  },
  demo: {
    enabled: true,
    sampleCommands: [
      'I need a hotel in New York',
      'Find hotels in Paris for next week',
      'Book a room for 2 guests',
      'I want a luxury hotel in Tokyo',
      'Can you help me find accommodation in London?',
      'I need a hotel near the airport',
      'Book a hotel for my business trip'
    ],
    results: {
      'new york': [{ name: 'The Plaza Hotel', service: 'Luxury Hotel', location: 'Manhattan', rating: 4.9, price: '$450/night' }],
      'paris': [{ name: 'Hotel Ritz Paris', service: '5-Star Hotel', location: 'Place Vendôme', rating: 4.8, price: '$600/night' }],
      'tokyo': [{ name: 'The Ritz-Carlton Tokyo', service: 'Luxury Hotel', location: 'Roppongi', rating: 4.9, price: '$550/night' }],
      'london': [{ name: 'The Savoy', service: 'Historic Luxury Hotel', location: 'Covent Garden', rating: 4.8, price: '$500/night' }]
    },
    fallbackMessage: 'I\'m a hotel booking assistant. I can only help you find and book hotels. Please ask me about destinations, dates, or hotel preferences.'
  },
  voice: {
    provider: 'openai',
    voiceId: 'alloy'
  },
  ui: {
    buttonText: 'Start Hotel Assistant',
    initialMessage: 'Click to start hotel booking assistant',
    unavailableMessage: 'Hotel Assistant Unavailable',
    unavailableDescription: 'Voice features require HTTPS connection and microphone access. Try using a modern browser with HTTPS enabled.'
  }
};

// Clinic/Patient Onboarding Configuration
export const CLINIC_CONFIG = {
  storageKeys: {
    ASSISTANT_ID: 'vapi_clinic_assistant_id',
    ASSISTANT_TIMESTAMP: 'vapi_clinic_assistant_timestamp'
  },
  apiEndpoint: '/api/vapi-init',
  assistant: {
    name: 'Clinic Assistant',
    description: 'I help with patient onboarding and appointment booking',
    firstMessage: 'Hi! I\'m your clinic assistant. I can help you book appointments, collect your information, and answer questions about our services. How can I assist you today?',
    endMessage: 'Thank you for choosing our clinic! We look forward to seeing you.',
    systemPrompt: 'You are a clinic assistant for patient onboarding. You help patients book appointments, collect their information (name, phone, preferred time), and answer questions about clinic services. Keep responses professional and helpful.'
  },
  demo: {
    enabled: true,
    sampleCommands: [
      'I need to book an appointment',
      'Schedule a consultation',
      'I want to see Dr. Smith',
      'Book me for next week',
      'I need a checkup',
      'Can you help me schedule a visit?',
      'I want to make an appointment'
    ],
    results: {
      'appointment': [{ name: 'Dr. Sarah Johnson', specialty: 'General Practice', location: 'Main Clinic', rating: 4.9, availability: 'Next available: Tomorrow 2 PM' }],
      'consultation': [{ name: 'Dr. Michael Chen', specialty: 'Specialist Consultation', location: 'Specialty Wing', rating: 4.8, availability: 'Next available: Friday 10 AM' }],
      'checkup': [{ name: 'Dr. Emily Davis', specialty: 'Preventive Care', location: 'Wellness Center', rating: 4.9, availability: 'Next available: Monday 9 AM' }]
    },
    fallbackMessage: 'I\'m a clinic assistant. I can only help you book appointments and provide clinic information. Please ask me about scheduling, services, or appointments.'
  },
  voice: {
    provider: 'openai',
    voiceId: 'alloy'
  },
  ui: {
    buttonText: 'Start Clinic Assistant',
    initialMessage: 'Click to start clinic assistant',
    unavailableMessage: 'Clinic Assistant Unavailable',
    unavailableDescription: 'Voice features require HTTPS connection and microphone access. Try using a modern browser with HTTPS enabled.'
  }
};

// Custom Configuration Builder
export const createCustomConfig = (overrides = {}) => {
  return {
    storageKeys: {
      ASSISTANT_ID: 'vapi_custom_assistant_id',
      ASSISTANT_TIMESTAMP: 'vapi_custom_assistant_timestamp',
      ...overrides.storageKeys
    },
    apiEndpoint: '/api/vapi-init',
    assistant: {
      name: 'Custom Assistant',
      description: 'I help you with your requests',
      firstMessage: 'Hi! How can I help you today?',
      endMessage: 'Thank you for using our service!',
      systemPrompt: 'You are a helpful assistant. Keep responses concise and friendly.',
      ...overrides.assistant
    },
    demo: {
      enabled: true,
      sampleCommands: ['How can you help me?', 'What services do you offer?'],
      results: {},
      fallbackMessage: 'I\'m here to help. Please ask me about our services.',
      ...overrides.demo
    },
    voice: {
      provider: 'openai',
      voiceId: 'alloy',
      ...overrides.voice
    },
    ui: {
      buttonText: 'Start Assistant',
      initialMessage: 'Click to start assistant',
      unavailableMessage: 'Assistant Unavailable',
      unavailableDescription: 'Voice features require HTTPS connection and microphone access. Try using a modern browser with HTTPS enabled.',
      ...overrides.ui
    },
    ...overrides
  };
};

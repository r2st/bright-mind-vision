// Simplified client-side only approach
// This version removes server-side assistant management

import { useState, useEffect } from 'react'
import Vapi from '@vapi-ai/web'

export default function VoiceHotelBookingSimple() {
  const [vapi, setVapi] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('ready')
  const [voiceMessage, setVoiceMessage] = useState('Voice assistant ready')
  const [formData, setFormData] = useState({
    destination: '',
    checkin: '',
    checkout: '',
    guests: '2',
    rooms: '1'
  })
  const [searchResults, setSearchResults] = useState([])
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  // Your pre-configured assistant ID from Vapi dashboard
  const ASSISTANT_ID = 'your-assistant-id-here' // Replace with actual ID

  useEffect(() => {
    initializeVapi()
  }, [])

  const initializeVapi = async () => {
    try {
      const publicApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY
      
      if (!publicApiKey) {
        console.error('No VAPI API key found')
        setVoiceMessage('Voice assistant not available')
        return
      }

      // Create Vapi instance with just the public key
      const vapiInstance = new Vapi(publicApiKey)
      
      // Set up event listeners
      vapiInstance.on('call-start', () => {
        console.log('Call started')
        setVoiceStatus('listening')
        setVoiceMessage('Listening...')
        setIsListening(true)
      })

      vapiInstance.on('call-end', () => {
        console.log('Call ended')
        setVoiceStatus('ready')
        setVoiceMessage('Voice assistant ready')
        setIsListening(false)
      })

      vapiInstance.on('message', (message) => {
        console.log('Vapi message:', message)
        
        if (message.type === 'transcript' && message.transcript) {
          console.log('Processing voice transcript:', message.transcript)
          processVoiceCommand(message.transcript)
        } else if (message.type === 'function-call') {
          console.log('Function call received:', message)
          handleFunctionCall(message.functionCall)
        }
      })

      vapiInstance.on('error', (error) => {
        console.error('Vapi error:', error)
        setVoiceStatus('error')
        setVoiceMessage('Voice assistant error')
        setIsListening(false)
      })

      setVapi(vapiInstance)
      setVoiceStatus('ready')
      setVoiceMessage('Voice assistant ready')
      
    } catch (error) {
      console.error('Failed to initialize Vapi:', error)
      setVoiceStatus('error')
      setVoiceMessage('Failed to initialize voice assistant')
    }
  }

  const startListening = async () => {
    if (!vapi) {
      setVoiceMessage('Voice assistant not ready')
      return
    }

    try {
      // Start with pre-configured assistant ID
      vapi.start(ASSISTANT_ID)
    } catch (error) {
      console.error('Failed to start Vapi:', error)
      setVoiceStatus('error')
      setVoiceMessage('Failed to start voice assistant')
    }
  }

  const stopListening = () => {
    if (vapi) {
      vapi.stop()
    }
  }

  const processVoiceCommand = (command) => {
    console.log('Processing voice command:', command)
    
    const lowerCommand = command.toLowerCase()
    
    // Simple hotel booking logic
    if (lowerCommand.includes('paris')) {
      fillFormFromVoice('Paris', 2)
    } else if (lowerCommand.includes('new york')) {
      fillFormFromVoice('New York', 3)
    } else if (lowerCommand.includes('london')) {
      fillFormFromVoice('London', 2)
    } else if (lowerCommand.includes('tokyo')) {
      fillFormFromVoice('Tokyo', 2)
    } else {
      setVoiceMessage(`I heard: "${command}" - Try saying a city name like Paris, New York, London, or Tokyo`)
    }
  }

  const handleFunctionCall = async (functionCall) => {
    console.log('Handling function call:', functionCall)
    
    if (functionCall.name === 'search_hotels') {
      const { destination, checkin, checkout, guests, rooms } = functionCall.parameters
      
      // Simple client-side hotel search (no server needed)
      const hotels = [
        { name: 'Grand Plaza Hotel', location: 'New York, USA', price: 250 },
        { name: 'Parisian Dreams', location: 'Paris, France', price: 180 },
        { name: 'Thames View Hotel', location: 'London, UK', price: 180 },
        { name: 'Sakura Inn', location: 'Tokyo, Japan', price: 200 }
      ]
      
      const filteredHotels = hotels.filter(hotel => 
        destination ? hotel.location.toLowerCase().includes(destination.toLowerCase()) : true
      )
      
      setSearchResults(filteredHotels)
      setVoiceMessage(`Found ${filteredHotels.length} hotels for you!`)
    }
  }

  const fillFormFromVoice = (destination, guests) => {
    setFormData(prev => ({
      ...prev,
      destination,
      guests: guests.toString()
    }))
    setVoiceMessage(`Great! I'll help you find hotels in ${destination}.`)
  }

  const toggleVoiceAssistant = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="voice-hotel-booking">
      <h1>Voice Hotel Booking - Simple Client-Side</h1>
      
      <div className="voice-controls">
        <button 
          onClick={toggleVoiceAssistant}
          className={`voice-button ${voiceStatus}`}
          disabled={voiceStatus === 'loading'}
        >
          {voiceStatus === 'loading' && 'Initializing...'}
          {voiceStatus === 'ready' && 'Start Voice Booking'}
          {voiceStatus === 'listening' && 'Listening...'}
          {voiceStatus === 'error' && 'Error - Try Again'}
        </button>
        
        <div className="voice-status">
          {voiceMessage}
        </div>
      </div>

      <div className="booking-form">
        <h2>Hotel Search</h2>
        <div className="form-group">
          <label>Destination:</label>
          <input 
            type="text" 
            value={formData.destination}
            onChange={(e) => setFormData(prev => ({...prev, destination: e.target.value}))}
            placeholder="Enter destination"
          />
        </div>
        
        <div className="form-group">
          <label>Guests:</label>
          <input 
            type="number" 
            value={formData.guests}
            onChange={(e) => setFormData(prev => ({...prev, guests: e.target.value}))}
            min="1"
          />
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Available Hotels</h3>
          {searchResults.map((hotel, index) => (
            <div key={index} className="hotel-card">
              <h4>{hotel.name}</h4>
              <p>{hotel.location}</p>
              <p>${hotel.price} per night</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

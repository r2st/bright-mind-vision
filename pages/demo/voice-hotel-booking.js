import Head from 'next/head'
import { useState, useEffect } from 'react'
import Script from 'next/script'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { default as Vapi } from '@vapi-ai/web'

export default function VoiceHotelBooking() {
  const [isListening, setIsListening] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('ready')
  const [voiceMessage, setVoiceMessage] = useState('Ready to listen')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [vapi, setVapi] = useState(null)
  const [vapiReady, setVapiReady] = useState(false)
  const [assistantId, setAssistantId] = useState(null)
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false)
  const [forceRefresh, setForceRefresh] = useState(false)
  const [formData, setFormData] = useState({
    destination: '',
    checkin: '',
    checkout: '',
    guests: '2',
    rooms: '1'
  })

  // CDN fallback functions removed - using installed npm package instead

  // Demo hotels data
  const demoHotels = [
    {
      id: '1',
      name: 'Grand Palace Hotel',
      location: 'Paris, France',
      pricePerNight: 250,
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
      checkin: '2024-01-15',
      checkout: '2024-01-17'
    },
    {
      id: '2',
      name: 'Manhattan Suites',
      location: 'New York, USA',
      pricePerNight: 320,
      amenities: ['WiFi', 'Room Service', 'Concierge', 'Business Center'],
      checkin: '2024-01-15',
      checkout: '2024-01-18'
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
      name: 'Boutique Central',
      location: 'Paris, France',
      pricePerNight: 190,
      amenities: ['WiFi', 'Breakfast', 'Bar', 'Terrace'],
      checkin: '2024-01-15',
      checkout: '2024-01-17'
    },
    {
      id: '6',
      name: 'Times Square Plaza',
      location: 'New York, USA',
      pricePerNight: 280,
      amenities: ['WiFi', 'Pool', 'Restaurant', 'Gym', 'Spa'],
      checkin: '2024-01-15',
      checkout: '2024-01-18'
    }
  ]

  // Set default dates on component mount
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    setFormData(prev => ({
      ...prev,
      checkin: tomorrow.toISOString().split('T')[0],
      checkout: dayAfter.toISOString().split('T')[0]
    }))
  }, [])

  // Initialize audio permissions and Vapi when component mounts
  useEffect(() => {
    const initializeAudioAndVapi = async () => {
      console.log('🔍 Starting audio and Vapi initialization...')
      
      try {
        // Request microphone permission and initialize audio context
        console.log('🔍 Requesting audio permissions...')
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          console.log('🔍 Microphone permission granted')
          setAudioPermissionGranted(true)
          
          // Initialize audio context to enable audio playback
          if (typeof AudioContext !== 'undefined') {
            const audioContext = new AudioContext()
            console.log('🔍 Audio context initialized:', audioContext.state)
            
            // Resume audio context if suspended
            if (audioContext.state === 'suspended') {
              await audioContext.resume()
              console.log('🔍 Audio context resumed')
            }
          }
          
          // Stop the stream as we just needed permission
          stream.getTracks().forEach(track => track.stop())
        } catch (audioError) {
          console.warn('🔍 Audio permission denied or not available:', audioError)
          setAudioPermissionGranted(false)
        }
        
        console.log('🔍 Starting Vapi initialization...')
        
        // Try client-side approach first with public key
        const publicApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || 'ef22cbd0-8219-484c-9f4e-8008a4ca43b7'
        console.log('🔍 Using public API key directly:', publicApiKey ? 'Key found' : 'No key')
        
        if (publicApiKey && publicApiKey.length > 10) {
          console.log('🔍 Creating Vapi instance with public key...')
          setVoiceMessage('Initializing voice assistant...')
          setVoiceStatus('loading')
          
          try {
            // Create Vapi instance with just the public key (as per documentation)
            const vapiInstance = new Vapi(publicApiKey)
            
            console.log('🔍 Vapi instance created with public key')
            
            // Set up event listeners
            setupVapiEventListeners(vapiInstance)
            
            setVapi(vapiInstance)
            setVapiReady(true)
            setVoiceStatus('ready')
            setVoiceMessage('Voice assistant ready')
            
            console.log('🔍 Vapi initialized successfully with public key approach')
            return
            
          } catch (clientError) {
            console.warn('🔍 Client-side approach failed:', clientError.message)
            console.log('🔍 Falling back to server-side approach...')
            
            // Continue to server-side approach
          }
        }
        
        // Fallback to server-side approach
        console.log('🔍 Fetching Vapi configuration from server...')
        setVoiceMessage('Connecting to server...')
        setVoiceStatus('loading')
        
        const response = await fetch('/api/vapi-init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        console.log('🔍 Server response status:', response.status)
        console.log('🔍 Server response ok:', response.ok)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('🔍 Server error response:', errorText)
          throw new Error(`Server error: ${response.status} - ${errorText}`)
        }
        
        const data = await response.json()
        console.log('🔍 Server response data:', data)
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to get Vapi configuration')
        }
        
        const apiKey = data.apiKey
        const receivedAssistantId = data.assistantId
        const assistantName = data.assistantName
        console.log('🔍 Vapi API key received from server:', apiKey ? 'Key found' : 'No key')
        console.log('🔍 Assistant ID received from server:', receivedAssistantId ? 'ID found' : 'No ID')
        console.log('🔍 Assistant Name received from server:', assistantName || 'No name')
        console.log('🔍 API key length:', apiKey ? apiKey.length : 0)
        
        // Set the assistant ID in state
        setAssistantId(receivedAssistantId)
        
        if (!apiKey || apiKey.length < 10) {
          throw new Error('Invalid API key from server')
        }
        
        console.log('🔍 Creating Vapi instance...')
        
        // Try different Vapi initialization approaches
        let vapiInstance = null
        
        try {
          // Approach 1: Try with just API key first (simplest approach)
          console.log('🔍 Trying simple Vapi constructor with just API key...')
          vapiInstance = new Vapi(apiKey)
          console.log('🔍 Vapi instance created with just API key')
        } catch (error1) {
          console.warn('🔍 Simple constructor failed:', error1.message)
          
          try {
            // Approach 2: Try with assistantId if available
            if (receivedAssistantId) {
              console.log('🔍 Trying Vapi constructor with assistantId:', receivedAssistantId)
              vapiInstance = new Vapi({
                apiKey: apiKey,
                assistantId: receivedAssistantId
              })
              console.log('🔍 Vapi instance created with assistantId')
            } else {
              // Approach 3: Try with object format
              console.log('🔍 Trying Vapi constructor with object format...')
              vapiInstance = new Vapi({
                apiKey: apiKey
              })
              console.log('🔍 Vapi instance created with object format')
            }
          } catch (error2) {
            console.warn('🔍 Object format failed:', error2.message)
            
            // Approach 4: Try with assistant configuration
            try {
              console.log('🔍 Trying Vapi constructor with assistant...')
              vapiInstance = new Vapi({
                apiKey: apiKey,
                assistant: {
                  name: assistantName || "Hotel Booking Assistant",
                  model: {
                    provider: "openai",
                    model: "gpt-3.5-turbo",
                    messages: [{
                      role: "system",
                      content: `You are ${assistantName || "a helpful hotel booking assistant"} for LuxuryStay. You help users find and book hotels by understanding their requirements like destination, dates, guests, and rooms. Keep responses concise and friendly.`
                    }]
                  },
                  voice: {
                    provider: "11labs",
                    voiceId: "shimmer"
                  },
                  firstMessage: `Hi! I'm ${assistantName || "your hotel booking assistant"}. How can I help you find the perfect stay today?`,
                  endCallMessage: "Thank you for using LuxuryStay! Have a great day!",
                  endCallPhrases: ["goodbye", "bye", "end call", "hang up", "thank you"],
                  backgroundSound: "off"
                }
              })
              console.log('🔍 Vapi instance created with assistant')
            } catch (error3) {
              console.error('🔍 All Vapi initialization attempts failed:', error3.message)
              throw new Error('Failed to initialize Vapi with any configuration method')
            }
          }
        }
        
        if (!vapiInstance) {
          throw new Error('Vapi instance is null')
        }
        
        // Debug: Log the Vapi instance to see its structure
        console.log('🔍 Vapi instance created:', vapiInstance)
        console.log('🔍 Vapi instance methods:', Object.getOwnPropertyNames(vapiInstance))
        console.log('🔍 Vapi instance prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(vapiInstance)))
        
        // Since API calls are getting 401 Unauthorized, let's try a different approach
        console.log('🔍 API calls getting 401 Unauthorized, trying Web SDK approach...')
        
        // Try to use the Web SDK's built-in methods to configure the assistant
        try {
          console.log('🔍 Attempting to configure assistant using Web SDK methods...')
          
          // Check if there are any methods to configure the assistant
          const availableMethods = Object.getOwnPropertyNames(vapiInstance)
          const prototypeMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(vapiInstance))
          console.log('🔍 Available instance methods:', availableMethods)
          console.log('🔍 Available prototype methods:', prototypeMethods)
          
          // Try to set assistant configuration directly on the instance
          if (typeof vapiInstance.setAssistant === 'function') {
            console.log('🔍 Trying vapiInstance.setAssistant()...')
            vapiInstance.setAssistant({
              model: {
                provider: "openai",
                model: "gpt-3.5-turbo",
                messages: [{
                  role: "system",
                  content: "You are a helpful hotel booking assistant for LuxuryStay."
                }]
              }
            })
            console.log('🔍 Assistant configured via setAssistant method')
          } else if (typeof vapiInstance.configure === 'function') {
            console.log('🔍 Trying vapiInstance.configure()...')
            vapiInstance.configure({
              assistant: {
                model: {
                  provider: "openai",
                  model: "gpt-3.5-turbo",
                  messages: [{
                    role: "system",
                    content: "You are a helpful hotel booking assistant for LuxuryStay."
                  }]
                }
              }
            })
            console.log('🔍 Assistant configured via configure method')
          } else {
            console.log('🔍 No direct configuration methods found, will try during start call')
          }
        } catch (configError) {
          console.warn('🔍 Web SDK configuration failed:', configError.message)
        }
        
        // Set up event listeners
        vapiInstance.on('call-start', () => {
          console.log('Vapi call started')
          setVoiceStatus('listening')
          setVoiceMessage('Listening...')
          setIsListening(true)
        })

        vapiInstance.on('call-end', () => {
          console.log('Vapi call ended')
          setVoiceStatus('ready')
          setVoiceMessage('Ready to listen')
          setIsListening(false)
        })

        vapiInstance.on('speech-start', () => {
          console.log('User started speaking')
          setVoiceStatus('listening')
          setVoiceMessage('Listening...')
        })

        vapiInstance.on('speech-end', () => {
          console.log('User stopped speaking')
          setVoiceStatus('processing')
          setVoiceMessage('Processing...')
        })

        vapiInstance.on('message', (message) => {
          console.log('Vapi message:', message)
          if (message.type === 'transcript' && message.transcript) {
            console.log('Processing voice transcript:', message.transcript)
            processVoiceCommand(message.transcript)
          } else if (message.type === 'function-call') {
            console.log('Function call received:', message)
            handleFunctionCall(message.functionCall)
          } else if (message.type === 'assistant-message') {
            console.log('Assistant response:', message.message)
            // Update UI with assistant response
            setVoiceMessage(`Assistant: ${message.message}`)
          }
        })

        vapiInstance.on('error', (error) => {
          console.error('Vapi error:', error)
          setVoiceStatus('error')
          setVoiceMessage('Voice error - try again')
          setIsListening(false)
        })

        setVapi(vapiInstance)
        setVapiReady(true)
        setVoiceMessage('Voice assistant ready!')
        setVoiceStatus('ready')
        console.log('Vapi initialized successfully')
      } catch (error) {
        console.error('🔍 Failed to initialize Vapi:', error)
        console.error('🔍 Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        
        // Enable fallback mode for testing
        console.log('🔍 Enabling fallback mode for voice functionality')
        setVoiceStatus('ready')
        setVoiceMessage('Voice assistant ready (demo mode)')
        setVapiReady(true)
        setVapi(null) // No real Vapi instance
      }
    }

    // Initialize Vapi immediately since we have the package installed
    console.log('🔍 Initializing Vapi with installed package...')
    initializeAudioAndVapi()
  }, [])

  // Add user interaction handler to resume audio context
  useEffect(() => {
    const handleUserInteraction = async () => {
      try {
        if (typeof AudioContext !== 'undefined') {
          const audioContext = new AudioContext()
          if (audioContext.state === 'suspended') {
            await audioContext.resume()
            console.log('🔍 Audio context resumed on user interaction')
          }
        }
      } catch (error) {
        console.warn('🔍 Could not resume audio context on interaction:', error)
      }
    }

    // Add event listeners for user interactions
    const events = ['click', 'touchstart', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const toggleVoiceAssistant = () => {
    if (!vapiReady) {
      setVoiceMessage('Voice assistant loading...')
      return
    }

    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const forceRefreshAssistant = async () => {
    console.log('🔄 Force refreshing assistant...')
    setForceRefresh(true)
    setAssistantId(null)
    setVapiReady(false)
    setVoiceStatus('loading')
    setVoiceMessage('Refreshing assistant...')
    
    // Wait a moment then reinitialize
    setTimeout(() => {
      initializeVapi()
      setForceRefresh(false)
    }, 1000)
  }

  const startListening = async () => {
    if (!vapi && !vapiReady) {
      setVoiceMessage('Voice assistant not ready')
      return
    }

    // Ensure audio context is resumed for audio playback
    try {
      if (typeof AudioContext !== 'undefined') {
        const audioContext = new AudioContext()
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
          console.log('🔍 Audio context resumed for playback')
        }
      }
    } catch (audioError) {
      console.warn('🔍 Could not resume audio context:', audioError)
    }

    try {
      if (vapi) {
        console.log('🔍 About to start Vapi call...')
        console.log('🔍 Vapi instance:', vapi)
        console.log('🔍 Vapi start method:', typeof vapi.start)
        
        // Try to start the call with assistant ID
        try {
          if (assistantId) {
            // Use assistant ID if available (from server-side)
            console.log('🔍 Starting Vapi with assistant ID:', assistantId)
            console.log('🔍 Assistant name:', assistantName)
            vapi.start(assistantId)
            setVoiceStatus('listening')
            setVoiceMessage('Listening...')
            setIsListening(true)
          } else {
            // If no assistant ID, try to get it from server
            console.log('🔍 No assistant ID, fetching from server...')
            const response = await fetch('/api/vapi-init', { 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            })
            const data = await response.json()
            
            console.log('🔍 Server response:', data)
            
            if (data.success && data.assistantId) {
              console.log('🔍 Got assistant ID from server:', data.assistantId)
              console.log('🔍 Assistant name from server:', data.assistantName)
              vapi.start(data.assistantId)
              setVoiceStatus('listening')
              setVoiceMessage('Listening...')
              setIsListening(true)
            } else {
              throw new Error('No assistant ID available')
            }
          }
        } catch (startError) {
          console.warn('🔍 Vapi start failed:', startError.message)
          
          // If all Vapi methods fail, enable fallback mode
          console.log('🔍 Vapi failed, enabling demo mode...')
          setVoiceStatus('ready')
          setVoiceMessage('Voice assistant ready (demo mode)')
          setVapiReady(true)
          setVapi(null)
          
          // Don't throw error, just fall back to demo mode
          return
        }
      } else {
        // Demo mode - simulate voice recognition
        setVoiceStatus('listening')
        setVoiceMessage('Listening... (demo mode)')
        setIsListening(true)
        
        // Simulate voice command after 2 seconds
        setTimeout(() => {
          const randomCommands = [
            'I need hotels in Paris for 2 guests',
            'Find hotels in New York',
            'Search for hotels in London',
            'Book a hotel in Tokyo',
            'I want to stay in Sydney'
          ]
          const randomCommand = randomCommands[Math.floor(Math.random() * randomCommands.length)]
          setVoiceMessage(`Demo: "${randomCommand}"`)
          processVoiceCommand(randomCommand)
        }, 2000)
      }
    } catch (error) {
      console.error('🔍 Vapi error:', error)
      setVoiceStatus('error')
      setVoiceMessage('Voice assistant error')
      setIsListening(false)
    }
  }

  const stopListening = () => {
    try {
      if (vapi) {
        vapi.stop()
      }
      setVoiceStatus('ready')
      setVoiceMessage(vapi ? 'Ready to listen' : 'Ready to listen (demo mode)')
      setIsListening(false)
    } catch (error) {
      console.error('Failed to stop Vapi:', error)
      setVoiceStatus('ready')
      setVoiceMessage('Ready to listen (demo mode)')
      setIsListening(false)
    }
  }

  const processVoiceCommand = (command) => {
    console.log('Processing voice command:', command)
    
    const lowerCommand = command.toLowerCase()
    
    // Check if the command is about medical appointments (this shouldn't happen with our hotel assistant)
    if (lowerCommand.includes('doctor') || lowerCommand.includes('medical') || lowerCommand.includes('appointment') || lowerCommand.includes('health') || lowerCommand.includes('clinic') || lowerCommand.includes('hospital')) {
      setVoiceMessage("I'm sorry, I'm a hotel booking assistant, not a medical assistant. I can help you find hotels for your travel needs. What destination are you interested in?")
      setTimeout(() => {
        setVoiceMessage('Ready to listen')
      }, 4000)
      return
    }
    
    // Enhanced command parsing for better recognition - HOTEL BOOKINGS ONLY
    if (lowerCommand.includes('paris') || lowerCommand.includes('france')) {
      fillFormFromVoice('Paris', 2)
    } else if (lowerCommand.includes('new york') || lowerCommand.includes('manhattan')) {
      fillFormFromVoice('New York', 3)
    } else if (lowerCommand.includes('london') || lowerCommand.includes('england') || lowerCommand.includes('uk')) {
      fillFormFromVoice('London', 2)
    } else if (lowerCommand.includes('tokyo') || lowerCommand.includes('japan')) {
      fillFormFromVoice('Tokyo', 2)
    } else if (lowerCommand.includes('sydney') || lowerCommand.includes('australia')) {
      fillFormFromVoice('Sydney', 2)
    } else if (lowerCommand.includes('book') || lowerCommand.includes('find') || lowerCommand.includes('search') || lowerCommand.includes('hotel')) {
      // Generic booking command - show current form
      setVoiceMessage(`I heard: "${command}" - I can help you find hotels! Please specify a city like Paris, New York, London, Tokyo, or Sydney`)
      setTimeout(() => {
        setVoiceMessage('Ready to listen')
      }, 4000)
    } else {
      // Unknown command - redirect to hotel booking
      setVoiceMessage(`I heard: "${command}" - I'm Riley, your hotel booking assistant! Try saying a city name like Paris, New York, London, Tokyo, or Sydney`)
      setTimeout(() => {
        setVoiceMessage('Ready to listen')
      }, 4000)
    }
    
    showVoiceFeedback(command)
  }

  const setupVapiEventListeners = (vapiInstance) => {
    // Set up event listeners
    vapiInstance.on('call-start', () => {
      console.log('🔍 Call started')
      setVoiceStatus('listening')
      setVoiceMessage('Call started - listening...')
    })
    
    vapiInstance.on('call-end', () => {
      console.log('🔍 Call ended')
      setVoiceStatus('ready')
      setVoiceMessage('Call ended - ready to listen')
      setIsListening(false)
    })
    
    vapiInstance.on('speech-start', () => {
      console.log('🔍 Speech started')
      setVoiceStatus('speaking')
      setVoiceMessage('Assistant is speaking...')
    })
    
    vapiInstance.on('speech-end', () => {
      console.log('🔍 Speech ended')
      setVoiceStatus('listening')
      setVoiceMessage('Listening...')
    })
    
    vapiInstance.on('message', (message) => {
      console.log('🔍 Vapi message:', message)
      
      if (message.type === 'transcript' && message.transcript) {
        console.log('🔍 Processing voice transcript:', message.transcript)
        processVoiceCommand(message.transcript)
      } else if (message.type === 'function-call') {
        console.log('🔍 Function call received:', message)
        handleFunctionCall(message.functionCall)
      } else if (message.type === 'assistant-message') {
        console.log('🔍 Assistant response:', message.message)
        setVoiceMessage(`Assistant: ${message.message}`)
      }
    })
    
    vapiInstance.on('error', (error) => {
      console.error('🔍 Vapi error:', error)
      setVoiceStatus('error')
      setVoiceMessage('Voice assistant error')
      setIsListening(false)
    })
  }

  const handleFunctionCall = async (functionCall) => {
    console.log('🔍 Handling function call:', functionCall)
    
    if (functionCall.name === 'search_hotels') {
      const { destination, checkin, checkout, guests, rooms } = functionCall.parameters
      console.log('🔍 Searching hotels with params:', { destination, checkin, checkout, guests, rooms })
      
      // Update form data with the parameters from voice
      setFormData(prev => ({
        ...prev,
        destination: destination || prev.destination,
        checkin: checkin || prev.checkin,
        checkout: checkout || prev.checkout,
        guests: guests || prev.guests,
        rooms: rooms || prev.rooms
      }))
      
      // Perform the search
      performSearch()
      
      // Update voice message to confirm hotel search
      setVoiceMessage(`Searching for hotels in ${destination || 'your selected destination'}...`)
      
      // Return success response
      return {
        result: `I found hotels for ${destination || 'your destination'}. Check the results below!`
      }
    } else {
      // Handle other function calls (like wellness partners)
      console.log('🔍 Unknown function call received:', functionCall.name)
      setVoiceMessage("I'm a hotel booking assistant. I can only help you find and book hotels. Please ask me about hotels in specific destinations.")
      
      return {
        result: "I'm a hotel booking assistant. I can only help you find and book hotels. Please ask me about hotels in specific destinations."
      }
    }
    
    return { result: 'Function call handled' }
  }

  const fillFormFromVoice = (destination, nights) => {
    setFormData(prev => ({
      ...prev,
      destination: destination
    }))
    
    const checkin = new Date()
    checkin.setDate(checkin.getDate() + 1)
    const checkout = new Date(checkin)
    checkout.setDate(checkout.getDate() + nights)
    
    setFormData(prev => ({
      ...prev,
      checkin: checkin.toISOString().split('T')[0],
      checkout: checkout.toISOString().split('T')[0]
    }))
    
    // Auto-search after filling form
    setTimeout(() => {
      handleSearch()
    }, 1000)
  }

  const showVoiceFeedback = (command) => {
    setVoiceMessage(`Heard: "${command}"`)
    setVoiceStatus('success')
    
    setTimeout(() => {
      setVoiceStatus('ready')
      setVoiceMessage('Ready to listen')
    }, 3000)
  }

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    
    console.log('Searching with params:', formData)
    
    setIsLoading(true)
    setShowResults(true)
    
    setTimeout(() => {
      const filteredHotels = filterHotels(formData)
      setSearchResults(filteredHotels)
      setIsLoading(false)
    }, 1500)
  }

  const filterHotels = (searchParams) => {
    return demoHotels.filter(hotel => {
      const destinationMatch = hotel.location.toLowerCase().includes(searchParams.destination.toLowerCase())
      return destinationMatch
    })
  }

  const calculateNights = (checkin, checkout) => {
    const checkinDate = new Date(checkin)
    const checkoutDate = new Date(checkout)
    const diffTime = Math.abs(checkoutDate - checkinDate)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const selectHotel = (hotelId) => {
    const hotel = demoHotels.find(h => h.id === hotelId)
    setSelectedHotel(hotel)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedHotel(null)
  }

  const confirmBooking = (e) => {
    e.preventDefault()
    console.log('Booking confirmed:', selectedHotel)
    setShowModal(false)
    setShowConfirmation(true)
  }

  const resetApp = () => {
    setShowConfirmation(false)
    setShowResults(false)
    setSearchResults([])
    setFormData({
      destination: '',
      checkin: '',
      checkout: '',
      guests: '2',
      rooms: '1'
    })
    setSelectedHotel(null)
    
    // Reset dates
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    setFormData(prev => ({
      ...prev,
      checkin: tomorrow.toISOString().split('T')[0],
      checkout: dayAfter.toISOString().split('T')[0]
    }))
  }

  const getVoiceButtonStyle = () => {
    let background = '#4ecdc4'
    let cursor = 'pointer'
    let opacity = 1
    
    if (voiceStatus === 'loading') {
      background = '#ffa726'
      cursor = 'wait'
    } else if (!vapiReady) {
      background = '#ccc'
      cursor = 'not-allowed'
      opacity = 0.6
    } else if (isListening) {
      background = '#ff6b6b'
    } else if (voiceStatus === 'error') {
      background = '#ff4757'
    }
    
    return {
      background,
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '25px',
      cursor,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      opacity
    }
  }

  const getVoiceStatusStyle = () => {
    let background = '#667eea'
    
    if (voiceStatus === 'loading') {
      background = '#ffa726'
    } else if (voiceStatus === 'listening') {
      background = '#ff6b6b'
    } else if (voiceStatus === 'processing') {
      background = '#ffa726'
    } else if (voiceStatus === 'success') {
      background = '#4ecdc4'
    } else if (voiceStatus === 'error') {
      background = '#ff4757'
    } else if (!vapiReady) {
      background = '#ccc'
    }
    
    return {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      marginTop: '8px',
      textAlign: 'center',
      background,
      color: 'white'
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Voice Hotel Booking Demo - Bright Mind Vision</title>
        <meta name="description" content="Experience AI-powered voice hotel booking with our interactive demo featuring Vapi.ai integration." />
        <meta name="keywords" content="voice booking, AI hotel booking, Vapi.ai, voice assistant, hotel demo" />
      </Head>

      <Header />

      <main style={{ paddingTop: '120px', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 0',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          margin: '20px 0',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '1200px',
          margin: '20px auto',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-hotel" style={{ fontSize: '2rem', color: '#667eea' }}></i>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#333', margin: 0 }}>LuxuryStay</h1>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={toggleVoiceAssistant}
              style={getVoiceButtonStyle()}
              disabled={!vapiReady || voiceStatus === 'loading'}
            >
              <i className="fas fa-microphone"></i>
              <span>Voice Booking</span>
            </button>
            
            <button 
              onClick={forceRefreshAssistant}
              style={{
                marginLeft: '10px',
                padding: '10px 15px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              disabled={voiceStatus === 'loading'}
            >
              <i className="fas fa-refresh"></i>
              <span>Refresh Assistant</span>
            </button>
            
            <div style={getVoiceStatusStyle()}>
              {voiceMessage}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: '700' }}>Book Your Perfect Stay</h2>
          <p style={{ fontSize: '1.2rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
            Experience luxury with our AI-powered booking system. Use voice commands or traditional booking - your choice!
          </p>
        </section>

        {/* Booking Form */}
        <section style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '40px',
            alignItems: 'start'
          }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#333' }}>Search Hotels</h3>
              <form onSubmit={handleSearch}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Destination</label>
                    <input 
                      type="text" 
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="Where are you going?" 
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Check-in Date</label>
                    <input 
                      type="date" 
                      name="checkin"
                      value={formData.checkin}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Check-out Date</label>
                    <input 
                      type="date" 
                      name="checkout"
                      value={formData.checkout}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Guests</label>
                    <select 
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease'
                      }}
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="5+">5+ Guests</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Rooms</label>
                    <select 
                      name="rooms"
                      value={formData.rooms}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease'
                      }}
                    >
                      <option value="1">1 Room</option>
                      <option value="2">2 Rooms</option>
                      <option value="3">3 Rooms</option>
                      <option value="4">4 Rooms</option>
                    </select>
                  </div>
                  <div>
                    <button 
                      type="submit"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <i className="fas fa-search"></i>
                      Search Hotels
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Voice Commands Help */}
            <div style={{
              background: 'rgba(102, 126, 234, 0.1)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <h4 style={{ color: '#667eea', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-microphone-alt"></i>
                Voice Commands
              </h4>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '15px', color: '#4a5568' }}><strong>Try saying:</strong></p>
                <ul style={{ listStyle: 'none', padding: 0, color: '#4a5568' }}>
                  <li style={{ marginBottom: '8px', padding: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
                    "Book a hotel in Paris for 2 nights"
                  </li>
                  <li style={{ marginBottom: '8px', padding: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
                    "Find rooms in New York from December 15th to 18th"
                  </li>
                  <li style={{ marginBottom: '8px', padding: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
                    "I need 2 rooms for 4 guests in London"
                  </li>
                  <li style={{ marginBottom: '8px', padding: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
                    "Show me hotels in Tokyo for next weekend"
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Search Results */}
        {showResults && (
          <section style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '0 20px',
            marginBottom: '40px'
          }}>
            <h3 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '30px', textAlign: 'center' }}>Available Hotels</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px'
            }}>
              {isLoading ? (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '40px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '20px'
                }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#667eea', marginBottom: '20px' }}></i>
                  <p style={{ color: '#4a5568', fontSize: '1.1rem' }}>Searching for the best hotels...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '40px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '20px'
                }}>
                  <i className="fas fa-search" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '20px' }}></i>
                  <h3 style={{ color: '#666', marginBottom: '10px' }}>No hotels found</h3>
                  <p style={{ color: '#999' }}>Try adjusting your search criteria</p>
                </div>
              ) : (
                searchResults.map(hotel => {
                  const nights = calculateNights(formData.checkin, formData.checkout)
                  const totalPrice = hotel.pricePerNight * nights
                  
                  return (
                    <div key={hotel.id} style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '20px',
                      padding: '30px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <i className="fas fa-hotel" style={{ fontSize: '3rem', color: '#667eea' }}></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#333' }}>{hotel.name}</h4>
                        <p style={{ color: '#666', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fas fa-map-marker-alt"></i>
                          {hotel.location}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                          {hotel.amenities.map(amenity => (
                            <span key={amenity} style={{
                              background: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {amenity}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <div>
                            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#333' }}>${totalPrice}</span>
                            <span style={{ color: '#666', marginLeft: '8px' }}>for {nights} night{nights > 1 ? 's' : ''}</span>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            ${hotel.pricePerNight}/night
                          </div>
                        </div>
                        <button 
                          onClick={() => selectHotel(hotel.id)}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease'
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        )}

        {/* Booking Modal */}
        {showModal && selectedHotel && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '500px',
              width: '100%',
              position: 'relative',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <button 
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#333' }}>Complete Your Booking</h3>
              <form onSubmit={confirmBooking}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Full Name</label>
                  <input 
                    type="text" 
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Email</label>
                  <input 
                    type="email" 
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Special Requests</label>
                  <textarea 
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Booking
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {showConfirmation && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              maxWidth: '400px',
              width: '100%'
            }}>
              <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#4ecdc4', marginBottom: '20px' }}></i>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Booking Confirmed!</h3>
              <p style={{ color: '#666', marginBottom: '30px' }}>Your reservation has been successfully created.</p>
              <button 
                onClick={resetApp}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Make Another Booking
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Vapi SDK is now installed as npm package - no CDN needed */}

      <style jsx global>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
        }
        
        .container {
          min-height: 100vh;
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #667eea !important;
        }
        
        button:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}

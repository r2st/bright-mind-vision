import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Vapi from '@vapi-ai/web';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Contact from '../../components/Contact';
import Calendar from '../../components/Calendar';

const VoiceWellnessPartners = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('Click to start voice assistant');
  const [voiceStatus, setVoiceStatus] = useState('ready'); // 'ready', 'loading', 'listening', 'speaking', 'error'
  const [vapi, setVapi] = useState(null);
  const [vapiReady, setVapiReady] = useState(false);
  const [assistantId, setAssistantId] = useState(null);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [assistantIdLoaded, setAssistantIdLoaded] = useState(false);

  const audioContextRef = useRef(null);
  const assistantIdRef = useRef(null);
  const lastAssistantIdRef = useRef(null);

  // Local storage utilities
  const STORAGE_KEYS = {
    ASSISTANT_ID: 'vapi_wellness_assistant_id',
    ASSISTANT_TIMESTAMP: 'vapi_wellness_assistant_timestamp'
  };

  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  const getCachedAssistantId = useCallback(() => {
    try {
      const cachedId = localStorage.getItem(STORAGE_KEYS.ASSISTANT_ID);
      const timestamp = localStorage.getItem(STORAGE_KEYS.ASSISTANT_TIMESTAMP);
      
      if (cachedId && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_DURATION) {
          console.log('🔍 Using cached assistant ID:', cachedId);
          return cachedId;
        } else {
          console.log('🔍 Cached assistant ID expired, clearing cache');
          localStorage.removeItem(STORAGE_KEYS.ASSISTANT_ID);
          localStorage.removeItem(STORAGE_KEYS.ASSISTANT_TIMESTAMP);
        }
      }
    } catch (error) {
      console.warn('🔍 Failed to read from localStorage:', error);
    }
    return null;
  }, []);

  const cacheAssistantId = useCallback((assistantId) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSISTANT_ID, assistantId);
      localStorage.setItem(STORAGE_KEYS.ASSISTANT_TIMESTAMP, Date.now().toString());
      console.log('🔍 Cached assistant ID:', assistantId);
    } catch (error) {
      console.warn('🔍 Failed to cache assistant ID:', error);
    }
  }, []);


  // Pre-load assistant ID with caching
  const preloadAssistantId = useCallback(async () => {
    if (assistantIdRef.current) return; // Already loaded
    
    // First, try to use cached assistant ID
    const cachedId = getCachedAssistantId();
    if (cachedId) {
      assistantIdRef.current = cachedId;
      setAssistantId(cachedId);
      setAssistantIdLoaded(true);
      lastAssistantIdRef.current = cachedId;
      console.log('🔍 Using cached assistant ID for instant start');
      return;
    }

    // If no cache, try to fetch from server
    try {
      console.log('🔍 Fetching fresh assistant ID from server...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced to 3 seconds for faster fallback
      
      const response = await fetch('/api/vapi-init', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data.success && data.assistantId) {
        assistantIdRef.current = data.assistantId;
        setAssistantId(data.assistantId);
        setAssistantIdLoaded(true);
        lastAssistantIdRef.current = data.assistantId;
        cacheAssistantId(data.assistantId);
        console.log('🔍 Fresh assistant ID loaded and cached:', data.assistantId);
      } else {
        throw new Error('No assistant ID in response');
      }
    } catch (error) {
      console.warn('🔍 Failed to fetch assistant ID:', error);
      
      // Use last known assistant ID if available
      if (lastAssistantIdRef.current) {
        assistantIdRef.current = lastAssistantIdRef.current;
        setAssistantId(lastAssistantIdRef.current);
        setAssistantIdLoaded(true);
        console.log('🔍 Using last known assistant ID:', lastAssistantIdRef.current);
      } else {
        console.log('🔍 No assistant ID available, will use demo mode');
      }
    }
  }, [getCachedAssistantId, cacheAssistantId]);

  // Initialize Vapi SDK with optimizations
  const initializeVapi = useCallback(async () => {
    console.log('🔍 Initializing Vapi...');
    setVoiceStatus('loading');
    setVoiceMessage('Loading voice assistant...');

    // Run microphone permission and Vapi initialization in parallel
    const [audioResult, vapiResult] = await Promise.allSettled([
      // Request microphone permission
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        stream.getTracks().forEach(track => track.stop());
        setAudioPermissionGranted(true);
        console.log('🔍 Audio permission granted.');
        return true;
      }).catch(audioError => {
        console.warn('🔍 Audio permission denied or not available:', audioError);
        setAudioPermissionGranted(false);
        setVoiceMessage('Microphone access denied. Voice assistant disabled.');
        setVoiceStatus('error');
        return false;
      }),
      
      // Initialize Vapi with timeout and fallback
      (async () => {
        const publicApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || 'YOUR_DEFAULT_VAPI_PUBLIC_KEY';
        
        if (publicApiKey && publicApiKey.length > 10) {
          console.log('🔍 Creating Vapi instance with public key...');
          try {
            // Add timeout to Vapi initialization
            const initPromise = new Promise((resolve, reject) => {
              try {
                const vapiInstance = new Vapi(publicApiKey);
                setupVapiEventListeners(vapiInstance);
                setVapi(vapiInstance);
                resolve(vapiInstance);
              } catch (error) {
                reject(error);
              }
            });

            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Vapi initialization timeout')), 5000); // 5 second timeout for faster fallback
            });

            const vapiInstance = await Promise.race([initPromise, timeoutPromise]);
            console.log('🔍 Vapi instance created successfully');
            return vapiInstance;
          } catch (clientError) {
            console.warn('🔍 Client-side Vapi initialization failed:', clientError.message);
            return null;
          }
        } else {
          console.warn('🔍 No Vapi public API key configured.');
          return null;
        }
      })()
    ]);

    // Handle results
    const audioGranted = audioResult.status === 'fulfilled' && audioResult.value;
    const vapiInstance = vapiResult.status === 'fulfilled' ? vapiResult.value : null;

    if (audioGranted && vapiInstance) {
      setVapiReady(true);
      setVoiceStatus('ready');
      setVoiceMessage('Voice assistant ready');
    } else if (audioGranted) {
      setVapiReady(true);
      setVapi(null);
      setVoiceStatus('ready');
      setVoiceMessage('Voice assistant ready (demo mode)');
    } else {
      setVoiceStatus('error');
      setVoiceMessage('Voice assistant not available');
    }

    // Pre-load assistant ID in background (non-blocking)
    preloadAssistantId().catch(error => {
      console.warn('🔍 Background assistant ID loading failed:', error);
    });
  }, [preloadAssistantId]);

  useEffect(() => {
    initializeVapi();
  }, [initializeVapi]);

  // Resume AudioContext on user interaction
  useEffect(() => {
    const resumeAudioContext = async () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
          console.log('🔍 Audio context resumed on user interaction.');
        } catch (error) {
          console.warn('🔍 Could not resume audio context on interaction:', error);
        }
      }
    };

    document.addEventListener('click', resumeAudioContext);
    document.addEventListener('touchstart', resumeAudioContext);
    document.addEventListener('keydown', resumeAudioContext);

    return () => {
      document.removeEventListener('click', resumeAudioContext);
      document.removeEventListener('touchstart', resumeAudioContext);
      document.removeEventListener('keydown', resumeAudioContext);
    };
  }, []);

  const setupVapiEventListeners = useCallback((vapiInstance) => {
    vapiInstance.on('call-start', () => {
      console.log('🔍 Call started');
      setVoiceStatus('listening');
      setVoiceMessage('Listening...');
      setIsListening(true);
    });

    vapiInstance.on('call-end', () => {
      console.log('🔍 Call ended');
      setVoiceStatus('ready');
      setVoiceMessage('Voice assistant ready');
      setIsListening(false);
    });

    vapiInstance.on('speech-start', () => {
      console.log('🔍 Speech started');
      setVoiceStatus('speaking');
    });

    vapiInstance.on('speech-end', () => {
      console.log('🔍 Speech ended');
      setVoiceStatus('listening');
    });

    vapiInstance.on('volume-level', (volume) => {
      // console.log('🔍 Volume level:', volume);
    });

    vapiInstance.on('message', (message) => {
      console.log('🔍 Vapi message:', message);
      
      if (message.type === 'transcript' && message.transcript) {
        console.log('🔍 Processing voice transcript:', message.transcript);
        processVoiceCommand(message.transcript);
      } else if (message.type === 'function-call') {
        console.log('🔍 Function call received:', message);
        handleFunctionCall(message.functionCall);
      } else if (message.type === 'assistant-message') {
        console.log('🔍 Assistant response:', message.message);
        setVoiceMessage(`Assistant: ${message.message}`);
      }
    });
    
    vapiInstance.on('error', (error) => {
      console.error('🔍 Vapi error:', error);
      setVoiceStatus('error');
      setVoiceMessage('Voice assistant error');
      setIsListening(false);
    });
  }, []);

  const startListening = async () => {
    if (!vapi && !vapiReady) {
      setVoiceMessage('Voice assistant not ready');
      return;
    }

    // Pre-initialize audio context for faster startup
    if (!audioContextRef.current && typeof AudioContext !== 'undefined') {
      audioContextRef.current = new AudioContext();
    }

    // Ensure audio context is resumed for audio playback
    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('🔍 Audio context resumed for playback');
      }
    } catch (audioError) {
      console.warn('🔍 Could not resume audio context:', audioError);
    }

    try {
      if (vapi) {
        console.log('🔍 Starting Vapi call...');
        
        // Use pre-loaded assistant ID for faster startup
        if (assistantIdRef.current) {
          console.log('🔍 Using pre-loaded assistant ID:', assistantIdRef.current);
          vapi.start(assistantIdRef.current);
          setVoiceStatus('listening');
          setVoiceMessage('Listening...');
          setIsListening(true);
        } else {
          // Try using cached assistant ID first
          const cachedId = getCachedAssistantId();
          if (cachedId) {
            console.log('🔍 Using cached assistant ID:', cachedId);
            assistantIdRef.current = cachedId;
            vapi.start(cachedId);
            setVoiceStatus('listening');
            setVoiceMessage('Listening...');
            setIsListening(true);
          } else {
            // Try using the public key directly (no server call)
            console.log('🔍 No assistant ID, trying public key directly...');
            try {
              vapi.start();
              setVoiceStatus('listening');
              setVoiceMessage('Listening...');
              setIsListening(true);
            } catch (directStartError) {
              console.log('🔍 Direct start failed, using demo mode...');
              startDemoMode();
            }
          }
        }
      } else {
        // Demo mode - simulate voice recognition
        startDemoMode();
      }
    } catch (error) {
      console.error('🔍 Vapi error:', error);
      setVoiceStatus('error');
      setVoiceMessage('Voice assistant error');
      setIsListening(false);
    }
  };

  const startDemoMode = () => {
    setVoiceStatus('listening');
    setVoiceMessage('Listening... (demo mode)');
    setIsListening(true);
    
    // Simulate voice command after 0.8 seconds (much faster)
    setTimeout(() => {
      const randomCommands = [
        'I need a massage therapist',
        'Find yoga classes near me',
        'Book nutrition consultation',
        'Schedule personal training session',
        'I want to book a wellness appointment',
        'Can you help me find a personal trainer?',
        'I need a nutritionist consultation'
      ];
      const randomCommand = randomCommands[Math.floor(Math.random() * randomCommands.length)];
      setVoiceMessage(`Demo: "${randomCommand}"`);
      processVoiceCommand(randomCommand);
    }, 800); // Reduced from 1200ms to 800ms for faster response
  };


  const stopListening = () => {
    try {
      if (vapi) {
        vapi.stop();
        console.log('🔍 Vapi stopped');
      }
      setVoiceStatus('ready');
      setVoiceMessage(vapi ? 'Ready to listen' : 'Ready to listen (demo mode)');
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop Vapi:', error);
      setVoiceStatus('ready');
    }
  };

  const toggleVoiceAssistant = () => {
    if (!vapiReady) {
      setVoiceMessage('Voice assistant loading...');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const processVoiceCommand = (command) => {
    console.log('Processing voice command:', command);
    const lowerCommand = command.toLowerCase();

    // Simulate processing for wellness services
    if (lowerCommand.includes('massage')) {
      showWellnessResults('Massage Therapy');
    } else if (lowerCommand.includes('yoga')) {
      showWellnessResults('Yoga & Meditation');
    } else if (lowerCommand.includes('nutrition')) {
      showWellnessResults('Nutrition Counseling');
    } else if (lowerCommand.includes('trainer') || lowerCommand.includes('personal training')) {
      showWellnessResults('Personal Training');
    } else {
      setVoiceMessage(`I heard: "${command}" - Try asking for a wellness service like massage, yoga, nutrition, or personal training.`);
      setTimeout(() => {
        setVoiceMessage('Ready to listen');
      }, 3000);
    }
  };

  const showWellnessResults = (service) => {
    const mockResults = [
      { name: 'Dr. Emily White', specialty: 'Nutritionist', location: 'Downtown', rating: 4.8, price: '$150/session' },
      { name: 'Zen Yoga Studio', specialty: 'Yoga & Meditation', location: 'Uptown', rating: 4.9, price: '$80/class' },
      { name: 'Body & Mind Massage', specialty: 'Massage Therapy', location: 'Midtown', rating: 4.7, price: '$120/hour' },
      { name: 'FitLife Training', specialty: 'Personal Training', location: 'Eastside', rating: 4.6, price: '$100/hour' }
    ];

    const filteredResults = mockResults.filter(result => 
      result.specialty.toLowerCase().includes(service.toLowerCase())
    );

    setSearchResults(filteredResults);
    setShowResults(true);
    setVoiceMessage(`Found ${filteredResults.length} wellness partners for ${service}. Check the results below!`);
  };

  const handleFunctionCall = async (functionCall) => {
    console.log('🔍 Handling function call:', functionCall);
    
    if (functionCall.name === 'search_wellness_partners') {
      const { service, location } = functionCall.parameters;
      console.log('🔍 Searching wellness partners with params:', { service, location });
      
      // Simulate search results
      const mockResults = [
        { name: 'Dr. Emily White', specialty: 'Nutritionist', location: 'Downtown', rating: 4.8, price: '$150/session' },
        { name: 'Zen Yoga Studio', specialty: 'Yoga & Meditation', location: 'Uptown', rating: 4.9, price: '$80/class' },
        { name: 'Body & Mind Massage', specialty: 'Massage Therapy', location: 'Midtown', rating: 4.7, price: '$120/hour' },
        { name: 'FitLife Training', specialty: 'Personal Training', location: 'Eastside', rating: 4.6, price: '$100/hour' }
      ];
      setSearchResults(mockResults);
      setShowResults(true);
      setVoiceMessage(`Found ${mockResults.length} wellness partners for ${service || 'your request'}.`);
      
      return {
        result: `I found ${mockResults.length} wellness partners for ${service || 'your request'}. Check the results below!`
      };
    } else {
      console.log('🔍 Unknown function call received:', functionCall.name);
      setVoiceMessage("I'm a wellness assistant. I can only help you find and book wellness services. Please ask me about services like massage, yoga, or nutrition.");
      
      return {
        result: "I'm a wellness assistant. I can only help you find and book wellness services. Please ask me about services like massage, yoga, or nutrition."
      };
    }
  };

  const getVoiceButtonStyle = () => ({
    padding: '16px 32px',
    backgroundColor: isListening ? '#ff4d4d' : '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: audioPermissionGranted ? 'pointer' : 'not-allowed',
    fontSize: '18px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    opacity: audioPermissionGranted ? 1 : 0.6,
    transform: isListening ? 'scale(1.05)' : 'scale(1)',
    minWidth: '200px',
    justifyContent: 'center'
  });

  const getVoiceStatusStyle = () => ({
    marginTop: '20px',
    fontSize: '16px',
    color: voiceStatus === 'error' ? '#ff4d4d' : 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  });

  return (
    <>
      <Head>
        <title>Voice Wellness Partners Demo | Bright Mind Vision</title>
        <meta name="description" content="Experience our AI-powered voice assistant for wellness services booking and appointment scheduling." />
        <meta name="keywords" content="voice AI, wellness partners, appointment booking, AI assistant, voice technology" />
        <meta property="og:title" content="Voice Wellness Partners Demo | Bright Mind Vision" />
        <meta property="og:description" content="Experience our AI-powered voice assistant for wellness services booking and appointment scheduling." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://brightmindvision.com/demo/voice-wellness-partners" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Voice Wellness Partners Demo | Bright Mind Vision" />
        <meta name="twitter:description" content="Experience our AI-powered voice assistant for wellness services booking and appointment scheduling." />
        <link rel="canonical" href="https://brightmindvision.com/demo/voice-wellness-partners" />
      </Head>

      <Header />

      <main style={{ paddingTop: '80px' }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '80px 20px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
              <div style={{ fontSize: '4rem' }}>🧘‍♀️</div>
              <h1 style={{ fontSize: '3rem', fontWeight: '700', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Voice Wellness Partners
              </h1>
            </div>
            <p style={{ fontSize: '1.3rem', marginBottom: '40px', opacity: 0.9, lineHeight: '1.6' }}>
              Experience the future of wellness booking with our AI-powered voice assistant. 
              Book appointments, find services, and get personalized recommendations through natural conversation.
            </p>
            
            {/* Voice Assistant Button */}
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={toggleVoiceAssistant}
                style={getVoiceButtonStyle()}
                disabled={!vapiReady || voiceStatus === 'loading' || !audioPermissionGranted}
              >
                {voiceStatus === 'loading' ? (
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '20px' }}></i>
                ) : (
                  <i className="fas fa-microphone" style={{ fontSize: '20px' }}></i>
                )}
                <span>
                  {voiceStatus === 'loading' ? 'Preparing Assistant...' : 
                   isListening ? 'Stop Listening' : 'Start Voice Assistant'}
                </span>
              </button>
              
              
              <div style={getVoiceStatusStyle()}>
                {voiceMessage}
                {assistantIdLoaded && (
                  <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
                    ✓ Assistant ready for instant start
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎤</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Speak Naturally</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Simply say what you need - "I need a massage therapist" or "Book a yoga class" and our AI understands your request.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Smart Search</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Our AI searches through verified wellness partners to find the best matches for your needs and preferences.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📅</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Easy Booking</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Get instant recommendations and book appointments seamlessly through voice commands or follow-up actions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Results Section */}
        {showResults && searchResults.length > 0 && (
          <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '50px', color: '#333' }}>
                Available Wellness Partners
              </h2>
              <div style={{ display: 'grid', gap: '25px' }}>
                {searchResults.map((result, index) => (
                  <div key={index} style={{ 
                    padding: '25px', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '12px', 
                    backgroundColor: '#fafafa',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#667eea', fontSize: '1.3rem' }}>{result.name}</h3>
                        <p style={{ margin: '0 0 5px 0', color: '#555', fontWeight: '500' }}>{result.specialty}</p>
                        <p style={{ margin: '0', color: '#777' }}>📍 {result.location}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#28a745' }}>{result.price}</div>
                        <div style={{ color: '#ffc107', fontSize: '1.1rem' }}>
                          {'★'.repeat(Math.floor(result.rating))}{'☆'.repeat(5 - Math.floor(result.rating))} {result.rating}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button style={{
                        padding: '10px 20px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Book Appointment
                      </button>
                      <button style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: '#667eea',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Technology Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#333' }}>
              Powered by Advanced AI
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '50px', lineHeight: '1.6' }}>
              Our voice wellness assistant uses cutting-edge natural language processing and machine learning 
              to understand your needs and provide personalized recommendations.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🧠</div>
                <h4 style={{ color: '#333', marginBottom: '10px' }}>Natural Language Processing</h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Understands conversational speech patterns</p>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎯</div>
                <h4 style={{ color: '#333', marginBottom: '10px' }}>Smart Matching</h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Finds the best wellness partners for you</p>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⚡</div>
                <h4 style={{ color: '#333', marginBottom: '10px' }}>Real-time Processing</h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Instant responses and recommendations</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <Contact />
        
        {/* Calendar Section */}
        <Calendar />
      </main>

      <Footer />
    </>
  );
};

export default VoiceWellnessPartners;
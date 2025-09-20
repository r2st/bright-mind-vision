import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Vapi from '@vapi-ai/web';

const VoiceAssistant = ({ onSearchResults, onShowResults }) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('Click to start voice assistant');
  const [voiceStatus, setVoiceStatus] = useState('ready'); // 'ready', 'loading', 'listening', 'speaking', 'error'
  const [vapi, setVapi] = useState(null);
  const [vapiReady, setVapiReady] = useState(false);
  const [assistantId, setAssistantId] = useState(null);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);
  const [assistantIdLoaded, setAssistantIdLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const audioContextRef = useRef(null);
  const assistantIdRef = useRef(null);
  const lastAssistantIdRef = useRef(null);
  const initializationRef = useRef(false); // Prevent multiple initializations

  // Check browser compatibility for voice features
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  
  useEffect(() => {
    // Check browser compatibility only on client side
    const checkVoiceSupport = () => {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('🔍 Voice not supported: getUserMedia not available');
        return false;
      }
      
      // Check if we're on HTTPS or localhost
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      const isHTTPS = location.protocol === 'https:';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Mobile devices require HTTPS even for localhost
      if (isMobile && !isHTTPS) {
        console.log('🔍 Voice not supported on mobile: HTTPS required even for localhost');
        return false;
      }
      
      // Desktop can use localhost HTTP
      if (!isMobile && !isHTTPS && !isLocalhost) {
        console.log('🔍 Voice not supported: HTTPS required for non-localhost');
        return false;
      }
      
      // Log mobile detection
      if (isMobile) {
        console.log('🔍 Mobile device detected, voice features may be limited');
        // Still return true for mobile, but we'll handle errors gracefully
      }
      
      return true;
    };
    
    setIsVoiceSupported(checkVoiceSupport());
  }, []);

  // Local storage utilities - memoized for performance
  const STORAGE_KEYS = useMemo(() => ({
    ASSISTANT_ID: 'vapi_wellness_assistant_id',
    ASSISTANT_TIMESTAMP: 'vapi_wellness_assistant_timestamp'
  }), []);

  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  const FAST_TIMEOUT = 2000; // 2 seconds for faster fallback

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

  // Pre-load assistant ID with aggressive caching and fast fallback
  const preloadAssistantId = useCallback(async () => {
    if (assistantIdRef.current || initializationRef.current) return; // Already loaded or loading
    initializationRef.current = true;
    
    // First, try to use cached assistant ID (instant)
    const cachedId = getCachedAssistantId();
    if (cachedId) {
      assistantIdRef.current = cachedId;
      setAssistantId(cachedId);
      setAssistantIdLoaded(true);
      lastAssistantIdRef.current = cachedId;
      console.log('🔍 Using cached assistant ID for instant start');
      initializationRef.current = false;
      return;
    }

    // If no cache, try to fetch from server with very fast timeout
    try {
      console.log('🔍 Fetching fresh assistant ID from server...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FAST_TIMEOUT); // 2 seconds for faster fallback
      
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
    } finally {
      initializationRef.current = false;
    }
  }, [getCachedAssistantId, cacheAssistantId, isVoiceSupported]);

  // Initialize Vapi SDK with aggressive optimizations
  const initializeVapi = useCallback(async () => {
    if (initializationRef.current) return; // Prevent multiple initializations
    initializationRef.current = true;
    
    // Skip initialization if voice features are not supported
    if (!isVoiceSupported) {
      console.log('🔍 Voice features not supported, skipping initialization');
      setVoiceStatus('error');
      setVoiceMessage('Voice features not supported in this browser');
      initializationRef.current = false;
      return;
    }
    
    console.log('🔍 Initializing Vapi...');
    setVoiceStatus('loading');
    setVoiceMessage('Loading voice assistant...');

    // Start pre-loading assistant ID immediately (non-blocking)
    preloadAssistantId().catch(error => {
      console.warn('🔍 Background assistant ID loading failed:', error);
    });

    // Run microphone permission and Vapi initialization in parallel with fast timeouts
    const [audioResult, vapiResult] = await Promise.allSettled([
      // Request microphone permission with timeout and proper checks
      Promise.race([
        (async () => {
          // Check if getUserMedia is available
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('getUserMedia not supported in this browser');
          }
          
          // Check if we're on HTTPS or localhost
          if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            throw new Error('getUserMedia requires HTTPS or localhost');
          }
          
          // Check if we're on mobile and provide better audio constraints
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          const audioConstraints = {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              // Mobile-specific constraints
              ...(isMobile && {
                sampleRate: 16000,
                channelCount: 1
              })
            }
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
          stream.getTracks().forEach(track => track.stop());
          setAudioPermissionGranted(true);
          console.log('🔍 Audio permission granted.');
          return true;
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Audio permission timeout')), 3000))
      ]).catch(audioError => {
        console.warn('🔍 Audio permission denied or timeout:', audioError);
        setAudioPermissionGranted(false);
        
        // Provide more specific error messages for mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (audioError.message.includes('not supported')) {
          setVoiceMessage('Voice features not supported in this browser.');
        } else if (audioError.message.includes('HTTPS')) {
          setVoiceMessage('Voice features require HTTPS connection.');
        } else if (audioError.message.includes('NotAllowedError') || audioError.message.includes('denied')) {
          setVoiceMessage(isMobile ? 
            'Microphone access denied. Please allow microphone access in your browser settings and try again.' :
            'Microphone access denied. Please allow microphone access and try again.'
          );
        } else if (audioError.message.includes('NotFoundError')) {
          setVoiceMessage('No microphone found. Please connect a microphone and try again.');
        } else if (audioError.message.includes('timeout')) {
          setVoiceMessage(isMobile ? 
            'Microphone access timed out. Please try again and allow microphone access when prompted.' :
            'Microphone access timed out. Please try again.'
          );
        } else {
          setVoiceMessage(isMobile ? 
            'Voice features require microphone access. Please check your browser settings and try again.' :
            'Microphone access denied. Voice assistant disabled.'
          );
        }
        
        setVoiceStatus('error');
        return false;
      }),
      
      // Initialize Vapi with very fast timeout
      (async () => {
        const publicApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || 'YOUR_DEFAULT_VAPI_PUBLIC_KEY';
        
        if (publicApiKey && publicApiKey.length > 10) {
          console.log('🔍 Creating Vapi instance with public key...');
          try {
            // Add very fast timeout to Vapi initialization
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
              setTimeout(() => reject(new Error('Vapi initialization timeout')), 3000); // 3 second timeout for faster fallback
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
    
    initializationRef.current = false;
  }, [preloadAssistantId]);

  useEffect(() => {
    if (isVoiceSupported) {
      initializeVapi();
    }
  }, [initializeVapi, isVoiceSupported]);

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
      onShowResults(false); // Hide previous results on new call
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
        // processVoiceCommand(message.transcript); // Let Vapi handle tools
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
  }, [onShowResults]);

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

  // Memoize demo commands for better performance
  const demoCommands = useMemo(() => [
    'I need a massage therapist',
    'Find yoga classes near me',
    'Book nutrition consultation',
    'Schedule personal training session',
    'I want to book a wellness appointment',
    'Can you help me find a personal trainer?',
    'I need a nutritionist consultation'
  ], []);

  const startDemoMode = () => {
    setVoiceStatus('listening');
    setVoiceMessage('Listening... (demo mode)');
    setIsListening(true);
    
    // Simulate voice command after 0.5 seconds (even faster)
    setTimeout(() => {
      const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
      setVoiceMessage(`Demo: "${randomCommand}"`);
      processVoiceCommand(randomCommand);
    }, 500); // Reduced from 800ms to 500ms for faster response
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

  const retryVoiceSetup = useCallback(() => {
    if (retryCount < 3) {
      console.log(`🔍 Retrying voice setup (attempt ${retryCount + 1}/3)`);
      setRetryCount(prev => prev + 1);
      setVoiceStatus('loading');
      setVoiceMessage('Retrying voice setup...');
      
      // Reset states and try again
      setAudioPermissionGranted(false);
      setVapiReady(false);
      setVapi(null);
      
      // Re-initialize after a short delay
      setTimeout(() => {
        initializeVapi();
      }, 1000);
    }
  }, [retryCount, initializeVapi]);

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

  // Memoize wellness results for better performance
  const wellnessResults = useMemo(() => ({
    massage: [{ name: 'Serenity Spa', service: 'Massage Therapy', location: 'Downtown', rating: 4.8 }],
    yoga: [{ name: 'Zen Yoga Studio', service: 'Yoga & Meditation', location: 'Westside', rating: 4.9 }],
    nutrition: [{ name: 'Vitality Nutrition', service: 'Nutrition Counseling', location: 'Midtown', rating: 4.7 }],
    trainer: [{ name: 'FitLife Training', service: 'Personal Training', location: 'Eastside', rating: 4.6 }]
  }), []);

  const processVoiceCommand = (command) => {
    console.log('Processing voice command:', command);
    const lowerCommand = command.toLowerCase();

    // Simulate processing for wellness services with memoized results
    if (lowerCommand.includes('massage')) {
      onSearchResults(wellnessResults.massage);
      onShowResults(true);
      setVoiceMessage(`Found massage therapists for you.`);
    } else if (lowerCommand.includes('yoga')) {
      onSearchResults(wellnessResults.yoga);
      onShowResults(true);
      setVoiceMessage(`Found yoga classes for you.`);
    } else if (lowerCommand.includes('nutrition')) {
      onSearchResults(wellnessResults.nutrition);
      onShowResults(true);
      setVoiceMessage(`Found nutrition consultants for you.`);
    } else if (lowerCommand.includes('trainer') || lowerCommand.includes('personal training')) {
      onSearchResults(wellnessResults.trainer);
      onShowResults(true);
      setVoiceMessage(`Found personal trainers for you.`);
    } else {
      setVoiceMessage(`I heard: "${command}" - Try asking for a wellness service like massage, yoga, nutrition, or personal training.`);
      setTimeout(() => {
        setVoiceMessage('Ready to listen');
      }, 2000); // Reduced from 3000ms to 2000ms
    }
  };

  // Memoize mock results for better performance
  const mockWellnessResults = useMemo(() => [
    { name: 'Dr. Emily White', specialty: 'Nutritionist', location: 'Downtown', rating: 4.8, price: '$150/session' },
    { name: 'Zen Yoga Studio', specialty: 'Yoga & Meditation', location: 'Uptown', rating: 4.9, price: '$80/class' },
    { name: 'Body & Mind Massage', specialty: 'Massage Therapy', location: 'Midtown', rating: 4.7, price: '$120/hour' },
    { name: 'FitLife Training', specialty: 'Personal Training', location: 'Eastside', rating: 4.6, price: '$100/hour' }
  ], []);

  const handleFunctionCall = async (functionCall) => {
    console.log('🔍 Handling function call:', functionCall);
    
    if (functionCall.name === 'search_wellness_partners') { // Assuming a wellness search tool
      const { service, location } = functionCall.parameters;
      console.log('🔍 Searching wellness partners with params:', { service, location });
      
      // Use memoized results for better performance
      let filteredResults = mockWellnessResults;
      if (service) {
        filteredResults = mockWellnessResults.filter(p => 
          p.specialty.toLowerCase().includes(service.toLowerCase()) ||
          p.name.toLowerCase().includes(service.toLowerCase())
        );
      }
      if (location) {
        filteredResults = filteredResults.filter(p => 
          p.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      onSearchResults(filteredResults);
      onShowResults(true);
      setVoiceMessage(`Found ${filteredResults.length} wellness partners for ${service || 'your request'}.`);
      
      return {
        result: `I found ${filteredResults.length} wellness partners for ${service || 'your request'}. Check the results below!`
      };
    } else {
      console.log('🔍 Unknown function call received:', functionCall.name);
      setVoiceMessage("I'm a wellness assistant. I can only help you find and book wellness services. Please ask me about services like massage, yoga, or nutrition.");
      
      return {
        result: "I'm a wellness assistant. I can only help you find and book wellness services. Please ask me about services like massage, yoga, or nutrition."
      };
    }
  };

  // Extract style objects to constants to fix Fast Refresh
  const voiceButtonStyle = {
    padding: '15px 30px',
    backgroundColor: isListening ? '#ff4d4d' : '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    cursor: audioPermissionGranted ? 'pointer' : 'not-allowed',
    fontSize: '18px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    opacity: audioPermissionGranted ? 1 : 0.6,
    transform: isListening ? 'scale(1.05)' : 'scale(1)',
    minWidth: '200px',
    justifyContent: 'center'
  };

  const voiceStatusStyle = {
    marginTop: '20px',
    fontSize: '16px',
    color: voiceStatus === 'error' ? '#ff4d4d' : 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  };

  // Extract inline style objects to constants
  const containerStyle = { textAlign: 'center' };
  const spinnerStyle = { fontSize: '20px' };
  const microphoneStyle = { fontSize: '20px' };
  const statusSubtextStyle = { fontSize: '14px', opacity: 0.8, marginTop: '5px' };

  // Show loading state initially, then check voice support
  if (!isVoiceSupported) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return (
      <div style={containerStyle}>
        <div style={{
          ...voiceButtonStyle,
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          cursor: 'not-allowed',
          opacity: 0.7
        }}>
          <i className="fas fa-microphone-slash" style={microphoneStyle}></i>
          <span>Voice Assistant Unavailable</span>
        </div>
        
        <div style={voiceStatusStyle}>
          {isMobile ? (
            <>
              Voice features require HTTPS connection and microphone access.
              <div style={statusSubtextStyle}>
                <strong>Mobile Issue:</strong> This demo is running on HTTP localhost, but mobile devices require HTTPS for voice features.
                <br />
                <strong>Solution:</strong> Access this demo via HTTPS or use a desktop browser.
                <br />
                <strong>For testing:</strong> Use Chrome on desktop or deploy to HTTPS.
              </div>
            </>
          ) : (
            <>
              Voice features require HTTPS connection and microphone access.
              <div style={statusSubtextStyle}>
                Try using a modern browser with HTTPS enabled.
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <button 
        onClick={toggleVoiceAssistant}
        style={voiceButtonStyle}
        disabled={!vapiReady || voiceStatus === 'loading' || !audioPermissionGranted}
      >
        {voiceStatus === 'loading' ? (
          <i className="fas fa-spinner fa-spin" style={spinnerStyle}></i>
        ) : (
          <i className="fas fa-microphone" style={microphoneStyle}></i>
        )}
        <span>
          {voiceStatus === 'loading' ? 'Preparing Assistant...' : 
           isListening ? 'Stop Listening' : 'Start Voice Assistant'}
        </span>
      </button>
      
        <div style={voiceStatusStyle}>
          {voiceMessage}
          {assistantIdLoaded && (
            <div style={statusSubtextStyle}>
              ✓ Assistant ready for instant start
            </div>
          )}
          {voiceStatus === 'error' && retryCount < 3 && (
            <button
              onClick={retryVoiceSetup}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              Retry Voice Setup
            </button>
          )}
        </div>
    </div>
  );
};

export default VoiceAssistant;

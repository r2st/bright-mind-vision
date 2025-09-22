import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const VoiceAssistant = ({ 
  config,
  onSearchResults, 
  onShowResults,
  className = '',
  style = {}
}) => {
  // Ensure config is provided
  if (!config) {
    throw new Error('VoiceAssistant requires a config prop');
  }

  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState(config.ui?.initialMessage || 'Click to start voice assistant');
  const [voiceStatus, setVoiceStatus] = useState('ready'); // 'ready', 'loading', 'listening', 'speaking', 'error'
  const [vapi, setVapi] = useState(null);
  const [vapiReady, setVapiReady] = useState(false);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);
  const [assistantIdLoaded, setAssistantIdLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const audioContextRef = useRef(null);
  const assistantIdRef = useRef(null);
  const lastAssistantIdRef = useRef(null);
  const initializationRef = useRef(false); // Prevent multiple initializations
  const speechActiveRef = useRef(false); // Track if speech is currently active
  const speechTimeoutRef = useRef(null); // Track speech timeout
  const lastSpeechCommandRef = useRef(''); // Track last speech command to prevent duplicates
  const speechQueueRef = useRef([]); // Track speech queue
  const fillerAudioRef = useRef(null); // Track filler audio
  const fillerAudioTimeoutRef = useRef(null); // Track filler audio timeout

  // Check browser compatibility for voice features
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  
  useEffect(() => {
    // Check browser compatibility in background, don't block initialization
    const checkVoiceSupport = () => {
      // Only run on client side
      if (typeof window === 'undefined') return true; // Assume supported on server
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('🔍 Voice not supported: getUserMedia not available');
        return false;
      }
      
      // Check if we're on HTTPS or localhost
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      const isHTTPS = location.protocol === 'https:';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      console.log('🔍 Voice support check:', { isLocalhost, isHTTPS, isMobile });
      
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
      
      console.log('🔍 Voice supported: HTTP localhost on desktop');
      return true;
    };
    
    // Set initial state optimistically, then check in background
    setIsVoiceSupported(true);
    
    // Check compatibility in background
    setTimeout(() => {
      setIsVoiceSupported(checkVoiceSupport());
    }, 0);
  }, []);

  // Local storage utilities - memoized for performance
  const STORAGE_KEYS = useMemo(() => config.storageKeys, [config.storageKeys]);

  // Use configurable settings with fallbacks
  const CACHE_DURATION = config.settings?.cacheDuration || 24 * 60 * 60 * 1000; // 24 hours
  const FAST_TIMEOUT = config.settings?.fastTimeout || 2000; // 2 seconds for faster fallback

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
      
      const response = await fetch(config.apiEndpoint, { 
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
        setAssistantIdLoaded(true);
        console.log('🔍 Using last known assistant ID:', lastAssistantIdRef.current);
      } else {
        console.log('🔍 No assistant ID available, will use product mode');
      }
    } finally {
      initializationRef.current = false;
    }
  }, [getCachedAssistantId, cacheAssistantId, isVoiceSupported]);

  // Initialize Vapi SDK with aggressive optimizations
  const initializeVapi = useCallback(async () => {
    // Note: initializationRef.current is managed by toggleVoiceAssistant
    
    // Skip initialization if voice features are not supported
    if (!isVoiceSupported) {
      console.log('🔍 Voice features not supported, skipping initialization');
      setVoiceStatus('error');
      setVoiceMessage('Voice features not supported in this browser');
      throw new Error('Voice features not supported in this browser');
    }
    
    console.log('🔍 Initializing Vapi...');
    setVoiceStatus('ready');
    setVoiceMessage('Voice assistant ready');

    // Start pre-loading assistant ID immediately (non-blocking)
    preloadAssistantId().catch(error => {
      console.warn('🔍 Background assistant ID loading failed:', error);
    });

    // Run microphone permission and Vapi initialization in parallel with fast timeouts
    // Return a promise that resolves when initialization is complete
    return Promise.allSettled([
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
        new Promise((_, reject) => setTimeout(() => reject(new Error('Audio permission timeout')), 1000))
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
      
      // Initialize Vapi with very fast timeout and dynamic import
      (async () => {
        const publicApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || 'YOUR_DEFAULT_VAPI_PUBLIC_KEY';
        
        if (publicApiKey && publicApiKey.length > 10) {
          console.log('🔍 Creating Vapi instance with public key...');
          try {
            // Dynamic import VAPI to avoid blocking initial load
            const { default: Vapi } = await import('@vapi-ai/web');
            
            // Add very fast timeout to Vapi initialization
            const initPromise = new Promise((resolve, reject) => {
              try {
                // Create VAPI instance with just the API key (as per documentation)
                const vapiInstance = new Vapi(publicApiKey);
                
                setupVapiEventListeners(vapiInstance);
                setVapi(vapiInstance);
                resolve(vapiInstance);
              } catch (error) {
                reject(error);
              }
            });

            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Vapi initialization timeout')), config.settings?.timeout || 1500);
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
    ]).then(([audioResult, vapiResult]) => {
      // Handle results asynchronously
      const audioGranted = audioResult.status === 'fulfilled' && audioResult.value;
      const vapiInstance = vapiResult.status === 'fulfilled' ? vapiResult.value : null;

      if (audioGranted && vapiInstance) {
        setVapi(vapiInstance);
        setVapiReady(true);
        setVoiceStatus('ready');
        setVoiceMessage('Voice assistant ready');
        return { success: true, vapi: vapiInstance, audioGranted: true };
      } else if (audioGranted) {
        setVapiReady(true);
        setVapi(null);
        setVoiceStatus('ready');
        setVoiceMessage('Voice assistant ready (demo mode)');
        return { success: true, vapi: null, audioGranted: true };
      } else {
        setVoiceStatus('ready');
        setVoiceMessage('Voice assistant ready (demo mode)');
        return { success: true, vapi: null, audioGranted: false };
      }
    }).catch(error => {
      console.error('🔍 Initialization error:', error);
      setVoiceStatus('ready');
      setVoiceMessage('Voice assistant ready (demo mode)');
      throw error;
    });
  }, [preloadAssistantId]);

  // Remove automatic initialization - only initialize when user clicks button
  // useEffect(() => {
  //   initializeVapi();
  // }, [initializeVapi]);

  // Cleanup speech synthesis and filler audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        speechActiveRef.current = false;
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      speechQueueRef.current = []; // Clear speech queue
      stopFillerAudio(); // Stop any playing filler audio
    };
  }, []);

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
      // Stop filler audio when agent starts speaking
      stopFillerAudio();
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
      } else if (message.type === 'speech-start') {
        console.log('🔍 Assistant started speaking');
        setVoiceStatus('speaking');
        // Stop filler audio when assistant starts speaking
        stopFillerAudio();
      } else if (message.type === 'speech-end') {
        console.log('🔍 Assistant finished speaking');
        setVoiceStatus('listening');
      }
    });
    
    vapiInstance.on('error', (error) => {
      console.error('🔍 Vapi error:', error);
      
      // Handle specific validation errors
      if (error.type === 'validation-error') {
        console.log('🔍 VAPI validation error, falling back to demo mode');
        setVoiceStatus('ready');
        setVoiceMessage('Voice assistant ready (demo mode)');
        setIsListening(false);
        // Don't set error status for validation errors, just fall back to demo mode
        return;
      }
      
      // Handle start method errors (like 403 Forbidden)
      if (error.type === 'start-method-error') {
        console.log('🔍 VAPI start method error, falling back to demo mode');
        setVoiceStatus('ready');
        setVoiceMessage('Voice assistant ready (demo mode)');
        setIsListening(false);
        return;
      }
      
      setVoiceStatus('error');
      setVoiceMessage('Voice assistant error');
      setIsListening(false);
    });
  }, [onShowResults]);

  // Stop filler audio
  const stopFillerAudio = useCallback(() => {
    try {
      if (fillerAudioRef.current) {
        const { oscillators, gainNode, filterNode } = fillerAudioRef.current;
        
        // Create a smooth fade-out
        if (audioContextRef.current && gainNode) {
          const audioContext = audioContextRef.current;
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
          
          // Stop all oscillators after fade-out
          setTimeout(() => {
            oscillators.forEach(oscillator => {
              try {
                oscillator.stop();
              } catch (e) {
                // Oscillator might already be stopped
              }
            });
          }, 300);
        }
        
        fillerAudioRef.current = null;
      }
      
      if (fillerAudioTimeoutRef.current) {
        clearTimeout(fillerAudioTimeoutRef.current);
        fillerAudioTimeoutRef.current = null;
      }
      
      console.log('🔍 Stopped soothing filler audio');
    } catch (error) {
      console.warn('🔍 Error stopping filler audio:', error);
    }
  }, []);

  // Create and play soft filler music/ring tone
  const playFillerAudio = useCallback(() => {
    if (!audioContextRef.current) return;
    
    try {
      // Stop any existing filler audio
      stopFillerAudio();
      
      const audioContext = audioContextRef.current;
      
      // Create a more soothing ambient sound with multiple oscillators
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const oscillator3 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      
      // Create a gentle ambient pad sound
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(220, audioContext.currentTime); // A3 - lower, warmer
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(330, audioContext.currentTime); // E4 - harmonious fifth
      
      oscillator3.type = 'sine';
      oscillator3.frequency.setValueAtTime(440, audioContext.currentTime); // A4 - higher harmonic
      
      // Add a gentle low-pass filter for warmth
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(800, audioContext.currentTime);
      filterNode.Q.setValueAtTime(1, audioContext.currentTime);
      
      // Create a very gentle fade-in and fade-out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 1.0); // Very gentle fade in
      gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 2.0); // Hold softly
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 3.0); // Gentle fade out
      
      // Connect the nodes
      oscillator1.connect(filterNode);
      oscillator2.connect(filterNode);
      oscillator3.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Store reference for stopping
      fillerAudioRef.current = { 
        oscillators: [oscillator1, oscillator2, oscillator3], 
        gainNode, 
        filterNode 
      };
      
      // Start all oscillators
      oscillator1.start();
      oscillator2.start();
      oscillator3.start();
      
      // Auto-stop after 3 seconds
      fillerAudioTimeoutRef.current = setTimeout(() => {
        stopFillerAudio();
      }, 3000);
      
      console.log('🔍 Playing soothing ambient audio...');
    } catch (error) {
      console.warn('🔍 Failed to play filler audio:', error);
    }
  }, []);

  const startListeningWithVapi = async (vapiInstance) => {
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
      console.log('🔍 Starting Vapi call...');
      
      // Play filler audio to indicate connection is being established
      playFillerAudio();
      
      // Start VAPI call with assistant ID from config
      const assistantId = config.assistantId || '81f49cc7-c40a-433d-8606-63c84babe3a9';
      console.log('🔍 Starting VAPI call with assistant ID:', assistantId);
      try {
        vapiInstance.start(assistantId); // Pass assistant ID as per documentation
        setVoiceStatus('listening');
        setVoiceMessage('Listening...');
        setIsListening(true);
      } catch (startError) {
        console.error('🔍 Failed to start VAPI call:', startError);
        // Stop filler audio on error
        stopFillerAudio();
        // Fall back to demo mode if VAPI start fails
        console.log('🔍 VAPI start failed, using demo mode...');
        setVoiceStatus('ready');
        setVoiceMessage('Voice assistant ready (demo mode)');
        setIsListening(false);
      }
    } catch (error) {
      console.error('🔍 Vapi error:', error);
      // Stop filler audio on error
      stopFillerAudio();
      setVoiceStatus('error');
      setVoiceMessage('Voice assistant error');
      setIsListening(false);
    }
  };

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
        
        // Start VAPI call with assistant ID from config
        const assistantId = config.assistantId || '81f49cc7-c40a-433d-8606-63c84babe3a9';
        console.log('🔍 Starting VAPI call with assistant ID:', assistantId);
        try {
          vapi.start(assistantId); // Pass assistant ID as per documentation
          setVoiceStatus('listening');
          setVoiceMessage('Listening...');
          setIsListening(true);
        } catch (startError) {
          console.error('🔍 Failed to start VAPI call:', startError);
          // Fall back to demo mode if VAPI start fails
          console.log('🔍 VAPI start failed, using demo mode...');
          setVoiceStatus('ready');
          setVoiceMessage('Voice assistant ready (demo mode)');
          setIsListening(false);
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
  const demoCommands = useMemo(() => config.demo?.sampleCommands || [], [config.demo?.sampleCommands]);

  const startDemoMode = () => {
    setVoiceStatus('listening');
    setVoiceMessage('Listening... (demo mode)');
    setIsListening(true);
    
    // Simulate voice command after 0.5 seconds (even faster)
    setTimeout(() => {
      const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
      setVoiceMessage(`Demo: "${randomCommand}"`);
      
      // Process the command and show results
      const lowerCommand = randomCommand.toLowerCase();
      let found = false;
      for (const [key, results] of Object.entries(demoResults)) {
        if (lowerCommand.includes(key)) {
          onSearchResults(results);
          onShowResults(true);
          setVoiceMessage(`Found ${key} services for you.`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        setVoiceMessage(`I heard: "${randomCommand}" - ${config.demo?.fallbackMessage || 'Demo mode'}`);
      }
      
      // Add voice output simulation for demo mode (single call)
      setTimeout(() => {
        speakDemoResponse(randomCommand);
      }, 200);
    }, 200); // Reduced for faster response
  };

  const stopListening = () => {
    try {
      if (vapi) {
        vapi.stop();
        console.log('🔍 Vapi stopped');
      }
      // Stop any playing filler audio
      stopFillerAudio();
      setVoiceStatus('ready');
      setVoiceMessage(vapi ? 'Ready to listen' : 'Ready to listen (product mode)');
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop Vapi:', error);
      setVoiceStatus('ready');
    }
  };

  // Add voice output for demo mode using Web Speech API with queue system
  const speakDemoResponse = (command) => {
    if (!('speechSynthesis' in window)) {
      console.log('🔍 Speech synthesis not supported in this browser');
      return;
    }

    // Prevent duplicate speech for the same command
    if (lastSpeechCommandRef.current === command && speechActiveRef.current) {
      console.log('🔍 Duplicate speech command, skipping');
      return;
    }

    // Add to queue if speech is active
    if (speechActiveRef.current) {
      console.log('🔍 Speech active, adding to queue');
      speechQueueRef.current.push(command);
      return;
    }

    // Clear any existing timeout
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    // Cancel any ongoing speech and wait for it to fully stop
    window.speechSynthesis.cancel();
    
    // Set a timeout to ensure speech is fully cancelled before starting new one
    speechTimeoutRef.current = setTimeout(() => {
      // Double-check that speech is not active
      if (speechActiveRef.current) {
        console.log('🔍 Speech still active, skipping new speech');
        return;
      }

      const lowerCommand = command.toLowerCase();
      let responseText = '';

      // Generate appropriate response based on command
      if (lowerCommand.includes('massage')) {
        responseText = 'I found some great massage therapists for you. Serenity Spa offers excellent massage therapy services in downtown.';
      } else if (lowerCommand.includes('yoga')) {
        responseText = 'I found yoga classes for you. Zen Yoga Studio offers yoga and meditation classes on the westside.';
      } else if (lowerCommand.includes('nutrition')) {
        responseText = 'I found nutrition services for you. Vitality Nutrition provides nutrition counseling in midtown.';
      } else if (lowerCommand.includes('trainer') || lowerCommand.includes('training')) {
        responseText = 'I found personal training services for you. FitLife Training offers personal training on the eastside.';
      } else if (lowerCommand.includes('consultation') || lowerCommand.includes('appointment')) {
        responseText = 'I can help you schedule a consultation. I found Dr. Sarah Johnson available for general practice consultations.';
      } else {
        responseText = 'I understand you need wellness services. I can help you find massage therapy, yoga classes, nutrition counseling, or personal training.';
      }

      // Get voices and select the best available one (optimized for speed)
      const voices = window.speechSynthesis.getVoices();
      console.log('🔍 Available voices:', voices.length);
      
      // Quick voice selection - prioritize first good English voice
      let selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];

      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(responseText);
      utterance.rate = config.settings?.speechRate || 0.8; // Configurable speech rate
      utterance.pitch = 1;
      utterance.volume = config.settings?.speechVolume || 0.9; // Configurable speech volume
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🔍 Using voice:', selectedVoice.name);
      } else {
        console.log('🔍 Using default voice');
      }

      // Handle speech events
      utterance.onstart = () => {
        console.log('🔍 Product voice output started');
        speechActiveRef.current = true;
        lastSpeechCommandRef.current = command;
        setVoiceStatus('speaking');
      };

      utterance.onend = () => {
        console.log('🔍 Product voice output ended');
        speechActiveRef.current = false;
        setVoiceStatus('ready');
        setVoiceMessage('Ready to listen (product mode)');
        
        // Process next item in queue
        if (speechQueueRef.current.length > 0) {
          const nextCommand = speechQueueRef.current.shift();
          setTimeout(() => {
            speakDemoResponse(nextCommand);
          }, 100);
        }
      };

      utterance.onerror = (event) => {
        console.error('🔍 Speech synthesis error:', event.error);
        speechActiveRef.current = false;
        setVoiceStatus('ready');
        setVoiceMessage('Ready to listen (product mode)');
        
        // Process next item in queue even on error
        if (speechQueueRef.current.length > 0) {
          const nextCommand = speechQueueRef.current.shift();
          setTimeout(() => {
            speakDemoResponse(nextCommand);
          }, 100);
        }
      };

      // Speak the response
      console.log('🔍 Speaking:', responseText);
      window.speechSynthesis.speak(utterance);
    }, 50); // Reduced delay for faster speech start
  };

  const retryVoiceSetup = useCallback(() => {
    const maxRetries = config.settings?.retryAttempts || 3;
    if (retryCount < maxRetries) {
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

  const toggleVoiceAssistant = async () => {
    // Initialize on first click if not already done
    if (!vapiReady && !initializationRef.current) {
      setVoiceMessage('Initializing voice assistant...');
      setVoiceStatus('loading');
      initializationRef.current = true;
      
      try {
        const result = await initializeVapi();
        
        // Now that initialization is complete, start listening immediately
        if (result && result.success) {
          // Use the vapi instance directly from the result
          if (result.vapi) {
            startListeningWithVapi(result.vapi);
          } else {
            startListening(); // Demo mode
          }
          initializationRef.current = false;
        } else {
          throw new Error('Initialization failed');
        }
      } catch (error) {
        console.error('🔍 Initialization failed:', error);
        setVoiceMessage('Voice assistant initialization failed');
        setVoiceStatus('error');
        initializationRef.current = false;
      }
      return;
    }

    // If initialization is in progress, show loading message
    if (initializationRef.current) {
      setVoiceMessage('Voice assistant initializing...');
      return;
    }

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

  // Memoize demo results for better performance
  const demoResults = useMemo(() => config.demo?.results || {}, [config.demo?.results]);


  // Memoize mock results for better performance
  const mockWellnessResults = useMemo(() => [
    { name: 'Dr. Emily White', specialty: 'Nutritionist', location: 'Downtown', rating: 4.8, price: '$150/session' },
    { name: 'Zen Yoga Studio', specialty: 'Yoga & Meditation', location: 'Uptown', rating: 4.9, price: '$80/class' },
    { name: 'Body & Mind Massage', specialty: 'Massage Therapy', location: 'Midtown', rating: 4.7, price: '$120/hour' },
    { name: 'FitLife Training', specialty: 'Personal Training', location: 'Eastside', rating: 4.6, price: '$100/hour' }
  ], []);

  const handleFunctionCall = async (functionCall) => {
    console.log('🔍 Handling function call:', functionCall);
    
    if (functionCall.name === 'search_wellness_partners') { // Assuming a search tool
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
      setVoiceMessage(config.demo?.fallbackMessage || 'Demo mode');
      
      return {
        result: config.demo?.fallbackMessage || 'Demo mode'
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
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    opacity: 1,
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

  return (
    <div style={{...containerStyle, ...style}} className={className}>
      <button 
        onClick={toggleVoiceAssistant}
        style={voiceButtonStyle}
        disabled={voiceStatus === 'loading'}
      >
        {voiceStatus === 'loading' ? (
          <i className="fas fa-spinner fa-spin" style={spinnerStyle}></i>
        ) : (
          <i className="fas fa-microphone" style={microphoneStyle}></i>
        )}
        <span>
          {voiceStatus === 'loading' ? 'Preparing Assistant...' : 
           isListening ? 'Stop Listening' : config.ui.buttonText}
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

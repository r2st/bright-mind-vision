import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useVoicePermissions } from './useVoicePermissions';
import { useAudioManager } from './useAudioManager';
import { useVapiIntegration } from './useVapiIntegration';
import { VOICE_STATUS, CACHE_DURATION, TIMING, ERROR_MESSAGES } from '../constants/voiceConstants';

/**
 * Main hook for voice assistant functionality
 * @param {Object} config - Configuration object
 * @param {Function} onSearchResults - Search results callback
 * @param {Function} onShowResults - Show results callback
 * @returns {Object} Voice assistant state and functions
 */
export const useVoiceAssistant = (config, onSearchResults, onShowResults) => {
  // Ensure config is provided
  if (!config) {
    throw new Error(ERROR_MESSAGES.NO_CONFIG);
  }

  // Voice permissions hook
  const {
    isVoiceSupported,
    isClient,
    isSafari,
    audioPermissionGranted,
    requestMicrophonePermission,
    getMicrophoneErrorMessage
  } = useVoicePermissions();

  // Consolidated state management
  const [state, setState] = useState({
    isListening: false,
    voiceMessage: config.ui?.initialMessage || 'Click to start voice assistant',
    voiceStatus: VOICE_STATUS.READY,
    audioPermissionGranted: false,
    assistantIdLoaded: false,
    retryCount: 0
  });

  // Refs
  const buttonClickTimeRef = useRef(null);
  const assistantIdRef = useRef(null);
  const lastAssistantIdRef = useRef(null);
  const initializationRef = useRef(false);

  // State update helper
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Audio manager hook
  const audioManager = useAudioManager(updateState, config);

  // Function call handler
  const handleFunctionCall = useCallback(async (functionCall) => {
    console.log('🔍 Handling function call:', functionCall);
    
    if (functionCall.name === 'search_wellness_partners') {
      const { service, location } = functionCall.parameters;
      console.log('🔍 Searching wellness partners with params:', { service, location });
      
      // Mock results for demo
      const mockWellnessResults = [
        { name: 'Dr. Emily White', specialty: 'Nutritionist', location: 'Downtown', rating: 4.8, price: '$150/session' },
        { name: 'Zen Yoga Studio', specialty: 'Yoga & Meditation', location: 'Uptown', rating: 4.9, price: '$80/class' },
        { name: 'Body & Mind Massage', specialty: 'Massage Therapy', location: 'Midtown', rating: 4.7, price: '$120/hour' },
        { name: 'FitLife Training', specialty: 'Personal Training', location: 'Eastside', rating: 4.6, price: '$100/hour' }
      ];
      
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
      updateState({ voiceMessage: `Found ${filteredResults.length} wellness partners for ${service || 'your request'}.` });
      
      return {
        result: `I found ${filteredResults.length} wellness partners for ${service || 'your request'}. Check the results below!`
      };
    } else {
      console.log('🔍 Unknown function call received:', functionCall.name);
      updateState({ voiceMessage: config.demo?.fallbackMessage || 'Demo mode' });
      
      return {
        result: config.demo?.fallbackMessage || 'Demo mode'
      };
    }
  }, [config, onSearchResults, onShowResults, updateState]);

  // VAPI integration hook
  const vapiIntegration = useVapiIntegration(
    updateState,
    onShowResults,
    audioManager.stopFillerAudio,
    audioManager.fillerAudioRef,
    buttonClickTimeRef,
    handleFunctionCall,
    isSafari
  );

  // Local storage utilities
  const STORAGE_KEYS = useMemo(() => config.storageKeys, [config.storageKeys]);
  const CACHE_DURATION = config.settings?.cacheDuration || 24 * 60 * 60 * 1000; // 24 hours
  const FAST_TIMEOUT = config.settings?.fastTimeout || TIMING.FAST_TIMEOUT;

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
  }, [STORAGE_KEYS, CACHE_DURATION]);

  const cacheAssistantId = useCallback((assistantId) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSISTANT_ID, assistantId);
      localStorage.setItem(STORAGE_KEYS.ASSISTANT_TIMESTAMP, Date.now().toString());
      console.log('🔍 Cached assistant ID:', assistantId);
    } catch (error) {
      console.warn('🔍 Failed to cache assistant ID:', error);
    }
  }, [STORAGE_KEYS]);

  // Pre-load assistant ID
  const preloadAssistantId = useCallback(async () => {
    if (assistantIdRef.current || initializationRef.current) return;
    initializationRef.current = true;
    
    // First, try to use cached assistant ID (instant)
    const cachedId = getCachedAssistantId();
    if (cachedId) {
      assistantIdRef.current = cachedId;
      updateState({ assistantIdLoaded: true });
      lastAssistantIdRef.current = cachedId;
      console.log('🔍 Using cached assistant ID for instant start');
      initializationRef.current = false;
      return;
    }

    // If no cache, try to fetch from server with very fast timeout
    try {
      console.log('🔍 Fetching fresh assistant ID from server...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FAST_TIMEOUT);
      
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
        updateState({ assistantIdLoaded: true });
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
        updateState({ assistantIdLoaded: true });
        console.log('🔍 Using last known assistant ID:', lastAssistantIdRef.current);
      } else {
        console.log('🔍 No assistant ID available, will use product mode');
      }
    } finally {
      initializationRef.current = false;
    }
  }, [getCachedAssistantId, cacheAssistantId, config.apiEndpoint, FAST_TIMEOUT, updateState]);

  // Initialize VAPI with permissions
  const initializeVapi = useCallback(async () => {
    if (!isVoiceSupported) {
      console.log('🔍 Voice features not supported, skipping initialization');
      updateState({ voiceStatus: VOICE_STATUS.ERROR, voiceMessage: ERROR_MESSAGES.VOICE_NOT_SUPPORTED });
      throw new Error(ERROR_MESSAGES.VOICE_NOT_SUPPORTED);
    }
    
    console.log('🔍 Initializing Vapi...');
    updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Voice assistant ready' });

    // Start pre-loading assistant ID immediately (non-blocking)
    preloadAssistantId().catch(error => {
      console.warn('🔍 Background assistant ID loading failed:', error);
    });

    // Run microphone permission and Vapi initialization in parallel
    return Promise.allSettled([
      // Request microphone permission with timeout
      Promise.race([
        requestMicrophonePermission(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Audio permission timeout')), 1000))
      ]).catch(audioError => {
        console.warn('🎤 [MICROPHONE] ERROR: Audio permission denied or timeout:', audioError);
        updateState({ audioPermissionGranted: false });
        
        const errorMessage = getMicrophoneErrorMessage(audioError);
        updateState({ voiceStatus: VOICE_STATUS.ERROR, voiceMessage: errorMessage });
        return false;
      }),
      
      // Initialize VAPI
      vapiIntegration.initializeVapi()
    ]).then(([audioResult, vapiResult]) => {
      const audioGranted = audioResult.status === 'fulfilled' && audioResult.value;
      const vapiInstance = vapiResult.status === 'fulfilled' ? vapiResult.value : null;

      if (audioGranted && vapiInstance) {
        updateState({ 
          audioPermissionGranted: true,
          voiceStatus: VOICE_STATUS.READY, 
          voiceMessage: 'Voice assistant ready' 
        });
        return { success: true, vapi: vapiInstance, audioGranted: true };
      } else if (audioGranted) {
        updateState({ 
          audioPermissionGranted: true,
          voiceStatus: VOICE_STATUS.READY, 
          voiceMessage: 'Voice assistant ready (demo mode)' 
        });
        return { success: true, vapi: null, audioGranted: true };
      } else {
        updateState({ 
          voiceStatus: VOICE_STATUS.READY, 
          voiceMessage: 'Voice assistant ready (demo mode)' 
        });
        return { success: true, vapi: null, audioGranted: false };
      }
    }).catch(error => {
      console.error('🔍 Initialization error:', error);
      updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Voice assistant ready (demo mode)' });
      throw error;
    });
  }, [isVoiceSupported, preloadAssistantId, requestMicrophonePermission, getMicrophoneErrorMessage, vapiIntegration, updateState]);

  // Demo mode
  const startDemoMode = useCallback(() => {
    updateState({ voiceStatus: VOICE_STATUS.LISTENING, voiceMessage: 'Listening... (demo mode)', isListening: true });
    
    // Simulate voice command after 0.5 seconds
    setTimeout(() => {
      const demoCommands = config.demo?.sampleCommands || [];
      const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
      updateState({ voiceMessage: `Demo: "${randomCommand}"` });
      
      // Process the command and show results
      const lowerCommand = randomCommand.toLowerCase();
      let found = false;
      const demoResults = config.demo?.results || {};
      for (const [key, results] of Object.entries(demoResults)) {
        if (lowerCommand.includes(key)) {
          onSearchResults(results);
          onShowResults(true);
          updateState({ voiceMessage: `Found ${key} services for you.` });
          found = true;
          break;
        }
      }
      
      if (!found) {
        updateState({ voiceMessage: `I heard: "${randomCommand}" - ${config.demo?.fallbackMessage || 'Demo mode'}` });
      }
      
      // Add voice output simulation for demo mode
      setTimeout(() => {
        audioManager.speakDemoResponse(randomCommand);
      }, 200);
    }, 200);
  }, [config, onSearchResults, onShowResults, updateState, audioManager]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!vapiIntegration.vapi && !vapiIntegration.vapiReady) {
      updateState({ voiceMessage: 'Voice assistant not ready' });
      return;
    }

    try {
      if (vapiIntegration.vapi) {
        console.log('🔍 Starting Vapi call...');
        await vapiIntegration.startListeningWithVapi(vapiIntegration.vapi, config);
      } else {
        // Demo mode - simulate voice recognition
        startDemoMode();
      }
    } catch (error) {
      console.error('🔍 Vapi error:', error);
      updateState({ voiceStatus: VOICE_STATUS.ERROR, voiceMessage: 'Voice assistant error', isListening: false });
    }
  }, [vapiIntegration, config, startDemoMode, updateState]);

  // Stop listening
  const stopListening = useCallback(() => {
    try {
      console.log('🔍 [STOP] Stopping voice assistant...');
      
      // Stop VAPI connection first
      vapiIntegration.stopVapiListening();
      
      // Stop filler audio
      console.log('🔍 [STOP] Stopping filler audio...');
      audioManager.stopFillerAudio();
      
      // Clear any speech synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        console.log('🔍 [STOP] Speech synthesis cancelled');
      }
      
      // Reset speech state
      audioManager.speechActiveRef.current = false;
      audioManager.speechQueueRef.current = [];
      audioManager.lastSpeechCommandRef.current = '';
      
      // Clear timeouts
      if (audioManager.speechTimeoutRef.current) {
        clearTimeout(audioManager.speechTimeoutRef.current);
        audioManager.speechTimeoutRef.current = null;
        console.log('🔍 [STOP] Speech timeout cleared');
      }
      
      updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Ready to listen', isListening: false });
      console.log('🔍 [STOP] Voice assistant stopped successfully');
    } catch (error) {
      console.error('Failed to stop voice assistant:', error);
      updateState({ voiceStatus: VOICE_STATUS.READY });
    }
  }, [vapiIntegration, audioManager, updateState]);

  // Retry voice setup
  const retryVoiceSetup = useCallback(() => {
    const maxRetries = config.settings?.retryAttempts || 3;
    if (state.retryCount < maxRetries) {
      console.log(`🔍 Retrying voice setup (attempt ${state.retryCount + 1}/3)`);
      updateState({ 
        retryCount: state.retryCount + 1,
        voiceStatus: VOICE_STATUS.LOADING,
        voiceMessage: 'Retrying voice setup...',
        audioPermissionGranted: false
      });
      
      // Re-initialize after a short delay
      setTimeout(() => {
        initializeVapi();
      }, TIMING.RETRY_DELAY);
    }
  }, [state.retryCount, config.settings?.retryAttempts, updateState, initializeVapi]);

  // Toggle voice assistant
  const toggleVoiceAssistant = useCallback(async () => {
    const startTime = performance.now();
    console.log('🎵 [AUDIO TIMING] Button clicked at:', startTime.toFixed(2), 'ms');
    
    // Set global timing reference for complete flow tracking
    buttonClickTimeRef.current = startTime;
    
    // Provide immediate visual feedback
    updateState({ voiceStatus: VOICE_STATUS.LOADING, voiceMessage: 'Starting voice assistant...' });
    console.log('🎵 [AUDIO TIMING] State updated at:', (performance.now() - startTime).toFixed(2), 'ms');
    
    // Play filler audio immediately
    console.log('🎵 [AUDIO TIMING] Playing telephone ringing immediately');
    audioManager.playFillerAudio();
    
    // Initialize on first click if not already done
    if (!vapiIntegration.vapiReady && !initializationRef.current) {
      initializationRef.current = true;
      
      try {
        const result = await initializeVapi();
        
        // Now that initialization is complete, start listening immediately
        if (result && result.success) {
          if (result.vapi) {
            await vapiIntegration.startListeningWithVapi(result.vapi, config);
          } else {
            startListening(); // Demo mode
          }
          initializationRef.current = false;
        } else {
          throw new Error('Initialization failed');
        }
      } catch (error) {
        console.error('🔍 Initialization failed:', error);
        updateState({ voiceMessage: ERROR_MESSAGES.INITIALIZATION_FAILED, voiceStatus: VOICE_STATUS.ERROR });
        initializationRef.current = false;
        audioManager.stopFillerAudio(); // Stop filler audio on error
      }
      return;
    }

    // If initialization is in progress, show loading message
    if (initializationRef.current) {
      updateState({ voiceMessage: 'Voice assistant initializing...' });
      return;
    }

    if (!vapiIntegration.vapiReady) {
      updateState({ voiceMessage: 'Voice assistant loading...' });
      return;
    }

    if (state.isListening) {
      stopListening();
    } else {
      // If already initialized, start immediately
      if (vapiIntegration.vapi) {
        await vapiIntegration.startListeningWithVapi(vapiIntegration.vapi, config);
      } else {
        startListening();
      }
    }
  }, [state.isListening, vapiIntegration, config, initializeVapi, startListening, stopListening, audioManager, updateState]);

  // Pre-warm components
  useEffect(() => {
    if (isVoiceSupported && !vapiIntegration.vapiReady) {
      vapiIntegration.preWarmVapi();
    }
  }, [isVoiceSupported, vapiIntegration]);

  return {
    // State
    ...state,
    isVoiceSupported,
    isClient,
    isSafari,
    
    // Functions
    toggleVoiceAssistant,
    retryVoiceSetup,
    
    // Audio manager
    ...audioManager,
    
    // VAPI integration
    ...vapiIntegration
  };
};

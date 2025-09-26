import { useRef, useCallback, useState } from 'react';
import { createVapiInstance, setupVapiEventListeners, startVapiCall, stopVapiCall } from '../utils/vapiUtils';
import { VOICE_STATUS, TIMING } from '../constants/voiceConstants';

/**
 * Hook for managing VAPI integration
 * @param {Function} updateState - State update function
 * @param {Function} onShowResults - Show results callback
 * @param {Function} stopFillerAudio - Stop filler audio function
 * @param {Object} fillerAudioRef - Filler audio reference
 * @param {Object} buttonClickTimeRef - Button click time reference
 * @param {Function} handleFunctionCall - Function call handler
 * @param {boolean} isSafari - Whether running on Safari
 * @returns {Object} VAPI integration functions and state
 */
export const useVapiIntegration = (
  updateState, 
  onShowResults, 
  stopFillerAudio, 
  fillerAudioRef, 
  buttonClickTimeRef,
  handleFunctionCall,
  isSafari
) => {
  const [vapi, setVapi] = useState(null);
  const [vapiReady, setVapiReady] = useState(false);
  const vapiModuleRef = useRef(null);
  const preInitializedRef = useRef(false);

  // Pre-initialize VAPI module
  const preInitializeVapi = useCallback(async () => {
    try {
      if (!vapiModuleRef.current) {
        const { default: Vapi } = await import('@vapi-ai/web');
        vapiModuleRef.current = Vapi;
        console.log('🔍 VAPI module pre-loaded');
      }
    } catch (error) {
      console.warn('🔍 VAPI module pre-loading failed:', error);
    }
  }, []);

  // Initialize VAPI instance
  const initializeVapi = useCallback(async () => {
    const publicApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || 'YOUR_DEFAULT_VAPI_PUBLIC_KEY';
    
    console.log('🔍 VAPI Configuration Check:');
    console.log('🔍 Public API Key Available:', !!publicApiKey);
    console.log('🔍 Public API Key Length:', publicApiKey ? publicApiKey.length : 0);
    console.log('🔍 Public API Key Preview:', publicApiKey ? `${publicApiKey.substring(0, 8)}...` : 'None');
    
    if (publicApiKey && publicApiKey.length > 10) {
      console.log('🔍 Creating Vapi instance with public key...');
      try {
        // Use pre-loaded VAPI module if available, otherwise import
        let Vapi;
        if (vapiModuleRef.current) {
          Vapi = vapiModuleRef.current;
          console.log('🔍 Using pre-loaded VAPI module');
        } else {
          const { default: VapiModule } = await import('@vapi-ai/web');
          Vapi = VapiModule;
          vapiModuleRef.current = Vapi; // Cache for future use
          console.log('🔍 VAPI module loaded and cached');
        }
        
        // Create VAPI instance
        const vapiInstance = await createVapiInstance(publicApiKey, isSafari);
        
        // Setup event listeners
        setupVapiEventListeners(
          vapiInstance, 
          updateState, 
          onShowResults, 
          stopFillerAudio, 
          fillerAudioRef, 
          buttonClickTimeRef,
          handleFunctionCall
        );
        
        setVapi(vapiInstance);
        setVapiReady(true);
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
  }, [updateState, onShowResults, stopFillerAudio, fillerAudioRef, buttonClickTimeRef, handleFunctionCall, isSafari]);

  // Start VAPI call
  const startListeningWithVapi = useCallback(async (vapiInstance, config) => {
    const vapiStartTime = performance.now();
    console.log('🎵 [AUDIO TIMING] startListeningWithVapi called at:', vapiStartTime.toFixed(2), 'ms');
    
    try {
      console.log('🎵 [AUDIO TIMING] Starting Vapi call at:', (performance.now() - vapiStartTime).toFixed(2), 'ms');
      
      // Get assistant ID first
      const assistantId = config.assistantId || '81f49cc7-c40a-433d-8606-63c84babe3a9';
      
      // Start VAPI call
      const vapiCallStartTime = performance.now();
      console.log('🎵 [AUDIO TIMING] Starting VAPI call with assistant ID:', assistantId, 'at:', (vapiCallStartTime - vapiStartTime).toFixed(2), 'ms');
      await startVapiCall(vapiInstance, assistantId);
      console.log('🎵 [AUDIO TIMING] VAPI start() called in:', (performance.now() - vapiCallStartTime).toFixed(2), 'ms');
      
      updateState({ voiceStatus: VOICE_STATUS.LISTENING, voiceMessage: 'Listening...', isListening: true });
        
    } catch (startError) {
      console.error('🔍 Failed to start VAPI call:', startError);
      updateState({ voiceStatus: VOICE_STATUS.ERROR, voiceMessage: 'Voice assistant error', isListening: false });
      
      // Fall back to demo mode if VAPI start fails
      console.log('🔍 VAPI start failed, using demo mode...');
      updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Voice assistant ready (demo mode)', isListening: false });
    }
  }, [updateState]);

  // Stop VAPI call
  const stopVapiListening = useCallback(() => {
    try {
      if (vapi) {
        console.log('🔍 [STOP] Stopping VAPI connection...');
        stopVapiCall(vapi);
        console.log('🔍 [STOP] VAPI connection stopped');
        
        // Clean up the VAPI instance to prevent multiple instances
        console.log('🔍 [STOP] Destroying VAPI instance...');
        try {
          // Remove all event listeners
          vapi.removeAllListeners();
          console.log('🔍 [STOP] VAPI event listeners removed');
          
          // Additional cleanup for Krisp
          if (window.Krisp) {
            try {
              if (typeof window.Krisp.disable === 'function') {
                window.Krisp.disable();
              }
              if (typeof window.Krisp.unload === 'function') {
                window.Krisp.unload();
              }
              window.Krisp = null;
              console.log('🔍 [STOP] Krisp cleanup completed');
            } catch (krispCleanupError) {
              console.log('🔍 [STOP] Krisp cleanup error (non-critical):', krispCleanupError.message);
              window.Krisp = null;
            }
          }
        } catch (destroyError) {
          console.warn('🔍 [STOP] Error destroying VAPI instance:', destroyError);
        }
        
        // Clear the VAPI instance from state
        setVapi(null);
        setVapiReady(false);
        console.log('🔍 [STOP] VAPI instance cleared from state');
      }
      updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Ready to listen', isListening: false });
    } catch (error) {
      console.error('Failed to stop Vapi:', error);
      updateState({ voiceStatus: VOICE_STATUS.READY });
    }
  }, [vapi, updateState]);

  // Pre-warm VAPI connection
  const preWarmVapi = useCallback(async () => {
    if (!preInitializedRef.current) {
      preInitializedRef.current = true;
      await preInitializeVapi();
    }
  }, [preInitializeVapi]);

  return {
    vapi,
    vapiReady,
    initializeVapi,
    startListeningWithVapi,
    stopVapiListening,
    preWarmVapi
  };
};

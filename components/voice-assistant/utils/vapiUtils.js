import { VOICE_STATUS, DEFAULT_ASSISTANT_ID } from '../constants/voiceConstants';

/**
 * Setup VAPI event listeners
 * @param {Object} vapiInstance - VAPI instance
 * @param {Function} updateState - State update function
 * @param {Function} onShowResults - Show results callback
 * @param {Function} stopFillerAudio - Stop filler audio function
 * @param {Object} fillerAudioRef - Filler audio reference
 * @param {Object} buttonClickTimeRef - Button click time reference
 * @param {Function} handleFunctionCall - Function call handler
 */
export const setupVapiEventListeners = (
  vapiInstance, 
  updateState, 
  onShowResults, 
  stopFillerAudio, 
  fillerAudioRef, 
  buttonClickTimeRef,
  handleFunctionCall
) => {
  vapiInstance.on('call-start', () => {
    const callStartTime = performance.now();
    console.log('🎵 [AUDIO TIMING] VAPI call-start event received at:', callStartTime.toFixed(2), 'ms');
    
    // Log timing from button click to call start
    if (buttonClickTimeRef.current) {
      const callStartTimeFromButton = callStartTime - buttonClickTimeRef.current;
      console.log('🎵 [AUDIO TIMING] Button click to VAPI call start:', callStartTimeFromButton.toFixed(2), 'ms');
    }
    
    updateState({ voiceStatus: VOICE_STATUS.LISTENING, voiceMessage: 'Listening...', isListening: true });
    onShowResults(false); // Hide previous results on new call
  });

  vapiInstance.on('call-end', () => {
    console.log('🔍 Call ended');
    updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Voice assistant ready', isListening: false });
  });

  vapiInstance.on('speech-start', () => {
    const speechStartTime = performance.now();
    console.log('🎵 [AUDIO TIMING] VAPI speech-start event received at:', speechStartTime.toFixed(2), 'ms');
    
    // Log complete timing from button click to voice playback
    if (buttonClickTimeRef.current) {
      const totalTime = speechStartTime - buttonClickTimeRef.current;
      console.log('🎵 [AUDIO TIMING] COMPLETE FLOW: Button click to VAPI voice playback:', totalTime.toFixed(2), 'ms');
    }
    
    // Stop filler audio when VAPI voice actually starts
    if (fillerAudioRef.current) {
      const fillerDuration = performance.now() - fillerAudioRef.current.startTime;
      console.log('🎵 [AUDIO TIMING] VAPI voice started, stopping filler audio after', fillerDuration.toFixed(2), 'ms');
      stopFillerAudio();
    }
    
    updateState({ voiceStatus: VOICE_STATUS.SPEAKING });
  });

  vapiInstance.on('speech-end', () => {
    const speechEndTime = performance.now();
    console.log('🎵 [AUDIO TIMING] VAPI speech-end event received at:', speechEndTime.toFixed(2), 'ms');
    updateState({ voiceStatus: VOICE_STATUS.LISTENING });
  });

  vapiInstance.on('volume-level', (volume) => {
    // console.log('🔍 Volume level:', volume);
  });

  vapiInstance.on('message', (message) => {
    console.log('🔍 Vapi message:', message);
    
    if (message.type === 'transcript' && message.transcript) {
      console.log('🔍 Processing voice transcript:', message.transcript);
    } else if (message.type === 'function-call') {
      console.log('🔍 Function call received:', message);
      handleFunctionCall(message.functionCall);
    } else if (message.type === 'assistant-message') {
      const messageTime = performance.now();
      console.log('🎵 [AUDIO TIMING] Assistant message received at:', messageTime.toFixed(2), 'ms:', message.message);
      updateState({ voiceMessage: `Assistant: ${message.message}` });
    } else if (message.type === 'speech-start') {
      const assistantSpeechStartTime = performance.now();
      console.log('🎵 [AUDIO TIMING] Assistant speech-start event at:', assistantSpeechStartTime.toFixed(2), 'ms');
      updateState({ voiceStatus: VOICE_STATUS.SPEAKING });
      // Stop filler audio when assistant starts speaking
      stopFillerAudio();
    } else if (message.type === 'speech-end') {
      const assistantSpeechEndTime = performance.now();
      console.log('🎵 [AUDIO TIMING] Assistant speech-end event at:', assistantSpeechEndTime.toFixed(2), 'ms');
      updateState({ voiceStatus: VOICE_STATUS.LISTENING });
    } else if (message.type === 'status-update') {
      console.log('🔍 VAPI status update:', message.status, message.endedReason ? `(${message.endedReason})` : '');
      
      // Handle call ended status
      if (message.status === 'ended') {
        if (message.endedReason === 'customer-ended-call') {
          console.log('🔍 Call ended by customer (stop button clicked)');
          updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Voice assistant ready', isListening: false });
        } else {
          console.log('🔍 Call ended:', message.endedReason);
          updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Voice assistant ready', isListening: false });
        }
      }
    }
  });
  
  vapiInstance.on('error', (error) => {
    console.error('🔍 Vapi error:', error);
    
    // Handle Safari-specific setSinkId errors
    if (error.message && error.message.includes('setSinkId')) {
      console.log('🔍 Safari setSinkId error detected, continuing with default audio output');
      return;
    }
    
    // Handle Krisp filter errors
    if (error.message && 
        (error.message.includes('KrispInitError') ||
         error.message.includes('Krisp') ||
         error.message.includes('Error enabling Krisp filter') ||
         error.message.includes('error applying mic processor') ||
         error.message.includes('Cannot read properties of null'))) {
      console.log('🔍 Krisp filter error detected, this is usually non-critical');
      // Don't update state for Krisp errors as they don't affect core functionality
      return;
    }
    
    // Handle setSinkId AbortError (Chrome audio output switching)
    if (error.message && 
        (error.message.includes('setSinkId failed') ||
         error.message.includes('AbortError') ||
         error.message.includes('The operation could not be performed and was aborted'))) {
      console.log('🔍 setSinkId error detected, this is usually non-critical');
      // Don't update state for setSinkId errors as they don't affect functionality
      return;
    }
    
    // Handle WebRTC signaling connection errors
    if (error.message && 
        (error.message.includes('Signaling connection interrupted') ||
         error.message.includes('disconnect') ||
         error.message.includes('WebRTC') ||
         error.message.includes('Daily'))) {
      console.log('🔍 WebRTC signaling error detected, this is usually non-critical');
      // Don't update state for signaling errors as they're often temporary
      return;
    }
    
    // Handle Krisp SDK duplication warnings
    if (error.message && 
        (error.message.includes('KrispSDK') ||
         error.message.includes('duplicated') ||
         error.message.includes('only imported once'))) {
      console.log('🔍 Krisp SDK warning detected, this is usually non-critical');
      // Don't update state for SDK warnings as they don't affect functionality
      return;
    }
    
    // Handle specific validation errors
    if (error.type === 'validation-error') {
      console.log('🔍 VAPI validation error, falling back to demo mode');
      updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Voice assistant ready (demo mode)', isListening: false });
      return;
    }
    
    // Handle start method errors (like 403 Forbidden)
    if (error.type === 'start-method-error') {
      console.log('🔍 VAPI start method error, falling back to demo mode');
      updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Voice assistant ready (demo mode)', isListening: false });
      return;
    }
    
    updateState({ voiceStatus: VOICE_STATUS.ERROR, voiceMessage: 'Voice assistant error', isListening: false });
  });
};

/**
 * Create VAPI instance with error handling
 * @param {string} publicApiKey - VAPI public API key
 * @param {boolean} isSafari - Whether running on Safari
 * @returns {Promise<Object>} VAPI instance
 */
export const createVapiInstance = async (publicApiKey, isSafari) => {
  try {
    const { default: Vapi } = await import('@vapi-ai/web');
    
    // Create VAPI instance with just the API key
    const vapiInstance = new Vapi(publicApiKey);
    
    // Add Safari-specific error handling for setSinkId
    if (isSafari) {
      console.log('🔍 Safari detected, adding setSinkId error handling');
      const originalSetSinkId = vapiInstance.setSinkId;
      if (originalSetSinkId) {
        vapiInstance.setSinkId = function(...args) {
          console.log('🔍 setSinkId called on Safari, ignoring to prevent NotAllowedError');
          return Promise.resolve();
        };
      }
    }
    
    return vapiInstance;
  } catch (error) {
    console.error('🔍 Failed to create VAPI instance:', error);
    throw error;
  }
};

/**
 * Start VAPI call with assistant ID
 * @param {Object} vapiInstance - VAPI instance
 * @param {string} assistantId - Assistant ID
 * @returns {Promise<void>}
 */
export const startVapiCall = async (vapiInstance, assistantId) => {
  try {
    const finalAssistantId = assistantId || DEFAULT_ASSISTANT_ID;
    console.log('🔍 Starting VAPI call with assistant ID:', finalAssistantId);
    vapiInstance.start(finalAssistantId);
  } catch (error) {
    console.error('🔍 Failed to start VAPI call:', error);
    throw error;
  }
};

/**
 * Stop VAPI call
 * @param {Object} vapiInstance - VAPI instance
 */
export const stopVapiCall = (vapiInstance) => {
  try {
    if (vapiInstance) {
      // Handle Krisp cleanup before stopping
      try {
        // Check if Krisp is available and clean it up
        if (window.Krisp && typeof window.Krisp === 'object') {
          // Try to disable Krisp if it's available
          if (typeof window.Krisp.disable === 'function') {
            try {
              window.Krisp.disable();
              console.log('🔍 Krisp filter disabled');
            } catch (disableError) {
              console.log('🔍 Krisp disable error (non-critical):', disableError.message);
            }
          }
          
          // Try to unload Krisp processor if available
          if (typeof window.Krisp.unload === 'function') {
            try {
              window.Krisp.unload();
              console.log('🔍 Krisp processor unloaded');
            } catch (unloadError) {
              console.log('🔍 Krisp unload error (non-critical):', unloadError.message);
            }
          }
          
          // Clear Krisp reference to prevent further access
          window.Krisp = null;
          console.log('🔍 Krisp reference cleared');
        }
      } catch (krispError) {
        console.log('🔍 Krisp cleanup error (non-critical):', krispError.message);
        // Force clear Krisp reference even if cleanup failed
        try {
          window.Krisp = null;
        } catch (clearError) {
          console.log('🔍 Krisp reference clear error (non-critical):', clearError.message);
        }
      }
      
      vapiInstance.stop();
      console.log('🔍 Vapi stopped');
    }
  } catch (error) {
    console.error('Failed to stop Vapi:', error);
  }
};

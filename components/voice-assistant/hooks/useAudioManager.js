import { useRef, useCallback, useEffect } from 'react';
import { playFillerAudio, stopFillerAudio, createSpeechUtterance, isSpeechSynthesisSupported, cancelAllSpeech } from '../utils/audioUtils';
import { VOICE_STATUS } from '../constants/voiceConstants';

/**
 * Hook for managing audio operations (filler audio and speech synthesis)
 * @param {Function} updateState - State update function
 * @param {Object} config - Configuration object
 * @returns {Object} Audio management functions and refs
 */
export const useAudioManager = (updateState, config) => {
  const fillerAudioRef = useRef(null);
  const fillerAudioTimeoutRef = useRef(null);
  const speechActiveRef = useRef(false);
  const speechTimeoutRef = useRef(null);
  const lastSpeechCommandRef = useRef('');
  const speechQueueRef = useRef([]);

  // Play filler audio wrapper
  const playFillerAudioWrapper = useCallback(() => {
    return playFillerAudio(fillerAudioRef, () => stopFillerAudioWrapper());
  }, []);

  // Stop filler audio wrapper
  const stopFillerAudioWrapper = useCallback(() => {
    stopFillerAudio(fillerAudioRef, fillerAudioTimeoutRef);
  }, []);

  // Speak demo response using Web Speech API
  const speakDemoResponse = useCallback((command) => {
    if (!isSpeechSynthesisSupported()) {
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
    cancelAllSpeech();
    
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

      // Create speech synthesis utterance
      const utterance = createSpeechUtterance(responseText, config);

      // Handle speech events
      utterance.onstart = () => {
        console.log('🔍 Product voice output started');
        speechActiveRef.current = true;
        lastSpeechCommandRef.current = command;
        updateState({ voiceStatus: VOICE_STATUS.SPEAKING });
      };

      utterance.onend = () => {
        console.log('🔍 Product voice output ended');
        speechActiveRef.current = false;
        updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Ready to listen (product mode)' });
        
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
        updateState({ voiceStatus: VOICE_STATUS.READY, voiceMessage: 'Ready to listen (product mode)' });
        
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
  }, [config, updateState]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up filler audio
      stopFillerAudioWrapper();
      
      // Clean up speech synthesis
      if (speechSynthesis.speaking) {
        cancelAllSpeech();
      }
      
      // Clean up timeouts
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if (fillerAudioTimeoutRef.current) {
        clearTimeout(fillerAudioTimeoutRef.current);
      }
    };
  }, [stopFillerAudioWrapper]);

  return {
    // Refs
    fillerAudioRef,
    fillerAudioTimeoutRef,
    speechActiveRef,
    speechTimeoutRef,
    lastSpeechCommandRef,
    speechQueueRef,
    
    // Functions
    playFillerAudio: playFillerAudioWrapper,
    stopFillerAudio: stopFillerAudioWrapper,
    speakDemoResponse
  };
};

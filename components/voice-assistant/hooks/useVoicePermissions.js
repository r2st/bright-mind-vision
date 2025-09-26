import { useState, useEffect, useCallback } from 'react';
import { ERROR_MESSAGES } from '../constants/voiceConstants';

/**
 * Hook for managing voice permissions and browser compatibility
 * @returns {Object} Voice permissions state and functions
 */
export const useVoicePermissions = () => {
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  // Detect Safari browser
  const detectSafari = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    console.log('🔍 Safari detected:', isSafari);
    return isSafari;
  }, []);

  // Check browser compatibility for voice features
  const checkVoiceSupport = useCallback(() => {
    // Only run on client side
    if (typeof window === 'undefined') return false;
    
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
    }
    
    console.log('🔍 Voice supported: HTTP localhost on desktop');
    return true;
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      console.log('🎤 [MICROPHONE] Starting microphone permission request...');
      console.log('🎤 [MICROPHONE] Protocol:', location.protocol);
      console.log('🎤 [MICROPHONE] Hostname:', location.hostname);
      console.log('🎤 [MICROPHONE] User Agent:', navigator.userAgent);
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('🎤 [MICROPHONE] ERROR: getUserMedia not supported in this browser');
        throw new Error('getUserMedia not supported in this browser');
      }
      
      // Check if we're on HTTPS or localhost
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.log('🎤 [MICROPHONE] ERROR: Not HTTPS or localhost');
        throw new Error('getUserMedia requires HTTPS or localhost');
      }
      
      // Check if we're on mobile and provide better audio constraints
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log('🎤 [MICROPHONE] Is Mobile:', isMobile);
      
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
      
      console.log('🎤 [MICROPHONE] Audio constraints:', audioConstraints);
      
      // Check for permissions policy
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          console.log('🎤 [MICROPHONE] Permission status:', permissionStatus.state);
          if (permissionStatus.state === 'denied') {
            console.log('🎤 [MICROPHONE] ERROR: Microphone permission denied by permissions policy');
            console.log('🎤 [MICROPHONE] SOLUTION: Check browser settings and allow microphone access for this site');
            throw new Error('Microphone permission denied by permissions policy - check browser settings');
          }
        } catch (permError) {
          console.log('🎤 [MICROPHONE] Could not check permission status:', permError.message);
        }
      }
      
      console.log('🎤 [MICROPHONE] Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      console.log('🎤 [MICROPHONE] SUCCESS: Microphone access granted');
      console.log('🎤 [MICROPHONE] Stream tracks:', stream.getTracks().length);
      
      stream.getTracks().forEach(track => {
        console.log('🎤 [MICROPHONE] Stopping track:', track.kind, track.label);
        track.stop();
      });
      
      setAudioPermissionGranted(true);
      console.log('🎤 [MICROPHONE] Audio permission granted.');
      return true;
    } catch (error) {
      console.warn('🎤 [MICROPHONE] ERROR: Audio permission denied or timeout:', error);
      console.warn('🎤 [MICROPHONE] ERROR Type:', error.name);
      console.warn('🎤 [MICROPHONE] ERROR Message:', error.message);
      console.warn('🎤 [MICROPHONE] ERROR Stack:', error.stack);
      setAudioPermissionGranted(false);
      throw error;
    }
  }, []);

  // Get user-friendly error message for microphone permission errors
  const getMicrophoneErrorMessage = useCallback((error) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (error.message.includes('not supported')) {
      return 'Voice features not supported in this browser.';
    } else if (error.message.includes('HTTPS')) {
      return 'Voice features require HTTPS connection.';
    } else if (error.message.includes('NotAllowedError') || error.message.includes('denied') || error.message.includes('permissions-policy')) {
      return isMobile ? 
        ERROR_MESSAGES.MICROPHONE_DENIED :
        ERROR_MESSAGES.MICROPHONE_DENIED;
    } else if (error.message.includes('NotFoundError')) {
      return 'No microphone found. Please connect a microphone and try again.';
    } else if (error.message.includes('timeout')) {
      return isMobile ? 
        'Microphone access timed out. Please try again and allow microphone access when prompted.' :
        'Microphone access timed out. Please try again.';
    } else {
      return isMobile ? 
        'Voice features require microphone access. Please check your browser settings and try again.' :
        'Microphone access denied. Voice assistant disabled.';
    }
  }, []);

  // Initialize voice permissions
  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true);
    
    // Detect Safari
    setIsSafari(detectSafari());
    
    // Check compatibility after client-side hydration
    const supportResult = checkVoiceSupport();
    setIsVoiceSupported(supportResult);
    
    // Add global error handler for Safari setSinkId errors and permissions policy violations
    const handleGlobalError = (event) => {
      if (event.error && event.error.message && event.error.message.includes('setSinkId')) {
        console.log('🔍 Global Safari setSinkId error caught and ignored');
        event.preventDefault();
        return false;
      }
      
      // Handle Krisp filter errors
      if (event.error && event.error.message && 
          (event.error.message.includes('KrispInitError') || 
           event.error.message.includes('Krisp') ||
           event.error.message.includes('WASM_OR_WORKER_NOT_READY') ||
           event.error.message.includes('Cannot read properties of null') ||
           event.error.message.includes('didInitError') ||
           event.error.message.includes('Error enabling Krisp filter') ||
           event.error.message.includes('error applying mic processor'))) {
        console.log('🔍 Global Krisp error caught and ignored:', event.error.message);
        event.preventDefault();
        return false;
      }
      
      // Handle WebRTC/Daily.co signaling connection errors
      if (event.error && event.error.message && 
          (event.error.message.includes('Signaling connection interrupted') ||
           event.error.message.includes('disconnect') ||
           event.error.message.includes('WebRTC') ||
           event.error.message.includes('Daily'))) {
        console.log('🔍 Global WebRTC signaling error caught and ignored:', event.error.message);
        event.preventDefault();
        return false;
      }
      
      // Handle setSinkId AbortError (Chrome audio output switching)
      if (event.error && event.error.message && 
          (event.error.message.includes('setSinkId failed') ||
           event.error.message.includes('AbortError') ||
           event.error.message.includes('The operation could not be performed and was aborted'))) {
        console.log('🔍 Global setSinkId error caught and ignored:', event.error.message);
        event.preventDefault();
        return false;
      }
      
      // Handle Krisp SDK duplication warnings
      if (event.error && event.error.message && 
          (event.error.message.includes('KrispSDK') ||
           event.error.message.includes('duplicated') ||
           event.error.message.includes('only imported once'))) {
        console.log('🔍 Global Krisp SDK warning caught and ignored:', event.error.message);
        event.preventDefault();
        return false;
      }
      
      // Handle permissions policy violations
      if (event.error && event.error.message && 
          (event.error.message.includes('permissions-policy') || 
           event.error.message.includes('microphone') ||
           event.error.message.includes('NotAllowedError'))) {
        console.log('🎤 [GLOBAL ERROR] Permissions policy violation caught:', event.error.message);
      }
    };
    
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('permissions-policy') || 
           event.reason.message.includes('microphone') ||
           event.reason.message.includes('NotAllowedError'))) {
        console.log('🎤 [GLOBAL REJECTION] Permissions policy violation caught:', event.reason.message);
      }
      
      // Handle Krisp filter errors in promise rejections
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('KrispInitError') || 
           event.reason.message.includes('Krisp') ||
           event.reason.message.includes('WASM_OR_WORKER_NOT_READY') ||
           event.reason.message.includes('Cannot read properties of null') ||
           event.reason.message.includes('didInitError') ||
           event.reason.message.includes('Error enabling Krisp filter') ||
           event.reason.message.includes('error applying mic processor'))) {
        console.log('🔍 Global Krisp rejection caught and ignored:', event.reason.message);
        event.preventDefault();
        return false;
      }
      
      // Handle WebRTC/Daily.co signaling connection errors in promise rejections
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('Signaling connection interrupted') ||
           event.reason.message.includes('disconnect') ||
           event.reason.message.includes('WebRTC') ||
           event.reason.message.includes('Daily'))) {
        console.log('🔍 Global WebRTC signaling rejection caught and ignored:', event.reason.message);
        event.preventDefault();
        return false;
      }
      
      // Handle setSinkId AbortError in promise rejections
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('setSinkId failed') ||
           event.reason.message.includes('AbortError') ||
           event.reason.message.includes('The operation could not be performed and was aborted'))) {
        console.log('🔍 Global setSinkId rejection caught and ignored:', event.reason.message);
        event.preventDefault();
        return false;
      }
      
      // Handle Krisp SDK duplication warnings in promise rejections
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('KrispSDK') ||
           event.reason.message.includes('duplicated') ||
           event.reason.message.includes('only imported once'))) {
        console.log('🔍 Global Krisp SDK warning rejection caught and ignored:', event.reason.message);
        event.preventDefault();
        return false;
      }
    };
    
    // Store original console methods
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    // Override console.warn to catch VAPI/Daily.co warnings
    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Handle VAPI/Daily.co warnings
      if (message.includes('Signaling connection interrupted') ||
          message.includes('KrispSDK') ||
          message.includes('duplicated') ||
          message.includes('only imported once') ||
          message.includes('setSinkId failed') ||
          message.includes('AbortError')) {
        console.log('🔍 Console warning caught and handled:', message);
        return; // Don't show the original warning
      }
      
      // Call original console.warn for other messages
      originalConsoleWarn.apply(console, args);
    };
    
    // Override console.error to catch VAPI/Daily.co errors
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Handle VAPI/Daily.co errors
      if (message.includes('Signaling connection interrupted') ||
          message.includes('KrispSDK') ||
          message.includes('duplicated') ||
          message.includes('only imported once') ||
          message.includes('setSinkId failed') ||
          message.includes('AbortError') ||
          message.includes('KrispInitError') ||
          message.includes('Error enabling Krisp filter') ||
          message.includes('error applying mic processor')) {
        console.log('🔍 Console error caught and handled:', message);
        return; // Don't show the original error
      }
      
      // Call original console.error for other messages
      originalConsoleError.apply(console, args);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      
      // Restore original console methods
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, [detectSafari, checkVoiceSupport]);

  return {
    isVoiceSupported,
    isClient,
    isSafari,
    audioPermissionGranted,
    requestMicrophonePermission,
    getMicrophoneErrorMessage
  };
};

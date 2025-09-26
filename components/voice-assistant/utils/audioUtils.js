import { AUDIO_FILES, AUDIO_SETTINGS } from '../constants/voiceConstants';

/**
 * Create and play telephone ringing filler audio
 * @param {Object} fillerAudioRef - Reference to store audio element
 * @param {Function} stopFillerAudio - Function to stop existing audio
 * @returns {Promise<void>}
 */
export const playFillerAudio = (fillerAudioRef, stopFillerAudio) => {
  const audioStartTime = performance.now();
  console.log('🎵 [AUDIO TIMING] playFillerAudio called at:', audioStartTime.toFixed(2), 'ms');
  
  try {
    // Stop any existing filler audio
    stopFillerAudio();
    console.log('🎵 [AUDIO TIMING] Stopped existing filler audio at:', (performance.now() - audioStartTime).toFixed(2), 'ms');
    
    // Create HTML audio element for the telephone ringing sound
    const audioElement = new Audio(AUDIO_FILES.FILLER_AUDIO);
    audioElement.loop = true;
    audioElement.volume = AUDIO_SETTINGS.FILLER_AUDIO_VOLUME;
    
    // Store reference for stopping with start time for duration tracking
    fillerAudioRef.current = { 
      audioElement,
      startTime: performance.now()
    };
    
    // Play the audio
    const playbackStartTime = performance.now();
    console.log('🎵 [AUDIO TIMING] Starting telephone ringing at:', (playbackStartTime - audioStartTime).toFixed(2), 'ms');
    
    return audioElement.play().then(() => {
      console.log('🎵 [AUDIO TIMING] Telephone ringing started successfully at:', (performance.now() - audioStartTime).toFixed(2), 'ms');
      console.log('🎵 [AUDIO TIMING] Filler audio will play until VAPI voice starts');
    }).catch(error => {
      // Handle AbortError gracefully - this is expected when audio is interrupted
      if (error.name === 'AbortError') {
        console.log('🎵 [AUDIO TIMING] Telephone ringing interrupted (expected when stopping)');
        return; // Don't throw, just log and continue
      }
      console.warn('🎵 [AUDIO TIMING] Failed to play telephone ringing:', error);
      fillerAudioRef.current = null;
      throw error;
    });
    
  } catch (error) {
    console.warn('🔍 Failed to play filler audio:', error);
    throw error;
  }
};

/**
 * Stop filler audio
 * @param {Object} fillerAudioRef - Reference to audio element
 * @param {Object} fillerAudioTimeoutRef - Reference to timeout
 */
export const stopFillerAudio = (fillerAudioRef, fillerAudioTimeoutRef) => {
  try {
    if (fillerAudioRef.current) {
      // Calculate duration if startTime is available
      if (fillerAudioRef.current.startTime) {
        const duration = performance.now() - fillerAudioRef.current.startTime;
        console.log('🎵 [AUDIO TIMING] Stopping filler audio after', duration.toFixed(2), 'ms');
      }
      
      // Stop and reset the HTML audio element
      if (fillerAudioRef.current.audioElement) {
        try {
          // Pause the audio element
          fillerAudioRef.current.audioElement.pause();
          // Reset to beginning
          fillerAudioRef.current.audioElement.currentTime = 0;
          // Remove event listeners to prevent memory leaks
          fillerAudioRef.current.audioElement.onplay = null;
          fillerAudioRef.current.audioElement.onpause = null;
          fillerAudioRef.current.audioElement.onerror = null;
        } catch (audioError) {
          console.log('🎵 [AUDIO TIMING] Audio element cleanup error (non-critical):', audioError.message);
        }
      }
      
      fillerAudioRef.current = null;
    }
    
    if (fillerAudioTimeoutRef.current) {
      clearTimeout(fillerAudioTimeoutRef.current);
      fillerAudioTimeoutRef.current = null;
    }
    
    console.log('🔍 Stopped telephone ringing audio');
  } catch (error) {
    console.warn('🔍 Error stopping filler audio:', error);
  }
};

/**
 * Create speech synthesis utterance with optimized settings
 * @param {string} text - Text to speak
 * @param {Object} config - Configuration object
 * @returns {SpeechSynthesisUtterance}
 */
export const createSpeechUtterance = (text, config) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = config.settings?.speechRate || AUDIO_SETTINGS.SPEECH_RATE;
  utterance.pitch = AUDIO_SETTINGS.SPEECH_PITCH;
  utterance.volume = config.settings?.speechVolume || AUDIO_SETTINGS.SPEECH_VOLUME;
  
  // Get voices and select the best available one
  const voices = window.speechSynthesis.getVoices();
  console.log('🔍 Available voices:', voices.length);
  
  // Quick voice selection - prioritize first good English voice
  let selectedVoice = voices.find(voice => 
    voice.lang.startsWith('en') && 
    (voice.name.includes('Google') || voice.name.includes('Microsoft'))
  ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    console.log('🔍 Using voice:', selectedVoice.name);
  } else {
    console.log('🔍 Using default voice');
  }
  
  return utterance;
};

/**
 * Check if speech synthesis is supported
 * @returns {boolean}
 */
export const isSpeechSynthesisSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * Cancel all speech synthesis
 */
export const cancelAllSpeech = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

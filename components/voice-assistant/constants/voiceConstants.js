// Voice Assistant Constants
export const VOICE_STATUS = {
  READY: 'ready',
  LOADING: 'loading',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  ERROR: 'error'
};

export const AUDIO_SETTINGS = {
  FILLER_AUDIO_VOLUME: 0.3,
  SPEECH_RATE: 0.8,
  SPEECH_VOLUME: 0.9,
  SPEECH_PITCH: 1
};

export const TIMING = {
  FAST_TIMEOUT: 2000,
  VAPI_TIMEOUT: 10000,
  SPEECH_TIMEOUT: 50,
  RETRY_DELAY: 1000
};

export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const DEFAULT_ASSISTANT_ID = '81f49cc7-c40a-433d-8606-63c84babe3a9';

export const AUDIO_FILES = {
  FILLER_AUDIO: '/telephone-dial-and-call-ring.mp3'
};

export const ERROR_MESSAGES = {
  NO_CONFIG: 'VoiceAssistant requires a config prop',
  VOICE_NOT_SUPPORTED: 'Voice features not supported in this browser',
  MICROPHONE_DENIED: 'Microphone access blocked by browser security policy. Please check your browser settings and allow microphone access for this site.',
  NO_MICROPHONE: 'No microphone found. Please connect a microphone and try again.',
  HTTPS_REQUIRED: 'Voice features require HTTPS connection.',
  INITIALIZATION_FAILED: 'Voice assistant initialization failed'
};

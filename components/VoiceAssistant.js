import React, { useMemo } from 'react';
import { useVoiceAssistant } from './voice-assistant/hooks/useVoiceAssistant';

const VoiceAssistant = ({ 
  config,
  onSearchResults, 
  onShowResults,
  className = '',
  style = {}
}) => {
  // Use the main voice assistant hook
  const {
    isListening,
    voiceMessage,
    voiceStatus,
    isClient,
    assistantIdLoaded,
    retryCount,
    toggleVoiceAssistant,
    retryVoiceSetup
  } = useVoiceAssistant(config, onSearchResults, onShowResults);

  // Memoized styles for better performance
  const styles = useMemo(() => ({
    container: { 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    },
    button: {
      padding: '18px 36px',
      background: isListening 
        ? 'linear-gradient(135deg, #ff4d4d 0%, #e63939 100%)' 
        : 'rgba(255, 255, 255, 0.15)',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: isListening ? '#ff4d4d' : 'rgba(255, 255, 255, 0.3)',
      borderRadius: '50px',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: voiceStatus === 'loading' ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      justifyContent: 'center',
      minWidth: '240px',
      maxWidth: '300px',
      width: 'auto',
      boxShadow: isListening 
        ? '0 8px 25px rgba(255, 77, 77, 0.4), 0 0 20px rgba(255, 77, 77, 0.2)' 
        : '0 8px 25px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.1)',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
      outline: 'none',
      transform: 'scale(1)',
      opacity: 1
    },
    status: {
      marginTop: '20px',
      fontSize: '16px',
      color: '#ffffff',
      textAlign: 'center',
      minHeight: '24px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      width: '100%',
      maxWidth: '400px'
    },
    spinner: { fontSize: '20px' },
    microphone: { 
      fontSize: '18px',
      transition: 'all 0.3s ease',
      filter: isListening ? 'drop-shadow(0 0 8px rgba(255, 77, 77, 0.6))' : 'none'
    },
    statusSubtext: { fontSize: '14px', opacity: 0.8, marginTop: '5px' },
    buttonText: { 
      textShadow: 'none', 
      background: 'transparent',
      border: 'none',
      color: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      whiteSpace: 'nowrap'
    }
  }), [isListening, voiceStatus]);

  // Simplified event handlers to prevent double-click issues
  const eventHandlers = useMemo(() => ({
    onTouchStart: (e) => {
      if (voiceStatus !== 'loading') {
        e.currentTarget.style.transform = 'scale(0.98)';
        e.currentTarget.style.opacity = '0.9';
      }
    },
    onTouchEnd: (e) => {
      if (voiceStatus !== 'loading') {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.opacity = '1';
      }
    },
    onMouseOver: (e) => {
      if (voiceStatus !== 'loading' && window.matchMedia('(hover: hover)').matches) {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.opacity = '0.9';
      }
    },
    onMouseOut: (e) => {
      if (voiceStatus !== 'loading' && window.matchMedia('(hover: hover)').matches) {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.opacity = '1';
      }
    }
  }), [voiceStatus]);

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div style={styles.container} className={className}>
        <button 
          style={{
            ...styles.button,
            background: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            opacity: 0.8,
            cursor: 'not-allowed',
            boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 255, 255, 0.05)'
          }}
          disabled
        >
          <i className="fas fa-microphone" style={styles.microphone}></i>
          <span style={styles.buttonText}>Loading...</span>
        </button>
        <div style={styles.status}>
          Initializing voice assistant...
        </div>
      </div>
    );
  }

  return (
    <div style={{...styles.container, ...style}} className={className}>
      <button 
        onClick={toggleVoiceAssistant}
        style={styles.button}
        disabled={voiceStatus === 'loading'}
        {...eventHandlers}
        type="button"
      >
        {voiceStatus === 'loading' ? (
          <i className="fas fa-spinner fa-spin" style={styles.spinner}></i>
        ) : isListening ? (
          <i className="fas fa-stop" style={styles.microphone}></i>
        ) : (
          <i className="fas fa-microphone" style={styles.microphone}></i>
        )}
        <span style={styles.buttonText}>
          {voiceStatus === 'loading' ? 'Preparing Assistant...' : 
           isListening ? 'Stop Listening' : config.ui.buttonText}
        </span>
      </button>
      
      <div style={styles.status}>
        {voiceMessage}
        {assistantIdLoaded && (
          <div style={styles.statusSubtext}>
            ✓ Assistant ready for instant start
          </div>
        )}
        {voiceStatus === 'error' && retryCount < 3 && (
          <button
            onClick={retryVoiceSetup}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#3A7A6B',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              textShadow: 'none'
            }}
            onTouchStart={(e) => {
              e.target.style.background = '#2D5A4E';
            }}
            onTouchEnd={(e) => {
              e.target.style.background = '#3A7A6B';
            }}
            onMouseOver={(e) => {
              if (window.matchMedia('(hover: hover)').matches) {
                e.target.style.background = '#2D5A4E';
              }
            }}
            onMouseOut={(e) => {
              if (window.matchMedia('(hover: hover)').matches) {
                e.target.style.background = '#3A7A6B';
              }
            }}
          >
            Retry Voice Setup
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;

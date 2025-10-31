import React, { useState, useEffect, useRef } from 'react';
import SEO from '../../components/SEO';
import MainLayout from '../../components/MainLayout';
import styles from './shopping-assistant.module.css';

const EcommerceChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationContext, setConversationContext] = useState({
    lastCategory: null,
    conversationId: `conv_${Date.now()}`
  });
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Scroll to the actual bottom of the container, accounting for padding
      const container = messagesContainerRef.current;
      const scrollHeight = container.scrollHeight;
      
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        container.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
      });
    } else if (messagesEndRef.current) {
      // Fallback to scrollIntoView if container ref is not available
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    // Add fullscreen class to body and html
    document.body.classList.add('fullscreen-chat');
    document.documentElement.classList.add('fullscreen-chat');
    
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      text: "Hello! 👋 I'm your AI shopping assistant. I can help you find luxury products across categories like fashion, skincare, wellness, and more. What would you like to explore today?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    setIsConnected(true);

    // Cleanup function to remove classes when component unmounts
    return () => {
      document.body.classList.remove('fullscreen-chat');
      document.documentElement.classList.remove('fullscreen-chat');
    };
  }, []);

  useEffect(() => {
    // Always scroll to bottom when messages change
    if (messages.length > 0) {
      // Use a slightly longer timeout to ensure DOM has fully rendered
      const timer = setTimeout(scrollToBottom, 150);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const sendMessage = async (quickReplyNumber = null, quickReplyText = null) => {
    // Prevent double submissions
    if (isLoading) return;
    
    // Safely extract message text - ensure it's always a string primitive
    let messageText = '';
    let hasQuickReply = false;
    
    if (quickReplyText && typeof quickReplyText === 'string' && quickReplyText.trim()) {
      messageText = quickReplyText.trim();
    } else if (quickReplyNumber !== null && quickReplyNumber !== undefined && typeof quickReplyNumber === 'number') {
      // This is a numeric quick reply - don't convert to text, keep as number
      hasQuickReply = true;
      messageText = ''; // Will use quickReply in payload
    } else if (inputMessage && typeof inputMessage === 'string' && inputMessage.trim()) {
      messageText = inputMessage.trim();
    }
    
    // Validate we have something to send
    if (!hasQuickReply && (!messageText || !messageText.trim())) {
      return; // Nothing to send
    }

    // For user display, show the text or a quick reply indicator
    let displayText = messageText;
    if (hasQuickReply && quickReplyNumber !== null) {
      // Show quick reply number for user feedback
      displayText = `Quick reply: ${quickReplyNumber}`;
    }

    const userMessage = {
      id: Date.now(),
      text: displayText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Focus and highlight the input after sending message
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);

    try {
        // Clean context to avoid circular references - only include serializable primitive values
        // Extract only string/number/boolean/null values, ignore any React refs or DOM elements
        const cleanContext = {
          conversationId: (typeof conversationContext?.conversationId === 'string') 
            ? conversationContext.conversationId 
            : `conv_${Date.now()}`,
          lastCategory: (typeof conversationContext?.lastCategory === 'string' || conversationContext?.lastCategory === null)
            ? conversationContext.lastCategory 
            : null,
          source: 'web',
          timestamp: new Date().toISOString()
        };

        // Ensure we have valid data to send (plain object, no circular refs)
        // API requires either 'message' or 'quickReply', never both, never neither
        let payload;
        
        // Priority: if we have a quickReply number, use that (explicit numeric quick reply)
        if (hasQuickReply && quickReplyNumber !== null && quickReplyNumber !== undefined) {
          const quickReplyNum = Number(quickReplyNumber);
          if (!isNaN(quickReplyNum)) {
            payload = {
              quickReply: quickReplyNum,
              customerId: `web-${Date.now()}`,
              context: cleanContext
            };
          } else {
            // Invalid quick reply number, fall back to message
            payload = {
              message: String(messageText || ''),
              customerId: `web-${Date.now()}`,
              context: cleanContext
            };
          }
        } else if (messageText && messageText.trim()) {
          // Use message text (this handles regular messages and text-based quick replies)
          payload = {
            message: String(messageText.trim()),
            customerId: `web-${Date.now()}`,
            context: cleanContext
          };
        } else {
          // This should never happen due to validation above, but add safety
          console.error('Invalid payload: no message or quickReply');
          throw new Error('Cannot send empty message');
        }
        
        // Final validation: ensure payload has message OR quickReply
        if (!payload.message && (payload.quickReply === null || payload.quickReply === undefined)) {
          console.error('Payload validation failed:', payload);
          throw new Error('Payload must have either message or quickReply');
        }

        // Validate payload is JSON-serializable before sending
        try {
          JSON.stringify(payload);
        } catch (jsonError) {
          console.error('Payload contains non-serializable data:', jsonError);
          // Create a minimal safe payload
          const safePayload = {
            message: String(messageText || ''),
            customerId: `web-${Date.now()}`,
            context: {
              conversationId: `conv_${Date.now()}`,
              source: 'web',
              timestamp: new Date().toISOString()
            }
          };
          payload.message = safePayload.message;
          payload.customerId = safePayload.customerId;
          payload.context = safePayload.context;
        }

        // Add timeout for mobile networks
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch('/api/meshai/langgraph-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

        clearTimeout(timeoutId);

      // Check if response is ok before parsing
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          // Try to parse as JSON for better error message
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error) {
              errorText = errorJson.error;
            } else if (errorJson.message) {
              errorText = errorJson.message;
            }
          } catch {
            // Not JSON, use text as-is
          }
        } catch {
          errorText = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error('API Error Response:', response.status, errorText);
        
        // For 400 errors, show more helpful message
        if (response.status === 400) {
          throw new Error(`Invalid request: ${errorText || 'Please check your input and try again.'}`);
        }
        throw new Error(`Server error: ${response.status} ${errorText || response.statusText}`);
      }

      const data = await response.json();

      // Log full response for debugging
      if (!data.success) {
        console.error('❌ API returned error response:', {
          success: data.success,
          error: data.error,
          errorType: data.errorType,
          metadata: data.metadata,
          status: response.status,
          fullResponse: data
        });
      }

      // Handle response - use naturalResponse if available, even if success is false
      let botResponse = '';
      
      if (data.naturalResponse) {
        // Use natural language response from API (even if success is false, the message might be helpful)
        const { naturalResponse } = data;
        
        // Update conversation context based on response
        if (naturalResponse.metadata?.context?.lastCategory) {
          setConversationContext(prev => ({
            ...prev,
            lastCategory: naturalResponse.metadata.context.lastCategory
          }));
        }
        
        botResponse = `${naturalResponse.opening}\n\n`;
        
        if (naturalResponse.items && naturalResponse.items.length > 0) {
          naturalResponse.items.forEach((item, index) => {
            botResponse += `${index + 1}. ${item.image} *${item.headline}* - ${item.price}\n`;
            botResponse += `   ${item.one_liner}\n\n`;
          });
        }
        
        botResponse += `💬 ${naturalResponse.cta}\n\n`;
        if (naturalResponse.quick_replies && naturalResponse.quick_replies.length > 0) {
          botResponse += `Quick replies:\n`;
          naturalResponse.quick_replies.forEach((reply, index) => {
            botResponse += `${index + 1}. ${reply}\n`;
          });
        }
      } else if (data.success) {
        botResponse = "Thank you for your message! I'm here to help you find the perfect products. Could you tell me more about what you're looking for?";
      } else {
        // No naturalResponse and success is false - use error message or fallback
        // Include more detailed error information for debugging
        const errorMsg = data.error || "I'm having trouble processing your request right now. Please try again in a moment.";
        const errorType = data.errorType || 'Unknown error';
        
        // Log detailed error information to console for debugging
        console.error('❌ API Error Details:', {
          error: data.error,
          errorType: data.errorType,
          metadata: data.metadata,
          fullResponse: data
        });
        
        // Show detailed error in UI for debugging
        // Always show error details if available (helps with Netlify debugging)
        if (data.error && data.error.length < 150) {
          botResponse = `Error: ${errorMsg}${errorType && errorType !== 'Error' ? ` (${errorType})` : ''}. Check browser console (F12) for full details.`;
        } else if (errorType && errorType !== 'Error') {
          botResponse = `I encountered an error (${errorType}). Please check the browser console (F12) for details.`;
        } else {
          botResponse = `${errorMsg} Check browser console (F12) for details.`;
        }
        
        // Always log to console for debugging
        console.error('❌ Full error response from API:', data);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Log comprehensive error information for debugging
      console.error('❌ Error sending message:', {
        error: error,
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response,
        timestamp: new Date().toISOString()
      });
      
      // Provide more specific error messages
      let errorText = "I'm having trouble connecting to the server. Please try again in a moment.";
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        errorText = "Request timed out. Please check your internet connection and try again.";
      } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        errorText = "I'm having trouble connecting. Please check your internet connection and try again.";
      } else if (error.message?.includes('Invalid request') || error.message?.includes('400')) {
        errorText = error.message || "I didn't understand that. Please try a different message.";
      } else if (error.message?.includes('Cannot send empty message') || error.message?.includes('Payload must have')) {
        errorText = "I need a message to help you. Please type something or select an option.";
      } else if (error.message?.includes('Server error')) {
        // Extract detailed error information from the error message
        const errorMatch = error.message.match(/Server error: (\d+) (.+)/);
        if (errorMatch) {
          const [, status, details] = errorMatch;
          console.error('❌ Server Error Details:', { status, details, fullError: error });
          // Show error details with instructions to check console
          errorText = `Server error (${status}): ${details}. Check browser console (F12) for full details.`;
        } else {
          errorText = "I'm having trouble processing your request right now. Please try again in a moment.";
        }
      } else if (error.message?.includes('JSON')) {
        errorText = "I received an invalid response. Please try again.";
      }
      
      // Extract user-friendly error from error message if available
      if (error.message && (error.message.includes('Invalid request:') || error.message.includes('400'))) {
        const match = error.message.match(/(?:Invalid request:|400)[\s:]+(.+)/);
        if (match && match[1]) {
          const extractedError = match[1].trim();
          if (extractedError && extractedError.length < 100) {
            errorText = extractedError;
          }
        }
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      
      // Focus input after any response (success or error)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReplyClick = (quickReplyNumber, quickReplyText) => {
    // Ensure we extract primitive values only - no DOM elements or React refs
    let safeNumber = null;
    let safeText = null;
    
    // Safely extract number
    if (quickReplyNumber !== null && quickReplyNumber !== undefined) {
      if (typeof quickReplyNumber === 'number') {
        safeNumber = quickReplyNumber;
      } else if (typeof quickReplyNumber === 'string') {
        const parsed = parseInt(quickReplyNumber, 10);
        if (!isNaN(parsed)) {
          safeNumber = parsed;
        }
      }
    }
    
    // Safely extract text
    if (quickReplyText && typeof quickReplyText === 'string') {
      safeText = quickReplyText.trim();
    }
    
    // Prefer sending the label text to keep replies contextual
    if (safeText) {
      sendMessage(null, safeText);
      return;
    }
    // Fallback to numeric behavior if no text provided
    if (safeNumber !== null) {
      sendMessage(safeNumber);
    }
  };

  return (
    <>
      <SEO 
        title="Shopping Assistant - AI Chat Bot | Bright Mind Vision"
        description="Chat with our AI shopping assistant to find luxury products. Get personalized recommendations for fashion, skincare, wellness, and more."
        keywords="AI chat bot, shopping assistant, luxury products, ecommerce, Dubai, UAE"
      />
      <MainLayout className="fullscreen-chat">
        <div className={styles.chatPageContainer}>
          <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <div className={styles.headerContent}>
            <div className={styles.botInfo}>
              <div className={styles.botAvatar}>🤖</div>
              <div className={styles.botDetails}>
                <h3>Shopping Assistant</h3>
                <div className={`${styles.status} ${isConnected ? styles.connected : styles.disconnected}`}>
                  {isConnected ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
            <div className={styles.whatsappLink}>
              <a href="https://wa.me/919980300360" target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={styles.whatsappIcon}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

            <div className={styles.messagesContainer} ref={messagesContainerRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${message.sender === 'user' ? 'user' : 'bot'}`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>
                      {message.text.split('\n').map((line, index) => {
                        // Check if this is a quick reply line
                        const quickReplyMatch = line.match(/^(\d+)\.\s(.+)$/);
                        if (quickReplyMatch) {
                          const [, number, text] = quickReplyMatch;
                          // Extract primitive values immediately to avoid React event issues
                          const quickReplyNum = parseInt(number, 10);
                          const quickReplyTxt = String(text || '').trim();
                          
                          return (
                            <div key={index} className={styles.quickReplyContainer}>
                              <button 
                                className={styles.quickReplyButton}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Pass only primitive values, never the event
                                  handleQuickReplyClick(quickReplyNum, quickReplyTxt);
                                }}
                              >
                                {number}. {text}
                              </button>
                            </div>
                          );
                        }
                        
                        // Regular text line
                        return (
                          <div key={index}>
                            {line.includes('*') ? (
                              <span dangerouslySetInnerHTML={{ 
                                __html: line.replace(/\*(.*?)\*/g, '<strong>$1</strong>') 
                              }} />
                            ) : (
                              line
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.message} bot`}>
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>
                      <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputContainer}>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (e.g., 'I want luxury bags', 'show me skincare products')"
                className={styles.messageInput}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={styles.sendButton}
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default EcommerceChatBot;
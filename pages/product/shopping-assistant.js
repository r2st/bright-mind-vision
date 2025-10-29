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
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
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
        const response = await fetch('/api/meshai/optimized-ai-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          customerId: `web-${Date.now()}`,
          context: {
            ...conversationContext,
            source: 'web',
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        let botResponse = '';
        
        if (data.naturalResponse) {
          // Use natural language response from working production API
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
          botResponse += `Quick replies:\n`;
          naturalResponse.quick_replies.forEach((reply, index) => {
            botResponse += `${index + 1}. ${reply}\n`;
          });
        } else {
          botResponse = "Thank you for your message! I'm here to help you find the perfect products. Could you tell me more about what you're looking for?";
        }

        const botMessage = {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: "I'm having trouble processing your request right now. Please try again in a moment.",
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting to the server. Please try again in a moment.",
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

  const handleQuickReplyClick = (quickReplyNumber) => {
    setInputMessage(quickReplyNumber);
    // Auto-send the quick reply
    setTimeout(() => {
      sendMessage();
    }, 100);
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

            <div className={styles.messagesContainer}>
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
                          return (
                            <div key={index} className={styles.quickReplyContainer}>
                              <button 
                                className={styles.quickReplyButton}
                                onClick={() => handleQuickReplyClick(number)}
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
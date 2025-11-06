import React, { useState, useEffect, useRef } from 'react';
import SEO from '../../components/SEO';
import MainLayout from '../../components/MainLayout';
import { ChatWidget } from '../../components/ChatWidgets';
import styles from './shopping-assistant.module.css';

const EcommerceChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  // Get or create persistent customer ID from sessionStorage (with localStorage fallback for persistence)
  const getPersistentCustomerId = () => {
    if (typeof window !== 'undefined') {
      // Try sessionStorage first (session-specific)
      let customerId = sessionStorage.getItem('shopping_assistant_customer_id');
      
      // If not in sessionStorage, try localStorage (persists across sessions)
      if (!customerId) {
        customerId = localStorage.getItem('shopping_assistant_customer_id');
      }
      
      // If still not found, create new one
      if (!customerId) {
        customerId = `web-${Date.now()}`;
        // Store in both for redundancy
        sessionStorage.setItem('shopping_assistant_customer_id', customerId);
        localStorage.setItem('shopping_assistant_customer_id', customerId);
        console.log('🆕 Generated new customer ID:', customerId);
      } else {
        // Ensure it's in both storages for consistency
        sessionStorage.setItem('shopping_assistant_customer_id', customerId);
        localStorage.setItem('shopping_assistant_customer_id', customerId);
        console.log('✅ Using existing customer ID:', customerId);
      }
      
      return customerId;
    }
    return `web-${Date.now()}`;
  };

  // Get or create persistent conversation ID from sessionStorage
  const getPersistentConversationId = () => {
    if (typeof window !== 'undefined') {
      let convId = sessionStorage.getItem('shopping_assistant_conversation_id');
      if (!convId) {
        convId = `conv_${Date.now()}`;
        sessionStorage.setItem('shopping_assistant_conversation_id', convId);
      }
      return convId;
    }
    return `conv_${Date.now()}`;
  };

  const [conversationContext, setConversationContext] = useState({
    lastCategory: null,
    conversationId: typeof window !== 'undefined' 
      ? (sessionStorage.getItem('shopping_assistant_conversation_id') || `conv_${Date.now()}`)
      : `conv_${Date.now()}`
  });
  const [customerId] = useState(() => getPersistentCustomerId());
  const [cart, setCart] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
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

  // Fetch cart when conversation starts or when cart operations happen
  const fetchCart = async (customerId) => {
    if (!customerId) return;
    
    try {
      setCartLoading(true);
      const response = await fetch('/api/shopping-assistant/langgraph-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: 'show me my cart',
          customerId: customerId,
          context: {
            conversationId: conversationContext.conversationId,
            source: 'web',
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Extract cart from response if available (check both paths)
        if (data.metadata?.cart) {
          setCart(data.metadata.cart);
        } else if (data.naturalResponse?.metadata?.cart) {
          setCart(data.naturalResponse.metadata.cart);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  // Update cart quantity
  const updateCartItem = async (sku, quantity, customerId) => {
    if (!customerId) return;
    
    try {
      setCartLoading(true);
      const response = await fetch('/api/shopping-assistant/langgraph-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: quantity > 0 
            ? `update cart item ${sku} to quantity ${quantity}`
            : `remove ${sku} from cart`,
          customerId: customerId,
          context: {
            conversationId: conversationContext.conversationId,
            source: 'web',
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.naturalResponse?.metadata?.cart) {
          setCart(data.naturalResponse.metadata.cart);
        } else {
          // Refresh cart
          await fetchCart(customerId);
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  // Get customer ID - use persistent one from state
  const getCustomerId = () => {
    return customerId;
  };

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

    // Replace SKU with product name in display text if possible
    // Look for SKU patterns (e.g., "PRADA-GALLERIA-SAFFIANO", "CH-CFB-MED-BLK")
    const skuPattern = /[A-Z0-9]+(?:-[A-Z0-9]+)+/g;
    const skuMatches = displayText.match(skuPattern);
    
    if (skuMatches && skuMatches.length > 0) {
      // Create a map of SKU to product name from recent bot messages
      const skuToProductName = new Map();
      
      // Search through recent bot messages for products (most recent first)
      for (const botMessage of [...messages].reverse()) {
        if (botMessage.sender === 'bot' && botMessage.products && botMessage.products.length > 0) {
          for (const product of botMessage.products) {
            if (product.sku && product.headline && !skuToProductName.has(product.sku.toUpperCase())) {
              skuToProductName.set(product.sku.toUpperCase(), product.headline);
            }
          }
        }
      }
      
      // Replace all found SKUs with their product names
      for (const sku of skuMatches) {
        const productName = skuToProductName.get(sku.toUpperCase());
        if (productName) {
          // Replace SKU with product name (case-insensitive)
          displayText = displayText.replace(new RegExp(sku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), productName);
        }
      }
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
              customerId: customerId,
              context: cleanContext
            };
          } else {
            // Invalid quick reply number, fall back to message
            payload = {
              message: String(messageText || ''),
              customerId: customerId,
              context: cleanContext
            };
          }
        } else if (messageText && messageText.trim()) {
          // Use message text (this handles regular messages and text-based quick replies)
          payload = {
            message: String(messageText.trim()),
            customerId: customerId,
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
            customerId: customerId,
            context: {
              conversationId: conversationContext.conversationId,
              source: 'web',
              timestamp: new Date().toISOString()
            }
          };
          payload.message = safePayload.message;
          payload.customerId = safePayload.customerId;
          payload.context = safePayload.context;
        }

        // Add timeout for mobile networks - increased to 60 seconds for LLM operations
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.warn('⏱️ Request timeout after 60 seconds');
        }, 60000); // 60 second timeout for LLM operations

        let response;
        try {
          response = await fetch('/api/shopping-assistant/langgraph-recommendation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
        } catch (fetchError) {
          // Clear timeout if fetch fails
          clearTimeout(timeoutId);
          
          // Handle AbortError specifically
          if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
            throw new Error('Request timed out. The AI is taking longer than expected to respond. Please try again.');
          }
          // Re-throw other fetch errors
          throw fetchError;
        }

        // Clear timeout on successful fetch start
        clearTimeout(timeoutId);

      // Check if response is ok before parsing
      if (!response.ok) {
        let errorText = '';
        let errorData = null;
        try {
          const responseText = await response.text();
          // Try to parse as JSON for better error message
          try {
            errorData = JSON.parse(responseText);
            console.error('❌ API Error Response (Full):', {
              status: response.status,
              statusText: response.statusText,
              errorData: errorData,
              rawResponse: responseText
            });
            
            // Extract error information
            if (errorData.error) {
              errorText = errorData.error;
            } else if (errorData.message) {
              errorText = errorData.message;
            } else {
              errorText = responseText || `HTTP ${response.status}: ${response.statusText}`;
            }
            
            // Store full error data for detailed logging
            if (errorData.metadata) {
              console.error('❌ Error Metadata:', errorData.metadata);
            }
            if (errorData.errorType) {
              console.error('❌ Error Type:', errorData.errorType);
            }
          } catch {
            // Not JSON, use text as-is
            errorText = responseText || `HTTP ${response.status}: ${response.statusText}`;
            console.error('❌ API Error Response (Non-JSON):', {
              status: response.status,
              statusText: response.statusText,
              rawResponse: responseText
            });
          }
        } catch (e) {
          errorText = `HTTP ${response.status}: ${response.statusText}`;
          console.error('❌ Failed to read error response:', e);
        }
        
        // For 400 errors, show more helpful message
        if (response.status === 400) {
          throw new Error(`Invalid request: ${errorText || 'Please check your input and try again.'}`);
        }
        
        // Include error data in the error for better debugging
        const error = new Error(`Server error: ${response.status} ${errorText || response.statusText}`);
        if (errorData) {
          error.errorData = errorData;
        }
        throw error;
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

        // Update cart if cart data is in response (check both paths)
        if (data.metadata?.cart) {
          setCart(data.metadata.cart);
        } else if (naturalResponse.metadata?.cart) {
          setCart(naturalResponse.metadata.cart);
        }

        // Auto-refresh cart after cart operations
        if (botResponse.toLowerCase().includes('cart') || 
            botResponse.toLowerCase().includes('added') ||
            botResponse.toLowerCase().includes('removed') ||
            botResponse.toLowerCase().includes('updated')) {
          setTimeout(() => {
            fetchCart(getCustomerId());
          }, 1000);
        }
        
        // Build response text without quick replies (they'll be displayed separately)
        botResponse = `${naturalResponse.opening}\n\n`;
        
        if (naturalResponse.items && naturalResponse.items.length > 0) {
          naturalResponse.items.forEach((item, index) => {
            botResponse += `${index + 1}. ${item.image} *${item.headline}* - ${item.price}\n`;
            botResponse += `   ${item.one_liner}\n\n`;
          });
        }
        
        if (naturalResponse.cta) {
          botResponse += `💬 ${naturalResponse.cta}`;
        }
      } else if (data.success) {
        botResponse = "Thank you for your message! I'm here to help you find the perfect products. Could you tell me more about what you're looking for?";
      } else {
        // No naturalResponse and success is false - use error message or fallback
        // Include more detailed error information for debugging
        const errorMsg = data.error || "I'm having trouble processing your request right now. Please try again in a moment.";
        const errorType = data.errorType || 'Unknown error';
        
        // Comprehensive error logging for debugging - print all details
        console.error('========================================');
        console.error('❌ API ERROR RESPONSE - FULL DETAILS');
        console.error('========================================');
        console.error('❌ Error:', data.error);
        console.error('❌ Error Type:', data.errorType || 'Unknown');
        console.error('❌ Metadata:', JSON.stringify(data.metadata, null, 2));
        if (data.stack) {
          console.error('❌ Stack Trace:', data.stack);
        }
        console.error('❌ Full Response:', JSON.stringify(data, null, 2));
        console.error('========================================');
        
        // Show human-friendly error in UI, but log detailed info to console
        // Keep UI message friendly and natural
        botResponse = "I'm sorry, I'm having a bit of trouble right now. Please try again in a moment. If the issue persists, feel free to contact support.";
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        // Store product items with SKU for "Add to Cart" buttons
        products: data.naturalResponse?.items?.map(item => ({
          headline: item.headline,
          price: item.price,
          one_liner: item.one_liner,
          image: item.image,
          sku: item.sku,
          brand: item.brand
        })) || [],
        // Store quick replies separately for bottom display
        quick_replies: data.naturalResponse?.quick_replies || [],
        // Store widgets for rich display
        widgets: data.widgets || []
      };

      // Debug: Log widget and cart data
      if (data.widgets && data.widgets.length > 0) {
        console.log('📦 Widgets received:', data.widgets.map(w => ({ type: w.type, hasData: !!w.data })));
      }
      if (data.metadata?.cart) {
        console.log('🛒 Cart in metadata:', {
          itemsCount: data.metadata.cart.items?.length || 0,
          hasItems: !!(data.metadata.cart.items && data.metadata.cart.items.length > 0)
        });
      }

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Comprehensive error logging for debugging - print all details
      console.error('========================================');
      console.error('❌ FETCH ERROR - FULL DETAILS');
      console.error('========================================');
      console.error('❌ Error Object:', error);
      console.error('❌ Error Type:', error.name || 'Unknown');
      console.error('❌ Error Message:', error.message || 'No message');
      console.error('❌ Error Stack:', error.stack || 'No stack trace');
      console.error('❌ Response:', error.response);
      console.error('❌ Timestamp:', new Date().toISOString());
      console.error('========================================');
      
      // Handle timeout errors specifically
      if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('aborted')) {
        const timeoutMessage = {
          id: Date.now() + 1,
          text: "I'm taking longer than expected to respond. This might be due to network issues or the AI processing a complex request. Please try again in a moment.",
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, timeoutMessage]);
        setIsLoading(false);
        return;
      }
      
      // Provide more specific error messages
      let errorText = "I'm having trouble connecting to the server. Please try again in a moment.";
      if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        errorText = "I'm having trouble connecting. Please check your internet connection and try again.";
      } else if (error.message?.includes('Invalid request') || error.message?.includes('400')) {
        errorText = error.message || "I didn't understand that. Please try a different message.";
      } else if (error.message?.includes('Cannot send empty message') || error.message?.includes('Payload must have')) {
        errorText = "I need a message to help you. Please type something or select an option.";
      } else if (error.message?.includes('Server error')) {
        // Extract detailed error information from the error message and error object
        const errorMatch = error.message.match(/Server error: (\d+) (.+)/);
        
        // Check if error has errorData attached (from our improved error handling)
        if (error.errorData) {
          // Comprehensive error logging for debugging - print all details
          console.error('========================================');
          console.error('❌ SERVER ERROR - FULL DETAILS');
          console.error('========================================');
          console.error('❌ Error:', error.errorData.error);
          console.error('❌ Error Type:', error.errorData.errorType);
          console.error('❌ Metadata:', JSON.stringify(error.errorData.metadata, null, 2));
          console.error('❌ Full Error Data:', JSON.stringify(error.errorData, null, 2));
          console.error('❌ Stack:', error.stack);
          if (error.errorData.metadata?.diagnostics) {
            console.error('❌ Diagnostics:', JSON.stringify(error.errorData.metadata.diagnostics, null, 2));
          }
          console.error('========================================');
          
          // Show human-friendly message in UI
          errorText = "I'm having trouble processing your request right now. Please try again in a moment.";
        } else if (errorMatch) {
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
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setShowCart(!showCart);
                  if (!showCart && !cart) {
                    fetchCart(getCustomerId());
                  }
                }}
                className={styles.cartButton}
                title="View Cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span className={styles.cartBadge}>
                  {cart?.items?.length || 0}
                </span>
              </button>
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
                        // If we have product cards, filter out numbered product list lines
                        // Pattern: "1. 🛍️ *Product Name* - Price" or "1. Product Name - Price"
                        const hasProductCards = message.products && message.products.length > 0;
                        const productListPattern = /^\d+\.\s*(?:🛍️\s*)?(?:\*.*?\*|.+?)\s*-\s*.+AED/i;
                        
                        if (hasProductCards && productListPattern.test(line.trim())) {
                          // Skip this line - it's a product list item that will be shown as a card
                          return null;
                        }
                        
                        // Skip quick reply lines (they're displayed separately at bottom)
                        const quickReplyMatch = line.match(/^(\d+)\.\s(.+)$/);
                        if (quickReplyMatch && message.quick_replies && message.quick_replies.length > 0) {
                          return null;
                        }
                        
                        // Regular text line - ensure proper line breaks
                        if (!line.trim()) {
                          return <br key={index} />;
                        }
                        
                        return (
                          <div key={index} style={{ marginBottom: '0.25rem' }}>
                            {line.includes('*') ? (
                              <span dangerouslySetInnerHTML={{ 
                                __html: line.replace(/\*(.*?)\*/g, '<strong>$1</strong>') 
                              }} />
                            ) : (
                              line
                            )}
                          </div>
                        );
                      }).filter(Boolean)}
                      
                      {/* Widgets */}
                      {message.widgets && message.widgets.length > 0 && (
                        <div className={styles.widgetsContainer}>
                          {message.widgets.map((widget, idx) => {
                            // Add action handler for product details widget
                            if (widget.type === 'product_details' && widget.data) {
                              const enhancedWidget = {
                                ...widget,
                                data: {
                                  ...widget.data,
                                  onActionClick: async (action, productData) => {
                                    if (action === 'add_to_cart') {
                                      const message = productData.sku 
                                        ? `add ${productData.sku} to cart`
                                        : `add ${productData.title} to cart`;
                                      await sendMessage(null, message);
                                      setTimeout(() => {
                                        fetchCart(getCustomerId());
                                      }, 1500);
                                    } else if (action === 'add_to_wishlist') {
                                      await sendMessage(null, `add ${productData.sku || productData.title} to wishlist`);
                                    } else if (action === 'compare') {
                                      await sendMessage(null, `compare ${productData.sku || productData.title}`);
                                    } else if (action === 'share') {
                                      // Share functionality - could open share dialog or copy link
                                      if (navigator.share) {
                                        try {
                                          await navigator.share({
                                            title: productData.title,
                                            text: `Check out ${productData.title} from ${productData.brand}`,
                                            url: window.location.href
                                          });
                                        } catch (err) {
                                          console.log('Share cancelled');
                                        }
                                      } else {
                                        // Fallback: copy to clipboard
                                        const shareText = `${productData.title} - ${productData.brand}\n${window.location.href}`;
                                        navigator.clipboard.writeText(shareText).then(() => {
                                          alert('Product link copied to clipboard!');
                                        });
                                      }
                                    }
                                  }
                                }
                              };
                              return <ChatWidget key={idx} widget={enhancedWidget} />;
                            }
                            return <ChatWidget key={idx} widget={widget} />;
                          })}
                        </div>
                      )}

                      {/* Product Cards with Add to Cart buttons */}
                      {message.products && message.products.length > 0 && (
                        <div className={styles.productCards}>
                          {message.products.map((product, idx) => {
                            if (!product.headline) return null;
                            
                            return (
                              <div key={idx} className={styles.productCard}>
                                <div className={styles.productCardContent}>
                                  <div className={styles.productCardHeader}>
                                    <span className={styles.productEmoji}>{product.image || '🛍️'}</span>
                                    <div className={styles.productInfo}>
                                      <div className={styles.productTitle}>
                                        {product.headline}
                                      </div>
                                      {product.brand && (
                                        <div className={styles.productBrand}>{product.brand}</div>
                                      )}
                                      <div className={styles.productPrice}>{product.price}</div>
                                    </div>
                                  </div>
                                  {product.one_liner && (
                                    <div className={styles.productDescription}>
                                      {product.one_liner}
                                    </div>
                                  )}
                                  {product.sku && (
                                    <button
                                      className={styles.addToCartButton}
                                      onClick={async () => {
                                        // Use SKU directly for more reliable product lookup
                                        const message = product.sku 
                                          ? `add ${product.sku} to cart`
                                          : `add ${product.headline} to cart`;
                                        
                                        // Send message to add to cart
                                        await sendMessage(null, message);
                                        
                                        // Refresh cart after adding
                                        setTimeout(() => {
                                          fetchCart(getCustomerId());
                                        }, 1500);
                                      }}
                                      disabled={isLoading}
                                    >
                                      🛒 Add to Cart
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Replies - Displayed at bottom of bot messages */}
                    {message.sender === 'bot' && message.quick_replies && message.quick_replies.length > 0 && (
                      <div className={styles.quickRepliesContainer}>
                        {message.quick_replies.map((reply, index) => {
                          const quickReplyNum = index + 1;
                          const quickReplyTxt = String(reply || '').trim();
                          
                          if (!quickReplyTxt) return null;
                          
                          return (
                            <button
                              key={index}
                              className={styles.quickReplyButton}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleQuickReplyClick(quickReplyNum, quickReplyTxt);
                              }}
                              disabled={isLoading}
                            >
                              {reply}
                            </button>
                          );
                        })}
                      </div>
                    )}
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

            {/* Cart Sidebar */}
            {showCart && (
              <div className={styles.cartSidebar}>
                <div className={styles.cartHeader}>
                  <h3>🛒 Your Cart</h3>
                  <button 
                    className={styles.closeCartButton}
                    onClick={() => setShowCart(false)}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.cartContent}>
                  {cartLoading ? (
                    <div className={styles.cartLoading}>Loading cart...</div>
                  ) : cart?.items && cart.items.length > 0 ? (
                    <>
                      <div className={styles.cartItems}>
                        {cart.items.map((item, index) => {
                          const price = typeof item.price === 'object' 
                            ? item.price.amount 
                            : (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0);
                          const currency = typeof item.price === 'object' 
                            ? item.price.currency 
                            : 'AED';
                          const itemTotal = price * (item.quantity || 1);

                          return (
                            <div key={item.sku || index} className={styles.cartItem}>
                              <div className={styles.cartItemInfo}>
                                <div className={styles.cartItemTitle}>
                                  {item.title || item.product_name || 'Item'}
                                </div>
                                <div className={styles.cartItemPrice}>
                                  {price.toFixed(2)} {currency} × {item.quantity || 1} = {itemTotal.toFixed(2)} {currency}
                                </div>
                              </div>
                              <div className={styles.cartItemControls}>
                                <button
                                  className={styles.quantityButton}
                                  onClick={() => updateCartItem(item.sku, Math.max(0, (item.quantity || 1) - 1), getCustomerId())}
                                  disabled={cartLoading}
                                >
                                  −
                                </button>
                                <span className={styles.quantityDisplay}>{item.quantity || 1}</span>
                                <button
                                  className={styles.quantityButton}
                                  onClick={() => updateCartItem(item.sku, (item.quantity || 1) + 1, getCustomerId())}
                                  disabled={cartLoading}
                                >
                                  +
                                </button>
                                <button
                                  className={styles.removeButton}
                                  onClick={() => updateCartItem(item.sku, 0, getCustomerId())}
                                  disabled={cartLoading}
                                  title="Remove item"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className={styles.cartFooter}>
                        <div className={styles.cartTotal}>
                          <strong>Total: {cart.total ? cart.total.toFixed(2) : cart.items.reduce((sum, item) => {
                            const itemPrice = typeof item.price === 'object' ? item.price.amount : (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0);
                            return sum + (itemPrice * (item.quantity || 1));
                          }, 0).toFixed(2)} {cart.currency || 'AED'}</strong>
                        </div>
                        <button
                          className={styles.checkoutButton}
                          onClick={() => {
                            sendMessage(null, 'checkout');
                            setShowCart(false);
                          }}
                        >
                          Proceed to Checkout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyCart}>
                      <p>Your cart is empty</p>
                      <button
                        className={styles.continueShoppingButton}
                        onClick={() => setShowCart(false)}
                      >
                        Continue Shopping
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

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
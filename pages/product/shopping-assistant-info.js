import React from 'react';
import SEO from '../../components/SEO';
import MainLayout from '../../components/MainLayout';
import Link from 'next/link';
import styles from './shopping-assistant-info.module.css';

const ShoppingAssistantInfo = () => {
  return (
    <>
      <SEO 
        title="Shopping Assistant Information - AI Chat Bot | Bright Mind Vision"
        description="Learn about our AI shopping assistant features, WhatsApp integration, and how to get personalized luxury product recommendations."
        keywords="AI shopping assistant, luxury products, WhatsApp chat, product recommendations, Dubai, UAE"
      />
      <MainLayout>
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1>🤖 Shopping Assistant</h1>
            <p>Your AI-powered personal shopping companion for luxury products</p>
            <div className={styles.ctaButtons}>
              <Link href="/product/shopping-assistant" className={styles.primaryButton}>
                Start Chatting Now
              </Link>
              <a href="https://wa.me/919980300360" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className={styles.features}>
            <h2>✨ What I Can Help You With</h2>
            <div className={styles.featureGrid}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>👜</div>
                <h3>Luxury Fashion</h3>
                <p>Find premium handbags, accessories, and fashion items from top brands like Chanel, Hermès, Gucci, and Louis Vuitton</p>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>⌚</div>
                <h3>Watches & Jewelry</h3>
                <p>Discover luxury watches from Rolex, Cartier, and Bulgari, plus exclusive jewelry pieces</p>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>💎</div>
                <h3>Skincare & Beauty</h3>
                <p>Explore premium skincare from La Mer, La Prairie, and other luxury beauty brands</p>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🏠</div>
                <h3>Home & Wellness</h3>
                <p>Find luxury home decor, wellness products, and lifestyle items for your home</p>
              </div>
            </div>
          </div>

          <div className={styles.whatsappSection}>
            <h2>📱 Chat on WhatsApp</h2>
            <div className={styles.whatsappCard}>
              <div className={styles.whatsappInfo}>
                <div className={styles.whatsappIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <div>
                  <h3>Get Personal Shopping Assistance</h3>
                  <p>Chat with our AI assistant directly on WhatsApp for a more personal shopping experience</p>
                </div>
              </div>
              <div className={styles.whatsappInstructions}>
                <h4>How to Start Chatting:</h4>
                <ol>
                  <li>Click the button below to open WhatsApp directly</li>
                  <li>Or add this number to your contacts: <strong>+91 99803 00360</strong></li>
                  <li>Send a message like "Hi" or "I need help with shopping"</li>
                  <li>Our AI assistant will respond with personalized product recommendations</li>
                </ol>
                <div className={styles.whatsappActionButton}>
                  <a href="https://wa.me/919980300360" target="_blank" rel="noopener noreferrer" className={styles.whatsappActionLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={styles.whatsappIcon}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Open WhatsApp Chat
                  </a>
                </div>
                <div className={styles.whatsappFeatures}>
                  <div className={styles.whatsappFeature}>
                    <span className={styles.checkmark}>✅</span>
                    <span>24/7 AI Shopping Assistant</span>
                  </div>
                  <div className={styles.whatsappFeature}>
                    <span className={styles.checkmark}>✅</span>
                    <span>Personalized Product Recommendations</span>
                  </div>
                  <div className={styles.whatsappFeature}>
                    <span className={styles.checkmark}>✅</span>
                    <span>Luxury Brands & Premium Products</span>
                  </div>
                  <div className={styles.whatsappFeature}>
                    <span className={styles.checkmark}>✅</span>
                    <span>Quick Replies & Easy Navigation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.examples}>
            <h2>💬 Example Conversations</h2>
            <div className={styles.exampleGrid}>
              <div className={styles.example}>
                <div className={styles.exampleUser}>👤 You:</div>
                <div className={styles.exampleMessage}>"I want luxury bags"</div>
                <div className={styles.exampleBot}>🤖 Bot:</div>
                <div className={styles.exampleResponse}>
                  "Welcome to our luxury bag collection! Here are some high-end options:
                  <br/>1. 👜 Chanel Classic Flap Bag - 38,500 AED
                  <br/>2. 👜 Hermès Birkin 30 - 55,000 AED
                  <br/>3. 👜 Louis Vuitton Neverfull MM - 12,500 AED"
                </div>
              </div>
              <div className={styles.example}>
                <div className={styles.exampleUser}>👤 You:</div>
                <div className={styles.exampleMessage}>"Show me skincare products"</div>
                <div className={styles.exampleBot}>🤖 Bot:</div>
                <div className={styles.exampleResponse}>
                  "Here are our premium skincare recommendations:
                  <br/>1. 💎 La Mer The Concentrate - 3,200 AED
                  <br/>2. ✨ La Prairie Cellular Cream - 2,400 AED"
                </div>
              </div>
              <div className={styles.example}>
                <div className={styles.exampleUser}>👤 You:</div>
                <div className={styles.exampleMessage}>"I need luxury watches"</div>
                <div className={styles.exampleBot}>🤖 Bot:</div>
                <div className={styles.exampleResponse}>
                  "Discover our luxury watch collection:
                  <br/>1. ⌚ Rolex Submariner Date - 45,000 AED
                  <br/>2. ⌚ Cartier Santos - 35,000 AED
                  <br/>3. 🐍 Bulgari Serpenti - 25,000 AED"
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default ShoppingAssistantInfo;

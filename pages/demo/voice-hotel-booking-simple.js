import React, { useState } from 'react';
import Head from 'next/head';
import Footer from '../../components/Footer';
import VoiceAssistant from '../../components/VoiceAssistant';
import { HOTEL_CONFIG } from '../../components/VoiceAssistantConfigs';

const VoiceHotelBooking = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Function to update search results, passed to VoiceAssistant
  const updateSearchResults = (results, show) => {
    setSearchResults(results);
    setShowResults(show);
  };

  return (
    <>
      <Head>
        <title>Voice Hotel Booking Assistant | Bright Mind Vision</title>
        <meta name="description" content="AI-powered voice assistant for hotel booking. Find and book hotels through natural conversation." />
        <link rel="icon" href="/bmv_favicon.png" />
      </Head>

      <main>
        {/* Hero Section */}
        <section style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '100px 20px',
          minHeight: 'calc(100vh - 90px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '4rem' }}>🏨</div>
              <h1 style={{ fontSize: '3rem', fontWeight: '700', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Voice Hotel Booking Assistant
              </h1>
            </div>
            <p style={{ fontSize: '1.3rem', marginBottom: '40px', opacity: 0.9, lineHeight: '1.6' }}>
              Book hotels through natural conversation. Tell me your destination, dates, and preferences, 
              and I'll find the perfect accommodation for your stay.
            </p>
            
            {/* Voice Assistant Component */}
            <VoiceAssistant 
              config={HOTEL_CONFIG}
              onSearchResults={updateSearchResults}
              onShowResults={setShowResults}
            />
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎤</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Voice Commands</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>Simply speak your requirements - destination, dates, number of guests, and preferences.</p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Smart Search</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>Our AI searches through thousands of hotels to find the best matches for your criteria.</p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📱</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Easy Booking</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>Review options and book directly through our secure platform with instant confirmation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {showResults && searchResults.length > 0 && (
          <section style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
                Available Hotels
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                {searchResults.map((hotel, index) => (
                  <div key={index} style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '15px', 
                    padding: '30px', 
                    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                    border: '1px solid #e9ecef'
                  }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#333' }}>{hotel.name}</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>{hotel.service} • {hotel.location}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#ffc107', marginRight: '5px' }}>⭐</span>
                        <span style={{ fontWeight: '600' }}>{hotel.rating}</span>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#667eea' }}>{hotel.price}</span>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '12px 24px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#5a67d8'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Sample Commands Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              Try These Commands
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {HOTEL_CONFIG.demo.sampleCommands.map((command, index) => (
                <div key={index} style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  border: '1px solid #e9ecef'
                }}>
                  <p style={{ margin: 0, color: '#333', fontStyle: 'italic' }}>"{command}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default VoiceHotelBooking;

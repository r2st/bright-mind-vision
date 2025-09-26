import React, { useState } from 'react';
import Footer from '../../components/Footer';
import Contact from '../../components/Contact';
import Calendar from '../../components/Calendar';
import VoiceAssistant from '../../components/VoiceAssistant';
import SEO from '../../components/SEO';
import { WELLNESS_CONFIG } from '../../components/VoiceAssistantConfigs';

const VoiceWellnessPartners = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Function to update search results, passed to VoiceAssistant
  const updateSearchResults = (results, show) => {
    setSearchResults(results);
    setShowResults(show);
  };

  return (
    <>
      <SEO 
        title="Voice Wellness Partners Product"
        description="Voice-activated wellness partners booking product by Bright Mind Vision. Streamline wellness service bookings with AI-powered voice automation."
        keywords="voice AI, wellness booking, health services, voice assistant, wellness automation, health AI, booking system"
        url="https://brightmindvision.com/product/voice-wellness-partners"
      />


      <main>
        {/* Hero Section */}
        <section style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          textAlign: 'center', 
          padding: '100px 20px', 
          minHeight: 'calc(100vh - 90px)', // Adjust for header height
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Grid Pattern Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'><path d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'0.5\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/></svg>")',
            opacity: 0.3,
            pointerEvents: 'none'
          }}></div>
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '4rem' }}>🧘‍♀️</div>
              <h1 style={{ fontSize: '3rem', fontWeight: '700', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Voice Wellness Partners
              </h1>
            </div>
            <p style={{ fontSize: '1.3rem', marginBottom: '40px', opacity: 0.9, lineHeight: '1.6' }}>
              Experience the future of wellness booking with our AI-powered voice assistant. 
              Book appointments, find services, and get personalized recommendations through natural conversation.
            </p>
            
            {/* Voice Assistant Component */}
            <VoiceAssistant 
              config={WELLNESS_CONFIG}
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
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Speak Naturally</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Simply say what you need - "I need a massage therapist" or "Book a yoga class" and our AI understands your request.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Smart Search</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Our AI searches through verified wellness partners to find the best matches for your needs and preferences.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📅</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Easy Booking</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Get instant recommendations and book appointments seamlessly through voice commands or follow-up actions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              Why Voice-Powered Wellness Booking?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
              <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '2.5rem', color: '#667eea', marginBottom: '20px' }}>⏰</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Zero Wait Time</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  No more holding on the phone or waiting for callbacks. Get instant responses and immediate booking confirmations through natural conversation.
                </p>
              </div>
              <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '2.5rem', color: '#667eea', marginBottom: '20px' }}>🌍</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Accessible to Everyone</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Voice interaction breaks down language barriers and makes wellness services accessible to patients with different abilities and preferences.
                </p>
              </div>
              <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '2.5rem', color: '#667eea', marginBottom: '20px' }}>📊</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Smart Resource Management</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Optimize your clinic's resources by handling routine inquiries automatically, allowing staff to focus on patient care and complex cases.
                </p>
              </div>
              <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '2.5rem', color: '#667eea', marginBottom: '20px' }}>🔒</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Privacy & Security</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Built with healthcare-grade security standards to ensure patient data privacy and compliance with industry regulations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              Perfect for Every Wellness Practice
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#667eea' }}>Single Provider Studios</h3>
                <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                  Solo practitioners can handle appointment scheduling, service inquiries, and follow-up questions without missing calls or hiring additional staff.
                </p>
              </div>
              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#667eea' }}>Multi-Location Networks</h3>
                <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                  Scale your booking system across multiple locations with consistent service quality and centralized appointment management.
                </p>
              </div>
              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#667eea' }}>Specialty Clinics</h3>
                <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                  Handle complex scheduling for specialized treatments, manage waitlists, and provide detailed service information to potential patients.
                </p>
              </div>
              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#667eea' }}>Wellness Centers</h3>
                <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                  Manage multiple service types, class schedules, and package bookings with intelligent routing and personalized recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Results Section */}
        {showResults && searchResults.length > 0 && (
          <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '50px', color: '#333' }}>
                Available Wellness Partners
              </h2>
              <div style={{ display: 'grid', gap: '25px' }}>
                {searchResults.map((result, index) => (
                  <div key={index} style={{ 
                    padding: '25px', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '12px', 
                    backgroundColor: '#fafafa',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                  }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.4rem', margin: '0 0 8px 0', color: '#333' }}>{result.name}</h3>
                        <p style={{ fontSize: '1.1rem', margin: '0 0 5px 0', color: '#667eea', fontWeight: '500' }}>{result.specialty || result.service}</p>
                        <p style={{ fontSize: '1rem', margin: '0 0 10px 0', color: '#666' }}>📍 {result.location}</p>
                        <p style={{ fontSize: '1rem', margin: '0', color: '#28a745', fontWeight: '600' }}>💰 {result.price}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', color: '#ffc107', marginBottom: '5px' }}>
                          {'⭐'.repeat(Math.floor(result.rating))} {result.rating}
                        </div>
                        <button style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease',
                          marginRight: '8px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                        >
                          Book Now
                        </button>
                        <button style={{
                          background: 'none',
                          color: '#667eea',
                          border: '1px solid #667eea',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#667eea'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'none'; e.currentTarget.style.color = '#667eea'; }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Challenges Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>
              The Challenge
            </h2>
            <p style={{ textAlign: 'center', fontSize: '1.3rem', color: '#666', marginBottom: '60px', fontStyle: 'italic' }}>
              Ringing phones, empty timeslots—unanswered calls are costing your clinic.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: '#fff5f5', border: '1px solid #fed7d7' }}>
                <div style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '20px' }}>⏰</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Limited Resources</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Healthcare providers often face constraints in terms of time and human resources, making it difficult to handle every patient call.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: '#fff5f5', border: '1px solid #fed7d7' }}>
                <div style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '20px' }}>🌍</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Language Barriers</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Overcoming language barriers in patient care is crucial for accurate diagnosis and treatment, but often challenging to address.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: '#fff5f5', border: '1px solid #fed7d7' }}>
                <div style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '20px' }}>♿</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Accessibility Needs</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Ensuring information is accessible to patients with disabilities is a key responsibility that requires thoughtful solutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f0f9ff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px', color: '#333' }}>
              Our Solution
            </h2>
            <p style={{ textAlign: 'center', fontSize: '1.3rem', color: '#666', marginBottom: '50px', lineHeight: '1.6' }}>
              Our voice agent lets wellness clinics—from single-provider studios to multi-location networks—handle every patient call without adding front-desk staff.
            </p>
            <div style={{ textAlign: 'center', padding: '40px', borderRadius: '15px', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: '1.4rem', color: '#333', fontStyle: 'italic', lineHeight: '1.8' }}>
                Picture a reception line with <strong>zero hold time</strong>, appointments booked on the <strong>first ring</strong>, and follow-up questions answered before they become callbacks.
              </p>
              <p style={{ fontSize: '1.2rem', color: '#667eea', marginTop: '20px', fontWeight: '600' }}>
                That's the care-first experience we offer.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              Everything You Need to Ease Your Clinic's Daily Calls
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>🔒</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Data Privacy & Security</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Adhere to strict privacy regulations, ensuring patient data is handled securely with healthcare-grade encryption and compliance standards.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>⚙️</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Easy Integration</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Seamlessly integrate with your clinic's existing systems for a smooth transition without disrupting current operations.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>🎓</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Educational Content</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Offer educational and instructional content in an audio format, making it easier for patients to understand and follow treatment plans.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>🔧</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Customizable Models</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Bring your own API keys for transcription, language models, or text-to-speech. Or use our optimized models for best results.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>🧠</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Advanced AI</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Powered by state-of-the-art Large Language Models for natural, human-like conversations that understand context and nuance.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>⚡</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Real-time Processing</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Sub-500ms latency ensures instant responses and seamless interactions, even during peak hours and high call volumes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <Contact />
        
        {/* Calendar Section */}
        <Calendar />
      </main>

      <Footer />
    </>
  );
};

export default VoiceWellnessPartners;
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '../../components/Footer';
import Contact from '../../components/Contact';
import Calendar from '../../components/Calendar';
import VoiceAssistant from '../../components/VoiceAssistant';
import { REAL_ESTATE_CONFIG } from '../../components/VoiceAssistantConfigs';

const VoiceRealEstateService = () => {
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
        <title>Voice Agent for Real Estate Customer Service | Bright Mind Vision</title>
        <meta name="description" content="AI-powered voice assistant for real estate customer service. Automate property inquiries, schedule viewings, and provide 24/7 customer support for real estate agencies worldwide." />
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
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '4rem' }}>🏠</div>
              <h1 style={{ fontSize: '3rem', fontWeight: '700', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Voice Agent for Real Estate
              </h1>
            </div>
            <p style={{ fontSize: '1.3rem', marginBottom: '40px', opacity: 0.9, lineHeight: '1.6' }}>
              Transform your real estate customer service with AI-powered voice assistance. 
              Automate property inquiries, schedule viewings, and provide 24/7 support for your real estate agency.
            </p>
            
            {/* Voice Assistant Component */}
            <VoiceAssistant 
              config={REAL_ESTATE_CONFIG}
              onSearchResults={updateSearchResults}
              onShowResults={setShowResults}
            />
            
            {/* Dashboard Link */}
            <div style={{ marginTop: '30px' }}>
              <a 
                href="/product/real-estate" 
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                🏠 Real Estate Dashboard
              </a>
            </div>
          </div>
        </section>

        {/* Features Section (How It Works) */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📞</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>24/7 Property Inquiries</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Clients call your agency and are automatically assisted by the Voice Agent, collecting property preferences, budget, and contact information.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏠</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Smart Property Matching</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  AI analyzes client requirements and matches them with available properties, providing detailed information and scheduling viewings.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📱</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Lead Management</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  All client interactions are logged and organized in your CRM system, ensuring no leads are missed and follow-ups are automated.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              Why Choose Our Voice Agent for Real Estate?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
              <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '2.5rem', color: '#8b5cf6', marginBottom: '20px' }}>⚡</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Never Miss a Lead</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Capture every inquiry 24/7, even when your agents are busy with showings or after hours. Convert more leads into sales.
                </p>
              </div>
              <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '2.5rem', color: '#8b5cf6', marginBottom: '20px' }}>💰</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Increase Sales Efficiency</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Qualify leads automatically and provide instant property information, allowing agents to focus on high-value activities.
                </p>
              </div>
              <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '2.5rem', color: '#8b5cf6', marginBottom: '20px' }}>📈</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Scale Your Business</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Handle unlimited inquiries without hiring additional staff. Perfect for growing real estate agencies and brokerages.
                </p>
              </div>
              <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '2.5rem', color: '#8b5cf6', marginBottom: '20px' }}>🎯</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Better Customer Experience</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Provide instant responses and personalized property recommendations, improving client satisfaction and retention.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              Target Audience - Real Estate Industry
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#8b5cf6' }}>🏢 Real Estate Agencies</h3>
                <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                  Agencies looking to automate customer service and capture more leads without increasing staff costs.
                </p>
              </div>
              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#8b5cf6' }}>👨‍💼 Real Estate Agents</h3>
                <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                  Individual agents who want to provide 24/7 service to their clients while focusing on high-value activities.
                </p>
              </div>
              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#8b5cf6' }}>🏘️ Property Management Companies</h3>
                <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                  Companies managing multiple properties who need efficient tenant inquiries and maintenance requests.
                </p>
              </div>
              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#8b5cf6' }}>🏗️ Real Estate Developers</h3>
                <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                  Developers launching new projects who need to handle high volumes of inquiries and pre-sales information.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Challenges Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>
              Current Challenges in Real Estate
            </h2>
            <p style={{ textAlign: 'center', fontSize: '1.3rem', color: '#666', marginBottom: '60px', fontStyle: 'italic' }}>
              Missed calls, overwhelmed agents, and lost leads—real estate needs automation.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: '#fff5f5', border: '1px solid #fed7d7' }}>
                <div style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '20px' }}>📞</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Missed Inquiries</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Busy agents miss important client calls, leading to lost sales opportunities and frustrated potential buyers.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: '#fff5f5', border: '1px solid #fed7d7' }}>
                <div style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '20px' }}>⏰</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Limited Availability</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Clients expect 24/7 service, but agents can't be available around the clock, missing international and after-hours inquiries.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: '#fff5f5', border: '1px solid #fed7d7' }}>
                <div style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '20px' }}>📊</div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Poor Lead Management</h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                  Inconsistent follow-up processes and manual data entry lead to lost leads and poor conversion rates.
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
              Our Voice Agent for Real Estate automates customer service, lead qualification, and property inquiries, 
              allowing your agents to focus on closing deals while never missing a potential client.
            </p>
            <div style={{ textAlign: 'center', padding: '40px', borderRadius: '15px', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: '1.4rem', color: '#333', fontStyle: 'italic', lineHeight: '1.8' }}>
                Imagine a real estate agency where <strong>every call is answered</strong>, leads are <strong>automatically qualified</strong>, 
                and property information is provided <strong>instantly</strong> to potential buyers.
              </p>
              <p style={{ fontSize: '1.2rem', color: '#8b5cf6', marginTop: '20px', fontWeight: '600' }}>
                That's the efficiency our Voice Agent delivers.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              Core Features for Real Estate
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: '20px' }}>🎤</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Intelligent Property Matching</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  AI analyzes client requirements and matches them with available properties, providing detailed information and pricing.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: '20px' }}>📅</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Automated Viewing Scheduling</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Schedule property viewings automatically, sync with agent calendars, and send confirmation details to clients.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: '20px' }}>📊</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Lead Management & CRM</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  All client interactions are logged, qualified leads are prioritized, and follow-up reminders are automated.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: '20px' }}>💰</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Market Analysis & Pricing</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Provide real-time market data, comparable sales, and investment insights to help clients make informed decisions.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: '20px' }}>🌐</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Multi-language Support</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Serve international clients with multi-language support, expanding your market reach and client base.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: '20px' }}>📱</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Mobile Integration</h3>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Seamless integration with mobile apps, allowing agents to manage leads and viewings on the go.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User Flow Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
              Simple Implementation Process
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>1️⃣</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Setup & Integration</h3>
                <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                  Connect your CRM, upload property listings, and customize the voice agent for your agency's brand.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>2️⃣</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Client Inquiry</h3>
                <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                  Clients call your agency, Voice Agent collects requirements, budget, and preferences automatically.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>3️⃣</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Property Matching</h3>
                <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                  AI matches client needs with available properties and provides detailed information and pricing.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>4️⃣</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Viewing Scheduling</h3>
                <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                  Schedule property viewings, sync with agent calendars, and send confirmation details to clients.
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '30px', borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>5️⃣</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Lead Management</h3>
                <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                  Qualified leads are automatically assigned to agents with follow-up reminders and client history.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Access Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>
              Ready to Get Started?
            </h2>
            <p style={{ fontSize: '1.3rem', color: '#666', marginBottom: '40px' }}>
              Explore our real estate management dashboard to see how voice-powered customer service works in practice.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <Link href="/product/real-estate" style={{ textDecoration: 'none' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}>
                  <span>🏠</span>
                  <span>Real Estate Dashboard</span>
                </div>
              </Link>
              <Link href="/product/real-estate/properties" style={{ textDecoration: 'none' }}>
                <div style={{ 
                  background: 'white',
                  color: '#667eea',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid #667eea',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#667eea';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  <span>🏘️</span>
                  <span>Browse Properties</span>
                </div>
              </Link>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '20px' }}>
              Experience the full real estate management system with voice assistant integration
            </p>
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

export default VoiceRealEstateService;

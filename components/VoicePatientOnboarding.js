import React, { useState } from 'react';
import Link from 'next/link';
import VoiceAssistant from './VoiceAssistant';
import { CLINIC_CONFIG } from './VoiceAssistantConfigs';

const VoicePatientOnboarding = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Function to update search results, passed to VoiceAssistant
  const updateSearchResults = (results, show) => {
    setSearchResults(results);
    setShowResults(show);
  };

  return (
    <>
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
            <div style={{ fontSize: '4rem' }}>🏥</div>
            <h1 style={{ fontSize: '3rem', fontWeight: '700', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Voice Agent for Private Clinics
            </h1>
          </div>
          <p style={{ fontSize: '1.3rem', marginBottom: '40px', opacity: 0.9, lineHeight: '1.6' }}>
            Streamline patient appointment process in private clinics worldwide. 
            Automated patient onboarding, appointment booking, and cloud-based data management for doctors and clinic staff.
          </p>
          
          {/* Voice Assistant Component */}
          <VoiceAssistant 
            config={CLINIC_CONFIG}
            onSearchResults={updateSearchResults}
            onShowResults={setShowResults}
          />
          
          {/* Dashboard Link */}
          <div style={{ marginTop: '30px' }}>
            <a 
              href="/product/clinic" 
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
              📊 View Clinic Dashboard
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
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Voice Appointment Booking</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Patients call your clinic and are automatically onboarded by the Voice Agent, collecting name, phone number, and preferred appointment time.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>☁️</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Cloud Data Management</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                All patient details are stored securely in the cloud and organized in easily accessible spreadsheets for real-time review.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>👥</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Admin & Staff Access</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Doctors have full admin control while clinic staff get delegation access to manage appointments through mobile or web app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
            Why Choose Our Voice Agent for Private Clinics?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
            <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '2.5rem', color: '#667eea', marginBottom: '20px' }}>⚡</div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Efficiency & Automation</h3>
              <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                Reduces manual booking errors and frees up clinic staff to focus on in-person tasks rather than phone calls. No human interaction needed for appointment booking.
              </p>
            </div>
            <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '2.5rem', color: '#667eea', marginBottom: '20px' }}>📱</div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Real-time Accessibility</h3>
              <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                Provides real-time access to patient appointment data on both mobile and desktop, improving clinic operations and staff productivity.
              </p>
            </div>
            <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '2.5rem', color: '#667eea', marginBottom: '20px' }}>📈</div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Scalability</h3>
              <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                Easily scales to manage growing numbers of patients without increasing administrative overhead or staff requirements.
              </p>
            </div>
            <div style={{ padding: '30px', borderRadius: '10px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '2.5rem', color: '#667eea', marginBottom: '20px' }}>💰</div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Cost-saving</h3>
              <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                Saves costs on manpower and reduces potential for appointment mishandling. Subscription-based model with transparent pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
            Target Audience - Private Clinics Worldwide
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#667eea' }}>👨‍⚕️ Doctors in Private Clinics</h3>
              <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                Doctors who need an easy-to-use appointment management system to focus on patient care rather than administrative tasks.
              </p>
            </div>
            <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#667eea' }}>👩‍💼 Clinic Staff & Receptionists</h3>
              <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                Staff who handle patient appointments and need quick access to scheduling information without full admin privileges.
              </p>
            </div>
            <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#667eea' }}>🏥 Small to Medium Private Clinics</h3>
              <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                Private clinics that want to automate their appointment processes to save time and reduce administrative burden.
              </p>
            </div>
            <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#667eea' }}>📱 Mobile-First Clinics</h3>
              <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                Clinics looking for cloud-based solutions with mobile and web app access for real-time appointment management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>
            Current Challenges in Private Clinics
          </h2>
          <p style={{ textAlign: 'center', fontSize: '1.3rem', color: '#666', marginBottom: '60px', fontStyle: 'italic' }}>
            Manual appointment management, staff overload, and missed calls—private clinics need automation.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: '#fff5f5', border: '1px solid #fed7d7' }}>
              <div style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '20px' }}>📞</div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Missed Phone Calls</h3>
              <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                Busy clinic staff miss important patient calls, leading to lost appointments and frustrated patients.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: '#fff5f5', border: '1px solid #fed7d7' }}>
              <div style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '20px' }}>📝</div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Manual Data Entry</h3>
              <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                Staff spend hours manually entering patient information, leading to errors and inefficiency.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: '#fff5f5', border: '1px solid #fed7d7' }}>
              <div style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '20px' }}>👥</div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#333' }}>Staff Overload</h3>
              <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                Receptionists and staff are overwhelmed with administrative tasks, taking time away from patient care.
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
            Our Voice Agent for Private Clinics automates the entire patient appointment process, 
            from initial phone call to data management, freeing up your staff to focus on patient care.
          </p>
          <div style={{ textAlign: 'center', padding: '40px', borderRadius: '15px', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '1.4rem', color: '#333', fontStyle: 'italic', lineHeight: '1.8' }}>
              Picture a clinic where <strong>no calls are missed</strong>, appointments are booked <strong>automatically</strong>, 
              and all patient data is organized in <strong>real-time spreadsheets</strong> accessible on mobile and web.
            </p>
            <p style={{ fontSize: '1.2rem', color: '#667eea', marginTop: '20px', fontWeight: '600' }}>
              That's the efficiency our Voice Agent delivers.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
            Core Features for Private Clinics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>🎤</div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Voice Agent Functionality</h3>
              <p style={{ fontSize: '1.1rem', color: '#555' }}>
                Automates patient onboarding by capturing details (name, number, appointment time) through voice commands or phone calls.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>☁️</div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Cloud-based Data Management</h3>
              <p style={{ fontSize: '1.1rem', color: '#555' }}>
                All patient details stored securely in the cloud, organized in easily accessible spreadsheets for real-time review.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>👑</div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Admin & Delegation Roles</h3>
              <p style={{ fontSize: '1.1rem', color: '#555' }}>
                Doctors get full admin control while clinic staff get delegation access to manage appointments and sync with existing databases.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>📱</div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Mobile & Web App</h3>
              <p style={{ fontSize: '1.1rem', color: '#555' }}>
                User-friendly interface for quick viewing, management, and export of patient appointment data on any device.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>⚙️</div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Customizable Settings</h3>
              <p style={{ fontSize: '1.1rem', color: '#555' }}>
                Doctors can modify the Voice Agent to reflect their clinic's personality and update clinic details like operating hours.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}>💳</div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Subscription Model</h3>
              <p style={{ fontSize: '1.1rem', color: '#555' }}>
                Monthly or annual subscription with transparent pricing. Additional fees for customization and premium features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Flow Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>
            Simple User Flow
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>1️⃣</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Doctor Setup</h3>
              <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                Download app, create admin account, input clinic details, and customize voice agent responses.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>2️⃣</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Patient Booking</h3>
              <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                Patients call clinic, Voice Agent collects name, number, and appointment time automatically.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>3️⃣</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Admin Access</h3>
              <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                Doctor logs in to view/modify clinic details, patient appointments, and manage payments.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>4️⃣</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Staff Access</h3>
              <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                Staff access appointment sheets, sync with existing databases, or print for offline use.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>5️⃣</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Data Sync</h3>
              <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6' }}>
                Real-time data synchronization accessible by both admin and delegation accounts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default VoicePatientOnboarding;
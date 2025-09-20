import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ClinicLayout from '../../../components/ClinicLayout';

export default function ClinicDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  return (
    <>
      <Head>
        <title>ClinicPro Dashboard - Voice Patient Onboarding Demo | Bright Mind Vision</title>
        <meta name="description" content="Demo clinic management dashboard showcasing voice-powered patient onboarding system." />
        <link rel="icon" href="/bmv_favicon.png" />
      </Head>

      <ClinicLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
            {/* Top Navigation */}
            <div style={{ 
              backgroundColor: 'white', 
              borderBottom: '1px solid #e5e7eb', 
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: '60px'
            }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: 0,
                color: '#111827'
              }}>
                {activeMenu}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'none' }}>Welcome, Dr. Emily White</span>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: '#dbeafe', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#2563eb'
                }}>
                  EW
                </div>
              </div>
            </div>

            {/* Demo Banner */}
            <div className="demo-banner" style={{ 
              backgroundColor: '#dbeafe', 
              border: '1px solid #93c5fd',
              padding: '12px 16px',
              margin: '0 16px 16px 16px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '20px' }}>🎤</div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#1e40af' }}>
                  Voice Patient Onboarding Demo
                </h4>
              </div>
              <p style={{ fontSize: '12px', margin: 0, color: '#1e3a8a', lineHeight: '1.4' }}>
                Dashboard showcasing voice-powered patient onboarding system
              </p>
              <Link 
                href="/demo/voice-patient-onboarding"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#1e40af',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textAlign: 'center',
                  transition: 'background-color 0.2s ease',
                  alignSelf: 'flex-start'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#1e40af'}
              >
                Try Voice Onboarding →
              </Link>
            </div>

            {/* Mobile-specific responsive styles */}
            <style jsx>{`
              @media (min-width: 768px) {
                .demo-banner {
                  flex-direction: row !important;
                  align-items: center !important;
                  justify-content: space-between !important;
                  padding: 16px 24px !important;
                  margin: 0 24px 24px 24px !important;
                }
                .demo-banner h4 {
                  font-size: 16px !important;
                  margin-bottom: 4px !important;
                }
                .demo-banner p {
                  font-size: 14px !important;
                }
                .demo-banner a {
                  padding: 8px 16px !important;
                  font-size: 14px !important;
                  align-self: auto !important;
                }
                .dashboard-content {
                  padding: 0 24px 24px 24px !important;
                }
              }
              @media (max-width: 480px) {
                .dashboard-content h3 {
                  font-size: 20px !important;
                  margin-bottom: 16px !important;
                }
                .stats-grid {
                  grid-template-columns: 1fr !important;
                  gap: 16px !important;
                  margin-bottom: 24px !important;
                }
                .stats-card {
                  padding: 16px !important;
                }
                .activity-section {
                  padding: 16px !important;
                }
                .benefits-section {
                  padding: 16px !important;
                  margin-top: 16px !important;
                }
              }
            `}</style>

            {/* Dashboard Content */}
            <div className="dashboard-content" style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px 16px', backgroundColor: '#f9fafb' }}>
              <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <h3 className="dashboard-title" style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>ClinicPro Dashboard Overview</h3>
                
                {/* Stats Grid */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <div className="stats-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '2px solid #dbeafe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '32px' }}>🎤</div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Voice Onboardings Today</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>23</p>
                        <p style={{ fontSize: '12px', color: '#10b981', margin: '4px 0 0 0' }}>↗ +15% from yesterday</p>
                      </div>
                    </div>
                  </div>
                  <div className="stats-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '32px' }}>📅</div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Today's Appointments</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>16</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>8 scheduled via voice</p>
                      </div>
                    </div>
                  </div>
                  <div className="stats-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '32px' }}>👥</div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>New Patients (Voice)</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>47</p>
                        <p style={{ fontSize: '12px', color: '#10b981', margin: '4px 0 0 0' }}>This week</p>
                      </div>
                    </div>
                  </div>
                  <div className="stats-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '32px' }}>⚡</div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Avg. Onboarding Time</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>3.2 min</p>
                        <p style={{ fontSize: '12px', color: '#10b981', margin: '4px 0 0 0' }}>↘ -40% vs traditional</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-section" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Recent Voice Onboarding Activity</h4>
                  <div style={{ space: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '20px', marginRight: '12px' }}>🎤</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Voice onboarding completed</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Sarah Johnson completed voice registration in 2.8 minutes</p>
                      </div>
                      <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>15 min ago</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '20px', marginRight: '12px' }}>📅</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Appointment scheduled via voice</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Mike Wilson scheduled follow-up for next Tuesday</p>
                      </div>
                      <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>1 hour ago</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '20px', marginRight: '12px' }}>🎯</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Voice intake form completed</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Emma Davis provided medical history via voice assistant</p>
                      </div>
                      <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>2 hours ago</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: '20px', marginRight: '12px' }}>✅</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Insurance verification via voice</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>John Smith verified insurance details through voice system</p>
                      </div>
                      <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>3 hours ago</span>
                    </div>
                  </div>
                </div>

                {/* Voice Onboarding Benefits */}
                <div className="benefits-section" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginTop: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Voice Onboarding Benefits</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>⚡</div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Faster Processing</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>60% reduction in onboarding time</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>📱</div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Hands-free</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Complete forms without typing</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>🎯</div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Higher Accuracy</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Reduced data entry errors</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>😊</div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Better Experience</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>More engaging patient interaction</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </ClinicLayout>
    </>
  );
}
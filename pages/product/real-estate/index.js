import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import RealEstateLayout from '../../../components/RealEstateLayout';

export default function RealEstateDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  return (
    <>
      <Head>
        <title>RealEstatePro Dashboard - Voice Real Estate Service | Bright Mind Vision</title>
        <meta name="description" content="Real estate management dashboard showcasing voice-powered customer service system." />
        <link rel="icon" href="/bmv_favicon.png" />
      </Head>

      <RealEstateLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
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
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'none' }}>Welcome, Sarah Johnson</span>
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
                  SJ
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div style={{ padding: '24px' }}>
              {/* Welcome Section */}
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                padding: '24px 16px', 
                borderRadius: '12px', 
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
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
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0', lineHeight: '1.2' }}>
                    Welcome to RealEstatePro
                  </h1>
                  <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 20px 0', lineHeight: '1.4' }}>
                    Your voice-powered real estate management system is running smoothly
                  </p>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '12px' 
                  }}>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.2)', 
                      padding: '12px 16px', 
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>Voice Assistant</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>🟢 Active</div>
                    </div>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.2)', 
                      padding: '12px 16px', 
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>Today's Inquiries</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>12</div>
                    </div>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.2)', 
                      padding: '12px 16px', 
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>Scheduled Viewings</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>8</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px', 
                marginBottom: '24px' 
              }}>
                <div style={{ 
                  background: 'white', 
                  padding: '24px', 
                  borderRadius: '12px', 
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px' }}>🏘️</div>
                    <div style={{ 
                      background: '#dbeafe', 
                      color: '#2563eb', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      +5%
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>156</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Properties</div>
                </div>

                <div style={{ 
                  background: 'white', 
                  padding: '24px', 
                  borderRadius: '12px', 
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px' }}>👥</div>
                    <div style={{ 
                      background: '#dcfce7', 
                      color: '#16a34a', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      +12%
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>89</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Active Leads</div>
                </div>

                <div style={{ 
                  background: 'white', 
                  padding: '24px', 
                  borderRadius: '12px', 
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px' }}>📅</div>
                    <div style={{ 
                      background: '#fef3c7', 
                      color: '#d97706', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      +8%
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>23</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Viewings This Week</div>
                </div>

                <div style={{ 
                  background: 'white', 
                  padding: '24px', 
                  borderRadius: '12px', 
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px' }}>💰</div>
                    <div style={{ 
                      background: '#fce7f3', 
                      color: '#be185d', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      +15%
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>$2.4M</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Sales This Month</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ 
                background: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0', color: '#111827' }}>
                  Recent Voice Assistant Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    background: '#f8fafc', 
                    borderRadius: '8px' 
                  }}>
                    <div style={{ fontSize: '20px' }}>🎤</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        New inquiry for 3-bedroom house in downtown
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Voice Assistant • 2 minutes ago
                      </div>
                    </div>
                    <div style={{ 
                      background: '#dcfce7', 
                      color: '#16a34a', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      New Lead
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    background: '#f8fafc', 
                    borderRadius: '8px' 
                  }}>
                    <div style={{ fontSize: '20px' }}>📅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        Viewing scheduled for Luxury Condo - Tomorrow 2:00 PM
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Voice Assistant • 15 minutes ago
                      </div>
                    </div>
                    <div style={{ 
                      background: '#dbeafe', 
                      color: '#2563eb', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      Scheduled
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    background: '#f8fafc', 
                    borderRadius: '8px' 
                  }}>
                    <div style={{ fontSize: '20px' }}>💰</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        Price inquiry for investment property portfolio
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Voice Assistant • 1 hour ago
                      </div>
                    </div>
                    <div style={{ 
                      background: '#fef3c7', 
                      color: '#d97706', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      Price Inquiry
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ 
                marginTop: '24px',
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '12px' 
              }}>
                <Link href="/product/real-estate/properties" style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    background: 'white', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏘️</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Manage Properties</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>View all listings</div>
                  </div>
                </Link>

                <Link href="/product/real-estate/leads" style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    background: 'white', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>View Leads</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Track inquiries</div>
                  </div>
                </Link>

                <Link href="/product/real-estate/viewings" style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    background: 'white', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Schedule Viewings</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Manage appointments</div>
                  </div>
                </Link>

                <Link href="/product/voice-real-estate-service" style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: 'white',
                    padding: '20px', 
                    borderRadius: '12px', 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎤</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>Voice Assistant</div>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>Test the system</div>
                  </div>
                </Link>
              </div>
            </div>
      </RealEstateLayout>
    </>
  );
}

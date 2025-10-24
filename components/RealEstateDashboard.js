import React, { useState } from 'react';
import Link from 'next/link';
import RealEstateLayout from './RealEstateLayout';

const RealEstateDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  return (
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

      {/* Product Banner */}
      <div className="product-banner" style={{
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
          <div style={{ fontSize: '20px' }}>🏠</div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#1e40af' }}>
            Voice Real Estate Service Product
          </h4>
        </div>
        <p style={{ fontSize: '12px', margin: 0, color: '#1e3a8a', lineHeight: '1.4' }}>
          Dashboard showcasing voice-powered real estate customer service system
        </p>
        <Link
          href="/product/voice-real-estate-service"
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
          Try Voice Service →
        </Link>
      </div>

      {/* Mobile-specific responsive styles */}
      <style jsx>{`
        @media (min-width: 768px) {
          .product-banner {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 16px 24px !important;
            margin: 0 24px 24px 24px !important;
          }
          .product-banner h4 {
            font-size: 16px !important;
            margin-bottom: 4px !important;
          }
          .product-banner p {
            font-size: 14px !important;
          }
          .product-banner a {
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
          <h3 className="dashboard-title" style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>RealEstatePro Dashboard Overview</h3>

          {/* Stats Grid */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div className="stats-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '2px solid #dbeafe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>🏠</div>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Properties Listed</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>47</p>
                  <p style={{ fontSize: '12px', color: '#10b981', margin: '4px 0 0 0' }}>↗ +8 this month</p>
                </div>
              </div>
            </div>
            <div className="stats-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>📞</div>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Voice Inquiries Today</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>23</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>12 qualified leads</p>
                </div>
              </div>
            </div>
            <div className="stats-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>👥</div>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Active Clients</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>156</p>
                  <p style={{ fontSize: '12px', color: '#10b981', margin: '4px 0 0 0' }}>This month</p>
                </div>
              </div>
            </div>
            <div className="stats-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>💰</div>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Revenue This Month</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>$2.4M</p>
                  <p style={{ fontSize: '12px', color: '#10b981', margin: '4px 0 0 0' }}>↗ +15% vs last month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Recent Voice Inquiries</h4>
            <div style={{ space: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '20px', marginRight: '12px' }}>🏠</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Property inquiry via voice</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Client interested in 3-bedroom house in downtown area</p>
                </div>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>15 min ago</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '20px', marginRight: '12px' }}>📅</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Viewing scheduled via voice</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Property viewing scheduled for tomorrow at 2 PM</p>
                </div>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>1 hour ago</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '20px', marginRight: '12px' }}>💬</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Client follow-up via voice</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Client requested additional information about financing options</p>
                </div>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>2 hours ago</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '20px', marginRight: '12px' }}>✅</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Lead qualified via voice</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>High-value client qualified and assigned to senior agent</p>
                </div>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>3 hours ago</span>
              </div>
            </div>
          </div>

          {/* Voice Service Benefits */}
          <div className="benefits-section" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginTop: '24px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Voice Service Benefits</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>⚡</div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Instant Responses</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>24/7 property information</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🎯</div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Smart Matching</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>AI-powered property recommendations</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>📱</div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Easy Booking</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Automated viewing scheduling</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>📊</div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0', color: '#111827' }}>Lead Management</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Automated CRM integration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RealEstateLayout>
  );
};

export default RealEstateDashboard;

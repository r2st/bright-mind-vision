import React, { useState } from 'react';
import Link from 'next/link';

const ClinicDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  return (
    <>
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

      {/* Main Content */}
      <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 60px)' }}>
        {/* Welcome Section */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '20px', 
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            margin: '0 0 8px 0',
            color: '#111827'
          }}>
            Welcome to ClinicPro Dashboard
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            margin: '0 0 16px 0',
            lineHeight: '1.5'
          }}>
            Manage your clinic operations with our AI-powered voice assistant system.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap'
          }}>
            <Link href="/product/voice-patient-onboarding" style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block'
            }}>
              Voice Onboarding
            </Link>
            <Link href="/product/clinic/patients" style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block'
            }}>
              Manage Patients
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '20px' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>156</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Patients</div>
          </div>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>23</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Today's Appointments</div>
          </div>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>8</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Pending Reviews</div>
          </div>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6', marginBottom: '4px' }}>94%</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Satisfaction Rate</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: '0 0 16px 0',
            color: '#111827'
          }}>
            Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#10b981' 
              }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>New patient registered</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Sarah Johnson - 2 minutes ago</div>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#3b82f6' 
              }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Appointment scheduled</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Dr. Smith - Tomorrow 10:00 AM</div>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#f59e0b' 
              }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Voice assistant updated</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>New patient onboarding flow - 1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClinicDashboard;

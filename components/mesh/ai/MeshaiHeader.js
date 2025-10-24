import React, { useState } from 'react';

export default function MeshaiHeader() {
  const [notifications, setNotifications] = useState(3);

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '60px'
    }}>
      {/* Left side - Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Meshai</span>
        <span style={{ fontSize: '14px', color: '#d1d5db' }}>/</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
          AI Product Assistant
        </span>
      </div>

      {/* Right side - Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search products, messages..."
            style={{
              padding: '8px 12px 8px 36px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              width: '300px',
              outline: 'none',
              backgroundColor: '#f9fafb'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            🔍
          </span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          >
            🔔
          </div>
          {notifications > 0 && (
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {notifications}
            </div>
          )}
        </div>

        {/* AI Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#f0f4ff',
          borderRadius: '6px',
          border: '1px solid #e0e7ff'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            animation: 'pulse 2s infinite'
          }}></div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#667eea' }}>
            AI Processing
          </span>
        </div>

        {/* User Profile */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#dbeafe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2563eb',
          cursor: 'pointer'
        }}>
          AI
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </header>
  );
}

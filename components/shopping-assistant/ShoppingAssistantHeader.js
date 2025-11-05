import React, { useState } from 'react';

export default function ShoppingAssistantHeader() {
  const [notifications, setNotifications] = useState(3);

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '60px',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Left side - Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Shopping Assistant</span>
        <span style={{ fontSize: '14px', color: '#d1d5db' }}>/</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
          AI Product Assistant
        </span>
      </div>

      {/* Right side - Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search..."
            style={{
              padding: '8px 12px 8px 36px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              width: '200px',
              maxWidth: '100%',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
          <span style={{
            position: 'absolute',
            left: '12px',
            fontSize: '16px',
            color: '#9ca3af'
          }}>
            🔍
          </span>
        </div>

        {/* Notifications */}
        <div style={{
          position: 'relative',
          cursor: 'pointer',
          padding: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>🔔</span>
          {notifications > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: '600'
            }}>
              {notifications}
            </span>
          )}
        </div>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '6px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            SA
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#111827'
          }}>
            Admin
          </span>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          header {
            padding: 12px 16px !important;
          }
          header > div:first-child {
            width: 100%;
            order: 2;
          }
          header > div:last-child {
            width: 100%;
            justify-content: space-between !important;
            order: 1;
          }
          header input[type="text"] {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          header {
            padding: 10px 12px !important;
            min-height: 56px !important;
          }
          header > div:last-child {
            gap: 8px !important;
          }
          header input[type="text"] {
            font-size: 13px !important;
            padding: 6px 10px 6px 32px !important;
          }
        }
      `}</style>
    </header>
  );
}


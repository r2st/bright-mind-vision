import React from 'react';

export default function MeshaiSidebar({ activeMenu, setActiveMenu }) {
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: '📊', path: '/product/meshai' },
    { id: 'Products', label: 'Products', icon: '📦', path: '/product/meshai/products' },
    { id: 'WhatsApp', label: 'WhatsApp', icon: '📱', path: '/product/meshai/whatsapp' },
    { id: 'AI Recommendations', label: 'AI Recommendations', icon: '🤖', path: '/product/meshai/recommendations' },
    { id: 'Analytics', label: 'Analytics', icon: '📈', path: '/product/meshai/analytics' },
    { id: 'Settings', label: 'Settings', icon: '⚙️', path: '/product/meshai/settings' }
  ];

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '280px',
      height: '100vh',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: '#667eea',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: 'white'
        }}>
          🤖
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
            Meshai
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            AI Product Assistant
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 0' }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeMenu === item.id ? '#f0f4ff' : 'transparent',
              borderRight: activeMenu === item.id ? '3px solid #667eea' : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (activeMenu !== item.id) {
                e.target.style.backgroundColor = '#f8fafc';
              }
            }}
            onMouseOut={(e) => {
              if (activeMenu !== item.id) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            <span style={{
              fontSize: '14px',
              fontWeight: activeMenu === item.id ? '600' : '500',
              color: activeMenu === item.id ? '#667eea' : '#374151'
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </nav>

      {/* AI Status */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px',
        padding: '16px',
        backgroundColor: '#f0f4ff',
        borderRadius: '8px',
        border: '1px solid #e0e7ff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#16a34a'
          }}></div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
            AI Active
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280' }}>
          Processing WhatsApp messages and generating recommendations
        </div>
      </div>
    </div>
  );
}

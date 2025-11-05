import React from 'react';

export default function ShoppingAssistantSidebar({ activeMenu, setActiveMenu }) {
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: '📊', path: '/product/shopping-assistant' },
    { id: 'Products', label: 'Products', icon: '📦', path: '/product/shopping-assistant/products' },
    { id: 'WhatsApp', label: 'WhatsApp', icon: '📱', path: '/product/shopping-assistant/whatsapp' },
    { id: 'AI Recommendations', label: 'AI Recommendations', icon: '🤖', path: '/product/shopping-assistant/recommendations' },
    { id: 'Analytics', label: 'Analytics', icon: '📈', path: '/product/shopping-assistant/analytics' },
    { id: 'Settings', label: 'Settings', icon: '⚙️', path: '/product/shopping-assistant/settings' }
  ];

  return (
    <>
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '280px',
        height: '100vh',
        height: '100dvh', /* Use dynamic viewport height for mobile */
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        zIndex: 1000,
        overflowY: 'auto',
        transition: 'transform 0.3s ease',
        transform: 'translateX(0)'
      }}
      className="shopping-assistant-sidebar"
      >
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
            Shopping Assistant
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
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeMenu === item.id ? '#f3f4f6' : 'transparent',
              borderLeft: activeMenu === item.id ? '3px solid #667eea' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (activeMenu !== item.id) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (activeMenu !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{
              fontSize: '14px',
              fontWeight: activeMenu === item.id ? '600' : '400',
              color: activeMenu === item.id ? '#111827' : '#6b7280'
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          textAlign: 'center'
        }}>
          Shopping Assistant v1.0
        </div>
      </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .shopping-assistant-sidebar {
            transform: translateX(-100%) !important;
            width: 280px !important;
          }
          .shopping-assistant-sidebar.open {
            transform: translateX(0) !important;
          }
        }
        @media (max-width: 480px) {
          .shopping-assistant-sidebar {
            width: 100% !important;
            max-width: 320px !important;
          }
        }
      `}</style>
    </>
  );
}


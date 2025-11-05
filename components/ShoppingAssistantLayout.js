import React from 'react';
import ShoppingAssistantSidebar from './shopping-assistant/ShoppingAssistantSidebar';
import ShoppingAssistantHeader from './shopping-assistant/ShoppingAssistantHeader';

export default function ShoppingAssistantLayout({ children, activeMenu, setActiveMenu }) {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      minHeight: '100dvh', /* Use dynamic viewport height for mobile */
      backgroundColor: '#f8fafc',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Sidebar */}
      <ShoppingAssistantSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: '280px',
        width: 'calc(100% - 280px)',
        minWidth: 0 /* Prevent flex item from overflowing */
      }}>
        {/* Header */}
        <ShoppingAssistantHeader />
        
        {/* Page Content */}
        <main style={{ flex: 1, minWidth: 0, width: '100%' }}>
          {children}
        </main>
      </div>
      
      {/* Mobile responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          div > div {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}


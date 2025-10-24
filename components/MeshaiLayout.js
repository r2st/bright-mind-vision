import React from 'react';
import MeshaiSidebar from './mesh/ai/MeshaiSidebar';
import MeshaiHeader from './mesh/ai/MeshaiHeader';

export default function MeshaiLayout({ children, activeMenu, setActiveMenu }) {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc' 
    }}>
      {/* Sidebar */}
      <MeshaiSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: '280px'
      }}>
        {/* Header */}
        <MeshaiHeader />
        
        {/* Page Content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import Footer from './Footer';
import RealEstateSidebar from './real-estate/RealEstateSidebar';
import styles from './real-estate/RealEstateSidebar.module.css';

const RealEstateLayout = ({ children, activeMenu: propActiveMenu, setActiveMenu: propSetActiveMenu }) => {
  // Use provided props or create internal state
  const [internalActiveMenu, setInternalActiveMenu] = useState("Dashboard");
  
  const activeMenu = propActiveMenu || internalActiveMenu;
  const setActiveMenu = propSetActiveMenu || setInternalActiveMenu;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      
      <div className={styles.realEstateContent}>
        {/* Sidebar */}
        <RealEstateSidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu}
        />

        {/* Main Content */}
        <div className={styles.mainContent}>
          {children}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RealEstateLayout;

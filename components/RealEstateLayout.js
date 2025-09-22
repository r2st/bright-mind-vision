import React from 'react';
import Footer from './Footer';
import RealEstateSidebar from './real-estate/RealEstateSidebar';
import styles from './real-estate/RealEstateSidebar.module.css';

const RealEstateLayout = ({ children, activeMenu, setActiveMenu }) => {

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

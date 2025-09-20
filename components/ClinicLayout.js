import React from 'react';
import Footer from './Footer';
import Sidebar from './clinic/Sidebar';
import styles from './clinic/Sidebar.module.css';

const ClinicLayout = ({ children, activeMenu, setActiveMenu }) => {

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      
      <div className={styles.clinicContent}>
        {/* Sidebar */}
        <Sidebar 
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

export default ClinicLayout;

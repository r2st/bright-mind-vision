import React from 'react';
import Footer from './Footer';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      
      <main className={styles.main}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;

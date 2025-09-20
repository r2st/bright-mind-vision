import { useState } from 'react'
import Link from 'next/link'
import styles from './ClinicHeader.module.css'

export default function ClinicHeader({ isMenuOpen, setIsMenuOpen }) {
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className={styles.clinicHeader}>
      <div className={styles.clinicContainer}>
        <Link href="/" className={styles.clinicLogo}>
          <img src="/bmv-logo.png" alt="Bright Mind Vision" className={styles.clinicLogoImage} />
          <div className={styles.clinicInfo}>
            <h1 className={styles.clinicTitle}>ClinicPro</h1>
            <p className={styles.clinicSubtitle}>Bright Mind Medical Center</p>
          </div>
        </Link>
        
        {/* Mobile Menu Button */}
        <button 
          className={styles.clinicMenuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`${styles.clinicHamburger} ${isMenuOpen ? styles.clinicHamburgerOpen : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </header>
  )
}

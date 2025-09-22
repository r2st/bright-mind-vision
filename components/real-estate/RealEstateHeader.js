import { useState } from 'react'
import Link from 'next/link'
import styles from './RealEstateHeader.module.css'

export default function RealEstateHeader({ isMenuOpen, setIsMenuOpen }) {
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className={styles.realEstateHeader}>
      <div className={styles.realEstateContainer}>
        <Link href="/" className={styles.realEstateLogo}>
          <img src="/bmv-logo.png" alt="Bright Mind Vision" className={styles.realEstateLogoImage} />
          <div className={styles.realEstateInfo}>
            <h1 className={styles.realEstateTitle}>RealEstatePro</h1>
            <p className={styles.realEstateSubtitle}>Premier Real Estate Agency</p>
          </div>
        </Link>
        
        {/* Mobile Menu Button */}
        <button 
          className={styles.realEstateMenuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`${styles.realEstateHamburger} ${isMenuOpen ? styles.realEstateHamburgerOpen : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </header>
  )
}

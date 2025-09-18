import { useState } from 'react'
import styles from './Header.module.css'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src="/bmv-logo.png" alt="Bright Mind Vision" className={styles.logoImage} />
        </div>
        
        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <a href="/" className={styles.navLink}>Home</a>
          <a href="/projects" className={styles.navLink}>Projects</a>
          <a href="/#services" className={styles.navLink}>Services</a>
          <a href="/#about" className={styles.navLink}>About</a>
          <a href="/#contact" className={styles.navLink}>Contact</a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerOpen : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <nav className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ''}`}>
        <a href="/" className={styles.mobileNavLink} onClick={closeMenu}>Home</a>
        <a href="/projects" className={styles.mobileNavLink} onClick={closeMenu}>Projects</a>
        <a href="/#services" className={styles.mobileNavLink} onClick={closeMenu}>Services</a>
        <a href="/#about" className={styles.mobileNavLink} onClick={closeMenu}>About</a>
        <a href="/#contact" className={styles.mobileNavLink} onClick={closeMenu}>Contact</a>
      </nav>
    </header>
  )
}

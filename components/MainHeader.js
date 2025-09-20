import { useState } from 'react'
import styles from './MainHeader.module.css'

export default function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleDemo = () => {
    setIsDemoOpen(!isDemoOpen)
  }

  const closeDemo = () => {
    setIsDemoOpen(false)
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
          <div className={styles.dropdown}>
            <button 
              className={`${styles.navLink} ${styles.dropdownToggle}`}
              onClick={toggleDemo}
              onMouseEnter={() => setIsDemoOpen(true)}
              onMouseLeave={() => setIsDemoOpen(false)}
            >
              Demo
              <span className={styles.dropdownArrow}>▼</span>
            </button>
            <div className={`${styles.dropdownMenu} ${isDemoOpen ? styles.dropdownOpen : ''}`}
                 onMouseEnter={() => setIsDemoOpen(true)}
                 onMouseLeave={() => setIsDemoOpen(false)}>
              {/* <a href="/demo/voice-hotel-booking" className={styles.dropdownLink} onClick={closeDemo}>
                Voice Hotel Booking
              </a> */}
              <a href="/demo/voice-wellness-partners" className={styles.dropdownLink} onClick={closeDemo}>
                Wellness Partners
              </a>
              <a href="/demo/voice-patient-onboarding" className={styles.dropdownLink} onClick={closeDemo}>
                Patient Onboarding
              </a>
            </div>
          </div>
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
        <div className={styles.mobileDropdown}>
          <button className={styles.mobileDropdownToggle} onClick={toggleDemo}>
            Demo <span className={styles.dropdownArrow}>▼</span>
          </button>
          <div className={`${styles.mobileDropdownMenu} ${isDemoOpen ? styles.mobileDropdownOpen : ''}`}>
            {/* <a href="/demo/voice-hotel-booking" className={styles.mobileNavLink} onClick={closeMenu}>
              Voice Hotel Booking
            </a> */}
            <a href="/demo/voice-wellness-partners" className={styles.mobileNavLink} onClick={closeMenu}>
              Voice Wellness Partners
            </a>
            <a href="/demo/voice-patient-onboarding" className={styles.mobileNavLink} onClick={closeMenu}>
              Voice Patient Onboarding
            </a>
          </div>
        </div>
        <a href="/#contact" className={styles.mobileNavLink} onClick={closeMenu}>Contact</a>
      </nav>
    </header>
  )
}

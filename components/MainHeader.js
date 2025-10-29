import { useState } from 'react'
import styles from './MainHeader.module.css'

export default function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProductOpen, setIsProductOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleProduct = () => {
    setIsProductOpen(!isProductOpen)
  }

  const closeProduct = () => {
    setIsProductOpen(false)
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
          <div className={styles.dropdown}>
            <button 
              className={`${styles.navLink} ${styles.dropdownToggle}`}
              onClick={toggleProduct}
              onMouseEnter={() => setIsProductOpen(true)}
              onMouseLeave={() => setIsProductOpen(false)}
            >
              Product
              <span className={styles.dropdownArrow}>▼</span>
            </button>
            <div className={`${styles.dropdownMenu} ${isProductOpen ? styles.dropdownOpen : ''}`}
                 onMouseEnter={() => setIsProductOpen(true)}
                 onMouseLeave={() => setIsProductOpen(false)}>
              {/* <a href="/product/voice-hotel-booking" className={styles.dropdownLink} onClick={closeProduct}>
                Voice Hotel Booking
              </a> */}
              <a href="/product/voice-real-estate-service" className={styles.dropdownLink} onClick={closeProduct}>
                Real Estate Service
              </a>
              <a href="/product/voice-patient-onboarding" className={styles.dropdownLink} onClick={closeProduct}>
                Patient Onboarding
              </a>
              <a href="/product/voice-wellness-partners" className={styles.dropdownLink} onClick={closeProduct}>
                Wellness Partners
              </a>
              <a href="/product/shopping-assistant" className={styles.dropdownLink} onClick={closeProduct}>
                Shopping Assistant
              </a>
            </div>
          </div>
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
        <div className={styles.mobileDropdown}>
          <button className={styles.mobileDropdownToggle} onClick={toggleProduct}>
            Product <span className={styles.dropdownArrow}>▼</span>
          </button>
          <div className={`${styles.mobileDropdownMenu} ${isProductOpen ? styles.mobileDropdownOpen : ''}`}>
            {/* <a href="/product/voice-hotel-booking" className={styles.mobileNavLink} onClick={closeMenu}>
              Voice Hotel Booking
            </a> */}
            <a href="/product/voice-real-estate-service" className={styles.mobileNavLink} onClick={closeMenu}>
              Real Estate Service
            </a>
            <a href="/product/voice-patient-onboarding" className={styles.mobileNavLink} onClick={closeMenu}>
              Patient Onboarding
            </a>
            <a href="/product/voice-wellness-partners" className={styles.mobileNavLink} onClick={closeMenu}>
              Wellness Partners
            </a>
            <a href="/product/shopping-assistant" className={styles.mobileNavLink} onClick={closeMenu}>
              Shopping Assistant
            </a>
          </div>
        </div>
        <a href="/projects" className={styles.mobileNavLink} onClick={closeMenu}>Projects</a>
        <a href="/#services" className={styles.mobileNavLink} onClick={closeMenu}>Services</a>
        <a href="/#about" className={styles.mobileNavLink} onClick={closeMenu}>About</a>
        <a href="/#contact" className={styles.mobileNavLink} onClick={closeMenu}>Contact</a>
      </nav>
    </header>
  )
}

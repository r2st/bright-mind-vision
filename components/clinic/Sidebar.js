'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMenuContext } from '../ClientHeaderWrapper'
import styles from './Sidebar.module.css'

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const router = useRouter()
  const { isMenuOpen, setIsMenuOpen } = useMenuContext()

  const sidebarItems = [
    { icon: "🏠", label: "Dashboard", href: "/product/clinic" },
    { icon: "📅", label: "Reservations", href: "/product/clinic/reservations" },
    { icon: "👥", label: "Patients", href: "/product/clinic/patients" },
    { icon: "⏰", label: "Treatments", href: "/product/clinic/treatments" },
    { icon: "👨‍⚕️", label: "Staff List", href: "/product/clinic/staff" },
  ]

  const handleMenuClick = (item) => {
    setActiveMenu(item.label)
    setIsMenuOpen(false)
    // Navigate to the page
    router.push(item.href)
  }

  // Determine active menu based on current route
  const getCurrentActiveMenu = () => {
    const currentPath = router.pathname
    const currentItem = sidebarItems.find(item => item.href === currentPath)
    return currentItem ? currentItem.label : "Dashboard"
  }

  const currentActiveMenu = getCurrentActiveMenu()

  return (
    <>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMenuOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeaderContent}>
            <span className={styles.sidebarIcon}>🏥</span>
            <h1 className={styles.sidebarTitle}>ClinicPro</h1>
          </div>
        </div>

        {/* Clinic Info */}
        <div className={styles.clinicInfoSection}>
          <div className={styles.clinicInfoCard}>
            <h3 className={styles.clinicInfoTitle}>Bright Mind Medical Center</h3>
            <p className={styles.clinicInfoAddress}>123 Healthcare Avenue<br />Medical District</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item)}
              className={`${styles.navItem} ${currentActiveMenu === item.label ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Back to Voice Onboarding */}
        <div className={styles.sidebarFooter}>
          <Link href="/product/voice-patient-onboarding" className={styles.backLink}>
            <span className={styles.backIcon}>←</span>
            Back to Voice Onboarding
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className={styles.overlay}
        />
      )}
    </>
  )
}

export default Sidebar

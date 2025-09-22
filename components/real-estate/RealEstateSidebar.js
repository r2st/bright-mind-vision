'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMenuContext } from '../HeaderWrapper'
import styles from './RealEstateSidebar.module.css'

const RealEstateSidebar = ({ activeMenu, setActiveMenu }) => {
  const router = useRouter()
  const { isMenuOpen, setIsMenuOpen } = useMenuContext()

  const sidebarItems = [
    { icon: "🏠", label: "Dashboard", href: "/product/real-estate" },
    { icon: "🏘️", label: "Properties", href: "/product/real-estate/properties" },
    { icon: "📅", label: "Viewings", href: "/product/real-estate/viewings" },
    { icon: "👥", label: "Leads", href: "/product/real-estate/leads" },
    { icon: "👨‍💼", label: "Agents", href: "/product/real-estate/agents" },
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
            <span className={styles.sidebarIcon}>🏠</span>
            <h1 className={styles.sidebarTitle}>RealEstatePro</h1>
          </div>
        </div>

        {/* Agency Info */}
        <div className={styles.agencyInfoSection}>
          <div className={styles.agencyInfo}>
            <div className={styles.agencyName}>Premier Real Estate</div>
            <div className={styles.agencyLocation}>Downtown Office</div>
            <div className={styles.agencyStatus}>
              <span className={styles.statusDot}></span>
              Voice Assistant Active
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          <ul className={styles.sidebarList}>
            {sidebarItems.map((item, index) => (
              <li key={index} className={styles.sidebarItem}>
                <Link 
                  href={item.href}
                  className={`${styles.sidebarLink} ${currentActiveMenu === item.label ? styles.active : ''}`}
                  onClick={() => handleMenuClick(item)}
                >
                  <span className={styles.sidebarLinkIcon}>{item.icon}</span>
                  <span className={styles.sidebarLinkText}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Back to Voice Assistant */}
        <div className={styles.sidebarFooter}>
          <Link 
            href="/product/voice-real-estate-service" 
            className={styles.backToVoiceLink}
          >
            <span className={styles.backToVoiceIcon}>🎤</span>
            <span className={styles.backToVoiceText}>Back to Voice Assistant</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}

export default RealEstateSidebar

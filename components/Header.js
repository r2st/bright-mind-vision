import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>Bright Mind Vision</h1>
        </div>
        <nav className={styles.nav}>
          <a href="#home" className={styles.navLink}>Home</a>
          <a href="#services" className={styles.navLink}>Services</a>
          <a href="#about" className={styles.navLink}>About</a>
          <a href="#contact" className={styles.navLink}>Contact</a>
        </nav>
      </div>
    </header>
  )
}

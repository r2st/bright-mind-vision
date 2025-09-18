import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3>Bright Mind Vision</h3>
            <p>Empowering businesses with cutting-edge AI solutions</p>
          </div>
          
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4>Services</h4>
              <a href="#ai-consulting">AI Consulting</a>
              <a href="#machine-learning">Machine Learning</a>
              <a href="#automation">Process Automation</a>
              <a href="#analytics">Data Analytics</a>
            </div>
            
            <div className={styles.linkGroup}>
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#team">Our Team</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>
            
            <div className={styles.linkGroup}>
              <h4>Connect</h4>
              <a href="mailto:contact@brightmindvision.com">contact@brightmindvision.com</a>
              <a href="tel:+919554024428">+91 95540 24428</a>
              <div className={styles.social}>
                <a href="#" aria-label="LinkedIn">LinkedIn</a>
                <a href="#" aria-label="Twitter">Twitter</a>
                <a href="#" aria-label="GitHub">GitHub</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>&copy; 2025 Bright Mind Vision. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

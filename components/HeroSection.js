import BMVIcon from './BMVIcon'

export default function HeroSection({ 
  title, 
  subtitle = "Transform your business with intelligent AI solutions", 
  description, 
  children,
  showLogo = true,
  logoSize = 100
}) {
  return (
    <section className="hero">
      <div className="hero-content">
        {showLogo && (
          <div className="hero-logo">
            <img src="/bmv-logo-hero.png" alt="Bright Mind Vision" className="hero-logo-image" />
          </div>
        )}
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        {description && (
          <p className="hero-description">{description}</p>
        )}
        {children}
      </div>
    </section>
  )
}

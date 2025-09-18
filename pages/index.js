import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Bright Mind Vision - AI Software Solutions</title>
        <meta name="description" content="Empowering businesses with cutting-edge AI solutions, machine learning, and intelligent automation." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      
      <main>
        {/* Hero Section */}
        <section id="home" className="hero">
          <h1>Bright Mind Vision</h1>
          <p>Transform your business with intelligent AI solutions that drive innovation, efficiency, and growth. We specialize in machine learning, process automation, and data analytics.</p>
          <a href="#contact" className="cta-button">Get Started Today</a>
        </section>

        {/* Services Section */}
        <section id="services" className="section">
          <h2>Our AI Services</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Consulting</h3>
              <p>Strategic guidance to identify AI opportunities and develop comprehensive implementation roadmaps for your business.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Machine Learning</h3>
              <p>Custom ML models and algorithms designed to solve complex business problems and unlock valuable insights from your data.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Process Automation</h3>
              <p>Intelligent automation solutions that streamline workflows, reduce manual tasks, and improve operational efficiency.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Data Analytics</h3>
              <p>Advanced analytics and visualization tools that turn your data into actionable business intelligence and strategic insights.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>AI Security</h3>
              <p>Comprehensive security solutions for AI systems, ensuring your data and models are protected against emerging threats.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>AI Integration</h3>
              <p>Seamless integration of AI capabilities into your existing systems and workflows for maximum impact and adoption.</p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="section about">
          <div className="about-content">
            <div className="about-text">
              <h3>About Bright Mind Vision</h3>
              <p>
                We are a team of passionate AI experts, data scientists, and software engineers dedicated to helping businesses harness the power of artificial intelligence. Our mission is to make AI accessible, practical, and transformative for organizations of all sizes.
              </p>
              <p>
                With years of experience in cutting-edge AI technologies, we've helped hundreds of companies implement intelligent solutions that drive real business value. From startups to Fortune 500 companies, we deliver results that matter.
              </p>
              <p>
                Our approach combines deep technical expertise with business acumen, ensuring that every AI solution we develop aligns with your strategic goals and delivers measurable ROI.
              </p>
            </div>
            <div className="about-text">
              <h3>Why Choose Us?</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#667eea', marginRight: '0.5rem' }}>✓</span>
                  Proven track record with 200+ successful AI implementations
                </li>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#667eea', marginRight: '0.5rem' }}>✓</span>
                  End-to-end support from strategy to deployment
                </li>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#667eea', marginRight: '0.5rem' }}>✓</span>
                  Custom solutions tailored to your specific needs
                </li>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#667eea', marginRight: '0.5rem' }}>✓</span>
                  Ongoing support and optimization services
                </li>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#667eea', marginRight: '0.5rem' }}>✓</span>
                  Transparent pricing with no hidden costs
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="section" style={{ textAlign: 'center' }}>
          <h2>Ready to Transform Your Business?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#4a5568' }}>
            Let's discuss how AI can drive innovation and growth for your organization.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:info@brightmindvision.com" className="cta-button">
              Contact Us
            </a>
            <a href="tel:+1234567890" className="cta-button" style={{ background: '#667eea', color: 'white' }}>
              Call Now
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

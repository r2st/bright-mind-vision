import Head from 'next/head'
import Script from 'next/script'
import Footer from '@components/Footer'
import Contact from '@components/Contact'
import Calendar from '@components/Calendar'

export default function Home() {
  const benefitsListStyle = { listStyle: 'none', padding: 0 };
  const benefitItemStyle = { marginBottom: '1rem', display: 'flex', alignItems: 'center' };
  const checkmarkStyle = { color: '#667eea', marginRight: '0.5rem' };
  const llmSectionStyle = { background: '#f8fafc' };

  return (
    <div className="container">
      <Head>
        <title>Bright Mind Vision - AI Software Solutions</title>
        <meta name="description" content="Empowering businesses with cutting-edge AI solutions, machine learning, and intelligent automation. Transform your business with our LLM technologies and AI consulting services." />
        <meta name="keywords" content="AI solutions, machine learning, LLM technologies, artificial intelligence, business automation, AI consulting, data analytics, smart contracts, blockchain AI" />
        <meta name="author" content="Bright Mind Vision" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Bright Mind Vision - AI Software Solutions" />
        <meta property="og:description" content="Empowering businesses with cutting-edge AI solutions, machine learning, and intelligent automation." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://brightmindvision.com" />
        <meta property="og:image" content="https://brightmindvision.com/bmv-logo.png" />
        <meta property="og:site_name" content="Bright Mind Vision" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bright Mind Vision - AI Software Solutions" />
        <meta name="twitter:description" content="Empowering businesses with cutting-edge AI solutions, machine learning, and intelligent automation." />
        <meta name="twitter:image" content="https://brightmindvision.com/bmv-logo.png" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        
        <link rel="icon" href="/bmv_favicon.png" />
        <link rel="canonical" href="https://brightmindvision.com" />
      </Head>


      {/* Calendly Script */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />

      <main>
        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-content">
            <div className="hero-logo">
              <img src="/bmv-logo-hero.png" alt="Bright Mind Vision" className="hero-logo-image" />
            </div>
            <h1 className="hero-title">Bright Mind Vision</h1>
            <p className="hero-subtitle">Transform your business with intelligent AI solutions</p>
            <p className="hero-description">We specialize in machine learning, process automation, and data analytics to drive innovation, efficiency, and growth.</p>
            <div className="hero-actions">
              <a href="#contact" className="cta-button primary">Get Started</a>
              <a href="/projects" className="cta-button secondary">View Projects</a>
            </div>
          </div>
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

        {/* LLM Technologies Section */}
        <section className="section" style={llmSectionStyle}>
          <h2>LLM Technologies & Business Solutions</h2>
          <div className="llm-content">
            <div className="llm-intro">
              <h3>Harnessing the Power of Large Language Models</h3>
              <p>
                Large Language Models (LLMs) represent a revolutionary breakthrough in artificial intelligence, 
                enabling businesses to automate complex tasks, enhance customer experiences, and unlock new 
                opportunities for growth. At Bright Mind Vision, we specialize in implementing cutting-edge 
                LLM technologies to solve real-world business challenges.
              </p>
            </div>
            
            <div className="llm-grid">
              <div className="llm-card">
                <div className="llm-icon">🤖</div>
                <h4>Intelligent Automation</h4>
                <p>Deploy LLMs to automate document processing, content generation, and routine business tasks, reducing operational costs by up to 60%.</p>
                <ul>
                  <li>Automated report generation and analysis</li>
                  <li>Intelligent document classification and extraction</li>
                  <li>Smart email and communication automation</li>
                  <li>Workflow optimization and process streamlining</li>
                </ul>
              </div>
              
              <div className="llm-card">
                <div className="llm-icon">💬</div>
                <h4>Advanced Conversational AI</h4>
                <p>Create sophisticated chatbots and virtual assistants that understand context, maintain conversations, and provide personalized customer support.</p>
                <ul>
                  <li>24/7 multilingual customer support</li>
                  <li>Context-aware conversation management</li>
                  <li>Personalized product recommendations</li>
                  <li>Intelligent lead qualification and nurturing</li>
                </ul>
              </div>
              
              <div className="llm-card">
                <div className="llm-icon">📊</div>
                <h4>Data Intelligence & Analytics</h4>
                <p>Transform unstructured data into actionable insights using LLMs for advanced text analysis, sentiment analysis, and predictive modeling.</p>
                <ul>
                  <li>Advanced sentiment analysis and market research</li>
                  <li>Intelligent data extraction from multiple sources</li>
                  <li>Predictive analytics and trend forecasting</li>
                  <li>Automated business intelligence reporting</li>
                </ul>
              </div>
              
              <div className="llm-card">
                <div className="llm-icon">🎯</div>
                <h4>Content & Marketing Solutions</h4>
                <p>Leverage LLMs for content creation, marketing automation, and personalized customer experiences that drive engagement and conversions.</p>
                <ul>
                  <li>Automated content generation and optimization</li>
                  <li>Personalized marketing campaigns</li>
                  <li>SEO-optimized content creation</li>
                  <li>Multilingual content localization</li>
                </ul>
              </div>
            </div>
            
            <div className="llm-technologies">
              <h3>Our LLM Technology Stack</h3>
              <div className="tech-stack">
                <div className="tech-category">
                  <h4>Foundation Models</h4>
                  <div className="tech-tags">
                    <span className="tech-tag">GPT-4 & GPT-3.5</span>
                    <span className="tech-tag">Claude</span>
                    <span className="tech-tag">LLaMA</span>
                    <span className="tech-tag">PaLM</span>
                  </div>
                </div>
                
                <div className="tech-category">
                  <h4>Specialized Models</h4>
                  <div className="tech-tags">
                    <span className="tech-tag">BERT</span>
                    <span className="tech-tag">RoBERTa</span>
                    <span className="tech-tag">T5</span>
                    <span className="tech-tag">Codex</span>
                  </div>
                </div>
                
                <div className="tech-category">
                  <h4>Integration & Deployment</h4>
                  <div className="tech-tags">
                    <span className="tech-tag">LangChain</span>
                    <span className="tech-tag">Hugging Face</span>
                    <span className="tech-tag">OpenAI API</span>
                    <span className="tech-tag">Vector Databases</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="llm-benefits">
              <h3>Business Impact & ROI</h3>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <div className="benefit-number">40-60%</div>
                  <div className="benefit-text">Reduction in operational costs through intelligent automation</div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-number">3x</div>
                  <div className="benefit-text">Faster customer response times with AI-powered support</div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-number">85%</div>
                  <div className="benefit-text">Improvement in content generation efficiency</div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-number">24/7</div>
                  <div className="benefit-text">Continuous business operations with AI assistants</div>
                </div>
              </div>
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
                With years of experience in cutting-edge AI technologies, we've helped many companies implement intelligent solutions that drive real business value. From startups to Fortune 500 companies, we deliver results that matter.
              </p>
              <p>
                Our approach combines deep technical expertise with business acumen, ensuring that every AI solution we develop aligns with your strategic goals and delivers measurable ROI.
              </p>
            </div>
            <div className="about-text">
              <h3>Why Choose Us?</h3>
              <ul style={benefitsListStyle}>
                <li style={benefitItemStyle}>
                  <span style={checkmarkStyle}>✓</span>
                  Proven track record with many successful AI implementations
                </li>
                <li style={benefitItemStyle}>
                  <span style={checkmarkStyle}>✓</span>
                  End-to-end support from strategy to deployment
                </li>
                <li style={benefitItemStyle}>
                  <span style={checkmarkStyle}>✓</span>
                  Custom solutions tailored to your specific needs
                </li>
                <li style={benefitItemStyle}>
                  <span style={checkmarkStyle}>✓</span>
                  Ongoing support and optimization services
                </li>
                <li style={benefitItemStyle}>
                  <span style={checkmarkStyle}>✓</span>
                  Transparent pricing with no hidden costs
                </li>
              </ul>
            </div>
          </div>
        </section>

        <Contact />
        <Calendar />
      </main>

      <Footer />
    </div>
  )
}

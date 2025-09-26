import React, { useState } from 'react';
import Link from 'next/link';
import Footer from '../components/Footer';
import Contact from '../components/Contact';
import Calendar from '../components/Calendar';
import HeroSection from '../components/HeroSection';
import SEO from '../components/SEO';

// CSS Styles - moved to top for proper loading
const styles = `
  /* Products Section - Clean Modern Design */
  .products-section {
    padding: 60px 20px;
    background: #ffffff;
  }

  /* Filter Navigation */
  .product-filters {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 12px 24px;
    border: none;
    background: #f8fafc;
    color: #64748b;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-btn:hover {
    background: #e2e8f0;
    color: #475569;
  }

  .filter-btn.active {
    background: #667eea;
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  /* Products Container */
  .products-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Product Item */
  .product-item {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .product-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
  }

  /* Product Header */
  .product-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px 24px 16px;
  }

  .product-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .product-title h3 {
    font-size: 1.4rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 4px 0;
  }

  .product-category {
    font-size: 0.9rem;
    color: #667eea;
    font-weight: 500;
  }

  /* Product Body */
  .product-body {
    padding: 0 24px 20px;
  }

  .product-desc {
    font-size: 0.95rem;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .product-highlights {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .highlight-section h4 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .highlight-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .highlight-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.9rem;
    color: #4b5563;
    line-height: 1.4;
  }

  .highlight-dot {
    width: 4px;
    height: 4px;
    background: #667eea;
    border-radius: 50%;
    margin-top: 8px;
    flex-shrink: 0;
  }

  .highlight-check {
    color: #667eea;
    font-weight: bold;
    font-size: 0.8rem;
    margin-top: 2px;
    flex-shrink: 0;
  }

  /* Product Footer */
  .product-footer {
    padding: 20px 24px 24px;
    display: flex;
    gap: 12px;
    border-top: 1px solid #f1f5f9;
  }

  .btn {
    flex: 1;
    padding: 12px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    text-align: center;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: none;
    position: relative;
    overflow: hidden;
  }

  .btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  .btn-primary:hover::before {
    left: 100%;
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  }

  .btn-outline {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
    position: relative;
    overflow: hidden;
  }

  .btn-outline::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(74, 155, 142, 0.1), transparent);
    transition: left 0.5s;
  }

  .btn-outline:hover::before {
    left: 100%;
  }

  .btn-outline:hover {
    background: #667eea;
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  /* Statistics Section */
  .statistics-section {
    padding: 25px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .stats-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .stats-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 6px;
    background: linear-gradient(45deg, #ffffff, #f0f4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stats-header p {
    font-size: 0.9rem;
    opacity: 0.9;
    max-width: 500px;
    margin: 0 auto;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    max-width: 800px;
    margin: 0 auto 15px;
  }

  .stat-item {
    text-align: center;
    padding: 10px 5px;
  }

  .stat-number {
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: 3px;
    background: linear-gradient(45deg, #ffffff, #f0f4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 0.8rem;
    opacity: 0.9;
    font-weight: 500;
    line-height: 1.1;
  }

  .stats-footer {
    text-align: center;
  }

  .trust-indicators {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .trust-item {
    font-size: 0.8rem;
    opacity: 0.9;
    font-weight: 500;
    padding: 3px 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  /* Industry Insights */
  .industry-insights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 25px 0;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }

  .insight-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .insight-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .insight-content h4 {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 6px 0;
    color: white;
  }

  .insight-content p {
    font-size: 0.85rem;
    opacity: 0.9;
    margin: 0;
    line-height: 1.4;
  }

  /* Testimonial Highlight */
  .testimonial-highlight {
    margin: 25px 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .testimonial-content {
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .testimonial-content p {
    font-size: 0.95rem;
    font-style: italic;
    margin: 0 0 15px 0;
    opacity: 0.95;
    line-height: 1.5;
  }

  .testimonial-author {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .author-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: white;
  }

  .author-title {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  /* Technology Section */
  .technology-section {
    padding: 100px 20px;
    background: white;
  }

  .section-header {
    text-align: center;
    margin-bottom: 60px;
  }

  .section-header h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 16px;
  }

  .section-header p {
    font-size: 1.1rem;
    color: #4a5568;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .tech-item {
    text-align: center;
    padding: 40px 20px;
    background: #f8fafc;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .tech-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .tech-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .tech-item h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 12px;
  }

  .tech-item p {
    font-size: 1rem;
    color: #4a5568;
    line-height: 1.6;
  }

  /* Benefits Section */
  .benefits-section {
    padding: 100px 20px;
    background: #f8fafc;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .benefit-item {
    text-align: center;
    padding: 30px 20px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .benefit-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }

  .benefit-icon {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }

  .benefit-item h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 12px;
  }

  .benefit-item p {
    font-size: 1rem;
    color: #4a5568;
    line-height: 1.6;
  }

  /* CTA Section */
  .cta-section {
    padding: 60px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
  }

  .cta-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .cta-content h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .cta-content p {
    font-size: 1rem;
    opacity: 0.9;
    margin-bottom: 24px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .cta-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .cta-button.large {
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    min-width: 180px;
  }

  /* Container */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .products-container {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .product-highlights {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .product-footer {
      flex-direction: column;
    }

    .product-filters {
      gap: 2px;
      margin-bottom: 32px;
    }

    .filter-btn {
      padding: 10px 16px;
      font-size: 0.9rem;
    }

    .section-header h2 {
      font-size: 2rem;
    }

    .cta-content h2 {
      font-size: 2rem;
    }

    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .statistics-section {
      padding: 20px 20px;
    }

    .stats-header h2 {
      font-size: 1.3rem;
    }

    .stats-header {
      margin-bottom: 15px;
    }

    .trust-indicators {
      gap: 8px;
    }

    .industry-insights {
      grid-template-columns: 1fr;
      gap: 15px;
      margin: 20px 0;
    }

    .insight-item {
      padding: 12px;
    }

    .testimonial-highlight {
      margin: 20px 0;
    }

    .testimonial-content {
      padding: 15px;
    }
  }

  @media (max-width: 480px) {
    .products-section,
    .technology-section,
    .benefits-section,
    .cta-section {
      padding: 40px 15px;
    }

    .statistics-section {
      padding: 30px 15px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .stat-item {
      padding: 8px 3px;
    }

    .statistics-section {
      padding: 15px 15px;
    }

    .stats-header h2 {
      font-size: 1.2rem;
    }

    .stats-header p {
      font-size: 0.85rem;
    }

    .stats-header {
      margin-bottom: 12px;
    }

    .stat-number {
      font-size: 1.4rem;
    }

    .stat-label {
      font-size: 0.75rem;
    }

    .trust-indicators {
      gap: 6px;
    }

    .trust-item {
      font-size: 0.75rem;
      padding: 2px 4px;
    }

    .industry-insights {
      gap: 10px;
      margin: 15px 0;
    }

    .insight-item {
      padding: 10px;
      gap: 8px;
    }

    .insight-icon {
      font-size: 1.2rem;
    }

    .insight-content h4 {
      font-size: 0.9rem;
    }

    .insight-content p {
      font-size: 0.8rem;
    }

    .testimonial-highlight {
      margin: 15px 0;
    }

    .testimonial-content {
      padding: 12px;
    }

    .testimonial-content p {
      font-size: 0.9rem;
    }

    .author-name {
      font-size: 0.85rem;
    }

    .author-title {
      font-size: 0.75rem;
    }

    .product-item {
      margin: 0 -5px;
    }

    .product-header {
      padding: 20px 20px 12px;
      gap: 12px;
    }

    .product-icon {
      width: 48px;
      height: 48px;
      font-size: 1.3rem;
    }

    .product-title h3 {
      font-size: 1.2rem;
    }

    .product-body {
      padding: 0 20px 16px;
    }

    .product-footer {
      padding: 16px 20px 20px;
    }

    .stat-number {
      font-size: 2.5rem;
    }
  }
`;

// Products data - moved outside component for better performance
const products = [
    {
      id: 'healthcare',
      category: 'healthcare',
      title: 'Voice Patient Onboarding',
      subtitle: 'Healthcare Automation',
      icon: '🏥',
      description: 'Transform healthcare operations with intelligent voice automation. Streamline patient onboarding, appointment scheduling, and provide 24/7 support for healthcare providers worldwide.',
      features: [
        'Automated Appointment Scheduling',
        'Patient Information Collection',
        'Calendar Integration',
        'Automated Email Notifications',
        'HIPAA Compliant',
        'Multi-language Support'
      ],
      benefits: [
        'Reduce wait times by 60%',
        'Improve patient satisfaction',
        '24/7 availability',
        'Cost-effective operations'
      ],
      primaryLink: '/product/voice-patient-onboarding',
      secondaryLink: '/product/clinic',
      primaryText: 'Explore Product',
      secondaryText: 'View Dashboard',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accentColor: '#667eea'
    },
    {
      id: 'real-estate',
      category: 'real-estate',
      title: 'Voice Real Estate Service',
      subtitle: 'Property Management AI',
      icon: '🏘️',
      description: 'Enhance real estate operations with AI-powered voice assistance. Handle property inquiries, schedule viewings, and provide instant support for real estate agencies and brokers.',
      features: [
        'Property Search & Inquiries',
        'Viewing Appointment Scheduling',
        '24/7 Customer Support',
        'Lead Management System',
        'CRM Integration',
        'Multi-language Support'
      ],
      benefits: [
        'Increase lead conversion by 45%',
        'Reduce response time by 80%',
        '24/7 property inquiries',
        'Automated follow-ups'
      ],
      primaryLink: '/product/voice-real-estate-service',
      secondaryLink: '/product/real-estate',
      primaryText: 'Explore Product',
      secondaryText: 'View Dashboard',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accentColor: '#f093fb'
    },
    {
      id: 'wellness',
      category: 'wellness',
      title: 'Voice Wellness Partners',
      subtitle: 'Wellness Booking AI',
      icon: '💆‍♀️',
      description: 'Optimize wellness business operations with intelligent voice automation. Streamline booking processes, manage appointments, and provide personalized customer support for spas, salons, and wellness centers.',
      features: [
        'Automated Booking System',
        'Appointment Management',
        'Customer Support',
        'Service Recommendations',
        'Calendar Integration',
        'Multi-language Support'
      ],
      benefits: [
        'Increase bookings by 70%',
        'Reduce no-shows by 50%',
        '24/7 booking availability',
        'Personalized service recommendations'
      ],
      primaryLink: '/product/voice-wellness-partners',
      secondaryLink: '/product/clinic',
      primaryText: 'Explore Product',
      secondaryText: 'View Dashboard',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accentColor: '#f093fb'
    }
  ];

const Products = () => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts = activeTab === 'all' ? products : products.filter(product => product.category === activeTab);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <SEO 
        title="AI Voice Assistant Products - Bright Mind Vision"
        description="Discover our comprehensive suite of AI-powered voice assistant products for healthcare, real estate, and wellness industries. Streamline operations with intelligent automation."
        keywords="AI voice assistant, healthcare automation, real estate AI, wellness booking, voice AI products, intelligent automation, Bright Mind Vision"
        url="https://brightmindvision.com/products"
      />
      
      <HeroSection 
        title="AI Voice Assistant Products"
        subtitle="Transform your business with intelligent AI solutions"
        description="Transform your business operations with our cutting-edge AI voice assistant products. From healthcare to real estate, we provide Transform your business with intelligent AI solutions that enhance customer experience and streamline workflows."
      >
        <div className="cta-actions">
          <Link href="#contact" className="cta-button primary large">
            Get Started
          </Link>
          <Link href="/projects" className="cta-button secondary large">
            View Case Studies
          </Link>
        </div>
      </HeroSection>

      {/* Products Section - Clean Design */}
      <section className="products-section">
        <div className="container">
          {/* Filter Navigation */}
          <nav className="product-filters">
            <button 
              className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Products
            </button>
            <button 
              className={`filter-btn ${activeTab === 'healthcare' ? 'active' : ''}`}
              onClick={() => setActiveTab('healthcare')}
            >
              Healthcare
            </button>
            <button 
              className={`filter-btn ${activeTab === 'real-estate' ? 'active' : ''}`}
              onClick={() => setActiveTab('real-estate')}
            >
              Real Estate
            </button>
            <button 
              className={`filter-btn ${activeTab === 'wellness' ? 'active' : ''}`}
              onClick={() => setActiveTab('wellness')}
            >
              Wellness
            </button>
          </nav>

          {/* Products Grid */}
          <div className="products-container">
            {filteredProducts.map((product, index) => (
              <div key={product.id} className="product-item">
                <div className="product-header">
                  <div className="product-icon" style={{ background: product.gradient }}>
                    {product.icon}
                  </div>
                  <div className="product-title">
                    <h3>{product.title}</h3>
                    <span className="product-category">{product.subtitle}</span>
                  </div>
                </div>
                
                <div className="product-body">
                  <p className="product-desc">{product.description}</p>
                  
                  <div className="product-highlights">
                    <div className="highlight-section">
                      <h4>Key Features</h4>
                      <div className="highlight-list">
                        {product.features.slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="highlight-item">
                            <span className="highlight-dot"></span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="highlight-section">
                      <h4>Benefits</h4>
                      <div className="highlight-list">
                        {product.benefits.slice(0, 3).map((benefit, idx) => (
                          <div key={idx} className="highlight-item">
                            <span className="highlight-check">✓</span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="product-footer">
                  <Link href={product.primaryLink} className="btn btn-primary">
                    {product.primaryText}
                  </Link>
                  <Link href={product.secondaryLink} className="btn btn-outline">
                    {product.secondaryText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics-section">
        <div className="container">
          <div className="stats-header">
            <h2>Trusted by Industry Leaders</h2>
            <p>Our AI voice assistants deliver measurable results across all business sectors</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Businesses Served</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime Guarantee</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Customer Support</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">60%</div>
              <div className="stat-label">Cost Reduction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Calls Handled</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Customer Satisfaction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2.5s</div>
              <div className="stat-label">Avg Response Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">90%</div>
              <div className="stat-label">First Call Resolution</div>
            </div>
          </div>

          <div className="industry-insights">
            <div className="insight-item">
              <div className="insight-icon">🏥</div>
              <div className="insight-content">
                <h4>Healthcare</h4>
                <p>Reduced patient wait times by 60% and improved appointment scheduling efficiency</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">🏠</div>
              <div className="insight-content">
                <h4>Real Estate</h4>
                <p>Increased lead qualification rates by 45% and streamlined property inquiries</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">💼</div>
              <div className="insight-content">
                <h4>Wellness</h4>
                <p>Enhanced customer engagement by 70% and automated booking processes</p>
              </div>
            </div>
          </div>

          <div className="testimonial-highlight">
            <div className="testimonial-content">
              <p>"Bright Mind Vision's AI voice assistant transformed our customer service operations. We've seen a 60% reduction in response time and 98% customer satisfaction."</p>
              <div className="testimonial-author">
                <span className="author-name">Sarah Johnson</span>
                <span className="author-title">CEO, MedTech Solutions</span>
              </div>
            </div>
          </div>

          <div className="stats-footer">
            <div className="trust-indicators">
              <span className="trust-item">✓ HIPAA Compliant</span>
              <span className="trust-item">✓ SOC 2 Certified</span>
              <span className="trust-item">✓ GDPR Ready</span>
              <span className="trust-item">✓ Enterprise Grade</span>
              <span className="trust-item">✓ 99.9% SLA</span>
              <span className="trust-item">✓ 24/7 Monitoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="technology-section">
        <div className="container">
          <div className="section-header">
            <h2>Powered by Advanced AI Technology</h2>
            <p>Our voice assistants leverage state-of-the-art artificial intelligence to deliver exceptional performance, reliability, and intelligent automation.</p>
          </div>
          <div className="tech-grid">
            <div className="tech-item">
              <div className="tech-icon">🤖</div>
              <h3>Advanced AI</h3>
              <p>Cutting-edge natural language processing and machine learning algorithms for intelligent, context-aware conversations.</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>Bank-level encryption and compliance with industry standards including HIPAA, SOC 2, and GDPR.</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">⚡</div>
              <h3>Real-time Processing</h3>
              <p>Lightning-fast response times with 99.9% uptime guarantee, 24/7 monitoring, and intelligent load balancing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Bright Mind Vision AI Voice Assistants</h2>
            <p>Transform your business operations with intelligent automation that delivers measurable results and exceptional customer experiences.</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">📈</div>
              <h3>Increased Efficiency</h3>
              <p>Automate repetitive tasks and streamline workflows to boost productivity by up to 70%.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">💰</div>
              <h3>Cost Reduction</h3>
              <p>Reduce operational costs by up to 50% while maintaining high-quality customer service.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🎯</div>
              <h3>Better Customer Experience</h3>
              <p>Provide instant, personalized support 24/7 with 98% customer satisfaction rates and intelligent conversation handling.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🔄</div>
              <h3>Seamless Integration</h3>
              <p>Easy integration with existing systems and workflows for immediate deployment.</p>
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* Contact Section */}
        <Contact />
        <Calendar />
      </main>

      <Footer />
    </>
  );
};

export default Products;

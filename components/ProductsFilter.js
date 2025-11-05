import React, { useState } from 'react';
import Link from 'next/link';

// Products data
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
  },
  {
    id: 'shopping-assistant',
    category: 'ecommerce',
    title: 'Shopping Assistant',
    subtitle: 'AI E-commerce Chat Bot',
    icon: '🛍️',
    description: 'Revolutionize e-commerce with intelligent AI shopping assistant. Provide personalized product recommendations, handle customer inquiries, and enhance shopping experience through WhatsApp integration and web chat.',
    features: [
      'AI Product Recommendations',
      'WhatsApp Business Integration',
      'Natural Language Processing',
      'Luxury Product Curation',
      'Real-time Chat Support',
      'Multi-channel Communication'
    ],
    benefits: [
      'Increase sales by 40%',
      '24/7 customer support',
      'Personalized shopping experience',
      'Automated product discovery'
    ],
    primaryLink: '/product/shopping-assistant',
    secondaryLink: '/product/shopping-assistant-info',
    primaryText: 'Try Chat Bot',
    secondaryText: 'Learn More',
    gradient: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
    accentColor: '#25d366'
  }
];

const ProductsFilter = () => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts = activeTab === 'all' ? products : products.filter(product => product.category === activeTab);

  return (
    <>
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
        <button 
          className={`filter-btn ${activeTab === 'ecommerce' ? 'active' : ''}`}
          onClick={() => setActiveTab('ecommerce')}
        >
          E-commerce
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
    </>
  );
};

export default ProductsFilter;

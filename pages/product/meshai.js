import React, { useState, useEffect } from 'react';
import SEO from '../../components/SEO';
import MeshaiLayout from '../../components/MeshaiLayout';
import { dummyProducts } from '../../data/dummyProducts';

export default function MeshaiDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [products, setProducts] = useState([]);
  const [whatsappMessages, setWhatsappMessages] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  // Dummy WhatsApp messages
  const dummyMessages = [
    {
      id: 'M001',
      from: '+971501234567',
      name: 'Aisha Al-Rashid',
      message: 'Hi! I\'m looking for a luxury handbag for a special occasion. Something elegant and timeless.',
      timestamp: '2024-01-21T14:30:00Z',
      status: 'unread',
      aiProcessed: true,
      recommendedProducts: ['P001', 'P003']
    },
    {
      id: 'M002',
      from: '+971507654321',
      name: 'Ahmed Hassan',
      message: 'I need a luxury watch for my collection. Something with good investment value.',
      timestamp: '2024-01-21T13:15:00Z',
      status: 'read',
      aiProcessed: true,
      recommendedProducts: ['P002', 'P004', 'P012']
    },
    {
      id: 'M003',
      from: '+971501112233',
      name: 'Fatima Al-Zahra',
      message: 'Looking for premium skincare products. Something for anti-aging and luxury feel.',
      timestamp: '2024-01-21T11:45:00Z',
      status: 'read',
      aiProcessed: true,
      recommendedProducts: ['P006', 'P020']
    },
    {
      id: 'M004',
      from: '+971505556667',
      name: 'Omar Al-Mansouri',
      message: 'I want to buy a luxury fragrance. Something masculine and sophisticated.',
      timestamp: '2024-01-21T10:20:00Z',
      status: 'unread',
      aiProcessed: true,
      recommendedProducts: ['P007', 'P005']
    },
    {
      id: 'M005',
      from: '+971508889990',
      name: 'Layla Al-Din',
      message: 'Looking for luxury home decor items. Something to enhance my living room.',
      timestamp: '2024-01-21T09:15:00Z',
      status: 'read',
      aiProcessed: true,
      recommendedProducts: ['P008', 'P009', 'P010']
    }
  ];

  // Dummy AI recommendations
  const dummyRecommendations = [
    {
      id: 'R001',
      messageId: 'M001',
      customerName: 'Aisha Al-Rashid',
      originalMessage: 'Hi! I\'m looking for a luxury handbag for a special occasion. Something elegant and timeless.',
      recommendedProducts: [
        {
          productId: 'P001',
          confidence: 0.95,
          reason: 'Chanel Classic Flap Bag is the epitome of elegance and timeless luxury'
        },
        {
          productId: 'P003',
          confidence: 0.92,
          reason: 'Hermès Birkin 30 is the ultimate luxury handbag with exceptional investment value'
        }
      ],
      timestamp: '2024-01-21T14:31:00Z',
      status: 'active'
    },
    {
      id: 'R002',
      messageId: 'M002',
      customerName: 'Ahmed Hassan',
      originalMessage: 'I need a luxury watch for my collection. Something with good investment value.',
      recommendedProducts: [
        {
          productId: 'P002',
          confidence: 0.98,
          reason: 'Rolex Submariner is the ultimate investment watch with excellent resale value'
        },
        {
          productId: 'P004',
          confidence: 0.89,
          reason: 'Cartier Santos combines elegance with strong investment potential'
        },
        {
          productId: 'P012',
          confidence: 0.85,
          reason: 'Bulgari Serpenti offers unique design with luxury appeal'
        }
      ],
      timestamp: '2024-01-21T13:16:00Z',
      status: 'active'
    },
    {
      id: 'R003',
      messageId: 'M003',
      customerName: 'Fatima Al-Zahra',
      originalMessage: 'Looking for premium skincare products. Something for anti-aging and luxury feel.',
      recommendedProducts: [
        {
          productId: 'P006',
          confidence: 0.94,
          reason: 'La Mer The Concentrate is the ultimate luxury anti-aging serum'
        },
        {
          productId: 'P020',
          confidence: 0.91,
          reason: 'La Prairie Cellular Cream provides advanced anti-aging technology'
        }
      ],
      timestamp: '2024-01-21T11:46:00Z',
      status: 'active'
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setProducts(dummyProducts);
      setWhatsappMessages(dummyMessages);
      setAiRecommendations(dummyRecommendations);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getProductById = (productId) => {
    return products.find(product => product.id === productId);
  };

  const getRecommendationStats = () => {
    const totalMessages = whatsappMessages.length;
    const processedMessages = whatsappMessages.filter(msg => msg.aiProcessed).length;
    const activeRecommendations = aiRecommendations.filter(rec => rec.status === 'active').length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(product => product.stock < 50).length;

    return {
      totalMessages,
      processedMessages,
      activeRecommendations,
      totalProducts,
      lowStockProducts
    };
  };

  const stats = getRecommendationStats();

  if (isLoading) {
    return (
      <>
        <SEO 
          title="Meshai - AI-Powered Product Recommendations"
          description="Smart product recommendation system with WhatsApp Business integration"
          keywords="meshai, AI recommendations, WhatsApp business, product management, e-commerce"
          url="https://brightmindvision.com/product/meshai"
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              Loading Meshai Dashboard...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Meshai - AI-Powered Product Recommendations"
        description="Smart product recommendation system with WhatsApp Business integration"
        keywords="meshai, AI recommendations, WhatsApp business, product management, e-commerce"
        url="https://brightmindvision.com/product/meshai"
      />

      <MeshaiLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
        {/* Top Navigation */}
        <div style={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e5e7eb', 
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '60px'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: 0,
            color: '#111827'
          }}>
            {activeMenu}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              backgroundColor: '#dbeafe', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '600',
              color: '#2563eb'
            }}>
              AI
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0', color: '#111827' }}>
              Meshai Dashboard
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              AI-powered product recommendations with WhatsApp Business integration
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  backgroundColor: '#dbeafe', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  📱
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                    {stats.totalMessages}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>WhatsApp Messages</div>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  backgroundColor: '#dcfce7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  🤖
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                    {stats.processedMessages}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>AI Processed</div>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  backgroundColor: '#fef3c7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  💡
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                    {stats.activeRecommendations}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Active Recommendations</div>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  backgroundColor: '#f3e8ff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  📦
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                    {stats.totalProducts}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Products</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent AI Recommendations */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '24px'
          }}>
            <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#111827' }}>
                Recent AI Recommendations
              </h3>
            </div>
            
            <div style={{ padding: '20px' }}>
              {aiRecommendations.slice(0, 3).map((recommendation) => (
                <div key={recommendation.id} style={{ 
                  padding: '16px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  marginBottom: '12px',
                  backgroundColor: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                        {recommendation.customerName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                        "{recommendation.originalMessage}"
                      </div>
                    </div>
                    <div style={{ 
                      background: '#dcfce7',
                      color: '#16a34a',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {recommendation.status}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {recommendation.recommendedProducts.map((rec, index) => {
                      const product = getProductById(rec.productId);
                      return product ? (
                        <div key={index} style={{ 
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '16px' }}>{product.image}</span>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '10px', color: '#6b7280' }}>
                              Confidence: {(rec.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px'
          }}>
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0', color: '#111827' }}>
                WhatsApp Integration
              </h4>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0' }}>
                Manage your WhatsApp Business account and view incoming messages
              </p>
              <button style={{
                background: '#25d366',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}>
                View Messages
              </button>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0', color: '#111827' }}>
                AI Recommendations
              </h4>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0' }}>
                View and manage AI-generated product recommendations
              </p>
              <button style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}>
                View Recommendations
              </button>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0', color: '#111827' }}>
                Product Management
              </h4>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0' }}>
                Manage your product catalog and inventory
              </p>
              <button style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}>
                Manage Products
              </button>
            </div>
          </div>
        </div>
      </MeshaiLayout>
    </>
  );
}

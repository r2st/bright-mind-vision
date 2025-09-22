import React, { useState } from 'react';
import Head from 'next/head';
import RealEstateLayout from '../../../components/RealEstateLayout';

export default function Properties() {
  const [activeMenu, setActiveMenu] = useState("Properties");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const properties = [
    {
      id: 'P001',
      title: 'Downtown Family Home',
      type: 'House',
      bedrooms: 3,
      bathrooms: 2,
      area: '1,200 sq ft',
      price: '$450,000',
      location: 'Downtown',
      status: 'Available',
      listingDate: '2024-01-15',
      lastInquiry: '2024-01-20',
      viewings: 12,
      voiceInquiries: 8,
      agent: 'Sarah Johnson',
      features: 'Modern kitchen, garden, garage',
      description: 'Beautiful family home in the heart of downtown with modern amenities and excellent schools nearby.'
    },
    {
      id: 'P002',
      title: 'City Center Condo',
      type: 'Condo',
      bedrooms: 2,
      bathrooms: 2,
      area: '950 sq ft',
      price: '$320,000',
      location: 'City Center',
      status: 'Under Contract',
      listingDate: '2024-01-10',
      lastInquiry: '2024-01-19',
      viewings: 8,
      voiceInquiries: 5,
      agent: 'Mike Chen',
      features: 'Pool, gym, concierge',
      description: 'Luxury condo with city views and premium amenities in the business district.'
    },
    {
      id: 'P003',
      title: 'Executive Villa',
      type: 'Villa',
      bedrooms: 5,
      bathrooms: 4,
      area: '3,500 sq ft',
      price: '$1,200,000',
      location: 'Uptown',
      status: 'Available',
      listingDate: '2024-01-05',
      lastInquiry: '2024-01-18',
      viewings: 6,
      voiceInquiries: 3,
      agent: 'Sarah Johnson',
      features: 'Pool, wine cellar, home theater',
      description: 'Executive villa with premium finishes and extensive outdoor entertainment areas.'
    },
    {
      id: 'P004',
      title: 'Investment Property',
      type: 'Duplex',
      bedrooms: 4,
      bathrooms: 3,
      area: '2,100 sq ft',
      price: '$380,000',
      location: 'Midtown',
      status: 'Available',
      listingDate: '2024-01-12',
      lastInquiry: '2024-01-21',
      viewings: 15,
      voiceInquiries: 12,
      agent: 'Mike Chen',
      features: 'Rental income potential, renovated',
      description: 'Excellent investment opportunity with strong rental income potential and recent renovations.'
    },
    {
      id: 'P005',
      title: 'Modern Apartment',
      type: 'Apartment',
      bedrooms: 1,
      bathrooms: 1,
      area: '650 sq ft',
      price: '$180,000',
      location: 'Eastside',
      status: 'Sold',
      listingDate: '2023-12-20',
      lastInquiry: '2024-01-15',
      viewings: 20,
      voiceInquiries: 15,
      agent: 'Sarah Johnson',
      features: 'Modern design, parking space',
      description: 'Stylish modern apartment perfect for young professionals or first-time buyers.'
    }
  ];

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || property.type === filterType;
    const matchesStatus = filterStatus === "All" || property.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return '#16a34a';
      case 'Under Contract': return '#d97706';
      case 'Sold': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Available': return '#dcfce7';
      case 'Under Contract': return '#fef3c7';
      case 'Sold': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  return (
    <>
      <Head>
        <title>Properties - RealEstatePro Dashboard | Bright Mind Vision</title>
        <meta name="description" content="Manage your real estate property listings with voice-powered customer service integration." />
        <link rel="icon" href="/bmv_favicon.png" />
      </Head>

      <RealEstateLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
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
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'none' }}>Welcome, Sarah Johnson</span>
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
              SJ
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0', color: '#111827' }}>
              Property Listings
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Manage your real estate portfolio with voice-powered customer service
            </p>
          </div>

          {/* Filters */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '24px'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              alignItems: 'end'
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '6px' 
                }}>
                  Search Properties
                </label>
                <input
                  type="text"
                  placeholder="Search by title, location, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '6px' 
                }}>
                  Property Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="All">All Types</option>
                  <option value="House">House</option>
                  <option value="Condo">Condo</option>
                  <option value="Villa">Villa</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Apartment">Apartment</option>
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '6px' 
                }}>
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Under Contract">Under Contract</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '16px' 
          }}>
            {filteredProperties.map((property) => (
              <div key={property.id} style={{ 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}>
                {/* Property Header */}
                <div style={{ padding: '20px 20px 16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0', color: '#111827' }}>
                        {property.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        {property.type} • {property.location}
                      </p>
                    </div>
                    <div style={{ 
                      background: getStatusBg(property.status),
                      color: getStatusColor(property.status),
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {property.status}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                    {property.price}
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{property.bedrooms}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Bedrooms</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{property.bathrooms}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Bathrooms</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{property.area}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Area</div>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div style={{ padding: '0 20px 16px 20px' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                    {property.description}
                  </p>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                    <strong>Features:</strong> {property.features}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                    <strong>Agent:</strong> {property.agent}
                  </div>
                </div>

                {/* Voice Assistant Stats */}
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '16px 20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '12px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{property.viewings}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Viewings</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#667eea' }}>{property.voiceInquiries}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Voice Inquiries</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Listed: {new Date(property.listingDate).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Last: {new Date(property.lastInquiry).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProperties.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏘️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#111827' }}>
                No properties found
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Try adjusting your search criteria or add new properties to your portfolio.
              </p>
            </div>
          )}
        </div>
      </RealEstateLayout>
    </>
  );
}

import React, { useState } from 'react';
import Head from 'next/head';
import RealEstateLayout from '../../../components/RealEstateLayout';

export default function Leads() {
  const [activeMenu, setActiveMenu] = useState("Leads");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSource, setFilterSource] = useState("All");

  const leads = [
    {
      id: 'L001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      status: 'New',
      source: 'Voice Assistant',
      inquiryDate: '2024-01-21',
      lastContact: '2024-01-21',
      propertyInterest: '3-bedroom house',
      budget: '$400,000 - $500,000',
      location: 'Downtown',
      timeline: 'Within 3 months',
      agent: 'Sarah Johnson',
      notes: 'First-time buyer, interested in family-friendly neighborhood with good schools',
      leadScore: 85,
      followUpDate: '2024-01-23',
      previousInteractions: 1
    },
    {
      id: 'L002',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1-555-0124',
      status: 'Qualified',
      source: 'Voice Assistant',
      inquiryDate: '2024-01-20',
      lastContact: '2024-01-21',
      propertyInterest: 'Luxury condo',
      budget: '$300,000 - $400,000',
      location: 'City Center',
      timeline: 'Within 1 month',
      agent: 'Mike Chen',
      notes: 'Very interested in City Center Condo, considering making an offer',
      leadScore: 92,
      followUpDate: '2024-01-22',
      previousInteractions: 3
    },
    {
      id: 'L003',
      name: 'Robert Wilson',
      email: 'robert.wilson@email.com',
      phone: '+1-555-0125',
      status: 'Hot',
      source: 'Voice Assistant',
      inquiryDate: '2024-01-19',
      lastContact: '2024-01-20',
      propertyInterest: 'Executive villa',
      budget: '$1,000,000+',
      location: 'Uptown',
      timeline: 'Within 2 weeks',
      agent: 'Sarah Johnson',
      notes: 'Luxury buyer, looking for premium features and privacy',
      leadScore: 95,
      followUpDate: '2024-01-22',
      previousInteractions: 2
    },
    {
      id: 'L004',
      name: 'Lisa Brown',
      email: 'lisa.brown@email.com',
      phone: '+1-555-0126',
      status: 'Warm',
      source: 'Voice Assistant',
      inquiryDate: '2024-01-18',
      lastContact: '2024-01-19',
      propertyInterest: 'Investment property',
      budget: '$300,000 - $400,000',
      location: 'Midtown',
      timeline: 'Within 6 months',
      agent: 'Mike Chen',
      notes: 'Looking for rental income potential, experienced investor',
      leadScore: 78,
      followUpDate: '2024-01-25',
      previousInteractions: 2
    },
    {
      id: 'L005',
      name: 'David Lee',
      email: 'david.lee@email.com',
      phone: '+1-555-0127',
      status: 'New',
      source: 'Voice Assistant',
      inquiryDate: '2024-01-21',
      lastContact: '2024-01-21',
      propertyInterest: 'Modern apartment',
      budget: '$150,000 - $200,000',
      location: 'Eastside',
      timeline: 'Within 2 months',
      agent: 'Sarah Johnson',
      notes: 'Young professional, first-time buyer, needs parking space',
      leadScore: 72,
      followUpDate: '2024-01-24',
      previousInteractions: 1
    }
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.propertyInterest.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.agent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || lead.status === filterStatus;
    const matchesSource = filterSource === "All" || lead.source === filterSource;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '#2563eb';
      case 'Qualified': return '#16a34a';
      case 'Hot': return '#dc2626';
      case 'Warm': return '#d97706';
      case 'Cold': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'New': return '#dbeafe';
      case 'Qualified': return '#dcfce7';
      case 'Hot': return '#fee2e2';
      case 'Warm': return '#fef3c7';
      case 'Cold': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  };

  const getLeadScoreColor = (score) => {
    if (score >= 90) return '#16a34a';
    if (score >= 80) return '#d97706';
    if (score >= 70) return '#2563eb';
    return '#6b7280';
  };

  return (
    <>
      <Head>
        <title>Leads - RealEstatePro Dashboard | Bright Mind Vision</title>
        <meta name="description" content="Manage real estate leads and customer inquiries from voice assistant interactions." />
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
              Lead Management
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Track and manage leads from voice assistant interactions
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
                  Search Leads
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, or property interest..."
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
                  Lead Status
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
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
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
                  Lead Source
                </label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
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
                  <option value="All">All Sources</option>
                  <option value="Voice Assistant">Voice Assistant</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leads List */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}>
            {filteredLeads.map((lead) => (
              <div key={lead.id} style={{ 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#111827' }}>
                          {lead.name}
                        </h3>
                        <div style={{ 
                          background: getStatusBg(lead.status),
                          color: getStatusColor(lead.status),
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {lead.status}
                        </div>
                        <div style={{ 
                          background: '#f3f4f6',
                          color: getLeadScoreColor(lead.leadScore),
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          Score: {lead.leadScore}
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Contact Info</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{lead.email}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{lead.phone}</div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Property Interest</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{lead.propertyInterest}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{lead.location}</div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Budget & Timeline</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{lead.budget}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Timeline: {lead.timeline}</div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Agent & Source</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{lead.agent}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Source: {lead.source}</div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Inquiry Date</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {new Date(lead.inquiryDate).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Last Contact</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {new Date(lead.lastContact).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Follow-up Date</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {new Date(lead.followUpDate).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Interactions</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {lead.previousInteractions} calls
                          </div>
                        </div>
                      </div>
                      
                      {lead.notes && (
                        <div style={{ 
                          background: '#f8fafc', 
                          padding: '12px', 
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Notes:</div>
                          <div style={{ fontSize: '14px', color: '#374151' }}>{lead.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredLeads.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#111827' }}>
                No leads found
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Try adjusting your search criteria or check back later for new leads from voice assistant interactions.
              </p>
            </div>
          )}
        </div>
      </RealEstateLayout>
    </>
  );
}

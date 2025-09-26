import React, { useState } from 'react';
import RealEstateLayout from '../../../components/RealEstateLayout';
import SEO from '../../../components/SEO';

export default function Agents() {
  const [activeMenu, setActiveMenu] = useState("Agents");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const agents = [
    {
      id: 'A001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@premierrealestate.com',
      phone: '+1-555-0101',
      status: 'Active',
      role: 'Senior Agent',
      joinDate: '2022-03-15',
      lastActive: '2024-01-21',
      propertiesListed: 24,
      propertiesSold: 18,
      totalSales: '$8,500,000',
      currentLeads: 12,
      voiceAssistantCalls: 156,
      averageResponseTime: '2.3 min',
      specialties: ['Luxury Homes', 'First-time Buyers', 'Investment Properties'],
      licenseNumber: 'RE-2022-001',
      commission: '3.5%',
      avatar: 'SJ'
    },
    {
      id: 'A002',
      name: 'Mike Chen',
      email: 'mike.chen@premierrealestate.com',
      phone: '+1-555-0102',
      status: 'Active',
      role: 'Agent',
      joinDate: '2023-01-10',
      lastActive: '2024-01-21',
      propertiesListed: 18,
      propertiesSold: 14,
      totalSales: '$4,200,000',
      currentLeads: 8,
      voiceAssistantCalls: 89,
      averageResponseTime: '1.8 min',
      specialties: ['Condos', 'Commercial', 'Relocation'],
      licenseNumber: 'RE-2023-002',
      commission: '3.0%',
      avatar: 'MC'
    },
    {
      id: 'A003',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@premierrealestate.com',
      phone: '+1-555-0103',
      status: 'Active',
      role: 'Junior Agent',
      joinDate: '2023-08-20',
      lastActive: '2024-01-20',
      propertiesListed: 8,
      propertiesSold: 5,
      totalSales: '$1,800,000',
      currentLeads: 6,
      voiceAssistantCalls: 45,
      averageResponseTime: '3.1 min',
      specialties: ['Apartments', 'Starter Homes'],
      licenseNumber: 'RE-2023-003',
      commission: '2.5%',
      avatar: 'ER'
    },
    {
      id: 'A004',
      name: 'David Thompson',
      email: 'david.thompson@premierrealestate.com',
      phone: '+1-555-0104',
      status: 'On Leave',
      role: 'Senior Agent',
      joinDate: '2021-11-05',
      lastActive: '2024-01-15',
      propertiesListed: 32,
      propertiesSold: 28,
      totalSales: '$12,300,000',
      currentLeads: 3,
      voiceAssistantCalls: 203,
      averageResponseTime: '2.1 min',
      specialties: ['Luxury Estates', 'Waterfront Properties', 'Investment'],
      licenseNumber: 'RE-2021-004',
      commission: '3.5%',
      avatar: 'DT'
    }
  ];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "All" || agent.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#16a34a';
      case 'On Leave': return '#d97706';
      case 'Inactive': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Active': return '#dcfce7';
      case 'On Leave': return '#fef3c7';
      case 'Inactive': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Senior Agent': return '#7c3aed';
      case 'Agent': return '#2563eb';
      case 'Junior Agent': return '#059669';
      default: return '#6b7280';
    }
  };

  return (
    <>
      <SEO 
        title="Agents - RealEstatePro Dashboard"
        description="Manage real estate agents and their performance with voice assistant integration."
        keywords="real estate agents, agent management, real estate team, property agents, real estate performance"
        url="https://brightmindvision.com/product/real-estate/agents"
      />

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
              Agent Management
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Manage your real estate team and track their performance
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
                  Search Agents
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, role, or specialty..."
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
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Agents Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '16px' 
          }}>
            {filteredAgents.map((agent) => (
              <div key={agent.id} style={{ 
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
                {/* Agent Header */}
                <div style={{ padding: '20px 20px 16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      backgroundColor: '#dbeafe', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#2563eb'
                    }}>
                      {agent.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#111827' }}>
                          {agent.name}
                        </h3>
                        <div style={{ 
                          background: getStatusBg(agent.status),
                          color: getStatusColor(agent.status),
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {agent.status}
                        </div>
                      </div>
                      <div style={{ 
                        color: getRoleColor(agent.role),
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '4px'
                      }}>
                        {agent.role}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        License: {agent.licenseNumber}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Email</div>
                      <div style={{ fontSize: '14px', color: '#111827' }}>{agent.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Phone</div>
                      <div style={{ fontSize: '14px', color: '#111827' }}>{agent.phone}</div>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '16px 20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{agent.propertiesListed}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Listed</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a' }}>{agent.propertiesSold}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Sold</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{agent.totalSales}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Sales</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#667eea' }}>{agent.currentLeads}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Active Leads</div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                    gap: '12px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#667eea' }}>{agent.voiceAssistantCalls}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Voice Calls</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{agent.averageResponseTime}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Avg Response</div>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Specialties:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {agent.specialties.map((specialty, index) => (
                      <span key={index} style={{ 
                        background: '#e0e7ff',
                        color: '#3730a3',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {specialty}
                      </span>
                    ))}
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Joined: {new Date(agent.joinDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Commission: {agent.commission}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍💼</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#111827' }}>
                No agents found
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Try adjusting your search criteria or add new agents to your team.
              </p>
            </div>
          )}
        </div>
      </RealEstateLayout>
    </>
  );
}

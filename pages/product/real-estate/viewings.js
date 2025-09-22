import React, { useState } from 'react';
import Head from 'next/head';
import RealEstateLayout from '../../../components/RealEstateLayout';

export default function Viewings() {
  const [activeMenu, setActiveMenu] = useState("Viewings");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("All");

  const viewings = [
    {
      id: "V001",
      time: "2:00 PM",
      date: "2024-01-22",
      property: "Downtown Family Home",
      propertyId: "P001",
      client: "John Smith",
      clientPhone: "+1-555-0123",
      clientEmail: "john.smith@email.com",
      status: "Scheduled",
      agent: "Sarah Johnson",
      duration: "45 min",
      notes: "First-time buyer, interested in family-friendly neighborhood",
      bookingMethod: "Voice Assistant",
      propertyType: "House",
      price: "$450,000",
      location: "Downtown"
    },
    {
      id: "V002",
      time: "10:00 AM",
      date: "2024-01-22",
      property: "City Center Condo",
      propertyId: "P002",
      client: "Emily Davis",
      clientPhone: "+1-555-0124",
      clientEmail: "emily.davis@email.com",
      status: "Completed",
      agent: "Mike Chen",
      duration: "30 min",
      notes: "Very interested, considering making an offer",
      bookingMethod: "Voice Assistant",
      propertyType: "Condo",
      price: "$320,000",
      location: "City Center"
    },
    {
      id: "V003",
      time: "3:30 PM",
      date: "2024-01-23",
      property: "Executive Villa",
      propertyId: "P003",
      client: "Robert Wilson",
      clientPhone: "+1-555-0125",
      clientEmail: "robert.wilson@email.com",
      status: "Scheduled",
      agent: "Sarah Johnson",
      duration: "60 min",
      notes: "Luxury buyer, looking for premium features",
      bookingMethod: "Voice Assistant",
      propertyType: "Villa",
      price: "$1,200,000",
      location: "Uptown"
    },
    {
      id: "V004",
      time: "11:00 AM",
      date: "2024-01-23",
      property: "Investment Property",
      propertyId: "P004",
      client: "Lisa Brown",
      clientPhone: "+1-555-0126",
      clientEmail: "lisa.brown@email.com",
      status: "Rescheduled",
      agent: "Mike Chen",
      duration: "30 min",
      notes: "Rescheduled due to client conflict, new time TBD",
      bookingMethod: "Voice Assistant",
      propertyType: "Duplex",
      price: "$380,000",
      location: "Midtown"
    },
    {
      id: "V005",
      time: "4:00 PM",
      date: "2024-01-24",
      property: "Modern Apartment",
      propertyId: "P005",
      client: "David Lee",
      clientPhone: "+1-555-0127",
      clientEmail: "david.lee@email.com",
      status: "Scheduled",
      agent: "Sarah Johnson",
      duration: "30 min",
      notes: "Young professional, first-time buyer",
      bookingMethod: "Voice Assistant",
      propertyType: "Apartment",
      price: "$180,000",
      location: "Eastside"
    }
  ];

  const filteredViewings = viewings.filter(viewing => {
    const matchesSearch = viewing.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         viewing.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         viewing.agent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || viewing.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate !== "All") {
      const today = new Date();
      const viewingDate = new Date(viewing.date);
      
      switch (filterDate) {
        case "Today":
          matchesDate = viewingDate.toDateString() === today.toDateString();
          break;
        case "This Week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          matchesDate = viewingDate >= weekStart && viewingDate <= weekEnd;
          break;
        case "This Month":
          matchesDate = viewingDate.getMonth() === today.getMonth() && 
                       viewingDate.getFullYear() === today.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return '#2563eb';
      case 'Completed': return '#16a34a';
      case 'Rescheduled': return '#d97706';
      case 'Cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Scheduled': return '#dbeafe';
      case 'Completed': return '#dcfce7';
      case 'Rescheduled': return '#fef3c7';
      case 'Cancelled': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  return (
    <>
      <Head>
        <title>Viewings - RealEstatePro Dashboard | Bright Mind Vision</title>
        <meta name="description" content="Manage property viewings and appointments with voice-powered scheduling system." />
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
              Property Viewings
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Manage scheduled property viewings and appointments
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
                  Search Viewings
                </label>
                <input
                  type="text"
                  placeholder="Search by property, client, or agent..."
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
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
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
                  Date Range
                </label>
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
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
                  <option value="All">All Dates</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Viewings List */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}>
            {filteredViewings.map((viewing) => (
              <div key={viewing.id} style={{ 
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
                          {viewing.property}
                        </h3>
                        <div style={{ 
                          background: getStatusBg(viewing.status),
                          color: getStatusColor(viewing.status),
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {viewing.status}
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Client</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{viewing.client}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{viewing.clientPhone}</div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Date & Time</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {new Date(viewing.date).toLocaleDateString()} at {viewing.time}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Duration: {viewing.duration}</div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Agent</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{viewing.agent}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Booking: {viewing.bookingMethod}</div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Property Details</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {viewing.propertyType} • {viewing.location}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Price: {viewing.price}</div>
                        </div>
                      </div>
                      
                      {viewing.notes && (
                        <div style={{ 
                          background: '#f8fafc', 
                          padding: '12px', 
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Notes:</div>
                          <div style={{ fontSize: '14px', color: '#374151' }}>{viewing.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredViewings.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#111827' }}>
                No viewings found
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Try adjusting your search criteria or check back later for new appointments.
              </p>
            </div>
          )}
        </div>
      </RealEstateLayout>
    </>
  );
}

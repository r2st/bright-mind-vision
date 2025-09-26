import React, { useState } from 'react';
import ClinicLayout from '../../../components/ClinicLayout';
import SEO from '../../../components/SEO';

export default function Treatments() {
  const [activeMenu, setActiveMenu] = useState("Treatments");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const treatments = [
    {
      id: 'T001',
      name: 'General Checkup',
      duration: '30 min',
      price: '$150',
      category: 'Consultation',
      status: 'Active',
      voiceBookable: true,
      description: 'Comprehensive health assessment and physical examination',
      insuranceCovered: true,
      avgBookingTime: '2.8 min',
      monthlyBookings: 45
    },
    {
      id: 'T002',
      name: 'Blood Test',
      duration: '15 min',
      price: '$75',
      category: 'Laboratory',
      status: 'Active',
      voiceBookable: true,
      description: 'Complete blood count and basic metabolic panel',
      insuranceCovered: true,
      avgBookingTime: '2.5 min',
      monthlyBookings: 32
    },
    {
      id: 'T003',
      name: 'X-Ray Examination',
      duration: '20 min',
      price: '$200',
      category: 'Imaging',
      status: 'Active',
      voiceBookable: true,
      description: 'Diagnostic imaging for bone and joint assessment',
      insuranceCovered: true,
      avgBookingTime: '3.1 min',
      monthlyBookings: 28
    },
    {
      id: 'T004',
      name: 'Physical Therapy Session',
      duration: '45 min',
      price: '$120',
      category: 'Therapy',
      status: 'Active',
      voiceBookable: true,
      description: 'Rehabilitation and therapeutic exercise program',
      insuranceCovered: true,
      avgBookingTime: '3.2 min',
      monthlyBookings: 18
    },
    {
      id: 'T005',
      name: 'Dental Cleaning',
      duration: '60 min',
      price: '$180',
      category: 'Dental',
      status: 'Inactive',
      voiceBookable: false,
      description: 'Professional dental cleaning and oral health check',
      insuranceCovered: false,
      avgBookingTime: 'N/A',
      monthlyBookings: 0
    },
    {
      id: 'T006',
      name: 'Follow-up Consultation',
      duration: '20 min',
      price: '$100',
      category: 'Consultation',
      status: 'Active',
      voiceBookable: true,
      description: 'Follow-up appointment for ongoing treatment',
      insuranceCovered: true,
      avgBookingTime: '2.9 min',
      monthlyBookings: 38
    },
  ];

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || treatment.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || treatment.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    return status === 'Active' ? '#10b981' : '#6b7280';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Consultation': '#3b82f6',
      'Laboratory': '#10b981',
      'Imaging': '#f59e0b',
      'Therapy': '#8b5cf6',
      'Dental': '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <>
      <SEO 
        title="Treatments - Clinic Dashboard"
        description="Manage medical treatments and procedures."
        keywords="treatment management, medical procedures, clinic treatments, healthcare services, medical services"
        url="https://brightmindvision.com/product/clinic/treatments"
      />

      <ClinicLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
        {/* Top Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: 0,
              color: '#111827'
            }}>
              {activeMenu} Management
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
                + Add Treatment
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search treatments by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: '16px'
              }}>
                🔍
              </div>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="All">All Categories</option>
              <option value="Consultation">Consultation</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Imaging">Imaging</option>
              <option value="Therapy">Therapy</option>
              <option value="Dental">Dental</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px'
            }}>
              {filteredTreatments.length} treatments
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Voice Booking Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '2px solid #dbeafe'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>🎤</div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Voice Bookable</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>
                      {treatments.filter(t => t.voiceBookable).length}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>🏥</div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Total Treatments</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                      {treatments.length}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>⏱️</div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Avg. Booking Time</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>
                      2.9 min
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>Available Treatments</h3>

            {/* Treatments Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Treatment ID</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Name & Description</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Duration & Price</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Voice Booking</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Monthly Bookings</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTreatments.map((treatment, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{treatment.id}</td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>{treatment.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{treatment.description}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: `${getCategoryColor(treatment.category)}20`,
                            color: getCategoryColor(treatment.category)
                          }}>
                            {treatment.category}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                          <div>
                            <div>{treatment.duration}</div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{treatment.price}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: treatment.voiceBookable ? '#dbeafe' : '#f3f4f6',
                            color: treatment.voiceBookable ? '#1e40af' : '#6b7280'
                          }}>
                            {treatment.voiceBookable ? '🎤' : '🚫'} {treatment.voiceBookable ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                          <div>
                            <div>{treatment.monthlyBookings}</div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Avg: {treatment.avgBookingTime}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: `${getStatusColor(treatment.status)}20`,
                            color: getStatusColor(treatment.status)
                          }}>
                            {treatment.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#374151'
                            }}>
                              View
                            </button>
                            <button style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#374151'
                            }}>
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ClinicLayout>
    </>
  );
}
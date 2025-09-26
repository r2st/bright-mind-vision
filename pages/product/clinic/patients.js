import React, { useState } from 'react';
import ClinicLayout from '../../../components/ClinicLayout';
import SEO from '../../../components/SEO';

export default function Patients() {
  const [activeMenu, setActiveMenu] = useState("Patients");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const patients = [
    {
      id: 'P001',
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      phone: '+1-555-0123',
      email: 'john.smith@email.com',
      lastVisit: '2024-01-15',
      status: 'Active',
      onboardingMethod: 'Voice',
      appointmentType: 'General Checkup',
      insurance: 'Blue Cross',
      notes: 'Voice onboarding completed in 2.8 minutes'
    },
    {
      id: 'P002',
      name: 'Sarah Johnson',
      age: 32,
      gender: 'Female',
      phone: '+1-555-0124',
      email: 'sarah.johnson@email.com',
      lastVisit: '2024-01-18',
      status: 'Active',
      onboardingMethod: 'Voice',
      appointmentType: 'Follow-up',
      insurance: 'Aetna',
      notes: 'Voice onboarding completed in 3.2 minutes'
    },
    {
      id: 'P003',
      name: 'Mike Wilson',
      age: 28,
      gender: 'Male',
      phone: '+1-555-0125',
      email: 'mike.wilson@email.com',
      lastVisit: '2024-01-10',
      status: 'Active',
      onboardingMethod: 'Voice',
      appointmentType: 'Consultation',
      insurance: 'Cigna',
      notes: 'Voice onboarding completed in 2.5 minutes'
    },
    {
      id: 'P004',
      name: 'Lisa Brown',
      age: 55,
      gender: 'Female',
      phone: '+1-555-0126',
      email: 'lisa.brown@email.com',
      lastVisit: '2023-12-20',
      status: 'Inactive',
      onboardingMethod: 'Traditional',
      appointmentType: 'Annual Checkup',
      insurance: 'Medicare',
      notes: 'Traditional paper form'
    },
    {
      id: 'P005',
      name: 'David Lee',
      age: 38,
      gender: 'Male',
      phone: '+1-555-0127',
      email: 'david.lee@email.com',
      lastVisit: '2024-01-12',
      status: 'Active',
      onboardingMethod: 'Voice',
      appointmentType: 'Specialist Referral',
      insurance: 'UnitedHealth',
      notes: 'Voice onboarding completed in 3.1 minutes'
    },
    {
      id: 'P006',
      name: 'Emma Davis',
      age: 29,
      gender: 'Female',
      phone: '+1-555-0128',
      email: 'emma.davis@email.com',
      lastVisit: '2024-01-20',
      status: 'Active',
      onboardingMethod: 'Voice',
      appointmentType: 'New Patient',
      insurance: 'Kaiser',
      notes: 'Voice onboarding completed in 2.9 minutes'
    },
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    return status === 'Active' ? '#10b981' : '#6b7280';
  };

  return (
    <>
      <SEO 
        title="Patients - Clinic Dashboard"
        description="Manage patient records and information."
        keywords="patient management, clinic dashboard, healthcare management, patient records, medical records, clinic system"
        url="https://brightmindvision.com/product/clinic/patients"
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
                + Add Patient
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
                placeholder="Search patients by name, phone, or email..."
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
              {filteredPatients.length} patients found
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Voice Onboarding Stats */}
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
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Voice Onboarded</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>
                      {patients.filter(p => p.onboardingMethod === 'Voice').length}
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
                  <div style={{ fontSize: '24px' }}>👥</div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Total Patients</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                      {patients.length}
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
                  <div style={{ fontSize: '24px' }}>✅</div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Active Patients</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>
                      {patients.filter(p => p.status === 'Active').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>Patient Records</h3>

            {/* Patients Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Patient ID</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Name</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Contact</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Onboarding</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Appointment</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Last Visit</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{patient.id}</td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>{patient.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{patient.age} years, {patient.gender}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                          <div>
                            <div>{patient.phone}</div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{patient.email}</div>
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
                            backgroundColor: patient.onboardingMethod === 'Voice' ? '#dbeafe' : '#f3f4f6',
                            color: patient.onboardingMethod === 'Voice' ? '#1e40af' : '#6b7280'
                          }}>
                            {patient.onboardingMethod === 'Voice' ? '🎤' : '📝'} {patient.onboardingMethod}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                          <div>
                            <div>{patient.appointmentType}</div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{patient.insurance}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{patient.lastVisit}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: `${getStatusColor(patient.status)}20`,
                            color: getStatusColor(patient.status)
                          }}>
                            {patient.status}
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
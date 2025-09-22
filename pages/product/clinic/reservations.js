import React, { useState } from 'react';
import Head from 'next/head';
import ClinicLayout from '../../../components/ClinicLayout';

export default function Reservations() {
  const [activeMenu, setActiveMenu] = useState("Reservations");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("Today");

  const appointments = [
    {
      id: "A001",
      time: "9:00 AM",
      date: "2024-01-22",
      patient: "John Smith",
      patientId: "P001",
      phone: "+1-555-0123",
      treatment: "General Checkup",
      status: "Completed",
      doctor: "Dr. Emily White",
      bookingMethod: "Voice",
      duration: "30 min",
      notes: "Voice booking completed in 2.8 minutes",
      insurance: "Blue Cross"
    },
    {
      id: "A002",
      time: "10:00 AM",
      date: "2024-01-22",
      patient: "Sarah Johnson",
      patientId: "P002",
      phone: "+1-555-0124",
      treatment: "Follow-up",
      status: "Completed",
      doctor: "Dr. Michael Chen",
      bookingMethod: "Voice",
      duration: "20 min",
      notes: "Voice booking completed in 3.2 minutes",
      insurance: "Aetna"
    },
    {
      id: "A003",
      time: "11:00 AM",
      date: "2024-01-22",
      patient: "Mike Wilson",
      patientId: "P003",
      phone: "+1-555-0125",
      treatment: "Consultation",
      status: "In Progress",
      doctor: "Dr. Emily White",
      bookingMethod: "Voice",
      duration: "45 min",
      notes: "Voice booking completed in 2.5 minutes",
      insurance: "Cigna"
    },
    {
      id: "A004",
      time: "2:00 PM",
      date: "2024-01-22",
      patient: "Lisa Brown",
      patientId: "P004",
      phone: "+1-555-0126",
      treatment: "Examination",
      status: "Scheduled",
      doctor: "Dr. Sarah Davis",
      bookingMethod: "Traditional",
      duration: "40 min",
      notes: "Traditional phone booking",
      insurance: "Medicare"
    },
    {
      id: "A005",
      time: "3:00 PM",
      date: "2024-01-22",
      patient: "David Lee",
      patientId: "P005",
      phone: "+1-555-0127",
      treatment: "General Checkup",
      status: "Scheduled",
      doctor: "Dr. Emily White",
      bookingMethod: "Voice",
      duration: "30 min",
      notes: "Voice booking completed in 3.1 minutes",
      insurance: "UnitedHealth"
    },
    {
      id: "A006",
      time: "4:00 PM",
      date: "2024-01-22",
      patient: "Emma Davis",
      patientId: "P006",
      phone: "+1-555-0128",
      treatment: "New Patient Consultation",
      status: "Scheduled",
      doctor: "Dr. Michael Chen",
      bookingMethod: "Voice",
      duration: "60 min",
      notes: "Voice booking completed in 2.9 minutes",
      insurance: "Kaiser"
    },
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.phone.includes(searchTerm) ||
                         appointment.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || appointment.status === filterStatus;
    const matchesDate = filterDate === 'All' || appointment.date === '2024-01-22'; // Simplified for product
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#f59e0b';
      case 'Scheduled': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <>
      <Head>
        <title>Reservations - Clinic Dashboard | Bright Mind Vision</title>
        <meta name="description" content="Manage patient appointments and reservations." />
        <link rel="icon" href="/bmv_favicon.png" />
      </Head>

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
                + New Appointment
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
                placeholder="Search appointments by patient, doctor, or treatment..."
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
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
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
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
              <option value="This Week">This Week</option>
              <option value="All">All Dates</option>
            </select>

            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px'
            }}>
              {filteredAppointments.length} appointments
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
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Voice Bookings</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>
                      {appointments.filter(a => a.bookingMethod === 'Voice').length}
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
                  <div style={{ fontSize: '24px' }}>📅</div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Total Today</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                      {appointments.length}
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

            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>Today's Appointments</h3>

            {/* Appointments Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Time</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Patient</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Treatment</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Doctor</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Booking Method</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                          <div>
                            <div>{appointment.time}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{appointment.duration}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>{appointment.patient}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{appointment.phone}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                          <div>
                            <div>{appointment.treatment}</div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{appointment.insurance}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{appointment.doctor}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: appointment.bookingMethod === 'Voice' ? '#dbeafe' : '#f3f4f6',
                            color: appointment.bookingMethod === 'Voice' ? '#1e40af' : '#6b7280'
                          }}>
                            {appointment.bookingMethod === 'Voice' ? '🎤' : '📞'} {appointment.bookingMethod}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: `${getStatusColor(appointment.status)}20`,
                            color: getStatusColor(appointment.status)
                          }}>
                            {appointment.status}
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
                              Edit
                            </button>
                            <button style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#fef2f2',
                              border: '1px solid #f87171',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#dc2626'
                            }}>
                              Cancel
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
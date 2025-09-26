import React, { useState } from 'react';
import ClinicLayout from '../../../components/ClinicLayout';
import SEO from '../../../components/SEO';

export default function Staff() {
  const [activeMenu, setActiveMenu] = useState("Staff List");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const staff = [
    {
      id: 'S001',
      name: 'Dr. Emily White',
      role: 'Chief Medical Officer',
      department: 'General Medicine',
      phone: '+1-555-0201',
      email: 'emily.white@clinic.com',
      status: 'Active',
      accessLevel: 'Admin',
      voiceSystemAccess: true,
      lastLogin: '2024-01-22 08:30',
      patientsAssigned: 45,
      voiceBookingsHandled: 23
    },
    {
      id: 'S002',
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      department: 'Cardiology',
      phone: '+1-555-0202',
      email: 'michael.chen@clinic.com',
      status: 'Active',
      accessLevel: 'Doctor',
      voiceSystemAccess: true,
      lastLogin: '2024-01-22 09:15',
      patientsAssigned: 32,
      voiceBookingsHandled: 18
    },
    {
      id: 'S003',
      name: 'Dr. Sarah Davis',
      role: 'Pediatrician',
      department: 'Pediatrics',
      phone: '+1-555-0203',
      email: 'sarah.davis@clinic.com',
      status: 'Active',
      accessLevel: 'Doctor',
      voiceSystemAccess: true,
      lastLogin: '2024-01-22 07:45',
      patientsAssigned: 28,
      voiceBookingsHandled: 15
    },
    {
      id: 'S004',
      name: 'Nurse Jessica Brown',
      role: 'Head Nurse',
      department: 'Nursing',
      phone: '+1-555-0204',
      email: 'jessica.brown@clinic.com',
      status: 'Active',
      accessLevel: 'Staff',
      voiceSystemAccess: true,
      lastLogin: '2024-01-22 08:00',
      patientsAssigned: 0,
      voiceBookingsHandled: 8
    },
    {
      id: 'S005',
      name: 'Dr. David Wilson',
      role: 'Orthopedic Surgeon',
      department: 'Orthopedics',
      phone: '+1-555-0205',
      email: 'david.wilson@clinic.com',
      status: 'On Leave',
      accessLevel: 'Doctor',
      voiceSystemAccess: false,
      lastLogin: '2024-01-15 16:30',
      patientsAssigned: 0,
      voiceBookingsHandled: 0
    },
    {
      id: 'S006',
      name: 'Receptionist Maria Garcia',
      role: 'Receptionist',
      department: 'Administration',
      phone: '+1-555-0206',
      email: 'maria.garcia@clinic.com',
      status: 'Active',
      accessLevel: 'Staff',
      voiceSystemAccess: true,
      lastLogin: '2024-01-22 08:15',
      patientsAssigned: 0,
      voiceBookingsHandled: 12
    },
  ];

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || member.accessLevel === filterRole;
    const matchesStatus = filterStatus === 'All' || member.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'On Leave': return '#f59e0b';
      case 'Inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getRoleColor = (role) => {
    if (role.includes('Dr.') || role.includes('Doctor')) return '#3b82f6';
    if (role.includes('Nurse')) return '#10b981';
    if (role.includes('Chief') || role.includes('Head')) return '#8b5cf6';
    return '#6b7280';
  };

  return (
    <>
      <SEO 
        title="Staff - Clinic Dashboard"
        description="Manage clinic staff and personnel."
        keywords="staff management, clinic personnel, healthcare staff, medical team, clinic administration"
        url="https://brightmindvision.com/product/clinic/staff"
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
                + Add Staff Member
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
                placeholder="Search staff by name, role, or department..."
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
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
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
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Staff">Staff</option>
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
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px'
            }}>
              {filteredStaff.length} staff members
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Voice System Access Stats */}
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
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Voice System Access</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>
                      {staff.filter(s => s.voiceSystemAccess).length}
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
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Total Staff</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                      {staff.length}
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
                  <div style={{ fontSize: '24px' }}>👨‍⚕️</div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Active Doctors</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>
                      {staff.filter(s => s.accessLevel === 'Doctor' && s.status === 'Active').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>Staff Directory</h3>

            {/* Staff Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Staff ID</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Name & Role</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Department</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Contact</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Access Level</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Voice System</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{member.id}</td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>{member.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{member.role}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{member.department}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            <div>{member.phone}</div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{member.email}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: member.accessLevel === 'Admin' ? '#8b5cf620' :
                                          member.accessLevel === 'Doctor' ? '#3b82f620' : '#10b98120',
                            color: member.accessLevel === 'Admin' ? '#8b5cf6' :
                                   member.accessLevel === 'Doctor' ? '#3b82f6' : '#10b981'
                          }}>
                            {member.accessLevel}
                          </span>
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
                            backgroundColor: member.voiceSystemAccess ? '#dbeafe' : '#f3f4f6',
                            color: member.voiceSystemAccess ? '#1e40af' : '#6b7280'
                          }}>
                            {member.voiceSystemAccess ? '🎤' : '🚫'} {member.voiceSystemAccess ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: `${getStatusColor(member.status)}20`,
                            color: getStatusColor(member.status)
                          }}>
                            {member.status}
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
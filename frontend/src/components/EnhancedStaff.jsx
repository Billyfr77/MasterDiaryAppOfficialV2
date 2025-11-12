/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Dark Theme Staff Page - Professional Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This is the updated EnhancedStaff.jsx with:
 * - Dark theme matching the app's aesthetic
 * - Professional gradients and shadows
 * - Enhanced visual hierarchy
 * - Consistent color scheme
 * - No floating effects on hover
 */

import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Users, Plus, Edit, Trash2, User, DollarSign } from 'lucide-react'

const EnhancedStaff = () => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    payRateBase: '',
    payRateOT1: '',
    payRateOT2: '',
    chargeOutBase: '',
    chargeOutOT1: '',
    chargeOutOT2: ''
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await api.get('/staff')
      setStaff(response.data.data || response.data)
    } catch (err) {
      console.error('Error fetching staff:', err)
      alert('Error loading staff')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStaff = () => {
    setEditingStaff(null)
    setFormData({
      name: '',
      role: '',
      payRateBase: '',
      payRateOT1: '',
      payRateOT2: '',
      chargeOutBase: '',
      chargeOutOT1: '',
      chargeOutOT2: ''
    })
    setShowCreateForm(true)
  }

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember)
    setFormData({
      name: staffMember.name,
      role: staffMember.role,
      payRateBase: staffMember.payRateBase || '',
      payRateOT1: staffMember.payRateOT1 || '',
      payRateOT2: staffMember.payRateOT2 || '',
      chargeOutBase: staffMember.chargeOutBase || '',
      chargeOutOT1: staffMember.chargeOutOT1 || '',
      chargeOutOT2: staffMember.chargeOutOT2 || ''
    })
    setShowCreateForm(true)
  }

  const handleDeleteStaff = async (staffId) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return

    try {
      await api.delete(`/staff/${staffId}`)
      setStaff(staff.filter(s => s.id !== staffId))
      alert('Staff member deleted successfully')
    } catch (err) {
      alert('Error deleting staff member: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      const staffData = {
        name: formData.name,
        role: formData.role,
        payRateBase: parseFloat(formData.payRateBase) || 0,
        payRateOT1: parseFloat(formData.payRateOT1) || 0,
        payRateOT2: parseFloat(formData.payRateOT2) || 0,
        chargeOutBase: parseFloat(formData.chargeOutBase) || 0,
        chargeOutOT1: parseFloat(formData.chargeOutOT1) || 0,
        chargeOutOT2: parseFloat(formData.chargeOutOT2) || 0
      }

      if (editingStaff) {
        const response = await api.put(`/staff/${editingStaff.id}`, staffData)
        setStaff(staff.map(s => s.id === editingStaff.id ? response.data : s))
        alert('Staff member updated successfully')
      } else {
        const response = await api.post('/staff', staffData)
        setStaff([response.data, ...staff])
        alert('Staff member created successfully')
      }

      setShowCreateForm(false)
      setEditingStaff(null)
    } catch (err) {
      alert('Error saving staff member: ' + (err.response?.data?.error || err.message))
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          Loading Staff...
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <style>{`
        .staff-card {
          transition: all 0.3s ease;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border: 1px solid rgba(78, 205, 196, 0.2);
          overflow: hidden;
          position: relative;
        }
        .action-button {
          transition: all 0.2s ease;
          border-radius: 8px;
          border: none;
          padding: 8px 16px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }
        .action-button:hover {
          transform: none; /* Removed floating effect */
        }
        .edit-btn { background: linear-gradient(135deg, #f39c12, #e67e22); color: white; }
        .delete-btn { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; }
        .create-btn {
          background: linear-gradient(135deg, #28a745, #1e7e34);
          color: white;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          alignItems: center;
          justifyContent: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }
        .modal-content {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border-radius: 16px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(78, 205, 196, 0.3);
          animation: slideUp 0.3s ease;
          color: #ecf0f1;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 8px 0',
              color: '#ecf0f1',
              fontSize: '3rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #4ecdc4 0%, #667eea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              👥 Professional Staff Hub
            </h1>
            <p style={{
              margin: 0,
              color: '#bdc3c7',
              fontSize: '1.2rem'
            }}>
              Manage your construction team with advanced staff management tools
            </p>
          </div>

          <button
            onClick={handleCreateStaff}
            className="create-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={20} />
            Add Staff Member
          </button>
        </div>

        {/* Staff Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {staff.map(member => (
            <div key={member.id} className="staff-card" style={{
              padding: '24px',
              position: 'relative'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#ecf0f1',
                  fontSize: '1.4rem',
                  fontWeight: '600'
                }}>
                  {member.name}
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#bdc3c7',
                  fontSize: '0.9rem',
                  marginBottom: '12px'
                }}>
                  <User size={14} style={{ marginRight: '4px' }} />
                  {member.role}
                </div>

                {/* Pay Rates */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#4ecdc4', fontSize: '1rem' }}>Pay Rates</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem' }}>
                    <div style={{ color: '#ecf0f1' }}>Base: <span style={{ color: '#4ecdc4', fontWeight: '600' }}>${member.payRateBase}/hr</span></div>
                    <div style={{ color: '#ecf0f1' }}>OT1: <span style={{ color: '#f39c12', fontWeight: '600' }}>${member.payRateOT1}/hr</span></div>
                    <div style={{ color: '#ecf0f1' }}>OT2: <span style={{ color: '#e74c3c', fontWeight: '600' }}>${member.payRateOT2}/hr</span></div>
                  </div>
                </div>

                {/* Charge Out Rates */}
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#667eea', fontSize: '1rem' }}>Charge Out Rates</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem' }}>
                    <div style={{ color: '#ecf0f1' }}>Base: <span style={{ color: '#667eea', fontWeight: '600' }}>${member.chargeOutBase}/hr</span></div>
                    <div style={{ color: '#ecf0f1' }}>OT1: <span style={{ color: '#9b59b6', fontWeight: '600' }}>${member.chargeOutOT1}/hr</span></div>
                    <div style={{ color: '#ecf0f1' }}>OT2: <span style={{ color: '#e67e22', fontWeight: '600' }}>${member.chargeOutOT2}/hr</span></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => handleEditStaff(member)}
                  className="action-button edit-btn"
                  title="Edit Staff Member"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteStaff(member.id)}
                  className="action-button delete-btn"
                  title="Delete Staff Member"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}

          {staff.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '80px 20px',
              color: '#bdc3c7'
            }}>
              <Users size={64} style={{ color: 'rgba(78, 205, 196, 0.3)', marginBottom: '16px' }} />
              <h3>No staff members found</h3>
              <p>Add your first team member to get started!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Staff Modal */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => { setShowCreateForm(false); setEditingStaff(null) }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  margin: 0,
                  color: '#ecf0f1',
                  fontSize: '1.8rem',
                  fontWeight: '700'
                }}>
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
                <button
                  onClick={() => { setShowCreateForm(false); setEditingStaff(null) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#7f8c8d'
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#ecf0f1'
                    }}>
                      Name:
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid rgba(78, 205, 196, 0.3)',
                        borderRadius: '8px',
                        background: '#2c3e50',
                        color: '#ecf0f1',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#ecf0f1'
                    }}>
                      Role:
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid rgba(78, 205, 196, 0.3)',
                        borderRadius: '8px',
                        background: '#2c3e50',
                        color: '#ecf0f1',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>

                {/* Pay Rates Section */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#4ecdc4', fontSize: '1.2rem' }}>Pay Rates</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#ecf0f1',
                        fontSize: '14px'
                      }}>
                        Base Rate ($/hr):
                      </label>
                      <input
                        type="number"
                        value={formData.payRateBase}
                        onChange={(e) => setFormData({ ...formData, payRateBase: e.target.value })}
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid rgba(78, 205, 196, 0.3)',
                          borderRadius: '8px',
                          background: '#2c3e50',
                          color: '#ecf0f1',
                          fontSize: '16px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#ecf0f1',
                        fontSize: '14px'
                      }}>
                        Overtime 1 ($/hr):
                      </label>
                      <input
                        type="number"
                        value={formData.payRateOT1}
                        onChange={(e) => setFormData({ ...formData, payRateOT1: e.target.value })}
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid rgba(78, 205, 196, 0.3)',
                          borderRadius: '8px',
                          background: '#2c3e50',
                          color: '#ecf0f1',
                          fontSize: '16px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#ecf0f1',
                        fontSize: '14px'
                      }}>
                        Overtime 2 ($/hr):
                      </label>
                      <input
                        type="number"
                        value={formData.payRateOT2}
                        onChange={(e) => setFormData({ ...formData, payRateOT2: e.target.value })}
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid rgba(78, 205, 196, 0.3)',
                          borderRadius: '8px',
                          background: '#2c3e50',
                          color: '#ecf0f1',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Charge Out Rates Section */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#667eea', fontSize: '1.2rem' }}>Charge Out Rates</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#ecf0f1',
                        fontSize: '14px'
                      }}>
                        Base Rate ($/hr):
                      </label>
                      <input
                        type="number"
                        value={formData.chargeOutBase}
                        onChange={(e) => setFormData({ ...formData, chargeOutBase: e.target.value })}
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid rgba(78, 205, 196, 0.3)',
                          borderRadius: '8px',
                          background: '#2c3e50',
                          color: '#ecf0f1',
                          fontSize: '16px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#ecf0f1',
                        fontSize: '14px'
                      }}>
                        Overtime 1 ($/hr):
                      </label>
                      <input
                        type="number"
                        value={formData.chargeOutOT1}
                        onChange={(e) => setFormData({ ...formData, chargeOutOT1: e.target.value })}
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid rgba(78, 205, 196, 0.3)',
                          borderRadius: '8px',
                          background: '#2c3e50',
                          color: '#ecf0f1',
                          fontSize: '16px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#ecf0f1',
                        fontSize: '14px'
                      }}>
                        Overtime 2 ($/hr):
                      </label>
                      <input
                        type="number"
                        value={formData.chargeOutOT2}
                        onChange={(e) => setFormData({ ...formData, chargeOutOT2: e.target.value })}
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid rgba(78, 205, 196, 0.3)',
                          borderRadius: '8px',
                          background: '#2c3e50',
                          color: '#ecf0f1',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setEditingStaff(null) }}
                    style={{
                      padding: '12px 24px',
                      background: '#34495e',
                      color: '#ecf0f1',
                      border: '1px solid rgba(78, 205, 196, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                      color: '#2c3e50',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedStaff

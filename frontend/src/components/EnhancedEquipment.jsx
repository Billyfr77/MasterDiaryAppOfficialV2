/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Dark Theme Equipment Page - Professional Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This is the updated EnhancedEquipment.jsx with:
 * - Dark theme matching the app's aesthetic
 * - Professional gradients and shadows
 * - Enhanced visual hierarchy
 * - Consistent color scheme
 * - No floating effects on hover
 */

import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Wrench, Plus, Edit, Trash2, Settings, DollarSign } from 'lucide-react'

const EnhancedEquipment = () => {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    ownership: 'owned',
    costRateBase: '',
    costRateOT1: '',

    costRateOT2: ''
  })

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await api.get('/equipment')
      setEquipment(response.data.data || response.data)
    } catch (err) {
      console.error('Error fetching equipment:', err)
      alert('Error loading equipment')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEquipment = () => {
    setEditingEquipment(null)
    setFormData({
      name: '',
      category: '',
      ownership: 'owned',
      costRateBase: '',
      costRateOT1: '',

    costRateOT2: ''
    })
    setShowCreateForm(true)
  }

  const handleEditEquipment = (equipmentItem) => {
    setEditingEquipment(equipmentItem)
    setFormData({
      name: equipmentItem.name,
      category: equipmentItem.category,
      ownership: equipmentItem.ownership || 'owned',
      costRateBase: equipmentItem.costRateBase || '',
      costRateOT1: equipmentItem.costRateOT1 || ''
    })
    setShowCreateForm(true)
  }

  const handleDeleteEquipment = async (equipmentId) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return

    try {
      await api.delete(`/equipment/${equipmentId}`)
      setEquipment(equipment.filter(e => e.id !== equipmentId))
      alert('Equipment deleted successfully')
    } catch (err) {
      alert('Error deleting equipment: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      const equipmentData = {
        name: formData.name,
        category: formData.category,
        ownership: formData.ownership,
        costRateBase: parseFloat(formData.costRateBase) || 0,
        costRateOT1: parseFloat(formData.costRateOT1) || 0,          costRateOT2: parseFloat(formData.costRateOT2) || 0
      }

      if (editingEquipment) {
        const response = await api.put(`/equipment/${editingEquipment.id}`, equipmentData)
        setEquipment(equipment.map(e => e.id === editingEquipment.id ? response.data : e))
        alert('Equipment updated successfully')
      } else {
        const response = await api.post('/equipment', equipmentData)
        setEquipment([response.data, ...equipment])
        alert('Equipment created successfully')
      }

      setShowCreateForm(false)
      setEditingEquipment(null)
    } catch (err) {
      alert('Error saving equipment: ' + (err.response?.data?.error || err.message))
    }
  }

  const getOwnershipColor = (ownership) => {
    switch (ownership) {
      case 'owned': return '#4ecdc4'
      case 'leased': return '#f39c12'
      case 'rented': return '#e74c3c'
      default: return '#95a5a6'
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
          Loading Equipment...
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
        .equipment-card {
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
              🔧 Equipment Fleet Manager
            </h1>
            <p style={{
              margin: 0,
              color: '#bdc3c7',
              fontSize: '1.2rem'
            }}>
              Track and manage your construction equipment with precision
            </p>
          </div>

          <button
            onClick={handleCreateEquipment}
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
            Add Equipment
          </button>
        </div>

        {/* Equipment Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {equipment.map(item => (
            <div key={item.id} className="equipment-card" style={{
              padding: '24px',
              position: 'relative'
            }}>
              {/* Ownership Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 2
              }}>
                <span style={{
                  background: getOwnershipColor(item.ownership),
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {item.ownership || 'Owned'}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#ecf0f1',
                  fontSize: '1.4rem',
                  fontWeight: '600'
                }}>
                  {item.name}
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#bdc3c7',
                  fontSize: '0.9rem',
                  marginBottom: '12px'
                }}>
                  <Settings size={14} style={{ marginRight: '4px' }} />
                  {item.category}
                </div>

                {/* Cost Rates */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#4ecdc4', fontSize: '1rem' }}>Cost Rates</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem' }}>
                    <div style={{ color: '#ecf0f1' }}>Base: <span style={{ color: '#4ecdc4', fontWeight: '600' }}>${item.costRateBase}/hr</span></div>
                    <div style={{ color: '#ecf0f1' }}>OT: <span style={{ color: '#f39c12', fontWeight: '600' }}>${item.costRateOT1}/hr</span></div>
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
                  onClick={() => handleEditEquipment(item)}
                  className="action-button edit-btn"
                  title="Edit Equipment"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteEquipment(item.id)}
                  className="action-button delete-btn"
                  title="Delete Equipment"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}

          {equipment.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '80px 20px',
              color: '#bdc3c7'
            }}>
              <Wrench size={64} style={{ color: 'rgba(78, 205, 196, 0.3)', marginBottom: '16px' }} />
              <h3>No equipment found</h3>
              <p>Add your first equipment item to get started!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Equipment Modal */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => { setShowCreateForm(false); setEditingEquipment(null) }}>
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
                  {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                </h2>
                <button
                  onClick={() => { setShowCreateForm(false); setEditingEquipment(null) }}
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
                      Equipment Name:
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
                      Category:
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Excavator, Crane, Truck"
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

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#ecf0f1'
                  }}>
                    Ownership:
                  </label>
                  <select
                    value={formData.ownership}
                    onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid rgba(78, 205, 196, 0.3)',
                      borderRadius: '8px',
                      background: '#2c3e50',
                      color: '#ecf0f1',
                      fontSize: '16px'
                    }}
                  >
                    <option value="owned" style={{ background: '#34495e', color: '#ecf0f1' }}>Owned</option>
                    <option value="leased" style={{ background: '#34495e', color: '#ecf0f1' }}>Leased</option>
                    <option value="rented" style={{ background: '#34495e', color: '#ecf0f1' }}>Rented</option>
                  </select>
                </div>

                {/* Cost Rates Section */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#4ecdc4', fontSize: '1.2rem' }}>Cost Rates</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                        value={formData.costRateBase}
                        onChange={(e) => setFormData({ ...formData, costRateBase: e.target.value })}
                        step="0.01"
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
                        color: '#ecf0f1',
                        fontSize: '14px'
                      }}>
                        Overtime Rate ($/hr):
                      </label>
                      <input
                        type="number"
                        value={formData.costRateOT1}
                        onChange={(e) => setFormData({ ...formData, costRateOT1: e.target.value })}
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
                    onClick={() => { setShowCreateForm(false); setEditingEquipment(null) }}
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
                    {editingEquipment ? 'Update Equipment' : 'Add Equipment'}
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

export default EnhancedEquipment

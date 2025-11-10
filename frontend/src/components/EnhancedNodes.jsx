/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Dark Theme Nodes (Materials) Page - Professional Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This is the updated EnhancedNodes.jsx with:
 * - Dark theme matching the app's aesthetic
 * - Professional gradients and shadows
 * - Enhanced visual hierarchy
 * - Consistent color scheme
 * - No floating effects on hover
 */

import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Package, Plus, Edit, Trash2, Tag, DollarSign } from 'lucide-react'

const EnhancedNodes = () => {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNode, setEditingNode] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    pricePerUnit: ''
  })

  useEffect(() => {
    fetchNodes()
  }, [])

  const fetchNodes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/nodes')
      setNodes(response.data.data || response.data)
    } catch (err) {
      console.error('Error fetching nodes:', err)
      alert('Error loading materials')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNode = () => {
    setEditingNode(null)
    setFormData({
      name: '',
      category: '',
      unit: '',
      pricePerUnit: ''
    })
    setShowCreateForm(true)
  }

  const handleEditNode = (node) => {
    setEditingNode(node)
    setFormData({
      name: node.name,
      category: node.category,
      unit: node.unit,
      pricePerUnit: node.pricePerUnit || ''
    })
    setShowCreateForm(true)
  }

  const handleDeleteNode = async (nodeId) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    try {
      await api.delete(`/nodes/${nodeId}`)
      setNodes(nodes.filter(n => n.id !== nodeId))
      alert('Material deleted successfully')
    } catch (err) {
      alert('Error deleting material: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      const nodeData = {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        pricePerUnit: parseFloat(formData.pricePerUnit) || 0
      }

      if (editingNode) {
        const response = await api.put(`/nodes/${editingNode.id}`, nodeData)
        setNodes(nodes.map(n => n.id === editingNode.id ? response.data : n))
        alert('Material updated successfully')
      } else {
        const response = await api.post('/nodes', nodeData)
        setNodes([response.data, ...nodes])
        alert('Material created successfully')
      }

      setShowCreateForm(false)
      setEditingNode(null)
    } catch (err) {
      alert('Error saving material: ' + (err.response?.data?.error || err.message))
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
          Loading Materials...
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
        .node-card {
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
              📦 Materials Library
            </h1>
            <p style={{
              margin: 0,
              color: '#bdc3c7',
              fontSize: '1.2rem'
            }}>
              Manage your construction materials and pricing with precision
            </p>
          </div>

          <button
            onClick={handleCreateNode}
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
            Add Material
          </button>
        </div>

        {/* Nodes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {nodes.map(node => (
            <div key={node.id} className="node-card" style={{
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
                  {node.name}
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#bdc3c7',
                  fontSize: '0.9rem',
                  marginBottom: '12px'
                }}>
                  <Tag size={14} style={{ marginRight: '4px' }} />
                  {node.category}
                </div>

                {/* Pricing */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#4ecdc4', fontSize: '1rem' }}>Pricing</h4>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}>
                    <DollarSign size={16} style={{ color: '#4ecdc4', marginRight: '4px' }} />
                    <span style={{ color: '#4ecdc4', fontWeight: '600' }}>
                      ${node.pricePerUnit}
                    </span>
                    <span style={{ color: '#ecf0f1', marginLeft: '4px' }}>
                      per {node.unit}
                    </span>
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
                  onClick={() => handleEditNode(node)}
                  className="action-button edit-btn"
                  title="Edit Material"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteNode(node.id)}
                  className="action-button delete-btn"
                  title="Delete Material"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}

          {nodes.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '80px 20px',
              color: '#bdc3c7'
            }}>
              <Package size={64} style={{ color: 'rgba(78, 205, 196, 0.3)', marginBottom: '16px' }} />
              <h3>No materials found</h3>
              <p>Add your first material to get started!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Node Modal */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => { setShowCreateForm(false); setEditingNode(null) }}>
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
                  {editingNode ? 'Edit Material' : 'Add New Material'}
                </h2>
                <button
                  onClick={() => { setShowCreateForm(false); setEditingNode(null) }}
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
                      Material Name:
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
                      placeholder="e.g., Lumber, Concrete, Steel"
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#ecf0f1'
                    }}>
                      Unit:
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g., sq ft, cubic yard, linear ft"
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
                      Price per Unit ($):
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
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
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setEditingNode(null) }}
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
                    {editingNode ? 'Update Material' : 'Add Material'}
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

export default EnhancedNodes
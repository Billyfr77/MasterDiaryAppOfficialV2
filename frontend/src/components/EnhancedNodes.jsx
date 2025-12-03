/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Dark Theme Nodes (Materials) Page - Professional Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          Loading Materials...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              📦 Materials Library
            </h1>
            <p className="text-gray-200 text-lg">
              Manage your construction materials and pricing with precision
            </p>
          </div>

          <button
            onClick={handleCreateNode}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-success to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold shadow-lg shadow-success/30 border border-white/10"
          >
            <Plus size={20} />
            Add Material
          </button>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map(node => (
            <div key={node.id} className="glass-card p-6 group relative overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2 pr-16">
                  {node.name}
                </h3>

                <div className="flex items-center text-gray-300 text-sm mb-6">
                  <Tag size={16} className="mr-2 text-primary" />
                  {node.category}
                </div>

                {/* Pricing */}
                <div className="flex items-center text-lg">
                  <DollarSign size={20} className="text-success mr-1" />
                  <span className="font-bold text-success text-2xl">
                    {node.pricePerUnit}
                  </span>
                  <span className="text-gray-400 ml-2 text-sm">
                    per {node.unit}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleEditNode(node)}
                  className="flex-1 py-2 px-3 bg-warning/10 text-warning rounded-lg hover:bg-warning hover:text-white transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteNode(node.id)}
                  className="p-2 bg-danger/10 text-danger rounded-lg hover:bg-danger hover:text-white transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {nodes.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={40} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No materials found</h3>
              <p>Add your first material to get started!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Node Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => { setShowCreateForm(false); setEditingNode(null) }}>
            <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white">
                  {editingNode ? 'Edit Material' : 'Add New Material'}
                </h2>
                <button
                  onClick={() => { setShowCreateForm(false); setEditingNode(null) }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Material Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="glass-input w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Lumber, Concrete, Steel"
                      required
                      className="glass-input w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g., sq ft, cubic yard"
                      required
                      className="glass-input w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Price per Unit ($)
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                      step="0.01"
                      required
                      className="glass-input w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setEditingNode(null) }}
                    className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg shadow-primary/30"
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
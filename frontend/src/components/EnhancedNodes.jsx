/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Dark Theme Nodes (Materials) Page - Professional Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Package, Plus, Edit, Trash2, Tag, DollarSign, Layers } from 'lucide-react'

const EnhancedNodes = () => {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
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
    setFormData({ name: '', category: '', unit: '', pricePerUnit: '' })
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
      <div className="flex justify-center items-center h-screen bg-transparent text-white">
        <div className="bg-stone-900/80 p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-bold">Loading Materials...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 animate-fade-in font-sans">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 text-white tracking-tight drop-shadow-md">
              Materials Library
            </h1>
            <p className="text-gray-400 text-lg font-medium">
              Manage construction resources and pricing
            </p>
          </div>

          <button
            onClick={handleCreateNode}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Add Material
          </button>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map(node => (
            <div key={node.id} className="group bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="mb-6 relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors truncate pr-4">
                    {node.name}
                  </h3>
                  <div className="p-2 bg-white/5 rounded-lg text-indigo-500 shrink-0">
                    <Package size={18} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm mb-6 font-medium">
                  <Layers size={14} className="text-indigo-500/70" />
                  {node.category || 'General'}
                </div>

                {/* Pricing Card */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <h4 className="text-xs font-black text-emerald-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={12} /> Pricing
                  </h4>
                  <div className="flex items-end justify-between">
                    <div className="text-gray-500 font-bold text-xs uppercase">Unit Cost</div>
                    <div className="text-right">
                      <div className="font-mono font-black text-2xl text-white">${parseFloat(node.pricePerUnit).toFixed(2)}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">PER {node.unit.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-white/10 relative z-10">
                <button
                  onClick={() => handleEditNode(node)}
                  className="flex-1 py-2.5 px-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteNode(node.id)}
                  className="p-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {nodes.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-24 h-24 bg-stone-900/60 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Package size={48} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No materials found</h3>
              <p className="text-gray-400">Add your first material to get started!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Node Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => { setShowCreateForm(false); setEditingNode(null) }}>
            <div className="bg-stone-900 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-stone-900/95 backdrop-blur-md z-10">
                <h2 className="text-2xl font-black text-white tracking-tight">
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

              <form onSubmit={handleFormSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Material Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g. 20mm Aggregate"
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Concrete, Timber"
                      required
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-sm font-black text-emerald-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <DollarSign size={16} /> Cost Config
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Unit Type
                      </label>
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="e.g. m3, tonne, ea"
                        required
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none placeholder-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Price per Unit ($)
                      </label>
                      <input
                        type="number"
                        value={formData.pricePerUnit}
                        onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                        step="0.01"
                        required
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-white/10 mt-4">
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setEditingNode(null) }}
                    className="px-6 py-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5"
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
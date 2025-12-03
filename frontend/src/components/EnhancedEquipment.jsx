/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Dark Theme Equipment Page - Professional Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Wrench, Plus, Edit, Trash2, Settings, DollarSign, Activity, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react'

// ================================
// SERVICE LOG MODAL
// ================================

const ServiceModal = ({ isOpen, onClose, equipment, onAddRecord }) => {
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  if (!isOpen || !equipment) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onAddRecord(equipment.id, {
      id: Date.now(),
      date,
      description,
      cost: parseFloat(cost) || 0
    })
    setDescription('')
    setCost('')
  }

  // Mock service log data if none exists
  const logs = equipment.serviceHistory || []

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-stone-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Wrench size={24} className="text-amber-500" />
            Service Log: {equipment.name}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Add Record Form */}
        <form onSubmit={handleSubmit} className="mb-8 bg-black/20 p-4 rounded-2xl border border-white/5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Add Service Record</h4>
          <div className="space-y-3">
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full bg-stone-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-500 outline-none"
            />
            <input 
              type="text" 
              placeholder="Description (e.g., Oil Change)" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full bg-stone-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-500 outline-none"
            />
            <div className="flex gap-2">
               <input 
                 type="number" 
                 placeholder="Cost ($)" 
                 value={cost} 
                 onChange={e => setCost(e.target.value)} 
                 className="flex-1 bg-stone-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-500 outline-none"
               />
               <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-sm transition-colors">
                 Add
               </button>
            </div>
          </div>
        </form>

        {/* Log List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 italic text-sm">No service history recorded.</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-stone-800/50 rounded-xl border border-white/5">
                <div>
                  <div className="text-sm font-bold text-white">{log.description}</div>
                  <div className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-mono font-bold text-amber-400">
                  ${typeof log.cost === 'number' ? log.cost.toFixed(2) : log.cost}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const EnhancedEquipment = () => {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState(null)
  
  // Service Modal State
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [selectedForService, setSelectedForService] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    ownership: 'owned',
    status: 'Available', // Available, Maintenance, Out of Order
    costRateBase: '',
    costRateOT1: '',
    costRateOT2: '',
    notes: '',
    value: '',
    serviceInterval: 500
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
      status: 'Available',
      costRateBase: '',
      costRateOT1: '',
      costRateOT2: '',
      notes: '',
      value: '',
      serviceInterval: 500
    })
    setShowCreateForm(true)
  }

  const handleEditEquipment = (equipmentItem) => {
    setEditingEquipment(equipmentItem)
    setFormData({
      name: equipmentItem.name,
      category: equipmentItem.category,
      ownership: equipmentItem.ownership || 'owned',
      status: equipmentItem.status || 'Available',
      costRateBase: equipmentItem.costRateBase || '',
      costRateOT1: equipmentItem.costRateOT1 || '',
      costRateOT2: equipmentItem.costRateOT2 || '',
      notes: equipmentItem.notes || '',
      value: equipmentItem.value || '',
      serviceInterval: equipmentItem.serviceInterval || 500
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
        status: formData.status,
        costRateBase: parseFloat(formData.costRateBase) || 0,
        costRateOT1: parseFloat(formData.costRateOT1) || 0,
        costRateOT2: parseFloat(formData.costRateOT2) || 0,
        notes: formData.notes,
        value: parseFloat(formData.value) || 0,
        serviceInterval: parseInt(formData.serviceInterval) || 500
      }

      if (editingEquipment) {
        const response = await api.put(`/equipment/${editingEquipment.id}`, equipmentData)
        // If the API returns the updated object, use it. Otherwise, assume local update for demo if API doesn't support 'status' yet.
        const updated = response.data.data || response.data || { ...editingEquipment, ...equipmentData }
        setEquipment(equipment.map(e => e.id === editingEquipment.id ? updated : e))
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

  const handleOpenService = (item) => {
    setSelectedForService(item)
    setServiceModalOpen(true)
  }

  const handleAddServiceRecord = async (id, record) => {
    try {
      // Find current equipment to get existing history
      const currentItem = equipment.find(e => e.id === id);
      const newHistory = [record, ...(currentItem.serviceHistory || [])];
      
      // Persist to backend
      const response = await api.put(`/equipment/${id}`, {
        ...currentItem,
        serviceHistory: newHistory,
        lastServiceDate: record.date // Auto-update last service date
      });
      
      const updatedItem = response.data.data || response.data;

      // Update local state
      const updatedEquipment = equipment.map(e => {
        if (e.id === id) {
          return updatedItem;
        }
        return e
      })
      setEquipment(updatedEquipment)
      
      // Update currently selected for modal refresh
      setSelectedForService(updatedItem)
    } catch (err) {
      console.error('Failed to add service record:', err);
      alert('Failed to save service record');
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'Maintenance': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'Out of Order': return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const getOwnershipColor = (ownership) => {
    switch (ownership) {
      case 'owned': return 'bg-indigo-500'
      case 'leased': return 'bg-violet-500'
      case 'rented': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent text-white">
        <div className="bg-stone-900/80 p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-bold">Loading Equipment...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 animate-fade-in font-sans">
      <ServiceModal 
        isOpen={serviceModalOpen} 
        onClose={() => setServiceModalOpen(false)} 
        equipment={selectedForService} 
        onAddRecord={handleAddServiceRecord}
      />

      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 text-white tracking-tight drop-shadow-md">
              Equipment Fleet
            </h1>
            <p className="text-gray-400 text-lg font-medium">
              Track, service, and optimize your heavy machinery
            </p>
          </div>

          <button
            onClick={handleCreateEquipment}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Add Equipment
          </button>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map(item => (
            <div key={item.id} className="group bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Status Badge */}
              <div className="absolute top-6 right-6 z-10 flex gap-2">
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${getStatusColor(item.status || 'Available')}`}>
                  {item.status || 'Available'}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-white/10 ${getOwnershipColor(item.ownership)} text-white`}>
                  {item.ownership || 'Owned'}
                </span>
              </div>

              <div className="mb-6 relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 pr-24 group-hover:text-amber-400 transition-colors truncate">
                  {item.name}
                </h3>

                <div className="flex items-center text-gray-400 text-sm mb-6 font-medium">
                  <Settings size={16} className="mr-2 text-amber-500" />
                  {item.category}
                </div>

                {/* Cost Rates */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 mb-4">
                  <h4 className="text-xs font-black text-amber-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={12} /> Cost Rates
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="text-gray-500 font-bold uppercase">Base</div>
                    <div className="font-mono font-bold text-white text-right">${item.costRateBase}/hr</div>
                    <div className="text-gray-500 font-bold uppercase">Overtime</div>
                    <div className="font-mono font-bold text-orange-400 text-right">${item.costRateOT1}/hr</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-white/10 relative z-10">
                <button
                  onClick={() => handleOpenService(item)}
                  className="flex-1 py-2.5 px-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-sm"
                >
                  <Wrench size={16} />
                  Service
                </button>

                <button
                  onClick={() => handleEditEquipment(item)}
                  className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => handleDeleteEquipment(item.id)}
                  className="p-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {equipment.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-24 h-24 bg-stone-900/60 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Wrench size={48} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No equipment found</h3>
              <p className="text-gray-400">Add your first equipment item to get started!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Equipment Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => { setShowCreateForm(false); setEditingEquipment(null) }}>
            <div className="bg-stone-900 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-stone-900/95 backdrop-blur-md z-10">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                </h2>
                <button
                  onClick={() => { setShowCreateForm(false); setEditingEquipment(null) }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
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
                      placeholder="e.g., Excavator"
                      required
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Ownership
                    </label>
                    <select
                      value={formData.ownership}
                      onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer"
                    >
                      <option value="owned" className="bg-stone-900">Owned</option>
                      <option value="leased" className="bg-stone-900">Leased</option>
                      <option value="rented" className="bg-stone-900">Rented</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Current Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer"
                    >
                      <option value="Available" className="bg-stone-900">Available</option>
                      <option value="Maintenance" className="bg-stone-900">Maintenance</option>
                      <option value="Out of Order" className="bg-stone-900">Out of Order</option>
                    </select>
                  </div>
                </div>

                {/* Cost Rates Section */}
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-sm font-black text-amber-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <DollarSign size={16} /> Cost Rates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Base Rate ($/hr)
                      </label>
                      <input
                        type="number"
                        value={formData.costRateBase}
                        onChange={(e) => setFormData({ ...formData, costRateBase: e.target.value })}
                        step="0.01"
                        required
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Overtime Rate ($/hr)
                      </label>
                      <input
                        type="number"
                        value={formData.costRateOT1}
                        onChange={(e) => setFormData({ ...formData, costRateOT1: e.target.value })}
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details Section */}
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-sm font-black text-emerald-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Activity size={16} /> Asset Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Asset Value ($)
                      </label>
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Service Interval (Hrs)
                      </label>
                      <input
                        type="number"
                        value={formData.serviceInterval}
                        onChange={(e) => setFormData({ ...formData, serviceInterval: e.target.value })}
                        step="1"
                        placeholder="500"
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                      />
                    </div>

                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Description / Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                        placeholder="Additional details, condition notes, etc."
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-gray-600 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-white/10 mt-4">
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setEditingEquipment(null) }}
                    className="px-6 py-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5"
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
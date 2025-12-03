/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Dark Theme Staff Page - Professional Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
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
      <div className="flex justify-center items-center h-screen bg-transparent text-white">
        <div className="bg-stone-900/80 p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-bold">Loading Staff...</div>
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
              Staff Management
            </h1>
            <p className="text-gray-400 text-lg font-medium">
              Manage your construction team and rates
            </p>
          </div>

          <button
            onClick={handleCreateStaff}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Add Staff Member
          </button>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map(member => (
            <div key={member.id} className="group bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-emerald-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="mb-6 relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {member.name}
                  </h3>
                  <div className="p-2 bg-white/5 rounded-lg text-emerald-500">
                    <User size={18} />
                  </div>
                </div>

                <div className="text-gray-400 text-sm mb-6 font-medium">
                  {member.role}
                </div>

                {/* Pay Rates */}
                <div className="mb-4 bg-black/20 rounded-xl p-4 border border-white/5">
                  <h4 className="text-xs font-black text-emerald-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={12} /> Pay Rates
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="text-gray-500 font-bold uppercase">Base</div>
                    <div className="font-mono font-bold text-white text-right">${member.payRateBase}/hr</div>
                    <div className="text-gray-500 font-bold uppercase">OT1</div>
                    <div className="font-mono font-bold text-amber-400 text-right">${member.payRateOT1}/hr</div>
                    <div className="text-gray-500 font-bold uppercase">OT2</div>
                    <div className="font-mono font-bold text-rose-400 text-right">${member.payRateOT2}/hr</div>
                  </div>
                </div>

                {/* Charge Out Rates */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <h4 className="text-xs font-black text-indigo-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={12} /> Charge Out Rates
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="text-gray-500 font-bold uppercase">Base</div>
                    <div className="font-mono font-bold text-white text-right">${member.chargeOutBase}/hr</div>
                    <div className="text-gray-500 font-bold uppercase">OT1</div>
                    <div className="font-mono font-bold text-purple-400 text-right">${member.chargeOutOT1}/hr</div>
                    <div className="text-gray-500 font-bold uppercase">OT2</div>
                    <div className="font-mono font-bold text-orange-400 text-right">${member.chargeOutOT2}/hr</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-white/10 relative z-10">
                <button
                  onClick={() => handleEditStaff(member)}
                  className="flex-1 py-2.5 px-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteStaff(member.id)}
                  className="p-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {staff.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-24 h-24 bg-stone-900/60 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Users size={48} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No staff members found</h3>
              <p className="text-gray-400">Add your first team member to get started!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Staff Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => { setShowCreateForm(false); setEditingStaff(null) }}>
            <div className="bg-stone-900 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-stone-900/95 backdrop-blur-md z-10">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
                <button
                  onClick={() => { setShowCreateForm(false); setEditingStaff(null) }}
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
                      Role
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                {/* Pay Rates Section */}
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-sm font-black text-emerald-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <DollarSign size={16} /> Pay Rates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Base Rate ($/hr)
                      </label>
                      <input
                        type="number"
                        value={formData.payRateBase}
                        onChange={(e) => setFormData({ ...formData, payRateBase: e.target.value })}
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Overtime 1 ($/hr)
                      </label>
                      <input
                        type="number"
                        value={formData.payRateOT1}
                        onChange={(e) => setFormData({ ...formData, payRateOT1: e.target.value })}
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Overtime 2 ($/hr)
                      </label>
                      <input
                        type="number"
                        value={formData.payRateOT2}
                        onChange={(e) => setFormData({ ...formData, payRateOT2: e.target.value })}
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-rose-500/50 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Charge Out Rates Section */}
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-sm font-black text-indigo-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <DollarSign size={16} /> Charge Out Rates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Base Rate ($/hr)
                      </label>
                      <input
                        type="number"
                        value={formData.chargeOutBase}
                        onChange={(e) => setFormData({ ...formData, chargeOutBase: e.target.value })}
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Overtime 1 ($/hr)
                      </label>
                      <input
                        type="number"
                        value={formData.chargeOutOT1}
                        onChange={(e) => setFormData({ ...formData, chargeOutOT1: e.target.value })}
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Overtime 2 ($/hr)
                      </label>
                      <input
                        type="number"
                        value={formData.chargeOutOT2}
                        onChange={(e) => setFormData({ ...formData, chargeOutOT2: e.target.value })}
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-white/10 mt-4">
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setEditingStaff(null) }}
                    className="px-6 py-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5"
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

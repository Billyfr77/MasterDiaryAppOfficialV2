/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Settings, Plus, Edit, Trash2, Sparkles, Volume2, VolumeX, CheckCircle, XCircle } from 'lucide-react'

const Confetti = ({ show }) => {
  if (!show) return null
  const particles = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="fixed w-2.5 h-2.5 z-[9999] animate-[confetti_2s_ease-in-out_forwards]"
      style={{
        left: `${Math.random() * 100}%`,
        top: '-10px',
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
      }}
    />
  ))
  return <div>{particles}</div>
}

const Particles = ({ show }) => {
  if (!show) return null
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="absolute w-1 h-1 rounded-full bg-primary animate-[particle_1s_ease-out_forwards] z-10"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ))
  return <div className="absolute inset-0 pointer-events-none">{particles}</div>
}

const SoundToggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className="fixed top-5 right-5 bg-white/10 border border-white/30 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-[1000] backdrop-blur-md transition-all hover:bg-white/20"
    aria-label={enabled ? 'Disable sound' : 'Enable sound'}
  >
    {enabled ? <Volume2 size={20} className="text-white" /> : <VolumeX size={20} className="text-white" />}
  </button>
)

const EnhancedSettings = () => {
  const [settings, setSettings] = useState([])
  const [form, setForm] = useState({ parameter: '', value: '', notes: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await api.get('/settings')
      setSettings(response.data)
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 2000)
    } catch (err) {
      alert('Error fetching settings: ' + (err.response?.data?.error || err.message))
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditing) {
        await api.put(`/settings/${editingId}`, form)
        alert('Setting updated successfully!')
      } else {
        await api.post('/settings', form)
        alert('Setting added successfully!')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
      setForm({ parameter: '', value: '', notes: '' })
      setIsEditing(false)
      setEditingId(null)
      fetchSettings()
    } catch (err) {
      alert('Error saving setting: ' + (err.response?.data?.error || err.message))
      console.error('Error saving setting:', err)
    }
  }

  const handleEdit = (setting) => {
    setForm({ parameter: setting.parameter, value: setting.value, notes: setting.notes })
    setIsEditing(true)
    setEditingId(setting.id)
  }

  const handleCancel = () => {
    setForm({ parameter: '', value: '', notes: '' })
    setIsEditing(false)
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this setting?')) {
      try {
        await api.delete(`/settings/${id}`)
        fetchSettings()
      } catch (err) {
        alert('Error deleting setting: ' + (err.response?.data?.error || err.message))
      }
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-transparent text-white font-sans">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-xl font-bold">Loading Settings...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white relative font-sans p-8 overflow-hidden animate-fade-in">
      
      <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />

      <Particles show={showParticles} />

      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10 relative max-w-[1600px] mx-auto">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse opacity-50"></div>
        <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
          <Sparkles size={32} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="m-0 text-white font-black text-4xl tracking-tight drop-shadow-lg">
            System Settings
          </h2>
          <p className="text-gray-400 font-medium mt-1">Configure global application parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 max-w-[1600px] mx-auto">
        {/* Form */}
        <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="mb-8 text-white font-black text-2xl text-center drop-shadow-md flex items-center justify-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl">
              <Plus size={24} className="text-indigo-400" />
            </div>
            {isEditing ? 'Edit Parameter' : 'New Parameter'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Parameter Name</label>
              <input
                placeholder="e.g. Default Tax Rate"
                value={form.parameter}
                onChange={(e) => setForm({ ...form, parameter: e.target.value })}
                required
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-gray-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Value</label>
              <input
                placeholder="e.g. 0.15"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-gray-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Notes</label>
              <input
                placeholder="Optional description..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-gray-600"
              />
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <CheckCircle size={20} />
                {isEditing ? 'Update' : 'Add'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3.5 bg-stone-800 hover:bg-stone-700 text-gray-300 rounded-xl font-bold shadow-lg border border-white/5 flex items-center justify-center gap-2 transition-all"
                >
                  <XCircle size={20} />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Settings List */}
        <div className="bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="mb-8 text-white font-black text-2xl flex items-center gap-3">
            <Settings size={28} className="text-indigo-500" />
            Configuration Registry
          </h3>
          <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {settings.map(setting => (
              <div
                key={setting.id}
                className="bg-black/20 border border-white/5 rounded-2xl p-5 flex justify-between items-center transition-all hover:border-indigo-500/30 hover:bg-black/30 group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <strong className="text-white font-bold text-lg">{setting.parameter}</strong>
                    <span className="bg-white/5 text-gray-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-white/5">Config</span>
                  </div>
                  <div className="text-indigo-300 font-mono text-sm bg-indigo-500/10 px-2 py-1 rounded w-fit mb-1">{setting.value}</div>
                  {setting.notes && <div className="text-gray-500 text-xs italic">{setting.notes}</div>}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(setting)}
                    className="p-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(setting.id)}
                    className="p-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {settings.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No settings configured yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <Confetti show={showConfetti} />
    </div>
  )
}

export default EnhancedSettings
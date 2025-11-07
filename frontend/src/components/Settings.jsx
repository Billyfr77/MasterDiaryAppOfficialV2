import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'

const Settings = () => {
  const [settings, setSettings] = useState([])
  const [form, setForm] = useState({ parameter: '', value: '', notes: '' })

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      setSettings(response.data)
    } catch (err) {
      alert('Error fetching settings: ' + (err.response?.data?.error || err.message))
      console.error('Error fetching settings:', err)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/settings', form)
      setForm({ parameter: '', value: '', notes: '' })
      fetchSettings()
    } catch (err) {
      alert('Error adding setting: ' + (err.response?.data?.error || err.message))
      console.error('Error adding setting:', err)
    }
  }

  return (
    <div>
      <h2>Settings</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Parameter" value={form.parameter} onChange={(e) => setForm({ ...form, parameter: e.target.value })} required />
        <input placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
        <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button type="submit">Add Setting</button>
      </form>
      <ul>
        {settings.map(s => (
          <li key={s.id}>{s.parameter}: {s.value} ({s.notes})</li>
        ))}
      </ul>
    </div>
  )
}

export default Settings
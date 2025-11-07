import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'

const Equipment = () => {
  const [equipment, setEquipment] = useState([])
  const [form, setForm] = useState({ name: '', category: '', ownership: '', costRateBase: '', costRateOT1: '', costRateOT2: '' })

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment')
      setEquipment(response.data.data || response.data)
    } catch (err) {
      alert('Error fetching equipment: ' + (err.response?.data?.error || err.message))
      console.error('Error fetching equipment:', err)
    }
  }

  useEffect(() => { fetchEquipment() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...form,
        costRateBase: parseFloat(form.costRateBase),
        costRateOT1: form.costRateOT1 ? parseFloat(form.costRateOT1) : undefined,
        costRateOT2: form.costRateOT2 ? parseFloat(form.costRateOT2) : undefined
      }
      await api.post('/equipment', dataToSend)
      setForm({ name: '', category: '', ownership: '', costRateBase: '', costRateOT1: '', costRateOT2: '' })
      fetchEquipment()
    } catch (err) {
      alert('Error adding equipment: ' + (err.response?.data?.error || err.message))
      console.error('Error adding equipment:', err)
    }
  }

  return (
    <div>
      <h2>Equipment</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        <input placeholder="Ownership" value={form.ownership} onChange={(e) => setForm({ ...form, ownership: e.target.value })} required />
        <input type="number" step="0.01" placeholder="Base Cost Rate" value={form.costRateBase} onChange={(e) => setForm({ ...form, costRateBase: e.target.value })} required />
        <input type="number" step="0.01" placeholder="OT1 Cost Rate" value={form.costRateOT1} onChange={(e) => setForm({ ...form, costRateOT1: e.target.value })} />
        <input type="number" step="0.01" placeholder="OT2 Cost Rate" value={form.costRateOT2} onChange={(e) => setForm({ ...form, costRateOT2: e.target.value })} />
        <button type="submit">Add Equipment</button>
      </form>
      <ul>
        {equipment.map(e => (
          <li key={e.id}>{e.name} - {e.category} - ${e.costRateBase}</li>
        ))}
      </ul>
    </div>
  )
}

export default Equipment
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'

const Staff = () => {
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({ 
    name: '', 
    role: '', 
    payRateBase: '', 
    payRateOT1: '', 
    payRateOT2: '',
    chargeOutBase: '',
    chargeOutOT1: '',
    chargeOutOT2: ''
  })

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff')
      setStaff(response.data.data || response.data)
    } catch (err) {
      alert('Error fetching staff: ' + (err.response?.data?.error || err.message))
      console.error('Error fetching staff:', err)
    }
  }

  useEffect(() => { fetchStaff() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...form,
        payRateBase: parseFloat(form.payRateBase),
        payRateOT1: form.payRateOT1 ? parseFloat(form.payRateOT1) : undefined,
        payRateOT2: form.payRateOT2 ? parseFloat(form.payRateOT2) : undefined,
        chargeOutBase: parseFloat(form.chargeOutBase),
        chargeOutOT1: form.chargeOutOT1 ? parseFloat(form.chargeOutOT1) : undefined,
        chargeOutOT2: form.chargeOutOT2 ? parseFloat(form.chargeOutOT2) : undefined
      }
      await api.post('/staff', dataToSend)
      setForm({ name: '', role: '', payRateBase: '', payRateOT1: '', payRateOT2: '', chargeOutBase: '', chargeOutOT1: '', chargeOutOT2: '' })
      fetchStaff()
    } catch (err) {
      alert('Error adding staff: ' + (err.response?.data?.error || err.message))
      console.error('Error adding staff:', err)
    }
  }

  return (
    <div>
      <h2>Staff</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        <input type="number" step="0.01" placeholder="Base Pay Rate" value={form.payRateBase} onChange={(e) => setForm({ ...form, payRateBase: e.target.value })} required />
        <input type="number" step="0.01" placeholder="OT1 Pay Rate" value={form.payRateOT1} onChange={(e) => setForm({ ...form, payRateOT1: e.target.value })} />
        <input type="number" step="0.01" placeholder="OT2 Pay Rate" value={form.payRateOT2} onChange={(e) => setForm({ ...form, payRateOT2: e.target.value })} />
        <input type="number" step="0.01" placeholder="Base Charge Out Rate" value={form.chargeOutBase} onChange={(e) => setForm({ ...form, chargeOutBase: e.target.value })} required />
        <input type="number" step="0.01" placeholder="OT1 Charge Out Rate" value={form.chargeOutOT1} onChange={(e) => setForm({ ...form, chargeOutOT1: e.target.value })} />
        <input type="number" step="0.01" placeholder="OT2 Charge Out Rate" value={form.chargeOutOT2} onChange={(e) => setForm({ ...form, chargeOutOT2: e.target.value })} />
        <button type="submit">Add Staff</button>
      </form>
      <ul>
        {staff.map(s => (
          <li key={s.id}>{s.name} - {s.role} - Pay: ${s.payRateBase}, Charge: ${s.chargeOutBase}</li>
        ))}
      </ul>
    </div>
  )
}

export default Staff
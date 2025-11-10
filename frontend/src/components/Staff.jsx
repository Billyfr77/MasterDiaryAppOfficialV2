/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This software and associated documentation contain proprietary
 * and confidential information of Billy Fraser.
 *
 * Unauthorized copying, modification, distribution, or use of this
 * software, in whole or in part, is strictly prohibited without
 * prior written permission from the copyright holder.
 *
 * For licensing inquiries: billyfr77@example.com
 *
 * Patent Pending: Drag-and-drop construction quote builder system
 * Trade Secret: Real-time calculation algorithms and optimization techniques
 */import React, { useState, useEffect } from 'react'
        import { api } from '../utils/api'

        const Staff = () => {
          const [staff, setStaff] = useState([])
          const [form, setForm] = useState({
            id: null,
            name: '',
            role: '',
            payRateBase: '',
            payRateOT1: '',
            payRateOT2: '',
            chargeOutBase: '',
            chargeOutOT1: '',
            chargeOutOT2: ''
          })
          const [isEditing, setIsEditing] = useState(false)

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
                name: form.name,
                role: form.role,
                payRateBase: parseFloat(form.payRateBase),
                payRateOT1: form.payRateOT1 ? parseFloat(form.payRateOT1) : undefined,
                payRateOT2: form.payRateOT2 ? parseFloat(form.payRateOT2) : undefined,
                chargeOutBase: parseFloat(form.chargeOutBase),
                chargeOutOT1: form.chargeOutOT1 ? parseFloat(form.chargeOutOT1) : undefined,
                chargeOutOT2: form.chargeOutOT2 ? parseFloat(form.chargeOutOT2) : undefined
              }
              if (isEditing) {
                await api.put(`/staff/${form.id}`, dataToSend)
                alert('Staff updated successfully!')
              } else {
                await api.post('/staff', dataToSend)
                alert('Staff added successfully!')
              }
              setForm({ id: null, name: '', role: '', payRateBase: '', payRateOT1: '', payRateOT2: '', chargeOutBase: '', chargeOutOT1: '', chargeOutOT2: '' })
              setIsEditing(false)
              fetchStaff()
            } catch (err) {
              alert('Error saving staff: ' + (err.response?.data?.error || err.message))
              console.error('Error saving staff:', err)
            }
          }

          const handleEdit = (s) => {
            setForm({
              id: s.id,
              name: s.name,
              role: s.role,
              payRateBase: s.payRateBase || '',
              payRateOT1: s.payRateOT1 || '',
              payRateOT2: s.payRateOT2 || '',
              chargeOutBase: s.chargeOutBase || '',
              chargeOutOT1: s.chargeOutOT1 || '',
              chargeOutOT2: s.chargeOutOT2 || ''
            })
            setIsEditing(true)
          }

          const handleCancel = () => {
            setForm({ id: null, name: '', role: '', payRateBase: '', payRateOT1: '', payRateOT2: '', chargeOutBase: '', chargeOutOT1: '', chargeOutOT2: '' })
            setIsEditing(false)
          }

          const handleDelete = async (id) => {
            if (window.confirm('Are you sure you want to delete this staff member?')) {
              try {
                await api.delete(`/staff/${id}`)
                fetchStaff()
              } catch (err) {
                alert('Error deleting staff: ' + (err.response?.data?.error || err.message))
              }
            }
          }

          return (
            <div>
              <h2>Staff Management</h2>
              <form onSubmit={handleSubmit}>
                <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
                <input type="number" step="0.01" placeholder="Base Pay Rate" value={form.payRateBase} onChange={(e) => setForm({ ...form, payRateBase: e.target.value })} required
    />
                <input type="number" step="0.01" placeholder="OT1 Pay Rate" value={form.payRateOT1} onChange={(e) => setForm({ ...form, payRateOT1: e.target.value })} />
                <input type="number" step="0.01" placeholder="OT2 Pay Rate" value={form.payRateOT2} onChange={(e) => setForm({ ...form, payRateOT2: e.target.value })} />
                <input type="number" step="0.01" placeholder="Base Charge Out Rate" value={form.chargeOutBase} onChange={(e) => setForm({ ...form, chargeOutBase: e.target.value })}
     required />
                <input type="number" step="0.01" placeholder="OT1 Charge Out Rate" value={form.chargeOutOT1} onChange={(e) => setForm({ ...form, chargeOutOT1: e.target.value })} />
                <input type="number" step="0.01" placeholder="OT2 Charge Out Rate" value={form.chargeOutOT2} onChange={(e) => setForm({ ...form, chargeOutOT2: e.target.value })} />
                <button type="submit">{isEditing ? 'Update Staff' : 'Add Staff'}</button>
                {isEditing && <button type="button" onClick={handleCancel}>Cancel</button>}
              </form>
              <ul>
                {staff.map(s => (
                  <li key={s.id}>
                    {s.name} - {s.role} - Pay: ${s.payRateBase || 0}, Charge: ${s.chargeOutBase || 0}
                    <button onClick={() => handleEdit(s)}>Edit</button>
                    <button onClick={() => handleDelete(s.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )
        }

        export default Staff
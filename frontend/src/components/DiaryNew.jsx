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
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { api } from '../utils/api'

const DiaryNew = () => {
  const [projects, setProjects] = useState([])
  const [staff, setStaff] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [form, setForm] = useState({
    date: new Date(),
    projectId: '',
    workerId: '',
    start: null,
    finish: null,
    breakMins: '',
    revenues: ''
  })
  const [preview, setPreview] = useState({ totalHours: 0, costs: 0, revenues: 0, marginPct: 0 })

  const fetchData = async () => {
    try {
      const [projectsRes, staffRes] = await Promise.all([
        api.get('/projects'),
        api.get('/staff')
      ])
      setProjects(projectsRes.data.data || projectsRes.data)
      setStaff(staffRes.data.data || staffRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (form.workerId) {
      const worker = staff.find(s => s.id === form.workerId)
      setSelectedStaff(worker)
    }
  }, [form.workerId, staff])

  useEffect(() => {
    calculatePreview()
  }, [form.start, form.finish, form.breakMins, selectedStaff])

  const calculatePreview = () => {
    if (!form.start || !form.finish || !selectedStaff) return

    const start = new Date(form.start)
    const finish = new Date(form.finish)
    const diffMs = finish - start
    const totalMinutes = diffMs / (1000 * 60)
    const totalHours = totalMinutes / 60 - (parseInt(form.breakMins) || 0) / 60

    if (totalHours <= 0) return

    const ordinaryHours = Math.min(totalHours, 8)
    const ot1Hours = Math.min(Math.max(totalHours - 8, 0), 4)
    const ot2Hours = Math.max(totalHours - 12, 0)

    const costs = ordinaryHours * selectedStaff.payRateBase +
                  ot1Hours * (selectedStaff.payRateOT1 || selectedStaff.payRateBase) +
                  ot2Hours * (selectedStaff.payRateOT2 || selectedStaff.payRateBase)

    const revenues = ordinaryHours * selectedStaff.chargeOutBase +
                      ot1Hours * (selectedStaff.chargeOutOT1 || selectedStaff.chargeOutBase) +
                      ot2Hours * (selectedStaff.chargeOutOT2 || selectedStaff.chargeOutBase)

    const marginPct = revenues > 0 ? ((revenues - costs) / revenues) * 100 : 0

    setPreview({
      totalHours: totalHours.toFixed(2),
      costs: costs.toFixed(2),
      revenues: revenues.toFixed(2),
      marginPct: marginPct.toFixed(2)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.start || !form.finish) {
      alert('Please select start and finish times.')
      return
    }
    try {
      const dataToSend = {
        date: form.date.toISOString().split('T')[0],
        projectId: form.projectId,
        workerId: form.workerId,
        start: form.start.toTimeString().split(' ')[0],
        finish: form.finish.toTimeString().split(' ')[0],
        breakMins: form.breakMins ? parseInt(form.breakMins) : undefined,
        revenues: form.revenues ? parseFloat(form.revenues) : undefined
      }
      await api.post('/diaries', dataToSend)
      alert('Diary entry added successfully!')
      // Reset form
      setForm({
        date: new Date(),
        projectId: '',
        workerId: '',
        start: null,
        finish: null,
        breakMins: '',
        revenues: ''
      })
      setPreview({ totalHours: 0, costs: 0, revenues: 0, marginPct: 0 })
    } catch (err) {
      alert('Error adding diary entry: ' + (err.response?.data?.error || err.message))
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Add New Diary Entry</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Date:</label>
          <DatePicker
            selected={form.date}
            onChange={(date) => setForm({ ...form, date })}
            dateFormat="yyyy-MM-dd"
            required
          />
        </div>
        <div>
          <label>Project:</label>
          <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>Worker:</label>
          <select value={form.workerId} onChange={(e) => setForm({ ...form, workerId: e.target.value })} required>
            <option value="">Select Worker</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label>Start Time:</label>
          <DatePicker
            selected={form.start}
            onChange={(time) => setForm({ ...form, start: time })}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="HH:mm"
            placeholderText="Select start time"
            required
          />
        </div>
        <div>
          <label>Finish Time:</label>
          <DatePicker
            selected={form.finish}
            onChange={(time) => setForm({ ...form, finish: time })}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="HH:mm"
            placeholderText="Select finish time"
            required
          />
        </div>
        <div>
          <label title="Break minutes to subtract from total hours">Break Mins:</label>
          <input
            type="number"
            value={form.breakMins}
            onChange={(e) => setForm({ ...form, breakMins: e.target.value })}
            placeholder="e.g., 30"
          />
        </div>
        <div>
          <label title="Optional: Override calculated revenues">Revenues (optional):</label>
          <input
            type="number"
            step="0.01"
            value={form.revenues}
            onChange={(e) => setForm({ ...form, revenues: e.target.value })}
          />
        </div>
        <button type="submit">Add Diary Entry</button>
      </form>

      <h3>Preview</h3>
      <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
        <p>Total Hours: {preview.totalHours}</p>
        <p>Costs: ${preview.costs}</p>
        <p>Revenues: ${preview.revenues}</p>
        <p>Margin %: {preview.marginPct}%</p>
      </div>

      <style jsx>{`
        div {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
        }
        input, select {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
        }
        button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
        @media (max-width: 600px) {
          div {
            margin-bottom: 10px;
          }
          input, select {
            padding: 6px;
          }
          button {
            padding: 8px 16px;
          }
        }
      `}</style>
    </div>
  )
}

export default DiaryNew
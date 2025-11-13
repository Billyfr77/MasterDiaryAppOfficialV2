/*
 * MasterDiaryApp Official - Enhanced Diaries Component
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * Displays both traditional diary entries and Paint Diary entries
 */

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { formatCurrency } from './utils/formatters' // Assuming you have this utility

const Diaries = ({ token }) => {
  const [traditionalDiaries, setTraditionalDiaries] = useState([])
  const [paintDiaries, setPaintDiaries] = useState([])
  const [projects, setProjects] = useState([])
  const [staff, setStaff] = useState([])
  const [activeTab, setActiveTab] = useState('traditional') // 'traditional' or 'paint'
  const [form, setForm] = useState({
    date: '', projectId: '', workerId: '', start: '', finish: '', breakMins: '', revenues: ''
  })

  const fetchData = async () => {
    try {
      const [traditionalRes, paintRes, projectsRes, staffRes] = await Promise.all([
        axios.get('http://localhost:5003/api/diaries', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5003/api/paint-diaries', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5003/api/projects', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5003/api/staff', { headers: { Authorization: `Bearer ${token}` } })
      ])
      setTraditionalDiaries(traditionalRes.data)
      setPaintDiaries(paintRes.data)
      setProjects(projectsRes.data.data || projectsRes.data)
      setStaff(staffRes.data.data || staffRes.data)
    } catch (err) {
      alert('Error fetching data: ' + (err.response?.data?.error || err.message))
      console.error('Error fetching data:', err)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.projectId || !form.workerId) {
      alert('Please select a project and a worker.')
      return
    }
    try {
      const dataToSend = {
        ...form,
        breakMins: form.breakMins ? parseInt(form.breakMins) : undefined,
        revenues: form.revenues ? parseFloat(form.revenues) : undefined
      }
      console.log('Sending data:', dataToSend)
      await axios.post('http://localhost:5003/api/diaries', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setForm({ date: '', projectId: '', workerId: '', start: '', finish: '', breakMins: '', revenues: '' })
      fetchData()
    } catch (err) {
      alert('Error adding diary entry: ' + (err.response?.data?.error || err.message))
      console.error('Error adding diary entry:', err)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const renderTraditionalDiaries = () => (
    <div>
      <h3>Traditional Diary Entries</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Date</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Project</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Worker</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Hours</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Costs</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Revenues</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Margin %</th>
          </tr>
        </thead>
        <tbody>
          {traditionalDiaries.map(d => (
            <tr key={d.id} style={{ border: '1px solid #dee2e6' }}>
              <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{d.date}</td>
              <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{d.Project?.name}</td>
              <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{d.Staff?.name}</td>
              <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{d.totalHours?.toFixed(2)}</td>
              <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{formatCurrency(d.costs || 0)}</td>
              <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{formatCurrency(d.revenues || 0)}</td>
              <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{d.marginPct?.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderPaintDiaries = () => (
    <div>
      <h3>Paint Diary Entries</h3>
      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {paintDiaries.map(diary => (
          <div key={diary.id} style={{
            border: '2px solid #e9ecef',
            borderRadius: '12px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #dee2e6'
            }}>
              <h4 style={{ margin: 0, color: '#495057' }}>
                {diary.date} - {diary.Project?.name || 'Project'}
              </h4>
              <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
                ID: {diary.id}
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                padding: '12px',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {formatCurrency(diary.totalCost || 0)}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Total Cost</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                padding: '12px',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {formatCurrency(diary.totalRevenue || 0)}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Revenue</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                padding: '12px',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {formatCurrency((diary.totalRevenue || 0) - (diary.totalCost || 0))}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Profit</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                padding: '12px',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {diary.productivityScore || 0}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Productivity</div>
              </div>
            </div>

            {/* Entries Summary */}
            <div style={{ marginTop: '16px' }}>
              <h5 style={{ margin: '0 0 12px 0', color: '#495057' }}>
                Entries: {(diary.canvasData || []).length}
              </h5>
              <div style={{ display: 'grid', gap: '8px' }}>
                {(diary.canvasData || []).map((entry, index) => (
                  <div key={index} style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{entry.time}</strong> - {entry.note || 'No notes'}
                      <br />
                      <small style={{ color: '#6c757d' }}>
                        Items: {entry.items?.length || 0} |
                        Photos: {entry.photos?.length || 0} |
                        Voice Notes: {entry.voiceNotes?.length || 0}
                      </small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', color: '#495057' }}>
                        {entry.items?.length ? `${entry.items.length} items` : 'No items'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '24px' }}>Diary Records</h2>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('traditional')}
          style={{
            padding: '12px 24px',
            marginRight: '8px',
            backgroundColor: activeTab === 'traditional' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'traditional' ? 'white' : '#495057',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Traditional Diaries ({traditionalDiaries.length})
        </button>
        <button
          onClick={() => setActiveTab('paint')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'paint' ? '#28a745' : '#f8f9fa',
            color: activeTab === 'paint' ? 'white' : '#495057',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Paint Diaries ({paintDiaries.length})
        </button>
      </div>

      {/* Add New Traditional Diary Entry Form */}
      {activeTab === 'traditional' && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginTop: 0, color: '#495057' }}>Add New Traditional Diary Entry</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              required
              style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">Select Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select
              value={form.workerId}
              onChange={(e) => setForm({ ...form, workerId: e.target.value })}
              required
              style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">Select Worker</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input
              type="time"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
              required
              style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
            <input
              type="time"
              value={form.finish}
              onChange={(e) => setForm({ ...form, finish: e.target.value })}
              required
              style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
            <input
              type="number"
              placeholder="Break Mins"
              value={form.breakMins}
              onChange={(e) => setForm({ ...form, breakMins: e.target.value })}
              style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Revenues (optional)"
              value={form.revenues}
              onChange={(e) => setForm({ ...form, revenues: e.target.value })}
              style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Add Diary Entry
            </button>
          </form>
        </div>
      )}

      {/* Display Content Based on Active Tab */}
      {activeTab === 'traditional' ? renderTraditionalDiaries() : renderPaintDiaries()}
    </div>
  )
}

export default Diaries
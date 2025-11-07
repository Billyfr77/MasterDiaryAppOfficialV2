import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { api } from '../utils/api'

const Diary = () => {
  const [projects, setProjects] = useState([])
  const [staff, setStaff] = useState([])
  const [equipment, setEquipment] = useState([])
  const [diaries, setDiaries] = useState([])
  const [filteredDiaries, setFilteredDiaries] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [form, setForm] = useState({
    date: new Date(),
    projectId: '',
    workerId: '',
    equipmentId: '',
    start: null,
    finish: null,
    breakMins: '',
    revenues: ''
  })
  const [preview, setPreview] = useState({ totalHours: 0, costs: 0, equipmentCosts: 0, totalCosts: 0, revenues: 0, marginPct: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [filters, setFilters] = useState({
    search: '',
    minMargin: '',
    maxMargin: '',
    workerFilter: '',
    projectFilter: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [diariesRes, projectsRes, staffRes, equipmentRes] = await Promise.all([
        api.get('/diaries'),
        api.get('/projects'),
        api.get('/staff'),
        api.get('/equipment')
      ])
      setDiaries(diariesRes.data)
      setProjects(projectsRes.data.data || projectsRes.data)
      setStaff(staffRes.data.data || staffRes.data)
      setEquipment(equipmentRes.data.data || equipmentRes.data)
    } catch (err) {
      setError('Error fetching data: ' + (err.response?.data?.error || err.message))
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
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
    if (form.equipmentId) {
      const eq = equipment.find(e => e.id === form.equipmentId)
      setSelectedEquipment(eq)
    } else {
      setSelectedEquipment(null)
    }
  }, [form.equipmentId, equipment])

  useEffect(() => {
    calculatePreview()
  }, [form.start, form.finish, form.breakMins, selectedStaff, selectedEquipment])

  useEffect(() => {
    applyFiltersAndSort()
  }, [diaries, filters, sortConfig])

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

    const staffCosts = ordinaryHours * selectedStaff.payRateBase +
                       ot1Hours * (selectedStaff.payRateOT1 || selectedStaff.payRateBase) +
                       ot2Hours * (selectedStaff.payRateOT2 || selectedStaff.payRateBase)

    let equipmentCosts = 0
    if (selectedEquipment) {
      equipmentCosts = ordinaryHours * selectedEquipment.costRateBase +
                       ot1Hours * (selectedEquipment.costRateOT1 || selectedEquipment.costRateBase) +
                       ot2Hours * (selectedEquipment.costRateOT2 || selectedEquipment.costRateBase)
    }

    const totalCosts = staffCosts + equipmentCosts

    const revenues = ordinaryHours * selectedStaff.chargeOutBase +
                      ot1Hours * (selectedStaff.chargeOutOT1 || selectedStaff.chargeOutBase) +
                      ot2Hours * (selectedStaff.chargeOutOT2 || selectedStaff.chargeOutBase)

    const marginPct = revenues > 0 ? ((revenues - totalCosts) / revenues) * 100 : 0

    setPreview({
      totalHours: totalHours.toFixed(2),
      costs: staffCosts.toFixed(2),
      equipmentCosts: equipmentCosts.toFixed(2),
      totalCosts: totalCosts.toFixed(2),
      revenues: revenues.toFixed(2),
      marginPct: marginPct.toFixed(2)
    })
  }

  const applyFiltersAndSort = () => {
    let filtered = [...diaries]

    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(d =>
        d.Project?.name?.toLowerCase().includes(searchLower) ||
        d.Staff?.name?.toLowerCase().includes(searchLower) ||
        d.Equipment?.name?.toLowerCase().includes(searchLower)
      )
    }

    // Margin filter
    if (filters.minMargin) {
      filtered = filtered.filter(d => parseFloat(d.marginPct) >= parseFloat(filters.minMargin))
    }
    if (filters.maxMargin) {
      filtered = filtered.filter(d => parseFloat(d.marginPct) <= parseFloat(filters.maxMargin))
    }

    // Worker filter
    if (filters.workerFilter) {
      filtered = filtered.filter(d => d.workerId === filters.workerFilter)
    }

    // Project filter
    if (filters.projectFilter) {
      filtered = filtered.filter(d => d.projectId === filters.projectFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      if (sortConfig.key === 'Project') aValue = a.Project?.name || ''
      if (sortConfig.key === 'Staff') aValue = a.Staff?.name || ''
      if (sortConfig.key === 'Equipment') aValue = a.Equipment?.name || ''

      if (sortConfig.key === 'date') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      } else {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredDiaries(filtered)
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleEdit = (diary) => {
    setForm({
      date: new Date(diary.date),
      projectId: diary.projectId,
      workerId: diary.workerId,
      equipmentId: diary.equipmentId || '',
      start: new Date(`1970-01-01T${diary.start}:00`),
      finish: new Date(`1970-01-01T${diary.finish}:00`),
      breakMins: diary.breakMins,
      revenues: diary.revenues
    })
    setIsEditing(true)
    setEditingId(diary.id)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this diary entry?')) {
      try {
        await api.delete(`/diaries/${id}`)
        fetchData()
        alert('Diary entry deleted successfully')
      } catch (err) {
        setError('Error deleting diary entry: ' + (err.response?.data?.error || err.message))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.start || !form.finish) {
      setError('Please select start and finish times.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const dataToSend = {
        date: form.date.toISOString().split('T')[0],
        projectId: form.projectId,
        workerId: form.workerId,
        equipmentId: form.equipmentId || undefined,
        start: form.start.toTimeString().split(' ')[0].slice(0, 5),
        finish: form.finish.toTimeString().split(' ')[0].slice(0, 5),
        breakMins: form.breakMins ? parseInt(form.breakMins) : undefined,
        revenues: form.revenues ? parseFloat(form.revenues) : undefined
      }
      if (isEditing) {
        await api.put(`/diaries/${editingId}`, dataToSend)
        alert('Diary entry updated successfully!')
      } else {
        await api.post('/diaries', dataToSend)
        alert('Diary entry added successfully!')
      }
      // Reset form
      setForm({
        date: new Date(),
        projectId: '',
        workerId: '',
        equipmentId: '',
        start: null,
        finish: null,
        breakMins: '',
        revenues: ''
      })
      setPreview({ totalHours: 0, costs: 0, equipmentCosts: 0, totalCosts: 0, revenues: 0, marginPct: 0 })
      setIsEditing(false)
      setEditingId(null)
      fetchData() // Refresh the list
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      <h2>{isEditing ? 'Edit Diary Entry' : 'Add New Diary Entry'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
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
            <label>Equipment (optional):</label>
            <select value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}>
              <option value="">Select Equipment</option>
              {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
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
        </div>
        <button type="submit" style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {isEditing ? 'Update Diary Entry' : 'Add Diary Entry'}
        </button>
      </form>

      <h3>Preview</h3>
      <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
        <p>Total Hours: {preview.totalHours}</p>
        <p>Staff Costs: ${preview.costs}</p>
        <p>Equipment Costs: ${preview.equipmentCosts}</p>
        <p>Total Costs: ${preview.totalCosts}</p>
        <p>Revenues: ${preview.revenues}</p>
        <p>Margin %: {preview.marginPct}%</p>
      </div>

      <h3>Recent Diary Entries</h3>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Project, Worker, or Equipment"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ padding: '8px', width: '200px' }}
          />
        </div>
        <div>
          <label>Min Margin %:</label>
          <input
            type="number"
            value={filters.minMargin}
            onChange={(e) => setFilters({ ...filters, minMargin: e.target.value })}
            style={{ padding: '8px', width: '100px' }}
          />
        </div>
        <div>
          <label>Max Margin %:</label>
          <input
            type="number"
            value={filters.maxMargin}
            onChange={(e) => setFilters({ ...filters, maxMargin: e.target.value })}
            style={{ padding: '8px', width: '100px' }}
          />
        </div>
        <div>
          <label>Filter by Worker:</label>
          <select value={filters.workerFilter} onChange={(e) => setFilters({ ...filters, workerFilter: e.target.value })}>
            <option value="">All Workers</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label>Filter by Project:</label>
          <select value={filters.projectFilter} onChange={(e) => setFilters({ ...filters, projectFilter: e.target.value })}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('date')}>
              Date {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('Project')}>
              Project {sortConfig.key === 'Project' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('Staff')}>
              Worker {sortConfig.key === 'Staff' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('Equipment')}>
              Equipment {sortConfig.key === 'Equipment' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('totalHours')}>
              Hours {sortConfig.key === 'totalHours' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('costs')}>
              Total Costs {sortConfig.key === 'costs' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('revenues')}>
              Revenues {sortConfig.key === 'revenues' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('marginPct')}>
              Margin % {sortConfig.key === 'marginPct' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDiaries.slice(0, 20).map(d => (
            <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{d.date}</td>
              <td style={{ padding: '8px' }}>{d.Project?.name}</td>
              <td style={{ padding: '8px' }}>{d.Staff?.name}</td>
              <td style={{ padding: '8px' }}>{d.Equipment?.name || '-'}</td>
              <td style={{ padding: '8px' }}>{d.totalHours}</td>
              <td style={{ padding: '8px' }}>${d.costs}</td>
              <td style={{ padding: '8px' }}>${d.revenues}</td>
              <td style={{ padding: '8px' }}>{d.marginPct}%</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => handleEdit(d)}>Edit</button>
                <button onClick={() => handleDelete(d.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
          padding: 5px 10px;
          background-color: #007bff;
          color: white;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
        @media (max-width: 600px) {
          table {
            font-size: 12px;
          }
          div[style*="display: grid"] {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Diary
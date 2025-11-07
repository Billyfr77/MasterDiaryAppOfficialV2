import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Diaries = ({ token }) => {
  const [diaries, setDiaries] = useState([])
  const [projects, setProjects] = useState([])
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({
    date: '', projectId: '', workerId: '', start: '', finish: '', breakMins: '', revenues: ''
  })

  const fetchData = async () => {
    try {
      const [diariesRes, projectsRes, staffRes] = await Promise.all([
        axios.get('http://localhost:5000/api/diaries', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/projects', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/staff', { headers: { Authorization: `Bearer ${token}` } })
      ])
      setDiaries(diariesRes.data)
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
      await axios.post('http://localhost:5000/api/diaries', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setForm({ date: '', projectId: '', workerId: '', start: '', finish: '', breakMins: '', revenues: '' })
      fetchData()
    } catch (err) {
      alert('Error adding diary entry: ' + (err.response?.data?.error || err.message))
      console.error('Error adding diary entry:', err)
    }
  }

  return (
    <div>
      <h2>Diaries</h2>
      <form onSubmit={handleSubmit}>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
          <option value="">Select Project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={form.workerId} onChange={(e) => setForm({ ...form, workerId: e.target.value })} required>
          <option value="">Select Worker</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} required />
        <input type="time" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} required />
        <input type="number" placeholder="Break Mins" value={form.breakMins} onChange={(e) => setForm({ ...form, breakMins: e.target.value })} />
        <input type="number" step="0.01" placeholder="Revenues (optional)" value={form.revenues} onChange={(e) => setForm({ ...form, revenues: e.target.value })} />
        <button type="submit">Add Diary Entry</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Project</th><th>Worker</th><th>Hours</th><th>Costs</th><th>Revenues</th><th>Margin %</th>
          </tr>
        </thead>
        <tbody>
          {diaries.map(d => (
            <tr key={d.id}>
              <td>{d.date}</td>
              <td>{d.Project?.name}</td>
              <td>{d.Staff?.name}</td>
              <td>{d.totalHours}</td>
              <td>${d.costs}</td>
              <td>${d.revenues}</td>
              <td>{d.marginPct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Diaries
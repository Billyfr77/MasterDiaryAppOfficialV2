import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { api } from '../utils/api'
import jsPDF from 'jspdf'

const Reports = () => {
  const [projects, setProjects] = useState([])
  const [diaries, setDiaries] = useState([])
  const [filteredDiaries, setFilteredDiaries] = useState([])
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    projectId: ''
  })
  const [summary, setSummary] = useState({
    totalHours: 0,
    totalCosts: 0,
    totalRevenues: 0,
    totalMargin: 0,
    avgMarginPct: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [diaries, filters])

  const fetchData = async () => {
    try {
      const [diariesRes, projectsRes] = await Promise.all([
        api.get('/diaries'),
        api.get('/projects')
      ])
      setDiaries(diariesRes.data)
      setProjects(projectsRes.data.data || projectsRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const applyFilters = () => {
    let filtered = diaries

    if (filters.startDate) {
      filtered = filtered.filter(d => new Date(d.date) >= filters.startDate)
    }
    if (filters.endDate) {
      filtered = filtered.filter(d => new Date(d.date) <= filters.endDate)
    }
    if (filters.projectId) {
      filtered = filtered.filter(d => d.projectId === filters.projectId)
    }

    setFilteredDiaries(filtered)
    calculateSummary(filtered)
  }

  const calculateSummary = (list) => {
    const totalHours = list.reduce((sum, d) => sum + parseFloat(d.totalHours || 0), 0)
    const totalCosts = list.reduce((sum, d) => sum + parseFloat(d.costs || 0), 0)
    const totalRevenues = list.reduce((sum, d) => sum + parseFloat(d.revenues || 0), 0)
    const totalMargin = totalRevenues - totalCosts
    const avgMarginPct = totalRevenues > 0 ? (totalMargin / totalRevenues) * 100 : 0

    setSummary({
      totalHours: totalHours.toFixed(2),
      totalCosts: totalCosts.toFixed(2),
      totalRevenues: totalRevenues.toFixed(2),
      totalMargin: totalMargin.toFixed(2),
      avgMarginPct: avgMarginPct.toFixed(2)
    })
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Diary Report', 14, 20)

    // Summary
    doc.text(`Total Hours: ${summary.totalHours}`, 14, 30)
    doc.text(`Total Costs: $${summary.totalCosts}`, 14, 40)
    doc.text(`Total Revenues: $${summary.totalRevenues}`, 14, 50)
    doc.text(`Total Margin: $${summary.totalMargin}`, 14, 60)
    doc.text(`Average Margin %: ${summary.avgMarginPct}%`, 14, 70)

    // Simple table as text
    let y = 80
    filteredDiaries.forEach((d, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(`${d.date} | ${d.Project?.name || ''} | ${d.Staff?.name || ''} | ${d.Equipment?.name || '-'} | ${d.totalHours} | $${d.costs} | $${d.revenues} | ${d.marginPct}%`, 14, y)
      y += 10
    })

    doc.save('diary_report.pdf')
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2>Reports</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>Filters</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <label>Start Date:</label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => setFilters({ ...filters, startDate: date })}
              dateFormat="yyyy-MM-dd"
              isClearable
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label>End Date:</label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => setFilters({ ...filters, endDate: date })}
              dateFormat="yyyy-MM-dd"
              isClearable
              placeholderText="Select end date"
            />
          </div>
          <div>
            <label>Project:</label>
            <select value={filters.projectId} onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Summary</h3>
        <p>Total Hours: {summary.totalHours}</p>
        <p>Total Costs: ${summary.totalCosts}</p>
        <p>Total Revenues: ${summary.totalRevenues}</p>
        <p>Total Margin: ${summary.totalMargin}</p>
        <p>Average Margin %: {summary.avgMarginPct}%</p>
      </div>

      <button onClick={exportToPDF} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '20px' }}>
        Export to PDF
      </button>

      <h3>Diary Entries ({filteredDiaries.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Worker</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Equipment</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Hours</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Costs</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Revenues</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Margin %</th>
          </tr>
        </thead>
        <tbody>
          {filteredDiaries.map(d => (
            <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{d.date}</td>
              <td style={{ padding: '8px' }}>{d.Project?.name}</td>
              <td style={{ padding: '8px' }}>{d.Staff?.name}</td>
              <td style={{ padding: '8px' }}>{d.Equipment?.name || '-'}</td>
              <td style={{ padding: '8px' }}>{d.totalHours}</td>
              <td style={{ padding: '8px' }}>${d.costs}</td>
              <td style={{ padding: '8px' }}>${d.revenues}</td>
              <td style={{ padding: '8px' }}>{d.marginPct}%</td>
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
        button:hover {
          opacity: 0.8;
        }
        @media (max-width: 600px) {
          table {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}

export default Reports
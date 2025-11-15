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

  const formStyle = {
    marginBottom: '15px'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '5px'
  }

  const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box'
  }

  const selectStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box'
  }

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '20px'
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  }

  const thStyle = {
    padding: '8px',
    textAlign: 'left',
    borderBottom: '1px solid #ccc'
  }

  const tdStyle = {
    padding: '8px',
    borderBottom: '1px solid #eee'
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2>Reports</h2>

      <div style={formStyle}>
        <h3>Filters</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Start Date:</label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => setFilters({ ...filters, startDate: date })}
              dateFormat="yyyy-MM-dd"
              isClearable
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label style={labelStyle}>End Date:</label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => setFilters({ ...filters, endDate: date })}
              dateFormat="yyyy-MM-dd"
              isClearable
              placeholderText="Select end date"
            />
          </div>
          <div>
            <label style={labelStyle}>Project:</label>
            <select
              value={filters.projectId}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              style={selectStyle}
            >
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={formStyle}>
        <h3>Summary</h3>
        <p>Total Hours: {summary.totalHours}</p>
        <p>Total Costs: ${summary.totalCosts}</p>
        <p>Total Revenues: ${summary.totalRevenues}</p>
        <p>Total Margin: ${summary.totalMargin}</p>
        <p>Average Margin %: {summary.avgMarginPct}%</p>
      </div>

      <button
        onClick={exportToPDF}
        style={buttonStyle}
        onMouseOver={(e) => e.target.style.opacity = '0.8'}
        onMouseOut={(e) => e.target.style.opacity = '1'}
      >
        Export to PDF
      </button>

      <h3>Diary Entries ({filteredDiaries.length})</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Project</th>
            <th style={thStyle}>Worker</th>
            <th style={thStyle}>Equipment</th>
            <th style={thStyle}>Hours</th>
            <th style={thStyle}>Costs</th>
            <th style={thStyle}>Revenues</th>
            <th style={thStyle}>Margin %</th>
          </tr>
        </thead>
        <tbody>
          {filteredDiaries.map(d => (
            <tr key={d.id}>
              <td style={tdStyle}>{d.date}</td>
              <td style={tdStyle}>{d.Project?.name}</td>
              <td style={tdStyle}>{d.Staff?.name}</td>
              <td style={tdStyle}>{d.Equipment?.name || '-'}</td>
              <td style={tdStyle}>{d.totalHours}</td>
              <td style={tdStyle}>${d.costs}</td>
              <td style={tdStyle}>${d.revenues}</td>
              <td style={tdStyle}>{d.marginPct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Reports

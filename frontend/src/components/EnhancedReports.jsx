/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { api } from '../utils/api'
import jsPDF from 'jspdf'
import { FileText, Download, Sparkles, Volume2, VolumeX, BarChart3, Calendar } from 'lucide-react'

const Confetti = ({ show }) => {
  if (!show) return null
  const particles = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="fixed w-2.5 h-2.5 z-[9999] animate-[confetti_2s_ease-in-out_forwards]"
      style={{
        left: `${Math.random() * 100}%`,
        top: '-10px',
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
      }}
    />
  ))
  return <div>{particles}</div>
}

const Particles = ({ show }) => {
  if (!show) return null
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="absolute w-1 h-1 rounded-full bg-primary animate-[particle_1s_ease-out_forwards] z-10"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ))
  return <div className="absolute inset-0 pointer-events-none">{particles}</div>
}

const SoundToggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className="fixed top-5 right-5 bg-white/10 border border-white/30 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-[1000] backdrop-blur-md transition-all hover:bg-white/20"
    aria-label={enabled ? 'Disable sound' : 'Enable sound'}
  >
    {enabled ? <Volume2 size={20} className="text-white" /> : <VolumeX size={20} className="text-white" />}
  </button>
)

const EnhancedReports = () => {
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
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [diaries, filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [diariesRes, projectsRes] = await Promise.all([
        api.get('/diaries'),
        api.get('/projects')
      ])
      setDiaries(diariesRes.data)
      setProjects(projectsRes.data.data || projectsRes.data)
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 2000)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
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
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-dark text-white font-sans bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <span className="text-xl font-bold">Loading Strategic Reports...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white relative font-sans p-8 overflow-hidden animate-fade-in">
      
      <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />

      <Particles show={showParticles} />

      <div className="flex items-center gap-2 mb-8 pb-4 border-b border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-secondary to-pink-400 animate-pulse opacity-50"></div>
        <Sparkles size={32} className="text-primary drop-shadow-[0_0_10px_rgba(102,126,234,0.8)]" />
        <h2 className="m-0 text-white font-bold text-4xl drop-shadow-lg animate-float">
          Strategic Reports
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        {/* Filters and Summary */}
        <div className="space-y-6">
          <div className="glass-panel p-6 shadow-2xl animate-float">
            <h3 className="mb-6 text-white font-bold text-2xl text-center drop-shadow-lg flex items-center justify-center gap-2">
              <Calendar size={24} />
              Filters
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-300 font-sans block mb-1 text-sm opacity-80">Start Date:</label>
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) => setFilters({ ...filters, startDate: date })}
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Select start date"
                  className="glass-input w-full p-2 rounded-lg text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-300 font-sans block mb-1 text-sm opacity-80">End Date:</label>
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => setFilters({ ...filters, endDate: date })}
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Select end date"
                  className="glass-input w-full p-2 rounded-lg text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-300 font-sans block mb-1 text-sm opacity-80">Project:</label>
                <select
                  value={filters.projectId}
                  onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                  className="glass-input w-full p-2 rounded-lg text-white focus:outline-none"
                >
                  <option value="" className="bg-slate-800 text-white">All Projects</option>
                  {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-800 text-white">{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 shadow-2xl animate-[float_3s_ease-in-out_infinite_reverse]">
            <h3 className="mb-6 text-white font-bold text-2xl text-center drop-shadow-lg flex items-center justify-center gap-2">
              <BarChart3 size={24} />
              Summary
            </h3>
            <div className="text-white font-sans space-y-2">
              <p className="flex justify-between border-b border-white/5 pb-1"><span>Total Hours:</span> <strong>{summary.totalHours}</strong></p>
              <p className="flex justify-between border-b border-white/5 pb-1"><span>Total Costs:</span> <strong>${summary.totalCosts}</strong></p>
              <p className="flex justify-between border-b border-white/5 pb-1"><span>Total Revenues:</span> <strong>${summary.totalRevenues}</strong></p>
              <p className="flex justify-between border-b border-white/5 pb-1"><span>Total Margin:</span> <strong className="text-success">${summary.totalMargin}</strong></p>
              <p className="flex justify-between"><span>Average Margin %:</span> <strong className="text-warning">{summary.avgMarginPct}%</strong></p>
            </div>
            <button
              onClick={exportToPDF}
              className="w-full mt-6 py-3 bg-gradient-to-r from-success to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-success/30 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 hover:shadow-xl border border-white/10"
            >
              <Download size={18} />
              Export to PDF
            </button>
          </div>
        </div>

        {/* Diary Entries Table */}
        <div className="glass-panel p-6 shadow-2xl animate-float h-fit">
          <h3 className="mb-6 text-white font-bold text-2xl text-center drop-shadow-lg flex items-center justify-center gap-2">
            <FileText size={24} />
            Diary Entries ({filteredDiaries.length})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full border-collapse text-white font-sans">
              <thead>
                <tr className="bg-white/5 text-left">
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Project</th>
                  <th className="p-3 font-semibold">Worker</th>
                  <th className="p-3 font-semibold">Equipment</th>
                  <th className="p-3 font-semibold">Hours</th>
                  <th className="p-3 font-semibold">Costs</th>
                  <th className="p-3 font-semibold">Revenues</th>
                  <th className="p-3 font-semibold">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiaries.map(d => (
                  <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3">{d.date}</td>
                    <td className="p-3">{d.Project?.name}</td>
                    <td className="p-3">{d.Staff?.name}</td>
                    <td className="p-3">{d.Equipment?.name || '-'}</td>
                    <td className="p-3">{d.totalHours}</td>
                    <td className="p-3">${d.costs}</td>
                    <td className="p-3">${d.revenues}</td>
                    <td className="p-3">{d.marginPct}%</td>
                  </tr>
                ))}
                {filteredDiaries.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400 italic">
                      No entries found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Confetti show={showConfetti} />
    </div>
  )
}

export default EnhancedReports
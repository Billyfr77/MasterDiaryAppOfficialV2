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
import { FileText, Download, Sparkles, Volume2, VolumeX, BarChart3, Calendar, Folder } from 'lucide-react'

const Confetti = ({ show }) => {
  if (!show) return null
  const particles = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      style={{
        position: 'fixed',
        left: `${Math.random() * 100}%`,
        top: '-10px',
        width: '10px',
        height: '10px',
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
        animation: `confetti ${2 + Math.random() * 2}s ease-in-out forwards`,
        zIndex: 9999,
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
      style={{
        position: 'absolute',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: '4px',
        height: '4px',
        backgroundColor: '#667eea',
        borderRadius: '50%',
        animation: `particle ${1 + Math.random() * 1}s ease-out forwards`,
        zIndex: 10,
      }}
    />
  ))
  return <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>{particles}</div>
}

const SoundToggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease'
    }}
    aria-label={enabled ? 'Disable sound' : 'Enable sound'}
  >
    {enabled ? <Volume2 size={20} color="white" /> : <VolumeX size={20} color="white" />}
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
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(102, 126, 234, 0.3)',
          borderTop: '5px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 'var(--spacing-md)'
        }}></div>
        <span style={{ fontSize: '1.2em', fontFamily: "'Poppins', sans-serif" }}>Loading Strategic Reports...</span>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      position: 'relative',
      fontFamily: "'Inter', sans-serif",
      padding: 'var(--spacing-xl)',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes particle {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow {
          from { box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); }
          to { box-shadow: 0 0 40px rgba(102, 126, 234, 1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Parallax Layers */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80) no-repeat center center',
        backgroundSize: 'cover',
        opacity: 0.05,
        zIndex: -2,
        transform: 'translateZ(-1px) scale(1.1)',
        animation: 'parallax 20s ease-in-out infinite alternate'
      }}></div>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
        zIndex: -1,
        animation: 'lighting 10s ease-in-out infinite alternate'
      }}></div>

      <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />

      <Particles show={showParticles} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-xl)',
        paddingBottom: 'var(--spacing-md)',
        borderBottom: '2px solid #667eea',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
          animation: 'glow 2s ease-in-out infinite alternate'
        }}></div>
        <Sparkles size={32} color="#667eea" style={{ filter: 'drop-shadow(0 0 10px #667eea)' }} />
        <h2 style={{
          margin: 0,
          color: '#ffffff',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
          fontSize: '2.5em',
          animation: 'float 3s ease-in-out infinite'
        }}>
          Strategic Reports
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: 'var(--spacing-xl)'
      }}>
        {/* Filters and Summary */}
        <div>
          <div style={{
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '25px',
            padding: 'var(--spacing-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(102, 126, 234, 0.2)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 126, 234, 0.5)',
            animation: 'float 3s ease-in-out infinite',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <h3 style={{
              margin: '0 0 var(--spacing-lg) 0',
              color: 'white',
              fontFamily: "'Poppins', sans-serif",
              textAlign: 'center',
              fontSize: '1.5em',
              textShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}>
              <Calendar size={24} />
              Filters
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{ color: 'white', fontFamily: "'Inter', sans-serif", display: 'block', marginBottom: 'var(--spacing-xs)' }}>Start Date:</label>
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) => setFilters({ ...filters, startDate: date })}
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Select start date"
                  className="date-picker"
                  style={{
                    padding: 'var(--spacing-sm)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontFamily: "'Inter', sans-serif",
                    backdropFilter: 'blur(10px)',
                    width: '100%'
                  }}
                />
              </div>
              <div>
                <label style={{ color: 'white', fontFamily: "'Inter', sans-serif", display: 'block', marginBottom: 'var(--spacing-xs)' }}>End Date:</label>
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => setFilters({ ...filters, endDate: date })}
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Select end date"
                  className="date-picker"
                  style={{
                    padding: 'var(--spacing-sm)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontFamily: "'Inter', sans-serif",
                    backdropFilter: 'blur(10px)',
                    width: '100%'
                  }}
                />
              </div>
              <div>
                <label style={{ color: 'white', fontFamily: "'Inter', sans-serif", display: 'block', marginBottom: 'var(--spacing-xs)' }}>Project:</label>
                <select
                  value={filters.projectId}
                  onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                  style={{
                    padding: 'var(--spacing-sm)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontFamily: "'Inter', sans-serif",
                    backdropFilter: 'blur(10px)',
                    width: '100%'
                  }}
                >
                  <option value="" style={{ background: '#1a1a2e', color: 'white' }}>All Projects</option>
                  {projects.map(p => <option key={p.id} value={p.id} style={{ background: '#1a1a2e', color: 'white' }}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '25px',
            padding: 'var(--spacing-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(102, 126, 234, 0.2)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 126, 234, 0.5)',
            animation: 'float 3s ease-in-out infinite reverse'
          }}>
            <h3 style={{
              margin: '0 0 var(--spacing-lg) 0',
              color: 'white',
              fontFamily: "'Poppins', sans-serif",
              textAlign: 'center',
              fontSize: '1.5em',
              textShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center'
            }}>
              <BarChart3 size={24} />
              Summary
            </h3>
            <div style={{ color: 'white', fontFamily: "'Inter', sans-serif" }}>
              <p>Total Hours: <strong>{summary.totalHours}</strong></p>
              <p>Total Costs: <strong>${summary.totalCosts}</strong></p>
              <p>Total Revenues: <strong>${summary.totalRevenues}</strong></p>
              <p>Total Margin: <strong>${summary.totalMargin}</strong></p>
              <p>Average Margin %: <strong>{summary.avgMarginPct}%</strong></p>
            </div>
            <button
              onClick={exportToPDF}
              style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)',
                fontFamily: "'Poppins', sans-serif",
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-md)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(40, 167, 69, 0.3)'
              }}
            >
              <Download size={16} />
              Export to PDF
            </button>
          </div>
        </div>

        {/* Diary Entries Table */}
        <div style={{
          background: 'rgba(26, 26, 46, 0.95)',
          borderRadius: '25px',
          padding: 'var(--spacing-lg)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(102, 126, 234, 0.2)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(102, 126, 234, 0.5)',
          animation: 'float 3s ease-in-out infinite'
        }}>
          <h3 style={{
            margin: '0 0 var(--spacing-lg) 0',
            color: 'white',
            fontFamily: "'Poppins', sans-serif",
            textAlign: 'center',
            fontSize: '1.5em',
            textShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            justifyContent: 'center'
          }}>
            <FileText size={24} />
            Diary Entries ({filteredDiaries.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: 'white',
              fontFamily: "'Inter', sans-serif"
            }}>
              <thead>
                <tr style={{ background: 'rgba(102, 126, 234, 0.2)' }}>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Project</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Worker</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Equipment</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Hours</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Costs</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Revenues</th>
                  <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left' }}>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiaries.map(d => (
                  <tr key={d.id} style={{
                    borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: 'var(--spacing-sm)' }}>{d.date}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{d.Project?.name}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{d.Staff?.name}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{d.Equipment?.name || '-'}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{d.totalHours}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>${d.costs}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>${d.revenues}</td>
                    <td style={{ padding: 'var(--spacing-sm)' }}>{d.marginPct}%</td>
                  </tr>
                ))}
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
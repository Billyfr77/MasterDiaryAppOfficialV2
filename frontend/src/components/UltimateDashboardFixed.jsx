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
 */import React, { useState, useEffect, useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import * as d3 from 'd3'
import { api } from '../utils/api'
import { io } from 'socket.io-client'
import {
  TrendingUp, TrendingDown, DollarSign, Clock, BarChart3, Sparkles, Volume2, VolumeX,
  Zap, Target, AlertTriangle, CheckCircle, Activity, Users, Wrench, Calendar,
  Settings, Download, RefreshCw, Maximize2, Minimize2, Grid, Layers, Brain,
  Eye, EyeOff, Filter, Search, ChevronDown, ChevronUp, Star, Award,
  Mail, Calendar as CalendarIcon, Clock as ClockIcon, Save, FileText
} from 'lucide-react'
import AISuggestionsEnhanced from './AISuggestionsEnhanced'
import PredictiveAnalytics from './PredictiveAnalytics'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

const UltimateDashboardFixed = () => {
  const [data, setData] = useState({
    diaries: [],
    projects: [],
    staff: [],
    equipment: []
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [socketConnected, setSocketConnected] = useState(false)
  const [widgets, setWidgets] = useState({
    kpi: { visible: true, size: 'large' },
    charts: { visible: true, size: 'large' },
    activities: { visible: true, size: 'medium' },
    insights: { visible: true, size: 'medium' },
    predictive: { visible: true, size: 'large' },
    heatmap: { visible: true, size: 'medium' }
  })
  const [layoutMode, setLayoutMode] = useState(false)
  const [filters, setFilters] = useState({
    dateRange: '7d',
    project: 'all',
    staff: 'all'
  })
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [pricingReviewOpen, setPricingReviewOpen] = useState(false)
  const [reportSchedule, setReportSchedule] = useState({
    frequency: 'weekly',
    time: '09:00',
    email: '',
    format: 'pdf'
  })
  const socketRef = useRef(null)
  const heatmapRef = useRef(null)

  // WebSocket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    })

    socketRef.current.on('connect', () => {
      setSocketConnected(true)
      console.log('Dashboard connected to real-time updates')
    })

    socketRef.current.on('disconnect', () => {
      setSocketConnected(false)
      console.log('Dashboard disconnected from real-time updates')
    })

    socketRef.current.on('data-update', (updateData) => {
      setData(prevData => ({ ...prevData, ...updateData }))
      setLastUpdate(new Date())
      if (soundEnabled) {
        const audio = new Audio('/notification.mp3')
        audio.play().catch(e => console.log('Audio play failed:', e))
      }
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [soundEnabled])

  // Initial data fetch
  const fetchData = async () => {
    setLoading(true)
    try {
      const [diariesRes, projectsRes, staffRes, equipmentRes] = await Promise.all([
        api.get('/diaries'),
        api.get('/projects'),
        api.get('/staff'),
        api.get('/equipment')
      ])

      const newData = {
        diaries: diariesRes.data,
        projects: projectsRes.data.data || projectsRes.data,
        staff: staffRes.data.data || staffRes.data,
        equipment: equipmentRes.data.data || equipmentRes.data
      }

      setData(newData)
      setLastUpdate(new Date())

      if (socketRef.current) {
        socketRef.current.emit('dashboard-data', newData)
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Advanced metrics calculation
  const metrics = React.useMemo(() => {
    const { diaries, projects, staff, equipment } = data

    const totalHours = diaries.reduce((sum, d) => sum + parseFloat(d.totalHours || 0), 0)
    const totalCosts = diaries.reduce((sum, d) => sum + parseFloat(d.costs || 0), 0)
    const totalRevenues = diaries.reduce((sum, d) => sum + parseFloat(d.revenues || 0), 0)
    const totalMargin = totalRevenues - totalCosts
    const avgMargin = diaries.length > 0 ? diaries.reduce((sum, d) => sum + parseFloat(d.marginPct || 0), 0) / diaries.length : 0

    const laborEfficiency = totalHours > 0 ? (totalRevenues / totalHours).toFixed(2) : 0
    const projectCount = projects.length
    const activeProjects = projects.filter(p => diaries.some(d => d.projectId === p.id)).length
    const staffUtilization = staff.length > 0 ? ((diaries.length / staff.length) * 100).toFixed(1) : 0

    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    const recentDiaries = diaries.filter(d => new Date(d.date) >= lastWeek)
    const weeklyGrowth = recentDiaries.length > 0 ? ((recentDiaries.reduce((sum, d) => sum + parseFloat(d.revenues || 0), 0) / 7)).toFixed(2) : 0

    return {
      totalHours,
      totalCosts,
      totalRevenues,
      totalMargin,
      avgMargin,
      laborEfficiency,
      projectCount,
      activeProjects,
      staffUtilization,
      weeklyGrowth,
      diaryCount: diaries.length,
      staffCount: staff.length,
      equipmentCount: equipment.length
    }
  }, [data])

  // Fixed D3.js Heatmap
  useEffect(() => {
    if (heatmapRef.current && data.diaries.length > 0) {
      createHeatmap()
    }
  }, [data.diaries, filters])

  const createHeatmap = () => {
    try {
      const svg = d3.select(heatmapRef.current)
      svg.selectAll("*").remove()

      const margin = { top: 20, right: 20, bottom: 60, left: 60 }
      const width = 600 - margin.left - margin.right
      const height = 300 - margin.top - margin.bottom

      // Process data safely
      if (!data.diaries || data.diaries.length === 0) return

      const heatmapData = d3.rollups(
        data.diaries,
        v => ({
          revenue: d3.sum(v, d => parseFloat(d.revenues || 0)),
          count: v.length
        }),
        d => d.Project?.name || 'Unknown',
        d => d.date
      )

      if (!heatmapData || heatmapData.length === 0) return

      const projects = Array.from(new Set(heatmapData.map(d => d[0]))).slice(0, 10)
      const dates = Array.from(new Set(heatmapData.flatMap(d => d[1].map(([date]) => date)))).sort().slice(-14)

      if (projects.length === 0 || dates.length === 0) return

      const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
        .domain([0, d3.max(heatmapData.flatMap(d => d[1].map(([, value]) => value.revenue))) || 1])

      const xScale = d3.scaleBand().domain(dates).range([0, width]).padding(0.1)
      const yScale = d3.scaleBand().domain(projects).range([0, height]).padding(0.1)

      svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)

      // Create cells safely
      projects.forEach(project => {
        dates.forEach(date => {
          const cellData = heatmapData.find(d => d[0] === project)?.[1].find(([d]) => d === date)
          const value = cellData ? cellData[1].revenue : 0

          g.append("rect")
            .attr("x", xScale(date) || 0)
            .attr("y", yScale(project) || 0)
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", value > 0 ? colorScale(value) : "#333")
            .attr("stroke", "#555")
            .attr("stroke-width", 1)
            .on("mouseover", function() {
              d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2)
            })
            .on("mouseout", function() {
              d3.select(this).attr("stroke", "#555").attr("stroke-width", 1)
            })
            .append("title")
            .text(`${project} - ${date}: $${value.toLocaleString()}`)
        })
      })

      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d => new Date(d).toLocaleDateString()))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)")

      g.append("g")
        .call(d3.axisLeft(yScale))

    } catch (error) {
      console.error('Error creating heatmap:', error)
      // Fallback: show a simple message
      const svg = d3.select(heatmapRef.current)
      svg.selectAll("*").remove()
      svg.append("text")
        .attr("x", 300)
        .attr("y", 150)
        .attr("text-anchor", "middle")
        .style("fill", "#666")
        .style("font-family", "Inter")
        .style("font-size", "14px")
        .text("Heatmap data not available")
    }
  }

  // Widget management
  const toggleWidget = (widgetName) => {
    setWidgets(prev => ({
      ...prev,
      [widgetName]: {
        ...prev,
        [widgetName]: {
          ...prev[widgetName],
          visible: !prev[widgetName].visible
        }
      }
    }))
  }

  const resizeWidget = (widgetName, newSize) => {
    setWidgets(prev => ({
      ...prev,
      [widgetName]: {
        ...prev[widgetName],
        size: newSize
      }
    }))
  }

  // Pricing strategy review
  const handlePricingReview = () => {
    setPricingReviewOpen(true)
  }

  const closePricingReview = () => {
    setPricingReviewOpen(false)
  }

  // Report scheduling
  const scheduleReport = async () => {
    try {
      // This would typically send to backend for scheduling
      alert(`Report scheduled!\nFrequency: ${reportSchedule.frequency}\nTime: ${reportSchedule.time}\nFormat: ${reportSchedule.format}`)
      console.log('Report scheduled:', reportSchedule)
    } catch (err) {
      console.error('Error scheduling report:', err)
    }
  }

  // Export functions
  const exportToPDF = () => {
    alert('PDF Export feature - Would generate comprehensive dashboard PDF report')
    console.log('Exporting to PDF...')
  }

  const exportToExcel = () => {
    alert('Excel Export feature - Would generate spreadsheet with all dashboard data')
    console.log('Exporting to Excel...')
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
          width: '60px',
          height: '60px',
          border: '6px solid rgba(102, 126, 234, 0.3)',
          borderTop: '6px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 'var(--spacing-md)'
        }}></div>
        <span style={{ fontSize: '1.4em', fontFamily: "'Poppins', sans-serif" }}>Loading Ultimate Dashboard...</span>
        <div style={{
          marginTop: 'var(--spacing-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          color: socketConnected ? '#4ecdc4' : '#ff6b6b'
        }}>
          <Activity size={16} />
          <span>{socketConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
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
      {/* Enhanced Animations */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes glow { from { box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); } to { box-shadow: 0 0 40px rgba(102, 126, 234, 1); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeInUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes realTimePulse {
          0%, 100% { box-shadow: 0 0 5px rgba(78, 205, 196, 0.5); }
          50% { box-shadow: 0 0 20px rgba(78, 205, 196, 1); }
        }
      `}</style>

      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80) no-repeat center center',
        backgroundSize: 'cover',
        opacity: 0.03,
        zIndex: -2
      }}></div>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%)',
        zIndex: -1
      }}></div>

      {/* Dashboard Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <Sparkles size={32} color="#667eea" style={{ filter: 'drop-shadow(0 0 10px #667eea)' }} />
          <div>
            <h1 style={{
              margin: 0,
              color: '#ffffff',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
              fontSize: '2.5em',
              animation: 'float 3s ease-in-out infinite'
            }}>
              Ultimate Dashboard
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              marginTop: 'var(--spacing-xs)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                color: socketConnected ? '#4ecdc4' : '#ff6b6b',
                fontSize: '0.9em'
              }}>
                <Activity size={14} style={{ animation: socketConnected ? 'realTimePulse 2s infinite' : 'none' }} />
                <span>{socketConnected ? 'LIVE' : 'OFFLINE'}</span>
              </div>
              <span style={{ color: '#ccc', fontSize: '0.9em' }}>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button
            onClick={() => setLayoutMode(!layoutMode)}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: layoutMode ? 'rgba(102, 126, 234, 0.8)' : 'rgba(255,255,255, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              fontSize: '0.9em'
            }}
          >
            <Grid size={16} />
            {layoutMode ? 'Exit Customize' : 'Customize'}
          </button>

          <button
            onClick={fetchData}
            style={{
              padding: 'var(--spacing-sm)',
              background: 'rgba(78, 205, 196, 0.2)',
              border: '1px solid #4ecdc4',
              borderRadius: '50%',
              color: '#4ecdc4',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            color: '#ccc',
            fontSize: '0.9em'
          }}>
            <VolumeX size={16} style={{ cursor: 'pointer' }} onClick={() => setSoundEnabled(!soundEnabled)} />
            <span>Sound {soundEnabled ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        background: 'rgba(26, 26, 46, 0.95)',
        borderRadius: '15px',
        padding: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-xl)',
        display: 'flex',
        gap: 'var(--spacing-md)',
        alignItems: 'center',
        flexWrap: 'wrap',
        border: '1px solid rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          <Filter size={16} color="#667eea" />
          <span style={{ color: 'white', fontWeight: '500' }}>Filters:</span>
        </div>

        <select
          value={filters.dateRange}
          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '6px',
            color: 'white'
          }}
        >
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>

        <select
          value={filters.project}
          onChange={(e) => setFilters({ ...filters, project: e.target.value })}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '6px',
            color: 'white'
          }}
        >
          <option value="all">All Projects</option>
          {data.projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filters.staff}
          onChange={(e) => setFilters({ ...filters, staff: e.target.value })}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '6px',
            color: 'white'
          }}
        >
          <option value="all">All Staff</option>
          {data.staff.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Widgets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        {/* KPI Cards Widget */}
        {widgets.kpi.visible && (
          <div style={{
            gridColumn: widgets.kpi.size === 'large' ? 'span 2' : 'span 1',
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '20px',
            padding: 'var(--spacing-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            position: 'relative',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            {layoutMode && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: 'var(--spacing-xs)',
                zIndex: 10
              }}>
                <button onClick={() => toggleWidget('kpi')} style={{ background: '#ff6b6b', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
                <select
                  value={widgets.kpi.size}
                  onChange={(e) => resizeWidget('kpi', e.target.value)}
                  style={{ fontSize: '12px', padding: '2px' }}
                >
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
              <BarChart3 size={24} color="#667eea" />
              <h3 style={{ margin: 0, color: 'white', fontFamily: "'Poppins', sans-serif" }}>Key Performance Indicators</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
                padding: 'var(--spacing-md)',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}>
                <DollarSign size={32} color="#667eea" style={{ marginBottom: 'var(--spacing-sm)' }} />
                <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#667eea' }}>${metrics.totalRevenues.toLocaleString()}</div>
                <div style={{ color: '#ccc', fontSize: '0.9em' }}>Total Revenue</div>
                <div style={{ color: '#4ecdc4', fontSize: '0.8em', marginTop: 'var(--spacing-xs)' }}>
                  <TrendingUp size={12} style={{ verticalAlign: 'middle' }} />
                  +{metrics.weeklyGrowth}/day avg
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(70, 160, 140, 0.2))',
                padding: 'var(--spacing-md)',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(78, 205, 196, 0.3)'
              }}>
                <Target size={32} color="#4ecdc4" style={{ marginBottom: 'var(--spacing-sm)' }} />
                <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#4ecdc4' }}>{metrics.avgMargin.toFixed(1)}%</div>
                <div style={{ color: '#ccc', fontSize: '0.9em' }}>Avg Margin</div>
                <div style={{ color: metrics.totalMargin >= 0 ? '#4ecdc4' : '#ff6b6b', fontSize: '0.8em', marginTop: 'var(--spacing-xs)' }}>
                  {metrics.totalMargin >= 0 ? <TrendingUp size={12} style={{ verticalAlign: 'middle' }} /> : <TrendingDown size={12} style={{ verticalAlign: 'middle' }} />}
                  ${Math.abs(metrics.totalMargin).toLocaleString()} {metrics.totalMargin >= 0 ? 'profit' : 'loss'}
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 193, 77, 0.2), rgba(255, 160, 0, 0.2))',
                padding: 'var(--spacing-md)',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(255, 193, 77, 0.3)'
              }}>
                <Clock size={32} color="#ffd93d" style={{ marginBottom: 'var(--spacing-sm)' }} />
                <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ffd93d' }}>{metrics.totalHours.toFixed(0)}</div>
                <div style={{ color: '#ccc', fontSize: '0.9em' }}>Total Hours</div>
                <div style={{ color: '#4ecdc4', fontSize: '0.8em', marginTop: 'var(--spacing-xs)' }}>
                  ${metrics.laborEfficiency}/hr efficiency
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(220, 53, 69, 0.2))',
                padding: 'var(--spacing-md)',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(255, 107, 107, 0.3)'
              }}>
                <Users size={32} color="#ff6b6b" style={{ marginBottom: 'var(--spacing-sm)' }} />
                <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ff6b6b' }}>{metrics.staffUtilization}%</div>
                <div style={{ color: '#ccc', fontSize: '0.9em' }}>Staff Utilization</div>
                <div style={{ color: '#ccc', fontSize: '0.8em', marginTop: 'var(--spacing-xs)' }}>
                  {metrics.activeProjects}/{metrics.projectCount} active projects
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Widget */}
        {widgets.charts.visible && (
          <div style={{
            gridColumn: widgets.charts.size === 'large' ? 'span 2' : 'span 1',
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '20px',
            padding: 'var(--spacing-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            position: 'relative',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            {layoutMode && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: 'var(--spacing-xs)',
                zIndex: 10
              }}>
                <button onClick={() => toggleWidget('charts')} style={{ background: '#ff6b6b', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
                <select
                  value={widgets.charts.size}
                  onChange={(e) => resizeWidget('charts', e.target.value)}
                  style={{ fontSize: '12px', padding: '2px' }}
                >
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
              <TrendingUp size={24} color="#667eea" />
              <h3 style={{ margin: 0, color: 'white', fontFamily: "'Poppins', sans-serif" }}>Revenue & Performance Trends</h3>
            </div>

            <div style={{ height: '300px' }}>
              <Line
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      label: 'Revenue ($)',
                      data: [1200, 1500, 1800, 2100, 1900, 2200, 2500],
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      tension: 0.4,
                      pointBackgroundColor: '#667eea'
                    },
                    {
                      label: 'Margin (%)',
                      data: [15, 18, 22, 20, 25, 23, 28],
                      borderColor: '#4ecdc4',
                      backgroundColor: 'rgba(78, 205, 196, 0.1)',
                      yAxisID: 'y1',
                      tension: 0.4,
                      pointBackgroundColor: '#4ecdc4'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: 'white' } }
                  },
                  scales: {
                    x: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    y: {
                      ticks: { color: 'white' },
                      grid: { color: 'rgba(255,255,255,0.1)' },
                      title: { display: true, text: 'Revenue ($)', color: 'white' }
                    },
                    y1: {
                      ticks: { color: 'white' },
                      position: 'right',
                      title: { display: true, text: 'Margin (%)', color: 'white' },
                      grid: { drawOnChartArea: false }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* AI Insights Widget */}
        {widgets.insights.visible && (
          <div style={{
            gridColumn: widgets.insights.size === 'large' ? 'span 2' : 'span 1',
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '20px',
            padding: 'var(--spacing-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            position: 'relative',
            animation: 'fadeInUp 1s ease-out'
          }}>
            {layoutMode && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: 'var(--spacing-xs)',
                zIndex: 10
              }}>
                <button onClick={() => toggleWidget('insights')} style={{ background: '#ff6b6b', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
                <select
                  value={widgets.insights.size}
                  onChange={(e) => resizeWidget('insights', e.target.value)}
                  style={{ fontSize: '12px', padding: '2px' }}
                >
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            )}

            <AISuggestionsEnhanced
              quoteData={{
                nodes: data.diaries,
                staff: data.staff,
                marginPct: metrics.avgMargin,
                diaries: data.diaries
              }}
              onApplySuggestion={(suggestion) => {
                console.log('Applying suggestion:', suggestion)
              }}
              onReviewPricing={handlePricingReview}
            />
          </div>
        )}

        {/* Predictive Analytics Widget */}
        {widgets.predictive.visible && (
          <div style={{
            gridColumn: widgets.predictive.size === 'large' ? 'span 2' : 'span 1',
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '20px',
            padding: 'var(--spacing-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            position: 'relative',
            animation: 'fadeInUp 1.2s ease-out'
          }}>
            {layoutMode && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: 'var(--spacing-xs)',
                zIndex: 10
              }}>
                <button onClick={() => toggleWidget('predictive')} style={{ background: '#ff6b6b', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
                <select
                  value={widgets.predictive.size}
                  onChange={(e) => resizeWidget('predictive', e.target.value)}
                  style={{ fontSize: '12px', padding: '2px' }}
                >
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            )}

            <PredictiveAnalytics
              projectData={{
                staffCount: metrics.staffCount,
                optimalStaff: Math.ceil(metrics.diaryCount / 10),
                materialCost: metrics.totalCosts * 0.6,
                budget: metrics.totalRevenues,
                weatherSensitivity: 7,
                complexity: 1.2
              }}
              historicalData={[
                { duration: 45, actualCost: 15000, estimatedCost: 14000, profitMargin: 22 },
                { duration: 38, actualCost: 12000, estimatedCost: 13000, profitMargin: 18 },
                { duration: 52, actualCost: 18000, estimatedCost: 17000, profitMargin: 25 }
              ]}
            />
          </div>
        )}

        {/* Heatmap Widget */}
        {widgets.heatmap.visible && (
          <div style={{
            gridColumn: widgets.heatmap.size === 'large' ? 'span 2' : 'span 1',
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '20px',
            padding: 'var(--spacing-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            position: 'relative',
            animation: 'fadeInUp 1.4s ease-out'
          }}>
            {layoutMode && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: 'var(--spacing-xs)',
                zIndex: 10
              }}>
                <button onClick={() => toggleWidget('heatmap')} style={{ background: '#ff6b6b', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
                <select
                  value={widgets.heatmap.size}
                  onChange={(e) => resizeWidget('heatmap', e.target.value)}
                  style={{ fontSize: '12px', padding: '2px' }}
                >
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
              <Zap size={24} color="#667eea" />
              <h3 style={{ margin: 0, color: 'white', fontFamily: "'Poppins', sans-serif" }}>Project Profitability Heatmap</h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <svg ref={heatmapRef} style={{ minWidth: '600px' }}></svg>
            </div>
          </div>
        )}

        {/* Recent Activities Widget */}
        {widgets.activities.visible && (
          <div style={{
            gridColumn: widgets.activities.size === 'large' ? 'span 2' : 'span 1',
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '20px',
            padding: 'var(--spacing-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            position: 'relative',
            animation: 'fadeInUp 1.6s ease-out'
          }}>
            {layoutMode && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: 'var(--spacing-xs)',
                zIndex: 10
              }}>
                <button onClick={() => toggleWidget('activities')} style={{ background: '#ff6b6b', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
                <select
                  value={widgets.activities.size}
                  onChange={(e) => resizeWidget('activities', e.target.value)}
                  style={{ fontSize: '12px', padding: '2px' }}
                >
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
              <Calendar size={24} color="#667eea" />
              <h3 style={{ margin: 0, color: 'white', fontFamily: "'Poppins', sans-serif" }}>Recent Activities</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {data.diaries.slice(-5).reverse().map(d => (
                <div key={d.id} style={{
                  padding: 'var(--spacing-md)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: 'white', fontFamily: "'Poppins', sans-serif" }}>
                        {d.Staff?.name} on {d.Project?.name}
                      </strong>
                      <br />
                      <small style={{ color: '#ccc', fontFamily: "'Inter', sans-serif" }}>
                        {d.date} • {d.totalHours}h worked
                      </small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#4ecdc4', fontWeight: 'bold', fontSize: '1.1em' }}>
                        ${d.revenues}
                      </div>
                      <div style={{
                        color: d.marginPct >= 0 ? '#4ecdc4' : '#ff6b6b',
                        fontSize: '0.9em'
                      }}>
                        {d.marginPct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Controls */}
      <div style={{
        background: 'rgba(26, 26, 46, 0.95)',
        borderRadius: '15px',
        padding: 'var(--spacing-md)',
        display: 'flex',
        gap: 'var(--spacing-md)',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid rgba(102, 126, 234, 0.3)'
      }}>
        <button style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          background: 'linear-gradient(135deg, #28a745, #20c997)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          fontSize: '0.9em'
        }} onClick={exportToPDF}>
          <Download size={16} />
          Export PDF
        </button>

        <button style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          background: 'linear-gradient(135deg, #007bff, #0056b3)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          fontSize: '0.9em'
        }} onClick={exportToExcel}>
          <Download size={16} />
          Export Excel
        </button>

        <button style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          background: 'linear-gradient(135deg, #6f42c1, #5a32a3)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          fontSize: '0.9em'
        }} onClick={() => setReportSchedule({ ...reportSchedule, showModal: true })}>
          <Mail size={16} />
          Schedule Reports
        </button>
      </div>

      {/* Pricing Review Modal */}
      {pricingReviewOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '20px',
            padding: 'var(--spacing-xl)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h2 style={{ margin: 0, color: 'white', fontFamily: "'Poppins', sans-serif" }}>
                📊 Pricing Strategy Review
              </h2>
              <button
                onClick={closePricingReview}
                style={{
                  background: 'rgba(255,107,107,0.2)',
                  border: '1px solid #ff6b6b',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: '#ff6b6b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ color: 'white', fontFamily: "'Inter', sans-serif", lineHeight: '1.6' }}>
              <div style={{ background: 'rgba(102, 126, 234, 0.1)', padding: 'var(--spacing-md)', borderRadius: '12px', marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ margin: '0 0 var(--spacing-md) 0', color: '#667eea' }}>Current Pricing Analysis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
                  <div>
                    <strong>Current Margin:</strong><br/>
                    <span style={{ color: metrics.avgMargin < 15 ? '#ff6b6b' : metrics.avgMargin > 35 ? '#ffd93d' : '#4ecdc4', fontSize: '1.2em' }}>
                      {metrics.avgMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <strong>Industry Standard:</strong><br/>
                    <span style={{ color: '#667eea' }}>20-30%</span>
                  </div>
                  <div>
                    <strong>Revenue/Employee:</strong><br/>
                    <span style={{ color: '#4ecdc4' }}>${metrics.laborEfficiency}/hr</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ color: '#4ecdc4', marginBottom: 'var(--spacing-md)' }}>💡 Strategic Recommendations</h3>
                <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                  {metrics.avgMargin < 15 && (
                    <li>Increase margins by 5-10% through value-based pricing or premium service tiers</li>
                  )}
                  {metrics.avgMargin > 35 && (
                    <li>Consider volume discounts or competitive positioning to increase market share</li>
                  )}
                  <li>Implement dynamic pricing based on project complexity and market conditions</li>
                  <li>Consider bundling services for higher perceived value</li>
                  <li>Regular competitor analysis to maintain pricing advantage</li>
                </ul>
              </div>

              <div style={{ background: 'rgba(78, 205, 196, 0.1)', padding: 'var(--spacing-md)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 var(--spacing-md) 0', color: '#4ecdc4' }}>🎯 Action Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <input type="checkbox" />
                    <span>Conduct competitor pricing analysis</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <input type="checkbox" />
                    <span>Review cost structure for optimization opportunities</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <input type="checkbox" />
                    <span>Implement tiered pricing model</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <input type="checkbox" />
                    <span>Schedule quarterly pricing reviews</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Scheduling Modal */}
      {reportSchedule.showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '20px',
            padding: 'var(--spacing-xl)',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h2 style={{ margin: 0, color: 'white', fontFamily: "'Poppins', sans-serif" }}>
                📅 Schedule Reports
              </h2>
              <button
                onClick={() => setReportSchedule({ ...reportSchedule, showModal: false })}
                style={{
                  background: 'rgba(255,107,107,0.2)',
                  border: '1px solid #ff6b6b',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: '#ff6b6b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', color: 'white', fontFamily: "'Inter', sans-serif" }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>Frequency:</label>
                <select
                  value={reportSchedule.frequency}
                  onChange={(e) => setReportSchedule({ ...reportSchedule, frequency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>Time:</label>
                <input
                  type="time"
                  value={reportSchedule.time}
                  onChange={(e) => setReportSchedule({ ...reportSchedule, time: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>Email Address:</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={reportSchedule.email}
                  onChange={(e) => setReportSchedule({ ...reportSchedule, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>Format:</label>
                <select
                  value={reportSchedule.format}
                  onChange={(e) => setReportSchedule({ ...reportSchedule, format: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                >
                  <option value="pdf">PDF Report</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="email">Email Summary</option>
                </select>
              </div>

              <button
                onClick={scheduleReport}
                style={{
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1em',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-sm)'
                }}
              >
                <CalendarIcon size={18} />
                Schedule Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UltimateDashboardFixed
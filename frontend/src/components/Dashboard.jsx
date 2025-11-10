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
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { api } from '../utils/api'
import { TrendingUp, DollarSign, Clock, BarChart3 } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const Dashboard = () => {
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDiaries = async () => {
    setLoading(true)
    try {
      const response = await api.get('/diaries')
      setDiaries(response.data)
    } catch (err) {
      console.error('Error fetching diaries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiaries()
  }, [])

  // Calculate metrics
  const totalHours = diaries.reduce((sum, d) => sum + parseFloat(d.totalHours || 0), 0)
  const totalCosts = diaries.reduce((sum, d) => sum + parseFloat(d.costs || 0), 0)
  const totalRevenues = diaries.reduce((sum, d) => sum + parseFloat(d.revenues || 0), 0)
  const avgMargin = diaries.length > 0 ? (diaries.reduce((sum, d) => sum + parseFloat(d.marginPct || 0), 0) / diaries.length) : 0

  // Group by date
  const grouped = diaries.reduce((acc, d) => {
    const date = d.date
    if (!acc[date]) acc[date] = { revenues: 0, margins: 0, count: 0 }
    acc[date].revenues += parseFloat(d.revenues)
    acc[date].margins += parseFloat(d.marginPct)
    acc[date].count += 1
    return acc
  }, {})

  const labels = Object.keys(grouped).sort().slice(-7) // Last 7 days
  const revenues = labels.map(date => grouped[date].revenues)
  const margins = labels.map(date => grouped[date].margins / grouped[date].count)

  const data = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenues,
        borderColor: 'var(--primary-color)',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Average Margin (%)',
        data: margins,
        borderColor: 'var(--success-color)',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        yAxisID: 'y1',
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue and Margin Trends (Last 7 Days)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue ($)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Margin (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  const recentActivities = diaries.slice(-5).reverse() // Last 5 entries

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xl)', color: 'var(--gray-900)' }}>Dashboard</h2>

      {/* Metrics Cards */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <Clock size={32} color="var(--primary-color)" style={{ marginBottom: 'var(--spacing-sm)' }} />
            <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>{totalHours.toFixed(1)}</h3>
            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Total Hours</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <DollarSign size={32} color="var(--danger-color)" style={{ marginBottom: 'var(--spacing-sm)' }} />
            <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>${totalCosts.toFixed(2)}</h3>
            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Total Costs</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <TrendingUp size={32} color="var(--success-color)" style={{ marginBottom: 'var(--spacing-sm)' }} />
            <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>${totalRevenues.toFixed(2)}</h3>
            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Total Revenue</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <BarChart3 size={32} color="var(--info-color)" style={{ marginBottom: 'var(--spacing-sm)' }} />
            <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>{avgMargin.toFixed(1)}%</h3>
            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Avg Margin</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="grid grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Performance Trends</h3>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <Line options={options} data={data} />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Recent Activities</h3>
          </div>
          <div className="card-body">
            {recentActivities.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recentActivities.map(d => (
                  <li key={d.id} style={{ padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{d.Staff?.name}</strong> on {d.Project?.name}
                      <br />
                      <small style={{ color: 'var(--gray-600)' }}>{d.date} - {d.totalHours}h</small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>${d.revenues}</div>
                      <small style={{ color: d.marginPct >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>{d.marginPct}%</small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--gray-500)', textAlign: 'center' }}>No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
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
import { TrendingUp, DollarSign, Clock, BarChart3, Sparkles, Volume2, VolumeX, Zap } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

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

const HUDGauge = ({ label, value, max, color, icon }) => {
  const percentage = Math.min((value / max) * 100, 100)
  const strokeDasharray = 283
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100

  return (
    <div style={{ textAlign: 'center', margin: '0 var(--spacing-md)', position: 'relative' }}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text x="50" y="45" textAnchor="middle" fill="white" fontSize="12" fontFamily="'Poppins', sans-serif">
          {label}
        </text>
        <text x="50" y="60" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="'Inter', sans-serif">
          {typeof value === 'number' ? (label.includes('%') ? value.toFixed(1) + '%' : '$' + value.toFixed(0)) : value}
        </text>
      </svg>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: color,
        fontSize: '1.5em'
      }}>
        {icon}
      </div>
    </div>
  )
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

const EnhancedDashboard = () => {
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)

  const fetchDiaries = async () => {
    setLoading(true)
    try {
      const response = await api.get('/diaries')
      setDiaries(response.data)
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 2000)
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

  const labels = Object.keys(grouped).sort().slice(-7)
  const revenues = labels.map(date => grouped[date].revenues)
  const margins = labels.map(date => grouped[date].margins / grouped[date].count)

  const data = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenues,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Average Margin (%)',
        data: margins,
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        yAxisID: 'y1',
        tension: 0.4,
        pointBackgroundColor: '#4ecdc4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
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
        labels: {
          color: 'white',
          font: {
            family: "'Inter', sans-serif",
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Strategic Performance Trends (Last 7 Days)',
        color: 'white',
        font: {
          size: 18,
          weight: 'bold',
          family: "'Poppins', sans-serif"
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
          font: {
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(255,255,255,0.1)'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue ($)',
          color: 'white',
          font: {
            family: "'Poppins', sans-serif"
          }
        },
        ticks: {
          color: 'white',
          font: {
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(255,255,255,0.1)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Margin (%)',
          color: 'white',
          font: {
            family: "'Poppins', sans-serif"
          }
        },
        ticks: {
          color: 'white',
          font: {
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  const recentActivities = diaries.slice(-5).reverse()

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
        <span style={{ fontSize: '1.2em', fontFamily: "'Poppins', sans-serif" }}>Loading Strategic Dashboard...</span>
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
          Strategic Dashboard
        </h2>
      </div>

      {/* HUD Gauges */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 'var(--spacing-xl)',
        flexWrap: 'wrap',
        background: 'rgba(26, 26, 46, 0.95)',
        borderRadius: '20px',
        padding: 'var(--spacing-lg)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(102, 126, 234, 0.2)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(102, 126, 234, 0.5)',
        animation: 'pulse 4s ease-in-out infinite'
      }}>
        <HUDGauge label="Total Hours" value={totalHours} max={1000} color="#667eea" icon={<Clock size={24} />} />
        <HUDGauge label="Total Costs" value={totalCosts} max={50000} color="#ff6b6b" icon={<DollarSign size={24} />} />
        <HUDGauge label="Total Revenue" value={totalRevenues} max={75000} color="#4ecdc4" icon={<TrendingUp size={24} />} />
        <HUDGauge label="Avg Margin" value={avgMargin} max={50} color="#ffd93d" icon={<BarChart3 size={24} />} />
      </div>

      {/* Chart and Activities */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-xl)'
      }}>
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
            margin: '0 0 var(--spacing-md) 0',
            color: 'white',
            fontFamily: "'Poppins', sans-serif",
            textAlign: 'center',
            fontSize: '1.5em',
            textShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
          }}>
            Performance Trends
          </h3>
          <div style={{ height: '400px' }}>
            <Line options={options} data={data} />
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
            margin: '0 0 var(--spacing-md) 0',
            color: 'white',
            fontFamily: "'Poppins', sans-serif",
            textAlign: 'center',
            fontSize: '1.5em',
            textShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
          }}>
            Recent Activities
          </h3>
          <div>
            {recentActivities.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recentActivities.map(d => (
                  <li key={d.id} style={{
                    padding: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-sm)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div>
                      <strong style={{ color: 'white', fontFamily: "'Poppins', sans-serif" }}>{d.Staff?.name}</strong> on {d.Project?.name}
                      <br />
                      <small style={{ color: '#ccc', fontFamily: "'Inter', sans-serif" }}>{d.date} - {d.totalHours}h</small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#4ecdc4', fontWeight: 'bold', fontFamily: "'Inter', sans-serif" }}>${d.revenues}</div>
                      <small style={{
                        color: d.marginPct >= 0 ? '#28a745' : '#dc3545',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {d.marginPct}%
                      </small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{
                color: '#ccc',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                fontStyle: 'italic'
              }}>
                No recent activities
              </p>
            )}
          </div>
        </div>
      </div>

      <Confetti show={showConfetti} />
    </div>
  )
}

export default EnhancedDashboard
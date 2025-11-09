import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { TrendingUp, DollarSign, Clock, BarChart3, Sparkles, Volume2, VolumeX, Activity, Settings, Download, Mail } from 'lucide-react'

const SimpleDashboard = () => {
  const [data, setData] = useState({
    diaries: [],
    projects: [],
    staff: [],
    equipment: []
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [pricingReviewOpen, setPricingReviewOpen] = useState(false)
  const [reportSchedule, setReportSchedule] = useState({
    showModal: false,
    frequency: 'weekly',
    time: '09:00',
    email: '',
    format: 'pdf'
  })

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [diariesRes, projectsRes, staffRes, equipmentRes] = await Promise.all([
        api.get('/diaries'),
        api.get('/projects'),
        api.get('/staff'),
        api.get('/equipment')
      ])

      setData({
        diaries: diariesRes.data,
        projects: projectsRes.data.data || projectsRes.data,
        staff: staffRes.data.data || staffRes.data,
        equipment: equipmentRes.data.data || equipmentRes.data
      })
      setLastUpdate(new Date())
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

  // Calculate metrics
  const metrics = React.useMemo(() => {
    const { diaries } = data
    const totalHours = diaries.reduce((sum, d) => sum + parseFloat(d.totalHours || 0), 0)
    const totalCosts = diaries.reduce((sum, d) => sum + parseFloat(d.costs || 0), 0)
    const totalRevenues = diaries.reduce((sum, d) => sum + parseFloat(d.revenues || 0), 0)
    const totalMargin = totalRevenues - totalCosts
    const avgMargin = diaries.length > 0 ? diaries.reduce((sum, d) => sum + parseFloat(d.marginPct || 0), 0) / diaries.length : 0

    return {
      totalHours,
      totalCosts,
      totalRevenues,
      totalMargin,
      avgMargin,
      diaryCount: diaries.length
    }
  }, [data])

  // Pricing review handler
  const handlePricingReview = () => {
    setPricingReviewOpen(true)
  }

  const closePricingReview = () => {
    setPricingReviewOpen(false)
  }

  // Report scheduling
  const scheduleReport = () => {
    alert(`Report scheduled!\nFrequency: ${reportSchedule.frequency}\nTime: ${reportSchedule.time}\nFormat: ${reportSchedule.format}`)
    setReportSchedule({ ...reportSchedule, showModal: false })
  }

  // Export functions
  const exportToPDF = () => {
    alert('PDF Export feature - Would generate comprehensive dashboard PDF report')
  }

  const exportToExcel = () => {
    alert('Excel Export feature - Would generate spreadsheet with all dashboard data')
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
        <span style={{ fontSize: '1.4em', fontFamily: "'Poppins', sans-serif" }}>Loading Dashboard...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-xl)',
        paddingBottom: 'var(--spacing-md)',
        borderBottom: '2px solid #667eea',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <Sparkles size={32} color="#667eea" />
          <div>
            <h1 style={{ margin: 0, color: '#ffffff', fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '2.5em' }}>
              Simple Dashboard
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: '#4ecdc4', fontSize: '0.9em' }}>
                <Activity size={14} />
                <span>LIVE</span>
              </div>
              <span style={{ color: '#ccc', fontSize: '0.9em' }}>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
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
            <Activity size={16} />
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

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <div style={{
          background: 'rgba(26, 26, 46, 0.95)',
          padding: 'var(--spacing-lg)',
          borderRadius: '15px',
          textAlign: 'center',
          border: '1px solid rgba(102, 126, 234, 0.3)'
        }}>
          <DollarSign size={40} color="#667eea" style={{ marginBottom: 'var(--spacing-md)' }} />
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#667eea' }}>
            ${metrics.totalRevenues.toLocaleString()}
          </div>
          <div style={{ color: '#ccc', fontSize: '1em' }}>Total Revenue</div>
        </div>

        <div style={{
          background: 'rgba(26, 26, 46, 0.95)',
          padding: 'var(--spacing-lg)',
          borderRadius: '15px',
          textAlign: 'center',
          border: '1px solid rgba(78, 205, 196, 0.3)'
        }}>
          <TrendingUp size={40} color="#4ecdc4" style={{ marginBottom: 'var(--spacing-md)' }} />
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#4ecdc4' }}>
            {metrics.avgMargin.toFixed(1)}%
          </div>
          <div style={{ color: '#ccc', fontSize: '1em' }}>Average Margin</div>
        </div>

        <div style={{
          background: 'rgba(26, 26, 46, 0.95)',
          padding: 'var(--spacing-lg)',
          borderRadius: '15px',
          textAlign: 'center',
          border: '1px solid rgba(255, 193, 77, 0.3)'
        }}>
          <Clock size={40} color="#ffd93d" style={{ marginBottom: 'var(--spacing-md)' }} />
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#ffd93d' }}>
            {metrics.totalHours.toFixed(0)}
          </div>
          <div style={{ color: '#ccc', fontSize: '1em' }}>Total Hours</div>
        </div>

        <div style={{
          background: 'rgba(26, 26, 46, 0.95)',
          padding: 'var(--spacing-lg)',
          borderRadius: '15px',
          textAlign: 'center',
          border: '1px solid rgba(255, 107, 107, 0.3)'
        }}>
          <BarChart3 size={40} color="#ff6b6b" style={{ marginBottom: 'var(--spacing-md)' }} />
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#ff6b6b' }}>
            {metrics.diaryCount}
          </div>
          <div style={{ color: '#ccc', fontSize: '1em' }}>Total Entries</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <button
          onClick={handlePricingReview}
          style={{
            padding: 'var(--spacing-lg)',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            cursor: 'pointer',
            fontSize: '1.1em',
            fontWeight: '600',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Settings size={32} />
          Review Pricing Strategy
        </button>

        <button
          onClick={() => setReportSchedule({ ...reportSchedule, showModal: true })}
          style={{
            padding: 'var(--spacing-lg)',
            background: 'linear-gradient(135deg, #28a745, #20c997)',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            cursor: 'pointer',
            fontSize: '1.1em',
            fontWeight: '600',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Mail size={32} />
          Schedule Reports
        </button>
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
        <button
          onClick={exportToPDF}
          style={{
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
          }}
        >
          <Download size={16} />
          Export PDF
        </button>

        <button
          onClick={exportToExcel}
          style={{
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
          }}
        >
          <Download size={16} />
          Export Excel
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
            maxWidth: '500px',
            width: '90%',
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
              <p>Current margin: <strong>{metrics.avgMargin.toFixed(1)}%</strong></p>
              <p>Industry standard: <strong>20-30%</strong></p>
              <p>Recommendation: {metrics.avgMargin < 15 ? 'Increase margins by 5-10%' : 'Margins look good'}</p>

              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <h3>Action Items:</h3>
                <ul>
                  <li>Review competitor pricing</li>
                  <li>Analyze cost structure</li>
                  <li>Consider premium services</li>
                </ul>
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
            maxWidth: '400px',
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
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>Frequency:</label>
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
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>Time:</label>
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
                  fontWeight: '600'
                }}
              >
                Schedule Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleDashboard
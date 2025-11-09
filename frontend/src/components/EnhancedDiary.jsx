import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Calendar, Plus, CheckCircle, Sparkles, Volume2, VolumeX } from 'lucide-react'

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

const EnhancedDiary = () => {
  const [projects, setProjects] = useState([])
  const [staff, setStaff] = useState([])
  const [equipment, setEquipment] = useState([])
  const [diaries, setDiaries] = useState([])
  const [form, setForm] = useState({
    date: '',
    projectId: '',
    staffId: '',
    equipmentId: '',
    hours: '',
    overtime1: '',
    overtime2: ''
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
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
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 2000)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

 const handleSubmit = async (e) => {
          e.preventDefault()
          try {
            const { id, ...formData } = form
            const dataToSend = {
              date: formData.date,
              projectId: formData.projectId,
              staffId: formData.staffId,
              equipmentId: formData.equipmentId || undefined,
              hours: parseFloat(formData.hours),
              overtime1: formData.overtime1 ? parseFloat(formData.overtime1) : undefined,
              overtime2: formData.overtime2 ? parseFloat(formData.overtime2) : undefined
            }
      await api.post('/diaries', dataToSend)
      alert('Diary entry added successfully!')
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      setForm({ date: '', projectId: '', staffId: '', equipmentId: '', hours: '', overtime1: '', overtime2: '' })
      fetchData()
    } catch (err) {
      alert('Error saving diary entry: ' + (err.response?.data?.error || err.message))
      console.error('Error saving diary entry:', err)
    }
  }

  const recentDiaries = diaries.slice(-5).reverse()

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
        <span style={{ fontSize: '1.2em', fontFamily: "'Poppins', sans-serif" }}>Loading Strategic Diary...</span>
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
          Strategic Diary
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: 'var(--spacing-xl)'
      }}>
        {/* Form */}
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
            <Plus size={24} />
+            Add Diary Entry
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              style={{
                padding: 'var(--spacing-sm)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                backdropFilter: 'blur(10px)'
              }}
            />
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              required
              style={{
                padding: 'var(--spacing-sm)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                backdropFilter: 'blur(10px)'
              }}
            >
              <option value="" style={{ background: '#1a1a2e', color: 'white' }}>Select Project</option>
              {projects.map(p => <option key={p.id} value={p.id} style={{ background: '#1a1a2e', color: 'white' }}>{p.name}</option>)}
            </select>
            <select
              value={form.staffId}
              onChange={(e) => setForm({ ...form, staffId: e.target.value })}
              required
              style={{
                padding: 'var(--spacing-sm)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                backdropFilter: 'blur(10px)'
              }}
            >
              <option value="" style={{ background: '#1a1a2e', color: 'white' }}>Select Staff</option>
              {staff.map(s => <option key={s.id} value={s.id} style={{ background: '#1a1a2e', color: 'white' }}>{s.name}</option>)}
            </select>
            <select
              value={form.equipmentId}
              onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}
              style={{
                padding: 'var(--spacing-sm)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                backdropFilter: 'blur(10px)'
              }}
            >
              <option value="" style={{ background: '#1a1a2e', color: 'white' }}>Select Equipment (Optional)</option>
              {equipment.map(e => <option key={e.id} value={e.id} style={{ background: '#1a1a2e', color: 'white' }}>{e.name}</option>)}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Hours"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              required
              style={{
                padding: 'var(--spacing-sm)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                backdropFilter: 'blur(10px)'
              }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Overtime 1 Hours"
              value={form.overtime1}
              onChange={(e) => setForm({ ...form, overtime1: e.target.value })}
              style={{
                padding: 'var(--spacing-sm)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                backdropFilter: 'blur(10px)'
              }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Overtime 2 Hours"
              value={form.overtime2}
              onChange={(e) => setForm({ ...form, overtime2: e.target.value })}
              style={{
                padding: 'var(--spacing-sm)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                backdropFilter: 'blur(10px)'
              }}
            />
            <button
              type="submit"
              style={{
                padding: 'var(--spacing-md)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                fontFamily: "'Poppins', sans-serif",
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)'
              }}
            >
              <CheckCircle size={16} />
              Add Entry
            </button>
          </form>
        </div>

        {/* Recent Entries */}
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
            <Calendar size={24} />
            Recent Diary Entries
          </h3>
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {recentDiaries.map(d => (
              <div
                key={d.id}
                style={{
                  padding: 'var(--spacing-md)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
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
                <div>
                  <strong style={{ color: 'white', fontFamily: "'Poppins', sans-serif" }}>{d.date}</strong>
                  <br />
                  <small style={{ color: '#ccc', fontFamily: "'Inter', sans-serif" }}>
                    Project: {d.Project?.name} | Staff: {d.Staff?.name} | Equipment: {d.Equipment?.name || 'N/A'}
                  </small>
                  <br />
                  <small style={{ color: '#4ecdc4', fontFamily: "'Inter', sans-serif" }}>
                    Hours: {d.totalHours} | Costs: ${d.costs} | Revenues: ${d.revenues} | Margin: {d.marginPct}%
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Confetti show={showConfetti} />
    </div>
  )
}

export default EnhancedDiary
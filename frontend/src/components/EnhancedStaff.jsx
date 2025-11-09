import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Users, Plus, Edit, Trash2, Sparkles, Volume2, VolumeX, CheckCircle, XCircle } from 'lucide-react'

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

const EnhancedStaff = () => {
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({
    id: null,
    name: '',
    role: '',
    payRateBase: '',
    payRateOT1: '',
    payRateOT2: '',
    chargeOutBase: '',
    chargeOutOT1: '',
    chargeOutOT2: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const response = await api.get('/staff')
      setStaff(response.data.data || response.data)
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 2000)
    } catch (err) {
      alert('Error fetching staff: ' + (err.response?.data?.error || err.message))
      console.error('Error fetching staff:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStaff() }, [])

const handleSubmit = async (e) => {
          e.preventDefault()
          try {
            const { id, ...formData } = form
            const dataToSend = {
              name: formData.name,
              role: formData.role,
              payRateBase: parseFloat(formData.payRateBase),
              payRateOT1: formData.payRateOT1 ? parseFloat(formData.payRateOT1) : undefined,
              payRateOT2: formData.payRateOT2 ? parseFloat(formData.payRateOT2) : undefined,
              chargeOutBase: parseFloat(formData.chargeOutBase),
              chargeOutOT1: formData.chargeOutOT1 ? parseFloat(formData.chargeOutOT1) : undefined,
              chargeOutOT2: formData.chargeOutOT2 ? parseFloat(formData.chargeOutOT2) : undefined
            }
      if (isEditing) {
        await api.put(`/staff/${form.id}`, dataToSend)
        alert('Staff updated successfully!')
      } else {
        await api.post('/staff', dataToSend)
        alert('Staff added successfully!')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
      setForm({ id: null, name: '', role: '', payRateBase: '', payRateOT1: '', payRateOT2: '', chargeOutBase: '', chargeOutOT1: '', chargeOutOT2: '' })
      setIsEditing(false)
      fetchStaff()
    } catch (err) {
      alert('Error saving staff: ' + (err.response?.data?.error || err.message))
      console.error('Error saving staff:', err)
    }
  }

  const handleEdit = (s) => {
    setForm({
      id: s.id,
      name: s.name,
      role: s.role,
      payRateBase: s.payRateBase || '',
      payRateOT1: s.payRateOT1 || '',
      payRateOT2: s.payRateOT2 || '',
      chargeOutBase: s.chargeOutBase || '',
      chargeOutOT1: s.chargeOutOT1 || '',
      chargeOutOT2: s.chargeOutOT2 || ''
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setForm({ id: null, name: '', role: '', payRateBase: '', payRateOT1: '', payRateOT2: '', chargeOutBase: '', chargeOutOT1: '', chargeOutOT2: '' })
    setIsEditing(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.delete(`/staff/${id}`)
        fetchStaff()
      } catch (err) {
        alert('Error deleting staff: ' + (err.response?.data?.error || err.message))
      }
    }
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
        <span style={{ fontSize: '1.2em', fontFamily: "'Poppins', sans-serif" }}>Loading Strategic Staff Management...</span>
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
          Strategic Staff Management
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
            {isEditing ? 'Edit Staff' : 'Add Staff'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
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
              placeholder="Base Pay Rate"
              value={form.payRateBase}
              onChange={(e) => setForm({ ...form, payRateBase: e.target.value })}
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
              placeholder="OT1 Pay Rate"
              value={form.payRateOT1}
              onChange={(e) => setForm({ ...form, payRateOT1: e.target.value })}
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
              placeholder="OT2 Pay Rate"
              value={form.payRateOT2}
              onChange={(e) => setForm({ ...form, payRateOT2: e.target.value })}
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
              placeholder="Base Charge Out Rate"
              value={form.chargeOutBase}
              onChange={(e) => setForm({ ...form, chargeOutBase: e.target.value })}
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
              placeholder="OT1 Charge Out Rate"
              value={form.chargeOutOT1}
              onChange={(e) => setForm({ ...form, chargeOutOT1: e.target.value })}
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
              placeholder="OT2 Charge Out Rate"
              value={form.chargeOutOT2}
              onChange={(e) => setForm({ ...form, chargeOutOT2: e.target.value })}
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
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
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
                {isEditing ? 'Update Staff' : 'Add Staff'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: 'var(--spacing-md)',
                    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(220, 53, 69, 0.3)',
                    fontFamily: "'Poppins', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(220, 53, 69, 0.3)'
                  }}
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Staff List */}
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
            <Users size={24} />
            Staff List
          </h3>
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {staff.map(s => (
              <div
                key={s.id}
                style={{
                  padding: 'var(--spacing-md)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
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
                <div>
                  <strong style={{ color: 'white', fontFamily: "'Poppins', sans-serif" }}>{s.name}</strong>
                  <br />
                  <small style={{ color: '#ccc', fontFamily: "'Inter', sans-serif" }}>{s.role}</small>
                  <br />
                  <small style={{ color: '#4ecdc4', fontFamily: "'Inter', sans-serif" }}>Pay: ${s.payRateBase || 0} | Charge: ${s.chargeOutBase || 0}</small>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button
                    onClick={() => handleEdit(s)}
                    style={{
                      background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: 'var(--spacing-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    style={{
                      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: 'var(--spacing-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Trash2 size={16} />
                  </button>
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

export default EnhancedStaff
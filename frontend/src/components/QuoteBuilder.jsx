import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useDrag, useDrop, useDragLayer } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Shovel, User, Wrench, Package, Zap, Plus, Save, Sparkles, Search, Volume2, VolumeX } from 'lucide-react'
import { api } from '../utils/api'

const initialNodes = []
const initialEdges = []

const getMaterialIcon = (category) => {
  const cat = category.toLowerCase()
  if (cat.includes('sand') || cat.includes('concrete') || cat.includes('gravel')) return <Shovel size={16} />
  if (cat.includes('labor') || cat.includes('worker')) return <User size={16} />
  if (cat.includes('equipment') || cat.includes('tool')) return <Wrench size={16} />
  return <Package size={16} />
}

const getItemIcon = (item) => {
  if (item.type === 'staff') return <User size={16} />
  if (item.type === 'equipment') return <Wrench size={16} />
  return getMaterialIcon(item.category || '')
}

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
}

function getItemStyles(initialOffset, currentOffset) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    }
  }
  let { x, y } = currentOffset
  const transform = `translate(${x}px, ${y}px)`
  return {
    transform,
    WebkitTransform: transform,
  }
}

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

const RippleEffect = ({ show, x, y }) => {
  if (!show) return null

  return (
    <div style={{
      position: 'absolute',
      left: x - 50,
      top: y - 50,
      width: '100px',
      height: '100px',
      border: '2px solid #667eea',
      borderRadius: '50%',
      animation: 'ripple 0.6s ease-out forwards',
      zIndex: 50,
      pointerEvents: 'none'
    }} />
  )
}

const ParticleTrail = ({ show, x, y }) => {
  if (!show) return null

  const trailParticles = Array.from({ length: 10 }, (_, i) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        left: x + Math.random() * 20 - 10,
        top: y + Math.random() * 20 - 10,
        width: '3px',
        height: '3px',
        backgroundColor: '#764ba2',
        borderRadius: '50%',
        animation: `trailParticle 0.5s ease-out forwards`,
        zIndex: 40,
        opacity: 0.8
      }}
    />
  ))

  return <div>{trailParticles}</div>
}

const Tooltip = ({ children, content }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.9em',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          marginBottom: '8px',
          fontFamily: "'Inter', sans-serif"
        }}>
          {content}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '5px solid transparent',
            borderTopColor: 'rgba(0,0,0,0.8)'
          }}></div>
        </div>
      )}
    </div>
  )
}

const HUDGauge = ({ label, value, max, color }) => {
  const percentage = Math.min((value / max) * 100, 100)
  const strokeDasharray = 283 // Circumference of circle with r=45
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100

  return (
    <div style={{ textAlign: 'center', margin: '0 var(--spacing-md)' }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#333"
          strokeWidth="8"
        />
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
          ${value.toFixed(0)}
        </text>
      </svg>
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

const DragPreview = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  if (!isDragging || itemType !== 'material') {
    return null
  }

  const material = item.material
  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)',
          padding: 'var(--spacing-sm)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          backdropFilter: 'blur(10px)',
          animation: 'pulse 2s infinite, glow 1s ease-in-out infinite alternate'
        }}>
          {getItemIcon(material)}
          <div>
            <strong>{material.name}</strong>
            <br />
            <small>${material.pricePerUnit || material.payRate || material.costRate}/${material.unit || 'hr' || 'day'}</small>
          </div>
        </div>
      </div>
    </div>
  )
}

const ItemCard = ({ item }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'material',
    item: { material: { ...item, type: item.type || 'material' } },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const getDisplayInfo = () => {
    if (item.type === 'staff') {
      return { label: item.name, sub: `$${item.payRate}/hr`, icon: <User size={16} /> }
    }
    if (item.type === 'equipment') {
      return { label: item.name, sub: `$${item.costRate}/day`, icon: <Wrench size={16} /> }
    }
    return { label: item.name, sub: `$${item.pricePerUnit}/${item.unit}`, icon: getMaterialIcon(item.category) }
  }

  const { label, sub, icon } = getDisplayInfo()

  return (
    <div
      ref={drag}
      style={{
        padding: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-sm)',
        border: '1px solid var(--gray-200)',
        borderRadius: '10px',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          console.log('Keyboard drag not fully implemented')
        }
      }}
      aria-label={`Drag ${label} costing ${sub}`}
      role="button"
    >
      <Tooltip content={`${label}: ${item.category || item.role || 'Material'} - ${sub}`}>
        <div style={{
          color: '#667eea',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '50%',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'spin 3s linear infinite'
        }}>
          {icon}
        </div>
      </Tooltip>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', color: '#333', fontFamily: "'Poppins', sans-serif" }}>{label}</div>
        <div style={{ fontSize: '0.9em', color: '#666', fontFamily: "'Inter', sans-serif" }}>{sub}</div>
      </div>
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
        transform: 'rotate(45deg)',
        opacity: 0,
        transition: 'opacity 0.3s ease'
      }}></div>
    </div>
  )
}

const QuoteBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [materials, setMaterials] = useState([])
  const [staff, setStaff] = useState([])
  const [equipment, setEquipment] = useState([])
  const [projects, setProjects] = useState([])
  const [quoteItems, setQuoteItems] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [marginPct, setMarginPct] = useState(20)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [rippleEffect, setRippleEffect] = useState({ show: false, x: 0, y: 0 })
  const [particleTrail, setParticleTrail] = useState({ show: false, x: 0, y: 0 })
  const [soundEnabled, setSoundEnabled] = useState(false)
  const canvasRef = useRef(null)

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/nodes')
      setMaterials(response.data.data || response.data)
    } catch (err) {
      console.error('Error fetching materials:', err)
    }
  }

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff')
      const staffData = response.data.data || response.data
      setStaff(staffData.map(s => ({
        ...s,
        payRate: s.pay_rates?.base || s.payRate || 0
      })))
    } catch (err) {
      console.error('Error fetching staff:', err)
    }
  }

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment')
      const equipmentData = response.data.data || response.data
      setEquipment(equipmentData.map(e => ({
        ...e,
        costRate: e.cost_rates?.base || e.costRate || 0
      })))
    } catch (err) {
      console.error('Error fetching equipment:', err)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data.data || response.data)
    } catch (err) {
      console.error('Error fetching projects:', err)
    }
  }

  useEffect(() => {
    fetchMaterials()
    fetchStaff()
    fetchEquipment()
    fetchProjects()
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const filteredMaterials = useMemo(() => {
    if (!debouncedSearchTerm) return materials
    return materials.filter(material =>
      material.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [materials, debouncedSearchTerm])

  const filteredStaff = useMemo(() => {
    if (!debouncedSearchTerm) return staff
    return staff.filter(s =>
      s.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [staff, debouncedSearchTerm])

  const filteredEquipment = useMemo(() => {
    if (!debouncedSearchTerm) return equipment
    return equipment.filter(e =>
      e.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [equipment, debouncedSearchTerm])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'material',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset()
      const material = item.material
      const quantity = prompt(`Enter quantity for ${material.name}:`, material.type === 'staff' ? '8' : material.type === 'equipment' ? '1' : '1')
      if (quantity) {
        const nodeType = material.type === 'staff' ? 'Staff' : material.type === 'equipment' ? 'Equipment' : 'Material'
        const newNode = {
          id: `${material.type}-${material.id}-${Date.now()}`,
          type: 'default',
          position: { x: offset.x - 200, y: offset.y - 100 },
          data: { label: `${nodeType}: ${material.name} - Qty: ${quantity}` },
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            padding: '10px',
            animation: 'nodeAppear 0.5s ease-out, bounce 0.6s ease-out'
          }
        }
        setNodes((nds) => nds.concat(newNode))
        setQuoteItems(prev => [...prev, { nodeId: material.id, quantity: parseFloat(quantity), material, type: material.type }])
        setShowParticles(true)
        setRippleEffect({ show: true, x: offset.x, y: offset.y })
        setTimeout(() => setShowParticles(false), 1000)
        setTimeout(() => setRippleEffect({ show: false, x: 0, y: 0 }), 600)
        if (soundEnabled) {
          // Play drop sound (placeholder)
          console.log('Drop sound played')
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  // Track mouse for particle trail
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (particleTrail.show) {
        setParticleTrail({ show: true, x: e.clientX, y: e.clientY })
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [particleTrail.show])

  const calculateTotals = () => {
    const totalCost = quoteItems.reduce((sum, item) => {
      let cost = 0
      if (item.type === 'staff') {
        cost = item.material.payRate * item.quantity // Assuming quantity is hours
      } else if (item.type === 'equipment') {
        cost = item.material.costRate * item.quantity // Assuming quantity is days
      } else {
        cost = item.material.pricePerUnit * item.quantity
      }
      return sum + cost
    }, 0)
    const totalRevenue = totalCost * (1 + marginPct / 100)
    const margin = totalRevenue - totalCost
    return { totalCost, totalRevenue, margin }
  }

  const { totalCost, totalRevenue, margin } = calculateTotals()

  const saveQuote = async () => {
    if (!selectedProject || quoteItems.length === 0) {
      alert('Select a project and add items.')
      return
    }
    try {
      const data = {
        name: `Quote ${Date.now()}`,
        projectId: selectedProject,
        marginPct,
        nodes: quoteItems.filter(item => !item.type || item.type === 'material').map(item => ({ nodeId: item.nodeId, quantity: item.quantity })),
        staff: quoteItems.filter(item => item.type === 'staff').map(item => ({ staffId: item.nodeId, hours: item.quantity })),
        equipment: quoteItems.filter(item => item.type === 'equipment').map(item => ({ equipmentId: item.nodeId, days: item.quantity }))
      }
      await api.post('/quotes', data)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      alert('Quote saved!')
      setNodes([])
      setEdges([])
      setQuoteItems([])
      if (soundEnabled) {
        // Play save sound (placeholder)
        console.log('Save sound played')
      }
    } catch (err) {
      alert('Error saving quote: ' + (err.response?.data?.error || err.message))
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      position: 'relative',
      fontFamily: "'Inter', sans-serif",
      flexDirection: window.innerWidth < 768 ? 'column' : 'row',
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
        @keyframes nodeAppear {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(0deg); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow {
          from { box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
          to { box-shadow: 0 8px 32px rgba(102, 126, 234, 0.5); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0, -30px, 0); }
          70% { transform: translate3d(0, -15px, 0); }
          90% { transform: translate3d(0, -4px, 0); }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes trailParticle {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(0); opacity: 0; }
        }
        @media (max-width: 768px) {
          .quote-builder {
            flex-direction: column !important;
          }
          .sidebar {
            width: 100% !important;
            height: auto !important;
            position: relative !important;
            border-radius: 0 0 20px 20px !important;
          }
          .canvas {
            margin: var(--spacing-sm) !important;
            height: 60vh !important;
          }
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

      {/* Sidebar */}
      <div className="sidebar" style={{
        width: '340px',
        padding: 'var(--spacing-lg)',
        borderRight: '2px solid rgba(102, 126, 234, 0.5)',
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(102, 126, 234, 0.2)',
        borderRadius: '0 25px 25px 0',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderLeft: 'none'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-lg)',
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
          <Sparkles size={28} color="#667eea" style={{ filter: 'drop-shadow(0 0 10px #667eea)' }} />
          <h3 style={{ margin: 0, color: '#ffffff', fontFamily: "'Poppins', sans-serif", fontWeight: 700, textShadow: '0 0 20px rgba(102, 126, 234, 0.5)' }}>Strategic Builder</h3>
        </div>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          marginBottom: 'var(--spacing-md)'
        }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#667eea' }} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 36px',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontFamily: "'Inter', sans-serif",
              backdropFilter: 'blur(10px)'
            }}
            aria-label="Search items"
          />
        </div>
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{
          width: '100%',
          marginBottom: 'var(--spacing-md)',
          padding: 'var(--spacing-sm)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          fontFamily: "'Inter', sans-serif",
          backdropFilter: 'blur(10px)'
        }}>
          <option value="" style={{ background: '#1a1a2e', color: 'white' }}>Select Project</option>
          {projects.map(p => <option key={p.id} value={p.id} style={{ background: '#1a1a2e', color: 'white' }}>{p.name}</option>)}
        </select>
        <div style={{
          marginBottom: 'var(--spacing-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)'
        }}>
          <label style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>Margin %:</label>
          <input type="number" placeholder="Margin %" value={marginPct} onChange={(e) => setMarginPct(parseFloat(e.target.value))} style={{
            flex: 1,
            padding: 'var(--spacing-sm)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            backdropFilter: 'blur(10px)'
          }} />
        </div>
        {/* Materials */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h4 style={{ color: '#ffffff', fontFamily: "'Poppins', sans-serif", marginBottom: 'var(--spacing-sm)' }}>Materials</h4>
          {filteredMaterials.map(material => (
            <ItemCard key={`material-${material.id}`} item={{ ...material, type: 'material' }} />
          ))}
        </div>
        {/* Staff */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h4 style={{ color: '#ffffff', fontFamily: "'Poppins', sans-serif", marginBottom: 'var(--spacing-sm)' }}>Staff</h4>
          {filteredStaff.map(s => (
            <ItemCard key={`staff-${s.id}`} item={{ ...s, type: 'staff' }} />
          ))}
        </div>
        {/* Equipment */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h4 style={{ color: '#ffffff', fontFamily: "'Poppins', sans-serif", marginBottom: 'var(--spacing-sm)' }}>Equipment</h4>
          {filteredEquipment.map(e => (
            <ItemCard key={`equipment-${e.id}`} item={{ ...e, type: 'equipment' }} />
          ))}
        </div>
        <button onClick={saveQuote} style={{
          width: '100%',
          padding: 'var(--spacing-md)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-sm)',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
          fontFamily: "'Poppins', sans-serif",
          textShadow: '0 0 10px rgba(255,255,255,0.5)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)'
        }}>
          <Save size={16} />
          Deploy Quote
        </button>
        <div style={{
          marginTop: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          animation: 'glow 2s ease-in-out infinite alternate'
        }}>
          <h4 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontFamily: "'Poppins', sans-serif" }}>
            <Plus size={16} />
            Quote Summary
          </h4>
          <p style={{ margin: 'var(--spacing-xs) 0', fontFamily: "'Inter', sans-serif" }}>Cost: <strong>${totalCost.toFixed(2)}</strong></p>
          <p style={{ margin: 'var(--spacing-xs) 0', fontFamily: "'Inter', sans-serif" }}>Revenue: <strong>${totalRevenue.toFixed(2)}</strong></p>
          <p style={{ margin: 'var(--spacing-xs) 0', fontFamily: "'Inter', sans-serif" }}>Margin: <strong>${margin.toFixed(2)}</strong></p>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="canvas"
        ref={(el) => { canvasRef.current = el; drop(el); }}
        style={{
          flex: 1,
          transition: 'all 0.5s ease',
          backgroundColor: isOver ? 'rgba(102, 126, 234, 0.3)' : 'rgba(26, 26, 46, 0.8)',
          border: isOver ? '3px dashed #667eea' : '3px dashed rgba(102, 126, 234, 0.5)',
          borderRadius: '25px',
          margin: 'var(--spacing-lg)',
          boxShadow: isOver ? '0 0 50px rgba(102, 126, 234, 0.8), inset 0 0 50px rgba(102, 126, 234, 0.2)' : '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(102, 126, 234, 0.2)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Particles show={showParticles} />
        <RippleEffect show={rippleEffect.show} x={rippleEffect.x} y={rippleEffect.y} />
        <ParticleTrail show={particleTrail.show} x={particleTrail.x} y={particleTrail.y} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          style={{ borderRadius: '22px' }}
        >
          <MiniMap style={{ background: 'rgba(26, 26, 46, 0.9)', borderRadius: '8px', border: '1px solid rgba(102, 126, 234, 0.3)' }} />
          <Controls style={{ background: 'rgba(26, 26, 46, 0.9)', borderRadius: '8px', border: '1px solid rgba(102, 126, 234, 0.3)' }} />
          <Background color="#667eea" gap={20} />
        </ReactFlow>
      </div>

      {/* HUD */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(26, 26, 46, 0.95)',
        borderRadius: '20px',
        padding: 'var(--spacing-md)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(102, 126, 234, 0.3)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(102, 126, 234, 0.5)',
        zIndex: 100,
        animation: 'hudFloat 3s ease-in-out infinite'
      }}>
        <HUDGauge label="Cost" value={totalCost} max={50000} color="#ff6b6b" />
        <HUDGauge label="Revenue" value={totalRevenue} max={75000} color="#4ecdc4" />
        <HUDGauge label="Margin" value={margin} max={25000} color="#ffd93d" />
        <div style={{
          marginLeft: 'var(--spacing-md)',
          color: 'white',
          fontFamily: "'Poppins', sans-serif",
          fontSize: '1.2em',
          textShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
        }}>
          Strategic Overview
        </div>
      </div>

      <DragPreview />
      <Confetti show={showConfetti} />
    </div>
  )
}

export default QuoteBuilder
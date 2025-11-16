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
 */import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useDrag, useDrop, useDragLayer } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Shovel, User, Wrench, Package, Zap, Plus, Save, Sparkles, Search, Volume2, VolumeX,
    Target, TrendingUp, Undo, Redo, Download, Star, Clock, Palette } from 'lucide-react'
import { api } from '../utils/api'
import CountUp from 'react-countup'

const initialNodes = []
const initialEdges = []

const getMaterialIcon = (category) => {
  const cat = category?.toLowerCase() || ''
  if (cat.includes('sand') || cat.includes('concrete') || cat.includes('gravel')) return <Shovel size={18} />
  if (cat.includes('labor') || cat.includes('worker')) return <User size={18} />
  if (cat.includes('equipment') || cat.includes('tool')) return <Wrench size={18} />
  return <Package size={18} />
}

const getItemIcon = (item) => {
  if (item.type === 'staff') return <User size={18} />
  if (item.type === 'equipment') return <Wrench size={18} />
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
  if (!initialOffset || !currentOffset) return { display: 'none' }
  const { x, y } = currentOffset
  return {
    position: 'fixed',
    left: x,
    top: y,
    transform: 'translate(-50%, -50%)',
  }
}

const Confetti = ({ show }) => {
  if (!show) return null
  const particles = Array.from({ length: 50 }, (_, i) => (
    <div key={i} style={{
      position: 'fixed',
      left: `${Math.random() * 100}%`,
      top: '-10px',
      width: '8px',
      height: '8px',
      backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
      animation: `confetti ${2 + Math.random() * 2}s ease-in-out forwards`,
      zIndex: 9999,
    }} />
  ))
  return <div>{particles}</div>
}

const Particles = ({ show }) => {
  if (!show) return null
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div key={i} style={{
      position: 'absolute',
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: '4px',
      height: '4px',
      backgroundColor: '#667eea',
      borderRadius: '50%',
      animation: `particle ${1 + Math.random() * 1}s ease-out forwards`,
      zIndex: 10,
    }} />
  ))
  return <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>{particles}</div>
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
  const particles = Array.from({ length: 10 }, (_, i) => (
    <div key={i} style={{
      position: 'absolute',
      left: x + Math.random() * 30 - 15,
      top: y + Math.random() * 30 - 15,
      width: '3px',
      height: '3px',
      backgroundColor: '#764ba2',
      borderRadius: '50%',
      animation: `trailParticle 0.5s ease-out forwards`,
      zIndex: 40,
    }} />
  ))
  return <div>{particles}</div>
}

const Tooltip = ({ children, content }) => {
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}
         onMouseEnter={() => setVisible(true)}
         onMouseLeave={() => setVisible(false)}>
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
          }} />
        </div>
      )}
    </div>
  )
}

const HUDGauge = ({ label, value, max, color, icon: Icon }) => {
  const percentage = Math.min((value / max) * 100, 100)
  const strokeDasharray = 283
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100

  return (
    <div style={{ textAlign: 'center', margin: '0 var(--spacing-md)', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        background: color,
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 8px ${color}`,
      }}>
        <Icon size={10} color="white" />
      </div>
      <svg width="90" height="90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text x="50" y="42" textAnchor="middle" fill="white" fontSize="9" fontFamily="'Poppins', sans-serif" fontWeight="bold" stroke="#000" strokeWidth="0.5">
          {label}
        </text>
        <text x="50" y="56" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" stroke="#000" strokeWidth="0.5" fontFamily="'Inter', sans-serif">
          $<CountUp end={value} decimals={0} duration={0.8} formattingFn={(val) => val.toLocaleString() } />
        </text>
      </svg>
    </div>
  )
}

const SoundToggle = ({ enabled, onToggle }) => (
  <Tooltip content={enabled ? 'Disable Sound Effects' : 'Enable Sound Effects'} position="left">
    <button onClick={onToggle} style={{
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
    }}>
      {enabled ? <Volume2 size={18} color="white" /> : <VolumeX size={18} color="white" />}
    </button>
  </Tooltip>
)

const DragPreview = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  if (!isDragging || itemType !== 'material') return null

  const material = item.material
  const getPreviewText = () => {
    if (material.type === 'staff') return `Charge: $${material.chargeRate}/hr`
    if (material.type === 'equipment') return `$${material.costRate}/day`
    return `$${material.pricePerUnit}/${material.unit}`
  }

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
          gap: 'var(--spacing-sm)',
          backdropFilter: 'blur(10px)',
          animation: 'pulse 2s infinite, glow 1s ease-in-out infinite alternate',
          minWidth: '180px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'spin 3s linear infinite'
          }}>
            {getItemIcon(material)}
          </div>
          <div>
            <strong style={{ fontSize: '1em', fontFamily: "'Poppins', sans-serif" }}>{material.name}</strong>
            <br />
            <small style={{ opacity: 0.9, fontFamily: "'Inter', sans-serif" }}>
              {getPreviewText()}
              <br />
              <span style={{ color: '#4ecdc4' }}>Click to set quantity</span>
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

const ItemCard = ({ item, onHover }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'material',
    item: { material: { ...item, type: item.type || 'material' } },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }))

  const getDisplayInfo = () => {
    if (item.type === 'staff') {
      return { label: item.name, sub: `Charge: $${item.chargeRate}/hr`, icon: <User size={16} />, color: '#28a745' }
    }
    if (item.type === 'equipment') {
      return { label: item.name, sub: `$${item.costRate}/day`, icon: <Wrench size={16} />, color: '#ffc107' }
    }
    return { label: item.name, sub: `$${item.pricePerUnit}/${item.unit}`, icon: getMaterialIcon(item.category), color: '#667eea' }
  }

  const { label, sub, icon, color } = getDisplayInfo()

  return (
    <Tooltip content={`${label}: ${item.category || item.role || 'Material'} - ${sub}`}>
      <div ref={drag} style={{
        padding: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-sm)',
        border: `2px solid ${isDragging ? color : 'var(--gray-200)'}`,
        borderRadius: '12px',
        cursor: 'grab',
        opacity: isDragging ? 0.7 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        boxShadow: isDragging ? `0 8px 25px ${color}40` : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        transform: isDragging ? 'rotate(3deg) scale(1.02)' : 'rotate(0deg) scale(1)',
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'
          e.currentTarget.style.boxShadow = `0 4px 16px ${color}25`
          e.currentTarget.style.borderColor = color
          onHover?.(item)
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
          e.currentTarget.style.borderColor = 'var(--gray-200)'
        }
      }}>
        <div style={{
          color: color,
          background: `${color}20`,
          borderRadius: '50%',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: isDragging ? 'none' : 'float 3s ease-in-out infinite',
          boxShadow: `0 0 8px ${color}25`,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', color: '#333', fontFamily: "'Poppins', sans-serif", fontSize: '0.95em' }}>
            {label}
          </div>
          <div style={{ fontSize: '0.8em', color: '#666', fontFamily: "'Inter', sans-serif" }}>
            {sub}
          </div>
        </div>
      </div>
    </Tooltip>
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
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [rippleEffect, setRippleEffect] = useState({ show: false, x: 0, y: 0 })
  const [particleTrail, setParticleTrail] = useState({ show: false, x: 0, y: 0 })
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [templates, setTemplates] = useState([])
  const [autoSaveEnabled] = useState(true)
  const [lastSaved, setLastSaved] = useState(null)
  const canvasRef = useRef(null)
  const autoSaveRef = useRef(null)

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && (nodes.length > 0 || quoteItems.length > 0)) {
      autoSaveRef.current = setTimeout(() => {
        const saveData = { nodes, edges, quoteItems, selectedProject, marginPct }
        localStorage.setItem('quoteBuilderAutoSave', JSON.stringify(saveData))
        setLastSaved(new Date())
      }, 30000)
    }
    return () => clearTimeout(autoSaveRef.current)
  }, [nodes, edges, quoteItems, selectedProject, marginPct, autoSaveEnabled])

  // Load auto-save on mount
  useEffect(() => {
    const saved = localStorage.getItem('quoteBuilderAutoSave')
    if (saved) {
      try {
        const saveData = JSON.parse(saved)
        setNodes(saveData.nodes || [])
        setEdges(saveData.edges || [])
        setQuoteItems(saveData.quoteItems || [])
        setSelectedProject(saveData.selectedProject || '')
        setMarginPct(saveData.marginPct || 20)
      } catch (err) {
        console.error('Failed to load auto-save:', err)
      }
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (nodes.length > 0 || quoteItems.length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [nodes.length, quoteItems.length])

  // Data fetching
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
        payRate: s.payRateBase || 0,
        chargeRate: s.chargeOutBase || 0
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
        costRate: e.costRateBase || 0
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

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300)
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

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'material',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset()
      if (!offset) return

      const material = item.material
      const quantity = prompt(`Enter quantity for ${material.name}:`, material.type === 'staff' ? '8' : material.type === 'equipment' ? '1' : '1')
      if (quantity && parseFloat(quantity) > 0) {
        const nodeType = material.type === 'staff' ? 'Staff' : material.type === 'equipment' ? 'Equipment' : 'Material'
        const newNode = {
          id: `${material.type}-${material.id}-${Date.now()}`,
          type: 'default',
          position: {
            x: Math.round((offset.x - 200) / 20) * 20,
            y: Math.round((offset.y - 100) / 20) * 20
          },
          data: {
            label: `${nodeType}: ${material.name} - Qty: ${quantity}`,
            material,
            quantity: parseFloat(quantity)
          },
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            padding: '10px',
            animation: 'nodeAppear 0.5s ease-out',
            fontFamily: "'Inter', sans-serif",
            minWidth: '160px',
            textAlign: 'center'
          }
        }
        setNodes((nds) => nds.concat(newNode))
        setQuoteItems(prev => [...prev, {
          nodeId: material.id,
          quantity: parseFloat(quantity),
          material,
          type: material.type
        }])
        setShowParticles(true)
        setRippleEffect({ show: true, x: offset.x, y: offset.y })
        setParticleTrail({ show: true, x: offset.x, y: offset.y })
        setTimeout(() => setShowParticles(false), 1200)
        setTimeout(() => setRippleEffect({ show: false, x: 0, y: 0 }), 600)
        setTimeout(() => setParticleTrail({ show: false, x: 0, y: 0 }), 800)
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }))

  // Mouse trail tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (particleTrail.show) {
        setParticleTrail({ show: true, x: e.clientX, y: e.clientY })
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [particleTrail.show])

  const calculateTotals = useCallback(() => {
    let totalCost = 0
    let totalRevenue = 0

    quoteItems.forEach(item => {
      let cost = 0
      let revenue = 0

      if (item.type === 'staff') {
        cost = (item.ordinaryHours || item.quantity) * item.material.payRate + (item.ot1Hours || 0) * (item.material.payRateOT1 || item.material.payRate) + (item.ot2Hours || 0) * (item.material.payRateOT2 || item.material.payRate)
        revenue = (item.ordinaryHours || item.quantity) * item.material.chargeRate + (item.ot1Hours || 0) * (item.material.chargeOutOT1 || item.material.chargeRate) + (item.ot2Hours || 0) * (item.material.chargeOutOT2 || item.material.chargeRate)
      } else if (item.type === 'equipment') {
        cost = (item.ordinaryHours || item.quantity) * item.material.costRate + (item.ot1Hours || 0) * (item.material.costRateOT1 || item.material.costRate) + (item.ot2Hours || 0) * (item.material.costRateOT2 || item.material.costRate)
        revenue = cost * (1 + marginPct / 100)
      } else {
        cost = item.material.pricePerUnit * item.quantity
        revenue = cost * (1 + marginPct / 100)
      }

      totalCost += cost
      totalRevenue += revenue
    })

    const margin = totalRevenue - totalCost
    return { totalCost, totalRevenue, margin }
  }, [quoteItems, marginPct])

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
        equipment: quoteItems.filter(item => item.type === 'equipment').map(item => ({ equipmentId: item.nodeId, hours: item.quantity }))
      }
      await api.post('/quotes', data)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      alert('🎉 Quote deployed successfully!')
      localStorage.removeItem('quoteBuilderAutoSave')
      setNodes([])
      setEdges([])
      setQuoteItems([])
    } catch (err) {
      alert('Error saving quote: ' + (err.response?.data?.error || err.message))
    }
  }

  // Template functions
  const saveAsTemplate = () => {
    const template = {
      name: prompt('Template name:') || `Template ${Date.now()}`,
      nodes,
      edges,
      quoteItems,
      marginPct
    }
    const existing = JSON.parse(localStorage.getItem('quoteTemplates') || '[]')
    existing.push(template)
    localStorage.setItem('quoteTemplates', JSON.stringify(existing))
    setTemplates(existing)
  }

  const loadTemplate = (template) => {
    setNodes(template.nodes || [])
    setEdges(template.edges || [])
    setQuoteItems(template.quoteItems || [])
    setMarginPct(template.marginPct || 20)
  }

  // Load templates
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('quoteTemplates') || '[]')
    setTemplates(saved)
  }, [])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
          from { box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); }
          to { box-shadow: 0 0 40px rgba(102, 126, 234, 1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0, -15px, 0); }
          70% { transform: translate3d(0, -7px, 0); }
          90% { transform: translate3d(0, -2px, 0); }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes trailParticle {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 16px;
        --spacing-lg: 24px;
        --spacing-xl: 32px;
        --gray-200: #e9ecef;
        --primary-color: #667eea;
      `}</style>

      {/* Background Layers */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80) no-repeat center center',
        backgroundSize: 'cover',
        opacity: theme === 'dark' ? 0.06 : 0.04,
        zIndex: -2,
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
        animation: 'lighting 12s ease-in-out infinite alternate'
      }}></div>

      <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />

      <Particles show={showParticles} />
      <RippleEffect show={rippleEffect.show} x={rippleEffect.x} y={rippleEffect.y} />
      <ParticleTrail show={particleTrail.show} x={particleTrail.x} y={particleTrail.y} />
      <Confetti show={showConfetti} />

      {/* Enhanced Sidebar */}
      <div style={{
        width: '340px',
        padding: 'var(--spacing-xl)',
        borderRight: '2px solid rgba(102, 126, 234, 0.5)',
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: theme === 'dark'
          ? 'rgba(26, 26, 46, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        borderRadius: '0 25px 25px 0',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderLeft: 'none'
      }}>
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
          <Sparkles size={28} color="#667eea" style={{ animation: 'float 2s ease-in-out infinite' }} />
          <h3 style={{
            margin: 0,
            color: theme === 'dark' ? '#ffffff' : '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            textShadow: theme === 'dark' ? '0 0 20px rgba(102, 126, 234, 0.5)' : 'none',
            fontSize: '2em',
            animation: 'float 3s ease-in-out infinite reverse'
          }}>
            Strategic Builder
          </h3>
        </div>

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-lg)',
          flexWrap: 'wrap'
        }}>
          <button onClick={saveAsTemplate} style={{
            padding: '6px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }} title="Save as Template">
            <Star size={14} />
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{
            padding: '6px',
            background: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }} title="Toggle Theme">
            <Palette size={14} />
          </button>
        </div>

        {/* Templates */}
        {templates.length > 0 && (
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <select onChange={(e) => {
              const template = templates.find(t => t.name === e.target.value)
              if (template) loadTemplate(template)
            }} style={{
              width: '100%',
              padding: 'var(--spacing-sm)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '6px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              color: theme === 'dark' ? 'white' : '#333'
            }}>
              <option value="">Load Template...</option>
              {templates.map(template => (
                <option key={template.name} value={template.name}>{template.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Search */}
        <div style={{
          position: 'relative',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#667eea' }} />
          <input
            type="text"
            placeholder="🔍 Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 34px',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              color: theme === 'dark' ? 'white' : '#333',
              fontFamily: "'Inter', sans-serif"
            }}
          />
        </div>

        {/* Project Selector */}
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{
          width: '100%',
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-sm)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '8px',
          background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          color: theme === 'dark' ? 'white' : '#333'
        }}>
          <option value="">🎯 Select Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>📁 {p.name}</option>
          ))}
        </select>

        {/* Margin Control */}
        <div style={{
          marginBottom: 'var(--spacing-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          background: 'rgba(102, 126, 234, 0.1)',
          padding: 'var(--spacing-md)',
          borderRadius: '8px'
        }}>
          <TrendingUp size={18} color="#4ecdc4" />
          <label style={{ color: theme === 'dark' ? '#ffffff' : '#333', fontWeight: '500' }}>
            Margin %:
          </label>
          <input
            type="number"
            value={marginPct}
            onChange={(e) => setMarginPct(parseFloat(e.target.value))}
            min="0"
            max="100"
            step="0.1"
            style={{
              flex: 1,
              padding: 'var(--spacing-sm)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '6px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              color: theme === 'dark' ? 'white' : '#333',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          />
        </div>

        {/* Status */}
        <div style={{
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-sm)',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px' }}>
            <Clock size={14} color="#ffc107" />
            <span style={{ color: theme === 'dark' ? '#ffffff' : '#333', fontSize: '0.85em' }}>
              Auto-save: ON
            </span>
          </div>
          {lastSaved && (
            <div style={{ color: '#666', fontSize: '0.75em' }}>
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Item Lists */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h4 style={{ color: theme === 'dark' ? '#ffffff' : '#333', marginBottom: 'var(--spacing-sm)' }}>
            <Package size={18} style={{ color: '#667eea', marginRight: 'var(--spacing-sm)' }} />
            Materials ({filteredMaterials.length})
          </h4>
          {filteredMaterials.map(material => (
            <ItemCard
              key={`material-${material.id}`}
              item={{ ...material, type: 'material' }}
              onHover={setHoveredItem}
            />
          ))}
        </div>

        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h4 style={{ color: theme === 'dark' ? '#ffffff' : '#333', marginBottom: 'var(--spacing-sm)' }}>
            <User size={18} style={{ color: '#28a745', marginRight: 'var(--spacing-sm)' }} />
            Staff ({filteredStaff.length})
          </h4>
          {filteredStaff.map(s => (
            <ItemCard
              key={`staff-${s.id}`}
              item={{ ...s, type: 'staff' }}
              onHover={setHoveredItem}
            />
          ))}
        </div>

        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h4 style={{ color: theme === 'dark' ? '#ffffff' : '#333', marginBottom: 'var(--spacing-sm)' }}>
            <Wrench size={18} style={{ color: '#ffc107', marginRight: 'var(--spacing-sm)' }} />
            Equipment ({filteredEquipment.length})
          </h4>
          {filteredEquipment.map(e => (
            <ItemCard
              key={`equipment-${e.id}`}
              item={{ ...e, type: 'equipment' }}
              onHover={setHoveredItem}
            />
          ))}
        </div>

        {/* Save Button */}
        <button onClick={saveQuote} style={{
          width: '100%',
          padding: 'var(--spacing-lg)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1em',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
          fontFamily: "'Poppins', sans-serif",
          textShadow: '0 0 8px rgba(255,255,255,0.5)',
          transform: 'translateY(0)',
          animation: 'pulse 2s infinite'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)'
          e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)'
        }}>
          <Target size={18} />
          🚀 Deploy Quote
        </button>

        {/* Summary */}
        <div style={{
          marginTop: 'var(--spacing-lg)',
          padding: 'var(--spacing-lg)',
          background: 'linear-gradient(135deg, #f093fb20 0%, #f5576c20 100%)',
          borderRadius: '12px',
          color: theme === 'dark' ? 'white' : '#333',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid rgba(240, 147, 251, 0.3)'
        }}>
          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: '#f093fb' }}>
            <Zap size={16} />
            Overview
          </h4>
          <p style={{ margin: 'var(--spacing-xs) 0', color: margin > 0 ? '#4ecdc4' : '#ff6b6b' }}>
            💰 Cost: <strong>\${totalCost.toFixed(2)}</strong>
          </p>
          <p style={{ margin: 'var(--spacing-xs) 0', color: margin > 0 ? '#4ecdc4' : '#ff6b6b' }}>
            📈 Revenue: <strong>\${totalRevenue.toFixed(2)}</strong>
          </p>
          <p style={{ margin: 'var(--spacing-xs) 0', color: margin > 0 ? '#4ecdc4' : '#ff6b6b', fontWeight: 'bold' }}>
            🎯 Margin: <strong>${margin.toFixed(2)}</strong>
          </p>
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
          margin: 'var(--spacing-xl)',
          boxShadow: isOver ? '0 0 40px rgba(102, 126, 234, 0.8)' : '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
       
       
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          snapToGrid={true}
          snapGrid={[20, 20]}
          fitView
          style={{ borderRadius: '22px' }}
        >
          <MiniMap style={{
            background: 'rgba(26, 26, 46, 0.9)',
            borderRadius: '8px',
            border: '1px solid rgba(102, 126, 234, 0.3)'
          }} />
          <Controls style={{
            background: 'rgba(26, 26, 46, 0.9)',
            borderRadius: '8px',
            border: '1px solid rgba(102, 126, 234, 0.3)'
          }} />
          <Background color="#667eea" gap={20} size={1} />
        </ReactFlow>
      </div>

      {/* HUD */}
      <div style={{
        position: 'absolute',
        bottom: '25px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(26, 26, 46, 0.95)',
        borderRadius: '20px',
        padding: 'var(--spacing-lg)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(102, 126, 234, 0.4)',
        zIndex: 100,
        gap: 'var(--spacing-lg)'
      }}>
        <HUDGauge label="Cost" value={totalCost} max={50000} color="#ff6b6b" icon={Package} />
        <HUDGauge label="Revenue" value={totalRevenue} max={75000} color="#4ecdc4" icon={TrendingUp} />
        <HUDGauge label="Margin" value={margin} max={25000} color="#ffd93d" icon={Star} />
        <div style={{
          marginLeft: 'var(--spacing-md)',
          color: 'white',
          fontFamily: "'Poppins', sans-serif",
          fontSize: '1.2em',
          textShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.6em', opacity: 0.8 }}>Items</div>
          <div style={{
            fontSize: '1.8em',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {nodes.length}
          </div>
        </div>
      </div>

      {/* Hover Info */}
      {hoveredItem && (
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'rgba(26, 26, 46, 0.95)',
          borderRadius: '12px',
          padding: 'var(--spacing-lg)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          backdropFilter: 'blur(10px)',
          zIndex: 50
        }}>
          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'white', fontSize: '1em' }}>
            {hoveredItem.name}
          </h4>
          <p style={{ margin: '0', color: '#ccc', fontSize: '0.85em' }}>
            {hoveredItem.type === 'staff'
              ? `Charge: $${hoveredItem.chargeRate}/hr`
              : hoveredItem.type === 'equipment'
              ? `Cost: $${hoveredItem.costRate}/day`
              : `Price: $${hoveredItem.pricePerUnit}/${hoveredItem.unit}`
            }
          </p>
        </div>
      )}

      <DragPreview />
    </div>
  )
}

export default QuoteBuilder

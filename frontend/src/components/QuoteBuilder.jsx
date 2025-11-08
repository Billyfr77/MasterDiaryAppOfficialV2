import React, { useState, useEffect, useCallback } from 'react'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useDrag, useDrop, useDragLayer } from 'react-dnd'
import { Shovel, User, Wrench, Package, Zap, Plus, Save, Sparkles } from 'lucide-react'
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
          {getMaterialIcon(material.category)}
          <div>
            <strong>{material.name}</strong>
            <br />
            <small>${material.pricePerUnit}/{material.unit}</small>
          </div>
        </div>
      </div>
    </div>
  )
}

const MaterialItem = ({ material }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'material',
    item: { material },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

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
      aria-label={`Drag ${material.name} costing $${material.pricePerUnit} per ${material.unit}`}
    >
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
        {getMaterialIcon(material.category)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', color: '#333', fontFamily: "'Poppins', sans-serif" }}>{material.name}</div>
        <div style={{ fontSize: '0.9em', color: '#666', fontFamily: "'Inter', sans-serif" }}>${material.pricePerUnit}/{material.unit}</div>
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
  const [projects, setProjects] = useState([])
  const [quoteItems, setQuoteItems] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [marginPct, setMarginPct] = useState(20)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/nodes')
      setMaterials(response.data.data || response.data)
    } catch (err) {
      console.error('Error fetching materials:', err)
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
    fetchProjects()
  }, [])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'material',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset()
      const material = item.material
      const quantity = prompt(`Enter quantity for ${material.name}:`, '1')
      if (quantity) {
        const newNode = {
          id: `${material.id}-${Date.now()}`,
          type: 'default',
          position: { x: offset.x - 200, y: offset.y - 100 },
          data: { label: `${material.name} - Qty: ${quantity} ${material.unit}` },
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            padding: '10px',
            animation: 'nodeAppear 0.5s ease-out'
          }
        }
        setNodes((nds) => nds.concat(newNode))
        setQuoteItems(prev => [...prev, { nodeId: material.id, quantity: parseFloat(quantity), material }])
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 1000)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const calculateTotals = () => {
    const totalCost = quoteItems.reduce((sum, item) => sum + (item.material.pricePerUnit * item.quantity), 0)
    const totalRevenue = totalCost * (1 + marginPct / 100)
    const margin = totalRevenue - totalCost
    return { totalCost, totalRevenue, margin }
  }

  const { totalCost, totalRevenue, margin } = calculateTotals()

  const saveQuote = async () => {
    if (!selectedProject || quoteItems.length === 0) {
      alert('Select a project and add materials.')
      return
    }
    try {
      const data = {
        name: `Quote ${Date.now()}`,
        projectId: selectedProject,
        marginPct,
        nodes: quoteItems.map(item => ({ nodeId: item.nodeId, quantity: item.quantity }))
      }
      await api.post('/quotes', data)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      alert('Quote saved!')
      setNodes([])
      setEdges([])
      setQuoteItems([])
    } catch (err) {
      alert('Error saving quote: ' + (err.response?.data?.error || err.message))
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      fontFamily: "'Inter', sans-serif"
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
      `}</style>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80) no-repeat center center',
        backgroundSize: 'cover',
        opacity: 0.1,
        zIndex: -1
      }}></div>
      {/* Sidebar */}
      <div style={{
        width: '320px',
        padding: 'var(--spacing-lg)',
        borderRight: '1px solid rgba(255,255,255,0.2)',
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        borderRadius: '0 20px 20px 0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-lg)',
          paddingBottom: 'var(--spacing-md)',
          borderBottom: '2px solid #667eea'
        }}>
          <Sparkles size={24} color="#667eea" />
          <h3 style={{ margin: 0, color: '#333', fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Materials Library</h3>
        </div>
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{
          width: '100%',
          marginBottom: 'var(--spacing-md)',
          padding: 'var(--spacing-sm)',
          border: '1px solid var(--gray-300)',
          borderRadius: '8px',
          background: 'white',
          fontFamily: "'Inter', sans-serif"
        }}>
          <option value="">Select Project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div style={{
          marginBottom: 'var(--spacing-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)'
        }}>
          <label style={{ color: '#333', fontFamily: "'Inter', sans-serif" }}>Margin %:</label>
          <input type="number" placeholder="Margin %" value={marginPct} onChange={(e) => setMarginPct(parseFloat(e.target.value))} style={{
            flex: 1,
            padding: 'var(--spacing-sm)',
            border: '1px solid var(--gray-300)',
            borderRadius: '8px',
            background: 'white',
            fontFamily: "'Inter', sans-serif"
          }} />
        </div>
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          {materials.map(material => (
            <MaterialItem key={material.id} material={material} />
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
          fontFamily: "'Poppins', sans-serif"
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
          Save Quote
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
        ref={drop}
        style={{
          flex: 1,
          transition: 'all 0.5s ease',
          backgroundColor: isOver ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255,255,255,0.1)',
          border: isOver ? '3px dashed #667eea' : '3px dashed transparent',
          borderRadius: '20px',
          margin: 'var(--spacing-lg)',
          boxShadow: isOver ? '0 0 30px rgba(102, 126, 234, 0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}
      >
        <Particles show={showParticles} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '1.2em',
          textAlign: 'center',
          zIndex: 1,
          fontFamily: "'Poppins', sans-serif"
        }}>
          {isOver ? '🎉 Drop materials here!' : '✨ Drag materials from the sidebar to build your quote'}
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          style={{ borderRadius: '17px' }}
        >
          <MiniMap style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '8px' }} />
          <Controls style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '8px' }} />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>

      <DragPreview />
      <Confetti show={showConfetti} />
    </div>
  )
}

export default QuoteBuilder
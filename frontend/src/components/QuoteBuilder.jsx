import React, { useState, useEffect, useCallback } from 'react'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { api } from '../utils/api'

const initialNodes = []
const initialEdges = []

const QuoteBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [materials, setMaterials] = useState([])
  const [projects, setProjects] = useState([])
  const [quoteItems, setQuoteItems] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [marginPct, setMarginPct] = useState(20)

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

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      const materialId = event.dataTransfer.getData('application/reactflow')
      const material = materials.find(m => m.id === materialId)
      if (material) {
        const quantity = prompt(`Enter quantity for ${material.name}:`, '1')
        if (quantity) {
          const newNode = {
            id: `${material.id}-${Date.now()}`,
            type: 'default',
            position: { x: event.clientX - 200, y: event.clientY - 100 },
            data: { label: `${material.name} - Qty: ${quantity} ${material.unit}` },
          }
          setNodes((nds) => nds.concat(newNode))
          setQuoteItems(prev => [...prev, { nodeId: material.id, quantity: parseFloat(quantity), material }])
        }
      }
    },
    [materials, setNodes]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const calculateTotals = () => {
    const totalCost = quoteItems.reduce((sum, item) => sum + (item.material.pricePerUnit * item.quantity), 0)
    const totalRevenue = totalCost * (1 + marginPct / 100)
    return { totalCost, totalRevenue }
  }

  const { totalCost, totalRevenue } = calculateTotals()

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
      alert('Quote saved!')
      setNodes([])
      setEdges([])
      setQuoteItems([])
    } catch (err) {
      alert('Error saving quote: ' + (err.response?.data?.error || err.message))
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', padding: 'var(--spacing-md)', borderRight: '1px solid var(--gray-200)', overflowY: 'auto' }}>
        <h3>Materials Library</h3>
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}>
          <option value="">Select Project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="number" placeholder="Margin %" value={marginPct} onChange={(e) => setMarginPct(parseFloat(e.target.value))} style={{ width: '100%', marginBottom: 'var(--spacing-md)' }} />
        <div>
          {materials.map(material => (
            <div
              key={material.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', material.id)}
              style={{ padding: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)', border: '1px solid var(--gray-200)', cursor: 'grab' }}
            >
              {material.name} (${material.pricePerUnit}/{material.unit})
            </div>
          ))}
        </div>
        <button onClick={saveQuote} style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>Save Quote</button>
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <h4>Totals</h4>
          <p>Cost: ${totalCost.toFixed(2)}</p>
          <p>Revenue: ${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  )
}

export default QuoteBuilder
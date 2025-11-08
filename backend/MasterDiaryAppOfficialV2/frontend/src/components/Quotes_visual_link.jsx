import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { api } from '../utils/api'
import jsPDF from 'jspdf'

const Quotes = () => {
  const [quotes, setQuotes] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [editingQuote, setEditingQuote] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    projectId: projectId || '',
    marginPct: 20,
    nodes: [],
    staff: [],
    equipment: []
  })

  // Available items for selection
  const [availableNodes, setAvailableNodes] = useState([])
  const [availableStaff, setAvailableStaff] = useState([])
  const [availableEquipment, setAvailableEquipment] = useState([])

  useEffect(() => {
    fetchData()
    if (projectId) {
      setFormData(prev => ({ ...prev, projectId }))
    }
  }, [projectId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [quotesRes, projectsRes, nodesRes, staffRes, equipmentRes] = await Promise.all([
        api.get('/quotes'),
        api.get('/projects'),
        api.get('/nodes'),
        api.get('/staff'),
        api.get('/equipment')
      ])

      setQuotes(quotesRes.data.data || quotesRes.data)
      setProjects(projectsRes.data.data || projectsRes.data)
      setAvailableNodes(nodesRes.data.data || nodesRes.data)
      setAvailableStaff(staffRes.data.data || staffRes.data)
      setAvailableEquipment(equipmentRes.data.data || equipmentRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      alert('Error loading data: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote)
  }

  const handleEditQuote = (quote) => {
    setEditingQuote(quote)
    setFormData({
      name: quote.name,
      projectId: quote.projectId,
      marginPct: quote.marginPct,
      nodes: quote.nodes || [],
      staff: quote.staff || [],
      equipment: quote.equipment || []
    })
    setShowCreateForm(true)
  }

  const handleDeleteQuote = async (quoteId) => {
    if (!confirm('Are you sure you want to delete this quote?')) return

    try {
      await api.delete(`/quotes/${quoteId}`)
      setQuotes(quotes.filter(q => q.id !== quoteId))
      alert('Quote deleted successfully')
    } catch (err) {
      alert('Error deleting quote: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleCreateQuote = () => {
    setEditingQuote(null)
    setFormData({
      name: '',
      projectId: projectId || '',
      marginPct: 20,
      nodes: [],
      staff: [],
      equipment: []
    })
    setShowCreateForm(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      const quoteData = {
        name: formData.name,
        projectId: formData.projectId,
        marginPct: parseFloat(formData.marginPct),
        nodes: formData.nodes.filter(item => item.nodeId && item.quantity > 0),
        staff: formData.staff.filter(item => item.staffId && item.hours > 0),
        equipment: formData.equipment.filter(item => item.equipmentId && item.hours > 0)
      }

      if (editingQuote) {
        const response = await api.put(`/quotes/${editingQuote.id}`, quoteData)
        setQuotes(quotes.map(q => q.id === editingQuote.id ? response.data : q))
        alert('Quote updated successfully')
      } else {
        const response = await api.post('/quotes', quoteData)
        setQuotes([response.data, ...quotes])
        alert('Quote created successfully')
      }

      setShowCreateForm(false)
      setEditingQuote(null)
    } catch (err) {
      alert('Error saving quote: ' + (err.response?.data?.error || err.message))
    }
  }

  const addItem = (type, itemId) => {
    const itemKey = `${type}Id`
    const arrayName = type + 's'
    const existingItem = formData[arrayName].find(item => item[itemKey] === itemId)

    if (!existingItem) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], {
          [itemKey]: itemId,
          [type === 'node' ? 'quantity' : 'hours']: 1
        }]
      }))
    }
  }

  const updateItemQuantity = (type, itemId, value) => {
    const itemKey = `${type}Id`
    const arrayName = type + 's'

    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map(item =>
        item[itemKey] === itemId
          ? { ...item, [type === 'node' ? 'quantity' : 'hours']: parseFloat(value) || 0 }
          : item
      )
    }))
  }

  const removeItem = (type, itemId) => {
    const itemKey = `${type}Id`
    const arrayName = type + 's'

    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter(item => item[itemKey] !== itemId)
    }))
  }

  const calculateItemCost = (type, itemId, quantity) => {
    let item
    switch (type) {
      case 'node':
        item = availableNodes.find(n => n.id === itemId)
        return item ? (parseFloat(item.pricePerUnit) * quantity) : 0
      case 'staff':
        item = availableStaff.find(s => s.id === itemId)
        return item ? (parseFloat(item.chargeOutBase || item.payRateBase) * quantity) : 0
      case 'equipment':
        item = availableEquipment.find(e => e.id === itemId)
        return item ? (parseFloat(item.costRateBase) * quantity) : 0
      default:
        return 0
    }
  }

  const calculateTotalCost = () => {
    let total = 0
    formData.nodes.forEach(item => {
      total += calculateItemCost('node', item.nodeId, item.quantity || 0)
    })
    formData.staff.forEach(item => {
      total += calculateItemCost('staff', item.staffId, item.hours || 0)
    })
    formData.equipment.forEach(item => {
      total += calculateItemCost('equipment', item.equipmentId, item.hours || 0)
    })
    return total
  }

  const calculateTotalRevenue = () => {
    const cost = calculateTotalCost()
    return cost * (1 + (parseFloat(formData.marginPct) / 100))
  }

  const exportToPDF = (quote) => {
    const doc = new jsPDF()
    doc.text(`Quote: ${quote.name}`, 14, 20)
    doc.text(`Project: ${quote.project?.name || 'N/A'}`, 14, 30)
    doc.text(`Margin: ${quote.marginPct}%`, 14, 40)

    let y = 50

    if (quote.nodes && quote.nodes.length > 0) {
      doc.text('Materials:', 14, y)
      y += 10
      quote.nodes.forEach(item => {
        const node = availableNodes.find(n => n.id === item.nodeId)
        if (node) {
          doc.text(`${node.name}: ${item.quantity} ${node.unit} @ $${node.pricePerUnit} = $${(node.pricePerUnit * item.quantity).toFixed(2)}`, 14, y)
          y += 8
        }
      })
    }

    if (quote.staff && quote.staff.length > 0) {
      doc.text('Staff:', 14, y)
      y += 10
      quote.staff.forEach(item => {
        const staff = availableStaff.find(s => s.id === item.staffId)
        if (staff) {
          const rate = staff.chargeOutBase || staff.payRateBase
          doc.text(`${staff.name}: ${item.hours} hours @ $${rate} = $${(rate * item.hours).toFixed(2)}`, 14, y)
          y += 8
        }
      })
    }

    if (quote.equipment && quote.equipment.length > 0) {
      doc.text('Equipment:', 14, y)
      y += 10
      quote.equipment.forEach(item => {
        const equipment = availableEquipment.find(e => e.id === item.equipmentId)
        if (equipment) {
          doc.text(`${equipment.name}: ${item.hours} hours @ $${equipment.costRateBase} = $${(equipment.costRateBase * item.hours).toFixed(2)}`, 14, y)
          y += 8
        }
      })
    }

    doc.text(`Total Cost: $${quote.totalCost}`, 14, y + 10)
    doc.text(`Total Revenue: $${quote.totalRevenue}`, 14, y + 20)

    doc.save(`quote_${quote.name.replace(/\s+/g, '_')}.pdf`)
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading quotes...</div>
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Quotes {projectId && `(Filtered by Project)`}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* VISUAL QUOTE BUILDER LINK - PROMINENT AND CLEAR */}
          <Link
            to="/quotes/new"
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              border: '2px solid #28a745',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#218838'
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#28a745'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'
            }}
          >
            🎨 VISUAL QUOTE BUILDER
          </Link>
          <button
            onClick={handleCreateQuote}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Create Quote (Form)
          </button>
        </div>
      </div>

      {/* VISUAL BUILDER PROMO BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>🎨 Experience Visual Quote Building!</h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
          Drag & drop materials, staff, and equipment onto an interactive canvas with real-time cost calculations,
          particle effects, and professional animations!
        </p>
        <Link
          to="/quotes/new"
          style={{
            display: 'inline-block',
            padding: '12px 30px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '25px',
            fontWeight: 'bold',
            fontSize: '18px',
            border: '2px solid rgba(255,255,255,0.5)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'
            e.target.style.transform = 'scale(1.05)'
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'
            e.target.style.transform = 'scale(1)'
          }}
        >
          🚀 Launch Visual Builder
        </Link>
      </div>

      {/* Quotes Table */}
      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Project</th>
              <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Total Cost</th>
              <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Total Revenue</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Margin %</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(quote => (
              <tr key={quote.id} style={{ border: '1px solid #ddd' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{quote.name}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{quote.project?.name}</td>
                <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>${quote.totalCost}</td>
                <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>${quote.totalRevenue}</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{quote.marginPct}%</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => handleViewQuote(quote)}
                    style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditQuote(quote)}
                    style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => exportToPDF(quote)}
                    style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleDeleteQuote(quote.id)}
                    style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Quote Modal */}
      {selectedQuote && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <h3>Quote Details: {selectedQuote.name}</h3>
            <p><strong>Project:</strong> {selectedQuote.project?.name}</p>
            <p><strong>Margin:</strong> {selectedQuote.marginPct}%</p>

            {selectedQuote.nodes && selectedQuote.nodes.length > 0 && (
              <div>
                <h4>Materials:</h4>
                <ul>
                  {selectedQuote.nodes.map((item, index) => {
                    const node = availableNodes.find(n => n.id === item.nodeId)
                    return (
                      <li key={index}>
                        {node?.name}: {item.quantity} {node?.unit} @ ${node?.pricePerUnit} = ${(node?.pricePerUnit * item.quantity).toFixed(2)}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {selectedQuote.staff && selectedQuote.staff.length > 0 && (
              <div>
                <h4>Staff:</h4>
                <ul>
                  {selectedQuote.staff.map((item, index) => {
                    const staff = availableStaff.find(s => s.id === item.staffId)
                    const rate = staff?.chargeOutBase || staff?.payRateBase
                    return (
                      <li key={index}>
                        {staff?.name}: {item.hours} hours @ ${rate} = ${(rate * item.hours).toFixed(2)}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {selectedQuote.equipment && selectedQuote.equipment.length > 0 && (
              <div>
                <h4>Equipment:</h4>
                <ul>
                  {selectedQuote.equipment.map((item, index) => {
                    const equipment = availableEquipment.find(e => e.id === item.equipmentId)
                    return (
                      <li key={index}>
                        {equipment?.name}: {item.hours} hours @ ${equipment?.costRateBase} = ${(equipment?.costRateBase * item.hours).toFixed(2)}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <p><strong>Total Cost:</strong> ${selectedQuote.totalCost}</p>
              <p><strong>Total Revenue:</strong> ${selectedQuote.totalRevenue}</p>
              <p><strong>Margin:</strong> ${(selectedQuote.totalRevenue - selectedQuote.totalCost).toFixed(2)}</p>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => exportToPDF(selectedQuote)}
                style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Export PDF
              </button>
              <button
                onClick={() => setSelectedQuote(null)}
                style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Quote Form - Simplified */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '95%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
              <h4>💡 For Visual Quote Building:</h4>
              <p>Use the <strong>"VISUAL QUOTE BUILDER"</strong> button above for drag-and-drop interface!</p>
              <Link
                to="/quotes/new"
                style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold'
                }}
              >
                Go to Visual Builder →
              </Link>
            </div>

            <h3>{editingQuote ? 'Edit Quote (Basic Form)' : 'Create Quote (Basic Form)'}</h3>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Quote Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Project:</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Margin Percentage:</label>
                <input
                  type="number"
                  value={formData.marginPct}
                  onChange={(e) => setFormData({ ...formData, marginPct: e.target.value })}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setEditingQuote(null) }}
                  style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {editingQuote ? 'Update Quote' : 'Create Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Quotes
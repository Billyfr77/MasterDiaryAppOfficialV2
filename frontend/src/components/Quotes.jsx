import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

const Quotes = () => {
  const [quotes, setQuotes] = useState([])
  const [projects, setProjects] = useState([])
  const [nodes, setNodes] = useState([])
  const [form, setForm] = useState({ name: '', projectId: '', marginPct: '', nodes: [] })
  const [currentNode, setCurrentNode] = useState({ nodeId: '', quantity: '' })
  const [editing, setEditing] = useState(null)

  const fetchQuotes = async () => {
    try {
      const response = await api.get('/quotes')
      setQuotes(response.data.data || response.data)
    } catch (err) {
      alert('Error fetching quotes: ' + (err.response?.data?.error || err.message))
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

  const fetchNodes = async () => {
    try {
      const response = await api.get('/nodes')
      setNodes(response.data.data || response.data)
    } catch (err) {
      console.error('Error fetching nodes:', err)
    }
  }

  useEffect(() => {
    fetchQuotes()
    fetchProjects()
    fetchNodes()
  }, [])

  const addNodeToQuote = () => {
    const node = nodes.find(n => n.id === currentNode.nodeId)
    if (node && currentNode.quantity > 0) {
      setForm({
        ...form,
        nodes: [...form.nodes, { ...currentNode, nodeName: node.name, unit: node.unit, pricePerUnit: node.pricePerUnit }]
      })
      setCurrentNode({ nodeId: '', quantity: '' })
    }
  }

  const removeNodeFromQuote = (index) => {
    setForm({
      ...form,
      nodes: form.nodes.filter((_, i) => i !== index)
    })
  }

  const calculateSubtotal = (node) => {
    return (parseFloat(node.pricePerUnit) * parseFloat(node.quantity)).toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        name: form.name,
        projectId: form.projectId,
        marginPct: parseFloat(form.marginPct),
        nodes: form.nodes.map(n => ({ nodeId: n.nodeId, quantity: parseFloat(n.quantity) }))
      }
      if (editing) {
        await api.put(`/quotes/${editing}`, dataToSend)
        setEditing(null)
      } else {
        await api.post('/quotes', dataToSend)
      }
      setForm({ name: '', projectId: '', marginPct: '', nodes: [] })
      fetchQuotes()
    } catch (err) {
      alert('Error saving quote: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await api.delete(`/quotes/${id}`)
        fetchQuotes()
      } catch (err) {
        alert('Error deleting quote: ' + (err.response?.data?.error || err.message))
      }
    }
  }

  return (
    <div>
<Link to="/quotes/library"
    className="btn btn-primary" style={{ marginBottom: 'var(--spacing-md)' }}>Manage Materials Library</Link>
      <h2>Quotes</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)' }}>
        <input placeholder="Quote Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
          <option value="">Select Project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="number" step="0.01" placeholder="Margin %" value={form.marginPct} onChange={(e) => setForm({ ...form, marginPct: e.target.value })} required />

        <h3>Add Materials</h3>
        <select value={currentNode.nodeId} onChange={(e) => setCurrentNode({ ...currentNode, nodeId: e.target.value })}>
          <option value="">Select Material</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.name} (${n.pricePerUnit}/{n.unit})</option>)}
        </select>
        <input type="number" step="0.01" placeholder="Quantity" value={currentNode.quantity} onChange={(e) => setCurrentNode({ ...currentNode, quantity: e.target.value })} />
        <button type="button" onClick={addNodeToQuote}>Add Material</button>

        <table style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
          <thead>
            <tr>
              <th>Material</th>
              <th>Unit</th>
              <th>Price/Unit</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {form.nodes.map((node, index) => (
              <tr key={index}>
                <td>{node.nodeName}</td>
                <td>{node.unit}</td>
                <td>${node.pricePerUnit}</td>
                <td>{node.quantity}</td>
                <td>${calculateSubtotal(node)}</td>
                <td><button type="button" onClick={() => removeNodeFromQuote(index)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="submit">{editing ? 'Update' : 'Create'} Quote</button>
        {editing && <button type="button" onClick={() => { setForm({ name: '', projectId: '', marginPct: '', nodes: [] }); setEditing(null) }}>Cancel</button>}
      </form>

      <div>
        {quotes.map(quote => (
          <div key={quote.id} style={{ border: '1px solid var(--gray-200)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', borderRadius: 'var(--border-radius)' }}>
            <h3>{quote.name}</h3>
            <p>Project: {quote.project?.name}</p>
            <p>Total Cost: ${quote.totalCost}</p>
            <p>Total Revenue: ${quote.totalRevenue}</p>
            <p>Margin: {quote.marginPct}%</p>
            <button onClick={() => handleDelete(quote.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Quotes
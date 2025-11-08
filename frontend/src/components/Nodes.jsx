import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'

const Nodes = () => {
  const [nodes, setNodes] = useState([])
  const [form, setForm] = useState({ name: '', category: '', unit: '', pricePerUnit: '' })
  const [editing, setEditing] = useState(null)

  const fetchNodes = async () => {
    try {
      const response = await api.get('/nodes')
      setNodes(response.data.data || response.data)
    } catch (err) {
      alert('Error fetching nodes: ' + (err.response?.data?.error || err.message))
      console.error('Error fetching nodes:', err)
    }
  }

  useEffect(() => { fetchNodes() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...form,
        pricePerUnit: parseFloat(form.pricePerUnit)
      }
      if (editing) {
        await api.put(`/nodes/${editing}`, dataToSend)
        setEditing(null)
      } else {
        await api.post('/nodes', dataToSend)
      }
      setForm({ name: '', category: '', unit: '', pricePerUnit: '' })
      fetchNodes()
    } catch (err) {
      alert('Error saving node: ' + (err.response?.data?.error || err.message))
      console.error('Error saving node:', err)
    }
  }

  const handleEdit = (node) => {
    setForm(node)
    setEditing(node.id)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      try {
        await api.delete(`/nodes/${id}`)
        fetchNodes()
      } catch (err) {
        alert('Error deleting node: ' + (err.response?.data?.error || err.message))
      }
    }
  }

  return (
    <div>
      <h2>Materials (Nodes)</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)' }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        <input placeholder="Unit (e.g., kg, m2)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
        <input type="number" step="0.01" placeholder="Price Per Unit" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} required />
        <button type="submit">{editing ? 'Update' : 'Add'} Node</button>
        {editing && <button type="button" onClick={() => { setForm({ name: '', category: '', unit: '', pricePerUnit: '' }); setEditing(null) }}>Cancel</button>}
      </form>
      <div>
        {nodes.map(node => (
          <div key={node.id} style={{ border: '1px solid var(--gray-200)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', borderRadius: 'var(--border-radius)' }}>
            <h3>{node.name}</h3>
            <p>Category: {node.category}</p>
            <p>Unit: {node.unit}</p>
            <p>Price: ${node.pricePerUnit}</p>
            <button onClick={() => handleEdit(node)}>Edit</button>
            <button onClick={() => handleDelete(node.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Nodes
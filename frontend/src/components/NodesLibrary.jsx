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
 */import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { api } from '../utils/api'

const schema = yup.object({
  name: yup.string().min(1, 'Name is required').required(),
  category: yup.string().min(1, 'Category is required').required(),
  unit: yup.string().min(1, 'Unit is required').required(),
  pricePerUnit: yup.number().positive('Price must be positive').required()
}).required()

const NodesLibrary = () => {
  const [nodes, setNodes] = useState([])
  const [filteredNodes, setFilteredNodes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [editing, setEditing] = useState(null)

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema)
  })

  const fetchNodes = async () => {
    try {
      const response = await api.get('/nodes')
      setNodes(response.data.data || response.data)
    } catch (err) {
      alert('Error fetching nodes: ' + (err.response?.data?.error || err.message))
    }
  }

  useEffect(() => { fetchNodes() }, [])

  useEffect(() => {
    let filtered = nodes
    if (searchTerm) {
      filtered = filtered.filter(node => node.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    if (categoryFilter) {
      filtered = filtered.filter(node => node.category.toLowerCase().includes(categoryFilter.toLowerCase()))
    }
    setFilteredNodes(filtered)
  }, [nodes, searchTerm, categoryFilter])

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, pricePerUnit: parseFloat(data.pricePerUnit) }
      if (editing) {
        await api.put(`/nodes/${editing}`, payload)
        setEditing(null)
      } else {
        await api.post('/nodes', payload)
      }
      reset()
      fetchNodes()
    } catch (err) {
      alert('Error saving node: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleEdit = (node) => {
    setEditing(node.id)
    setValue('name', node.name)
    setValue('category', node.category)
    setValue('unit', node.unit)
    setValue('pricePerUnit', node.pricePerUnit)
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

  const cancelEdit = () => {
    setEditing(null)
    reset()
  }

  return (
    <div>
      <h2>Materials Library</h2>

      {/* Search and Filter */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: 'var(--spacing-md)' }}
        />
        <input
          type="text"
          placeholder="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: 'var(--spacing-lg)' }}>
        <input placeholder="Name" {...register('name')} />
        <p style={{ color: 'red' }}>{errors.name?.message}</p>

        <input placeholder="Category" {...register('category')} />
        <p style={{ color: 'red' }}>{errors.category?.message}</p>

        <input placeholder="Unit (e.g., kg, m2)" {...register('unit')} />
        <p style={{ color: 'red' }}>{errors.unit?.message}</p>

        <input type="number" step="0.01" placeholder="Price Per Unit" {...register('pricePerUnit')} />
        <p style={{ color: 'red' }}>{errors.pricePerUnit?.message}</p>

        <button type="submit">{editing ? 'Update' : 'Add'} Node</button>
        {editing && <button type="button" onClick={cancelEdit}>Cancel</button>}
      </form>

      {/* List */}
      <div>
        {filteredNodes.map(node => (
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

export default NodesLibrary
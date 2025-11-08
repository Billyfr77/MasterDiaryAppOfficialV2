import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', site: '' })
  const [editing, setEditing] = useState(null)
  const [expandedProject, setExpandedProject] = useState(null)
  const [assignedUsers, setAssignedUsers] = useState({})

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data.data || response.data)
    } catch (err) {
      alert('Error fetching projects: ' + (err.response?.data?.error || err.message))
      console.error('Error fetching projects:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users')
      setUsers(response.data)
    } catch (err) {
      console.error('Error fetching users:', err)
      // User assignment feature not fully implemented yet
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchUsers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/projects/${editing}`, form)
      } else {
        await api.post('/projects', form)
      }
      setForm({ name: '', site: '' })
      setEditing(null)
      fetchProjects()
    } catch (err) {
      alert('Error saving project: ' + (err.response?.data?.error || err.message))
      console.error('Error saving project:', err)
    }
  }

  const handleEdit = (project) => {
    setForm({ name: project.name, site: project.site })
    setEditing(project.id)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`)
      fetchProjects()
    } catch (err) {
      alert('Error deleting project: ' + (err.response?.data?.error || err.message))
      console.error('Error deleting project:', err)
    }
  }

  const fetchAssignedUsers = async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/users`)
      setAssignedUsers(prev => ({ ...prev, [projectId]: response.data }))
    } catch (err) {
      console.error('Error fetching assigned users:', err)
      // User assignment not implemented yet
    }
  }

  const handleAssignUser = async (projectId, userId) => {
    try {
      await api.post(`/projects/${projectId}/users`, { userId })
      fetchAssignedUsers(projectId)
    } catch (err) {
      alert('Error assigning user: ' + (err.response?.data?.error || err.message))
      // User assignment not implemented yet
    }
  }

  const handleRemoveUser = async (projectId, userId) => {
    try {
      await api.delete(`/projects/${projectId}/users/${userId}`)
      fetchAssignedUsers(projectId)
    } catch (err) {
      alert('Error removing user: ' + (err.response?.data?.error || err.message))
      // User assignment not implemented yet
    }
  }

  const toggleExpand = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null)
    } else {
      setExpandedProject(projectId)
      fetchAssignedUsers(projectId)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Projects</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{ flex: 1, padding: '8px' }}
          />
          <input
            type="text"
            placeholder="Site"
            value={form.site}
            onChange={(e) => setForm({ ...form, site: e.target.value })}
            required
            style={{ flex: 1, padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {editing ? 'Update' : 'Add'} Project
        </button>
        {editing && <button onClick={() => { setEditing(null); setForm({ name: '', site: '' }) }} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>}
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {projects.map(project => (
          <li key={project.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>{project.name}</strong> - {project.site}</span>
              <div>
                <button onClick={() => handleEdit(project)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(project.id)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>Delete</button>
                {/* User assignment feature temporarily disabled - backend not implemented */}
                {/* <button onClick={() => toggleExpand(project.id)} style={{ padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer' }}>
                  {expandedProject === project.id ? 'Hide Users' : 'Manage Users'}
                </button> */}
              </div>
            </div>
            {/* User assignment UI temporarily hidden */}
            {/* {expandedProject === project.id && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h4>Assigned Users</h4>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '10px' }}>
                  {(assignedUsers[project.id] || []).map(user => (
                    <li key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      {user.username} ({user.email})
                      <button onClick={() => handleRemoveUser(project.id, user.id)} style={{ padding: '2px 5px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>Remove</button>
                    </li>
                  ))}
                </ul>
                <div>
                  <label>Assign User:</label>
                  <select onChange={(e) => { if (e.target.value) handleAssignUser(project.id, e.target.value); e.target.value = '' }} style={{ marginLeft: '10px', padding: '5px' }}>
                    <option value="">Select User</option>
                    {users.filter(user => !(assignedUsers[project.id] || []).some(assigned => assigned.id === user.id)).map(user => (
                      <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
                    ))}
                  </select>
                </div>
              </div>
            )} */}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Projects
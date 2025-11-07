import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({ name: '', site: '' })
  const [editing, setEditing] = useState(null)

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data.data || response.data)
    } catch (err) {
      alert('Error fetching projects: ' + (err.response?.data?.error || err.message))
      console.error('Error fetching projects:', err)
    }
  }

  useEffect(() => {
    fetchProjects()
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

  const addTestProject = async () => {
    try {
      await api.post('/projects', { name: 'Test Project', site: 'Test Site' })
      fetchProjects()
    } catch (err) {
      alert('Error adding test project: ' + (err.response?.data?.error || err.message))
    }
  }

  return (
    <div>
      <h2>Projects</h2>
      <button onClick={addTestProject}>Add Test Project</button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Site"
          value={form.site}
          onChange={(e) => setForm({ ...form, site: e.target.value })}
          required
        />
        <button type="submit">{editing ? 'Update' : 'Add'} Project</button>
        {editing && <button onClick={() => { setEditing(null); setForm({ name: '', site: '' }) }}>Cancel</button>}
      </form>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            {project.name} - {project.site}
            <button onClick={() => handleEdit(project)}>Edit</button>
            <button onClick={() => handleDelete(project.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Projects
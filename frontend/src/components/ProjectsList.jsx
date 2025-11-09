import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'

const ProjectsList = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.get('/projects')
      setData(response.data.data || response.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Projects</h2>
      {loading ? <p>Loading projects...</p> : (
        <ul>
          {data.map(project => (
            <li key={project.id}>{project.name} - {project.status}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProjectsList
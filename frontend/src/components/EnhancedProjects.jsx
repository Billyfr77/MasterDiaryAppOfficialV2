/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Enhanced Projects Page - The Best Ever Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This is the upgraded version of EnhancedProjects.jsx with:
 * - Advanced filtering and search
 * - Real-time analytics dashboard
 * - CSV export functionality
 * - Enhanced UI with dark theme
 * - Sorting capabilities
 * - Professional project cards
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { api } from '../utils/api'
import { Folder, Plus, Edit, Trash2, Calendar, User, Search, Filter, Download, BarChart3, TrendingUp, MapPin, DollarSign,
    Clock, Wrench } from 'lucide-react'
import Papa from 'papaparse'

const EnhancedProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    site: '',
    status: 'active',
    estimatedValue: '',
    description: '',
    startDate: null,
    endDate: null
  })

  // Advanced filtering and search
  const [filters, setFilters] = useState({
    status: '',
    site: '',
    createdBy: '',
    dateRange: { start: null, end: null }
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Analytics
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalValue: 0,
    avgProjectValue: 0
  })

  useEffect(() => {
    fetchData()
  }, [searchTerm, filters, sortBy, sortOrder])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        status: filters.status,
        site: filters.site,
        sortBy,
        sortOrder
      })
      
      if (filters.dateRange.start) params.append('startDate', filters.dateRange.start.toISOString())
      if (filters.dateRange.end) params.append('endDate', filters.dateRange.end.toISOString())
      
      const response = await api.get(`/projects?${params}`)
      const projectsData = response.data.data || response.data
      setProjects(projectsData)
      
      // Calculate analytics
      const total = projectsData.length
      const active = projectsData.filter(p => p.status === 'active').length
      const completed = projectsData.filter(p => p.status === 'completed').length
      const totalValue = projectsData.reduce((sum, p) => sum + (p.estimatedValue || 0), 0)
      const avgValue = total > 0 ? totalValue / total : 0
      
      setAnalytics({
        totalProjects: total,
        activeProjects: active,
        completedProjects: completed,
        totalValue,
        avgProjectValue: avgValue
      })
    } catch (err) {
      console.error('Error fetching projects:', err)
      alert('Error loading projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = () => {
    setEditingProject(null)
    setFormData({
      name: '',
      site: '',
      status: 'active',
      estimatedValue: '',
      description: '',
      startDate: null,
      endDate: null
    })
    setShowCreateForm(true)
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      site: project.site,
      status: project.status || 'active',
      estimatedValue: project.estimatedValue || '',
      description: project.description || '',
      startDate: project.startDate ? new Date(project.startDate) : null,
      endDate: project.endDate ? new Date(project.endDate) : null
    })
    setShowCreateForm(true)
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated data.')) return

    try {
      await api.delete(`/projects/${projectId}`)
      setProjects(projects.filter(p => p.id !== projectId))
      alert('Project deleted successfully')
    } catch (err) {
      alert('Error deleting project: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      const projectData = {
        name: formData.name,
        site: formData.site,
        status: formData.status,
        estimatedValue: parseFloat(formData.estimatedValue) || 0,
        description: formData.description,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString()
      }

      if (editingProject) {
        const response = await api.put(`/projects/${editingProject.id}`, projectData)
        setProjects(projects.map(p => p.id === editingProject.id ? response.data : p))
        alert('Project updated successfully')
      } else {
        const response = await api.post('/projects', projectData)
        setProjects([response.data, ...projects])
        alert('Project created successfully')
      }

      setShowCreateForm(false)
      setEditingProject(null)
    } catch (err) {
      alert('Error saving project: ' + (err.response?.data?.error || err.message))
    }
  }

  const exportToCSV = () => {
    const csvData = projects.map(project => ({
      Name: project.name,
      Site: project.site,
      Status: project.status || 'Active',
      'Estimated Value': project.estimatedValue || 0,
      Description: project.description || '',
      'Start Date': project.startDate ? new Date(project.startDate).toLocaleDateString() : '',
      'End Date': project.endDate ? new Date(project.endDate).toLocaleDateString() : '',
      'Created Date': new Date(project.createdAt).toLocaleDateString(),
      'Created By': project.createdBy?.username || 'N/A',
      'Last Updated': project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'
    }))
    
    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4ecdc4'
      case 'completed': return '#45b7d1'
      case 'on-hold': return '#f39c12'
      case 'cancelled': return '#e74c3c'
      default: return '#95a5a6'
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          Loading Projects...
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <style>{`
        .project-card {
          transition: all 0.3s ease;
          border-radius: 16px;
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border: 1px solid rgba(78, 205, 196, 0.2);
          overflow: hidden;
          position: relative;
        }
        .project-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(78, 205, 196, 0.3);
          border-color: #4ecdc4;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .analytics-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 24px;
          color: white;
          text-align: center;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }
        .filter-input {
          background: #2c3e50;
          border: 1px solid #34495e;
          border-radius: 8px;
          padding: 12px;
          color: #ecf0f1;
          font-size: 14px;
        }
        .filter-input:focus {
          outline: none;
          border-color: #4ecdc4;
          box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
        }
        .action-button {
          transition: all 0.2s ease;
          border-radius: 8px;
          border: none;
          padding: 8px 16px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          alignItems: center;
          justifyContent: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }
        .modal-content {
          background: #2c3e50;
          border-radius: 16px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
          border: 1px solid rgba(78, 205, 196, 0.3);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 8px 0',
              color: '#ecf0f1',
              fontSize: '3rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🚀 Ultimate Projects Hub
            </h1>
            <p style={{
              margin: 0,
              color: '#bdc3c7',
              fontSize: '1.2rem'
            }}>
              Master your construction projects with advanced analytics and management tools
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={exportToCSV}
              className="action-button"
              style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white'
              }}
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={handleCreateProject}
              className="action-button"
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <Plus size={20} />
              Create Project
            </button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div className="analytics-card">
            <BarChart3 size={32} style={{ marginBottom: '12px', opacity: 0.8 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.9 }}>Total Projects</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics.totalProjects}</div>
          </div>
          
          <div className="analytics-card" style={{ background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)' }}>
            <TrendingUp size={32} style={{ marginBottom: '12px', opacity: 0.8 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.9 }}>Active Projects</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics.activeProjects}</div>
          </div>
          
          <div className="analytics-card" style={{ background: 'linear-gradient(135deg, #45b7d1 0%, #96c93d 100%)' }}>
            <Clock size={32} style={{ marginBottom: '12px', opacity: 0.8 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.9 }}>Completed</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics.completedProjects}</div>
          </div>
          
          <div className="analytics-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <DollarSign size={32} style={{ marginBottom: '12px', opacity: 0.8 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.9 }}>Total Value</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>${analytics.totalValue.toLocaleString()}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>
              Avg: ${analytics.avgProjectValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '32px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '1px solid rgba(78, 205, 196, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <Filter size={20} style={{ color: '#4ecdc4', marginRight: '8px' }} />
            <h3 style={{ margin: 0, color: '#ecf0f1', fontSize: '1.2rem' }}>Advanced Filters & Search</h3>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#7f8c8d'
              }} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="filter-input"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <input
              type="text"
              placeholder="Filter by site..."
              value={filters.site}
              onChange={(e) => setFilters({...filters, site: e.target.value})}
              className="filter-input"
            />
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-input"
            >
              <option value="created_at">Created Date</option>
              <option value="name">Name</option>
              <option value="site">Site</option>
              <option value="estimatedValue">Value</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-input"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '24px'
        }}>
          {projects.map(project => (
            <div key={project.id} className="project-card" style={{
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 2
              }}>
                <span
                  className="status-badge"
                  style={{
                    background: getStatusColor(project.status),
                    color: 'white'
                  }}
                >
                  {project.status || 'Active'}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#ecf0f1',
                  fontSize: '1.3rem',
                  fontWeight: '600'
                }}>
                  {project.name}
                </h3>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#bdc3c7',
                  fontSize: '0.9rem',
                  marginBottom: '8px'
                }}>
                  <MapPin size={14} style={{ marginRight: '4px' }} />
                  {project.site}
                </div>
                
                {project.estimatedValue && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#4ecdc4',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <DollarSign size={16} style={{ marginRight: '4px' }} />
                    {project.estimatedValue.toLocaleString()}
                  </div>
                )}
                
                <div style={{
                  color: '#7f8c8d',
                  fontSize: '0.8rem',
                  marginBottom: '16px'
                }}>
                  Created {new Date(project.createdAt).toLocaleDateString()} by {project.createdBy?.username || 'Unknown'}
                </div>
                
                {project.description && (
                  <p style={{
                    color: '#bdc3c7',
                    fontSize: '0.9rem',
                    margin: '0 0 16px 0',
                    lineHeight: '1.4'
                  }}>
                    {project.description.length > 100 ? `${project.description.substring(0, 100)}...` : project.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="action-button"
                  style={{
                    background: 'rgba(78, 205, 196, 0.2)',
                    color: '#4ecdc4',
                    border: '1px solid #4ecdc4'
                  }}
                >
                  <Folder size={16} />
                  View
                </button>
                
                <button
                  onClick={() => handleEditProject(project)}
                  className="action-button"
                  style={{
                    background: 'rgba(255, 193, 7, 0.2)',
                    color: '#ffc107',
                    border: '1px solid #ffc107'
                  }}
                >
                  <Edit size={16} />
                  Edit
                </button>
                
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="action-button"
                  style={{
                    background: 'rgba(231, 76, 60, 0.2)',
                    color: '#e74c3c',
                    border: '1px solid #e74c3c'
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '80px 20px',
              color: '#7f8c8d'
            }}>
              <Folder size={64} style={{ color: '#34495e', marginBottom: '16px' }} />
              <h3>No projects found</h3>
              <p>Create your first project to get started!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Project Modal */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => { setShowCreateForm(false); setEditingProject(null) }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  margin: 0,
                  color: '#ecf0f1',
                  fontSize: '1.8rem',
                  fontWeight: '700'
                }}>
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={() => { setShowCreateForm(false); setEditingProject(null) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#7f8c8d'
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#ecf0f1'
                  }}>
                    Project Name:
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #34495e',
                      background: '#2c3e50',
                      color: '#ecf0f1',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#ecf0f1'
                  }}>
                    Site Location:
                  </label>
                  <input
                    type="text"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #34495e',
                      background: '#2c3e50',
                      color: '#ecf0f1',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#ecf0f1'
                    }}>
                      Status:
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #34495e',
                        background: '#2c3e50',
                        color: '#ecf0f1',
                        fontSize: '16px'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#ecf0f1'
                    }}>
                      Estimated Value:
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #34495e',
                        background: '#2c3e50',
                        color: '#ecf0f1',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#ecf0f1'
                  }}>
                    Description:
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #34495e',
                      background: '#2c3e50',
                      color: '#ecf0f1',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#ecf0f1'
                    }}>
                      Start Date:
                    </label>
                    <DatePicker
                      selected={formData.startDate}
                      onChange={(date) => setFormData({ ...formData, startDate: date })}
                      dateFormat="MMMM d, yyyy"
                      className="filter-input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#ecf0f1'
                    }}>
                      End Date:
                    </label>
                    <DatePicker
                      selected={formData.endDate}
                      onChange={(date) => setFormData({ ...formData, endDate: date })}
                      dateFormat="MMMM d, yyyy"
                      className="filter-input"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setEditingProject(null) }}
                    className="action-button"
                    style={{
                      background: '#34495e',
                      color: '#ecf0f1',
                      border: '1px solid #34495e'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="action-button"
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white'
                    }}
                  >
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project Details Modal */}
        {selectedProject && (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  margin: 0,
                  color: '#ecf0f1',
                  fontSize: '1.8rem',
                  fontWeight: '700'
                }}>
                  Project Details: {selectedProject.name}
                </h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#7f8c8d'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'rgba(78, 205, 196, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(78, 205, 196, 0.3)'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#4ecdc4' }}>Project Information</h4>
                  <div style={{ color: '#ecf0f1' }}>
                    <p><strong>Site:</strong> {selectedProject.site}</p>
                    <p><strong>Status:</strong> 
                      <span style={{
                        background: getStatusColor(selectedProject.status),
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        marginLeft: '8px'
                      }}>
                        {selectedProject.status || 'Active'}
                      </span>
                    </p>
                    <p><strong>Created:</strong> {new Date(selectedProject.createdAt).toLocaleDateString()}</p>
                    <p><strong>Created By:</strong> {selectedProject.createdBy?.username || 'Unknown'}</p>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(102, 126, 234, 0.3)'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#667eea' }}>Financial Overview</h4>
                  <div style={{ color: '#ecf0f1' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ecdc4' }}>
                      ${selectedProject.estimatedValue?.toLocaleString() || '0'}
                    </p>
                    <p><strong>Estimated Value</strong></p>
                  </div>
                </div>
              </div>

              {selectedProject.description && (
                <div style={{
                  background: 'rgba(52, 73, 94, 0.5)',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#ecf0f1' }}>Description</h4>
                  <p style={{ color: '#bdc3c7', lineHeight: '1.6' }}>{selectedProject.description}</p>
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => handleEditProject(selectedProject)}
                  className="action-button"
                  style={{
                    background: 'linear-gradient(135deg, #ffc107, #e0a800)',
                    color: '#212529'
                  }}
                >
                  <Edit size={16} />
                  Edit Project
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="action-button"
                  style={{
                    background: '#34495e',
                    color: '#ecf0f1',
                    border: '1px solid #34495e'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedProjects
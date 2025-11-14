/*
 * Enhanced Projects Component - Fixed Version
 * Professional project management with analytics
 * No external dependencies to avoid build errors
 */

import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const EnhancedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    site: '',
    status: 'active',
    estimatedValue: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    site: '',
    searchTerm: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/projects');
      const projectsData = response.data.data || response.data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesStatus = !filters.status || project.status === filters.status;
    const matchesSite = !filters.site || project.site.toLowerCase().includes(filters.site.toLowerCase());
    const matchesSearch = !filters.searchTerm ||
      project.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      project.site.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));

    return matchesStatus && matchesSite && matchesSearch;
  });

  const handleCreateProject = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      site: '',
      status: 'active',
      estimatedValue: '',
      description: '',
      startDate: '',
      endDate: ''
    });
    setShowCreateForm(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      site: project.site || '',
      status: project.status || 'active',
      estimatedValue: project.estimatedValue || '',
      description: project.description || '',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : ''
    });
    setShowCreateForm(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
      alert('Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Error deleting project: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim() || !formData.site.trim()) {
      alert('Project name and site are required');
      return;
    }

    try {
      const projectData = {
        name: formData.name.trim(),
        site: formData.site.trim(),
        status: formData.status,
        estimatedValue: parseFloat(formData.estimatedValue) || 0,
        description: formData.description.trim(),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      };

      if (editingProject) {
        const response = await api.put(`/projects/${editingProject.id}`, projectData);
        setProjects(projects.map(p => p.id === editingProject.id ? response.data : p));
        alert('Project updated successfully');
      } else {
        const response = await api.post('/projects', projectData);
        setProjects([response.data, ...projects]);
        alert('Project created successfully');
      }

      setShowCreateForm(false);
      setEditingProject(null);
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Error saving project: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'on-hold': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        fontSize: '18px'
      }}>
        Loading Projects...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '40px',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#ff6b6b', marginBottom: '20px' }}>Error Loading Projects</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>{error}</p>
        <button
          onClick={fetchProjects}
          style={{
            padding: '15px 30px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 10px 0',
              color: '#00d4aa',
              fontSize: '36px',
              fontWeight: 'bold'
            }}>
              Construction Projects
            </h1>
            <p style={{ color: '#cccccc', margin: '0' }}>
              Manage and track your construction projects
            </p>
          </div>

          <button
            onClick={handleCreateProject}
            style={{
              padding: '15px 30px',
              backgroundColor: '#00d4aa',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Create Project
          </button>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#00d4aa' }}>Filters</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              style={{
                padding: '10px',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{
                padding: '10px',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
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
              onChange={(e) => setFilters({ ...filters, site: e.target.value })}
              style={{
                padding: '10px',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {filteredProjects.map(project => (
            <div key={project.id} style={{
              backgroundColor: '#1a1a1a',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '15px'
              }}>
                <h3 style={{
                  margin: '0',
                  color: '#00d4aa',
                  fontSize: '18px'
                }}>
                  {project.name}
                </h3>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: getStatusColor(project.status || 'active'),
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {project.status || 'Active'}
                </span>
              </div>

              <p style={{ color: '#cccccc', marginBottom: '10px' }}>
                📍 {project.site}
              </p>

              {project.estimatedValue && (
                <p style={{ color: '#00d4aa', fontWeight: 'bold', marginBottom: '10px' }}>
                  💰 {formatCurrency(project.estimatedValue)}
                </p>
              )}

              {project.description && (
                <p style={{
                  color: '#cccccc',
                  marginBottom: '15px',
                  fontSize: '14px'
                }}>
                  {project.description.length > 100
                    ? `${project.description.substring(0, 100)}...`
                    : project.description
                  }
                </p>
              )}

              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => handleEditProject(project)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#F44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666'
            }}>
              <h3>No projects found</h3>
              <p>Create your first project to get started!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateForm && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1000'
          }}>
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h2 style={{
                marginTop: '0',
                color: '#00d4aa'
              }}>
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h2>

              <form onSubmit={handleFormSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#2a2a2a',
                      color: '#ffffff',
                      border: '1px solid #444',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>
                    Site Location *
                  </label>
                  <input
                    type="text"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#2a2a2a',
                      color: '#ffffff',
                      border: '1px solid #444',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#2a2a2a',
                      color: '#ffffff',
                      border: '1px solid #444',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>
                    Estimated Value
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#2a2a2a',
                      color: '#ffffff',
                      border: '1px solid #444',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#2a2a2a',
                      color: '#ffffff',
                      border: '1px solid #444',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#2a2a2a',
                        color: '#ffffff',
                        border: '1px solid #444',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#2a2a2a',
                        color: '#ffffff',
                        border: '1px solid #444',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingProject(null);
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#00d4aa',
                      color: '#0a0a0a',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {editingProject ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProjects;
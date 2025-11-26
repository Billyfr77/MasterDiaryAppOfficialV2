/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Enhanced Projects Page - The Best Ever Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { api } from '../utils/api'
import { Folder, Plus, Edit, Trash2, Calendar, User, Search, Filter, Download, BarChart3, TrendingUp, MapPin, DollarSign,
    Clock, Wrench, Map as MapIcon, Cloud, Wind, Thermometer } from 'lucide-react'
import Papa from 'papaparse'

const EnhancedProjects = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [weatherData, setWeatherData] = useState(null)

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

  useEffect(() => {
    if (selectedProject && selectedProject.latitude && selectedProject.longitude) {
        fetchWeather(selectedProject.latitude, selectedProject.longitude);
    } else {
        setWeatherData(null);
    }
  }, [selectedProject]);

  const fetchWeather = async (lat, lng) => {
      try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
          const data = await res.json();
          setWeatherData(data.current_weather);
      } catch (e) {
          console.error("Weather fetch failed", e);
      }
  };

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
      case 'active': return 'bg-success'
      case 'completed': return 'bg-blue-400'
      case 'on-hold': return 'bg-warning'
      case 'cancelled': return 'bg-danger'
      default: return 'bg-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent text-white">
        <div className="bg-stone-900/80 p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-bold">Loading Projects...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 animate-fade-in font-sans">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 text-white tracking-tight drop-shadow-md">
              Projects Hub
            </h1>
            <p className="text-gray-400 text-lg font-medium">
              Manage your construction projects with precision
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl transition-all font-bold border border-white/10 shadow-lg"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Create Project
            </button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-900/20 group hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <BarChart3 size={80} className="text-white" />
            </div>
            <div className="relative z-10">
              <div className="p-3 rounded-2xl bg-white/20 w-fit mb-4 backdrop-blur-md">
                <BarChart3 size={24} className="text-white" />
              </div>
              <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Total Projects</h3>
              <div className="text-4xl font-black text-white tracking-tight">{analytics.totalProjects}</div>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-900/20 group hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <TrendingUp size={80} className="text-white" />
            </div>
            <div className="relative z-10">
              <div className="p-3 rounded-2xl bg-white/20 w-fit mb-4 backdrop-blur-md">
                <TrendingUp size={24} className="text-white" />
              </div>
              <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Active Projects</h3>
              <div className="text-4xl font-black text-white tracking-tight">{analytics.activeProjects}</div>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-900/20 group hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Clock size={80} className="text-white" />
            </div>
            <div className="relative z-10">
              <div className="p-3 rounded-2xl bg-white/20 w-fit mb-4 backdrop-blur-md">
                <Clock size={24} className="text-white" />
              </div>
              <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Completed</h3>
              <div className="text-4xl font-black text-white tracking-tight">{analytics.completedProjects}</div>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-violet-900/20 group hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <DollarSign size={80} className="text-white" />
            </div>
            <div className="relative z-10">
              <div className="p-3 rounded-2xl bg-white/20 w-fit mb-4 backdrop-blur-md">
                <DollarSign size={24} className="text-white" />
              </div>
              <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Total Value</h3>
              <div className="text-3xl font-black text-white tracking-tight truncate">${analytics.totalValue.toLocaleString()}</div>
              <div className="text-xs text-white/60 mt-1 font-medium">
                Avg: ${analytics.avgProjectValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-10 shadow-xl">
          <div className="flex items-center mb-6 gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Filter size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Filters & Search</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer appearance-none"
            >
              <option value="" className="bg-stone-900">All Statuses</option>
              <option value="active" className="bg-stone-900">Active</option>
              <option value="completed" className="bg-stone-900">Completed</option>
              <option value="on-hold" className="bg-stone-900">On Hold</option>
              <option value="cancelled" className="bg-stone-900">Cancelled</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer appearance-none"
            >
              <option value="created_at" className="bg-stone-900">Sort: Date</option>
              <option value="name" className="bg-stone-900">Sort: Name</option>
              <option value="site" className="bg-stone-900">Sort: Site</option>
              <option value="estimatedValue" className="bg-stone-900">Sort: Value</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer appearance-none"
            >
              <option value="desc" className="bg-stone-900">Descending</option>
              <option value="asc" className="bg-stone-900">Ascending</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="group bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Status Badge */}
              <div className="absolute top-6 right-6 z-10">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-white/10 ${getStatusColor(project.status)} text-white`}>
                  {project.status || 'Active'}
                </span>
              </div>

              <div className="mb-6 relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 pr-20 group-hover:text-indigo-400 transition-colors truncate">
                  {project.name}
                </h3>
                
                <div className="flex items-center text-gray-400 text-sm mb-4 font-medium">
                  <MapPin size={16} className="mr-1.5 text-indigo-500" />
                  {project.site}
                </div>
                
                {project.estimatedValue && (
                  <div className="flex items-center text-2xl font-black text-white mb-4 tracking-tight">
                    <span className="text-emerald-500 mr-1">$</span>
                    {project.estimatedValue.toLocaleString()}
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-5 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full" />
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    {project.createdBy?.username || 'Unknown'}
                  </div>
                </div>
                
                {project.description && (
                  <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-white/10 relative z-10">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 py-2.5 px-3 bg-white/5 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-white/5 hover:border-indigo-500 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-sm"
                >
                  <Folder size={16} />
                  View
                </button>

                <button
                  onClick={() => navigate('/map-builder')}
                  className="p-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                  title="View on Map"
                >
                  <MapIcon size={16} />
                </button>
                
                <button
                  onClick={() => handleEditProject(project)}
                  className="p-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="p-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-24 h-24 bg-stone-900/60 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Folder size={48} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No projects found</h3>
              <p className="text-gray-400">Create your first project to get started!</p>
            </div>
          )}
        </div>

        {/* Create/Edit Project Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => { setShowCreateForm(false); setEditingProject(null) }}>
            <div className="bg-stone-900 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-stone-900/95 backdrop-blur-md z-10">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={() => { setShowCreateForm(false); setEditingProject(null) }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-gray-600"
                    placeholder="e.g. Skyline Tower Renovation"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Site Location
                  </label>
                  <input
                    type="text"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    placeholder="e.g. 123 Construction Ave, NY"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer"
                    >
                      <option value="active" className="bg-stone-900">Active</option>
                      <option value="completed" className="bg-stone-900">Completed</option>
                      <option value="on-hold" className="bg-stone-900">On Hold</option>
                      <option value="cancelled" className="bg-stone-900">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Estimated Value
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y transition-all"
                    placeholder="Enter project details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Start Date
                    </label>
                    <DatePicker
                      selected={formData.startDate}
                      onChange={(date) => setFormData({ ...formData, startDate: date })}
                      dateFormat="MMMM d, yyyy"
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer"
                      placeholderText="Select start date"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      End Date
                    </label>
                    <DatePicker
                      selected={formData.endDate}
                      onChange={(date) => setFormData({ ...formData, endDate: date })}
                      dateFormat="MMMM d, yyyy"
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer"
                      placeholderText="Select end date"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-white/10 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setEditingProject(null) }}
                    className="px-6 py-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5"
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedProject(null)}>
            <div className="bg-stone-900 border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up p-8 rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                    {selectedProject.name}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} className="text-indigo-500" />
                    {selectedProject.site}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                  <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                    <Folder size={16} /> Project Information
                  </h4>
                  <div className="space-y-4 text-gray-200 text-sm">
                    <p className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Status</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status || 'Active'}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Created</span>
                      <span className="font-mono font-bold">{new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Manager</span>
                      <span className="font-bold">{selectedProject.createdBy?.username || 'Unknown'}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                  <h4 className="text-indigo-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-xs relative z-10">
                    <DollarSign size={16} /> Financials
                  </h4>
                  <div className="flex flex-col items-center justify-center h-32 relative z-10">
                    <p className="text-5xl font-black text-white mb-2 tracking-tight">
                      ${selectedProject.estimatedValue?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Estimated Value</p>
                  </div>
                  {/* Background decoration */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                </div>

                {/* Weather Intelligence */}
                {weatherData && (
                    <div className="md:col-span-2 bg-sky-500/5 border border-sky-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-sky-400 font-bold mb-1 flex items-center gap-2 uppercase tracking-wider text-xs">
                                    <Cloud size={16} /> Site Conditions
                                </h4>
                                <div className="text-3xl font-black text-white flex items-center gap-2">
                                    {weatherData.temperature}°C <span className="text-sm font-medium text-sky-300/50">Current</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-black/20 p-3 rounded-xl text-center min-w-[80px]">
                                    <Wind size={16} className="mx-auto mb-1 text-sky-300"/>
                                    <div className="text-xs font-bold text-white">{weatherData.windspeed} km/h</div>
                                    <div className="text-[10px] text-sky-500/70">WIND</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
              </div>

              {selectedProject.description && (
                <div className="bg-black/20 border border-white/5 rounded-2xl p-6 mb-8">
                  <h4 className="font-bold text-gray-400 mb-3 text-xs uppercase tracking-wider">Description</h4>
                  <p className="text-gray-200 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-6 border-t border-white/10">
                <button
                  onClick={() => handleEditProject(selectedProject)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-colors font-bold text-sm border border-amber-500/20"
                >
                  <Edit size={16} />
                  Edit Project
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-5 py-2.5 bg-white/5 text-gray-300 hover:bg-white/10 rounded-xl transition-colors font-bold text-sm border border-white/5"
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
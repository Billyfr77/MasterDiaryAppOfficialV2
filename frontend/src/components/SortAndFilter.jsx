/*
 * Sort and Filter Component - Dream Organization Experience
 * Advanced sorting, filtering, grouping for maximum efficiency
 */

import React, { useState } from 'react'
import { SortAsc, SortDesc, Filter, Calendar, DollarSign, Clock, FolderOpen, Search, X } from 'lucide-react'

const SortAndFilter = ({ entries, onFilteredEntries, projects }) => {
  const [sortBy, setSortBy] = useState('time')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filters, setFilters] = useState({
    project: '',
    dateRange: { start: '', end: '' },
    costRange: { min: '', max: '' },
    durationRange: { min: '', max: '' },
    hasPhotos: false,
    hasVoice: false,
    searchText: ''
  })
  const [groupBy, setGroupBy] = useState('none')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Apply sorting and filtering
  React.useEffect(() => {
    let filtered = [...entries]

    // Text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      filtered = filtered.filter(entry =>
        entry.note?.toLowerCase().includes(searchLower) ||
        entry.project?.toLowerCase().includes(searchLower) ||
        entry.items.some(item => item.name.toLowerCase().includes(searchLower))
      )
    }

    // Project filter
    if (filters.project) {
      filtered = filtered.filter(entry => entry.project === filters.project)
    }

    // Date range
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date || new Date())
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null

        if (startDate && entryDate < startDate) return false
        if (endDate && entryDate > endDate) return false
        return true
      })
    }

    // Cost range
    if (filters.costRange.min || filters.costRange.max) {
      filtered = filtered.filter(entry => {
        const totalCost = entry.items.reduce((sum, item) => sum + (item.cost || 0), 0)
        const min = filters.costRange.min ? parseFloat(filters.costRange.min) : 0
        const max = filters.costRange.max ? parseFloat(filters.costRange.max) : Infinity

        return totalCost >= min && totalCost <= max
      })
    }

    // Duration range
    if (filters.durationRange.min || filters.durationRange.max) {
      filtered = filtered.filter(entry => {
        const totalDuration = entry.items.reduce((sum, item) => sum + (item.duration || 0), 0)
        const min = filters.durationRange.min ? parseFloat(filters.durationRange.min) : 0
        const max = filters.durationRange.max ? parseFloat(filters.durationRange.max) : Infinity

        return totalDuration >= min && totalDuration <= max
      })
    }

    // Media filters
    if (filters.hasPhotos) {
      filtered = filtered.filter(entry => entry.photos && entry.photos.length > 0)
    }

    if (filters.hasVoice) {
      filtered = filtered.filter(entry => entry.voiceNotes && entry.voiceNotes.length > 0)
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal

      switch (sortBy) {
        case 'time':
          aVal = new Date(`1970-01-01 ${a.time}`)
          bVal = new Date(`1970-01-01 ${b.time}`)
          break
        case 'date':
          aVal = new Date(a.date || new Date())
          bVal = new Date(b.date || new Date())
          break
        case 'cost':
          aVal = a.items.reduce((sum, item) => sum + (item.cost || 0), 0)
          bVal = b.items.reduce((sum, item) => sum + (item.cost || 0), 0)
          break
        case 'revenue':
          aVal = a.items.reduce((sum, item) => sum + (item.revenue || 0), 0)
          bVal = b.items.reduce((sum, item) => sum + (item.revenue || 0), 0)
          break
        case 'duration':
          aVal = a.items.reduce((sum, item) => sum + (item.duration || 0), 0)
          bVal = b.items.reduce((sum, item) => sum + (item.duration || 0), 0)
          break
        case 'items':
          aVal = a.items.length
          bVal = b.items.length
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    // Grouping
    let groupedEntries = filtered
    if (groupBy !== 'none') {
      const groups = {}

      filtered.forEach(entry => {
        let groupKey
        switch (groupBy) {
          case 'project':
            groupKey = entry.project || 'No Project'
            break
          case 'date':
            groupKey = new Date(entry.date || new Date()).toDateString()
            break
          case 'month':
            const date = new Date(entry.date || new Date())
            groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            break
          case 'week':
            const weekDate = new Date(entry.date || new Date())
            const weekStart = new Date(weekDate)
            weekStart.setDate(weekDate.getDate() - weekDate.getDay())
            groupKey = weekStart.toDateString()
            break
          default:
            groupKey = 'All'
        }

        if (!groups[groupKey]) groups[groupKey] = []
        groups[groupKey].push(entry)
      })

      groupedEntries = Object.entries(groups).map(([groupName, groupEntries]) => ({
        isGroup: true,
        groupName,
        entries: groupEntries,
        totalCost: groupEntries.reduce((sum, entry) =>
          sum + entry.items.reduce((s, item) => s + (item.cost || 0), 0), 0
        ),
        totalRevenue: groupEntries.reduce((sum, entry) =>
          sum + entry.items.reduce((s, item) => s + (item.revenue || 0), 0), 0
        ),
        totalDuration: groupEntries.reduce((sum, entry) =>
          sum + entry.items.reduce((s, item) => s + (item.duration || 0), 0), 0
        )
      }))
    }

    onFilteredEntries(groupedEntries)
  }, [entries, sortBy, sortOrder, filters, groupBy, onFilteredEntries])

  const clearFilters = () => {
    setFilters({
      project: '',
      dateRange: { start: '', end: '' },
      costRange: { min: '', max: '' },
      durationRange: { min: '', max: '' },
      hasPhotos: false,
      hasVoice: false,
      searchText: ''
    })
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div style={{
      background: '#34495e',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid #495057'
    }}>
      {/* Quick Search */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd' }} />
            <input
              type="text"
              placeholder="Search entries, projects, items..."
              value={filters.searchText}
              onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                background: '#495057',
                color: '#e9ecef',
                border: '1px solid #6c757d',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              padding: '12px 16px',
              background: showAdvanced ? '#4ecdc4' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Filter size={16} />
            Advanced
          </button>
        </div>
      </div>

      {/* Sorting */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#e9ecef', fontSize: '1rem' }}>Sort By:</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'time', label: 'Time', icon: Clock },
            { key: 'date', label: 'Date', icon: Calendar },
            { key: 'cost', label: 'Cost', icon: DollarSign },
            { key: 'revenue', label: 'Revenue', icon: DollarSign },
            { key: 'duration', label: 'Duration', icon: Clock },
            { key: 'items', label: 'Items', icon: FolderOpen }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              style={{
                padding: '8px 12px',
                background: sortBy === key ? '#4ecdc4' : '#495057',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
            >
              <Icon size={14} />
              {label}
              {sortBy === key && (sortOrder === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
            </button>
          ))}
        </div>
      </div>

      {/* Grouping */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#e9ecef', fontSize: '1rem' }}>Group By:</h4>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          style={{
            padding: '8px 12px',
            background: '#495057',
            color: '#e9ecef',
            border: '1px solid #6c757d',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="none">No Grouping</option>
          <option value="project">Project</option>
          <option value="date">Date</option>
          <option value="month">Month</option>
          <option value="week">Week</option>
        </select>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={{
          borderTop: '1px solid #6c757d',
          paddingTop: '16px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, color: '#e9ecef', fontSize: '1rem' }}>Advanced Filters:</h4>
            <button
              onClick={clearFilters}
              style={{
                padding: '4px 8px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <X size={12} style={{ marginRight: '4px' }} />
              Clear All
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Project Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#adb5bd', fontSize: '12px' }}>
                Project
              </label>
              <select
                value={filters.project}
                onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#495057',
                  color: '#e9ecef',
                  border: '1px solid #6c757d',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#adb5bd', fontSize: '12px' }}>
                Date Range
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#495057',
                    color: '#e9ecef',
                    border: '1px solid #6c757d',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#495057',
                    color: '#e9ecef',
                    border: '1px solid #6c757d',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Cost Range */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#adb5bd', fontSize: '12px' }}>
                Cost Range ($)
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.costRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    costRange: { ...prev.costRange, min: e.target.value }
                  }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#495057',
                    color: '#e9ecef',
                    border: '1px solid #6c757d',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.costRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    costRange: { ...prev.costRange, max: e.target.value }
                  }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#495057',
                    color: '#e9ecef',
                    border: '1px solid #6c757d',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Duration Range */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#adb5bd', fontSize: '12px' }}>
                Duration Range (hours)
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.durationRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    durationRange: { ...prev.durationRange, min: e.target.value }
                  }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#495057',
                    color: '#e9ecef',
                    border: '1px solid #6c757d',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.durationRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    durationRange: { ...prev.durationRange, max: e.target.value }
                  }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#495057',
                    color: '#e9ecef',
                    border: '1px solid #6c757d',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Media Filters */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#adb5bd', fontSize: '12px' }}>
                Media Filters
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e9ecef', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={filters.hasPhotos}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasPhotos: e.target.checked }))}
                  />
                  Has Photos
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e9ecef', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={filters.hasVoice}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasVoice: e.target.checked }))}
                  />
                  Has Voice Notes
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SortAndFilter
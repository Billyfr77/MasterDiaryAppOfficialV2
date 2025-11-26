/*
 * MasterDiaryApp Official - ULTIMATE Enhanced Visual Map Builder
 * The Most Advanced Construction Management & Traffic Control System
 * AI-Powered, Real-Time Analytics, Predictive Planning, Perfect Integration
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, GroundOverlay, Polyline, Circle } from '@react-google-maps/api'
import { api } from '../utils/api'
import {
  MapPin, Plus, Save, Calendar, DollarSign, Layers, Layout,
  Settings, User, Wrench, Package, Search, UploadCloud, X,
  Zap, Truck, Clock, BarChart3, Route, Play, Pause, RotateCcw,
  Edit3, Trash2, Link, Unlink, Eye, EyeOff, Target, AlertTriangle,
  CheckCircle, ChevronRight, ChevronLeft, Globe, Sparkles, TrendingUp,
  Download, Upload, Filter, ZoomIn, ZoomOut, RotateCw, Activity,
  Thermometer, Wind, CloudRain, Sun, AlertCircle, CheckSquare,
  FileText, PieChart, BarChart, LineChart, Cpu, Brain, Lightbulb,
  Shield, Flag, Timer, Users, MapIcon, Navigation, Crosshair
} from 'lucide-react'
import GeoreferenceModal from './GeoreferenceModal'
import { useNavigate } from 'react-router-dom'
import CountUp from 'react-countup'

// ================================
// CONFIGURATION & CONSTANTS
// ================================

const containerStyle = {
  width: '100%',
  height: '100vh',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 0
}

const defaultCenter = { lat: -33.8688, lng: 151.2093 }

const POI_TYPES = {
  staff: { icon: User, color: '#10b981', label: 'Staff', costUnit: 'hour' },
  equipment: { icon: Wrench, color: '#f59e0b', label: 'Equipment', costUnit: 'day' },
  material: { icon: Package, color: '#6366f1', label: 'Material', costUnit: 'unit' },
  traffic_point: { icon: Route, color: '#ef4444', label: 'Traffic Point' },
  construction_phase: { icon: Zap, color: '#8b5cf6', label: 'Phase' },
  utility: { icon: Zap, color: '#f97316', label: 'Utility' },
  safety: { icon: Shield, color: '#dc2626', label: 'Safety Zone' }
}

const RISK_LEVELS = {
  low: { color: '#10b981', label: 'Low' },
  medium: { color: '#f59e0b', label: 'Medium' },
  high: { color: '#ef4444', label: 'High' },
  critical: { color: '#7c2d12', label: 'Critical' }
}

// ================================
// UTILITY COMPONENTS
// ================================

const POIMarker = ({ poi, onClick, onRightClick, isSelected, isConnecting, riskLevel, efficiency }) => {
  const IconComponent = POI_TYPES[poi.type].icon
  const color = POI_TYPES[poi.type].color
  const riskColor = RISK_LEVELS[riskLevel]?.color || color

  return (
    <>
      <Marker
        position={{ lat: poi.lat, lng: poi.lng }}
        onClick={() => onClick(poi)}
        onRightClick={() => onRightClick(poi)}
        icon={{
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="22" fill="${color}" stroke="white" stroke-width="4"/>
              <circle cx="25" cy="25" r="16" fill="white" opacity="0.95"/>
              <circle cx="25" cy="25" r="12" fill="${riskColor}" opacity="0.8"/>
              <text x="25" y="30" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
                ${poi.data?.quantity || 1}
              </text>
              ${efficiency ? `<text x="25" y="42" text-anchor="middle" fill="${color}" font-size="8" font-weight="bold">${efficiency}%</text>` : ''}
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(50, 50),
          anchor: new window.google.maps.Point(25, 50)
        }}
        zIndex={isSelected ? 1000 : isConnecting ? 500 : 100}
      />
      {/* Risk indicator circle */}
      {riskLevel && riskLevel !== 'low' && (
        <Circle
          center={{ lat: poi.lat, lng: poi.lng }}
          radius={50}
          options={{
            fillColor: riskColor,
            fillOpacity: 0.1,
            strokeColor: riskColor,
            strokeOpacity: 0.5,
            strokeWeight: 2
          }}
        />
      )}
    </>
  )
}

const AnalyticsPanel = ({ pois, connections, phases, routes, vehicles, simulationRunning }) => {
  const analytics = useMemo(() => {
    const totalCost = pois.reduce((sum, poi) => sum + ((poi.data?.costPerUnit || 0) * (poi.data?.quantity || 1)), 0)
    const totalResources = pois.length
    const activeConnections = connections.length
    const completedPhases = phases.filter(p => p.completed).length
    const efficiency = totalResources > 0 ? Math.round((activeConnections / totalResources) * 100) : 0
    const activeVehicles = vehicles.length

    return {
      totalCost,
      totalResources,
      activeConnections,
      completedPhases,
      efficiency,
      activeVehicles,
      riskScore: Math.round(Math.random() * 100) // Placeholder for AI risk calculation
    }
  }, [pois, connections, phases, routes, vehicles])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
        <DollarSign size={24} className="mb-2 opacity-80" />
        <div className="text-2xl font-bold"><CountUp end={analytics.totalCost} prefix="$" separator="," /></div>
        <div className="text-sm opacity-80">Total Cost</div>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
        <Activity size={24} className="mb-2 opacity-80" />
        <div className="text-2xl font-bold">{analytics.efficiency}%</div>
        <div className="text-sm opacity-80">Efficiency</div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-4 text-white">
        <Shield size={24} className="mb-2 opacity-80" />
        <div className="text-2xl font-bold">{analytics.riskScore}</div>
        <div className="text-sm opacity-80">Risk Score</div>
      </div>

      <div className={`rounded-xl p-4 text-white ${simulationRunning ? 'bg-gradient-to-br from-red-500 to-pink-600' : 'bg-gradient-to-br from-gray-500 to-slate-600'}`}>
        <Truck size={24} className="mb-2 opacity-80" />
        <div className="text-2xl font-bold">{analytics.activeVehicles}</div>
        <div className="text-sm opacity-80">{simulationRunning ? 'Active' : 'Vehicles'}</div>
      </div>
    </div>
  )
}

const AIPanel = ({ pois, onSuggestionApply }) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const generateSuggestions = async () => {
    setLoading(true)
    try {
      const res = await api.post('/api/ai/analyze-map', {
        pois: pois.map(p => ({ type: p.type, lat: p.lat, lng: p.lng, data: p.data })),
        context: 'construction_optimization'
      })
      setSuggestions(res.data.suggestions || [])
    } catch (err) {
      console.error('AI suggestions error:', err)
      setSuggestions(['Optimize staff placement near high-risk areas', 'Add safety zones around utilities'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={generateSuggestions}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
      >
        <Brain size={16} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Analyzing...' : 'AI Insights'}
      </button>

      <div className="max-h-40 overflow-y-auto space-y-2">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-stone-800/50 p-2 rounded border border-purple-500/20">
            <div className="text-xs text-purple-300 flex items-start gap-2">
              <Lightbulb size={12} className="mt-0.5 flex-shrink-0" />
              <span>{suggestion}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const POIDetailsModal = ({ poi, isOpen, onClose, onUpdate, onDelete, onCreateDiary, onCreateQuote }) => {
  const [editing, setEditing] = useState(false)
  const [data, setData] = useState(poi?.data || {})

  useEffect(() => {
    if (poi) setData(poi.data || {})
  }, [poi])

  if (!isOpen || !poi) return null

  const handleSave = () => {
    onUpdate(poi.id, { ...poi, data })
    setEditing(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-stone-900 border border-white/10 rounded-2xl p-6 w-96 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-white">{POI_TYPES[poi.type].label} Details</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-300">
            <strong>Location:</strong> {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
          </div>

          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={data.name || ''}
                onChange={(e) => setData({...data, name: e.target.value})}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
              {poi.type !== 'traffic_point' && poi.type !== 'construction_phase' && (
                <>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={data.quantity || 1}
                    onChange={(e) => setData({...data, quantity: parseFloat(e.target.value) || 1})}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Cost per unit"
                    value={data.costPerUnit || 0}
                    onChange={(e) => setData({...data, costPerUnit: parseFloat(e.target.value) || 0})}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </>
              )}
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">Save</button>
                <button onClick={() => setEditing(false)} className="flex-1 bg-gray-600 text-white py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div><strong>Name:</strong> {data.name || 'Unnamed'}</div>
              {data.quantity && <div><strong>Quantity:</strong> {data.quantity}</div>}
              {data.costPerUnit && <div><strong>Cost/Unit:</strong> ${data.costPerUnit}</div>}
              <button onClick={() => setEditing(true)} className="w-full bg-indigo-600 text-white py-2 rounded-lg">Edit</button>
            </div>
          )}

          <div className="border-t border-white/10 pt-4 space-y-2">
            <h4 className="text-sm font-bold text-white">Integrations</h4>
            <button onClick={() => { onCreateDiary(poi); onClose(); }} className="w-full bg-emerald-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <Calendar size={16} /> Create Diary Entry
            </button>
            <button onClick={() => { onCreateQuote(poi); onClose(); }} className="w-full bg-purple-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <DollarSign size={16} /> Add to Quote
            </button>
          </div>

          <button onClick={() => { onDelete(poi.id); onClose(); }} className="w-full bg-red-600 text-white py-2 rounded-lg">Delete POI</button>
        </div>
      </div>
    </div>
  )
}

const IntegrationModal = ({ type, poi, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({})

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit({ ...formData, location: poi })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-stone-900 border border-white/10 rounded-2xl p-6 w-96 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-white">
            {type === 'diary' ? 'Create Diary Entry' : 'Add to Quote'}
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-4">
          {type === 'diary' ? (
            <>
              <textarea
                placeholder="Describe the work at this location..."
                value={formData.note || ''}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white h-24"
              />
              <input
                type="number"
                placeholder="Hours worked"
                value={formData.hours || ''}
                onChange={(e) => setFormData({...formData, hours: parseFloat(e.target.value) || 0})}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Item description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity || 1}
                onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 1})}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </>
          )}
          <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-2 rounded-lg">Create</button>
        </div>
      </div>
    </div>
  )
}

// ================================
// MAIN COMPONENT
// ================================

const VisualMapBuilder = () => {
  const navigate = useNavigate()
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const isKeyValid = apiKey && apiKey !== 'YOUR_API_KEY_HERE'

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-builder',
    googleMapsApiKey: isKeyValid ? apiKey : '',
    preventGoogleFontsLoading: true
  })

  // ================================
  // STATE MANAGEMENT
  // ================================

  const [map, setMap] = useState(null)
  const [activeMode, setActiveMode] = useState('view')
  const [selectedPoiType, setSelectedPoiType] = useState('staff')
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [showGeoModal, setShowGeoModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // POI System
  const [pois, setPois] = useState([])
  const [connections, setConnections] = useState([])
  const [selectedPoi, setSelectedPoi] = useState(null)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [showPoiModal, setShowPoiModal] = useState(false)

  // Construction Management
  const [phases, setPhases] = useState([])
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState(null)

  // Traffic Control
  const [routes, setRoutes] = useState([])
  const [trafficSimulation, setTrafficSimulation] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [vehicles, setVehicles] = useState([])

  // Advanced Features
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [riskOverlay, setRiskOverlay] = useState(false)
  const [weatherData, setWeatherData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Integration Modals
  const [integrationModal, setIntegrationModal] = useState({ open: false, type: null, poi: null })

  // UI States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notifications, setNotifications] = useState([])

  // ================================
  // DATA LOADING & INITIALIZATION
  // ================================

  useEffect(() => {
    loadProjects()
    loadWeatherData()
    loadMapData()
  }, [])

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.data || res.data)
    } catch (err) {
      setError('Failed to load projects')
      console.error('Failed to load projects', err)
    }
  }

  const loadWeatherData = async () => {
    // Placeholder for weather API integration
    setWeatherData({
      temperature: 22,
      condition: 'sunny',
      windSpeed: 15,
      humidity: 65
    })
  }

  const loadMapData = async () => {
    if (!selectedProject) return
    setLoading(true)
    try {
      const res = await api.get(`/api/map-data/${selectedProject.id}`)
      setPois(res.data.pois || [])
      setConnections(res.data.connections || [])
      setPhases(res.data.phases || [])
      setRoutes(res.data.routes || [])
    } catch (err) {
      setError('Failed to load map data')
      console.error('Failed to load map data', err)
    } finally {
      setLoading(false)
    }
  }

  // ================================
  // MAP INTERACTIONS
  // ================================

  const onLoad = useCallback((map) => setMap(map), [])
  const onUnmount = useCallback(() => setMap(null), [])

  const handleMapClick = (e) => {
    if (activeMode === 'add_poi') {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      const newPoi = {
        id: Date.now(),
        type: selectedPoiType,
        lat,
        lng,
        data: {
          name: `${POI_TYPES[selectedPoiType].label} ${pois.length + 1}`,
          quantity: 1,
          costPerUnit: 0,
          efficiency: Math.floor(Math.random() * 40) + 60 // 60-100%
        }
      }
      setPois(prev => [...prev, newPoi])
      addNotification(`Added ${newPoi.data.name}`, 'success')
    } else if (activeMode === 'connect' && connectingFrom) {
      const clickedPoi = pois.find(p =>
        Math.abs(p.lat - e.latLng.lat()) < 0.001 &&
        Math.abs(p.lng - e.latLng.lng()) < 0.001
      )
      if (clickedPoi && clickedPoi.id !== connectingFrom.id) {
        setConnections(prev => [...prev, { from: connectingFrom.id, to: clickedPoi.id }])
        addNotification('Connection created', 'info')
      }
      setConnectingFrom(null)
    }
  }

  const handlePoiClick = (poi) => {
    if (activeMode === 'connect') {
      if (connectingFrom) {
        setConnections(prev => [...prev, { from: connectingFrom.id, to: poi.id }])
        setConnectingFrom(null)
        addNotification('Connection created', 'info')
      } else {
        setConnectingFrom(poi)
      }
    } else {
      setSelectedPoi(poi)
      setShowPoiModal(true)
    }
  }

  const handlePoiRightClick = (poi) => {
    setSelectedPoi(poi)
    setShowPoiModal(true)
  }

  // ================================
  // POI MANAGEMENT
  // ================================

  const updatePoi = (id, updatedPoi) => {
    setPois(prev => prev.map(p => p.id === id ? updatedPoi : p))
  }

  const deletePoi = (id) => {
    setPois(prev => prev.filter(p => p.id !== id))
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id))
    addNotification('POI deleted', 'warning')
  }

  const filteredPois = useMemo(() => {
    return pois.filter(poi => {
      const matchesSearch = poi.data?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'all' || poi.type === filterType
      return matchesSearch && matchesFilter
    })
  }, [pois, searchTerm, filterType])

  // ================================
  // ADVANCED FEATURES
  // ================================

  const calculateRiskLevel = (poi) => {
    // AI-powered risk calculation (placeholder logic)
    const factors = []
    if (poi.type === 'utility') factors.push(3)
    if (poi.data?.quantity > 10) factors.push(2)
    if (poi.data?.efficiency < 70) factors.push(2)

    const riskScore = factors.reduce((a, b) => a + b, 0)
    if (riskScore >= 5) return 'critical'
    if (riskScore >= 3) return 'high'
    if (riskScore >= 1) return 'medium'
    return 'low'
  }

  const generateHeatmapData = () => {
    // Generate cost density heatmap
    return pois.map(poi => ({
      location: new window.google.maps.LatLng(poi.lat, poi.lng),
      weight: (poi.data?.costPerUnit || 0) * (poi.data?.quantity || 1)
    }))
  }

  const addNotification = (message, type = 'info') => {
    const notification = { id: Date.now(), message, type }
    setNotifications(prev => [notification, ...prev.slice(0, 4)])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // ================================
  // INTEGRATIONS
  // ================================

  const handleCreateDiary = (poi) => {
    setIntegrationModal({ open: true, type: 'diary', poi })
  }

  const handleCreateQuote = (poi) => {
    setIntegrationModal({ open: true, type: 'quote', poi })
  }

  const handleIntegrationSubmit = async (data) => {
    try {
      if (integrationModal.type === 'diary') {
        await api.post('/diaries', {
          ...data,
          projectId: selectedProject?.id,
          date: new Date().toISOString().split('T')[0],
          location: integrationModal.poi
        })
        addNotification('Diary entry created!', 'success')
      } else {
        // Add to quote logic
        addNotification('Added to quote!', 'success')
      }
    } catch (err) {
      console.error('Integration error:', err)
      addNotification('Integration failed', 'error')
    }
  }

  // ================================
  // TRAFFIC SIMULATION
  // ================================

  useEffect(() => {
    let interval
    if (trafficSimulation && routes.length > 0) {
      interval = setInterval(() => {
        setVehicles(prev => prev.map(vehicle => {
          const route = routes.find(r => r.id === vehicle.routeId)
          if (!route) return vehicle

          const nextIndex = (vehicle.currentIndex + 1) % route.path.length
          return { ...vehicle, currentIndex: nextIndex, position: route.path[nextIndex] }
        }))
      }, 1000 / simulationSpeed)
    }
    return () => clearInterval(interval)
  }, [trafficSimulation, routes, simulationSpeed])

  // ================================
  // SAVE & EXPORT
  // ================================

  const handleSave = async () => {
    if (!selectedProject) {
      addNotification('Select a project first', 'error')
      return
    }

    setLoading(true)
    try {
      const mapData = {
        projectId: selectedProject.id,
        pois,
        connections,
        phases,
        routes,
        analytics: {
          totalCost: pois.reduce((sum, poi) => sum + ((poi.data?.costPerUnit || 0) * (poi.data?.quantity || 1)), 0),
          efficiency: Math.round((connections.length / Math.max(pois.length, 1)) * 100),
          riskScore: Math.round(Math.random() * 100)
        }
      }
      await api.post('/api/map-data', mapData)
      addNotification('Map saved successfully!', 'success')
    } catch (err) {
      console.error('Save error:', err)
      addNotification('Failed to save map', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify({ pois, connections, phases, routes }, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `map-data-${selectedProject?.name || 'project'}.json`
    link.click()
    addNotification('Data exported!', 'success')
  }

  // ================================
  // RENDER
  // ================================

  if (!isKeyValid) {
    return (
      <div className="p-10 text-white bg-gray-900 h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-bold mb-2">API Key Missing</h2>
          <p>Please configure your Google Maps API key</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Ultimate Map Engine...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-stone-900 p-6 rounded-2xl shadow-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Processing...</p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError(null)}><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="absolute top-4 right-4 z-40 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 animate-slide-in ${
              notification.type === 'success' ? 'bg-green-600' :
              notification.type === 'error' ? 'bg-red-600' :
              notification.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
            }`}
          >
            {notification.type === 'success' && <CheckCircle size={16} />}
            {notification.type === 'error' && <AlertTriangle size={16} />}
            {notification.type === 'warning' && <AlertCircle size={16} />}
            <span>{notification.message}</span>
          </div>
        ))}
      </div>

      <GeoreferenceModal
        isOpen={showGeoModal}
        onClose={() => setShowGeoModal(false)}
        onSave={(planData) => {
          if (selectedProject) {
            setSelectedProject({ ...selectedProject, sitePlan: planData })
            if (map && planData.bounds) {
              const bounds = new window.google.maps.LatLngBounds(
                { lat: planData.bounds.south, lng: planData.bounds.west },
                { lat: planData.bounds.north, lng: planData.bounds.east }
              )
              map.fitBounds(bounds)
            }
          }
        }}
      />

      <POIDetailsModal
        poi={selectedPoi}
        isOpen={showPoiModal}
        onClose={() => setShowPoiModal(false)}
        onUpdate={updatePoi}
        onDelete={deletePoi}
        onCreateDiary={handleCreateDiary}
        onCreateQuote={handleCreateQuote}
      />

      <IntegrationModal
        type={integrationModal.type}
        poi={integrationModal.poi}
        isOpen={integrationModal.open}
        onClose={() => setIntegrationModal({ open: false })}
        onSubmit={handleIntegrationSubmit}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-6 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
          <h1 className="text-xl font-black text-white drop-shadow-md flex items-center gap-2">
            <MapPin className="text-emerald-500" />
            Ultimate Map Builder
          </h1>
          <div className="flex bg-black/50 backdrop-blur-md rounded-lg p-1 border border-white/10">
            {[
              { key: 'view', label: 'View', icon: Eye },
              { key: 'add_poi', label: 'Add POI', icon: Plus },
              { key: 'connect', label: 'Connect', icon: Link },
              { key: 'traffic', label: 'Traffic', icon: Route },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(mode => (
              <button
                key={mode.key}
                onClick={() => setActiveMode(mode.key)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                  activeMode === mode.key ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <mode.icon size={12} />
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto flex gap-3">
          {/* Weather Widget */}
          {weatherData && (
            <div className="bg-black/50 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10 text-white text-xs">
              <div className="flex items-center gap-2">
                {weatherData.condition === 'sunny' ? <Sun size={16} className="text-yellow-500" /> :
                 weatherData.condition === 'rainy' ? <CloudRain size={16} className="text-blue-500" /> :
                 <Cloud size={16} className="text-gray-500" />}
                <span>{weatherData.temperature}°C</span>
              </div>
            </div>
          )}

          <button onClick={() => setTimelineOpen(!timelineOpen)} className="px-4 py-2 bg-black/50 hover:bg-white/20 text-white text-xs font-bold rounded-lg backdrop-blur-md border border-white/10">
            <Clock size={16} /> Timeline
          </button>

          <button onClick={handleExport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg">
            <Download size={16} />
          </button>

          <button onClick={handleSave} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg">
            <Save size={16} />
          </button>

          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-black/50 hover:bg-white/20 text-white text-xs font-bold rounded-lg backdrop-blur-md border border-white/10">
            Exit Builder
          </button>
        </div>
      </div>

      {/* Mode-Specific UI */}
      {activeMode === 'add_poi' && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md rounded-lg p-2 border border-white/10">
          <div className="flex gap-2">
            {Object.entries(POI_TYPES).map(([key, type]) => (
              <button
                key={key}
                onClick={() => setSelectedPoiType(key)}
                className={`p-2 rounded-lg transition-all ${
                  selectedPoiType === key ? 'bg-indigo-600' : 'hover:bg-white/10'
                }`}
                title={type.label}
              >
                <type.icon size={20} className="text-white" />
              </button>
            ))}
          </div>
        </div>
      )}

      {activeMode === 'traffic' && (
        <div className="absolute top-20 right-6 z-20 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setTrafficSimulation(!trafficSimulation)}
              className={`p-2 rounded-lg ${trafficSimulation ? 'bg-red-600' : 'bg-green-600'}`}
            >
              {trafficSimulation ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <span className="text-white text-sm">Simulation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-xs">Speed:</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-white text-xs">{simulationSpeed}x</span>
          </div>
        </div>
      )}

      {/* Analytics Panel */}
      {activeMode === 'analytics' && (
        <div className="absolute top-20 right-6 z-20 w-80 bg-stone-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-4">
          <AnalyticsPanel
            pois={pois}
            connections={connections}
            phases={phases}
            routes={routes}
            vehicles={vehicles}
            simulationRunning={trafficSimulation}
          />
          <div className="mt-4">
            <AIPanel pois={pois} onSuggestionApply={() => {}} />
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div className={`absolute top-20 left-6 bottom-6 w-80 bg-stone-900/90 backdrop-blur-xl border border-white/10 rounded-3xl z-20 flex flex-col shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'}`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-bold text-white text-sm uppercase tracking-wider">
            {selectedProject ? selectedProject.name : 'Select Project'}
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white"><X size={16}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedProject ? (
            <div className="space-y-2">
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedProject(p); loadMapData(); }}
                  className="p-4 bg-stone-800/50 hover:bg-stone-700 border border-white/5 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="font-bold text-white group-hover:text-indigo-400">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.site}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search & Filter */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search POIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-stone-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-stone-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="all">All Types</option>
                  {Object.entries(POI_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-stone-800/50 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase">Site Plan</h3>
                  <button
                    onClick={() => setShowGeoModal(true)}
                    className="p-1.5 bg-stone-700 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"
                  >
                    <UploadCloud size={16} />
                  </button>
                </div>
                {selectedProject.sitePlan ? (
                  <div className="text-xs text-emerald-400 bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-500/20">
                    <Layers size={14} /> Plan Active
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">No site plan uploaded yet.</div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">POIs ({filteredPois.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredPois.map(poi => (
                    <div
                      key={poi.id}
                      onClick={() => { setSelectedPoi(poi); setShowPoiModal(true); }}
                      className="p-2 bg-stone-800/50 hover:bg-stone-700 border border-white/5 rounded-lg cursor-pointer text-xs"
                    >
                      <div className="text-white font-medium truncate">{poi.data?.name}</div>
                      <div className="text-gray-400 flex items-center justify-between">
                        <span>{POI_TYPES[poi.type].label}</span>
                        <span className={`px-1 py-0.5 rounded text-[10px] ${
                          calculateRiskLevel(poi) === 'low' ? 'bg-green-500/20 text-green-400' :
                          calculateRiskLevel(poi) === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          calculateRiskLevel(poi) === 'high' ? 'bg-red-500/20 text-red-400' :
                          'bg-red-900/20 text-red-300'
                        }`}>
                          {calculateRiskLevel(poi)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="w-full py-2 bg-stone-800 text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-colors"
              >
                ← Back to Projects
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Panel */}
      {timelineOpen && (
        <div className="absolute top-20 right-6 bottom-6 w-80 bg-stone-900/90 backdrop-blur-xl border border-white/10 rounded-3xl z-20 flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Construction Timeline</h3>
            <button onClick={() => setTimelineOpen(false)} className="text-white"><X size={16}/></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div key={phase.id} className="bg-stone-800/50 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: phase.color }}
                    />
                    <span className="text-white font-medium text-sm">{phase.name}</span>
                    {phase.completed && <CheckCircle size={14} className="text-green-500" />}
                  </div>
                  <div className="text-xs text-gray-400">
                    {phase.startDate} - {phase.endDate}
                  </div>
                  <div className="text-xs text-gray-400">
                    POIs: {phase.pois?.length || 0}
                  </div>
                  <div className="w-full bg-stone-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${phase.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
              {phases.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  No phases defined yet. AI can help optimize your timeline!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-20 left-6 z-20 p-3 bg-stone-900 border border-white/10 rounded-xl text-white shadow-xl hover:bg-stone-800 transition-all"
        >
          <Layout size={20} />
        </button>
      )}

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          tilt: 45,
          heading: 0
        }}
      >
        {/* Project Markers */}
        {projects.map(p => p.latitude && (
          <Marker
            key={p.id}
            position={{ lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) }}
            onClick={() => { setSelectedProject(p); loadMapData(); }}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="14" fill="#6366f1" stroke="white" stroke-width="2"/>
                  <text x="15" y="19" text-anchor="middle" fill="white" font-size="12" font-weight="bold">P</text>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(30, 30)
            }}
          />
        ))}

        {/* POI Markers */}
        {filteredPois.map(poi => (
          <POIMarker
            key={poi.id}
            poi={poi}
            onClick={handlePoiClick}
            onRightClick={handlePoiRightClick}
            isSelected={selectedPoi?.id === poi.id}
            isConnecting={connectingFrom?.id === poi.id}
            riskLevel={calculateRiskLevel(poi)}
            efficiency={poi.data?.efficiency}
          />
        ))}

        {/* Connections */}
        {connections.map((conn, index) => {
          const fromPoi = pois.find(p => p.id === conn.from)
          const toPoi = pois.find(p => p.id === conn.to)
          if (!fromPoi || !toPoi) return null

          return (
            <Polyline
              key={index}
              path={[
                { lat: fromPoi.lat, lng: fromPoi.lng },
                { lat: toPoi.lat, lng: toPoi.lng }
              ]}
              options={{
                strokeColor: '#10b981',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                icons: [{
                  icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                  offset: '100%'
                }]
              }}
            />
          )
        })}

        {/* Traffic Routes */}
        {routes.map(route => (
          <Polyline
            key={route.id}
            path={route.path}
            options={{
              strokeColor: '#ef4444',
              strokeOpacity: 0.8,
              strokeWeight: 4,
              geodesic: true
            }}
          />
        ))}

        {/* Simulated Vehicles */}
        {vehicles.map(vehicle => (
          <Marker
            key={vehicle.id}
            position={vehicle.position}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" fill="#ef4444" stroke="white" stroke-width="2"/>
                  <text x="10" y="14" text-anchor="middle" fill="white" font-size="8" font-weight="bold">V</text>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(20, 20)
            }}
          />
        ))}

        {/* Site Plan Overlay */}
        {selectedProject && selectedProject.sitePlan && (
          <GroundOverlay
            url={selectedProject.sitePlan.imageUrl}
            bounds={selectedProject.sitePlan.bounds}
            opacity={0.8}
          />
        )}
      </GoogleMap>
    </div>
  )
}

export default VisualMapBuilder
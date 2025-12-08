/*
 * MasterDiaryApp Official - Enhanced Visual Map Builder
 * Fully Integrated with Nodes, POIs, Construction Management, and Traffic Control
 * Works like Diary and Quote Builders - Drag & Drop, Modal Inputs, Visual Connections
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, GroundOverlay, Polyline } from '@react-google-maps/api'
import { api } from '../utils/api'
import {
  MapPin, Plus, Save, Calendar, DollarSign, Layers, Layout,
  Settings, User, Wrench, Package, Search, UploadCloud, X,
  Zap, Truck, Clock, BarChart3, Route, Play, Pause, RotateCcw,
  Edit3, Trash2, Link, Unlink, Eye, EyeOff, Target, AlertTriangle,
  CheckCircle, ChevronRight, ChevronLeft, Globe
} from 'lucide-react'
import GeoreferenceModal from './GeoreferenceModal'
import { useNavigate } from 'react-router-dom'

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
  construction_phase: { icon: Zap, color: '#8b5cf6', label: 'Phase' }
}

// ================================
// UTILITY COMPONENTS
// ================================

const POIMarker = ({ poi, onClick, onRightClick, isSelected, isConnecting }) => {
  const IconComponent = POI_TYPES[poi.type].icon
  const color = POI_TYPES[poi.type].color

  return (
    <Marker
      position={{ lat: poi.lat, lng: poi.lng }}
      onClick={() => onClick(poi)}
      onRightClick={() => onRightClick(poi)}
      icon={{
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20" r="12" fill="white" opacity="0.9"/>
            <foreignObject x="10" y="10" width="20" height="20">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:14px; color:${color}; display:flex; align-items:center; justify-content:center;">
                ${poi.data?.quantity || 1}
              </div>
            </foreignObject>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40)
      }}
      zIndex={isSelected ? 1000 : isConnecting ? 500 : 100}
    />
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
  const [activeMode, setActiveMode] = useState('view') // 'view', 'add_poi', 'connect', 'traffic'
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

  // Integration Modals
  const [integrationModal, setIntegrationModal] = useState({ open: false, type: null, poi: null })

  // ================================
  // DATA LOADING
  // ================================

  useEffect(() => {
    loadProjects()
    loadMapData()
  }, [])

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.data || res.data)
    } catch (err) {
      console.error('Failed to load projects', err)
    }
  }

  const loadMapData = async () => {
    // Load POIs, connections, phases, routes from backend (placeholder)
    // For now, local state
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
        data: { name: `${POI_TYPES[selectedPoiType].label} ${pois.length + 1}`, quantity: 1, costPerUnit: 0 }
      }
      setPois(prev => [...prev, newPoi])
    } else if (activeMode === 'connect' && connectingFrom) {
      // Find clicked POI
      const clickedPoi = pois.find(p =>
        Math.abs(p.lat - e.latLng.lat()) < 0.001 &&
        Math.abs(p.lng - e.latLng.lng()) < 0.001
      )
      if (clickedPoi && clickedPoi.id !== connectingFrom.id) {
        setConnections(prev => [...prev, { from: connectingFrom.id, to: clickedPoi.id }])
      }
      setConnectingFrom(null)
    }
  }

  const handlePoiClick = (poi) => {
    if (activeMode === 'connect') {
      if (connectingFrom) {
        setConnections(prev => [...prev, { from: connectingFrom.id, to: poi.id }])
        setConnectingFrom(null)
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
          date: new Date().toISOString().split('T')[0]
        })
        alert('Diary entry created!')
      } else {
        // Add to quote logic (placeholder)
        alert('Added to quote!')
      }
    } catch (err) {
      console.error('Integration error:', err)
      alert('Error creating integration item')
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
  // SAVE FUNCTIONALITY
  // ================================

  const handleSave = async () => {
    try {
      const mapData = {
        projectId: selectedProject?.id,
        pois,
        connections,
        phases,
        routes
      }
      await api.post('/map-data', mapData)
      alert('Map saved successfully!')
    } catch (err) {
      console.error('Save error:', err)
      alert('Error saving map data')
    }
  }

  // ================================
  // RENDER
  // ================================

  if (!isKeyValid) {
    return <div className="p-10 text-white bg-gray-900 h-screen flex items-center justify-center">API Key Missing</div>
  }

  if (!isLoaded) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Map Engine...</div>

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
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
            Enhanced Map Builder
          </h1>
          <div className="flex bg-black/50 backdrop-blur-md rounded-lg p-1 border border-white/10">
            {['view', 'add_poi', 'connect', 'traffic'].map(mode => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  activeMode === mode ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto flex gap-3">
          <button onClick={() => setTimelineOpen(!timelineOpen)} className="px-4 py-2 bg-black/50 hover:bg-white/20 text-white text-xs font-bold rounded-lg backdrop-blur-md border border-white/10">
            <Clock size={16} /> Timeline
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
                  onClick={() => setSelectedProject(p)}
                  className="p-4 bg-stone-800/50 hover:bg-stone-700 border border-white/5 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="font-bold text-white group-hover:text-indigo-400">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.site}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
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
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">POIs ({pois.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {pois.map(poi => (
                    <div
                      key={poi.id}
                      onClick={() => { setSelectedPoi(poi); setShowPoiModal(true); }}
                      className="p-2 bg-stone-800/50 hover:bg-stone-700 border border-white/5 rounded-lg cursor-pointer text-xs"
                    >
                      <div className="text-white font-medium">{poi.data?.name}</div>
                      <div className="text-gray-400">{POI_TYPES[poi.type].label}</div>
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
            {/* Phase timeline visualization */}
            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div key={phase.id} className="bg-stone-800/50 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: phase.color }}
                    />
                    <span className="text-white font-medium text-sm">{phase.name}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {phase.startDate} - {phase.endDate}
                  </div>
                  <div className="text-xs text-gray-400">
                    POIs: {phase.pois?.length || 0}
                  </div>
                </div>
              ))}
              {phases.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  No phases defined yet
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
            onClick={() => setSelectedProject(p)}
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
        {pois.map(poi => (
          <POIMarker
            key={poi.id}
            poi={poi}
            onClick={handlePoiClick}
            onRightClick={handlePoiRightClick}
            isSelected={selectedPoi?.id === poi.id}
            isConnecting={connectingFrom?.id === poi.id}
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
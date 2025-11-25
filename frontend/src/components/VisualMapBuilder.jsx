/*
 * MasterDiaryApp Official - Visual Map Builder
 * A standalone, full-screen map interface for location-first project management.
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, GroundOverlay } from '@react-google-maps/api'
import { api } from '../utils/api'
import { 
  MapPin, Plus, Save, Calendar, DollarSign, Layers, Layout, 
  Settings, User, Wrench, Package, Search, UploadCloud, X
} from 'lucide-react'
import GeoreferenceModal from './GeoreferenceModal'
import { useNavigate } from 'react-router-dom'

// Map Config
const containerStyle = {
  width: '100%',
  height: '100vh', // Full Screen
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 0
}

const defaultCenter = { lat: -33.8688, lng: 151.2093 }

const VisualMapBuilder = () => {
  const navigate = useNavigate()
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const isKeyValid = apiKey && apiKey !== 'YOUR_API_KEY_HERE'

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-builder',
    googleMapsApiKey: isKeyValid ? apiKey : '',
    preventGoogleFontsLoading: true
  })

  // State
  const [map, setMap] = useState(null)
  const [activeMode, setActiveMode] = useState('project') // 'project', 'diary', 'quote'
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [showGeoModal, setShowGeoModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Map Data State
  const [markers, setMarkers] = useState([]) // generic markers (items)
  
  // Load Projects
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.data || res.data)
    } catch (err) {
      console.error('Failed to load projects', err)
    }
  }

  // Handle Map Load
  const onLoad = React.useCallback(function callback(map) {
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  // Handle Map Click (Place Marker)
  const handleMapClick = (e) => {
    if (!selectedProject) return;

    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    const newMarker = {
      id: Date.now(),
      lat,
      lng,
      type: activeMode, // 'diary' item or 'quote' item
      title: activeMode === 'diary' ? 'New Diary Entry' : 'New Quote Item'
    }

    setMarkers(prev => [...prev, newMarker])
  }

  // Handle Site Plan Save
  const handleSitePlanSave = async (planData) => {
    if (!selectedProject) return alert("Select a project first!");
    
    // Save site plan data to the project (assuming backend supports it or store locally for now)
    // Update local state to render overlay
    const updatedProject = { ...selectedProject, sitePlan: planData };
    setSelectedProject(updatedProject);
    
    // Center map
    if (map && planData.bounds) {
        const bounds = new window.google.maps.LatLngBounds(
            { lat: planData.bounds.south, lng: planData.bounds.west },
            { lat: planData.bounds.north, lng: planData.bounds.east }
        );
        map.fitBounds(bounds);
    }
  }

  if (!isKeyValid) {
    return <div className="p-10 text-white bg-gray-900 h-screen flex items-center justify-center">API Key Missing</div>
  }

  if (!isLoaded) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Map Engine...</div>

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
       
       <GeoreferenceModal 
          isOpen={showGeoModal} 
          onClose={() => setShowGeoModal(false)}
          onSave={handleSitePlanSave}
       />

       {/* Top Bar (Overlay) */}
       <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-6 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-4">
            <h1 className="text-xl font-black text-white drop-shadow-md flex items-center gap-2">
               <MapPin className="text-emerald-500" />
               Visual Map Builder
            </h1>
            <div className="flex bg-black/50 backdrop-blur-md rounded-lg p-1 border border-white/10">
               <button 
                 onClick={() => setActiveMode('project')}
                 className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeMode === 'project' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
               >
                 Projects
               </button>
               <button 
                 onClick={() => setActiveMode('diary')}
                 className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeMode === 'diary' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
               >
                 Diary
               </button>
               <button 
                 onClick={() => setActiveMode('quote')}
                 className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeMode === 'quote' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
               >
                 Quotes
               </button>
            </div>
          </div>

          <div className="pointer-events-auto flex gap-3">
             <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-black/50 hover:bg-white/20 text-white text-xs font-bold rounded-lg backdrop-blur-md border border-white/10 transition-all">
                Exit Builder
             </button>
          </div>
       </div>

       {/* Left Sidebar (Overlay) */}
       <div className={`absolute top-20 left-6 bottom-6 w-80 bg-stone-900/90 backdrop-blur-xl border border-white/10 rounded-3xl z-20 flex flex-col shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'}`}>
          
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
             <h2 className="font-bold text-white text-sm uppercase tracking-wider">
               {selectedProject ? selectedProject.name : 'Select Project'}
             </h2>
             <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white"><X size={16}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {!selectedProject ? (
                // Project Selector
                <div className="space-y-2">
                   {projects.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => {
                           setSelectedProject(p);
                           if (p.latitude && p.longitude && map) {
                             map.panTo({ lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) });
                             map.setZoom(18);
                           }
                        }}
                        className="p-4 bg-stone-800/50 hover:bg-stone-700 border border-white/5 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all group"
                      >
                         <div className="font-bold text-white group-hover:text-indigo-400">{p.name}</div>
                         <div className="text-xs text-gray-400">{p.site}</div>
                      </div>
                   ))}
                </div>
             ) : (
                // Project Actions
                <div className="space-y-6">
                   
                   {/* Site Plan Card */}
                   <div className="bg-stone-800/50 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-3">
                         <h3 className="text-xs font-bold text-gray-400 uppercase">Site Plan</h3>
                         <button 
                           onClick={() => setShowGeoModal(true)}
                           className="p-1.5 bg-stone-700 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"
                           title="Upload Plan"
                         >
                            <UploadCloud size={16} />
                         </button>
                      </div>
                      {selectedProject.sitePlan ? (
                         <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-500/20">
                            <Layers size={14} /> Plan Active
                         </div>
                      ) : (
                         <div className="text-xs text-gray-500 italic">No site plan uploaded yet.</div>
                      )}
                   </div>

                   {/* Add Items Grid */}
                   <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Add to Map</h3>
                      <div className="grid grid-cols-2 gap-3">
                         <DraggableTool icon={<User size={18}/>} label="Staff" color="emerald" />
                         <DraggableTool icon={<Wrench size={18}/>} label="Equip" color="amber" />
                         <DraggableTool icon={<Package size={18}/>} label="Material" color="indigo" />
                         <DraggableTool icon={<DollarSign size={18}/>} label="Cost" color="rose" />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 text-center">Click map to place selected item</p>
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

       {/* Toggle Sidebar Button (Visible when closed) */}
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
             tilt: 45, // Enable 3D
             heading: 0
          }}
       >
          {/* Render Projects as Markers */}
          {projects.map(p => p.latitude && (
             <Marker 
               key={p.id}
               position={{ lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) }}
               onClick={() => setSelectedProject(p)}
             />
          ))}

          {/* Render Active Site Plan Overlay */}
          {selectedProject && selectedProject.sitePlan && (
             <GroundOverlay
                url={selectedProject.sitePlan.imageUrl}
                bounds={selectedProject.sitePlan.bounds}
                opacity={0.8}
             />
          )}
          
          {/* Render User Added Markers */}
          {markers.map(m => (
             <Marker 
               key={m.id}
               position={{ lat: m.lat, lng: m.lng }}
               label={{ text: "!", color: "white" }}
             />
          ))}

       </GoogleMap>
    </div>
  )
}

const DraggableTool = ({ icon, label, color }) => (
   <div className={`
      flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-all active:scale-95
      hover:border-${color}-500/50
   `}>
      <div className={`text-${color}-500`}>{icon}</div>
      <span className="text-xs font-bold text-gray-300">{label}</span>
   </div>
)

export default VisualMapBuilder

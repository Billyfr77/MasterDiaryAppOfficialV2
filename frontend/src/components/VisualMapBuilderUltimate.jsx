import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polygon, Polyline, StandaloneSearchBox, TrafficLayer, DrawingManager } from '@react-google-maps/api';
import { 
  Map as MapIcon, Layers, Search, Plus, Settings, Maximize2, Cpu, Navigation, Save, Share2, Box, 
  AlertTriangle, Clock, Trash2, MousePointer, Truck, HardHat, Cone, Hammer, FileText, MoreVertical, X,
  Building, ClipboardList, ArrowRight, CheckCircle, DollarSign, Recycle
} from 'lucide-react';
import { api } from '../utils/api';

// --- 1. CONFIGURATION & STYLES ---

const MIDNIGHT_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#111827" }] }, // Deep Gray-900
  { elementType: "labels.text.stroke", stylers: [{ color: "#1f2937" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d1d5db" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#34d399" }] }, // Emerald POI
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#374151" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1f2937" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f59e0b" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#78350f" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e3a8a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#60a5fa" }] },
];

// --- 2. ASSET ICONS (SVG) ---
const ASSET_LIBRARY = {
    'Logistics': [
        { type: 'Truck', icon: 'M -4,-2 L 4,-2 L 4,2 L -4,2 Z', color: '#3b82f6', label: 'Dump Truck', speed: 40 },
        { type: 'Mixer', icon: 'M -3,-3 L 3,-3 L 3,3 L -3,3 Z', color: '#8b5cf6', label: 'Concrete Mixer', speed: 30 },
    ],
    'Site Ops': [
        { type: 'Crane', icon: 'M 0,0 L -5,-15 L 5,-15 Z', color: '#f59e0b', label: 'Tower Crane' },
        { type: 'Excavator', icon: 'M -5,-5 L 5,-5 L 5,5 L -5,5 Z', color: '#f59e0b', label: 'Excavator' },
    ],
    'Disposal': [
        { type: 'Skip', icon: 'M -4,-4 L 4,-4 L 4,4 L -4,4 Z', color: '#ef4444', label: 'Waste Skip' },
    ]
};

const LIBRARIES = ['places', 'drawing', 'geometry'];

// --- 3. MAIN COMPONENT ---

const VisualMapBuilderUltimate = () => {
  // --- STATE ---
  const [map, setMap] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  
  // Data Models
  const [projects, setProjects] = useState([]); // The real DB projects
  const [mapAssets, setMapAssets] = useState([]); // Visual assets (Trucks, etc)
  
  // UI Flags
  const [activeLayer, setActiveLayer] = useState('roadmap');
  const [showTraffic, setShowTraffic] = useState(false);
  const [show3D, setShow3D] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [drawingMode, setDrawingMode] = useState(null); 

  // Selection & Command Center
  const [selectedProject, setSelectedProject] = useState(null); // The Active Hub
  const [selectedAsset, setSelectedAsset] = useState(null);     // A selected truck/item
  const [placementMode, setPlacementMode] = useState(null);
  
  // Project Creation Modal
  const [newZonePoly, setNewZonePoly] = useState(null); // The polygon just drawn
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', client: '', type: 'Construction' });

  // Live Simulation State (The "Incredible" part)
  const [truckRoutes, setTruckRoutes] = useState([]); // Array of polylines

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  // --- LOAD DATA ---
  const loadData = async () => {
      try {
          const [projRes, assetsRes] = await Promise.all([
              api.get('/projects'),
              api.get('/map-assets')
          ]);
          setProjects(Array.isArray(projRes.data) ? projRes.data : projRes.data.data || []);
          setMapAssets(Array.isArray(assetsRes.data) ? assetsRes.data : []);
      } catch (e) { console.error("Data Load Error", e); }
  };

  useEffect(() => { if (isLoaded) loadData(); }, [isLoaded]);

  // --- MAP HANDLERS ---
  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    if(projects.length === 0) {
        mapInstance.setCenter({ lat: -33.8688, lng: 151.2093 });
        mapInstance.setZoom(12);
    }
  }, [projects]);

  // --- PROJECT HUB CREATION ---
  const handleZoneComplete = (polygon) => {
      setNewZonePoly(polygon); // Store the google maps polygon object
      setShowProjectModal(true); // Open the modal form
      setDrawingMode(null); // Stop drawing
  };

  const confirmCreateProject = async () => {
      if (!newZonePoly) return;

      // 1. Convert Polygon to Coords
      const path = newZonePoly.getPath();
      const coordinates = [];
      let latSum = 0, lngSum = 0;
      for(let i=0; i<path.getLength(); i++) {
          const xy = path.getAt(i);
          coordinates.push({ lat: xy.lat(), lng: xy.lng() });
          latSum += xy.lat();
          lngSum += xy.lng();
      }
      const center = { lat: latSum / path.getLength(), lng: lngSum / path.getLength() };

      try {
          // 2. Create PROJECT in DB
          const projectRes = await api.post('/projects', {
              name: newProjectData.name,
              client: newProjectData.client,
              status: 'active',
              site: 'Map Location',
              latitude: center.lat,
              longitude: center.lng
          });

          // 3. Create MAP ASSET (The Boundary) linked to Project
          const boundaryRes = await api.post('/map-assets', {
              projectId: projectRes.data.id,
              type: 'ProjectBoundary',
              name: `${newProjectData.name} Boundary`,
              geometryType: 'POLYGON',
              coordinates: coordinates,
              properties: { 
                  color: '#10b981', 
                  wasteTotal: 0, 
                  trucksEnRoute: 0 
              } // Initial Hub Stats
          });

          // 4. Update State
          setProjects(prev => [...prev, projectRes.data]);
          setMapAssets(prev => [...prev, boundaryRes.data]);
          
          // 5. Clean Up
          newZonePoly.setMap(null); // Remove raw drawing
          setNewZonePoly(null);
          setShowProjectModal(false);
          setNewProjectData({ name: '', client: '', type: 'Construction' });

          // 6. Select it immediately (Open Command Center)
          setSelectedProject({ ...projectRes.data, boundaryId: boundaryRes.data.id, boundaryProps: boundaryRes.data.properties });

      } catch (error) {
          console.error("Project Creation Failed:", error);
          alert("Failed to create project hub.");
      }
  };

  // --- TRUCK LOGISTICS LOGIC ---
  const handleTruckDispatch = async (startHub, endHub) => {
      // Draw a line between two hubs (Simulated)
      // In real app: Directions Service
      if (!startHub || !endHub) return;
      
      const route = [
          { lat: parseFloat(startHub.latitude), lng: parseFloat(startHub.longitude) },
          { lat: parseFloat(endHub.latitude), lng: parseFloat(endHub.longitude) }
      ];
      
      setTruckRoutes(prev => [...prev, { id: Date.now(), path: route, status: 'En Route' }]);
      
      // Create a Truck Asset moving along it? For MVP, just place truck at start
      const newTruck = {
          type: 'Truck',
          name: 'Dispatch 001',
          geometryType: 'POINT',
          coordinates: route[0],
          properties: { status: 'Moving', cargo: 'Waste', tons: 15 }
      };
      
      const res = await api.post('/map-assets', newTruck);
      setMapAssets(prev => [...prev, res.data]);
  };

  const handleLogWaste = async (hub) => {
      // Update the MapAsset property for this hub (Simulated Real-time DB update)
      // Find the asset linked to this project
      const hubAsset = mapAssets.find(a => a.projectId === hub.id && a.type === 'ProjectBoundary');
      if (hubAsset) {
          const newTotal = (hubAsset.properties?.wasteTotal || 0) + 5.5; // Add 5.5 tons
          
          // Optimistic
          setMapAssets(prev => prev.map(a => a.id === hubAsset.id ? { 
              ...a, 
              properties: { ...a.properties, wasteTotal: newTotal } 
          } : a));

          // Server
          await api.put(`/map-assets/${hubAsset.id}`, {
              properties: { ...hubAsset.properties, wasteTotal: newTotal }
          });
      }
  };

  // --- INSPECTOR LOGIC ---
  const deleteAsset = async () => {
      if(!selectedAsset) return;
      if(!window.confirm("Delete this asset?")) return;
      try {
          await api.delete(`/map-assets/${selectedAsset.id}`);
          setMapAssets(prev => prev.filter(a => a.id !== selectedAsset.id));
          setSelectedAsset(null);
      } catch (err) { console.error(err); }
  };

  // --- RENDER HELPERS ---
  const getIconPath = (type) => {
      const def = Object.values(ASSET_LIBRARY).flat().find(a => a.type === type);
      return def ? def.icon : window.google.maps.SymbolPath.CIRCLE;
  };
  
  const getIconColor = (type) => {
      const def = Object.values(ASSET_LIBRARY).flat().find(a => a.type === type);
      return def ? def.color : '#fff';
  };


  if (loadError) return <div className="text-rose-500 font-bold p-20 text-center">CRITICAL MAP ERROR</div>;

  return isLoaded ? (
    <div className="relative w-full h-[calc(100vh-80px)] bg-stone-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex">
      
      {/* --- 1. LEFT SIDEBAR (ASSET HANGAR) --- */}
      <div className={`w-72 bg-stone-900/95 border-r border-white/10 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-ml-72'}`}>
         <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-white font-bold flex items-center gap-2"><Cpu size={18} className="text-indigo-500"/> GEOCORE</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-white"><X size={16}/></button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-hide">
             {/* Project Hub Creator */}
             <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 rounded-xl p-3 border border-emerald-500/30">
                 <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">New Project</h3>
                 <button 
                    onClick={() => { setDrawingMode('polygon'); setPlacementMode(null); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${drawingMode === 'polygon' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'}`}
                 >
                    <Box size={16} /> Draw Site Boundary
                 </button>
                 <p className="text-[10px] text-emerald-500/60 mt-2 leading-tight">Draw a polygon to create a new Project Hub and activate command features.</p>
             </div>

             {/* Asset Deployment */}
             {Object.entries(ASSET_LIBRARY).map(([category, items]) => (
                 <div key={category}>
                     <h3 className="px-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{category}</h3>
                     <div className="space-y-1">
                         {items.map(item => (
                             <button
                                key={item.type}
                                onClick={() => { setPlacementMode(item.type); setDrawingMode(null); }}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${placementMode === item.type ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/5'}`}
                             >
                                <div className="w-6 h-6 rounded bg-stone-800 flex items-center justify-center border border-white/10" style={{color: item.color}}>
                                    {category === 'Logistics' && <Truck size={12}/>}
                                    {category === 'Site Ops' && <Hammer size={12}/>}
                                    {category === 'Disposal' && <Recycle size={12}/>}
                                </div>
                                <span className="text-sm font-medium">{item.label}</span>
                             </button>
                         ))}
                     </div>
                 </div>
             ))}
         </div>
      </div>

      {/* --- 2. MAIN MAP --- */}
      <div className="flex-1 relative bg-stone-950">
          {/* Sidebar Toggle */}
          {!isSidebarOpen && (
             <button onClick={() => setIsSidebarOpen(true)} className="absolute top-4 left-4 z-10 p-3 bg-stone-900/90 border border-white/10 rounded-xl text-white shadow-xl">
                <Cpu size={20} />
             </button>
          )}
          
          {/* Map Controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-stone-900/90 border border-white/10 rounded-xl p-1 flex shadow-xl">
                 <button onClick={() => { if(map) map.setMapTypeId('roadmap') }} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"><MapIcon size={18}/></button>
                 <button onClick={() => { if(map) map.setMapTypeId('satellite') }} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"><Layers size={18}/></button>
                 <div className="w-px bg-white/10 mx-1" />
                 <button onClick={() => setShowTraffic(!showTraffic)} className={`p-2 rounded-lg ${showTraffic ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400 hover:text-white'}`}><Navigation size={18}/></button>
                 <button onClick={() => { setShow3D(!show3D); map.setTilt(show3D ? 0 : 45); }} className={`p-2 rounded-lg ${show3D ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-white'}`}><Box size={18}/></button>
          </div>

          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={{
                styles: MIDNIGHT_MAP_STYLE,
                disableDefaultUI: true,
                tilt: 45,
                zoom: 13,
                center: { lat: -33.8688, lng: 151.2093 }
            }}
            onLoad={onLoad}
            onUnmount={() => setMap(null)}
            onClick={async (e) => {
                if (placementMode) {
                    // Quick Asset Drop
                    const assetDef = Object.values(ASSET_LIBRARY).flat().find(a => a.type === placementMode);
                    const newAsset = {
                        type: placementMode,
                        name: `${assetDef.label}`,
                        geometryType: 'POINT',
                        coordinates: { lat: e.latLng.lat(), lng: e.latLng.lng() },
                        properties: { color: assetDef.color, status: 'Active' }
                    };
                    const res = await api.post('/map-assets', newAsset);
                    setMapAssets(prev => [...prev, res.data]);
                    setPlacementMode(null);
                } else {
                    setSelectedProject(null);
                    setSelectedAsset(null);
                }
            }}
          >
             {showTraffic && <TrafficLayer />}
             
             {/* Drawing Manager for Zones */}
             {drawingMode === 'polygon' && (
                 <DrawingManager 
                    onPolygonComplete={handleZoneComplete}
                    options={{
                        drawingControl: false,
                        polygonOptions: { fillColor: '#10b981', fillOpacity: 0.4, strokeWeight: 2, strokeColor: '#fff', editable: true }
                    }}
                 />
             )}

             {/* TRUCK ROUTES */}
             {truckRoutes.map(route => (
                 <Polyline 
                    key={route.id}
                    path={route.path}
                    options={{
                        strokeColor: '#f59e0b',
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                        geodesic: true,
                        icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 }, offset: '0', repeat: '10px' }]
                    }}
                 />
             ))}

             {/* MAP ASSETS (Project Hubs & Items) */}
             {mapAssets.map(asset => {
                 // 1. PROJECT HUBS (Polygons)
                 if (asset.geometryType === 'POLYGON' && asset.type === 'ProjectBoundary') {
                     const isSelected = selectedProject?.boundaryId === asset.id;
                     return (
                         <Polygon
                            key={asset.id}
                            paths={asset.coordinates}
                            onClick={() => {
                                // Find linked project
                                const proj = projects.find(p => p.id === asset.projectId);
                                if (proj) setSelectedProject({ ...proj, boundaryId: asset.id, boundaryProps: asset.properties });
                            }}
                            options={{
                                fillColor: asset.properties?.color || '#10b981',
                                fillOpacity: isSelected ? 0.2 : 0.1,
                                strokeColor: asset.properties?.color || '#10b981',
                                strokeWeight: isSelected ? 3 : 2
                            }}
                         />
                     )
                 }
                 // 2. MOVABLE ASSETS (Points)
                 if (asset.geometryType === 'POINT') {
                     return (
                         <Marker
                            key={asset.id}
                            position={asset.coordinates}
                            draggable={true}
                            icon={{
                                path: getIconPath(asset.type),
                                scale: 8,
                                fillColor: getIconColor(asset.type),
                                fillOpacity: 1,
                                strokeColor: '#fff',
                                strokeWeight: 1,
                                rotation: 0,
                            }}
                            onClick={() => setSelectedAsset(asset)}
                         />
                     )
                 }
                 return null;
             })}
          </GoogleMap>
      </div>

      {/* --- 3. PROJECT COMMAND CENTER (BOTTOM SHEET) --- */}
      {selectedProject && (
          <div className="absolute bottom-6 left-6 right-6 bg-stone-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-0 overflow-hidden flex flex-col md:flex-row h-64 animate-slide-in-up">
              
              {/* HEADER & METRICS */}
              <div className="w-full md:w-1/3 p-6 border-r border-white/10 bg-gradient-to-br from-stone-900 to-stone-950">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/> LIVE HUB
                          </div>
                          <h2 className="text-2xl font-black text-white tracking-tight">{selectedProject.name}</h2>
                          <p className="text-gray-400 text-sm">{selectedProject.client} • {selectedProject.site}</p>
                      </div>
                      <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-white"><X size={20}/></button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-3">
                          <div className="text-[10px] text-emerald-400 uppercase font-bold">Total Waste</div>
                          <div className="text-2xl font-mono text-white font-bold">
                              {selectedProject.boundaryProps?.wasteTotal || 0}<span className="text-sm text-gray-500 ml-1">T</span>
                          </div>
                      </div>
                      <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-3">
                          <div className="text-[10px] text-indigo-400 uppercase font-bold">Logistics</div>
                          <div className="text-2xl font-mono text-white font-bold">
                               {selectedProject.boundaryProps?.trucksEnRoute || 0}<span className="text-sm text-gray-500 ml-1">active</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* ACTIONS & DATA */}
              <div className="flex-1 p-6 overflow-y-auto grid grid-cols-3 gap-6">
                  
                  {/* Waste Management */}
                  <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><Recycle size={14}/> Waste Ops</h4>
                      <button 
                          onClick={() => handleLogWaste(selectedProject)}
                          className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left text-sm text-white flex items-center justify-between group transition-all"
                      >
                          <span>Log Disposal (5.5T)</span>
                          <Plus size={14} className="text-gray-500 group-hover:text-emerald-400"/>
                      </button>
                      <button className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left text-sm text-white flex items-center justify-between group">
                          <span>View Waste Manifests</span>
                          <ArrowRight size={14} className="text-gray-500 group-hover:text-white"/>
                      </button>
                  </div>

                  {/* Docs */}
                  <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><FileText size={14}/> Documentation</h4>
                      <div className="w-full py-2 px-3 bg-black/20 border border-white/5 rounded-lg flex items-center gap-3">
                           <div className="p-1.5 bg-indigo-500/20 rounded text-indigo-400"><DollarSign size={12}/></div>
                           <div className="text-sm text-gray-300">Quote #4921</div>
                      </div>
                      <div className="w-full py-2 px-3 bg-black/20 border border-white/5 rounded-lg flex items-center gap-3">
                           <div className="p-1.5 bg-purple-500/20 rounded text-purple-400"><FileText size={12}/></div>
                           <div className="text-sm text-gray-300">Diary: {new Date().toLocaleDateString()}</div>
                      </div>
                  </div>

                  {/* Logistics */}
                  <div className="space-y-3">
                       <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><Truck size={14}/> Traffic & Access</h4>
                       <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg">
                           + Plan New Route
                       </button>
                       <div className="p-3 rounded-lg bg-amber-900/10 border border-amber-500/20">
                           <div className="flex items-center gap-2 text-amber-500 text-xs font-bold mb-1">
                               <AlertTriangle size={12}/> Heavy Traffic
                           </div>
                           <p className="text-[10px] text-gray-400">Expected delay 15m on main access road.</p>
                       </div>
                  </div>

              </div>
          </div>
      )}

      {/* --- 4. CREATE PROJECT MODAL --- */}
      {showProjectModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-stone-900 border border-white/10 rounded-2xl p-6 w-96 shadow-2xl animate-scale-in">
                  <h2 className="text-xl font-bold text-white mb-1">Initialize Hub</h2>
                  <p className="text-sm text-gray-400 mb-6">Convert this zone into a managed Project Hub.</p>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Name</label>
                          <input 
                            type="text" 
                            value={newProjectData.name}
                            onChange={e => setNewProjectData({...newProjectData, name: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500 outline-none"
                            placeholder="e.g. West Wing Foundation"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Client Name</label>
                          <input 
                            type="text" 
                            value={newProjectData.client}
                            onChange={e => setNewProjectData({...newProjectData, client: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500 outline-none"
                            placeholder="e.g. John Doe"
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button onClick={() => setShowProjectModal(false)} className="flex-1 py-2 text-gray-400 hover:text-white text-sm font-bold">Cancel</button>
                      <button onClick={confirmCreateProject} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg">Create Hub</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  ) : <div className="flex h-screen items-center justify-center bg-stone-950 text-indigo-500">Loading...</div>;
};

export default VisualMapBuilderUltimate;

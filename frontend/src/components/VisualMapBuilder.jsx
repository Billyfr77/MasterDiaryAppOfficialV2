import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, Marker, DrawingManager, StreetViewPanorama } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { 
  Map as MapIcon, X, Building2, Briefcase, DollarSign, TrendingUp, 
  Calendar, FileText, Plus, ArrowRight, LayoutDashboard, Navigation, 
  Locate, Layers, Globe, Camera, Zap, Settings, Upload, Trash2, Edit, Image as ImageIcon
} from 'lucide-react';
import { api } from '../utils/api';

// --- CONFIGURATION ---
const LIBRARIES = ['drawing', 'geometry', 'places'];

const MIDNIGHT_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e3a8a" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
];

const HUB_COLORS = {
    'active': '#10b981',   // Emerald
    'pending': '#f59e0b',  // Amber
    'office': '#6366f1',   // Indigo
    'archive': '#64748b'   // Slate
};

// --- COMPONENT: PROJECT HUB DRAWER ---
const ProjectHubDrawer = ({ project, onClose, onUpdate, onDelete }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ revenue: 0, cost: 0, margin: 0 });
    const [diaries, setDiaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('overview'); // overview, streetview, custom
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (project?.id) loadProjectData();
    }, [project]);

    const loadProjectData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/diaries`); 
            const allEntries = Array.isArray(res.data.data) ? res.data.data : [];
            // Filter by project ID strictly if possible, or by name match fallback
            const entries = allEntries.filter(d => d.projectId === project.id || (d.Project && d.Project.id === project.id));
            
            const revenue = entries.reduce((sum, d) => sum + (parseFloat(d.totalRevenue) || 0), 0);
            const cost = entries.reduce((sum, d) => sum + (parseFloat(d.totalCost) || 0), 0);
            
            setStats({ revenue, cost, margin: revenue - cost });
            setDiaries(entries.slice(0, 5)); 
            
            // Check if project has a custom cover image (stored in map asset properties or project description/metadata)
            if (project.properties?.coverImage) {
                setViewMode('custom');
            }
        } catch (e) { console.error("Hub Data Error", e); }
        setLoading(false);
    };

    const handleUploadCover = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Update the Map Asset with the new image URL
            // We assume 'project' prop includes the MapAsset ID or we can find it.
            // Actually 'project' here is a hybrid object. We need the MapAsset ID to update the zone properties.
            if (project.assetId) {
                 const updatedProps = { ...project.properties, coverImage: res.data.url };
                 await api.put(`/map-assets/${project.assetId}`, {
                     properties: updatedProps
                 });
                 onUpdate({ ...project, properties: updatedProps }); // Notify parent
                 setViewMode('custom');
            }
        } catch (err) {
            alert("Upload failed");
        }
    };

    const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    // Calculate center for StreetView
    const center = project.coordinates && project.coordinates[0] ? project.coordinates[0] : null;
    const coverImage = project.properties?.coverImage;

    return (
        <div className="absolute top-0 right-0 bottom-0 w-[480px] bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col animate-slide-left z-50 font-sans">
            
            {/* Dynamic Header Background */}
            <div className="relative h-64 bg-slate-900 group overflow-hidden">
                {viewMode === 'streetview' && center ? (
                     <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        zoom={1}
                        options={{ disableDefaultUI: true }}
                     >
                        <StreetViewPanorama
                            position={center}
                            visible={true}
                            options={{ disableDefaultUI: true, zoomControl: false, addressControl: false }}
                        />
                     </GoogleMap>
                ) : viewMode === 'custom' && coverImage ? (
                    <img src={coverImage} alt="Project Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                        <Building2 size={80} className="text-white/5" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent pointer-events-none" />

                {/* Header Actions */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                     <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadCover} accept="image/*" />
                     <button 
                        onClick={() => fileInputRef.current.click()}
                        className="p-2 bg-black/40 hover:bg-indigo-600 rounded-full text-white backdrop-blur-md transition-all"
                        title="Upload Cover Image"
                     >
                        <ImageIcon size={16} />
                     </button>
                     <button onClick={() => onDelete(project)} className="p-2 bg-black/40 hover:bg-rose-600 rounded-full text-white backdrop-blur-md transition-all" title="Delete Zone">
                        <Trash2 size={16} />
                     </button>
                     <button onClick={onClose} className="p-2 bg-black/40 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
                        <X size={16} />
                     </button>
                </div>

                <div className="absolute bottom-6 left-8 z-20 right-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg border border-white/10 ${project.status === 'office' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                            {project.status === 'office' ? 'HQ Node' : 'Active Project'}
                        </span>
                    </div>
                    <h2 className="text-3xl font-black text-white leading-none mb-2 drop-shadow-lg">{project.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 bg-black/30 w-fit px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
                        <Navigation size={12} /> 
                        {project.site || 'Geo-Tagged Zone'}
                    </div>
                </div>
            </div>

            {/* View Toggles */}
            <div className="flex border-b border-white/5 bg-slate-900/50 p-1">
                <button onClick={() => setViewMode('overview')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${viewMode==='overview' ? 'border-indigo-500 text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Overview</button>
                <button onClick={() => setViewMode('streetview')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${viewMode==='streetview' ? 'border-indigo-500 text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Street View</button>
                {coverImage && <button onClick={() => setViewMode('custom')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${viewMode==='custom' ? 'border-indigo-500 text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Photo</button>}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-slate-950">
                
                {/* Financial Cards */}
                {project.status !== 'office' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl hover:border-indigo-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Revenue</span>
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform"><TrendingUp size={14}/></div>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tight">{loading ? '...' : formatMoney(stats.revenue)}</div>
                        </div>
                        <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl hover:border-rose-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cost</span>
                                <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-500 group-hover:scale-110 transition-transform"><DollarSign size={14}/></div>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tight">{loading ? '...' : formatMoney(stats.cost)}</div>
                        </div>
                    </div>
                )}

                {/* Command Actions */}
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 block flex items-center gap-2"><Zap size={12}/> Command Center</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => navigate('/quotes/new', { state: { projectId: project.id } })}
                            className="p-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-sm flex flex-col items-center gap-3 transition-all shadow-lg shadow-emerald-900/20 hover:-translate-y-1"
                        >
                            <div className="p-2 bg-white/20 rounded-full"><DollarSign size={18} /></div>
                            Build Quote
                        </button>
                        <button 
                            onClick={() => navigate('/diary', { state: { projectId: project.id } })}
                            className="p-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-sm flex flex-col items-center gap-3 transition-all shadow-lg shadow-indigo-900/30 hover:-translate-y-1"
                        >
                            <div className="p-2 bg-white/20 rounded-full"><Plus size={18} /></div>
                            Log Diary Entry
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white font-bold text-sm flex flex-col items-center gap-3 transition-all border border-white/5 hover:border-white/20 hover:-translate-y-1"
                        >
                            <div className="p-2 bg-black/20 rounded-full"><LayoutDashboard size={18} /></div>
                            View Analytics
                        </button>
                    </div>
                </div>

                {/* Diary Feed */}
                {project.status !== 'office' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Recent Logs</label>
                             <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">{diaries.length} entries</span>
                        </div>
                        <div className="space-y-3">
                            {loading ? <div className="text-center text-gray-600 text-xs italic">Syncing data...</div> : 
                             diaries.length === 0 ? <div className="text-center text-gray-600 text-xs py-6 border border-dashed border-white/10 rounded-2xl bg-white/5">No activity recorded yet.</div> :
                             diaries.map(d => (
                                <div key={d.id} className="p-4 bg-slate-900 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer flex items-center justify-between group hover:bg-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 group-hover:text-white border border-white/5">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white mb-0.5">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{d.weather || 'Sunny'} • {d.totalHours || 0} hrs</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">{formatMoney(d.totalRevenue)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const VisualMapBuilder = () => {
  const [map, setMap] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null); 
  const [mapTypeId, setMapTypeId] = useState('roadmap'); 
  const [projects, setProjects] = useState([]);
  const [zones, setZones] = useState([]); 
  const [selectedHub, setSelectedHub] = useState(null); 
  
  // Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newZonePath, setNewZonePath] = useState(null);
  const [newHubData, setNewHubData] = useState({ name: '', type: 'project' }); 

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  useEffect(() => {
      loadData();
  }, []);

  const loadData = async () => {
      try {
          const [pRes, aRes] = await Promise.all([api.get('/projects'), api.get('/map-assets')]);
          setProjects(Array.isArray(pRes.data) ? pRes.data : []);
          setZones(Array.isArray(aRes.data) ? aRes.data.filter(a => a.geometryType === 'POLYGON') : []);
      } catch(e) { console.error("Data Load Error", e); }
  };

  const onMapLoad = useCallback((mapInstance) => {
      setMap(mapInstance);
      mapInstance.setTilt(45);
  }, []);

  const handlePolygonComplete = (polygon) => {
      const path = polygon.getPath();
      const coords = [];
      for(let i=0; i<path.getLength(); i++) {
          coords.push({ lat: path.getAt(i).lat(), lng: path.getAt(i).lng() });
      }
      
      polygon.setMap(null); // Remove overlay
      setNewZonePath(coords);
      setDrawingMode(null); // Stop drawing
      setShowCreateModal(true);
  };

  const createHub = async () => {
      if (!newZonePath) return;
      
      try {
          let projectId = null;

          // Auto-detect address center
          const centerLat = newZonePath.reduce((sum, p) => sum + p.lat, 0) / newZonePath.length;
          const centerLng = newZonePath.reduce((sum, p) => sum + p.lng, 0) / newZonePath.length;

          if (newHubData.type === 'project') {
              const pRes = await api.post('/projects', {
                  name: newHubData.name,
                  status: 'active',
                  site: 'Geofenced Zone', 
                  latitude: centerLat,
                  longitude: centerLng
              });
              setProjects(prev => [...prev, pRes.data]);
              projectId = pRes.data.id;
          }

          const assetPayload = {
              type: newHubData.type === 'office' ? 'OfficeZone' : 'ProjectZone',
              name: newHubData.name,
              geometryType: 'POLYGON',
              coordinates: newZonePath,
              projectId: projectId,
              properties: { 
                  color: newHubData.type === 'office' ? HUB_COLORS.office : HUB_COLORS.active,
                  type: newHubData.type 
              }
          };

          const aRes = await api.post('/map-assets', assetPayload);
          setZones(prev => [...prev, aRes.data]);
          
          setShowCreateModal(false);
          setNewHubData({ name: '', type: 'project' });
          setNewZonePath(null);
          setDrawingMode(null);

      } catch (e) {
          alert("Failed to create hub: " + e.message);
      }
  };

  const handleDeleteHub = async (hub) => {
      if(!confirm("Are you sure you want to delete this zone? The project data will remain.")) return;
      try {
          // Delete the MapAsset
          if(hub.assetId) await api.delete(`/map-assets/${hub.assetId}`);
          setZones(prev => prev.filter(z => z.id !== hub.assetId));
          setSelectedHub(null);
      } catch(e) { alert("Delete failed"); }
  };

  const handleHubUpdate = (updatedHub) => {
      // Update local state to reflect changes (like new cover image)
      setZones(prev => prev.map(z => z.id === updatedHub.assetId ? { ...z, properties: updatedHub.properties } : z));
      setSelectedHub(updatedHub);
  };

  const handleZoneClick = (zone) => {
      if (drawingMode) return; 

      const linkedProject = projects.find(p => p.id === zone.projectId);
      
      const hub = {
          id: linkedProject?.id || zone.id, 
          assetId: zone.id, // Key for MapAsset updates
          name: linkedProject?.name || zone.name,
          status: zone.properties?.type === 'office' ? 'office' : 'active',
          site: linkedProject?.site || 'Map Zone',
          isProject: !!linkedProject,
          coordinates: zone.coordinates,
          properties: zone.properties || {}
      };
      
      setSelectedHub(hub);
  };

  if (!isLoaded) return <div className="h-screen bg-slate-950 flex items-center justify-center text-indigo-500 font-mono">INITIALIZING MAP SYSTEM...</div>;

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-slate-950 overflow-hidden flex">
      
      {/* SIDEBAR */}
      <div className="w-72 bg-slate-900/95 border-r border-white/5 flex flex-col z-10 backdrop-blur-xl shadow-2xl">
          <div className="p-8 border-b border-white/5">
              <h1 className="text-xl font-black italic text-white tracking-tighter flex items-center gap-2">
                 <MapIcon className="text-indigo-500" /> GEOCORE <span className="text-indigo-500">ULTRA</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Spatial Intelligence Platform</p>
          </div>
          
          <div className="p-6 space-y-8">
              {/* Map Controls */}
              <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Map Layer</label>
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                          onClick={() => setMapTypeId('roadmap')} 
                          className={`p-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${mapTypeId === 'roadmap' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-800 border-white/5 text-gray-400 hover:text-white hover:bg-slate-700'}`}
                      >
                          <MapIcon size={16} /> Standard
                      </button>
                      <button 
                          onClick={() => setMapTypeId('hybrid')} 
                          className={`p-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${mapTypeId === 'hybrid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-800 border-white/5 text-gray-400 hover:text-white hover:bg-slate-700'}`}
                      >
                          <Globe size={16} /> Satellite
                      </button>
                  </div>
              </div>

              {/* Tools */}
              <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Construction Ops</label>
                  <button 
                      onClick={() => setDrawingMode('polygon')}
                      className={`w-full p-5 rounded-2xl border flex items-center gap-4 transition-all group ${drawingMode === 'polygon' ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-900/40 scale-[1.02]' : 'bg-slate-800 border-white/5 text-gray-300 hover:bg-slate-700 hover:border-white/10'}`}
                  >
                      <div className="p-2 bg-black/20 rounded-lg group-hover:bg-black/40 transition-colors">
                          <Layers size={24} />
                      </div>
                      <div className="text-left">
                          <div className="text-sm font-black uppercase tracking-wide">Draw Zone</div>
                          <div className="text-[10px] font-medium opacity-60">Define New Project Site</div>
                      </div>
                  </button>
              </div>

              {/* Stats */}
              <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Active Sectors</label>
                  <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm group cursor-default">
                          <span className="flex items-center gap-3 text-gray-300 font-bold"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div> Project Sites</span>
                          <span className="font-black text-white bg-white/5 px-2 py-0.5 rounded">{zones.filter(z => z.properties?.type !== 'office').length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm group cursor-default">
                          <span className="flex items-center gap-3 text-gray-300 font-bold"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div> HQ Offices</span>
                          <span className="font-black text-white bg-white/5 px-2 py-0.5 rounded">{zones.filter(z => z.properties?.type === 'office').length}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* MAP SURFACE */}
      <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: -33.8688, lng: 151.2093 }}
            zoom={13}
            options={{
                styles: mapTypeId === 'roadmap' ? MIDNIGHT_STYLE : null, 
                disableDefaultUI: true,
                mapTypeControl: false,
                tilt: 45,
                clickableIcons: false 
            }}
            onLoad={onMapLoad}
            onClick={() => {
                if (!drawingMode) setSelectedHub(null);
            }}
          >
              {/* Drawing Manager */}
              {drawingMode && (
                  <DrawingManager
                      onPolygonComplete={handlePolygonComplete}
                      options={{
                          drawingControl: false,
                          polygonOptions: {
                              fillColor: '#10b981',
                              fillOpacity: 0.4,
                              strokeWeight: 3,
                              strokeColor: '#fff',
                              clickable: false,
                              editable: true,
                              zIndex: 10
                          },
                          drawingMode: window.google.maps.drawing.OverlayType.POLYGON
                      }}
                  />
              )}

              {/* Render Zones */}
              {zones.map(zone => (
                  <Polygon
                      key={zone.id}
                      paths={zone.coordinates}
                      options={{
                          fillColor: zone.properties?.color || HUB_COLORS.active,
                          fillOpacity: 0.3,
                          strokeColor: zone.properties?.color || HUB_COLORS.active,
                          strokeWeight: 2,
                          zIndex: 1
                      }}
                      onClick={() => handleZoneClick(zone)}
                  />
              ))}

              {/* Labels */}
              {zones.map(zone => {
                  const center = zone.coordinates[0]; 
                  return (
                    <Marker
                        key={`marker-${zone.id}`}
                        position={center}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 0, 
                        }}
                        label={{
                            text: zone.name,
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: '900',
                            className: 'map-label-chip' 
                        }}
                        onClick={() => handleZoneClick(zone)}
                    />
                  )
              })}
          </GoogleMap>
          
          {/* Overlay Hint */}
          {drawingMode && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-3 rounded-full font-black shadow-2xl animate-bounce z-30 flex items-center gap-3 border border-white/20 backdrop-blur-lg">
                  <Layers size={20} className="animate-pulse"/> CLICK MAP TO DEFINE PERIMETER
              </div>
          )}
      </div>

      {/* CREATE HUB MODAL */}
      {showCreateModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="bg-stone-900 border border-white/10 p-10 rounded-[2rem] w-[450px] shadow-2xl transform transition-all scale-100">
                  <h2 className="text-3xl font-black text-white mb-8 text-center">Initialize Zone</h2>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="text-xs font-black text-gray-500 uppercase block mb-2 tracking-widest">Zone Designation</label>
                          <input 
                            autoFocus
                            className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-lg text-white font-bold focus:border-indigo-500 outline-none transition-colors placeholder-gray-700"
                            placeholder="e.g. Site Alpha"
                            value={newHubData.name}
                            onChange={e => setNewHubData({...newHubData, name: e.target.value})}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div 
                            onClick={() => setNewHubData({...newHubData, type: 'project'})}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 group ${newHubData.type === 'project' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-stone-800/50 border-transparent text-gray-500 hover:bg-stone-800 hover:border-white/10'}`}
                          >
                              <div className={`p-3 rounded-full ${newHubData.type === 'project' ? 'bg-emerald-500 text-white' : 'bg-stone-700 text-gray-400'} transition-colors`}>
                                  <Briefcase size={24} />
                              </div>
                              <span className="text-xs font-black uppercase tracking-wide">Active Project</span>
                          </div>
                          <div 
                            onClick={() => setNewHubData({...newHubData, type: 'office'})}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 group ${newHubData.type === 'office' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-stone-800/50 border-transparent text-gray-500 hover:bg-stone-800 hover:border-white/10'}`}
                          >
                              <div className={`p-3 rounded-full ${newHubData.type === 'office' ? 'bg-indigo-500 text-white' : 'bg-stone-700 text-gray-400'} transition-colors`}>
                                  <Building2 size={24} />
                              </div>
                              <span className="text-xs font-black uppercase tracking-wide">HQ / Office</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-10">
                      <button onClick={() => { setShowCreateModal(false); setNewZonePath(null); }} className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
                      <button onClick={createHub} className="flex-1 py-4 rounded-2xl font-bold bg-white text-black hover:bg-gray-200 shadow-xl hover:scale-[1.02] transition-all">
                          Confirm Initialization
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* PROJECT HUB DRAWER */}
      {selectedHub && (
          <ProjectHubDrawer 
            project={selectedHub} 
            map={map}
            onClose={() => setSelectedHub(null)} 
            onDelete={handleDeleteHub}
            onUpdate={handleHubUpdate}
          />
      )}

    </div>
  );
};

export default VisualMapBuilder;
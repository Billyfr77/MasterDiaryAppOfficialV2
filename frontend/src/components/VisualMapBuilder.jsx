import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polygon, Polyline, DirectionsRenderer, StandaloneSearchBox, TrafficLayer, DrawingManager, StreetViewPanorama } from '@react-google-maps/api';
import { 
  Map as MapIcon, Layers, Search, Navigation, Box, AlertTriangle, Truck, 
  FileText, X, Target, Zap, Clock, Camera, Globe, ChevronRight, PlayCircle,
  Radar, Eye, RotateCw, ShoppingCart, Coffee, Fuel
} from 'lucide-react';
import { api } from '../utils/api';

// --- CONFIGURATION ---
const LIBRARIES = ['places', 'drawing', 'geometry'];

const ASSET_CATALOG = {
    'LOGISTICS': [
        { id: 'dump_truck', label: 'Dump Truck', icon: 'M -4,-2 L 4,-2 L 4,2 L -4,2 Z', color: '#3b82f6', type: 'vehicle' },
        { id: 'mixer', label: 'Concrete Mixer', icon: 'M -3,-3 L 3,-3 L 3,3 L -3,3 Z', color: '#8b5cf6', type: 'vehicle' },
    ],
    'HEAVY OPS': [
        { id: 'crane', label: 'Tower Crane', icon: 'M 0,0 L -5,-15 L 5,-15 Z', color: '#f59e0b', type: 'equipment' },
        { id: 'excavator', label: 'Excavator', icon: 'M -5,-5 L 5,-5 L 5,5 L -5,5 Z', color: '#f59e0b', type: 'equipment' },
    ],
    'SAFETY': [
        { id: 'cone', label: 'Hazard Zone', icon: 'M 0,-10 L -5,0 L 5,0 Z', color: '#ef4444', type: 'marker' },
    ]
};

const MIDNIGHT_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#f8fafc" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e3a8a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#93c5fd" }] },
];

const VisualMapBuilder = () => {
  // --- CORE STATE ---
  const [map, setMap] = useState(null);
  const [isLoadedState, setIsLoadedState] = useState(false);
  const [mapTypeId, setMapTypeId] = useState('roadmap'); 
  const [mapStyles, setMapStyles] = useState(MIDNIGHT_STYLE);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [heading, setHeading] = useState(0); // Map Rotation

  // --- DATA LAYERS ---
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]); // Radar Results
  const [activeRoute, setActiveRoute] = useState(null);
  const [routeStats, setRouteStats] = useState(null);

  // --- INTERACTION STATE ---
  const [mode, setMode] = useState('view'); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [routingSource, setRoutingSource] = useState(null);
  const [showStreetView, setShowStreetView] = useState(false); // Toggle Split View
  
  // --- MODALS ---
  const [notifications, setNotifications] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [newZonePoly, setNewZonePoly] = useState(null);
  const [newProjectData, setNewProjectData] = useState({ name: '', client: '', address: '' });
  const [wasteFormData, setWasteFormData] = useState({ wasteType: 'General', quantity: '', destination: '', truckId: '' });

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  // --- INIT ---
  useEffect(() => {
    if (isLoaded) {
      setTimeout(() => setIsLoadedState(true), 500);
      loadBackendData();
    }
  }, [isLoaded]);

  // --- MAP ENGINE ---
  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    mapInstance.setTilt(45);
  }, []);

  const loadBackendData = async () => {
    try {
        const [p, a] = await Promise.all([api.get('/projects'), api.get('/map-assets')]);
        setProjects(Array.isArray(p.data) ? p.data : []);
        setAssets(Array.isArray(a.data) ? a.data : []);
        notify("GeoCore Omega Online", "success");
    } catch(e) { notify("Offline Mode Active", "error"); }
  };

  const notify = (msg, type) => {
    const id = Date.now();
    setNotifications(p => [...p, {id, msg, type}]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 4000);
  };

  // --- INTELLIGENT FEATURES ---

  // 0. SMART DISPATCH (Distance Matrix API)
  const findNearestAsset = (projectZone) => {
      if (!map || assets.length === 0) return;
      
      // Filter for vehicles
      const fleet = assets.filter(a => a.properties.type === 'vehicle');
      if (fleet.length === 0) { notify("No Fleet Assets Available", "error"); return; }

      notify("Calculating Fleet Logistics...", "info");

      const service = new window.google.maps.DistanceMatrixService();
      const dest = projectZone.geometryType === 'POLYGON' ? projectZone.coordinates[0] : projectZone.coordinates;
      const origins = fleet.map(a => a.coordinates);

      service.getDistanceMatrix({
          origins: origins,
          destinations: [dest],
          travelMode: window.google.maps.TravelMode.DRIVING,
      }, (response, status) => {
          if (status === 'OK') {
              let bestIdx = -1;
              let minDuration = Infinity;

              const results = response.rows;
              results.forEach((row, i) => {
                  const element = row.elements[0];
                  if (element.status === 'OK' && element.duration.value < minDuration) {
                      minDuration = element.duration.value;
                      bestIdx = i;
                  }
              });

              if (bestIdx !== -1) {
                  const bestTruck = fleet[bestIdx];
                  const eta = response.rows[bestIdx].elements[0].duration.text;
                  
                  notify(`Nearest: ${bestTruck.name} (${eta})`, "success");
                  
                  // Auto-select and route
                  setSelectedItem(bestTruck);
                  setRoutingSource(bestTruck);
                  setMode('routing_select_dest'); // Ready to confirm
                  
                  // Visual Cue: Draw line immediately?
                  // For now, just center on truck and pulse it
                  map.panTo(bestTruck.coordinates);
                  map.setZoom(16);
              } else {
                  notify("No reachable units found.", "error");
              }
          } else {
              notify("Matrix API Error", "error");
          }
      });
  };

  // 1. RESOURCE RADAR (Places API)
  const runRadar = (type) => {
      if (!map) return;
      const service = new window.google.maps.places.PlacesService(map);
      const center = map.getCenter();
      
      notify(`Scanning Sector for ${type}...`, "info");
      
      service.nearbySearch({
          location: center,
          radius: 2000, // 2km
          type: [type] // 'hardware_store', 'gas_station', 'restaurant'
      }, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              setNearbyPlaces(results.map(place => ({
                  id: place.place_id,
                  name: place.name,
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  type: type,
                  vicinity: place.vicinity
              })));
              notify(`${results.length} Locations Found`, "success");
          } else {
              notify("No resources found in sector", "error");
          }
      });
  };

  // 2. AUTO-ADDRESS (Geocoding API)
  const reverseGeocodeZone = (lat, lng) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
              setNewProjectData(prev => ({ ...prev, address: results[0].formatted_address }));
              notify("Address Detected", "success");
          }
      });
  };

  // 3. ROUTING
  const startRouting = (truck) => {
      setRoutingSource(truck);
      setMode('routing_select_dest');
      setSelectedItem(null);
      notify("Select Destination Zone", "info");
  };

  const calculateRoute = (destination) => {
      if (!routingSource || !map) return;
      const directionsService = new window.google.maps.DirectionsService();
      
      // Determine destination point (Zone center or asset loc)
      const dest = destination.geometryType === 'POLYGON' ? destination.coordinates[0] : destination.coordinates;

      directionsService.route({
          origin: routingSource.coordinates,
          destination: dest,
          travelMode: window.google.maps.TravelMode.DRIVING,
      }, (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
              setActiveRoute(result);
              const leg = result.routes[0].legs[0];
              setRouteStats({ duration: leg.duration.text, distance: leg.distance.text });
              setMode('view');
              setRoutingSource(null);
              notify(`Route: ${leg.duration.text} / ${leg.distance.text}`, "success");
          } else { notify("Route Calculation Failed", "error"); }
      });
  };

  // --- INTERACTION ---
  const handleMapClick = async (e) => {
      if (mode.startsWith('place_')) {
          // Place Asset logic
          const typeId = mode.split('place_')[1];
          const def = Object.values(ASSET_CATALOG).flat().find(a => a.id === typeId);
          const newAsset = {
              type: def.label, geometryType: 'POINT',
              coordinates: { lat: e.latLng.lat(), lng: e.latLng.lng() },
              properties: { ...def, status: 'Active' },
              name: `${def.label} ${assets.length + 1}`
          };
          
          setAssets(p => [...p, { ...newAsset, id: Date.now() }]); 
          try { await api.post('/map-assets', newAsset); } catch(e) {}
          if(!e.domEvent.shiftKey) setMode('view');
      } else {
          setSelectedItem(null);
          setActiveRoute(null);
          // If searching nearby, clear results on click? No, keep them for reference.
      }
  };

  const handleZoneComplete = (polygon) => {
      setNewZonePoly(polygon);
      setShowProjectModal(true);
      setMode('view');
      
      // Trigger Geocoding
      const path = polygon.getPath();
      const lat = path.getAt(0).lat();
      const lng = path.getAt(0).lng();
      reverseGeocodeZone(lat, lng);
  };

  const finalizeProject = async () => {
      if(!newZonePoly) return;
      const path = newZonePoly.getPath();
      const coords = [];
      let latSum=0, lngSum=0;
      for(let i=0; i<path.getLength(); i++) {
         coords.push({ lat: path.getAt(i).lat(), lng: path.getAt(i).lng() });
         latSum += path.getAt(i).lat();
         lngSum += path.getAt(i).lng();
      }
      const center = { lat: latSum/path.getLength(), lng: lngSum/path.getLength() };
      newZonePoly.setMap(null);
      
      try {
          const pRes = await api.post('/projects', {
              name: newProjectData.name,
              client: newProjectData.client,
              site: newProjectData.address || 'GeoCore Location',
              status: 'active',
              latitude: center.lat,
              longitude: center.lng
          });
          const aRes = await api.post('/map-assets', {
              projectId: pRes.data.id,
              type: 'ProjectBoundary',
              name: `${newProjectData.name} Zone`,
              geometryType: 'POLYGON',
              coordinates: coords,
              properties: { color: '#10b981', wasteTotal: 0 }
          });
          setProjects(p => [...p, pRes.data]);
          setAssets(p => [...p, aRes.data]);
          notify("Hub Established", "success");
      } catch(e) { notify("Creation Failed", "error"); }
      
      setShowProjectModal(false);
      setNewProjectData({ name: '', client: '', address: '' });
  };

  // --- WASTE LOGISTICS ---
  const handleOpenWasteModal = (project) => {
      setSelectedItem(project);
      setShowWasteModal(true);
  };

  const submitManifest = async () => {
      try {
          await api.post('/waste', {
              projectId: selectedItem.projectData.id,
              wasteType: wasteFormData.wasteType,
              quantity: parseFloat(wasteFormData.quantity),
              destinationSite: wasteFormData.destination,
              truckId: wasteFormData.truckId,
              status: 'Loaded'
          });
          notify("Manifest Created", "success");
          setShowWasteModal(false);
          setWasteFormData({ wasteType: 'General', quantity: '', destination: '', truckId: '' });
      } catch (e) { notify("Manifest Failed", "error"); }
  };

  // --- CONTROLS ---
  const rotateMap = () => {
      if(map) {
          const newHeading = heading + 90;
          setHeading(newHeading);
          map.setHeading(newHeading);
      }
  };

  if (loadError || !isLoadedState) return <div className="h-screen bg-slate-950 flex items-center justify-center text-indigo-500 font-mono animate-pulse">INITIALIZING GEOCORE OMEGA...</div>;

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-slate-950 overflow-hidden text-slate-100 flex">
      
      {/* --- SPLIT VIEW (STREET VIEW) --- */}
      {showStreetView && selectedItem && (
          <div className="absolute top-0 right-0 w-1/2 h-full z-40 border-l-4 border-indigo-500 shadow-2xl animate-slide-left">
              <button onClick={() => setShowStreetView(false)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded hover:bg-rose-500"><X/></button>
              <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
              >
                  <StreetViewPanorama
                      position={selectedItem.coordinates[0] || selectedItem.coordinates}
                      visible={true}
                  />
              </GoogleMap>
          </div>
      )}

      {/* --- HUD NOTIFICATIONS --- */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
          {notifications.map(n => (
              <div key={n.id} className={`px-6 py-2 rounded-full backdrop-blur-xl border shadow-2xl flex items-center gap-3 animate-slide-down ${n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : n.type === 'error' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-indigo-500/10 border-indigo-500 text-indigo-400'}`}>
                  {n.type === 'success' ? <Zap size={14}/> : <AlertTriangle size={14}/>}
                  <span className="text-xs font-bold uppercase tracking-wider">{n.msg}</span>
              </div>
          ))}
      </div>

      {/* --- ORBIT & CINEMATIC --- */}
      <div className="absolute top-6 right-6 z-30 flex gap-2">
           <button onClick={rotateMap} className="p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:text-indigo-400 backdrop-blur-xl transition-all" title="Rotate 90°">
              <RotateCw size={20} />
           </button>
           <button onClick={() => setCinematicMode(!cinematicMode)} className={`p-3 rounded-xl border backdrop-blur-xl transition-all ${cinematicMode ? 'bg-rose-500 border-rose-400 text-white animate-pulse' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'}`} title="Cinematic Mode">
              <Camera size={20} />
           </button>
      </div>

      {/* --- SIDEBAR COMMAND --- */}
      {!cinematicMode && (
          <div className="relative z-30 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all">
              <div className="p-6 border-b border-white/5">
                  <h1 className="text-xl font-black tracking-tighter italic">GEOCORE <span className="text-indigo-500">OMEGA</span></h1>
                  <div className="flex gap-2 mt-4">
                      <button onClick={() => { setMapTypeId('roadmap'); setMapStyles(MIDNIGHT_STYLE); }} className={`flex-1 py-1 text-[10px] font-bold rounded border ${mapTypeId==='roadmap' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 text-slate-500'}`}>MAP</button>
                      <button onClick={() => { setMapTypeId('hybrid'); setMapStyles(null); }} className={`flex-1 py-1 text-[10px] font-bold rounded border ${mapTypeId==='hybrid' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 text-slate-500'}`}>SAT</button>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Radar Toolkit */}
                  <div className="bg-indigo-900/20 rounded-xl p-3 border border-indigo-500/20">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Radar size={12}/> Resource Radar</label>
                      <div className="grid grid-cols-3 gap-2">
                          <button onClick={() => runRadar('hardware_store')} className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg flex flex-col items-center gap-1 text-[9px] text-slate-400 hover:text-white transition-all">
                              <Box size={14}/> Supplies
                          </button>
                          <button onClick={() => runRadar('gas_station')} className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg flex flex-col items-center gap-1 text-[9px] text-slate-400 hover:text-white transition-all">
                              <Fuel size={14}/> Fuel
                          </button>
                          <button onClick={() => runRadar('restaurant')} className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg flex flex-col items-center gap-1 text-[9px] text-slate-400 hover:text-white transition-all">
                              <Coffee size={14}/> Food
                          </button>
                      </div>
                  </div>

                  {/* Tools */}
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Site Ops</label>
                      <button 
                          onClick={() => setMode(mode === 'draw_zone' ? 'view' : 'draw_zone')}
                          className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${mode === 'draw_zone' ? 'bg-emerald-600 border-emerald-400 shadow-lg' : 'bg-slate-800/50 border-slate-700 hover:border-emerald-500'}`}
                      >
                          <Target size={18} className="text-white"/> <span className="text-sm font-bold">New Project Zone</span>
                      </button>
                  </div>

                  {/* Assets */}
                  {Object.entries(ASSET_CATALOG).map(([cat, items]) => (
                      <div key={cat} className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat}</label>
                          <div className="grid grid-cols-2 gap-2">
                              {items.map(item => (
                                  <button
                                      key={item.id}
                                      onClick={() => setMode(`place_${item.id}`)}
                                      className={`p-2 rounded-lg border text-left transition-all ${mode === `place_${item.id}` ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800/30 border-slate-700 hover:bg-slate-700'}`}
                                  >
                                      <div className="text-xs font-bold text-slate-200">{item.label}</div>
                                  </button>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- MAP SURFACE --- */}
      <div className="flex-1 relative">
          
          {/* Mode Overlay */}
          {!cinematicMode && mode !== 'view' && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur border border-indigo-500/50 text-indigo-200 px-6 py-2 rounded-full font-mono text-xs font-bold animate-pulse shadow-2xl">
                  {mode === 'draw_zone' ? "DRAWING MODE: CLICK TO DEFINE PERIMETER" : mode === 'routing_select_dest' ? "SELECT DESTINATION ZONE" : "ASSET DEPLOYMENT: CLICK TO PLACE"}
              </div>
          )}

          <GoogleMap
             mapContainerStyle={{ width: '100%', height: '100%' }}
             options={{
                 styles: mapStyles,
                 mapTypeId: mapTypeId,
                 disableDefaultUI: true,
                 tilt: 45,
                 zoom: 16,
                 center: { lat: -33.8688, lng: 151.2093 }
             }}
             onLoad={onMapLoad}
             onClick={handleMapClick}
          >
              <TrafficLayer />

              {/* Drawing */}
              {mode === 'draw_zone' && (
                  <DrawingManager
                      onPolygonComplete={handleZoneComplete}
                      options={{
                          drawingControl: false,
                          polygonOptions: { fillColor: '#10b981', fillOpacity: 0.4, strokeWeight: 2, strokeColor: '#fff', editable: true, zIndex: 10 },
                          drawingMode: window.google.maps.drawing.OverlayType.POLYGON
                      }}
                  />
              )}

              {/* Routes */}
              {activeRoute && <DirectionsRenderer directions={activeRoute} options={{ polylineOptions: { strokeColor: '#6366f1', strokeWeight: 6 }, suppressMarkers: true }} />}

              {/* Assets & Zones */}
              {assets.map(asset => {
                  const isSource = routingSource?.id === asset.id;
                  if (asset.geometryType === 'POLYGON') {
                      return (
                          <Polygon
                              key={asset.id}
                              paths={asset.coordinates}
                              options={{ fillColor: asset.properties.color, fillOpacity: 0.2, strokeColor: asset.properties.color, strokeWeight: 2 }}
                              onClick={() => {
                                  if (mode === 'routing_select_dest') calculateRoute(asset);
                                  else {
                                      const proj = projects.find(p => p.id === asset.projectId);
                                      setSelectedItem({ ...asset, projectData: proj });
                                  }
                              }}
                          />
                      );
                  }
                  return (
                      <Marker
                          key={asset.id}
                          position={asset.coordinates}
                          icon={{ path: asset.properties.icon || window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: isSource ? '#fff' : asset.properties.color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1 }}
                          onClick={() => setSelectedItem(asset)}
                          animation={isSource ? window.google.maps.Animation.BOUNCE : null}
                      />
                  );
              })}

              {/* Radar Results */}
              {nearbyPlaces.map(place => (
                  <Marker
                      key={place.id}
                      position={{ lat: place.lat, lng: place.lng }}
                      title={place.name}
                      icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 5,
                          fillColor: '#f472b6',
                          fillOpacity: 0.8,
                          strokeColor: '#fff',
                          strokeWeight: 1
                      }}
                      onClick={() => notify(place.name, "info")}
                  />
              ))}
          </GoogleMap>

          {/* --- COMMAND DASHBOARD --- */}
          {!cinematicMode && (selectedItem || activeRoute) && (
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 flex items-center justify-between animate-slide-up z-30">
                  
                  {activeRoute && (
                      <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex flex-col items-center justify-center">
                              <span className="text-2xl font-black text-white">{routeStats?.duration.split(' ')[0]}</span>
                              <span className="text-[10px] font-bold uppercase">{routeStats?.duration.split(' ')[1]}</span>
                          </div>
                          <div>
                              <div className="text-indigo-400 text-xs font-bold uppercase mb-1">Logistics Route Active</div>
                              <div className="text-white font-bold text-lg">{routeStats?.distance}</div>
                          </div>
                          <button onClick={() => { setActiveRoute(null); setRouteStats(null); }} className="p-2 bg-slate-800 rounded hover:text-white text-slate-400"><X size={16}/></button>
                      </div>
                  )}

                  {selectedItem && !activeRoute && (
                      <div className="flex w-full justify-between items-center">
                          <div>
                              <h2 className="text-2xl font-black text-white">{selectedItem.name}</h2>
                              <p className="text-xs text-slate-400 font-bold uppercase">{selectedItem.type} • {selectedItem.projectData?.site || 'No Address'}</p>
                          </div>
                          <div className="flex gap-3">
                              {selectedItem.projectData && (
                                  <>
                                    <button 
                                        onClick={() => findNearestAsset(selectedItem)}
                                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
                                        title="Auto-Dispatch Closest Truck"
                                    >
                                        <Zap size={18} /> FIND UNIT
                                    </button>
                                    <button 
                                        onClick={() => setShowStreetView(true)}
                                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-white/5 flex items-center gap-2"
                                    >
                                        <Eye size={18} /> INSPECT
                                    </button>
                                  </>
                              )}
                              {selectedItem.properties.type === 'vehicle' && (
                                  <button 
                                     onClick={() => startRouting(selectedItem)}
                                     className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
                                  >
                                      <Navigation size={18} /> DISPATCH
                                  </button>
                              )}
                              <button onClick={() => setSelectedItem(null)} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white"><X size={18}/></button>
                          </div>
                      </div>
                  )}
              </div>
          )}

      </div>
      
      {/* --- MODAL: PROJECT --- */}
      {showProjectModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-96 shadow-2xl">
                  <h3 className="text-white font-bold text-lg mb-4">Initialize Hub</h3>
                  <div className="mb-3">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Detected Address</label>
                      <div className="text-emerald-400 text-xs font-mono truncate">{newProjectData.address || 'Scanning...'}</div>
                  </div>
                  <input className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mb-3" placeholder="Project Name" value={newProjectData.name} onChange={e=>setNewProjectData({...newProjectData, name: e.target.value})}/>
                  <input className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mb-6" placeholder="Client" value={newProjectData.client} onChange={e=>setNewProjectData({...newProjectData, client: e.target.value})}/>
                  <div className="flex gap-3">
                      <button onClick={finalizeProject} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl">Create Hub</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MODAL: WASTE MANIFEST --- */}
      {showWasteModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-96 shadow-2xl animate-scale-in">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2"><FileText size={18} className="text-indigo-500"/> Digital Manifest</h3>
                      <button onClick={() => setShowWasteModal(false)} className="text-gray-500 hover:text-white"><X size={18}/></button>
                  </div>
                  
                  <div className="space-y-3">
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Waste Type</label>
                          <select 
                              value={wasteFormData.wasteType}
                              onChange={e => setWasteFormData({...wasteFormData, wasteType: e.target.value})}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm mt-1"
                          >
                              <option>General Waste</option>
                              <option>Concrete</option>
                              <option>Clean Fill</option>
                              <option>Asbestos (Hazmat)</option>
                          </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Quantity (T)</label>
                              <input 
                                type="number" 
                                value={wasteFormData.quantity}
                                onChange={e => setWasteFormData({...wasteFormData, quantity: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm mt-1"
                              />
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Truck ID</label>
                              <input 
                                type="text" 
                                value={wasteFormData.truckId}
                                onChange={e => setWasteFormData({...wasteFormData, truckId: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm mt-1"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Disposal Site</label>
                          <input 
                            type="text" 
                            value={wasteFormData.destination}
                            onChange={e => setWasteFormData({...wasteFormData, destination: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm mt-1"
                            placeholder="e.g. City Tip A"
                          />
                      </div>
                  </div>

                  <button onClick={submitManifest} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all">
                      Issue Docket
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};

export default VisualMapBuilder;

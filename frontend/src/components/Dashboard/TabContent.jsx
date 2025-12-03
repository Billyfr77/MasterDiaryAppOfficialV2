import ProjectStatusChart from './ProjectStatusChart';
import LiveMapWidget from './LiveMapWidget';
import React, { useRef, useCallback, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import {
  AlertTriangle,
  Brain,
  TrendingUp,
  XCircle,
  Info,
  Lightbulb,
  Zap,
  CheckCircle,
  Folder,
  Sparkles,
  Map as MapIcon,
  Users,
  Wrench,
  Calendar,
  Briefcase,
  Activity,
  Clock
} from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '1rem'
};

const center = {
  lat: -33.8688,
  lng: 151.2093
};

const TabContent = ({ activeTab, healthStatus, filteredData, metrics, isMapLoaded, refetchProjects }) => {
  const mapRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [geocodingState, setGeocodingState] = useState({});

  const handleGeocode = async (projectId) => {
    setGeocodingState(prev => ({ ...prev, [projectId]: 'loading' }));
    try {
      await axios.post(`/api/projects/${projectId}/geocode`);
      setGeocodingState(prev => ({ ...prev, [projectId]: 'success' }));
      if(refetchProjects) {
        refetchProjects();
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      setGeocodingState(prev => ({ ...prev, [projectId]: 'error' }));
    }
  };
  
  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;

    const customMapType = new window.google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        // Placeholder for a custom tile URL.
        // In a real application, this would fetch tiles from the Maps Tiles API or a similar service.
        // Example: return `https://your-tile-service.com/tiles/${zoom}/${coord.x}/${coord.y}.png?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
        return `https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png`;
      },
      tileSize: new window.google.maps.Size(256, 256),
      name: 'Custom Tiles',
      maxZoom: 19
    });

    map.mapTypes.set('custom_map', customMapType);
    map.setMapTypeId('custom_map');

  }, []);

  const onUnmount = useCallback(function callback(map) {
    mapRef.current = null;
  }, []);

  if (activeTab === 'map') {
    return (
      <div className="mb-8 animate-fade-in">
        <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3 tracking-tight">
           <MapIcon size={28} className="text-indigo-500" />
           Project Map View
        </h2>
        <div className="bg-stone-900/40 p-2 rounded-3xl border border-white/10 backdrop-blur-md">
           {isMapLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    styles: [
                        {
                            "elementType": "geometry",
                            "stylers": [{ "color": "#242f3e" }]
                        },
                        {
                            "elementType": "labels.text.stroke",
                            "stylers": [{ "color": "#242f3e" }]
                        },
                        {
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#746855" }]
                        },
                        {
                            "featureType": "administrative.locality",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#d59563" }]
                        }
                    ],
                    mapTypeControl: true,
                    mapTypeControlOptions: {
                        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', 'custom_map']
                    }
                }}
              >
                 {filteredData.projects.map(project => (
                    (project.lat && project.lng) && (
                        <Marker 
                            key={project.id} 
                            position={{ lat: parseFloat(project.lat), lng: parseFloat(project.lng) }} 
                            title={project.name}
                            onClick={() => setSelectedProject(project)}
                        />
                    )
                 ))}

                {selectedProject && (
                  <InfoWindow
                    position={{ lat: parseFloat(selectedProject.lat), lng: parseFloat(selectedProject.lng) }}
                    onCloseClick={() => setSelectedProject(null)}
                  >
                    <div className="bg-gray-800 text-white p-2 rounded-lg">
                      <h3 className="text-lg font-bold">{selectedProject.name}</h3>
                      <p>{selectedProject.description}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
           ) : (
              <div className="h-[600px] flex items-center justify-center text-gray-400">
                  Loading Map...
              </div>
           )}
        </div>
      </div>
    );
  }

  if (activeTab === 'overview') {
    return (
      <React.Fragment>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* System Health */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-900/20 border border-amber-500/20 rounded-3xl p-6 backdrop-blur-sm hover:border-amber-500/40 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/20" style={{ color: healthStatus.color }}>
                <healthStatus.icon size={20} />
              </div>
              <h3 className="m-0 text-white text-sm font-bold uppercase tracking-wide">
                System Health
              </h3>
            </div>
            <div 
              className="text-3xl font-black mb-2 capitalize tracking-tight"
              style={{ color: healthStatus.color }}
            >
              {healthStatus.status}
            </div>
            <p className="text-gray-400 mb-4 text-xs font-medium">
              Overall business health status
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Live Ops Map */}
            <LiveMapWidget isMapLoaded={isMapLoaded} />

            {/* Chart */}
            <div className="bg-stone-900/40 rounded-3xl p-6 border border-white/10 backdrop-blur-md shadow-xl h-[400px] flex flex-col">
              <h3 className="m-0 mb-6 text-white text-lg font-bold flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-indigo-500 rounded-full"/> Project Status Overview
              </h3>
              <div className="flex-1 min-h-0">
                  <ProjectStatusChart data={metrics} />
              </div>
            </div>
        </div>
      </React.Fragment>
    );
  }

  if (activeTab === 'staff') {
    return (
      <div className="mb-8 animate-fade-in">
        <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3 tracking-tight">
          <Users size={28} className="text-indigo-500" />
          Staff Roster ({filteredData.staff.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredData.staff.map((person) => (
            <div
              key={person.id}
              className="bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white text-lg font-bold">{person.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <Briefcase size={14} />
                    {person.role || 'Staff Member'}
                  </div>
                </div>
                <span
                  className={`
                    px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                    ${person.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}
                  `}
                >
                  {person.status || 'Unknown'}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                 <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Productivity</div>
                    <div className="flex items-center gap-2 text-white font-mono font-bold">
                        <Activity size={14} className="text-indigo-400"/>
                        {person.productivity || 0}%
                    </div>
                 </div>
                 <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Hours Logged</div>
                    <div className="flex items-center gap-2 text-white font-mono font-bold">
                        <Clock size={14} className="text-amber-400"/>
                        {person.totalHours || 0}h
                    </div>
                 </div>
              </div>
            </div>
          ))}
          {filteredData.staff.length === 0 && (
             <div className="col-span-full text-center py-10 text-gray-500">No staff members found.</div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'equipment') {
    return (
      <div className="mb-8 animate-fade-in">
        <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3 tracking-tight">
          <Wrench size={28} className="text-indigo-500" />
          Equipment Fleet ({filteredData.equipment.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredData.equipment.map((item) => (
            <div
              key={item.id}
              className="bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white text-lg font-bold">{item.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <Wrench size={14} />
                    {item.category || 'General Equipment'}
                  </div>
                </div>
                <span
                  className={`
                    px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                    ${item.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : item.status === 'maintenance' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}
                  `}
                >
                  {item.status || 'Unknown'}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                 <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Usage</div>
                    <div className="text-white font-mono font-bold">
                        {item.hoursUsed || 0} hrs
                    </div>
                 </div>
                 <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Value</div>
                    <div className="text-white font-mono font-bold text-emerald-400">
                        ${(item.value || 0).toLocaleString()}
                    </div>
                 </div>
              </div>
            </div>
          ))}
          {filteredData.equipment.length === 0 && (
             <div className="col-span-full text-center py-10 text-gray-500">No equipment found.</div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default TabContent;

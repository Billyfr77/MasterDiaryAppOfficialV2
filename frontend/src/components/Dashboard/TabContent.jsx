import ProjectStatusChart from './ProjectStatusChart';
import LiveMapWidget from './LiveMapWidget';
import GeminiTools from '../GeminiTools';
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

const TabContent = ({ activeTab, aiAnalysis, healthStatus, filteredData, metrics, isMapLoaded, refetchProjects }) => {
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

  if (activeTab === 'gemini') {
    return (
       <div className="mb-8 animate-fade-in h-[600px]">
          <GeminiTools />
       </div>
    );
  }

  if (activeTab === 'overview') {
    return (
      <React.Fragment>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Key Performance Indicators */}
          <div className="bg-gradient-to-br from-rose-500/10 to-rose-900/20 border border-rose-500/20 rounded-3xl p-6 backdrop-blur-sm hover:border-rose-500/40 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle size={20} />
              </div>
              <h3 className="m-0 text-white text-sm font-bold uppercase tracking-wide">
                Critical Alerts
              </h3>
            </div>
            <div className="text-4xl font-black text-white mb-2 tracking-tight">
              {aiAnalysis.alerts?.filter((a) => a.priority >= 9).length || 0}
            </div>
            <p className="text-gray-400 mb-4 text-xs font-medium">
              High-priority issues requiring immediate attention
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors uppercase tracking-wider">
                View Details
              </button>
            </div>
          </div>

          {/* AI Insights Summary */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-900/20 border border-indigo-500/20 rounded-3xl p-6 backdrop-blur-sm hover:border-indigo-500/40 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Brain size={20} />
              </div>
              <h3 className="m-0 text-white text-sm font-bold uppercase tracking-wide">
                AI Insights
              </h3>
            </div>
            <div className="text-4xl font-black text-white mb-2 tracking-tight">
              {aiAnalysis.insights?.length || 0}
            </div>
            <p className="text-gray-400 mb-4 text-xs font-medium">
              Intelligent analysis and recommendations generated
            </p>
          </div>

          {/* Predictive Analytics */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-900/20 border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-sm hover:border-emerald-500/40 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <TrendingUp size={20} />
              </div>
              <h3 className="m-0 text-white text-sm font-bold uppercase tracking-wide">
                Predictive Insights
              </h3>
            </div>
            <div className="text-4xl font-black text-white mb-2 tracking-tight">
              {aiAnalysis.predictions?.length || 0}
            </div>
            <p className="text-gray-400 mb-4 text-xs font-medium">
              Future trends and forecasting models
            </p>
          </div>

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

  if (activeTab === 'projects') {
    return (
      <div className="mb-8 animate-fade-in">
        <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3 tracking-tight">
          <Folder size={28} className="text-indigo-500" />
          Projects Overview ({filteredData.projects.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredData.projects.map((project) => (
            <div
              key={project.id}
              className="group bg-black/20 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-black/30 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white text-lg font-bold group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <span
                  className={`
                    px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                    ${project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}
                  `}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2 font-medium">
                {project.description || 'No description provided for this project.'}
              </p>
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="text-gray-500 text-xs font-mono">
                   ID: {project.id.toString().slice(-4)}
                </span>
                {(!project.latitude || !project.longitude) && (
                   <button 
                      onClick={() => handleGeocode(project.id)}
                      disabled={geocodingState[project.id] === 'loading'}
                      className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 text-xs font-bold hover:bg-indigo-500/30 transition-colors uppercase tracking-wider disabled:opacity-50"
                    >
                      {geocodingState[project.id] === 'loading' ? 'Geocoding...' : 'Geocode'}
                   </button>
                )}
                <span className="text-indigo-300 text-xs font-bold">
                  {project.deadline
                    ? new Date(project.deadline).toLocaleDateString()
                    : 'No Deadline'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'insights') {
    return (
      <div className="mb-8 animate-fade-in">
        <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3 tracking-tight">
          <Sparkles size={28} className="text-indigo-500" />
          Autonomous AI Insights ({aiAnalysis.insights?.length || 0})
        </h2>
        {aiAnalysis.insights?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {aiAnalysis.insights.map((insight, index) => (
              <div
                key={insight.id || index}
                className="bg-stone-900/60 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/30 transition-all"
              >
                {/* Colored Left Border Accent */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 
                  ${insight.type === 'warning' ? 'bg-amber-500' : insight.type === 'danger' ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                />
                
                <div className="flex items-start gap-4 pl-2">
                  <div
                    className={`
                      p-3 rounded-xl flex-shrink-0
                      ${insight.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : insight.type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}
                    `}
                  >
                    {insight.type === 'warning' && <AlertTriangle size={24} />}
                    {insight.type === 'danger' && <XCircle size={24} />}
                    {insight.type === 'info' && <Info size={24} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white text-lg font-bold mb-2 leading-tight">
                      {insight.title}
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 font-medium">
                      {insight.message}
                    </p>
                    {insight.recommendation && (
                      <div className="p-4 bg-black/20 border border-white/5 rounded-xl mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Lightbulb size={16} className="text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">
                            Recommendation
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm m-0 italic">
                          "{insight.recommendation}"
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        {insight.category}
                      </span>
                      <span
                        className={`
                          px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-wider
                          ${insight.impact === 'high' ? 'bg-rose-500/20 text-rose-500' : insight.impact === 'medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}
                        `}
                      >
                        {insight.impact} Impact
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-stone-900/40 rounded-3xl border border-white/5 backdrop-blur-md">
            <Brain size={64} className="mx-auto mb-6 text-white/10" />
            <h3 className="text-white text-xl font-bold mb-2">
              AI Analysis in Progress
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              The AI is analyzing your business data to generate intelligent insights. This usually takes a few seconds.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'alerts') {
    return (
      <div className="mb-8 animate-fade-in">
        <h2 className="mb-6 text-2xl font-black text-white flex items-center gap-3 tracking-tight">
          <AlertTriangle size={28} className="text-rose-500" />
          Critical Alerts ({aiAnalysis.alerts?.length || 0})
        </h2>
        {aiAnalysis.alerts?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {aiAnalysis.alerts.map((alert, index) => (
              <div
                key={alert.id || index}
                className="bg-stone-900/60 border border-rose-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-rose-500/5 pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="bg-rose-500/20 p-3 rounded-xl">
                    <XCircle size={24} className="text-rose-500 flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white text-lg font-bold mb-2">
                      {alert.title}
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {alert.message}
                    </p>
                    {alert.action && (
                      <div className="p-4 bg-rose-950/30 border border-rose-500/20 rounded-xl mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Zap size={16} className="text-rose-400" />
                          <span className="text-rose-400 text-xs font-bold uppercase tracking-wider">
                            Required Action
                          </span>
                        </div>
                        <p className="text-rose-100 text-sm m-0 font-medium">
                          {alert.action}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        {alert.category}
                      </span>
                      <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-500/20">
                        Priority {alert.priority || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-stone-900/40 rounded-3xl border border-white/5 backdrop-blur-md">
            <CheckCircle size={64} className="mx-auto mb-6 text-emerald-500/50" />
            <h3 className="text-white text-xl font-bold mb-2">
              All Clear
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              No critical alerts at this time. Your business is running smoothly.
            </p>
          </div>
        )}
      </div>
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

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, Polygon } from '@react-google-maps/api';
import { Map as MapIcon, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

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

const LiveMapWidget = ({ isMapLoaded }) => {
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [assets, setAssets] = useState([]);
  
  useEffect(() => {
      fetchAssets();
      const interval = setInterval(fetchAssets, 10000); // Refresh every 10s
      return () => clearInterval(interval);
  }, []);

  const fetchAssets = async () => {
      try {
          const res = await api.get('/map-assets');
          setAssets(Array.isArray(res.data) ? res.data : []);
      } catch (e) { console.error("Widget Sync Fail", e); }
  };

  const onLoad = useCallback((map) => {
      setMap(map);
      // Auto-fit bounds if assets exist
      if (assets.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          assets.forEach(a => {
              if(a.coordinates) {
                  if(a.geometryType === 'POINT') bounds.extend(a.coordinates);
                  else if (a.geometryType === 'POLYGON') a.coordinates.forEach(c => bounds.extend(c));
              }
          });
          map.fitBounds(bounds);
      } else {
          map.setCenter({ lat: -33.8688, lng: 151.2093 });
          map.setZoom(11);
      }
  }, [assets]); // Re-run if assets load late? No, fitBounds usually once.

  return (
    <div className="bg-stone-900/40 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl overflow-hidden flex flex-col h-[400px]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
            <div className="flex items-center gap-2">
                <MapIcon size={18} className="text-emerald-400"/>
                <span className="text-white font-bold text-sm">Live Operations</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase animate-pulse">
                    Active
                </span>
            </div>
            <button 
                onClick={() => navigate('/map-builder')}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Open Command Center"
            >
                <Maximize2 size={16}/>
            </button>
        </div>
        
        <div className="flex-1 relative">
            {isMapLoaded ? (
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    options={{
                        styles: MIDNIGHT_STYLE,
                        disableDefaultUI: true,
                        zoomControl: false,
                        mapTypeControl: false,
                        streetViewControl: false,
                    }}
                    onLoad={onLoad}
                >
                    {assets.map(asset => {
                        if (asset.geometryType === 'POLYGON') {
                            return (
                                <Polygon
                                    key={asset.id}
                                    paths={asset.coordinates}
                                    options={{
                                        fillColor: asset.properties.color || '#10b981',
                                        fillOpacity: 0.3,
                                        strokeColor: asset.properties.color || '#10b981',
                                        strokeWeight: 1
                                    }}
                                />
                            )
                        }
                        if (asset.geometryType === 'POINT') {
                            return (
                                <Marker
                                    key={asset.id}
                                    position={asset.coordinates}
                                    icon={{
                                        path: window.google.maps.SymbolPath.CIRCLE,
                                        scale: 4,
                                        fillColor: asset.properties.color || '#fff',
                                        fillOpacity: 1,
                                        strokeColor: '#fff',
                                        strokeWeight: 1
                                    }}
                                />
                            )
                        }
                        return null;
                    })}
                </GoogleMap>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-xs font-mono uppercase tracking-widest">
                    INITIALIZING SATELLITE LINK...
                </div>
            )}
            
            {/* Overlay Stats */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur p-2 rounded-lg border border-white/10 text-[10px] font-mono text-gray-300 pointer-events-none">
                <div>HUBS: {assets.filter(a => a.geometryType === 'POLYGON').length}</div>
                <div>UNITS: {assets.filter(a => a.geometryType === 'POINT').length}</div>
            </div>
        </div>
    </div>
  );
};

export default LiveMapWidget;

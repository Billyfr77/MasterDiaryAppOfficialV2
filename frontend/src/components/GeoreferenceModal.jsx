import React, { useState, useCallback, useRef, useEffect } from 'react'
import { GoogleMap, Marker, GroundOverlay } from '@react-google-maps/api'
import { Upload, X, Check, MapPin, Move, ZoomIn, Info } from 'lucide-react'
import { api } from '../utils/api'

// Simple utility to calculate bounds from two control points (simplified georeferencing)
// In a full GIS system, this would be an affine transformation.
// Here we assume North-Up alignment for simplicity or basic scaling.
const calculateBounds = (imagePoints, mapPoints, imageDimensions) => {
  if (imagePoints.length < 2 || mapPoints.length < 2) return null;

  // We need to map pixel coordinates to lat/lng.
  // Point 1 (Top-Left approx)
  const p1_img = imagePoints[0]; 
  const p1_map = mapPoints[0];

  // Point 2 (Bottom-Right approx)
  const p2_img = imagePoints[1];
  const p2_map = mapPoints[1];

  // Calculate distinct ratios
  const latDiff = p2_map.lat - p1_map.lat;
  const lngDiff = p2_map.lng - p1_map.lng;
  
  const yDiff = p2_img.y - p1_img.y;
  const xDiff = p2_img.x - p1_img.x;

  // Extrapolate to full image bounds
  // 0,0 (Top Left)
  const latPerY = latDiff / yDiff;
  const lngPerX = lngDiff / xDiff;

  const north = p1_map.lat - (p1_img.y * latPerY);
  const west = p1_map.lng - (p1_img.x * lngPerX);
  
  const south = north + (imageDimensions.height * latPerY);
  const east = west + (imageDimensions.width * lngPerX);

  return { north, south, east, west };
}

const GeoreferenceModal = ({ isOpen, onClose, onSave, apiKey }) => {
  const [step, setStep] = useState(1) // 1: Upload, 2: Calibrate
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [imageDimensions, setImageDimensions] = useState(null)
  
  // Control Points
  const [activePointIndex, setActivePointIndex] = useState(0)
  const [imagePoints, setImagePoints] = useState([]) // [{x, y}]
  const [mapPoints, setMapPoints] = useState([]) // [{lat, lng}]
  
  // Map State
  const [mapCenter, setMapCenter] = useState({ lat: -33.8688, lng: 151.2093 })
  const mapRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setImageUrl(url)
      
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height })
        setStep(2)
      };
      img.src = url;
    }
  }

  const handleImageClick = (e) => {
    if (activePointIndex >= 2) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPoints = [...imagePoints];
    newPoints[activePointIndex] = { x, y };
    setImagePoints(newPoints);
  }

  const handleMapClick = (e) => {
    if (activePointIndex >= 2) return;

    const newPoints = [...mapPoints];
    newPoints[activePointIndex] = { 
      lat: e.latLng.lat(), 
      lng: e.latLng.lng() 
    };
    setMapPoints(newPoints);
  }

  const confirmPoint = () => {
    if (imagePoints[activePointIndex] && mapPoints[activePointIndex]) {
      setActivePointIndex(prev => prev + 1);
    }
  }

  const handleFinalSave = async () => {
    if (!imageFile) return;

    // 1. Calculate Bounds
    const bounds = calculateBounds(imagePoints, mapPoints, imageDimensions);
    if (!bounds) {
        alert("Calibration failed. Ensure points are diagonal from each other.");
        return;
    }

    // 2. Upload Image to Backend
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
        const res = await api.post('/uploads', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const finalData = {
            imageUrl: res.data.url, // Backend path
            bounds: bounds,
            opacity: 0.8
        };
        
        onSave(finalData);
        onClose();
    } catch (err) {
        console.error("Upload failed", err);
        alert("Failed to upload map image.");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 w-full max-w-6xl h-[80vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-stone-900">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="text-emerald-500" /> Georeference Site Plan
            </h2>
            <p className="text-xs text-gray-400">Overlay your blueprints accurately on the world map.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {step === 1 && (
             <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-dashed border-white/10 m-10 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors">
                <Upload size={64} className="text-indigo-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Upload Site Plan</h3>
                <p className="text-gray-400 mb-6">Supports JPG, PNG (Max 10MB)</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  id="map-upload"
                />
                <label 
                  htmlFor="map-upload"
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-indigo-500/30"
                >
                  Select File
                </label>
             </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex w-full">
              {/* Left: Image View */}
              <div className="w-1/2 border-r border-white/10 relative bg-stone-950 flex flex-col">
                <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white">
                    Step 1: Click a point on the Blueprint
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center cursor-crosshair">
                   {imageUrl && (
                     <div className="relative inline-block">
                        <img 
                          src={imageUrl} 
                          alt="Blueprint" 
                          onClick={handleImageClick}
                          className="max-w-none shadow-2xl" 
                          style={{ maxHeight: '100%' }} // Simple fit for now
                        />
                        {imagePoints.map((p, i) => (
                          <div 
                            key={i} 
                            className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-white rounded-full bg-red-500 shadow-lg flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ left: p.x, top: p.y }}
                          >
                            {i + 1}
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>

              {/* Right: Map View */}
              <div className="w-1/2 relative bg-stone-900 flex flex-col">
                 <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white pointer-events-none">
                    Step 2: Click the matching location on Map
                </div>
                <GoogleMap
                   mapContainerStyle={{ width: '100%', height: '100%' }}
                   center={mapCenter}
                   zoom={18}
                   onClick={handleMapClick}
                   options={{ 
                     mapTypeId: 'satellite',
                     disableDefaultUI: true,
                     tilt: 0 
                   }}
                >
                   {mapPoints.map((p, i) => (
                      <Marker 
                        key={i} 
                        position={p} 
                        label={{ text: `${i+1}`, color: "white", fontWeight: "bold" }} 
                      />
                   ))}
                </GoogleMap>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        {step === 2 && (
            <div className="h-20 border-t border-white/10 bg-stone-900 px-6 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${activePointIndex === 0 ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-stone-800 border-white/10 text-gray-500'}`}>
                     <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">1</div>
                     <span className="text-sm font-bold">Point A</span>
                     {imagePoints[0] && mapPoints[0] && <Check size={16} className="text-emerald-400" />}
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${activePointIndex === 1 ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-stone-800 border-white/10 text-gray-500'}`}>
                     <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">2</div>
                     <span className="text-sm font-bold">Point B (Diagonal)</span>
                     {imagePoints[1] && mapPoints[1] && <Check size={16} className="text-emerald-400" />}
                  </div>
               </div>

               <div className="flex gap-3">
                  {imagePoints[activePointIndex] && mapPoints[activePointIndex] ? (
                     <button 
                        onClick={confirmPoint}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
                     >
                        Confirm Point {activePointIndex + 1}
                     </button>
                  ) : (
                     <span className="text-sm text-gray-400 italic mr-4">Select points on both screens...</span>
                  )}
                  
                  {activePointIndex >= 2 && (
                     <button 
                        onClick={handleFinalSave}
                        className="px-8 py-2 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                     >
                        Calibrate & Save
                     </button>
                  )}
               </div>
            </div>
        )}
      </div>
    </div>
  )
}

export default GeoreferenceModal

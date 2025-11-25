import React, { useState, useCallback, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { MapPin, Navigation } from 'lucide-react'

const containerStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 0
}

const defaultCenter = {
  lat: -33.8688, // Sydney (example default)
  lng: 151.2093
}

// "Amazing" Dark Map Style
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
]

const MapBackground = ({ onLocationSelect, activeLocation, overlayImage }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const isKeyValid = apiKey && apiKey !== 'YOUR_API_KEY_HERE'

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: isKeyValid ? apiKey : '',
    preventGoogleFontsLoading: true
  })

  const [map, setMap] = useState(null)
  
  // Use a ref to store the overlay instance if we were using raw JS API, 
  // but @react-google-maps/api handles this declaratively mostly.

  const onLoad = useCallback(function callback(map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  const handleMapClick = (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    if (onLocationSelect) {
      onLocationSelect({ lat, lng })
    }
  }

  if (!isKeyValid) {
    return (
      <div className="absolute inset-0 bg-gray-900 z-0 flex items-center justify-center p-10">
        <div className="bg-red-900/80 border border-red-500/50 p-6 rounded-2xl max-w-md text-center backdrop-blur-xl">
          <h3 className="text-xl font-bold text-white mb-2">Google Maps Key Missing</h3>
          <p className="text-gray-300 mb-4">
            Please add your valid Google Maps API Key to the <code>frontend/.env</code> file.
          </p>
          <div className="bg-black/50 p-3 rounded-lg font-mono text-xs text-yellow-400 break-all">
            VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY
          </div>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="absolute inset-0 bg-gray-900 z-0 flex items-center justify-center">
        <div className="text-red-500">Map Load Error: {loadError.message}</div>
      </div>
    )
  }

  if (!isLoaded) return <div className="absolute inset-0 bg-gray-900 z-0 animate-pulse" />

  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={activeLocation || defaultCenter}
        zoom={activeLocation ? 18 : 12} // Higher zoom when active
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeId: overlayImage ? 'satellite' : 'roadmap', // Switch to satellite if overlay present for context
          tilt: 0
        }}
      >
        {activeLocation && (
          <Marker position={activeLocation} />
        )}
        
        {/* Render Georeferenced Site Plan */}
        {overlayImage && overlayImage.imageUrl && overlayImage.bounds && (
           <GroundOverlay
             key={overlayImage.imageUrl} // Force re-render if url changes
             url={overlayImage.imageUrl}
             bounds={overlayImage.bounds}
             opacity={overlayImage.opacity || 0.8}
           />
        )}
      </GoogleMap>
      
      {/* Overlay gradient to blend with app UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-gray-900/10 pointer-events-none z-[1]" />
    </div>
  )
}

export default React.memo(MapBackground)

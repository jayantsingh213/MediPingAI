import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create beautiful custom SVG icons to avoid Leaflet bundler image loading issues
const createUserIcon = () => {
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="8" fill="#2563EB" stroke="#FFFFFF" stroke-width="3" />
      <circle cx="20" cy="20" r="16" stroke="#2563EB" stroke-opacity="0.25" stroke-width="4" />
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-user-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const createPharmacyIcon = (color = '#2563EB') => {
  const svg = `
    <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 40C26.5 31.8 32 24.5 32 17C32 8.71573 25.2843 2 18 2C10.7157 2 4 8.71573 4 17C4 24.5 9.5 31.8 18 40Z" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
      <path d="M15 17H21M18 14V20" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-pharmacy-marker',
    iconSize: [36, 42],
    iconAnchor: [18, 40]
  });
};

// Component to dynamically refocus or fit bounds when markers change
const MapController = ({ center, bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (center) {
      map.setView(center, map.getZoom() || 14);
    }
  }, [center, bounds, map]);

  return null;
};

const MapComponent = ({ 
  userLocation = [12.9716, 77.5946], // Default Bangalore
  pharmacies = [], 
  selectedPharmacy = null,
  showRoute = false,
  height = '400px'
}) => {
  const [mapCenter, setMapCenter] = useState(userLocation);
  const [mapBounds, setMapBounds] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    const bounds = [];
    if (userLocation) {
      bounds.push(userLocation);
    }
    
    pharmacies.forEach(p => {
      if (p.location?.coordinates) {
        bounds.push([p.location.coordinates[1], p.location.coordinates[0]]);
      }
    });

    if (selectedPharmacy?.location?.coordinates) {
      const pLoc = [selectedPharmacy.location.coordinates[1], selectedPharmacy.location.coordinates[0]];
      bounds.push(pLoc);
      
      if (showRoute) {
        // Draw a simulated driving route path connecting user and pharmacy.
        // We add some minor bends to make it look realistic rather than a straight line.
        const start = userLocation;
        const end = pLoc;
        const mid1 = [start[0] + (end[0] - start[0]) * 0.3 + 0.001, start[1] + (end[1] - start[1]) * 0.4 - 0.002];
        const mid2 = [start[0] + (end[0] - start[0]) * 0.7 - 0.001, start[1] + (end[1] - start[1]) * 0.6 + 0.002];
        setRouteCoordinates([start, mid1, mid2, end]);
      }
    } else {
      setRouteCoordinates([]);
    }

    if (bounds.length > 0) {
      setMapBounds(bounds);
    } else if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation, pharmacies, selectedPharmacy, showRoute]);

  return (
    <div style={{ height, width: '100%', position: 'relative' }} className="rounded-2xl overflow-hidden z-10">
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Premium light-themed map style
        />
        
        {/* User Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>
              <div className="font-semibold text-primary">Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Pharmacy Markers */}
        {pharmacies.map((p, idx) => {
          if (!p.location?.coordinates) return null;
          const pos = [p.location.coordinates[1], p.location.coordinates[0]];
          const isSelected = selectedPharmacy && selectedPharmacy._id === p._id;
          
          return (
            <Marker 
              key={p._id || idx} 
              position={pos} 
              icon={createPharmacyIcon(isSelected ? '#22C55E' : '#2563EB')}
            >
              <Popup>
                <div className="p-1">
                  <div className="font-semibold text-slate-800 text-sm">{p.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{p.address}</div>
                  {p.rating && (
                    <div className="flex items-center text-amber-500 text-xs font-semibold mt-1">
                      ⭐ {p.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Polyline (Simulated Navigation) */}
        {showRoute && routeCoordinates.length > 1 && (
          <>
            {/* Route Background Shadow */}
            <Polyline 
              positions={routeCoordinates} 
              pathOptions={{ color: '#1E293B', weight: 8, opacity: 0.15, lineCap: 'round' }} 
            />
            {/* Main Active Route Line */}
            <Polyline 
              positions={routeCoordinates} 
              pathOptions={{ color: '#2563EB', weight: 5, opacity: 0.85, dashArray: '8, 8', lineCap: 'round' }} 
            />
          </>
        )}

        <MapController center={mapCenter} bounds={mapBounds} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;

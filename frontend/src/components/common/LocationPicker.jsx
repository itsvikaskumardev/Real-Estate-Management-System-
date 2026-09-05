import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { HiLocationMarker, HiCheckCircle } from 'react-icons/hi';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DraggableMarker = ({ position, setPosition }) => {
  const markerRef = useRef(null);
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
        }
      },
    }),
    [setPosition],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
};

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
};

const MapClickHandler = ({ setPosition, setIsConfirmed }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      setIsConfirmed(false);
    },
  });
  return null;
};

const LocationPicker = ({ address, onLocationConfirmed, initialLatitude, initialLongitude }) => {
  const defaultPosition = [28.6139, 77.2090]; // Default to New Delhi
  
  const [position, setPosition] = useState(
    initialLatitude && initialLongitude ? [initialLatitude, initialLongitude] : null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      setPosition([initialLatitude, initialLongitude]);
      setIsConfirmed(true);
    }
  }, [initialLatitude, initialLongitude]);

  const searchLocation = async () => {
    if (!address) {
      setError("Please provide an address to search.");
      return;
    }

    setIsSearching(true);
    setError(null);
    setIsConfirmed(false);

    try {
      // Use Nominatim API for geocoding
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const newPos = [parseFloat(result.lat), parseFloat(result.lon)];
        setPosition(newPos);
      } else {
        setError("Could not find the location. Please adjust the marker manually.");
        if (!position) {
            setPosition(defaultPosition);
        }
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      setError("Failed to fetch location. Please adjust the marker manually.");
      if (!position) {
          setPosition(defaultPosition);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (position) {
      onLocationConfirmed({
        latitude: position[0],
        longitude: position[1]
      });
      setIsConfirmed(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
        <HiLocationMarker className="text-primary" /> Property Map Location
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Preview and adjust the exact location of your property on the map. Buyers will see this location.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <button
          type="button"
          onClick={searchLocation}
          disabled={isSearching}
          className="btn btn-outline border-slate-300 text-slate-700 hover:bg-slate-50 px-6"
        >
          {isSearching ? "Searching..." : "Search Address on Map"}
        </button>
        
        {error && (
          <div className="text-amber-600 text-sm flex items-center">
            {error}
          </div>
        )}
      </div>

      <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 z-0 relative mb-4">
        <MapContainer 
          center={position || defaultPosition} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler setPosition={setPosition} setIsConfirmed={setIsConfirmed} />
          {position && (
            <>
              <ChangeView center={position} />
              <DraggableMarker position={position} setPosition={setPosition} />
            </>
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {position ? (
            <span>
              Coordinates: <strong>{position[0].toFixed(6)}, {position[1].toFixed(6)}</strong>
            </span>
          ) : (
            <span>No location selected.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!position}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
            isConfirmed 
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
              : "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md"
          }`}
        >
          {isConfirmed ? (
            <>
              <HiCheckCircle size={18} /> Location Confirmed
            </>
          ) : (
            "Confirm Location"
          )}
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;

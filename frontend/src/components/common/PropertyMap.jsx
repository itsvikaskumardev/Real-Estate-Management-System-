import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { HiLocationMarker, HiMap, HiOfficeBuilding } from 'react-icons/hi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PropertyMap = ({ latitude, longitude, title, address, property }) => {
  if (!latitude || !longitude) return null;

  const position = [latitude, longitude];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 transition-shadow hover:shadow-md">
      <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
        <HiMap className="text-primary" size={24} />
        Property Location
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Map */}
        <div className="lg:col-span-2 h-[350px] w-full rounded-xl overflow-hidden border border-slate-200 z-0 relative shadow-inner">
          <MapContainer 
            center={position} 
            zoom={15} 
            scrollWheelZoom={false} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                <div className="font-semibold text-slate-800">{title}</div>
                <div className="text-sm text-slate-500 mt-1">{address}</div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Right Side: Location Details */}
        <div className="flex flex-col justify-center bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <HiLocationMarker size={16} /> Location Details
          </h4>
          
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Address / Area</div>
              <div className="font-medium text-slate-800 text-lg">{property?.area || address}</div>
            </div>
            
            {property?.city && (
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">City</div>
                <div className="font-medium text-slate-800 text-lg flex items-center gap-2">
                  <HiOfficeBuilding className="text-slate-400" />
                  {property.city}
                </div>
              </div>
            )}
            
            {property?.pincode && (
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">Pincode</div>
                <div className="font-medium text-slate-800 text-lg">{property.pincode}</div>
              </div>
            )}
            
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Coordinates</div>
              <div className="font-mono text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 mt-1">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;

'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface CourierMapProps {
  couriers: Array<{
    id: string;
    name: string;
    coordinates: {
      current: [number, number];
      destination: [number, number];
      stops: Array<[number, number]>;
    };
    currentLocation: string;
    destination: string;
    stops: string[];
  }>;
}

export default function CourierMap({ couriers }: CourierMapProps) {
  // Center the map on the UK
  const ukCenter: [number, number] = [54.5, -2];

  // Generate a unique key for the map container based on courier positions
  const mapKey = JSON.stringify(couriers.map(c => ({
    current: c.coordinates.current,
    destination: c.coordinates.destination,
    stops: c.coordinates.stops
  })));

  return (
    <div key={mapKey} className="h-full w-full">
      <MapContainer
        center={ukCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {couriers.map(courier => (
          <div key={courier.id}>
            {/* Current Location */}
            <Marker position={courier.coordinates.current} icon={icon}>
              <Popup>
                <div className="p-2">
                  <strong>{courier.name}</strong>
                  <br />
                  Current Location: {courier.currentLocation}
                </div>
              </Popup>
            </Marker>

            {/* Stops */}
            {courier.coordinates.stops.map((stop, index) => (
              <Marker key={`${courier.id}-stop-${index}`} position={stop} icon={icon}>
                <Popup>
                  <div className="p-2">
                    <strong>Stop {index + 1}</strong>
                    <br />
                    Location: {courier.stops[index]}
                    <br />
                    Courier: {courier.name}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Destination */}
            <Marker position={courier.coordinates.destination} icon={icon}>
              <Popup>
                <div className="p-2">
                  <strong>Destination</strong>
                  <br />
                  Location: {courier.destination}
                  <br />
                  Courier: {courier.name}
                </div>
              </Popup>
            </Marker>

            {/* Route lines */}
            <Polyline
              positions={[
                courier.coordinates.current,
                ...courier.coordinates.stops,
                courier.coordinates.destination
              ]}
              color="blue"
              weight={3}
              opacity={0.5}
              dashArray="10, 10"
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { wineries } from '@/data/wineries';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function WineryMap() {
  return (
    <section className="py-20 px-6 bg-[#F5F0E1]">
      <h2 className="text-5xl text-center mb-12 text-[#6B2737] font-playfair">
        Explore Yadkin Valley Wineries
      </h2>
      <div className="h-96 md:h-[600px] max-w-6xl mx-auto rounded-lg shadow-2xl overflow-hidden">
        <MapContainer center={[36.35, -80.65]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {wineries.map((winery) => (
            <Marker key={winery.id} position={[winery.lat, winery.lng]}>
              <Popup>
                <div className="text-center p-2 min-w-48">
                  <h3 className="font-bold text-lg">{winery.name}</h3>
                  <p className="text-sm my-2">{winery.description}</p>
                  <a href={winery.website} target="_blank" rel="noopener noreferrer" className="text-[#6B2737] underline text-sm">
                    Visit Website →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons (required in Next.js)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const wineries = [
  { id: 1, name: "JOLO Winery & Vineyards", lat: 36.36997, lng: -80.52424, description: "Iconic views with Pilot Mountain backdrop and award-winning wines.", website: "https://jolowineyards.com" },
  { id: 2, name: "Jones von Drehle Vineyards & Winery", lat: 36.366, lng: -80.772, description: "Expansive estate with bold reds and mountain views.", website: "https://jonesvondrehle.com" },
  { id: 3, name: "Adagio Vineyards", lat: 36.267, lng: -80.657, description: "European-style dry wines in a musical, passionate setting.", website: "https://adagiovineyards.com" },
  { id: 4, name: "Round Peak Vineyards", lat: 36.4997, lng: -80.7686, description: "French and Italian varietals with stunning mountain vistas.", website: "https://roundpeak.com" },
  { id: 5, name: "Shelton Vineyards", lat: 36.392, lng: -80.658, description: "North Carolina's largest family-owned estate winery.", website: "https://sheltonvineyards.com" },
  { id: 6, name: "Slightly Askew Winery", lat: 36.259, lng: -80.848, description: "Unique sweet and dry wines in downtown Elkin.", website: "https://slightlyaskewwines.com" },
  { id: 7, name: "Stony Knoll Vineyards", lat: 36.4113, lng: -80.8765, description: "Family-owned on a Century Farm with mountain backdrops.", website: "https://stonyknollvineyards.com" },
  { id: 8, name: "Golden Road Vineyards", lat: 36.32, lng: -80.85, description: "Rolling hills vineyard with beautiful sunsets.", website: "https://grvwines.com" },
  { id: 9, name: "Haze Gray Vineyards", lat: 36.41, lng: -80.88, description: "Veteran-owned estate with award-winning wines.", website: "https://hazegrayvineyards.com" },
  { id: 10, name: "Elkin Creek Vineyard", lat: 36.2804, lng: -80.8763, description: "Historic mill site with creek views and wood-fired pizza.", website: "https://elkincreekvineyard.com" },
  { id: 11, name: "Serre Vineyards", lat: 36.45, lng: -80.62, description: "Spectacular sunsets and dry wines.", website: "https://serrevineyards.com" },
  { id: 12, name: "Hidden Vineyard", lat: 36.40, lng: -80.65, description: "Boutique winery tucked between Dobson and Pilot Mountain.", website: "https://hiddenvineyardnc.com" },
  { id: 13, name: "Grassy Creek Vineyard & Winery", lat: 36.30, lng: -80.85, description: "Historic Klondike Cabins site with scenic views.", website: "https://grassycreekvineyard.com" },
  { id: 14, name: "Carolina Heritage Vineyard", lat: 36.28, lng: -80.82, description: "USDA certified organic vineyard.", website: "https://carolinaheritagevineyard.com" },
  { id: 15, name: "Old North State Winery", lat: 36.50, lng: -80.62, description: "Downtown Mount Airy tasting room.", website: "https://oldnorthstatewinery.com" },
];

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
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
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
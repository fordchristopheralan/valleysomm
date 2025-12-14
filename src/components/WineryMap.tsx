"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix Leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

import { wineries } from '@/data/wineries';

export default function WineryMap({ filteredWineries = wineries }: { filteredWineries?: typeof wineries }) {
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (map) {
      setTimeout(() => map.invalidateSize(), 100);
    }
  }, [map]);

  const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    const size = 40 + count * 2;

    return L.divIcon({
      html: `<div class="flex items-center justify-center bg-[#6B2737] rounded-full text-white font-bold text-lg" style="width: ${size}px; height: ${size}px; line-height: ${size}px;">
        ${count}
      </div>`,
      className: 'custom-marker-cluster',
      iconSize: L.point(size, size),
    });
  };

  return (
    <MapContainer
      center={[36.1, -80.8]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      whenReady={() => {
        // The map instance is available on the component ref after ready
        // We use a ref or direct access — but for simplicity, remove setMap if not needed
        // OR keep it if you use map elsewhere (e.g., flyTo on search)
        // If you don't need the map reference, just use empty callback:
        // whenReady={() => {}}
        // But to keep your original intent:
        if (map === null) {
          // The map is created — grab it from the container if needed
          // Actually, the easiest is to remove the state if not used elsewhere
        }
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup
        spiderfyDistanceMultiplier={2}
        maxClusterRadius={50}
        iconCreateFunction={createClusterCustomIcon}
      >
        {filteredWineries.map((winery) => (
          <Marker key={winery.id} position={[winery.lat, winery.lng]}>
            <Popup>
              <div className="p-2 text-center">
                <h3 className="font-bold text-lg">{winery.name}</h3>
                <p className="text-sm text-gray-600">{winery.address}</p>
                {winery.website && (
                  <a
                    href={winery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B2737] underline text-sm block mt-1"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
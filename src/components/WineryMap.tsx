"use client";
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
          <Marker
            key={winery.id}
            position={[winery.lat!, winery.lng!]}  // ← Non-null assertion (safe if all have coords)
          >
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
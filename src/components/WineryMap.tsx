"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { wineries } from '@/data/wineries';
import { MapPinIcon, GlobeAltIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function WineryMap() {
  // Filter only wineries with valid coordinates
  const mappedWineries = wineries.filter(
    (winery): winery is { lat: number; lng: number } & typeof winery =>
      typeof winery.lat === 'number' && typeof winery.lng === 'number'
  );

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

          <MarkerClusterGroup
            showCoverageOnHover={false}
            spiderfyDistanceMultiplier={2}
            maxClusterRadius={50}
            iconCreateFunction={(cluster) => {
              return L.divIcon({
                html: `<div class="flex items-center justify-center bg-[#6B2737] rounded-full text-white font-bold text-lg" style="width: ${40 + cluster.getChildCount() * 2}px; height: ${40 + cluster.getChildCount() * 2}px; line-height: ${40 + cluster.getChildCount() * 2}px;">
                  ${cluster.getChildCount()}
                </div>`,
                className: 'custom-cluster-icon',
                iconSize: L.point(40, 40, true),
              });
            }}
          >
            {mappedWineries.map((winery) => (
              <Marker key={winery.id} position={[winery.lat, winery.lng]}>
                <Popup maxWidth={320} minWidth={280} closeButton={true}>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-bold text-[#6B2737] text-center">
                      {winery.name}
                    </h3>

                    <div className="relative w-full h-40 bg-gray-200 rounded-md overflow-hidden border border-gray-300">
                      <img
                        src={winery.photoUrl || "/directory_placeholder.jpg"}
                        alt={winery.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <p className="text-sm text-gray-700 leading-tight">
                      {winery.description}
                    </p>

                    {winery.wineTypes && (
                      <div className="flex items-start gap-2 text-sm">
                        <InformationCircleIcon className="w-5 h-5 text-[#6B2737] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Wine Styles:</span>{' '}
                          <span className="text-gray-600">{winery.wineTypes}</span>
                        </div>
                      </div>
                    )}

                    {winery.grapeVarieties && winery.grapeVarieties !== "N/A" && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPinIcon className="w-5 h-5 text-[#6B2737] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Key Grapes:</span>{' '}
                          <span className="text-gray-600">{winery.grapeVarieties}</span>
                        </div>
                      </div>
                    )}

                    <a
                      href={winery.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 mt-3 px-4 py-2 bg-[#6B2737] text-white rounded-md hover:bg-[#8d3448] transition text-sm font-medium"
                    >
                      <GlobeAltIcon className="w-5 h-5" />
                      Visit Website
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </section>
  );
}
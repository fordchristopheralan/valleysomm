"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
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
  { id: 16, name: "Herradura Vineyards", lat: 36.35, lng: -80.70, description: "Family-run with Spanish influences.", website: "https://herraduravineyards.com" },
  { id: 17, name: "Dobbins Creek Vineyards", lat: 36.42, lng: -80.75, description: "Intimate tasting room with mountain views.", website: "https://dobbinscreekvineyards.com" },
  { id: 18, name: "Allison Oaks Vineyards", lat: 36.38, lng: -80.72, description: "Charming vineyard with live music.", website: "https://allisonoaks.com" },
  { id: 19, name: "Midway Grove Vineyard", lat: 36.33, lng: -80.78, description: "Newer addition with bold reds.", website: "https://midwaygrovevineyard.com" },
  { id: 20, name: "Sanders Ridge Vineyard", lat: 36.31, lng: -80.68, description: "Organic practices and farm-to-table dining.", website: "https://sandersridge.com" },
  { id: 21, name: "Divine Llama Vineyards", lat: 36.28, lng: -80.70, description: "Unique llama farm and vineyard experience.", website: "https://divinellamavineyards.com" },
  { id: 22, name: "Laurel Gray Vineyards", lat: 36.38, lng: -80.80, description: "Family-owned with French oak-aged wines.", website: "https://laurelgray.com" },
  { id: 23, name: "Windsor Run Cellars", lat: 36.34, lng: -80.68, description: "Mead and wine with historic charm.", website: "https://windsorruncellars.com" },
  { id: 24, name: "Shadow Springs Vineyard", lat: 36.30, lng: -80.78, description: "Scenic views and muscadine wines.", website: "https://shadowspringsvineyard.com" },
  { id: 25, name: "Cellar 4201", lat: 36.26, lng: -80.78, description: "Boutique winery in East Bend.", website: "https://cellar4201.com" },
  { id: 26, name: "Medaloni Cellars", lat: 36.15, lng: -80.68, description: "Italian-inspired estate in Lewisville.", website: "https://medalonicellars.com" },
  { id: 27, name: "Junius Lindsay Vineyard", lat: 36.18, lng: -80.55, description: "French-style wines in Advance.", website: "https://juniuslindsay.com" },
  { id: 28, name: "Weathervane Winery", lat: 36.20, lng: -80.65, description: "Family-friendly with live music.", website: "https://weathervanewinery.com" },
  { id: 29, name: "Native Vines Winery", lat: 36.25, lng: -80.70, description: "North Carolina's first Native American-owned winery.", website: "https://nativevineswinery.com" },
  { id: 30, name: "Daveste' Vineyards", lat: 35.98, lng: -80.48, description: "Italian-inspired in Troutman area.", website: "https://daveste.com" },
  { id: 31, name: "RagApple Boom Winery", lat: 36.38, lng: -80.68, description: "Fun branding and solid wines.", website: "https://ragappleboom.com" },
  { id: 32, name: "McRitchie Winery & Ciderworks", lat: 36.42, lng: -80.78, description: "Cider and dry wines.", website: "https://mcritchiewine.com" },
  { id: 33, name: "Hanover Park Vineyard", lat: 36.12, lng: -80.58, description: "One of the oldest in the AVA.", website: "https://hanoverparkwines.com" },
  { id: 34, name: "Childress Vineyards", lat: 35.85, lng: -80.38, description: "Large estate with NASCAR ties.", website: "https://childressvineyards.com" },
  { id: 35, name: "Rafael Vineyards", lat: 36.30, lng: -80.70, description: "Small-batch boutique.", website: "https://rafaelvineyards.com" },
  { id: 36, name: "Lazy Elm Vineyard", lat: 36.28, lng: -80.75, description: "Relaxed vibe with good reds.", website: "https://lazyelm.com" },
  { id: 37, name: "Flint Hill Vineyards", lat: 36.22, lng: -80.68, description: "Historic setting in East Bend.", website: "https://flinthillvineyards.com" },
  { id: 38, name: "Dobbins Creek Vineyards", lat: 36.42, lng: -80.75, description: "Intimate and scenic.", website: "https://dobbinscreekvineyards.com" },
  { id: 39, name: "Baker Buffalo Creek Vineyard", lat: 36.25, lng: -80.80, description: "Family-run with creek views.", website: "https://bakerbuffalocreek.com" },
  { id: 40, name: "Causa Vineyards", lat: 36.35, lng: -80.70, description: "Newer addition with passion project vibe.", website: "https://causavineyards.com" },
  { id: 41, name: "Surry Cellars", lat: 36.48, lng: -80.62, description: "Downtown Dobson tasting room.", website: "https://surrycellars.com" },
  { id: 42, name: "Thistle Meadow Winery", lat: 36.25, lng: -80.85, description: "Muscadine specialist.", website: "https://thistlemeadowwinery.com" },
  { id: 43, name: "Roaring River Vineyards", lat: 36.20, lng: -81.00, description: "Riverside setting.", website: "https://roaringrivervineyards.com" },
  { id: 44, name: "Piccione Vineyards", lat: 36.18, lng: -80.68, description: "Italian heritage wines.", website: "https://piccionevineyards.com" },
  { id: 45, name: "Brandon Hills Vineyard", lat: 36.30, lng: -80.75, description: "Small-batch and personal.", website: "https://brandonhillsvineyard.com" },
  { id: 46, name: "Hutton Vineyards", lat: 36.35, lng: -80.68, description: "Historic vineyard revival.", website: "https://huttonvineyards.com" },
  { id: 47, name: "MenaRick Vineyard & Winery", lat: 36.25, lng: -80.70, description: "Newer family operation.", website: "https://menarick.com" },
  { id: 48, name: "Wolf's Lair Winery", lat: 36.40, lng: -80.70, description: "Unique name and bold wines.", website: "https://wolfslairwinery.com" },
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
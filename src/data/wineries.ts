export type Winery = {
  id: number;
  name: string;
  lat?: number;
  lng?: number;
  description: string;
  website: string;
  photoUrl: string; // Placeholder until real images are provided
};

export const wineries: Winery[] = [
  { id: 1, name: "JOLO Winery & Vineyards", lat: 36.36997, lng: -80.52424, description: "Iconic views with Pilot Mountain backdrop and award-winning wines.", website: "https://jolowineyards.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 2, name: "Jones von Drehle Vineyards & Winery", lat: 36.366, lng: -80.772, description: "Expansive estate with bold reds and mountain views.", website: "https://jonesvondrehle.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 3, name: "Adagio Vineyards", lat: 36.267, lng: -80.657, description: "European-style dry wines in a musical, passionate setting.", website: "https://adagiovineyards.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 4, name: "Round Peak Vineyards", lat: 36.4997, lng: -80.7686, description: "French and Italian varietals with stunning mountain vistas.", website: "https://roundpeak.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 5, name: "Shelton Vineyards", lat: 36.392, lng: -80.658, description: "North Carolina's largest family-owned estate winery.", website: "https://sheltonvineyards.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 6, name: "Slightly Askew Winery", lat: 36.259, lng: -80.848, description: "Unique sweet and dry wines in downtown Elkin.", website: "https://slightlyaskewwines.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 7, name: "Stony Knoll Vineyards", lat: 36.4113, lng: -80.8765, description: "Family-owned on a Century Farm with mountain backdrops.", website: "https://stonyknollvineyards.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 8, name: "Golden Road Vineyards", lat: 36.32, lng: -80.85, description: "Rolling hills vineyard with beautiful sunsets.", website: "https://grvwines.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 9, name: "Haze Gray Vineyards", lat: 36.41, lng: -80.88, description: "Veteran-owned estate with award-winning wines.", website: "https://hazegrayvineyards.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 10, name: "Elkin Creek Vineyard", lat: 36.2804, lng: -80.8763, description: "Historic mill site with creek views and wood-fired pizza.", website: "https://elkincreekvineyard.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 11, name: "Serre Vineyards", lat: 36.45, lng: -80.62, description: "Spectacular sunsets and dry wines.", website: "https://serrevineyards.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 12, name: "Hidden Vineyard", lat: 36.4, lng: -80.65, description: "Boutique winery tucked between Dobson and Pilot Mountain.", website: "https://hiddenvineyardnc.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 13, name: "Grassy Creek Vineyard & Winery", lat: 36.3, lng: -80.85, description: "Historic Klondike Cabins site with scenic views.", website: "https://grassycreekvineyard.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 14, name: "Carolina Heritage Vineyard", lat: 36.28, lng: -80.82, description: "USDA certified organic vineyard.", website: "https://carolinaheritagevineyard.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 15, name: "Old North State Winery", lat: 36.5, lng: -80.62, description: "Downtown Mount Airy tasting room.", website: "https://oldnorthstatewinery.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 16, name: "Christian Paul Vineyards", lat: 36.35, lng: -80.7, description: "Interactive tastings with international styles.", website: "https://christianpaulvineyards.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 17, name: "Surry Cellars", lat: 36.48, lng: -80.62, description: "Community college-produced wines.", website: "https://surrycellars.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 18, name: "Roaring River Vineyards", lat: 36.2, lng: -81.0, description: "Riverside setting with French-inspired wines.", website: "https://roaringrivervineyards.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 19, name: "Divine Llama Vineyards", lat: 36.28, lng: -80.7, description: "Llama farm and vineyard experience.", website: "https://divinellamavineyards.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 20, name: "Laurel Gray Vineyards", lat: 36.38, lng: -80.8, description: "French oak-aged wines in Swan Creek.", website: "https://laurelgray.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 21, name: "Shadow Springs Vineyard", lat: 36.3, lng: -80.78, description: "Scenic views and muscadine wines.", website: "https://shadowspringsvineyard.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 22, name: "Cellar 4201", lat: 36.26, lng: -80.78, description: "Boutique winery in East Bend.", website: "https://cellar4201.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 23, name: "Medaloni Cellars", lat: 36.15, lng: -80.68, description: "Italian-inspired estate.", website: "https://medalonicellars.com", photoUrl: "/directory_placeholder.jpg" },
  { id: 24, name: "Junius Lindsay Vineyard", lat: 36.18, lng:
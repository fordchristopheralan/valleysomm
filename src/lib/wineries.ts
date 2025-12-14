import { Winery } from './types';

// Complete Yadkin Valley winery dataset with metadata
// Coordinates are approximate based on known locations
export const WINERIES: Winery[] = [
  {
    id: 'jolo',
    name: 'JOLO Winery & Vineyards',
    description: 'Iconic views with Pilot Mountain backdrop and award-winning wines.',
    vibeTags: ['scenic', 'upscale', 'photo-worthy'],
    wineStyles: ['Cabernet Sauvignon', 'Viognier', 'Chambourcin', 'Traminette'],
    goodFor: ['couples', 'photography', 'wine enthusiasts', 'celebrations'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.2856,
    longitude: -80.6847,
    website: 'https://jolowineyards.com'
  },
  {
    id: 'jones-von-drehle',
    name: 'Jones von Drehle Vineyards & Winery',
    description: 'Expansive estate with bold reds and mountain views.',
    vibeTags: ['upscale', 'scenic', 'educational'],
    wineStyles: ['Cabernet Sauvignon', 'Merlot', 'Syrah', 'Chardonnay'],
    goodFor: ['wine enthusiasts', 'large groups', 'scenic views'],
    scenic: true,
    lunchNearby: true,
    latitude: 36.1523,
    longitude: -80.6234,
    website: 'https://jonesvondrehle.com'
  },
  {
    id: 'adagio',
    name: 'Adagio Vineyards',
    description: 'European-style dry wines in a musical, passionate setting.',
    vibeTags: ['romantic', 'upscale', 'intimate'],
    wineStyles: ['Sangiovese', 'Nebbiolo', 'Pinot Grigio', 'Merlot'],
    goodFor: ['couples', 'wine lovers', 'quiet atmosphere'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.1834,
    longitude: -80.5912,
    website: 'https://adagiovineyards.com'
  },
  {
    id: 'round-peak',
    name: 'Round Peak Vineyards',
    description: 'French and Italian varietals with stunning mountain vistas.',
    vibeTags: ['scenic', 'quality-focused', 'peaceful'],
    wineStyles: ['Cabernet Franc', 'Syrah', 'Viognier', 'Sangiovese'],
    goodFor: ['wine lovers', 'scenic views', 'photography', 'relaxed pace'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.4567,
    longitude: -80.8234,
    website: 'https://roundpeak.com'
  },
  {
    id: 'shelton',
    name: 'Shelton Vineyards',
    description: "North Carolina's largest family-owned estate winery.",
    vibeTags: ['upscale', 'educational', 'family-friendly'],
    wineStyles: ['Cabernet Sauvignon', 'Chardonnay', 'Riesling', 'Merlot'],
    goodFor: ['large groups', 'first-timers', 'wine education', 'families'],
    scenic: true,
    lunchNearby: true,
    latitude: 36.2633,
    longitude: -80.6789,
    website: 'https://sheltonvineyards.com'
  },
  {
    id: 'slightly-askew',
    name: 'Slightly Askew Winery',
    description: 'Unique sweet and dry wines in downtown Elkin.',
    vibeTags: ['casual', 'fun', 'quirky'],
    wineStyles: ['Sweet reds', 'Fruit wines', 'Dry whites', 'Port-style'],
    goodFor: ['casual groups', 'downtown location', 'variety seekers'],
    scenic: false,
    lunchNearby: true,
    latitude: 36.2445,
    longitude: -80.8490,
    website: 'https://slightlyaskewwines.com'
  },
  {
    id: 'stony-knoll',
    name: 'Stony Knoll Vineyards',
    description: 'Family-owned on a Century Farm with mountain backdrops.',
    vibeTags: ['rustic', 'scenic', 'historic'],
    wineStyles: ['Cabernet Franc', 'Chardonnay', 'Chambourcin', 'Traminette'],
    goodFor: ['families', 'history buffs', 'scenic views'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.3123,
    longitude: -80.7456,
    website: 'https://stonyknollvineyards.com'
  },
  {
    id: 'golden-road',
    name: 'Golden Road Vineyards',
    description: 'Rolling hills vineyard with beautiful sunsets.',
    vibeTags: ['scenic', 'romantic', 'peaceful'],
    wineStyles: ['Cabernet Sauvignon', 'Viognier', 'Rosé', 'Merlot'],
    goodFor: ['couples', 'sunset viewing', 'photography'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.1756,
    longitude: -80.6123,
    website: 'https://grvwines.com'
  },
  {
    id: 'haze-gray',
    name: 'Haze Gray Vineyards',
    description: 'Veteran-owned estate with award-winning wines.',
    vibeTags: ['upscale', 'patriotic', 'quality-focused'],
    wineStyles: ['Cabernet Sauvignon', 'Merlot', 'Chardonnay', 'Port'],
    goodFor: ['wine enthusiasts', 'veterans', 'quality seekers'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.2234,
    longitude: -80.6890,
    website: 'https://hazegrayvineyards.com'
  },
  {
    id: 'elkin-creek',
    name: 'Elkin Creek Vineyard',
    description: 'Historic mill site with creek views and wood-fired pizza.',
    vibeTags: ['casual', 'family-friendly', 'scenic'],
    wineStyles: ['Cabernet Franc', 'Chardonnay', 'Sweet wines', 'Rosé'],
    goodFor: ['families', 'lunch stop', 'casual groups', 'creek views'],
    scenic: true,
    lunchNearby: true,
    latitude: 36.2567,
    longitude: -80.8345,
    website: 'https://elkincreekvineyard.com'
  },
  {
    id: 'serre',
    name: 'Serre Vineyards',
    description: 'Spectacular sunsets and dry wines.',
    vibeTags: ['scenic', 'romantic', 'intimate'],
    wineStyles: ['Viognier', 'Cabernet Franc', 'Chardonnay', 'Merlot'],
    goodFor: ['couples', 'sunset viewing', 'small groups'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.2012,
    longitude: -80.6567,
    website: 'https://serrevineyards.com'
  },
  {
    id: 'hidden',
    name: 'Hidden Vineyard',
    description: 'Boutique winery tucked between Dobson and Pilot Mountain.',
    vibeTags: ['intimate', 'hidden-gem', 'peaceful'],
    wineStyles: ['Cabernet Sauvignon', 'Syrah', 'Chardonnay', 'Viognier'],
    goodFor: ['small groups', 'wine enthusiasts', 'quiet atmosphere'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.3456,
    longitude: -80.7234,
    website: 'https://hiddenvineyardnc.com'
  },
  {
    id: 'grassy-creek',
    name: 'Grassy Creek Vineyard & Winery',
    description: 'Historic Klondike Cabins site with scenic views.',
    vibeTags: ['rustic', 'historic', 'scenic'],
    wineStyles: ['Cabernet Franc', 'Chardonnay', 'Sweet reds', 'Traminette'],
    goodFor: ['history buffs', 'casual groups', 'scenic views'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.4123,
    longitude: -81.1456,
    website: 'https://grassycreekvineyard.com'
  },
  {
    id: 'carolina-heritage',
    name: 'Carolina Heritage Vineyard',
    description: 'USDA certified organic vineyard.',
    vibeTags: ['organic', 'eco-friendly', 'educational'],
    wineStyles: ['Chardonnay', 'Cabernet Franc', 'Merlot', 'Viognier'],
    goodFor: ['eco-conscious', 'wine education', 'small groups'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.2890,
    longitude: -80.7123,
    website: 'https://carolinaheritagevineyard.com'
  },
  {
    id: 'old-north-state',
    name: 'Old North State Winery',
    description: 'Downtown Mount Airy tasting room.',
    vibeTags: ['casual', 'downtown', 'accessible'],
    wineStyles: ['Sweet wines', 'Muscadine', 'Fruit wines', 'Dry reds'],
    goodFor: ['downtown location', 'casual groups', 'easy access'],
    scenic: false,
    lunchNearby: true,
    latitude: 36.4993,
    longitude: -80.6073,
    website: 'https://oldnorthstatewinery.com'
  },
  {
    id: 'christian-paul',
    name: 'Christian Paul Vineyards',
    description: 'Interactive tastings with international styles.',
    vibeTags: ['educational', 'interactive', 'diverse'],
    wineStyles: ['Bordeaux blends', 'Italian varietals', 'Spanish styles', 'Port'],
    goodFor: ['wine education', 'adventurous palates', 'small groups'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.1923,
    longitude: -80.6445,
    website: 'https://christianpaulvineyards.com'
  },
  {
    id: 'surry-cellars',
    name: 'Surry Cellars',
    description: 'Community college-produced wines.',
    vibeTags: ['educational', 'casual', 'unique'],
    wineStyles: ['Various varietals', 'Student wines', 'Experimental'],
    goodFor: ['wine education', 'supporting education', 'variety'],
    scenic: false,
    lunchNearby: true,
    latitude: 36.4012,
    longitude: -80.6890,
    website: 'https://surrycellars.com'
  },
  {
    id: 'roaring-river',
    name: 'Roaring River Vineyards',
    description: 'Riverside setting with French-inspired wines.',
    vibeTags: ['scenic', 'romantic', 'peaceful'],
    wineStyles: ['Bordeaux blends', 'Viognier', 'Cabernet Franc', 'Chardonnay'],
    goodFor: ['couples', 'riverside views', 'peaceful setting'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.2145,
    longitude: -81.0234,
    website: 'https://roaringrivervineyards.com'
  },
  {
    id: 'divine-llama',
    name: 'Divine Llama Vineyards',
    description: 'Llama farm and vineyard experience.',
    vibeTags: ['fun', 'family-friendly', 'quirky'],
    wineStyles: ['Rosé', 'Muscadine', 'Fruit wines', 'Sweet wines'],
    goodFor: ['families', 'animal lovers', 'casual groups', 'unique experience'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.2145,
    longitude: -80.6012,
    website: 'https://divinellamavineyards.com'
  },
  {
    id: 'laurel-gray',
    name: 'Laurel Gray Vineyards',
    description: 'French oak-aged wines in Swan Creek.',
    vibeTags: ['upscale', 'quality-focused', 'intimate'],
    wineStyles: ['Cabernet Sauvignon', 'Merlot', 'Chardonnay', 'Viognier'],
    goodFor: ['wine enthusiasts', 'quality seekers', 'small groups'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.1678,
    longitude: -80.5789,
    website: 'https://laurelgray.com'
  },
  {
    id: 'shadow-springs',
    name: 'Shadow Springs Vineyard',
    description: 'Scenic views and muscadine wines.',
    vibeTags: ['casual', 'scenic', 'southern'],
    wineStyles: ['Muscadine', 'Sweet wines', 'Cabernet Franc', 'Chardonnay'],
    goodFor: ['muscadine lovers', 'casual groups', 'scenic views'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.1834,
    longitude: -80.5678,
    website: 'https://shadowspringsvineyard.com'
  },
  {
    id: 'cellar-4201',
    name: 'Cellar 4201',
    description: 'Boutique winery in East Bend.',
    vibeTags: ['intimate', 'hidden-gem', 'quality-focused'],
    wineStyles: ['Cabernet Sauvignon', 'Merlot', 'Chardonnay', 'Petit Verdot'],
    goodFor: ['wine enthusiasts', 'small groups', 'quiet atmosphere'],
    scenic: false,
    lunchNearby: true,
    latitude: 36.2123,
    longitude: -80.5234,
    website: 'https://cellar4201.com'
  },
  {
    id: 'medaloni',
    name: 'Medaloni Cellars',
    description: 'Italian-inspired estate.',
    vibeTags: ['upscale', 'romantic', 'Italian-style'],
    wineStyles: ['Sangiovese', 'Barbera', 'Nebbiolo', 'Pinot Grigio'],
    goodFor: ['Italian wine lovers', 'couples', 'wine enthusiasts'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.1445,
    longitude: -80.6123,
    website: 'https://medalonicellars.com'
  },
  {
    id: 'junius-lindsay',
    name: 'Junius Lindsay Vineyard',
    description: 'French-style Rhône varietals.',
    vibeTags: ['upscale', 'educational', 'quality-focused'],
    wineStyles: ['Viognier', 'Syrah', 'Mourvèdre', 'Grenache'],
    goodFor: ['wine enthusiasts', 'Rhône lovers', 'educational'],
    scenic: true,
    lunchNearby: true,
    latitude: 36.2456,
    longitude: -80.6345,
    website: 'https://juniuslindsay.com'
  },
  {
    id: 'weathervane',
    name: 'Weathervane Winery',
    description: 'Family-friendly with live music.',
    vibeTags: ['fun', 'family-friendly', 'social'],
    wineStyles: ['Sweet wines', 'Dry reds', 'Rosé', 'Muscadine'],
    goodFor: ['families', 'live music', 'social groups', 'casual'],
    scenic: true,
    lunchNearby: true,
    latitude: 36.2890,
    longitude: -80.7567,
    website: 'https://weathervanewinery.com'
  },
  {
    id: 'native-vines',
    name: 'Native Vines Winery',
    description: "First Native American-owned winery in NC.",
    vibeTags: ['cultural', 'historic', 'unique'],
    wineStyles: ['Muscadine', 'Scuppernong', 'Sweet wines', 'Native varietals'],
    goodFor: ['cultural experience', 'history buffs', 'unique wines'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.3234,
    longitude: -80.7890,
    website: 'https://nativevineswinery.com'
  },
  {
    id: 'childress',
    name: 'Childress Vineyards',
    description: 'Large estate with NASCAR ties.',
    vibeTags: ['upscale', 'large', 'NASCAR-themed'],
    wineStyles: ['Cabernet Sauvignon', 'Chardonnay', 'Merlot', 'Viognier'],
    goodFor: ['NASCAR fans', 'large groups', 'upscale experience'],
    scenic: true,
    lunchNearby: true,
    latitude: 35.9234,
    longitude: -80.4567,
    website: 'https://childressvineyards.com'
  },
  {
    id: 'raffaldini',
    name: 'Raffaldini Vineyards',
    description: 'Italian heritage in Swan Creek.',
    vibeTags: ['upscale', 'Italian-style', 'romantic'],
    wineStyles: ['Sangiovese', 'Montepulciano', 'Vermentino', 'Super Tuscan'],
    goodFor: ['Italian wine lovers', 'wine enthusiasts', 'romantic'],
    scenic: true,
    lunchNearby: true,
    latitude: 36.1534,
    longitude: -80.5912,
    website: 'https://raffaldini.com'
  },
  {
    id: 'hanover-park',
    name: 'Hanover Park Vineyard',
    description: 'One of the oldest in the AVA.',
    vibeTags: ['historic', 'established', 'quality-focused'],
    wineStyles: ['Cabernet Franc', 'Chardonnay', 'Viognier', 'Petit Verdot'],
    goodFor: ['history buffs', 'wine enthusiasts', 'established wines'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.2678,
    longitude: -80.6234,
    website: 'https://hanoverparkwines.com'
  },
  {
    id: 'brandon-hills',
    name: 'Brandon Hills Vineyard',
    description: 'Small-batch and personal.',
    vibeTags: ['intimate', 'small-batch', 'artisan'],
    wineStyles: ['Cabernet Franc', 'Merlot', 'Chardonnay', 'Petit Verdot'],
    goodFor: ['small groups', 'intimate experience', 'artisan wines'],
    scenic: true,
    lunchNearby: false,
    latitude: 36.1923,
    longitude: -80.6678,
    website: 'https://brandonhillsvineyard.com'
  }
];

// Helper function to get winery by ID
export function getWineryById(id: string): Winery | undefined {
  return WINERIES.find(w => w.id === id);
}

// Helper function to filter wineries by tags
export function getWineriesByTags(tags: string[]): Winery[] {
  return WINERIES.filter(w => 
    tags.some(tag => w.vibeTags.includes(tag))
  );
}

// Helper function to get wineries with specific wine styles
export function getWineriesByWineStyle(styles: string[]): Winery[] {
  return WINERIES.filter(w =>
    styles.some(style => 
      w.wineStyles.some(ws => ws.toLowerCase().includes(style.toLowerCase()))
    )
  );
}
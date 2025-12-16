// Weather utility for Yadkin Valley wine trails
// Provides historical weather data and optional API integration

import type { WeatherInfo } from './types';

// Yadkin Valley coordinates (center of wine region)
const YADKIN_VALLEY_LAT = 36.3;
const YADKIN_VALLEY_LON = -80.7;

// Historical monthly weather averages for Yadkin Valley, NC
const HISTORICAL_WEATHER: { [month: number]: {
  avgTempF: number;
  conditions: string;
  precipitationChance: number;
  note: string;
}} = {
  0: { // January
    avgTempF: 42,
    conditions: 'Cool and partly cloudy',
    precipitationChance: 35,
    note: 'Cooler weather perfect for bold reds and cozy tasting rooms. Dress warmly!'
  },
  1: { // February
    avgTempF: 46,
    conditions: 'Cool with occasional rain',
    precipitationChance: 40,
    note: 'Late winter charm with fewer crowds. Great for intimate tastings.'
  },
  2: { // March
    avgTempF: 54,
    conditions: 'Mild with spring showers',
    precipitationChance: 45,
    note: 'Spring arrives! Early blooms and mild temperatures make for pleasant vineyard walks.'
  },
  3: { // April
    avgTempF: 63,
    conditions: 'Pleasant and sunny',
    precipitationChance: 35,
    note: 'Beautiful spring weather with blooming vineyards. Perfect touring conditions!'
  },
  4: { // May
    avgTempF: 71,
    conditions: 'Warm and mostly sunny',
    precipitationChance: 40,
    note: 'Ideal weather! Warm days, vineyards in full bloom. Peak season begins.'
  },
  5: { // June
    avgTempF: 78,
    conditions: 'Warm and humid',
    precipitationChance: 35,
    note: 'Summer warmth begins. Morning tastings recommended. Perfect for rosé!'
  },
  6: { // July
    avgTempF: 82,
    conditions: 'Hot and humid',
    precipitationChance: 40,
    note: 'Peak summer heat. Plan early tastings or shaded patios. Stay hydrated!'
  },
  7: { // August
    avgTempF: 81,
    conditions: 'Hot with afternoon thunderstorms',
    precipitationChance: 45,
    note: 'Late summer heat continues. Seek wineries with AC or outdoor shade. Great for whites!'
  },
  8: { // September
    avgTempF: 75,
    conditions: 'Warm with harvest activity',
    precipitationChance: 30,
    note: 'Harvest season excitement! Watch grape picking, mild temperatures return. Fantastic time to visit!'
  },
  9: { // October
    avgTempF: 64,
    conditions: 'Perfect fall weather',
    precipitationChance: 25,
    note: 'PERFECT! Fall colors, harvest celebrations, comfortable weather. Peak season!'
  },
  10: { // November
    avgTempF: 54,
    conditions: 'Cool and crisp',
    precipitationChance: 30,
    note: 'Crisp fall air, fewer crowds, cozy tasting rooms. Great for bold reds.'
  },
  11: { // December
    avgTempF: 45,
    conditions: 'Cool with holiday atmosphere',
    precipitationChance: 35,
    note: 'Holiday festivities at wineries, special events, festive atmosphere. Warm up with wine!'
  }
};

/**
 * Get historical weather averages for a given date
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Weather information with historical context
 */
export function getHistoricalWeather(date: string): WeatherInfo {
  const dateObj = new Date(date);
  const month = dateObj.getMonth();
  
  const historical = HISTORICAL_WEATHER[month];
  
  return {
    date: date,
    avgTemp: historical.avgTempF,
    conditions: historical.conditions,
    precipitation: historical.precipitationChance,
    historicalNote: historical.note
  };
}

/**
 * Get weather forecast from OpenWeather API (optional)
 * Requires OPENWEATHER_API_KEY environment variable
 * Falls back to historical averages if API is unavailable
 * 
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Weather forecast or historical average
 */
export async function getWeatherForecast(date: string): Promise<WeatherInfo> {
  // Check if API key is available
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.log('OpenWeather API key not configured, using historical averages');
    return getHistoricalWeather(date);
  }

  try {
    const dateObj = new Date(date);
    const now = new Date();
    const daysInFuture = Math.ceil((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // OpenWeather free tier only provides 5-day forecast
    if (daysInFuture > 5 || daysInFuture < 0) {
      console.log('Date outside forecast range, using historical averages');
      return getHistoricalWeather(date);
    }

    // Fetch 5-day forecast
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${YADKIN_VALLEY_LAT}&lon=${YADKIN_VALLEY_LON}&appid=${apiKey}&units=imperial`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    // Find forecast closest to noon on the target date
    const targetTime = new Date(date).setHours(12, 0, 0, 0);
    let closestForecast = data.list[0];
    let closestDiff = Math.abs(new Date(closestForecast.dt * 1000).getTime() - targetTime);

    for (const forecast of data.list) {
      const forecastTime = new Date(forecast.dt * 1000).getTime();
      const diff = Math.abs(forecastTime - targetTime);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestForecast = forecast;
      }
    }

    // Get historical note for context
    const historical = HISTORICAL_WEATHER[dateObj.getMonth()];

    return {
      date: date,
      avgTemp: Math.round(closestForecast.main.temp),
      conditions: closestForecast.weather[0].description,
      precipitation: closestForecast.pop * 100, // Probability of precipitation
      historicalNote: `Forecast: ${closestForecast.weather[0].main}. ${historical.note}`
    };

  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return getHistoricalWeather(date);
  }
}

/**
 * Get weather for a multi-day trip
 * @param startDate - ISO date string (YYYY-MM-DD)
 * @param endDate - ISO date string (YYYY-MM-DD)
 * @returns Array of weather info for each day
 */
export async function getMultiDayWeather(
  startDate: string,
  endDate: string
): Promise<WeatherInfo[]> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: WeatherInfo[] = [];

  let current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const weather = await getWeatherForecast(dateStr);
    days.push(weather);
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Get packing recommendations based on weather
 * @param weather - Weather information
 * @returns Array of packing suggestions
 */
export function getPackingRecommendations(weather: WeatherInfo): string[] {
  const items: string[] = ['Comfortable walking shoes', 'Camera for vineyard photos'];

  // Temperature-based recommendations
  if (weather.avgTemp >= 80) {
    items.push('Sunscreen (SPF 30+)', 'Sunglasses', 'Hat', 'Light breathable clothing', 'Water bottle');
  } else if (weather.avgTemp >= 70) {
    items.push('Sunglasses', 'Light jacket for evening', 'Sunscreen');
  } else if (weather.avgTemp >= 60) {
    items.push('Light jacket or sweater', 'Layers for changing temperatures');
  } else if (weather.avgTemp >= 50) {
    items.push('Warm jacket', 'Scarf', 'Layers');
  } else {
    items.push('Warm coat', 'Gloves', 'Scarf', 'Hat', 'Warm layers');
  }

  // Precipitation-based recommendations
  if (weather.precipitation > 50) {
    items.push('Umbrella', 'Rain jacket', 'Waterproof shoes');
  } else if (weather.precipitation > 30) {
    items.push('Light rain jacket (just in case)');
  }

  // Universal recommendations
  items.push('Cooler for wine purchases', 'Designated driver or transportation plan');

  return items;
}

/**
 * Get seasonal highlights for a given month
 * @param date - ISO date string
 * @returns Seasonal activities and highlights
 */
export function getSeasonalHighlights(date: string): string[] {
  const month = new Date(date).getMonth();
  
  const highlights: { [key: number]: string[] } = {
    0: ['Cozy indoor tastings', 'Bold red wines', 'Fewer crowds', 'Winter specials'],
    1: ['Valentine\'s Day events', 'Intimate tastings', 'Winter wine sales'],
    2: ['Early spring blooms', 'Barrel tastings', 'Vineyard walks'],
    3: ['Spring festivals', 'New release wines', 'Outdoor patios open', 'Vineyard tours'],
    4: ['Memorial Day events', 'Outdoor concerts', 'Picnic season', 'Rosé season begins'],
    5: ['Live music series', 'Food truck events', 'Rosé and whites', 'Evening tastings'],
    6: ['4th of July celebrations', 'Summer concert series', 'Veraison (grape color change)'],
    7: ['Harvest preparations', 'Summer festivals', 'Food pairings', 'Sunset tastings'],
    8: ['HARVEST SEASON!', 'Grape picking', 'Crush events', 'Harvest festivals', 'Behind-the-scenes tours'],
    9: ['Fall foliage', 'Harvest celebrations', 'Pumpkin patches nearby', 'Barrel tastings', 'Best weather of the year!'],
    10: ['Thanksgiving events', 'Wine & food pairings', 'Holiday wine sales', 'Cozy season begins'],
    11: ['Holiday events', 'Gift baskets', 'Festive decorations', 'New Year\'s celebrations', 'Winter wine releases']
  };

  return highlights[month] || [];
}
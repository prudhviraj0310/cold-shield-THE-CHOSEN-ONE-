import { API_CONFIG } from '@/config/api';

export interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
  visibility: number;
  coord: { lat: number; lon: number };
}

export interface RouteData {
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  distanceKm: number;
  durationMinutes: number;
  durationText: string;
  mapEmbedUrl: string | null;
}

export interface TravelAdvisory {
  score: number;
  recommendation: 'Good to Go!' | 'Proceed with Caution' | 'High Risk / Not Recommended';
  level: 'good' | 'caution' | 'bad';
  emoji: string;
  tips: string[];
}

/**
 * Fetch current weather from OpenWeatherMap for a given Indian city/location
 */
export async function fetchCityWeather(city: string): Promise<WeatherData> {
  const url = `${API_CONFIG.openWeather.currentUrl}?q=${encodeURIComponent(city)},IN&appid=${API_CONFIG.openWeather.apiKey}&units=metric`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Weather query failed for ${city} (${res.status})`);
  }

  const data = await res.json();
  return {
    city: data.name,
    temp: data.main.temp,
    feelsLike: data.main.feels_like,
    tempMin: data.main.temp_min,
    tempMax: data.main.temp_max,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    condition: data.weather?.[0]?.main || 'Clear',
    description: data.weather?.[0]?.description || '',
    icon: data.weather?.[0]?.icon || '01d',
    visibility: data.visibility || 10000,
    coord: data.coord || { lat: 0, lon: 0 },
  };
}

/**
 * Haversine formula calculation for road distance estimation
 */
function calculateHaversineDistance(
  coord1: { lat: number; lon: number },
  coord2: { lat: number; lon: number }
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lon - coord1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1.3; // 1.3x road winding factor
}

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} min`;
  return `${hrs}h ${mins}min`;
}

/**
 * Plan route between farm origin and destination market
 */
export async function planAgriculturalRoute(
  originCity: string,
  destCity: string
): Promise<{
  route: RouteData;
  originWeather: WeatherData | null;
  destWeather: WeatherData | null;
  advisory: TravelAdvisory;
}> {
  let originWeather: WeatherData | null = null;
  let destWeather: WeatherData | null = null;

  try {
    const [w1, w2] = await Promise.all([
      fetchCityWeather(originCity),
      fetchCityWeather(destCity),
    ]);
    originWeather = w1;
    destWeather = w2;
  } catch (err) {
    console.warn('Weather fetch warning:', err);
  }

  const distance = (originWeather && destWeather)
    ? calculateHaversineDistance(originWeather.coord, destWeather.coord)
    : 145.0;

  const durationMinutes = Math.round((distance / 50) * 60); // Average 50 km/h truck speed

  const mapEmbedUrl = API_CONFIG.googleMaps.apiKey
    ? `https://www.google.com/maps/embed/v1/directions?key=${API_CONFIG.googleMaps.apiKey}&origin=${encodeURIComponent(originCity)}&destination=${encodeURIComponent(destCity)}&mode=driving`
    : null;

  const route: RouteData = {
    origin: {
      name: originCity,
      lat: originWeather ? originWeather.coord.lat : 0,
      lng: originWeather ? originWeather.coord.lon : 0,
    },
    destination: {
      name: destCity,
      lat: destWeather ? destWeather.coord.lat : 0,
      lng: destWeather ? destWeather.coord.lon : 0,
    },
    distanceKm: parseFloat(distance.toFixed(1)),
    durationMinutes,
    durationText: formatDuration(durationMinutes),
    mapEmbedUrl,
  };

  const advisory = evaluateTravelConditions(originWeather, destWeather, route);

  return {
    route,
    originWeather,
    destWeather,
    advisory,
  };
}

/**
 * Intelligent Agricultural Travel Advisor Algorithm
 * Computes safety score (0-100) and actionable produce protection tips
 */
export function evaluateTravelConditions(
  originW: WeatherData | null,
  destW: WeatherData | null,
  route: RouteData
): TravelAdvisory {
  if (!originW || !destW) {
    return {
      score: 75,
      recommendation: 'Proceed with Caution',
      level: 'caution',
      emoji: '🟡',
      tips: [
        '🛣️ Plan regular driver rest stops to avoid transit fatigue.',
        '📦 Ensure crates and fresh produce are securely strapped and covered.',
        '🌡️ Check refrigerated truck blower ventilation before departure.',
      ],
    };
  }

  let score = 100;
  const tips: string[] = [];

  const origMain = originW.condition;
  const destMain = destW.condition;

  // Severe Weather
  if (origMain === 'Thunderstorm' || destMain === 'Thunderstorm') {
    score -= 50;
    tips.push('⛈️ Thunderstorm detected — severe risk of water damage and road delays. Postpone departure if possible.');
  } else if (origMain === 'Rain' || destMain === 'Rain') {
    score -= 30;
    tips.push('🌧️ Rain expected — drive slowly and cover produce crates with heavy waterproof tarpaulin.');
  } else if (origMain === 'Drizzle' || destMain === 'Drizzle') {
    score -= 10;
    tips.push('🌦️ Light precipitation — maintain sealed cargo bay to protect packaging.');
  }

  // Visibility
  const minVis = Math.min(originW.visibility, destW.visibility);
  if (minVis < 1500) {
    score -= 30;
    tips.push('🌫️ Dense fog / low visibility (<1.5 km) — hazardous highway driving. Use yellow fog lights.');
  } else if (minVis < 4000) {
    score -= 15;
    tips.push('🌫️ Reduced visibility — maintain safe distance between transport vehicles.');
  }

  // High Winds
  const maxWind = Math.max(originW.windSpeed, destW.windSpeed);
  if (maxWind > 14) {
    score -= 25;
    tips.push('💨 High wind gusts (>14 m/s) — high risk of load shifting. Secure crate lashings.');
  } else if (maxWind > 8) {
    score -= 10;
    tips.push('💨 Moderate crosswinds — maintain moderate driving speed.');
  }

  // Extreme Heat / Thermal Drift for Perishables
  const maxTemp = Math.max(originW.temp, destW.temp);
  if (maxTemp > 40) {
    score -= 20;
    tips.push('🌡️ Extreme ambient heat (>40°C) — travel during night or early dawn. Keep refrigeration units set 1.5°C cooler.');
  } else if (maxTemp > 34) {
    score -= 10;
    tips.push('🌡️ Elevated daytime temperature — ensure proper airflow around cargo crates.');
  }

  // Journey Length
  if (route.durationMinutes > 240) {
    tips.push('🛣️ Extended route (>4 hours) — check reefer fuel levels and log temperature at halfway checkpoint.');
  }

  if (score >= 80 && tips.length === 0) {
    tips.push('✅ Clear skies and stable ambient conditions — ideal for perishable delivery.');
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let recommendation: TravelAdvisory['recommendation'] = 'Good to Go!';
  let level: TravelAdvisory['level'] = 'good';
  let emoji = '🟢';

  if (finalScore >= 70) {
    recommendation = 'Good to Go!';
    level = 'good';
    emoji = '🟢';
  } else if (finalScore >= 40) {
    recommendation = 'Proceed with Caution';
    level = 'caution';
    emoji = '🟡';
  } else {
    recommendation = 'High Risk / Not Recommended';
    level = 'bad';
    emoji = '🔴';
  }

  return {
    score: finalScore,
    recommendation,
    level,
    emoji,
    tips,
  };
}

import { API_CONFIG } from '@/config/api';

export interface ColdChainReading {
  time: string;
  fullTime: Date;
  temp: number | null;
  humidity: number | null;
  entry_id?: number;
}

export interface Thresholds {
  tempMin: number;
  tempMax: number;
  humMin: number;
  humMax: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  tempMin: 2.0,
  tempMax: 8.0,
  humMin: 70.0,
  humMax: 95.0,
};

export interface ColdChainAlert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
  category: 'temp_high' | 'temp_low' | 'hum_high' | 'hum_low';
}

/**
 * Fetch latest readings & history from ThingSpeak IoT Channel
 */
export async function fetchThingSpeakData(): Promise<{
  currentTemp: number | null;
  currentHum: number | null;
  history: ColdChainReading[];
  channelInfo?: { name: string; description: string; last_entry_id: number };
}> {
  try {
    const url = `${API_CONFIG.thingspeak.feedsUrl}?api_key=${API_CONFIG.thingspeak.readApiKey}&results=100`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ThingSpeak returned status ${response.status}`);
    }

    const data = await response.json();
    const feeds = data.feeds || [];

    if (feeds.length === 0) {
      return { currentTemp: null, currentHum: null, history: [] };
    }

    const latest = feeds[feeds.length - 1];
    const temp = parseFloat(latest.field1);
    const hum = parseFloat(latest.field2);

    const history: ColdChainReading[] = feeds.map((f: { created_at: string; field1: string; field2: string; entry_id: number }) => {
      const d = new Date(f.created_at);
      return {
        time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        fullTime: d,
        temp: isNaN(parseFloat(f.field1)) ? null : parseFloat(f.field1),
        humidity: isNaN(parseFloat(f.field2)) ? null : parseFloat(f.field2),
        entry_id: f.entry_id,
      };
    });

    return {
      currentTemp: isNaN(temp) ? null : temp,
      currentHum: isNaN(hum) ? null : hum,
      history,
      channelInfo: data.channel,
    };
  } catch (error) {
    console.warn('ThingSpeak live query error (falling back to cached data):', error);
    throw error;
  }
}

/**
 * Evaluates current readings against thresholds to produce alerts
 */
export function evaluateAlerts(
  temp: number | null,
  hum: number | null,
  thresholds: Thresholds
): ColdChainAlert[] {
  const alerts: ColdChainAlert[] = [];
  const now = new Date().toLocaleTimeString('en-IN');

  if (temp !== null) {
    if (temp < thresholds.tempMin) {
      alerts.push({
        id: Date.now() + 1,
        type: 'critical',
        category: 'temp_low',
        message: `⚠️ Temperature too LOW: ${temp.toFixed(1)}°C (Min Safe: ${thresholds.tempMin}°C)`,
        time: now,
      });
    } else if (temp > thresholds.tempMax) {
      alerts.push({
        id: Date.now() + 2,
        type: 'critical',
        category: 'temp_high',
        message: `🔴 Temperature too HIGH: ${temp.toFixed(1)}°C (Max Safe: ${thresholds.tempMax}°C)`,
        time: now,
      });
    }
  }

  if (hum !== null) {
    if (hum < thresholds.humMin) {
      alerts.push({
        id: Date.now() + 3,
        type: 'warning',
        category: 'hum_low',
        message: `💧 Humidity too LOW: ${hum.toFixed(1)}% (Min Safe: ${thresholds.humMin}%)`,
        time: now,
      });
    } else if (hum > thresholds.humMax) {
      alerts.push({
        id: Date.now() + 4,
        type: 'warning',
        category: 'hum_high',
        message: `💧 Humidity too HIGH: ${hum.toFixed(1)}% (Max Safe: ${thresholds.humMax}%)`,
        time: now,
      });
    }
  }

  return alerts;
}

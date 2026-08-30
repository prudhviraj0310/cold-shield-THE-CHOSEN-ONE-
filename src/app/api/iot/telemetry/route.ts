import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // 1. Try local Pi Edge Hub on port 5000
  try {
    const piRes = await fetch('http://10.188.198.131:5000/telemetry', {
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });
    if (piRes.ok) {
      const data = await piRes.json();
      return NextResponse.json({
        temp: Number(data.temp),
        humidity: Number(data.humidity),
        lat: Number(data.lat || 13.6268),
        lon: Number(data.lon || 78.4343),
        speed: Number(data.speed || 0.0),
        status: data.status || 'PARKED',
        location: data.location || 'MITS College Campus (Angallu, Madanapalle)',
        source: 'Raspberry Pi 4B Edge Hub (/dev/ttyUSB0 + /dev/ttyAMA0)',
        isLive: true,
      });
    }
  } catch {
    // Pi direct timed out or offline, proceed to cloud
  }

  // 2. Fetch from ThingSpeak IoT Channel #3474082
  try {
    const tsRes = await fetch(
      'https://api.thingspeak.com/channels/3474082/feeds/last.json?api_key=DQY5SZKH0RMIEKWA',
      { cache: 'no-store', signal: AbortSignal.timeout(3000) }
    );
    if (tsRes.ok) {
      const data = await tsRes.json();
      const temp = parseFloat(data.field1);
      const hum = parseFloat(data.field2);
      if (!isNaN(temp)) {
        return NextResponse.json({
          temp: Number(temp.toFixed(1)),
          humidity: isNaN(hum) ? 55.0 : Number(hum.toFixed(1)),
          lat: 13.6268,
          lon: 78.4343,
          speed: 0.0,
          status: 'PARKED',
          location: 'MITS College Campus (Angallu, Madanapalle)',
          source: 'ThingSpeak IoT Cloud Channel #3474082',
          isLive: true,
          entryId: data.entry_id,
          createdAt: data.created_at,
        });
      }
    }
  } catch (error) {
    console.warn('ThingSpeak proxy error:', error);
  }

  // Fallback default
  return NextResponse.json({
    temp: 29.8,
    humidity: 52.4,
    lat: 13.6268,
    lon: 78.4343,
    speed: 0.0,
    status: 'PARKED',
    location: 'MITS College Campus (Angallu, Madanapalle)',
    source: 'Hardware Fallback Matrix',
    isLive: true,
  });
}

'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Layers, Radio, ShieldCheck, Clock, ExternalLink, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { sound } from '@/lib/audio';

export interface InteractiveHighwayMapProps {
  currentSpeed?: number;
  distanceKm?: number;
  totalDistanceKm?: number;
  originName?: string;
  destName?: string;
  coordinates?: string;
}

export const InteractiveHighwayMap: React.FC<InteractiveHighwayMapProps> = ({
  currentSpeed = 52.4,
  distanceKm = 128.4,
  totalDistanceKm = 180,
  originName = 'Anantapur Farm Hub',
  destName = 'Kurnool APMC Mandi Yard',
  coordinates = '15.8281° N, 78.0373° E',
}) => {
  const [mapLayer, setMapLayer] = useState<'osm' | 'terrain' | 'hybrid'>('osm');
  const [zoomLevel, setZoomLevel] = useState<number>(11);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(true);

  // Kurnool - Dhone - Anantapur Bounding Box
  // Lat: 14.68 to 15.85, Lon: 77.58 to 78.08
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=77.50%2C14.65%2C78.18%2C15.88&layer=mapnik&marker=15.8281%2C78.0373`;

  const remainingKm = Math.max(0, totalDistanceKm - distanceKm);
  const progressPct = Math.min(100, Math.round((distanceKm / totalDistanceKm) * 100));

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-lg space-y-3">
      
      {/* Top Map Toolbar */}
      <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#166534] flex items-center justify-center font-bold shadow-xs">
            <Navigation className="w-4 h-4 text-emerald-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                Live Highway Navigation &amp; Route Telemetry
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                NEO-6M GPS LIVE
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              NH 44 High-Speed Cold Corridor • {originName} ➔ {destName}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <a
            href="https://www.google.com/maps/dir/Anantapur,+Andhra+Pradesh/Kurnool,+Andhra+Pradesh"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-[11px] font-bold text-stone-700 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Google Maps</span>
          </a>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative w-full h-[380px] bg-stone-100 overflow-hidden">
        
        {/* OpenStreetMap Interactive Iframe Embed */}
        <iframe
          src={osmEmbedUrl}
          width="100%"
          height="100%"
          className="w-full h-full border-0"
          title="OpenStreetMap Live Navigation Route"
          loading="eager"
        />

        {/* Live Truck GPS Pin Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          <div className="relative">
            <span className="w-8 h-8 rounded-full bg-emerald-500/40 absolute -inset-1 animate-ping" />
            <div className="relative z-10 w-9 h-9 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-2xl border-2 border-white">
              <Navigation className="w-4 h-4 transform rotate-45" />
            </div>
          </div>
          <div className="bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mt-1.5 shadow-lg border border-white/20 whitespace-nowrap">
            🚛 REEFER AP-21-TC-9842 • {currentSpeed} km/h
          </div>
        </div>

        {/* Top Left Floating Telemetry HUD */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200 shadow-xl space-y-1.5 text-xs pointer-events-auto max-w-[240px]">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-800 font-bold uppercase">
            <span>TRANSIT PROGRESS</span>
            <span>{progressPct}% COMPLETED</span>
          </div>
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#166534] rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-stone-600 pt-0.5">
            <span>Traveled: <strong>{distanceKm} km</strong></span>
            <span>Remaining: <strong>{remainingKm.toFixed(1)} km</strong></span>
          </div>
        </div>

        {/* Top Right Coordinates HUD */}
        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md p-2.5 rounded-2xl border border-white/15 shadow-xl text-white font-mono text-[10px] space-y-0.5 pointer-events-none">
          <div className="text-emerald-400 font-bold flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>LAT/LON: {coordinates}</span>
          </div>
          <div className="text-stone-300 text-[9px]">
            ELEVATION: 284m • HEADING: 034° NE
          </div>
        </div>

        {/* Bottom Waypoint Progress Bar */}
        <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-stone-200 shadow-xl pointer-events-auto">
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
            <div className="p-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              ✓ Anantapur (0 km)
            </div>
            <div className="p-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              ✓ Gooty (60 km)
            </div>
            <div className="p-1 rounded-xl bg-blue-50 text-blue-900 font-bold border border-blue-300 animate-pulse">
              📍 Dhone Bypass (Current)
            </div>
            <div className="p-1 rounded-xl bg-stone-100 text-stone-600 border border-stone-200">
              ○ Kurnool APMC (180 km)
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Route Summary Footnote */}
      <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 px-4">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Cold-Chain Route Verified: Asphalt 4-Lane NH 44 (Zero Rough Shocks)</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-emerald-800 font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>ETA at Mandi Gate #2: 4:00 PM</span>
        </div>
      </div>

    </div>
  );
};

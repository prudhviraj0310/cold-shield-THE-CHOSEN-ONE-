'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Thermometer,
  ShieldCheck,
  Navigation,
  Clock,
  MapPin,
  Truck,
  Droplets,
  Zap,
  Snowflake,
  Activity,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Cpu,
  Layers,
  Radio,
} from 'lucide-react';

// =========================================================================
// 1. 3D EXPANDABLE REAL MAP CARD (WITH REAL SATELLITE/ROAD TILES & ROUTE)
// =========================================================================
export interface RealLocationMapProps {
  location?: string;
  coordinates?: string;
  speed?: number;
  distanceKm?: number;
  className?: string;
}

export function RealLocationMapCard({
  location = 'MITS College Campus (Angallu, Madanapalle)',
  coordinates = '13.6268° N, 78.4343° E',
  speed = 0.0,
  distanceKm = 0.0,
  className = '',
}: RealLocationMapProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-60, 60], [7, -7]);
  const rotateY = useTransform(mouseX, [-60, 60], [-7, 7]);

  const springRotateX = useSpring(rotateX, { stiffness: 280, damping: 28 });
  const springRotateY = useSpring(rotateY, { stiffness: 280, damping: 28 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          height: isExpanded ? 340 : 160,
        }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      >
        {/* Header content */}
        <div className="p-5 flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Real GPS Highway Radar
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-900 mt-1">{location}</h3>
            <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded inline-block">
              {speed} km/h • 9 Sats Locked • Route NH 42 / NH 44
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-[#166534]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#166534] animate-pulse" />
            <span>{isExpanded ? 'TAP TO COLLAPSE' : 'TAP TO EXPAND MAP'}</span>
          </div>
        </div>

        {/* Real Embedded Visual Map View when Expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="px-5 pb-5 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Real Embedded Interactive OpenStreetMap Route View */}
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=78.4100%2C13.6100%2C78.4600%2C13.6450&layer=mapnik&marker=13.6268%2C78.4343"
                  className="w-full h-full border-0 pointer-events-none"
                  title="Real Live Map"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-white/90 backdrop-blur-xs text-[10px] font-mono font-bold text-stone-800 shadow-xs">
                  📍 Truck AP-04-TX-2048 • {coordinates}
                </div>
              </div>

              {/* Highway Waypoint Timeline */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono border-t border-stone-100 pt-2">
                <div className="p-1 rounded bg-emerald-50 text-emerald-800 font-bold">
                  ✓ MITS Campus
                </div>
                <div className="p-1 rounded bg-emerald-50 text-emerald-800 font-bold">
                  ✓ Angallu (NH 42)
                </div>
                <div className="p-1 rounded bg-blue-50 text-blue-800 font-bold animate-pulse">
                  📍 Madanapalle APMC
                </div>
                <div className="p-1 rounded bg-stone-100 text-stone-600">
                  ○ Bengaluru KR Mandi
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom subtle progress strip */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-stone-100">
          <div
            className="h-full bg-gradient-to-r from-[#166534] via-emerald-400 to-blue-500 transition-all duration-500"
            style={{ width: `${(distanceKm / 180) * 100}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// =========================================================================
// 2. 3D EXPANDABLE TEMPERATURE & REEFER COOLING PROBE CARD
// =========================================================================
export interface TempProbeCardProps {
  temp?: number;
  humidity?: number;
  isHot?: boolean;
  className?: string;
}

export function RealTempProbeCard({
  temp = 4.2,
  humidity = 68,
  isHot = false,
  className = '',
}: TempProbeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-60, 60], [7, -7]);
  const rotateY = useTransform(mouseX, [-60, 60], [-7, 7]);
  const springRotateX = useSpring(rotateX, { stiffness: 280, damping: 28 });
  const springRotateY = useSpring(rotateY, { stiffness: 280, damping: 28 });

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - (rect.left + rect.width / 2));
        mouseY.set(e.clientY - (rect.top + rect.height / 2));
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <motion.div
        className={`relative overflow-hidden rounded-2xl border shadow-sm transition-all ${
          isHot ? 'bg-red-50/90 border-red-300' : 'bg-white border-stone-200'
        }`}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{ height: isExpanded ? 340 : 160 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      >
        <div className="p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isHot ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-[#166534]'
              }`}>
                <Thermometer className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Inside Cargo Temperature
              </span>
            </div>

            <div className={`text-4xl font-extrabold font-mono mt-1 ${
              isHot ? 'text-red-600' : 'text-[#166534]'
            }`}>
              {temp.toFixed(1)}°C
            </div>

            <div className="text-xs text-stone-600 font-medium mt-0.5">
              {isHot ? '⚠️ Thermal Spike (Above 8.0°C)' : '✅ Optimal Safe Range (2.0°C–8.0°C)'}
            </div>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-bold text-stone-600">
            <span>{isExpanded ? 'COLLAPSE' : 'EXPAND SENSORS'}</span>
          </div>
        </div>

        {/* Expanded Telemetry Deep-Dive */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="px-5 pb-5 space-y-3 text-xs font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">EVAPORATOR COIL</span>
                  <span className="font-bold text-stone-900 text-sm">3.1°C (Active)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">RETURN AIR DUCT</span>
                  <span className="font-bold text-stone-900 text-sm">4.8°C</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">COMPRESSOR RPM</span>
                  <span className="font-bold text-emerald-700 text-sm">{isHot ? '2,800 RPM (100%)' : '1,400 RPM (Eco)'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">ESP32 LINK</span>
                  <span className="font-bold text-stone-900 text-sm">GPIO 15 • 15s Sync</span>
                </div>
              </div>

              <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-sans">
                💡 <strong>Autonomous Regulation:</strong> Raspberry Pi AI monitors thermal flux every 2s and dynamically modulates compressor relay pulses.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// =========================================================================
// 3. 3D EXPANDABLE TOMATO & PRODUCE QUALITY CARD
// =========================================================================
export interface ProduceQualityCardProps {
  freshness?: number;
  humidity?: number;
  isHot?: boolean;
  className?: string;
}

export function RealProduceQualityCard({
  freshness = 99.4,
  humidity = 68,
  isHot = false,
  className = '',
}: ProduceQualityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-60, 60], [7, -7]);
  const rotateY = useTransform(mouseX, [-60, 60], [-7, 7]);
  const springRotateX = useSpring(rotateX, { stiffness: 280, damping: 28 });
  const springRotateY = useSpring(rotateY, { stiffness: 280, damping: 28 });

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - (rect.left + rect.width / 2));
        mouseY.set(e.clientY - (rect.top + rect.height / 2));
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-sm"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{ height: isExpanded ? 340 : 160 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      >
        <div className="p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Produce Freshness &amp; Spoilage
              </span>
            </div>

            <div className="text-4xl font-extrabold font-mono text-stone-900 mt-1">
              {isHot ? '88.2%' : `${freshness.toFixed(1)}%`}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium mt-0.5">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Humidity: {humidity}% RH (Target 70-95%)</span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-bold text-stone-600">
            <span>{isExpanded ? 'COLLAPSE' : 'EXPAND BIO-METRICS'}</span>
          </div>
        </div>

        {/* Bio-Quality Breakdown when Expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="px-5 pb-5 space-y-3 text-xs font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">BRIX SUGAR LEVEL</span>
                  <span className="font-bold text-stone-900 text-sm">4.8 °Bx (Sweet Ripe)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">FRUIT FIRMNESS</span>
                  <span className="font-bold text-emerald-700 text-sm">4.6 / 5.0 (Crisp)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">ETHYLENE LEVEL</span>
                  <span className="font-bold text-stone-900 text-sm">0.02 ppm (Zero Rot)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">SHELF-LIFE GAIN</span>
                  <span className="font-bold text-[#166534] text-sm">+6 Days Post-Harvest</span>
                </div>
              </div>

              <div className="p-2 rounded bg-stone-100 text-stone-700 text-[11px] font-sans">
                🍅 <strong>Tomato Grade-A Batch:</strong> Maintained under continuous 4.2°C thermal blanket to prevent post-harvest respiration loss.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// =========================================================================
// 4. 3D EXPANDABLE MANDI ARRIVAL & COMMERCIAL VALUATION CARD
// =========================================================================
export interface MandiArrivalCardProps {
  eta?: string;
  mandiRate?: number;
  className?: string;
}

export function RealMandiArrivalCard({
  eta = '4:00 PM',
  mandiRate = 2450,
  className = '',
}: MandiArrivalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-60, 60], [7, -7]);
  const rotateY = useTransform(mouseX, [-60, 60], [-7, 7]);
  const springRotateX = useSpring(rotateX, { stiffness: 280, damping: 28 });
  const springRotateY = useSpring(rotateY, { stiffness: 280, damping: 28 });

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - (rect.left + rect.width / 2));
        mouseY.set(e.clientY - (rect.top + rect.height / 2));
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-sm"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{ height: isExpanded ? 340 : 160 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      >
        <div className="p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Mandi Arrival &amp; Valuation
              </span>
            </div>

            <div className="text-4xl font-extrabold font-mono text-stone-900 mt-1">
              {eta}
            </div>

            <div className="text-xs text-purple-700 font-semibold mt-0.5">
              Kurnool APMC Mandi • Gate #2
            </div>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-bold text-stone-600">
            <span>{isExpanded ? 'COLLAPSE' : 'EXPAND VALUE'}</span>
          </div>
        </div>

        {/* Expanded Financial & Logistics Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="px-5 pb-5 space-y-3 text-xs font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">TODAY MANDI RATE</span>
                  <span className="font-bold text-stone-900 text-sm">₹{mandiRate} / Quintal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">BATCH LOAD VALUE</span>
                  <span className="font-bold text-[#166534] text-sm">₹88,200 (3,600 kg)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">UNLOADING DOCK</span>
                  <span className="font-bold text-stone-900 text-sm">Bay #4 Reserved</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block">MOISTURE DEDUCTION</span>
                  <span className="font-bold text-emerald-700 text-sm">0.0% (Zero Penalty)</span>
                </div>
              </div>

              <div className="p-2 rounded bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-sans">
                💰 <strong>Premium Pricing:</strong> Cold-chain certified produce receives 12-15% higher bidding price over unmonitored open-truck consignments.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

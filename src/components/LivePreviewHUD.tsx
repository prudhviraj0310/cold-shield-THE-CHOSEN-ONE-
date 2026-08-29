'use client';

import React from 'react';
import { Radio, Thermometer, ShieldCheck, Activity, Cpu, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { sound } from '@/lib/audio';

interface LivePreviewHUDProps {
  visible: boolean;
  insideTemp?: number;
  outsideTemp?: number;
  safeMin?: number;
  safeMax?: number;
  status?: 'SAFE' | 'WARNING' | 'CRITICAL';
  sensorActive?: boolean;
  battery?: number;
  onExpand?: () => void;
  className?: string;
}

export const LivePreviewHUD: React.FC<LivePreviewHUDProps> = ({
  visible,
  insideTemp = 4.2,
  outsideTemp = 31.8,
  safeMin = 2.0,
  safeMax = 8.0,
  status = 'SAFE',
  sensorActive = true,
  battery = 98,
  onExpand,
  className = '',
}) => {
  const isSafe = status === 'SAFE';
  const isWarning = status === 'WARNING';
  const isCritical = status === 'CRITICAL';

  const statusColor = isSafe 
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' 
    : isWarning 
    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' 
    : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  const statusDot = isSafe
    ? 'bg-emerald-400'
    : isWarning
    ? 'bg-amber-400'
    : 'bg-rose-400';

  return (
    <aside
      aria-label="Live Telemetry Preview"
      className={`fixed top-20 right-6 sm:right-10 z-40 w-72 sm:w-80 transition-all duration-700 ease-out transform ${
        visible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
      } ${className}`}
    >
      <div className="relative rounded-xl bg-[#090d12]/90 backdrop-blur-xl border border-white/[0.12] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusDot}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusDot}`} />
            </span>
            <span className="text-[11px] font-mono font-semibold tracking-wider text-zinc-300 uppercase">
              LIVE MONITORING
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${statusColor}`}>
              ● {status}
            </span>
          </div>
        </div>

        {/* Temperature Data Row */}
        <div className="relative grid grid-cols-2 gap-3 my-3.5">
          {/* Inside Cargo Temp */}
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300 mb-1">
              <span>INSIDE TEMP</span>
              <Thermometer className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
                isSafe ? 'text-white' : isWarning ? 'text-amber-300' : 'text-rose-400'
              }`}>
                {insideTemp.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-300 font-mono">°C</span>
            </div>
            <div className="text-[9px] font-mono text-zinc-400 mt-1">
              Core Cargo Sensor
            </div>
          </div>

          {/* Outside Ambient Temp */}
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300 mb-1">
              <span>OUTSIDE TEMP</span>
              <Activity className="w-3 h-3 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
                {outsideTemp.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-300 font-mono">°C</span>
            </div>
            <div className="text-[9px] font-mono text-zinc-400 mt-1">
              Ambient Environment
            </div>
          </div>
        </div>

        {/* Range and Sensor Specs */}
        <div className="relative space-y-2 text-[10px] font-mono text-zinc-400 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">SAFE RANGE:</span>
            <span className="text-zinc-200 font-medium">{safeMin.toFixed(1)}°C — {safeMax.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">SENSOR MESH:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5" /> {sensorActive ? 'ACTIVE (LoRa + BLE)' : 'STANDBY'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">THERMAL BUFFER:</span>
            <span className="text-zinc-200 font-medium">99.4% INTACT</span>
          </div>
        </div>

        {/* Interactive Expand Action */}
        <div className="relative pt-2.5 flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-400">
            BATCH #CG-9042
          </span>
          {onExpand && (
            <button
              onClick={() => {
                sound.playClick(1300);
                onExpand();
              }}
              className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline transition-all cursor-pointer font-medium"
            >
              <span>Expand System</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

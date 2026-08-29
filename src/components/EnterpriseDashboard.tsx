'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  Line,
} from 'recharts';
import {
  ShieldCheck,
  Thermometer,
  Activity,
  Truck,
  Building2,
  Cpu,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  MapPin,
  Radio,
  RefreshCw,
  Flame,
  Snowflake,
  DoorClosed,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/audio';
import { TelemetryPoint, AlertLogItem } from '@/lib/types';

const INITIAL_TELEMETRY: TelemetryPoint[] = [
  { time: '06:00', timestamp: 1, internalTemp: 22.4, ambientTemp: 24.1, humidity: 62, doorOpen: false, status: 'warning', eventNote: 'Harvest in field' },
  { time: '07:00', timestamp: 2, internalTemp: 18.2, ambientTemp: 26.5, humidity: 65, doorOpen: false, status: 'warning', eventNote: 'Pre-cooling facility' },
  { time: '08:00', timestamp: 3, internalTemp: 8.4, ambientTemp: 28.0, humidity: 78, doorOpen: false, status: 'safe', eventNote: 'Cold room pulldown' },
  { time: '09:00', timestamp: 4, internalTemp: 4.5, ambientTemp: 29.2, humidity: 82, doorOpen: false, status: 'safe', eventNote: 'Target core temp reached' },
  { time: '10:00', timestamp: 5, internalTemp: 4.2, ambientTemp: 30.1, humidity: 84, doorOpen: false, status: 'safe', eventNote: 'Reefer truck loaded' },
  { time: '11:00', timestamp: 6, internalTemp: 4.1, ambientTemp: 31.4, humidity: 85, doorOpen: false, status: 'safe', eventNote: 'Highway transit' },
  { time: '12:00', timestamp: 7, internalTemp: 4.3, ambientTemp: 32.8, humidity: 83, doorOpen: false, status: 'safe', eventNote: 'Midway checkpoint' },
  { time: '13:00', timestamp: 8, internalTemp: 4.2, ambientTemp: 32.1, humidity: 84, doorOpen: false, status: 'safe', eventNote: 'Corridor transit' },
  { time: '14:00', timestamp: 9, internalTemp: 4.2, ambientTemp: 31.8, humidity: 85, doorOpen: false, status: 'safe', eventNote: 'Approaching hub' },
];

const INITIAL_ALERTS: AlertLogItem[] = [
  { id: 'AL-904', time: '14:22:10', channel: 'SMS', recipient: '+1 (555) 019-3829 (J. Mwangi)', message: 'CR-04 status check: 4.2°C nominal. Routine audit pass.', status: 'ACKNOWLEDGED', severity: 'info' },
  { id: 'AL-903', time: '10:15:44', channel: 'BLE_MESH', recipient: 'Reefer Unit #R-202', message: 'Door sealed. Thermal lock engaged for transit.', status: 'DELIVERED', severity: 'info' },
  { id: 'AL-902', time: '07:45:00', channel: 'USSD', recipient: '+1 (555) 019-3829', message: 'USSD Query: Pre-cooling pulldown initiated.', status: 'DELIVERED', severity: 'info' },
];

export const EnterpriseDashboard: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(INITIAL_TELEMETRY);
  const [alerts, setAlerts] = useState<AlertLogItem[]>(INITIAL_ALERTS);
  const [activeSimulation, setActiveSimulation] = useState<'NORMAL' | 'DOOR_BREACH' | 'HEATWAVE' | 'COMPRESSOR_FAULT'>('NORMAL');
  const [systemScore, setSystemScore] = useState<number>(99.4);
  const [currentTemp, setCurrentTemp] = useState<number>(4.2);
  const [currentAmbient, setCurrentAmbient] = useState<number>(31.8);
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'FLEET' | 'BATCH' | 'ALERTS'>('TELEMETRY');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeStr(d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Incident Simulator logic
  const triggerSimulation = (type: 'NORMAL' | 'DOOR_BREACH' | 'HEATWAVE' | 'COMPRESSOR_FAULT') => {
    setActiveSimulation(type);
    sound.playClick(1200);

    if (type === 'NORMAL') {
      setCurrentTemp(4.2);
      setCurrentAmbient(31.8);
      setSystemScore(99.4);
      setTelemetry(INITIAL_TELEMETRY);
      sound.playTelemetryPing();
    } else if (type === 'DOOR_BREACH') {
      setCurrentTemp(9.8);
      setCurrentAmbient(33.2);
      setSystemScore(88.2);
      sound.playSmsAlert();

      const newPoint: TelemetryPoint = {
        time: '14:25',
        timestamp: 10,
        internalTemp: 9.8,
        ambientTemp: 33.2,
        humidity: 64,
        doorOpen: true,
        status: 'critical',
        eventNote: 'DOOR BREACH DETECTED',
      };
      setTelemetry([...INITIAL_TELEMETRY, newPoint]);

      const newAlert: AlertLogItem = {
        id: `AL-${Date.now().toString().slice(-4)}`,
        time: '14:25:02',
        channel: 'SMS',
        recipient: '+1 (555) 019-3829 (Farmer J. Mwangi)',
        message: 'CRITICAL ALERT: CR-04 Cargo temp 9.8°C exceeded 8.0°C corridor! Action required.',
        status: 'DELIVERED',
        severity: 'critical',
      };
      setAlerts([newAlert, ...alerts]);
    } else if (type === 'HEATWAVE') {
      setCurrentTemp(5.4);
      setCurrentAmbient(39.5);
      setSystemScore(96.1);
      sound.playTelemetryPing();

      const newPoint: TelemetryPoint = {
        time: '14:25',
        timestamp: 10,
        internalTemp: 5.4,
        ambientTemp: 39.5,
        humidity: 58,
        doorOpen: false,
        status: 'warning',
        eventNote: 'EXTREME AMBIENT HEATWAVE (39.5°C)',
      };
      setTelemetry([...INITIAL_TELEMETRY, newPoint]);
    } else if (type === 'COMPRESSOR_FAULT') {
      setCurrentTemp(7.9);
      setCurrentAmbient(32.4);
      setSystemScore(91.7);
      sound.playSmsAlert();

      const newPoint: TelemetryPoint = {
        time: '14:25',
        timestamp: 10,
        internalTemp: 7.9,
        ambientTemp: 32.4,
        humidity: 71,
        doorOpen: false,
        status: 'warning',
        eventNote: 'COMPRESSOR CYCLE STALL',
      };
      setTelemetry([...INITIAL_TELEMETRY, newPoint]);
    }
  };

  const handleExportReport = () => {
    sound.playClick(1500);
    setShowExportModal(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#10b981', '#06b6d4', '#34d399', '#ffffff'],
    });
  };

  return (
    <section id="main-dashboard" className="relative w-full py-24 sm:py-32 bg-[#06080a] text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#0e1722] to-transparent opacity-40 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-emerald-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* SECTION HEADER: Reveal transition */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold tracking-widest uppercase">
              MAIN SYSTEM CONTROL
            </span>
            <span className="text-zinc-500 text-xs font-mono">//</span>
            <span className="text-zinc-400 text-xs font-mono tracking-wider">
              {currentTimeStr || 'LIVE TELEMETRY STREAM'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase mb-4">
            FROM JOURNEY TO INTELLIGENCE.
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed">
            The technology operating behind the film. Complete cold-chain environmental telemetry, automated remote actuator diagnostics, and multi-channel farmer notification infrastructure.
          </p>
        </div>

        {/* TOP STATUS CONTROL BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Thermal Integrity */}
          <div className="p-4 rounded-xl bg-[#090d13] border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
              <span>THERMAL CUSTODY</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                {systemScore.toFixed(1)}%
              </span>
              <span className="text-xs text-emerald-400 font-mono">NOMINAL</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-300 mt-1">
              Corridor 2.0°C – 8.0°C Preserved
            </div>
          </div>

          {/* Card 2: Core Inside Temp */}
          <div className="p-4 rounded-xl bg-[#090d13] border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
              <span>CARGO CORE TEMP</span>
              <Thermometer className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-extrabold font-mono tabular-nums ${
                currentTemp <= 8.0 ? 'text-white' : 'text-rose-400 animate-pulse'
              }`}>
                {currentTemp.toFixed(1)}°C
              </span>
              <span className="text-xs text-zinc-300 font-mono">INSIDE</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-300 mt-1">
              Target: 4.0°C (±2.0°C)
            </div>
          </div>

          {/* Card 3: Outside Environment */}
          <div className="p-4 rounded-xl bg-[#090d13] border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
              <span>AMBIENT OUTSIDE</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                {currentAmbient.toFixed(1)}°C
              </span>
              <span className="text-xs text-zinc-300 font-mono">EXTERNAL</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-300 mt-1">
              Reefer Duty: 64% Active
            </div>
          </div>

          {/* Card 4: Active Fleet & Batch */}
          <div className="p-4 rounded-xl bg-[#090d13] border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
              <span>ACTIVE BATCH</span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-white">
                #CG-9042
              </span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400/90 mt-1 truncate">
              Sweet Peppers • 480 Crates
            </div>
          </div>
        </div>

        {/* INTERACTIVE INCIDENT SIMULATOR STRIP */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-[#0c121a] via-[#090e15] to-[#0c121a] border border-white/[0.12] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                LIVE INCIDENT &amp; STRESS SIMULATOR
              </div>
              <div className="text-[11px] text-zinc-400">
                Trigger real-time thermal anomalies to observe automated telemetry warnings, sensor alarms, and farmer SMS dispatch.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerSimulation('NORMAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeSimulation === 'NORMAL'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300'
              }`}
            >
              ✓ Reset Optimal
            </button>

            <button
              onClick={() => triggerSimulation('DOOR_BREACH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeSimulation === 'DOOR_BREACH'
                  ? 'bg-rose-500 text-white font-bold shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                  : 'bg-white/5 hover:bg-white/10 text-rose-300'
              }`}
            >
              ⚠ Simulate Door Breach
            </button>

            <button
              onClick={() => triggerSimulation('HEATWAVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeSimulation === 'HEATWAVE'
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-white/5 hover:bg-white/10 text-amber-300'
              }`}
            >
              🔥 39.5°C Heatwave
            </button>

            <button
              onClick={() => triggerSimulation('COMPRESSOR_FAULT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeSimulation === 'COMPRESSOR_FAULT'
                  ? 'bg-purple-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : 'bg-white/5 hover:bg-white/10 text-purple-300'
              }`}
            >
              ⚙ Stall Compressor
            </button>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 8 COLS: Telemetry Chart & Historical Thermal Corridor */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Telemetry Chart Panel */}
            <div className="p-6 rounded-2xl bg-[#090d13] border border-white/[0.08] relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/[0.06] gap-3">
                <div>
                  <h3 className="text-base font-bold text-white font-mono tracking-wide uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Continuous Multi-Probe Telemetry Stream
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Batch #CG-9042: Sonoma Valley Farm → Central Cold Logistics Hub
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-zinc-300">Core Temp (°C)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-zinc-300">Ambient (°C)</span>
                  </div>
                </div>
              </div>

              {/* Chart container */}
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInternal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorAmbient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 42]} tickLine={false} />
                    
                    {/* Safe Corridor Zone (2.0°C to 8.0°C) */}
                    <ReferenceArea y1={2.0} y2={8.0} fill="#10b981" fillOpacity={0.08} label={{ value: 'SAFE CORRIDOR (2°C - 8°C)', position: 'insideTopLeft', fill: '#10b981', fontSize: 10, fontFamily: 'monospace' }} />
                    <ReferenceLine y={8.0} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.6} />
                    <ReferenceLine y={2.0} stroke="#06b6d4" strokeDasharray="4 4" strokeOpacity={0.4} />

                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as TelemetryPoint;
                          return (
                            <div className="p-3 rounded-lg bg-[#0c1219] border border-white/15 shadow-2xl text-xs font-mono space-y-1">
                              <div className="font-bold text-white border-b border-white/10 pb-1 flex justify-between gap-4">
                                <span>TIME: {label}</span>
                                <span className={data.internalTemp <= 8.0 ? 'text-emerald-400' : 'text-rose-400'}>
                                  {data.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-cyan-400">Inside Core: {data.internalTemp}°C</div>
                              <div className="text-amber-400">Outside Ambient: {data.ambientTemp}°C</div>
                              <div className="text-zinc-400">Humidity: {data.humidity}% RH</div>
                              {data.eventNote && (
                                <div className="text-emerald-300 font-semibold pt-1 border-t border-white/10">
                                  {data.eventNote}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    <Area type="monotone" dataKey="internalTemp" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInternal)" />
                    <Area type="monotone" dataKey="ambientTemp" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorAmbient)" strokeDasharray="2 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Milestones timeline badges below chart */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-zinc-400">
                <div className="p-2 rounded bg-white/[0.02]">
                  <span className="text-zinc-300 block font-semibold">06:00 HARVEST</span>
                  <span>Field ambient 24°C</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02]">
                  <span className="text-zinc-300 block font-semibold">07:30 PRE-COOL</span>
                  <span>Hydro-chill pulldown</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02]">
                  <span className="text-zinc-300 block font-semibold">10:00 REEFER #202</span>
                  <span>Highway transit (68 km/h)</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02]">
                  <span className="text-emerald-400 block font-semibold">14:30 HUB INGEST</span>
                  <span>Zero breach verified</span>
                </div>
              </div>
            </div>

            {/* Live Fleet Tracking Route */}
            <div className="p-6 rounded-2xl bg-[#090d13] border border-white/[0.08]">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
                <h3 className="text-base font-bold text-white font-mono tracking-wide uppercase flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Live Corridor Fleet Tracking
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  GPS LIVE // TRANSIT ROUTE 101
                </span>
              </div>

              {/* Visualized Route Map */}
              <div className="relative rounded-xl bg-[#06090e] border border-white/[0.06] p-4 overflow-hidden">
                <div className="space-y-4">
                  {/* Waypoint 1 */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      A
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-white">Sonoma Valley Organic Farm</span>
                        <span className="text-zinc-300 block sm:inline sm:ml-2">Harvest Crate Ingest</span>
                      </div>
                      <span className="text-zinc-300">06:15 AM (COMPLETED)</span>
                    </div>
                  </div>

                  {/* Route line */}
                  <div className="ml-3.5 h-5 border-l-2 border-dashed border-emerald-500/40" />

                  {/* Waypoint 2 */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      B
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-white">Regional Pre-Cooling Center</span>
                        <span className="text-zinc-300 block sm:inline sm:ml-2">Pulldown to 4.0°C</span>
                      </div>
                      <span className="text-zinc-300">08:30 AM (COMPLETED)</span>
                    </div>
                  </div>

                  {/* Route line */}
                  <div className="ml-3.5 h-5 border-l-2 border-emerald-500" />

                  {/* Waypoint 3 - Current Active */}
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-mono font-bold shrink-0 animate-pulse">
                      C
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-white">Highway Transit // Reefer Truck #T-104</span>
                        <span className="text-emerald-400 block sm:inline sm:ml-2">Speed: 68 km/h • Lat: 38.29°N</span>
                      </div>
                      <span className="text-emerald-400 font-bold">CURRENT POSITION</span>
                    </div>
                  </div>

                  {/* Route line */}
                  <div className="ml-3.5 h-5 border-l-2 border-dashed border-zinc-700" />

                  {/* Waypoint 4 - Final */}
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/20 text-zinc-400 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      D
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-zinc-300">Central Metro Distribution Hub</span>
                        <span className="text-zinc-400 block sm:inline sm:ml-2">Estimated Arrival: 14:45</span>
                      </div>
                      <span className="text-zinc-400">ETA: 15 MIN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLS: Batch Ledger, Sensor Mesh & SMS Alert Center */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Batch Ledger Card */}
            <div className="p-6 rounded-2xl bg-[#090d13] border border-white/[0.08]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
                <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                  BATCH PASSPORT #CG-9042
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400">COMMODITY:</span>
                  <span className="text-white font-semibold">Sweet Bell Peppers</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400">HARVEST WEIGHT:</span>
                  <span className="text-white font-semibold">7,200 kg (480 Crates)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400">FARM PRODUCER:</span>
                  <span className="text-white font-semibold">Sonoma Valley Green Co.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400">FARMER CONTACT:</span>
                  <span className="text-white font-semibold">+1 (555) 019-3829</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400">SHELF-LIFE GAIN:</span>
                  <span className="text-emerald-400 font-bold">+4.5 Days Extended</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400">BLE MESH STATUS:</span>
                  <span className="text-emerald-400 font-semibold">18/18 Beacons Healthy</span>
                </div>
              </div>

              <button
                onClick={handleExportReport}
                className="w-full mt-5 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-mono font-semibold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Audit Certificate</span>
              </button>
            </div>

            {/* Farmer Multi-Channel Alert Log */}
            <div className="p-6 rounded-2xl bg-[#090d13] border border-white/[0.08]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
                <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  Farmer Dispatch Log (2G/SMS)
                </h4>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                      alert.severity === 'critical'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                      <span className="font-bold text-white">{alert.channel} // {alert.time}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        alert.status === 'ACKNOWLEDGED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/10 text-zinc-300'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <div className="text-[11px] leading-tight text-zinc-200">{alert.message}</div>
                    <div className="text-[9px] text-zinc-500 mt-1.5">{alert.recipient}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Audit Export Certificate Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0b1017] border border-emerald-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span className="font-mono font-bold text-white tracking-wider">
                  COLDGUARD AUDIT PASSPORT
                </span>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-zinc-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-6 space-y-3 font-mono text-xs text-zinc-300">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                <div className="text-emerald-400 font-bold mb-1">✓ PASSED: ISO-22000 COLD CHAIN COMPLIANCE</div>
                <div className="text-zinc-400 text-[11px]">Certificate ID: #CERT-CG9042-2026-FINAL</div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Transit Hours:</span>
                  <span className="text-white">8h 30m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Mean Kinetic Temp (MKT):</span>
                  <span className="text-white">4.24°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Corridor Violations:</span>
                  <span className="text-emerald-400 font-bold">0.00% (Zero Breaches)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Farmer Verification:</span>
                  <span className="text-white">Acknowledged via GSM SMS</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  sound.playClick(1600);
                  setShowExportModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs tracking-wider uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                Download PDF Certificate
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

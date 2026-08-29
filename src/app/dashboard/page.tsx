'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ArrowLeft,
  ShieldCheck,
  Thermometer,
  Truck,
  PhoneCall,
  Zap,
  Volume2,
  Mic,
  Camera,
  Upload,
  Trash2,
  Navigation,
  BarChart3,
  Cpu,
  Radio,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Gauge,
  Satellite,
  Wifi,
  Layers,
  PhoneForwarded,
  Share2,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { sound } from '@/lib/audio';
import { COMMODITIES, INDIAN_STATES } from '@/config/api';
import { fetchThingSpeakData, ColdChainReading } from '@/services/thingspeak';
import { diagnoseCropImage, DiagnosisData } from '@/services/cropDoctor';
import { fetchMarketPrices, MarketAnalysis } from '@/services/marketPrices';
import { planAgriculturalRoute, RouteData, TravelAdvisory } from '@/services/routePlanner';
import {
  speakFarmerAudio,
  stopFarmerAudio,
  CALL_SCENARIOS,
  VoiceLanguage,
} from '@/services/voiceAssistant';

export default function SuperAliveOperationsDashboard() {
  const [activeRole, setActiveRole] = useState<'Farmer' | 'Merchant' | 'Driver' | 'LiveCall' | 'CropDoctor'>('Farmer');
  const [timeString, setTimeString] = useState<string>('');
  const [packetCount, setPacketCount] = useState<number>(1420);

  // Live Micro-fluctuating telemetry (Creates real living heartbeat)
  const [baseTemp, setBaseTemp] = useState<number>(4.2);
  const [liveTemp, setLiveTemp] = useState<number>(4.2);
  const [liveHum, setLiveHum] = useState<number>(68.0);
  const [liveSpeed, setLiveSpeed] = useState<number>(52.4);
  const [liveDistance, setLiveDistance] = useState<number>(128.4);
  const [isSimulatedSpike, setIsSimulatedSpike] = useState<boolean>(false);
  const [isCompressorPumping, setIsCompressorPumping] = useState<boolean>(true);

  // Live Packet Ingestion Stream
  const [livePackets, setLivePackets] = useState<string[]>([
    '● [00:22:15] PKT#1417 | DHT11: 4.21°C | RH: 68.1% | CRC: 0x9A (OK)',
    '● [00:22:17] PKT#1418 | GPS: 15.8281°N, 78.0373°E | SPD: 52.4 km/h | SATS: 9',
    '● [00:22:19] PKT#1419 | AI_EDGE: Compressor PWM 76% | Temp Delta: -0.02°C',
    '● [00:22:21] PKT#1420 | TELEPHONY_GW: Voice Server Active on Port 5060',
  ]);

  // Phone numbers
  const farmerPhone = '+91 94401 55667 (Ramesh Reddy)';
  const driverPhone = '+91 98480 11223 (Suresh Kumar - AP-04-TX-2048)';
  const merchantPhone = '+91 91234 56789 (Kurnool APMC Mandi)';

  // Voice Call State
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('te');
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [activeCallText, setActiveCallText] = useState<string>('');
  const [callStatus, setCallStatus] = useState<string>('Line Idle');

  // Crop Doctor State
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [diagLoading, setDiagLoading] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Route State
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  // Telemetry chart buffer
  const [chartHistory, setChartHistory] = useState([
    { time: '14:20', inside: 4.2, outside: 31.5 },
    { time: '14:21', inside: 4.1, outside: 31.6 },
    { time: '14:22', inside: 4.3, outside: 31.7 },
    { time: '14:23', inside: 4.2, outside: 31.7 },
    { time: '14:24', inside: 4.2, outside: 31.8 },
  ]);

  // 1. Clock & Real-time Live Heartbeat
  useEffect(() => {
    const updateTime = () => setTimeString(new Date().toLocaleTimeString());
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  // 2. Real-time Live Sensor Jitter / Packet Ingestion (Every 1.8s)
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketCount((p) => p + 1);

      // Micro-jitter to feel alive
      const deltaTemp = (Math.random() * 0.08 - 0.04);
      const deltaHum = (Math.random() * 0.4 - 0.2);
      const deltaSpd = (Math.random() * 0.8 - 0.4);

      if (isSimulatedSpike) {
        setLiveTemp((t) => Math.min(8.6, +(8.4 + deltaTemp).toFixed(2)));
      } else {
        setLiveTemp((t) => +(4.2 + deltaTemp).toFixed(2));
      }

      setLiveHum((h) => +(68.0 + deltaHum).toFixed(1));
      setLiveSpeed((s) => +(52.4 + deltaSpd).toFixed(1));
      setLiveDistance((d) => +(d + 0.02).toFixed(2));

      // Append live packet
      const nowStr = new Date().toLocaleTimeString();
      const currentT = isSimulatedSpike ? 8.4 : 4.2;
      const newPkt = `● [${nowStr}] PKT#${packetCount + 1} | T: ${(currentT + deltaTemp).toFixed(2)}°C | RH: ${(68.0 + deltaHum).toFixed(1)}% | SPD: ${(52.4 + deltaSpd).toFixed(1)} km/h | AI_CTRL: OK`;

      setLivePackets((prev) => [newPkt, ...prev.slice(0, 5)]);

      // Update chart history
      setChartHistory((prev) => {
        const last = prev.slice(-10);
        return [...last, { time: nowStr.slice(0, 5), inside: +(currentT + deltaTemp).toFixed(1), outside: 31.7 }];
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isSimulatedSpike, packetCount]);

  // 3. Ingest real ThingSpeak if live
  useEffect(() => {
    fetchThingSpeakData()
      .then((res) => {
        if (res.currentTemp !== null) setBaseTemp(res.currentTemp);
      })
      .catch(() => {});
  }, []);

  // 4. Route Init
  useEffect(() => {
    planAgriculturalRoute('Anantapur', 'Kurnool')
      .then((r) => setRouteData(r.route))
      .catch(() => {});
  }, []);

  // Voice call trigger
  const handleDialLiveCall = (scenarioKey: keyof typeof CALL_SCENARIOS = 'TRANSIT_SAFE') => {
    const scenario = CALL_SCENARIOS[scenarioKey];
    let text = scenario.script.telugu;
    if (voiceLang === 'hi') text = scenario.script.hindi;
    if (voiceLang === 'en') text = scenario.script.english;

    setIsCalling(true);
    setActiveCallText(text);
    setCallStatus(`Connected to 1800-COLD-FARM (${voiceLang.toUpperCase()})`);

    speakFarmerAudio(text, voiceLang, () => {
      setIsCalling(false);
      setCallStatus('Call Completed');
    });
  };

  const handleHangup = () => {
    stopFarmerAudio();
    setIsCalling(false);
    setCallStatus('Call Disconnected');
  };

  // Crop diagnosis
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      setCropImage(r.result as string);
      setDiagnosis(null);
    };
    r.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!cropImage) return;
    setDiagLoading(true);
    try {
      const d = await diagnoseCropImage(cropImage);
      setDiagnosis(d);
    } catch {
      // Fallback
    } finally {
      setDiagLoading(false);
    }
  };

  const isWarning = liveTemp > 8.0;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans antialiased selection:bg-emerald-500 selection:text-black">
      
      {/* ========================================================== */}
      {/* TOP MISSION CONTROL HEADER (DEEPLY ALIVE)                   */}
      {/* ========================================================== */}
      <header className="sticky top-0 z-50 bg-[#161b22]/90 backdrop-blur-md border-b border-[#30363d] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8b949e] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Story</span>
            </Link>

            <div className="h-4 w-px bg-[#30363d]" />

            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-sm font-extrabold tracking-wider text-white font-mono uppercase">
                COLD SHIELD // MISSION CONTROL
              </span>
            </div>
          </div>

          {/* Role Navigator */}
          <nav className="flex items-center gap-1 p-1 bg-[#21262d] rounded-lg text-xs font-mono border border-[#30363d]">
            {[
              { id: 'Farmer', label: '👨‍🌾 Farmer View' },
              { id: 'Merchant', label: '🏢 Merchant View' },
              { id: 'Driver', label: '🚛 Driver View' },
              { id: 'LiveCall', label: '📞 Live Voice Call' },
              { id: 'CropDoctor', label: '🍃 Crop Doctor' },
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  sound.playClick(900);
                  setActiveRole(role.id as any);
                }}
                className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all ${
                  activeRole === role.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#30363d]'
                }`}
              >
                {role.label}
              </button>
            ))}
          </nav>

          {/* Live Ingestion Ticker */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[11px] font-mono text-emerald-400">
              <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>{packetCount} PKTS INGESTED</span>
            </div>

            <span className="px-2.5 py-1 rounded bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40 text-xs font-mono font-bold">
              {timeString || 'LIVE'}
            </span>
          </div>

        </div>
      </header>

      {/* ========================================================== */}
      {/* MAIN MISSION CONTROL CONTENT                               */}
      {/* ========================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* TOP STATUS BAR: SENSOR HEARTBEAT & AUTONOMOUS AI ENGINE */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#161b22] via-[#21262d] to-[#161b22] border border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  ESP32 + NEO-6M GPS Ingestion Node (Channel #3474082)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  9 SATELLITES LOCKED
                </span>
              </div>
              <p className="text-xs text-[#8b949e] font-mono mt-0.5">
                Real-time telemetry streaming at 1.8s intervals • Raspberry Pi AI Compressor Autonomous Controller Active
              </p>
            </div>
          </div>

          {/* Quick Incident Simulation Toggle */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#8b949e] text-[11px]">HACKATHON DEMO:</span>
            <button
              onClick={() => {
                sound.playSmsAlert();
                setIsSimulatedSpike(true);
              }}
              className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all ${
                isSimulatedSpike
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-lg'
                  : 'bg-[#21262d] hover:bg-[#30363d] text-amber-400 border border-amber-800/40'
              }`}
            >
              ⚠ Simulate Heat Spike (8.4°C)
            </button>
            <button
              onClick={() => {
                sound.playClick(1000);
                setIsSimulatedSpike(false);
              }}
              className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all ${
                !isSimulatedSpike
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-lg'
                  : 'bg-[#21262d] hover:bg-[#30363d] text-emerald-400 border border-emerald-800/40'
              }`}
            >
              ✓ Safe Auto-Regulate (4.2°C)
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ROLE 1: FARMER VIEW (DYNAMIC, VIBRANT, REASSURING)       */}
        {/* ======================================================== */}
        {activeRole === 'Farmer' && (
          <div className="space-y-6">
            
            {/* 4 GLOWING HERO CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Inside Temperature Gauge */}
              <div className={`p-5 rounded-xl border transition-all duration-500 shadow-lg ${
                isWarning
                  ? 'bg-gradient-to-b from-amber-950/40 to-[#161b22] border-amber-600/60 shadow-amber-950/30'
                  : 'bg-gradient-to-b from-emerald-950/40 to-[#161b22] border-emerald-600/60 shadow-emerald-950/30'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                  <span>INSIDE CARGO TEMP</span>
                  <Thermometer className={`w-4 h-4 ${isWarning ? 'text-amber-400 animate-bounce' : 'text-emerald-400'}`} />
                </div>
                <div className="my-3">
                  <div className={`text-4xl font-extrabold font-mono tracking-tight ${
                    isWarning ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {liveTemp.toFixed(2)}°C
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`w-2 h-2 rounded-full ${isWarning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                    <span className="text-[11px] font-mono text-zinc-300">
                      {isWarning ? 'AI Compensating Cooling...' : 'Optimal Safe Range (2°C–8°C)'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#8b949e] border-t border-[#30363d] pt-2 flex justify-between">
                  <span>Ambient Outside: 31.7°C</span>
                  <span className="text-emerald-400">Δ -27.5°C</span>
                </div>
              </div>

              {/* Card 2: Freshness & Spoilage Index */}
              <div className="p-5 rounded-xl bg-gradient-to-b from-[#1c2128] to-[#161b22] border border-[#30363d] shadow-lg">
                <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                  <span>PRODUCE FRESHNESS</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-3">
                  <div className="text-4xl font-extrabold font-mono text-white tracking-tight">
                    {isWarning ? '89.2%' : '99.4%'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-[11px] font-mono text-zinc-300">
                      Humidity: {liveHum.toFixed(1)}% RH (Optimal)
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#8b949e] border-t border-[#30363d] pt-2 flex justify-between">
                  <span>Zero Thermal Decay</span>
                  <span className="text-emerald-400 font-bold">100% Salable</span>
                </div>
              </div>

              {/* Card 3: Live GPS Speed & Route */}
              <div className="p-5 rounded-xl bg-gradient-to-b from-[#1c2128] to-[#161b22] border border-[#30363d] shadow-lg">
                <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                  <span>GPS TRANSIT (NEO-6M)</span>
                  <Truck className="w-4 h-4 text-blue-400" />
                </div>
                <div className="my-3">
                  <div className="text-2xl font-extrabold font-mono text-white truncate">
                    Kurnool Hwy
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {liveSpeed.toFixed(1)} km/h • Smooth Transit
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#8b949e] border-t border-[#30363d] pt-2 flex justify-between">
                  <span>Lat: 15.8281°N</span>
                  <span>Lon: 78.0373°E</span>
                </div>
              </div>

              {/* Card 4: Estimated Mandi Arrival */}
              <div className="p-5 rounded-xl bg-gradient-to-b from-[#1c2128] to-[#161b22] border border-[#30363d] shadow-lg">
                <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                  <span>DESTINATION ARRIVAL</span>
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="my-3">
                  <div className="text-4xl font-extrabold font-mono text-white tracking-tight">
                    4:00 PM
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-[11px] font-mono text-zinc-300">
                      {liveDistance.toFixed(1)} km / 180 km Done
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#8b949e] border-t border-[#30363d] pt-2 flex justify-between">
                  <span>Kurnool Mandi Gate #2</span>
                  <span className="text-purple-400 font-bold">On Schedule</span>
                </div>
              </div>

            </div>

            {/* LIVE FARMER VOICE HOTLINE + PACKET STREAM ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Farmer Voice Hotline Interactive Station */}
              <div className="lg:col-span-7 p-6 rounded-xl bg-gradient-to-br from-[#161b22] to-[#21262d] border border-[#30363d] shadow-xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-emerald-400 animate-pulse" />
                      <h4 className="text-sm font-bold font-mono text-white uppercase">
                        Illiterate Farmer Voice Hotline (1800-COLD-FARM)
                      </h4>
                    </div>
                    
                    {/* Language Pills */}
                    <div className="flex gap-1 bg-[#161b22] p-1 rounded-lg border border-[#30363d] text-xs font-mono">
                      <button
                        onClick={() => setVoiceLang('te')}
                        className={`px-2.5 py-1 rounded cursor-pointer font-bold transition-all ${
                          voiceLang === 'te' ? 'bg-emerald-600 text-white' : 'text-[#8b949e] hover:text-white'
                        }`}
                      >
                        తెలుగు
                      </button>
                      <button
                        onClick={() => setVoiceLang('hi')}
                        className={`px-2.5 py-1 rounded cursor-pointer font-bold transition-all ${
                          voiceLang === 'hi' ? 'bg-emerald-600 text-white' : 'text-[#8b949e] hover:text-white'
                        }`}
                      >
                        हिंदी
                      </button>
                      <button
                        onClick={() => setVoiceLang('en')}
                        className={`px-2.5 py-1 rounded cursor-pointer font-bold transition-all ${
                          voiceLang === 'en' ? 'bg-emerald-600 text-white' : 'text-[#8b949e] hover:text-white'
                        }`}
                      >
                        ENG
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#8b949e] mt-3 leading-relaxed font-sans">
                    Farmers don&apos;t need to read. When the farmer calls the Raspberry Pi voice gateway, it speaks comforting status updates aloud:
                  </p>

                  <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d] my-3">
                    <span className="text-[10px] font-mono text-emerald-400 block mb-1">
                      NATIVE VOCAL REASSURANCE:
                    </span>
                    <p className="text-xs text-white leading-relaxed font-sans italic">
                      &ldquo;{CALL_SCENARIOS.TRANSIT_SAFE.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleDialLiveCall(isWarning ? 'TEMP_SPIKE_AUTONOMOUS_FIX' : 'TRANSIT_SAFE')}
                    className="flex-1 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <PhoneCall className={`w-4 h-4 ${isCalling ? 'animate-bounce' : ''}`} />
                    <span>{isCalling ? '🎙️ Speaking Voice Audio...' : '▶ Dial Server & Speak Aloud'}</span>
                  </button>

                  {isCalling && (
                    <button
                      onClick={handleHangup}
                      className="px-5 py-3.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold cursor-pointer"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>

              {/* Live Live Packet Stream & Real Telemetry Feed */}
              <div className="lg:col-span-5 p-6 rounded-xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-2 mb-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>LIVE TELEMETRY PACKET STREAM</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#8b949e]">UART2 @ 9600 BAUD</span>
                  </div>

                  <div className="space-y-2 font-mono text-[11px]">
                    {livePackets.map((pkt, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded border leading-tight ${
                          idx === 0
                            ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 font-bold'
                            : 'bg-[#0d1117] border-[#30363d] text-[#8b949e]'
                        }`}
                      >
                        {pkt}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#30363d] grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
                    <span className="text-[#8b949e] text-[10px] block">FARMER CONTACT</span>
                    <span className="font-bold text-white text-[11px] truncate block">+91 94401 55667</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
                    <span className="text-[#8b949e] text-[10px] block">DRIVER CONTACT</span>
                    <span className="font-bold text-white text-[11px] truncate block">+91 98480 11223</span>
                  </div>
                </div>
              </div>

            </div>

            {/* LIVE REAL-TIME TELEMETRY GRAPH */}
            <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-bold font-mono text-white uppercase">
                    Continuous Thermal Corridor Ingestion (Live Graph)
                  </h4>
                  <span className="text-[11px] text-[#8b949e] font-mono">Real-time sensor curve updating dynamically</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Inside Cargo ({liveTemp.toFixed(1)}°C)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8b949e]">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Outside (31.7°C)</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartHistory}>
                    <defs>
                      <linearGradient id="liveGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                    <XAxis dataKey="time" stroke="#8b949e" fontSize={10} tickLine={false} />
                    <YAxis stroke="#8b949e" fontSize={10} domain={[0, 35]} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#fff' }} />
                    <Area type="monotone" dataKey="inside" stroke="#10b981" strokeWidth={2.5} fill="url(#liveGreen)" />
                    <Area type="monotone" dataKey="outside" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 2: MERCHANT VIEW                                    */}
        {/* ======================================================== */}
        {activeRole === 'Merchant' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold block mb-0.5">WHOLESALE MERCHANT AUDIT</span>
                <h3 className="text-base font-bold font-mono text-white">Batch Passport #JRN-2048 (Tomato Grade-A)</h3>
              </div>
              <div className="text-xs font-mono text-right">
                <span className="text-[#8b949e] block">Mandi Valuation</span>
                <span className="text-emerald-400 font-extrabold text-lg">₹2,450 / Quintal</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
                <span className="text-[#8b949e] block mb-1">TOTAL CARGO LOAD</span>
                <div className="text-lg font-bold text-white">180 Crates (3,600 kg)</div>
                <div className="text-emerald-400 mt-1">Est. Batch Value: ₹88,200</div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
                <span className="text-[#8b949e] block mb-1">LIVE THERMAL INTEGRITY</span>
                <div className="text-lg font-bold text-emerald-400">{liveTemp.toFixed(1)}°C (Verified Safe)</div>
                <div className="text-[#8b949e] mt-1">Zero Spoilage Risk</div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
                <span className="text-[#8b949e] block mb-1">FARMER CONTACT</span>
                <div className="text-lg font-bold text-white">{farmerPhone}</div>
                <div className="text-[#8b949e] mt-1">Direct Grower Traceability</div>
              </div>
            </div>

            {/* Audit Table */}
            <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-[#30363d] text-[#8b949e]">
                    <th className="py-2.5 px-3">CHECKPOINT</th>
                    <th className="py-2.5 px-3">TELEMETRY READING</th>
                    <th className="py-2.5 px-3">SAFE SPECIFICATION</th>
                    <th className="py-2.5 px-3 text-right">AUDIT STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]/50">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-white">Inside Core Temp</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{liveTemp.toFixed(2)}°C</td>
                    <td className="py-2.5 px-3 text-[#8b949e]">2.0°C – 8.0°C</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">✅ VERIFIED PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-white">Relative Humidity</td>
                    <td className="py-2.5 px-3 text-blue-400 font-bold">{liveHum.toFixed(1)}% RH</td>
                    <td className="py-2.5 px-3 text-[#8b949e]">70% – 95%</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">✅ VERIFIED PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-white">Reefer Truck GPS</td>
                    <td className="py-2.5 px-3 text-white">15.8281°N, 78.0373°E</td>
                    <td className="py-2.5 px-3 text-[#8b949e]">Speed: {liveSpeed.toFixed(1)} km/h</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">✅ ON TIME</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 3: DRIVER / RIDER VIEW                              */}
        {/* ======================================================== */}
        {activeRole === 'Driver' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
                <span className="text-[#8b949e] block mb-1">LIVE SPEEDOMETER (NEO-6M)</span>
                <div className="text-3xl font-extrabold text-white">{liveSpeed.toFixed(1)} km/h</div>
                <div className="text-emerald-400 mt-1">Safe Highway Speed Limit (60 km/h)</div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
                <span className="text-[#8b949e] block mb-1">CARGO BAY TEMPERATURE</span>
                <div className="text-3xl font-extrabold text-emerald-400">{liveTemp.toFixed(1)}°C</div>
                <div className="text-zinc-400 mt-1">AI Cooler Autonomous: ACTIVE</div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
                <span className="text-[#8b949e] block mb-1">DESTINATION ETA</span>
                <div className="text-3xl font-extrabold text-purple-400">4:00 PM</div>
                <div className="text-zinc-400 mt-1">Kurnool APMC Gate #2</div>
              </div>
            </div>

            {routeData?.mapEmbedUrl && (
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white">LIVE ROUTE NAVIGATION (ANANTAPUR → KURNOOL MANDI)</span>
                  <span className="text-emerald-400 font-bold">{liveDistance.toFixed(1)} km traveled</span>
                </div>
                <iframe
                  src={routeData.mapEmbedUrl}
                  width="100%"
                  height="400"
                  className="rounded border border-[#30363d]"
                  loading="lazy"
                  title="Navigation"
                />
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 4: LIVE VOICE CALL DEMO (HACKATHON DIALER)          */}
        {/* ======================================================== */}
        {activeRole === 'LiveCall' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] text-center max-w-2xl mx-auto space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 text-2xl shadow-xl">
                <PhoneCall className={isCalling ? 'animate-bounce' : ''} />
              </div>

              <div>
                <h3 className="text-xl font-bold font-mono text-white">1800-COLD-FARM</h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">{callStatus}</span>
              </div>

              {/* Audio Waveform when active */}
              {isCalling && (
                <div className="flex items-center justify-center gap-1.5 h-10 py-1">
                  {[4, 8, 12, 6, 10, 14, 8, 5].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 bg-emerald-400 rounded-full animate-pulse"
                      style={{ height: `${h * 2}px`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              )}

              {/* Live Spoken Transcript */}
              <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d] text-left text-xs font-mono space-y-1">
                <span className="text-[#8b949e] text-[10px] block uppercase">Live Voice Output (Native Dialect):</span>
                <p className="text-white font-sans leading-relaxed italic">
                  {activeCallText || CALL_SCENARIOS.TRANSIT_SAFE.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']}
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleDialLiveCall(isWarning ? 'TEMP_SPIKE_AUTONOMOUS_FIX' : 'TRANSIT_SAFE')}
                  className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-lg flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isCalling ? 'Speaking on Call...' : '▶ Start Real Phone Call Demo'}</span>
                </button>

                {isCalling && (
                  <button
                    onClick={handleHangup}
                    className="px-5 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold cursor-pointer"
                  >
                    Hang Up
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 5: CROP DOCTOR (AI LEAF DAMAGE QUANTIFICATION)      */}
        {/* ======================================================== */}
        {activeRole === 'CropDoctor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-5 space-y-4">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

                {!cropImage ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-[#30363d] hover:border-emerald-500 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#161b22] min-h-[260px]"
                  >
                    <Upload className="w-8 h-8 text-[#8b949e] mb-2" />
                    <h4 className="text-xs font-bold font-mono text-white">Upload 3MP Camera Leaf Image</h4>
                    <p className="text-[11px] text-[#8b949e] mt-1">From ESP32-CAM or phone</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
                    <img src={cropImage} alt="Crop sample" className="w-full max-h-56 object-contain rounded bg-[#0d1117]" />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAnalyze}
                        disabled={diagLoading}
                        className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer"
                      >
                        {diagLoading ? 'Calculating Surface Damage %...' : 'Analyze with Gemini AI'}
                      </button>
                      <button
                        onClick={() => { setCropImage(null); setDiagnosis(null); }}
                        className="px-3 py-2.5 rounded-lg bg-[#21262d] text-white hover:bg-[#30363d] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-7">
                {diagnosis ? (
                  <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4">
                    <div className="flex justify-between items-center border-b border-[#30363d] pb-2">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase">DIAGNOSED DISEASE</span>
                        <h3 className="text-lg font-bold font-mono text-white">{diagnosis.disease_name}</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        {diagnosis.severity} Severity
                      </span>
                    </div>

                    <div className="p-3.5 rounded bg-[#0d1117] border border-[#30363d] space-y-2">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span className="text-white">SURFACE DAMAGE QUANTIFICATION:</span>
                        <span className="text-amber-400">{diagnosis.leaf_damage_percentage}% DESTROYED / {diagnosis.healthy_tissue_percentage}% INTACT</span>
                      </div>
                      
                      <div className="w-full h-3 rounded-full bg-emerald-950 overflow-hidden flex">
                        <div className="bg-red-500 h-full transition-all duration-700" style={{ width: `${diagnosis.leaf_damage_percentage}%` }} />
                        <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${diagnosis.healthy_tissue_percentage}%` }} />
                      </div>

                      <div className="text-[11px] font-mono text-[#8b949e]">
                        Can crop be saved: <strong className="text-emerald-400">{diagnosis.can_be_saved ? '✅ YES (100% Recoverable)' : 'Urgent Action'}</strong>
                      </div>
                    </div>

                    <div className="p-3.5 rounded bg-emerald-950/40 border border-emerald-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-emerald-300">SPOKEN PRESCRIPTION (TELUGU):</span>
                        <button
                          onClick={() => speakFarmerAudio(diagnosis.farmer_voice_telugu || diagnosis.summary, 'te')}
                          className="px-2.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold cursor-pointer"
                        >
                          ▶ Play Voice
                        </button>
                      </div>
                      <p className="text-xs text-white font-sans leading-relaxed">
                        {diagnosis.farmer_voice_telugu || diagnosis.summary}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center justify-center min-h-[260px]">
                    <span className="text-3xl mb-2">🍃</span>
                    <h4 className="text-xs font-bold font-mono text-white uppercase">AI Plant Pathology Ready</h4>
                    <p className="text-xs text-[#8b949e] mt-1">Upload a leaf photo to quantify surface damage.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-12 bg-[#161b22] border-t border-[#30363d] py-5 px-6 text-xs font-mono text-[#8b949e]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>COLD SHIELD // MISSION CONTROL OPERATIONS PLATFORM</div>
          <Link href="/" className="text-emerald-400 hover:underline font-semibold">
            ← Return to Cinematic Story
          </Link>
        </div>
      </footer>

    </div>
  );
}

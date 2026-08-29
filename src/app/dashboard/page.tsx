'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Volume2,
  Mic,
  Camera,
  Upload,
  Trash2,
  Navigation,
  MapPin,
  Clock,
  Droplets,
  Leaf,
  Zap,
  Snowflake,
  Flame,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Box,
  Cpu,
} from 'lucide-react';
import { sound } from '@/lib/audio';
import { fetchThingSpeakData } from '@/services/thingspeak';
import { diagnoseCropImage, DiagnosisData } from '@/services/cropDoctor';
import { planAgriculturalRoute, RouteData } from '@/services/routePlanner';
import {
  speakFarmerAudio,
  stopFarmerAudio,
  CALL_SCENARIOS,
  VoiceLanguage,
} from '@/services/voiceAssistant';
import {
  RealLocationMapCard,
  RealTempProbeCard,
  RealProduceQualityCard,
  RealMandiArrivalCard,
} from '@/components/ui/expandable-telemetry-cards';
import { ColdStorageIntelligence } from '@/components/ColdStorageIntelligence';
import { Footer } from '@/components/Footer';

export default function ComprehensiveAgriculturalDashboard() {
  const [activeTab, setActiveTab] = useState<'Farmer' | 'Merchant' | 'Driver' | 'Voice' | 'CropDoctor'>('Farmer');
  const [timeString, setTimeString] = useState<string>('');

  // -------------------------------------------------------------
  // PHYSICAL DEMO BOX SIMULATOR STATE (DEFAULT: PRISTINE 4.2°C)
  // -------------------------------------------------------------
  const [liveTemp, setLiveTemp] = useState<number>(4.2);
  const [liveHum, setLiveHum] = useState<number>(68.0);
  const [liveSpeed, setLiveSpeed] = useState<number>(52.4);
  const [liveDistance, setLiveDistance] = useState<number>(128.4);
  
  // States: 'SAFE_COLD' | 'HOT_WARNING' | 'COOLING_ACTIVE'
  const [boxThermalState, setBoxThermalState] = useState<'SAFE_COLD' | 'HOT_WARNING' | 'COOLING_ACTIVE'>('SAFE_COLD');
  const [signalStatus, setSignalStatus] = useState<string>('Cooling System Idle (Optimal 4.2°C)');
  const [coolingProgress, setCoolingProgress] = useState<number>(100);

  // Contacts
  const farmerName = 'Ramesh Reddy';
  const farmerPhone = '+91 94401 55667';
  const driverName = 'Suresh Kumar';
  const driverPhone = '+91 98480 11223';
  const truckNumber = 'AP-04-TX-2048 (Reefer Cold Van)';

  // Voice Assistant
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('te');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [spokenText, setSpokenText] = useState<string>('');

  // Crop Doctor
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [diagLoading, setDiagLoading] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Route
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  // Temperature chart trend
  const [tempTrend, setTempTrend] = useState([
    { time: '11:00 AM', temp: 4.1, ambient: 29.5 },
    { time: '12:00 PM', temp: 4.2, ambient: 31.0 },
    { time: '01:00 PM', temp: 4.3, ambient: 32.2 },
    { time: '02:00 PM', temp: 4.2, ambient: 31.7 },
    { time: '03:00 PM', temp: 4.2, ambient: 31.4 },
  ]);

  // Real-time clock
  useEffect(() => {
    const updateTime = () => setTimeString(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch route on mount
  useEffect(() => {
    planAgriculturalRoute('Anantapur', 'Kurnool')
      .then((r) => setRouteData(r.route))
      .catch(() => {});
  }, []);

  // -------------------------------------------------------------
  // INTERACTIVE DEMO: INJECT HEAT (TURNS TO VIVID RED WARNING)
  // -------------------------------------------------------------
  const handleInjectHeat = () => {
    sound.playSmsAlert();
    setBoxThermalState('HOT_WARNING');
    setLiveTemp(8.6);
    setSignalStatus('⚠️ HIGH HEAT DETECTED! SENSORS EXCEEDED 8.0°C THRESHOLD');

    setTempTrend((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString().slice(0, 5), temp: 8.6, ambient: 33.5 },
    ]);
  };

  // -------------------------------------------------------------
  // INTERACTIVE DEMO: TRANSMIT COOLING SIGNAL (RED ➔ CALM ICY GREEN)
  // -------------------------------------------------------------
  const handleSendCoolingSignal = () => {
    sound.playClick(1200);
    setBoxThermalState('COOLING_ACTIVE');
    setSignalStatus('📡 TRANSMITTING COOLING PWM SIGNAL TO ESP32 REEFER RELAY...');
    setCoolingProgress(20);

    setTimeout(() => {
      setLiveTemp(7.2);
      setCoolingProgress(50);
      setSignalStatus('❄️ COMPRESSOR AT 100% POWER — ACTIVE REFRIGERATION ENGAGED');
    }, 1000);

    setTimeout(() => {
      setLiveTemp(5.8);
      setCoolingProgress(80);
      setSignalStatus('❄️ TEMPERATURE RAPIDLY DROPPING TO SAFE LEVEL...');
    }, 2200);

    setTimeout(() => {
      sound.playClick(800);
      setLiveTemp(4.2);
      setCoolingProgress(100);
      setBoxThermalState('SAFE_COLD');
      setSignalStatus('✅ SAFE TEMPERATURE RESTORED TO 4.2°C (OPTIMAL PRESERVATION)');

      setTempTrend((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString().slice(0, 5), temp: 4.2, ambient: 31.7 },
      ]);
    }, 3600);
  };

  // Voice call trigger
  const handlePlayVoice = (scenarioKey: keyof typeof CALL_SCENARIOS = 'TRANSIT_SAFE') => {
    const scenario = CALL_SCENARIOS[scenarioKey];
    let text = scenario.script.telugu;
    if (voiceLang === 'hi') text = scenario.script.hindi;
    if (voiceLang === 'en') text = scenario.script.english;

    setIsSpeaking(true);
    setSpokenText(text);

    speakFarmerAudio(text, voiceLang, () => {
      setIsSpeaking(false);
    });
  };

  const handleStopVoice = () => {
    stopFarmerAudio();
    setIsSpeaking(false);
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

  const isHot = boxThermalState === 'HOT_WARNING';
  const isCooling = boxThermalState === 'COOLING_ACTIVE';

  return (
    <div className={`relative min-h-screen font-sans antialiased selection:bg-emerald-500 selection:text-white ${
      isHot
        ? 'text-[#7f1d1d]'
        : isCooling
        ? 'text-[#134e4a]'
        : 'text-[#1c1917]'
    }`}>

      {/* ========================================================== */}
      {/* HIGHLY VISIBLE 85% OPACITY BACKGROUND VIDEO LAYER          */}
      {/* ========================================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-85 brightness-105"
        >
          <source src="/media/dashboard_loop.mp4" type="video/mp4" />
        </video>

        {/* Minimal subtle gradient overlay for readability without washing out video */}
        <div className={`absolute inset-0 transition-colors duration-700 ${
          isHot
            ? 'bg-red-950/30'
            : isCooling
            ? 'bg-teal-950/25'
            : 'bg-black/15'
        }`} />
      </div>
      
      {/* ========================================================== */}
      {/* TOP ENLARGED FLOATING PILL HEADER                          */}
      {/* ========================================================== */}
      <div className="sticky top-3 z-50 px-4 sm:px-8 max-w-7xl mx-auto">
        <header className="rounded-full bg-black/65 backdrop-blur-2xl border border-white/25 text-white px-6 py-3.5 shadow-2xl flex items-center justify-between transition-all duration-500">
          
          <div className="flex items-center gap-3.5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold text-white transition-all border border-white/25 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Story</span>
            </Link>

            <div className="h-5 w-px bg-white/25" />

            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center shadow-md transition-colors duration-500 ${
                isHot ? 'bg-red-600' : isCooling ? 'bg-teal-500' : 'bg-[#22c55e]'
              }`}>
                {isHot ? <Flame className="w-4.5 h-4.5 animate-bounce" /> : isCooling ? <Snowflake className="w-4.5 h-4.5 animate-spin" /> : <Leaf className="w-4.5 h-4.5 text-black" />}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-extrabold text-white tracking-tight leading-none">
                  Cold Shield
                </h1>
                <span className="text-[10px] text-white/75 font-medium font-mono">
                  Live Video Node
                </span>
              </div>
            </div>
          </div>

          {/* Role Navigation Pills */}
          <nav className="flex items-center gap-1.5 p-1 bg-white/10 rounded-full border border-white/20 text-xs font-semibold backdrop-blur-md">
            {[
              { id: 'Farmer', label: '👨‍🌾 Farmer' },
              { id: 'Merchant', label: '🏢 Merchant' },
              { id: 'Driver', label: '🚛 Driver' },
              { id: 'Voice', label: '🎙️ Voice' },
              { id: 'CropDoctor', label: '🍃 Doctor' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick(900);
                  setActiveTab(tab.id as any);
                }}
                className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? isHot
                      ? 'bg-red-600 text-white font-extrabold shadow-md'
                      : isCooling
                      ? 'bg-teal-500 text-black font-extrabold shadow-md'
                      : 'bg-[#bef264] text-black font-extrabold shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Real-time Status Badge */}
          <div className="hidden md:flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-colors duration-500 ${
              isHot
                ? 'bg-red-500/40 text-red-100 border-red-400 animate-pulse'
                : isCooling
                ? 'bg-teal-500/40 text-teal-100 border-teal-400'
                : 'bg-emerald-500/40 text-emerald-100 border-emerald-400'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                isHot ? 'bg-red-400 animate-ping' : isCooling ? 'bg-teal-300 animate-ping' : 'bg-emerald-300'
              }`} />
              <span>{isHot ? '⚠️ HEAT ALERT (8.6°C)' : isCooling ? '❄️ COOLING ACTIVE' : '4.2°C OPTIMAL'}</span>
            </div>
            <span className="text-xs font-mono text-white/85 font-semibold">{timeString}</span>
          </div>

        </header>
      </div>

      {/* ========================================================== */}
      {/* MAIN CONTAINER                                             */}
      {/* ========================================================== */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8">

        {/* ======================================================== */}
        {/* PHYSICAL DEMO BOX HERO CARD (CALM GREEN ➔ VIVID RED)     */}
        {/* ======================================================== */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-700 shadow-2xl backdrop-blur-xl ${
          isHot
            ? 'bg-red-950/85 text-white border-red-500/80 shadow-red-500/30'
            : isCooling
            ? 'bg-teal-950/85 text-white border-cyan-400/80 shadow-teal-500/30'
            : 'bg-emerald-950/85 text-white border-emerald-500/70 shadow-emerald-950/30'
        }`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner transition-all duration-500 ${
                isHot ? 'bg-red-700/80 animate-pulse ring-4 ring-white/40' : isCooling ? 'bg-teal-900/80 ring-4 ring-cyan-300/40' : 'bg-emerald-900/80'
              }`}>
                🍅
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                    Live Demo Box Probe
                  </span>
                  <span className="text-xs font-mono opacity-85">ESP32 + DHT11 Probe Link</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                  {isHot ? 'Thermal Drift: Box Heating Detected (8.6°C)!' : isCooling ? 'Compressor Active: Cooling Tomato...' : 'Cold Box: 4.2°C Safe & Protected'}
                </h2>

                <p className="text-xs opacity-90 font-mono mt-1 flex items-center gap-2 text-white/90">
                  <span>{signalStatus}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-center min-w-[130px]">
                <span className="text-[10px] font-mono uppercase tracking-widest block text-white/75">Inside Box</span>
                <div className="text-4xl font-extrabold font-mono tracking-tight my-0.5 text-white">
                  {liveTemp.toFixed(1)}°C
                </div>
                <span className="text-[10px] font-bold block text-white/90">
                  {isHot ? '⚠️ EXCEEDS 8.0°C' : isCooling ? '❄️ COOLING DOWN' : '✅ SAFE CORRIDOR'}
                </span>
              </div>

              <div className="flex flex-col gap-2 flex-1 sm:flex-none">
                <button
                  onClick={handleInjectHeat}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                    isHot
                      ? 'bg-white text-red-700 shadow-md ring-2 ring-white font-extrabold'
                      : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>1. Simulate Heat In Box (8.6°C)</span>
                </button>

                <button
                  onClick={handleSendCoolingSignal}
                  className={`px-5 py-3 rounded-xl font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    isHot
                      ? 'bg-[#bef264] hover:bg-[#a3e635] text-black ring-4 ring-lime-300 animate-pulse font-extrabold'
                      : isCooling
                      ? 'bg-cyan-300 text-teal-950 font-bold'
                      : 'bg-[#bef264] hover:bg-[#a3e635] text-black font-extrabold'
                  }`}
                >
                  <Snowflake className={`w-4 h-4 ${isCooling ? 'animate-spin' : ''}`} />
                  <span>2. Transmit Cooling Signal (Turn Cold)</span>
                </button>
              </div>
            </div>

          </div>

          {isCooling && (
            <div className="mt-6 pt-4 border-t border-white/20 space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold text-white">
                <span>REFRIGERATION POWER CYCLE:</span>
                <span>{coolingProgress}% COMPLETED (TARGET 4.2°C)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="bg-cyan-300 h-full transition-all duration-1000 ease-out"
                  style={{ width: `${coolingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: FARMER VIEW (WITH ALL 4 3D EXPANDABLE CARDS)     */}
        {/* ======================================================== */}
        {activeTab === 'Farmer' && (
          <div className="space-y-8">
            
            {/* 4 3D EXPANDABLE INTERACTIVE TILES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
              
              {/* Tile 1: 3D Expandable Temperature & Compressor Probe */}
              <RealTempProbeCard
                temp={liveTemp}
                humidity={liveHum}
                isHot={isHot}
              />

              {/* Tile 2: 3D Expandable Produce Freshness & Brix Card */}
              <RealProduceQualityCard
                freshness={isHot ? 88.2 : 99.4}
                humidity={liveHum}
                isHot={isHot}
              />

              {/* Tile 3: 3D Expandable Real OpenStreetMap Highway Radar Card */}
              <RealLocationMapCard
                location="Kurnool Highway (NH 44, KM 42)"
                coordinates="15.8281° N, 78.0373° E"
                speed={liveSpeed}
                distanceKm={liveDistance}
              />

              {/* Tile 4: 3D Expandable Mandi Valuation & Financial Card */}
              <RealMandiArrivalCard
                eta="4:00 PM"
                mandiRate={2450}
              />

            </div>

            {/* COLD STORAGE FACILITY UNIT LOGS & MANDI PRICE VARIANCE INTELLIGENCE */}
            <ColdStorageIntelligence />

            {/* WARM FARMER VOICE ASSISTANT CARD */}
            <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-xs">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Farmer Voice Assistant (రైతు వాయిస్ అసిస్టెంట్)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Farmers don&apos;t need to read. Tap to hear real-time updates in your native language.
                    </p>
                  </div>
                </div>

                {/* Language Picker */}
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-full text-xs font-semibold">
                  <button
                    onClick={() => setVoiceLang('te')}
                    className={`px-4 py-1.5 rounded-full cursor-pointer transition-all ${
                      voiceLang === 'te' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    తెలుగు
                  </button>
                  <button
                    onClick={() => setVoiceLang('hi')}
                    className={`px-4 py-1.5 rounded-full cursor-pointer transition-all ${
                      voiceLang === 'hi' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => setVoiceLang('en')}
                    className={`px-4 py-1.5 rounded-full cursor-pointer transition-all ${
                      voiceLang === 'en' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Spoken Message & Action Button */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    Spoken Message Preview:
                  </span>
                  <p className="text-xs text-stone-800 leading-relaxed italic">
                    &ldquo;{isHot
                      ? CALL_SCENARIOS.TEMP_SPIKE_AUTONOMOUS_FIX.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']
                      : CALL_SCENARIOS.TRANSIT_SAFE.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']
                    }&rdquo;
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handlePlayVoice(isHot ? 'TEMP_SPIKE_AUTONOMOUS_FIX' : 'TRANSIT_SAFE')}
                    className="px-5 py-3 rounded-full bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <PhoneCall className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
                    <span>{isSpeaking ? 'Speaking Aloud...' : '▶ Listen in Voice'}</span>
                  </button>

                  {isSpeaking && (
                    <button
                      onClick={handleStopVoice}
                      className="px-4 py-3 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* DIRECT CONTACT NUMBERS & VEHICLE DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg space-y-4">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide border-b border-stone-200 pb-2">
                  Direct People Contacts
                </h4>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#166534] flex items-center justify-center font-bold text-xs">
                      F
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">{farmerName} (Farmer)</div>
                      <div className="text-[11px] text-stone-500">{farmerPhone}</div>
                    </div>
                  </div>
                  <a
                    href={`tel:${farmerPhone.replace(/\s+/g, '')}`}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs"
                  >
                    Call Farmer
                  </a>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      D
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">{driverName} (Driver)</div>
                      <div className="text-[11px] text-stone-500">{driverPhone}</div>
                    </div>
                  </div>
                  <a
                    href={`tel:${driverPhone.replace(/\s+/g, '')}`}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs"
                  >
                    Call Driver
                  </a>
                </div>
              </div>

              {/* Temperature History Area Chart */}
              <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    Live Temperature Trend (°C)
                  </h4>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    isHot ? 'bg-red-100 text-red-800' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {isHot ? 'Thermal Drift Detected' : 'Safe Corridor Active'}
                  </span>
                </div>

                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tempTrend}>
                      <defs>
                        <linearGradient id="warmGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isHot ? '#dc2626' : '#166534'} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={isHot ? '#dc2626' : '#166534'} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                      <YAxis stroke="#6b7280" fontSize={10} domain={[0, 40]} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="temp" stroke={isHot ? '#dc2626' : '#166534'} strokeWidth={2.5} fill="url(#warmGreen)" name="Cargo Temp (°C)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: MERCHANT PORTAL                                  */}
        {/* ======================================================== */}
        {activeTab === 'Merchant' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  COMMERCIAL APMC PASSPORT
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  Batch #JRN-2048 • Grade-A Tomato Inspection
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500 block">Today&apos;s Mandi Price</span>
                <span className="text-2xl font-extrabold text-[#166534]">₹2,450 / Quintal</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg">
                <span className="text-xs font-semibold text-stone-500 block">BATCH VOLUME</span>
                <div className="text-2xl font-bold text-stone-900 mt-1">180 Crates (3,600 kg)</div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">Estimated Value: ₹88,200</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg">
                <span className="text-xs font-semibold text-stone-500 block">THERMAL CUSTODY</span>
                <div className="text-2xl font-bold text-[#166534] mt-1">{liveTemp.toFixed(1)}°C (Verified Safe)</div>
                <div className="text-xs text-stone-500 mt-1">Ambient Outside: 31.7°C</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg">
                <span className="text-xs font-semibold text-stone-500 block">DIRECT FARMER</span>
                <div className="text-lg font-bold text-stone-900 mt-1">{farmerName}</div>
                <div className="text-xs text-stone-500 mt-1">{farmerPhone}</div>
              </div>
            </div>

            {/* Cold Storage Facility Inventory & Unit Logs */}
            <ColdStorageIntelligence />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: DRIVER / RIDER PORTAL                            */}
        {/* ======================================================== */}
        {activeTab === 'Driver' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg">
                <span className="text-xs font-semibold text-stone-500 block">CURRENT SPEED</span>
                <div className="text-3xl font-extrabold text-stone-900 mt-1">{liveSpeed} km/h</div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">Safe Highway Speed</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg">
                <span className="text-xs font-semibold text-stone-500 block">CARGO TEMPERATURE</span>
                <div className="text-3xl font-extrabold text-[#166534] mt-1">{liveTemp.toFixed(1)}°C</div>
                <div className="text-xs text-stone-500 mt-1">Autonomous Cooler: ACTIVE</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg">
                <span className="text-xs font-semibold text-stone-500 block">FARMER ASSIGNED</span>
                <div className="text-lg font-bold text-stone-900 mt-1">{farmerName}</div>
                <div className="text-xs text-stone-500 mt-1">{farmerPhone}</div>
              </div>
            </div>

            {/* Live Navigation Map + 3D Location Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-900">HIGHWAY ROUTE: ANANTAPUR ➔ KURNOOL APMC MANDI</span>
                  <span className="text-emerald-700 font-bold">{liveDistance} km Traveled</span>
                </div>
                {routeData?.mapEmbedUrl && (
                  <iframe
                    src={routeData.mapEmbedUrl}
                    width="100%"
                    height="380"
                    className="rounded-xl border border-stone-200"
                    loading="lazy"
                    title="Driver Map"
                  />
                )}
              </div>

              <div className="lg:col-span-4 p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-xs font-bold text-stone-900 uppercase">Interactive GPS Node</span>
                <RealLocationMapCard
                  location="Kurnool Highway (NH 44, KM 42)"
                  coordinates="15.8281° N, 78.0373° E"
                  speed={liveSpeed}
                  distanceKm={liveDistance}
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: LIVE VOICE ASSISTANT DEMO                        */}
        {/* ======================================================== */}
        {activeTab === 'Voice' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="p-8 rounded-3xl bg-white/95 backdrop-blur-md border border-white/40 shadow-2xl text-center space-y-6">
              <div className="w-18 h-18 rounded-full bg-emerald-50 border-2 border-[#166534] flex items-center justify-center mx-auto text-[#166534] shadow-sm">
                <Mic className={`w-8 h-8 ${isSpeaking ? 'animate-pulse' : ''}`} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  Toll-Free Voice Assistant (1800-COLD-FARM)
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Reassures rural farmers who cannot read by speaking live status in Telugu, Hindi, or English.
                </p>
              </div>

              {/* Language Selector */}
              <div className="inline-flex p-1 bg-stone-100 rounded-full text-xs font-semibold">
                <button
                  onClick={() => setVoiceLang('te')}
                  className={`px-5 py-2 rounded-full cursor-pointer ${
                    voiceLang === 'te' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-700'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
                <button
                  onClick={() => setVoiceLang('hi')}
                  className={`px-5 py-2 rounded-full cursor-pointer ${
                    voiceLang === 'hi' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-700'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={() => setVoiceLang('en')}
                  className={`px-5 py-2 rounded-full cursor-pointer ${
                    voiceLang === 'en' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-700'
                  }`}
                >
                  English
                </button>
              </div>

              {/* Spoken Text */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                  Live Spoken Message:
                </span>
                <p className="text-sm text-stone-800 leading-relaxed italic">
                  &ldquo;{spokenText || (isHot
                    ? CALL_SCENARIOS.TEMP_SPIKE_AUTONOMOUS_FIX.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']
                    : CALL_SCENARIOS.TRANSIT_SAFE.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']
                  )}&rdquo;
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handlePlayVoice(isHot ? 'TEMP_SPIKE_AUTONOMOUS_FIX' : 'TRANSIT_SAFE')}
                  className="px-8 py-3.5 rounded-full bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer transition-all shadow-md flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isSpeaking ? 'Speaking Message Aloud...' : '▶ Start Voice Call Demo'}</span>
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStopVoice}
                    className="px-6 py-3.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: CROP DOCTOR                                      */}
        {/* ======================================================== */}
        {activeTab === 'CropDoctor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-4">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

                {!cropImage ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-white/40 hover:border-emerald-500 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/95 backdrop-blur-md min-h-[260px] shadow-lg"
                  >
                    <Upload className="w-8 h-8 text-stone-400 mb-2" />
                    <h4 className="text-sm font-bold text-stone-900">Upload 3MP Camera Leaf Image</h4>
                    <p className="text-xs text-stone-500 mt-1">From camera or phone</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg space-y-3">
                    <img src={cropImage} alt="Crop sample" className="w-full max-h-56 object-contain rounded-xl bg-stone-900" />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAnalyze}
                        disabled={diagLoading}
                        className="flex-1 py-2.5 rounded-xl bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer"
                      >
                        {diagLoading ? 'Calculating Damage %...' : 'Analyze with Gemini AI'}
                      </button>
                      <button
                        onClick={() => { setCropImage(null); setDiagnosis(null); }}
                        className="px-3 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-7">
                {diagnosis ? (
                  <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-800 uppercase">IDENTIFIED CROP DISEASE</span>
                        <h3 className="text-lg font-bold text-stone-900">{diagnosis.disease_name}</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {diagnosis.severity} Severity
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-stone-900">LEAF DAMAGE SURFACE:</span>
                        <span className="text-amber-800">{diagnosis.leaf_damage_percentage}% DESTROYED / {diagnosis.healthy_tissue_percentage}% INTACT</span>
                      </div>
                      
                      <div className="w-full h-3.5 rounded-full bg-emerald-100 overflow-hidden flex">
                        <div className="bg-amber-600 h-full" style={{ width: `${diagnosis.leaf_damage_percentage}%` }} />
                        <div className="bg-[#166534] h-full" style={{ width: `${diagnosis.healthy_tissue_percentage}%` }} />
                      </div>

                      <div className="text-xs text-stone-600 pt-1">
                        Can crop be saved: <strong className="text-[#166534]">{diagnosis.can_be_saved ? '✅ YES (100% Recoverable)' : 'Action Needed'}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 text-center flex flex-col items-center justify-center min-h-[260px] shadow-lg">
                    <span className="text-4xl mb-2">🍃</span>
                    <h4 className="text-sm font-bold text-stone-900">AI Plant Pathology Ready</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs">Upload a leaf photo to quantify surface damage and hear prescriptions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <div className="relative z-10 mt-16">
        <Footer />
      </div>

    </div>
  );
}

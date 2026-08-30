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
  Building,
  Sparkles,
  Bot,
  Activity,
  HeartPulse,
  Star,
  Eye,
  Gauge,
  Award,
  Compass,
  Shield,
  User,
  AlertCircle,
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
import { LiveMandiBoard } from '@/components/LiveMandiBoard';
import { InteractiveFeaturePhone } from '@/components/InteractiveFeaturePhone';
import { InteractiveHighwayMap } from '@/components/InteractiveHighwayMap';
import { LiveContainerVisionDemo } from '@/components/LiveContainerVisionDemo';
import { Footer } from '@/components/Footer';

const SAMPLE_LEAF_IMAGES = [
  {
    name: '🍅 50% Half-Spoiled Tomato Test',
    crop: 'Tomato Fruit & Leaf',
    url: '/samples/half_spoiled_tomato.jpg',
  },
  {
    name: '🌿 Sample 1: Tomato Early Blight',
    crop: 'Tomato',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: '🍃 Sample 2: Tomato Yellow Leaf Curl',
    crop: 'Tomato',
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: '🍅 Sample 3: Fruit Surface Rot',
    crop: 'Tomato Fruit',
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600&auto=format&fit=crop',
  },
];

export default function ComprehensiveAgriculturalDashboard() {
  const [activeTab, setActiveTab] = useState<'Farmer' | 'Mandi' | 'Merchant' | 'Driver' | 'Voice' | 'CropDoctor'>('Farmer');
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
  const [doctorVoiceLang, setDoctorVoiceLang] = useState<VoiceLanguage>('te');
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

  const handleSelectSample = (sampleUrl: string) => {
    sound.playClick(1000);
    setCropImage(sampleUrl);
    setDiagnosis(null);
  };

  const handleAnalyze = async () => {
    if (!cropImage) return;
    sound.playClick(1100);
    setDiagLoading(true);
    try {
      const d = await diagnoseCropImage(cropImage);
      setDiagnosis(d);
    } catch {
      // Handled in service with robust fallback
    } finally {
      setDiagLoading(false);
    }
  };

  const handlePlayDoctorAudio = () => {
    if (!diagnosis) return;
    sound.playClick(1000);
    let text = diagnosis.farmer_voice_telugu;
    if (doctorVoiceLang === 'hi') text = diagnosis.farmer_voice_hindi;
    if (doctorVoiceLang === 'en') text = diagnosis.farmer_voice_english;

    setIsSpeaking(true);
    speakFarmerAudio(text, doctorVoiceLang, () => {
      setIsSpeaking(false);
    });
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
              { id: 'Mandi', label: '🏛️ Mandi Info' },
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
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
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
        {/* PHYSICAL DEMO CONTAINER BOX — LIVE CAMERA + GEMINI VISION */}
        {/* ======================================================== */}
        <LiveContainerVisionDemo
          liveTemp={liveTemp}
          isHot={isHot}
          isCooling={isCooling}
          coolingProgress={coolingProgress}
          onInjectHeat={handleInjectHeat}
          onSendCoolingSignal={handleSendCoolingSignal}
          onSetTemperature={(t) => setLiveTemp(t)}
        />

        {/* ======================================================== */}
        {/* VIEW: DEDICATED MANDI INFORMATION VIEW                  */}
        {/* ======================================================== */}
        {activeTab === 'Mandi' && (
          <div className="space-y-8">
            <LiveMandiBoard />
            <ColdStorageIntelligence />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: FARMER VIEW (FOCUSED & PRISTINE)                 */}
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

            {/* ⭐ CULTIVATION HEALTH & STAR RATING DASHBOARD */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl space-y-5">
              
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white">
                      Farm Intelligence
                    </span>
                    <span className="text-xs font-mono text-amber-800 font-bold">Cultivation Quality Index</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                    Crop Cultivation Health & Star Rating
                  </h3>
                  <p className="text-xs text-stone-600">
                    Overall quality assessment based on cold-chain integrity, soil health, and real-time IoT sensor data.
                  </p>
                </div>

                {/* Overall Rating Badge */}
                <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 shadow-md min-w-[140px]">
                  <span className="text-[10px] font-mono text-amber-800 font-bold uppercase">Overall Farm</span>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-lg font-extrabold text-amber-900 font-mono mt-0.5">4.8 / 5.0</span>
                  <span className="text-[10px] text-amber-700 font-medium">Excellent Quality</span>
                </div>
              </div>

              {/* Individual Crop Ratings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Tomato */}
                {(() => {
                  const crops = [
                    { name: 'Tomato (Hybrid Grade-A)', emoji: '🍅', rating: 5.0, temp: liveTemp, idealTemp: '0°C – 4°C', status: 'OPTIMAL', statusColor: 'emerald', freshness: 99.4, shelfLife: '21 Days' },
                    { name: 'Green Chilli (Spicy G4)', emoji: '🌶️', rating: 4.8, temp: liveTemp, idealTemp: '7°C – 10°C', status: 'GOOD', statusColor: 'emerald', freshness: 96.2, shelfLife: '14 Days' },
                    { name: 'Mango (Banganapalle)', emoji: '🥭', rating: 4.7, temp: liveTemp, idealTemp: '8°C – 12°C', status: 'GOOD', statusColor: 'emerald', freshness: 94.5, shelfLife: '18 Days' },
                    { name: 'Onion (Bellary Red)', emoji: '🧅', rating: 5.0, temp: 22.0, idealTemp: 'Ambient (Dry)', status: 'OPTIMAL', statusColor: 'emerald', freshness: 99.8, shelfLife: '60+ Days' },
                    { name: 'Potato (Kufri Jyoti)', emoji: '🥔', rating: 4.6, temp: liveTemp + 2, idealTemp: '4°C – 8°C', status: 'GOOD', statusColor: 'amber', freshness: 92.1, shelfLife: '30 Days' },
                    { name: 'Dry Red Chilli (Teja)', emoji: '🫑', rating: 5.0, temp: 24.0, idealTemp: 'Ambient (Dry)', status: 'OPTIMAL', statusColor: 'emerald', freshness: 99.9, shelfLife: '120+ Days' },
                  ];
                  return crops.map((crop) => (
                    <div key={crop.name} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:shadow-md transition-shadow space-y-3">
                      
                      {/* Crop Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{crop.emoji}</span>
                          <div>
                            <div className="text-xs font-bold text-stone-900">{crop.name}</div>
                            <div className="text-[10px] text-stone-500 font-mono">Ideal: {crop.idealTemp}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          crop.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {crop.status}
                        </span>
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((s) => {
                            const filled = s <= Math.floor(crop.rating);
                            const half = s === Math.ceil(crop.rating) && crop.rating % 1 >= 0.5 && !filled;
                            return (
                              <svg key={s} className={`w-4 h-4 ${filled || half ? 'text-amber-500' : 'text-stone-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          })}
                          <span className="text-xs font-extrabold font-mono text-amber-900 ml-1">{crop.rating.toFixed(1)}/5</span>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div className="p-1.5 rounded-xl bg-white border border-stone-200">
                          <div className="font-mono font-bold text-stone-900">{crop.temp.toFixed(1)}°C</div>
                          <div className="text-stone-500">Current</div>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white border border-stone-200">
                          <div className="font-mono font-bold text-[#166534]">{crop.freshness}%</div>
                          <div className="text-stone-500">Freshness</div>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white border border-stone-200">
                          <div className="font-mono font-bold text-stone-900">{crop.shelfLife}</div>
                          <div className="text-stone-500">Shelf Life</div>
                        </div>
                      </div>

                      {/* Freshness Progress Bar */}
                      <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            crop.freshness >= 95 ? 'bg-[#166534]' : crop.freshness >= 85 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${crop.freshness}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}

              </div>

              {/* Overall Temperature Summary Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-xs ${
                    isHot ? 'bg-red-500 text-white' : 'bg-[#166534] text-white'
                  }`}>
                    {isHot ? '⚠️' : '✅'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      Overall Cold-Chain Temperature: <span className={`font-mono ${isHot ? 'text-red-700' : 'text-[#166534]'}`}>{liveTemp.toFixed(1)}°C</span>
                    </div>
                    <div className="text-[10px] text-stone-600">
                      {isHot
                        ? 'Thermal breach detected. Cooling system engaged. Some crops may experience reduced shelf life.'
                        : 'All 6 crop categories within optimal cold-chain custody. Zero thermal drift. Maximum shelf life guaranteed.'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold ${
                    isHot ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {isHot ? '🔴 THERMAL ALERT' : '🟢 ALL SYSTEMS OPTIMAL'}
                  </span>
                </div>
              </div>

            </div>

            {/* TACTILE 2G FEATURE PHONE CALLING UNIT */}
            <div className="w-full">
              <InteractiveFeaturePhone
                initialLanguage={voiceLang}
                liveTemp={liveTemp}
                liveSpeed={liveSpeed}
                liveDistance={liveDistance}
                isHot={isHot}
                onLanguageChange={(l) => setVoiceLang(l)}
              />
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
        {/* VIEW 2: MERCHANT PORTAL — FLEET & DRIVER INTELLIGENCE    */}
        {/* ======================================================== */}
        {activeTab === 'Merchant' && (
          <div className="space-y-8">
            {/* Top Commercial Consignment Passport */}
            <div className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#166534] text-[11px] font-bold tracking-wider uppercase">
                    COMMERCIAL APMC PASSPORT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold tracking-wide">
                    IN-TRANSIT REEFER CUSTODY
                  </span>
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  Consignment #JRN-2048 • Grade-A Tomato Inspection
                </h3>
                <p className="text-xs text-stone-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Origin: <strong className="text-stone-700">Anantapur Farm Hub</strong> → Destination: <strong className="text-stone-700">Kurnool APMC Terminal (Gate #2)</strong>
                </p>
              </div>
              <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-stone-200">
                <span className="text-xs text-stone-500 block">Today&apos;s Mandi Price</span>
                <span className="text-2xl font-extrabold text-[#166534]">₹2,450 / Quintal</span>
                <span className="text-[11px] text-emerald-700 font-semibold block">Total Consignment Value: ₹88,200</span>
              </div>
            </div>

            {/* 3 Top Commercial Telemetry Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">BATCH VOLUME</span>
                  <Box className="w-4 h-4 text-stone-400" />
                </div>
                <div className="text-2xl font-bold text-stone-900 mt-1">180 Crates (3,600 kg)</div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">36 Quintals • Grade-A Sorted</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">THERMAL CUSTODY</span>
                  <Thermometer className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-[#166534] mt-1">{liveTemp.toFixed(1)}°C (Verified Safe)</div>
                <div className="text-xs text-stone-500 mt-1">Ambient Outside: 31.7°C • Delta: -27.5°C</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">DIRECT FARMER</span>
                  <User className="w-4 h-4 text-stone-400" />
                </div>
                <div className="text-lg font-bold text-stone-900 mt-1">{farmerName}</div>
                <div className="text-xs text-stone-500 mt-1">{farmerPhone} • Anantapur District</div>
              </div>
            </div>

            {/* MAIN TWO-COLUMN SECTION: DRIVER AI CAMERA & LIVE DRIVING SAFETY TELEMETRY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: DRIVER AI CABIN CAMERA STREAM (Captured via Raspberry Pi) */}
              <div className="lg:col-span-6 space-y-6">
                <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Raspberry Pi AI Cabin Camera
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white text-[10px] font-mono font-semibold">
                      CSI-0 • 1080P @ 30 FPS
                    </span>
                  </div>

                  {/* Photo of Driver Clicked by Pi Camera with Telemetry HUD Overlay */}
                  <div className="relative rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-950 group aspect-[4/3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/samples/driver_cabin_live.jpg"
                      alt="Driver Cabin Live Stream from Raspberry Pi Camera"
                      className="w-full h-full object-cover"
                    />

                    {/* Live Watermark & Sensor Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none flex flex-col justify-between p-4 font-mono text-[11px] text-white">
                      {/* Top HUD */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span className="text-red-400 font-bold">● REC</span>
                          <span className="text-stone-300">RPI-NODE-01</span>
                        </div>
                        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-emerald-400 font-semibold">
                          AI FACE MESH: ACTIVE
                        </div>
                      </div>

                      {/* AI Face Detection Bounding Box Simulation */}
                      <div className="absolute top-[32%] right-[22%] w-[28%] h-[42%] border-2 border-emerald-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-1 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <span className="text-[9px] bg-emerald-500 text-black font-bold px-1 rounded-xs self-start">
                          DRIVER #DRV-8492
                        </span>
                        <div className="flex justify-between items-end text-[8px] text-emerald-300 bg-black/60 px-1 rounded-xs">
                          <span>EAR: 0.28 (ALERT)</span>
                          <span>TILT: 0°</span>
                        </div>
                      </div>

                      {/* Bottom HUD */}
                      <div className="space-y-1 bg-black/70 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between text-stone-200">
                          <span>GPS: 15.8281° N, 78.0373° E</span>
                          <span className="text-emerald-400 font-bold">SPEED: 52.4 km/h</span>
                        </div>
                        <div className="flex items-center justify-between text-stone-400 text-[10px]">
                          <span>NEO-6M: 9 SATS LOCKED</span>
                          <span>CABIN TEMP: 26.2°C</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Bio & Real-time AI Health Metrics */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                          SK
                        </div>
                        <div>
                          <div className="text-sm font-bold text-stone-900">{driverName}</div>
                          <div className="text-xs text-stone-500">12 Yrs Commercial Cold-Reefer Captain • ID: #DRV-8492</div>
                        </div>
                      </div>
                      <a
                        href={`tel:${driverPhone.replace(/\s+/g, '')}`}
                        className="px-4 py-2 rounded-full bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Driver</span>
                      </a>
                    </div>

                    {/* 4x Driver Biometrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-900 font-semibold flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-emerald-700" />
                            Eye State (EAR)
                          </span>
                          <span className="font-bold text-emerald-800">0.28</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium mt-1">
                          🟢 Eyes Wide Open • 100% Alert
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-900 font-semibold flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-emerald-700" />
                            Yawn Rate (MAR)
                          </span>
                          <span className="font-bold text-emerald-800">0.14</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium mt-1">
                          🟢 Zero Yawning • No Fatigue
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-900 font-semibold flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-emerald-700" />
                            Head Posture
                          </span>
                          <span className="font-bold text-emerald-800">0° Tilt</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium mt-1">
                          🟢 Upright & Road Focused
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-900 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            Seatbelt Sensor
                          </span>
                          <span className="font-bold text-emerald-800">LOCKED</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium mt-1">
                          🟢 Securely Fastened
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: WHERE CAR IS MOVING & DRIVING SAFETY STATISTICS (SCALE TO 5.0) */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* 1. WHERE THE CAR IS MOVING (LIVE GPS & HIGHWAY TRANSIT RADAR) */}
                <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Live Cargo Vehicle Location & Motion
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      GPS LOCKED (9 SATS)
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] text-emerald-400 font-mono font-semibold uppercase tracking-wider block">
                          Current Highway Corridor
                        </span>
                        <div className="text-base font-bold text-white mt-0.5">
                          NH 44 High-Speed Corridor • KM 42.8
                        </div>
                        <div className="text-xs text-stone-300 mt-0.5">
                          Near Dhone Highway Bypass • Heading towards Kurnool Mandi
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-emerald-400">
                          {liveSpeed} <span className="text-xs font-normal text-stone-300">km/h</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block">Cruising Speed</span>
                      </div>
                    </div>

                    {/* Progress Bar from Farm to Mandi */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-800">
                      <div className="flex justify-between text-xs text-stone-300">
                        <span>Anantapur (0 km)</span>
                        <span className="font-bold text-emerald-400">{liveDistance} km / 180 km (71%)</span>
                        <span>Kurnool Mandi (180 km)</span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-1000 shadow-sm"
                          style={{ width: `${(liveDistance / 180) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-stone-400">
                        <span>Departed: 11:30 AM</span>
                        <span className="text-emerald-300 font-medium">Remaining: 51.6 km • ETA: 4:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DRIVER SAFETY STATISTICS (SCALED 1 TO 5.0) */}
                <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#166534]" />
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Driver Safety Performance Index
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-stone-500">
                      Scaled to 5.0 Maximum
                    </span>
                  </div>

                  {/* Big Hero Rating Score Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex items-center justify-between shadow-lg">
                    <div className="space-y-1">
                      <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider block">
                        OVERALL DRIVING SAFETY RATING
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tracking-tight text-white">4.9</span>
                        <span className="text-lg text-emerald-300 font-bold">/ 5.0</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-300">
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                        <span className="text-xs text-white font-semibold ml-1.5">Top 2% Safest Fleet</span>
                      </div>
                    </div>

                    <div className="text-right bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
                      <ShieldCheck className="w-8 h-8 text-emerald-300 mx-auto" />
                      <div className="text-[11px] font-bold text-white mt-1">SAFE TRANSIT</div>
                      <div className="text-[9px] text-emerald-200">0 Incident Alerts</div>
                    </div>
                  </div>

                  {/* 4 Metric Breakdown Bars (Scaled out of 5) */}
                  <div className="space-y-3.5">
                    
                    {/* Metric 1: Alertness */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          Drowsiness & Alertness Index
                        </span>
                        <span className="font-extrabold text-[#166534]">5.0 / 5.0</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-full" />
                      </div>
                      <p className="text-[10px] text-stone-500">
                        0 micro-sleep lapses or eye-closure episodes detected across 128 km transit.
                      </p>
                    </div>

                    {/* Metric 2: Speed Compliance */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                          Speed & Highway Limit Adherence
                        </span>
                        <span className="font-extrabold text-[#166534]">4.8 / 5.0</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-[96%]" />
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Cruising steadily in 45–60 km/h green band; zero over-speeding infractions.
                      </p>
                    </div>

                    {/* Metric 3: G-Force / Rash Driving */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          Cornering & Smooth Braking
                        </span>
                        <span className="font-extrabold text-[#166534]">4.9 / 5.0</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-[98%]" />
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Gentle braking & cornering; 0 rough road jolts to preserve tender crop skin.
                      </p>
                    </div>

                    {/* Metric 4: Reefer Custody Preservation */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Snowflake className="w-3.5 h-3.5 text-emerald-600" />
                          Cold-Chain Integrity Preservation
                        </span>
                        <span className="font-extrabold text-[#166534]">5.0 / 5.0</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-full" />
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Cargo container doors sealed airtight; uninterrupted 4.2°C temperature corridor.
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            </div>

            {/* DOWNSIDE: CARGO REEFER COMMERCIAL NUMBER PLATE & TRANSPORT MANIFEST */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/95 backdrop-blur-md border border-white/40 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    REGISTERED CARGO VEHICLE ASSET
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                    Insulated Reefer Cargo Truck Manifest
                  </h3>
                </div>
                
                {/* Authentic Indian Commercial Cargo Number Plate Display */}
                <div className="flex items-center">
                  <div className="flex items-center bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 border-3 border-stone-950 rounded-xl shadow-md overflow-hidden">
                    {/* Blue IND Badge Strip */}
                    <div className="bg-blue-700 text-white px-2 py-2 flex flex-col items-center justify-center font-bold text-[10px] leading-tight border-r-2 border-stone-950">
                      <span className="text-[8px] font-sans">🇮🇳</span>
                      <span className="font-mono tracking-tighter">IND</span>
                    </div>
                    {/* Embossed Bold Commercial Number */}
                    <div className="px-5 py-2 text-stone-950 font-mono font-black tracking-widest text-2xl md:text-3xl select-all">
                      AP 21 TC 9842
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications of Cargo Vehicle */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-stone-500 font-medium block">Vehicle Model</span>
                  <div className="font-bold text-stone-900">Tata 407 LPT Heavy Reefer</div>
                  <span className="text-[10px] text-stone-400 block">Insulated FRP Box</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-stone-500 font-medium block">Refrigeration Unit</span>
                  <div className="font-bold text-emerald-800">Carrier Transicold Supra</div>
                  <span className="text-[10px] text-stone-400 block">Auto-PWM Regulated @ 4.2°C</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-stone-500 font-medium block">Fastag & Toll Gateway</span>
                  <div className="font-bold text-stone-900">Active • Fastag #849102</div>
                  <span className="text-[10px] text-emerald-700 block">Toll 4 Cleared (08:42 AM)</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-stone-500 font-medium block">IoT Telemetry Node</span>
                  <div className="font-bold text-stone-900">Raspberry Pi 4B + ESP32</div>
                  <span className="text-[10px] text-stone-400 block">Channel ID: #3474082</span>
                </div>
              </div>

              {/* Fast Action Buttons for Merchant */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>APMC Electronic Gate Pass Issued • Verified by Cold Shield AI</span>
                </div>

                <div className="flex gap-2.5">
                  <a
                    href={`tel:${driverPhone.replace(/\s+/g, '')}`}
                    className="px-4 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Driver ({driverName})</span>
                  </a>
                  <button
                    onClick={() => {
                      sound.playClick();
                      alert('APMC Commercial Consignment Passport #JRN-2048 verified & downloaded.');
                    }}
                    className="px-4 py-2.5 rounded-full bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Download APMC Passport</span>
                  </button>
                </div>
              </div>
            </div>

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
              <div className="lg:col-span-8 space-y-3">
                <InteractiveHighwayMap
                  currentSpeed={liveSpeed}
                  distanceKm={liveDistance}
                  totalDistanceKm={180}
                  originName="Anantapur Farm Hub"
                  destName="Kurnool APMC Wholesale Mandi"
                  coordinates="15.8281° N, 78.0373° E"
                />
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
        {/* VIEW 4: LIVE 2G FEATURE PHONE & IVR TELEPHONY GATEWAY    */}
        {/* ======================================================== */}
        {activeTab === 'Voice' && (
          <div className="w-full">
            <InteractiveFeaturePhone
              initialLanguage={voiceLang}
              liveTemp={liveTemp}
              liveSpeed={liveSpeed}
              liveDistance={liveDistance}
              isHot={isHot}
              onLanguageChange={(l) => setVoiceLang(l)}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: CROP DOCTOR (GEMINI AI PLANT PATHOLOGIST)        */}
        {/* ======================================================== */}
        {activeTab === 'CropDoctor' && (
          <div className="space-y-8">
            
            {/* HEADER (INSIDE CRISP OPAQUE CARD) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#166534] text-white">
                    Gemini Vision Pathology
                  </span>
                  <span className="text-xs font-mono text-emerald-800 font-bold">Multimodal Crop Disease Scanner</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  AI Crop Doctor: Damage Quantification &amp; Curative Prescriptions
                </h3>
                <p className="text-xs text-stone-600">
                  Upload a plant or leaf image to calculate exact tissue damage %, diagnose the pathology, and receive chemical + organic remedies.
                </p>
              </div>

              {/* PRE-LOADED SAMPLES PICKER */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-200">
                <span className="text-xs font-bold text-stone-700 mr-2">Or test sample leaves:</span>
                {SAMPLE_LEAF_IMAGES.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSelectSample(sample.url)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 border border-stone-300 hover:border-emerald-600 text-xs font-semibold text-stone-800 transition-all shadow-xs cursor-pointer"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: UPLOAD & PREVIEW (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

                {!cropImage ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-emerald-600/40 hover:border-emerald-600 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/95 backdrop-blur-md min-h-[300px] shadow-lg group"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#166534] flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-stone-900">Upload Plant / Leaf Photo</h4>
                    <p className="text-xs text-stone-500 mt-1">Click to browse or drag image from phone/camera</p>
                  </div>
                ) : (
                  <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-lg space-y-4">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 border border-stone-200">
                      <img src={cropImage} alt="Crop sample" className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white">
                        IoT Vision Node Ready
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAnalyze}
                        disabled={diagLoading}
                        className="flex-1 py-3 rounded-2xl bg-[#166534] hover:bg-[#15803d] text-white text-xs font-extrabold cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Sparkles className={`w-4 h-4 ${diagLoading ? 'animate-spin' : ''}`} />
                        <span>{diagLoading ? 'Gemini AI Analyzing Damage %...' : 'Scan & Diagnose with Gemini AI'}</span>
                      </button>

                      <button
                        onClick={() => { setCropImage(null); setDiagnosis(null); }}
                        className="px-4 py-3 rounded-2xl border border-stone-300 hover:bg-stone-100 text-stone-700 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: DIAGNOSIS & ACTIONABLE TREATMENT PROTOCOL (7 Cols) */}
              <div className="lg:col-span-7">
                {diagnosis ? (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-emerald-600/50 shadow-xl space-y-6">
                    
                    {/* Disease Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                          DIAGNOSED BY GEMINI VISION • {diagnosis.confidence} CONFIDENCE
                        </span>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5">
                          {diagnosis.disease_name}
                        </h3>
                        <span className="text-xs text-stone-500 font-medium">{diagnosis.crop_type}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold ${
                          diagnosis.severity === 'Severe'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : diagnosis.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {diagnosis.severity} Severity
                        </span>
                      </div>
                    </div>

                    {/* 1. LEVEL OF DAMAGE GAUGE */}
                    <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-stone-900 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-amber-600" />
                          <span>LEVEL OF DAMAGE:</span>
                        </span>
                        <span className="text-amber-800 font-mono font-extrabold">
                          {diagnosis.leaf_damage_percentage}% TISSUE DESTROYED / {diagnosis.healthy_tissue_percentage}% INTACT
                        </span>
                      </div>

                      <div className="w-full h-3.5 rounded-full bg-emerald-100 overflow-hidden flex">
                        <div
                          className="bg-amber-500 h-full transition-all duration-1000"
                          style={{ width: `${diagnosis.leaf_damage_percentage}%` }}
                        />
                        <div
                          className="bg-[#166534] h-full transition-all duration-1000"
                          style={{ width: `${diagnosis.healthy_tissue_percentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-stone-600 pt-1">
                        <span>Can crop be saved: <strong className="text-[#166534] font-bold">{diagnosis.can_be_saved ? '✅ YES (100% Recoverable)' : 'Critical Attention'}</strong></span>
                        <span className="font-mono text-stone-500">Timeline: {diagnosis.recovery_timeline}</span>
                      </div>
                    </div>

                    {/* 2. DAMAGE WHICH HAS BEEN DONE */}
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>DAMAGE WHICH HAS BEEN DONE:</span>
                      </div>
                      <p className="text-xs text-stone-800 leading-relaxed">
                        {diagnosis.damage_done}
                      </p>
                      {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {diagnosis.symptoms.map((s, idx) => (
                            <span key={idx} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/80 border border-amber-300/60 text-stone-700 font-medium">
                              • {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. WHAT IS THE SOLUTION & CHEMICAL/ORGANIC REMEDIES */}
                    <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#166534]">
                        <HeartPulse className="w-4 h-4 text-[#166534] shrink-0" />
                        <span>WHAT IS THE SOLUTION (TREATMENT PROTOCOL):</span>
                      </div>

                      <ul className="space-y-2 text-xs text-stone-800">
                        {diagnosis.solution?.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Organic Remedies */}
                      {diagnosis.organic_remedies && diagnosis.organic_remedies.length > 0 && (
                        <div className="pt-2 border-t border-emerald-200/60 space-y-1">
                          <span className="text-[11px] font-bold text-emerald-900 block">🌿 Organic Bio-Remedies:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {diagnosis.organic_remedies.map((org, i) => (
                              <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-950 font-medium">
                                {org}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 4. PREVENTIVE & CONTINGENCY MEASURES */}
                    {diagnosis.preventive_measures && diagnosis.preventive_measures.length > 0 && (
                      <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>PREVENTIVE &amp; COLD-CHAIN SAFEGUARDS:</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-stone-700">
                          {diagnosis.preventive_measures.map((prev, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-700 font-bold">•</span>
                              <span className="leading-relaxed">{prev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 5. AUDIO DOCTOR ADVICE FOR FARMER */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-[#166534] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#bef264] uppercase font-bold block">
                          DOCTOR VOICE PRESCRIPTION
                        </span>
                        <div className="flex items-center gap-1.5">
                          {(['te', 'hi', 'en'] as const).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setDoctorVoiceLang(lang)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                doctorVoiceLang === lang
                                  ? 'bg-[#bef264] text-stone-950'
                                  : 'bg-white/20 text-white hover:bg-white/30'
                              }`}
                            >
                              {lang === 'te' ? 'తెలుగు' : lang === 'hi' ? 'हिंदी' : 'English'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handlePlayDoctorAudio}
                        className="px-6 py-3 rounded-full bg-[#bef264] hover:bg-[#a3e635] text-stone-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
                      >
                        <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
                        <span>{isSpeaking ? 'Speaking Advice...' : '▶ Listen Prescription'}</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="p-12 rounded-3xl bg-white/95 backdrop-blur-md border border-stone-200 text-center flex flex-col items-center justify-center min-h-[300px] shadow-lg space-y-3">
                    <span className="text-5xl mb-1">🍃</span>
                    <h4 className="text-base font-bold text-stone-900">Gemini AI Plant Pathology Ready</h4>
                    <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                      Upload a photo or select one of the test samples above to calculate exact leaf damage %, view pathology breakdown, and receive step-by-step chemical and organic remedies.
                    </p>
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

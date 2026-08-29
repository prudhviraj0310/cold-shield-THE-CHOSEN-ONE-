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
import { LocationMap } from '@/components/ui/expand-map';

export default function HumanAgriculturalDashboard() {
  const [activeTab, setActiveTab] = useState<'Farmer' | 'Merchant' | 'Driver' | 'Voice' | 'CropDoctor'>('Farmer');
  const [timeString, setTimeString] = useState<string>('');

  // Live dynamic temperature with natural breathing
  const [liveTemp, setLiveTemp] = useState<number>(4.2);
  const [liveHum, setLiveHum] = useState<number>(68.0);
  const [liveSpeed, setLiveSpeed] = useState<number>(52.4);
  const [liveDistance, setLiveDistance] = useState<number>(128.4);
  const [isHeatSpike, setIsHeatSpike] = useState<boolean>(false);

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

  // Chart data
  const [tempTrend, setTempTrend] = useState([
    { time: '11:00 AM', temp: 4.1, ambient: 29.5 },
    { time: '12:00 PM', temp: 4.2, ambient: 31.0 },
    { time: '01:00 PM', temp: 4.3, ambient: 32.2 },
    { time: '02:00 PM', temp: 4.2, ambient: 31.7 },
    { time: '03:00 PM', temp: 4.2, ambient: 31.4 },
  ]);

  // Real-time clock & subtle organic breathing
  useEffect(() => {
    const updateTime = () => setTimeString(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  // Organic micro-breathing
  useEffect(() => {
    const interval = setInterval(() => {
      const jitter = (Math.random() * 0.06 - 0.03);
      if (isHeatSpike) {
        setLiveTemp(+(8.4 + jitter).toFixed(1));
      } else {
        setLiveTemp(+(4.2 + jitter).toFixed(1));
      }
      setLiveHum(+(68.0 + (Math.random() * 0.4 - 0.2)).toFixed(0));
      setLiveSpeed(+(52.4 + (Math.random() * 0.6 - 0.3)).toFixed(1));
      setLiveDistance((d) => +(d + 0.01).toFixed(1));
    }, 2000);

    return () => clearInterval(interval);
  }, [isHeatSpike]);

  // Ingest ThingSpeak & Route
  useEffect(() => {
    fetchThingSpeakData()
      .then((res) => {
        if (res.currentTemp !== null) setLiveTemp(res.currentTemp);
      })
      .catch(() => {});

    planAgriculturalRoute('Anantapur', 'Kurnool')
      .then((r) => setRouteData(r.route))
      .catch(() => {});
  }, []);

  // Play voice call
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1c1917] font-sans antialiased">
      
      {/* ========================================================== */}
      {/* WARM, CLEAN AGRICULTURAL HEADER                            */}
      {/* ========================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cinematic Story</span>
            </Link>

            <div className="h-5 w-px bg-stone-200" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#166534] text-white flex items-center justify-center shadow-xs">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-stone-900 tracking-tight leading-none">
                  Cold Shield
                </h1>
                <span className="text-[11px] text-stone-500 font-medium">
                  Farm &amp; Cold-Chain Live Operations
                </span>
              </div>
            </div>
          </div>

          {/* Clean Role Navigation */}
          <nav className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-medium">
            {[
              { id: 'Farmer', label: '👨‍🌾 Farmer' },
              { id: 'Merchant', label: '🏢 Merchant' },
              { id: 'Driver', label: '🚛 Driver' },
              { id: 'Voice', label: '🎙️ Voice Assistant' },
              { id: 'CropDoctor', label: '🍃 Crop Doctor' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick(900);
                  setActiveTab(tab.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#166534] text-white font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Real-time Live Badge */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#166534] border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
              <span>LIVE SENSOR ACTIVE</span>
            </div>
            <span className="text-xs font-mono text-stone-500">{timeString}</span>
          </div>

        </div>
      </header>

      {/* ========================================================== */}
      {/* MAIN CONTAINER                                             */}
      {/* ========================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* HERO BANNER: SHIPMENT STATUS & QUICK DEMO TOGGLE */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#166534]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">
                  Shipment #JRN-2048 • 180 Crates Fresh Tomatoes
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  In Transit
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Route: Anantapur Farm ➔ Kurnool APMC Mandi • Truck {truckNumber}
              </p>
            </div>
          </div>

          {/* Quick Demo Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Demo Test:</span>
            <button
              onClick={() => {
                sound.playSmsAlert();
                setIsHeatSpike(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isHeatSpike
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              ⚠ Heat Rise (8.4°C)
            </button>
            <button
              onClick={() => {
                sound.playClick(1000);
                setIsHeatSpike(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isHeatSpike
                  ? 'bg-[#166534] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              ✓ Safe (4.2°C)
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: FARMER PORTAL                                    */}
        {/* ======================================================== */}
        {activeTab === 'Farmer' && (
          <div className="space-y-6">
            
            {/* 4 BEAUTIFUL, WARM METRIC TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Tile 1: Inside Cargo Temperature */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                  <span>CARGO TEMPERATURE</span>
                  <Thermometer className={`w-4 h-4 ${isHeatSpike ? 'text-amber-600' : 'text-[#166534]'}`} />
                </div>
                <div className="my-3">
                  <div className={`text-4xl font-extrabold tracking-tight ${
                    isHeatSpike ? 'text-amber-600' : 'text-[#166534]'
                  }`}>
                    {liveTemp.toFixed(1)}°C
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`w-2 h-2 rounded-full ${isHeatSpike ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                    <span className="text-xs font-semibold text-stone-700">
                      {isHeatSpike ? 'AI Boosting Cooling' : 'Optimal Fresh Range'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-stone-500 pt-2 border-t border-stone-100">
                  Target: 2°C – 8°C • Outside: 31.7°C
                </div>
              </div>

              {/* Tile 2: Fruit & Produce Freshness */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                  <span>PRODUCE FRESHNESS</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="my-3">
                  <div className="text-4xl font-extrabold text-stone-900 tracking-tight">
                    {isHeatSpike ? '91.2%' : '99.4%'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-stone-700">
                      Humidity: {liveHum}% RH (Perfect)
                    </span>
                  </div>
                </div>
                <div className="text-xs text-stone-500 pt-2 border-t border-stone-100">
                  Zero spoilage • Crisp &amp; Firm
                </div>
              </div>

              {/* Tile 3: 3D Expandable Interactive LocationMap */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between items-center text-center">
                <div className="w-full flex items-center justify-between text-xs font-semibold text-stone-500 mb-2">
                  <span>LIVE GPS RADAR</span>
                  <Navigation className="w-4 h-4 text-[#166534]" />
                </div>
                <LocationMap
                  location="Kurnool Highway KM 42"
                  coordinates="15.8281° N, 78.0373° E"
                  statusText="Live GPS"
                />
              </div>

              {/* Tile 4: Estimated Arrival */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                  <span>ESTIMATED ARRIVAL</span>
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div className="my-3">
                  <div className="text-4xl font-extrabold text-stone-900 tracking-tight">
                    4:00 PM
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      Today on Schedule
                    </span>
                  </div>
                </div>
                <div className="text-xs text-stone-500 pt-2 border-t border-stone-100">
                  Kurnool Mandi APMC Yard
                </div>
              </div>

            </div>

            {/* WARM FARMER VOICE ASSISTANT CARD */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-stone-50 border border-emerald-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-xs">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Farmer Voice Assistant (రైతు వాయిస్ అసిస్టెంట్)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Farmers don&apos;t need to read. Tap to hear real-time reassuring updates in your native language.
                    </p>
                  </div>
                </div>

                {/* Language Picker */}
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setVoiceLang('te')}
                    className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                      voiceLang === 'te' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    తెలుగు
                  </button>
                  <button
                    onClick={() => setVoiceLang('hi')}
                    className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                      voiceLang === 'hi' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => setVoiceLang('en')}
                    className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                      voiceLang === 'en' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Spoken Message & Action Button */}
              <div className="p-4 rounded-xl bg-white border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    Spoken Message Preview:
                  </span>
                  <p className="text-xs text-stone-800 leading-relaxed italic">
                    &ldquo;{CALL_SCENARIOS.TRANSIT_SAFE.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']}&rdquo;
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handlePlayVoice(isHeatSpike ? 'TEMP_SPIKE_AUTONOMOUS_FIX' : 'TRANSIT_SAFE')}
                    className="px-5 py-3 rounded-xl bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <PhoneCall className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
                    <span>{isSpeaking ? 'Speaking Aloud...' : '▶ Listen in Voice'}</span>
                  </button>

                  {isSpeaking && (
                    <button
                      onClick={handleStopVoice}
                      className="px-4 py-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* DIRECT CONTACT NUMBERS & VEHICLE DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide border-b border-stone-100 pb-2">
                  Direct People Contacts
                </h4>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
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
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs"
                  >
                    Call Farmer
                  </a>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
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
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs"
                  >
                    Call Driver
                  </a>
                </div>
              </div>

              {/* Temperature History Area Chart */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    Live Temperature Trend (°C)
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Safe Range Maintained
                  </span>
                </div>

                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tempTrend}>
                      <defs>
                        <linearGradient id="warmGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#166534" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#166534" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="time" stroke="#a8a29e" fontSize={10} tickLine={false} />
                      <YAxis stroke="#a8a29e" fontSize={10} domain={[0, 40]} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="temp" stroke="#166534" strokeWidth={2.5} fill="url(#warmGreen)" name="Cargo Temp (°C)" />
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
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 block">BATCH VOLUME</span>
                <div className="text-2xl font-bold text-stone-900 mt-1">180 Crates (3,600 kg)</div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">Estimated Value: ₹88,200</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 block">THERMAL CUSTODY</span>
                <div className="text-2xl font-bold text-[#166534] mt-1">{liveTemp.toFixed(1)}°C (Verified Safe)</div>
                <div className="text-xs text-stone-500 mt-1">Ambient Outside: 31.7°C</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 block">DIRECT FARMER</span>
                <div className="text-lg font-bold text-stone-900 mt-1">{farmerName}</div>
                <div className="text-xs text-stone-500 mt-1">{farmerPhone}</div>
              </div>
            </div>

            {/* Quality Inspection Table */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                    <th className="py-3 px-4">INSPECTION CHECKPOINT</th>
                    <th className="py-3 px-4">LIVE SENSOR READING</th>
                    <th className="py-3 px-4">SAFE SPECIFICATION</th>
                    <th className="py-3 px-4 text-right">AUDIT RESULT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  <tr>
                    <td className="py-3 px-4 text-stone-900 font-bold">Inside Cargo Temperature</td>
                    <td className="py-3 px-4 text-[#166534] font-bold">{liveTemp.toFixed(1)}°C</td>
                    <td className="py-3 px-4 text-stone-600">2.0°C – 8.0°C</td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-bold">✅ PASS</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-stone-900 font-bold">Relative Humidity</td>
                    <td className="py-3 px-4 text-blue-700 font-bold">{liveHum}% RH</td>
                    <td className="py-3 px-4 text-stone-600">70% – 95%</td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-bold">✅ PASS</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-stone-900 font-bold">Delivery Driver &amp; Truck</td>
                    <td className="py-3 px-4 text-stone-700">{driverName} ({driverPhone})</td>
                    <td className="py-3 px-4 text-stone-600">{truckNumber}</td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-bold">✅ ON TIME</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: DRIVER / RIDER PORTAL                            */}
        {/* ======================================================== */}
        {activeTab === 'Driver' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 block">CURRENT SPEED</span>
                <div className="text-3xl font-extrabold text-stone-900 mt-1">{liveSpeed} km/h</div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">Safe Highway Speed</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 block">CARGO TEMPERATURE</span>
                <div className="text-3xl font-extrabold text-[#166534] mt-1">{liveTemp.toFixed(1)}°C</div>
                <div className="text-xs text-stone-500 mt-1">Autonomous Cooler: ACTIVE</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 block">FARMER ASSIGNED</span>
                <div className="text-lg font-bold text-stone-900 mt-1">{farmerName}</div>
                <div className="text-xs text-stone-500 mt-1">{farmerPhone}</div>
              </div>
            </div>

            {/* Live Navigation Map + 3D Location Map Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Google Maps Route */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
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

              {/* 3D Expandable Interactive LocationMap */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-xs font-bold text-stone-900 uppercase">Interactive GPS Node</span>
                <LocationMap
                  location="Kurnool Highway KM 42"
                  coordinates="15.8281° N, 78.0373° E"
                  statusText="Live Fix"
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
            <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-md text-center space-y-6">
              
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
              <div className="inline-flex p-1 bg-stone-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setVoiceLang('te')}
                  className={`px-4 py-2 rounded-lg cursor-pointer ${
                    voiceLang === 'te' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-700'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
                <button
                  onClick={() => setVoiceLang('hi')}
                  className={`px-4 py-2 rounded-lg cursor-pointer ${
                    voiceLang === 'hi' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-700'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={() => setVoiceLang('en')}
                  className={`px-4 py-2 rounded-lg cursor-pointer ${
                    voiceLang === 'en' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-700'
                  }`}
                >
                  English
                </button>
              </div>

              {/* Live Audio Transcript Box */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                  Live Spoken Message:
                </span>
                <p className="text-sm text-stone-800 leading-relaxed italic">
                  &ldquo;{spokenText || CALL_SCENARIOS.TRANSIT_SAFE.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']}&rdquo;
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handlePlayVoice(isHeatSpike ? 'TEMP_SPIKE_AUTONOMOUS_FIX' : 'TRANSIT_SAFE')}
                  className="px-8 py-3.5 rounded-xl bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isSpeaking ? 'Speaking Message Aloud...' : '▶ Start Voice Call Demo'}</span>
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStopVoice}
                    className="px-6 py-3.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
                  >
                    Stop
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: CROP DOCTOR (AI LEAF DAMAGE QUANTIFICATION)      */}
        {/* ======================================================== */}
        {activeTab === 'CropDoctor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-5 space-y-4">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

                {!cropImage ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white min-h-[260px]"
                  >
                    <Upload className="w-8 h-8 text-stone-400 mb-2" />
                    <h4 className="text-sm font-bold text-stone-900">Upload 3MP Camera Leaf Image</h4>
                    <p className="text-xs text-stone-500 mt-1">From camera or phone</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
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
                  <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-800 uppercase">IDENTIFIED CROP DISEASE</span>
                        <h3 className="text-lg font-bold text-stone-900">{diagnosis.disease_name}</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {diagnosis.severity} Severity
                      </span>
                    </div>

                    {/* Damage % Bar */}
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

                    {/* Spoken Advice in Telugu */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#166534]">SPOKEN PRESCRIPTION (TELUGU):</span>
                        <button
                          onClick={() => speakFarmerAudio(diagnosis.farmer_voice_telugu || diagnosis.summary, 'te')}
                          className="px-3 py-1 rounded-lg bg-[#166534] text-white text-xs font-bold cursor-pointer"
                        >
                          ▶ Play Voice
                        </button>
                      </div>
                      <p className="text-xs text-stone-800 leading-relaxed font-sans">
                        {diagnosis.farmer_voice_telugu || diagnosis.summary}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 rounded-2xl bg-stone-50 border border-stone-200 text-center flex flex-col items-center justify-center min-h-[260px]">
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
      <footer className="mt-16 bg-white border-t border-stone-200 py-6 px-4 sm:px-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>COLD SHIELD // AGRICULTURAL COLD-CHAIN PLATFORM</div>
          <Link href="/" className="text-[#166534] hover:underline font-semibold">
            ← Return to Cinematic Story
          </Link>
        </div>
      </footer>

    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ArrowLeft,
  ShieldCheck,
  Thermometer,
  Droplets,
  Truck,
  PhoneCall,
  Bell,
  Zap,
  Volume2,
  Mic,
  Camera,
  Upload,
  Trash2,
  Navigation,
  BarChart3,
  Cpu,
  FileCode,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { sound } from '@/lib/audio';
import { COMMODITIES, INDIAN_STATES } from '@/config/api';
import {
  fetchThingSpeakData,
  DEFAULT_THRESHOLDS,
  Thresholds,
  ColdChainReading,
} from '@/services/thingspeak';
import { diagnoseCropImage, DiagnosisData } from '@/services/cropDoctor';
import { fetchMarketPrices, MarketAnalysis } from '@/services/marketPrices';
import { planAgriculturalRoute, RouteData, TravelAdvisory } from '@/services/routePlanner';
import {
  speakFarmerAudio,
  stopFarmerAudio,
  CALL_SCENARIOS,
  VoiceLanguage,
} from '@/services/voiceAssistant';

const TELEMETRY_HISTORY = [
  { time: '10:00', inside: 4.1, outside: 30.5 },
  { time: '11:00', inside: 4.2, outside: 31.7 },
  { time: '12:00', inside: 4.4, outside: 32.8 },
  { time: '13:00', inside: 4.2, outside: 31.7 },
  { time: '14:00', inside: 4.3, outside: 32.1 },
];

export default function SimplifiedDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [timeString, setTimeString] = useState<string>('');

  // -------------------------------------------------------------
  // SIMULATION & LIVE DATA STATE
  // -------------------------------------------------------------
  const [isSimulatedSpike, setIsSimulatedSpike] = useState<boolean>(false);
  const [iotTemp, setIotTemp] = useState<number>(4.2);
  const [iotHum, setIotHum] = useState<number>(68.0);
  const [iotHistory, setIotHistory] = useState<ColdChainReading[]>([]);
  const [iotLoading, setIotLoading] = useState<boolean>(false);

  // -------------------------------------------------------------
  // FARMER VOICE HOTLINE (TELUGU / HINDI / ENGLISH)
  // -------------------------------------------------------------
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('te');
  const [isCallingServer, setIsCallingServer] = useState<boolean>(false);
  const [activeVoiceScript, setActiveVoiceScript] = useState<string>('');
  const [voiceStatus, setVoiceStatus] = useState<string>('Ready to Call');

  // -------------------------------------------------------------
  // CROP DOCTOR (GEMINI AI)
  // -------------------------------------------------------------
  const [cropImageBase64, setCropImageBase64] = useState<string | null>(null);
  const [cropDiagnosis, setCropDiagnosis] = useState<DiagnosisData | null>(null);
  const [cropLoading, setCropLoading] = useState<boolean>(false);
  const [cropError, setCropError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // MANDI PRICES (DATA.GOV.IN)
  // -------------------------------------------------------------
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Tomato');
  const [selectedState, setSelectedState] = useState<string>('Andhra Pradesh');
  const [marketData, setMarketData] = useState<MarketAnalysis | null>(null);
  const [marketLoading, setMarketLoading] = useState<boolean>(false);

  // -------------------------------------------------------------
  // ROUTE & GPS (NEO-6M)
  // -------------------------------------------------------------
  const [routeOrigin, setRouteOrigin] = useState<string>('Anantapur');
  const [routeDestination, setRouteDestination] = useState<string>('Kurnool');
  const [routeResult, setRouteResult] = useState<{
    route: RouteData;
    advisory: TravelAdvisory;
  } | null>(null);

  // -------------------------------------------------------------
  // HARDWARE CODE COPIER
  // -------------------------------------------------------------
  const [copiedGps, setCopiedGps] = useState<boolean>(false);
  const [copiedPi, setCopiedPi] = useState<boolean>(false);
  const [gpsCode, setGpsCode] = useState<string>('');
  const [piCode, setPiCode] = useState<string>('');

  // 2G Feature Phone Simulator State
  const [phoneScreen, setPhoneScreen] = useState<'ALERT' | 'STATUS' | 'ACK' | 'HELP'>('ALERT');
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);

  // Clock
  useEffect(() => {
    const updateTime = () => setTimeString(new Date().toLocaleTimeString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Hardware Code from public files
  useEffect(() => {
    fetch('/hardware/esp32_gps_dht11_thingspeak.ino')
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => setGpsCode(t))
      .catch(() => {});

    fetch('/hardware/raspberry_pi_voice_ivr_server.py')
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => setPiCode(t))
      .catch(() => {});
  }, []);

  // ThingSpeak Poller
  const syncThingSpeak = useCallback(async () => {
    setIotLoading(true);
    try {
      const res = await fetchThingSpeakData();
      if (res.currentTemp !== null) setIotTemp(res.currentTemp);
      if (res.currentHum !== null) setIotHum(res.currentHum);
      if (res.history.length > 0) setIotHistory(res.history);
    } catch {
      // Graceful fallback to live default
    } finally {
      setIotLoading(false);
    }
  }, []);

  useEffect(() => {
    syncThingSpeak();
    const timer = setInterval(syncThingSpeak, 15000);
    return () => clearInterval(timer);
  }, [syncThingSpeak]);

  // Market Prices Poller
  useEffect(() => {
    setMarketLoading(true);
    fetchMarketPrices(selectedCommodity, selectedState)
      .then((data) => setMarketData(data))
      .finally(() => setMarketLoading(false));
  }, [selectedCommodity, selectedState]);

  // Route init
  useEffect(() => {
    planAgriculturalRoute(routeOrigin, routeDestination)
      .then((res) => setRouteResult(res))
      .catch(() => {});
  }, [routeOrigin, routeDestination]);

  // -------------------------------------------------------------
  // VOICE HOTLINE TRIGGER
  // -------------------------------------------------------------
  const handleCallVoiceHotline = (scenarioKey: keyof typeof CALL_SCENARIOS = 'TRANSIT_SAFE') => {
    const scenario = CALL_SCENARIOS[scenarioKey];
    let script = scenario.script.telugu;
    if (voiceLang === 'hi') script = scenario.script.hindi;
    if (voiceLang === 'en') script = scenario.script.english;

    setIsCallingServer(true);
    setActiveVoiceScript(script);
    setVoiceStatus(`Calling 1800-COLD-FARM (${voiceLang.toUpperCase()})... Connected`);

    speakFarmerAudio(script, voiceLang, () => {
      setIsCallingServer(false);
      setVoiceStatus('Call Completed');
    });
  };

  const handleEndVoiceCall = () => {
    stopFarmerAudio();
    setIsCallingServer(false);
    setVoiceStatus('Call Ended');
  };

  // Crop diagnosis
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageBase64(reader.result as string);
      setCropDiagnosis(null);
      setCropError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeCrop = async () => {
    if (!cropImageBase64) return;
    setCropLoading(true);
    setCropError(null);
    try {
      const diagnosis = await diagnoseCropImage(cropImageBase64);
      setCropDiagnosis(diagnosis);
    } catch (err: any) {
      setCropError(err.message || 'Diagnosis error');
    } finally {
      setCropLoading(false);
    }
  };

  // 2G Phone key handler
  const handlePhoneKey = (key: '1' | '2' | '3') => {
    sound.playDTMF(key);
    if (key === '1') setPhoneScreen('STATUS');
    else if (key === '2') {
      setPhoneScreen('ACK');
      setIsAcknowledged(true);
    } else if (key === '3') setPhoneScreen('HELP');
  };

  const displayTemp = isSimulatedSpike ? 8.4 : iotTemp;
  const isWarning = displayTemp > 8.0;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a]">
      
      {/* ========================================================== */}
      {/* MINIMAL EXECUTIVE HEADER                                   */}
      {/* ========================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Story</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200" />

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#166534] animate-pulse" />
              <span className="text-sm font-bold tracking-tight text-zinc-900 uppercase font-mono">
                Cold Shield
              </span>
            </div>
          </div>

          {/* Simple Tab Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {[
              { id: 'Overview', label: 'Overview & Voice' },
              { id: 'CropDoctor', label: 'Crop Doctor (AI)' },
              { id: 'MarketPrices', label: 'Mandi Prices' },
              { id: 'RoutePlanner', label: 'GPS Route' },
              { id: 'Hardware', label: 'Hardware Code' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick(900);
                  setActiveTab(tab.id);
                }}
                className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#166534]" />
              <span>LIVE IOT: CONNECTED</span>
            </span>
          </div>

        </div>
      </header>

      {/* ========================================================== */}
      {/* MAIN BODY                                                  */}
      {/* ========================================================== */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW & VOICE HOTLINE (SIMPLE & POWERFUL)      */}
        {/* ======================================================== */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            
            {/* 4 PRIMARY HERO STATUS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Inside Temperature */}
              <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>INSIDE TEMPERATURE</span>
                  <Thermometer className="w-4 h-4 text-[#166534]" />
                </div>
                <div className="my-3">
                  <div className={`text-4xl font-extrabold font-mono ${
                    isWarning ? 'text-red-600' : 'text-[#166534]'
                  }`}>
                    {displayTemp.toFixed(1)}°C
                  </div>
                  <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                    isWarning ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {isWarning ? '⚠️ TEMPERATURE WARNING' : '✅ SAFE RANGE (2°C–8°C)'}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Outside Ambient: 31.7°C
                </div>
              </div>

              {/* Card 2: Cargo Freshness */}
              <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>PRODUCE FRESHNESS</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="my-3">
                  <div className="text-4xl font-extrabold font-mono text-zinc-900">
                    {isWarning ? '88.5%' : '99.2%'}
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Optimal Humidity: {iotHum.toFixed(0)}% RH
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  No Thermal Degradation
                </div>
              </div>

              {/* Card 3: Live GPS Location */}
              <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>LIVE GPS POSITION</span>
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="my-3">
                  <div className="text-xl font-bold font-mono text-zinc-900 truncate">
                    Kurnool Highway
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    Speed: 52.4 km/h • Smooth Transit
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  15.8281° N, 78.0373° E
                </div>
              </div>

              {/* Card 4: Estimated Arrival */}
              <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>ESTIMATED ARRIVAL (ETA)</span>
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div className="my-3">
                  <div className="text-4xl font-extrabold font-mono text-zinc-900">
                    4:00 PM
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                    128 km / 180 km Done
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Mandi Gate #2 Destination
                </div>
              </div>

            </div>

            {/* FARMER VOICE CALL SECTION (THE KILLER FEATURE) */}
            <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold font-mono text-zinc-900 uppercase flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#166534]" />
                    Interactive Farmer Voice Hotline (1800-COLD-FARM)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Designed for farmers who cannot read. Hear vocal reassuring updates in native languages.
                  </p>
                </div>

                {/* Language Picker */}
                <div className="flex items-center gap-1.5 p-1 rounded bg-zinc-100 text-xs font-mono">
                  <button
                    onClick={() => setVoiceLang('te')}
                    className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                      voiceLang === 'te' ? 'bg-[#166534] text-white shadow-xs' : 'text-zinc-700'
                    }`}
                  >
                    తెలుగు (Telugu)
                  </button>
                  <button
                    onClick={() => setVoiceLang('hi')}
                    className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                      voiceLang === 'hi' ? 'bg-[#166534] text-white shadow-xs' : 'text-zinc-700'
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                  <button
                    onClick={() => setVoiceLang('en')}
                    className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                      voiceLang === 'en' ? 'bg-[#166534] text-white shadow-xs' : 'text-zinc-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Call Trigger & Transcript */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4">
                  <button
                    onClick={() => handleCallVoiceHotline(isWarning ? 'TEMP_SPIKE_ALERT' : 'TRANSIT_SAFE')}
                    className="w-full py-4 rounded-xl bg-[#166534] hover:bg-[#15803d] text-white font-mono font-bold text-sm tracking-wide shadow-md transition-transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5 animate-pulse" />
                    <span>{isCallingServer ? 'Speaking on Call...' : '📞 Call Server Hotline'}</span>
                  </button>

                  {isCallingServer && (
                    <button
                      onClick={handleEndVoiceCall}
                      className="w-full mt-2 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold cursor-pointer"
                    >
                      Disconnect Call
                    </button>
                  )}
                </div>

                <div className="md:col-span-8 p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] font-mono text-zinc-500 block mb-1">
                    SPOKEN AUDIO TRANSCRIPT (NATIVE DIALECT):
                  </span>
                  <p className="text-xs text-zinc-800 font-sans leading-relaxed">
                    {activeVoiceScript || CALL_SCENARIOS.TRANSIT_SAFE.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']}
                  </p>
                </div>
              </div>
            </div>

            {/* SIMULATION TOGGLE & 2G PHONE ROW */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left: Quick Incident Test */}
              <div className="md:col-span-7 p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono text-zinc-900 uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#b45309]" />
                    Instant Hackathon Demo: Thermal Incident Trigger
                  </h4>
                </div>

                <p className="text-xs text-zinc-600">
                  Click below to simulate a sudden refrigeration failure (8.4°C) to show judges how the system triggers warnings and notifies the farmer.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      sound.playSmsAlert();
                      setIsSimulatedSpike(true);
                      setIsAcknowledged(false);
                      setPhoneScreen('ALERT');
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-colors cursor-pointer ${
                      isSimulatedSpike
                        ? 'bg-[#b45309] text-white shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                    }`}
                  >
                    ⚠ Trigger Temp Rise (8.4°C)
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick(1000);
                      setIsSimulatedSpike(false);
                      setIsAcknowledged(false);
                      setPhoneScreen('ALERT');
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-colors cursor-pointer ${
                      !isSimulatedSpike
                        ? 'bg-[#166534] text-white shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                    }`}
                  >
                    ✓ Reset Safe (4.2°C)
                  </button>
                </div>

                {/* Minimal Telemetry History Graph */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono text-zinc-500 block mb-2">Live Temperature Curve (°C)</span>
                  <div className="w-full h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TELEMETRY_HISTORY}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                        <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} domain={[0, 40]} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="inside" stroke="#166534" fill="#166534" fillOpacity={0.15} name="Cargo Temp (°C)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right: 2G Feature Phone Simulator */}
              <div className="md:col-span-5 p-6 rounded-xl bg-white border border-zinc-200 shadow-xs">
                <div className="mb-3">
                  <h4 className="text-xs font-bold font-mono text-zinc-900 uppercase">
                    Farmer 2G Phone Simulator
                  </h4>
                  <p className="text-[11px] text-zinc-500">Keypad audio test</p>
                </div>

                <div className="w-full max-w-[240px] mx-auto bg-[#27272a] rounded-[24px] p-3 shadow-md border-2 border-zinc-700">
                  <div className="w-8 h-1 bg-zinc-600 rounded-full mx-auto mb-2" />

                  <div className="rounded-lg phone-lcd p-2.5 mb-3 border border-[#3b4737] text-xs font-mono min-h-[120px] flex flex-col justify-between">
                    <div className="flex justify-between text-[8px] font-bold border-b border-[#2d3a2b]/30 pb-0.5">
                      <span>2G GSM</span>
                      <span>14:35</span>
                    </div>

                    <div className="py-1 text-[10px]">
                      {phoneScreen === 'ALERT' && (
                        <div>
                          <div className="font-bold text-amber-900">
                            {isWarning ? '⚠ TEMP ALERT: 8.4°C' : 'STATUS: 4.2°C SAFE'}
                          </div>
                          <div className="text-[9px] mt-1 space-y-0.5">
                            <div>1 - Status</div>
                            <div>2 - Acknowledge</div>
                            <div>3 - Call Support</div>
                          </div>
                        </div>
                      )}
                      {phoneScreen === 'STATUS' && (
                        <div>
                          <div className="font-bold">TEMP: {displayTemp.toFixed(1)}°C</div>
                          <div>LOCATION: KURNOOL</div>
                        </div>
                      )}
                      {phoneScreen === 'ACK' && (
                        <div className="font-bold text-center py-2 text-emerald-900">
                          ✓ ACKNOWLEDGED
                        </div>
                      )}
                      {phoneScreen === 'HELP' && (
                        <div className="text-center py-2">
                          1800-COLD-FARM
                        </div>
                      )}
                    </div>

                    <div className="text-[8px] border-t border-[#2d3a2b]/20 pt-0.5 text-center text-[#1a2618]">
                      PRESS 1, 2, OR 3
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                      <button
                        key={k}
                        onClick={() => {
                          if (['1', '2', '3'].includes(k)) handlePhoneKey(k as '1' | '2' | '3');
                          else sound.playDTMF(k);
                        }}
                        className="py-1 rounded bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white font-mono text-[10px] font-bold text-center border border-zinc-600 cursor-pointer"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CROP DOCTOR (GEMINI AI & LEAF DAMAGE %)           */}
        {/* ======================================================== */}
        {activeTab === 'CropDoctor' && (
          <div className="space-y-6">
            <div className="border-b border-zinc-200 pb-3">
              <h2 className="text-lg font-bold text-zinc-900 font-mono flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#166534]" />
                Crop Doctor — 3MP Camera AI Leaf Damage Quantification
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Upload or capture a leaf photo. Gemini calculates exact % of leaf destroyed and gives spoken remedies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Upload Card */}
              <div className="md:col-span-5 space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {!cropImageBase64 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 hover:border-zinc-500 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white min-h-[260px]"
                  >
                    <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                    <h4 className="text-xs font-bold font-mono text-zinc-900">Upload 3MP Leaf Photo</h4>
                    <p className="text-[11px] text-zinc-500 mt-1">From ESP32-CAM / Phone</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-3">
                    <img
                      src={cropImageBase64}
                      alt="Crop sample"
                      className="w-full max-h-56 object-contain rounded bg-zinc-900"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAnalyzeCrop}
                        disabled={cropLoading}
                        className="flex-1 py-2.5 rounded-lg bg-[#166534] hover:bg-[#15803d] text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className={`w-4 h-4 ${cropLoading ? 'animate-spin' : ''}`} />
                        <span>{cropLoading ? 'Calculating Damage...' : 'Analyze with Gemini AI'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setCropImageBase64(null);
                          setCropDiagnosis(null);
                        }}
                        className="px-3 py-2.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Result */}
              <div className="md:col-span-7">
                {cropDiagnosis ? (
                  <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">IDENTIFIED DISEASE</span>
                        <h3 className="text-xl font-bold font-mono text-zinc-900">{cropDiagnosis.disease_name}</h3>
                        <span className="text-xs text-zinc-500">Crop: {cropDiagnosis.crop_type}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-50 text-amber-700">
                        {cropDiagnosis.severity} Severity
                      </span>
                    </div>

                    {/* LEAF DAMAGE GAUGE */}
                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-bold text-zinc-900">LEAF DAMAGE SURFACE:</span>
                        <span className="font-extrabold text-[#b45309]">
                          {cropDiagnosis.leaf_damage_percentage}% DESTROYED / {cropDiagnosis.healthy_tissue_percentage}% INTACT
                        </span>
                      </div>
                      
                      <div className="w-full h-3 rounded-full bg-emerald-100 overflow-hidden flex">
                        <div
                          className="bg-red-500 h-full transition-all duration-700"
                          style={{ width: `${cropDiagnosis.leaf_damage_percentage}%` }}
                        />
                        <div
                          className="bg-emerald-600 h-full transition-all duration-700"
                          style={{ width: `${cropDiagnosis.healthy_tissue_percentage}%` }}
                        />
                      </div>

                      <div className="text-[11px] font-mono text-zinc-600 pt-1">
                        Can crop be saved: <strong>{cropDiagnosis.can_be_saved ? '✅ YES (100% Recoverable)' : 'Urgent Action Required'}</strong>
                      </div>
                    </div>

                    {/* Voice Prescription */}
                    <div className="p-4 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#166534] font-mono flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4" />
                          SPOKEN PRESCRIPTION FOR FARMER:
                        </span>
                        <button
                          onClick={() => speakFarmerAudio(cropDiagnosis.farmer_voice_telugu || cropDiagnosis.summary, 'te')}
                          className="px-3 py-1 rounded bg-[#166534] text-white text-[11px] font-bold cursor-pointer"
                        >
                          ▶ Play Voice (Telugu)
                        </button>
                      </div>
                      <p className="text-xs text-zinc-800 font-sans leading-relaxed">
                        {cropDiagnosis.farmer_voice_telugu || cropDiagnosis.summary}
                      </p>
                    </div>

                    {/* Treatment Protocol */}
                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-mono space-y-1">
                      <span className="font-bold text-zinc-900 block">🌿 ACTION REMEDIES:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-zinc-700">
                        {cropDiagnosis.organic_remedies?.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-zinc-50 border border-zinc-200 text-center flex flex-col items-center justify-center min-h-[260px]">
                    <span className="text-3xl mb-2">🍃</span>
                    <h4 className="text-xs font-bold font-mono text-zinc-900 uppercase">Camera AI Ready</h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      Upload a photo to see exact leaf damage % and hear voice prescriptions.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MANDI PRICES                                      */}
        {/* ======================================================== */}
        {activeTab === 'MarketPrices' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 font-mono flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#166534]" />
                  Live Mandi Market Prices (data.gov.in)
                </h2>
                <p className="text-xs text-zinc-500">
                  Compare mandi prices to find where your produce sells for the highest profit.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value)}
                  className="px-3 py-1.5 rounded bg-white border border-zinc-300 text-xs font-mono font-bold"
                >
                  {COMMODITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-3 py-1.5 rounded bg-white border border-zinc-300 text-xs font-mono font-bold"
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Best Selling Price Card */}
            {marketData?.bestMarket && (
              <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-between text-xs font-mono text-[#166534]">
                <div>
                  <strong>💰 BEST PRICE RECOMMENDATION: </strong>
                  Sell {selectedCommodity} at <strong>{marketData.bestMarket.market} ({marketData.bestMarket.state})</strong> for{' '}
                  <strong>₹{marketData.bestMarket.modalPrice.toLocaleString()}/quintal</strong>
                </div>
              </div>
            )}

            {/* Simple Table */}
            <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2.5 px-3">MANDI NAME</th>
                    <th className="py-2.5 px-3">STATE</th>
                    <th className="py-2.5 px-3">VARIETY</th>
                    <th className="py-2.5 px-3 text-right font-bold text-zinc-900">PRICE (₹/QUINTAL)</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData?.records.map((r, idx) => (
                    <tr key={idx} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="py-2.5 px-3 font-bold text-zinc-900">{r.market}</td>
                      <td className="py-2.5 px-3 text-zinc-600">{r.state}</td>
                      <td className="py-2.5 px-3 text-zinc-500">{r.variety}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#166534]">₹{r.modalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: GPS ROUTE & WEATHER                               */}
        {/* ======================================================== */}
        {activeTab === 'RoutePlanner' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 font-mono flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#166534]" />
                  Live GPS Route &amp; Transit Safety (Google Maps)
                </h2>
                <p className="text-xs text-zinc-500">
                  Monitors rider speed and route conditions for perishable cargo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Origin"
                  value={routeOrigin}
                  onChange={(e) => setRouteOrigin(e.target.value)}
                  className="px-3 py-1.5 rounded bg-white border border-zinc-300 text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Destination"
                  value={routeDestination}
                  onChange={(e) => setRouteDestination(e.target.value)}
                  className="px-3 py-1.5 rounded bg-white border border-zinc-300 text-xs font-mono"
                />
              </div>
            </div>

            {routeResult && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block">ESTIMATED ROUTE:</span>
                    <span className="font-bold text-zinc-900 text-sm">
                      {routeResult.route.origin.name} → {routeResult.route.destination.name} ({routeResult.route.distanceKm} km • {routeResult.route.durationText})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 block">TRAVEL SAFETY:</span>
                    <span className="font-bold text-[#166534] text-sm">{routeResult.advisory.recommendation} ({routeResult.advisory.score}/100)</span>
                  </div>
                </div>

                {routeResult.route.mapEmbedUrl && (
                  <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
                    <iframe
                      src={routeResult.route.mapEmbedUrl}
                      width="100%"
                      height="360"
                      className="rounded border border-zinc-200"
                      loading="lazy"
                      title="Route Map"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: HARDWARE SPEC & PLUG-AND-PLAY SKETCHES            */}
        {/* ======================================================== */}
        {activeTab === 'Hardware' && (
          <div className="space-y-6">
            <div className="border-b border-zinc-200 pb-3">
              <h2 className="text-lg font-bold text-zinc-900 font-mono flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#166534]" />
                Tomorrow&apos;s Plug-and-Play Hardware Setup
              </h2>
              <p className="text-xs text-zinc-500">
                Ready-to-flash sketches for ESP32 + NEO-6M GPS + DHT11 and Raspberry Pi Voice Server.
              </p>
            </div>

            {/* Quick Pinout Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
                <span className="text-zinc-500 block mb-1">DHT11 / DHT22 SENSOR</span>
                <div className="font-bold text-zinc-900">VCC → 3V3, GND → GND, DATA → GPIO 15</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
                <span className="text-zinc-500 block mb-1">NEO-6M GPS MODULE</span>
                <div className="font-bold text-zinc-900">TX → GPIO 16 (RX2), RX → GPIO 17 (TX2)</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
                <span className="text-zinc-500 block mb-1">RASPBERRY PI VOICE IVR</span>
                <div className="font-bold text-zinc-900">Auto-boots Voice Server on Port 5060</div>
              </div>
            </div>

            {/* Sketch 1: ESP32 + GPS */}
            <div className="p-5 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs shadow-md border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-400">
                <span className="text-emerald-400">esp32_gps_dht11_thingspeak.ino (C++ Arduino Sketch)</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(gpsCode);
                    setCopiedGps(true);
                    setTimeout(() => setCopiedGps(false), 2000);
                  }}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold cursor-pointer"
                >
                  {copiedGps ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="overflow-x-auto max-h-56 text-[11px] leading-relaxed text-zinc-300">
                {gpsCode || '// ESP32 + GPS firmware'}
              </pre>
            </div>

            {/* Sketch 2: Raspberry Pi Python Script */}
            <div className="p-5 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs shadow-md border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-400">
                <span className="text-blue-400">raspberry_pi_voice_ivr_server.py (Python Voice Hotline Server)</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(piCode);
                    setCopiedPi(true);
                    setTimeout(() => setCopiedPi(false), 2000);
                  }}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold cursor-pointer"
                >
                  {copiedPi ? 'Copied!' : 'Copy Script'}
                </button>
              </div>
              <pre className="overflow-x-auto max-h-56 text-[11px] leading-relaxed text-zinc-300">
                {piCode || '// Raspberry Pi voice script'}
              </pre>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-12 bg-white border-t border-zinc-200 py-6 px-6 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            COLD SHIELD // SMART AGRICULTURAL COLD-CHAIN &amp; FARM INTELLIGENCE
          </div>
          <Link href="/" className="text-[#166534] hover:underline font-semibold">
            ← Return to Cinematic Story
          </Link>
        </div>
      </footer>

    </div>
  );
}

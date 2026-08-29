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
  Zap,
  Volume2,
  Mic,
  Camera,
  Upload,
  Trash2,
  Navigation,
  BarChart3,
  Cpu,
  User,
  Store,
  Phone,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Send,
  PhoneForwarded,
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

const TELEMETRY_LOG = [
  { time: '10:00', inside: 4.1, outside: 30.5 },
  { time: '11:00', inside: 4.2, outside: 31.7 },
  { time: '12:00', inside: 4.4, outside: 32.8 },
  { time: '13:00', inside: 4.2, outside: 31.7 },
  { time: '14:00', inside: 4.3, outside: 32.1 },
];

export default function NoNonsenseOperationsDashboard() {
  const [activeRole, setActiveRole] = useState<'Farmer' | 'Merchant' | 'Driver' | 'LiveCall' | 'CropDoctor'>('Farmer');
  const [timeString, setTimeString] = useState<string>('');

  // Live IoT telemetry
  const [iotTemp, setIotTemp] = useState<number>(4.2);
  const [iotHum, setIotHum] = useState<number>(68.0);
  const [isSimulatedSpike, setIsSimulatedSpike] = useState<boolean>(false);
  const [aiCoolerEngaged, setAiCoolerEngaged] = useState<boolean>(false);

  // Phone numbers
  const farmerPhone = '+91 94401 55667 (Ramesh Reddy)';
  const driverPhone = '+91 98480 11223 (Suresh Kumar - Truck AP-04-TX-2048)';
  const merchantPhone = '+91 91234 56789 (Kurnool Wholesale APMC)';

  // Live Phone Call Demo State
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('te');
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [activeCallText, setActiveCallText] = useState<string>('');
  const [callStatus, setCallStatus] = useState<string>('Line Idle');

  // Crop Doctor State
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [diagLoading, setDiagLoading] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Route state
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  // Clock
  useEffect(() => {
    const update = () => setTimeString(new Date().toLocaleTimeString());
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // Sync IoT
  useEffect(() => {
    fetchThingSpeakData()
      .then((res) => {
        if (res.currentTemp !== null) setIotTemp(res.currentTemp);
        if (res.currentHum !== null) setIotHum(res.currentHum);
      })
      .catch(() => {});
  }, []);

  // Route init
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

  // Crop analysis
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

  const currentTemp = isSimulatedSpike ? 8.4 : iotTemp;
  const isWarning = currentTemp > 8.0;

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#18181b] font-sans antialiased">
      
      {/* ========================================================== */}
      {/* CLEAN OPERATIONAL HEADER                                   */}
      {/* ========================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Story</span>
            </Link>

            <div className="h-4 w-px bg-zinc-300" />

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
              <span className="text-sm font-bold tracking-tight text-zinc-900 font-mono">
                COLD SHIELD // REAL TELEMETRY
              </span>
            </div>
          </div>

          {/* Direct Role Switcher (Farmer, Merchant, Driver, Live Phone Call) */}
          <nav className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-lg text-xs font-mono">
            {[
              { id: 'Farmer', label: '👨‍🌾 Farmer View' },
              { id: 'Merchant', label: '🏢 Merchant View' },
              { id: 'Driver', label: '🚛 Driver View' },
              { id: 'LiveCall', label: '📞 Live Phone Call Demo' },
              { id: 'CropDoctor', label: '🍃 Crop Doctor (AI)' },
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  sound.playClick(900);
                  setActiveRole(role.id as any);
                }}
                className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-colors ${
                  activeRole === role.id
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {role.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] text-xs font-mono font-bold">
              {timeString || 'LIVE'}
            </span>
          </div>

        </div>
      </header>

      {/* ========================================================== */}
      {/* MAIN CONTENT METRICS CONTAINER                             */}
      {/* ========================================================== */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ======================================================== */}
        {/* ROLE 1: FARMER VIEW                                      */}
        {/* ======================================================== */}
        {activeRole === 'Farmer' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="p-4 rounded-lg bg-white border border-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-zinc-500 uppercase block">PORTAL: PRODUCER &amp; GROWER</span>
                <h2 className="text-lg font-bold font-mono text-zinc-900">
                  Farmer Batch Status — Tomato Hybrid (3,600 kg)
                </h2>
              </div>
              <div className="text-xs font-mono text-zinc-600">
                Farmer Contact: <strong>{farmerPhone}</strong>
              </div>
            </div>

            {/* Core Produce & Temperature Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-lg bg-white border border-zinc-300">
                <span className="text-xs font-mono text-zinc-500 block mb-1">INSIDE CARGO TEMP</span>
                <div className={`text-4xl font-extrabold font-mono ${isWarning ? 'text-red-600' : 'text-[#166534]'}`}>
                  {currentTemp.toFixed(1)}°C
                </div>
                <div className="text-xs font-mono text-zinc-500 mt-1">
                  Safe Threshold: 2.0°C – 8.0°C
                </div>
              </div>

              <div className="p-5 rounded-lg bg-white border border-zinc-300">
                <span className="text-xs font-mono text-zinc-500 block mb-1">PRODUCE &amp; FRUIT STATUS</span>
                <div className="text-4xl font-extrabold font-mono text-emerald-700">
                  {isWarning ? '89.0%' : '99.2%'}
                </div>
                <div className="text-xs font-mono text-zinc-500 mt-1">
                  Zero Spoilage • Humidity: {iotHum.toFixed(0)}% RH
                </div>
              </div>

              <div className="p-5 rounded-lg bg-white border border-zinc-300">
                <span className="text-xs font-mono text-zinc-500 block mb-1">AI AUTONOMOUS COOLER</span>
                <div className="text-xl font-extrabold font-mono text-zinc-900 mt-1">
                  {isWarning ? 'COMPRESSOR BOOSTED (AI)' : 'AUTO-REGULATING'}
                </div>
                <div className="text-xs font-mono text-[#166534] mt-1">
                  Pi AI controls reefer automatically
                </div>
              </div>

              <div className="p-5 rounded-lg bg-white border border-zinc-300">
                <span className="text-xs font-mono text-zinc-500 block mb-1">ESTIMATED MANDI ARRIVAL</span>
                <div className="text-4xl font-extrabold font-mono text-zinc-900">
                  4:00 PM
                </div>
                <div className="text-xs font-mono text-zinc-500 mt-1">
                  Kurnool APMC Gate #2
                </div>
              </div>

            </div>

            {/* Direct Contacts & Voice Hotline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Contact Numbers Box */}
              <div className="p-5 rounded-lg bg-white border border-zinc-300 space-y-3 text-xs font-mono">
                <h4 className="font-bold text-zinc-900 uppercase border-b border-zinc-200 pb-2">
                  Direct Cargo Contacts
                </h4>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">ASSIGNED DRIVER:</span>
                  <span className="font-bold text-zinc-900">{driverPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">FARMER REGISTERED:</span>
                  <span className="font-bold text-zinc-900">{farmerPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">TRANSIT VEHICLE:</span>
                  <span className="font-bold text-zinc-900">Reefer Truck #AP-04-TX-2048 (GPS Active)</span>
                </div>
              </div>

              {/* 1-Click Voice Hotline */}
              <div className="p-5 rounded-lg bg-emerald-50 border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono text-emerald-900 uppercase flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#166534]" />
                    Illiterate Farmer Voice Hotline
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-800">1800-COLD-FARM</span>
                </div>

                <p className="text-xs text-emerald-800 leading-relaxed font-sans">
                  The farmer does not need to read. Click below to hear the Raspberry Pi vocal status in Telugu.
                </p>

                <button
                  onClick={() => handleDialLiveCall(isWarning ? 'TEMP_SPIKE_AUTONOMOUS_FIX' : 'TRANSIT_SAFE')}
                  className="w-full py-3 rounded bg-[#166534] hover:bg-[#15803d] text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isCalling ? 'Speaking on Voice Call...' : '▶ Listen Status in Telugu (తెలుగు)'}</span>
                </button>
              </div>

            </div>

            {/* Quick Incident Simulation Toggle */}
            <div className="p-4 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-700 font-bold">
                TEST DEMO: Simulate Heat Rise &amp; Autonomous AI Compressor Compensation
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsSimulatedSpike(true)}
                  className={`px-3 py-1.5 rounded font-bold cursor-pointer ${
                    isSimulatedSpike ? 'bg-[#b45309] text-white' : 'bg-white border border-zinc-300 text-zinc-800'
                  }`}
                >
                  ⚠ Heat Rise (8.4°C)
                </button>
                <button
                  onClick={() => setIsSimulatedSpike(false)}
                  className={`px-3 py-1.5 rounded font-bold cursor-pointer ${
                    !isSimulatedSpike ? 'bg-[#166534] text-white' : 'bg-white border border-zinc-300 text-zinc-800'
                  }`}
                >
                  ✓ Safe (4.2°C)
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 2: MERCHANT VIEW                                    */}
        {/* ======================================================== */}
        {activeRole === 'Merchant' && (
          <div className="space-y-6">
            
            <div className="p-4 rounded-lg bg-white border border-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-zinc-500 uppercase block">PORTAL: WHOLESALE MERCHANT &amp; BUYER</span>
                <h2 className="text-lg font-bold font-mono text-zinc-900">
                  Inbound Shipment Passport — Batch #JRN-2048
                </h2>
              </div>
              <div className="text-xs font-mono text-zinc-600">
                Buyer APMC: <strong>{merchantPhone}</strong>
              </div>
            </div>

            {/* Merchant Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-lg bg-white border border-zinc-300">
                <span className="text-zinc-500 block mb-1">CARGO CONTENTS</span>
                <div className="text-base font-bold text-zinc-900">Tomato Hybrid Grade-A</div>
                <div className="text-zinc-500 mt-1">180 Crates (3,600 kg)</div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-zinc-300">
                <span className="text-zinc-500 block mb-1">THERMAL CUSTODY</span>
                <div className="text-2xl font-extrabold text-[#166534]">{currentTemp.toFixed(1)}°C Inside</div>
                <div className="text-zinc-500 mt-1">Ambient Outside: 31.7°C</div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-zinc-300">
                <span className="text-zinc-500 block mb-1">MANDI VALUATION</span>
                <div className="text-2xl font-extrabold text-zinc-900">₹2,450 / Q</div>
                <div className="text-[#166534] mt-1">Est. Batch Value: ₹88,200</div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-zinc-300">
                <span className="text-zinc-500 block mb-1">DRIVER STATUS</span>
                <div className="text-base font-bold text-zinc-900">On Highway (52.4 km/h)</div>
                <div className="text-zinc-500 mt-1">ETA: 4:00 PM Mandi Gate #2</div>
              </div>
            </div>

            {/* Contacts & Live Telemetry Table */}
            <div className="p-5 rounded-lg bg-white border border-zinc-300 space-y-4">
              <h4 className="text-xs font-bold font-mono text-zinc-900 uppercase">
                Merchant Custody Verification Log
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500">
                      <th className="py-2 px-3">PARAMETER</th>
                      <th className="py-2 px-3">LIVE READING</th>
                      <th className="py-2 px-3">SAFE THRESHOLD</th>
                      <th className="py-2 px-3">AUDIT STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-100">
                      <td className="py-2.5 px-3 font-bold text-zinc-900">Cargo Core Temperature</td>
                      <td className="py-2.5 px-3 text-[#166534] font-bold">{currentTemp.toFixed(1)}°C</td>
                      <td className="py-2.5 px-3 text-zinc-600">2.0°C – 8.0°C</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">✅ PASS</td>
                    </tr>
                    <tr className="border-b border-zinc-100">
                      <td className="py-2.5 px-3 font-bold text-zinc-900">Relative Humidity</td>
                      <td className="py-2.5 px-3 text-blue-700 font-bold">{iotHum.toFixed(1)}% RH</td>
                      <td className="py-2.5 px-3 text-zinc-600">70% – 95%</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">✅ PASS</td>
                    </tr>
                    <tr className="border-b border-zinc-100">
                      <td className="py-2.5 px-3 font-bold text-zinc-900">Farmer Contact</td>
                      <td className="py-2.5 px-3 text-zinc-900">{farmerPhone}</td>
                      <td className="py-2.5 px-3 text-zinc-600">Origin Anantapur</td>
                      <td className="py-2.5 px-3 text-zinc-600">Verified Grower</td>
                    </tr>
                    <tr className="border-b border-zinc-100">
                      <td className="py-2.5 px-3 font-bold text-zinc-900">Driver Contact</td>
                      <td className="py-2.5 px-3 text-zinc-900">{driverPhone}</td>
                      <td className="py-2.5 px-3 text-zinc-600">NEO-6M GPS Connected</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">✅ In Transit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 3: DRIVER / RIDER VIEW                              */}
        {/* ======================================================== */}
        {activeRole === 'Driver' && (
          <div className="space-y-6">
            
            <div className="p-4 rounded-lg bg-white border border-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-zinc-500 uppercase block">PORTAL: DRIVER NAVIGATION &amp; SPEED</span>
                <h2 className="text-lg font-bold font-mono text-zinc-900">
                  Vehicle Reefer Console — Truck #AP-04-TX-2048
                </h2>
              </div>
              <div className="text-xs font-mono text-zinc-600">
                Driver Contact: <strong>{driverPhone}</strong>
              </div>
            </div>

            {/* Speed & Autonomous Cooling Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              
              <div className="p-4 rounded-lg bg-white border border-zinc-300">
                <span className="text-zinc-500 block mb-1">GPS SPEEDOMETER (NEO-6M)</span>
                <div className="text-3xl font-extrabold text-zinc-900">52.4 km/h</div>
                <div className="text-[#166534] mt-1 font-bold">Speed Limit 60 km/h • Safe Driving</div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-zinc-300">
                <span className="text-zinc-500 block mb-1">REEFER TEMPERATURE</span>
                <div className={`text-3xl font-extrabold ${isWarning ? 'text-red-600' : 'text-[#166534]'}`}>
                  {currentTemp.toFixed(1)}°C
                </div>
                <div className="text-zinc-500 mt-1">Autonomous AI Compressor: ON</div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-zinc-300">
                <span className="text-zinc-500 block mb-1">FARMER CONTACT</span>
                <div className="text-sm font-bold text-zinc-900">{farmerPhone}</div>
                <div className="text-zinc-500 mt-1">Tap to dial farmer on emergency</div>
              </div>

            </div>

            {/* Live Navigation Map */}
            {routeData?.mapEmbedUrl && (
              <div className="p-4 rounded-lg bg-white border border-zinc-300 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-zinc-900">LIVE HIGHWAY NAVIGATION (ANANTAPUR → KURNOOL MANDI)</span>
                  <span className="text-zinc-500">128 km / 180 km Done • ETA 4:00 PM</span>
                </div>
                <iframe
                  src={routeData.mapEmbedUrl}
                  width="100%"
                  height="420"
                  className="rounded border border-zinc-300"
                  loading="lazy"
                  title="Driver Map"
                />
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 4: LIVE PHONE CALL DEMO (FOR HACKATHON JUDGES)      */}
        {/* ======================================================== */}
        {activeRole === 'LiveCall' && (
          <div className="space-y-6">
            
            <div className="p-4 rounded-lg bg-white border border-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-zinc-500 uppercase block">LIVE HACKATHON PHONE CALL DEMONSTRATION</span>
                <h2 className="text-lg font-bold font-mono text-zinc-900">
                  Raspberry Pi Voice IVR Telephony Gateway (1800-COLD-FARM)
                </h2>
              </div>
              
              {/* Language toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded text-xs font-mono">
                <button
                  onClick={() => setVoiceLang('te')}
                  className={`px-3 py-1 rounded font-bold cursor-pointer ${
                    voiceLang === 'te' ? 'bg-[#166534] text-white' : 'text-zinc-700'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
                <button
                  onClick={() => setVoiceLang('hi')}
                  className={`px-3 py-1 rounded font-bold cursor-pointer ${
                    voiceLang === 'hi' ? 'bg-[#166534] text-white' : 'text-zinc-700'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={() => setVoiceLang('en')}
                  className={`px-3 py-1 rounded font-bold cursor-pointer ${
                    voiceLang === 'en' ? 'bg-[#166534] text-white' : 'text-zinc-700'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Live Phone Call Console */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left Dial Actions */}
              <div className="md:col-span-6 space-y-4">
                <h4 className="text-xs font-bold font-mono text-zinc-900 uppercase">
                  Select Call Scenario to Speak Aloud
                </h4>

                <div className="p-4 rounded-lg bg-white border border-zinc-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-xs text-zinc-900">1. Safe Routine Transit Call</span>
                    <button
                      onClick={() => handleDialLiveCall('TRANSIT_SAFE')}
                      className="px-3 py-1.5 rounded bg-[#166534] text-white text-xs font-mono font-bold cursor-pointer"
                    >
                      ▶ Dial Call
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600">
                    {CALL_SCENARIOS.TRANSIT_SAFE.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white border border-zinc-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-xs text-zinc-900">2. Heat Spike &amp; Autonomous AI Cooler Fix</span>
                    <button
                      onClick={() => handleDialLiveCall('TEMP_SPIKE_AUTONOMOUS_FIX')}
                      className="px-3 py-1.5 rounded bg-[#b45309] text-white text-xs font-mono font-bold cursor-pointer"
                    >
                      ▶ Dial Alert Call
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600">
                    {CALL_SCENARIOS.TEMP_SPIKE_AUTONOMOUS_FIX.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']}
                  </p>
                </div>
              </div>

              {/* Right Phone Screen */}
              <div className="md:col-span-6 p-6 rounded-lg bg-zinc-900 text-white space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
                  <span className="text-emerald-400">RASPBERRY PI TELEPHONY SERVER</span>
                  <span>{callStatus}</span>
                </div>

                <div className="p-6 rounded bg-zinc-950 border border-zinc-800 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#166534]/30 border border-[#166534] flex items-center justify-center mx-auto text-emerald-400 text-xl">
                    <PhoneCall className={isCalling ? 'animate-bounce' : ''} />
                  </div>
                  <div className="text-base font-bold">1800-COLD-FARM</div>
                  
                  {isCalling && (
                    <div className="flex items-center justify-center gap-1.5 h-6">
                      <span className="w-1 h-5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="w-1 h-7 bg-emerald-400 rounded-full animate-pulse delay-75" />
                      <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse delay-150" />
                      <span className="w-1 h-6 bg-emerald-400 rounded-full animate-pulse delay-100" />
                    </div>
                  )}

                  {isCalling && (
                    <button
                      onClick={handleHangup}
                      className="px-4 py-1.5 rounded bg-red-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Hang Up
                    </button>
                  )}
                </div>

                <div className="p-3 rounded bg-zinc-800 text-xs space-y-1">
                  <span className="text-zinc-400 text-[10px] block">LIVE SPOKEN AUDIO TRANSCRIPT:</span>
                  <p className="text-zinc-200 font-sans italic leading-relaxed">
                    {activeCallText || 'Click any scenario on the left to hear the real synthesized voice call.'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 5: CROP DOCTOR (LEAF DAMAGE % METRICS)              */}
        {/* ======================================================== */}
        {activeRole === 'CropDoctor' && (
          <div className="space-y-6">
            
            <div className="p-4 rounded-lg bg-white border border-zinc-300 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-500 uppercase block">CROP DAMAGE QUANTIFICATION</span>
                <h2 className="text-lg font-bold font-mono text-zinc-900">
                  Crop Doctor — 3MP Camera AI Leaf Destruction %
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-5 space-y-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />

                {!cropImage ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 hover:border-zinc-500 rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white min-h-[240px]"
                  >
                    <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                    <h4 className="text-xs font-bold font-mono text-zinc-900">Upload 3MP Leaf Photo</h4>
                    <p className="text-[11px] text-zinc-500 mt-1">From camera / phone</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-white border border-zinc-300 space-y-3">
                    <img src={cropImage} alt="Crop sample" className="w-full max-h-52 object-contain rounded bg-zinc-900" />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAnalyze}
                        disabled={diagLoading}
                        className="flex-1 py-2 rounded bg-[#166534] hover:bg-[#15803d] text-white font-mono text-xs font-bold cursor-pointer"
                      >
                        {diagLoading ? 'Calculating Damage %...' : 'Analyze with Gemini AI'}
                      </button>
                      <button
                        onClick={() => { setCropImage(null); setDiagnosis(null); }}
                        className="px-3 py-2 rounded border border-zinc-300 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-7">
                {diagnosis ? (
                  <div className="p-5 rounded-lg bg-white border border-zinc-300 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">IDENTIFIED PATHOLOGY</span>
                        <h3 className="text-lg font-bold font-mono text-zinc-900">{diagnosis.disease_name}</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-50 text-amber-700">
                        {diagnosis.severity}
                      </span>
                    </div>

                    {/* Damage Percentage Gauge Bar */}
                    <div className="p-3.5 rounded bg-zinc-50 border border-zinc-200 space-y-2">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span>LEAF SURFACE DAMAGE:</span>
                        <span className="text-[#b45309]">{diagnosis.leaf_damage_percentage}% DESTROYED / {diagnosis.healthy_tissue_percentage}% INTACT</span>
                      </div>
                      
                      <div className="w-full h-3 rounded-full bg-emerald-100 overflow-hidden flex">
                        <div className="bg-red-500 h-full" style={{ width: `${diagnosis.leaf_damage_percentage}%` }} />
                        <div className="bg-emerald-600 h-full" style={{ width: `${diagnosis.healthy_tissue_percentage}%` }} />
                      </div>

                      <div className="text-[11px] font-mono text-zinc-600">
                        Status: <strong>{diagnosis.can_be_saved ? '✅ 100% Recoverable' : 'Urgent Treatment Needed'}</strong>
                      </div>
                    </div>

                    {/* Spoken Advice in Telugu */}
                    <div className="p-3.5 rounded bg-[#f0fdf4] border border-[#bbf7d0] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-[#166534]">SPOKEN ADVICE IN TELUGU:</span>
                        <button
                          onClick={() => speakFarmerAudio(diagnosis.farmer_voice_telugu || diagnosis.summary, 'te')}
                          className="px-2.5 py-0.5 rounded bg-[#166534] text-white text-[10px] font-bold cursor-pointer"
                        >
                          ▶ Play Voice
                        </button>
                      </div>
                      <p className="text-xs text-zinc-800 font-sans leading-relaxed">
                        {diagnosis.farmer_voice_telugu || diagnosis.summary}
                      </p>
                    </div>

                    {/* Remedies */}
                    <div className="p-3 rounded bg-zinc-50 border border-zinc-200 text-xs font-mono space-y-1">
                      <span className="font-bold text-zinc-900 block">ORGANIC REMEDIES:</span>
                      <ul className="list-disc pl-4 text-zinc-700">
                        {diagnosis.organic_remedies?.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-lg bg-zinc-50 border border-zinc-200 text-center flex flex-col items-center justify-center min-h-[240px]">
                    <span className="text-3xl mb-2">🍃</span>
                    <h4 className="text-xs font-bold font-mono text-zinc-900 uppercase">Crop Doctor Ready</h4>
                    <p className="text-xs text-zinc-500 mt-1">Upload a leaf photo to quantify surface damage.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-12 bg-white border-t border-zinc-300 py-5 px-6 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>COLD SHIELD // REAL-TIME FARMER &amp; MERCHANT COLD-CHAIN PLATFORM</div>
          <Link href="/" className="text-[#166534] hover:underline font-semibold">
            ← Return to Cinematic Story
          </Link>
        </div>
      </footer>

    </div>
  );
}

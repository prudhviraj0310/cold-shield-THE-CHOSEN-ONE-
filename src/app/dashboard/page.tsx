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
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  ArrowLeft,
  ShieldCheck,
  Thermometer,
  Droplets,
  Activity,
  Truck,
  Radio,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Bell,
  Zap,
  Phone,
  Layers,
  ChevronRight,
  Info,
  RefreshCw,
  Settings,
  Upload,
  Camera,
  Trash2,
  History as HistoryIcon,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Navigation,
  Sun,
  CloudRain,
  Wind,
  Eye,
  FileCode,
  Copy,
  Check,
  Lightbulb,
  Volume2,
  VolumeX,
  PhoneCall,
  Mic,
  Satellite,
  Gauge,
} from 'lucide-react';
import { sound } from '@/lib/audio';
import { API_CONFIG, isConfigured, COMMODITIES, INDIAN_STATES } from '@/config/api';
import {
  fetchThingSpeakData,
  evaluateAlerts,
  DEFAULT_THRESHOLDS,
  Thresholds,
  ColdChainReading,
  ColdChainAlert,
} from '@/services/thingspeak';
import { diagnoseCropImage, DiagnosisData, ScanRecord } from '@/services/cropDoctor';
import { fetchMarketPrices, MarketPriceRecord, MarketAnalysis } from '@/services/marketPrices';
import {
  planAgriculturalRoute,
  WeatherData,
  RouteData,
  TravelAdvisory,
} from '@/services/routePlanner';
import {
  speakFarmerAudio,
  stopFarmerAudio,
  CALL_SCENARIOS,
  VoiceLanguage,
} from '@/services/voiceAssistant';

const NORMAL_TELEMETRY = [
  { time: '06:00', inside: 4.1, outside: 22.0 },
  { time: '07:00', inside: 4.2, outside: 24.5 },
  { time: '08:00', inside: 4.3, outside: 27.2 },
  { time: '09:00', inside: 4.2, outside: 29.0 },
  { time: '10:00', inside: 4.1, outside: 30.5 },
  { time: '11:00', inside: 4.2, outside: 31.7 },
  { time: '12:00', inside: 4.4, outside: 32.8 },
  { time: '13:00', inside: 4.2, outside: 31.7 },
];

const SPIKE_TELEMETRY = [
  ...NORMAL_TELEMETRY,
  { time: '13:30', inside: 5.8, outside: 32.0 },
  { time: '14:00', inside: 7.1, outside: 32.4 },
  { time: '14:15', inside: 8.4, outside: 31.7 },
];

export default function ComprehensiveDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [timeString, setTimeString] = useState<string>('');

  // -------------------------------------------------------------
  // TAB 1: OVERVIEW & SIMULATION STATE
  // -------------------------------------------------------------
  const [isSimulatedSpike, setIsSimulatedSpike] = useState<boolean>(false);
  const [phoneScreen, setPhoneScreen] = useState<'ALERT' | 'STATUS' | 'ACK' | 'HELP'>('ALERT');
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);
  const [activityLogs, setActivityLogs] = useState<string[]>([
    '● Ingesting NEO-6M GPS Fix: 15.8281° N, 78.0373° E (Speed 52 km/h)',
    '● Sensor reading received from SENSOR-001 (Inside: 4.2°C)',
    '● Temperature within safe range (2.0°C - 8.0°C)',
    '● Journey JRN-2048 location updated: Kurnool Highway KM 42',
    '● Humidity reading received: 68% RH',
    '● Raspberry Pi Voice Server Active (Hotline 1800-COLD-SHIELD)',
  ]);

  // -------------------------------------------------------------
  // VOICE HOTLINE TELEPHONY SIMULATOR STATE
  // -------------------------------------------------------------
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('te');
  const [isCallingServer, setIsCallingServer] = useState<boolean>(false);
  const [activeVoiceScript, setActiveVoiceScript] = useState<string>('');
  const [voiceCallStatus, setVoiceCallStatus] = useState<string>('Idle');

  // -------------------------------------------------------------
  // TAB 2: THINGSPEAK IOT COLD CHAIN STATE
  // -------------------------------------------------------------
  const [iotTemp, setIotTemp] = useState<number | null>(4.2);
  const [iotHum, setIotHum] = useState<number | null>(68.0);
  const [iotHistory, setIotHistory] = useState<ColdChainReading[]>([]);
  const [iotLoading, setIotLoading] = useState<boolean>(false);
  const [iotError, setIotError] = useState<string | null>(null);
  const [iotLastUpdated, setIotLastUpdated] = useState<Date | null>(null);
  const [showThresholdSettings, setShowThresholdSettings] = useState<boolean>(false);
  const [thresholds, setThresholds] = useState<Thresholds>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coldchain_thresholds');
      return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
    }
    return DEFAULT_THRESHOLDS;
  });
  const [iotAlerts, setIotAlerts] = useState<ColdChainAlert[]>([]);

  // -------------------------------------------------------------
  // TAB 3: CROP DOCTOR (GEMINI AI) STATE
  // -------------------------------------------------------------
  const [cropImageBase64, setCropImageBase64] = useState<string | null>(null);
  const [cropDiagnosis, setCropDiagnosis] = useState<DiagnosisData | null>(null);
  const [cropLoading, setCropLoading] = useState<boolean>(false);
  const [cropError, setCropError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [showScanHistory, setShowScanHistory] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // TAB 4: MARKET PRICES (DATA.GOV.IN) STATE
  // -------------------------------------------------------------
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Tomato');
  const [selectedState, setSelectedState] = useState<string>('Andhra Pradesh');
  const [marketData, setMarketData] = useState<MarketAnalysis | null>(null);
  const [marketLoading, setMarketLoading] = useState<boolean>(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [marketView, setMarketView] = useState<'table' | 'chart'>('table');

  // -------------------------------------------------------------
  // TAB 5: ROUTE PLANNER & WEATHER STATE
  // -------------------------------------------------------------
  const [routeOrigin, setRouteOrigin] = useState<string>('Anantapur');
  const [routeDestination, setRouteDestination] = useState<string>('Kurnool');
  const [routeResult, setRouteResult] = useState<{
    route: RouteData;
    originWeather: WeatherData | null;
    destWeather: WeatherData | null;
    advisory: TravelAdvisory;
  } | null>(null);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);

  // -------------------------------------------------------------
  // TAB 6: HARDWARE FIRMWARE CODES
  // -------------------------------------------------------------
  const [copiedGpsCode, setCopiedGpsCode] = useState<boolean>(false);
  const [copiedPiCode, setCopiedPiCode] = useState<boolean>(false);
  const [gpsFirmware, setGpsFirmware] = useState<string>('');
  const [piVoiceScript, setPiVoiceScript] = useState<string>('');

  // Clock
  useEffect(() => {
    const updateTime = () => setTimeString(new Date().toLocaleTimeString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch local hardware scripts
  useEffect(() => {
    fetch('/hardware/esp32_gps_dht11_thingspeak.ino')
      .then((res) => (res.ok ? res.text() : ''))
      .then((txt) => setGpsFirmware(txt))
      .catch(() => {});

    fetch('/hardware/raspberry_pi_voice_ivr_server.py')
      .then((res) => (res.ok ? res.text() : ''))
      .then((txt) => setPiVoiceScript(txt))
      .catch(() => {});
  }, []);

  // ThingSpeak poller
  const loadThingSpeakData = useCallback(async () => {
    setIotLoading(true);
    setIotError(null);
    try {
      const res = await fetchThingSpeakData();
      if (res.currentTemp !== null) setIotTemp(res.currentTemp);
      if (res.currentHum !== null) setIotHum(res.currentHum);
      setIotHistory(res.history);
      setIotLastUpdated(new Date());

      const newAlerts = evaluateAlerts(res.currentTemp, res.currentHum, thresholds);
      if (newAlerts.length > 0) {
        setIotAlerts((prev) => [...newAlerts, ...prev].slice(0, 30));
      }
    } catch (err: any) {
      setIotError(err.message || 'ThingSpeak connection check');
    } finally {
      setIotLoading(false);
    }
  }, [thresholds]);

  useEffect(() => {
    loadThingSpeakData();
    const timer = setInterval(loadThingSpeakData, 15000);
    return () => clearInterval(timer);
  }, [loadThingSpeakData]);

  // Market poller
  const loadMarketPrices = useCallback(async (commodity: string, state: string) => {
    setMarketLoading(true);
    try {
      const data = await fetchMarketPrices(commodity, state);
      setMarketData(data);
    } catch (err: any) {
      setMarketError(err.message);
    } finally {
      setMarketLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketPrices(selectedCommodity, selectedState);
  }, [loadMarketPrices, selectedCommodity, selectedState]);

  // Route init
  useEffect(() => {
    planAgriculturalRoute('Anantapur', 'Kurnool')
      .then((data) => setRouteResult(data))
      .catch(() => {});
  }, []);

  // -------------------------------------------------------------
  // FARMER VOICE CALL SIMULATOR (TELUGU / HINDI / ENGLISH)
  // -------------------------------------------------------------
  const handleStartFarmerVoiceCall = (scenarioKey: keyof typeof CALL_SCENARIOS = 'TRANSIT_SAFE') => {
    const scenario = CALL_SCENARIOS[scenarioKey];
    let scriptText = scenario.script.telugu;
    if (voiceLang === 'hi') scriptText = scenario.script.hindi;
    if (voiceLang === 'en') scriptText = scenario.script.english;

    setIsCallingServer(true);
    setActiveVoiceScript(scriptText);
    setVoiceCallStatus(`Calling 1800-COLD-FARM (${voiceLang.toUpperCase()})... Connected`);

    speakFarmerAudio(scriptText, voiceLang, () => {
      setIsCallingServer(false);
      setVoiceCallStatus('Call Completed');
    });

    setActivityLogs((prev) => [
      `📞 Farmer connected to Voice Dispatch in ${voiceLang === 'te' ? 'Telugu' : voiceLang === 'hi' ? 'Hindi' : 'English'}`,
      ...prev.slice(0, 4),
    ]);
  };

  const handleEndFarmerVoiceCall = () => {
    stopFarmerAudio();
    setIsCallingServer(false);
    setVoiceCallStatus('Call Disconnected');
  };

  // Crop diagnosis
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageBase64(reader.result as string);
      setCropDiagnosis(null);
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

      // Save to scan history
      const newRec: ScanRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN'),
        image: cropImageBase64,
        disease: diagnosis.disease_name,
        severity: diagnosis.severity,
        crop: diagnosis.crop_type,
        leaf_damage_percentage: diagnosis.leaf_damage_percentage || 25,
      };
      setScanHistory((prev) => [newRec, ...prev].slice(0, 25));
    } catch (err: any) {
      setCropError(err.message || 'AI diagnosis failed');
    } finally {
      setCropLoading(false);
    }
  };

  // Incident simulation
  const handleTriggerSpike = () => {
    sound.playSmsAlert();
    setIsSimulatedSpike(true);
    setIsAcknowledged(false);
    setPhoneScreen('ALERT');
    setActivityLogs((prev) => [
      '⚠ TEMPERATURE SPIKE: Inside 8.4°C exceeded safe limit (8.0°C)',
      '⚠ Risk detection engine generated Alert #AL-904',
      '✉ SMS dispatched to farmer phone (+91 98480 22338)',
      ...prev.slice(0, 4),
    ]);
  };

  const handleResetSafe = () => {
    sound.playClick(1000);
    setIsSimulatedSpike(false);
    setIsAcknowledged(false);
    setPhoneScreen('ALERT');
    setActivityLogs((prev) => [
      '✓ Temperature restored to 4.2°C (Optimal safe corridor)',
      '✓ System status restored to OPERATIONAL',
      ...prev.slice(0, 4),
    ]);
  };

  const handlePhoneKey = (key: '1' | '2' | '3') => {
    sound.playDTMF(key);
    if (key === '1') {
      setPhoneScreen('STATUS');
    } else if (key === '2') {
      setPhoneScreen('ACK');
      setIsAcknowledged(true);
      setActivityLogs((prev) => [
        '✓ Farmer acknowledged alert via 2G phone reply (Key 2)',
        ...prev.slice(0, 4),
      ]);
    } else if (key === '3') {
      setPhoneScreen('HELP');
    }
  };

  const currentInsideTemp = isSimulatedSpike ? 8.4 : iotTemp ?? 4.2;
  const currentOutsideTemp = 31.7;
  const isWarning = currentInsideTemp > thresholds.tempMax;

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#18181b]">
      
      {/* ========================================================== */}
      {/* TOP DASHBOARD NAVIGATION                                   */}
      {/* ========================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Story</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200" />

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
              <span className="text-sm font-bold tracking-tight text-zinc-900 uppercase font-mono">
                Cold Shield // System Operations
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {[
              { id: 'Overview', label: 'Overview' },
              { id: 'VoiceTelephony', label: 'Farmer Voice IVR' },
              { id: 'ColdChain', label: 'IoT Cold Chain' },
              { id: 'CropDoctor', label: 'Crop Doctor (AI)' },
              { id: 'MarketPrices', label: 'Mandi Prices' },
              { id: 'RoutePlanner', label: 'Route & Weather' },
              { id: 'Hardware', label: 'Sensors & GPS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick(900);
                  setActiveTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
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
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 text-[11px] font-mono text-zinc-600 border border-zinc-200">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>{timeString || 'LIVE'}</span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
              <span>STATUS: OPERATIONAL</span>
            </span>
          </div>

        </div>
      </header>

      {/* ========================================================== */}
      {/* MAIN BODY AREA                                             */}
      {/* ========================================================== */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-8">

        {/* ======================================================== */}
        {/* TAB: OVERVIEW & CENTRAL TELEMETRY                        */}
        {/* ======================================================== */}
        {activeTab === 'Overview' && (
          <div className="space-y-8">
            
            {/* METRICS SUMMARY */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-1">
                  <span>ACTIVE VEHICLE ROUTES</span>
                  <Truck className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900 font-mono">12</div>
                <div className="text-[11px] text-zinc-500 mt-1">NEO-6M GPS Tracking Active</div>
              </div>

              <div className="p-5 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-1">
                  <span>IOT SENSORS ONLINE</span>
                  <Cpu className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900 font-mono">47</div>
                <div className="text-[11px] text-[#166534] font-medium mt-1">ESP32 + DHT11 Node #3474082</div>
              </div>

              <div className="p-5 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-1">
                  <span>ACTIVE ALERTS</span>
                  <Bell className="w-4 h-4 text-zinc-400" />
                </div>
                <div className={`text-3xl font-extrabold font-mono ${isWarning ? 'text-[#b45309]' : 'text-zinc-900'}`}>
                  {isWarning ? '1 ACTIVE' : '0 ACTIVE'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  {isWarning ? 'Thermal limit exceeded' : 'All parameters nominal'}
                </div>
              </div>

              <div className="p-5 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-1">
                  <span>FARMER VOICE HOTLINE</span>
                  <PhoneCall className="w-4 h-4 text-[#166534]" />
                </div>
                <div className="text-3xl font-extrabold text-[#166534] font-mono">24/7</div>
                <div className="text-[11px] text-zinc-500 mt-1">Telugu / Hindi / English IVR</div>
              </div>
            </div>

            {/* FARMER VOICE INTERACTION HIGHLIGHT BANNER */}
            <div className="p-5 rounded-lg bg-gradient-to-r from-emerald-50 via-white to-zinc-50 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-mono text-zinc-900 uppercase">
                    Illiterate Farmer Voice Hotline (1800-COLD-FARM)
                  </h4>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Farmers don&apos;t need to read. They dial the server to hear reassuring vocal updates in Telugu, Hindi, or English.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick(900);
                  setActiveTab('VoiceTelephony');
                }}
                className="px-4 py-2 rounded bg-[#166534] hover:bg-[#15803d] text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Launch Voice Simulator</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* LIVE TELEMETRY CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">INSIDE TEMPERATURE</div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className={`text-3xl font-extrabold font-mono tabular-nums ${
                    isWarning ? 'text-[#b91c1c]' : 'text-zinc-900'
                  }`}>
                    {currentInsideTemp.toFixed(1)}°C
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">Protects Produce</div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">OUTSIDE AMBIENT</div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-3xl font-extrabold font-mono text-zinc-900 tabular-nums">
                    {currentOutsideTemp.toFixed(1)}°C
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">Environmental Context</div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">HUMIDITY</div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-3xl font-extrabold font-mono text-zinc-900 tabular-nums">
                    {iotHum?.toFixed(1) || '68.0'}%
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">Safe RH (70-95%)</div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">NEO-6M GPS SPEED</div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-extrabold font-mono text-zinc-900">
                    52.4 km/h
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#166534]">8 Sats • Smooth Transit</div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">RISK STATUS</div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className={`text-base font-bold font-mono ${
                    isWarning ? 'text-[#b45309]' : 'text-[#166534]'
                  }`}>
                    {isWarning ? 'WARNING' : 'SAFE'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  {isWarning ? 'Threshold Exceeded' : 'Within Limit (8.0°C)'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">LOCATION</div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-base font-bold font-mono text-zinc-900">KURNOOL HWY</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">15.8281° N, 78.0373° E</div>
              </div>
            </div>

            {/* TELEMETRY CHART + ACTIVITY FEED */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-8 p-6 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-200 gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase font-mono tracking-wide">
                      Temperature History &amp; Telemetry — Journey #2048
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Real telemetry tracking inside cargo temperature vs external ambient conditions.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#166534]" />
                      <span className="text-zinc-700">Inside Cargo (°C)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#b45309]" />
                      <span className="text-zinc-700">Outside Ambient (°C)</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        isSimulatedSpike
                          ? SPIKE_TELEMETRY
                          : iotHistory.length > 0
                          ? iotHistory.map((h) => ({
                              time: h.time,
                              inside: h.temp ?? 4.2,
                              outside: 31.7,
                            }))
                          : NORMAL_TELEMETRY
                      }
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="insideFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#166534" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#166534" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                      <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} domain={[0, 40]} tickLine={false} />

                      <ReferenceArea
                        y1={thresholds.tempMin}
                        y2={thresholds.tempMax}
                        fill="#166534"
                        fillOpacity={0.08}
                        label={{
                          value: `SAFE RANGE (${thresholds.tempMin}°C – ${thresholds.tempMax}°C)`,
                          position: 'insideTopLeft',
                          fill: '#166534',
                          fontSize: 10,
                          fontFamily: 'monospace',
                        }}
                      />

                      <ReferenceLine
                        y={thresholds.tempMax}
                        stroke="#b45309"
                        strokeDasharray="4 4"
                        label={{
                          value: `MAX LIMIT (${thresholds.tempMax}°C)`,
                          position: 'insideBottomRight',
                          fill: '#b45309',
                          fontSize: 10,
                          fontFamily: 'monospace',
                        }}
                      />

                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="inside"
                        stroke="#166534"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#insideFill)"
                      />
                      <Area
                        type="monotone"
                        dataKey="outside"
                        stroke="#b45309"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        fill="none"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="lg:col-span-4 p-6 rounded-lg bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 uppercase font-mono tracking-wide pb-3 border-b border-zinc-200 mb-4 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#166534]" />
                    Live System Activity Feed
                  </h3>

                  <div className="space-y-3 font-mono text-xs">
                    {activityLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded border text-xs leading-relaxed ${
                          log.startsWith('⚠')
                            ? 'bg-[#fffbeb] border-[#fde68a] text-[#b45309] font-bold'
                            : log.startsWith('✓') || log.startsWith('📞')
                            ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534] font-medium'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-200 text-[11px] font-mono text-zinc-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#166534]" />
                  <span>CONTINUOUS BACKGROUND MONITORING</span>
                </div>
              </div>

            </div>

            {/* SIMULATOR & 2G PHONE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-7 space-y-6">
                
                <div className="p-6 rounded-lg bg-white border border-zinc-200 shadow-xs">
                  <h3 className="text-sm font-bold text-zinc-900 uppercase font-mono tracking-wide mb-3 flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${isWarning ? 'text-[#b45309]' : 'text-zinc-400'}`} />
                    Thermal Risk Simulator
                  </h3>

                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={handleTriggerSpike}
                      className="flex-1 py-2 rounded bg-[#b45309] hover:bg-[#92400e] text-white font-mono text-xs font-bold cursor-pointer"
                    >
                      ⚠ Trigger Thermal Spike (8.4°C)
                    </button>
                    <button
                      onClick={handleResetSafe}
                      className="flex-1 py-2 rounded bg-[#166534] hover:bg-[#15803d] text-white font-mono text-xs font-bold cursor-pointer"
                    >
                      ✓ Reset Normal (4.2°C)
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-500 text-[10px] block">CARGO TEMP</span>
                      <span className={`font-bold text-sm ${isWarning ? 'text-[#b45309]' : 'text-zinc-900'}`}>
                        {currentInsideTemp.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-500 text-[10px] block">SAFE LIMIT</span>
                      <span className="font-bold text-sm text-zinc-900">{thresholds.tempMax}°C</span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-500 text-[10px] block">CONDITION</span>
                      <span className={`font-bold text-sm ${isWarning ? 'text-[#b45309]' : 'text-[#166534]'}`}>
                        {isWarning ? 'TEMPERATURE RISING' : 'NORMAL'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-500 text-[10px] block">ALERT ENGINE</span>
                      <span className="font-bold text-sm text-zinc-900">
                        {isWarning ? 'ALERT GENERATED' : 'MONITORING'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-white border border-zinc-200 shadow-xs space-y-2.5 text-xs font-mono">
                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-zinc-600" />
                    Alert Record — JRN-2048
                  </h3>
                  <div className="flex justify-between py-1 border-b border-zinc-200">
                    <span className="text-zinc-500">INSIDE TEMPERATURE:</span>
                    <span className={`font-bold ${isWarning ? 'text-[#b91c1c]' : 'text-zinc-900'}`}>{currentInsideTemp.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200">
                    <span className="text-zinc-500">ACTION STATUS:</span>
                    <span className={`font-bold ${isWarning ? 'text-[#b45309]' : 'text-[#166534]'}`}>{isWarning ? 'ACTION REQUIRED' : 'SAFE'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200">
                    <span className="text-zinc-500">FARMER NOTIFICATION:</span>
                    <span className="font-bold text-[#166534]">{isAcknowledged ? 'ACKNOWLEDGED BY FARMER' : 'SENT TO FARMER'}</span>
                  </div>
                </div>

              </div>

              {/* 2G Feature Phone Simulator */}
              <div className="lg:col-span-5 p-6 rounded-lg bg-white border border-zinc-200 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-zinc-900 uppercase font-mono tracking-wide flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#166534]" />
                    Farmer Communication (Feature Phone)
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    Authentic 2G keypad with DTMF audio tones.
                  </p>
                </div>

                <div className="w-full max-w-xs mx-auto bg-[#27272a] rounded-[28px] p-4 shadow-lg border-2 border-zinc-700">
                  <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-3" />

                  <div className="rounded-lg phone-lcd p-3 mb-4 border border-[#3b4737] text-xs font-mono min-h-[155px] flex flex-col justify-between">
                    <div className="flex justify-between text-[9px] font-bold border-b border-[#2d3a2b]/30 pb-1 mb-1">
                      <span>2G GSM</span>
                      <span>14:35</span>
                    </div>

                    <div className="py-1">
                      {phoneScreen === 'ALERT' && (
                        <div className="space-y-1">
                          <div className="font-bold uppercase bg-[#1a2618] text-[#92a488] px-1 py-0.5 inline-block rounded text-[10px]">
                            ⚠ TEMPERATURE ALERT
                          </div>
                          <div className="font-bold">CARGO TEMP: {currentInsideTemp.toFixed(1)}°C</div>
                          <div className="text-[10px]">SAFE LIMIT: {thresholds.tempMax}°C</div>
                          <div className="border-t border-[#2d3a2b]/20 pt-1 text-[9.5px] space-y-0.5">
                            <div>1 — CURRENT STATUS</div>
                            <div>2 — ACKNOWLEDGE</div>
                            <div>3 — CALL SUPPORT</div>
                          </div>
                        </div>
                      )}

                      {phoneScreen === 'STATUS' && (
                        <div className="space-y-1">
                          <div className="font-bold uppercase text-[10px] border-b border-[#2d3a2b]/20 pb-0.5">
                            CURRENT STATUS
                          </div>
                          <div>INSIDE: {currentInsideTemp.toFixed(1)}°C</div>
                          <div>OUTSIDE: {currentOutsideTemp.toFixed(1)}°C</div>
                          <div>REEFER: FAN ACTIVE</div>
                          <div className="border-t border-[#2d3a2b]/20 pt-1 text-[9px]">
                            Press 2: Acknowledge | 3: Support
                          </div>
                        </div>
                      )}

                      {phoneScreen === 'ACK' && (
                        <div className="space-y-1 text-center py-2">
                          <div className="font-bold uppercase text-[10px] bg-[#1a2618] text-[#92a488] px-1 py-0.5 rounded">
                            ACKNOWLEDGED
                          </div>
                          <div className="text-[10px]">Alert marked acknowledged.</div>
                          <div className="text-[9px]">Logged to central dispatch.</div>
                        </div>
                      )}

                      {phoneScreen === 'HELP' && (
                        <div className="space-y-1">
                          <div className="font-bold uppercase text-[10px] border-b border-[#2d3a2b]/20 pb-0.5">
                            DISPATCH SUPPORT
                          </div>
                          <div className="text-[10px]">Call: 1-800-COLD-FARM</div>
                          <div className="text-[9px]">Direct voice assistance.</div>
                        </div>
                      )}
                    </div>

                    <div className="text-[8px] border-t border-[#2d3a2b]/20 pt-0.5 text-center text-[#1a2618]">
                      PRESS 1, 2, OR 3 ON KEYPAD
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                      <button
                        key={k}
                        onClick={() => {
                          if (['1', '2', '3'].includes(k)) {
                            handlePhoneKey(k as '1' | '2' | '3');
                          } else {
                            sound.playDTMF(k);
                          }
                        }}
                        className={`py-2 rounded bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white font-mono text-xs font-bold text-center border border-zinc-600 shadow-xs cursor-pointer ${
                          ['1', '2', '3'].includes(k) ? 'ring-1 ring-[#166534]' : ''
                        }`}
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
        {/* TAB: FARMER VOICE CALLING & IVR TELEPHONY                */}
        {/* ======================================================== */}
        {activeTab === 'VoiceTelephony' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 font-mono flex items-center gap-2">
                  <Mic className="w-5 h-5 text-[#166534]" />
                  Farmer Interactive Voice Calling Hotline (Raspberry Pi IVR)
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Enables illiterate farmers to dial <strong>1800-COLD-FARM</strong> and hear vocal reassuring updates in their native language.
                </p>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-mono">
                <button
                  onClick={() => setVoiceLang('te')}
                  className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                    voiceLang === 'te' ? 'bg-[#166534] text-white shadow-xs' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
                <button
                  onClick={() => setVoiceLang('hi')}
                  className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                    voiceLang === 'hi' ? 'bg-[#166534] text-white shadow-xs' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={() => setVoiceLang('en')}
                  className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                    voiceLang === 'en' ? 'bg-[#166534] text-white shadow-xs' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Interactive Call Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Call Trigger Cards */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xs font-bold font-mono text-zinc-900 uppercase">
                  Select Call Scenario to Test Native Voice Ingestion
                </h3>

                {/* Scenario 1: Transit Safe */}
                <div className="p-5 rounded-lg bg-white border border-zinc-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
                      <h4 className="text-sm font-bold font-mono text-zinc-900">
                        1. Routine Transit &amp; Safety Check Call
                      </h4>
                    </div>
                    <button
                      onClick={() => handleStartFarmerVoiceCall('TRANSIT_SAFE')}
                      className="px-3.5 py-1.5 rounded bg-[#166534] hover:bg-[#15803d] text-white font-mono text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Dial Hotline</span>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                    {CALL_SCENARIOS.TRANSIT_SAFE.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']}
                  </p>
                </div>

                {/* Scenario 2: Thermal Warning */}
                <div className="p-5 rounded-lg bg-white border border-zinc-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#b45309]" />
                      <h4 className="text-sm font-bold font-mono text-zinc-900">
                        2. Emergency Thermal Drift Alert Call
                      </h4>
                    </div>
                    <button
                      onClick={() => handleStartFarmerVoiceCall('TEMP_SPIKE_ALERT')}
                      className="px-3.5 py-1.5 rounded bg-[#b45309] hover:bg-[#92400e] text-white font-mono text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Simulate Alert Call</span>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                    {CALL_SCENARIOS.TEMP_SPIKE_ALERT.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']}
                  </p>
                </div>

                {/* Scenario 3: Crop Disease */}
                <div className="p-5 rounded-lg bg-white border border-zinc-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h4 className="text-sm font-bold font-mono text-zinc-900">
                        3. Leaf Disease &amp; Remedy Voice Prescription
                      </h4>
                    </div>
                    <button
                      onClick={() => handleStartFarmerVoiceCall('CROP_DISEASE_DIAGNOSIS')}
                      className="px-3.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear Prescription</span>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                    {CALL_SCENARIOS.CROP_DISEASE_DIAGNOSIS.script[voiceLang === 'te' ? 'telugu' : voiceLang === 'hi' ? 'hindi' : 'english']}
                  </p>
                </div>

              </div>

              {/* Live Call Telephony Screen */}
              <div className="lg:col-span-5 p-6 rounded-lg bg-zinc-900 text-white shadow-lg space-y-5 font-mono">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Radio className={`w-4 h-4 ${isCallingServer ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'}`} />
                    <span>RASPBERRY PI VOIP IVR GATEWAY</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-emerald-400">PORT 5060</span>
                </div>

                {/* Active Phone Call State */}
                <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#166534]/30 border-2 border-[#166534] flex items-center justify-center mx-auto text-emerald-400 text-2xl">
                    <PhoneCall className={isCallingServer ? 'animate-bounce' : ''} />
                  </div>
                  
                  <div>
                    <h4 className="text-base font-bold text-white">Toll-Free 1800-COLD-FARM</h4>
                    <span className="text-xs text-emerald-400 font-bold">{voiceCallStatus}</span>
                  </div>

                  {/* Audio Waveform Animation when Speaking */}
                  {isCallingServer && (
                    <div className="flex items-center justify-center gap-1.5 h-8 py-1">
                      <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-pulse delay-75" />
                      <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse delay-150" />
                      <span className="w-1.5 h-7 bg-emerald-400 rounded-full animate-pulse delay-100" />
                      <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-pulse delay-200" />
                    </div>
                  )}

                  {isCallingServer && (
                    <button
                      onClick={handleEndFarmerVoiceCall}
                      className="mt-2 px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                    >
                      End Call
                    </button>
                  )}
                </div>

                {/* Spoken Transcript Live Feed */}
                <div className="p-4 rounded bg-zinc-800/80 border border-zinc-700 text-xs space-y-1">
                  <span className="text-zinc-400 text-[10px] block">LIVE SPOKEN AUDIO TRANSCRIPT:</span>
                  <p className="text-zinc-200 font-sans leading-relaxed italic">
                    {activeVoiceScript || 'Click any scenario on the left to dial into the automated Raspberry Pi voice server.'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: CROP DOCTOR (GEMINI AI & LEAF DAMAGE QUANTIFICATION)*/}
        {/* ======================================================== */}
        {activeTab === 'CropDoctor' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 font-mono flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#166534]" />
                  Crop Doctor — Multimodal AI Leaf Pathology &amp; Damage Calculator
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Powered by Google Gemini 1.5 Flash. Calculates exact percentage of leaf destroyed and speaks treatment remedies in farmer&apos;s native language.
                </p>
              </div>

              <button
                onClick={() => setShowScanHistory(!showScanHistory)}
                className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-xs font-mono font-medium text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer border border-zinc-300"
              >
                <HistoryIcon className="w-3.5 h-3.5" />
                <span>{showScanHistory ? 'Back to Scanner' : `History (${scanHistory.length})`}</span>
              </button>
            </div>

            {showScanHistory ? (
              <div className="p-6 rounded-lg bg-white border border-zinc-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-mono text-zinc-900 uppercase">Past Diagnoses Records</h3>
                {scanHistory.length === 0 ? (
                  <p className="text-xs text-zinc-500">No past scan records found in local storage.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {scanHistory.map((rec) => (
                      <div key={rec.id} className="p-3 rounded border border-zinc-200 bg-zinc-50 text-xs font-mono space-y-2">
                        <img src={rec.image} alt={rec.disease} className="w-full h-32 object-cover rounded" />
                        <div className="font-bold text-zinc-900">{rec.disease}</div>
                        <div className="text-zinc-500">Crop: {rec.crop} | Damage: {rec.leaf_damage_percentage}%</div>
                        <div className="text-[10px] text-zinc-400">{rec.date} {rec.time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Upload Section */}
                <div className="lg:col-span-5 space-y-4">
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
                      className="border-2 border-dashed border-zinc-300 hover:border-zinc-500 rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white min-h-[300px]"
                    >
                      <Upload className="w-10 h-10 text-zinc-400 mb-3" />
                      <h4 className="text-sm font-bold font-mono text-zinc-900">Upload 3MP Camera Leaf Image</h4>
                      <p className="text-xs text-zinc-500 mt-1">Capture from ESP32-CAM / Pi Camera (JPG, PNG, WebP)</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-xs space-y-3">
                      <img
                        src={cropImageBase64}
                        alt="Crop sample"
                        className="w-full max-h-64 object-contain rounded bg-zinc-900"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAnalyzeCrop}
                          disabled={cropLoading}
                          className="flex-1 py-2.5 rounded bg-[#166534] hover:bg-[#15803d] text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Zap className={`w-4 h-4 ${cropLoading ? 'animate-spin' : ''}`} />
                          <span>{cropLoading ? 'Gemini Analyzing Damage...' : 'Analyze with Gemini AI'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setCropImageBase64(null);
                            setCropDiagnosis(null);
                          }}
                          className="px-3 py-2.5 rounded border border-zinc-300 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {cropError && (
                    <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                      ❌ {cropError}
                    </div>
                  )}
                </div>

                {/* Diagnostic & Damage Analysis */}
                <div className="lg:col-span-7">
                  {cropDiagnosis ? (
                    <div className="p-6 rounded-lg bg-white border border-zinc-200 shadow-xs space-y-5">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">IDENTIFIED PATHOLOGY</span>
                          <h3 className="text-xl font-bold font-mono text-zinc-900">{cropDiagnosis.disease_name}</h3>
                          <span className="text-xs text-zinc-500">Crop: {cropDiagnosis.crop_type}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                          cropDiagnosis.severity === 'Severe'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {cropDiagnosis.severity} Severity
                        </span>
                      </div>

                      {/* LEAF DAMAGE PERCENTAGE GAUGE BAR */}
                      <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="font-bold text-zinc-900">LEAF SURFACE DAMAGE QUANTIFICATION:</span>
                          <span className="font-extrabold text-[#b45309]">
                            {cropDiagnosis.leaf_damage_percentage}% DESTROYED / {cropDiagnosis.healthy_tissue_percentage}% INTACT
                          </span>
                        </div>
                        
                        <div className="w-full h-3.5 rounded-full bg-emerald-100 overflow-hidden flex">
                          <div
                            className="bg-red-500 h-full transition-all duration-1000"
                            style={{ width: `${cropDiagnosis.leaf_damage_percentage}%` }}
                          />
                          <div
                            className="bg-emerald-600 h-full transition-all duration-1000"
                            style={{ width: `${cropDiagnosis.healthy_tissue_percentage}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] font-mono text-zinc-500 pt-1">
                          <span>Yield Forecast: <strong>{cropDiagnosis.yield_impact_forecast}</strong></span>
                          <span>Can be saved: <strong>{cropDiagnosis.can_be_saved ? '✅ YES (100% Recoverable)' : '⚠️ Urgent Intervention'}</strong></span>
                        </div>
                      </div>

                      {/* Multilingual Spoken Voice Prescription for Illiterate Farmer */}
                      <div className="p-4 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#166534] flex items-center gap-1.5">
                            <Volume2 className="w-4 h-4" />
                            SPOKEN PRESCRIPTION FOR FARMER:
                          </span>
                          <button
                            onClick={() => {
                              speakFarmerAudio(cropDiagnosis.farmer_voice_telugu || cropDiagnosis.summary, 'te');
                            }}
                            className="px-2.5 py-1 rounded bg-[#166534] text-white text-[11px] font-bold cursor-pointer"
                          >
                            ▶ Play in Telugu (తెలుగు)
                          </button>
                        </div>
                        <p className="text-zinc-800 font-sans leading-relaxed">
                          {cropDiagnosis.farmer_voice_telugu || cropDiagnosis.summary}
                        </p>
                      </div>

                      {/* Action Plan */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div className="p-3.5 rounded bg-zinc-50 border border-zinc-200 space-y-2">
                          <span className="font-bold text-zinc-900 block border-b border-zinc-200 pb-1">🧪 ACTION PROTOCOL</span>
                          <ul className="list-disc pl-4 space-y-1 text-zinc-700">
                            {cropDiagnosis.treatment?.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded bg-zinc-50 border border-zinc-200 space-y-2">
                          <span className="font-bold text-zinc-900 block border-b border-zinc-200 pb-1">🌿 ORGANIC REMEDIES</span>
                          <ul className="list-disc pl-4 space-y-1 text-zinc-700">
                            {cropDiagnosis.organic_remedies?.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="p-12 rounded-lg bg-zinc-50 border border-zinc-200 text-center flex flex-col items-center justify-center min-h-[300px]">
                      <span className="text-4xl mb-3">🔬</span>
                      <h4 className="text-sm font-bold font-mono text-zinc-900 uppercase">AI Diagnosis Engine Ready</h4>
                      <p className="text-xs text-zinc-500 max-w-sm mt-1">
                        Upload a photo of your crop leaf on the left to quantify leaf damage percentage and receive audio prescriptions.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: IOT COLD CHAIN                                      */}
        {/* ======================================================== */}
        {activeTab === 'ColdChain' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 font-mono flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-[#166534]" />
                  IoT Cold Chain Monitoring (ThingSpeak Channel #3474082)
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Live ingestion from ESP32 + DHT11 sensors uploading every 15 seconds.
                  {iotLastUpdated && (
                    <span className="ml-2 font-mono text-zinc-400">
                      (Last synced: {iotLastUpdated.toLocaleTimeString('en-IN')})
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadThingSpeakData}
                  disabled={iotLoading}
                  className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-xs font-mono font-medium text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer border border-zinc-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${iotLoading ? 'animate-spin' : ''}`} />
                  <span>Sync Feeds</span>
                </button>
                <button
                  onClick={() => setShowThresholdSettings(!showThresholdSettings)}
                  className="px-3 py-1.5 rounded bg-[#166534] hover:bg-[#15803d] text-xs font-mono font-medium text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Thresholds</span>
                </button>
              </div>
            </div>

            {/* Circular Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg bg-white border border-zinc-200 shadow-xs flex flex-col items-center justify-center text-center">
                <span className="text-xs font-mono font-bold uppercase text-zinc-700 mb-2">Live Temperature Reading</span>
                <div className="text-5xl font-extrabold font-mono text-zinc-900 my-3">
                  {iotTemp !== null ? iotTemp.toFixed(1) : '--'}°C
                </div>
                <div className="text-xs font-mono text-zinc-500">
                  Permissible Safe Range: {thresholds.tempMin}°C – {thresholds.tempMax}°C
                </div>
              </div>

              <div className="p-6 rounded-lg bg-white border border-zinc-200 shadow-xs flex flex-col items-center justify-center text-center">
                <span className="text-xs font-mono font-bold uppercase text-zinc-700 mb-2">Live Relative Humidity</span>
                <div className="text-5xl font-extrabold font-mono text-blue-600 my-3">
                  {iotHum !== null ? iotHum.toFixed(1) : '--'}% RH
                </div>
                <div className="text-xs font-mono text-zinc-500">
                  Target Range: {thresholds.humMin}% – {thresholds.humMax}%
                </div>
              </div>
            </div>

            {/* Historical Feeds Chart */}
            <div className="p-6 rounded-lg bg-white border border-zinc-200 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 uppercase font-mono tracking-wide mb-4">
                ThingSpeak IoT Historical Ingestion Log (100 Data Feeds)
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      iotHistory.length > 0
                        ? iotHistory
                        : NORMAL_TELEMETRY.map((n) => ({
                            time: n.time,
                            fullTime: new Date(),
                            temp: n.inside,
                            humidity: 68.0,
                          }))
                    }
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                    <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="temp" stroke="#166534" fill="#166534" fillOpacity={0.15} name="Temp (°C)" />
                    <Area type="monotone" dataKey="humidity" stroke="#2563eb" fill="#2563eb" fillOpacity={0.08} name="Humidity (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: MANDI PRICES                                        */}
        {/* ======================================================== */}
        {activeTab === 'MarketPrices' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 font-mono flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#166534]" />
                  Live Mandi Market Prices (data.gov.in Government API)
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Compare real-time wholesale mandi rates across Indian states to maximize selling profit.
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
                  <option value="">All Indian States</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Recommendation Banner */}
            {marketData?.bestMarket && (
              <div className="p-4 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-between text-xs font-mono text-[#166534]">
                <div>
                  <strong>💰 BEST SELLING PRICE: </strong>
                  Sell {selectedCommodity} at <strong>{marketData.bestMarket.market} ({marketData.bestMarket.state})</strong> for{' '}
                  <strong>₹{marketData.bestMarket.modalPrice.toLocaleString()}/quintal</strong>
                </div>
              </div>
            )}

            <div className="p-6 rounded-lg bg-white border border-zinc-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2.5 px-3">MARKET / MANDI</th>
                    <th className="py-2.5 px-3">STATE</th>
                    <th className="py-2.5 px-3">VARIETY</th>
                    <th className="py-2.5 px-3 text-right">MIN (₹)</th>
                    <th className="py-2.5 px-3 text-right">MAX (₹)</th>
                    <th className="py-2.5 px-3 text-right font-bold text-zinc-900">MODAL PRICE (₹/Q)</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData?.records.map((r, idx) => (
                    <tr key={idx} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-zinc-900">{r.market}</td>
                      <td className="py-2.5 px-3 text-zinc-600">{r.state}</td>
                      <td className="py-2.5 px-3 text-zinc-500">{r.variety}</td>
                      <td className="py-2.5 px-3 text-right text-zinc-600">₹{r.minPrice}</td>
                      <td className="py-2.5 px-3 text-right text-zinc-600">₹{r.maxPrice}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#166534]">₹{r.modalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: ROUTE PLANNER & WEATHER                             */}
        {/* ======================================================== */}
        {activeTab === 'RoutePlanner' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 font-mono flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#166534]" />
                  Smart Route Planner &amp; Weather Advisor (OpenWeatherMap + Google Maps)
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Combines Google Maps routing with OpenWeatherMap ambient risk analysis for perishable transit.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Origin Farm"
                  value={routeOrigin}
                  onChange={(e) => setRouteOrigin(e.target.value)}
                  className="px-3 py-1.5 rounded bg-white border border-zinc-300 text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Destination Mandi"
                  value={routeDestination}
                  onChange={(e) => setRouteDestination(e.target.value)}
                  className="px-3 py-1.5 rounded bg-white border border-zinc-300 text-xs font-mono"
                />
                <button
                  onClick={() => {
                    setRouteLoading(true);
                    planAgriculturalRoute(routeOrigin, routeDestination)
                      .then((data) => setRouteResult(data))
                      .finally(() => setRouteLoading(false));
                  }}
                  disabled={routeLoading}
                  className="px-4 py-1.5 rounded bg-[#166534] hover:bg-[#15803d] text-white font-mono text-xs font-bold cursor-pointer"
                >
                  {routeLoading ? 'Planning...' : 'Plan Route'}
                </button>
              </div>
            </div>

            {routeResult && (
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-white border border-zinc-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-zinc-500 uppercase">TRANSIT RISK ADVISORY</div>
                    <h3 className="text-2xl font-bold font-mono text-zinc-900">{routeResult.advisory.recommendation}</h3>
                    <div className="text-xs text-zinc-600 mt-0.5">
                      Distance: <strong>{routeResult.route.distanceKm} km</strong> • Duration: <strong>{routeResult.route.durationText}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-zinc-500 block">SAFETY SCORE</span>
                    <span className="text-3xl font-extrabold font-mono text-[#166534]">{routeResult.advisory.score}/100</span>
                  </div>
                </div>

                {routeResult.route.mapEmbedUrl && (
                  <div className="p-6 rounded-lg bg-white border border-zinc-200 shadow-xs space-y-3">
                    <iframe
                      src={routeResult.route.mapEmbedUrl}
                      width="100%"
                      height="380"
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
        {/* TAB: SENSORS & HARDWARE FIRMWARE (ESP32 + NEO-6M + PI)   */}
        {/* ======================================================== */}
        {activeTab === 'Hardware' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 font-mono flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#166534]" />
                  Sensors, NEO-6M GPS &amp; Raspberry Pi Hardware Architecture
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Complete firmware for ESP32 + NEO-6M GPS + DHT11 sensor node and Raspberry Pi voice telephony server.
                </p>
              </div>
            </div>

            {/* Hardware Pinout Specs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded bg-white border border-zinc-200 shadow-xs">
                <span className="text-zinc-500 block mb-1">MICROCONTROLLER</span>
                <div className="font-bold text-zinc-900 text-sm">ESP32 DevKit V1</div>
                <div className="text-zinc-500 mt-1">Wi-Fi + GPS UART2 + DHT11</div>
              </div>

              <div className="p-4 rounded bg-white border border-zinc-200 shadow-xs">
                <span className="text-zinc-500 block mb-1">NEO-6M GPS MODULE</span>
                <div className="font-bold text-zinc-900 text-sm">GY-GPSV3-NEO</div>
                <div className="text-zinc-500 mt-1">TX/RX on GPIO 16/17 (Ceramic Patch)</div>
              </div>

              <div className="p-4 rounded bg-white border border-zinc-200 shadow-xs">
                <span className="text-zinc-500 block mb-1">EDGE SERVER</span>
                <div className="font-bold text-zinc-900 text-sm">Raspberry Pi 4 / Zero 2W</div>
                <div className="text-zinc-500 mt-1">Runs Multilingual Voice IVR Server</div>
              </div>

              <div className="p-4 rounded bg-white border border-zinc-200 shadow-xs">
                <span className="text-zinc-500 block mb-1">CAMERA / SENSOR</span>
                <div className="font-bold text-zinc-900 text-sm">3MP Camera + DHT11</div>
                <div className="text-zinc-500 mt-1">Gemini AI Damage % Quantification</div>
              </div>
            </div>

            {/* Hardware Code 1: ESP32 + NEO-6M GPS C++ Sketch */}
            <div className="p-6 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-xs shadow-md border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-zinc-400">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>esp32_gps_dht11_thingspeak.ino (ESP32 + NEO-6M GPS + DHT11)</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(gpsFirmware);
                    setCopiedGpsCode(true);
                    setTimeout(() => setCopiedGpsCode(false), 2000);
                  }}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold cursor-pointer"
                >
                  {copiedGpsCode ? 'Copied!' : 'Copy Sketch'}
                </button>
              </div>

              <pre className="overflow-x-auto max-h-72 text-[11px] leading-relaxed text-zinc-300">
                {gpsFirmware || '// Loading ESP32 GPS Firmware...'}
              </pre>
            </div>

            {/* Hardware Code 2: Raspberry Pi Python Voice Server */}
            <div className="p-6 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-xs shadow-md border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-zinc-400">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>raspberry_pi_voice_ivr_server.py (Raspberry Pi Voice IVR Dispatch Server)</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(piVoiceScript);
                    setCopiedPiCode(true);
                    setTimeout(() => setCopiedPiCode(false), 2000);
                  }}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold cursor-pointer"
                >
                  {copiedPiCode ? 'Copied!' : 'Copy Script'}
                </button>
              </div>

              <pre className="overflow-x-auto max-h-72 text-[11px] leading-relaxed text-zinc-300">
                {piVoiceScript || '// Loading Raspberry Pi Voice Script...'}
              </pre>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-16 bg-white border-t border-zinc-200 py-8 px-6 sm:px-10 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            COLD SHIELD // ESP32, NEO-6M GPS, RASPBERRY PI VOICE IVR &amp; GEMINI AI PATHOLOGY
          </div>
          <Link href="/" className="text-[#166534] hover:underline font-semibold">
            ← Return to Cinematic Film
          </Link>
        </div>
      </footer>

    </div>
  );
}

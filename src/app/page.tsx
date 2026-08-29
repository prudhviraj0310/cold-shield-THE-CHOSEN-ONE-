'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import {
  ArrowRight,
  ArrowDown,
  ShieldCheck,
  Thermometer,
  Truck,
  PhoneCall,
  Volume2,
  Leaf,
  Sparkles,
  MapPin,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Droplets,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryScene {
  id: string;
  step: string;
  timeRangeStr: string;
  tagline: string;
  title: string;
  supporting: string;
  metricBadge: string;
  align: 'left' | 'right' | 'center';
  imageUrl: string;
}

const SCENES: StoryScene[] = [
  {
    id: 'seed',
    step: '01',
    timeRangeStr: '0s – 1s',
    tagline: '01. BIOLOGICAL ORIGIN • THE SEED',
    title: 'EVERY HARVEST BEGINS IN FERTILE SOIL.',
    supporting: 'Before food reaches a market, a warehouse, or a customer, everything begins with one living seed protected in the earth.',
    metricBadge: '🌱 Soil Moisture: 84% • Temp: 21°C • Origin: Anantapur',
    align: 'left',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'growth',
    step: '02',
    timeRangeStr: '2s – 3s',
    tagline: '02. PHOTOSYNTHESIS • VEGETATIVE HEALTH',
    title: 'SUNLIGHT, WATER, AND WATCHFUL GUARDIANSHIP.',
    supporting: 'Roots deepen and crops mature. Healthy leaves synthesize energy, requiring active camera diagnostics long before harvest.',
    metricBadge: '🍃 NDVI Health: 0.88 • Canopy: 99.2% • Leaf Damage: 0%',
    align: 'right',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'packaging',
    step: '03',
    timeRangeStr: '3s – 4s',
    tagline: '03. POST-HARVEST SORTING • PACKAGING',
    title: 'THE CRITICAL TRANSITION FROM FIELD TO CRATE.',
    supporting: 'The moment produce is picked, shelf-life countdown begins. Precision sorting and crate packaging shield it from physical shock.',
    metricBadge: '📦 Batch: 180 Crates (3,600 kg) • Grade-A Inspection PASS',
    align: 'left',
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=2069&auto=format&fit=crop',
  },
  {
    id: 'cold-room',
    step: '04',
    timeRangeStr: '5s – 7s',
    tagline: '04. THERMAL CUSTODY • 4.2°C REEFER',
    title: 'CONTINUOUS COLD CUSTODY PREVENTS RESPIRATION DECAY.',
    supporting: 'Inside the mobile reefer container, 4.2°C temperature and 68% relative humidity lock in freshness and extend shelf-life by 6 days.',
    metricBadge: '❄️ Reefer: 4.2°C Safe • Humidity: 68% RH • AI Compressor: ACTIVE',
    align: 'right',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'transport-delivery',
    step: '05',
    timeRangeStr: '8s – 10s',
    tagline: '05. SAFE ARRIVAL • ZERO LOSS',
    title: 'FROM SOIL TO MARKET: 100% CROP VALUE SECURED.',
    supporting: 'Real-time GPS telemetry and autonomous AI cooling deliver produce to the mandi with zero spoilage and maximum farmer payout.',
    metricBadge: '💰 Mandi Value: ₹88,200 • APMC Gate #2 Arrival • 0.0% Spoilage',
    align: 'center',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074&auto=format&fit=crop',
  },
];

export default function HighPolishEditorialHomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [activeStoryFilter, setActiveStoryFilter] = useState<'About' | 'Journey' | 'Vision' | 'Mission'>('About');

  // Smooth Lenis Scroll Setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      const sceneIndex = Math.min(4, Math.floor(progress * 5));
      setActiveSceneIndex(sceneIndex);
    };

    lenis.on('scroll', handleScroll);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const currentScene = SCENES[activeSceneIndex];

  return (
    <div className="bg-[#0b120c] text-white selection:bg-[#4ade80] selection:text-black font-sans">
      
      {/* ========================================================== */}
      {/* TOP FLOATING EDITORIAL NAVBAR                              */}
      {/* ========================================================== */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-mono font-bold tracking-wider text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span>COLD SHIELD // THE CHOSEN ONE</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-white/80 backdrop-blur-xs px-3 py-1 rounded-full bg-black/20">
            <span>📞 1800-COLD-FARM</span>
            <span>• Telugu / Hindi / English Voice Hotline</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#bef264] hover:bg-[#a3e635] text-black font-extrabold text-xs tracking-tight transition-transform active:scale-95 shadow-xl shadow-lime-500/20"
          >
            <span>Open Live Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ========================================================== */}
      {/* 5-SCENE EDITORIAL SCROLLYTELLING VIEWPORT                  */}
      {/* ========================================================== */}
      <div ref={containerRef} className="relative w-full h-[500vh]">
        
        {/* Sticky Fullscreen 1080P Viewport */}
        <div className="sticky top-0 w-screen h-screen overflow-hidden">
          
          {/* Background Images with Cross-Fade */}
          {SCENES.map((scene, index) => (
            <motion.div
              key={scene.id}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === activeSceneIndex ? 1 : 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <img
                src={scene.imageUrl}
                alt={scene.title}
                className="w-full h-full object-cover"
              />
              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50" />
              <div className="absolute inset-0 bg-black/25" />
            </motion.div>
          ))}

          {/* EDITORIAL POSTER GRID & TYPOGRAPHY */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-12 lg:p-16 pointer-events-none">
            
            {/* Top Navigation & Timeline Indicator */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-mono tracking-[0.25em] text-[#4ade80] uppercase block font-extrabold">
                  {currentScene.tagline}
                </span>
                <span className="text-xs font-mono text-white/75">
                  {currentScene.timeRangeStr} Transit Lifecycle
                </span>
              </div>

              {/* Progress step indicators */}
              <div className="flex items-center gap-1.5">
                {SCENES.map((s, i) => (
                  <div
                    key={s.id}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === activeSceneIndex
                        ? 'w-10 bg-[#bef264]'
                        : 'w-2 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* DYNAMIC ALTERNATING TYPOGRAPHY:
                Scene 1: Left
                Scene 2: Right
                Scene 3: Left
                Scene 4: Right
                Scene 5: Center
            */}
            <div className={`w-full my-auto ${
              currentScene.align === 'left'
                ? 'text-left mr-auto max-w-2xl'
                : currentScene.align === 'right'
                ? 'text-right ml-auto max-w-2xl'
                : 'text-center mx-auto max-w-4xl'
            }`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScene.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`space-y-4 ${
                    currentScene.align === 'left'
                      ? 'items-start'
                      : currentScene.align === 'right'
                      ? 'items-end'
                      : 'items-center'
                  }`}
                >
                  {/* Live Metric Badge Pill */}
                  <div className="inline-block px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-[#bef264] shadow-md">
                    {currentScene.metricBadge}
                  </div>

                  {/* Large Architectural Header */}
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase leading-[1.0] text-white drop-shadow-lg">
                    {currentScene.title}
                  </h2>

                  {/* Supporting Narrative */}
                  <p className="text-sm sm:text-base text-white/90 font-normal leading-relaxed drop-shadow-md font-sans">
                    {currentScene.supporting}
                  </p>

                  {/* Final Scene Direct CTA Button */}
                  {currentScene.align === 'center' && (
                    <div className="pt-4 pointer-events-auto">
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#bef264] hover:bg-[#a3e635] text-black font-extrabold text-sm tracking-tight transition-all active:scale-95 shadow-2xl shadow-lime-500/40"
                      >
                        <span>ENTER LIVE OPERATIONS MACHINE</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Editorial Manifesto (Matching Reference Image 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end border-t border-white/20 pt-4">
              <div className="lg:col-span-8">
                <p className="text-[11px] font-mono text-white/80 uppercase leading-relaxed max-w-3xl">
                  COLD SHIELD EPITOMIZES A CIRCULAR COLD-CHAIN GUARDIANSHIP MODEL DEEPLY INGRAINED IN AGRICULTURAL PRESERVATION. BY COMBINING PHYSICAL SENSORS (ESP32, DHT11, NEO-6M GPS) WITH MULTILINGUAL AI VOICE ASSISTANCE, WE ELIMINATE POST-HARVEST SPOILAGE FOR FARMERS NATIONWIDE.
                </p>
              </div>

              <div className="lg:col-span-4 flex justify-end items-center gap-3 text-xs font-mono text-white/70">
                <span>SCROLL TO ADVANCE JOURNEY</span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#bef264]" />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 2: EDITORIAL INNOVATION (Reference Image 2: FARMORA) */}
      {/* ========================================================== */}
      <section className="relative z-10 bg-white text-stone-900 px-6 sm:px-12 lg:px-20 py-24 border-t border-stone-200">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section Filter Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: 'About', label: 'About Cold Shield' },
              { id: 'Journey', label: 'Farmer Journey' },
              { id: 'Vision', label: 'Edge AI & Hardware' },
              { id: 'Mission', label: 'Voice IVR Mission' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setActiveStoryFilter(pill.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeStoryFilter === pill.id
                    ? 'bg-[#166534] text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Big Editorial Headline */}
          <div className="space-y-6 max-w-4xl">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
              • Who We Are at Cold Shield
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-[1.1]">
              With years of expertise in both farming and IoT tech, we&apos;re committed to helping farmers grow smarter and protect every harvest from thermal decay.
            </h2>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl font-normal">
              By combining physical sensors, NEO-6M GPS transit tracking, and real-time multilingual AI voice calls in Telugu, Hindi, and English, we empower rural farmers to protect their produce and secure maximum selling prices at wholesale mandis.
            </p>

            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#166534] hover:bg-[#15803d] text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <span>Explore Live Machine Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 4 Feature Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            
            {/* Card 1: 99.4% Freshness (Lime Green Card with Arrow) */}
            <div className="p-6 rounded-3xl bg-[#bef264] text-stone-950 flex flex-col justify-between space-y-8 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="text-4xl font-extrabold font-mono tracking-tight">
                  99.4%
                </div>
                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-stone-950" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold tracking-tight">Produce Freshness Index</h4>
                <p className="text-xs text-stone-800 mt-1 leading-relaxed">
                  Continuous 4.2°C thermal custody ensures zero respiration decay and maximum crispness at market.
                </p>
              </div>
            </div>

            {/* Card 2: 10+ Mandi Price Networks */}
            <div className="p-6 rounded-3xl bg-stone-100 text-stone-900 flex flex-col justify-between space-y-8 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="text-4xl font-extrabold font-mono tracking-tight">
                  10+
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-stone-800" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold tracking-tight">Mandi Price Optimization</h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Live data.gov.in integration recommending the highest paying regional market for maximum farmer profits.
                </p>
              </div>
            </div>

            {/* Card 3: 24/7 Farmer Voice Hotline */}
            <div className="p-6 rounded-3xl bg-stone-100 text-stone-900 flex flex-col justify-between space-y-8 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="text-4xl font-extrabold font-mono tracking-tight">
                  24/7
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-stone-800" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold tracking-tight">Illiterate Farmer Voice Hotline</h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Rural farmers simply dial 1800-COLD-FARM to hear comforting status updates in Telugu, Hindi, or English.
                </p>
              </div>
            </div>

            {/* Card 4: Autonomous AI Regulation */}
            <div className="p-6 rounded-3xl bg-[#166534] text-white flex flex-col justify-between space-y-8 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="text-4xl font-extrabold font-mono tracking-tight">
                  100%
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold tracking-tight">Autonomous Edge AI Regulation</h4>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  Raspberry Pi automatically engages compressor refrigeration when ambient heat rises, with zero driver delay.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* EDITORIAL FOOTER                                           */}
      {/* ========================================================== */}
      <footer className="bg-[#0b120c] text-white/60 py-12 px-6 sm:px-12 border-t border-white/10 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            COLD SHIELD // AGRICULTURAL COLD-CHAIN &amp; FARM INTELLIGENCE SYSTEM
          </div>
          <Link href="/dashboard" className="text-[#bef264] hover:underline font-bold">
            Enter Live Dashboard Machine →
          </Link>
        </div>
      </footer>

    </div>
  );
}

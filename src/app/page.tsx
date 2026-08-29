'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import {
  ArrowRight,
  ArrowDown,
  RefreshCw,
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
} from 'lucide-react';
import { motion } from 'framer-motion';

const TOTAL_FRAMES = 240;

interface StoryChapter {
  id: string;
  step: string;
  timeRangeStr: string;
  startProgress: number;
  endProgress: number;
  tagline: string;
  title: string;
  supporting: string;
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 'seed',
    step: '01',
    timeRangeStr: '0s – 1s',
    startProgress: 0.0,
    endProgress: 0.20,
    tagline: 'BIOLOGICAL ORIGIN',
    title: 'EVERY HARVEST BEGINS IN FERTILE SOIL.',
    supporting: 'Before food reaches a market, a warehouse, or a customer, everything begins with one living seed protected in the earth.',
  },
  {
    id: 'growth',
    step: '02',
    timeRangeStr: '2s – 3s',
    startProgress: 0.20,
    endProgress: 0.40,
    tagline: 'PHOTOSYNTHESIS & HEALTH',
    title: 'SUNLIGHT, WATER, AND SILENT VEGETATIVE GROWTH.',
    supporting: 'Roots deepen and crops mature. Healthy leaves synthesize energy, demanding watchful guardianship long before harvest.',
  },
  {
    id: 'packaging',
    step: '03',
    timeRangeStr: '3s – 4s',
    startProgress: 0.40,
    endProgress: 0.60,
    tagline: 'POST-HARVEST HANDLING',
    title: 'THE CRITICAL TRANSITION FROM FIELD TO CRATE.',
    supporting: 'The moment produce is picked, its shelf-life countdown begins. Immediate sorting and crate packaging shield it from physical shock.',
  },
  {
    id: 'cold-room',
    step: '04',
    timeRangeStr: '5s – 7s',
    startProgress: 0.60,
    endProgress: 0.80,
    tagline: '4.2°C THERMAL BLANKET',
    title: 'COLD-CHAIN CUSTODY PREVENTS RESPIRATION DECAY.',
    supporting: 'Inside the reefer room, continuous 4.2°C temperature and 68% relative humidity preserve cell firmness and lock in harvest freshness.',
  },
  {
    id: 'transport-delivery',
    step: '05',
    timeRangeStr: '8s – 10s',
    startProgress: 0.80,
    endProgress: 1.0,
    tagline: 'SAFE ARRIVAL',
    title: 'FROM SOIL TO MARKET: 100% CROP VALUE PROTECTED.',
    supporting: 'Real-time GPS telemetry and autonomous AI cooling deliver produce to the mandi with zero post-harvest loss.',
  },
];

export default function PolishCinematicHomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [activeStoryFilter, setActiveStoryFilter] = useState<'About' | 'Journey' | 'Vision' | 'Mission'>('About');

  const bitmapsRef = useRef<(ImageBitmap | HTMLImageElement)[]>([]);
  const lenisRef = useRef<Lenis | null>(null);

  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const lastRenderedFrameRef = useRef<number>(-1);
  const animFrameIdRef = useRef<number>(0);

  // Preload and hardware-decode 1080P lossless frames
  useEffect(() => {
    let loaded = 0;
    const array: (ImageBitmap | HTMLImageElement)[] = new Array(TOTAL_FRAMES);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(4, '0');
      img.src = `/frames/frame_${numStr}.jpg`;

      img.onload = async () => {
        try {
          if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
            const bitmap = await createImageBitmap(img);
            array[i - 1] = bitmap;
          } else {
            array[i - 1] = img;
          }
        } catch {
          array[i - 1] = img;
        }

        loaded++;
        setImagesLoaded(loaded);
      };

      array[i - 1] = img;
    }

    bitmapsRef.current = array;
  }, []);

  // Update canvas size matching retina display
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    lastRenderedFrameRef.current = -1;
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Smooth Lenis Momentum Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      targetProgressRef.current = progress;

      // Chapter selection
      if (progress <= 0.20) setCurrentChapterIndex(0);
      else if (progress <= 0.40) setCurrentChapterIndex(1);
      else if (progress <= 0.60) setCurrentChapterIndex(2);
      else if (progress <= 0.80) setCurrentChapterIndex(3);
      else setCurrentChapterIndex(4);
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

  // High-performance 60Hz/120Hz VSync Canvas Rendering
  useEffect(() => {
    const renderLoop = () => {
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.12;
      const progress = Math.max(0, Math.min(1, currentProgressRef.current));

      const frameFloat = progress * (TOTAL_FRAMES - 1);
      const frameIndex = Math.min(Math.max(0, Math.round(frameFloat)), TOTAL_FRAMES - 1);

      const canvas = canvasRef.current;
      if (canvas && frameIndex !== lastRenderedFrameRef.current) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          const imageToDraw = bitmapsRef.current[frameIndex];
          if (imageToDraw) {
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const imgWidth = imageToDraw.width || 1920;
            const imgHeight = imageToDraw.height || 1080;

            const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
            const drawWidth = imgWidth * scale;
            const drawHeight = imgHeight * scale;
            const offsetX = (canvasWidth - drawWidth) / 2;
            const offsetY = (canvasHeight - drawHeight) / 2;

            ctx.drawImage(imageToDraw, offsetX, offsetY, drawWidth, drawHeight);
            lastRenderedFrameRef.current = frameIndex;
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animFrameIdRef.current);
  }, []);

  const currentChapter = CHAPTERS[currentChapterIndex];
  const isLoaded = imagesLoaded >= 30;

  return (
    <div className="bg-[#0b120c] text-white selection:bg-[#4ade80] selection:text-black font-sans">
      
      {/* ========================================================== */}
      {/* TOP FLOATING EDITORIAL NAVBAR                              */}
      {/* ========================================================== */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span>COLD SHIELD // THE CHOSEN ONE</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-white/70">
            <span>• 1800-COLD-FARM</span>
            <span>• Telugu / Hindi / English IVR</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold text-xs tracking-tight transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <span>Open Live Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ========================================================== */}
      {/* SECTION 1: 1080P CINEMATIC SCROLLING FILM                  */}
      {/* ========================================================== */}
      <div ref={containerRef} className="relative w-full h-[500vh]">
        
        {/* Sticky Fullscreen 1080P Canvas Viewport */}
        <div className="sticky top-0 w-screen h-screen overflow-hidden">
          
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Editorial Film Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />

          {/* EDITORIAL POSTER GRID & GIANT TYPOGRAPHY (Reference Image 1: LOCALLY SOURCED) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-12 lg:p-16">
            
            {/* Top Grid & Chapter Counter */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-mono tracking-[0.25em] text-[#4ade80] uppercase block">
                  {currentChapter.tagline} • STEP {currentChapter.step}
                </span>
                <span className="text-xs font-mono text-white/60">
                  {currentChapter.timeRangeStr} In-Transit Telemetry
                </span>
              </div>

              {/* Step indicator pills */}
              <div className="flex items-center gap-1.5">
                {CHAPTERS.map((c, i) => (
                  <div
                    key={c.id}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === currentChapterIndex
                        ? 'w-8 bg-[#4ade80]'
                        : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Giant Editorial Title in Center */}
            <div className="max-w-4xl mx-auto text-center space-y-4 my-auto">
              <motion.div
                key={currentChapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase leading-[0.95] text-white drop-shadow-md">
                  {currentChapter.title}
                </h2>
                <p className="text-sm sm:text-base text-white/80 font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-sans">
                  {currentChapter.supporting}
                </p>
              </motion.div>
            </div>

            {/* Bottom Editorial Manifesto (Matching Reference Image 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end border-t border-white/15 pt-4">
              <div className="lg:col-span-8">
                <p className="text-[11px] font-mono text-white/70 uppercase leading-relaxed max-w-3xl">
                  COLD SHIELD EPITOMIZES A CIRCULAR COLD-CHAIN GUARDIANSHIP MODEL DEEPLY INGRAINED IN AGRICULTURAL PRESERVATION. BY REPURPOSING EDGE IOT (ESP32, DHT11, NEO-6M GPS) WITH MULTILINGUAL AI VOICE ASSISTANCE, WE ELIMINATE POST-HARVEST SPOILAGE FOR FARMERS NATIONWIDE.
                </p>
              </div>

              <div className="lg:col-span-4 flex justify-end items-center gap-3 text-xs font-mono text-white/60">
                <span>SCROLL TO ADVANCE JOURNEY</span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#4ade80]" />
              </div>
            </div>

          </div>

          {/* Loading Indicator */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-[#0b120c] z-50 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#4ade80] animate-spin" />
              <span className="text-xs font-mono tracking-widest text-white/80 uppercase">
                Buffering 1080P Scrollytelling Film ({Math.round((imagesLoaded / TOTAL_FRAMES) * 100)}%)
              </span>
            </div>
          )}

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
          <Link href="/dashboard" className="text-[#4ade80] hover:underline font-bold">
            Enter Live Dashboard Machine →
          </Link>
        </div>
      </footer>

    </div>
  );
}

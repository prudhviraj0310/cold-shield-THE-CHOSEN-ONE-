'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@/components/Footer';

const TOTAL_FRAMES = 240;

interface StoryChapter {
  id: string;
  step: string;
  timeRangeStr: string;
  startProgress: number;
  endProgress: number;
  title: string;
  supporting: string;
  align: 'left' | 'right' | 'center';
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 'seed',
    step: '01',
    timeRangeStr: '0s – 1s',
    startProgress: 0.0,
    endProgress: 0.20,
    title: 'EVERY JOURNEY\nBEGINS SOMEWHERE.',
    supporting: 'Before food reaches a market, a warehouse, or a customer, everything begins with one living thing in the soil.',
    align: 'left',
  },
  {
    id: 'growth',
    step: '02',
    timeRangeStr: '2s – 3s',
    startProgress: 0.20,
    endProgress: 0.40,
    title: 'IT GROWS.\nLIFE BEGINS INVISIBLE.',
    supporting: 'Photosynthesis, root depth, and vegetative health form the foundation of the crop long before harvest.',
    align: 'right',
  },
  {
    id: 'packaging',
    step: '03',
    timeRangeStr: '3s – 4s',
    startProgress: 0.40,
    endProgress: 0.60,
    title: 'HARVEST\nIS NOT THE END.',
    supporting: 'The moment a crop leaves the field and enters packaging, its journey becomes vulnerable. Respiration accelerates immediately.',
    align: 'left',
  },
  {
    id: 'cold-room',
    step: '04',
    timeRangeStr: '5s – 7s',
    startProgress: 0.60,
    endProgress: 0.80,
    title: 'NOW,\nEVERY DEGREE\nMATTERS.',
    supporting: 'The product enters the cold room. Industrial refrigeration and controlled airflow prevent post-harvest biological decay.',
    align: 'right',
  },
  {
    id: 'transport-delivery',
    step: '05',
    timeRangeStr: '8s – 10s',
    startProgress: 0.80,
    endProgress: 1.0,
    title: 'FROM SOIL\nTO SAFETY.',
    supporting: 'Behind every safe journey is a system watching it.',
    align: 'center',
  },
];

export default function Native60HzStoryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const bitmapsRef = useRef<(ImageBitmap | HTMLImageElement)[]>([]);
  const lenisRef = useRef<Lenis | null>(null);

  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const lastRenderedFrameRef = useRef<number>(-1);
  const animFrameIdRef = useRef<number>(0);

  // Preload and hardware-decode WebP frames into memory
  useEffect(() => {
    let loaded = 0;
    const array: (ImageBitmap | HTMLImageElement)[] = new Array(TOTAL_FRAMES);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(4, '0');
      img.src = `/frames/frame_${numStr}.webp`;

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

        if (i === 1 && canvasRef.current && lastRenderedFrameRef.current === -1) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
      };

      img.onerror = () => {
        const fallbackImg = new Image();
        fallbackImg.src = `/frames/frame_${numStr}.jpg`;
        fallbackImg.onload = () => {
          array[i - 1] = fallbackImg;
          loaded++;
          setImagesLoaded(loaded);
        };
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

  // 60Hz/120Hz VSync Canvas Rendering
  useEffect(() => {
    const renderLoop = () => {
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.14;
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

  return (
    <div className="bg-[#050805] text-white selection:bg-[#4ade80] selection:text-black font-sans">
      
      {/* ========================================================== */}
      {/* TOP FLOATING NAVBAR                                        */}
      {/* ========================================================== */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-xs font-mono font-bold tracking-wider text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span>COLD SHIELD</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-white/70">
            <span>• 1800-COLD-FARM</span>
            <span>• Telugu / Hindi / English</span>
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
      {/* 5-SCENE SCROLLYTELLING CONTAINER                           */}
      {/* ========================================================== */}
      <div ref={containerRef} className="relative w-full h-[500vh]">
        
        {/* Sticky Fullscreen 60Hz Canvas */}
        <div className="sticky top-0 w-screen h-screen overflow-hidden">
          
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Cinematic Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />

          {/* EDITORIAL STORY OVERLAY */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-12 lg:p-16 pointer-events-none">
            
            {/* Top Step & Time Range */}
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono tracking-[0.2em] text-[#4ade80] uppercase block font-bold">
                  STEP {currentChapter.step} • {currentChapter.timeRangeStr}
                </span>
              </div>

              {/* Progress step indicator pills */}
              <div className="flex items-center gap-1.5">
                {CHAPTERS.map((c, i) => (
                  <div
                    key={c.id}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === currentChapterIndex
                        ? 'w-8 bg-[#4ade80]'
                        : 'w-2 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STRICT ALTERNATING TYPOGRAPHY:
                01 (Seed): LEFT
                02 (Growth): RIGHT
                03 (Packaging): LEFT
                04 (Cold Room): RIGHT
                05 (Delivery): CENTER
            */}
            <div className={`w-full my-auto ${
              currentChapter.align === 'left'
                ? 'text-left mr-auto max-w-xl'
                : currentChapter.align === 'right'
                ? 'text-right ml-auto max-w-xl'
                : 'text-center mx-auto max-w-2xl'
            }`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentChapter.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter uppercase leading-[1.0] text-white drop-shadow-lg whitespace-pre-line">
                    {currentChapter.title}
                  </h2>

                  <p className="text-sm sm:text-base text-white/85 font-normal leading-relaxed drop-shadow-md font-sans">
                    {currentChapter.supporting}
                  </p>

                  {/* Final Step Direct CTA */}
                  {currentChapter.align === 'center' && (
                    <div className="pt-3 pointer-events-auto">
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4ade80] hover:bg-[#22c55e] text-black font-extrabold text-xs tracking-tight transition-transform active:scale-95 shadow-xl shadow-emerald-500/30"
                      >
                        <span>ENTER LIVE DASHBOARD</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Subtle Indicator */}
            <div className="flex items-center justify-between text-xs font-mono text-white/60 border-t border-white/10 pt-3">
              <span>COLD SHIELD // SEED-TO-MARKET GUARDIAN</span>
              <div className="flex items-center gap-1.5 text-[#4ade80]">
                <span>SCROLL TO ADVANCE</span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================== */}
      {/* REFERENCE DESIGN AGRICULTURAL FOOTER                       */}
      {/* ========================================================== */}
      <Footer />

    </div>
  );
}

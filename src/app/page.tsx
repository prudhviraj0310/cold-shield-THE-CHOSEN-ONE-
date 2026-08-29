'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import { ArrowRight, ArrowDown, RefreshCw } from 'lucide-react';

const TOTAL_FRAMES = 240;

interface StoryChapter {
  id: string;
  step: string;
  timeRangeStr: string;
  startProgress: number;
  endProgress: number;
  title: string;
  supporting: string;
  isCentered?: boolean;
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
  },
  {
    id: 'growth',
    step: '02',
    timeRangeStr: '2s – 3s',
    startProgress: 0.20,
    endProgress: 0.40,
    title: 'IT GROWS.\nLIFE BEGINS INVISIBLE.',
    supporting: 'Photosynthesis, root depth, and vegetative health form the foundation of the crop long before harvest.',
  },
  {
    id: 'packaging',
    step: '03',
    timeRangeStr: '3s – 4s',
    startProgress: 0.40,
    endProgress: 0.60,
    title: 'HARVEST\nIS NOT THE END.',
    supporting: 'The moment a crop leaves the field and enters packaging, its journey becomes vulnerable. Respiration accelerates immediately.',
  },
  {
    id: 'cold-room',
    step: '04',
    timeRangeStr: '5s – 7s',
    startProgress: 0.60,
    endProgress: 0.80,
    title: 'NOW,\nEVERY DEGREE\nMATTERS.',
    supporting: 'The product enters the cold room. Industrial refrigeration and controlled airflow prevent post-harvest biological decay.',
  },
  {
    id: 'transport-delivery',
    step: '05',
    timeRangeStr: '8s – 10s',
    startProgress: 0.80,
    endProgress: 1.0,
    title: 'FROM SOIL\nTO SAFETY.',
    supporting: 'Behind every safe journey is a system watching it.',
    isCentered: true,
  },
];

// Exact video timestamp mapping (0-1s, 2-3s, 3-4s, 5-7s, 8-10s)
function getExactVideoTime(progress: number): number {
  if (progress <= 0.20) {
    const p = progress / 0.20;
    return 0.0 + p * 1.0;
  } else if (progress <= 0.40) {
    const p = (progress - 0.20) / 0.20;
    return 2.0 + p * 1.0;
  } else if (progress <= 0.60) {
    const p = (progress - 0.40) / 0.20;
    return 3.0 + p * 1.0;
  } else if (progress <= 0.80) {
    const p = (progress - 0.60) / 0.20;
    return 5.0 + p * 2.0;
  } else {
    const p = (progress - 0.80) / 0.20;
    return 8.0 + p * 2.0;
  }
}

export default function Smooth60HzStoryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isFinalStage, setIsFinalStage] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  const bitmapsRef = useRef<(ImageBitmap | HTMLImageElement)[]>([]);
  const lenisRef = useRef<Lenis | null>(null);

  // 60Hz / 120Hz Animation State
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const lastRenderedFrameRef = useRef<number>(-1);
  const animFrameIdRef = useRef<number>(0);

  // Preload and hardware decode all 240 lossless frames into memory
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
    lastRenderedFrameRef.current = -1; // force repaint
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // High-performance 60Hz canvas draw
  const draw60HzFrame = useCallback((frameIdx: number, isCentered: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const clamped = Math.min(Math.max(0, frameIdx), TOTAL_FRAMES - 1);
    const source = bitmapsRef.current[clamped];
    if (!source) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const sw = 'width' in source ? source.width : (source as HTMLImageElement).naturalWidth;
    const sh = 'height' in source ? source.height : (source as HTMLImageElement).naturalHeight;
    if (!sw || !sh) return;

    const imgRatio = sw / sh;
    const canvasRatio = cw / ch;

    let dw = cw;
    let dh = ch;
    let ox = 0;
    let oy = 0;

    if (canvasRatio > imgRatio) {
      dw = cw;
      dh = cw / imgRatio;
      oy = (ch - dh) / 2;
    } else {
      dh = ch;
      dw = ch * imgRatio;
      if (isCentered) {
        ox = (cw - dw) * 0.5;
      } else {
        ox = (cw - dw) * 0.75;
      }
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#050709';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(source, ox, oy, dw, dh);
  }, []);

  // Main 60Hz / 120Hz VSync Render Loop with Lenis smooth scrolling
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    const onLenisScroll = (e: { scroll: number; limit: number }) => {
      const progress = e.limit > 0 ? Math.min(Math.max(e.scroll / e.limit, 0), 1) : 0;
      targetProgressRef.current = progress;
    };

    lenis.on('scroll', onLenisScroll);

    // 60Hz requestAnimationFrame tick
    const loop = (time: number) => {
      lenis.raf(time);

      // Lerp smoothing (linear interpolation for buttery 60fps motion)
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const delta = target - current;

      if (Math.abs(delta) > 0.0001) {
        currentProgressRef.current += delta * 0.22;
      } else {
        currentProgressRef.current = target;
      }

      const p = currentProgressRef.current;
      setDisplayProgress(p);

      // Compute exact video timestamp for current progress
      const videoTime = getExactVideoTime(p);
      const targetFrame = Math.min(239, Math.floor(videoTime * 24));

      const isCentered = p >= 0.92;
      setIsFinalStage(isCentered);

      // Determine active chapter
      const chIdx = CHAPTERS.findIndex(
        (ch) => p >= ch.startProgress && p <= ch.endProgress
      );
      const activeIdx = chIdx !== -1 ? chIdx : (p > 0.8 ? 4 : 0);
      setCurrentChapterIndex(activeIdx);

      // Repaint frame to canvas at 60fps
      if (lastRenderedFrameRef.current !== targetFrame) {
        draw60HzFrame(targetFrame, isCentered);
        lastRenderedFrameRef.current = targetFrame;
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      lenis.destroy();
    };
  }, [draw60HzFrame]);

  const currentChapter = CHAPTERS[currentChapterIndex] || CHAPTERS[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#050709] text-white"
      style={{ height: '500vh' }}
    >
      {/* ========================================================== */}
      {/* 100VW x 100VH 60HZ FULLSCREEN CINEMATIC CANVAS VIEWPORT    */}
      {/* ========================================================== */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden select-none">
        
        {/* Hardware-Accelerated 60Hz Canvas Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* Left-Side Dark Negative-Space Gradient (Only on side-aligned chapters) */}
        {!isFinalStage && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#050709]/95 via-[#050709]/75 to-transparent w-full lg:w-[65%] z-10" />
        )}

        {/* Symmetrical Vignette on Final Arrival Scene */}
        {isFinalStage && (
          <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-[#050709]/55 to-[#050709]/90 z-10" />
        )}

        {/* Buffering Indicator */}
        {imagesLoaded < TOTAL_FRAMES && (
          <div className="absolute top-20 right-8 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400">
            <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
            <span>BUFFERING 60HZ FRAMES ({Math.round((imagesLoaded / TOTAL_FRAMES) * 100)}%)</span>
          </div>
        )}

        {/* ========================================================== */}
        {/* MINIMAL TOP OVERLAY                                        */}
        {/* ========================================================== */}
        <header className="absolute top-0 left-0 right-0 z-40 px-8 sm:px-12 py-8 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2.5 text-xs font-mono tracking-widest text-zinc-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 sensor-ping" />
            <span>COLD-CHAIN SYSTEM // 60HZ</span>
          </div>

          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-medium tracking-wider uppercase transition-all duration-300 shadow-lg cursor-pointer"
          >
            <span>EXPLORE SYSTEM</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </header>

        {/* ========================================================== */}
        {/* CINEMATIC STORY TEXT (PHYSICALLY INTEGRATED ON TOP)        */}
        {/* ========================================================== */}
        <div className="relative z-20 w-full h-full flex items-center px-8 sm:px-16 lg:px-24 pointer-events-none">
          
          {/* CHAPTERS 1 TO 4: LEFT-ALIGNED CINEMATIC TEXT */}
          {!isFinalStage && (
            <div className="w-full max-w-2xl flex flex-col justify-center">
              <div className="text-xs font-mono text-emerald-400 font-bold tracking-widest mb-3 uppercase">
                STAGE {currentChapter.step} // {currentChapter.timeRangeStr}
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.25rem] font-black text-white tracking-tight leading-[1.04] mb-6 whitespace-pre-line drop-shadow-2xl">
                {currentChapter.title}
              </h1>

              {currentChapter.supporting && (
                <p className="text-lg sm:text-xl md:text-2xl text-zinc-300 font-light leading-relaxed max-w-xl drop-shadow-lg">
                  {currentChapter.supporting}
                </p>
              )}
            </div>
          )}

          {/* CHAPTER 5: CENTERED CINEMATIC CONCLUSION */}
          {isFinalStage && (
            <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center justify-center pointer-events-auto">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-[1.02] mb-6 drop-shadow-2xl">
                FROM SOIL<br />TO SAFETY.
              </h1>

              <p className="text-xl sm:text-2xl md:text-3xl text-zinc-300 font-light leading-relaxed mb-10 max-w-xl mx-auto drop-shadow-lg">
                Behind every safe journey is a system watching it.
              </p>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white hover:bg-zinc-100 text-black font-mono font-bold text-sm sm:text-base tracking-widest uppercase transition-all shadow-[0_0_50px_rgba(255,255,255,0.35)] hover:scale-105 cursor-pointer"
              >
                <span>EXPLORE THE MAIN SYSTEM</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}

        </div>

        {/* ========================================================== */}
        {/* 5-CHAPTER TIMELINE STEPPER & SCROLL HELPER                 */}
        {/* ========================================================== */}
        <div className="absolute bottom-8 left-8 right-8 sm:left-16 sm:right-16 z-30 flex items-center justify-between pointer-events-auto">
          {/* Chapter step markers */}
          <div className="flex items-center gap-2">
            {CHAPTERS.map((ch, idx) => {
              const isActive = idx === currentChapterIndex;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    if (lenisRef.current) {
                      const limit = lenisRef.current.limit;
                      const target = (idx / (CHAPTERS.length - 1)) * limit;
                      lenisRef.current.scrollTo(target, { duration: 1.0 });
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span>{ch.step}</span>
                  <span className="hidden md:inline ml-1.5 text-[10px] opacity-75">
                    ({ch.timeRangeStr})
                  </span>
                </button>
              );
            })}
          </div>

          {!isFinalStage && (
            <div className="hidden sm:flex items-center gap-2 text-zinc-400 text-xs font-mono tracking-widest uppercase">
              <span>SCROLL TO PROCEED</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
            </div>
          )}
        </div>

        {/* Fine bottom progress sweep line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.08] z-40 pointer-events-none">
          <div
            className="h-full bg-emerald-400 transition-all duration-75"
            style={{ width: `${Math.min(Math.max(displayProgress * 100, 0), 100)}%` }}
          />
        </div>

      </div>
    </div>
  );
}

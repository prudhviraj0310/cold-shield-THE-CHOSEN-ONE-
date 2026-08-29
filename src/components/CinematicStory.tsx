'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Play, Pause, RefreshCw, ShieldAlert, Sparkles, Activity, Thermometer } from 'lucide-react';
import { sound } from '@/lib/audio';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CinematicStoryProps {
  onProgressUpdate?: (progress: number, currentStoryIndex: number) => void;
  onColdChainEnter?: (isColdChain: boolean) => void;
  onExploreSystemClick?: () => void;
}

const TOTAL_FRAMES = 240;

interface StorySegment {
  id: string;
  step: string;
  startFrame: number;
  endFrame: number;
  badge: string;
  title: string;
  subtitle?: string;
  description: string;
  stats?: { label: string; value: string }[];
  isColdChain?: boolean;
}

const STORY_SEGMENTS: StorySegment[] = [
  {
    id: 'seed',
    step: '01',
    startFrame: 0,
    endFrame: 28,
    badge: 'STAGE 01 // SEED ORIGIN',
    title: 'EVERY JOURNEY\nBEGINS SOMEWHERE.',
    description: 'Before food reaches a market, a warehouse, or a customer, everything begins with one living thing in dark, fertile soil.',
    stats: [
      { label: 'SOIL TEMP', value: '18.4°C' },
      { label: 'MOISTURE INDEX', value: '44% RH' },
    ],
  },
  {
    id: 'germination',
    step: '02',
    startFrame: 29,
    endFrame: 58,
    badge: 'STAGE 02 // GERMINATION',
    title: 'LIFE BEGINS\nINVISIBLE.',
    description: 'Long before the journey begins, everything depends on the environment around what is growing beneath the surface.',
    stats: [
      { label: 'ROOT DEPTH', value: '12.8 cm' },
      { label: 'CELL VIGOR', value: 'OPTIMAL' },
    ],
  },
  {
    id: 'growth',
    step: '03',
    startFrame: 59,
    endFrame: 88,
    badge: 'STAGE 03 // VEGETATIVE GROWTH',
    title: 'IT GROWS.\nTHE JOURNEY\nBEGINS.',
    description: 'Photosynthesis accelerates. Cellular density and natural defenses develop under disciplined solar radiation and moisture custody.',
    stats: [
      { label: 'SOLAR DLI', value: '38.2 mol' },
      { label: 'CANOPY TEMP', value: '23.1°C' },
    ],
  },
  {
    id: 'healthy-crop',
    step: '04',
    startFrame: 89,
    endFrame: 122,
    badge: 'STAGE 04 // MATURE CROP',
    title: 'GROWTH\nIS ONLY\nTHE BEGINNING.',
    description: 'The moment the product leaves the field, a completely new and fragile journey begins.',
    stats: [
      { label: 'BRIX INDEX', value: '12.4°Bx' },
      { label: 'FIELD AMBIENT', value: '31.8°C' },
    ],
  },
  {
    id: 'harvest',
    step: '05',
    startFrame: 123,
    endFrame: 155,
    badge: 'STAGE 05 // HARVEST CUSTODY',
    title: 'HARVEST IS NOT THE END.',
    subtitle: 'IT IS WHERE THE JOURNEY BECOMES VULNERABLE.',
    description: 'Hands carefully harvest fresh produce into crates. The severed stem accelerates respiration. Without immediate thermal custody, post-harvest decay starts in minutes.',
    stats: [
      { label: 'RESPIRATION RATE', value: '+3.2°C/hr' },
      { label: 'FIELD TO COOL', value: '< 45 MIN' },
    ],
  },
  {
    id: 'cold-storage',
    step: '06',
    startFrame: 156,
    endFrame: 190,
    badge: 'STAGE 06 // COLD STORAGE',
    title: 'NOW, EVERY DEGREE\nMATTERS.',
    description: 'The agricultural product enters the cold-chain environment. Crates. Refrigeration. Controlled storage. The world transitions from warm organic to controlled industrial.',
    stats: [
      { label: 'PULLDOWN TARGET', value: '4.0°C' },
      { label: 'CHAMBER RH', value: '88%' },
    ],
    isColdChain: true,
  },
  {
    id: 'refrigerated-transport',
    step: '07',
    startFrame: 191,
    endFrame: 220,
    badge: 'STAGE 07 // REFRIGERATED TRANSPORT',
    title: 'THE JOURNEY\nDOESN\'T STOP\nAT THE FARM.',
    subtitle: 'THIS IS WHERE MONITORING BECOMES VISIBLE.',
    description: 'From warehouse storage to highway transit. Ambient heatwaves and transit delays test thermal integrity every kilometer.',
    stats: [
      { label: 'REEFER AIR', value: '3.8°C' },
      { label: 'HIGHWAY SPEED', value: '68 km/h' },
    ],
    isColdChain: true,
  },
  {
    id: 'delivered',
    step: '08',
    startFrame: 221,
    endFrame: 239,
    badge: 'STAGE 08 // PROTECTED DELIVERY',
    title: 'FROM SOIL\nTO SAFETY.',
    subtitle: 'COMPLETE THERMAL INTEGRITY PRESERVED.',
    description: 'Fresh vegetables arrive at market with zero cold-chain breaches. +4.5 days of shelf life preserved. ColdGuard verified.',
    stats: [
      { label: 'INTEGRITY SCORE', value: '99.4%' },
      { label: 'SHELF LIFE GAIN', value: '+4.5 Days' },
    ],
    isColdChain: true,
  },
];

export const CinematicStory: React.FC<CinematicStoryProps> = ({
  onProgressUpdate,
  onColdChainEnter,
  onExploreSystemClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [currentFrameNum, setCurrentFrameNum] = useState(1);
  const [scrollPct, setScrollPct] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Render the current frame cleanly onto the canvas
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clampedIndex = Math.max(0, Math.min(frameIndex, TOTAL_FRAMES - 1));
    const img = imagesRef.current[clampedIndex];

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // In desktop widescreen, the canvas is placed in the right 55-60% portion
    // Calculate aspect ratio cover math without cropping out the subject
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    // Subtle edge blending gradient on the very left edge of the canvas
    const edgeGradient = ctx.createLinearGradient(0, 0, canvasWidth * 0.25, 0);
    edgeGradient.addColorStop(0, 'rgba(5, 7, 9, 1)');
    edgeGradient.addColorStop(0.5, 'rgba(5, 7, 9, 0.4)');
    edgeGradient.addColorStop(1, 'rgba(5, 7, 9, 0)');
    ctx.fillStyle = edgeGradient;
    ctx.fillRect(0, 0, canvasWidth * 0.25, canvasHeight);

    // Subtle top & bottom edge blending
    const topGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.15);
    topGrad.addColorStop(0, 'rgba(5, 7, 9, 0.8)');
    topGrad.addColorStop(1, 'rgba(5, 7, 9, 0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.15);

    const btmGrad = ctx.createLinearGradient(0, canvasHeight * 0.85, 0, canvasHeight);
    btmGrad.addColorStop(0, 'rgba(5, 7, 9, 0)');
    btmGrad.addColorStop(1, 'rgba(5, 7, 9, 0.9)');
    ctx.fillStyle = btmGrad;
    ctx.fillRect(0, canvasHeight * 0.85, canvasWidth, canvasHeight * 0.15);
  }, []);

  // Update canvas resolution on resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      renderFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderFrame]);

  // Preload all 240 frames
  useEffect(() => {
    let loadedCount = 0;
    const imgArray: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameStr = String(i).padStart(4, '0');
      img.src = `/frames/frame_${frameStr}.webp`;

      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);

        if (i === 1) {
          renderFrame(0);
        }
      };

      imgArray.push(img);
    }

    imagesRef.current = imgArray;
  }, [renderFrame]);

  // Setup GSAP ScrollTrigger for scrollytelling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const scrollTrigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: '+=650%',
        pin: true,
        scrub: 0.25,
        onUpdate: (self) => {
          const progress = self.progress;
          setScrollPct(progress);
          const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));
          currentFrameRef.current = frameIndex;
          setCurrentFrameNum(frameIndex + 1);

          renderFrame(frameIndex);

          // Determine current story segment
          const segmentIdx = STORY_SEGMENTS.findIndex(
            (seg) => frameIndex >= seg.startFrame && frameIndex <= seg.endFrame
          );

          if (segmentIdx !== -1) {
            setCurrentSegmentIndex(segmentIdx);
            const isColdChain = !!STORY_SEGMENTS[segmentIdx].isColdChain;
            if (onColdChainEnter) {
              onColdChainEnter(isColdChain);
            }
          }

          if (onProgressUpdate) {
            onProgressUpdate(progress, segmentIdx !== -1 ? segmentIdx : 0);
          }
        },
      });

      return () => {
        scrollTrigger.kill();
      };
    }, containerRef);

    return () => ctx.revert();
  }, [renderFrame, onProgressUpdate, onColdChainEnter]);

  // Autoplay demonstration option
  const toggleAutoPlay = () => {
    if (isPlayingAuto) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      setIsPlayingAuto(false);
      sound.playClick(600);
    } else {
      setIsPlayingAuto(true);
      sound.playClick(1000);

      autoPlayTimerRef.current = setInterval(() => {
        let nextFrame = currentFrameRef.current + 1;
        if (nextFrame >= TOTAL_FRAMES) nextFrame = 0;
        currentFrameRef.current = nextFrame;
        setCurrentFrameNum(nextFrame + 1);
        renderFrame(nextFrame);

        const segmentIdx = STORY_SEGMENTS.findIndex(
          (seg) => nextFrame >= seg.startFrame && nextFrame <= seg.endFrame
        );
        if (segmentIdx !== -1) {
          setCurrentSegmentIndex(segmentIdx);
          if (onColdChainEnter) {
            onColdChainEnter(!!STORY_SEGMENTS[segmentIdx].isColdChain);
          }
        }
      }, 42); // ~24 fps
    }
  };

  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  const currentSegment = STORY_SEGMENTS[currentSegmentIndex] || STORY_SEGMENTS[0];

  return (
    <div
      id="cinematic-story"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#050709]"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Grid: LEFT 44% Typography | RIGHT 56% Cinematic Video Canvas */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-stretch">
        
        {/* LEFT 40-44%: Luxury Editorial Narrative */}
        <div className="w-full lg:w-[44%] h-full flex flex-col justify-between px-6 sm:px-12 lg:pl-16 lg:pr-8 py-20 sm:py-24 z-20 select-none bg-[#050709]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none">
          
          {/* Top Stage Indicator */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 sensor-ping" />
              <span className="text-[11px] font-mono font-semibold tracking-widest uppercase">
                {currentSegment.badge}
              </span>
            </div>
          </div>

          {/* Center: Main Story Content */}
          <div className="my-auto py-6 max-w-xl">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.08] tracking-[-0.03em] mb-4 sm:mb-6 whitespace-pre-line drop-shadow-sm">
              {currentSegment.title}
            </h1>

            {currentSegment.subtitle && (
              <h2 className="font-mono text-sm sm:text-base font-semibold text-emerald-300 mb-4 tracking-wide uppercase">
                {currentSegment.subtitle}
              </h2>
            )}

            <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed font-light mb-8 max-w-lg">
              {currentSegment.description}
            </p>

            {/* Environmental Stats Card */}
            {currentSegment.stats && (
              <div className="flex items-center gap-6 p-4 rounded-xl luxury-card max-w-md">
                {currentSegment.stats.map((stat, idx) => (
                  <div key={idx} className="flex-1 flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <span className="text-base sm:text-lg font-bold font-mono text-white tracking-tight tabular-nums">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom helper info */}
          <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
            <span className="text-emerald-400">COLDGUARD CUSTODY</span>
            <span>//</span>
            <span>SCROLL TO PROCEED THROUGH BIOLOGICAL &amp; THERMAL PHASES</span>
          </div>

        </div>

        {/* RIGHT 56%: Crisp Cinematic Subject Canvas (Zero Obstruction) */}
        <div className="relative w-full lg:w-[56%] h-full flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
          />

          {/* Buffering Indicator */}
          {imagesLoaded < TOTAL_FRAMES && (
            <div className="absolute top-20 right-8 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400">
              <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
              <span>SYNCING HIGH-RES FRAMES ({Math.round((imagesLoaded / TOTAL_FRAMES) * 100)}%)</span>
            </div>
          )}
        </div>

      </div>

      {/* LUXURY MINIMAL TIMELINE SCRUBBER AT BOTTOM */}
      <div className="absolute bottom-6 left-6 right-6 sm:left-12 sm:right-12 z-30 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
        
        {/* Sleek Line Scrubber with Milestone Ticks */}
        <div className="w-full sm:w-auto flex-1 max-w-2xl flex items-center gap-3">
          <div className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
            01 SEED
          </div>
          
          <div className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPct = (e.clientX - rect.left) / rect.width;
              window.scrollTo({ top: clickPct * (window.innerHeight * 6.5), behavior: 'smooth' });
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-75"
              style={{ width: `${Math.min(Math.max(scrollPct * 100, 0), 100)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono text-zinc-400 font-bold shrink-0">
            08 DELIVERED
          </div>
        </div>

        {/* Right Action: Frame Counter & Play Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-[11px] font-mono text-zinc-400 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
            <span>FRAME </span>
            <span className="text-white font-bold font-mono tabular-nums">
              {String(currentFrameNum).padStart(3, '0')}
            </span>
            <span className="text-zinc-600"> / {TOTAL_FRAMES}</span>
          </div>

          <button
            onClick={toggleAutoPlay}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-all border border-white/15 cursor-pointer"
          >
            {isPlayingAuto ? (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                <span>PREVIEW FILM</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

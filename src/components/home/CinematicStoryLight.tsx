'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Play, Pause, RefreshCw } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const TOTAL_FRAMES = 240;

interface Scene {
  id: string;
  step: string;
  startFrame: number;
  endFrame: number;
  badge: string;
  title: string;
  supporting: string;
  stats?: { label: string; value: string }[];
}

const SCENES: Scene[] = [
  {
    id: 'seed',
    step: 'SCENE 01',
    startFrame: 0,
    endFrame: 32,
    badge: 'STAGE 01 — SEED',
    title: 'EVERY JOURNEY\nBEGINS SOMEWHERE.',
    supporting: 'Before food reaches a market, a warehouse, or a customer, everything begins with one living thing in dark, fertile soil.',
    stats: [
      { label: 'SOIL TEMPERATURE', value: '18.4°C' },
      { label: 'MOISTURE LEVEL', value: '44% RH' },
    ],
  },
  {
    id: 'germination',
    step: 'SCENE 02',
    startFrame: 33,
    endFrame: 68,
    badge: 'STAGE 02 — GERMINATION',
    title: 'LIFE\nBEGINS INVISIBLE.',
    supporting: 'Long before harvest and transport, the final quality of agricultural produce depends on the environment around what is growing beneath the surface.',
    stats: [
      { label: 'ROOT GROWTH', value: '12.8 cm' },
      { label: 'CELL VIGOR', value: 'OPTIMAL' },
    ],
  },
  {
    id: 'growth',
    step: 'SCENE 03',
    startFrame: 69,
    endFrame: 105,
    badge: 'STAGE 03 — GROWTH',
    title: 'IT GROWS.\nTHE JOURNEY BEGINS.',
    supporting: 'Photosynthesis and vegetative health establish the cellular foundation and nutritional integrity of the crop.',
    stats: [
      { label: 'CANOPY TEMPERATURE', value: '23.1°C' },
      { label: 'SOLAR RADIATION', value: '38.2 mol' },
    ],
  },
  {
    id: 'harvest',
    step: 'SCENE 04',
    startFrame: 106,
    endFrame: 145,
    badge: 'STAGE 04 — HARVEST',
    title: 'HARVEST\nIS NOT THE END.',
    supporting: 'The moment a crop leaves the field, its journey becomes vulnerable. Respiration accelerates the second the stem is cut.',
    stats: [
      { label: 'RESPIRATION RATE', value: '+3.2°C/hr' },
      { label: 'FIELD TEMPERATURE', value: '31.8°C' },
    ],
  },
  {
    id: 'cold-chain',
    step: 'SCENE 05',
    startFrame: 146,
    endFrame: 180,
    badge: 'STAGE 05 — COLD CHAIN',
    title: 'NOW,\nEVERY DEGREE MATTERS.',
    supporting: 'Produce enters refrigerated storage. Industrial cooling begins. The biological world transitions into precision thermal control.',
    stats: [
      { label: 'TARGET CORE TEMP', value: '4.0°C' },
      { label: 'CHAMBER HUMIDITY', value: '88% RH' },
    ],
  },
  {
    id: 'transport',
    step: 'SCENE 06',
    startFrame: 181,
    endFrame: 215,
    badge: 'STAGE 06 — TRANSPORT',
    title: 'PRESERVATION\nIS A JOURNEY.',
    supporting: 'From regional storage to long-haul highway transit. Ambient weather, mechanical shifts, and travel delays test temperature integrity every kilometer.',
    stats: [
      { label: 'REEFER AIR TEMP', value: '3.8°C' },
      { label: 'TRANSIT SPEED', value: '68 km/h' },
    ],
  },
  {
    id: 'monitoring',
    step: 'SCENE 07',
    startFrame: 216,
    endFrame: 239,
    badge: 'STAGE 07 — MONITORING',
    title: 'THE JOURNEY\nIS ALWAYS BEING WATCHED.',
    supporting: 'Physical IoT sensors continuously collect core temperature, outside weather conditions, and relative humidity to protect freshness from farm to destination.',
    stats: [
      { label: 'INSIDE TEMP', value: '4.2°C' },
      { label: 'SYSTEM STATUS', value: 'PROTECTED' },
    ],
  },
];

export const CinematicStoryLight: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [currentFrameNum, setCurrentFrameNum] = useState(1);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Draw current frame to canvas
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

    // Aspect ratio fit/cover math
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

  // Setup GSAP ScrollTrigger
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const scrollTrigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: '+=600%',
        pin: true,
        scrub: 0.2,
        onUpdate: (self) => {
          const progress = self.progress;
          setScrollProgress(progress);
          const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));
          currentFrameRef.current = frameIndex;
          setCurrentFrameNum(frameIndex + 1);

          renderFrame(frameIndex);

          const sceneIdx = SCENES.findIndex(
            (scene) => frameIndex >= scene.startFrame && frameIndex <= scene.endFrame
          );

          if (sceneIdx !== -1) {
            setCurrentSceneIndex(sceneIdx);
          }
        },
      });

      return () => {
        scrollTrigger.kill();
      };
    }, containerRef);

    return () => ctx.revert();
  }, [renderFrame]);

  const toggleAutoPlay = () => {
    if (isPlayingAuto) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      setIsPlayingAuto(false);
    } else {
      setIsPlayingAuto(true);
      autoPlayTimerRef.current = setInterval(() => {
        let nextFrame = currentFrameRef.current + 1;
        if (nextFrame >= TOTAL_FRAMES) nextFrame = 0;
        currentFrameRef.current = nextFrame;
        setCurrentFrameNum(nextFrame + 1);
        renderFrame(nextFrame);

        const sceneIdx = SCENES.findIndex(
          (scene) => nextFrame >= scene.startFrame && nextFrame <= scene.endFrame
        );
        if (sceneIdx !== -1) {
          setCurrentSceneIndex(sceneIdx);
        }
      }, 42);
    }
  };

  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  const currentScene = SCENES[currentSceneIndex] || SCENES[0];

  return (
    <section
      id="cinematic-story"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#fbfbfa] border-t border-b border-zinc-200"
    >
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col lg:flex-row items-center justify-between">
        
        {/* 45% LEFT: Clean Editorial Typography */}
        <div className="w-full lg:w-[45%] h-full flex flex-col justify-between py-24 z-20 select-none">
          
          {/* Badge */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded bg-[#2d5a27]/10 text-[#2d5a27] font-mono text-xs font-bold tracking-wider uppercase border border-[#2d5a27]/20">
              {currentScene.badge}
            </span>
            <span className="text-zinc-700 text-xs font-mono">
              {currentScene.step}
            </span>
          </div>

          {/* Center Story Copy */}
          <div className="my-auto py-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-bold text-zinc-900 leading-[1.08] tracking-tight mb-6 whitespace-pre-line">
              {currentScene.title}
            </h2>

            <p className="text-base sm:text-lg text-zinc-700 font-normal leading-relaxed mb-8 max-w-lg">
              {currentScene.supporting}
            </p>

            {/* Environmental Data Card */}
            {currentScene.stats && (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-white border border-zinc-200 shadow-sm max-w-md">
                {currentScene.stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <span className="text-base sm:text-lg font-bold font-mono text-zinc-900 tracking-tight">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom helper text */}
          <div className="text-xs font-mono text-zinc-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2d5a27]" />
            <span>CONTINUOUS PHYSICAL TELEMETRY RECORDING</span>
          </div>

        </div>

        {/* 10% CENTER: Breathing Space */}
        <div className="hidden lg:block lg:w-[10%]" />

        {/* 45% RIGHT: Cinematic Visual Canvas (Clean & Crisp) */}
        <div className="w-full lg:w-[45%] h-full flex items-center justify-center py-16 lg:py-24">
          <div className="relative w-full aspect-video sm:aspect-[4/3] lg:aspect-[16/10] rounded-xl overflow-hidden shadow-xl border border-zinc-300/80 bg-zinc-900">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />

            {/* Frame Indicator Overlay */}
            <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm text-white font-mono text-[10px] tabular-nums">
              FRAME {String(currentFrameNum).padStart(3, '0')} / {TOTAL_FRAMES}
            </div>

            {/* Loading Indicator */}
            {imagesLoaded < TOTAL_FRAMES && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/90 text-zinc-800 font-mono text-[10px]">
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#2d5a27]" />
                <span>SYNCING ASSETS ({Math.round((imagesLoaded / TOTAL_FRAMES) * 100)}%)</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM CONTROLS & TIMELINE */}
      <div className="absolute bottom-4 left-6 right-6 sm:left-10 sm:right-10 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => {
                const scrollDist = (idx / (SCENES.length - 1)) * (window.innerHeight * 6);
                window.scrollTo({ top: scrollDist, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                idx === currentSceneIndex
                  ? 'bg-[#2d5a27] text-white font-bold'
                  : 'bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300'
              }`}
            >
              0{idx + 1}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoPlay}
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-zinc-300 bg-white text-zinc-800 text-xs font-mono hover:bg-zinc-50 cursor-pointer shadow-sm"
          >
            {isPlayingAuto ? (
              <>
                <Pause className="w-3 h-3 text-amber-600" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#2d5a27]" />
                <span>PLAY FILM</span>
              </>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-zinc-700">
            <span>SCROLL TO PROGRESS</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#2d5a27]" />
          </div>
        </div>
      </div>
    </section>
  );
};

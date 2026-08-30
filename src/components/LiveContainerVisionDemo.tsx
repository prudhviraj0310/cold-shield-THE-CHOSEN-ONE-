'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  Snowflake,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Volume2,
  RefreshCw,
  Eye,
  Radio,
  Sliders,
  Upload,
  Cpu,
} from 'lucide-react';
import { identifyProduceFromCamera, ProduceClassificationResult } from '@/services/containerVision';
import { speakFarmerAudio } from '@/services/voiceAssistant';
import { sound } from '@/lib/audio';

export interface LiveContainerVisionDemoProps {
  liveTemp: number;
  isHot: boolean;
  isCooling: boolean;
  coolingProgress: number;
  onInjectHeat: () => void;
  onSendCoolingSignal: (targetTemp?: number) => void;
  onSetTemperature?: (temp: number) => void;
}

export const LiveContainerVisionDemo: React.FC<LiveContainerVisionDemoProps> = ({
  liveTemp,
  isHot,
  isCooling,
  coolingProgress,
  onInjectHeat,
  onSendCoolingSignal,
  onSetTemperature,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<ProduceClassificationResult | null>(null);
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(0); // 0: Idle, 1: Capture, 2: Gemini, 3: Actuator, 4: Stabilized

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [sourceMode, setSourceMode] = useState<'pi' | 'webcam'>('pi');
  const [piUrl, setPiUrl] = useState<string>('http://10.188.198.131:5000');

  // Initialize camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Local webcam unavailable. Using Raspberry Pi USB Camera Stream.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (sourceMode === 'webcam') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [sourceMode]);

  // Capture frame from video stream
  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    return dataUrl;
  };

  // Perform full Autonomous Demo workflow: Camera ➔ Gemini ➔ Actuate Cooling
  const handleRunAutonomousScan = async (overrideImage?: string) => {
    sound.playClick(1000);
    setScanning(true);
    setActiveStep(1); // Step 1: Capture

    let imageToScan = overrideImage;
    if (!imageToScan) {
      imageToScan = captureFrame() || undefined;
    }

    if (imageToScan) {
      setCapturedImage(imageToScan);
    }

    // Step 2: Gemini AI Analysis
    setTimeout(async () => {
      setActiveStep(2);
      try {
        const dummyBase64 = imageToScan || 'sample_tomato_base64';
        const aiResult = await identifyProduceFromCamera(dummyBase64);
        setResult(aiResult);
        sound.playTelemetryPing();

        // Step 3: Actuator Trigger
        setActiveStep(3);

        // Speak the voice announcement
        if (aiResult.audio_announcement_en) {
          speakFarmerAudio(aiResult.audio_announcement_en, 'en');
        }

        // Auto-trigger cooling signal to target temperature (e.g. 4.2°C for Tomato)
        setTimeout(() => {
          onSendCoolingSignal(aiResult.target_temperature);
          if (onSetTemperature) {
            onSetTemperature(aiResult.target_temperature);
          }
          setActiveStep(4); // Step 4: Stabilized
          setScanning(false);
        }, 1200);
      } catch (err) {
        console.error('Scan error:', err);
        setScanning(false);
      }
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCapturedImage(base64);
        handleRunAutonomousScan(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-700 shadow-2xl backdrop-blur-xl space-y-6 ${
        isHot
          ? 'bg-red-950/85 text-white border-red-500/80 shadow-red-500/30'
          : isCooling
          ? 'bg-teal-950/85 text-white border-cyan-400/80 shadow-teal-500/30'
          : 'bg-emerald-950/85 text-white border-emerald-500/70 shadow-emerald-950/30'
      }`}
    >
      {/* Top Header Strip */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-white/20">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all duration-500 ${
              isHot
                ? 'bg-red-700/80 animate-pulse ring-4 ring-white/40'
                : isCooling
                ? 'bg-teal-900/80 ring-4 ring-cyan-300/40'
                : 'bg-emerald-900/80'
            }`}
          >
            {result?.crop_name.toLowerCase().includes('tomato') ? '🍅' : '🍅'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#bef264] animate-ping" />
                Live Demo Container Box
              </span>
              <span className="text-xs font-mono opacity-85">Raspberry Pi + Camera + DHT11 + Peltier Cooler</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              {isHot
                ? '⚠️ Thermal Drift Detected: Box Heating (8.6°C)!'
                : isCooling
                ? '❄️ Gemini Auto-Cooling: Stabilizing Container to 4.2°C...'
                : result
                ? `Container Ready: ${result.crop_name} (${liveTemp.toFixed(1)}°C)`
                : 'Container Ready: Place Tomato & Scan with Gemini AI'}
            </h2>

            <p className="text-xs text-white/80 font-mono mt-0.5">
              Live Camera ➔ Gemini Vision Identification ➔ Autonomous Temperature Trigger
            </p>
          </div>
        </div>

        {/* Live Status & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-center min-w-[120px]">
            <span className="text-[10px] font-mono uppercase tracking-widest block text-white/75">Inside Box</span>
            <div className="text-3xl font-extrabold font-mono tracking-tight my-0.5 text-white">
              {liveTemp.toFixed(1)}°C
            </div>
            <span className="text-[10px] font-bold block text-white/90">
              {isHot ? '⚠️ OVERHEATED' : isCooling ? '❄️ COOLING' : '✅ OPTIMAL'}
            </span>
          </div>

          <div className="flex flex-col gap-2 flex-1 sm:flex-none">
            <button
              onClick={() => handleRunAutonomousScan()}
              disabled={scanning}
              className="px-5 py-3 rounded-xl font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 bg-[#bef264] hover:bg-[#a3e635] text-stone-950 ring-2 ring-lime-300"
            >
              <Sparkles className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Gemini AI Scanning Produce...' : '▶️ Scan Live Box with Gemini AI'}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={onInjectHeat}
                className={`flex-1 px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isHot
                    ? 'bg-white text-red-700 ring-2 ring-white font-extrabold'
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Simulate Heat (8.6°C)</span>
              </button>

              <button
                onClick={() => onSendCoolingSignal(4.2)}
                className="flex-1 px-3 py-2 rounded-xl font-bold text-xs bg-cyan-400 hover:bg-cyan-300 text-teal-950 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>Cool (4.2°C)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid: Live Camera Viewport + Autonomous Decision Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Live Camera Stream Viewport (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden bg-black border border-white/25 shadow-xl relative min-h-[300px] flex flex-col justify-between">
          
          {/* Top Camera Stream Bar */}
          <div className="p-3 bg-black/70 backdrop-blur-md flex items-center justify-between border-b border-white/15 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-white uppercase">
                {cameraActive ? 'LIVE CAMERA STREAM • CONTAINER INSIDE VIEW' : 'CAMERA OFF • UPLOAD MODE'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSourceMode(sourceMode === 'pi' ? 'webcam' : 'pi')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono cursor-pointer transition-all font-bold ${
                  sourceMode === 'pi' ? 'bg-[#bef264] text-stone-950' : 'bg-white/20 text-white'
                }`}
              >
                {sourceMode === 'pi' ? '🍓 Pi USB Cam (Active)' : '💻 Switch to Pi Cam'}
              </button>
              {sourceMode === 'webcam' && (
                <button
                  onClick={cameraActive ? stopCamera : startCamera}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-mono cursor-pointer transition-all"
                >
                  {cameraActive ? 'Disable Cam' : 'Enable Cam'}
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-mono cursor-pointer transition-all flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          </div>

          {/* Video or Captured Frame */}
          <div className="relative flex-1 w-full min-h-[240px] bg-stone-900 flex items-center justify-center overflow-hidden">
            {sourceMode === 'pi' ? (
              <img
                src={`${piUrl}/stream.mjpg`}
                alt="Pi Container Live Stream"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If Pi stream not started, show fallback
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : capturedImage ? (
              <img src={capturedImage} alt="Captured Produce" className="w-full h-full object-cover" />
            ) : (
              <div className="p-6 text-center space-y-2 text-white/70">
                <Camera className="w-10 h-10 mx-auto text-white/50 animate-pulse" />
                <p className="text-xs font-mono">Camera Ready. Point at produce in container.</p>
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Start Camera Feed
                </button>
              </div>
            )}

            {/* Scanning Laser Animation Overlay */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-center">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#bef264] to-transparent animate-pulse shadow-[0_0_15px_#bef264]" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono text-[#bef264] border border-[#bef264]/40 animate-pulse">
                  ⚡ GEMINI MULTIMODAL INFERENCE IN PROGRESS...
                </div>
              </div>
            )}

            {/* Live AI Detection Bounding Box Overlay */}
            {result && !scanning && (
              <div className="absolute inset-6 border-2 border-dashed border-[#bef264] rounded-2xl pointer-events-none p-3 flex flex-col justify-between z-10 bg-[#bef264]/5">
                <div className="flex justify-between items-start">
                  <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-[#bef264] text-[10px] font-mono font-bold text-[#bef264]">
                    AI IDENTIFIED: {result.crop_name.toUpperCase()} ({result.confidence})
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[#166534] text-white text-[10px] font-mono font-bold">
                    TARGET: {result.target_temperature}°C
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-mono text-white/90 self-start">
                  STATUS: {result.ripeness} • {result.cooling_mode}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Live Telemetry Footnote */}
          <div className="p-3 bg-black/80 backdrop-blur-md border-t border-white/15 flex items-center justify-between text-[11px] font-mono text-white/80">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>EDGE BRAIN: Raspberry Pi 4B + Gemini 1.5 Flash</span>
            </div>
            <span>FRAME: 1280x720 • 30 FPS</span>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Right Column: Autonomous Decision & Temperature Regulation Engine (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4 flex flex-col justify-between">
          
          {/* Step-by-Step Pipeline Tracker */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#bef264]" />
                <span>Autonomous Demo Pipeline</span>
              </span>
              <span className="text-[10px] font-mono text-[#bef264]">
                {activeStep === 0 ? 'READY' : `STEP ${activeStep} OF 4`}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  activeStep >= 1
                    ? 'bg-emerald-500/25 border-emerald-400 text-white font-bold'
                    : 'bg-black/20 border-white/10 text-white/60'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStep >= 1 ? 'bg-emerald-400 text-stone-950' : 'bg-white/20 text-white'
                }`}>
                  1
                </span>
                <span>Camera Snaps Container Contents</span>
                {activeStep >= 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  activeStep >= 2
                    ? 'bg-emerald-500/25 border-emerald-400 text-white font-bold'
                    : 'bg-black/20 border-white/10 text-white/60'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStep >= 2 ? 'bg-emerald-400 text-stone-950' : 'bg-white/20 text-white'
                }`}>
                  2
                </span>
                <span>Gemini Identifies Tomato &amp; Calculates 4.2°C</span>
                {activeStep >= 2 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  activeStep >= 3
                    ? 'bg-emerald-500/25 border-emerald-400 text-white font-bold'
                    : 'bg-black/20 border-white/10 text-white/60'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStep >= 3 ? 'bg-emerald-400 text-stone-950' : 'bg-white/20 text-white'
                }`}>
                  3
                </span>
                <span>Actuator Signal Sent to Peltier/Compressor</span>
                {activeStep >= 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  activeStep >= 4
                    ? 'bg-emerald-500/25 border-emerald-400 text-white font-bold'
                    : 'bg-black/20 border-white/10 text-white/60'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStep >= 4 ? 'bg-emerald-400 text-stone-950' : 'bg-white/20 text-white'
                }`}>
                  4
                </span>
                <span>Container Stabilized at 4.2°C Safe Corridor</span>
                {activeStep >= 4 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
              </div>
            </div>
          </div>

          {/* Gemini AI Decision Details Card */}
          {result ? (
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/15 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[#bef264] font-mono text-[10px] font-bold">
                <span>GEMINI CLASSIFICATION</span>
                <span>{result.confidence}</span>
              </div>
              <div className="text-sm font-bold text-white">{result.crop_name}</div>
              <p className="text-[11px] text-white/80 leading-relaxed">{result.storage_rationale}</p>
              <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono border-t border-white/10 text-white/70">
                <span>Safe Range: {result.temp_range_min}°C – {result.temp_range_max}°C</span>
                <span className="text-[#bef264] font-bold">Target: {result.target_temperature}°C</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-center text-xs text-white/70 space-y-1">
              <Eye className="w-6 h-6 mx-auto text-white/40" />
              <p className="font-semibold text-white">Awaiting Camera Scan</p>
              <p className="text-[10px] text-white/60">Place a tomato in the box and click &ldquo;Scan Live Box&rdquo;.</p>
            </div>
          )}

          {/* Cooling Progress Bar */}
          {isCooling && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold text-white">
                <span>AUTONOMOUS COOLING IN PROGRESS:</span>
                <span>{coolingProgress}% (TARGET: {result?.target_temperature || 4.2}°C)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="bg-cyan-300 h-full transition-all duration-1000 ease-out"
                  style={{ width: `${coolingProgress}%` }}
                />
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

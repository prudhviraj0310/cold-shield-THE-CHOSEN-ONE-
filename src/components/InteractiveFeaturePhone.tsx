'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, PhoneCall, Volume2, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, Mic, Radio, Sparkles } from 'lucide-react';
import { sound } from '@/lib/audio';
import { speakFarmerAudio, stopFarmerAudio, CALL_SCENARIOS, VoiceLanguage } from '@/services/voiceAssistant';

export interface InteractiveFeaturePhoneProps {
  initialLanguage?: VoiceLanguage;
  liveTemp?: number;
  liveSpeed?: number;
  liveDistance?: number;
  isHot?: boolean;
  onLanguageChange?: (lang: VoiceLanguage) => void;
  compact?: boolean;
}

type CallStatus = 'IDLE' | 'RINGING' | 'CONNECTED' | 'USSD_POPUP' | 'DIALING';

export const InteractiveFeaturePhone: React.FC<InteractiveFeaturePhoneProps> = ({
  initialLanguage = 'te',
  liveTemp = 4.2,
  liveSpeed = 52.4,
  liveDistance = 128.4,
  isHot = false,
  onLanguageChange,
  compact = false,
}) => {
  const [lang, setLang] = useState<VoiceLanguage>(initialLanguage);
  const [callStatus, setCallStatus] = useState<CallStatus>('RINGING');
  const [dialedNumber, setDialedNumber] = useState<string>('');
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeIvrPrompt, setActiveIvrPrompt] = useState<string>('');
  const [ussdMessage, setUssdMessage] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial language
  useEffect(() => {
    setLang(initialLanguage);
  }, [initialLanguage]);

  // Ring tone simulation when in RINGING state
  useEffect(() => {
    if (callStatus === 'RINGING') {
      sound.playSmsAlert();
      const ringInterval = setInterval(() => {
        sound.playSmsAlert();
      }, 3500);
      return () => clearInterval(ringInterval);
    }
  }, [callStatus]);

  // Call timer when CONNECTED
  useEffect(() => {
    if (callStatus === 'CONNECTED') {
      setCallSeconds(0);
      timerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Physical keyboard support (1-9, *, #, c for Call, e for End)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'].includes(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key.toLowerCase() === 'c' || e.key === 'Enter') {
        handleAnswerCall();
      } else if (e.key.toLowerCase() === 'e' || e.key === 'Escape') {
        handleEndCall();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callStatus, lang, isHot]);

  const handleLanguageSelect = (newLang: VoiceLanguage) => {
    setLang(newLang);
    sound.playClick();
    if (onLanguageChange) onLanguageChange(newLang);

    if (callStatus === 'CONNECTED') {
      triggerVocalMessage(newLang, isHot ? 'TEMP_SPIKE_AUTONOMOUS_FIX' : 'TRANSIT_SAFE');
    }
  };

  const triggerVocalMessage = (currentLang: VoiceLanguage, scenario: keyof typeof CALL_SCENARIOS) => {
    setIsSpeaking(true);
    const script = CALL_SCENARIOS[scenario].script[currentLang === 'te' ? 'telugu' : currentLang === 'hi' ? 'hindi' : 'english'];
    speakFarmerAudio(script, currentLang, () => {
      setIsSpeaking(false);
    });
  };

  // Answer call
  const handleAnswerCall = () => {
    setPressedKey('CALL');
    sound.playDTMF('CALL');
    setTimeout(() => setPressedKey(null), 200);

    setCallStatus('CONNECTED');
    setActiveIvrPrompt('MAIN_REASSURANCE');
    triggerVocalMessage(lang, isHot ? 'TEMP_SPIKE_AUTONOMOUS_FIX' : 'TRANSIT_SAFE');
  };

  // Hangup call
  const handleEndCall = () => {
    setPressedKey('END');
    sound.playDTMF('END');
    setTimeout(() => setPressedKey(null), 200);

    stopFarmerAudio();
    setIsSpeaking(false);
    setCallStatus('IDLE');
    setDialedNumber('');
    setActiveIvrPrompt('');
  };

  // Trigger Incoming Call
  const handleTriggerIncomingCall = () => {
    sound.playClick();
    setCallStatus('RINGING');
  };

  // Keypad press handler
  const handleKeyPress = (key: string) => {
    setPressedKey(key);
    sound.playDTMF(key);
    setTimeout(() => setPressedKey(null), 180);

    if (callStatus === 'RINGING') {
      handleAnswerCall();
      return;
    }

    if (callStatus === 'CONNECTED') {
      // Interactive IVR Navigation during active call
      if (key === '1') {
        // Option 1: Live Temp & Quality
        setActiveIvrPrompt('TEMP_QUERY');
        triggerVocalMessage(lang, 'TRANSIT_SAFE');
      } else if (key === '2') {
        // Option 2: Mandi Location & Arrival
        setActiveIvrPrompt('MANDI_QUERY');
        triggerVocalMessage(lang, 'TRANSIT_SAFE');
      } else if (key === '3') {
        // Option 3: Switch Language (Telugu -> Hindi -> English -> Telugu)
        const nextLang: VoiceLanguage = lang === 'te' ? 'hi' : lang === 'hi' ? 'en' : 'te';
        handleLanguageSelect(nextLang);
      } else if (key === '4') {
        // Option 4: Emergency Warning Check
        triggerVocalMessage(lang, 'TEMP_SPIKE_AUTONOMOUS_FIX');
      }
    } else if (callStatus === 'IDLE' || callStatus === 'DIALING') {
      const nextNumber = dialedNumber + key;
      setDialedNumber(nextNumber);
      setCallStatus('DIALING');

      // USSD Check (*904# or *123#)
      if (nextNumber === '*904#' || nextNumber === '*123#') {
        sound.playTelemetryPing();
        setCallStatus('USSD_POPUP');
        setUssdMessage(`[USSD] BATCH #2048:\nTEMP: ${liveTemp.toFixed(1)}°C [SAFE]\nGPS: Kurnool NH44 (KM 42)\nETA: 4:00 PM\nPRESS 0 TO CLOSE`);
      }
    } else if (callStatus === 'USSD_POPUP') {
      if (key === '0' || key === '#') {
        setCallStatus('IDLE');
        setDialedNumber('');
      }
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`flex flex-col items-center justify-center ${compact ? 'w-full' : 'max-w-4xl mx-auto'}`}>
      
      {/* Top Header / Language Pill Picker */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <span>Farmer 2G Phone Calling Unit (రైతు ఫీచర్ ఫోన్)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">2G GSM IVR</span>
            </h3>
            <p className="text-xs text-stone-500">
              Works without internet or smartphone. Farmers dial or receive automated comforting voice updates.
            </p>
          </div>
        </div>

        {/* Trilingual Language Selector */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-full text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => handleLanguageSelect('te')}
            className={`px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
              lang === 'te' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => handleLanguageSelect('hi')}
            className={`px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
              lang === 'hi' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => handleLanguageSelect('en')}
            className={`px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
              lang === 'en' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Main Layout: Tactile Feature Phone + Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
        
        {/* LEFT COLUMN: REALISTIC RETRO FEATURE PHONE CHASSIS */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-76 sm:w-84 bg-gradient-to-b from-[#1b222c] via-[#121822] to-[#0a0e14] rounded-[42px] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_0_3px_rgba(255,255,255,0.1)] border-t border-white/20 select-none">
            
            {/* Top Antenna Stub (Classic Feature Phone Look) */}
            <div className="absolute -top-3 left-10 w-4 h-5 bg-[#121822] rounded-t-md border-t border-white/20 shadow-xs" />

            {/* Earpiece & Status Indicator */}
            <div className="flex items-center justify-between px-6 mb-3.5">
              <div className="w-14 h-1.5 rounded-full bg-stone-800 border border-white/10 shadow-inner" />
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    callStatus === 'RINGING'
                      ? 'bg-red-500 shadow-[0_0_10px_#ef4444] animate-ping'
                      : callStatus === 'CONNECTED'
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : 'bg-emerald-500/40'
                  }`}
                />
                <span className="text-[9px] font-mono text-stone-400 font-bold">2G CELL</span>
              </div>
            </div>

            {/* MONOCHROME / RETRO GREEN LCD SCREEN */}
            <div className="relative rounded-2xl bg-[#a3b899] p-3.5 mb-4.5 border-3 border-[#344031] shadow-inner text-[#142313] font-mono select-none min-h-[195px] flex flex-col justify-between overflow-hidden">
              
              {/* LCD Top Status Bar */}
              <div className="flex items-center justify-between text-[10px] font-bold border-b border-[#2d3a2b]/30 pb-1 mb-1.5 text-[#1b2c1a]">
                <div className="flex items-center gap-1.5">
                  <span>📶 4G/2G</span>
                  <span>BSNL-FARM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>🔋 88%</span>
                </div>
              </div>

              {/* LCD SCREEN STATE MACHINE */}
              <div className="flex-1 flex flex-col justify-center text-center">
                
                {/* 1. RINGING STATE */}
                {callStatus === 'RINGING' && (
                  <div className="space-y-1.5 py-1">
                    <div className="text-[10px] font-extrabold uppercase bg-[#233522] text-[#a3b899] px-2 py-0.5 rounded-sm inline-block animate-pulse">
                      📞 INCOMING CALL...
                    </div>
                    <div className="text-xs font-black text-[#0f1d0e]">
                      1800-COLD-FARM
                    </div>
                    <div className="text-[10px] font-bold text-[#1b2c1a]">
                      Kisan Reassurance Helpline
                    </div>
                    <div className="text-[9px] text-[#2c3d2b] border-t border-[#2d3a2b]/20 pt-1 mt-1">
                      Press <strong className="text-emerald-950 font-bold">[CALL]</strong> to Answer
                    </div>
                  </div>
                )}

                {/* 2. CONNECTED CALL STATE (VOICE ACTIVE) */}
                {callStatus === 'CONNECTED' && (
                  <div className="space-y-1.5 py-0.5 text-left">
                    <div className="flex items-center justify-between border-b border-[#2d3a2b]/20 pb-1">
                      <span className="text-[10px] font-extrabold text-[#0f1d0e] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-800 animate-ping" />
                        CALL ACTIVE
                      </span>
                      <span className="text-[10px] font-bold font-mono bg-[#233522] text-[#a3b899] px-1.5 py-0.5 rounded-xs">
                        {formatTimer(callSeconds)}
                      </span>
                    </div>

                    {/* Audio Equalizer wave */}
                    <div className="flex items-center justify-center gap-1 py-1">
                      {[16, 28, 12, 34, 20, 38, 24, 14, 30, 18].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#182a17] rounded-full transition-all duration-200"
                          style={{
                            height: isSpeaking ? `${(h * (callSeconds % 3 + 1)) % 28 + 6}px` : '4px',
                          }}
                        />
                      ))}
                    </div>

                    {/* Live Telemetry Display on Phone Screen */}
                    <div className="text-[10px] leading-tight space-y-0.5 bg-[#8ea384]/40 p-1.5 rounded-xs border border-[#2d3a2b]/20">
                      <div>🌡️ CARGO TEMP: <strong>{liveTemp.toFixed(1)}°C (SAFE)</strong></div>
                      <div>📍 LOC: <strong>MITS Campus (NH 42, Angallu)</strong></div>
                      <div>⏱️ MANDI ARRIVAL: <strong>4:00 PM</strong></div>
                    </div>

                    {/* Interactive IVR Menu Guide */}
                    <div className="text-[8.5px] border-t border-[#2d3a2b]/20 pt-1 text-[#223521] flex justify-between">
                      <span>[1] Status</span>
                      <span>[2] Mandi</span>
                      <span>[3] Lang ({lang.toUpperCase()})</span>
                      <span>[END] Hangup</span>
                    </div>
                  </div>
                )}

                {/* 3. DIALING / OUTGOING STATE */}
                {callStatus === 'DIALING' && (
                  <div className="space-y-2 py-2">
                    <div className="text-[10px] font-bold text-[#1b2c1a]">DIALING NUMBER:</div>
                    <div className="text-base font-black tracking-widest text-[#0e1d0d] bg-[#8ea384]/50 py-1 px-2 rounded-xs">
                      {dialedNumber || '_'}
                    </div>
                    <div className="text-[9px] text-[#2c3d2b]">
                      Press [CALL] to connect or [*904#] for USSD
                    </div>
                  </div>
                )}

                {/* 4. USSD POPUP STATE */}
                {callStatus === 'USSD_POPUP' && (
                  <div className="space-y-1 py-1 text-left bg-[#8ea384]/60 p-2 rounded-xs border border-[#2d3a2b]/30">
                    <div className="text-[9.5px] font-extrabold border-b border-[#2d3a2b]/20 pb-0.5">
                      USSD CROP TELEMETRY
                    </div>
                    <pre className="text-[9px] whitespace-pre-wrap font-mono leading-tight font-bold">
                      {ussdMessage}
                    </pre>
                  </div>
                )}

                {/* 5. IDLE STANDBY STATE */}
                {callStatus === 'IDLE' && (
                  <div className="space-y-1.5 py-2">
                    <div className="text-xs font-black text-[#0f1d0e]">
                      COLD SHIELD 2G
                    </div>
                    <div className="text-[10px] text-[#1b2c1a]">
                      Press <strong>[CALL]</strong> for Live Voice Help
                    </div>
                    <div className="text-[9px] text-[#2e402d] border-t border-[#2d3a2b]/20 pt-1">
                      Or dial <strong>*904#</strong> for instant USSD
                    </div>
                  </div>
                )}

              </div>

              {/* LCD Bottom Softkey Bar */}
              <div className="flex items-center justify-between text-[9px] font-bold border-t border-[#2d3a2b]/30 pt-1 text-[#1b2c1a]">
                <span>{callStatus === 'CONNECTED' ? 'MUTE' : 'MENU'}</span>
                <span>{callStatus === 'RINGING' ? 'ANSWER' : 'SELECT'}</span>
                <span>{callStatus === 'CONNECTED' ? 'SPEAKER' : 'EXIT'}</span>
              </div>
            </div>

            {/* CALL & NAVIGATION ROW (Green Call, D-Pad, Red End) */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Green Call Key */}
              <button
                onClick={handleAnswerCall}
                className={`p-3 rounded-2xl bg-gradient-to-b from-emerald-600 to-emerald-800 text-white font-bold flex flex-col items-center justify-center shadow-[0_4px_0_#064e3b] active:translate-y-1 active:shadow-none transition-all cursor-pointer ${
                  pressedKey === 'CALL' ? 'translate-y-1 shadow-none bg-emerald-500' : ''
                }`}
                title="Call / Answer (or press C on keyboard)"
              >
                <Phone className="w-5 h-5" />
                <span className="text-[8px] font-mono tracking-tighter mt-0.5">CALL</span>
              </button>

              {/* Center D-Pad */}
              <div className="flex items-center justify-center p-1 rounded-2xl bg-[#0b1017] border border-white/10 shadow-inner">
                <button
                  onClick={() => handleKeyPress('5')}
                  className="w-8 h-8 rounded-full bg-gradient-to-b from-stone-700 to-stone-800 border border-white/20 flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  OK
                </button>
              </div>

              {/* Red End / Hangup Key */}
              <button
                onClick={handleEndCall}
                className={`p-3 rounded-2xl bg-gradient-to-b from-rose-600 to-rose-800 text-white font-bold flex flex-col items-center justify-center shadow-[0_4px_0_#881337] active:translate-y-1 active:shadow-none transition-all cursor-pointer ${
                  pressedKey === 'END' ? 'translate-y-1 shadow-none bg-rose-500' : ''
                }`}
                title="End / Reject (or press E on keyboard)"
              >
                <PhoneOff className="w-5 h-5" />
                <span className="text-[8px] font-mono tracking-tighter mt-0.5">END</span>
              </button>
            </div>

            {/* 3x4 TACTILE KEYPAD (1-9, *, 0, #) */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { k: '1', sub: 'Status' },
                { k: '2', sub: 'Mandi' },
                { k: '3', sub: 'Lang' },
                { k: '4', sub: 'GHI' },
                { k: '5', sub: 'JKL' },
                { k: '6', sub: 'MNO' },
                { k: '7', sub: 'PQRS' },
                { k: '8', sub: 'TUV' },
                { k: '9', sub: 'WXYZ' },
                { k: '*', sub: 'USSD' },
                { k: '0', sub: '+' },
                { k: '#', sub: 'Lock' },
              ].map(({ k, sub }) => {
                const isPressed = pressedKey === k;
                const isActionKey = ['1', '2', '3'].includes(k);
                return (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-[#242e3d] to-[#151c26] border border-white/[0.08] text-white font-mono shadow-[0_3px_0_#090d13] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                      isPressed ? 'translate-y-0.5 shadow-none bg-emerald-700/60' : ''
                    } ${isActionKey ? 'hover:border-emerald-500/50' : 'hover:border-white/20'}`}
                  >
                    <span className="text-base font-extrabold">{k}</span>
                    <span className="text-[8px] text-stone-400 -mt-0.5">{sub}</span>
                    {isActionKey && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Phone Model Inscription */}
            <div className="text-center mt-4 text-[9px] font-mono tracking-widest text-stone-400 uppercase">
              COLD SHIELD • RASPBERRY PI 2G IVR NODE
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE IVR HELP & LIVE TRANSLATION SCRIPT */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Active Voice Hotline Status Card */}
          <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${callStatus === 'CONNECTED' ? 'bg-emerald-500 animate-ping' : callStatus === 'RINGING' ? 'bg-amber-500 animate-pulse' : 'bg-stone-400'}`} />
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Call Status &amp; Raspberry Pi Telephony Gateway
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white text-[10px] font-mono font-bold">
                PORT 5060 • GSM SIM800L
              </span>
            </div>

            {/* Quick Trigger Buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleTriggerIncomingCall}
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-4 h-4 text-amber-700" />
                <span>Simulate Incoming Call (1800-COLD-FARM)</span>
              </button>

              <button
                onClick={() => handleKeyPress('1')}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#166534] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Press [1] Query Live Temp</span>
              </button>
            </div>

            {/* Live Spoken Script Display */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-emerald-600 animate-bounce' : ''}`} />
                  Spoken Voice Preview ({lang === 'te' ? 'తెలుగు' : lang === 'hi' ? 'हिंदी' : 'English'}):
                </span>
                {isSpeaking && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold animate-pulse">
                    Speaking through Speaker
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-800 leading-relaxed italic bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                &ldquo;{isHot
                  ? CALL_SCENARIOS.TEMP_SPIKE_AUTONOMOUS_FIX.script[lang === 'te' ? 'telugu' : lang === 'hi' ? 'hindi' : 'english']
                  : CALL_SCENARIOS.TRANSIT_SAFE.script[lang === 'te' ? 'telugu' : lang === 'hi' ? 'hindi' : 'english']
                }&rdquo;
              </p>
            </div>

            {/* Interactive IVR Keypad Guide */}
            <div className="space-y-2 pt-1 border-t border-stone-200">
              <h5 className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">
                Interactive Voice Response (IVR) Keypad Commands:
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-emerald-800">Press [1]</span> : Spoken Cargo Temp (4.2°C)
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-emerald-800">Press [2]</span> : Mandi Highway Location &amp; ETA
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-emerald-800">Press [3]</span> : Switch Voice Language
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-emerald-800">Dial [*904#]</span> : Instant USSD Flash Screen
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

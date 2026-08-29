'use client';

import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, MessageSquare, Volume2, ShieldCheck, Cpu, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { sound } from '@/lib/audio';

type PhoneScreen = 
  | 'ALERT_SMS'
  | 'STATUS_DETAILS'
  | 'ACKNOWLEDGED'
  | 'CALLING_IVR'
  | 'REBOOT_SUCCESS'
  | 'MAIN_MENU';

export const FeaturePhoneSection: React.FC = () => {
  const [screen, setScreen] = useState<PhoneScreen>('ALERT_SMS');
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [signalBars, setSignalBars] = useState<number>(4);
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  const [ledBlink, setLedBlink] = useState<boolean>(true);

  // Trigger SMS alert chime on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      sound.playSmsAlert();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Listen for physical keyboard 1, 2, 3, c, e keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4', '0', '*', '#'].includes(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key.toLowerCase() === 'c') {
        handleCall();
      } else if (e.key.toLowerCase() === 'e') {
        handleEnd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  const handleKeyPress = (key: string) => {
    setPressedKey(key);
    sound.playDTMF(key);
    setTimeout(() => setPressedKey(null), 180);

    if (screen === 'ALERT_SMS') {
      if (key === '1') setScreen('STATUS_DETAILS');
      if (key === '2') setScreen('ACKNOWLEDGED');
      if (key === '3') setScreen('CALLING_IVR');
    } else if (screen === 'STATUS_DETAILS') {
      if (key === '1') {
        sound.playTelemetryPing();
        // Refresh simulation
        setScreen('STATUS_DETAILS');
      }
      if (key === '2') setScreen('REBOOT_SUCCESS');
      if (key === '3') setScreen('MAIN_MENU');
    } else if (screen === 'ACKNOWLEDGED' || screen === 'REBOOT_SUCCESS') {
      if (key === '1') setScreen('STATUS_DETAILS');
      if (key === '2') setScreen('CALLING_IVR');
      if (key === '3') setScreen('MAIN_MENU');
    } else if (screen === 'MAIN_MENU') {
      if (key === '1') setScreen('STATUS_DETAILS');
      if (key === '2') setScreen('ALERT_SMS');
      if (key === '3') setScreen('CALLING_IVR');
    }
  };

  const handleCall = () => {
    setPressedKey('CALL');
    sound.playDTMF('CALL');
    setTimeout(() => setPressedKey(null), 200);
    setScreen('CALLING_IVR');
  };

  const handleEnd = () => {
    setPressedKey('END');
    sound.playDTMF('END');
    setTimeout(() => setPressedKey(null), 200);
    setScreen('MAIN_MENU');
  };

  return (
    <section id="farmer-access" className="relative w-full py-24 sm:py-32 bg-[#080b0f] text-white overflow-hidden border-t border-b border-white/[0.08]">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT 50%: Story & Accessibility Philosophy */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold tracking-wider uppercase">
                INCLUSIVE ACCESS // GSM & USSD
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
              THE ALERT DOESN&apos;T NEED A SMARTPHONE.
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-6">
              In remote agricultural regions, smartphone penetration and high-speed data are never guaranteed. The ColdGuard system operates natively across basic 2G GSM cellular networks, SMS gateways, and automated Interactive Voice Response (IVR) systems.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-wide">
                    CHECK LIVE STATUS VIA USSD
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Farmers can dial a shortcode (e.g. *904#) from any 2G device to query real-time crop crate temperatures in under 3 seconds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-wide">
                    INSTANT 1-KEY ACKNOWLEDGEMENT
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    When temperature drifts occur, replying &apos;2&apos; alerts technicians and timestamps regulatory thermal compliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>INTERACTIVE SIMULATOR: Click keypad numbers or press keys 1, 2, 3 on your keyboard.</span>
            </div>
          </div>

          {/* RIGHT 50%: Interactive Tactile Feature-Phone Component */}
          <div className="lg:col-span-6 flex justify-center items-center">
            {/* Phone Outer Chassis */}
            <div className="relative w-72 sm:w-80 bg-gradient-to-b from-[#1b222c] via-[#131922] to-[#0c1017] rounded-[38px] p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_0_2px_rgba(255,255,255,0.08)] border-t border-white/20">
              
              {/* Top Earpiece & Status LED */}
              <div className="flex items-center justify-between px-6 mb-4">
                <div className="w-12 h-1.5 rounded-full bg-zinc-800 border border-white/10 shadow-inner" />
                {/* Flashing Alert LED */}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      screen === 'ALERT_SMS'
                        ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping'
                        : 'bg-emerald-500/60'
                    }`}
                  />
                  <span className="text-[8px] font-mono text-zinc-500">2G GSM</span>
                </div>
              </div>

              {/* Monochromatic / Retro LCD Screen */}
              <div className="relative rounded-2xl lcd-screen lcd-backlight p-3.5 mb-5 border-2 border-[#3b4737] overflow-hidden select-none min-h-[170px] flex flex-col justify-between">
                
                {/* LCD Top Status Bar */}
                <div className="flex items-center justify-between text-[9px] font-mono font-bold tracking-wider border-b border-[#2d3a2b]/30 pb-1 mb-1.5 text-[#182617]">
                  <div className="flex items-center gap-1">
                    <span>📶 4G/2G</span>
                    <span>CG-NET</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>14:28</span>
                    <span>🔋 85%</span>
                  </div>
                </div>

                {/* Screen Content State Machine */}
                <div className="flex-1 flex flex-col justify-center text-[10.5px] leading-tight font-mono text-[#0e190d]">
                  
                  {screen === 'ALERT_SMS' && (
                    <div className="space-y-1">
                      <div className="font-extrabold uppercase text-[11px] bg-[#223321] text-[#738a6e] px-1 py-0.5 inline-block rounded">
                        ! COLDGUARD ALERT !
                      </div>
                      <div className="font-bold">CR-04 Temp: 9.6°C</div>
                      <div className="text-[9.5px]">Safe range: 2.0–8.0°C</div>
                      <div className="text-[9.5px] font-semibold text-[#182617]">Action required:</div>
                      <div className="border-t border-[#2d3a2b]/20 pt-1 text-[9.5px] space-y-0.5">
                        <div>1: View details</div>
                        <div>2: Acknowledge</div>
                        <div>3: Call support</div>
                      </div>
                    </div>
                  )}

                  {screen === 'STATUS_DETAILS' && (
                    <div className="space-y-1">
                      <div className="font-extrabold uppercase text-[11px] border-b border-[#2d3a2b]/20 pb-0.5">
                        CR-04 STATUS
                      </div>
                      <div className="font-bold">INSIDE: 5.1°C [SAFE]</div>
                      <div>OUTSIDE: 31.8°C</div>
                      <div>COMPRESSOR: ACTIVE</div>
                      <div className="border-t border-[#2d3a2b]/20 pt-1 text-[9px]">
                        <div>1: Refresh 2: Reboot Unit 3: Menu</div>
                      </div>
                    </div>
                  )}

                  {screen === 'ACKNOWLEDGED' && (
                    <div className="space-y-1.5 text-center">
                      <div className="font-extrabold uppercase text-[11px] bg-[#223321] text-[#738a6e] px-1 py-0.5 rounded">
                        ALERT ACKNOWLEDGED
                      </div>
                      <div className="font-bold">Farmer ID #4092</div>
                      <div className="text-[9px]">Dispatched to Control Hub</div>
                      <div className="text-[8.5px] border-t border-[#2d3a2b]/20 pt-1">
                        Press 1: Status | 3: Menu
                      </div>
                    </div>
                  )}

                  {screen === 'CALLING_IVR' && (
                    <div className="space-y-1.5 text-center">
                      <div className="font-extrabold text-[11px] animate-pulse">
                        CALLING DISPATCH...
                      </div>
                      <div className="text-[10px] font-bold">+1-800-COLD-GUARD</div>
                      <div className="text-[8.5px]">IVR Voice Gateway Active</div>
                      <div className="text-[8px] bg-[#223321]/20 p-1 rounded">
                        &quot;Press 1 for status, 2 for tech dispatch&quot;
                      </div>
                    </div>
                  )}

                  {screen === 'REBOOT_SUCCESS' && (
                    <div className="space-y-1 text-center">
                      <div className="font-extrabold uppercase text-[11px] bg-[#223321] text-[#738a6e] px-1 py-0.5 rounded">
                        COMMAND SENT
                      </div>
                      <div className="font-bold">Reefer Reset Initiated</div>
                      <div className="text-[9.5px]">Temp dropping to 4.2°C</div>
                      <div className="text-[8.5px] border-t border-[#2d3a2b]/20 pt-1">
                        Press 1: Check | 3: Menu
                      </div>
                    </div>
                  )}

                  {screen === 'MAIN_MENU' && (
                    <div className="space-y-1">
                      <div className="font-extrabold uppercase text-[11px] border-b border-[#2d3a2b]/20 pb-0.5">
                        COLDGUARD MENU
                      </div>
                      <div className="text-[9.5px]">1: Current Temp</div>
                      <div className="text-[9.5px]">2: Recent Alerts</div>
                      <div className="text-[9.5px]">3: Call Support</div>
                    </div>
                  )}

                </div>

                {/* LCD Bottom Key Helper */}
                <div className="flex items-center justify-between text-[8px] font-mono border-t border-[#2d3a2b]/20 pt-1 text-[#213020]">
                  <span>OPTIONS</span>
                  <span>SELECT</span>
                  <span>BACK</span>
                </div>
              </div>

              {/* Navigation & Call Buttons Row */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {/* Green Call Button */}
                <button
                  onClick={handleCall}
                  className={`p-2.5 rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-800 text-white font-bold flex items-center justify-center shadow-[0_4px_0_#064e3b] active:translate-y-1 active:shadow-none transition-all cursor-pointer ${
                    pressedKey === 'CALL' ? 'translate-y-1 shadow-none bg-emerald-500' : ''
                  }`}
                  aria-label="Call Dispatch"
                >
                  <Phone className="w-4 h-4" />
                </button>

                {/* Center D-Pad */}
                <div className="flex items-center justify-center p-1 rounded-xl bg-[#0e131a] border border-white/10 shadow-inner">
                  <div className="w-6 h-6 rounded-full bg-zinc-700/80 border border-white/20 flex items-center justify-center text-[8px] font-mono text-zinc-300">
                    OK
                  </div>
                </div>

                {/* Red End Button */}
                <button
                  onClick={handleEnd}
                  className={`p-2.5 rounded-xl bg-gradient-to-b from-rose-600 to-rose-800 text-white font-bold flex items-center justify-center shadow-[0_4px_0_#881337] active:translate-y-1 active:shadow-none transition-all cursor-pointer ${
                    pressedKey === 'END' ? 'translate-y-1 shadow-none bg-rose-500' : ''
                  }`}
                  aria-label="End Call or Return"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
              </div>

              {/* 3x4 Tactile Keypad */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { k: '1', sub: '.,' },
                  { k: '2', sub: 'ABC' },
                  { k: '3', sub: 'DEF' },
                  { k: '4', sub: 'GHI' },
                  { k: '5', sub: 'JKL' },
                  { k: '6', sub: 'MNO' },
                  { k: '7', sub: 'PQRS' },
                  { k: '8', sub: 'TUV' },
                  { k: '9', sub: 'WXYZ' },
                  { k: '*', sub: ' ' },
                  { k: '0', sub: '+' },
                  { k: '#', sub: ' ' },
                ].map(({ k, sub }) => {
                  const isPressed = pressedKey === k;
                  const isActionKey = ['1', '2', '3'].includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => handleKeyPress(k)}
                      className={`relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-[#242e3d] to-[#161d27] border border-white/[0.08] text-white font-mono shadow-[0_3px_0_#0a0f16] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                        isPressed ? 'translate-y-0.5 shadow-none bg-emerald-700/50' : ''
                      } ${isActionKey ? 'hover:border-emerald-500/40' : 'hover:border-white/20'}`}
                    >
                      <span className="text-sm font-bold">{k}</span>
                      <span className="text-[7.5px] text-zinc-400 -mt-0.5">{sub}</span>
                      {isActionKey && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Phone Branding */}
              <div className="text-center mt-3 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                COLDGUARD 2G ACCESS UNIT
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

'use client';

import React from 'react';
import { ShieldCheck, Cpu, Radio, Globe, Terminal, ArrowUp } from 'lucide-react';
import { sound } from '@/lib/audio';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    sound.playClick(1000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#040608] text-white border-t border-white/[0.08] py-16 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-[0.25em] text-white uppercase font-mono">
                COLDGUARD // COLD-CHAIN TELEMETRY
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono max-w-md leading-relaxed">
              From microscopic seed germination to refrigerated interstate cargo transport, ColdGuard combines IoT micro-probes, LoRaWAN mesh, and 2G GSM accessibility to preserve every degree of biological freshness.
            </p>
            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-300">
              <span className="text-emerald-400">● GLOBAL NETWORK ACTIVE</span>
              <span>•</span>
              <span>18 SENSOR NODES ONLINE</span>
            </div>
          </div>

          {/* Core Pillars */}
          <div className="space-y-3 font-mono text-xs">
            <div className="text-zinc-300 font-bold uppercase tracking-wider">
              SYSTEM ARCHITECTURE
            </div>
            <ul className="space-y-2 text-zinc-400 text-[11px]">
              <li>01. High-Density Biological Film Sequence</li>
              <li>02. Micro-Thermal Ambient Differential</li>
              <li>03. Inclusive 2G GSM &amp; USSD Gateways</li>
              <li>04. ISO-22000 Cold-Chain Compliance</li>
            </ul>
          </div>

          {/* Back to top & Specs */}
          <div className="space-y-4 font-mono text-xs flex flex-col justify-between">
            <div>
              <div className="text-zinc-300 font-bold uppercase tracking-wider mb-2">
                DEPLOYMENT
              </div>
              <div className="text-zinc-400 text-[11px] space-y-1">
                <div>Framework: Next.js + React 19</div>
                <div>Motion Engine: GSAP ScrollTrigger</div>
                <div>Audio Engine: Web Audio API Synthesizer</div>
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-emerald-400 text-xs transition-all cursor-pointer w-fit"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Copyright & Timestamp */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-zinc-300">
          <div>
            © {new Date().getFullYear()} COLDGUARD AGRICULTURAL TELEMETRY SYSTEMS. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-4">
            <span>SECURE PROTOCOL V4.2</span>
            <span>GSM 850/900/1800/1900 MHZ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, ShieldCheck, ArrowRight } from 'lucide-react';
import { sound } from '@/lib/audio';

interface NavbarProps {
  onExploreClick: () => void;
  onSectionClick?: (sectionId: string) => void;
  scrollProgress?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onExploreClick,
  onSectionClick,
  scrollProgress = 0,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playClick(900);
    }
  };

  const handleNavClick = (id: string) => {
    sound.playClick(1100);
    if (onSectionClick) {
      onSectionClick(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#06080a]/85 backdrop-blur-md border-b border-white/[0.07] py-3.5 shadow-2xl'
          : 'bg-gradient-to-b from-[#06080a]/90 via-[#06080a]/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 sensor-ping" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-[0.25em] text-white uppercase">
                ColdGuard
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-emerald-400/90 border border-white/[0.08]">
                COLD-CHAIN AI
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 tracking-wider hidden sm:inline-block">
              AGRICULTURAL TELEMETRY CUSTODY
            </span>
          </div>
        </div>

        {/* Center / Right Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wider uppercase text-zinc-400">
          <button
            onClick={() => handleNavClick('cinematic-story')}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
          >
            <span className="text-zinc-400 group-hover:text-emerald-400 font-mono text-[11px]">01</span>
            <span>How It Works</span>
          </button>
          <button
            onClick={() => handleNavClick('farmer-access')}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
          >
            <span className="text-zinc-400 group-hover:text-emerald-400 font-mono text-[11px]">02</span>
            <span>Farmer Access</span>
          </button>
          <button
            onClick={() => handleNavClick('main-dashboard')}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
          >
            <span className="text-zinc-400 group-hover:text-emerald-400 font-mono text-[11px]">03</span>
            <span>System</span>
          </button>
        </nav>

        {/* Right Actions: Audio + CTA */}
        <div className="flex items-center gap-4">
          {/* Audio toggle button */}
          <button
            onClick={handleSoundToggle}
            title={isMuted ? 'Unmute telemetry audio' : 'Mute audio'}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            aria-label="Toggle Audio"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Primary CTA */}
          <button
            onClick={() => {
              sound.playClick(1400);
              onExploreClick();
            }}
            className="relative group overflow-hidden px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wider uppercase transition-all shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_-2px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer"
          >
            <span className="relative z-10">Explore Main System</span>
            <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </button>
        </div>
      </div>

      {/* Subtle bottom scroll progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/[0.04]">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-75"
          style={{ width: `${Math.min(Math.max(scrollProgress * 100, 0), 100)}%` }}
        />
      </div>
    </header>
  );
};

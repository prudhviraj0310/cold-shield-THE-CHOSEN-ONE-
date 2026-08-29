'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const HomeNavbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbfbfa]/90 backdrop-blur-md border-b border-zinc-200 transition-all">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        {/* Left: System Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2d5a27]" />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-zinc-900 uppercase">
              Cold-Chain Monitoring System
            </span>
            <span className="text-[10px] font-mono text-zinc-700 tracking-wider">
              AGRICULTURAL TELEMETRY &amp; CUSTODY
            </span>
          </div>
        </Link>

        {/* Center / Right Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-zinc-700">
          <a href="#hero" className="hover:text-zinc-900 transition-colors">
            Overview
          </a>
          <a href="#cinematic-story" className="hover:text-zinc-900 transition-colors">
            The Journey
          </a>
          <a href="#transition" className="hover:text-zinc-900 transition-colors">
            System Transition
          </a>
        </nav>

        {/* Primary CTA to /dashboard */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold tracking-wide uppercase transition-colors"
        >
          <span>Explore Main System</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  Mail,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Send,
  CheckCircle2,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { sound } from '@/lib/audio';

export const Footer: React.FC = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [region, setRegion] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) return;
    sound.playClick(1100);
    setSubscribed(true);
  };

  return (
    <footer className="w-full bg-[#164e28] text-white font-sans">
      
      {/* ========================================================== */}
      {/* ORGANIC TREE/HILL SILHOUETTE SVG DIVIDER                   */}
      {/* ========================================================== */}
      <div className="w-full overflow-hidden leading-none bg-[#050805]">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 text-[#164e28] preserve-3d"
        >
          <path
            d="M0 120L0 55C45 42 90 62 135 50C180 38 225 18 270 25C315 32 360 65 405 58C450 51 495 15 540 22C585 29 630 68 675 60C720 52 765 10 810 15C855 20 900 62 945 55C990 48 1035 12 1080 18C1125 24 1170 65 1215 58C1260 51 1305 15 1350 20C1395 25 1418 45 1440 50L1440 120H0Z"
            fill="#164e28"
          />
        </svg>
      </div>

      {/* ========================================================== */}
      {/* DEEP FOREST GREEN FOOTER BODY                              */}
      {/* ========================================================== */}
      <div className="w-full bg-[#164e28] text-white pt-10 pb-8 px-6 sm:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/15">
            
            {/* Column 1: Left Navigation (md:col-span-3) */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                Cold Shield Network
              </h4>
              <ul className="space-y-2.5 text-xs text-white/80 font-medium">
                <li>
                  <Link href="/" className="hover:text-emerald-300 transition-colors">
                    Cinematic Seed-to-Mandi Story
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-300 transition-colors">
                    Live APMC Mandi Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-300 transition-colors">
                    Toll-Free Voice Hotline (Telugu / Hindi)
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-300 transition-colors">
                    Regional Cold Storage Unit Logs
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-300 transition-colors">
                    AI Crop Doctor Leaf Pathology
                  </Link>
                </li>
              </ul>

              {/* Social / Helpline Links */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] text-white/60 font-mono">APMC Partner Network Active</span>
              </div>
            </div>

            {/* Column 2: Center Newsletter / Mandi Price Alerts (md:col-span-5) */}
            <div className="md:col-span-5 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#bef264]" />
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Live Mandi Price &amp; Spoilage Alerts
                  </h3>
                </div>
                <p className="text-xs text-white/80 leading-relaxed italic">
                  Subscribe to receive daily APMC mandi market price forecasts, storage unit availability, and thermal custody alerts directly to your phone.
                </p>
              </div>

              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div>
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="*Farmer Phone Number (e.g. +91 94401 55667)"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0f381c] border border-white/20 text-white placeholder:text-white/50 text-xs focus:outline-none focus:border-emerald-300 transition-colors"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="*Mandi Region (e.g. Kurnool APMC)"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#0f381c] border border-white/20 text-white placeholder:text-white/50 text-xs focus:outline-none focus:border-emerald-300 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#bef264] hover:bg-[#a3e635] text-black font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                    >
                      SIGN UP
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-[#0f381c] border border-emerald-400 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Subscribed! You will receive live APMC mandi price alerts.</span>
                </div>
              )}
            </div>

            {/* Column 3: Right Contact & 24/7 Hotline (md:col-span-4) */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  Direct Mandi Helpdesk →
                </span>
              </div>

              <div className="space-y-2 text-xs text-white/85">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-300 shrink-0" />
                  <strong className="text-sm text-white font-mono">1800-COLD-FARM (1800-265-3327)</strong>
                </div>
                <div className="text-[11px] text-emerald-200">
                  Toll-Free Helpline in Telugu, Hindi &amp; English
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <MapPin className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    APMC Cold Logistics Terminal, NH 44 Highway Hub, Kurnool, Andhra Pradesh 518002
                  </span>
                </div>
              </div>

              {/* Certified Agri-Tech Trust Badge */}
              <div className="p-3 rounded-xl bg-[#0f381c] border border-emerald-400/30 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    ICAR &amp; APMC Certified Mandi Standard
                  </div>
                  <div className="text-[10px] text-white/60">
                    ISO-22000 Cold-Chain Custody Protocol
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sub-footer bottom bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/60 font-mono">
            <div>
              © 2026 Cold Shield (Team: The Chosen One). All Rights Reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>APMC Live Mandi Data Feed</span>
              <span>•</span>
              <span>Open Telemetry Protocol</span>
              <span>•</span>
              <span>Kurnool Mandi Yard</span>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
};

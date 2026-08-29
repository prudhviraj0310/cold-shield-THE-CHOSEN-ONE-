'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Building,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { sound } from '@/lib/audio';

export interface MandiRate {
  mandiName: string;
  district: string;
  crop: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  changeAmount: number;
  dailyArrivalsMT: number;
}

const REGIONAL_MANDI_RATES: MandiRate[] = [
  {
    mandiName: 'Kurnool APMC Market Yard',
    district: 'Kurnool, AP',
    crop: 'Tomato (Hybrid Grade-A)',
    modalPrice: 2450,
    minPrice: 2100,
    maxPrice: 2600,
    trend: 'UP',
    changeAmount: 120,
    dailyArrivalsMT: 140,
  },
  {
    mandiName: 'Madanapalle APMC (Tomato Hub)',
    district: 'Annamayya, AP',
    crop: 'Tomato (Grade-A Export)',
    modalPrice: 2620,
    minPrice: 2250,
    maxPrice: 2800,
    trend: 'UP',
    changeAmount: 180,
    dailyArrivalsMT: 380,
  },
  {
    mandiName: 'Anantapur APMC Yard',
    district: 'Anantapur, AP',
    crop: 'Tomato (Country/Desi)',
    modalPrice: 2380,
    minPrice: 1950,
    maxPrice: 2480,
    trend: 'STABLE',
    changeAmount: 0,
    dailyArrivalsMT: 95,
  },
  {
    mandiName: 'Bowenpally APMC Terminal',
    district: 'Hyderabad, TS',
    crop: 'Tomato (Polyhouse Red)',
    modalPrice: 2550,
    minPrice: 2200,
    maxPrice: 2700,
    trend: 'UP',
    changeAmount: 90,
    dailyArrivalsMT: 210,
  },
  {
    mandiName: 'Kurnool APMC Yard',
    district: 'Kurnool, AP',
    crop: 'Guntur/Kurnool Red Chilli',
    modalPrice: 14200,
    minPrice: 12800,
    maxPrice: 15500,
    trend: 'UP',
    changeAmount: 450,
    dailyArrivalsMT: 75,
  },
  {
    mandiName: 'Kurnool APMC Yard',
    district: 'Kurnool, AP',
    crop: 'Bellary Onion (Medium)',
    modalPrice: 1850,
    minPrice: 1500,
    maxPrice: 2000,
    trend: 'DOWN',
    changeAmount: 40,
    dailyArrivalsMT: 190,
  },
];

export function LiveMandiBoard() {
  const [selectedCropFilter, setSelectedCropFilter] = useState<'All' | 'Tomato' | 'Chilli' | 'Onion'>('All');

  const filteredRates = selectedCropFilter === 'All'
    ? REGIONAL_MANDI_RATES
    : REGIONAL_MANDI_RATES.filter((r) => r.crop.toLowerCase().includes(selectedCropFilter.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* SECTION HEADER & CROP FILTER PILLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#166534] text-white">
              Live Mandi Intelligence
            </span>
            <span className="text-xs font-mono text-stone-600 font-bold">APMC Daily Price Registry</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mt-1">
            APMC Wholesale Mandi Yard Pricing &amp; Dock Arrival Passport
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-full text-xs font-bold shrink-0">
          {(['All', 'Tomato', 'Chilli', 'Onion'] as const).map((crop) => (
            <button
              key={crop}
              onClick={() => {
                sound.playClick(1000);
                setSelectedCropFilter(crop);
              }}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCropFilter === crop
                  ? 'bg-[#166534] text-white shadow-xs'
                  : 'text-stone-700 hover:text-black hover:bg-stone-200'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* TOP SUMMARY: ACTIVE CONSIGNMENT AT MANDI */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-[#166534] to-emerald-950 text-white shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/20">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
              🏢
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#bef264] font-bold block">
                RESERVED MANDI AUCTION DOCK
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Kurnool APMC Wholesale Market Yard • Bay #4
              </h4>
              <p className="text-xs text-white/80 font-medium mt-0.5">
                Consignment Batch #AP-KNL-2048 • Verified Cold Custody Grade-A
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-center min-w-[140px]">
              <span className="text-[10px] font-mono text-white/70 uppercase">Estimated Batch Value</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#bef264] font-mono my-0.5">
                ₹88,200
              </div>
              <span className="text-[10px] text-white/80 font-bold">180 Crates (3,600 kg)</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-center min-w-[130px]">
              <span className="text-[10px] font-mono text-white/70 uppercase">Mandi Rate Today</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono my-0.5">
                ₹2,450
              </div>
              <span className="text-[10px] text-emerald-300 font-bold">▲ +₹120 / Quintal</span>
            </div>
          </div>

        </div>

        {/* 4 Quick Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-[10px] font-mono text-white/70 uppercase block">Dock Arrival ETA</span>
            <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#bef264]" />
              <span>4:00 PM (1h 12m)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-[10px] font-mono text-white/70 uppercase block">Quality Grade</span>
            <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#bef264]" />
              <span>Grade-A Crisp (0% Penalty)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-[10px] font-mono text-white/70 uppercase block">Assigned Trader</span>
            <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#bef264]" />
              <span>Balaji Agro Traders</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-[10px] font-mono text-white/70 uppercase block">Payment Escrow</span>
            <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>100% Escrow Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* REGIONAL APMC MANDI PRICE INDEX TABLE & LIVE TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRates.map((rate, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-md space-y-4 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                  {rate.district}
                </span>
                <h5 className="text-sm font-bold text-stone-900 mt-0.5">{rate.mandiName}</h5>
                <span className="text-xs text-stone-500 font-medium block mt-0.5">{rate.crop}</span>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                rate.trend === 'UP'
                  ? 'bg-emerald-100 text-[#166534]'
                  : rate.trend === 'DOWN'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-stone-100 text-stone-700'
              }`}>
                {rate.trend === 'UP' && <ArrowUpRight className="w-3.5 h-3.5" />}
                {rate.trend === 'DOWN' && <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{rate.trend === 'UP' ? `+₹${rate.changeAmount}` : rate.trend === 'DOWN' ? `-₹${rate.changeAmount}` : 'Stable'}</span>
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Wholesale Rate</span>
                <div className="text-2xl font-extrabold text-stone-900 font-mono">
                  ₹{rate.modalPrice.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-stone-400">per Quintal (100 kg)</span>
              </div>

              <div className="text-right text-xs space-y-0.5">
                <div className="text-stone-500">Min: <strong className="text-stone-700">₹{rate.minPrice}</strong></div>
                <div className="text-stone-500">Max: <strong className="text-emerald-700">₹{rate.maxPrice}</strong></div>
                <div className="text-[11px] text-stone-400 font-mono pt-1">Vol: {rate.dailyArrivalsMT} MT</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-stone-600 pt-1">
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cold custody: +₹350/Q gain</span>
              </span>
              <span className="font-mono text-[11px] text-stone-400">Updated: Live</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

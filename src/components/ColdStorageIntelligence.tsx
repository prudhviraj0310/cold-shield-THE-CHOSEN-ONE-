'use client';

import React, { useState } from 'react';
import {
  Warehouse,
  TrendingUp,
  DollarSign,
  Thermometer,
  Layers,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface ColdStorageUnit {
  id: string;
  name: string;
  location: string;
  chamberType: string;
  temp: number;
  humidity: number;
  totalCapacityMT: number;
  usedCapacityMT: number;
  dailyRatePerMT: number;
  status: 'OPTIMAL' | 'NEAR_FULL' | 'AVAILABLE';
}

const STORAGE_UNITS: ColdStorageUnit[] = [
  {
    id: 'CSU-01',
    name: 'Anantapur Agro Cold Hub (Chamber A)',
    location: 'Anantapur NH 44 Terminal',
    chamberType: 'Fresh Produce (Tomatoes & Vegetables)',
    temp: 4.2,
    humidity: 68,
    totalCapacityMT: 500,
    usedCapacityMT: 410,
    dailyRatePerMT: 120,
    status: 'OPTIMAL',
  },
  {
    id: 'CSU-02',
    name: 'Kurnool APMC Central Cold Warehouse',
    location: 'Kurnool Mandi Yard Bay 4',
    chamberType: 'Fruit & Citrus Climate Controlled',
    temp: 3.8,
    humidity: 72,
    totalCapacityMT: 750,
    usedCapacityMT: 340,
    dailyRatePerMT: 110,
    status: 'AVAILABLE',
  },
  {
    id: 'CSU-03',
    name: 'Dhone Highway Reefer Buffer Station',
    location: 'Dhone Junction KM 62',
    chamberType: 'Transit Buffer & Cross-Dock',
    temp: 4.5,
    humidity: 65,
    totalCapacityMT: 300,
    usedCapacityMT: 280,
    dailyRatePerMT: 130,
    status: 'NEAR_FULL',
  },
];

export function ColdStorageIntelligence() {
  const [selectedCrop, setSelectedCrop] = useState<'Tomato' | 'Chilli' | 'Mango'>('Tomato');
  const [storageDays, setStorageDays] = useState<number>(15);

  // Price forecast economics
  const currentPricePerQ = selectedCrop === 'Tomato' ? 2450 : selectedCrop === 'Chilli' ? 14200 : 4800;
  const projectedPricePerQ = selectedCrop === 'Tomato' ? 2920 : selectedCrop === 'Chilli' ? 16800 : 5900;
  const storageCostPerQ = (storageDays * 8); // ₹8 per quintal per day
  const grossGainPerQ = projectedPricePerQ - currentPricePerQ;
  const netGainPerQ = grossGainPerQ - storageCostPerQ;
  const netGainPercentage = ((netGainPerQ / currentPricePerQ) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            FACILITY INTELLIGENCE &amp; COST VARIATIONS
          </span>
          <h3 className="text-xl font-bold text-stone-900 mt-0.5">
            Regional Cold Storage Units &amp; Mandi Price Forecasting
          </h3>
        </div>

        <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-full text-xs font-semibold">
          {(['Tomato', 'Chilli', 'Mango'] as const).map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCrop === crop
                  ? 'bg-[#166534] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* 2-COLUMN GRID: COST VARIANCE PREDICTOR + COLD STORAGE UNIT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT (7 Cols): 30-Day Mandi Price & Holding Profit Predictor */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#166534] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  AI Mandi Arbitrage &amp; Storage Holding Calculator
                </h4>
                <p className="text-[11px] text-stone-500">
                  Should you sell immediately or hold produce in cold storage?
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#bef264] text-stone-950">
              +{netGainPercentage}% Net Return
            </span>
          </div>

          {/* Storage Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-stone-700">
              <span>HOLDING DURATION IN COLD STORAGE:</span>
              <span className="text-[#166534]">{storageDays} Days Forecast</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={storageDays}
              onChange={(e) => setStorageDays(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#166534]"
            />
          </div>

          {/* Economics Breakdown Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">TODAY HARVEST RATE</span>
              <div className="text-lg font-extrabold text-stone-900 mt-1">₹{currentPricePerQ}</div>
              <span className="text-[10px] text-stone-400">per Quintal</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-800 font-bold block">PROJECTED RATE (+{storageDays}d)</span>
              <div className="text-lg font-extrabold text-[#166534] mt-1">₹{projectedPricePerQ}</div>
              <span className="text-[10px] text-emerald-700 font-semibold">+₹{grossGainPerQ} gross rise</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#bef264]/30 border border-lime-300">
              <span className="text-[10px] text-stone-900 font-bold block">NET PROFIT GAIN</span>
              <div className="text-lg font-extrabold text-[#166534] mt-1">+₹{netGainPerQ}</div>
              <span className="text-[10px] text-stone-600 font-medium">after ₹{storageCostPerQ} fee</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 font-sans flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
            <span>
              <strong>Market Recommendation:</strong> Holding 180 crates (36 Quintals) for {storageDays} days generates an additional <strong>₹{(netGainPerQ * 36).toLocaleString('en-IN')} net profit</strong> at Kurnool APMC Mandi.
            </span>
          </div>
        </div>

        {/* RIGHT (5 Cols): Cold Storage Facility Unit Logs */}
        <div className="lg:col-span-5 space-y-3">
          {STORAGE_UNITS.map((unit) => {
            const occupancyPct = Math.round((unit.usedCapacityMT / unit.totalCapacityMT) * 100);
            return (
              <div
                key={unit.id}
                className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-sm space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                      {unit.id} • {unit.location}
                    </span>
                    <h5 className="text-xs font-bold text-stone-900 mt-0.5">{unit.name}</h5>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    unit.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : unit.status === 'NEAR_FULL'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {unit.status}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-stone-600 font-mono">
                  <span>Temp: <strong className="text-stone-900">{unit.temp}°C</strong> ({unit.humidity}% RH)</span>
                  <span>Rate: <strong>₹{unit.dailyRatePerMT}/MT/Day</strong></span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-stone-500">
                    <span>Occupancy: {unit.usedCapacityMT} / {unit.totalCapacityMT} MT</span>
                    <span>{occupancyPct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full ${
                        occupancyPct > 80 ? 'bg-amber-500' : 'bg-[#166534]'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}

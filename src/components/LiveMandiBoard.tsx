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
  PhoneCall,
  MessageSquare,
  Navigation,
  Bot,
  Zap,
  Snowflake,
  Sun,
  Layers,
  Calendar,
} from 'lucide-react';
import { sound } from '@/lib/audio';

export interface CommodityMarketData {
  crop: string;
  category: 'Cold Chain Required' | 'Dry/Ambient Storage';
  tempRequirement: string;
  bestMandi: string;
  bestMandiPrice: number;
  localMandiPrice: number;
  markets: {
    mandiName: string;
    location: string;
    distanceKm: number;
    pricePerQ: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    change: number;
    transportCost: number;
    apmcCess: number;
    vendorName: string;
    vendorPhone: string;
    vendorLicense: string;
    dockBay: string;
  }[];
}

const COMMODITY_REGISTRY: CommodityMarketData[] = [
  {
    crop: 'Tomato (Hybrid Grade-A)',
    category: 'Cold Chain Required',
    tempRequirement: '0°C – 4°C Reefer Custody',
    bestMandi: 'Madanapalle APMC (Asia Tomato Hub)',
    bestMandiPrice: 2620,
    localMandiPrice: 2380,
    markets: [
      {
        mandiName: 'Madanapalle APMC Market Yard',
        location: 'Annamayya, AP',
        distanceKm: 142,
        pricePerQ: 2620,
        trend: 'UP',
        change: 180,
        transportCost: 2550,
        apmcCess: 450,
        vendorName: 'Sri Venkateswara Agro Traders',
        vendorPhone: '+91 94412 88771',
        vendorLicense: 'AP-MDP-TRD-381',
        dockBay: 'Bay #7, Gate 2',
      },
      {
        mandiName: 'Kurnool APMC Central Yard',
        location: 'Kurnool, AP',
        distanceKm: 128,
        pricePerQ: 2450,
        trend: 'UP',
        change: 120,
        transportCost: 2300,
        apmcCess: 400,
        vendorName: 'Balaji Agro Commission Agent',
        vendorPhone: '+91 98480 11223',
        vendorLicense: 'AP-KNL-TRD-482',
        dockBay: 'Bay #4, Gate 1',
      },
      {
        mandiName: 'Bowenpally APMC Terminal',
        location: 'Hyderabad, TS',
        distanceKm: 340,
        pricePerQ: 2700,
        trend: 'UP',
        change: 150,
        transportCost: 6120,
        apmcCess: 600,
        vendorName: 'Telangana Fresh Vegetables Ltd',
        vendorPhone: '+91 99890 33441',
        vendorLicense: 'TS-HYD-TRD-109',
        dockBay: 'Bay #12, Cold Terminal',
      },
      {
        mandiName: 'Anantapur APMC Local Yard',
        location: 'Anantapur, AP',
        distanceKm: 15,
        pricePerQ: 2380,
        trend: 'STABLE',
        change: 0,
        transportCost: 500,
        apmcCess: 200,
        vendorName: 'Anantha Kisan Traders',
        vendorPhone: '+91 94401 55667',
        vendorLicense: 'AP-ATP-TRD-044',
        dockBay: 'Bay #2, Local Shed',
      },
    ],
  },
  {
    crop: 'Green Chilli (Spicy G4)',
    category: 'Cold Chain Required',
    tempRequirement: '7°C – 10°C High Humidity',
    bestMandi: 'Guntur Mirchi Yard',
    bestMandiPrice: 6200,
    localMandiPrice: 5400,
    markets: [
      {
        mandiName: 'Guntur APMC Mirchi Yard',
        location: 'Guntur, AP',
        distanceKm: 320,
        pricePerQ: 6200,
        trend: 'UP',
        change: 350,
        transportCost: 5760,
        apmcCess: 550,
        vendorName: 'Sri Lakshmi Spice Merchants',
        vendorPhone: '+91 98491 22334',
        vendorLicense: 'AP-GNT-TRD-882',
        dockBay: 'Bay #9, Spice Yard',
      },
      {
        mandiName: 'Kurnool APMC Yard',
        location: 'Kurnool, AP',
        distanceKm: 128,
        pricePerQ: 5800,
        trend: 'UP',
        change: 200,
        transportCost: 2300,
        apmcCess: 400,
        vendorName: 'Balaji Agro Commission Agent',
        vendorPhone: '+91 98480 11223',
        vendorLicense: 'AP-KNL-TRD-482',
        dockBay: 'Bay #4, Gate 1',
      },
    ],
  },
  {
    crop: 'Whole Dry Red Chilli (Teja/Byadgi)',
    category: 'Dry/Ambient Storage',
    tempRequirement: 'Dry Ventilated (No Reefer Needed)',
    bestMandi: 'Guntur Global Mirchi Terminal',
    bestMandiPrice: 16800,
    localMandiPrice: 14200,
    markets: [
      {
        mandiName: 'Guntur Global Mirchi Terminal',
        location: 'Guntur, AP',
        distanceKm: 320,
        pricePerQ: 16800,
        trend: 'UP',
        change: 600,
        transportCost: 4500,
        apmcCess: 800,
        vendorName: 'Guntur Red Gold Exporters',
        vendorPhone: '+91 98480 99887',
        vendorLicense: 'AP-GNT-EXP-019',
        dockBay: 'Auction Shed 1, Gate A',
      },
      {
        mandiName: 'Kurnool APMC Yard',
        location: 'Kurnool, AP',
        distanceKm: 128,
        pricePerQ: 15200,
        trend: 'UP',
        change: 450,
        transportCost: 1800,
        apmcCess: 500,
        vendorName: 'Sri Raghavendra Spices',
        vendorPhone: '+91 94411 77665',
        vendorLicense: 'AP-KNL-TRD-211',
        dockBay: 'Dry Shed 4',
      },
    ],
  },
  {
    crop: 'Onion (Bellary Red Medium)',
    category: 'Dry/Ambient Storage',
    tempRequirement: 'Ambient Ventilated (Moisture < 65%)',
    bestMandi: 'Yeshwanthpur APMC (Bengaluru)',
    bestMandiPrice: 2250,
    localMandiPrice: 1850,
    markets: [
      {
        mandiName: 'Yeshwanthpur APMC Mandi',
        location: 'Bengaluru, KA',
        distanceKm: 215,
        pricePerQ: 2250,
        trend: 'UP',
        change: 140,
        transportCost: 3200,
        apmcCess: 350,
        vendorName: 'Karnataka Onion Growers Union',
        vendorPhone: '+91 98801 44556',
        vendorLicense: 'KA-BLR-TRD-550',
        dockBay: 'Platform 3',
      },
      {
        mandiName: 'Kurnool APMC Yard',
        location: 'Kurnool, AP',
        distanceKm: 128,
        pricePerQ: 1850,
        trend: 'DOWN',
        change: 40,
        transportCost: 1800,
        apmcCess: 300,
        vendorName: 'Balaji Agro Commission Agent',
        vendorPhone: '+91 98480 11223',
        vendorLicense: 'AP-KNL-TRD-482',
        dockBay: 'Bay #6',
      },
    ],
  },
  {
    crop: 'Mango (Banganapalle Export)',
    category: 'Cold Chain Required',
    tempRequirement: '10°C – 13°C Ethylene Controlled',
    bestMandi: 'Bowenpally APMC (Hyderabad)',
    bestMandiPrice: 5900,
    localMandiPrice: 4800,
    markets: [
      {
        mandiName: 'Bowenpally APMC Terminal',
        location: 'Hyderabad, TS',
        distanceKm: 340,
        pricePerQ: 5900,
        trend: 'UP',
        change: 400,
        transportCost: 6120,
        apmcCess: 600,
        vendorName: 'Royal Fruits Consortium',
        vendorPhone: '+91 98490 66778',
        vendorLicense: 'TS-HYD-EXP-772',
        dockBay: 'Cold Bay 2',
      },
      {
        mandiName: 'Kurnool APMC Yard',
        location: 'Kurnool, AP',
        distanceKm: 128,
        pricePerQ: 5100,
        trend: 'UP',
        change: 250,
        transportCost: 2300,
        apmcCess: 400,
        vendorName: 'Balaji Agro Commission Agent',
        vendorPhone: '+91 98480 11223',
        vendorLicense: 'AP-KNL-TRD-482',
        dockBay: 'Bay #4, Gate 1',
      },
    ],
  },
];

export function LiveMandiBoard() {
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);
  const [cargoQuintals, setCargoQuintals] = useState<number>(36); // 180 Crates = 36 Q

  const activeCrop = COMMODITY_REGISTRY[selectedCropIndex];

  // Calculate Net Profit across all Mandis for the selected crop & quantity
  const marketAnalysis = activeCrop.markets.map((m) => {
    const grossRevenue = cargoQuintals * m.pricePerQ;
    const totalDeductions = m.transportCost + m.apmcCess;
    const netIncome = grossRevenue - totalDeductions;
    const netPerQuintal = Math.round(netIncome / cargoQuintals);
    return {
      ...m,
      grossRevenue,
      totalDeductions,
      netIncome,
      netPerQuintal,
    };
  }).sort((a, b) => b.netIncome - a.netIncome);

  const bestMarket = marketAnalysis[0];
  const localMarket = marketAnalysis.find((m) => m.distanceKm <= 50) || marketAnalysis[marketAnalysis.length - 1];
  const netArbitrageGain = bestMarket.netIncome - localMarket.netIncome;

  return (
    <div className="space-y-8">
      
      {/* HEADER WITH CROP SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#166534] text-white">
              AI Mandi Arbitrage
            </span>
            <span className="text-xs font-mono text-stone-600 font-bold">APMC Price &amp; Transport Engine</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
            Mandi Wholesale Pricing &amp; Net Profit Recommendation
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Calculates diesel transit freight, mandi cess, and spoilage prevention to give you the highest net take-home earnings.
          </p>
        </div>

        {/* Quantity Controller */}
        <div className="flex items-center gap-3 p-2 bg-stone-100 rounded-2xl border border-stone-200 shrink-0">
          <span className="text-xs font-bold text-stone-700 pl-2">Batch Volume:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCargoQuintals(Math.max(10, cargoQuintals - 10))}
              className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold text-xs hover:bg-stone-50 cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-extrabold font-mono text-stone-900 min-w-[70px] text-center">
              {cargoQuintals} Quintals ({cargoQuintals * 5} Crates)
            </span>
            <button
              onClick={() => setCargoQuintals(cargoQuintals + 10)}
              className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold text-xs hover:bg-stone-50 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* CROP SWITCHER TABS WITH STORAGE CLASSIFICATION */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {COMMODITY_REGISTRY.map((item, idx) => {
          const isSelected = selectedCropIndex === idx;
          const isCold = item.category === 'Cold Chain Required';
          return (
            <button
              key={item.crop}
              onClick={() => {
                sound.playClick(1000);
                setSelectedCropIndex(idx);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#166534] text-white shadow-md ring-2 ring-emerald-600'
                  : 'bg-white/95 backdrop-blur-md text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {isCold ? (
                <Snowflake className={`w-3.5 h-3.5 ${isSelected ? 'text-[#bef264]' : 'text-blue-500'}`} />
              ) : (
                <Sun className={`w-3.5 h-3.5 ${isSelected ? 'text-[#bef264]' : 'text-amber-500'}`} />
              )}
              <span>{item.crop}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal ${
                isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
              }`}>
                {isCold ? 'Cold 0-4°C' : 'Dry Storage'}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* 1. AI PROFIT ARBITRAGE CARD (RECOMMENDS WHERE TO SELL TODAY) */}
      {/* ========================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e3b1c] via-[#166534] to-[#0a2612] text-white shadow-2xl space-y-6 border border-emerald-500/40">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/15">
          
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#bef264] text-stone-950 flex items-center justify-center text-2xl shadow-lg shrink-0">
              <Bot className="w-8 h-8 text-[#166534]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#bef264] font-extrabold">
                  AI RECOMMENDATION ENGINE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                  {activeCrop.tempRequirement}
                </span>
              </div>

              <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                Sell at {bestMarket.mandiName}
              </h4>
              <p className="text-xs text-white/85 font-medium mt-1 leading-relaxed max-w-2xl">
                AI evaluated transportation freight (₹18/km diesel), APMC cess, and shelf-life decay across {activeCrop.markets.length} wholesale mandis.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-center min-w-[150px]">
              <span className="text-[10px] font-mono text-white/70 uppercase">Net Take-Home Income</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#bef264] font-mono my-0.5">
                ₹{bestMarket.netIncome.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-300 font-bold font-mono">
                ₹{bestMarket.netPerQuintal}/Q Net
              </span>
            </div>

            {netArbitrageGain > 0 && (
              <div className="p-4 rounded-2xl bg-[#bef264]/20 border border-[#bef264]/40 text-center min-w-[140px]">
                <span className="text-[10px] font-mono text-[#bef264] uppercase font-bold">Extra Profit Gain</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#bef264] font-mono my-0.5">
                  +₹{netArbitrageGain.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-white/90">vs selling locally</span>
              </div>
            )}
          </div>

        </div>

        {/* AI Action Plan Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
            <span className="text-[10px] text-white/70 uppercase font-mono block">Gross Produce Value</span>
            <div className="text-base font-extrabold text-white font-mono">
              ₹{bestMarket.grossRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-white/80">
              {cargoQuintals} Q @ ₹{bestMarket.pricePerQ}/Q
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
            <span className="text-[10px] text-white/70 uppercase font-mono block">Freight &amp; Mandi Cess</span>
            <div className="text-base font-extrabold text-red-300 font-mono">
              -₹{bestMarket.totalDeductions.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-white/80">
              Freight ₹{bestMarket.transportCost} + Cess ₹{bestMarket.apmcCess}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
            <span className="text-[10px] text-white/70 uppercase font-mono block">Optimal Selling Date</span>
            <div className="text-base font-extrabold text-[#bef264] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Monday, Aug 31 • Morning Auction</span>
            </div>
            <span className="text-[11px] text-white/80">
              Peak trading window: 6:00 AM – 10:30 AM
            </span>
          </div>

        </div>

      </div>

      {/* ========================================================== */}
      {/* 2. REGIONAL MANDI COMPARISON & DIRECT VENDOR CONTACT CARDS */}
      {/* ========================================================== */}
      <div className="space-y-4">
        <h4 className="text-sm font-extrabold uppercase tracking-wide text-stone-900">
          All Regional Mandis for {activeCrop.crop} (Ranked by Net Farmer Profit)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {marketAnalysis.map((mandi, idx) => {
            const isWinner = idx === 0;
            return (
              <div
                key={mandi.mandiName}
                className={`p-6 rounded-3xl transition-all duration-300 shadow-md ${
                  isWinner
                    ? 'bg-white/95 backdrop-blur-md border-2 border-emerald-600 ring-2 ring-emerald-500/30'
                    : 'bg-white/95 backdrop-blur-md border border-stone-200 hover:shadow-lg'
                }`}
              >
                {/* Header with Badges */}
                <div className="flex justify-between items-start pb-4 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">
                        {mandi.location} • {mandi.distanceKm} km away
                      </span>
                      {isWinner && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#bef264] text-stone-950">
                          ✨ #1 HIGHEST NET PROFIT
                        </span>
                      )}
                    </div>

                    <h5 className="text-base font-extrabold text-stone-900 mt-1">
                      {mandi.mandiName}
                    </h5>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Wholesale Rate</span>
                    <div className="text-xl font-extrabold font-mono text-[#166534]">
                      ₹{mandi.pricePerQ.toLocaleString('en-IN')}/Q
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700">
                      ▲ +₹{mandi.change} today
                    </span>
                  </div>
                </div>

                {/* Economics Calculation Breakdown */}
                <div className="py-4 space-y-2 text-xs border-b border-stone-200">
                  <div className="flex justify-between text-stone-600">
                    <span>Gross Value ({cargoQuintals} Q):</span>
                    <span className="font-mono font-bold text-stone-900">₹{mandi.grossRevenue.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-stone-500">
                    <span>Transport Freight ({mandi.distanceKm} km @ ₹18/km):</span>
                    <span className="font-mono text-red-700">-₹{mandi.transportCost}</span>
                  </div>

                  <div className="flex justify-between text-stone-500">
                    <span>APMC Cess &amp; Weighbridge Fee:</span>
                    <span className="font-mono text-red-700">-₹{mandi.apmcCess}</span>
                  </div>

                  <div className="flex justify-between pt-2 text-sm font-extrabold border-t border-stone-100">
                    <span className="text-stone-900">NET FARMER TAKE-HOME:</span>
                    <span className="text-[#166534] font-mono text-base">₹{mandi.netIncome.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Mandi Vendor / Commission Agent Phone Contact Card */}
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">
                        Verified APMC Commission Vendor
                      </span>
                      <div className="text-xs font-bold text-stone-900 mt-0.5 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{mandi.vendorName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">
                        Lic #{mandi.vendorLicense} • {mandi.dockBay}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`tel:${mandi.vendorPhone.replace(/\s+/g, '')}`}
                      className="flex-1 py-2.5 rounded-xl bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Vendor ({mandi.vendorPhone})</span>
                    </a>

                    <a
                      href={`https://wa.me/${mandi.vendorPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(mandi.vendorName)},%20I%20have%20${cargoQuintals}%20Quintals%20of%20${encodeURIComponent(activeCrop.crop)}%20arriving%20via%20Cold%20Shield%20Reefer.`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-800" />
                      <span>WhatsApp</span>
                    </a>
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

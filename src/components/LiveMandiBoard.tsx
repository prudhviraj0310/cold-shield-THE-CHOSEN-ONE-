'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@/config/api';
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
  Search,
  SlidersHorizontal,
  Warehouse,
  CheckCircle2,
} from 'lucide-react';
import { sound } from '@/lib/audio';

export interface PanIndiaCityMandi {
  id: string;
  city: string;
  state: string;
  mandiName: string;
  distanceKm: number;
  transitHours: string;
  pricePerQ: number;
  minPrice: number;
  maxPrice: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  priceChange: number;
  coldStorageRateMT: number; // ₹ per MT per day
  liveStockArrivalsMT: number;
  chamberOccupancyPct: number;
  transportCost: number; // For cargo volume
  apmcCess: number;
  vendorName: string;
  vendorPhone: string;
  vendorLicense: string;
  dockBay: string;
}

export interface CommodityData {
  crop: string;
  category: 'Cold Chain Required' | 'Dry/Ambient Storage';
  tempRequirement: string;
  defaultBaseRate: number;
  cities: PanIndiaCityMandi[];
}

const PAN_INDIA_COMMODITIES: CommodityData[] = [
  {
    crop: 'Tomato (Hybrid Grade-A)',
    category: 'Cold Chain Required',
    tempRequirement: '0°C – 4°C Reefer Custody',
    defaultBaseRate: 2380,
    cities: [
      {
        id: 'delhi-azadpur',
        city: 'Delhi (NCR)',
        state: 'Delhi',
        mandiName: 'Azadpur APMC Wholesale Terminal (Asia Largest)',
        distanceKm: 1850,
        transitHours: '38h Interstate Reefer',
        pricePerQ: 3450,
        minPrice: 3000,
        maxPrice: 3800,
        trend: 'UP',
        priceChange: 320,
        coldStorageRateMT: 150,
        liveStockArrivalsMT: 620,
        chamberOccupancyPct: 88,
        transportCost: 14500,
        apmcCess: 1100,
        vendorName: 'North India Agri Exporters (Shri Om Prakash)',
        vendorPhone: '+91 98110 44219',
        vendorLicense: 'DL-AZD-TRD-902',
        dockBay: 'Shed 8, Azadpur Gate 4',
      },
      {
        id: 'mumbai-vashi',
        city: 'Mumbai',
        state: 'Maharashtra',
        mandiName: 'Vashi APMC Central Terminal',
        distanceKm: 820,
        transitHours: '18h Reefer Express',
        pricePerQ: 3100,
        minPrice: 2700,
        maxPrice: 3350,
        trend: 'UP',
        priceChange: 240,
        coldStorageRateMT: 140,
        liveStockArrivalsMT: 480,
        chamberOccupancyPct: 79,
        transportCost: 7800,
        apmcCess: 800,
        vendorName: 'Maharashtra Fresh Fruits & Veg (Sunil Patil)',
        vendorPhone: '+91 98201 55678',
        vendorLicense: 'MH-VSH-TRD-412',
        dockBay: 'Bay #14, Sector 19',
      },
      {
        id: 'madanapalle-ap',
        city: 'Madanapalle',
        state: 'Andhra Pradesh',
        mandiName: 'Madanapalle APMC (Tomato Capital)',
        distanceKm: 142,
        transitHours: '3.5h Direct Route',
        pricePerQ: 2620,
        minPrice: 2250,
        maxPrice: 2800,
        trend: 'UP',
        priceChange: 180,
        coldStorageRateMT: 110,
        liveStockArrivalsMT: 380,
        chamberOccupancyPct: 65,
        transportCost: 2550,
        apmcCess: 450,
        vendorName: 'Sri Venkateswara Agro Traders (K. Reddy)',
        vendorPhone: '+91 94412 88771',
        vendorLicense: 'AP-MDP-TRD-381',
        dockBay: 'Bay #7, Gate 2',
      },
      {
        id: 'bengaluru-yesh',
        city: 'Bengaluru',
        state: 'Karnataka',
        mandiName: 'Yeshwanthpur APMC Wholesale Yard',
        distanceKm: 215,
        transitHours: '4.5h Transit',
        pricePerQ: 2750,
        minPrice: 2400,
        maxPrice: 2950,
        trend: 'UP',
        priceChange: 160,
        coldStorageRateMT: 125,
        liveStockArrivalsMT: 310,
        chamberOccupancyPct: 72,
        transportCost: 3400,
        apmcCess: 500,
        vendorName: 'Karnataka Horti-Federation (B. Gowda)',
        vendorPhone: '+91 98450 77889',
        vendorLicense: 'KA-BLR-TRD-550',
        dockBay: 'Platform 4, Yard A',
      },
      {
        id: 'hyderabad-bowen',
        city: 'Hyderabad',
        state: 'Telangana',
        mandiName: 'Bowenpally APMC Terminal Yard',
        distanceKm: 340,
        transitHours: '6.5h Cold Van',
        pricePerQ: 2700,
        minPrice: 2300,
        maxPrice: 2880,
        trend: 'UP',
        priceChange: 150,
        coldStorageRateMT: 130,
        liveStockArrivalsMT: 290,
        chamberOccupancyPct: 82,
        transportCost: 6120,
        apmcCess: 600,
        vendorName: 'Telangana Fresh Agri Corp (G. Rao)',
        vendorPhone: '+91 99890 33441',
        vendorLicense: 'TS-HYD-TRD-109',
        dockBay: 'Bay #12, Cold Terminal',
      },
      {
        id: 'kurnool-apmc',
        city: 'Kurnool',
        state: 'Andhra Pradesh',
        mandiName: 'Kurnool APMC Market Yard',
        distanceKm: 128,
        transitHours: '2.5h Highway Transit',
        pricePerQ: 2450,
        minPrice: 2100,
        maxPrice: 2600,
        trend: 'UP',
        priceChange: 120,
        coldStorageRateMT: 110,
        liveStockArrivalsMT: 140,
        chamberOccupancyPct: 58,
        transportCost: 2300,
        apmcCess: 400,
        vendorName: 'Balaji Agro Commission Agent (P. Suresh)',
        vendorPhone: '+91 98480 11223',
        vendorLicense: 'AP-KNL-TRD-482',
        dockBay: 'Bay #4, Gate 1',
      },
      {
        id: 'chennai-koyam',
        city: 'Chennai',
        state: 'Tamil Nadu',
        mandiName: 'Koyambedu APMC Wholesale Complex',
        distanceKm: 390,
        transitHours: '8h Reefer',
        pricePerQ: 2850,
        minPrice: 2500,
        maxPrice: 3050,
        trend: 'UP',
        priceChange: 190,
        coldStorageRateMT: 135,
        liveStockArrivalsMT: 420,
        chamberOccupancyPct: 76,
        transportCost: 6800,
        apmcCess: 650,
        vendorName: 'Tamil Nadu Farmers Mandi Agency',
        vendorPhone: '+91 94440 22331',
        vendorLicense: 'TN-CHN-TRD-610',
        dockBay: 'Gate 3, Block D',
      },
    ],
  },
  {
    crop: 'Whole Dry Red Chilli (Teja/Byadgi)',
    category: 'Dry/Ambient Storage',
    tempRequirement: 'Dry Ventilated (No Reefer Needed)',
    defaultBaseRate: 14200,
    cities: [
      {
        id: 'delhi-khari-baoli',
        city: 'Delhi (NCR)',
        state: 'Delhi',
        mandiName: 'Khari Baoli Spice Terminal & Azadpur',
        distanceKm: 1850,
        transitHours: '42h Standard Freight',
        pricePerQ: 19500,
        minPrice: 17500,
        maxPrice: 21500,
        trend: 'UP',
        priceChange: 850,
        coldStorageRateMT: 90,
        liveStockArrivalsMT: 180,
        chamberOccupancyPct: 85,
        transportCost: 11000,
        apmcCess: 1400,
        vendorName: 'Imperial Spices Delhi (Rajesh Gupta)',
        vendorPhone: '+91 98100 88991',
        vendorLicense: 'DL-KHB-TRD-210',
        dockBay: 'Dry Warehouse #3',
      },
      {
        id: 'guntur-mirchi',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        mandiName: 'Guntur Global Mirchi Terminal (Asia Largest)',
        distanceKm: 320,
        transitHours: '7h Highway Transit',
        pricePerQ: 16800,
        minPrice: 15200,
        maxPrice: 18500,
        trend: 'UP',
        priceChange: 600,
        coldStorageRateMT: 80,
        liveStockArrivalsMT: 540,
        chamberOccupancyPct: 92,
        transportCost: 4500,
        apmcCess: 800,
        vendorName: 'Guntur Red Gold Exporters (V. Naidu)',
        vendorPhone: '+91 98480 99887',
        vendorLicense: 'AP-GNT-EXP-019',
        dockBay: 'Auction Shed 1, Gate A',
      },
      {
        id: 'mumbai-vashi-spices',
        city: 'Mumbai',
        state: 'Maharashtra',
        mandiName: 'Vashi Spice Market Yard',
        distanceKm: 820,
        transitHours: '20h Freight',
        pricePerQ: 18200,
        minPrice: 16400,
        maxPrice: 19800,
        trend: 'UP',
        priceChange: 550,
        coldStorageRateMT: 95,
        liveStockArrivalsMT: 220,
        chamberOccupancyPct: 81,
        transportCost: 6500,
        apmcCess: 1000,
        vendorName: 'Western India Spice Hub (Mahesh Shah)',
        vendorPhone: '+91 98210 11992',
        vendorLicense: 'MH-VSH-TRD-833',
        dockBay: 'Spices Shed B',
      },
      {
        id: 'kurnool-dry-chilli',
        city: 'Kurnool',
        state: 'Andhra Pradesh',
        mandiName: 'Kurnool APMC Yard',
        distanceKm: 128,
        transitHours: '2.5h Transit',
        pricePerQ: 15200,
        minPrice: 13800,
        maxPrice: 16400,
        trend: 'UP',
        priceChange: 450,
        coldStorageRateMT: 80,
        liveStockArrivalsMT: 75,
        chamberOccupancyPct: 60,
        transportCost: 1800,
        apmcCess: 500,
        vendorName: 'Sri Raghavendra Spices (T. Rao)',
        vendorPhone: '+91 94411 77665',
        vendorLicense: 'AP-KNL-TRD-211',
        dockBay: 'Dry Shed 4',
      },
    ],
  },
  {
    crop: 'Green Chilli (Spicy G4)',
    category: 'Cold Chain Required',
    tempRequirement: '7°C – 10°C High Humidity',
    defaultBaseRate: 5400,
    cities: [
      {
        id: 'delhi-green-chilli',
        city: 'Delhi (NCR)',
        state: 'Delhi',
        mandiName: 'Azadpur APMC Green Terminal',
        distanceKm: 1850,
        transitHours: '38h Reefer',
        pricePerQ: 7800,
        minPrice: 6900,
        maxPrice: 8500,
        trend: 'UP',
        priceChange: 450,
        coldStorageRateMT: 150,
        liveStockArrivalsMT: 180,
        chamberOccupancyPct: 86,
        transportCost: 14500,
        apmcCess: 1100,
        vendorName: 'Delhi Green Fresh (Harish Sharma)',
        vendorPhone: '+91 98180 33221',
        vendorLicense: 'DL-AZD-TRD-451',
        dockBay: 'Shed 4, Bay 9',
      },
      {
        id: 'guntur-green-chilli',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        mandiName: 'Guntur APMC Mirchi Yard',
        distanceKm: 320,
        transitHours: '7h Transit',
        pricePerQ: 6200,
        minPrice: 5500,
        maxPrice: 6800,
        trend: 'UP',
        priceChange: 350,
        coldStorageRateMT: 110,
        liveStockArrivalsMT: 220,
        chamberOccupancyPct: 75,
        transportCost: 5760,
        apmcCess: 550,
        vendorName: 'Sri Lakshmi Spice Merchants',
        vendorPhone: '+91 98491 22334',
        vendorLicense: 'AP-GNT-TRD-882',
        dockBay: 'Bay #9, Spice Yard',
      },
    ],
  },
  {
    crop: 'Onion (Bellary Red Medium)',
    category: 'Dry/Ambient Storage',
    tempRequirement: 'Ambient Ventilated (Moisture < 65%)',
    defaultBaseRate: 1850,
    cities: [
      {
        id: 'delhi-onion',
        city: 'Delhi (NCR)',
        state: 'Delhi',
        mandiName: 'Azadpur APMC Onion Shed',
        distanceKm: 1850,
        transitHours: '42h Transit',
        pricePerQ: 2850,
        minPrice: 2400,
        maxPrice: 3100,
        trend: 'UP',
        priceChange: 220,
        coldStorageRateMT: 95,
        liveStockArrivalsMT: 750,
        chamberOccupancyPct: 90,
        transportCost: 11500,
        apmcCess: 900,
        vendorName: 'Capital Onion Federation (Manoj Tyagi)',
        vendorPhone: '+91 98111 66778',
        vendorLicense: 'DL-AZD-ON-110',
        dockBay: 'Onion Block B',
      },
      {
        id: 'bengaluru-onion',
        city: 'Bengaluru',
        state: 'Karnataka',
        mandiName: 'Yeshwanthpur APMC Mandi',
        distanceKm: 215,
        transitHours: '4.5h Transit',
        pricePerQ: 2250,
        minPrice: 1950,
        maxPrice: 2450,
        trend: 'UP',
        priceChange: 140,
        coldStorageRateMT: 85,
        liveStockArrivalsMT: 360,
        chamberOccupancyPct: 70,
        transportCost: 3200,
        apmcCess: 350,
        vendorName: 'Karnataka Onion Growers Union',
        vendorPhone: '+91 98801 44556',
        vendorLicense: 'KA-BLR-TRD-550',
        dockBay: 'Platform 3',
      },
      {
        id: 'kurnool-onion',
        city: 'Kurnool',
        state: 'Andhra Pradesh',
        mandiName: 'Kurnool APMC Yard',
        distanceKm: 128,
        transitHours: '2.5h Transit',
        pricePerQ: 1850,
        minPrice: 1500,
        maxPrice: 2000,
        trend: 'DOWN',
        priceChange: 40,
        coldStorageRateMT: 80,
        liveStockArrivalsMT: 190,
        chamberOccupancyPct: 55,
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
    defaultBaseRate: 4800,
    cities: [
      {
        id: 'delhi-mango',
        city: 'Delhi (NCR)',
        state: 'Delhi',
        mandiName: 'Azadpur Premium Fruit Terminal',
        distanceKm: 1850,
        transitHours: '38h Reefer',
        pricePerQ: 8200,
        minPrice: 7200,
        maxPrice: 9100,
        trend: 'UP',
        priceChange: 650,
        coldStorageRateMT: 160,
        liveStockArrivalsMT: 310,
        chamberOccupancyPct: 88,
        transportCost: 14500,
        apmcCess: 1200,
        vendorName: 'North Mango Importers (Anil Batra)',
        vendorPhone: '+91 98101 22339',
        vendorLicense: 'DL-AZD-MNG-09',
        dockBay: 'Fruit Shed 2',
      },
      {
        id: 'mumbai-mango',
        city: 'Mumbai',
        state: 'Maharashtra',
        mandiName: 'Vashi Fruit Market',
        distanceKm: 820,
        transitHours: '18h Reefer',
        pricePerQ: 7400,
        minPrice: 6500,
        maxPrice: 8100,
        trend: 'UP',
        priceChange: 500,
        coldStorageRateMT: 145,
        liveStockArrivalsMT: 280,
        chamberOccupancyPct: 82,
        transportCost: 7800,
        apmcCess: 850,
        vendorName: 'Konkan & South Mango Consortium',
        vendorPhone: '+91 98205 77112',
        vendorLicense: 'MH-VSH-FRT-301',
        dockBay: 'Bay #8',
      },
      {
        id: 'hyderabad-mango',
        city: 'Hyderabad',
        state: 'Telangana',
        mandiName: 'Bowenpally APMC Terminal Yard',
        distanceKm: 340,
        transitHours: '6.5h Cold Van',
        pricePerQ: 5900,
        minPrice: 5200,
        maxPrice: 6400,
        trend: 'UP',
        priceChange: 400,
        coldStorageRateMT: 130,
        liveStockArrivalsMT: 220,
        chamberOccupancyPct: 78,
        transportCost: 6120,
        apmcCess: 600,
        vendorName: 'Royal Fruits Consortium',
        vendorPhone: '+91 98490 66778',
        vendorLicense: 'TS-HYD-EXP-772',
        dockBay: 'Cold Bay 2',
      },
    ],
  },
];

// Map our UI commodity labels to data.gov.in API commodity filter names
const CROP_TO_API_COMMODITY: Record<string, string> = {
  'Tomato (Hybrid Grade-A)': 'Tomato',
  'Whole Dry Red Chilli (Teja/Byadgi)': 'Dry Chillies',
  'Green Chilli (Spicy G4)': 'Green Chillies',
  'Onion (Bellary Red Medium)': 'Onion',
  'Mango (Banganapalle Export)': 'Mango (Raw-Loss pack)',
};

export interface LiveMandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

export function LiveMandiBoard() {
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);
  const [cargoQuintals, setCargoQuintals] = useState<number>(36); // 180 Crates = 36 Q
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  // Live API state
  const [liveRecords, setLiveRecords] = useState<LiveMandiRecord[]>([]);
  const [liveLoading, setLiveLoading] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveTotal, setLiveTotal] = useState<number>(0);
  const [liveStateFilter, setLiveStateFilter] = useState<string>('All');
  const [liveSearchQuery, setLiveSearchQuery] = useState<string>('');

  const activeCrop = PAN_INDIA_COMMODITIES[selectedCropIndex];

  // Fetch live mandi rates from data.gov.in
  const fetchLiveRates = useCallback(async (cropName: string) => {
    const apiCommodity = CROP_TO_API_COMMODITY[cropName] || 'Tomato';
    const apiKey = API_CONFIG.dataGov.apiKey;
    if (!apiKey) {
      setLiveError('data.gov.in API key not configured');
      return;
    }
    setLiveLoading(true);
    setLiveError(null);
    try {
      const url = `${API_CONFIG.dataGov.baseUrl}?api-key=${apiKey}&format=json&limit=200&filters[commodity]=${encodeURIComponent(apiCommodity)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const records: LiveMandiRecord[] = (data.records || []).map((r: any) => ({
        state: r.state || '',
        district: r.district || '',
        market: r.market || '',
        commodity: r.commodity || '',
        variety: r.variety || '',
        grade: r.grade || '',
        arrivalDate: r.arrival_date || '',
        minPrice: parseFloat(r.min_price || 0),
        maxPrice: parseFloat(r.max_price || 0),
        modalPrice: parseFloat(r.modal_price || 0),
      }));
      // Sort by modal price descending
      records.sort((a, b) => b.modalPrice - a.modalPrice);
      setLiveRecords(records);
      setLiveTotal(data.total || records.length);
    } catch (err: any) {
      console.warn('Live mandi API failed:', err);
      setLiveError(err.message || 'Failed to fetch live rates');
    } finally {
      setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveRates(activeCrop.crop);
  }, [activeCrop.crop, fetchLiveRates]);

  // Filtered live records
  const filteredLiveRecords = liveRecords.filter((r) => {
    if (liveStateFilter !== 'All' && r.state !== liveStateFilter) return false;
    if (liveSearchQuery) {
      const q = liveSearchQuery.toLowerCase();
      return r.state.toLowerCase().includes(q) || r.district.toLowerCase().includes(q) || r.market.toLowerCase().includes(q);
    }
    return true;
  });

  // Unique states from live data
  const liveStates = Array.from(new Set(liveRecords.map((r) => r.state))).sort();

  // Live stats
  const liveHighest = liveRecords.length > 0 ? liveRecords[0].modalPrice : 0;
  const liveLowest = liveRecords.length > 0 ? liveRecords[liveRecords.length - 1].modalPrice : 0;
  const liveAvg = liveRecords.length > 0 ? Math.round(liveRecords.reduce((s, r) => s + r.modalPrice, 0) / liveRecords.length) : 0;

  // Calculate Net Profit across all Mandis for the selected crop & quantity
  const marketAnalysis = activeCrop.cities.map((m) => {
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

  const filteredMarkets = marketAnalysis.filter((m) => {
    if (selectedCityFilter !== 'All' && !m.city.toLowerCase().includes(selectedCityFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery && !m.city.toLowerCase().includes(searchQuery.toLowerCase()) && !m.mandiName.toLowerCase().includes(searchQuery.toLowerCase()) && !m.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const bestMarket = marketAnalysis[0];
  const localMarket = marketAnalysis.find((m) => m.distanceKm <= 150) || marketAnalysis[marketAnalysis.length - 1];
  const netArbitrageGain = bestMarket.netIncome - localMarket.netIncome;

  return (
    <div className="space-y-8">
      
      {/* HEADER WITH CROP SELECTOR & CONTROLS (INSIDE CRISP OPAQUE CARD) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#166534] text-white">
              Pan-India Mandi Matrix
            </span>
            <span className="text-xs font-mono text-emerald-800 font-bold">Delhi • Mumbai • South Hubs</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Interstate Mandi Rates, Cold Storage &amp; Live Stock Intelligence
          </h3>
          <p className="text-xs text-stone-600">
            Compare wholesale rates, live stock arrivals, cold chamber rates, and long-distance diesel reefer costs.
          </p>
        </div>

        {/* Volume & View Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-bold text-stone-700 pl-2">Batch Volume:</span>
            <button
              onClick={() => setCargoQuintals(Math.max(10, cargoQuintals - 10))}
              className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold text-xs hover:bg-stone-50 cursor-pointer shadow-xs"
            >
              -
            </button>
            <span className="text-xs font-extrabold font-mono text-stone-900 min-w-[70px] text-center">
              {cargoQuintals} Quintals ({cargoQuintals * 5} Crates)
            </span>
            <button
              onClick={() => setCargoQuintals(cargoQuintals + 10)}
              className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold text-xs hover:bg-stone-50 cursor-pointer shadow-xs"
            >
              +
            </button>
          </div>

          <div className="flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold shadow-xs">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                viewMode === 'matrix' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              📊 Full Matrix
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                viewMode === 'cards' ? 'bg-[#166534] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🗂️ Cards
            </button>
          </div>
        </div>
      </div>

      {/* CROP SWITCHER TABS WITH STORAGE CLASSIFICATION */}
      <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-stone-600 px-2">Select Commodity:</span>
        {PAN_INDIA_COMMODITIES.map((item, idx) => {
          const isSelected = selectedCropIndex === idx;
          const isCold = item.category === 'Cold Chain Required';
          return (
            <button
              key={item.crop}
              onClick={() => {
                sound.playClick(1000);
                setSelectedCropIndex(idx);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#166534] text-white shadow-md ring-2 ring-emerald-600'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
              }`}
            >
              {isCold ? (
                <Snowflake className={`w-3.5 h-3.5 ${isSelected ? 'text-[#bef264]' : 'text-blue-500'}`} />
              ) : (
                <Sun className={`w-3.5 h-3.5 ${isSelected ? 'text-[#bef264]' : 'text-amber-500'}`} />
              )}
              <span>{item.crop}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal ${
                isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                {item.tempRequirement.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* 1. AI ARBITRAGE CARD (BEST PAN-INDIA DESTINATION)          */}
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
                  PAN-INDIA AI ARBITRAGE DECISION
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                  {activeCrop.tempRequirement}
                </span>
              </div>

              <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                Highest Take-Home: {bestMarket.mandiName} ({bestMarket.city})
              </h4>
              <p className="text-xs text-white/85 font-medium mt-1 leading-relaxed max-w-2xl">
                Selling in <strong>{bestMarket.city}</strong> yields <strong>₹{bestMarket.pricePerQ}/Quintal</strong>. Even after <strong>₹{bestMarket.transportCost.toLocaleString('en-IN')}</strong> freight transit and mandi cess, you earn <strong>+₹{netArbitrageGain.toLocaleString('en-IN')} more net profit</strong> than selling locally.
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
                <span className="text-[10px] text-white/90">vs local mandi</span>
              </div>
            )}
          </div>

        </div>

        {/* AI Action Plan & Trader Hotline */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          
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
            <span className="text-[10px] text-white/70 uppercase font-mono block">Freight Transit ({bestMarket.transitHours})</span>
            <div className="text-base font-extrabold text-red-300 font-mono">
              -₹{bestMarket.totalDeductions.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-white/80">
              Freight ₹{bestMarket.transportCost} + Cess ₹{bestMarket.apmcCess}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
            <span className="text-[10px] text-white/70 uppercase font-mono block">Cold Storage Daily Rate</span>
            <div className="text-base font-extrabold text-[#bef264] font-mono">
              ₹{bestMarket.coldStorageRateMT} / MT / Day
            </div>
            <span className="text-[11px] text-white/80">
              Chamber Occupancy: {bestMarket.chamberOccupancyPct}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-white/70 uppercase font-mono block">Verified APMC Trader</span>
              <div className="text-xs font-bold text-white mt-0.5 truncate">
                {bestMarket.vendorName}
              </div>
            </div>
            <a
              href={`tel:${bestMarket.vendorPhone.replace(/\s+/g, '')}`}
              className="mt-2 py-2 px-3 rounded-xl bg-[#bef264] hover:bg-[#a3e635] text-stone-950 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call ({bestMarket.vendorPhone})</span>
            </a>
          </div>

        </div>

      </div>

      {/* ========================================================== */}
      {/* 2. CITY SEARCH & FILTER BAR                                */}
      {/* ========================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-sm">
        
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city (Delhi, Mumbai, Bengaluru...), mandi name, or trader..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#166534]"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <span className="text-stone-500 mr-1 text-[11px]">Filter City:</span>
          {['All', 'Delhi', 'Mumbai', 'Madanapalle', 'Bengaluru', 'Hyderabad', 'Guntur', 'Kurnool', 'Chennai'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCityFilter(city)}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCityFilter === city
                  ? 'bg-[#166534] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

      </div>

      {/* ========================================================== */}
      {/* 3. MULTI-COLUMN MATRIX TABLE VIEW                          */}
      {/* ========================================================== */}
      {viewMode === 'matrix' && (
        <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white/95 backdrop-blur-md shadow-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/90 border-b border-stone-200 text-[11px] font-extrabold uppercase font-mono text-stone-700">
                <th className="p-4">City &amp; APMC Mandi</th>
                <th className="p-4">Wholesale Rate</th>
                <th className="p-4">Transit &amp; Distance</th>
                <th className="p-4">Cold Storage / Day</th>
                <th className="p-4">Live Stock Arrivals</th>
                <th className="p-4">Freight &amp; Cess</th>
                <th className="p-4">Net Farmer Profit</th>
                <th className="p-4">Trader Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-sans">
              {filteredMarkets.map((mandi, idx) => {
                const isBest = idx === 0 && selectedCityFilter === 'All' && !searchQuery;
                return (
                  <tr
                    key={mandi.id}
                    className={`transition-colors hover:bg-stone-50/80 ${
                      isBest ? 'bg-emerald-50/60 font-semibold' : ''
                    }`}
                  >
                    {/* City & APMC */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isBest && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                        <div>
                          <strong className="text-stone-900 block text-xs">{mandi.city}</strong>
                          <span className="text-[11px] text-stone-500 block">{mandi.mandiName}</span>
                          <span className="text-[10px] font-mono text-emerald-800 font-bold">{mandi.state}</span>
                        </div>
                      </div>
                    </td>

                    {/* Wholesale Rate */}
                    <td className="p-4">
                      <div className="font-mono text-sm font-extrabold text-[#166534]">
                        ₹{mandi.pricePerQ.toLocaleString('en-IN')}/Q
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 block">
                        ▲ +₹{mandi.priceChange}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        ₹{mandi.minPrice} - ₹{mandi.maxPrice}
                      </span>
                    </td>

                    {/* Transit & Distance */}
                    <td className="p-4">
                      <div className="font-mono font-bold text-stone-800">{mandi.distanceKm} km</div>
                      <span className="text-[10px] text-stone-500">{mandi.transitHours}</span>
                    </td>

                    {/* Cold Storage Rate */}
                    <td className="p-4">
                      <div className="font-mono font-bold text-stone-900">₹{mandi.coldStorageRateMT}</div>
                      <span className="text-[10px] text-stone-500">per MT / Day</span>
                    </td>

                    {/* Live Stock Arrivals */}
                    <td className="p-4">
                      <div className="font-mono font-bold text-stone-900">{mandi.liveStockArrivalsMT} MT</div>
                      <div className="w-20 h-1.5 rounded-full bg-stone-200 mt-1 overflow-hidden">
                        <div
                          className="h-full bg-[#166534]"
                          style={{ width: `${mandi.chamberOccupancyPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">{mandi.chamberOccupancyPct}% Occupied</span>
                    </td>

                    {/* Freight & Cess */}
                    <td className="p-4 font-mono">
                      <div className="text-red-700 font-bold">-₹{mandi.totalDeductions.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-stone-400">Freight + APMC Cess</span>
                    </td>

                    {/* Net Farmer Profit */}
                    <td className="p-4">
                      <div className="text-sm font-extrabold text-[#166534] font-mono">
                        ₹{mandi.netIncome.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] font-bold text-stone-600">
                        ₹{mandi.netPerQuintal}/Q Net
                      </span>
                      {isBest && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#bef264] text-stone-950">
                          ✨ #1 HIGHEST PROFIT
                        </span>
                      )}
                    </td>

                    {/* Trader Contact Buttons */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-stone-900 truncate max-w-[140px]">
                          {mandi.vendorName}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {mandi.dockBay}
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <a
                            href={`tel:${mandi.vendorPhone.replace(/\s+/g, '')}`}
                            className="px-2.5 py-1.5 rounded-lg bg-[#166534] hover:bg-[#15803d] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>{mandi.vendorPhone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${mandi.vendorPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(mandi.vendorName)},%20I%20have%20${cargoQuintals}%20Quintals%20of%20${encodeURIComponent(activeCrop.crop)}%20arriving%20via%20Cold%20Shield.`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold"
                          >
                            WA
                          </a>
                        </div>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================== */}
      {/* 4. EXPANDABLE CITY CARDS VIEW                              */}
      {/* ========================================================== */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMarkets.map((mandi, idx) => {
            const isBest = idx === 0 && selectedCityFilter === 'All' && !searchQuery;
            return (
              <div
                key={mandi.id}
                className={`p-6 rounded-3xl transition-all duration-300 shadow-md ${
                  isBest
                    ? 'bg-white/95 backdrop-blur-md border-2 border-emerald-600 ring-2 ring-emerald-500/30'
                    : 'bg-white/95 backdrop-blur-md border border-stone-200 hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start pb-3 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-stone-900">{mandi.city}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800">({mandi.state})</span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">{mandi.mandiName}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{mandi.distanceKm} km • {mandi.transitHours}</span>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-extrabold font-mono text-[#166534]">
                      ₹{mandi.pricePerQ.toLocaleString('en-IN')}/Q
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700">
                      ▲ +₹{mandi.priceChange}
                    </span>
                  </div>
                </div>

                {/* Economics Grid */}
                <div className="py-3 space-y-1.5 text-xs border-b border-stone-200 font-mono">
                  <div className="flex justify-between text-stone-600">
                    <span>Gross Value ({cargoQuintals} Q):</span>
                    <span className="font-bold text-stone-900">₹{mandi.grossRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Freight Transit &amp; Cess:</span>
                    <span className="text-red-700 font-bold">-₹{mandi.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Cold Storage Rate:</span>
                    <span className="text-stone-900 font-bold">₹{mandi.coldStorageRateMT}/MT/Day</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Live Stock Volume:</span>
                    <span className="text-stone-900 font-bold">{mandi.liveStockArrivalsMT} MT ({mandi.chamberOccupancyPct}% Full)</span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-extrabold border-t border-stone-100">
                    <span className="text-stone-900 font-sans">NET INCOME:</span>
                    <span className="text-[#166534] text-base">₹{mandi.netIncome.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Vendor Contact Button */}
                <div className="pt-3 space-y-2">
                  <div>
                    <div className="text-xs font-bold text-stone-900">{mandi.vendorName}</div>
                    <div className="text-[10px] text-stone-400 font-mono">Lic #{mandi.vendorLicense} • {mandi.dockBay}</div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`tel:${mandi.vendorPhone.replace(/\s+/g, '')}`}
                      className="flex-1 py-2.5 rounded-xl bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call ({mandi.vendorPhone})</span>
                    </a>
                    <a
                      href={`https://wa.me/${mandi.vendorPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(mandi.vendorName)},%20I%20have%20${cargoQuintals}%20Quintals%20of%20${encodeURIComponent(activeCrop.crop)}%20arriving%20via%20Cold%20Shield.`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-800" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. 🔴 LIVE GOVERNMENT MANDI RATES (data.gov.in API)        */}
      {/* ========================================================== */}
      <div className="space-y-4">
        
        {/* Section Header */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold">🔴 LIVE API • data.gov.in • Ministry of Agriculture</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Real-Time Government Mandi Rates — All India
              </h4>
              <p className="text-xs text-white/90">
                {liveTotal} mandis reporting for <strong>{CROP_TO_API_COMMODITY[activeCrop.crop] || activeCrop.crop}</strong> today • Updated every 30 min by Agmarknet
              </p>
            </div>

            <div className="flex items-center gap-3">
              {liveRecords.length > 0 && (
                <div className="flex gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md min-w-[80px]">
                    <div className="text-[10px] font-mono uppercase text-white/80">Highest</div>
                    <div className="text-sm font-extrabold font-mono">₹{liveHighest.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md min-w-[80px]">
                    <div className="text-[10px] font-mono uppercase text-white/80">Average</div>
                    <div className="text-sm font-extrabold font-mono">₹{liveAvg.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md min-w-[80px]">
                    <div className="text-[10px] font-mono uppercase text-white/80">Lowest</div>
                    <div className="text-sm font-extrabold font-mono">₹{liveLowest.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              )}
              <button
                onClick={() => fetchLiveRates(activeCrop.crop)}
                disabled={liveLoading}
                className="px-4 py-2.5 rounded-xl bg-white/25 hover:bg-white/35 text-white text-xs font-bold cursor-pointer backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/30"
              >
                <Zap className={`w-3.5 h-3.5 ${liveLoading ? 'animate-spin' : ''}`} />
                <span>{liveLoading ? 'Fetching...' : 'Refresh Live'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={liveSearchQuery}
              onChange={(e) => setLiveSearchQuery(e.target.value)}
              placeholder="Search by state, district, or market name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#166534]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <span className="text-stone-500 mr-1 text-[11px]">State:</span>
            <button
              onClick={() => setLiveStateFilter('All')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                liveStateFilter === 'All' ? 'bg-red-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All ({liveRecords.length})
            </button>
            {liveStates.slice(0, 12).map((st) => {
              const count = liveRecords.filter((r) => r.state === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setLiveStateFilter(st)}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    liveStateFilter === st ? 'bg-red-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {st.length > 16 ? st.slice(0, 14) + '..' : st} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Table */}
        {liveLoading ? (
          <div className="p-12 rounded-3xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-lg text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-stone-700">Fetching live rates from Government Agmarknet API...</p>
          </div>
        ) : liveError ? (
          <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-2">
            <p className="text-xs font-bold text-red-800">⚠️ {liveError}</p>
            <button onClick={() => fetchLiveRates(activeCrop.crop)} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer">Retry</button>
          </div>
        ) : filteredLiveRecords.length > 0 ? (
          <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white/95 backdrop-blur-md shadow-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-stone-200 text-[11px] font-extrabold uppercase font-mono text-stone-700">
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">State</th>
                  <th className="p-3.5">District</th>
                  <th className="p-3.5">Market / Mandi</th>
                  <th className="p-3.5">Variety</th>
                  <th className="p-3.5">Min Price (₹/Q)</th>
                  <th className="p-3.5">Max Price (₹/Q)</th>
                  <th className="p-3.5">Modal Price (₹/Q)</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLiveRecords.slice(0, 50).map((r, idx) => {
                  const isTop = idx === 0;
                  return (
                    <tr
                      key={`${r.state}-${r.district}-${r.market}-${idx}`}
                      className={`transition-colors hover:bg-stone-50 ${
                        isTop ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3.5 font-mono text-stone-400">{idx + 1}</td>
                      <td className="p-3.5">
                        <span className="text-xs font-bold text-stone-900">{r.state}</span>
                      </td>
                      <td className="p-3.5 text-stone-700">{r.district}</td>
                      <td className="p-3.5">
                        <span className="text-xs font-semibold text-stone-900">{r.market}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                          {r.variety || 'Standard'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-stone-700">₹{r.minPrice.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-mono font-bold text-stone-700">₹{r.maxPrice.toLocaleString('en-IN')}</td>
                      <td className="p-3.5">
                        <span className={`font-mono font-extrabold text-sm ${
                          isTop ? 'text-[#166534]' : 'text-stone-900'
                        }`}>
                          ₹{r.modalPrice.toLocaleString('en-IN')}
                        </span>
                        {isTop && (
                          <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#bef264] text-stone-950">
                            #1 BEST
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-stone-500 text-[10px]">{r.arrivalDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredLiveRecords.length > 50 && (
              <div className="p-3 text-center text-xs text-stone-500 border-t border-stone-200">
                Showing top 50 of {filteredLiveRecords.length} mandis. Filter by state for a targeted view.
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-stone-50 border border-stone-200 text-center">
            <p className="text-xs text-stone-500">No live records found for this filter combination.</p>
          </div>
        )}
      </div>

    </div>
  );
}

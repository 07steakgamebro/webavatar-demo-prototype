import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation, type TranslationKey } from "@/lib/LanguageContext";
import {
  Search,
  Plane,
  BedDouble,
  UtensilsCrossed,
  ShoppingBag,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Map,
  HeartPulse,
  Wrench,
  Coffee,
  Dumbbell,
  Clock,
  Users,
  RotateCcw,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Check,
  Building2,
  ExternalLink,
  Factory,
  Store,
  Bot,
  Landmark,
  TrendingUp,
  Laptop,
  type LucideIcon,
} from "lucide-react";
import botnoiAirLogo from "../assets/air.png";
import botnoiRestaurantLogo from "../assets/IT.png";
import promoPhuket from "../assets/hotel.png";
import padKrapaoImage from "../assets/Restaurant.png";
import AppFooter from "../components/AppFooter";

export type ProjectCategory = 
  | "coffee"
  | "restaurant"
  | "hospital"
  | "skincare"
  | "factory"
  | "real_estate"
  | "ecommerce"
  | "retail"
  | "home_service"
  | "education"
  | "ai"
  | "fintech"
  | "investment"
  | "technology"
  | "accommodation"
  | "travel"
  | "flight"
  | "map"
  | "ac_service"
  | "fitness";

// House Item Interface
export interface HouseItem {
  id: number;
  code: string;
  name: string;
  teamName?: string | string[];
  style: string;
  type: ProjectCategory;
  color: string;
  progress: number;
  deployedUrl: string;
  githubUrl: string;
}

// Receipt & MenuItem Interfaces for Admin portal compatibility
export interface MenuItem {
  id: string;
  name: string;
  nameTh: string;
  nameEn: string;
  descTh: string;
  descEn: string;
  price: number;
  category: string;
}

export interface Receipt {
  orderId: string;
  orderedAt: string;
  items: Array<MenuItem & { quantity: number }>;
  subtotal: number;
  serviceFee: number;
  total: number;
}

// 20 Houses Mock Database mapped to Project Types and URLs
const projectData: HouseItem[] = [
  { id: -1, code: 'SANDBOX', name: 'Flight Booking', teamName: 'Botnoi Air Team', style: 'Interactive Sandbox', type: 'travel', color: '#0284c7', progress: 100, deployedUrl: '/flight-demo', githubUrl: '' },
  { id: -2, code: 'SANDBOX', name: 'IT Store E-Commerce', teamName: 'Botnoi IT Team', style: 'Interactive Sandbox', type: 'ecommerce', color: '#0284c7', progress: 100, deployedUrl: '/it-store-demo', githubUrl: '' },
  { id: -3, code: 'SANDBOX', name: 'Botnoi Restaurant', teamName: 'Botnoi Food Team', style: 'Interactive Sandbox', type: 'restaurant', color: '#0284c7', progress: 100, deployedUrl: '/food-demo', githubUrl: '' },
  { id: -4, code: 'SANDBOX', name: 'Botnoi Hotel', teamName: 'Botnoi Hotel Team', style: 'Interactive Sandbox', type: 'accommodation', color: '#0284c7', progress: 100, deployedUrl: 'https://botnoi-hotel-two.vercel.app/', githubUrl: 'https://github.com/botnoi-demos/hotel-resort-sandbox' },
  { id: 1, code: 'TN01, TN07', name: 'LearnLab', teamName: ['The-chill-crew', 'steak-game-bros'], style: 'Modern Minimalist', type: 'education', color: '#0284c7', progress: 85, deployedUrl: 'https://ai-learn-hub-22.lovable.app/', githubUrl: 'https://github.com/Icetea0000000000025/ai-learn-hub-22.git  ' },
  //{ id: 2, code: 'TN02', name: '', teamName: 'Team 02', style: 'Neo-Classical', type: 'travel', color: '#0284c7', progress: 45, deployedUrl: 'https://example.com', githubUrl: 'https://github.com' },
  { id: 3, code: 'TN03', name: 'Skinbot', teamName: 'Controller-kings', style: 'Nordic Timber', type: 'skincare', color: '#0284c7', progress: 90, deployedUrl: 'https://eucerin-mu.vercel.app/', githubUrl: 'https://github.com' },
  { id: 4, code: 'TN04', name: 'AI Trip Map Planner', teamName: 'The-netflix-hermits', style: 'Brutalist Concrete', type: 'travel', color: '#0284c7', progress: 10, deployedUrl: 'https://trip-planner-botnoi.vercel.app/', githubUrl: 'https://github.com' },
  { id: 5, code: 'TN05', name: 'Demo Health', teamName: 'Aesthetic-dreamers', style: 'Cozy Wood Cabin', type: 'hospital', color: '#0284c7', progress: 100, deployedUrl: 'https://hospital-demo-kohl.vercel.app/', githubUrl: 'https://github.com' },
  { id: 6, code: 'TN06', name: 'Botnoi API', teamName: 'lo-fi-homebodies', style: 'Glass Contemporary', type: 'ai', color: '#0284c7', progress: 60, deployedUrl: 'https://digital-friendly-companion.lovable.app/', githubUrl: 'https://github.com' },
  { id: 7, code: 'TN07', name: 'DineOS', teamName: 'steak-game-bros', style: 'Organic Earth Dome', type: 'restaurant', color: '#0284c7', progress: 80, deployedUrl: 'https://dineosdemo.vercel.app/', githubUrl: 'https://github.com/ran-lung-get/ran-lung-get-demo' },
  { id: 8, code: 'TN08, TN19', name: 'Chevi Shop', teamName: ['Vibe-architects', 'ocean-avengers'], style: 'Industrial Brickwork', type: 'ecommerce', color: '#0284c7', progress: 75, deployedUrl: 'https://chevi-shop.netlify.app/', githubUrl: 'https://github.com' },
  { id: 9, code: 'TN09', name: 'Botnoi Live Translate', teamName: 'Sunset-superfans', style: 'Japanese Zen', type: 'ai', color: '#0284c7', progress: 100, deployedUrl: 'https://botnoi-live-speak.base44.app/', githubUrl: 'https://github.com' },
  { id: 10, code: 'TN10', name: 'CoolCare Pro', teamName: 'lazy-mermaids', style: 'Modular Container', type: 'home_service', color: '#0284c7', progress: 30, deployedUrl: 'https://b-grim.vercel.app/', githubUrl: 'https://github.com' },
  { id: 11, code: 'TN11', name: 'MediQ', teamName: 'The-sharp-cuts', style: 'Mid-Century Gable', type: 'hospital', color: '#0284c7', progress: 80, deployedUrl: 'https://mediq-demo.vercel.app/', githubUrl: 'https://github.com' },
  { id: 12, code: 'TN12', name: 'HomiQ', teamName: 'Coastal-avengers', style: 'Tropical Canopy', type: 'real_estate', color: '#0284c7', progress: 95, deployedUrl: 'https://arex-platform.lovable.app/', githubUrl: 'https://github.com' },
  //{ id: 13, code: 'TN13', name: '', teamName: 'Team 13', style: 'Step Architecture', type: 'accommodation', color: '#0284c7', progress: 55, deployedUrl: 'https://example.com', githubUrl: 'https://github.com' },
  { id: 14, code: 'TN14', name: 'BrewAI', teamName: 'The-dungeon-masters', style: 'Atrium Courtyard', type: 'coffee', color: '#0284c7', progress: 100, deployedUrl: 'https://botnoi-brewai-production.up.railway.app/', githubUrl: 'https://github.com' },
  { id: 15, code: 'TN15', name: 'Glow Med Spa', teamName: 'Mountain-mode', style: 'Flat-Roof Minimal', type: 'hospital', color: '#0284c7', progress: 15, deployedUrl: 'https://medspa-booking-buddy.lovable.app/', githubUrl: 'https://github.com' },
  { id: 16, code: 'TN16', name: 'Fitder', teamName: 'Blue-hour-society', style: 'Modern Steel Frame', type: 'education', color: '#0284c7', progress: 70, deployedUrl: 'https://fitder-ai.vercel.app/', githubUrl: 'https://github.com' },
  { id: 17, code: 'TN17', name: 'AI Commerce Agent', teamName: 'Midnight-raiders', style: 'Spanish Terracotta', type: 'ai', color: '#0284c7', progress: 80, deployedUrl: 'https://ai-e-commerce-brown.vercel.app/', githubUrl: 'https://github.com' },
  //{ id: 18, code: 'TN18', name: '18-indie-mountain-kids', teamName: 'Team 18', style: 'Parametric Fluid', type: 'travel', color: '#0284c7', progress: 0, deployedUrl: 'https://example.com', githubUrl: 'https://github.com' },
  //{ id: 19, code: 'TN19', name: '19-ocean-avengers', teamName: 'Team 19', style: 'Victorian Restoration', type: 'ecommerce', color: '#0284c7', progress: 100, deployedUrl: '', githubUrl: 'https://github.com' },
  //{ id: 20, code: 'TN20', name: '', teamName: 'Team 20', style: 'Waterfront Living', type: 'ecommerce', color: '#0284c7', progress: 40, deployedUrl: 'https://example.com', githubUrl: 'https://github.com' }
];

// TN codes whose descriptions should be hidden/removed
const NO_DESC_CODES = new Set([
  'TN02', 'TN13', 'TN18', 'TN20'
]);

// Custom prompt description keys for active TN projects
const TN_CUSTOM_DESC_KEYS: Record<string, string> = {
  TN01: 'showcase.desc_tn01',
  TN03: 'showcase.desc_tn03',
  TN04: 'showcase.desc_tn04',
  TN05: 'showcase.desc_tn05',
  TN06: 'showcase.desc_tn06',
  TN07: 'showcase.desc_tn07',
  TN08: 'showcase.desc_tn08',
  TN09: 'showcase.desc_tn09',
  TN10: 'showcase.desc_tn10',
  TN11: 'showcase.desc_tn11',
  TN12: 'showcase.desc_tn12',
  TN14: 'showcase.desc_tn14',
  TN15: 'showcase.desc_tn15',
  TN16: 'showcase.desc_tn16',
  TN17: 'showcase.desc_tn17',
  TN19: 'showcase.desc_tn19',
};

const TN_NAME_KEYS: Record<string, string> = {
  TN01: 'showcase.name_tn01',
  TN03: 'showcase.name_tn03',
  TN04: 'showcase.name_tn04',
  TN05: 'showcase.name_tn05',
  TN06: 'showcase.name_tn06',
  TN07: 'showcase.name_tn07',
  TN08: 'showcase.name_tn08',
  TN09: 'showcase.name_tn09',
  TN10: 'showcase.name_tn10',
  TN11: 'showcase.name_tn11',
  TN12: 'showcase.name_tn12',
  TN14: 'showcase.name_tn14',
  TN15: 'showcase.name_tn15',
  TN16: 'showcase.name_tn16',
  TN17: 'showcase.name_tn17',
  TN19: 'showcase.name_tn19',
};

const TN_TYPE_KEYS: Record<string, string> = {
  TN01: 'showcase.type_tn01',
  TN03: 'showcase.type_tn03',
  TN04: 'showcase.type_tn04',
  TN05: 'showcase.type_tn05',
  TN06: 'showcase.type_tn06',
  TN07: 'showcase.type_tn07',
  TN08: 'showcase.type_tn08',
  TN09: 'showcase.type_tn09',
  TN10: 'showcase.type_tn10',
  TN11: 'showcase.type_tn11',
  TN12: 'showcase.type_tn12',
  TN14: 'showcase.type_tn14',
  TN15: 'showcase.type_tn15',
  TN16: 'showcase.type_tn16',
  TN17: 'showcase.type_tn17',
  TN19: 'showcase.type_tn19',
};

function getTNNameKey(code: string): string | undefined {
  if (TN_NAME_KEYS[code]) return TN_NAME_KEYS[code];
  const codes = code.split(/[\s,]+/);
  for (const c of codes) {
    if (TN_NAME_KEYS[c]) return TN_NAME_KEYS[c];
  }
  return undefined;
}

function getTNCustomDescKey(code: string): string | undefined {
  if (TN_CUSTOM_DESC_KEYS[code]) return TN_CUSTOM_DESC_KEYS[code];
  const codes = code.split(/[\s,]+/);
  for (const c of codes) {
    if (TN_CUSTOM_DESC_KEYS[c]) return TN_CUSTOM_DESC_KEYS[c];
  }
  return undefined;
}

function getTNTypeKey(code: string): string | undefined {
  if (TN_TYPE_KEYS[code]) return TN_TYPE_KEYS[code];
  const codes = code.split(/[\s,]+/);
  for (const c of codes) {
    if (TN_TYPE_KEYS[c]) return TN_TYPE_KEYS[c];
  }
  return undefined;
}

const CATEGORY_STYLES: Record<string, { Icon: LucideIcon; bg: string }> = {
  coffee: { Icon: Coffee, bg: "bg-lime-50 text-lime-800 border-lime-200/80 dark:bg-lime-950/80 dark:text-lime-200 dark:border-lime-700/80" },
  restaurant: { Icon: UtensilsCrossed, bg: "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700/80" },
  hospital: { Icon: HeartPulse, bg: "bg-pink-50 text-pink-700 border-pink-200/80 dark:bg-pink-950/80 dark:text-pink-200 dark:border-pink-700/80" },
  skincare: { Icon: Sparkles, bg: "bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-700/80" },
  factory: { Icon: Factory, bg: "bg-orange-50 text-orange-800 border-orange-200/80 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-700/80" },
  real_estate: { Icon: Building2, bg: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-600" },
  ecommerce: { Icon: ShoppingBag, bg: "bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/80 dark:text-violet-200 dark:border-violet-700/80" },
  retail: { Icon: Store, bg: "bg-purple-50 text-purple-900 border-purple-300/80 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-700/80" },
  home_service: { Icon: Wrench, bg: "bg-yellow-50 text-yellow-800 border-yellow-200/80 dark:bg-yellow-950/80 dark:text-yellow-200 dark:border-yellow-700/80" },
  education: { Icon: GraduationCap, bg: "bg-amber-50 text-amber-900 border-amber-300/80 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700/80" },
  ai: { Icon: Bot, bg: "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-700/80" },
  fintech: { Icon: Landmark, bg: "bg-indigo-50 text-indigo-900 border-indigo-300/80 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-700/80" },
  investment: { Icon: TrendingUp, bg: "bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-950/80 dark:text-teal-200 dark:border-teal-700/80" },
  technology: { Icon: Laptop, bg: "bg-blue-50 text-blue-800 border-blue-200/80 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700/80" },
  accommodation: { Icon: BedDouble, bg: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700/80" },
  travel: { Icon: Plane, bg: "bg-orange-50 text-orange-900 border-orange-300/80 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-700/80" },
  map: { Icon: Map, bg: "bg-orange-50 text-orange-900 border-orange-300/80 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-700/80" },
  flight: { Icon: Plane, bg: "bg-orange-50 text-orange-900 border-orange-300/80 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-700/80" },
  ac_service: { Icon: Wrench, bg: "bg-yellow-50 text-yellow-800 border-yellow-200/80 dark:bg-yellow-950/80 dark:text-yellow-200 dark:border-yellow-700/80" },
  fitness: { Icon: Dumbbell, bg: "bg-amber-50 text-amber-900 border-amber-300/80 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700/80" },
};

// Auto-discover any image files placed in src/assets/ (e.g. TN01.png, tn03.jpg, tn07.webp)
const localAssetsMap = import.meta.glob<{ default: string }>('../assets/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
});

function getLocalAssetForHouse(code: string): string | undefined {
  const codes = code.toLowerCase().split(/[\s,]+/);
  for (const c of codes) {
    for (const path in localAssetsMap) {
      const filename = path.split('/').pop()?.toLowerCase();
      if (filename && (filename.startsWith(c + '.') || filename.startsWith(c + '_') || filename.startsWith(c + '-')) ) {
        return localAssetsMap[path] as unknown as string;
      }
    }
  }
  return undefined;
}

const DEMO_PREVIEW_IMAGES: Record<string, string> = {
  '-1': botnoiAirLogo,
  '-2': botnoiRestaurantLogo,
  '-3': padKrapaoImage,
  '-4': promoPhuket,
  TN01: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&q=80&auto=format&fit=crop',
  TN03: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80&auto=format&fit=crop',
  TN04: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80&auto=format&fit=crop',
  TN05: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80&auto=format&fit=crop',
  TN06: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80&auto=format&fit=crop',
  TN07: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80&auto=format&fit=crop',
  TN08: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&auto=format&fit=crop',
  TN09: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80&auto=format&fit=crop',
  TN10: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80&auto=format&fit=crop',
  TN11: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80&auto=format&fit=crop',
  TN12: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80&auto=format&fit=crop',
  TN14: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80&auto=format&fit=crop',
  TN15: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80&auto=format&fit=crop',
  TN16: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&auto=format&fit=crop',
  TN17: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80&auto=format&fit=crop',
  TN19: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80&auto=format&fit=crop',
};

const CATEGORY_COLOR_MAP: Record<
  string,
  {
    active: string;
    hover: string;
  }
> = {
  all: {
    active: "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/25 dark:bg-sky-900/80 dark:text-sky-100 dark:border-sky-500/60 dark:shadow-sky-950/40",
    hover: "hover:bg-sky-500/15 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-400/60 hover:shadow-sm hover:shadow-sky-500/15",
  },
  coffee: {
    active: "bg-lime-600 text-white border-lime-600 shadow-md shadow-lime-600/25 dark:bg-lime-900/80 dark:text-lime-100 dark:border-lime-500/60 dark:shadow-lime-950/40",
    hover: "hover:bg-lime-500/15 hover:text-lime-700 dark:hover:text-lime-400 hover:border-lime-400/60 hover:shadow-sm hover:shadow-lime-500/15",
  },
  restaurant: {
    active: "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 dark:bg-emerald-900/80 dark:text-emerald-100 dark:border-emerald-500/60 dark:shadow-emerald-950/40",
    hover: "hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-400/60 hover:shadow-sm hover:shadow-emerald-500/15",
  },
  hospital: {
    active: "bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/25 dark:bg-pink-900/80 dark:text-pink-100 dark:border-pink-500/60 dark:shadow-pink-950/40",
    hover: "hover:bg-pink-500/15 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-400/60 hover:shadow-sm hover:shadow-pink-500/15",
  },
  skincare: {
    active: "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/25 dark:bg-rose-900/80 dark:text-rose-100 dark:border-rose-500/60 dark:shadow-rose-950/40",
    hover: "hover:bg-rose-500/15 hover:text-rose-700 dark:hover:text-rose-400 hover:border-rose-400/60 hover:shadow-sm hover:shadow-rose-500/15",
  },
  factory: {
    active: "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/25 dark:bg-orange-900/80 dark:text-orange-100 dark:border-orange-500/60 dark:shadow-orange-950/40",
    hover: "hover:bg-orange-500/15 hover:text-orange-700 dark:hover:text-orange-400 hover:border-orange-400/60 hover:shadow-sm hover:shadow-orange-500/15",
  },
  real_estate: {
    active: "bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/25 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-500 dark:shadow-slate-950/40",
    hover: "hover:bg-slate-500/15 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-400/60 hover:shadow-sm hover:shadow-slate-500/15",
  },
  ecommerce: {
    active: "bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-500/25 dark:bg-violet-900/80 dark:text-violet-100 dark:border-violet-500/60 dark:shadow-violet-950/40",
    hover: "hover:bg-violet-500/15 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-400/60 hover:shadow-sm hover:shadow-violet-500/15",
  },
  retail: {
    active: "bg-purple-800 text-white border-purple-800 shadow-md shadow-purple-800/25 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-600 dark:shadow-purple-950/40",
    hover: "hover:bg-purple-500/15 hover:text-purple-800 dark:hover:text-purple-300 hover:border-purple-400/60 hover:shadow-sm hover:shadow-purple-500/15",
  },
  home_service: {
    active: "bg-amber-400 text-amber-950 border-amber-400 shadow-md shadow-amber-400/25 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-400 dark:shadow-amber-950/40",
    hover: "hover:bg-amber-400/15 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-400/60 hover:shadow-sm hover:shadow-amber-400/15",
  },
  education: {
    active: "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25 dark:bg-amber-800 dark:text-amber-100 dark:border-amber-500 dark:shadow-amber-950/40",
    hover: "hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-400/60 hover:shadow-sm hover:shadow-amber-500/15",
  },
  ai: {
    active: "bg-sky-400 text-slate-900 border-sky-400 shadow-md shadow-sky-400/25 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-400 dark:shadow-sky-950/40",
    hover: "hover:bg-sky-400/15 hover:text-sky-600 dark:hover:text-sky-300 hover:border-sky-400/60 hover:shadow-sm hover:shadow-sky-400/15",
  },
  fintech: {
    active: "bg-indigo-800 text-white border-indigo-800 shadow-md shadow-indigo-800/25 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-600 dark:shadow-indigo-950/40",
    hover: "hover:bg-indigo-500/15 hover:text-indigo-800 dark:hover:text-indigo-300 hover:border-indigo-400/60 hover:shadow-sm hover:shadow-indigo-500/15",
  },
  investment: {
    active: "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/25 dark:bg-teal-900/80 dark:text-teal-100 dark:border-teal-500/60 dark:shadow-teal-950/40",
    hover: "hover:bg-teal-500/15 hover:text-teal-700 dark:hover:text-teal-400 hover:border-teal-400/60 hover:shadow-sm hover:shadow-teal-500/15",
  },
  technology: {
    active: "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25 dark:bg-blue-900/80 dark:text-blue-100 dark:border-blue-500/60 dark:shadow-blue-950/40",
    hover: "hover:bg-blue-500/15 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-400/60 hover:shadow-sm hover:shadow-blue-500/15",
  },
  accommodation: {
    active: "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25 dark:bg-amber-900/80 dark:text-amber-100 dark:border-amber-500/60 dark:shadow-amber-950/40",
    hover: "hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-400/60 hover:shadow-sm hover:shadow-amber-500/15",
  },
  travel: {
    active: "bg-orange-700 text-white border-orange-700 shadow-md shadow-orange-700/25 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-600 dark:shadow-orange-950/40",
    hover: "hover:bg-orange-500/15 hover:text-orange-800 dark:hover:text-orange-300 hover:border-orange-400/60 hover:shadow-sm hover:shadow-orange-500/15",
  },
  map: {
    active: "bg-orange-700 text-white border-orange-700 shadow-md shadow-orange-700/25 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-600 dark:shadow-orange-950/40",
    hover: "hover:bg-orange-500/15 hover:text-orange-800 dark:hover:text-orange-300 hover:border-orange-400/60 hover:shadow-sm hover:shadow-orange-500/15",
  },
  ac_service: {
    active: "bg-amber-400 text-amber-950 border-amber-400 shadow-md shadow-amber-400/25 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-400 dark:shadow-amber-950/40",
    hover: "hover:bg-amber-400/15 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-400/60 hover:shadow-sm hover:shadow-amber-400/15",
  },
  flight: {
    active: "bg-orange-700 text-white border-orange-700 shadow-md shadow-orange-700/25 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-600 dark:shadow-orange-950/40",
    hover: "hover:bg-orange-500/15 hover:text-orange-800 dark:hover:text-orange-300 hover:border-orange-400/60 hover:shadow-sm hover:shadow-orange-500/15",
  },
  fitness: {
    active: "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25 dark:bg-amber-800 dark:text-amber-100 dark:border-amber-500 dark:shadow-amber-950/40",
    hover: "hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-400/60 hover:shadow-sm hover:shadow-amber-500/15",
  },
};

function isHouseDeployed(house: HouseItem): boolean {
  return Boolean(
    house.deployedUrl &&
    house.deployedUrl.trim() !== "" &&
    house.deployedUrl.trim() !== "https://example.com",
  );
}

// ─── Shared card renderer ─────────────────────────────────────────────────────
function DemoCard({ house, t }: { house: HouseItem; t: (key: any) => string }) {
  const hasDeployed = isHouseDeployed(house);
  let typeLabel: string;
  let typeBg = "bg-stone-50 text-stone-600 border-stone-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700";
  let cardDescription = "";
  let displayName = house.name;

  if (house.id === -1) {
    typeLabel = t("showcase.type_flight");
    typeBg = CATEGORY_STYLES.travel.bg;
    cardDescription = t("showcase.desc_flight");
    displayName = t("showcase.flight_demo_name");
  } else if (house.id === -2) {
    typeLabel = t("showcase.type_ecommerce");
    typeBg = CATEGORY_STYLES.ecommerce.bg;
    cardDescription = t("showcase.desc_ecommerce");
    displayName = t("showcase.itstore_demo_name");
  } else if (house.id === -3) {
    typeLabel = t("showcase.type_restaurant");
    typeBg = CATEGORY_STYLES.restaurant.bg;
    cardDescription = t("showcase.desc_restaurant");
    displayName = t("food.title");
  } else if (house.id === -4) {
    typeLabel = t("showcase.type_accommodation");
    typeBg = CATEGORY_STYLES.accommodation.bg;
    cardDescription = t("showcase.desc_accommodation");
    displayName = t("showcase.hotel_demo_name");
  } else {
    const nameKey = getTNNameKey(house.code);
    if (nameKey) {
      displayName = t(nameKey as any);
    }
    const customDescKey = getTNCustomDescKey(house.code);
    if (customDescKey) {
      cardDescription = t(customDescKey as any);
    } else if (!NO_DESC_CODES.has(house.code)) {
      cardDescription = t(`showcase.desc_${house.type}` as any);
    }

    if (!hasDeployed) {
      typeLabel = t("showcase.type_pending");
      typeBg = "bg-stone-50 text-stone-500 border-stone-200/50 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700";
    } else {
      const typeKey = getTNTypeKey(house.code);
      typeLabel = typeKey
        ? t(typeKey as any)
        : t(`showcase.type_${house.type}` as any);
      if (CATEGORY_STYLES[house.type]) {
        typeBg = CATEGORY_STYLES[house.type].bg;
      }
    }
  }

  const bulletItems = useMemo(() => {
    if (!cardDescription) return [];
    if (cardDescription.includes('\n') || cardDescription.includes('•')) {
      return cardDescription
        .split(/[\n•]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (cardDescription.includes(': ')) {
      const parts = cardDescription.split(/:\s*(.+)/);
      if (parts[1]) {
        const subItems = parts[1]
          .split(/[,;\.]|\bและ\b|\band\b|\bincluding\b|\bfeaturing\b/i)
          .map((s) => s.trim())
          .filter(Boolean);
        return subItems.length > 0 ? subItems : [parts[1].trim()];
      }
    }
    return cardDescription
      .split(/[,;\.]|\bและ\b|\band\b/i)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [cardDescription]);

  const cardId = house.id < 0
    ? `card-sandbox-${house.id === -1 ? 'flight' : house.id === -2 ? 'itstore' : house.id === -3 ? 'food' : 'hotel'}`
    : `card-${house.code.toLowerCase()}`;

  const teamNamesArray = useMemo(() => {
    if (!house.teamName) {
      return [house.code.startsWith('TN') ? `Team ${house.code.replace('TN', '')}` : 'Botnoi Team'];
    }
    if (Array.isArray(house.teamName)) {
      return house.teamName;
    }
    return [house.teamName];
  }, [house.teamName, house.code]);

  const previewImg = getLocalAssetForHouse(house.code) || DEMO_PREVIEW_IMAGES[String(house.id)] || DEMO_PREVIEW_IMAGES[house.code] || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80&auto=format&fit=crop";

  const cardInnerContent = (
    <motion.article
      key={house.id}
      id={cardId}
      aria-label={`${house.code}: ${displayName}`}
      className="playing-card relative bg-card border-2 border-border/80 dark:border-slate-800 rounded-[24px] shadow-md hover:shadow-2xl hover:border-sky-400/70 transition-all duration-300 flex flex-col justify-between group overflow-hidden cursor-pointer h-full"
      style={{
        boxShadow: "0 10px 25px -8px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)",
      }}
      whileHover={{ y: 0, scale: 1.02, rotate: 0 }}
    >
      {/* Top Demo Image Thumbnail Preview Box with Image-Only Hover Overlay */}
      <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-slate-900 border-b border-border/60">
        <img
          src={previewImg}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/15 to-black/35 pointer-events-none" />

        {/* Hover Overlay Layer (Restricted ONLY to Image Preview Area) */}
        <div className="absolute inset-0 z-20 bg-sky-600/45 dark:bg-sky-500/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none p-3 text-center">
          {hasDeployed ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-white text-sky-950 dark:bg-slate-900 dark:text-sky-300 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <span>{t('showcase.launch_demo')}</span>
              <ExternalLink className="size-3.5 shrink-0" />
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/25 text-white text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
              <Clock className="size-3.5 shrink-0" />
              <span>{t('showcase.status_pending')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Accent Strip below image */}
      <div
        className="h-1 opacity-90"
        style={{ background: house.color || "var(--primary)" }}
      />

      <div className="relative z-10 flex flex-col flex-1 justify-between p-4.5">
        <div>
          {/* Card Title */}
          <div className="mb-2">
            <h3 className="text-base sm:text-[16px] font-black text-foreground group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors tracking-tight leading-snug min-h-[2.4rem] flex items-center">
              {displayName}
            </h3>
          </div>

          {/* Card Description Bullets */}
          {bulletItems.length > 0 ? (
            <ul
              className="text-[11.5px] text-muted-foreground leading-relaxed max-h-[4.8rem] overflow-hidden group-hover:overflow-y-auto pr-1 cursor-text space-y-1 scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {bulletItems.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary/70 mt-1.5 shrink-0" />
                  <span className="flex-1 font-sans">{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="min-h-[4.5rem]" />
          )}

          {/* Tags Row Below Description: Code Tag (SANDBOX / StartUP) & Category Type Tag */}
          <div className="flex items-center gap-2 mt-4 pt-1 flex-wrap">
            {/* Code Badge (SANDBOX / StartUP) */}
            <span className="text-[10px] font-black text-foreground font-mono bg-muted/80 dark:bg-slate-800/90 px-2 py-0.5 rounded-md border border-border/70 shadow-2xs">
              {house.code.startsWith("TN") ? t("showcase.startup_badge" as any) : house.code}
            </span>

            {/* Category Type Tag (Text-only) */}
            <span className={`text-[9.5px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border shadow-2xs whitespace-nowrap ${typeBg}`}>
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Card Footer: Team Names (Renders multiple team badges if array) */}
        <div className="pt-2.5 border-t border-border/60 mt-3.5 flex items-center justify-between gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden pr-1 flex-wrap">
            <Users className="size-3 text-primary shrink-0" />
            {teamNamesArray.map((team, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold text-foreground/80 bg-muted/60 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-border/40 truncate max-w-full leading-tight inline-flex items-center gap-1"
                title={team}
              >
                {team}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );

  if (!hasDeployed) {
    return cardInnerContent;
  }

  if (house.deployedUrl.startsWith('/')) {
    return (
      <Link to={house.deployedUrl} className="block h-full group font-sans">
        {cardInnerContent}
      </Link>
    );
  }

  return (
    <a href={house.deployedUrl} target="_blank" rel="noopener noreferrer" className="block h-full group font-sans">
      {cardInnerContent}
    </a>
  );
}

const BUSINESS_TYPE_OPTIONS = [
  { id: "all", translationKey: "showcase.cat_all" as const },
  { id: "food_beverage", translationKey: "showcase.biz_food_beverage" as const },
  { id: "health_wellness", translationKey: "showcase.biz_health_wellness" as const },
  { id: "manufacturing", translationKey: "showcase.biz_manufacturing" as const },
  { id: "property_realestate", translationKey: "showcase.biz_property_realestate" as const },
  { id: "retail_ecommerce", translationKey: "showcase.biz_retail_ecommerce" as const },
  { id: "service_maintenance", translationKey: "showcase.biz_service_maintenance" as const },
  { id: "tech_finance", translationKey: "showcase.biz_tech_finance" as const },
  { id: "travel_accommodation", translationKey: "showcase.biz_travel_accommodation" as const },
];

function matchesHouseCategory(house: HouseItem, catId: string): boolean {
  if (catId === "all") return true;
  if (catId === "coffee") return house.code === "TN14";
  if (catId === "restaurant") return house.id === -3 || (house.code === "TN07" && house.id === 7);
  if (catId === "hospital") return house.code === "TN05" || house.code === "TN11" || house.code === "TN15";
  if (catId === "skincare") return house.code === "TN03";
  if (catId === "factory") return false;
  if (catId === "real_estate") return house.code === "TN12";
  if (catId === "ecommerce") return house.id === -2 || (house.code.includes("TN08") && house.id === 8);
  if (catId === "retail") return false;
  if (catId === "home_service") return house.code === "TN10";
  if (catId === "education") return (house.code.includes("TN01") && house.id === 1) || house.code === "TN16";
  if (catId === "ai") return house.code === "TN06" || house.code === "TN09" || house.code === "TN17";
  if (catId === "fintech") return false;
  if (catId === "investment") return false;
  if (catId === "technology") return false;
  if (catId === "accommodation") return house.id === -4;
  if (catId === "travel") return house.id === -1 || house.code === "TN04";
  return false;
}

const BUSINESS_TYPE_SUBCATEGORIES: Record<string, string[]> = {
  food_beverage: ["coffee", "restaurant"],
  health_wellness: ["hospital", "skincare"],
  manufacturing: ["factory"],
  property_realestate: ["real_estate"],
  retail_ecommerce: ["ecommerce", "retail"],
  service_maintenance: ["home_service", "education"],
  tech_finance: ["ai", "fintech", "investment", "technology"],
  travel_accommodation: ["accommodation", "travel"],
};

function matchesHouseBusinessType(house: HouseItem, filter: string): boolean {
  if (filter === "all") return true;
  const subCats = BUSINESS_TYPE_SUBCATEGORIES[filter];
  if (!subCats) return true;
  return subCats.some(catId => matchesHouseCategory(house, catId));
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function OrderDemo() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Applied filters (control what is currently rendered in demo cards and available categories)
  const [appliedBusinessTypeFilter, setAppliedBusinessTypeFilter] = useState<string>("all");
  const [appliedSortBy, setAppliedSortBy] = useState<"all" | "sandbox" | "startup">("all");

  // Pending filters (selected via dropdowns before pressing OK)
  const [pendingBusinessTypeFilter, setPendingBusinessTypeFilter] = useState<string>("all");
  const [pendingSortBy, setPendingSortBy] = useState<"all" | "sandbox" | "startup">("all");

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const hasPendingChanges = pendingSortBy !== appliedSortBy || pendingBusinessTypeFilter !== appliedBusinessTypeFilter;

  // Toggle multi-select categories
  const handleCategoryToggle = (catId: string) => {
    if (catId === "all") {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) => {
      const clean = prev.filter((id) => id !== "all");
      if (clean.includes(catId)) {
        return clean.filter((id) => id !== catId);
      } else {
        return [...clean, catId];
      }
    });
  };

  // Dynamically compute available categories based on active demo pool (appliedSortBy / appliedBusinessTypeFilter)
  const availableCategories = useMemo(() => {
    const allCategories = [
      { id: "all", translationKey: "showcase.cat_all" as const },
      { id: "coffee", translationKey: "showcase.cat_coffee" as const },
      { id: "restaurant", translationKey: "showcase.cat_restaurant" as const },
      { id: "hospital", translationKey: "showcase.cat_hospital" as const },
      { id: "skincare", translationKey: "showcase.cat_skincare" as const },
      { id: "factory", translationKey: "showcase.cat_factory" as const },
      { id: "real_estate", translationKey: "showcase.cat_real_estate" as const },
      { id: "ecommerce", translationKey: "showcase.cat_ecommerce" as const },
      { id: "retail", translationKey: "showcase.cat_retail" as const },
      { id: "home_service", translationKey: "showcase.cat_home_service" as const },
      { id: "education", translationKey: "showcase.cat_education" as const },
      { id: "ai", translationKey: "showcase.cat_ai" as const },
      { id: "fintech", translationKey: "showcase.cat_fintech" as const },
      { id: "investment", translationKey: "showcase.cat_investment" as const },
      { id: "technology", translationKey: "showcase.cat_technology" as const },
      { id: "accommodation", translationKey: "showcase.cat_accommodation" as const },
      { id: "travel", translationKey: "showcase.cat_travel" as const },
    ];

    if (appliedBusinessTypeFilter === "all" && appliedSortBy === "all") {
      return allCategories;
    }

    if (appliedBusinessTypeFilter !== "all" && appliedSortBy === "all") {
      const allowedCats = BUSINESS_TYPE_SUBCATEGORIES[appliedBusinessTypeFilter];
      return allCategories.filter(cat => cat.id === "all" || (allowedCats ? allowedCats.includes(cat.id) : true));
    }

    let pool = projectData;
    if (appliedSortBy === "sandbox") {
      pool = projectData.filter(h => h.code === 'SANDBOX');
    } else if (appliedSortBy === "startup") {
      pool = projectData.filter(h => h.code !== 'SANDBOX');
    }

    if (appliedBusinessTypeFilter !== "all") {
      pool = pool.filter(h => matchesHouseBusinessType(h, appliedBusinessTypeFilter));
    }

    return allCategories.filter(cat => cat.id === "all" || pool.some(h => matchesHouseCategory(h, cat.id)));
  }, [appliedSortBy, appliedBusinessTypeFilter]);

  // Reset selected categories if current selections are no longer present in availableCategories
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const validSet = new Set(availableCategories.map((cat) => cat.id));
      const validSelected = selectedCategories.filter((id) => id === "all" || validSet.has(id));
      if (validSelected.length !== selectedCategories.length) {
        setSelectedCategories(validSelected);
      }
    }
  }, [availableCategories, selectedCategories]);

  // Split filtered results into two groups and apply filters/sorting
  const { sandboxDemos, projectDemos } = useMemo(() => {
    const allFiltered = projectData.filter(house => {
      const query = searchQuery.trim().toLowerCase();

      // If query is empty, skip search filter
      if (!query) {
        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes("all") ||
          selectedCategories.some((catId) => matchesHouseCategory(house, catId));
        const matchesBusinessType = matchesHouseBusinessType(house, appliedBusinessTypeFilter);
        return matchesCategory && matchesBusinessType;
      }

      // ─────────────────────────────────────────────────────────────
      // 1. Demo Name & Code (ชื่อ demo)
      // ─────────────────────────────────────────────────────────────
      const nameTargets: string[] = [
        house.name,
        house.code,
      ];

      if (house.id === -1) {
        nameTargets.push(t("showcase.flight_demo_name"));
      } else if (house.id === -2) {
        nameTargets.push(t("showcase.itstore_demo_name"));
      } else if (house.id === -3) {
        nameTargets.push(t("food.title"));
      } else if (house.id === -4) {
        nameTargets.push(t("showcase.hotel_demo_name"));
      } else {
        const nameKey = getTNNameKey(house.code);
        if (nameKey) {
          const transName = t(nameKey as any);
          const cleanName = transName.replace(/\s*\([^)]*\)/g, '').trim();
          nameTargets.push(cleanName || transName);
        }
      }

      const matchesDemoName = nameTargets.some(target =>
        Boolean(target) && target.toLowerCase().includes(query)
      );

      // ─────────────────────────────────────────────────────────────
      // 2. Demo Tag / Category / Badge (tag ของ demo)
      // ─────────────────────────────────────────────────────────────
      const tagTargets: string[] = [
        house.code.startsWith('TN') ? 'StartUP' : 'SANDBOX',
        house.code.startsWith('TN') ? 'Startup' : 'Sandbox',
        house.code.startsWith('TN') ? t('showcase.startup_badge' as any) : '',
        house.type,
      ];

      const categoryKeyMap: Record<string, string> = {
        coffee: 'showcase.cat_coffee',
        restaurant: 'showcase.cat_restaurant',
        hospital: 'showcase.cat_hospital',
        skincare: 'showcase.cat_skincare',
        factory: 'showcase.cat_factory',
        real_estate: 'showcase.cat_real_estate',
        ecommerce: 'showcase.cat_ecommerce',
        retail: 'showcase.cat_retail',
        home_service: 'showcase.cat_home_service',
        education: 'showcase.cat_education',
        ai: 'showcase.cat_ai',
        fintech: 'showcase.cat_fintech',
        investment: 'showcase.cat_investment',
        technology: 'showcase.cat_technology',
        accommodation: 'showcase.cat_accommodation',
        travel: 'showcase.cat_travel',
        flight: 'showcase.cat_travel',
        map: 'showcase.cat_travel',
        ac_service: 'showcase.cat_home_service',
        fitness: 'showcase.cat_hospital',
      };

      if (categoryKeyMap[house.type]) {
        tagTargets.push(t(categoryKeyMap[house.type] as any));
      }

      const typeKey = getTNTypeKey(house.code);
      if (typeKey) {
        tagTargets.push(t(typeKey as any));
      } else {
        tagTargets.push(t(`showcase.type_${house.type}` as any));
      }

      // Standard tag keyword aliases in Thai & English directly corresponding to tags
      const tagKeywordsMap: Record<string, string[]> = {
        coffee: ['coffee', 'cafe', 'กาแฟ', 'คาเฟ่'],
        restaurant: ['restaurant', 'food', 'ร้านอาหาร', 'อาหาร'],
        hospital: ['hospital', 'healthcare', 'health', 'โรงพยาบาล', 'การแพทย์', 'สุขภาพ', 'สปา', 'เภสัชกรรม', 'คลินิก'],
        skincare: ['skincare', 'skin', 'สกินแคร์'],
        factory: ['factory', 'production', 'โรงงาน', 'การผลิต'],
        real_estate: ['real estate', 'property', 'อสังหาริมทรัพย์', 'อสังหา'],
        ecommerce: ['ecommerce', 'e-commerce', 'อีคอมเมิร์ซ', 'ไอที', 'it', 'furniture', 'เฟอร์นิเจอร์'],
        retail: ['retail', 'ค้าปลีก'],
        home_service: ['home service', 'บริการล้างแอร์', 'ล้างแอร์', 'แอร์'],
        education: ['education', 'e-learning', 'learning', 'การศึกษา', 'คอร์สเรียนออนไลน์', 'คอร์สเรียน', 'ฟิตเนส', 'fitness'],
        ai: ['ai', 'ai service', 'บริการ ai', 'แปลภาษา', 'translation', 'commerce'],
        fintech: ['fintech', 'ฟินเทค', 'การเงิน'],
        investment: ['investment', 'การลงทุน'],
        technology: ['technology', 'tech', 'เทคโนโลยี', 'it', 'ไอที'],
        accommodation: ['accommodation', 'hotel', 'โรงแรม', 'ที่พัก'],
        travel: ['travel', 'flight', 'ท่องเที่ยว', 'การเดินทาง', 'สายการบิน', 'เที่ยวบิน', 'map', 'แผนที่'],
      };

      if (tagKeywordsMap[house.type]) {
        tagTargets.push(...tagKeywordsMap[house.type]);
      }

      if (house.code === 'TN08' || house.code === 'TN19' || house.code.includes('TN08')) {
        tagTargets.push('furniture', 'เฟอร์นิเจอร์');
      }
      if (house.code === 'TN09') {
        tagTargets.push('ai voice translation', 'translation', 'แปลภาษาเสียง', 'แปลภาษา');
      }
      if (house.code === 'TN10') {
        tagTargets.push('ac maintenance', 'ล้างแอร์', 'แอร์');
      }
      if (house.code === 'TN11') {
        tagTargets.push('pharmacy', 'ร้านขายยา', 'เภสัชกรรม');
      }
      if (house.code === 'TN14') {
        tagTargets.push('cafe', 'คาเฟ่', 'กาแฟ', 'coffee');
      }
      if (house.code === 'TN15') {
        tagTargets.push('spa', 'wellness', 'สปา', 'สุขภาพ');
      }
      if (house.code === 'TN16') {
        tagTargets.push('fitness', 'ฟิตเนส');
      }
      if (house.code === 'TN17') {
        tagTargets.push('ai commerce', 'เอไอคอมเมิร์ซ');
      }

      const matchesTag = tagTargets.some(target =>
        Boolean(target) && target.toLowerCase().includes(query)
      );

      // ─────────────────────────────────────────────────────────────
      // 3. Creator / Author / Team Name (คนทำ)
      // ─────────────────────────────────────────────────────────────
      const teamTargets: string[] = [];
      if (Array.isArray(house.teamName)) {
        teamTargets.push(...house.teamName);
      } else if (house.teamName) {
        teamTargets.push(house.teamName);
      } else if (house.code.startsWith('TN')) {
        const num = house.code.replace('TN', '');
        teamTargets.push(`Team ${num}`);
      } else {
        teamTargets.push('Botnoi Team');
      }

      const matchesAuthor = teamTargets.some(target =>
        Boolean(target) && target.toLowerCase().includes(query)
      );

      // Search matches ONLY demo name, demo tag, or creator/team (descriptions and styles are NOT searched)
      const matchesSearch = matchesDemoName || matchesTag || matchesAuthor;

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes("all") ||
        selectedCategories.some((catId) => matchesHouseCategory(house, catId));

      const matchesBusinessType = matchesHouseBusinessType(house, appliedBusinessTypeFilter);

      return matchesSearch && matchesCategory && matchesBusinessType;
    });

    let sandboxes = allFiltered.filter(h => h.code === 'SANDBOX');
    let projects = allFiltered.filter(h => h.code !== 'SANDBOX');

    // Filter by appliedSortBy selection (Sandbox Demo vs StartUP Demo)
    if (appliedSortBy === "sandbox") {
      projects = [];
    } else if (appliedSortBy === "startup") {
      sandboxes = [];
    } else {
      projects.sort((a, b) => a.id - b.id);
    }

    return {
      sandboxDemos: sandboxes,
      projectDemos: projects,
    };
  }, [searchQuery, selectedCategories, appliedBusinessTypeFilter, appliedSortBy, t]);

  const totalResults = sandboxDemos.length + projectDemos.length;
  const isAllCategoryActive = selectedCategories.length === 0 || selectedCategories.includes("all");

  return (
    <div
      className="min-h-[calc(100vh-68px)] w-full flex flex-col pb-10 selection:bg-primary selection:text-primary-foreground relative z-10"
      aria-label="All Demos Showcase Portal"
    >
      {/* Search & Filtering Controls */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-6 relative z-40" aria-label="Search and Filter Demos" id="search-filter-section">
        {/* Main Container: Single container with a responsive two-row layout */}
        <div className="flex flex-col gap-4 bg-card/80 dark:bg-slate-950/70 backdrop-blur-xl border border-border/80 p-4 sm:p-5 md:p-6 rounded-[24px] shadow-lg shadow-black/5 transition-all relative z-40 w-full max-w-full min-w-0">
          
          {/* Top Row: Search input + Controls ('Sort by', 'Business Type', 'OK', 'Clear') */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 md:gap-4 w-full min-w-0">
            {/* Search Input (Full width on mobile/tablet, expands flex-1 on desktop) */}
            <div className="relative w-full lg:flex-1 min-w-0 flex items-center group">
              <label htmlFor="demo-search-input" className="sr-only">
                {t('showcase.search_placeholder')}
              </label>
              <Search className="absolute left-3.5 size-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
              <input
                id="demo-search-input"
                name="searchQuery"
                type="text"
                aria-label={t('showcase.search_placeholder')}
                placeholder={t('showcase.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-9 bg-muted/40 hover:bg-muted/60 dark:bg-slate-900/60 border border-border/80 focus:border-primary/80 focus:bg-background rounded-2xl text-xs font-bold text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Clear search text"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Controls Group: Sort by, Business Type, OK & Clear Buttons (Responsive 2-col grid on mobile, inline on tablet/desktop) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0 min-w-0">
              {/* Custom Styled Dropdown: Sort by */}
              <div className="relative z-50 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsSortOpen(!isSortOpen);
                    setIsStatusOpen(false);
                  }}
                  className="w-full sm:w-auto h-10 px-3 sm:px-3.5 bg-muted/40 hover:bg-muted/70 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-border/80 hover:border-primary/50 rounded-2xl text-xs font-bold text-foreground transition-all cursor-pointer flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 shadow-2xs active:scale-95 min-w-0"
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <ArrowUpDown className="size-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground font-mono text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
                      {t('showcase.sort_heading')}:
                    </span>
                    <span className="font-extrabold text-foreground truncate">
                      {pendingSortBy === "sandbox" ? t('showcase.sort_sandbox' as TranslationKey) : pendingSortBy === "startup" ? t('showcase.sort_startup' as TranslationKey) : t('showcase.cat_all')}
                    </span>
                  </div>
                  <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${isSortOpen ? "rotate-180 text-primary" : ""}`} />
                </button>

                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-52 max-w-[calc(100vw-2.5rem)] bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl shadow-black/10 p-1.5 z-50 flex flex-col gap-1 text-left"
                    >
                      {[
                        { id: "all", label: t('showcase.cat_all') },
                        { id: "sandbox", label: t('showcase.sort_sandbox' as TranslationKey) },
                        { id: "startup", label: t('showcase.sort_startup' as TranslationKey) },
                      ].map((opt) => {
                        const isSelected = pendingSortBy === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setPendingSortBy(opt.id as any);
                              setIsSortOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary/15 text-primary"
                                : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                            }`}
                          >
                            <span className="text-left flex-1 font-sans truncate">{opt.label}</span>
                            {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </div>

              {/* Custom Styled Dropdown: Business Type */}
              <div className="relative z-50 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusOpen(!isStatusOpen);
                    setIsSortOpen(false);
                  }}
                  className="w-full sm:w-auto h-10 px-3 sm:px-3.5 bg-muted/40 hover:bg-muted/70 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-border/80 hover:border-primary/50 rounded-2xl text-xs font-bold text-foreground transition-all cursor-pointer flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 shadow-2xs active:scale-95 min-w-0 text-left"
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <Building2 className="size-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground font-mono text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
                      {t('showcase.business_type' as TranslationKey)}:
                    </span>
                    <span className="font-extrabold text-foreground truncate">
                      {(() => {
                        const opt = BUSINESS_TYPE_OPTIONS.find(o => o.id === pendingBusinessTypeFilter);
                        return opt ? t(opt.translationKey as TranslationKey) : t('showcase.cat_all');
                      })()}
                    </span>
                  </div>
                  <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${isStatusOpen ? "rotate-180 text-primary" : ""}`} />
                </button>

                {isStatusOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-auto right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] max-h-80 overflow-y-auto custom-scrollbar bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl shadow-black/10 p-1.5 z-50 flex flex-col gap-1 text-left"
                    >
                      {BUSINESS_TYPE_OPTIONS.map((opt) => {
                        const isSelected = pendingBusinessTypeFilter === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setPendingBusinessTypeFilter(opt.id);
                              setIsStatusOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary/15 text-primary"
                                : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                            }`}
                          >
                            <span className="text-left flex-1 font-sans truncate">{t(opt.translationKey as TranslationKey)}</span>
                            {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </div>

              {/* OK Button */}
              <button
                type="button"
                onClick={() => {
                  setAppliedSortBy(pendingSortBy);
                  setAppliedBusinessTypeFilter(pendingBusinessTypeFilter);
                }}
                className={`w-full sm:w-auto h-10 px-5 sm:px-6 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
                  hasPendingChanges
                    ? "bg-primary text-primary-foreground border border-primary/90 shadow-md shadow-primary/30"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border border-border/80"
                }`}
              >
                OK
              </button>

              {/* Clear Button */}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategories([]);
                  setPendingBusinessTypeFilter("all");
                  setAppliedBusinessTypeFilter("all");
                  setPendingSortBy("all");
                  setAppliedSortBy("all");
                }}
                title="Clear all filters"
                className="w-full sm:w-auto h-10 px-3.5 bg-muted/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-border/80 rounded-2xl text-xs font-bold text-foreground/80 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 shrink-0"
              >
                <RotateCcw className="size-3.5 shrink-0" />
                <span className="truncate">{t('showcase.clear_all' as TranslationKey)}</span>
              </button>
            </div>
          </div>

          {/* Horizontal Line Divider */}
          <div className="h-px bg-border/60 w-full" />

          {/* Bottom Row: 'PROJECT CATEGORY' text label & category pills flex-wrap */}
          <div className="flex flex-col gap-2.5 w-full min-w-0 max-w-full">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest font-mono flex items-center gap-1.5">
                <SlidersHorizontal className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{t('showcase.project_category' as TranslationKey)}</span>
              </span>
            </div>

            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 pt-0.5 w-full max-w-full min-w-0 scroll-smooth select-none theme-filter-scrollbar touch-pan-x -mx-1 px-1">
              {availableCategories.map((cat) => {
                const isActive = cat.id === "all" ? isAllCategoryActive : selectedCategories.includes(cat.id);
                const label = t(cat.translationKey as TranslationKey);
                const colorConfig = CATEGORY_COLOR_MAP[cat.id] || CATEGORY_COLOR_MAP.all;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`h-9 px-3.5 sm:px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer border whitespace-nowrap shrink-0 active:scale-95 ${
                      isActive
                        ? `${colorConfig.active} scale-[1.02]`
                        : `text-foreground/80 bg-muted/30 border-border/80 ${colorConfig.hover}`
                    }`}
                  >
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-8 mb-20 flex-1 space-y-12" aria-label="All Demo Projects" id="all-demos-main">
        {totalResults === 0 ? (
          /* Empty state */
          <div className="text-center py-20 bg-card border border-border rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <Search className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">
              {t('showcase.no_projects')}
            </h3>
            <p className="text-xs text-muted-foreground font-bold">
              {t('showcase.no_projects_desc')}
            </p>
          </div>
        ) : (
          <>
            {/* ── Section 1: Sandbox Demos ───────────────────────────────── */}
            {sandboxDemos.length > 0 && (
              <section aria-label="Sandbox Demos" id="sandbox-demos-section">
                <div className="flex items-center gap-2.5 mb-5">
                  <h2 className="text-xs font-black text-primary uppercase tracking-widest font-mono leading-none m-0 p-0 flex items-center">
                    {t('showcase.sandbox_demos' as any)}
                  </h2>
                  <span className="card-count-badge" id="badge-sandbox-count">
                    <span>{sandboxDemos.length}</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sandboxDemos.map(house => (
                    <DemoCard key={house.id} house={house} t={t} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Section 2: TN Startup Demos ────────────────────────── */}
            {projectDemos.length > 0 && (
              <section aria-label="TN Startup Demos" id="tn-startup-demos-section">
                <div className="flex items-center gap-2.5 mb-5">
                  <h2 className="text-xs font-black text-primary uppercase tracking-widest font-mono leading-none m-0 p-0 flex items-center">
                    {t('showcase.student_projects')}
                  </h2>
                  <span className="card-count-badge" id="badge-projects-count">
                    <span>{projectDemos.length}</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projectDemos.map(house => (
                    <DemoCard key={house.id} house={house} t={t} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
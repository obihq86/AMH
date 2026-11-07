import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { QueueSpotlightCard, SpotlightCard } from './src/components/SpotlightCard';
import { THEMES, TRANSLATIONS } from './src/lib/theme';
import { formatDateToDDMMYYYY, toBengaliDigits, formatBengaliFullDate, formatBengaliHeaderDate } from './src/lib/format';
import { readClinicSnapshot, readClinicState, writeClinicState } from './src/lib/clinicApi';
import { 
  Users, 
  Plus, 
  Minus, 
  PhoneCall, 
  CheckCircle, 
  Clock, 
  Settings, 
  Download, 
  AlertCircle, 
  FileSpreadsheet, 
  RotateCcw, 
  RotateCw,
  SquareSplitVertical,
  SquareSplitHorizontal,
  Calendar, 
  Lock, 
  ChevronDown, 
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Trash2, 
  UserCheck, 
  UserPlus, 
  ShieldCheck, 
  Activity, 
  PhoneForwarded, 
  XCircle, 
  Wifi, 
  LogOut, 
  Palette, 
  Phone, 
  QrCode, 
  Copy, 
  Check, 
  Search, 
  RefreshCw,
  UserX,
  MessageCircle,
  MousePointerClick,
  FileText,
  Save,
  Building2,
  Upload,
  Edit2,
  Tv,
  User,
  Cloud,
  HardDrive,
  ExternalLink,
  Eye,
  EyeOff,
  Type,
  Pencil,
  Square,
  Circle,
  ArrowUpRight,
  ArrowLeft,
  Undo2,
  X,
  Image as ImageIcon,
  Loader2,
  ScanLine,
  Contrast,
  LayoutGrid,
  Hash,
  Sparkles,
  Star,
  Play,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Volume2,
  Link2
} from 'lucide-react';
// Firebase sync was removed. Clinic data sync is handled by Supabase; these stubs keep legacy optional integrations disabled.
const initializeApp = () => ({});
const getAuth = () => null;
const getFirestore = () => null;
const signInAnonymously = async () => { throw new Error('cloud-disabled'); };
const signInWithCustomToken = async () => { throw new Error('cloud-disabled'); };
const onAuthStateChanged = () => () => {};
const GoogleAuthProvider = function () {};
const signInWithPopup = async () => { throw new Error('cloud-disabled'); };
const doc = () => null;
const setDoc = async () => {};
const getDoc = async () => ({ exists: () => false, data: () => null });
const onSnapshot = () => () => {};

// মিনি-প্রিভিউ মোড (টিভি সেটআপ প্যানেলের লাইভ পপআপ iframe): ?mini=1 থাকলে এই ট্যাব localStorage-এ সেশন/ট্যাব লেখে না,
// বরং অন্য ট্যাবের সেটিংস-পরিবর্তন শুনলে ডিবাউন্স করে রিলোড হয় — ফলে প্রিভিউ হুবহু বোর্ড দেখায়।
const IS_MINI_PREVIEW = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mini') === '1';
const GLOBAL_PREVIEW_CSS = `
@font-face {
  font-family: "Hind Siliguri";
  src: url("/fonts/HindSiliguri-Light.ttf") format("truetype");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Hind Siliguri";
  src: url("/fonts/HindSiliguri-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Hind Siliguri";
  src: url("/fonts/HindSiliguri-Medium.ttf") format("truetype");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Hind Siliguri";
  src: url("/fonts/HindSiliguri-SemiBold.ttf") format("truetype");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Hind Siliguri";
  src: url("/fonts/HindSiliguri-Bold.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "SolaimanLipi";
  src: url("/fonts/SolaimanLipi.ttf") format("truetype");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Padmo";
  src: url("/fonts/PadmoUNICODE.ttf") format("truetype");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

/* শুধু ডিজিটের জন্য Padmo (বাংলা ০-৯ + লাতিন 0-9) — বাকি সব গ্লিফ পরের ফ্যামিলিকে যায় */
@font-face {
  font-family: "PadmoDigits";
  src: url("/fonts/PadmoUNICODE.ttf") format("truetype");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+09E6-09EF, U+0030-0039;
}

:root, .font-sans {
  --font-sans: "PadmoDigits", "Hind Siliguri", "Noto Sans Bengali", "Nirmala UI", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-family: "PadmoDigits", "Hind Siliguri", "Noto Sans Bengali", "Nirmala UI", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}

html, body {
  margin: 0;
  min-height: 100%;
  font-family: "PadmoDigits", "Hind Siliguri", "Noto Sans Bengali", "Nirmala UI", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}

/* font-mono (সিরিয়াল/টোকেন/ঘড়ি) এও সংখ্যা Padmo — unicode-range শুধু ডিজিটের জন্য */
.font-mono {
  font-family: "PadmoDigits", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
}

/* ===== টাইল-বক্সের উপরের সংখ্যা (amh-tile-count) — থিম-অনুযায়ী রঙ: লাইট থিমে গাঢ়, ডার্ক থিমে হালকা ===== */
.amh-tile-count { color: #334155; }
:is(.amh-theme-dark-gold,.amh-theme-obsidian,.amh-theme-neon) .amh-tile-count { color: #f1f5f9; }
/* ===== কিউ তারিখ-নেভ (ব্যাকগ্রাউন্ডবিহীন): থিম-অনুযায়ী টেক্সট রঙ ===== */
.amh-queue-date { color: #334155; }
:is(.amh-theme-dark-gold,.amh-theme-obsidian,.amh-theme-neon) .amh-queue-date { color: #f1f5f9; }
/* ===== নেভ আইকনের পেছনে ফ্রস্টেড-গ্লাস টাইল "বেইজ" — প্রতি আইটেমে ভিন্ন রঙ ===== */
.amh-nav-glass{
  position:absolute; left:50%; top:50%; width:52px; height:62px; padding:0; margin:0;
  transform:translate(-50%,-50%); border-radius:16px; z-index:-1; pointer-events:none;
  background:linear-gradient(155deg, rgba(255,255,255,.30) 0%, rgba(255,255,255,.05) 42%, var(--glow-tint) 100%);
  border:1px solid var(--glow-border);
  box-shadow: 0 0 12px 1px var(--glow), inset 0 1px 1px rgba(255,255,255,.55), inset 0 -7px 14px var(--glow-tint);
  backdrop-filter: blur(3px) saturate(120%); -webkit-backdrop-filter: blur(3px) saturate(120%);
  transition: box-shadow 200ms ease, transform 200ms cubic-bezier(0.23,1,0.32,1);
}
.amh-nav-glass.g-violet{ --glow:rgba(139,92,246,.55); --glow-tint:rgba(139,92,246,.16); --glow-border:rgba(196,181,253,.6); }
.amh-nav-glass.g-blue{ --glow:rgba(59,130,246,.55); --glow-tint:rgba(59,130,246,.16); --glow-border:rgba(147,197,253,.6); }
.amh-nav-glass.g-teal{ --glow:rgba(20,184,166,.55); --glow-tint:rgba(20,184,166,.16); --glow-border:rgba(94,234,212,.6); }
.amh-nav-glass.g-amber{ --glow:rgba(245,158,11,.55); --glow-tint:rgba(245,158,11,.16); --glow-border:rgba(252,211,77,.6); }
.amh-nav-glass.g-rose{ --glow:rgba(244,63,94,.55); --glow-tint:rgba(244,63,94,.16); --glow-border:rgba(251,207,232,.6); }
.amh-nav-glass.g-lime{ --glow:rgba(132,204,22,.55); --glow-tint:rgba(132,204,22,.16); --glow-border:rgba(190,242,100,.6); }
.amh-nav-glass.g-sky{ --glow:rgba(14,165,233,.55); --glow-tint:rgba(14,165,233,.16); --glow-border:rgba(125,211,252,.6); }
@media (max-width: 639px){ .amh-nav-glass{ width:58px; height:58px; border-radius:18px; } }
/* ===== TV-1 বোর্ড: সব ফন্ট সাদা, আউটলাইনবিহীন (শুধু TV-1; TV-2/3/4 প্রযোজ্য নয়) ===== */
.amh-tv1-board, .amh-tv1-board * { color: #ffffff !important; }
/* ===== TV-1: সব প্যানেলের হেডার ৩০px; inside প্যানেলের হেডারও মাঝখানে ===== */
.amh-tv1-board [data-el="header"] { font-size: 30px !important; }
/* ===== TV-1: "জন" চিপ (অনুপস্থিত/১০-তালিকা/ভিতরে) — বেস তুলে, Padmo ফন্টে, হেডারের পাশে () ভিতরে ===== */
.amh-tv1-board [data-el="header"] + span { font-size: 30px !important; background: transparent !important; border: none !important; padding: 0 !important; border-radius: 0 !important; font-family: 'Padmo', 'SolaimanLipi', 'Hind Siliguri', sans-serif !important; }
.amh-tv1-board [data-el="header"] + span::before { content: "("; }
.amh-tv1-board [data-el="header"] + span::after { content: ")"; }
.amh-tv1-board .amh-tv-inside-hr { justify-content: center; }
/* ===== TV-1: "পরবর্তী রোগী" বাদে ৪ প্যানেলে টোকেন/বয়স/সম্ভাব্য ডাক ৩০px ===== */
.amh-tv1-board [data-tp="called"] [data-el="token"],
.amh-tv1-board [data-tp="called"] [data-el="age"],
.amh-tv1-board [data-tp="inside"] [data-el="age"] { font-size: 20px !important; }
@media (min-width: 1024px) {
  .amh-tv1-board [data-tp="called"] [data-el="token"],
  .amh-tv1-board [data-tp="called"] [data-el="age"],
  .amh-tv1-board [data-tp="inside"] [data-el="age"],
  .amh-tv1-board [data-tp="next"] [data-el="age"] { font-size: 22px !important; }
}
.amh-tv1-board [data-tp="inside"] [data-el="token"] { font-size: 30px !important; }
.amh-tv1-board [data-tp="absent"] [data-el="token"] { font-size: 28px !important; }
.amh-tv1-board [data-tp]:not([data-tp="next"]) [data-el="call"] { font-size: 30px !important; }
.amh-tv1-board [data-el="call"] { text-align: right !important; }
/* ===== TV-1 inside প্যানেল: টোকেন/নাম/বয়স সমান (৩০px) ===== */
.amh-tv1-board [data-tp="inside"] [data-el="name"] { font-size: 30px !important; }
/* ===== TV-1 তালিকা (tenList) প্যানেল — আলাদা ছোট মাপ (শুধু এই প্যানেল) ===== */
.amh-tv1-board [data-tp="tenList"] [data-el="header"] { font-size: 30px !important; }
.amh-tv1-board [data-tp="tenList"] [data-el="header"] + span { font-size: 30px !important; }
.amh-tv1-board [data-tp="tenList"] [data-el="sub"] [data-el="token"] { font-size: 20px !important; }
.amh-tv1-board [data-tp="tenList"] [data-el="sub"] [data-el="age"] { font-size: 20px !important; }
.amh-tv1-board [data-tp="tenList"] [data-el="sub"] [data-el="call"] { font-size: 20px !important; }
.amh-tv1-board [data-tp="tenList"] [data-el="sub"] .rounded-full { font-size: 20px !important; }
/* ===== TV-1 তালিকা প্যানেল: রোগীর নাম + সম্ভাব্য ডাক রঙ #00ffff (সাদা নিয়মকে ছাপিয়ে) ===== */
.amh-tv1-board [data-tp="tenList"] [data-el="name"],
.amh-tv1-board [data-tp="tenList"] [data-el="call"] { color: #00ffff !important; }

/* ===== DARK GOLD LUXE থিম — সব বক্স/প্যানেল/সাব-প্যানেল ডার্ক + সোনালি ট্রিম। শুধু এই থিমের রুটে (amh-theme-dark-gold) প্রযোজ্য ===== */
/* (ক) সব হালকা টিন্ট ব্যাকগ্রাউন্ড (50/100/200) + slate/gray 300 → ডার্ক প্যানেল */
.amh-theme-dark-gold .bg-white { background-color: #16151B !important; }
.amh-theme-dark-gold .bg-slate-50, .amh-theme-dark-gold .bg-slate-100, .amh-theme-dark-gold .bg-slate-200, .amh-theme-dark-gold .bg-slate-300, .amh-theme-dark-gold .bg-gray-50, .amh-theme-dark-gold .bg-gray-100, .amh-theme-dark-gold .bg-gray-200, .amh-theme-dark-gold .bg-gray-300, .amh-theme-dark-gold .bg-zinc-50, .amh-theme-dark-gold .bg-zinc-100, .amh-theme-dark-gold .bg-zinc-200, .amh-theme-dark-gold .bg-neutral-50, .amh-theme-dark-gold .bg-neutral-100, .amh-theme-dark-gold .bg-neutral-200, .amh-theme-dark-gold .bg-stone-50, .amh-theme-dark-gold .bg-stone-100, .amh-theme-dark-gold .bg-stone-200 { background-color: #1A1920 !important; }
.amh-theme-dark-gold .bg-emerald-50, .amh-theme-dark-gold .bg-emerald-100, .amh-theme-dark-gold .bg-emerald-200, .amh-theme-dark-gold .bg-green-50, .amh-theme-dark-gold .bg-green-100, .amh-theme-dark-gold .bg-green-200, .amh-theme-dark-gold .bg-teal-50, .amh-theme-dark-gold .bg-teal-100, .amh-theme-dark-gold .bg-teal-200, .amh-theme-dark-gold .bg-cyan-50, .amh-theme-dark-gold .bg-cyan-100, .amh-theme-dark-gold .bg-cyan-200, .amh-theme-dark-gold .bg-sky-50, .amh-theme-dark-gold .bg-sky-100, .amh-theme-dark-gold .bg-sky-200, .amh-theme-dark-gold .bg-blue-50, .amh-theme-dark-gold .bg-blue-100, .amh-theme-dark-gold .bg-blue-200, .amh-theme-dark-gold .bg-indigo-50, .amh-theme-dark-gold .bg-indigo-100, .amh-theme-dark-gold .bg-indigo-200, .amh-theme-dark-gold .bg-violet-50, .amh-theme-dark-gold .bg-violet-100, .amh-theme-dark-gold .bg-violet-200, .amh-theme-dark-gold .bg-purple-50, .amh-theme-dark-gold .bg-purple-100, .amh-theme-dark-gold .bg-purple-200, .amh-theme-dark-gold .bg-fuchsia-50, .amh-theme-dark-gold .bg-fuchsia-100, .amh-theme-dark-gold .bg-fuchsia-200, .amh-theme-dark-gold .bg-pink-50, .amh-theme-dark-gold .bg-pink-100, .amh-theme-dark-gold .bg-pink-200, .amh-theme-dark-gold .bg-rose-50, .amh-theme-dark-gold .bg-rose-100, .amh-theme-dark-gold .bg-rose-200, .amh-theme-dark-gold .bg-red-50, .amh-theme-dark-gold .bg-red-100, .amh-theme-dark-gold .bg-red-200, .amh-theme-dark-gold .bg-orange-50, .amh-theme-dark-gold .bg-orange-100, .amh-theme-dark-gold .bg-orange-200, .amh-theme-dark-gold .bg-amber-50, .amh-theme-dark-gold .bg-amber-100, .amh-theme-dark-gold .bg-amber-200, .amh-theme-dark-gold .bg-yellow-50, .amh-theme-dark-gold .bg-yellow-100, .amh-theme-dark-gold .bg-yellow-200, .amh-theme-dark-gold .bg-lime-50, .amh-theme-dark-gold .bg-lime-100, .amh-theme-dark-gold .bg-lime-200 { background-color: #1A1920 !important; }
/* (খ) slate টেক্সট → ক্রিম */
.amh-theme-dark-gold .text-slate-950, .amh-theme-dark-gold .text-slate-900, .amh-theme-dark-gold .text-slate-800 { color: #ECE5D6 !important; }
.amh-theme-dark-gold .text-slate-700, .amh-theme-dark-gold .text-slate-600 { color: #D6CDB8 !important; }
.amh-theme-dark-gold .text-slate-500, .amh-theme-dark-gold .text-slate-400 { color: #B9AF98 !important; }
/* (গ) রঙিন টেক্সট (500-950) → ওই রঙের হালকা টিন্ট (অর্থ রক্ষা + পঠনযোগ্য) */
.amh-theme-dark-gold .text-emerald-500, .amh-theme-dark-gold .text-emerald-600, .amh-theme-dark-gold .text-emerald-700, .amh-theme-dark-gold .text-emerald-800, .amh-theme-dark-gold .text-emerald-900, .amh-theme-dark-gold .text-emerald-950 { color: #6ee7b7 !important; }
.amh-theme-dark-gold .text-green-500, .amh-theme-dark-gold .text-green-600, .amh-theme-dark-gold .text-green-700, .amh-theme-dark-gold .text-green-800, .amh-theme-dark-gold .text-green-900, .amh-theme-dark-gold .text-green-950 { color: #86efac !important; }
.amh-theme-dark-gold .text-teal-500, .amh-theme-dark-gold .text-teal-600, .amh-theme-dark-gold .text-teal-700, .amh-theme-dark-gold .text-teal-800, .amh-theme-dark-gold .text-teal-900, .amh-theme-dark-gold .text-teal-950 { color: #5eead4 !important; }
.amh-theme-dark-gold .text-cyan-500, .amh-theme-dark-gold .text-cyan-600, .amh-theme-dark-gold .text-cyan-700, .amh-theme-dark-gold .text-cyan-800, .amh-theme-dark-gold .text-cyan-900, .amh-theme-dark-gold .text-cyan-950 { color: #67e8f9 !important; }
.amh-theme-dark-gold .text-sky-500, .amh-theme-dark-gold .text-sky-600, .amh-theme-dark-gold .text-sky-700, .amh-theme-dark-gold .text-sky-800, .amh-theme-dark-gold .text-sky-900, .amh-theme-dark-gold .text-sky-950 { color: #7dd3fc !important; }
.amh-theme-dark-gold .text-blue-500, .amh-theme-dark-gold .text-blue-600, .amh-theme-dark-gold .text-blue-700, .amh-theme-dark-gold .text-blue-800, .amh-theme-dark-gold .text-blue-900, .amh-theme-dark-gold .text-blue-950 { color: #93c5fd !important; }
.amh-theme-dark-gold .text-indigo-500, .amh-theme-dark-gold .text-indigo-600, .amh-theme-dark-gold .text-indigo-700, .amh-theme-dark-gold .text-indigo-800, .amh-theme-dark-gold .text-indigo-900, .amh-theme-dark-gold .text-indigo-950 { color: #a5b4fc !important; }
.amh-theme-dark-gold .text-violet-500, .amh-theme-dark-gold .text-violet-600, .amh-theme-dark-gold .text-violet-700, .amh-theme-dark-gold .text-violet-800, .amh-theme-dark-gold .text-violet-900, .amh-theme-dark-gold .text-violet-950 { color: #c4b5fd !important; }
.amh-theme-dark-gold .text-purple-500, .amh-theme-dark-gold .text-purple-600, .amh-theme-dark-gold .text-purple-700, .amh-theme-dark-gold .text-purple-800, .amh-theme-dark-gold .text-purple-900, .amh-theme-dark-gold .text-purple-950 { color: #d8b4fe !important; }
.amh-theme-dark-gold .text-fuchsia-500, .amh-theme-dark-gold .text-fuchsia-600, .amh-theme-dark-gold .text-fuchsia-700, .amh-theme-dark-gold .text-fuchsia-800, .amh-theme-dark-gold .text-fuchsia-900, .amh-theme-dark-gold .text-fuchsia-950 { color: #f0abfc !important; }
.amh-theme-dark-gold .text-pink-500, .amh-theme-dark-gold .text-pink-600, .amh-theme-dark-gold .text-pink-700, .amh-theme-dark-gold .text-pink-800, .amh-theme-dark-gold .text-pink-900, .amh-theme-dark-gold .text-pink-950 { color: #f9a8d4 !important; }
.amh-theme-dark-gold .text-rose-500, .amh-theme-dark-gold .text-rose-600, .amh-theme-dark-gold .text-rose-700, .amh-theme-dark-gold .text-rose-800, .amh-theme-dark-gold .text-rose-900, .amh-theme-dark-gold .text-rose-950 { color: #fda4af !important; }
.amh-theme-dark-gold .text-red-500, .amh-theme-dark-gold .text-red-600, .amh-theme-dark-gold .text-red-700, .amh-theme-dark-gold .text-red-800, .amh-theme-dark-gold .text-red-900, .amh-theme-dark-gold .text-red-950 { color: #fca5a5 !important; }
.amh-theme-dark-gold .text-orange-500, .amh-theme-dark-gold .text-orange-600, .amh-theme-dark-gold .text-orange-700, .amh-theme-dark-gold .text-orange-800, .amh-theme-dark-gold .text-orange-900, .amh-theme-dark-gold .text-orange-950 { color: #fdba74 !important; }
.amh-theme-dark-gold .text-amber-500, .amh-theme-dark-gold .text-amber-600, .amh-theme-dark-gold .text-amber-700, .amh-theme-dark-gold .text-amber-800, .amh-theme-dark-gold .text-amber-900, .amh-theme-dark-gold .text-amber-950 { color: #fcd34d !important; }
.amh-theme-dark-gold .text-yellow-500, .amh-theme-dark-gold .text-yellow-600, .amh-theme-dark-gold .text-yellow-700, .amh-theme-dark-gold .text-yellow-800, .amh-theme-dark-gold .text-yellow-900, .amh-theme-dark-gold .text-yellow-950 { color: #fde047 !important; }
.amh-theme-dark-gold .text-lime-500, .amh-theme-dark-gold .text-lime-600, .amh-theme-dark-gold .text-lime-700, .amh-theme-dark-gold .text-lime-800, .amh-theme-dark-gold .text-lime-900, .amh-theme-dark-gold .text-lime-950 { color: #bef264 !important; }
/* (ঘ) সব border টিন্ট → সোনালি */
.amh-theme-dark-gold [class*="border-slate-"], .amh-theme-dark-gold [class*="border-gray-"], .amh-theme-dark-gold [class*="border-zinc-"], .amh-theme-dark-gold [class*="border-neutral-"], .amh-theme-dark-gold [class*="border-stone-"], .amh-theme-dark-gold [class*="border-red-"], .amh-theme-dark-gold [class*="border-orange-"], .amh-theme-dark-gold [class*="border-amber-"], .amh-theme-dark-gold [class*="border-yellow-"], .amh-theme-dark-gold [class*="border-lime-"], .amh-theme-dark-gold [class*="border-green-"], .amh-theme-dark-gold [class*="border-emerald-"], .amh-theme-dark-gold [class*="border-teal-"], .amh-theme-dark-gold [class*="border-cyan-"], .amh-theme-dark-gold [class*="border-sky-"], .amh-theme-dark-gold [class*="border-blue-"], .amh-theme-dark-gold [class*="border-indigo-"], .amh-theme-dark-gold [class*="border-violet-"], .amh-theme-dark-gold [class*="border-purple-"], .amh-theme-dark-gold [class*="border-fuchsia-"], .amh-theme-dark-gold [class*="border-pink-"], .amh-theme-dark-gold [class*="border-rose-"] { border-color: rgba(232,185,58,0.24) !important; }
.amh-theme-dark-gold [class*="divide-slate-"] > *, .amh-theme-dark-gold [class*="divide-gray-"] > *, .amh-theme-dark-gold [class*="divide-emerald-"] > *, .amh-theme-dark-gold [class*="divide-rose-"] > *, .amh-theme-dark-gold [class*="divide-amber-"] > *, .amh-theme-dark-gold [class*="divide-teal-"] > * { border-color: rgba(232,185,58,0.16) !important; }
/* (ঙ) ব্র্যান্ড সবুজ solid বাটন → সোনালি (primary ভাষা) */
.amh-theme-dark-gold .bg-emerald-400, .amh-theme-dark-gold .bg-emerald-500, .amh-theme-dark-gold .bg-emerald-600, .amh-theme-dark-gold .bg-emerald-700, .amh-theme-dark-gold .bg-green-500, .amh-theme-dark-gold .bg-green-600, .amh-theme-dark-gold .bg-green-700, .amh-theme-dark-gold .bg-teal-500, .amh-theme-dark-gold .bg-teal-600, .amh-theme-dark-gold .bg-teal-700, .amh-theme-dark-gold .bg-cyan-500, .amh-theme-dark-gold .bg-cyan-600, .amh-theme-dark-gold .bg-cyan-700 { background-color: #C8901C !important; }
.amh-theme-dark-gold .hover\:bg-emerald-500:hover, .amh-theme-dark-gold .hover\:bg-emerald-600:hover, .amh-theme-dark-gold .hover\:bg-emerald-700:hover, .amh-theme-dark-gold .hover\:bg-teal-600:hover, .amh-theme-dark-gold .hover\:bg-teal-700:hover, .amh-theme-dark-gold .hover\:bg-green-600:hover { background-color: #A8760F !important; }
/* (চ) সবুজ gradient ধাপ → সোনালি gradient */
.amh-theme-dark-gold [class*="from-emerald"], .amh-theme-dark-gold [class*="from-teal"], .amh-theme-dark-gold [class*="from-green"], .amh-theme-dark-gold [class*="from-cyan"] { --tw-gradient-from: #C8901C var(--tw-gradient-from-position) !important; }
.amh-theme-dark-gold [class*="via-emerald"], .amh-theme-dark-gold [class*="via-teal"], .amh-theme-dark-gold [class*="via-green"], .amh-theme-dark-gold [class*="via-cyan"] { --tw-gradient-via: #A8760F var(--tw-gradient-via-position) !important; }
.amh-theme-dark-gold [class*="to-emerald"], .amh-theme-dark-gold [class*="to-teal"], .amh-theme-dark-gold [class*="to-green"], .amh-theme-dark-gold [class*="to-cyan"] { --tw-gradient-to: #C8901C var(--tw-gradient-to-position) !important; }
/* (ছ) placeholder + ring */
.amh-theme-dark-gold .placeholder-slate-400::placeholder, .amh-theme-dark-gold .placeholder-slate-500::placeholder, .amh-theme-dark-gold .placeholder-slate-300::placeholder { color: #8A7E5E !important; }
.amh-theme-dark-gold [class*="ring-slate-"], .amh-theme-dark-gold [class*="ring-emerald-"], .amh-theme-dark-gold [class*="ring-teal-"] { --tw-ring-color: rgba(232,185,58,0.30) !important; }
/* (ট) opacity-ভ্যারিয়েন্ট হালকা টিন্ট বক্স + light-tint gradient ধাপ (50/100/200) → ডার্ক। solid রঙিন (600-900) স্পষ্টত বাদ → সেমান্টিক বাটন থাকে */
.amh-theme-dark-gold [class*="bg-rose-50/"], .amh-theme-dark-gold [class*="bg-rose-100/"], .amh-theme-dark-gold [class*="bg-rose-200/"], .amh-theme-dark-gold [class*="bg-amber-50/"], .amh-theme-dark-gold [class*="bg-amber-100/"], .amh-theme-dark-gold [class*="bg-amber-200/"], .amh-theme-dark-gold [class*="bg-emerald-50/"], .amh-theme-dark-gold [class*="bg-emerald-100/"], .amh-theme-dark-gold [class*="bg-emerald-200/"], .amh-theme-dark-gold [class*="bg-green-50/"], .amh-theme-dark-gold [class*="bg-green-100/"], .amh-theme-dark-gold [class*="bg-teal-50/"], .amh-theme-dark-gold [class*="bg-teal-100/"], .amh-theme-dark-gold [class*="bg-cyan-50/"], .amh-theme-dark-gold [class*="bg-cyan-100/"], .amh-theme-dark-gold [class*="bg-sky-50/"], .amh-theme-dark-gold [class*="bg-sky-100/"], .amh-theme-dark-gold [class*="bg-blue-50/"], .amh-theme-dark-gold [class*="bg-blue-100/"], .amh-theme-dark-gold [class*="bg-blue-200/"], .amh-theme-dark-gold [class*="bg-indigo-50/"], .amh-theme-dark-gold [class*="bg-indigo-100/"], .amh-theme-dark-gold [class*="bg-purple-50/"], .amh-theme-dark-gold [class*="bg-purple-100/"], .amh-theme-dark-gold [class*="bg-purple-200/"], .amh-theme-dark-gold [class*="bg-violet-50/"], .amh-theme-dark-gold [class*="bg-violet-100/"], .amh-theme-dark-gold [class*="bg-fuchsia-50/"], .amh-theme-dark-gold [class*="bg-pink-50/"], .amh-theme-dark-gold [class*="bg-pink-100/"], .amh-theme-dark-gold [class*="bg-red-50/"], .amh-theme-dark-gold [class*="bg-red-100/"], .amh-theme-dark-gold [class*="bg-orange-50/"], .amh-theme-dark-gold [class*="bg-yellow-50/"], .amh-theme-dark-gold [class*="bg-lime-50/"], .amh-theme-dark-gold [class*="bg-slate-50/"], .amh-theme-dark-gold [class*="bg-slate-100/"], .amh-theme-dark-gold [class*="bg-slate-200/"], .amh-theme-dark-gold [class*="bg-slate-300/"], .amh-theme-dark-gold [class*="bg-gray-50/"], .amh-theme-dark-gold [class*="bg-gray-100/"], .amh-theme-dark-gold [class*="bg-gray-200/"], .amh-theme-dark-gold [class*="bg-white/6"], .amh-theme-dark-gold [class*="bg-white/7"], .amh-theme-dark-gold [class*="bg-white/8"], .amh-theme-dark-gold [class*="bg-white/9"] { background-color: #1A1920 !important; }
.amh-theme-dark-gold :is([class*="from-blue-50"], [class*="from-blue-100"], [class*="from-blue-200"], [class*="from-indigo-50"], [class*="from-indigo-100"], [class*="from-indigo-200"], [class*="from-sky-50"], [class*="from-sky-100"], [class*="from-purple-50"], [class*="from-purple-100"], [class*="from-purple-200"], [class*="from-violet-50"], [class*="from-violet-100"], [class*="from-fuchsia-50"], [class*="from-pink-50"], [class*="from-pink-100"], [class*="from-rose-50"], [class*="from-rose-100"], [class*="from-rose-200"], [class*="from-red-50"], [class*="from-red-100"], [class*="from-orange-50"], [class*="from-amber-50"], [class*="from-amber-100"], [class*="from-amber-200"], [class*="from-yellow-50"], [class*="from-lime-50"], [class*="from-green-50"], [class*="from-green-100"], [class*="from-teal-50"], [class*="from-teal-100"], [class*="from-cyan-50"], [class*="from-cyan-100"], [class*="from-emerald-50"], [class*="from-emerald-100"], [class*="from-emerald-200"], [class*="from-slate-50"], [class*="from-slate-100"], [class*="from-slate-200"], [class*="from-gray-50"], [class*="from-gray-100"], [class*="from-white"], [class*="via-blue-50"], [class*="via-blue-100"], [class*="via-blue-200"], [class*="via-indigo-50"], [class*="via-indigo-100"], [class*="via-indigo-200"], [class*="via-sky-50"], [class*="via-sky-100"], [class*="via-purple-50"], [class*="via-purple-100"], [class*="via-purple-200"], [class*="via-violet-50"], [class*="via-violet-100"], [class*="via-fuchsia-50"], [class*="via-pink-50"], [class*="via-pink-100"], [class*="via-rose-50"], [class*="via-rose-100"], [class*="via-rose-200"], [class*="via-red-50"], [class*="via-red-100"], [class*="via-orange-50"], [class*="via-amber-50"], [class*="via-amber-100"], [class*="via-amber-200"], [class*="via-yellow-50"], [class*="via-lime-50"], [class*="via-green-50"], [class*="via-green-100"], [class*="via-teal-50"], [class*="via-teal-100"], [class*="via-cyan-50"], [class*="via-cyan-100"], [class*="via-emerald-50"], [class*="via-emerald-100"], [class*="via-emerald-200"], [class*="via-slate-50"], [class*="via-slate-100"], [class*="via-slate-200"], [class*="via-gray-50"], [class*="via-gray-100"], [class*="via-white"], [class*="to-blue-50"], [class*="to-blue-100"], [class*="to-blue-200"], [class*="to-indigo-50"], [class*="to-indigo-100"], [class*="to-indigo-200"], [class*="to-sky-50"], [class*="to-sky-100"], [class*="to-purple-50"], [class*="to-purple-100"], [class*="to-purple-200"], [class*="to-violet-50"], [class*="to-violet-100"], [class*="to-fuchsia-50"], [class*="to-pink-50"], [class*="to-pink-100"], [class*="to-rose-50"], [class*="to-rose-100"], [class*="to-rose-200"], [class*="to-red-50"], [class*="to-red-100"], [class*="to-orange-50"], [class*="to-amber-50"], [class*="to-amber-100"], [class*="to-amber-200"], [class*="to-yellow-50"], [class*="to-lime-50"], [class*="to-green-50"], [class*="to-green-100"], [class*="to-teal-50"], [class*="to-teal-100"], [class*="to-cyan-50"], [class*="to-cyan-100"], [class*="to-emerald-50"], [class*="to-emerald-100"], [class*="to-emerald-200"], [class*="to-slate-50"], [class*="to-slate-100"], [class*="to-slate-200"], [class*="to-gray-50"], [class*="to-gray-100"], [class*="to-white"]) { --tw-gradient-from: #1A1920 var(--tw-gradient-from-position) !important; --tw-gradient-via: #1A1920 var(--tw-gradient-via-position) !important; --tw-gradient-to: #1A1920 var(--tw-gradient-to-position) !important; }
/* (ঠ) SpotlightCard / queue-card custom ক্লাসের হালকা surface ও ধূসর glow → ডার্ক + সোনালি */
.amh-theme-dark-gold .spotlight-card { background: rgba(232,185,58,0.30) !important; }
.amh-theme-dark-gold .spotlight-card--sub { background: rgba(232,185,58,0.22) !important; }
.amh-theme-dark-gold .spotlight-card::before { background: #E8B93A !important; }
.amh-theme-dark-gold .spotlight-card__surface { background: #15141A !important; }
.amh-theme-dark-gold .spotlight-card--sub > .spotlight-card__surface { background: #1A1920 !important; }
.amh-theme-dark-gold .queue-spotlight-card { background: rgba(232,185,58,0.22) !important; }
.amh-theme-dark-gold .queue-spotlight-card::before { background: radial-gradient(110px circle at var(--mouse-x) var(--mouse-y), #E8B93A 0%, rgba(232,185,58,0.5) 45%, transparent 100%) !important; }
.amh-theme-dark-gold .amh-gold-marked {
  color: #17120A !important;
  background-color: #D4AF37 !important;
  background-image: linear-gradient(112deg, #8A641C 0%, #B8860B 14%, #E8CA68 29%, #FFF4C2 38%, #D4AF37 49%, #F8E7A0 61%, #A87812 77%, #E8CA68 90%, #8A641C 100%) !important;
  border-color: #E8CA68 !important;
  box-shadow: 0 2px 8px rgba(212,175,55,0.22), inset 0 1px 0 rgba(255,249,220,0.72), inset 0 -2px 3px rgba(72,48,8,0.28) !important;
}
.amh-theme-dark-gold .amh-gold-marked:hover {
  background-image: linear-gradient(112deg, #76500D 0%, #A87812 14%, #E8CA68 29%, #FFF8D9 38%, #C9A12B 49%, #F4D675 61%, #8A641C 77%, #D4AF37 90%, #76500D 100%) !important;
}
.amh-theme-dark-gold .amh-gold-marked:disabled { opacity: 0.55; }
.amh-theme-dark-gold .amh-gold-marked:focus-visible { outline: 2px solid #FFF0A6; outline-offset: 2px; }
.amh-theme-dark-gold .amh-gold-marked * { color: #17120A !important; }
.amh-theme-dark-gold .amh-gold-marked-thumb { background-color: #17120A !important; }

/* ===== OBSIDIAN NEUMORPHIC + NEON GLASS — দুটি নতুন ডার্ক থিমের স্কোপড override। প্রতিটি selector আলাদাভাবে :is(...) দিয়ে স্কোপড (comma-selector লিক প্রতিরোধ)। অ্যাকসেন্ট রঙ ভ্যারিয়েবল দিয়ে থিমভেদে আলাদা ===== */
.amh-theme-obsidian { --amh-panel:#1e1e29; --amh-panel2:#1a1a22; --amh-border:rgba(139,124,246,0.26); --amh-accent-solid:#7c6cf0; --amh-accent-hover:#6d5ce0; --amh-grad-from:#7c6cf0; --amh-grad-via:#6d5ce0; --amh-grad-to:#9a8bff; --amh-glow:rgba(139,124,246,0.30); --amh-ring:rgba(139,124,246,0.40); --amh-text-hi:#f3f4fa; --amh-text-mid:#c7c9d6; --amh-text-mut:#9a9cb0; --amh-placeholder:#6b6e80; }
.amh-theme-neon { --amh-panel:#12141d; --amh-panel2:#0d0f16; --amh-border:rgba(96,165,250,0.26); --amh-accent-solid:#2f6fe0; --amh-accent-hover:#2358c0; --amh-grad-from:#3b82f6; --amh-grad-via:#6366f1; --amh-grad-to:#8b5cf6; --amh-glow:rgba(59,130,246,0.30); --amh-ring:rgba(99,102,241,0.40); --amh-text-hi:#eef1fb; --amh-text-mid:#c2c8dc; --amh-text-mut:#8f97b3; --amh-placeholder:#5b6478; }
/* (ক) হালকা টিন্ট ব্যাকগ্রাউন্ড → ডার্ক প্যানেল */
:is(.amh-theme-obsidian, .amh-theme-neon) .bg-white { background-color: var(--amh-panel2) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .bg-slate-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-slate-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-slate-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-slate-300, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-gray-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-gray-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-gray-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-gray-300, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-zinc-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-zinc-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-zinc-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-neutral-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-neutral-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-neutral-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-stone-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-stone-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-stone-200 { background-color: var(--amh-panel) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .bg-emerald-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-emerald-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-emerald-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-green-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-green-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-green-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-teal-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-teal-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-teal-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-cyan-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-cyan-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-cyan-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-sky-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-sky-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-sky-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-blue-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-blue-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-blue-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-indigo-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-indigo-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-indigo-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-violet-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-violet-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-violet-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-purple-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-purple-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-purple-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-fuchsia-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-fuchsia-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-fuchsia-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-pink-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-pink-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-pink-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-rose-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-rose-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-rose-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-red-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-red-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-red-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-orange-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-orange-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-orange-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-amber-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-amber-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-amber-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-yellow-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-yellow-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-yellow-200, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-lime-50, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-lime-100, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-lime-200 { background-color: var(--amh-panel) !important; }
/* (খ) slate টেক্সট → হালকা */
:is(.amh-theme-obsidian, .amh-theme-neon) .text-slate-950, :is(.amh-theme-obsidian, .amh-theme-neon) .text-slate-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-slate-800 { color: var(--amh-text-hi) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-slate-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-slate-600 { color: var(--amh-text-mid) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-slate-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-slate-400 { color: var(--amh-text-mut) !important; }
/* (গ) রঙিন টেক্সট (500-950) → হালকা টিন্ট */
:is(.amh-theme-obsidian, .amh-theme-neon) .text-emerald-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-emerald-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-emerald-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-emerald-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-emerald-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-emerald-950 { color: #6ee7b7 !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-green-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-green-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-green-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-green-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-green-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-green-950 { color: #86efac !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-teal-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-teal-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-teal-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-teal-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-teal-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-teal-950 { color: #5eead4 !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-cyan-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-cyan-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-cyan-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-cyan-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-cyan-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-cyan-950 { color: #67e8f9 !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-sky-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-sky-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-sky-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-sky-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-sky-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-sky-950 { color: #7dd3fc !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-blue-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-blue-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-blue-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-blue-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-blue-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-blue-950 { color: #93c5fd !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-indigo-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-indigo-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-indigo-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-indigo-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-indigo-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-indigo-950 { color: #a5b4fc !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-violet-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-violet-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-violet-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-violet-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-violet-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-violet-950 { color: #c4b5fd !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-purple-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-purple-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-purple-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-purple-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-purple-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-purple-950 { color: #d8b4fe !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-fuchsia-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-fuchsia-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-fuchsia-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-fuchsia-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-fuchsia-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-fuchsia-950 { color: #f0abfc !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-pink-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-pink-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-pink-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-pink-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-pink-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-pink-950 { color: #f9a8d4 !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-rose-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-rose-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-rose-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-rose-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-rose-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-rose-950 { color: #fda4af !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-red-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-red-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-red-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-red-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-red-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-red-950 { color: #fca5a5 !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-orange-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-orange-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-orange-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-orange-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-orange-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-orange-950 { color: #fdba74 !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-amber-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-amber-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-amber-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-amber-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-amber-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-amber-950 { color: #fcd34d !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-yellow-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-yellow-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-yellow-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-yellow-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-yellow-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-yellow-950 { color: #fde047 !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .text-lime-500, :is(.amh-theme-obsidian, .amh-theme-neon) .text-lime-600, :is(.amh-theme-obsidian, .amh-theme-neon) .text-lime-700, :is(.amh-theme-obsidian, .amh-theme-neon) .text-lime-800, :is(.amh-theme-obsidian, .amh-theme-neon) .text-lime-900, :is(.amh-theme-obsidian, .amh-theme-neon) .text-lime-950 { color: #bef264 !important; }
/* (ঘ) সব border টিন্ট → অ্যাকসেন্ট */
:is(.amh-theme-obsidian, .amh-theme-neon) :is([class*="border-slate-"], [class*="border-gray-"], [class*="border-zinc-"], [class*="border-neutral-"], [class*="border-stone-"], [class*="border-red-"], [class*="border-orange-"], [class*="border-amber-"], [class*="border-yellow-"], [class*="border-lime-"], [class*="border-green-"], [class*="border-emerald-"], [class*="border-teal-"], [class*="border-cyan-"], [class*="border-sky-"], [class*="border-blue-"], [class*="border-indigo-"], [class*="border-violet-"], [class*="border-purple-"], [class*="border-fuchsia-"], [class*="border-pink-"], [class*="border-rose-"]) { border-color: var(--amh-border) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) :is([class*="divide-slate-"], [class*="divide-gray-"], [class*="divide-emerald-"], [class*="divide-rose-"], [class*="divide-amber-"], [class*="divide-teal-"]) > * { border-color: var(--amh-border) !important; }
/* (ঙ) ব্র্যান্ড সবুজ solid → অ্যাকসেন্ট */
:is(.amh-theme-obsidian, .amh-theme-neon) .bg-emerald-400, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-emerald-500, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-emerald-600, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-emerald-700, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-green-500, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-green-600, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-green-700, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-teal-500, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-teal-600, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-teal-700, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-cyan-500, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-cyan-600, :is(.amh-theme-obsidian, .amh-theme-neon) .bg-cyan-700 { background-color: var(--amh-accent-solid) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .hover\:bg-emerald-500:hover, :is(.amh-theme-obsidian, .amh-theme-neon) .hover\:bg-emerald-600:hover, :is(.amh-theme-obsidian, .amh-theme-neon) .hover\:bg-emerald-700:hover, :is(.amh-theme-obsidian, .amh-theme-neon) .hover\:bg-teal-600:hover, :is(.amh-theme-obsidian, .amh-theme-neon) .hover\:bg-teal-700:hover, :is(.amh-theme-obsidian, .amh-theme-neon) .hover\:bg-green-600:hover { background-color: var(--amh-accent-hover) !important; }
/* (চ) সবুজ gradient → অ্যাকসেন্ট gradient */
:is(.amh-theme-obsidian, .amh-theme-neon) :is([class*="from-emerald"], [class*="from-teal"], [class*="from-green"], [class*="from-cyan"]) { --tw-gradient-from: var(--amh-grad-from) var(--tw-gradient-from-position) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) :is([class*="via-emerald"], [class*="via-teal"], [class*="via-green"], [class*="via-cyan"]) { --tw-gradient-via: var(--amh-grad-via) var(--tw-gradient-via-position) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) :is([class*="to-emerald"], [class*="to-teal"], [class*="to-green"], [class*="to-cyan"]) { --tw-gradient-to: var(--amh-grad-to) var(--tw-gradient-to-position) !important; }
/* (ছ) placeholder + ring */
:is(.amh-theme-obsidian, .amh-theme-neon) .placeholder-slate-400::placeholder, :is(.amh-theme-obsidian, .amh-theme-neon) .placeholder-slate-500::placeholder, :is(.amh-theme-obsidian, .amh-theme-neon) .placeholder-slate-300::placeholder { color: var(--amh-placeholder) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) :is([class*="ring-slate-"], [class*="ring-emerald-"], [class*="ring-teal-"]) { --tw-ring-color: var(--amh-ring) !important; }
/* (ট) opacity টিন্ট বক্স + light-tint gradient → ডার্ক */
:is(.amh-theme-obsidian, .amh-theme-neon) :is([class*="bg-rose-50/"], [class*="bg-rose-100/"], [class*="bg-rose-200/"], [class*="bg-amber-50/"], [class*="bg-amber-100/"], [class*="bg-amber-200/"], [class*="bg-emerald-50/"], [class*="bg-emerald-100/"], [class*="bg-emerald-200/"], [class*="bg-green-50/"], [class*="bg-green-100/"], [class*="bg-teal-50/"], [class*="bg-teal-100/"], [class*="bg-cyan-50/"], [class*="bg-cyan-100/"], [class*="bg-sky-50/"], [class*="bg-sky-100/"], [class*="bg-blue-50/"], [class*="bg-blue-100/"], [class*="bg-blue-200/"], [class*="bg-indigo-50/"], [class*="bg-indigo-100/"], [class*="bg-purple-50/"], [class*="bg-purple-100/"], [class*="bg-purple-200/"], [class*="bg-violet-50/"], [class*="bg-violet-100/"], [class*="bg-fuchsia-50/"], [class*="bg-pink-50/"], [class*="bg-pink-100/"], [class*="bg-red-50/"], [class*="bg-red-100/"], [class*="bg-orange-50/"], [class*="bg-yellow-50/"], [class*="bg-lime-50/"], [class*="bg-slate-50/"], [class*="bg-slate-100/"], [class*="bg-slate-200/"], [class*="bg-slate-300/"], [class*="bg-gray-50/"], [class*="bg-gray-100/"], [class*="bg-gray-200/"], [class*="bg-white/6"], [class*="bg-white/7"], [class*="bg-white/8"], [class*="bg-white/9"]) { background-color: var(--amh-panel) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) :is([class*="from-blue-50"], [class*="from-blue-100"], [class*="from-blue-200"], [class*="from-indigo-50"], [class*="from-indigo-100"], [class*="from-indigo-200"], [class*="from-sky-50"], [class*="from-sky-100"], [class*="from-purple-50"], [class*="from-purple-100"], [class*="from-purple-200"], [class*="from-violet-50"], [class*="from-violet-100"], [class*="from-fuchsia-50"], [class*="from-pink-50"], [class*="from-pink-100"], [class*="from-rose-50"], [class*="from-rose-100"], [class*="from-rose-200"], [class*="from-red-50"], [class*="from-red-100"], [class*="from-orange-50"], [class*="from-amber-50"], [class*="from-amber-100"], [class*="from-amber-200"], [class*="from-yellow-50"], [class*="from-lime-50"], [class*="from-green-50"], [class*="from-green-100"], [class*="from-teal-50"], [class*="from-teal-100"], [class*="from-cyan-50"], [class*="from-cyan-100"], [class*="from-emerald-50"], [class*="from-emerald-100"], [class*="from-emerald-200"], [class*="from-slate-50"], [class*="from-slate-100"], [class*="from-slate-200"], [class*="from-gray-50"], [class*="from-gray-100"], [class*="from-white"], [class*="via-blue-50"], [class*="via-blue-100"], [class*="via-blue-200"], [class*="via-indigo-50"], [class*="via-indigo-100"], [class*="via-indigo-200"], [class*="via-sky-50"], [class*="via-sky-100"], [class*="via-purple-50"], [class*="via-purple-100"], [class*="via-purple-200"], [class*="via-violet-50"], [class*="via-violet-100"], [class*="via-fuchsia-50"], [class*="via-pink-50"], [class*="via-pink-100"], [class*="via-rose-50"], [class*="via-rose-100"], [class*="via-rose-200"], [class*="via-red-50"], [class*="via-red-100"], [class*="via-orange-50"], [class*="via-amber-50"], [class*="via-amber-100"], [class*="via-amber-200"], [class*="via-yellow-50"], [class*="via-lime-50"], [class*="via-green-50"], [class*="via-green-100"], [class*="via-teal-50"], [class*="via-teal-100"], [class*="via-cyan-50"], [class*="via-cyan-100"], [class*="via-emerald-50"], [class*="via-emerald-100"], [class*="via-emerald-200"], [class*="via-slate-50"], [class*="via-slate-100"], [class*="via-slate-200"], [class*="via-gray-50"], [class*="via-gray-100"], [class*="via-white"], [class*="to-blue-50"], [class*="to-blue-100"], [class*="to-blue-200"], [class*="to-indigo-50"], [class*="to-indigo-100"], [class*="to-indigo-200"], [class*="to-sky-50"], [class*="to-sky-100"], [class*="to-purple-50"], [class*="to-purple-100"], [class*="to-purple-200"], [class*="to-violet-50"], [class*="to-violet-100"], [class*="to-fuchsia-50"], [class*="to-pink-50"], [class*="to-pink-100"], [class*="to-rose-50"], [class*="to-rose-100"], [class*="to-rose-200"], [class*="to-red-50"], [class*="to-red-100"], [class*="to-orange-50"], [class*="to-amber-50"], [class*="to-amber-100"], [class*="to-amber-200"], [class*="to-yellow-50"], [class*="to-lime-50"], [class*="to-green-50"], [class*="to-green-100"], [class*="to-teal-50"], [class*="to-teal-100"], [class*="to-cyan-50"], [class*="to-cyan-100"], [class*="to-emerald-50"], [class*="to-emerald-100"], [class*="to-emerald-200"], [class*="to-slate-50"], [class*="to-slate-100"], [class*="to-slate-200"], [class*="to-gray-50"], [class*="to-gray-100"], [class*="to-white"]) { --tw-gradient-from: var(--amh-panel) var(--tw-gradient-from-position) !important; --tw-gradient-via: var(--amh-panel) var(--tw-gradient-via-position) !important; --tw-gradient-to: var(--amh-panel) var(--tw-gradient-to-position) !important; }
/* (ঠ) SpotlightCard custom surface + glow → ডার্ক + অ্যাকসেন্ট */
:is(.amh-theme-obsidian, .amh-theme-neon) .spotlight-card { background: var(--amh-border) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .spotlight-card--sub { background: var(--amh-border) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .spotlight-card::before { background: var(--amh-accent-solid) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .spotlight-card__surface { background: var(--amh-panel2) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .spotlight-card--sub > .spotlight-card__surface { background: var(--amh-panel) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .queue-spotlight-card { background: var(--amh-border) !important; }
:is(.amh-theme-obsidian, .amh-theme-neon) .queue-spotlight-card::before { background: radial-gradient(110px circle at var(--mouse-x) var(--mouse-y), var(--amh-accent-solid) 0%, var(--amh-glow) 45%, transparent 100%) !important; }

/* ===== নন-গোল্ড থিম: নেভিগেশন অপরিবর্তিত রেখে কেবল কনটেন্ট কার্ডে থিম-রঙের কাচের এজ ও গভীরতা ===== */
.amh-t-aurora { --amh-card-edge:linear-gradient(135deg,rgba(13,148,136,.72),rgba(6,182,212,.58),rgba(59,130,246,.42)); }
.amh-t-mesh { --amh-card-edge:linear-gradient(135deg,rgba(99,102,241,.7),rgba(217,70,239,.58),rgba(245,158,11,.42)); }
.amh-t-auroraglass { --amh-card-edge:linear-gradient(135deg,rgba(16,185,129,.68),rgba(20,184,166,.56),rgba(99,102,241,.42)); }
.amh-t-immersive { --amh-card-edge:linear-gradient(135deg,rgba(6,182,212,.72),rgba(59,130,246,.56),rgba(99,102,241,.42)); }
.amh-t-organic { --amh-card-edge:linear-gradient(135deg,rgba(101,163,13,.68),rgba(34,197,94,.52),rgba(217,119,6,.42)); }
.amh-t-dental { --amh-card-edge:linear-gradient(135deg,rgba(20,184,166,.68),rgba(45,212,191,.52),rgba(251,146,60,.42)); }
.amh-t-luxefrost { --amh-card-edge:linear-gradient(135deg,rgba(13,148,136,.68),rgba(99,102,241,.52),rgba(56,189,248,.42)); }
.amh-t-plaingreen { --amh-card-edge:linear-gradient(135deg,rgba(22,163,74,.68),rgba(132,204,22,.52),rgba(13,148,136,.42)); }
.amh-t-puffy { --amh-card-edge:linear-gradient(135deg,rgba(236,72,153,.64),rgba(167,139,250,.54),rgba(96,165,250,.42)); }
.amh-t-sooti { --amh-card-edge:linear-gradient(135deg,rgba(180,83,9,.68),rgba(217,119,6,.54),rgba(190,24,93,.4)); }
.amh-t-zomo { --amh-card-edge:linear-gradient(135deg,rgba(124,58,237,.68),rgba(99,102,241,.54),rgba(6,182,212,.42)); }
.amh-theme-obsidian { --amh-card-edge:linear-gradient(135deg,rgba(139,124,246,.72),rgba(109,92,224,.55),rgba(196,181,253,.38)); }
.amh-theme-neon { --amh-card-edge:linear-gradient(135deg,rgba(59,130,246,.72),rgba(99,102,241,.58),rgba(34,211,238,.4)); }
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo,.amh-theme-obsidian,.amh-theme-neon) .spotlight-card {
  background:var(--amh-card-edge) !important;
  box-shadow:0 14px 34px rgba(15,23,42,.12),0 0 20px rgba(99,102,241,.06);
  transition:box-shadow 240ms ease;
}
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo,.amh-theme-obsidian,.amh-theme-neon) .spotlight-card--sub {
  box-shadow:0 8px 22px rgba(15,23,42,.08);
}
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo,.amh-theme-obsidian,.amh-theme-neon) .spotlight-card__surface {
  box-shadow:inset 0 1px 0 rgba(255,255,255,.34);
}
@media (hover:hover) and (pointer:fine) {
  :is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo,.amh-theme-obsidian,.amh-theme-neon) .spotlight-card:hover {
    box-shadow:0 18px 42px rgba(15,23,42,.16),0 0 24px rgba(99,102,241,.1);
  }
}

/* ===== NEON GLASS — আসল কাচের ফিল: প্যানেল অর্ধ-স্বচ্ছ + পেছনেরটা ব্লার। শুধু .amh-theme-neon; obsidian/dark-gold/লাইট থিম অক্ষত ===== */
.amh-theme-neon { --amh-panel: #12141d; --amh-panel2: #0d0f16; --amh-glass: blur(20px) saturate(175%); --amh-text-hi: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.6); }
/* (B আন্ডু) মূল প্যানেল এখন সলিড — blur শুধু পপআপ/ড্রপডাউনে; সাব-প্যানেল bg-[#..] blur নিচের লাইনে আলাদা */
.amh-theme-neon [role="dialog"], .amh-theme-neon [role="menu"], .amh-theme-neon [role="listbox"] { -webkit-backdrop-filter: var(--amh-glass); backdrop-filter: var(--amh-glass); }
/* সাব-প্যানেল/ইনপুট/হেডার/পপআপ (arbitrary bg-[#..]) → স্বচ্ছ ৩০% + কম blur (১০px) → ফ্রস্টেড কাচ (মূল প্যানেলের ২০px blur-এর চেয়ে হালকা ব্লার) */
.amh-theme-neon [class*="bg-["] { background-color: rgba(18,20,29,0.30) !important; -webkit-backdrop-filter: blur(10px) saturate(175%) !important; backdrop-filter: blur(10px) saturate(175%) !important; }
/* কিউ সিলেকশন (শুধু Neon): নির্বাচিত রো-র ধূসর bg-slate-700 → Holographic Pearl #F5F7FF (rgb 245,247,255) ৩০%; ভেতরের টোকেন/ফোন চিপ bg-slate-600/80 → একই কালার ৪০% যাতে চিপ সামান্য আলাদা বোঝা যায়। শুধু [data-queue-selected="true"] স্কোপ → অন্য কোনো bg-slate-* প্রভাবিত নয় */
.amh-theme-neon [data-queue-selected="true"] .bg-slate-700 { background-color: rgba(245,247,255,0.30) !important; }
.amh-theme-neon [data-queue-selected="true"] [class*="bg-slate-600"] { background-color: rgba(245,247,255,0.40) !important; }
/* ৩০% Pearl হালকা → নির্বাচিত রোতে লেখা/আইকন পড়া যায় না; তাই শুধু নির্বাচিত রোতে: (ক) নাম গাঢ়, (খ) টিন্টেড অ্যাকশন-বাটন সলিড গাঢ় বক্স + হালকা বর্ডার যাতে হালকা আইকন ফুটে ওঠে */
.amh-theme-neon [data-queue-selected="true"] h3.text-white { color: #0d1120 !important; }
.amh-theme-neon [data-queue-selected="true"] [class*="text-slate-1"], .amh-theme-neon [data-queue-selected="true"] [class*="text-slate-2"], .amh-theme-neon [data-queue-selected="true"] [class*="text-slate-3"] { color: #1b1f2e !important; }
.amh-theme-neon [data-queue-selected="true"] [class*="text-emerald-2"], .amh-theme-neon [data-queue-selected="true"] [class*="text-emerald-3"] { color: #065f36 !important; }
.amh-theme-neon [data-queue-selected="true"] button[class*="bg-amber-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-emerald-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-green-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-teal-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-cyan-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-sky-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-blue-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-indigo-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-violet-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-purple-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-fuchsia-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-pink-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-rose-100"], .amh-theme-neon [data-queue-selected="true"] button[class*="bg-red-100"] { background-color: rgba(15,18,28,0.92) !important; border-color: rgba(255,255,255,0.22) !important; }
/* সলিড অ্যাকসেন্ট বাটন (primary/submit সবুজ→blue override) আবার স্বচ্ছ কাচ, যাতে blur অপ্রয়োজনীয় GPU খরচ না করে */
.amh-theme-neon .bg-emerald-400, .amh-theme-neon .bg-emerald-500, .amh-theme-neon .bg-emerald-600, .amh-theme-neon .bg-emerald-700, .amh-theme-neon .bg-green-500, .amh-theme-neon .bg-green-600, .amh-theme-neon .bg-green-700, .amh-theme-neon .bg-teal-500, .amh-theme-neon .bg-teal-600, .amh-theme-neon .bg-teal-700, .amh-theme-neon .bg-cyan-500, .amh-theme-neon .bg-cyan-600, .amh-theme-neon .bg-cyan-700 { background-color: rgba(47,111,224,0.72) !important; -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }
.amh-theme-neon .hover\:bg-emerald-500:hover, .amh-theme-neon .hover\:bg-emerald-600:hover, .amh-theme-neon .hover\:bg-emerald-700:hover, .amh-theme-neon .hover\:bg-teal-600:hover, .amh-theme-neon .hover\:bg-teal-700:hover, .amh-theme-neon .hover\:bg-green-600:hover { background-color: rgba(35,88,192,0.8) !important; }
/* ব্র্যান্ড সবুজ gradient (from-emerald/via/teal→blue) → translucent blue gradient যাতে blur সত্যি কাজ করে */
.amh-theme-neon :is([class*="from-emerald"], [class*="from-teal"], [class*="from-green"], [class*="from-cyan"]) { --tw-gradient-from: rgba(59,130,246,0.72) var(--tw-gradient-from-position) !important; }
.amh-theme-neon :is([class*="via-emerald"], [class*="via-teal"], [class*="via-green"], [class*="via-cyan"]) { --tw-gradient-via: rgba(99,102,241,0.72) var(--tw-gradient-via-position) !important; }
.amh-theme-neon :is([class*="to-emerald"], [class*="to-teal"], [class*="to-green"], [class*="to-cyan"]) { --tw-gradient-to: rgba(139,92,246,0.72) var(--tw-gradient-to-position) !important; }

/* ===== DARK GOLD + OBSIDIAN — Neon-এর দুই পরিবর্তন (সাব-প্যানেল কাচ + Pearl সিলেকশন) প্রতিটির নিজস্ব রঙে মিলিয়ে ===== */
.amh-theme-dark-gold { --amh-subpanel: rgba(26,25,32,0.55); --amh-sel: rgba(245,240,225,0.30); --amh-sel-chip: rgba(245,240,225,0.40); --amh-sel-text: #1a1608; }
.amh-theme-obsidian { --amh-subpanel: rgba(30,30,41,0.55); --amh-sel: rgba(238,241,251,0.30); --amh-sel-chip: rgba(238,241,251,0.40); --amh-sel-text: #10121c; }
/* C: যেসব বড় প্যানেলে আগে থেকে backdrop-blur আছে (কার্ড/ব্র্যান্ডবক্স/নেভ) → স্বচ্ছ কাচ। accent ডট/ব্যাজ (backdrop-blur নেই) অক্ষত */
:is(.amh-theme-dark-gold, .amh-theme-obsidian) [class*="backdrop-blur"] { background-color: var(--amh-subpanel) !important; }
/* D: কিউ সিলেকশন — ধূসর bg-slate-700 → Pearl-সদৃশ টিন্ট + গাঢ় লেখা + সলিড-ডার্ক অ্যাকশন-বাটন */
:is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] .bg-slate-700 { background-color: var(--amh-sel) !important; }
:is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] [class*="bg-slate-600"] { background-color: var(--amh-sel-chip) !important; }
:is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] h3.text-white { color: var(--amh-sel-text) !important; }
:is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] [class*="text-slate-1"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] [class*="text-slate-2"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] [class*="text-slate-3"] { color: var(--amh-sel-text) !important; }
:is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] [class*="text-emerald-2"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] [class*="text-emerald-3"] { color: var(--amh-sel-text) !important; }
:is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-amber-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-emerald-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-green-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-teal-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-cyan-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-sky-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-blue-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-indigo-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-violet-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-purple-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-fuchsia-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-pink-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-rose-100"], :is(.amh-theme-dark-gold, .amh-theme-obsidian) [data-queue-selected="true"] button[class*="bg-red-100"] { background-color: rgba(15,18,28,0.92) !important; border-color: rgba(255,255,255,0.22) !important; }

/* ===== লাইট থিম — Neon-এর দুই পরিবর্তন মানানসই রূপ: (C) সাদা প্যানেল সামান্য ফ্রস্টেড কাচ + (D) থিম-নিজস্ব অ্যাকসেন্ট-টিন্ট সিলেকশন (গাঢ় লেখা) ===== */
.amh-t-aurora{--amh-sel:rgba(13,148,136,.20);--amh-sel-chip:rgba(13,148,136,.32);--amh-sel-text:#0f3d38;}
.amh-t-mesh{--amh-sel:rgba(124,58,237,.16);--amh-sel-chip:rgba(124,58,237,.28);--amh-sel-text:#3b1a6b;}
.amh-t-auroraglass{--amh-sel:rgba(16,185,129,.18);--amh-sel-chip:rgba(16,185,129,.30);--amh-sel-text:#0d3b2e;}
.amh-t-immersive{--amh-sel:rgba(37,99,235,.16);--amh-sel-chip:rgba(37,99,235,.28);--amh-sel-text:#0b2a52;}
.amh-t-organic{--amh-sel:rgba(74,107,83,.20);--amh-sel-chip:rgba(74,107,83,.32);--amh-sel-text:#263A2C;}
.amh-t-dental{--amh-sel:rgba(20,184,166,.20);--amh-sel-chip:rgba(20,184,166,.32);--amh-sel-text:#0f4d46;}
.amh-t-luxefrost{--amh-sel:rgba(245,158,11,.22);--amh-sel-chip:rgba(245,158,11,.34);--amh-sel-text:#5c3a06;}
.amh-t-plaingreen{--amh-sel:rgba(5,150,105,.18);--amh-sel-chip:rgba(5,150,105,.30);--amh-sel-text:#06402f;}
.amh-t-puffy{--amh-sel:rgba(139,92,246,.18);--amh-sel-chip:rgba(139,92,246,.30);--amh-sel-text:#3b1a6b;}
.amh-t-sooti{--amh-sel:rgba(186,122,93,.22);--amh-sel-chip:rgba(186,122,93,.34);--amh-sel-text:#5a2e18;}
.amh-t-zomo{--amh-sel:rgba(124,58,237,.16);--amh-sel-chip:rgba(124,58,237,.28);--amh-sel-text:#3b1a6b;}
/* C: যেসব প্যানেলে backdrop-blur আছে (কার্ড/ব্র্যান্ডবক্স/নেভ) → সামান্য ফ্রস্টেড (hover:bg-white/10 ইত্যাদি স্পর্শ করে না) */
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [class*="backdrop-blur"] { background-color: rgba(255,255,255,0.82) !important; }
/* Restore the header's original tint: its backdrop layer sits outside the header element. */
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [data-amh-header-bg="true"] [class*="backdrop-blur"] { background-color: rgba(255,255,255,.10) !important; }
@media (max-width: 639px) {
  :is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [data-amh-header-bg="true"] [class*="backdrop-blur"] { background-color: rgba(2,6,23,.30) !important; }
}
/* D: কিউ সিলেকশন — থিম-নিজস্ব অ্যাকসেন্ট টিন্ট + গাঢ় লেখা */
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [data-queue-selected="true"] .bg-slate-700 { background-color: var(--amh-sel) !important; }
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [data-queue-selected="true"] [class*="bg-slate-600"] { background-color: var(--amh-sel-chip) !important; }
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [data-queue-selected="true"] h3.text-white { color: var(--amh-sel-text) !important; }
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [data-queue-selected="true"] [class*="text-slate-1"], :is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [data-queue-selected="true"] [class*="text-slate-2"], :is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [data-queue-selected="true"] [class*="text-slate-3"] { color: var(--amh-sel-text) !important; }
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [data-queue-selected="true"] [class*="text-emerald-2"], :is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) [data-queue-selected="true"] [class*="text-emerald-3"] { color: var(--amh-sel-text) !important; }

/* ③+④ ইফেক্ট — সব লাইট থিমের সব "বক্স" (কার্ড/সেটিংস-বক্স/ফিল্ড-বক্স) এ: স্বচ্ছ টিন্ট + গোলাকার উপরের ধার + নরম ছায়া। বাদ: মেইন প্যানেল (rounded-t-3xl), বোর্ডের প্যানেল/সাব-প্যানেল (data-el), বাটন/ইনপুট/সিলেক্ট। ডার্ক থিম (dark-gold/obsidian/neon/immersive) এই নিয়মে নেই → অক্ষত */
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo) :is([class*="rounded-xl"],[class*="rounded-2xl"],[class*="rounded-3xl"])[class*="border"]:not([data-el="panel"]):not([data-el="sub"]):not(button):not(input):not(select):not(textarea) { background-color: rgba(255,255,255,0.55) !important; border-top-left-radius: 18px !important; border-top-right-radius: 18px !important; border-top: 1px solid rgba(255,255,255,0.65) !important; box-shadow: 0 -6px 18px rgba(2,6,23,0.14), 0 6px 16px rgba(2,6,23,0.08) !important; }

/* নেভ আইকন: active হলে হালকা pulse / gear-এর জন্য spin (static PNG/SVG-এর ওপর transform → মসৃণ, ফ্লিকার নেই) */
@keyframes amhNavPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.14); } }
@keyframes amhNavSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.amh-nav-anim-pulse { animation: amhNavPulse 1.5s ease-in-out infinite; transform-origin: center; will-change: transform; }
.amh-nav-anim-spin { animation: amhNavSpin 7s linear infinite; transform-origin: center; will-change: transform; }

/* নেভ বাটন (active): Glass + 3D Clay — স্বচ্ছ ফ্রস্টেড কাচ, ঝলমলে নিয়ন রিং, তির্যক শাইন ও 3D ছায়া; আইকন+টেক্সট ভেতরে */
@keyframes amhNavGlowBreathe { 0%, 100% { opacity: 0.92; } 50% { opacity: 1; } }
@keyframes amhTvMarquee { from { transform: translateX(100vw); } to { transform: translateX(-100%); } }
.amh-tv-marquee { display: inline-block; padding-left: 100vw; will-change: transform; animation-name: amhTvMarquee; animation-timing-function: linear; animation-iteration-count: infinite; }
@keyframes amhTvPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.0); } 50% { box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.65); } }
.amh-tv-pulse { animation: amhTvPulse 1.1s ease-in-out infinite; }
/* নেভ বার: মোবাইলে নিচে অনুভূমিক; ডেস্কটপে (১০২px+) ডান প্রান্তে খাড়া রেল — মাঝের প্যানেলের ডান পাশে */
.amh-bottomnav { position: fixed; bottom: 0; left: 0; right: 0; width: 100%; z-index: 50; padding-bottom: max(env(safe-area-inset-bottom, 0px), 4px); }
@media (min-width: 1024px) {
  .amh-bottomnav { bottom: auto; top: 50%; left: auto; right: 8px; width: auto; transform: translate3d(0, -50%, 0); padding-bottom: 6px; }
  .amh-bottomnav-inner { max-width: none; padding-left: 0; padding-right: 0; }
  .amh-bottomnav-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 0 !important; border: none; border-radius: 22px; padding: 5px 3px; min-height: 480px; grid-auto-rows: 1fr; }
  .amh-bottomnav-grid > button { padding-top: 1px !important; padding-bottom: 1px !important; }
  .amh-bottomnav-grid > button > span:last-child { font-size: 12px !important; }
  /* রেল: সিলেকশনের ব্যাকড্রপ (কাচ-ফিল + রঙিন রিং) ফেরত — আকৃতি আয়তাকার (ছোট রাডিয়াস), গ্যাপ/হাইট কম */
  .amh-bottomnav-grid .amh-nav-icon-neon::before { top: -5px; bottom: -6px; left: 4px; right: 4px; border-radius: 14px; padding: 2px; }
  .amh-bottomnav-grid .amh-nav-icon-neon::after { top: 6px; bottom: 5px; left: 6px; right: 6px; border-radius: 12px; }
  .amh-bottomnav-pad { padding-right: 7rem; }
}
/* টিভি সেটআপের ৪টি ছোট বক্স: ডেস্কটপে ২×২ পাশাপাশি, মোবাইলে উপর-নিচ স্ট্যাক — কোনো সাইড স্ক্রল/ওভারল্যাপ নয় */
.tv-quad > div { padding: 6px 10px; min-width: 0; }
.tv-quad > div > div:first-child { margin-bottom: 3px; }
.tv-quad button { padding: 2px 9px; }
.tv-quad label { margin-bottom: 0; }
.amh-nav-icon-neon { position: relative; }
.amh-nav-icon-neon::before {
  display: none; /* 2026-11-05: old active neon ring/glow removed — active icon now shows only its per-color .amh-nav-glass tile (active still indicated by the animated icon + label colour) */
  content: "";
  position: absolute;
  top: 5px;
  bottom: 2px;
  left: 6px;
  right: 6px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--nav-neon-a, #a78bfa) 0%, var(--nav-neon-b, #6366f1) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 3px;
  box-shadow: 0 0 16px 2px var(--nav-neon-glow, rgba(139, 92, 246, 0.55)), 0 12px 26px -8px rgba(15, 23, 42, 0.45);
  z-index: 0;
  pointer-events: none;
  animation: amhNavGlowBreathe 3.2s ease-in-out infinite;
}
.amh-nav-icon-neon::after {
  display: none; /* 2026-11-05: active icon now uses the per-color .amh-nav-glass tile; the old white glass fill UNDER the active icon is removed */
  content: "";
  position: absolute;
  top: 8px;
  bottom: 5px;
  left: 8px;
  right: 8px;
  border-radius: 21px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.42) 38%, rgba(255, 255, 255, 0) 52%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.60) 0%, rgba(224, 242, 254, 0.30) 55%, rgba(203, 213, 225, 0.42) 100%);
  -webkit-backdrop-filter: blur(9px) saturate(165%);
  backdrop-filter: blur(9px) saturate(165%);
  box-shadow:
    inset 2px 2px 5px rgba(255, 255, 255, 0.95),
    inset -3px -4px 8px rgba(148, 163, 184, 0.40),
    inset 0 0 0 1px rgba(255, 255, 255, 0.35),
    0 12px 26px -8px rgba(15, 23, 42, 0.45),
    0 4px 10px rgba(15, 23, 42, 0.20);
  z-index: 0;
  pointer-events: none;
}
.amh-nav-icon-neon > img,
.amh-nav-icon-neon > span:not(.amh-nav-glass) { position: relative; z-index: 1; }
/* প্রতি আইকনের নিজস্ব নিয়ন রঙ */
.amh-nav-neon-violet { --nav-neon-a: #c4b5fd; --nav-neon-b: #7c3aed; --nav-neon-glow: rgba(124, 58, 237, 0.55); }
.amh-nav-neon-blue   { --nav-neon-a: #7dd3fc; --nav-neon-b: #2563eb; --nav-neon-glow: rgba(37, 99, 235, 0.55); }
.amh-nav-neon-teal   { --nav-neon-a: #5eead4; --nav-neon-b: #0d9488; --nav-neon-glow: rgba(13, 148, 136, 0.55); }
.amh-nav-neon-amber  { --nav-neon-a: #fde68a; --nav-neon-b: #d97706; --nav-neon-glow: rgba(217, 119, 6, 0.55); }
.amh-nav-neon-rose   { --nav-neon-a: #fda4af; --nav-neon-b: #e11d48; --nav-neon-glow: rgba(225, 29, 72, 0.55); }
.amh-nav-neon-lime   { --nav-neon-a: #d9f99d; --nav-neon-b: #65a30d; --nav-neon-glow: rgba(101, 163, 13, 0.55); }

/* মোবাইলে অনুভূমিক স্ক্রল / page zoom-out ঠেকায়:
   ৩৯০px-এর ভেতরে বড় কোনো কনটেন্ট থাকলে Chrome পুরো লেআউট ভিউপোর্ট (~৪১৪px) প্রসারিত করে ফেলে,
   ফলে হেডার/বটম নেভ বাইরের দিকে কেটে যায়। উল্লম্ব স্ক্রলে এর কোনো প্রভাব পড়ে না।
   বাতিল করতে এই ব্লকটি মুছে দিলেই আগের অবস্থায় ফিরে যাবে। */
@media (max-width: 640px) {
  html, body {
    overflow-x: hidden;
    max-width: 100%;
  }
}

/* তিন-লেয়ার মোবাইল হেডার (লেয়ার ২ = মেইন প্যানেল z-20):
   হেডার max-sm:fixed হওয়ায় ফ্লো থেকে উঠে যায়, তাই মেইন প্যানেলকে হেডারের মাপা উচ্চতাটুকু নিচে নামাতে হয়।
   বাতিল করতে এই ব্লকটি আর হেডার র‍্যাপারগুলোর max-sm:fixed ক্লাসগুলো সরিয়ে দিলেই আগের অবস্থায় ফিরবে। */
@media (max-width: 639px) {
  main.amh-main {
    margin-top: var(--amh-header-h, 0px) !important;
  }
}

/* The app references animate-fadeIn; define it for the preview */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out both;
}

@keyframes logoSpin360 {
  0% { transform: perspective(600px) rotateY(0deg); }
  50% { transform: perspective(600px) rotateY(360deg); }
  100% { transform: perspective(600px) rotateY(0deg); }
}

.logo-spin-360 {
  animation: logoSpin360 16s ease-in-out infinite;
  transform-origin: 50% 50%;
  will-change: transform;
}

.logo-spin-360:hover {
  animation-play-state: paused;
}

/* Utility used by iOS-safe bottom bars if present */
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* প্লেসহোল্ডার লেখা যেন সাদা-ধূসর হয়ে অস্পষ্ট না হয় */
input::placeholder,
textarea::placeholder {
  color: currentColor;
  opacity: 0.7;
}

/* তারিখের স্ট্রিপে নেটিভ স্ক্রলবার লুকিয়ে স্বচ্ছ swipe-যোগ্য রাখা */
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* ব্রাউজারের নিজস্ব সারফেসও থিমের সঙ্গে মিলিয়ে নেওয়া */
::selection {
  background: #99f6e4;
  color: #042f2e;
}

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(13, 148, 136, 0.45) transparent;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(13, 148, 136, 0.45);
  border: 2px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
}

input,
textarea {
  caret-color: #0f766e;
}

/* কীবোর্ড ব্যবহারকারীর জন্য স্পষ্ট ফোকাস রিং */
:where(button, a, input, select, textarea, [role="button"]):focus-visible {
  outline: 2px solid #047857;
  outline-offset: 2px;
}

/* নতুন সিরিয়াল কার্ড: cursor-following multicolor border reveal */
.spotlight-card {
  /* Glow radius, peak intensity and border thickness are adjusted here. */
  --glow-radius: 220px;
  --glow-intensity: 0.75;
  --border-width: 2px;
  --card-radius: 24px;
  --mouse-x: 50%;
  --mouse-y: 50%;
  position: relative;
  isolation: isolate;
  padding: var(--border-width);
  border-radius: var(--card-radius);
  background: rgb(100 116 139 / 28%);
  box-shadow: 0 12px 32px rgb(15 23 42 / 10%);
}

.spotlight-card::before {
  content: "";
  position: absolute;
  z-index: 0;
  inset: 0;
  border-radius: inherit;
  background: #808080;
  -webkit-mask-image: radial-gradient(
    var(--glow-radius) circle at var(--mouse-x) var(--mouse-y),
    rgb(0 0 0 / var(--glow-intensity)) 0%,
    rgb(0 0 0 / 65%) 35%,
    transparent 75%
  );
  mask-image: radial-gradient(
    var(--glow-radius) circle at var(--mouse-x) var(--mouse-y),
    rgb(0 0 0 / var(--glow-intensity)) 0%,
    rgb(0 0 0 / 65%) 35%,
    transparent 75%
  );
  opacity: 0;
  transition: opacity 240ms ease-out;
  pointer-events: none;
}

.spotlight-card--sub {
  --glow-radius: 200px;
  --glow-intensity: 0.88;
  --border-width: 1.5px;
  --card-radius: 18px;
  background: rgb(100 116 139 / 22%);
  box-shadow: 0 6px 18px rgb(15 23 42 / 6%);
  transition: box-shadow 280ms ease;
}

.spotlight-card--sub:hover,
.spotlight-card--sub:focus-within {
  box-shadow: 0 12px 28px rgb(15 23 42 / 11%);
}

/* মোবাইল ও টাচ স্ক্রিনে বড় প্যানেল ও সাব-প্যানেলের বর্ডার পর্যন্ত যেন গ্লো স্পষ্টভাবে পৌঁছায় */
@media (max-width: 768px), (hover: none), (pointer: coarse) {
  .spotlight-card {
    --glow-radius: 520px;
    --glow-intensity: 0.95;
    --border-width: 2px;
  }
  .spotlight-card--sub {
    --glow-radius: 340px;
    --glow-intensity: 0.98;
    --border-width: 1.8px;
  }
  .spotlight-card::before {
    -webkit-mask-image: radial-gradient(
      var(--glow-radius) circle at var(--mouse-x) var(--mouse-y),
      rgb(0 0 0 / var(--glow-intensity)) 0%,
      rgb(0 0 0 / 85%) 55%,
      transparent 98%
    );
    mask-image: radial-gradient(
      var(--glow-radius) circle at var(--mouse-x) var(--mouse-y),
      rgb(0 0 0 / var(--glow-intensity)) 0%,
      rgb(0 0 0 / 85%) 55%,
      transparent 98%
    );
  }
}

.spotlight-card.is-glowing::before,
.spotlight-card:hover::before,
.spotlight-card:active::before,
.spotlight-card:focus-within::before {
  opacity: 1;
}

.spotlight-card__surface {
  position: relative;
  z-index: 1;
  height: 100%;
  overflow: hidden;
  border: 0 !important;
  border-radius: calc(var(--card-radius) - var(--border-width));
  background: #ffffff;
}

.spotlight-card--sub > .spotlight-card__surface {
  background: #f8fafc;
}

.spotlight-card--dark > .spotlight-card__surface {
  background: #0f172a;
}

.spotlight-card--overflow > .spotlight-card__surface {
  overflow: visible;
}

.spotlight-card__surface > * {
  border-radius: inherit !important;
  border-color: transparent !important;
}

/* হেডারের ডান প্যানেলের আইকনে কালো আউট-লাইন:
   drop-shadow আইকনের নিজের আকৃতির (alpha) গা ঘেঁষে বসে, তাই লাইনটি বাটনের বক্স/বর্ডারের বাইরে যায় না।
   মানগুলো হুবহু টেক্সটের text-shadow রেসিপির মতো (0.6px / rgba(0,0,0,0.75) + 0 0 2px / 0.35) — হালকা */
.icon-outline-black {
  filter:
    drop-shadow(0.6px 0 0 rgba(0, 0, 0, 0.75))
    drop-shadow(-0.6px 0 0 rgba(0, 0, 0, 0.75))
    drop-shadow(0 0.6px 0 rgba(0, 0, 0, 0.75))
    drop-shadow(0 -0.6px 0 rgba(0, 0, 0, 0.75))
    drop-shadow(0 0 2px rgba(0, 0, 0, 0.35));
}

/* কিউয়ের রোগীর কার্ড: radial spotlight, gentle lift এবং keyboard focus */
.queue-spotlight-card {
  --mouse-x: 50%;
  --mouse-y: 50%;
  position: relative;
  isolation: isolate;
  padding: 1.5px;
  border-radius: 18px;
  background: rgb(100 116 139 / 20%);
  box-shadow: 0 8px 24px rgb(15 23 42 / 7%);
  transition: box-shadow 300ms ease;
}

.queue-spotlight-card::before {
  content: "";
  position: absolute;
  z-index: 0;
  inset: -1px;
  border-radius: inherit;
  background: radial-gradient(
    110px circle at var(--mouse-x) var(--mouse-y),
    #808080 0%,
    rgb(128 128 128 / 0.5) 45%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 300ms ease;
  pointer-events: none;
}

.queue-spotlight-card:hover {
  box-shadow: 0 18px 38px rgb(15 23 42 / 14%);
}

.queue-spotlight-card.is-glowing::before,
.queue-spotlight-card:hover::before,
.queue-spotlight-card:focus-within::before {
  opacity: 1;
}

.queue-spotlight-card__surface {
  position: relative;
  z-index: 1;
  height: 100%;
  overflow: hidden;
  border-radius: 16.5px;
}

/* মোবাইলে ট্যাপ বিলম্ব কমানো */
button,
a,
[role="button"] {
  touch-action: manipulation;
}

/* ================================================================
   ম্যানুয়াল স্ক্রিন অরিয়েন্টেশন (TV MOOD)
   ফিজিক্যালি ঘোরানো TV/মনিটরের জন্য পুরো ডিসপ্লে ৯০/১৮০/২৭০°
   ঘোরানো হয়। body-তে transform দেওয়া হয়, তাই fixed/sticky সব
   উপাদান ও পোর্টাল একসাথেই সঠিকভাবে ঘোরে।
   ================================================================ */
html.amh-screen-rotation-active,
html.amh-screen-rotation-active body {
  overflow: hidden !important;
  overscroll-behavior: none;
}

html.amh-screen-rotation-active body {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  transform-origin: center center !important;
  -webkit-overflow-scrolling: touch;
}

html.amh-screen-rotation-active body.amh-screen-rotate-90,
html.amh-screen-rotation-active body.amh-screen-rotate-270 {
  width: 100vh !important;
  height: 100vw !important;
  width: 100dvh !important;
  height: 100dvw !important;
}

html.amh-screen-rotation-active body.amh-screen-rotate-180 {
  width: 100vw !important;
  height: 100vh !important;
  width: 100dvw !important;
  height: 100dvh !important;
}

html.amh-screen-rotation-active body.amh-screen-rotate-90 {
  transform: translate(-50%, -50%) rotate(90deg) !important;
}

html.amh-screen-rotation-active body.amh-screen-rotate-180 {
  transform: translate(-50%, -50%) rotate(180deg) !important;
}

html.amh-screen-rotation-active body.amh-screen-rotate-270 {
  transform: translate(-50%, -50%) rotate(270deg) !important;
}

/* ঘোরানো অবস্থায় অ্যাপের ব্যাকগ্রাউন্ড পুরো স্ক্রিন জুড়ে থাকুক */
html.amh-screen-rotation-active #root {
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
}

html.amh-screen-rotation-active #root > div {
  min-height: 100% !important;
}

/* সিস্টেমে motion কমানোর অনুরোধ থাকলে অ্যানিমেশন প্রায় বন্ধ */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* হেডার লোগোর ঘূর্ণন সব motion-সেটিংসে চালু থাকবে */
@media (prefers-reduced-motion: reduce) {
  .logo-spin-360 {
    animation-duration: 16s !important;
    animation-iteration-count: infinite !important;
  }
}
/* পারফরম্যান্স: ফোনে ওয়াটারমার্ক বন্ধ */
@media (max-width: 639px) { .amh-wm { display: none !important; } }

/* ===== Liquid glass + vibrant mesh — content surfaces only; Dark Gold and fixed navigation stay untouched ===== */
.amh-t-aurora { --amh-glass-tint:#14b8a6; --amh-glass-surface:rgba(255,255,255,.68); --amh-glass-sub:rgba(240,253,250,.58); --amh-glass-line:rgba(20,184,166,.30); }
.amh-t-mesh { --amh-glass-tint:#d946ef; --amh-glass-surface:rgba(255,255,255,.70); --amh-glass-sub:rgba(253,244,255,.60); --amh-glass-line:rgba(217,70,239,.30); }
.amh-t-auroraglass { --amh-glass-tint:#10b981; --amh-glass-surface:rgba(255,255,255,.64); --amh-glass-sub:rgba(236,253,245,.56); --amh-glass-line:rgba(16,185,129,.30); }
.amh-t-immersive { --amh-glass-tint:#06b6d4; --amh-glass-surface:rgba(255,255,255,.68); --amh-glass-sub:rgba(240,249,255,.58); --amh-glass-line:rgba(6,182,212,.30); }
.amh-t-organic { --amh-glass-tint:#65a30d; --amh-glass-surface:rgba(255,255,255,.70); --amh-glass-sub:rgba(247,254,231,.60); --amh-glass-line:rgba(101,163,13,.30); }
.amh-t-dental { --amh-glass-tint:#2dd4bf; --amh-glass-surface:rgba(255,255,255,.70); --amh-glass-sub:rgba(240,253,250,.60); --amh-glass-line:rgba(45,212,191,.32); }
.amh-t-luxefrost { --amh-glass-tint:#6366f1; --amh-glass-surface:rgba(255,255,255,.64); --amh-glass-sub:rgba(248,250,252,.54); --amh-glass-line:rgba(99,102,241,.30); }
.amh-t-plaingreen { --amh-glass-tint:#16a34a; --amh-glass-surface:rgba(255,255,255,.70); --amh-glass-sub:rgba(240,253,244,.60); --amh-glass-line:rgba(22,163,74,.30); }
.amh-t-puffy { --amh-glass-tint:#a78bfa; --amh-glass-surface:rgba(255,255,255,.72); --amh-glass-sub:rgba(250,245,255,.62); --amh-glass-line:rgba(167,139,250,.32); }
.amh-t-sooti { --amh-glass-tint:#b45309; --amh-glass-surface:rgba(255,255,255,.70); --amh-glass-sub:rgba(255,247,237,.60); --amh-glass-line:rgba(180,83,9,.30); }
.amh-t-zomo { --amh-glass-tint:#7c3aed; --amh-glass-surface:rgba(255,255,255,.68); --amh-glass-sub:rgba(250,245,255,.58); --amh-glass-line:rgba(124,58,237,.30); }
.amh-theme-obsidian { --amh-glass-tint:#8b7cf6; --amh-glass-surface:rgba(30,30,41,.70); --amh-glass-sub:rgba(26,26,34,.62); --amh-glass-line:rgba(139,124,246,.36); }
.amh-theme-neon { --amh-glass-tint:#3b82f6; --amh-glass-surface:rgba(18,20,29,.68); --amh-glass-sub:rgba(13,15,22,.58); --amh-glass-line:rgba(96,165,250,.38); }
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo,.amh-theme-obsidian,.amh-theme-neon) .spotlight-card {
  background:linear-gradient(135deg,color-mix(in srgb,var(--amh-glass-tint) 72%,white),color-mix(in srgb,var(--amh-glass-tint) 28%,white),color-mix(in srgb,var(--amh-glass-tint) 58%,white)) !important;
  box-shadow:0 16px 38px rgba(15,23,42,.12),0 0 28px color-mix(in srgb,var(--amh-glass-tint) 14%,transparent);
}
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo,.amh-theme-obsidian,.amh-theme-neon) .spotlight-card__surface {
  background-color:var(--amh-glass-surface) !important;
  background-image:linear-gradient(135deg,rgba(255,255,255,.30),transparent 34%,rgba(255,255,255,.06)) !important;
  -webkit-backdrop-filter:blur(20px) saturate(170%);
  backdrop-filter:blur(20px) saturate(170%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.36),inset 0 -1px 0 rgba(255,255,255,.12);
}
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo,.amh-theme-obsidian,.amh-theme-neon) .spotlight-card--sub > .spotlight-card__surface {
  background-color:var(--amh-glass-sub) !important;
}
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo,.amh-theme-obsidian,.amh-theme-neon) :is(input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),textarea,select) {
  border-color:var(--amh-glass-line);
  box-shadow:inset 0 1px 2px rgba(15,23,42,.04),0 1px 0 rgba(255,255,255,.32);
  -webkit-backdrop-filter:blur(12px) saturate(150%);
  backdrop-filter:blur(12px) saturate(150%);
}
:is(.amh-t-aurora,.amh-t-mesh,.amh-t-auroraglass,.amh-t-immersive,.amh-t-organic,.amh-t-dental,.amh-t-luxefrost,.amh-t-plaingreen,.amh-t-puffy,.amh-t-sooti,.amh-t-zomo,.amh-theme-obsidian,.amh-theme-neon) :is(input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),textarea,select):focus {
  box-shadow:0 0 0 3px color-mix(in srgb,var(--amh-glass-tint) 18%,transparent),inset 0 1px 2px rgba(15,23,42,.04);
}
`; 

const DEFAULT_CHANNEL_ID = 'ansari-medical-hall-queue-2026';
const SERVER_CLOUD_USER = Object.freeze({ id: 'server-session' });
// লোকাল (বাংলাদেশ) তারিখ — UTC নয়; মাঝরাতে নতুন দিনে বদলে যায়
const localDateKey = (date = new Date()) => {
  const d = date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const normalizeNumericPin = (value) => String(value).replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).replace(/\D/g, '');
let TODAY_KEY = localDateKey();

// ডিফল্ট Apps Script WebApp URL (Google Sheet/Drive সিঙ্ক) — সেটিংসে খালি থাকলে এটি ব্যবহৃত হয়
const DEFAULT_GDRIVE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxsPWgk2oCtPonqureAavt31CGJmtjYRHAGGHDH7ygoPs-wPVhYfxjpLbm6dsZBUqBW8g/exec';
const DEFAULT_GDRIVE_ACCESS_TOKEN = '';
const DEFAULT_GDRIVE_CLIENT_ID = '280458758298-te0gq3q3jnqee0ca9gpa8itujltu6hne.apps.googleusercontent.com';

// রিপোর্টের তারিখ এক দিন আগে/পরে সরানো
const shiftDateKey = (dateKey, days) => {
  const base = new Date(`${dateKey || localDateKey()}T00:00:00`);
  if (isNaN(base.getTime())) return localDateKey();
  base.setDate(base.getDate() + days);
  return localDateKey(base);
};

const DEFAULT_TEAM_MEMBERS = [
  { id: 'STAFF-01', name: 'লাদেন', role: 'রিসেপশনিস্ট', pin: '1111', color: 'bg-emerald-600', isAdmin: false },
  { id: 'STAFF-02', name: 'সুজন', role: 'রিসেপশনিস্ট', pin: '2222', color: 'bg-blue-600', isAdmin: false },
  { id: 'ADMIN-01', name: 'উবায়দুল', role: 'অ্যাডমিনিস্ট্রেটর', pin: ';', color: 'bg-rose-700', isAdmin: true }
];

// গেস্ট ও TV MOOD সেশন — রিফ্রেশের পরও একই সেশন ফিরে পাওয়ার জন্য মডিউল-লেভেলে রাখা
const GUEST_SESSION_USER = { id: 'GUEST-01', name: 'গেস্ট (দর্শক)', role: 'গেস্ট', pin: '', color: 'bg-teal-600', isAdmin: false, isGuest: true };
const TV_SESSION_USER = { id: 'TV-01', name: 'TV MOOD', role: 'tv', pin: '', color: 'bg-indigo-700', isAdmin: false, isTvMode: true };
// গেস্ট সিরিয়াল আবেদন: আবেদনের মুহূর্তেই টোকেন নম্বর বুক হয় — অনুমোদন না হলে সেই নম্বর ফাঁকা থাকে
const EMPTY_SERIAL_BLOCK = new Set();

const appStatusLabel = (status) => {
  if (status === 'APPROVED') return 'অনুমোদিত';
  if (status === 'REJECTED') return 'বাতিল';
  if (status === 'DISMISSED') return 'সরানো';
  return 'অপেক্ষমাণ';
};

const applicationSerialOf = (app) => {
  const granted = Number(app && app.grantedSerial ? app.grantedSerial : 0) || 0;
  if (granted > 0) return granted;
  return Number(app && app.reservedSerial ? app.reservedSerial : 0) || 0;
};

const isVacantApplication = (app) => Boolean(app) && app.status !== 'PENDING' && !(Number(app.grantedSerial) > 0) && applicationSerialOf(app) > 0;

// সংরক্ষিত আইডি থেকে আসল ইউজার (টিমের কাস্টম সদস্য → গেস্ট/TV → ডিফল্ট সদস্য)
const resolveStoredUserId = (savedId) => {
  if (!savedId) return null;
  if (savedId === GUEST_SESSION_USER.id) return GUEST_SESSION_USER;
  if (savedId === TV_SESSION_USER.id) return TV_SESSION_USER;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = JSON.parse(localStorage.getItem('amh_saved_team_members') || 'null');
      if (Array.isArray(saved)) {
        const custom = saved.find(m => m && m.id === savedId);
        if (custom) return custom;
      }
    }
  } catch {}
  return DEFAULT_TEAM_MEMBERS.find(m => m.id === savedId) || null;
};

const persistActiveUserId = (id) => {
  try {
    if (IS_MINI_PREVIEW) return; // প্রিভিউ iframe মূল ট্যাবের লগইন-সেশন ছুঁবে না
    if (id) localStorage.setItem('amh_active_user_id', id);
    else localStorage.removeItem('amh_active_user_id');
  } catch {}
};

// টিভির ব্রাউজারে শুধু ঠিকানা দিয়েই ডিসপ্লে বোর্ড খোলার জন্য: ?user=tv, ?user=TV-01 বা ?tv=1..4
// (?tv=2 মানে TV-2 বোর্ড, ?tv=3 মানে TV-3 — প্রতি টিভির জন্য আলাদা স্থায়ী লিঙ্ক)
const resolveUrlSessionUser = () => {
  try {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const u = (params.get('user') || '').toLowerCase();
    const tv = params.get('tv');
    if (u === 'tv' || u === 'tv-01' || ['1', '2', '3', '4'].includes(tv)) return TV_SESSION_USER;
  } catch {}
  return null;
};

// আগের ডিফল্ট টেমপ্লেট — যাদের সেভ করা টেমপ্লেট এখনো পুরোনো ডিফল্টটাই, তারা নতুনটি পাবেন
const LEGACY_WHATSAPP_TEMPLATE = `🏥 *আনছারী মেডিকেল হল*
মোঃ উবায়দুল হক, ডিপ্লোমা ইন মেডিকেল ফ্যাকাল্টি

আপনার সিরিয়াল সফলভাবে নিশ্চিত হয়েছে!
----------------------------------
👤 নাম: {patientName}
🔢 টোকেন নম্বর: #{serialNumber} ({category})
📅 তারিখ: {dateLabel} ({appointmentDate})
⏰ {estCall}
----------------------------------
অনুগ্রহ করে নির্ধারিত সময়ে উপস্থিত থাকুন। ধন্যবাদ!

রোগীর নতুন সিরিয়াল দিতে ও আপনার অপেক্ষমান তালিক দেখতে ভিজিট করুন https://sites.google.com/view/amh3`;

const DEFAULT_WHATSAPP_TEMPLATE = `🏥 *আনছারী মেডিকেল হল*
মোঃ উবায়দুল হক

আপনার সিরিয়াল সফলভাবে নিশ্চিত হয়েছে!
----------------------------------
👤 নাম: {patientName}
🔢 টোকেন নম্বর: #{serialNumber} ({category})
📅 তারিখ: {dateLabel} ({appointmentDate})
⏰ {estCall}
📝 {currentstatus}
----------------------------------
অনুগ্রহ করে নির্ধারিত সময়ে উপস্থিত থাকুন। ধন্যবাদ!

রোগীর নতুন সিরিয়াল ও আপনার অপেক্ষমাণ তালিকা দেখতে ভিজিট করুন

https://amh3-4wrai3j1ldp.qoder.website/`;

const formatCompactAge = (p) => {
  const y = Number(p && p.ageYears) || 0;
  const m = Number(p && p.ageMonths) || 0;
  const d = Number(p && p.ageDays) || 0;
  if (y > 0) return `${toBengaliDigits(y)} বছর`;
  if (m > 0) return `${toBengaliDigits(m)} মাস`;
  return `${toBengaliDigits(d)} দিন`;
};

const splitDoctorTitle = (title) => {
  const parts = String(title || '').split(/[,،]/);
  return { name: (parts[0] || '').trim(), qualification: parts.slice(1).join(', ').trim() };
};

const normalizeWhatsappTemplate = (tpl) =>
  (!tpl || tpl === LEGACY_WHATSAPP_TEMPLATE ? DEFAULT_WHATSAPP_TEMPLATE : tpl);

const AGE_PRESETS = [
  { label: '৬m', years: 0, months: 6 },
  { label: '১y', years: 1, months: 0 },
  { label: '২y', years: 2, months: 0 },
  { label: '৩y', years: 3, months: 0 },
  { label: '৫y', years: 5, months: 0 },
  { label: '৭y', years: 7, months: 0 },
  { label: '১০y', years: 10, months: 0 },
  { label: '১৫y', years: 15, months: 0 },
  { label: '২০y', years: 20, months: 0 },
  { label: '২৫y', years: 25, months: 0 },
  { label: '৩০y', years: 30, months: 0 },
  { label: '৪০y', years: 40, months: 0 },
  { label: '৫০y', years: 50, months: 0 },
  { label: '৬০y', years: 60, months: 0 }
];



const SYNC_COALESCE_MS = 120;

// বাংলা সংখ্যা → ইংরেজি সংখ্যা (লাইভ কিউ ড্যাশবোর্ডের টোকেন চিপে "Token 1" ধরনের লেখার জন্য)
const toLatinDigits = (v) => String(v ?? '').replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09E6));

// "বসুন" — চেয়ারে বসা মানুষের রঙিন আইকন (public/icons/sit.png, স্বচ্ছ ব্যাকগ্রাউন্ড)
const SitIcon = ({ className = '' }) => (
  <img src="/icons/sit.png" alt="" aria-hidden="true" draggable={false} className={`select-none pointer-events-none ${className}`} style={{ objectFit: 'contain' }} />
);

// "প্রবেশ" — দরজায় ঢুকছে এমন মানুষের রঙিন আইকন (public/icons/enter.png, স্বচ্ছ ব্যাকগ্রাউন্ড)
const EnterIcon = ({ className = '' }) => (
  <img src="/icons/enter.png" alt="" aria-hidden="true" draggable={false} className={`select-none pointer-events-none ${className}`} style={{ objectFit: 'contain' }} />
);

// "অনুপস্থিত" — ক্রস-চিহ্নসহ মানুষের রঙিন আইকন (public/icons/absence.png, স্বচ্ছ ব্যাকগ্রাউন্ড)
const AbsentIcon = ({ className = '' }) => (
  <img src="/icons/absence.png" alt="" aria-hidden="true" draggable={false} className={`select-none pointer-events-none ${className}`} style={{ objectFit: 'contain' }} />
);

// "বাতিল" — CANCEL বাটনের রঙিন আইকন (public/icons/cancel.png, স্বচ্ছ ব্যাকগ্রাউন্ড); নিচে লেবেল লাগে না
const CancelIcon = ({ className = '' }) => (
  <img src="/icons/cancel.png" alt="" aria-hidden="true" draggable={false} className={`select-none pointer-events-none ${className}`} style={{ objectFit: 'contain' }} />
);

// "রিডো" — RESET বাটনের রঙিন আইকন (public/icons/reset.png, স্বচ্ছ ব্যাকগ্রাউন্ড); নিচে লেবেল লাগে না
const ResetIcon = ({ className = '' }) => (
  <img src="/icons/reset.png" alt="" aria-hidden="true" draggable={false} className={`select-none pointer-events-none ${className}`} style={{ objectFit: 'contain' }} />
);

// "সম্পন্ন" — সুস্থ/সফল মানুষের রঙিন আইকন (public/icons/healthy.png, স্বচ্ছ ব্যাকগ্রাউন্ড)
const DoneIcon = ({ className = '' }) => (
  <img src="/icons/healthy.png" alt="" aria-hidden="true" draggable={false} className={`select-none pointer-events-none ${className}`} style={{ objectFit: 'contain' }} />
);

// "ডিলিট" — Delete বাটনের রঙিন আইকন (public/icons/delete.png, স্বচ্ছ ব্যাকগ্রাউন্ড); নিচে লেবেল লাগে না
const DeleteIcon = ({ className = '' }) => (
  <img src="/icons/delete.png" alt="" aria-hidden="true" draggable={false} className={`select-none pointer-events-none ${className}`} style={{ objectFit: 'contain' }} />
);

// "এডিট" — ক্লিপবোর্ড+পেন্সিলের রঙিন আইকন (public/icons/edit.png, ব্যাকগ্রাউন্ড ট্রান্সপারেন্ট করা হয়েছে)
const EditIcon = ({ className = '' }) => (
  <img src="/icons/edit.png" alt="" aria-hidden="true" draggable={false} className={`select-none pointer-events-none ${className}`} style={{ objectFit: 'contain' }} />
);

const SmsIcon = ({ className = '' }) => (
  <img src="/icons/sms.png" alt="" aria-hidden="true" draggable={false} className={`select-none pointer-events-none ${className}`} style={{ objectFit: 'contain' }} />
);

const QueuePatientRow = React.memo(function QueuePatientRow({
  patient,
  isSelected,
  isMarked,
  hasMarks,
  projectedCallTime,
  isGuest,
  isAdmin,
  themeStyles,
  actionsRef,
  registerCard,
  tokenLabel,
  currentSerial
}) {
  const actions = actionsRef.current || {};
                  const isChild = patient.isChildUnder4;

                  const getStatusCardClasses = () => {
                    if (isSelected) {
                      return 'bg-slate-700 border border-slate-600 border-l-slate-900 text-white shadow-xl';
                    }
                    switch (patient.status) {
                      case 'COMPLETED':
                        return 'bg-emerald-100 border border-emerald-400 border-l-emerald-700 text-emerald-950 shadow-sm';
                      case 'CALLED':
                        return 'bg-blue-100 border border-blue-400 border-l-blue-700 text-blue-950 ring-2 ring-blue-500/70 shadow-md';
                      case 'ABSENT':
                        return 'bg-purple-100 border border-purple-400 border-l-purple-700 text-purple-950 shadow-sm';
                      case 'CANCELLED':
                        return 'bg-rose-100 border border-rose-400 border-l-rose-700 text-rose-950 shadow-sm';
                      case 'WAITING':
                      default:
                        return `${themeStyles.card} ${isChild ? (themeStyles.borderChild || 'border-l-blue-500') : (themeStyles.borderGen || 'border-l-emerald-600')}`;
                    }
                  };

                  return (
                    <div
                      ref={(el) => registerCard(patient.id, el)}
                      tabIndex={0}
                      role="group"
                      aria-label={`রোগী ${patient.name}, টোকেন ${tokenLabel || toBengaliDigits(patient.serialNumber)}${currentSerial ? `, বর্তমান সিরিয়াল ${currentSerial}` : ''}${isSelected ? ', নির্বাচিত' : ''}${isMarked ? ', মার্কড' : ''}`}
                      data-queue-selected={isSelected ? 'true' : 'false'}
                      data-queue-marked={isMarked ? 'true' : 'false'}
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey) { e.preventDefault(); actions.toggleMarkQueuePatient(patient.id); }
                        else { actions.selectPatient(patient.id); }
                      }}
                      onContextMenu={(e) => { e.preventDefault(); actions.toggleMarkQueuePatient(patient.id); }}
                      onFocusCapture={() => actions.selectPatient(patient.id)}
                      className={`rounded-[19px] outline-none transition-shadow duration-200 ${
                        isSelected ? '' : 'focus-visible:shadow-[0_0_0_2px_#94a3b8]'
                      } ${isMarked ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-white shadow-lg' : ''}`}
                    >
                    <QueueSpotlightCard
                      className={isSelected ? 'is-selected' : ''}
                      surfaceClassName={`p-3 sm:py-1.5 sm:px-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2 transition-all duration-300 border-l-4 ${getStatusCardClasses()}`}
                    >
                      <div className="flex items-start sm:items-center gap-2.5 sm:gap-2 min-w-0">
                        {currentSerial ? (
                          <div className="w-9 h-11 sm:h-9 rounded-2xl sm:rounded-xl flex flex-col items-center justify-center font-black shrink-0 bg-slate-100 text-slate-700 border border-slate-300 shadow-sm">
                            <span className="text-[8px] uppercase leading-none opacity-70">বর্তমান</span>
                            <span className="text-sm sm:text-base leading-none mt-0.5">{currentSerial}</span>
                          </div>
                        ) : null}
                        <div
                          className={`min-w-11 px-1 h-11 sm:h-9 rounded-2xl sm:rounded-xl flex flex-col items-center justify-center font-black shrink-0 shadow-sm ${
                            isChild ? themeStyles.badgeChild : themeStyles.badgeGen
                          }`}
                        >
                          <span className="text-[10px] uppercase leading-none opacity-80">{"Token "}</span>
                          <span className="text-base sm:text-lg leading-none mt-0.5 sm:mt-0">{toLatinDigits(tokenLabel || `#${patient.serialNumber}`)}</span>
                        </div>

                        <div className="sm:flex sm:items-center sm:gap-x-2 sm:gap-y-0.5 sm:flex-wrap min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className={`text-sm sm:text-base font-black leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>{patient.name}</h3>
                            {patient.status === 'COMPLETED' && (
                              <span className="text-[11px] font-black bg-emerald-200 text-emerald-950 border border-emerald-500 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-700" />
                                <span>সেবা সম্পন্ন</span>
                              </span>
                            )}
                            {patient.status === 'CALLED' && (
                              <span className="text-[11px] font-black bg-blue-200 text-blue-950 border border-blue-500 px-1.5 py-0.2 rounded-md flex items-center gap-1 animate-pulse">
                                <PhoneForwarded className="w-3 h-3 text-blue-700" />
                                <span>বর্তমানে ডাকা হচ্ছে</span>
                              </span>
                            )}
                            {patient.status === 'ABSENT' && (
                              <span className="text-[11px] font-black bg-purple-200 text-purple-950 border border-purple-500 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                                <UserX className="w-3 h-3 text-purple-700" />
                                <span>অনুপস্থিত</span>
                              </span>
                            )}
                            {patient.status === 'CANCELLED' && (
                              <span className="text-[11px] font-black bg-rose-200 text-rose-950 border border-rose-500 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-rose-700" />
                                <span>স্থগিত / বাতিল</span>
                              </span>
                            )}
                            {patient.patientCode && (
                              <span className="text-[11px] font-mono font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.2 rounded-md">
                                ID: {patient.patientCode}
                              </span>
                            )}
                            <span className={`text-sm font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-slate-600/80 text-slate-100 opacity-100' : 'bg-slate-100 text-slate-900'}`}>
                              {toBengaliDigits(patient.ageYears)}y {toBengaliDigits(patient.ageMonths)}m {toBengaliDigits(patient.ageDays || 0)}d
                            </span>
                            {patient.phoneNumber && (
                              <span className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1 ${isSelected ? 'bg-slate-600/80 text-slate-100' : 'text-slate-700 bg-slate-100'}`}>
                                <Phone className={`w-3 h-3 opacity-70 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                <span>{patient.phoneNumber}</span>
                              </span>
                            )}
                          </div>

                          <div className={`flex items-center gap-1.5 text-xs font-medium mt-0.5 sm:mt-0 ${isSelected ? 'text-slate-300 opacity-100' : 'text-slate-600 opacity-75'}`}>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 opacity-60" />
                              <span>{patient.registeredAt}</span>
                            </span>
                            {patient.symptoms && (
                              <>
                                <span>•</span>
                                <span className={`font-semibold ${isSelected ? 'text-slate-100' : 'text-slate-700'}`}>{patient.symptoms}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-bold p-1 sm:p-0 rounded-xl sm:shrink-0">
                        <span className={`flex items-center gap-1 whitespace-nowrap ${isSelected ? 'text-emerald-200' : 'text-emerald-800'}`}>
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{projectedCallTime}</span>
                        </span>
                      </div>

                      {!isGuest && (
                      <div className={`flex flex-wrap items-center justify-between gap-x-8 sm:gap-x-1.5 gap-y-1.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 sm:flex-row sm:justify-end ${isSelected ? 'border-slate-500/60' : 'border-slate-200/60'}`}>
                        {/* রোগীর তথ্য: এডিট ও WhatsApp — মোবাইলে ছোট, একই লাইনের বামে */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => actions.handleOpenEditQueuePatient(patient)}
                            className="w-9 h-9 flex flex-col items-center justify-center gap-0 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 rounded-lg transition cursor-pointer shadow-2xs"
                            title="রোগীর সিরিয়াল তথ্য সংশোধন করুন (Ctrl+E)"
                            aria-label="রোগীর সিরিয়াল তথ্য সংশোধন করুন (Ctrl+E)"
                            aria-keyshortcuts="Control+E"
                          >
                            <EditIcon className="w-6 h-6" />
                  <span className="text-[9px] font-black leading-none mt-0">এডিট</span>
                          </button>

                          {patient.phoneNumber && (
                            <button
                              type="button"
                              onClick={() => actions.handleSendWhatsApp(patient, actions.queuePatients)}
                              className="w-9 h-9 flex items-center justify-center gap-0 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition cursor-pointer shadow-2xs"
                              title={`WhatsApp বার্তা পাঠান (${patient.phoneNumber}) (Ctrl+M)`}
                              aria-label={`WhatsApp বার্তা পাঠান (${patient.phoneNumber}) (Ctrl+M)`}
                              aria-keyshortcuts="Control+M"
                            >
                              <SmsIcon className="w-9 h-9" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => actions.handleDeleteClick(patient)}
                              className="w-9 h-9 flex items-center justify-center gap-0 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg transition cursor-pointer shadow-xs"
                              title={`${patient.name} কে ডিলিট করুন (শুধু অ্যাডমিন)`}
                              aria-label={`${patient.name} কে ডিলিট করুন`}
                            >
                              <DeleteIcon className="w-9 h-9" />
                            </button>
                          )}
                        </div>

                        {/* স্ট্যাটাস: শুধু আইকন — মোবাইলে আরও ছোট, একই লাইনের ডানে */}
                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto">
                          <button
                            type="button"
                            disabled={patient.status === 'COMPLETED' && !hasMarks}
                            aria-pressed={patient.status === 'COMPLETED'}
                            onClick={() => actions.runQueueStatusAction('COMPLETED', patient.id)}
                            className={`h-9 w-9 rounded-lg transition border flex flex-col items-center justify-center gap-0 ${
                              patient.status === 'COMPLETED'
                                ? 'bg-emerald-200 text-emerald-900 border-emerald-500 ring-2 ring-emerald-400 cursor-not-allowed shadow-inner'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300 cursor-pointer shadow-xs'
                            }`}
                            title={patient.status === 'COMPLETED' ? 'ইতোমধ্যে সেবা সম্পন্ন (Ctrl+Space)' : 'সেবা সম্পন্ন চিহ্নিত করুন (Ctrl+Space)'}
                            aria-label={patient.status === 'COMPLETED' ? 'ইতোমধ্যে সেবা সম্পন্ন (Ctrl+Space)' : 'সেবা সম্পন্ন চিহ্নিত করুন (Ctrl+Space)'}
                            aria-keyshortcuts="Control+Space"
                          >
                            <DoneIcon className="w-6 h-6" />
                  <span className="text-[9px] font-black leading-none mt-0">সম্পন্ন</span>
                          </button>

                          <button
                            type="button"
                            disabled={patient.status === 'CALLED' && !hasMarks}
                            aria-pressed={patient.status === 'CALLED'}
                            onClick={() => actions.runQueueStatusAction('CALLED', patient.id)}
                            className={`h-9 w-9 rounded-lg transition border flex flex-col items-center justify-center gap-0 ${
                              patient.status === 'CALLED'
                                ? 'bg-blue-200 text-blue-900 border-blue-500 ring-2 ring-blue-400 cursor-not-allowed shadow-inner'
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 cursor-pointer shadow-xs'
                            }`}
                            title={patient.status === 'CALLED' ? 'বর্তমানে ডাকা হচ্ছে (Ctrl+D)' : 'বসুন (পুনরায় ডাকুন) (Ctrl+D)'}
                            aria-label={patient.status === 'CALLED' ? 'বর্তমানে ডাকা হচ্ছে (Ctrl+D)' : 'বসুন (Ctrl+D)'}
                            aria-keyshortcuts="Control+D"
                          >
                            <SitIcon className="w-6 h-6" />
                  <span className="text-[9px] font-black leading-none mt-0">বসুন</span>
                          </button>

                          <button
                            type="button"
                            aria-pressed={patient.inChamber === true}
                            onClick={() => actions.toggleInChamber(patient.id)}
                            className={`h-9 w-9 rounded-lg transition border flex flex-col items-center justify-center gap-0 ${
                              patient.inChamber
                                ? 'bg-indigo-200 text-indigo-900 border-indigo-500 ring-2 ring-indigo-400 shadow-inner'
                                : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-300 shadow-xs'
                            } cursor-pointer`}
                            title={patient.inChamber ? 'চেম্বারে প্রবেশ করেছে — আবার চাপলে বের করে আনুন' : 'প্রবেশ — রোগী চেম্বারে প্রবেশ করেছে'}
                            aria-label={patient.inChamber ? `${patient.name} কে প্রবেশ থেকে সরান` : `${patient.name} কে প্রবেশ চিহ্নিত করুন`}
                          >
                            <EnterIcon className="w-6 h-6" />
                  <span className="text-[9px] font-black leading-none mt-0">প্রবেশ</span>
                          </button>

                          <button
                            type="button"
                            disabled={patient.status === 'ABSENT' && !hasMarks}
                            aria-pressed={patient.status === 'ABSENT'}
                            onClick={() => actions.runQueueStatusAction('ABSENT', patient.id)}
                            className={`h-9 w-9 rounded-lg transition border flex flex-col items-center justify-center gap-0 ${
                              patient.status === 'ABSENT'
                                ? 'bg-purple-200 text-purple-900 border-purple-500 ring-2 ring-purple-400 cursor-not-allowed shadow-inner'
                                : 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300 cursor-pointer shadow-xs'
                            }`}
                            title={patient.status === 'ABSENT' ? 'ইতোমধ্যে অনুপস্থিত (Ctrl+A)' : 'অনুপস্থিত চিহ্নিত করুন (Ctrl+A)'}
                            aria-label={patient.status === 'ABSENT' ? 'ইতোমধ্যে অনুপস্থিত (Ctrl+A)' : 'অনুপস্থিত চিহ্নিত করুন (Ctrl+A)'}
                            aria-keyshortcuts="Control+A"
                          >
                            <AbsentIcon className="w-6 h-6" />
                  <span className="text-[9px] font-black leading-none mt-0">অনুপ.</span>
                          </button>

                          <button
                            type="button"
                            disabled={patient.status === 'CANCELLED' && !hasMarks}
                            aria-pressed={patient.status === 'CANCELLED'}
                            onClick={() => actions.runQueueStatusAction('CANCELLED', patient.id)}
                            className={`h-9 w-9 rounded-lg transition flex items-center justify-center gap-0 ${
                              patient.status === 'CANCELLED'
                                ? 'bg-rose-200 text-rose-900 ring-2 ring-rose-400 cursor-not-allowed shadow-inner'
                                : 'bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer shadow-xs'
                            }`}
                            title={patient.status === 'CANCELLED' ? 'ইতোমধ্যে বাতিল (Ctrl+K)' : 'বাতিল চিহ্নিত করুন (Ctrl+K)'}
                            aria-label={patient.status === 'CANCELLED' ? 'ইতোমধ্যে বাতিল (Ctrl+K)' : 'বাতিল চিহ্নিত করুন (Ctrl+K)'}
                            aria-keyshortcuts="Control+K"
                          >
                            <CancelIcon className="w-9 h-9" />
                          </button>

                          <button
                            type="button"
                            disabled={patient.status === 'WAITING' && !hasMarks}
                            aria-pressed={patient.status === 'WAITING'}
                            onClick={() => actions.runQueueStatusAction('WAITING', patient.id)}
                            className={`h-9 w-9 rounded-lg transition border flex items-center justify-center gap-0 ${
                              patient.status === 'WAITING'
                                ? 'bg-cyan-200 text-cyan-900 border-cyan-500 ring-2 ring-cyan-400 cursor-not-allowed shadow-inner'
                                : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border-cyan-300 cursor-pointer shadow-xs'
                            }`}
                            title={patient.status === 'WAITING' ? 'ইতোমধ্যে অপেক্ষমান তালিকায় রয়েছে (Ctrl+R)' : 'Redo (পুনরায় অপেক্ষমান তালিকায় ফিরিয়ে আনা) (Ctrl+R)'}
                            aria-label={patient.status === 'WAITING' ? 'পুনরায় অপেক্ষমান তালিকায় ফিরিয়ে আনা (Ctrl+R)' : 'পুনরায় অপেক্ষমান তালিকায় ফিরিয়ে আনা (Ctrl+R)'}
                            aria-keyshortcuts="Control+R"
                          >
                            <ResetIcon className="w-8 h-8" />
                          </button>
                        </div>
                      </div>
                      )}
                    </QueueSpotlightCard>
                    </div>
                  );
});







// ————— Draw Annotation helpers —————
const ANNOTATION_COLORS = [
  { id: 'rose', value: '#f43f5e', label: 'লাল' },
  { id: 'amber', value: '#f59e0b', label: 'হলুদ' },
  { id: 'emerald', value: '#10b981', label: 'সবুজ' },
  { id: 'sky', value: '#0ea5e9', label: 'নীল' },
  { id: 'violet', value: '#8b5cf6', label: 'বেগুনি' }
];

const ANNOTATION_TOOLS = [
  { id: 'rect', label: 'বক্স' },
  { id: 'ellipse', label: 'গোল' },
  { id: 'arrow', label: 'তীর' },
  { id: 'pen', label: 'পেন' }
];

let cachedAnnotationCssText = null;
function getAnnotationCaptureCssText() {
  if (cachedAnnotationCssText !== null) return cachedAnnotationCssText;
  let cssText = '';
  try {
    const sheets = Array.from(document.styleSheets || []);
    for (const sheet of sheets) {
      let rules = null;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        try {
          if (rule && typeof rule.cssText === 'string') cssText += `${rule.cssText}\n`;
        } catch {}
      }
    }
  } catch {}
  if (cssText.length > 1000) cachedAnnotationCssText = cssText;
  return cssText;
}

function getAnnotationArrowHead(x1, y1, x2, y2, headLength) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const wingA = angle + Math.PI * 0.82;
  const wingB = angle - Math.PI * 0.82;
  return {
    p1: { x: x2 + headLength * Math.cos(wingA), y: y2 + headLength * Math.sin(wingA) },
    p2: { x: x2 + headLength * Math.cos(wingB), y: y2 + headLength * Math.sin(wingB) }
  };
}

function drawAnnotationShapeOnCanvas(ctx, shape, strokeWidth) {
  if (!ctx || !shape) return;
  const color = shape.color || '#f43f5e';
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (shape.type === 'rect') {
    const x = Math.min(shape.x1, shape.x2);
    const y = Math.min(shape.y1, shape.y2);
    const w = Math.abs(shape.x2 - shape.x1);
    const h = Math.abs(shape.y2 - shape.y1);
    if (w > 1 && h > 1) ctx.strokeRect(x, y, w, h);
  } else if (shape.type === 'ellipse') {
    const x = Math.min(shape.x1, shape.x2);
    const y = Math.min(shape.y1, shape.y2);
    const w = Math.abs(shape.x2 - shape.x1);
    const h = Math.abs(shape.y2 - shape.y1);
    if (w > 1 && h > 1) {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (shape.type === 'arrow') {
    ctx.beginPath();
    ctx.moveTo(shape.x1, shape.y1);
    const tipX = shape.x2;
    const tipY = shape.y2;
    const head = Math.max(strokeWidth * 4.2, 14);
    const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
    const lineEndX = tipX - Math.cos(angle) * head * 0.72;
    const lineEndY = tipY - Math.sin(angle) * head * 0.72;
    ctx.lineTo(lineEndX, lineEndY);
    ctx.stroke();
    const { p1, p2 } = getAnnotationArrowHead(shape.x1, shape.y1, tipX, tipY, head);
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fill();
  } else if (shape.type === 'pen' && Array.isArray(shape.points) && shape.points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    for (let i = 1; i < shape.points.length; i++) {
      ctx.lineTo(shape.points[i].x, shape.points[i].y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function AnnotationShapeSvg({ shape, strokeWidth }) {
  if (!shape) return null;
  const color = shape.color || '#f43f5e';
  const common = {
    stroke: color,
    strokeWidth,
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };

  if (shape.type === 'rect') {
    const x = Math.min(shape.x1, shape.x2);
    const y = Math.min(shape.y1, shape.y2);
    const w = Math.abs(shape.x2 - shape.x1);
    const h = Math.abs(shape.y2 - shape.y1);
    if (w < 1 || h < 1) return null;
    return <rect x={x} y={y} width={w} height={h} rx={strokeWidth * 0.7} {...common} />;
  }
  if (shape.type === 'ellipse') {
    const x = Math.min(shape.x1, shape.x2);
    const y = Math.min(shape.y1, shape.y2);
    const w = Math.abs(shape.x2 - shape.x1);
    const h = Math.abs(shape.y2 - shape.y1);
    if (w < 1 || h < 1) return null;
    return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />;
  }
  if (shape.type === 'arrow') {
    if (Math.abs(shape.x2 - shape.x1) < 1 && Math.abs(shape.y2 - shape.y1) < 1) return null;
    const head = Math.max(strokeWidth * 4.2, 14);
    const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
    const lineEndX = shape.x2 - Math.cos(angle) * head * 0.72;
    const lineEndY = shape.y2 - Math.sin(angle) * head * 0.72;
    const { p1, p2 } = getAnnotationArrowHead(shape.x1, shape.y1, shape.x2, shape.y2, head);
    return (
      <g>
        <line x1={shape.x1} y1={shape.y1} x2={lineEndX} y2={lineEndY} {...common} />
        <polygon points={`${shape.x2},${shape.y2} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={color} stroke="none" />
      </g>
    );
  }
  if (shape.type === 'pen' && Array.isArray(shape.points) && shape.points.length > 1) {
    return (
      <polyline
        points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
        {...common}
      />
    );
  }
  return null;
}

function calculateAgeFromDob(dobString) {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days)
  };
}

function formatAgeResult(years, months, days) {
  const compact = `${toBengaliDigits(years)}y ${toBengaliDigits(months)}m${days > 0 ? ` ${toBengaliDigits(days)}d` : ''}`;
  const parts = [];
  if (years > 0) parts.push(`${toBengaliDigits(years)} বছর`);
  if (months > 0) parts.push(`${toBengaliDigits(months)} মাস`);
  if (days > 0 || parts.length === 0) parts.push(`${toBengaliDigits(days)} দিন`);
  const full = parts.join(' ');

  return {
    years,
    months,
    days,
    formattedCompact: compact,
    formattedFull: full
  };
}

function getRealtimeAdjustedAge(rec) {
  if (!rec) return { years: 0, months: 0, days: 0, formattedCompact: '০y ০m', formattedFull: '০ দিন' };

  const today = new Date();

  // If dob is available, calculate exact age from dob
  if (rec.dob) {
    const computed = calculateAgeFromDob(rec.dob);
    if (computed) {
      return formatAgeResult(computed.years, computed.months, computed.days);
    }
  }

  const regY = Number(parseBengaliDigits(rec.ageYears)) || 0;
  const regM = Number(parseBengaliDigits(rec.ageMonths)) || 0;
  const regD = Number(parseBengaliDigits(rec.ageDays)) || 0;

  const regDateStr = rec.createdDate || rec.appointmentDate || rec.lastVisitDate || TODAY_KEY;
  const regDate = new Date(regDateStr.split('T')[0] + 'T00:00:00');

  if (isNaN(regDate.getTime())) {
    return formatAgeResult(regY, regM, regD);
  }

  // Calculate approximate birth date by subtracting registered age from registration date
  let bYear = regDate.getFullYear() - regY;
  let bMonth = regDate.getMonth() - regM;
  let bDay = regDate.getDate() - regD;

  while (bDay < 1) {
    bMonth -= 1;
    if (bMonth < 0) {
      bYear -= 1;
      bMonth += 12;
    }
    const daysInPrevMonth = new Date(bYear, bMonth + 1, 0).getDate();
    bDay += daysInPrevMonth;
  }
  while (bMonth < 0) {
    bYear -= 1;
    bMonth += 12;
  }

  // Now calculate current age from approximate birth date to today
  let years = today.getFullYear() - bYear;
  let months = today.getMonth() - bMonth;
  let days = today.getDate() - bDay;

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  years = Math.max(0, years);
  months = Math.max(0, months);
  days = Math.max(0, days);

  return formatAgeResult(years, months, days);
}

function parseBengaliDigits(str) {
  if (!str) return '';
  const bnMap = { '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9 };
  return String(str).replace(/[০-৯]/g, d => bnMap[d]);
}

function normalizeBangladeshPhone(rawInput) {
  if (!rawInput) return null;
  const englishDigits = parseBengaliDigits(rawInput).replace(/[^0-9]/g, '');
  if (/^01[3-9]\d{8}$/.test(englishDigits)) {
    return '88' + englishDigits;
  }
  if (/^8801[3-9]\d{8}$/.test(englishDigits)) {
    return englishDigits;
  }
  if (/^1[3-9]\d{8}$/.test(englishDigits)) {
    return '880' + englishDigits;
  }
  return null;
}

async function safeCopyToClipboard(textToCopy) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    }
  } catch {}
  try {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) return true;
  } catch (err) {
    console.warn('Fallback copy error:', err);
  }
  return false;
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'ansari-clinic-serial-app';
let db = null;
let auth = null;

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (err) {
  console.warn('Cloud initialization notice:', err);
}

const MQTT_BROKERS = [];

function normalizeRoomKey(raw) {
  const str = String(raw || DEFAULT_CHANNEL_ID).trim();
  if (str.includes('লাদেন') || str.toLowerCase().includes('laden')) {
    return 'laden';
  }
  const cleaned = str
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');
  return cleaned || DEFAULT_CHANNEL_ID;
}

function encodeMqttLength(len) {
  const out = [];
  do {
    let digit = len % 128;
    len = Math.floor(len / 128);
    if (len > 0) digit |= 0x80;
    out.push(digit);
  } while (len > 0);
  return out;
}

function encodeMqttString(str) {
  const bytes = new TextEncoder().encode(str);
  return [(bytes.length >> 8) & 0xff, bytes.length & 0xff, ...bytes];
}

function createNativeMqttConnection({ brokerUrl, clientId, topics, onConnect, onDisconnect, onMessage }) {
  let ws = null;
  let pingTimer = null;
  let reconnectTimer = null;
  let isClosedIntentionally = false;
  let isConnected = false;
  let incomingBuffer = new Uint8Array(0);

  const sendRaw = (uint8) => {
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(uint8);
        return true;
      }
    } catch {}
    return false;
  };

  const connect = () => {
    if (isClosedIntentionally || typeof WebSocket === 'undefined') return;
    try {
      ws = new WebSocket(brokerUrl, ['mqtt']);
      ws.binaryType = 'arraybuffer';
    } catch {
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      if (isClosedIntentionally) return;
      incomingBuffer = new Uint8Array(0);
      const cidBytes = encodeMqttString(clientId);
      const varHeader = [0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c];
      const body = [...varHeader, ...cidBytes];
      sendRaw(new Uint8Array([0x10, ...encodeMqttLength(body.length), ...body]));
    };

    ws.onmessage = (ev) => {
      if (isClosedIntentionally || !ev.data) return;
      try {
        const chunk = new Uint8Array(ev.data);
        const combined = new Uint8Array(incomingBuffer.length + chunk.length);
        combined.set(incomingBuffer, 0);
        combined.set(chunk, incomingBuffer.length);
        incomingBuffer = combined;

        let pos = 0;
        while (pos < incomingBuffer.length) {
          const packetStart = pos;
          const headerByte = incomingBuffer[pos++];
          const packetType = headerByte >> 4;

          let multiplier = 1;
          let remLen = 0;
          let encodedByte = 0;

          do {
            if (pos >= incomingBuffer.length) {
              incomingBuffer = incomingBuffer.subarray(packetStart);
              return;
            }
            encodedByte = incomingBuffer[pos++];
            remLen += (encodedByte & 127) * multiplier;
            multiplier *= 128;
            if (multiplier > 128 * 128 * 128) {
              incomingBuffer = new Uint8Array(0);
              return;
            }
          } while ((encodedByte & 128) !== 0);

          const packetEnd = pos + remLen;
          if (packetEnd > incomingBuffer.length) {
            incomingBuffer = incomingBuffer.subarray(packetStart);
            return;
          }

          if (packetType === 2) {
            isConnected = true;
            const subPayload = [];
            topics.forEach((t) => {
              subPayload.push(...encodeMqttString(t), 0x00);
            });
            const subBody = [0x00, 0x01, ...subPayload];
            sendRaw(new Uint8Array([0x82, ...encodeMqttLength(subBody.length), ...subBody]));

            if (pingTimer) clearInterval(pingTimer);
            pingTimer = setInterval(() => {
              sendRaw(new Uint8Array([0xc0, 0x00]));
            }, 20000);

            if (onConnect) onConnect();
          } else if (packetType === 3) {
            const qos = (headerByte >> 1) & 0x03;
            const topicLen = (incomingBuffer[pos] << 8) | incomingBuffer[pos + 1];
            const topicStart = pos + 2;
            const msgTopic = new TextDecoder().decode(incomingBuffer.subarray(topicStart, topicStart + topicLen));
            let payloadPos = topicStart + topicLen;
            if (qos > 0) {
              const packetId = (incomingBuffer[payloadPos] << 8) | incomingBuffer[payloadPos + 1];
              payloadPos += 2;
              sendRaw(new Uint8Array([0x40, 0x02, (packetId >> 8) & 0xff, packetId & 0xff]));
            }
            const payloadStr = new TextDecoder().decode(incomingBuffer.subarray(payloadPos, packetEnd));
            if (onMessage) onMessage(msgTopic, payloadStr);
          }

          pos = packetEnd;
        }

        incomingBuffer = incomingBuffer.subarray(pos);
      } catch (err) {
        console.warn('MQTT parser notice:', err);
      }
    };

    const handleCloseOrError = () => {
      if (isConnected) {
        isConnected = false;
        if (onDisconnect) onDisconnect();
      }
      if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      incomingBuffer = new Uint8Array(0);
      if (!isClosedIntentionally) {
        scheduleReconnect();
      }
    };

    ws.onclose = handleCloseOrError;
    ws.onerror = handleCloseOrError;
  };

  const scheduleReconnect = () => {
    if (isClosedIntentionally) return;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      connect();
    }, 3500);
  };

  connect();

  return {
    get connected() {
      return isConnected && ws && ws.readyState === WebSocket.OPEN;
    },
    publish(topic, messageStr) {
      if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) return false;
      try {
        const topicBytes = encodeMqttString(topic);
        const msgBytes = new TextEncoder().encode(messageStr);
        const bodyLen = topicBytes.length + msgBytes.length;
        const header = 0x30;
        const lenBytes = encodeMqttLength(bodyLen);
        const packet = new Uint8Array(1 + lenBytes.length + bodyLen);
        packet[0] = header;
        packet.set(lenBytes, 1);
        packet.set(topicBytes, 1 + lenBytes.length);
        packet.set(msgBytes, 1 + lenBytes.length + topicBytes.length);
        return sendRaw(packet);
      } catch {
        return false;
      }
    },
    close() {
      isClosedIntentionally = true;
      isConnected = false;
      if (pingTimer) clearInterval(pingTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      incomingBuffer = new Uint8Array(0);
      try {
        if (ws) ws.close();
      } catch {}
    }
  };
}

const MQTT_CHUNK_SIZE = 1200;

function publishWithChunking(clients, topic, jsonString, senderId) {
  if (!jsonString) return;
  if (jsonString.length <= MQTT_CHUNK_SIZE) {
    clients.forEach((c) => {
      try {
        if (c && c.connected) c.publish(topic, jsonString);
      } catch {}
    });
    return;
  }

  const totalChunks = Math.ceil(jsonString.length / MQTT_CHUNK_SIZE);
  const msgId = `${senderId || 'dev'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  for (let i = 0; i < totalChunks; i++) {
    const chunkData = jsonString.slice(i * MQTT_CHUNK_SIZE, (i + 1) * MQTT_CHUNK_SIZE);
    const envelope = JSON.stringify({
      _c: true,
      id: msgId,
      i,
      n: totalChunks,
      d: chunkData,
      s: senderId
    });

    setTimeout(() => {
      clients.forEach((c) => {
        try {
          if (c && c.connected) c.publish(topic, envelope);
        } catch {}
      });
    }, i * 15);
  }
}

function createChunkAssembler(onCompletePayload) {
  const pendingMap = new Map();

  const cleanerTimer = setInterval(() => {
    const now = Date.now();
    for (const [id, item] of pendingMap.entries()) {
      if (item.expiresAt < now) pendingMap.delete(id);
    }
  }, 12000);

  return {
    process(rawText) {
      if (!rawText || typeof rawText !== 'string') return;
      if (!rawText.includes('"_c":true') && !rawText.includes('"_c": true')) {
        try {
          const parsed = JSON.parse(rawText);
          onCompletePayload(parsed);
        } catch {}
        return;
      }

      try {
        const env = JSON.parse(rawText);
        if (!env || !env._c || !env.id) return;
        const { id, i, n, d } = env;

        let entry = pendingMap.get(id);
        if (!entry) {
          entry = {
            total: n,
            receivedCount: 0,
            chunks: new Array(n),
            expiresAt: Date.now() + 30000
          };
          pendingMap.set(id, entry);
        }

        if (entry.chunks[i] === undefined) {
          entry.chunks[i] = d;
          entry.receivedCount++;
        }

        if (entry.receivedCount === entry.total) {
          pendingMap.delete(id);
          const fullStr = entry.chunks.join('');
          const fullObj = JSON.parse(fullStr);
          onCompletePayload(fullObj);
        }
      } catch (err) {
        console.warn('Chunk assemble error:', err);
      }
    },
    destroy() {
      clearInterval(cleanerTimer);
      pendingMap.clear();
    }
  };
}


function generateCardCanvas(patient, clinicName, doctorTitle, ageText) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const width = 1000;
  const height = 620;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // সোনালি + কালো ওয়েভ কার্ড (রেফারেন্স ডিজাইন)
  const gold = ctx.createLinearGradient(0, 0, width, height);
  gold.addColorStop(0, '#C79A3B');
  gold.addColorStop(0.28, '#EFD79B');
  gold.addColorStop(0.62, '#BE8C2C');
  gold.addColorStop(1, '#F2E2B0');
  ctx.save();
  roundRect(10, 10, width - 20, height - 20, 34);
  ctx.fillStyle = gold;
  ctx.fill();
  ctx.clip();

  // কালো অংশ + সোনালি সীমারেখা
  ctx.beginPath();
  ctx.moveTo(410, 10);
  ctx.bezierCurveTo(500, 90, 330, 190, 405, 280);
  ctx.bezierCurveTo(480, 380, 355, 470, 435, height - 10);
  ctx.lineTo(width - 10, height - 10);
  ctx.lineTo(width - 10, 10);
  ctx.closePath();
  ctx.fillStyle = '#0B0C0E';
  ctx.fill();
  const seam = ctx.createLinearGradient(340, 0, 500, height);
  seam.addColorStop(0, '#F7E7B5');
  seam.addColorStop(0.55, '#D9B45F');
  seam.addColorStop(1, '#A97B26');
  ctx.beginPath();
  ctx.moveTo(410, 10);
  ctx.bezierCurveTo(500, 90, 330, 190, 405, 280);
  ctx.bezierCurveTo(480, 380, 355, 470, 435, height - 10);
  ctx.strokeStyle = seam;
  ctx.lineWidth = 7;
  ctx.stroke();

  // বাম অংশ: ক্লিনিক পরিচিতি
  ctx.textAlign = 'center';
  const doctorParts = String(doctorTitle || '').split(/[,،]/);
  const doctorName = (doctorParts[0] || '').trim();
  const doctorQual = doctorParts.slice(1).join(', ').trim();
  ctx.fillStyle = '#2A1D07';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(clinicName || 'আনছারী মেডিকেল হল', 210, 116);
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(doctorName, 210, 150);
  ctx.fillStyle = '#5A4118';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(doctorQual, 210, 176);
  ctx.fillStyle = '#7A5A1E';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('PATIENT HEALTH CARD', 210, 200);

  // বাম নিচে: QR
  const qrSize = 150;
  const qrX = 210 - qrSize / 2;
  const qrY = height - 60 - qrSize;
  ctx.fillStyle = '#FFFFFF';
  roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 14);
  ctx.fill();
  const qrImg = document.getElementById('digital-card-qr-img');
  if (qrImg && qrImg.complete && qrImg.naturalWidth > 0) {
    try { ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize); } catch {}
  } else {
    ctx.fillStyle = '#0B0C0E';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('VERIFIED ID', 210, qrY + qrSize / 2 - 8);
    ctx.font = 'bold 13px monospace';
    ctx.fillText(patient.patientCode || 'AMH-00001', 210, qrY + qrSize / 2 + 16);
    ctx.textAlign = 'left';
  }
  ctx.fillStyle = '#5A4118';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('SCAN TO VERIFY', 210, qrY + qrSize + 30);
  ctx.textAlign = 'left';

  // ডান অংশ: রোগীর তথ্য
  const px = 500;
  const pCode = patient.patientCode || 'AMH-00001';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(patient.name || '', px, 110);
  ctx.fillStyle = '#D9B45F';
  ctx.font = 'bold 17px monospace';
  ctx.fillText(`${pCode} · PATIENT HEALTH CARD`, px, 142);
  ctx.strokeStyle = 'rgba(217, 180, 95, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, 162);
  ctx.lineTo(width - 60, 162);
  ctx.stroke();

  let rowY = 210;
  const rowGap = 70;
  const addRow = (label, value) => {
    ctx.beginPath();
    ctx.arc(px + 12, rowY - 6, 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(217, 180, 95, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#D9B45F';
    ctx.beginPath();
    ctx.arc(px + 12, rowY - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9C968A';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(label, px + 40, rowY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 23px sans-serif';
    ctx.fillText(String(value || ''), px + 200, rowY);
    rowY += rowGap;
  };
  addRow('বয়স', ageText || '');
  addRow('মোবাইল', patient.phoneNumber || 'অনির্ধারিত');
  addRow('রক্তের গ্রুপ', patient.bloodGroup || 'অনির্ধারিত');
  const dateLbl = patient.dob ? 'জন্ম তারিখ' : 'রেজিস্ট্রেশন';
  const dateSrc = patient.dob || patient.createdDate || patient.lastVisitDate || TODAY_KEY;
  const dateVal = toBengaliDigits(formatDateToDDMMYYYY(String(dateSrc)));
  addRow(dateLbl, dateVal);

  ctx.restore();

  return canvas;
}

export default function App({ cloudSyncEnabled = true, onCloudLogin, onCloudLogout } = {}) {
  const t = TRANSLATIONS.bn;

  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('amh_active_theme');
        if (saved && THEMES.some(th => th.id === saved)) {
          return saved;
        }
      }
    } catch {}
    return 'dental-mint';
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && activeTheme) {
        localStorage.setItem('amh_active_theme', activeTheme);
      }
    } catch {}
  }, [activeTheme]);

  // Ctrl+T (বা Ctrl+Alt+T): প্রতিবার চাপে পরের থিমে যায়
  const cycleTheme = useCallback((dir = 1) => {
    const ids = THEMES.map(t => t.id);
    const idx = ids.indexOf(activeTheme);
    const next = ids[(Math.max(0, idx) + dir + ids.length) % ids.length];
    setActiveTheme(next);
    try { localStorage.setItem('amh_active_theme', next); } catch {}
    const name = (THEMES.find(t => t.id === next) || {}).name || next;
    setSyncToast(`🎨 থিম: ${name}`);
    setTimeout(() => setSyncToast(''), 2200);
  }, [activeTheme]);

  useEffect(() => {
    const onThemeKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.shiftKey) return;
      if (String(e.key).toLowerCase() !== 't') return;
      const el = e.target;
      const tag = (el && el.tagName ? el.tagName : '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el && el.isContentEditable)) return;
      e.preventDefault();
      cycleTheme(1);
    };
    window.addEventListener('keydown', onThemeKey, true);
    return () => window.removeEventListener('keydown', onThemeKey, true);
  }, [cycleTheme]);

  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('amh_saved_team_members');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(m =>
              (m && (m.id === 'ADMIN-01' || m.isAdmin) && m.name === 'প্রধান অ্যাডমিন')
                ? { ...m, name: 'উবায়দুল', pin: ';' }
                : m
            );
          }
        }
      }
    } catch {}
    return DEFAULT_TEAM_MEMBERS;
  });

  // পাসওয়ার্ড অপশন অন থাকলে প্রতিবার লগইনে পাসওয়ার্ড আবশ্যক, অফ থাকলে পাসওয়ার্ড ছাড়াই প্রবেশ
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        if (onCloudLogin && !cloudSyncEnabled) return false;
        if (resolveUrlSessionUser()) return true;
        const reqPass = localStorage.getItem('amh_require_login_password');
        const isPassRequired = reqPass !== null ? JSON.parse(reqPass) : true;
        // যদি পাসওয়ার্ড যাচাই বন্ধ (OFF) থাকে, তবে সরাসরি ভেতরে থাকবে
        if (!isPassRequired) {
          return true;
        }
        // যদি পাসওয়ার্ড যাচাই চালু (ON) থাকে, তবে বর্তমান সেশনে অলরেডি অথেন্টিকেটেড কি না
        const uid = localStorage.getItem('amh_active_user_id');
        if (uid) {
          const remember = localStorage.getItem('amh_remember_me') === '1';
          const loginDay = localStorage.getItem('amh_login_day');
          if (remember) return true;
          if (loginDay && loginDay === localDateKey()) return true;
        }
        const sessionAuth = sessionStorage.getItem('amh_session_authenticated');
        return sessionAuth === 'true';
      }
    } catch {}
    return false;
  });

  // মোবাইল ভিউ ও মোবাইল ডিভাইসে স্বয়ংক্রিয়ভাবে 'লাদেন' (STAFF-01) কানেক্ট হবে
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlUser = urlParams.get('user');
        const ladenMember = DEFAULT_TEAM_MEMBERS.find(m => m.name === 'লাদেন' || m.id === 'STAFF-01') || DEFAULT_TEAM_MEMBERS[0];
        const adminMember = DEFAULT_TEAM_MEMBERS.find(m => m.isAdmin) || DEFAULT_TEAM_MEMBERS[DEFAULT_TEAM_MEMBERS.length - 1];

        if (urlUser === 'laden' || urlUser === 'STAFF-01') return ladenMember;
        const urlSessionUser = resolveUrlSessionUser();
        if (urlSessionUser) return urlSessionUser;
        // যে অ্যাকাউন্টে লগইন করা ছিল রিফ্রেশের পর সেটিই ফিরে আসবে — ভিউপোর্ট/ডিভাইস দেখে কাউকে জোর করে বদলানো হয় না
        const storedUser = resolveStoredUserId(localStorage.getItem('amh_active_user_id'));
        if (storedUser) return storedUser;
        const isMobileDevice = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
        if (isMobileDevice) return ladenMember;

        const savedUserId = localStorage.getItem('amh_active_user_id');
        if (savedUserId) {
          const found = DEFAULT_TEAM_MEMBERS.find(m => m.id === savedUserId);
          if (found) return found;
        }
        return adminMember;
      }
    } catch {}
    return DEFAULT_TEAM_MEMBERS.find(m => m.isAdmin) || DEFAULT_TEAM_MEMBERS[0];
  });

  const [loginUserId, setLoginUserId] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlUser = urlParams.get('user');
        const ladenMember = DEFAULT_TEAM_MEMBERS.find(m => m.name === 'লাদেন' || m.id === 'STAFF-01') || DEFAULT_TEAM_MEMBERS[0];
        const adminMember = DEFAULT_TEAM_MEMBERS.find(m => m.isAdmin) || DEFAULT_TEAM_MEMBERS[DEFAULT_TEAM_MEMBERS.length - 1];

        if (urlUser === 'laden' || urlUser === 'STAFF-01') return ladenMember.id;
        // লগইন স্ক্রিনের ড্রপডাউনে শেষবার ব্যবহৃত অ্যাকাউন্টটিই প্রি-সিলেক্ট থাকবে
        const storedLoginUser = resolveStoredUserId(localStorage.getItem('amh_active_user_id'));
        if (storedLoginUser) return storedLoginUser.id;
        const isMobileDevice = window.innerWidth <= 768 || /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);
        if (isMobileDevice) return ladenMember.id;

        const savedUserId = localStorage.getItem('amh_active_user_id');
        if (savedUserId) {
          const found = DEFAULT_TEAM_MEMBERS.find(m => m.id === savedUserId);
          if (found) return found.id;
        }
        return adminMember.id;
      }
    } catch {}
    return (DEFAULT_TEAM_MEMBERS.find(m => m.isAdmin) || DEFAULT_TEAM_MEMBERS[0]).id;
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try { return typeof window !== 'undefined' && localStorage.getItem('amh_remember_me') === '1'; } catch { return false; }
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // রিফ্রেশের পর TV MOOD ও গেস্ট সেশন যেনো ঠিক নিজের প্যানেলে ফেরে (অন্যথায় রেজিস্ট্রেশন ফর্মে পড়ে যেত)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedId = localStorage.getItem('amh_active_user_id');
        if (savedId === TV_SESSION_USER.id) return 'tv';
        if (resolveUrlSessionUser()?.isTvMode) return 'tv';
        const savedTab = localStorage.getItem('amh_active_tab');
        const validTabs = ['register', 'queue', 'patientId', 'reports', 'team', 'settings', 'tvconfig'];
        if (savedId === GUEST_SESSION_USER.id) {
          return (savedTab && ['register', 'queue'].includes(savedTab)) ? savedTab : 'queue';
        }
        if (savedTab && validTabs.includes(savedTab)) return savedTab;
      }
    } catch {}
    return 'register';
  });
  useEffect(() => {
    const urlLaunchUser = resolveUrlSessionUser();
    if (!urlLaunchUser) return;
    persistActiveUserId(urlLaunchUser.id);
    try { sessionStorage.setItem('amh_session_authenticated', 'true'); } catch {}
  }, []);

  // TV বোর্ডের ৪টি স্বাধীন ভ্যারিয়েন্ট: ১=ভার্টিক্যাল গ্রাফিক্স, ২=ভার্টিক্যাল প্লেইন, ৩=হরাইজেন্টাল গ্রাফিক্স, ৪=হরাইজেন্টাল প্লেইন
  const [tvVariant, setTvVariant] = useState(() => {
    try {
      // ?tv=1..4 থাকলে সেই বোর্ডই খুলবে (প্রতি টিভির স্থায়ী লিঙ্ক), না থাকলে শেষ ব্যবহৃত বোর্ড
      const p = new URLSearchParams(window.location.search);
      const urlV = Number(p.get('tv'));
      if ([1, 2, 3, 4].includes(urlV)) return urlV;
      const v = Number(localStorage.getItem('amh_tv_variant'));
      if ([1, 2, 3, 4].includes(v)) return v;
    } catch {}
    return 1;
  });
  useEffect(() => { if (IS_MINI_PREVIEW) return; try { localStorage.setItem('amh_tv_variant', String(tvVariant)); } catch {} }, [tvVariant]);
  // হেডারের TV বাটনে ক্লিক — ভ্যারিয়েন্ট বেছে বোর্ড খোলে
  const openTvVariant = (n) => { setTvVariant(n); setActiveTab('tv'); };

  // TV বোর্ড কনফিগ (অ্যাডমিন/সেটিংস থেকে): প্রতি বোর্ডের চালু/নাম/প্যানেল/সংখ্যা/ফন্ট/রঙ + ডিফল্ট + রোটেশন + সাউন্ড + উজ্জ্বলতা
  const TV_BOARD_DEFAULT_LABELS = { 1: 'TV-1 · ভার্টিক্যাল', 2: 'TV-2 · ভার্টিক্যাল', 3: 'TV-3 · হরাইজেন্টাল', 4: 'TV-4 · হরাইজেন্টাল' };
  const TV_FONT_ZOOM = { sm: 0.85, md: 1, lg: 1.18 };
  // সেটিংসের ৪ বোর্ড-কার্ডের টোন: TV-1 লাইট, TV-2 ডিপ, TV-3 লাইট, TV-4 ডিপ (পাঠযোগ্য রাখতে সবগুলোতেই গাঢ় লেখা)
  const TV_CARD_TINTS = {
    1: { bg: 'bg-gradient-to-br from-sky-50 to-sky-100', border: 'border-sky-300', rail: 'border-l-sky-500', dot: 'bg-sky-500' },
    2: { bg: 'bg-gradient-to-br from-teal-50 to-emerald-100', border: 'border-teal-300', rail: 'border-l-teal-500', dot: 'bg-teal-600' },
    3: { bg: 'bg-gradient-to-br from-amber-50 to-orange-100', border: 'border-amber-300', rail: 'border-l-amber-500', dot: 'bg-amber-500' },
    4: { bg: 'bg-gradient-to-br from-rose-50 to-pink-100', border: 'border-rose-300', rail: 'border-l-rose-500', dot: 'bg-rose-500' },
  };
  const defaultTvBoardConfig = (n) => ({
    enabled: true,
    label: TV_BOARD_DEFAULT_LABELS[n],
    panels: { called: true, next: true, tenList: true, absent: true, inside: true },
    counts: { called: 4, tenList: 10, absent: 8 },
    heights: { called: 11, inside: 11, next: 11, tenList: 50, absent: 16 },
    fontScale: 'md',
    colors: { bg: '', token: '', name: '' },
    styles: {},
    design: {},
  });
  const clampCount = (v, lo, hi) => { const x = Math.round(Number(v)); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : lo; };
  // হাইট-পার্সেন্টেজ ক্ল্যাম্প: অবৈজ/খালি হলে ফলব্যাক (ডিফল্ট) — clampCount-এর মতো 2-এ ফিরবে না
  const clampPct = (v, fb, lo = 2, hi = 95) => { const x = Math.round(Number(v)); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : fb; };
  const [tvBoardsConfig, setTvBoardsConfig] = useState(() => {
    const base = { 1: defaultTvBoardConfig(1), 2: defaultTvBoardConfig(2), 3: defaultTvBoardConfig(3), 4: defaultTvBoardConfig(4) };
    try {
      const saved = JSON.parse(localStorage.getItem('amh_tv_boards_config') || 'null');
      if (saved && typeof saved === 'object') {
        [1, 2, 3, 4].forEach((n) => {
          const e = saved[n] || saved[String(n)];
          if (!e) return;
          const d = base[n];
          base[n] = {
            enabled: e.enabled !== false,
            label: (typeof e.label === 'string' && e.label.trim()) ? e.label : d.label,
            panels: { ...d.panels, ...(e.panels || {}) },
            counts: { called: clampCount(e.counts?.called, 1, 8), tenList: clampCount(e.counts?.tenList, 3, 20), absent: clampCount(e.counts?.absent, 1, 20) },
            fontScale: ['sm', 'md', 'lg'].includes(e.fontScale) ? e.fontScale : d.fontScale,
            colors: { bg: e.colors?.bg || '', token: e.colors?.token || '', name: e.colors?.name || '' },
            styles: (e.styles && typeof e.styles === 'object') ? e.styles : {},
            design: (e.design && typeof e.design === 'object') ? e.design : {},
            heights: {
              called: clampPct(e.heights?.called, d.heights.called),
              inside: clampPct(e.heights?.inside, d.heights.inside),
              next: clampPct(e.heights?.next, d.heights.next),
              tenList: clampPct(e.heights?.tenList, d.heights.tenList),
              absent: clampPct(e.heights?.absent, d.heights.absent),
            },
          };
        });
      }
    } catch {}
    return base;
  });
  useEffect(() => { try { localStorage.setItem('amh_tv_boards_config', JSON.stringify(tvBoardsConfig)); } catch {} }, [tvBoardsConfig]);
  // (2026-11-02: লিংক মোড বাদ — বোর্ডগুলো আবার স্বাধীন; ডিভাইস-থেকে-ডিভাইস সিঙ্ক নিচে যোগ হয়েছে)
  const updateTvBoard = (n, patch) => setTvBoardsConfig(prev => ({ ...prev, [n]: { ...prev[n], ...patch } }));
  const updateTvBoardNested = (n, key, patch) => setTvBoardsConfig(prev => ({ ...prev, [n]: { ...prev[n], [key]: { ...prev[n][key], ...patch } } }));
  const setTvElStyle = (n, panel, el, patch) => setTvBoardsConfig(prev => {
    const board = { ...prev[n] };
    const styles = { ...(board.styles || {}) };
    const panelStyles = { ...(styles[panel] || {}) };
    panelStyles[el] = { ...(panelStyles[el] || {}), ...patch };
    styles[panel] = panelStyles;
    board.styles = styles;
    return { ...prev, [n]: board };
  });
  // ডিভাইস-সিঙ্ক: TV সেটিংস (৪ বোর্ড কার্ড + সাধারণ) ক্লাউড ও BroadcastChannel-এর মাধ্যমে
  // সব ডিভাইসে ছড়ায় — এক ডিভাইসে বদলালে ফোন/টিভিতেও বসে যায়। বোর্ড-প্রতি-বোর্ড লিংক নয়।
  const tvSkipBroadcastRef = useRef(false);
  const tvLastSentJsonRef = useRef(null);
  const tvInitBroadcastRef = useRef(true);
  // এডিট-টাইমস্ট্যাম্প (২০-১১-০৩): last-writer-wins — শুধু নতুন সেটিংস পুরোনোকে ডিফল্টে ফেরাতে পারবে না।
  const tvConfigEditedAtRef = useRef(null);
  if (tvConfigEditedAtRef.current === null) { let v = 0; try { v = Number(localStorage.getItem('amh_tv_config_edited_at')) || 0; } catch {} tvConfigEditedAtRef.current = v; }
  const persistTvEditedAt = () => { try { localStorage.setItem('amh_tv_config_edited_at', String(tvConfigEditedAtRef.current || 0)); } catch {} };
  // ডিভাইস-সিঙ্ক অন/অফ টগল (২০-১১-০৩): বন্ধ করলে এই ডিভাইস TV সেটিংস কাউকে পাঠায় না ও কারোর থেকে নেয় না — স্বাধীনভাবে চলে।
  const [tvSyncEnabled, setTvSyncEnabled] = useState(() => { try { return localStorage.getItem('amh_tv_sync_enabled') !== 'false'; } catch { return true; } });
  const tvSyncEnabledRef = useRef(tvSyncEnabled);
  useEffect(() => { tvSyncEnabledRef.current = tvSyncEnabled; try { localStorage.setItem('amh_tv_sync_enabled', String(tvSyncEnabled)); } catch {} }, [tvSyncEnabled]);
  const collectTvConfig = () => ({
    boards: tvBoardsConfig,
    defaultVariant: tvDefaultVariant,
    rotationSeconds: tvTenRotationSeconds,
    rotationEnabled: tvTenRotationEnabled,
    sound: tvSoundEnabled,
    brightness: tvAutoBrightness,
    marquee: tvMarquee,
    highlight: tvHighlightOnCall,
    welcome: tvWelcome,
    voice: tvVoice,
    beep: tvBeep,
    hColumns: tvHColumns,
    textPresets: tvTextPresets,
    designPresets: tvDesignPresets,
    editedAt: tvConfigEditedAtRef.current || 0,
  });
  // (2026-11-02: "সবে কপি" বাটানটি ব্যবহারকারীর অনুরোধে সরানো হয়েছে — শুধু লিংক মোডই আছে)


  const [tvDefaultVariant, setTvDefaultVariant] = useState(() => {
    try { const v = Number(localStorage.getItem('amh_tv_default_variant')); if ([1, 2, 3, 4].includes(v)) return v; } catch {}
    return 1;
  });
  useEffect(() => { try { localStorage.setItem('amh_tv_default_variant', String(tvDefaultVariant)); } catch {} }, [tvDefaultVariant]);

  const [tvTenRotationSeconds, setTvTenRotationSeconds] = useState(() => {
    try { const s = Number(localStorage.getItem('amh_tv_ten_rotation_seconds')); if (Number.isFinite(s) && s >= 3 && s <= 120) return s; } catch {}
    return 15;
  });
  useEffect(() => { try { localStorage.setItem('amh_tv_ten_rotation_seconds', String(tvTenRotationSeconds)); } catch {} }, [tvTenRotationSeconds]);

  // গ্লোবাল TV আচরণ: ১০-জনের রোটেশন অন/অফ, নতুন ডাকে বিপ, দিন/রাত অনুযায়ী উজ্জ্বলতা
  const [tvTenRotationEnabled, setTvTenRotationEnabled] = useState(() => { try { return localStorage.getItem('amh_tv_ten_rotation_enabled') !== 'false'; } catch { return true; } });
  useEffect(() => { try { localStorage.setItem('amh_tv_ten_rotation_enabled', String(tvTenRotationEnabled)); } catch {} }, [tvTenRotationEnabled]);
  const [tvSoundEnabled, setTvSoundEnabled] = useState(() => { try { return localStorage.getItem('amh_tv_sound_enabled') !== 'false'; } catch { return true; } });
  useEffect(() => { try { localStorage.setItem('amh_tv_sound_enabled', String(tvSoundEnabled)); } catch {} }, [tvSoundEnabled]);
  const [tvAutoBrightness, setTvAutoBrightness] = useState(() => { try { return localStorage.getItem('amh_tv_auto_brightness') !== 'false'; } catch { return true; } });
  useEffect(() => { try { localStorage.setItem('amh_tv_auto_brightness', String(tvAutoBrightness)); } catch {} }, [tvAutoBrightness]);

  // অতিরিক্ত গ্লোবাল TV সেটিংস: মার্কি ঘোষণা, ডাক-হাইলাইট, স্বাগত স্ক্রিন, ভয়েস, বিপ, হরাইজেন্টাল কলাম
  const [tvMarquee, setTvMarquee] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('amh_tv_marquee') || 'null'); if (s && typeof s === 'object') return { enabled: !!s.enabled, text: typeof s.text === 'string' ? s.text : '', speed: clampCount(s.speed, 5, 120) || 20 }; } catch {}
    return { enabled: true, text: '', speed: 20 };
  });
  useEffect(() => { try { localStorage.setItem('amh_tv_marquee', JSON.stringify(tvMarquee)); } catch {} }, [tvMarquee]);
  const [tvHighlightOnCall, setTvHighlightOnCall] = useState(() => { try { return localStorage.getItem('amh_tv_highlight_oncall') !== 'false'; } catch { return true; } });
  useEffect(() => { try { localStorage.setItem('amh_tv_highlight_oncall', String(tvHighlightOnCall)); } catch {} }, [tvHighlightOnCall]);
  const [tvWelcome, setTvWelcome] = useState(() => { try { return localStorage.getItem('amh_tv_welcome') !== 'false'; } catch { return true; } });
  useEffect(() => { try { localStorage.setItem('amh_tv_welcome', String(tvWelcome)); } catch {} }, [tvWelcome]);
  const [tvVoice, setTvVoice] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('amh_tv_voice') || 'null'); if (s && typeof s === 'object') return { enabled: !!s.enabled, rate: Number.isFinite(s.rate) ? Math.min(2, Math.max(0.5, s.rate)) : 1, repeat: clampCount(s.repeat, 1, 3) || 1 }; } catch {}
    return { enabled: true, rate: 1, repeat: 1 };
  });
  useEffect(() => { try { localStorage.setItem('amh_tv_voice', JSON.stringify(tvVoice)); } catch {} }, [tvVoice]);
  const [tvBeep, setTvBeep] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('amh_tv_beep') || 'null'); if (s && typeof s === 'object') return { type: ['beep', 'chime'].includes(s.type) ? s.type : 'beep', volume: Number.isFinite(s.volume) ? Math.min(1, Math.max(0, s.volume)) : 0.25, repeat: clampCount(s.repeat, 1, 3) || 1 }; } catch {}
    return { type: 'beep', volume: 0.25, repeat: 1 };
  });
  useEffect(() => { try { localStorage.setItem('amh_tv_beep', JSON.stringify(tvBeep)); } catch {} }, [tvBeep]);
  const [tvHColumns, setTvHColumns] = useState(() => { try { const v = Number(localStorage.getItem('amh_tv_h_columns')); if ([2, 3, 4].includes(v)) return v; } catch {} return 3; });
  useEffect(() => { try { localStorage.setItem('amh_tv_h_columns', String(tvHColumns)); } catch {} }, [tvHColumns]);
  // চেইন-এডিটরের নির্বাচন (প্রতি বোর্ডে আলাদা, অস্থায়ী): কোন প্যানেল → কোন উপাদান সম্পাদ হচ্ছে
  const [tvChainSel, setTvChainSel] = useState({ 1: { panel: 'called', el: 'token' }, 2: { panel: 'called', el: 'token' }, 3: { panel: 'called', el: 'token' }, 4: { panel: 'called', el: 'token' } });
  const tvChainSet = (n, patch) => setTvChainSel(prev => ({ ...prev, [n]: { ...prev[n], ...patch } }));
  // প্যানেল-ডিজাইন চেইনের নির্বাচন (প্রতি বোর্ডে আলাদা, অস্থায়ী): কোন প্যানেল → কোন টার্গেট (প্যানেল/সাব)
  const [tvDesignSel, setTvDesignSel] = useState({ 1: { panel: 'called', target: 'panel' }, 2: { panel: 'called', target: 'panel' }, 3: { panel: 'called', target: 'panel' }, 4: { panel: 'called', target: 'panel' } });
  const tvDesignSet = (n, patch) => setTvDesignSel(prev => ({ ...prev, [n]: { ...prev[n], ...patch } }));
  // সেটিংসের ৪ বোর্ড-কার্ডের UI অবস্থা (অস্থায়ী-স্থায়ী): মিনিমাইজ/হাইড — ডিফল্টে সব মিনিমাইজ
  const [tvCardUi, setTvCardUi] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('amh_tv_card_ui') || 'null'); if (s && typeof s === 'object') return s; } catch {}
    return { 1: { minimized: true, hidden: false }, 2: { minimized: true, hidden: false }, 3: { minimized: true, hidden: false }, 4: { minimized: true, hidden: false } };
  });
  useEffect(() => { try { localStorage.setItem('amh_tv_card_ui', JSON.stringify(tvCardUi)); } catch {} }, [tvCardUi]);
  const setTvCardUiFor = (n, patch) => setTvCardUi(prev => ({ ...prev, [n]: { ...(prev[n] || { minimized: true, hidden: false }), ...patch } }));
  const tvCardUiGet = (n) => tvCardUi[n] || { minimized: true, hidden: false };
  // লাইভ মিনি-প্রিভিউ পপআপ (টিভি সেটআপ প্যানেল): আসল বোর্ড iframe-এ ছোট স্কেলে — সেটিংস বদলালে সঙ্গে সঙ্গে দেখা যায়
  const [tvPreview, setTvPreview] = useState({ board: 0 });
  const tvPreviewBoard = () => (tvPreview.board && tvBoardsConfig[tvPreview.board]?.enabled ? tvPreview.board : null)
    || [1, 2, 3, 4].find((nn) => tvBoardsConfig[nn]?.enabled && !tvCardUiGet(nn).hidden && !tvCardUiGet(nn).minimized)
    || [1, 2, 3, 4].find((nn) => tvBoardsConfig[nn]?.enabled) || 1;
  useEffect(() => {
    if (!IS_MINI_PREVIEW) return;
    let t = 0;
    const onStorage = (e) => { const k = e && e.key; if (k !== null && !(String(k).indexOf('amh_tv_') === 0 || String(k) === 'amh_active_theme')) return; clearTimeout(t); t = window.setTimeout(() => { try { window.location.reload(); } catch {} }, 500); };
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('storage', onStorage); clearTimeout(t); };
  }, []);

  // থিম কালার প্রিসেট (প্রতি বোর্ডে এক ক্লিকে টোকেন/নাম/ব্যাকগ্রাউন্ড সেট করে)
  const TV_THEME_PRESETS = [
    { id: 'default', label: 'ডিফল্ট', colors: { bg: '', token: '', name: '' } },
    { id: 'mint', label: 'মিন্ট', colors: { bg: '#ecfdf5', token: '#0d9488', name: '#0f172a' } },
    { id: 'ocean', label: 'ওশান', colors: { bg: '#eff6ff', token: '#2563eb', name: '#0f172a' } },
    { id: 'sunset', label: 'সানসেট', colors: { bg: '#fff7ed', token: '#ea580c', name: '#1c1917' } },
    { id: 'rose', label: 'রোজ', colors: { bg: '#fff1f2', token: '#e11d48', name: '#1f2937' } },
    { id: 'dark', label: 'ডার্ক', colors: { bg: '#0f172a', token: '#34d399', name: '#f8fafc' } },
  ];

  // সব TV কনফিগ ডিফল্টে ফেরত
  const resetAllTvConfig = () => {
    setTvBoardsConfig({ 1: defaultTvBoardConfig(1), 2: defaultTvBoardConfig(2), 3: defaultTvBoardConfig(3), 4: defaultTvBoardConfig(4) });
    setTvDefaultVariant(1);
    setTvTenRotationSeconds(15);
    setTvTenRotationEnabled(true);
    setTvSoundEnabled(true);
    setTvAutoBrightness(true);
    setTvMarquee({ enabled: true, text: '', speed: 20 });
    setTvHighlightOnCall(true);
    setTvWelcome(true);
    setTvVoice({ enabled: true, rate: 1, repeat: 1 });
    setTvBeep({ type: 'beep', volume: 0.25, repeat: 1 });
    setTvHColumns(3);
  };
  // শুধু "সাধারণ সেটিংস" ব্লকটি ডিফল্টে ফেরায় (৪ বোর্ডের কার্ড-কনফিগ ও মার্কির লেখা অক্ষত থাকে)
  const resetTvGlobals = () => {
    setTvTenRotationSeconds(15);
    setTvTenRotationEnabled(true);
    setTvSoundEnabled(true);
    setTvAutoBrightness(true);
    setTvMarquee(o => ({ enabled: true, text: o.text || '', speed: 20 }));
    setTvHighlightOnCall(true);
    setTvWelcome(true);
    setTvVoice({ enabled: true, rate: 1, repeat: 1 });
    setTvBeep({ type: 'beep', volume: 0.25, repeat: 1 });
    setTvHColumns(3);
    setSyncToast('✓ সাধারণ সেটিংস ডিফল্টে ফেরানো হয়েছে');
    setTimeout(() => setSyncToast(''), 3000);
  };
  // ?reset=1 লিঙ্ক খুললেই এই ডিভাইসের সাধারণ TV সেটিংস ডিফল্টে ফিরে যাবে (একবার চলে, তারপর ঠিকানা পরিষ্কার)
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('reset') === '1') {
        resetTvGlobals();
        window.history.replaceState({}, '', window.location.pathname + (p.get('tv') ? '?tv=' + encodeURIComponent(p.get('tv')) : ''));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // চেইন-এডিটর: প্যানেল ও উপাদানের কী/লেবেল, প্রতি উপাদানের CSS ভেরিয়েবল, ও config → CSS জেনারেটর
  const TV_PANEL_KEYS = ['called', 'next', 'tenList', 'absent', 'inside'];
  const TV_PANEL_LABELS = { called: 'চলমান', next: 'পরবর্তী', tenList: '১০ জন', absent: 'অনুপস্থিত', inside: 'ভিতরে' };
  const TV_ELEMENT_KEYS = ['header', 'token', 'name', 'age', 'call'];
  const TV_ELEMENT_LABELS = { header: 'হেডার', token: 'টোকেন', name: 'নাম', age: 'বয়স', call: 'সম্ভাব্য ডাক' };
  const TV_EL_VAR = {
    header: { color: '--tv-header-c', size: '--tv-header-size', align: '--tv-header-align' },
    token: { color: '--tv-token', size: '--tv-token-size', align: '--tv-token-align' },
    name: { color: '--tv-name', size: '--tv-name-size', align: '--tv-name-align' },
    age: { color: '--tv-age-c', size: '--tv-age-size', align: '--tv-age-align' },
    call: { color: '--tv-call-c', size: '--tv-call-size', align: '--tv-call-align' },
  };
  // বোর্ডের styles config থেকে [data-tp="panel"] [data-el="element"]{...!important} নিয়ম তৈরি (শুধু সেট করা হলে)
  const getTvElementCss = (boardCfg) => {
    if (!boardCfg || !boardCfg.styles) return '';
    const escColor = (v) => String(v).replace(/[^a-zA-Z0-9_(),.\/#\s-]/g, '');
    let out = '';
    TV_PANEL_KEYS.forEach((p) => {
      TV_ELEMENT_KEYS.forEach((el) => {
        const s = (boardCfg.styles[p] && boardCfg.styles[p][el]) || null;
        if (!s) return;
        let decl = '';
        if (s.color) decl += `color:${escColor(s.color)}!important;`;
        const sizeNum = Math.round(Number(s.size));
        if (Number.isFinite(sizeNum) && sizeNum >= 8 && sizeNum <= 200) decl += `font-size:${sizeNum}px!important;`;
        if (['left', 'center', 'right'].includes(s.align)) decl += `text-align:${s.align}!important;`;
        if (decl) out += `[data-tp="${p}"] [data-el="${el}"]{${decl}}`;
      });
    });
    return out;
  };
  // প্যানেল/সাব-প্যানেল ডিজাইন (ফিল/ইফেক্ট) — প্রিসেট তালিকা, রেসিপি ও CSS জেনারেটর
  const TV_DESIGN_TARGETS = ['panel', 'sub'];
  const TV_DESIGN_TARGET_LABELS = { panel: 'প্যানেল', sub: 'সাব-প্যানেল' };
  const TV_DESIGN_PRESETS = [
    { id: '', label: 'ডিফল্ট' },
    { id: 'solid', label: 'সলিড' },
    { id: 'gradV', label: 'গ্র‍্যাডিয়েন্ট ↕' },
    { id: 'gradD', label: 'গ্র‍্যাডিয়েন্ট ↘' },
    { id: 'gradR', label: 'গ্র‍্যাডিয়েন্ট ◉' },
    { id: 'stripes', label: 'স্ট্রাইপ' },
    { id: 'dots', label: 'ডট' },
    { id: 'grid', label: 'গ্রিড' },
    { id: 'glass', label: 'গ্লাস' },
    { id: 'neuLight', label: 'নিউ (লাইট)' },
    { id: 'neuDark', label: 'নিউ (ডার্ক)' },
    { id: 'clay', label: 'ক্লে' },
    { id: 'water', label: 'ওয়াটারড্রপ' },
    { id: 'metal', label: 'মেটাল' },
    { id: 'pic', label: 'ছবি' },
  ];
  // প্রতিটি ইফেক্টের অংশ (ব্যাকগ্রাউন্ড কালার + পৃথক ইমেজ লেয়ার [image,size,repeat] + শ্যাডো/বর্ডার/রঙ) — একাধিক ইফেক্ট স্ট্যাক করার জন্য
  const tvDesignParts = (preset, base, accent, pic) => {
    const b = (base && /^#[0-9a-fA-F]{6}$/.test(base)) ? base : '#1f2937';
    const a = (accent && /^#[0-9a-fA-F]{6}$/.test(accent)) ? accent : '#38bdf8';
    switch (preset) {
      case 'solid': return { bgColor: b };
      case 'gradV': return { layers: [{ image: `linear-gradient(180deg,${a},${b})`, size: 'auto', repeat: 'no-repeat' }] };
      case 'gradD': return { layers: [{ image: `linear-gradient(135deg,${a},${b})`, size: 'auto', repeat: 'no-repeat' }] };
      case 'gradR': return { layers: [{ image: `radial-gradient(circle at 30% 30%,${a},${b})`, size: 'auto', repeat: 'no-repeat' }] };
      case 'stripes': return { bgColor: b, layers: [{ image: 'repeating-linear-gradient(45deg,rgba(255,255,255,.14) 0 12px,transparent 12px 24px)', size: 'auto', repeat: 'repeat' }] };
      case 'dots': return { bgColor: b, layers: [{ image: 'radial-gradient(rgba(255,255,255,.22) 20%,transparent 21%)', size: '18px 18px', repeat: 'repeat' }] };
      case 'grid': return { bgColor: b, layers: [{ image: 'linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px)', size: '22px 22px', repeat: 'repeat' }, { image: 'linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)', size: '22px 22px', repeat: 'repeat' }] };
      case 'glass': return { bgColor: 'rgba(255,255,255,.12)', borderCss: '1px solid rgba(255,255,255,.25)', boxShadow: '0 8px 32px rgba(0,0,0,.25)', backdrop: 'blur(10px)' };
      case 'neuLight': return { bgColor: '#e0e5ec', boxShadow: '9px 9px 18px #b8bcc4,-9px -9px 18px #ffffff', cssColor: '#334155' };
      case 'neuDark': return { bgColor: '#2b2f38', boxShadow: '8px 8px 16px #1c1f25,-8px -8px 16px #3a404c' };
      case 'clay': return { bgColor: a, boxShadow: 'inset 6px 6px 12px rgba(255,255,255,.5),inset -8px -8px 16px rgba(0,0,0,.18),0 10px 24px rgba(0,0,0,.25)' };
      case 'water': return { bgColor: b, layers: [{ image: 'radial-gradient(120% 120% at 20% 15%,rgba(255,255,255,.5),rgba(255,255,255,0) 45%)', size: 'auto', repeat: 'no-repeat' }], boxShadow: 'inset 0 2px 10px rgba(255,255,255,.6),inset 0 -6px 14px rgba(0,0,0,.25),0 10px 22px rgba(0,0,0,.3)' };
      case 'metal': return { layers: [{ image: 'linear-gradient(135deg,#fefefe 0%,#c9d0d8 20%,#8a929c 40%,#e9edf1 55%,#7d858f 70%,#c9d0d8 85%,#f4f6f8 100%)', size: 'auto', repeat: 'no-repeat' }], boxShadow: 'inset 0 1px 2px rgba(255,255,255,.8),inset 0 -2px 4px rgba(0,0,0,.25)', borderCss: '1px solid rgba(0,0,0,.15)', cssColor: '#222' };
      case 'pic': { const u = String(pic || '/images/tv-yellow.jpg').replace(/['"\\<>]/g, '').trim(); return { bgColor: b, layers: [{ image: `url('${u}')`, size: 'cover', repeat: 'no-repeat' }] }; }
      default: return {};
    }
  };
  // একাধিক ইফেক্ট স্ট্যাক: তালিকার ১ম = সবার নিচে, শেষ = সবার উপরে (CSS-এ উপরের লেয়ার আগে লেখে)
  const tvDesignCombine = (list, base, accent, pic) => {
    const arr = (Array.isArray(list) ? list : (list ? [list] : [])).filter(Boolean).slice(-3);
    if (!arr.length) return '';
    const parts = arr.map(p => tvDesignParts(p, base, accent, pic));
    const imgs = []; const sizes = []; const repeats = [];
    [...parts].reverse().forEach(x => (x.layers || []).forEach(l => { imgs.push(l.image); sizes.push(l.size || 'auto'); repeats.push(l.repeat || 'repeat'); }));
    const bottomColor = parts.find(x => x.bgColor);
    let d = '';
    if (bottomColor) d += `background-color:${bottomColor.bgColor}!important;`;
    else if (imgs.length) d += `background-color:transparent!important;`;
    if (imgs.length) {
      d += `background-image:${imgs.join(',')}!important;background-size:${sizes.join(',')}!important;background-repeat:${repeats.join(',')}!important;`;
    }
    const topVal = (key) => { for (let i = parts.length - 1; i >= 0; i--) if (parts[i][key]) return parts[i][key]; return null; };
    const bs = topVal('boxShadow'); if (bs) d += `box-shadow:${bs}!important;`;
    const bd = topVal('borderCss'); if (bd) d += `border:${bd}!important;`;
    const cc = topVal('cssColor'); if (cc) d += `color:${cc}!important;`;
    const bk = topVal('backdrop'); if (bk) d += `backdrop-filter:${bk}!important;-webkit-backdrop-filter:${bk}!important;`;
    return d;
  };
  const tvDesignDecl = (preset, base, accent, pic) => tvDesignCombine([preset], base, accent, pic);
  const getTvDesignCss = (boardCfg) => {
    if (!boardCfg || !boardCfg.design) return '';
    let out = '';
    TV_PANEL_KEYS.forEach((p) => {
      TV_DESIGN_TARGETS.forEach((t) => {
        const d = (boardCfg.design[p] && boardCfg.design[p][t]) || null;
        if (!d) return;
        const list = Array.isArray(d.presets) && d.presets.length ? d.presets : (d.preset ? [d.preset] : []);
        const decl = tvDesignCombine(list, d.base, d.accent, d.pic);
        if (!decl) return;
        if (t === 'panel') out += `[data-tp="${p}"][data-el="panel"]{${decl}}[data-tp="${p}"] [data-el="panel"]{${decl}}`;
        else out += `[data-tp="${p}"] [data-el="sub"]{${decl}}`;
      });
    });
    return out;
  };
  const setTvPanelDesign = (n, panel, target, patch) => setTvBoardsConfig(prev => {
    const board = { ...prev[n] };
    const design = { ...(board.design || {}) };
    const p = { ...(design[panel] || {}) };
    p[target] = { ...(p[target] || {}), ...patch };
    design[panel] = p;
    board.design = design;
    return { ...prev, [n]: board };
  });
  // ইফেক্ট মাল্টি-সিলেক্ট টগল: ১ম সিলেক্ট = সবার নিচের লেয়ার, পরেরটা তার উপরে (সর্বোচ্চ ৩টি; ৪র্থ চাপলে সবচেয়ে পুরোনো নিচেরটা সরে যায়)
  const toggleTvDesignPreset = (n, panel, target, presetId) => setTvBoardsConfig(prev => {
    const board = { ...prev[n] };
    const design = { ...(board.design || {}) };
    const p = { ...(design[panel] || {}) };
    const t = { ...(p[target] || {}) };
    let list = Array.isArray(t.presets) ? [...t.presets] : (t.preset ? [t.preset] : []);
    if (!presetId) list = [];
    else if (list.includes(presetId)) list = list.filter(x => x !== presetId);
    else { if (list.length >= 3) list = list.slice(1); list.push(presetId); }
    t.presets = list; delete t.preset;
    p[target] = t; design[panel] = p; board.design = design;
    return { ...prev, [n]: board };
  });
  // —— প্রিসেট লাইব্রেরি (ডিভাইস-গ্লোবাল, সিঙ্কে সব ডিভাইসে ছড়ায়) ——
  const [tvTextPresets, setTvTextPresets] = useState(() => { try { const s = JSON.parse(localStorage.getItem('amh_tv_text_presets') || '[]'); return Array.isArray(s) ? s : []; } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('amh_tv_text_presets', JSON.stringify(tvTextPresets)); } catch {} }, [tvTextPresets]);
  const [tvDesignPresets, setTvDesignPresets] = useState(() => { try { const s = JSON.parse(localStorage.getItem('amh_tv_design_presets') || '[]'); return Array.isArray(s) ? s : []; } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('amh_tv_design_presets', JSON.stringify(tvDesignPresets)); } catch {} }, [tvDesignPresets]);
  const [tvTextPresetName, setTvTextPresetName] = useState('');
  const [tvDesignPresetName, setTvDesignPresetName] = useState('');
  const saveTvTextPreset = (n) => {
    const name = String(tvTextPresetName || '').trim().slice(0, 24);
    const panel = (tvChainSel[n] || {}).panel || 'called';
    const snap = ((tvBoardsConfig[n] || {}).styles || {})[panel] || {};
    if (!name) { setSyncToast('⚠ প্রিসেটের নাম লিখুন'); setTimeout(() => setSyncToast(''), 2500); return; }
    if (!Object.keys(snap).length) { setSyncToast('⚠ আগে সাইজ/রঙ/অবস্থান একবার বদলান, তারপর সেভ করুন'); setTimeout(() => setSyncToast(''), 2500); return; }
    setTvTextPresets(list => [...list.filter(p => p.name !== name), { id: Date.now(), name, panel, styles: JSON.parse(JSON.stringify(snap)) }]);
    setTvTextPresetName('');
    setSyncToast(`✓ টেক্সট প্রিসেট "${name}" সেভ হয়েছে`); setTimeout(() => setSyncToast(''), 2500);
  };
  const applyTvTextPreset = (n, preset) => {
    const panel = (tvChainSel[n] || {}).panel || 'called';
    setTvBoardsConfig(prev => {
      const board = { ...prev[n] };
      const styles = { ...(board.styles || {}) };
      const merged = { ...(styles[panel] || {}) };
      Object.keys(preset.styles || {}).forEach(el => { merged[el] = { ...(preset.styles[el] || {}) }; });
      styles[panel] = merged; board.styles = styles;
      return { ...prev, [n]: board };
    });
    setSyncToast(`✓ "${preset.name}" প্রিসেট প্রয়োগ হয়েছে`); setTimeout(() => setSyncToast(''), 2500);
  };
  const saveTvDesignPreset = (n) => {
    const name = String(tvDesignPresetName || '').trim().slice(0, 24);
    const sel = tvDesignSel[n] || { panel: 'called', target: 'panel' };
    const d = ((tvBoardsConfig[n] || {}).design || {})[sel.panel]?.[sel.target] || {};
    const list = Array.isArray(d.presets) ? d.presets : (d.preset ? [d.preset] : []);
    if (!name) { setSyncToast('⚠ প্রিসেটের নাম লিখুন'); setTimeout(() => setSyncToast(''), 2500); return; }
    if (!list.length) { setSyncToast('⚠ আগে অন্তত একটি ইফেক্ট সিলেক্ট করুন'); setTimeout(() => setSyncToast(''), 2500); return; }
    setTvDesignPresets(list2 => [...list2.filter(p => p.name !== name), { id: Date.now(), name, layers: [...list], base: d.base || '', accent: d.accent || '', pic: d.pic || '' }]);
    setTvDesignPresetName('');
    setSyncToast(`✓ ডিজাইন প্রিসেট "${name}" সেভ হয়েছে`); setTimeout(() => setSyncToast(''), 2500);
  };
  const applyTvDesignPreset = (n, preset) => {
    const sel = tvDesignSel[n] || { panel: 'called', target: 'panel' };
    setTvBoardsConfig(prev => {
      const board = { ...prev[n] };
      const design = { ...(board.design || {}) };
      const p = { ...(design[sel.panel] || {}) };
      p[sel.target] = { presets: [...(preset.layers || [])], base: preset.base || '', accent: preset.accent || '', pic: preset.pic || '' };
      design[sel.panel] = p; board.design = design;
      return { ...prev, [n]: board };
    });
    setSyncToast(`✓ "${preset.name}" ডিজাইন প্রয়োগ হয়েছে`); setTimeout(() => setSyncToast(''), 2500);
  };
  // লোকাল ফাইল/ড্র্যাগ-ড্রপ থেকে ছবি → রিসাইজ করা ডেটা-URL (localStorage-র সাইজ কম রাখতে)
  const tvPicFromFile = (file, cb) => {
    if (!file || !/^image\//.test(file.type || '')) { setSyncToast('⚠ ছবি ফাইল নোয়াও (PNG/JPG/WebP)'); setTimeout(() => setSyncToast(''), 2500); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        try {
          const maxW = 1280;
          const sc = Math.min(1, maxW / (img.width || maxW));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round((img.width || maxW) * sc));
          canvas.height = Math.max(1, Math.round((img.height || 720) * sc));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          cb(canvas.toDataURL('image/jpeg', 0.82));
        } catch { cb(String(reader.result || '')); }
      };
      img.onerror = () => cb(String(reader.result || ''));
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  };
  // বোর্ডের রুটে প্রয়োগ করার স্টাইল: ফন্ট-জুম, অটো-উজ্জ্বলতা, ও টোকেন/নামের রঙের CSS ভেরিয়েবল (শুধু নির্বাচিত হলে)
  const getTvBoardStyle = (n) => {
    const cfg = tvBoardsConfig[n] || {};
    const zoom = TV_FONT_ZOOM[cfg.fontScale] || 1;
    let brightness = 1;
    if (tvAutoBrightness) {
      const h = new Date().getHours();
      brightness = (h >= 19 || h < 6) ? 0.8 : ((h >= 6 && h < 9) || (h >= 17 && h < 19)) ? 0.92 : 1;
    }
    const c = cfg.colors || {};
    const style = { zoom, filter: `brightness(${brightness})` };
    if (c.bg) style.background = c.bg;
    if (c.token) style['--tv-token'] = c.token;
    if (c.name) style['--tv-name'] = c.name;
    return style;
  };
  // টোকেন/নাম স্প্যানে ব্যবহারের ইনলাইল স্টাইল — ভেরিয়েবল না থাকলে টেলউইন্ড ক্লাসের রঙই চলবে
  const tvTokenStyle = { color: 'var(--tv-token)' };
  const tvNameStyle = { color: 'var(--tv-name)' };
  // —— সেটিংস কার্ডের ভিতরের একই ধরণের সুন্দর UI (২০২৬-১১-০১ রিডিজাইন): পিল-চিপ, ফিল্ড-বক্স, সেগমেন্ট ——
  const tvChip = (active, tone = 'indigo') => {
    const on = {
      indigo: 'bg-indigo-600 text-white border-indigo-600 shadow-sm',
      teal: 'bg-teal-600 text-white border-teal-600 shadow-sm',
      emerald: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
      slate: 'bg-slate-800 text-white border-slate-800 shadow-sm',
      amber: 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm',
    }[tone] || 'bg-indigo-600 text-white border-indigo-600 shadow-sm';
    return `inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer select-none whitespace-nowrap ${active ? on : 'bg-white/90 text-slate-600 border-slate-300 hover:border-slate-400 hover:text-slate-900'}`;
  };
  const TV_FIELD_BOX = 'min-w-0 rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2.5 shadow-sm';
  const TV_SEG_WRAP = 'inline-flex rounded-full border border-slate-300 bg-white p-0.5';
  const tvSeg = (active) => `px-3 py-1 text-[10px] font-bold rounded-full transition cursor-pointer select-none whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`;
  const tvFieldLabel = (Icon, title, hint) => (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="inline-flex items-center justify-center h-5 w-5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0"><Icon className="w-3 h-3" /></span>
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{title}</span>
      {hint ? <span className="text-[9px] font-bold text-slate-400">— {hint}</span> : null}
    </div>
  );
  const tvStepNum = (done) => `inline-flex items-center justify-center h-4.5 w-4.5 shrink-0 rounded-full text-[9px] font-black border ${done ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-300'}`;
  // প্যানেল লুকানোর জন্য className-এ যোগ করার হেল্পার (অফ থাকলে 'hidden')
  const tvPanelHidden = (n, key) => (tvBoardsConfig[n]?.panels?.[key] === false ? ' hidden' : '');
  const tvCount = (n, key, fallback) => clampCount(tvBoardsConfig[n]?.counts?.[key], 1, 20) || fallback;
  // TV-1 প্যানেল-প্রতি হাইট (পার্সেন্টেজ) → flex-grow স্টাইল। মোট ১০০% না হলেও অনুপাত ঠিক থাকে
  // (flex-grow আপেক্ষিক), তাই ব্যবহারকারী যেকোনো % দিলেও প্যানেলগুলো সেই অনুপাতে ভাগ হয়।
  // TV-1 প্যানেলের হাইট — এখন কোডে স্থির (সেটিংস/localStorage নয়, তাই রিসেট/সিঙ্কে হারায় না)।
  // এই সংখ্যাগুলো বদলালে প্যানেলগুলোর আপেক্ষিক উচ্চতা বদলাবে (মোট ১০০% না হলেও অনুপাত অনুযায়ী ভাগ হয়)।
  const TV1_PANEL_HEIGHTS = { called: 22, inside: 12, next: 14, tenList: 38, absent: 14 };
  const tvPanelPct = (n, key) => (TV1_PANEL_HEIGHTS[key] ?? 10);
  const tvPanelFlex = (n, key) => ({ flexGrow: tvPanelPct(n, key), flexBasis: '0%', flexShrink: 1, minHeight: 0 });
  const tvGroupFlex = (n, keys) => ({ flexGrow: keys.reduce((a, k) => a + tvPanelPct(n, k), 0), flexBasis: '0%', flexShrink: 1, minHeight: 0 });
  // কিউ পুরোপুরি ফাঁকা (কোনো WAITING/CALLED নেই) কিনা — লেজি ফাংশন (মেনো ডিক্লেয়ার হওয়ার পর কল হয়)
  const tvQueueEmpty = () => (tvCalledPatientsSorted?.length || 0) === 0 && (tvWaitingPatientsList?.length || 0) === 0;
  // বোর্ডের নিচে চলমান ঘোষণা (মার্কি)
  const renderTvMarquee = () => (tvMarquee.enabled && tvMarquee.text.trim() ? (
    <div className="fixed inset-x-0 bottom-0 z-50 h-9 overflow-hidden border-t border-white/15 bg-slate-950/85 backdrop-blur-sm">
      <div className="amh-tv-marquee whitespace-nowrap leading-9 text-base sm:text-lg font-black text-amber-300" style={{ animationDuration: `${clampCount(tvMarquee.speed, 5, 120)}s` }}>
        {tvMarquee.text}
      </div>
    </div>
  ) : null);
  // কিউ ফাঁকা হলে ব্র্যান্ড/স্বাগত স্ক্রিন (পরের ডাক আসা পর্যন্ত)
  const renderTvWelcome = () => (tvWelcome && tvQueueEmpty() && !tvWelcomeDismissed ? (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-center px-6">
      <button type="button" onClick={() => setTvWelcomeDismissed(true)} className="absolute top-4 right-4 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/15 border border-white/30 text-white hover:bg-white/25 cursor-pointer transition shadow-lg" title="স্বাগত স্ক্রিন বন্ধ করুন" aria-label="স্বাগত স্ক্রিন বন্ধ"><X className="w-5 h-5" /></button>
      <img src="/images/amh-logo-watermark.webp" alt="" className="w-28 h-28 rounded-full bg-white/85 object-contain p-2 shadow-2xl" />
      <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow">{t.clinicName}</h1>
      <p className="text-lg sm:text-2xl font-bold text-emerald-200">স্বাগতম — আজকের সিরিয়াল এখানে দেখা যাবে</p>
      <p className="text-sm text-emerald-100/80">{formatBengaliHeaderDate(new Date())}</p>
    </div>
  ) : null);




  // নতুন ডাক শনাক্তে বিপ — WebAudio (কোনো অ্যাসেট লাগে না)
  const tvAudioCtxRef = useRef(null);
  const tvLastCallKeyRef = useRef(null);
  const playTvCallBeep = () => {
    try {
      const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (!AC) return;
      if (!tvAudioCtxRef.current) tvAudioCtxRef.current = new AC();
      const ctx = tvAudioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const vol = Math.min(1, Math.max(0, tvBeep.volume ?? 0.25));
      const tones = tvBeep.type === 'chime' ? [523.25, 659.25, 783.99] : [880, 1320];
      const repeat = clampCount(tvBeep.repeat, 1, 3);
      for (let r = 0; r < repeat; r++) {
        const base = ctx.currentTime + r * (tones.length * 0.16 + 0.12);
        tones.forEach((freq, i) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = freq;
          const st = base + i * 0.16;
          gain.gain.setValueAtTime(0.0001, st); gain.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), st + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.16);
          osc.connect(gain).connect(ctx.destination); osc.start(st); osc.stop(st + 0.18);
        });
      }
    } catch {}
  };
  // ব্রাউজারের ভয়েস-তালিকা অ্যাসিঙ্কভাবে লোড হয়; খালি তালিকায় speak() করলে Chrome উক্তি গ্রহণ করলেও
  // শব্দ বের না-ও পারে — তাই voiceschanged-এর অপেক্ষা করা হয় এবং বাংলা (bn) ভয়েস বেছে নেওয়া হয়
  const tvSpeakMsg = (msg, onNoBn) => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const build = () => {
        try {
          const u = new SpeechSynthesisUtterance(String(msg));
          u.lang = 'bn-BD';
          u.rate = Math.min(2, Math.max(0.5, tvVoice.rate ?? 1));
          const bn = (window.speechSynthesis.getVoices() || []).find((v) => (v.lang || '').toLowerCase().startsWith('bn'));
          if (bn) u.voice = bn;
          else if (onNoBn) onNoBn();
          window.speechSynthesis.speak(u);
          try { window.speechSynthesis.resume(); } catch {}
        } catch {}
      };
      const hasVoices = (window.speechSynthesis.getVoices() || []).length > 0;
      if (hasVoices) { build(); return; }
      let done = false;
      const go = () => { if (done) return; done = true; try { window.speechSynthesis.removeEventListener('voiceschanged', go); } catch {} build(); };
      try { window.speechSynthesis.addEventListener('voiceschanged', go); } catch {}
      setTimeout(go, 1200);
    } catch {}
  };
  // নতুন ডাক কণ্ঠে (TTS) পড়ে শোনানো — বাংলা ভয়েস থাকলে সেটি, না হলে ডিফল্ট
  const speakTvCall = (patient) => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis || !patient) return;
      const token = toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `${patient.serialNumber}`);
      const text = `টোকেন ${token}${patient.name ? `, ${patient.name}` : ''}`;
      window.speechSynthesis.cancel();
      const repeat = clampCount(tvVoice.repeat, 1, 3);
      for (let i = 0; i < repeat; i++) setTimeout(() => tvSpeakMsg(text), 150 + i * 1500);
    } catch {}
  };
  // সেটিংস থেকে নমুনা (sample) শোনানো — মার্কির লেখা বা কণ্ঠ ঘোষণার উদাহরণ
  const speakTvSample = (text) => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) { setSyncToast('⚠ এই ব্রাউজারে কণ্ঠ ঘোষণা সমর্থন করে না'); setTimeout(() => setSyncToast(''), 3000); return; }
      const msg = String(text || '').trim();
      if (!msg) { setSyncToast('⚠ আগে ঘোষণার লেখাটি লিখুন'); setTimeout(() => setSyncToast(''), 3000); return; }
      window.speechSynthesis.cancel();
      setSyncToast('🔊 নমুনা শোনানো হচ্ছে…'); setTimeout(() => setSyncToast(''), 4000);
      // cancel()-এর সঙ্গে সঙ্গে speak() করলে Chrome উক্তি ফেলে দেয় — ১৫০ms দেরিতে বলা হয়
      setTimeout(() => tvSpeakMsg(msg, () => {
        setSyncToast('⚠ বাংলা ভয়েস নেই — Edge: সেটিংস → Voice access → Add voices → "বাংলা" যোগ করুন');
        setTimeout(() => setSyncToast(''), 9000);
      }), 150);
    } catch {}
  };
  // টগলের পাশে "নমুনা শুনুন" স্পিকার আইকন
  const tvSampleBtn = (onClick, title) => (
    <button type="button" onClick={onClick} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition shadow-sm" title={title} aria-label={title}><Volume2 className="w-4 h-4" /></button>
  );


  const [tvRotationDeg, setTvRotationDeg] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = Number(localStorage.getItem('amh_tv_rotation_deg'));
        if ([0, 90, 180, 270].includes(saved)) return saved;
      }
    } catch {}
    return 0;
  });

  // TV বোর্ড এখন শুধুই ভার্টিক্যাল — হরাইজেন্টাল ভিউ সম্পূর্ণ সরানো হয়েছে।
  const tvLayoutMode = 'vertical';

  // TV ডিসপ্লের কন্ট্রোল বার কয়েক সেকেন্ড নিষ্ক্রিয় থাকলে নিজে থেকে লুকায়;
  // মাউস নড়াচড়া, ট্যাপ বা কীবোর্ড focus-এ আবার দেখা যায়।
  const [tvControlsVisible, setTvControlsVisible] = useState(true);
  const tvControlsHideTimerRef = useRef(null);
  const tvControlsPinnedRef = useRef(false);
  const lastTvControlsScheduleRef = useRef(0);

  const hideTvControlsAfterDelay = useCallback(() => {
    if (typeof window === 'undefined' || tvControlsPinnedRef.current) return;
    const now = Date.now();
    if (now - lastTvControlsScheduleRef.current < 400) return;
    lastTvControlsScheduleRef.current = now;
    if (tvControlsHideTimerRef.current) window.clearTimeout(tvControlsHideTimerRef.current);
    tvControlsHideTimerRef.current = window.setTimeout(() => {
      setTvControlsVisible(false);
      tvControlsHideTimerRef.current = null;
    }, 10000);
  }, []);

  const revealTvControls = useCallback(() => {
    setTvControlsVisible(true);
    hideTvControlsAfterDelay();
  }, [hideTvControlsAfterDelay]);

  const pinTvControls = useCallback(() => {
    tvControlsPinnedRef.current = true;
    setTvControlsVisible(true);
    if (tvControlsHideTimerRef.current) {
      window.clearTimeout(tvControlsHideTimerRef.current);
      tvControlsHideTimerRef.current = null;
    }
  }, []);

  const unpinTvControls = useCallback(() => {
    tvControlsPinnedRef.current = false;
    lastTvControlsScheduleRef.current = 0;
    hideTvControlsAfterDelay();
  }, [hideTvControlsAfterDelay]);

  const handleRotateTvDisplay = useCallback((direction = 1) => {
    const next = ((tvRotationDeg + direction * 90) % 360 + 360) % 360;
    setTvRotationDeg(next);
    try {
      localStorage.setItem('amh_tv_rotation_deg', String(next));
    } catch {}

    const labels = {
      0: 'ল্যান্ডস্কেপ (০°)',
      90: 'পোর্ট্রেট (৯০°)',
      180: 'উল্টো ল্যান্ডস্কেপ (১৮০°)',
      270: 'পোর্ট্রেট (২৭০°)'
    };
    setSyncToast(
      `🔄 স্ক্রিন ${labels[next]} — ভার্টিক্যাল ভিউ`
    );
    setTimeout(() => setSyncToast(''), 3200);
  }, [tvRotationDeg]);

  const handleResetTvDisplayRotation = useCallback(() => {
    setTvRotationDeg(0);
    try {
      localStorage.setItem('amh_tv_rotation_deg', '0');
    } catch {}
    setSyncToast('🖥️ স্ক্রিন স্বাভাবিক ল্যান্ডস্কেপে (০°) ফিরে এসেছে');
    setTimeout(() => setSyncToast(''), 3000);
  }, []);

  const isTvScreenModeActive = Boolean(
    isAuthenticated && (activeTab === 'tv' || currentUser?.isTvMode || currentUser?.role === 'tv')
  );

  useEffect(() => {
    if (!isTvScreenModeActive) {
      if (tvControlsHideTimerRef.current) {
        window.clearTimeout(tvControlsHideTimerRef.current);
        tvControlsHideTimerRef.current = null;
      }
      tvControlsPinnedRef.current = false;
      setTvControlsVisible(true);
      return undefined;
    }

    lastTvControlsScheduleRef.current = 0;
    revealTvControls();

    return () => {
      if (tvControlsHideTimerRef.current) {
        window.clearTimeout(tvControlsHideTimerRef.current);
        tvControlsHideTimerRef.current = null;
      }
    };
  }, [isTvScreenModeActive, revealTvControls]);

  // পুরো TV ডিসপ্লে body-লেভেলে ঘোরানো হয়, যাতে পেজের কোনো অংশ
  // কাটা না পড়ে এবং ফিজিক্যালি ঘোরানো স্ক্রিনেও পুরো বোর্ডটি সোজা দেখা যায়।
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const rotationClass = `amh-screen-rotate-${tvRotationDeg}`;
    const rotationClasses = [
      'amh-screen-rotate-90',
      'amh-screen-rotate-180',
      'amh-screen-rotate-270'
    ];

    const clearRotation = () => {
      htmlEl.classList.remove('amh-screen-rotation-active');
      bodyEl.classList.remove('amh-screen-rotation-active', ...rotationClasses);
    };

    clearRotation();

    if (!isTvScreenModeActive || tvRotationDeg === 0) {
      return clearRotation;
    }

    htmlEl.classList.add('amh-screen-rotation-active');
    bodyEl.classList.add('amh-screen-rotation-active', rotationClass);

    return clearRotation;
  }, [isTvScreenModeActive, tvRotationDeg]);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);
        const saved = localStorage.getItem('amh_header_minimized');
        if (saved !== null) {
          return saved === 'true';
        }
        // মোবাইল ভিউতে লগিনের সময় উপরে হেডার ডিফল্টভাবে মিনিমাইজ করা থাকবে
        if (isMobile) return true;
      }
    } catch {}
    return false;
  });

  const toggleHeaderMinimize = useCallback(() => {
    // সাধারণ সমাধান: হেডার প্রসারিত/মিনিমাইজ করলে মূল কনটেন্ট (main) যেদিকে সরে, প্রতি ফ্রেমে
    // স্ক্রল দিয়ে তাকে উল্টো দিকে ঠিক করা হয় — ফলে তালিকা লাফায় না (কারণ যেকোনো হোক)
    const anchor = document.querySelector('main');
    const anchorTopBefore = anchor ? anchor.getBoundingClientRect().top : 0;
    setIsHeaderMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('amh_header_minimized', String(next));
      } catch {}
      return next;
    });
    if (!anchor) return;
    let lastTop = anchorTopBefore;
    let stable = 0;
    let frames = 0;
    const keep = () => {
      frames += 1;
      const drift = anchor.getBoundingClientRect().top - anchorTopBefore;
      if (Math.abs(drift) > 0.5) {
        const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo(0, Math.min(maxY, Math.max(0, window.scrollY + drift)));
      }
      const nowTop = anchor.getBoundingClientRect().top;
      if (Math.abs(nowTop - anchorTopBefore) < 1.5 && Math.abs(nowTop - lastTop) < 0.5) stable += 1;
      else stable = 0;
      lastTop = nowTop;
      if (stable >= 4 || frames >= 90) return;
      requestAnimationFrame(keep);
    };
    requestAnimationFrame(keep);
  }, []);

  // কিউ-তালিকার উপরের অংশ (তারিখ/ফিল্টার, সার্চ) লুকানো/দেখানো হলেও তালিকার সারি লাফাবে না:
  // প্রথম সারির ভিউপোর্ট-অবস্থান ধরে প্রতি ফ্রেমে উইন্ডো-স্ক্রল সমন্বয় করা হয়
  const runWithListAnchor = (mutate) => {
    try {
      const box = document.querySelector('div[class*="overscroll-contain"]');
      const anchor = (box && box.querySelector('button[aria-label]')) || box;
      const topBefore = anchor ? anchor.getBoundingClientRect().top : 0;
      mutate();
      if (!anchor) return;
      let stable = 0;
      let frames = 0;
      const keep = () => {
        frames += 1;
        if (!anchor.isConnected) return;
        const drift = anchor.getBoundingClientRect().top - topBefore;
        if (Math.abs(drift) > 0.5) {
          const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          window.scrollTo(0, Math.min(maxY, Math.max(0, window.scrollY + drift)));
        }
        if (Math.abs(anchor.getBoundingClientRect().top - topBefore) < 1.5) stable += 1; else stable = 0;
        if (stable >= 4 || frames >= 90) return;
        requestAnimationFrame(keep);
      };
      requestAnimationFrame(keep);
    } catch { mutate(); }
  };

  const headerBarRef = useRef(null);
  const [headerBarHeight, setHeaderBarHeight] = useState(0);

  useEffect(() => {
    const el = headerBarRef.current;
    if (!el) {
      // হেডার রেন্ডার হয়নি (TV Mood লগইন) — অফসেট শূন্য রাখা হয়
      try { document.documentElement.style.setProperty('--amh-header-h', '0px'); } catch {}
      return;
    }
    const updateHeight = () => {
      const h = Math.round(el.getBoundingClientRect().height || el.offsetHeight || 0);
      if (h > 0) setHeaderBarHeight(h);
      // মোবাইলে হেডার fixed থাকে, তাই মেইন প্যানেলকে কতটা নিচে নামতে হবে তা CSS ভেরিয়েবল দিয়ে জানানো হয়
      try { document.documentElement.style.setProperty('--amh-header-h', `${h > 0 ? h : 0}px`); } catch {}
    };
    updateHeight();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateHeight);
      ro.observe(el);
    }
    window.addEventListener('resize', updateHeight);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [isHeaderMinimized, currentUser?.isAdmin, activeTab]);

  const cloudUser = cloudSyncEnabled ? SERVER_CLOUD_USER : null;
  const [syncChannelId, setSyncChannelId] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const fromUrl = urlParams.get('room');
      if (fromUrl) return normalizeRoomKey(fromUrl);
      const savedRoom = localStorage.getItem('amh_active_room_key');
      if (savedRoom) return normalizeRoomKey(savedRoom);
      return DEFAULT_CHANNEL_ID;
    } catch {
      return DEFAULT_CHANNEL_ID;
    }
  });

  const [roomInputDraft, setRoomInputDraft] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const fromUrl = urlParams.get('room');
      if (fromUrl) return normalizeRoomKey(fromUrl);
      const savedRoom = localStorage.getItem('amh_active_room_key');
      if (savedRoom) return normalizeRoomKey(savedRoom);
      return DEFAULT_CHANNEL_ID;
    } catch {
      return DEFAULT_CHANNEL_ID;
    }
  });

  const [syncStatus, setSyncStatus] = useState('connecting');
  const [connectedBrokersCount, setConnectedBrokersCount] = useState(0);
  const [lastSyncedAtText, setLastSyncedAtText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [syncToast, setSyncToast] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const [deletedDates, setDeletedDates] = useState(() => {
    try {
      const room = normalizeRoomKey(new URLSearchParams(window.location.search).get('room') || localStorage.getItem('amh_active_room_key') || DEFAULT_CHANNEL_ID);
      const cached = localStorage.getItem(`amh_deleted_dates_${room}`);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [deletedPatientIds, setDeletedPatientIds] = useState(() => {
    try {
      const room = normalizeRoomKey(new URLSearchParams(window.location.search).get('room') || localStorage.getItem('amh_active_room_key') || DEFAULT_CHANNEL_ID);
      const cached = localStorage.getItem(`amh_deleted_patients_${room}`);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  // ডিলিট করা কিউ রোগীর সংক্ষিপ্ত রেকর্ড: { [তারিখ]: [{ id, name, serialNumber, deletedAt }] } — "ডিলিট" প্যানেলের জন্য
  const [deletedRecords, setDeletedRecords] = useState(() => {
    try {
      const room = normalizeRoomKey(new URLSearchParams(window.location.search).get('room') || localStorage.getItem('amh_active_room_key') || DEFAULT_CHANNEL_ID);
      const cached = localStorage.getItem(`amh_deleted_records_${room}`);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [whatsappTemplate, setWhatsappTemplate] = useState(DEFAULT_WHATSAPP_TEMPLATE);
  const [tempDraftInput, setTempDraftInput] = useState(DEFAULT_WHATSAPP_TEMPLATE);
  const [draftSaveSuccess, setDraftSaveSuccess] = useState(false);

  const [clinicNameState, setClinicNameState] = useState(t.clinicName);
  const [doctorTitleState, setDoctorTitleState] = useState(t.doctorTitle);
  const [tempClinicName, setTempClinicName] = useState(t.clinicName);
  const [tempDoctorTitle, setTempDoctorTitle] = useState(t.doctorTitle);
  const [clinicSaveSuccess, setClinicSaveSuccess] = useState(false);

  const [selectAndAskMode, setSelectAndAskMode] = useState(false);
  const [hoveredElementInfo, setHoveredElementInfo] = useState(null);
  const [hoverHighlightRect, setHoverHighlightRect] = useState(null);
  const [selectedElementInfo, setSelectedElementInfo] = useState(null);
  const [selectedElementsList, setSelectedElementsList] = useState([]);
  const [isCtrlMultiMode, setIsCtrlMultiMode] = useState(false);
  const [askPromptInput, setAskPromptInput] = useState('');
  const [presetCategoryFilter, setPresetCategoryFilter] = useState('all');
  const [presetSearchTerm, setPresetSearchTerm] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [headerAskMenuOpen, setHeaderAskMenuOpen] = useState(false);
  const [tvMenuOpen, setTvMenuOpen] = useState(false);
  const [promptHistory, setPromptHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('amh_select_ask_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ————— Edit text inline —————
  const [inlineEditMode, setInlineEditMode] = useState(false);
  const [inlineEditor, setInlineEditor] = useState(null);
  const [inlineEditDraft, setInlineEditDraft] = useState('');
  const [inlineEditHint, setInlineEditHint] = useState('');
  const inlineEditorRef = useRef(null);
  const inlineHintTimerRef = useRef(null);

  // ————— Draw Annotation —————
  const [annotationOpen, setAnnotationOpen] = useState(false);
  const [annotationStage, setAnnotationStage] = useState('capturing');
  const [annotationImage, setAnnotationImage] = useState(null);
  const [annotationShapes, setAnnotationShapes] = useState([]);
  const [annotationDraftShape, setAnnotationDraftShape] = useState(null);
  const [annotationTool, setAnnotationTool] = useState('rect');
  const [annotationColor, setAnnotationColor] = useState('#f43f5e');
  const [annotationNote, setAnnotationNote] = useState('');
  const [annotationError, setAnnotationError] = useState('');
  const [annotationFeedback, setAnnotationFeedback] = useState('');
  const [annotationBusy, setAnnotationBusy] = useState('');
  const [annotationRenderRect, setAnnotationRenderRect] = useState(null);
  const annotationStageRef = useRef(null);
  const annotationImgRef = useRef(null);
  const annotationSvgRef = useRef(null);
  const annotationDraftRef = useRef(null);
  const annotationPointerRef = useRef(null);

  const PRESET_CATEGORIES = [
    { id: 'all', label: 'সবগুলো (১০০)' },
    { id: '🚨 অতি জরুরি', label: '🚨 অতি জরুরি (২০)' },
    { id: '🎨 ডিজাইন ও রঙ', label: '🎨 ডিজাইন ও রঙ (২০)' },
    { id: '📱 মোবাইল লেআউট', label: '📱 মোবাইল লেআউট (১৫)' },
    { id: '🔤 ফন্ট ও লেখা', label: '🔤 ফন্ট ও লেখা (১৫)' },
    { id: '⚡ বাটন ও ক্লিক', label: '⚡ বাটন ও ক্লিক (১৫)' },
    { id: '🛠️ ফর্ম ও টুলস', label: '🛠️ ফর্ম ও টুলস (১৫)' }
  ];

  const SELECT_ASK_PRESETS = [
    { id: 1, label: '🗑️ এই উপাদানটি মুছে ফেলুন', prompt: 'এই উপাদানটি ড্যাশবোর্ড থেকে সম্পূর্ণ রিমুভ বা মুছে ফেলুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 2, label: '📱 মোবাইল ভিউতে ১ লাইনে রাখুন', prompt: 'মোবাইল ভিউতে এই অংশটি যেন ভেঙে না গিয়ে সুন্দরভাবে এক লাইনে কমপ্যাক্ট থাকে তা নিশ্চিত করুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 3, label: '🔤 বাংলা ফন্ট বড় ও স্পষ্ট', prompt: 'এই লেখার সাইজ আরও একটু বড় ও স্পষ্ট করুন যাতে মোবাইল ও ডেস্কটপে সুন্দরভাবে পড়া যায়।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 4, label: '📱 মোবাইলে নিচে নামিয়ে সাজান', prompt: 'মোবাইল স্ক্রিনে এই উপাদানটিকে ওপরের উপাদানের নিচে নামিয়ে সুন্দরভাবে সারিবদ্ধ করুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 5, label: '🎨 রঙ ও ডিজাইন প্রিমিয়াম করুন', prompt: 'এই অংশের ব্যাকগ্রাউন্ড কালার, প্যাডিং এবং শ্যাডো আরও প্রিমিয়াম ও আকর্ষণীয় করুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 6, label: '👁️ শুধু আইকন রাখুন (টেক্সট মুছুন)', prompt: 'এই বাটনের টেক্সটটি মুছে শুধুমাত্র পরিষ্কার আইকন প্রদর্শন করুন এবং টুলটিপ রাখুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 7, label: '➕ নতুন অ্যাকশন বাটন যোগ', prompt: 'এখানে একটি নতুন দরকারি অ্যাকশন বাটন যুক্ত করুন এবং প্রয়োজনীয় স্টেট হ্যান্ডলার দিন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 8, label: '↔️ পাশাপাশি সারিবদ্ধ করুন', prompt: 'নির্বাচিত উপাদানগুলোকে পাশাপাশি সমান দূরত্বে ও একই লাইনে এলাইন করুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 9, label: '↕️ উপরে-নিচে স্ট্যাক করুন', prompt: 'উপাদানগুলোকে উল্লম্বভাবে (Vertical Stack) একটির নিচে আরেকটি সুন্দরভাবে সাজান।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 10, label: '⚪ সাদা ব্যাকগ্রাউন্ড ও কালো ফন্ট', prompt: 'এই অংশের ব্যাকগ্রাউন্ড সাদা এবং ফন্টের কালার গাঢ় কালো (Text Slate 950) করুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 11, label: '⚫ ডার্ক মোড ব্যাকগ্রাউন্ড দিন', prompt: 'এই উপাদানটিতে ডার্ক ব্যাকগ্রাউন্ড ও উজ্জ্বল টেক্সট কালার দিয়ে প্রিমিয়াম কনট্রাস্ট দিন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 12, label: '📐 প্যাডিং ও ভেতরের স্পেসিং বাড়ান', prompt: 'এই উপাদানের চারপাশে প্যাডিং ও ভেতরের স্পেসিং আরও একটু বাড়িয়ে পরিচ্ছন্ন করুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 13, label: '📏 প্যাডিং ও মার্জিন কমান', prompt: 'এই উপাদানের বাড়তি প্যাডিং ও মার্জিন কমিয়ে আরও কমপ্যাক্ট ও স্লিম করুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 14, label: '💻 শুধু কম্পিউটারে দেখান (মোবাইলে হাইড)', prompt: 'এই উপাদানটি শুধুমাত্র কম্পিউটার বা বড় স্ক্রিনে দেখান, মোবাইলে লুকিয়ে রাখুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 15, label: '📱 শুধু মোবাইলে দেখান (ডেস্কটপে হাইড)', prompt: 'এই উপাদানটি শুধুমাত্র মোবাইল স্ক্রিনে দৃশ্যমান রাখুন, ডেস্কটপে হাইড করুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 16, label: '⚠️ নিশ্চিতকরণ (Confirm) ডায়ালগ', prompt: 'এই বাটনে চাপ দিলে সরাসরি ডিলিট না হয়ে আগে একটি কনফার্মেশন নোটিশ যেন চায়।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 17, label: '✅ সফলতার টোস্ট নোটিফিকেশন', prompt: 'এই অ্যাকশনটি সম্পন্ন হলে স্ক্রিনে একটি সুন্দর সবুজ টোস্ট কনফার্মেশন মেসেজ দেখান।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 18, label: '📋 এক ক্লিকে কপি করার বাটন', prompt: 'এখানে একটি দ্রুত কপি বাটন যোগ করুন যা ক্লিক করলে সাথে সাথে তথ্য ক্লিপবোর্ডে কপি হবে।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 19, label: '🔍 সার্চ বা ফিল্টারিং সুবিধা', prompt: 'এই তালিকায় নাম, ফোন বা আইডি দিয়ে দ্রুত ফিল্টার বা সার্চ করার ব্যবস্থা রাখুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 20, label: '📊 সংখ্যা বা কাউন্টার ব্যাজ দিন', prompt: 'এখানে মোট সংখ্যা বা পরিসংখ্যান দেখানোর জন্য একটি আকর্ষণীয় ছোট কাউন্ট ব্যাজ যোগ করুন।', priority: 'urgent', category: '🚨 অতি জরুরি' },
    { id: 21, label: '✨ প্রিমিয়াম ৩ডি গ্লাস মরফিজম', prompt: 'এই কার্ডে ৩ডি গ্লাস মরফিজম ইফেক্ট, ফ্রস্টেড ব্যাকগ্রাউন্ড ব্লার ও গ্লোয়িং বর্ডার দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 22, label: '🟢 হালকা সবুজ ব্যাকগ্রাউন্ড দিন', prompt: 'এই অংশের ব্যাকগ্রাউন্ড হালকা সবুজ (Soft Emerald) ও বর্ডার আরও পরিচ্ছন্ন করুন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 23, label: '🔵 হালকা নীল ব্যাকগ্রাউন্ড দিন', prompt: 'এই অংশের ব্যাকগ্রাউন্ড হালকা নীল (Soft Cyan/Blue) ও কনট্রাস্ট উন্নত করুন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 24, label: '🟣 হালকা বেগুনী ব্যাকগ্রাউন্ড দিন', prompt: 'এই অংশের ব্যাকগ্রাউন্ড হালকা বেগুনী (Soft Purple) ও মার্জিত লুক দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 25, label: '🟡 হালকা অ্যাম্বার/হলুদ ব্যাকগ্রাউন্ড', prompt: 'এই অংশে হালকা অ্যাম্বার/হলুদ সতর্কতামূলক ব্যাকগ্রাউন্ড ও সফট বর্ডার দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 26, label: '🔴 হালকা লাল/রোজ ব্যাকগ্রাউন্ড', prompt: 'এই অংশে হালকা লাল/গোলাপী ব্যাকগ্রাউন্ড ও লাল বর্ডার দিয়ে অ্যালার্ট লুক দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 27, label: '🌈 গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড যোগ', prompt: 'এই উপাদানে একটি আকর্ষণীয় ও মসৃণ দুই বা তিন রঙের গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 28, label: '🌟 সফট শ্যাডো ইফেক্ট (Shadow-LG)', prompt: 'এই কার্ডটির নিচে একটি সফট শ্যাডো (Shadow-LG) যোগ করে ভাসমান অনুভূতি দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 29, label: '🔘 গোল বৃত্তাকার কোণা (Rounded-Full)', prompt: 'এই উপাদানটির কোণাগুলো পুরোপুরি গোল বৃত্তাকার (Rounded-Full) ক্যাপসুল লুক দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 30, label: '✨ মসৃণ আধুনিক কোণা (Rounded-2XL)', prompt: 'এই কার্ড বা বাটনের কোণাগুলো আরও মসৃণ ও আধুনিক রাউন্ডেড (Rounded-2XL) করুন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 31, label: '🔲 সূক্ষ্ম গ্লাস বর্ডার (Border-White/20)', prompt: 'উপাদানটির চারপাশে একটি সূক্ষ্ম ফ্রস্টেড গ্লাস বর্ডার লাইন যুক্ত করুন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 32, label: '💫 গ্লোয়িং বর্ডার রিং (Ring-2)', prompt: 'নির্বাচিত উপাদানটির চারপাশে একটি নজরকাড়া গ্লোয়িং রিং আউটলাইন দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 33, label: '🌫️ ব্যাকড্রপ ব্লার (Backdrop-Blur-XL)', prompt: 'পেছনের কনটেন্ট ব্লার করে একটি আধুনিক ফ্রস্টেড গ্লাস ইফেক্ট তৈরি করুন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 34, label: '🌓 ডার্ক ও লাইট থিম ব্যালেন্স', prompt: 'ডার্ক এবং লাইট উভয় থিমেই যেন উপাদানটির কনট্রাস্ট নিখুঁত ও সুন্দর থাকে তা নিশ্চিত করুন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 35, label: '💎 লাক্সারি গোল্ডেন অ্যাকসেন্ট', prompt: 'এই অংশে হালকা গোল্ডেন/অ্যাম্বার অ্যাকসেন্ট দিয়ে প্রিমিয়াম ভিআইপি টাচ দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 36, label: '🧊 কুল আইস ব্লু থিম ফিনিশ', prompt: 'আইসি সায়ান ও ব্লু কালার টোনে উপাদানটির থিম ফিনিশিং দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 37, label: '🌿 ফ্রেশ মিন্ট গ্রিন থিম ফিনিশ', prompt: 'রিফ্রেশিং মিন্ট গ্রিন ও এমারেল্ড কালার দিয়ে ক্লিনিক্যাল ও স্বাস্থ্যকর লুক দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 38, label: '🌑 পিচ ব্ল্যাক ওনিডার্ক ফিনিশ', prompt: 'গভীর কালো (Neutral-950) ও মিনিমালিস্টিক ডার্ক ফিনিশ প্রদান করুন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 39, label: '🕊️ প্রিমিয়াম অফ-হোয়াইট ক্লিন ফিনিশ', prompt: 'চোখের আরামদায়ক সফট অফ-হোয়াইট ব্যাকগ্রাউন্ড ও পরিষ্কার বিভাজন লাইন দিন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 40, label: '🎨 ট্রান্সপারেন্ট ব্যাকগ্রাউন্ড (Bg-Transparent)', prompt: 'ব্যাকগ্রাউন্ড সম্পূর্ণ ট্রান্সপারেন্ট রেখে শুধুমাত্র বর্ডার ও আইকন প্রদর্শন করুন।', priority: 'high', category: '🎨 ডিজাইন ও রঙ' },
    { id: 41, label: '📱 মোবাইলে পুরো স্ক্রিন জুড়ে (W-Full)', prompt: 'মোবাইল স্ক্রিনে উপাদানটির প্রস্থ বাড়িয়ে পুরো স্ক্রিন (Width 100%) ফিলাপ করুন।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 42, label: '📱 মোবাইলে লেখার ফন্ট সাইজ ছোট করুন', prompt: 'মোবাইল ভিউতে লেখা যেন কেটে না যায় সেজন্য ফন্ট সাইজ সামঞ্জস্যপূর্ণ ছোট করুন।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 43, label: '🎯 মোবাইলে উপাদানের কন্টেন্ট সেন্টারে আনুন', prompt: 'ছোট স্ক্রিন ও মোবাইলে এই উপাদানটির সমস্ত লেখা ও আইকন ঠিক মাঝে (Center) বসান।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 44, label: '↔️ মোবাইলে অনুভূমিক স্ক্রোল (Overflow-X)', prompt: 'মোবাইল স্ক্রিনে টেবিল বা বাটনগুলো না ভেঙে যেন ডানে-বামে সহজে স্ক্রোল করা যায়।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 45, label: '📱 মোবাইলে গ্রিড কলাম ১টি করুন', prompt: 'মোবাইল স্ক্রিনে গ্রিড কলাম ২টি বা ৩টির বদলে ১টি কলামে সুন্দরভাবে দেখান।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 46, label: '💻 ডেস্কটপে গ্রিড কলাম ৩টি/৪টি করুন', prompt: 'ডেস্কটপ ভিউতে প্রশস্ত স্ক্রিনের পূর্ণ ব্যবহারের জন্য ৩টি বা ৪টি কলামে বিন্যস্ত করুন।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 47, label: '📐 অটো-ফিট রেসপন্সিভ গ্রিড', prompt: 'যেকোনো স্ক্রিন সাইজের সাথে স্বয়ংক্রিয়ভাবে খাপ খাইয়ে নিতে রেসপন্সিভ অটো-গ্রিড দিন।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 48, label: '📏 উপাদানের সর্বোচ্চ প্রস্থ সীমিত করুন (Max-W)', prompt: 'বড় স্ক্রিনে উপাদানটি অতিরিক্ত ছড়িয়ে না পড়ে সেজন্য একটি সুন্দর Max-Width নির্ধারণ করুন।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 49, label: '🪟 উপাদানের উচ্চতা ফিক্সড ও স্ক্রোলেবল করুন', prompt: 'উপাদানটির উচ্চতা নির্দিষ্ট সীমার মধ্যে রেখে ভেতরে স্ক্রোলবার (Overflow-Y-Auto) দিন।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 50, label: '🧱 উপাদানগুলোর মাঝে সমান ফাঁকা রাখুন (Gap-3)', prompt: 'উপাদানগুলোর পারস্পরিক দূরত্ব সামঞ্জস্যপূর্ণ করতে মাঝে সুনির্দিষ্ট গ্যাপ (Gap) দিন।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 51, label: '⚓ হেডার বা বারকে স্টিকি (Sticky Top) করুন', prompt: 'পৃষ্ঠা স্ক্রোল করলেও যেন এই হেডার বা বারটি স্ক্রিনের ওপরে আটকে থাকে।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 52, label: '📌 ফিক্সড বটম মোবাইল বার', prompt: 'মোবাইলে সহজে এক হাতে ব্যবহারের জন্য প্রয়োজনীয় বাটন নিচে ফিক্সড রাখুন।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 53, label: '🔄 ফ্লেক্স র‍্যাপ (Flex-Wrap) সক্রিয় করুন', prompt: 'জায়গা না থাকলে উপাদানগুলো জোর করে সংকুচিত না হয়ে স্বয়ংক্রিয়ভাবে পরবর্তী লাইনে নামুক।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 54, label: '⚖️ ফ্লেক্স উপাদানগুলোর গ্রোথ ব্যালেন্স (Flex-1)', prompt: 'সারির সবগুলো উপাদান যেন তাদের কন্টেন্ট অনুযায়ী সমান জায়গা ভাগ করে নেয়।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 55, label: '🗂️ কার্ডের সেকশনগুলোকে দাগ দিয়ে ভাগ করুন', prompt: 'কার্ডের বিভিন্ন তথ্যের মাঝে একটি নরম সূক্ষ্ম বিভাজন দাগ (Border Divider) দিন।', priority: 'high', category: '📱 মোবাইল লেআউট' },
    { id: 56, label: '🔤 ফন্ট এক্সট্রা বোল্ড (Font-Black)', prompt: 'লেখার গুরুত্ব বোঝাতে ফন্টের ঘনত্ব বাড়িয়ে আল্ট্রা বোল্ড বা ব্ল্যাক (Font-Black) করুন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 57, label: '🔤 ফন্ট মিডিয়াম সেমিবোল্ড (Font-Semibold)', prompt: 'লেখার অতিরিক্ত ভারী ভাব কমিয়ে মার্জিত সেমিবোল্ড (Font-Semibold) ফন্ট দিন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 58, label: '🔤 টেক্সট কালার উজ্জ্বল সাদা (Text-White)', prompt: 'ডার্ক ব্যাকগ্রাউন্ডে টেক্সটের রঙ সম্পূর্ণ উজ্জ্বল খাঁটি সাদা (Text-White) করুন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 59, label: '🔤 টেক্সট কালার সফট গ্রে (Text-Slate-400)', prompt: 'গৌণ তথ্যের জন্য টেক্সট কালার হালকা ও আরামদায়ক সফট গ্রে (Text-Slate-400) করুন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 60, label: '🔤 টেক্সট কালার উজ্জ্বল পান্না সবুজ (Text-Emerald)', prompt: 'সাফল্য বা সক্রিয় অবস্থা বোঝাতে লেখার রঙ উজ্জ্বল পান্না সবুজ (Text-Emerald) করুন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 61, label: '🔤 টেক্সট কালার উজ্জ্বল আকাশী নীল (Text-Cyan)', prompt: 'তথ্য বা নোটিশের লেখার রঙ আকর্ষণীয় আকাশী নীল (Text-Cyan/Blue) করুন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 62, label: '🔤 টেক্সট কালার সতর্কতামূলক অ্যাম্বার (Text-Amber)', prompt: 'গুরুত্বপূর্ণ সতর্কতা বা পেন্ডিং অবস্থা বোঝাতে টেক্সট অ্যাম্বার/হলুদ করুন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 63, label: '🔤 টেক্সট কালার সতর্কতা লাল (Text-Rose)', prompt: 'জরুরি সতর্কতা বা ত্রুটি বোঝাতে টেক্সটের রঙ স্পষ্ট লাল (Text-Rose) করুন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 64, label: '🔤 সংখ্যাগুলো মনোস্পেস ফন্টে দেখান (Font-Mono)', prompt: 'সিরিয়াল নম্বর, আইডি ও কোডগুলো যেন নিখুঁত সারিবদ্ধ থাকে তাই Font-Mono দিন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 65, label: '🔤 বড় হাতের অক্ষর রূপান্তর (Uppercase)', prompt: 'কোড বা লেবেলগুলোকে স্বয়ংক্রিয়ভাবে অল-ক্যাপস বা ক্যাপিটাল লেটারে দেখান।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 66, label: '🔤 বড় টেক্সট ট্রাঙ্কেট (Truncate with Ellipsis)', prompt: 'লম্বা লেখা বেশি হলে স্ক্রিন নষ্ট না করে শেষের দিকে ডট ডট (...) দিয়ে কাটুন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 67, label: '🔤 লেটার স্পেসিং উন্নত করুন (Tracking-Tight)', prompt: 'বড় হেডিংয়ের অক্ষরগুলোর ফাঁকা কমিয়ে আধুনিক স্লিম লুক (Tracking-Tight) দিন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 68, label: '🔤 লাইন হাইট ঠিক করুন (Leading-Tight)', prompt: 'দুই লাইনের লেখার মাঝখানের অতিরিক্ত ফাঁকা জায়গা কমিয়ে সুসংহত করুন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 69, label: '🔤 টেক্সট ড্রপ শ্যাডো যোগ (Drop-Shadow-SM)', prompt: 'লেখার পেছনে সূক্ষ্ম শ্যাডো দিয়ে ব্যাকগ্রাউন্ড থেকে লেখাকে স্পষ্টভাবে ফুটিয়ে তুলুন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 70, label: '🔤 ছোট সাবটাইটেল বা ক্যাপশন টেক্সট যোগ', prompt: 'প্রধান শিরোনামের নিচে হালকা ছোট অক্ষরে একটি সহায়ক বিবরণ বা ক্যাপশন দিন।', priority: 'medium', category: '🔤 ফন্ট ও লেখা' },
    { id: 71, label: '⚡ ক্লিকে তাৎক্ষণিক লোডিং স্পিনার', prompt: 'এই বাটনে ক্লিক করলে যেন তাৎক্ষণিক লোডিং বা স্পিনার অ্যানিমেশন দেখায়।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 72, label: '💫 পালস লাইভ ইন্ডিকেটর যোগ', prompt: 'এখানে একটি জীবন্ত পালসিং (Pulsing Dot) স্ট্যাটাস বা লাইভ ইন্ডিকেটর যুক্ত করুন।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 73, label: '🖱️ মাউস নিলে স্কেল বড় হওয়া (Hover:Scale-105)', prompt: 'বাটনের ওপর মাউস আনলে বাটনটি হালকা বড় হয়ে আকর্ষণীয় ইন্টারঅ্যাকশন দেখাবে।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 74, label: '🔘 মাউস নিলে ব্যাকগ্রাউন্ড উজ্জ্বল হওয়া (Hover:Bg)', prompt: 'বাটনে মাউস আনলে ব্যাকগ্রাউন্ড কালার হালকা পরিবর্তন বা উজ্জ্বল হবে।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 75, label: '👆 ক্লিকে পুশ-ডাউন অ্যানিমেশন (Active:Scale-95)', prompt: 'বাটনে চাপ দিলে বাটনটি হালকা ভেতরের দিকে দাববে (Active:Scale-95)।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 76, label: '🔒 বাটন ডিসেবল ও ওপাসিটি ৫০% করুন', prompt: 'প্রক্রিয়া চলাকালীন বাটনটি ডিসেবল করুন এবং হালকা অস্বচ্ছ (Opacity-50) রাখুন।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 77, label: '🏷️ বাটনের সাথে বর্ণনামূলক টুলটিপ যোগ', prompt: 'বাটনের ওপর মাউস আনলে বাটনের কাজ পরিষ্কারভাবে বোঝানোর জন্য টুলটিপ দেখান।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 78, label: '📐 বাটনের সাইজ বড় ও ক্লিকেবল করুন', prompt: 'মোবাইলে সহজে আঙুল দিয়ে ট্যাপ করার জন্য বাটনের উচ্চতা ও প্যাডিং বড় করুন।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 79, label: '📏 বাটনকে কমপ্যাক্ট ও ছোট করুন', prompt: 'জায়গা বাঁচাতে বাটনটির সাইজ ছোট ও মিনিমালিস্টিক করুন।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 80, label: '🎨 বাটনে প্রাইমারি অ্যাকসেন্ট কালার দিন', prompt: 'প্রধান ও সবচেয়ে গুরুত্বপূর্ণ বাটনে ব্র্যান্ডের মূল উজ্জ্বল কালার প্রদান করুন।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 81, label: '⚠️ বাটনে সতর্কতামূলক লাল/রোজ কালার দিন', prompt: 'ডিলিট বা ক্যানসেলের মতো ঝুঁকিপূর্ণ বাটনে লাল বা রোজ কালার দিন।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 82, label: '✅ বাটনে সাকসেস গ্রিন কালার দিন', prompt: 'নিশ্চিতকরণ বা সম্পন্ন করার বাটনে আকর্ষণীয় সবুজ কালার প্রয়োগ করুন।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 83, label: '🔘 বাটনে আউটলাইন/বর্ডার স্টাইল দিন', prompt: 'সলিড ব্যাকগ্রাউন্ডের বদলে মার্জিত বর্ডার আউটলাইন বাটন স্টাইল দিন।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 84, label: '⬅️ আইকন বামে ও লেখা ডানে সাজান', prompt: 'বাটনের ভেতরে আইকনটি সবসময় লেখার বামে সুন্দর ব্যবধানে সাজিয়ে রাখুন।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 85, label: '➡️ আইকন ডানে ও লেখা বামে সাজান', prompt: 'বাটনের ভেতরে লেখা বামে এবং ড্রপডাউন বা নেভিগেশন আইকন ডানে রাখুন।', priority: 'medium', category: '⚡ বাটন ও ক্লিক' },
    { id: 86, label: '📝 ইনপুট ফিল্ডে ফোকাস রিং দিন (Focus:Ring-2)', prompt: 'ইনপুট বক্সে ক্লিক করলে চারপাশে একটি সুন্দর রঙিন ফোকাস রিং জ্বলে উঠুক।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 87, label: '💬 স্পষ্ট প্লেসহোল্ডার টেক্সট যোগ', prompt: 'ইনপুট বক্সে ব্যবহারকারীকে পথ দেখানোর জন্য পরিষ্কার ও পূর্ণাঙ্গ প্লেসহোল্ডার দিন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 88, label: '❌ ইনপুট এক ক্লিকে ক্লিয়ার করার অপশন', prompt: 'ইনপুট বক্সের ভেতরে লেখা এক ক্লিকে মুছে ফেলার জন্য একটি ছোট (X) বাটন দিন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 89, label: '🔒 ইনপুট রিড-অনলি বা লকড মোড', prompt: 'তথ্য প্রদর্শন ঠিক রেখে যাতে অনাকাঙ্ক্ষিত পরিবর্তন না হয় সেজন্য ফিল্ডটি লক রাখুন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 90, label: '📅 আজকের তারিখ এক ক্লিকে সিলেক্ট', prompt: 'তারিখ নির্বাচন ফিল্ডে আজকের তারিখ দ্রুত বসানোর জন্য একটি চটজলদি বাটন দিন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 91, label: '🔄 ফর্ম বা ইনপুট রিসেট বাটন যোগ', prompt: 'ফর্মের সমস্ত ফিল্ড ডিফল্ট অবস্থায় ফিরিয়ে আনার জন্য রিসেট বাটন দিন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 92, label: '📋 এক ক্লিকে ডেটা কপি ও শেয়ার', prompt: 'রোগীর তথ্য বা সিরিয়াল লিঙ্ক এক ক্লিকে ক্লিপবোর্ডে কপি ও শেয়ার করার ব্যবস্থা রাখুন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 93, label: '📥 Excel / CSV ফাইলে ডাউনলোড সুবিধা', prompt: 'এই তালিকার পুরো ডেটা সরাসরি এক্সেল বা সিএসভি শিট আকারে ডাউনলোডের অপশন দিন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 94, label: '💾 সম্পূর্ণ JSON ব্যাকআপ সংরক্ষণ', prompt: 'সম্পূর্ণ ডেটাবেজের অফলাইন ব্যাকআপ JSON ফাইল হিসেবে সেভ করার বাটন দিন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 95, label: '🖨️ প্রিন্ট ফ্রেন্ডলি ভিউ তৈরি করুন', prompt: 'এই অংশটি কাগজে প্রিন্ট করার জন্য ক্লিন ব্ল্যাক-অ্যান্ড-হোয়াইট প্রিন্ট স্টাইল দিন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 96, label: '⌨️ কিবোর্ড শর্টকাট (Hotkeys) সক্রিয় করুন', prompt: 'মাউস ছাড়াই কিবোর্ডের বোতাম চেপে দ্রুত কাজ করার হটকি সাপোর্ট দিন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 97, label: '🏷️ কালার-কোডেড স্ট্যাটাস ট্যাগ যোগ', prompt: 'পেন্ডিং, ডাকা হচ্ছে, সম্পন্ন ইত্যাদি স্ট্যাটাসের আলাদা রঙিন ট্যাগ দিন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 98, label: '⏱️ আনুমানিক সময় ও কাউন্টডাউন টাইমার', prompt: 'রোগীর সিরিয়াল আসতে আর আনুমানিক কত মিনিট লাগবে তা কাউন্টডাউনে দেখান।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 99, label: '🔔 গুরুত্বপূর্ণ কাজের পর কনফার্মেশন প্রম্পট', prompt: 'রোগী ডিলিট বা তারিখ ক্লিয়ারের আগে অ্যাডমিন পাসওয়ার্ড বা কনফার্মেশন চান।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' },
    { id: 100, label: '🔄 লাইভ ক্লাউড ডাটা রিফ্রেশ হ্যান্ডলার', prompt: 'ম্যানুয়ালি ক্লাউড থেকে তাৎক্ষণিক লেটেস্ট ডাটা টানার লাইভ হ্যান্ডলার দিন।', priority: 'normal', category: '🛠️ ফর্ম ও টুলস' }
  ];

  const filteredPresetsList = useMemo(() => {
    let list = SELECT_ASK_PRESETS;
    if (presetCategoryFilter !== 'all') {
      list = list.filter(p => p.category === presetCategoryFilter);
    }
    if (presetSearchTerm.trim()) {
      const q = presetSearchTerm.trim().toLowerCase();
      list = list.filter(p => p.label.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q));
    }
    return list;
  }, [presetCategoryFilter, presetSearchTerm]);

  const getElementContextDetails = useCallback((target) => {
    if (!target) return { tag: 'element', role: 'উপাদান', section: 'মূল অ্যাপ', text: '' };
    const tag = target.tagName ? target.tagName.toLowerCase() : 'element';
    const buttonEl = target.closest('button');
    const titleAttr = target.getAttribute('title') || buttonEl?.getAttribute('title');
    const ariaAttr = target.getAttribute('aria-label') || buttonEl?.getAttribute('aria-label');
    const rawText = (target.innerText || titleAttr || ariaAttr || target.placeholder || target.value || '').trim();
    const cleanText = rawText.replace(/\s+/g, ' ').slice(0, 80);

    let section = 'মূল অ্যাপ';
    if (target.closest('header')) {
      section = 'হেডার বার (Header)';
    } else if (target.closest('nav')) {
      section = 'নিচের মেইন প্যানেল (Bottom Navigation)';
    } else if (target.closest('table')) {
      section = 'রোগীর সিরিয়াল তালিকা টেবিল';
    } else if (activeTab === 'register') {
      section = 'নতুন সিরিয়াল ফরম';
    } else if (activeTab === 'queue') {
      section = 'লাইভ কিউ ড্যাশবোর্ড';
    } else if (activeTab === 'patientId') {
      section = 'Patient ID ও হেলথ কার্ড প্যানেল';
    } else if (activeTab === 'reports') {
      section = 'দৈনিক রিপোর্ট ও ক্লাউড সিঙ্ক';
    } else if (activeTab === 'team') {
      section = 'এডমিন প্যানেল';
    } else if (activeTab === 'settings') {
      section = 'সিস্টেম সেটিংস';
    } else if (activeTab === 'tvconfig') {
      section = 'টিভি সেটআপ প্যানেল';
    }

    let role = tag;
    if (tag === 'button') role = 'বাটন (Button)';
    else if (tag === 'input') role = `ইনপুট ফিল্ড (${target.type || 'text'})`;
    else if (tag === 'select') role = 'ড্রপডাউন (Select)';
    else if (tag === 'textarea') role = 'টেক্সট এরিয়া (Textarea)';
    else if (['h1', 'h2', 'h3', 'h4'].includes(tag)) role = `হেডিং (${tag.toUpperCase()})`;
    else if (tag === 'span' || tag === 'p') role = 'টেক্সট / লেবেল';
    else if (tag === 'th' || tag === 'td') role = 'টেবিল সেল';

    return {
      tag,
      role,
      section,
      text: cleanText || `${role} (${section})`
    };
  }, [activeTab]);

  const getInlineEditableTarget = useCallback((rawTarget) => {
    if (!rawTarget) return null;
    const start = rawTarget.nodeType === 3 ? rawTarget.parentElement : rawTarget;
    if (!start || !start.closest) return null;
    if (start.closest('[data-select-ask-ignore="true"], [data-annotation-ignore="true"]')) return null;
    if (start.closest('input, textarea, select')) return null;

    const editableTags = new Set([
      'SPAN', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BUTTON', 'A', 'LABEL',
      'LI', 'TD', 'TH', 'SMALL', 'STRONG', 'EM', 'B', 'DIV', 'FIGCAPTION',
      'LEGEND', 'SUMMARY', 'BLOCKQUOTE'
    ]);
    const decisiveTags = new Set([
      'BUTTON', 'A', 'LABEL', 'TD', 'TH', 'LEGEND', 'SUMMARY', 'H1', 'H2', 'H3',
      'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE'
    ]);

    let el = start;
    let fallback = null;

    for (let depth = 0; el && el !== document.body && depth < 10; depth += 1, el = el.parentElement) {
      if (!editableTags.has(el.tagName)) continue;
      if (el.closest('[data-select-ask-ignore="true"], [data-annotation-ignore="true"]')) continue;

      const raw = (el.innerText || '').replace(/\r/g, '').trim();
      if (!raw) continue;
      if (raw.length > 600) return fallback;

      const rect = el.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) continue;

      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;

      const candidate = {
        el,
        text: raw.replace(/\n{3,}/g, '\n\n').slice(0, 600),
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right
        },
        style: {
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          fontFamily: cs.fontFamily,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          textAlign: cs.textAlign,
          color: cs.color
        }
      };

      if (!fallback) fallback = candidate;
      const hasDirectText = Array.from(el.childNodes).some(
        node => node.nodeType === 3 && node.textContent.replace(/\s+/g, '').length > 0
      );
      if (hasDirectText || decisiveTags.has(el.tagName)) return candidate;
    }

    return fallback;
  }, []);

  const handlePageInspectClick = useCallback((e) => {
    if (inlineEditMode) {
      if (e.target.closest('[data-select-ask-ignore="true"]')) return;
      e.preventDefault();
      e.stopPropagation();
      const editable = getInlineEditableTarget(e.target);
      if (!editable) {
        setInlineEditHint('এই জায়গায় সম্পাদনযোগ্য লেখা পাওয়া যায়নি — অনুগ্রহ করে কোনো লেখা বা বাটনের ঠিক ওপরে ক্লিক করুন।');
        if (inlineHintTimerRef.current) clearTimeout(inlineHintTimerRef.current);
        inlineHintTimerRef.current = setTimeout(() => setInlineEditHint(''), 3200);
        return;
      }
      setInlineEditor({
        info: getElementContextDetails(editable.el),
        text: editable.text,
        rect: editable.rect,
        style: editable.style
      });
      setInlineEditDraft(editable.text);
      setInlineEditMode(false);
      setSelectAndAskMode(false);
      setHoveredElementInfo(null);
      setHoverHighlightRect(null);
      setInlineEditHint('');
      return;
    }

    if (!selectAndAskMode) return;
    if (e.target.closest('[data-select-ask-ignore="true"]')) return;
    e.preventDefault();
    e.stopPropagation();

    let targetEl = e.target.closest('nav button');
    if (!targetEl && e.target.closest('nav')) targetEl = e.target.closest('nav');
    if (!targetEl) targetEl = e.target;

    const isFixed = Boolean(targetEl.closest('nav, [style*="fixed"], .fixed'));
    const info = getElementContextDetails(targetEl);
    const rect = targetEl.getBoundingClientRect();
    const itemWithRect = {
      ...info,
      id: `sel-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      rect: {
        top: isFixed ? rect.top : rect.top + window.scrollY,
        left: isFixed ? rect.left : rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        isFixed
      }
    };

    const isMultiSelectKey = e.ctrlKey || e.metaKey || isCtrlMultiMode;

    if (isMultiSelectKey) {
      setSelectedElementsList((prev) => {
        const existsIndex = prev.findIndex(
          (p) => p.text === info.text && p.tag === info.tag && p.section === info.section
        );
        if (existsIndex >= 0) {
          return prev.filter((_, idx) => idx !== existsIndex);
        } else {
          return [...prev, itemWithRect];
        }
      });
      return;
    }

    if (selectedElementsList.length > 0) {
      const exists = selectedElementsList.some(
        (p) => p.text === info.text && p.tag === info.tag && p.section === info.section
      );
      const finalList = exists ? selectedElementsList : [...selectedElementsList, itemWithRect];
      setSelectedElementsList(finalList);
      setSelectedElementInfo(finalList[0]);
      setSelectAndAskMode(false);
      setHoveredElementInfo(null);
      setHoverHighlightRect(null);
      return;
    }

    setSelectedElementsList([itemWithRect]);
    setSelectedElementInfo(info);
    setSelectAndAskMode(false);
    setHoveredElementInfo(null);
    setHoverHighlightRect(null);
  }, [inlineEditMode, selectAndAskMode, isCtrlMultiMode, selectedElementsList, getElementContextDetails, getInlineEditableTarget]);

  const handlePageInspectMove = useCallback((e) => {
    if (inlineEditMode) {
      if (e.target.closest('[data-select-ask-ignore="true"]')) {
        setHoverHighlightRect(null);
        setHoveredElementInfo(null);
        return;
      }
      const editable = getInlineEditableTarget(e.target);
      if (!editable) {
        setHoverHighlightRect(null);
        setHoveredElementInfo(null);
        return;
      }
      setHoverHighlightRect({
        top: editable.rect.top,
        left: editable.rect.left,
        width: editable.rect.width,
        height: editable.rect.height,
        isFixed: true
      });
      setHoveredElementInfo({
        ...getElementContextDetails(editable.el),
        text: editable.text.replace(/\s+/g, ' ').slice(0, 80)
      });
      return;
    }

    if (!selectAndAskMode) return;
    if (e.target.closest('[data-select-ask-ignore="true"]')) {
      setHoverHighlightRect(null);
      setHoveredElementInfo(null);
      return;
    }
    let target = e.target;
    if (!target) return;
    const navBtn = target.closest('nav button');
    if (navBtn) target = navBtn;
    else if (target.closest('nav')) target = target.closest('nav');
    try {
      const isFixed = Boolean(target.closest('nav, [style*="fixed"], .fixed'));
      const rect = target.getBoundingClientRect();
      setHoverHighlightRect({
        top: isFixed ? rect.top : rect.top + window.scrollY,
        left: isFixed ? rect.left : rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        isFixed
      });
      setHoveredElementInfo(getElementContextDetails(target));
    } catch {}
  }, [inlineEditMode, selectAndAskMode, getElementContextDetails, getInlineEditableTarget]);

  const cancelInlineEdit = useCallback(() => {
    setInlineEditor(null);
    setInlineEditDraft('');
    setInlineEditMode(false);
    setInlineEditHint('');
  }, []);

  const applyInlineEdit = useCallback(() => {
    if (!inlineEditor) return;
    const oldText = inlineEditor.text;
    const newText = inlineEditDraft.replace(/\r/g, '');
    if (oldText === newText) return;

    const targetInfo = {
      ...inlineEditor.info,
      id: `inline-${Date.now()}`,
      text: oldText
    };

    const instruction = newText.trim() === ''
      ? `📝 Edit text inline — নির্দিষ্ট লেখা মুছে ফেলার নির্দেশ:\n• পুরনো লেখা: "${oldText}"\n• নির্দেশ: স্ক্রিনে এই লেখাটি সম্পূর্ণ মুছে ফেলুন (ডিলিট করুন) এবং আশপাশের ডিজাইন অপরিবর্তিত রাখুন।`
      : `📝 Edit text inline — নির্দিষ্ট লেখা প্রতিস্থাপনের নির্দেশ:\nনিচের পুরনো লেখাটি সম্পূর্ণ বদলে ঠিক নতুন লেখাটি বসান — অন্য কোনো লেখা বা ডিজাইন বদলাবেন না।\n\n🔴 পুরনো লেখা:\n"""${oldText}"""\n\n🟢 নতুন লেখা:\n"""${newText}"""\n\nনতুন লেখার লাইন-ব্রেক, শব্দ ও বাংলা বানান হুবহু রাখুন।`;

    setSelectedElementInfo(targetInfo);
    setSelectedElementsList([targetInfo]);
    setAskPromptInput(instruction);
    setCopiedPrompt(false);
    setInlineEditor(null);
    setInlineEditMode(false);
    setInlineEditDraft('');
    setHoverHighlightRect(null);
    setHoveredElementInfo(null);
  }, [inlineEditor, inlineEditDraft]);

// Global keydown handler moved below state declarations

  const [patientsByDate, setPatientsByDate] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const room = normalizeRoomKey(
          new URLSearchParams(window.location.search).get('room')
            || localStorage.getItem('amh_active_room_key')
            || DEFAULT_CHANNEL_ID
        );
        const cached = localStorage.getItem(`amh_patients_${room}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}
    return { [TODAY_KEY]: [] };
  });

  const [patientIdPrefix, setPatientIdPrefix] = useState('AMH');
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [customPatientIdInput, setCustomPatientIdInput] = useState('');
  const [idFormName, setIdFormName] = useState('');
  const [idFormDob, setIdFormDob] = useState('');
  const [idFormRegDate, setIdFormRegDate] = useState(TODAY_KEY);
  const [idFormAgeYears, setIdFormAgeYears] = useState('২৫');
  const [idFormAgeMonths, setIdFormAgeMonths] = useState('০');
  const [idFormAgeDays, setIdFormAgeDays] = useState('০');
  const [idFormPhone, setIdFormPhone] = useState('');
  const [idFormBloodGroup, setIdFormBloodGroup] = useState('');
  const [idFormNotes, setIdFormNotes] = useState('');
  const [patientIdDirectory, setPatientIdDirectory] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const room = normalizeRoomKey(
          new URLSearchParams(window.location.search).get('room')
            || localStorage.getItem('amh_active_room_key')
            || DEFAULT_CHANNEL_ID
        );
        const cached = localStorage.getItem(`amh_directory_${room}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}
    return [];
  });

  const [selectedIdCardPatient, setSelectedIdCardPatient] = useState(null);
  const [dateSelectPatient, setDateSelectPatient] = useState(null);
  const [editingQueuePatient, setEditingQueuePatient] = useState(null);
  const [editQueueName, setEditQueueName] = useState('');
  const [editQueueAgeYears, setEditQueueAgeYears] = useState('');
  const [editQueueAgeMonths, setEditQueueAgeMonths] = useState('');
  const [editQueueAgeDays, setEditQueueAgeDays] = useState('');
  const [editQueuePhone, setEditQueuePhone] = useState('');
  const [editQueueSymptoms, setEditQueueSymptoms] = useState('');
  const [editQueueSerial, setEditQueueSerial] = useState('');
  const [editQueueDate, setEditQueueDate] = useState('');
  const [editQueueStatus, setEditQueueStatus] = useState('WAITING');
  const [editQueueIsChild, setEditQueueIsChild] = useState(false);
  const [editQueueAdminPin, setEditQueueAdminPin] = useState('');
  const [editQueueAdminError, setEditQueueAdminError] = useState('');
  const [adminPanelUnlocked, setAdminPanelUnlocked] = useState(false);
  const [adminPanelUnlockPin, setAdminPanelUnlockPin] = useState('');
  const [adminPanelUnlockError, setAdminPanelUnlockError] = useState('');
  const TAB_ORDER = useMemo(() => {
    if (currentUser?.isGuest) return ['register', 'queue'];
    if (currentUser?.isTvMode || currentUser?.role === 'tv') return ['tv'];
    if (currentUser?.isAdmin) return ['register', 'queue', 'patientId', 'reports', 'team', 'settings'];
    return ['register', 'queue', 'patientId', 'reports', 'settings'];
  }, [currentUser]);

  // অ্যাক্সেস কন্ট্রোল ও রুট গার্ড হ্যান্ডলার
  useEffect(() => {
    // এডমিন প্যানেল শুধুমাত্র অ্যাডমিন দেখতে পাবে
    if (!currentUser?.isAdmin && activeTab === 'team') {
      setActiveTab('register');
    }
    // TV MOOD প্যানেল শুধুমাত্র অ্যাডমিন ও TV Mood দেখতে পাবে
    if (activeTab === 'tv' && !currentUser?.isAdmin && !currentUser?.isTvMode && currentUser?.role !== 'tv') {
      setActiveTab('queue');
    }
    // গেস্ট ইউজাররা শুধুমাত্র 'register' ও 'queue' দেখতে পাবে
    if (currentUser?.isGuest && !['register', 'queue'].includes(activeTab)) {
      setActiveTab('queue');
    }
  }, [currentUser, activeTab]);
  useEffect(() => { if (IS_MINI_PREVIEW) return; try { localStorage.setItem('amh_active_tab', activeTab); } catch {} }, [activeTab]);
  // টিভি মোডে ঢোকার আগে শেষ কোন সাধারণ প্যানেলে ছিলেন — TV থেকে ফিরতে সেখানেই যাবে
  const lastNonTvTabRef = useRef('queue');
  useEffect(() => {
    if (activeTab !== 'tv') lastNonTvTabRef.current = activeTab;
  }, [activeTab]);
  const [slideDirection, setSlideDirection] = useState('left');
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isTouchActiveRef = useRef(false);
  const mouseStartXRef = useRef(0);
  const mouseStartYRef = useRef(0);
  const isMouseActiveRef = useRef(false);

  const handleTouchStart = (e) => {
    if (selectAndAskMode || editingQueuePatient || dateSelectPatient || selectedIdCardPatient || adminAuthModal?.isOpen) return;
    if (e.target.closest('input, textarea, select, canvas')) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isTouchActiveRef.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!isTouchActiveRef.current || selectAndAskMode || editingQueuePatient || dateSelectPatient || selectedIdCardPatient || adminAuthModal?.isOpen) return;
    isTouchActiveRef.current = false;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartXRef.current;
    const deltaY = endY - touchStartYRef.current;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      const currentIndex = TAB_ORDER.indexOf(activeTab);
      if (deltaX < 0) {
        // বামে সোয়াইপ -> পরবর্তী প্যানেল
        if (currentIndex < TAB_ORDER.length - 1) {
          setSlideDirection('left');
          setActiveTab(TAB_ORDER[currentIndex + 1]);
        }
      } else {
        // ডানে সোয়াইপ -> পূর্ববর্তী প্যানেল
        if (currentIndex > 0) {
          setSlideDirection('right');
          setActiveTab(TAB_ORDER[currentIndex - 1]);
        }
      }
    }
  };

  const handleMouseDown = (e) => {
    if (selectAndAskMode || editingQueuePatient || dateSelectPatient || selectedIdCardPatient || adminAuthModal?.isOpen) return;
    if (e.target.closest('input, textarea, select, button, a, canvas')) return;
    mouseStartXRef.current = e.clientX;
    mouseStartYRef.current = e.clientY;
    isMouseActiveRef.current = true;
  };

  const handleMouseUp = (e) => {
    if (!isMouseActiveRef.current || selectAndAskMode || editingQueuePatient || dateSelectPatient || selectedIdCardPatient || adminAuthModal?.isOpen) return;
    isMouseActiveRef.current = false;
    const deltaX = e.clientX - mouseStartXRef.current;
    const deltaY = e.clientY - mouseStartYRef.current;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      const currentIndex = TAB_ORDER.indexOf(activeTab);
      if (deltaX < 0) {
        if (currentIndex < TAB_ORDER.length - 1) {
          setSlideDirection('left');
          setActiveTab(TAB_ORDER[currentIndex + 1]);
        }
      } else {
        if (currentIndex > 0) {
          setSlideDirection('right');
          setActiveTab(TAB_ORDER[currentIndex - 1]);
        }
      }
    }
  };
  const [customSerialDate, setCustomSerialDate] = useState(TODAY_KEY);
  const [copiedPatientId, setCopiedPatientId] = useState('');
  const [quickSerialToast, setQuickSerialToast] = useState('');
  const [patientIdImportToast, setPatientIdImportToast] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [editingPatientIdRecord, setEditingPatientIdRecord] = useState(null);
  const [editPidCode, setEditPidCode] = useState('');
  const [editPidName, setEditPidName] = useState('');
  const [editPidDob, setEditPidDob] = useState('');
  const [editPidAgeYears, setEditPidAgeYears] = useState('');
  const [editPidAgeMonths, setEditPidAgeMonths] = useState('');
  const [editPidAgeDays, setEditPidAgeDays] = useState('');
  const [editPidPhone, setEditPidPhone] = useState('');
  const [editPidBloodGroup, setEditPidBloodGroup] = useState('');
  const [editPidNotes, setEditPidNotes] = useState('');
  const [ageDays, setAgeDays] = useState('০');
  const [currentTimeTick, setCurrentTimeTick] = useState(Date.now());
  const [chamberStartTime, setChamberStartTime] = useState('16:00');
  const [closedDates, setClosedDates] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('amh_closed_dates');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [];
  });
  const [avgServiceMinutes, setAvgServiceMinutes] = useState(3);
  const [registrationRuleConfig, setRegistrationRuleConfig] = useState(() => {
    const defaultConfig = {
      enabled: true,
      ageLimitYears: 4,
      underAgeParity: 'EVEN',
      overAgeParity: 'ODD',
      customRuleNotice: ''
    };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('amh_registration_rule_config');
        if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
      }
    } catch {}
    return defaultConfig;
  });
  const [tempRuleAgeLimit, setTempRuleAgeLimit] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('amh_registration_rule_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.ageLimitYears !== undefined) return toBengaliDigits(parsed.ageLimitYears);
        }
      }
    } catch {}
    return '৪';
  });
  const [ruleSaveSuccess, setRuleSaveSuccess] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(() => {
    try { const v = localStorage.getItem('amh_queue_filters_open'); return v === null ? true : v === 'true'; } catch { return true; }
  });
  const [queueSearchOpen, setQueueSearchOpen] = useState(() => {
    try { const v = localStorage.getItem('amh_queue_search_open'); return v === null ? true : v === 'true'; } catch { return true; }
  });
  const [queueTopHidden, setQueueTopHidden] = useState(() => {
    try { return localStorage.getItem('amh_queue_top_hidden') === 'true'; } catch { return false; }
  });
  const [patientName, setPatientName] = useState('');
  const [ageYears, setAgeYears] = useState('২৫');
  const [ageMonths, setAgeMonths] = useState('০');
  const [appointmentDate, setAppointmentDate] = useState(TODAY_KEY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const patientNameInputRef = useRef(null);
  const ageYearsInputRef = useRef(null);

  const [openAgePanel, setOpenAgePanel] = useState(true);
  // মোবাইলে (<640px) ডিফল্ট মিনিমাইজ; ডেস্কটপে আগের মতো খোলা
  const defaultRegistrationPanelOpen = () => typeof window === 'undefined' || window.innerWidth >= 640;
  const [openDatePanel, setOpenDatePanel] = useState(defaultRegistrationPanelOpen);
  const [openPhonePanel, setOpenPhonePanel] = useState(() => defaultRegistrationPanelOpen() || currentUser?.isGuest === true);
  const [openSymptomsPanel, setOpenSymptomsPanel] = useState(defaultRegistrationPanelOpen);

  // গেস্টের সিরিয়াল আবেদন — এডমিন/স্টাফ অনুমোদন না করা পর্যন্ত কিউ-তে সিরিয়াল বরাদ্দ হয় না
  const [pendingApplications, setPendingApplications] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const room = new URLSearchParams(window.location.search).get('room') || DEFAULT_CHANNEL_ID;
        const cached = localStorage.getItem(`amh_applications_${room}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}
    return [];
  });
  const [guestFormError, setGuestFormError] = useState('');
  const [registerIdSearch, setRegisterIdSearch] = useState('');
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [swUpdateReady, setSwUpdateReady] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(display-mode: standalone)').matches : false));
  const [guestPhoneLookup, setGuestPhoneLookup] = useState(() => {
    try { return localStorage.getItem('amh_guest_phone') || ''; } catch { return ''; }
  });
  const phoneNumberInputRef = useRef(null);

  const [queueSelectedDate, setQueueSelectedDate] = useState(TODAY_KEY);
  const [reportSelectedDate, setReportSelectedDate] = useState(TODAY_KEY);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQueuePatientId, setSelectedQueuePatientId] = useState(null);
  const [completedPanelOpen, setCompletedPanelOpen] = useState(false);
  const [absentPanelOpen, setAbsentPanelOpen] = useState(false);
  const [cancelledPanelOpen, setCancelledPanelOpen] = useState(false);
  const [deletedPanelOpen, setDeletedPanelOpen] = useState(false);
  const [allPanelOpen, setAllPanelOpen] = useState(false);
  // কিউ ইনলাইন ভিউ-মোড: কোন তালিকা নিচের লিস্টে দেখানো হবে (pop-up ছাড়া)
  const [queueView, setQueueView] = useState('normal');
  const [queueToolbarMinimized, setQueueToolbarMinimized] = useState(() => { try { return localStorage.getItem('amh_queue_toolbar_minimized') === '1'; } catch { return false; } });
  const [queueToolbarHidden, setQueueToolbarHidden] = useState(() => { try { return localStorage.getItem('amh_queue_toolbar_hidden') === '1'; } catch { return false; } });
  useEffect(() => { try { localStorage.setItem('amh_queue_toolbar_minimized', queueToolbarMinimized ? '1' : '0'); } catch { /* ignore */ } }, [queueToolbarMinimized]);
  useEffect(() => { try { localStorage.setItem('amh_queue_toolbar_hidden', queueToolbarHidden ? '1' : '0'); } catch { /* ignore */ } }, [queueToolbarHidden]);
  const [queueDeleteTarget, setQueueDeleteTarget] = useState(null);
  // কিউ মাল্টি-মার্কিং: Ctrl+ক্লিক / দীর্ঘ-চাপে মার্ক করা রোগীর id সেট + বাল্ক-ডিলিটের id লিস্ট
  const [markedQueueIds, setMarkedQueueIds] = useState(() => new Set());
  const [queueDeleteIds, setQueueDeleteIds] = useState(null);
  const [idCardDeleteTarget, setIdCardDeleteTarget] = useState(null);
  const queueCardRefs = useRef(new Map());
  const queueRowActionsRef = useRef({});
  const registerQueueCard = useCallback((patientId, el) => {
    if (el) queueCardRefs.current.set(patientId, el);
    else queueCardRefs.current.delete(patientId);
  }, []);
  const queueUndoStackRef = useRef([]);

  const [lastDeletedDateBackup, setLastDeletedDateBackup] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPin, setEditPin] = useState('');

  // লগইন করার সময় পাসওয়ার্ড আবশ্যক কি না (অন/অফ টগল স্টেট)
  const [requireLoginPassword, setRequireLoginPassword] = useState(() => {
    try {
      const saved = localStorage.getItem('amh_require_login_password');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [adminAuthModal, setAdminAuthModal] = useState({
    isOpen: false,
    actionType: null,
    targetData: null,
    title: '',
    description: '',
    error: '',
    passwordInput: ''
  });

  // গ্লোবাল কিবোর্ড শর্টকাট (Escape কী চেপে যেকোনো পপ আপ বা মডাল বন্ধ করার হ্যান্ডলার)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlMultiMode(true);
      }
      if (e.key === 'Escape') {
        let handled = false;
        if (inlineEditor) {
          setInlineEditor(null);
          setInlineEditDraft('');
          setInlineEditMode(false);
          handled = true;
        } else if (annotationOpen) {
          setAnnotationOpen(false);
          setAnnotationShapes([]);
          setAnnotationDraftShape(null);
          annotationDraftRef.current = null;
          annotationPointerRef.current = null;
          setAnnotationFeedback('');
          setAnnotationBusy('');
          handled = true;
        } else if (inlineEditMode) {
          setInlineEditMode(false);
          setHoverHighlightRect(null);
          setHoveredElementInfo(null);
          setInlineEditHint('');
          handled = true;
        } else if (adminAuthModal.isOpen) {
          setAdminAuthModal((prev) => ({ ...prev, isOpen: false, passwordInput: '', error: '' }));
          handled = true;
        } else if (showQrModal) {
          setShowQrModal(false);
          handled = true;
        } else if (editingPatientIdRecord) {
          setEditingPatientIdRecord(null);
          handled = true;
        } else if (selectedIdCardPatient) {
          setSelectedIdCardPatient(null);
          handled = true;
        } else if (editingQueuePatient) {
          setEditingQueuePatient(null);
          handled = true;
        } else if (queueDeleteTarget) {
          setQueueDeleteTarget(null);
          handled = true;
        } else if (idCardDeleteTarget) {
          setIdCardDeleteTarget(null);
          handled = true;
        } else if (completedPanelOpen) {
          setCompletedPanelOpen(false);
          handled = true;
        } else if (absentPanelOpen) {
          setAbsentPanelOpen(false);
          handled = true;
        } else if (cancelledPanelOpen) {
          setCancelledPanelOpen(false);
          handled = true;
        } else if (deletedPanelOpen) {
          setDeletedPanelOpen(false);
          handled = true;
        } else if (dateSelectPatient) {
          setDateSelectPatient(null);
          handled = true;
        } else if (selectedElementInfo || selectedElementsList.length > 0) {
          setSelectedElementInfo(null);
          setSelectedElementsList([]);
          handled = true;
        } else if (exportMenuOpen) {
          setExportMenuOpen(false);
          handled = true;
        } else if (headerAskMenuOpen) {
          setHeaderAskMenuOpen(false);
          handled = true;
        } else if (selectAndAskMode) {
          setSelectAndAskMode(false);
          setSelectedElementsList([]);
          setHoverHighlightRect(null);
          setHoveredElementInfo(null);
          handled = true;
        }
        if (handled) {
          e.preventDefault();
        }
      } else if (e.altKey && (e.key === 's' || e.key === 'S') && typeof window !== 'undefined' && window.innerWidth > 768 && isAuthenticated && currentUser && !currentUser.isGuest) {
        e.preventDefault();
        setSelectAndAskMode((prev) => !prev);
        setSelectedElementsList([]);
        setHoverHighlightRect(null);
        setHoveredElementInfo(null);
        setHeaderAskMenuOpen(false);
        setInlineEditMode(false);
        setInlineEditor(null);
        setInlineEditDraft('');
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlMultiMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    adminAuthModal.isOpen,
    showQrModal,
    editingPatientIdRecord,
    selectedIdCardPatient,
    editingQueuePatient,
    queueDeleteTarget,
    idCardDeleteTarget,
    completedPanelOpen,
    absentPanelOpen,
    cancelledPanelOpen,
    deletedPanelOpen,
    dateSelectPatient,
    selectedElementInfo,
    selectedElementsList,
    exportMenuOpen,
    headerAskMenuOpen,
    selectAndAskMode,
    inlineEditor,
    inlineEditMode,
    annotationOpen,
    isAuthenticated,
    currentUser?.isGuest
  ]);

  // এডিটর বা আঁকিবুঁকির ওভারলে খোলা থাকলে পেছনের পেজ স্ক্রোল লক
  useEffect(() => {
    const shouldLock = Boolean(inlineEditor) || (annotationOpen && annotationStage !== 'capturing');
    if (!shouldLock) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [inlineEditor, annotationOpen, annotationStage]);

  useEffect(() => {
    return () => {
      if (inlineHintTimerRef.current) clearTimeout(inlineHintTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!inlineEditor) return undefined;
    const timer = setTimeout(() => {
      const editor = inlineEditorRef.current;
      if (!editor) return;
      editor.focus();
      const end = editor.value.length;
      try {
        editor.setSelectionRange(end, end);
      } catch {}
    }, 60);
    return () => clearTimeout(timer);
  }, [inlineEditor]);

  const clientSessionId = useRef(`DEVICE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  const logicalClockRef = useRef(Date.now());
  const processedMsgIdsRef = useRef(new Set());
  const mqttClientsRef = useRef([]);
  const bcRef = useRef(null);

  const getNextLogicalTime = useCallback(() => {
    const now = Date.now();
    const next = Math.max(now, logicalClockRef.current + 1);
    logicalClockRef.current = next;
    return next;
  }, []);

  const activePanelName = useMemo(() => {
    switch (activeTab) {
      case 'register':
        return 'নতুন সিরিয়াল';
      case 'queue':
        return 'লাইভ কিউ';
      case 'patientId':
        return 'Patient ID';
      case 'reports':
        return 'দৈনিক রিপোর্ট';
      case 'tv':
        return 'TV MOOD (ডিসপ্লে)';
      case 'team':
        return 'এডমিন প্যানেল';
      case 'settings':
        return 'সেটিংস';
      default:
        return 'প্যানেল';
    }
  }, [activeTab]);

  // ————— Draw Annotation: capture, draw, export —————
  const updateAnnotationRenderRect = useCallback(() => {
    const stage = annotationStageRef.current;
    const img = annotationImgRef.current;
    if (!stage || !img) return;
    const stageRect = stage.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    if (!imgRect.width || !imgRect.height) return;
    const next = {
      left: imgRect.left - stageRect.left,
      top: imgRect.top - stageRect.top,
      width: imgRect.width,
      height: imgRect.height
    };
    setAnnotationRenderRect(prev => {
      if (
        prev &&
        Math.abs(prev.left - next.left) < 0.5 &&
        Math.abs(prev.top - next.top) < 0.5 &&
        Math.abs(prev.width - next.width) < 0.5 &&
        Math.abs(prev.height - next.height) < 0.5
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!annotationOpen || annotationStage !== 'ready') return undefined;
    const stage = annotationStageRef.current;
    const raf = requestAnimationFrame(updateAnnotationRenderRect);
    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && stage) {
      observer = new ResizeObserver(updateAnnotationRenderRect);
      observer.observe(stage);
    }
    window.addEventListener('resize', updateAnnotationRenderRect);
    window.addEventListener('orientationchange', updateAnnotationRenderRect);
    return () => {
      cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateAnnotationRenderRect);
      window.removeEventListener('orientationchange', updateAnnotationRenderRect);
    };
  }, [annotationOpen, annotationStage, annotationImage, updateAnnotationRenderRect]);

  const startAnnotationCapture = useCallback(async () => {
    setHeaderAskMenuOpen(false);
    setSelectAndAskMode(false);
    setInlineEditMode(false);
    setInlineEditor(null);
    setInlineEditDraft('');
    setHoveredElementInfo(null);
    setHoverHighlightRect(null);
    setAnnotationOpen(true);
    setAnnotationStage('capturing');
    setAnnotationError('');
    setAnnotationFeedback('');
    setAnnotationBusy('');
    setAnnotationImage(null);
    setAnnotationRenderRect(null);
    setAnnotationShapes([]);
    setAnnotationDraftShape(null);
    setAnnotationNote('');
    setAnnotationTool('rect');
    setAnnotationColor('#f43f5e');
    annotationDraftRef.current = null;
    annotationPointerRef.current = null;

    try {
      // মেনু/ওভারলে পেইন্ট হওয়া ও মেনু বন্ধ হওয়ার জন্য ছোট বিরতি
      await new Promise(resolve => setTimeout(resolve, 180));
      const { default: html2canvas } = await import('html2canvas-pro');
      const captureWidth = document.documentElement.clientWidth || window.innerWidth;
      const captureHeight = window.innerHeight;
      const scrollX = window.scrollX || window.pageXOffset || 0;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const capturePromise = html2canvas(document.body, {
        backgroundColor: '#ffffff',
        logging: false,
        scale: dpr,
        useCORS: true,
        allowTaint: false,
        width: captureWidth,
        height: captureHeight,
        x: scrollX,
        y: scrollY,
        scrollX,
        scrollY,
        windowWidth: captureWidth,
        windowHeight: captureHeight,
        imageTimeout: 8000,
        onclone: (clonedDoc) => {
          // লাইভ সাইটে ক্লোন-আইফ্রেমে এক্সটার্নাল CSS লোড হতে দেরি হলে স্ক্রিনশট
          // স্টাইলহীন হয়ে যেতে পারে। তাই অ্যাপের CSS ক্লোন ডকুমেন্টে সরাসরি বসানো হয়।
          try {
            const head = clonedDoc.head || clonedDoc.getElementsByTagName('head')[0];
            if (head && !clonedDoc.querySelector('style[data-amh-capture-styles="true"]')) {
              const cssText = getAnnotationCaptureCssText();
              if (cssText) {
                const style = clonedDoc.createElement('style');
                style.setAttribute('data-amh-capture-styles', 'true');
                style.textContent = cssText;
                head.appendChild(style);
              }
            }
          } catch (error) {
            console.warn('Draw Annotation style injection failed:', error);
          }

          try {
            // পেজ স্ক্রল করা থাকলে sticky হেডার html2canvas-এ কনটেন্টের পিছনে
            // চলে যায়। ক্লোনে হেডারটি ভিউপোর্টের উপরে ফিক্সড করে আঁকা হয়,
            // যাতে স্ক্রিনশটে সবসময় হেডার ও তার কন্ট্রোল দেখা যায়।
            const liveHeader = document.querySelector('header');
            const headerHeight = liveHeader ? Math.round(liveHeader.getBoundingClientRect().height) : 0;
            const clonedHeaderBg = clonedDoc.querySelector('[data-amh-header-bg="true"]');
            if (clonedHeaderBg) {
              clonedHeaderBg.style.setProperty('position', 'fixed', 'important');
              clonedHeaderBg.style.setProperty('top', '0', 'important');
              clonedHeaderBg.style.setProperty('left', '0', 'important');
              clonedHeaderBg.style.setProperty('right', '0', 'important');
              clonedHeaderBg.style.setProperty('z-index', '10', 'important');
            }
            const clonedHeader = clonedDoc.querySelector('header');
            const stickyWrapper = clonedHeader ? clonedHeader.parentElement : null;
            if (stickyWrapper) {
              stickyWrapper.style.setProperty('position', 'fixed', 'important');
              stickyWrapper.style.setProperty('top', '0', 'important');
              stickyWrapper.style.setProperty('left', '0', 'important');
              stickyWrapper.style.setProperty('right', '0', 'important');
              stickyWrapper.style.setProperty('z-index', '30', 'important');
              // ফিক্সড হেডার ফ্লো থেকে বাদ পড়ায় ক্লোনের উচ্চতা কমে যায় এবং
              // পেজের নিচের দিকে স্ক্রল ক্ল্যাম্প হয়ে হেডার কেটে যেতে পারে।
              // তাই হেডারের উচ্চতা সমান প্যাডিং দিয়ে সেই ঘাটতি পূরণ করা হয়।
              if (headerHeight > 0) {
                const bodyPadTop = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
                clonedDoc.body.style.setProperty('padding-top', `${Math.round(bodyPadTop + headerHeight)}px`, 'important');
              }
            }
          } catch (error) {
            console.warn('Draw Annotation header pin failed:', error);
          }
        },
        ignoreElements: (el) => {
          try {
            return Boolean(el.closest && el.closest('[data-annotation-ignore="true"]'));
          } catch {
            return false;
          }
        }
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('capture-timeout')), 25000);
      });

      const canvas = await Promise.race([capturePromise, timeoutPromise]);
      if (!canvas || !canvas.width || !canvas.height) throw new Error('empty-capture');

      const dataUrl = canvas.toDataURL('image/png');
      setAnnotationImage({
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        cssWidth: Math.max(captureWidth, 1)
      });
      setAnnotationStage('ready');
    } catch (error) {
      console.warn('Draw Annotation screenshot failed:', error);
      setAnnotationError('স্ক্রিনশট নেওয়া সম্ভব হয়নি। ইন্টারনেট বা ব্রাউজার সমস্যা হতে পারে — আবার চেষ্টা করুন।');
      setAnnotationStage('error');
    }
  }, []);

  const closeAnnotationWorkspace = useCallback(() => {
    setAnnotationOpen(false);
    setAnnotationShapes([]);
    setAnnotationDraftShape(null);
    annotationDraftRef.current = null;
    annotationPointerRef.current = null;
    setAnnotationFeedback('');
    setAnnotationBusy('');
  }, []);

  const getAnnotationPoint = useCallback((event) => {
    if (!annotationImage || !annotationSvgRef.current) return null;
    const rect = annotationSvgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = ((event.clientX - rect.left) / rect.width) * annotationImage.width;
    const y = ((event.clientY - rect.top) / rect.height) * annotationImage.height;
    return {
      x: Math.max(0, Math.min(annotationImage.width, x)),
      y: Math.max(0, Math.min(annotationImage.height, y))
    };
  }, [annotationImage]);

  const handleAnnotationPointerDown = useCallback((event) => {
    if (!annotationImage || annotationStage !== 'ready') return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const point = getAnnotationPoint(event);
    if (!point) return;
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}
    annotationPointerRef.current = { pointerId: event.pointerId };
    const shape = annotationTool === 'pen'
      ? {
          id: `ann-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: 'pen',
          color: annotationColor,
          points: [point]
        }
      : {
          id: `ann-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: annotationTool,
          color: annotationColor,
          x1: point.x,
          y1: point.y,
          x2: point.x,
          y2: point.y
        };
    annotationDraftRef.current = shape;
    setAnnotationDraftShape(shape);
  }, [annotationImage, annotationStage, annotationTool, annotationColor, getAnnotationPoint]);

  const handleAnnotationPointerMove = useCallback((event) => {
    const pointer = annotationPointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    const point = getAnnotationPoint(event);
    const previous = annotationDraftRef.current;
    if (!point || !previous) return;
    event.preventDefault();

    let next;
    if (previous.type === 'pen') {
      const last = previous.points[previous.points.length - 1];
      if (last && Math.hypot(point.x - last.x, point.y - last.y) < 1.2) return;
      if (previous.points.length > 900) return;
      next = { ...previous, points: [...previous.points, point] };
    } else {
      next = { ...previous, x2: point.x, y2: point.y };
    }
    annotationDraftRef.current = next;
    setAnnotationDraftShape(next);
  }, [getAnnotationPoint]);

  const finishAnnotationStroke = useCallback((event, commit) => {
    const pointer = annotationPointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    annotationPointerRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
    const shape = annotationDraftRef.current;
    annotationDraftRef.current = null;
    setAnnotationDraftShape(null);
    if (!shape || !commit) return;

    const valid = shape.type === 'pen'
      ? shape.points.length > 2
      : Math.abs(shape.x2 - shape.x1) > 4 || Math.abs(shape.y2 - shape.y1) > 4;
    if (valid) {
      setAnnotationShapes(prev => [...prev, shape]);
    }
  }, []);

  const annotationStrokeWidth = useMemo(() => {
    if (!annotationImage) return 8;
    const ratio = annotationImage.width / Math.max(annotationImage.cssWidth || annotationImage.width, 1);
    return Math.max(4, Math.round(5 * ratio));
  }, [annotationImage]);

  const buildAnnotatedCanvas = useCallback(async () => {
    if (!annotationImage) throw new Error('no-annotation-image');
    const image = new Image();
    image.decoding = 'async';
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = annotationImage.dataUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = annotationImage.width;
    canvas.height = annotationImage.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas-context-unavailable');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    annotationShapes.forEach(shape => drawAnnotationShapeOnCanvas(ctx, shape, annotationStrokeWidth));
    return canvas;
  }, [annotationImage, annotationShapes, annotationStrokeWidth]);

  const buildAnnotationPrompt = useCallback(() => {
    const usedLabels = [...new Set(annotationShapes.map(shape => shape.type))]
      .map(type => (ANNOTATION_TOOLS.find(tool => tool.id === type) || {}).label || type);
    const marksText = annotationShapes.length > 0
      ? `${toBengaliDigits(annotationShapes.length)}টি চিহ্ন (${usedLabels.join(', ')})`
      : 'কোনো চিহ্ন নেই';
    return `🎯 [Select & Ask — Draw Annotation | AMH]\n• প্যানেল: ${activePanelName} (${activeTab})\n• স্ক্রিনশটে চিহ্নিত: ${marksText}\n• নির্দেশ: ${annotationNote.trim() || 'সংযুক্ত স্ক্রিনশটে যে জায়গাগুলো বক্স/গোল/তীর দিয়ে চিহ্নিত করা হয়েছে, শুধু সেই জায়গাগুলোতে প্রয়োজনীয় পরিবর্তন করুন।'}\n• সংযুক্তি: নিচের অ্যানোটেটেড স্ক্রিনশটটি দেখুন — চিহ্নিত অংশের রঙ, আকার ও অবস্থান অনুযায়ী পরিবর্তন করুন।`;
  }, [annotationShapes, annotationNote, activePanelName, activeTab, annotationImage]);

  const handleCopyAnnotationPrompt = useCallback(async () => {
    setAnnotationBusy('prompt');
    setAnnotationFeedback('');
    const success = await safeCopyToClipboard(buildAnnotationPrompt());
    setAnnotationBusy('');
    setAnnotationFeedback(success
      ? 'নির্দেশ কপি হয়েছে — এখন AI চ্যাটে পেস্ট করুন।'
      : 'নির্দেশ কপি করা যায়নি। আবার চেষ্টা করুন।');
  }, [buildAnnotationPrompt]);

  const handleDownloadAnnotation = useCallback(async () => {
    setAnnotationBusy('download');
    setAnnotationFeedback('');
    try {
      const canvas = await buildAnnotatedCanvas();
      const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
      const link = document.createElement('a');
      link.download = `amh-annotation-${stamp}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setAnnotationFeedback('অ্যানোটেটেড PNG ডাউনলোড হয়েছে — AI চ্যাটে সংযুক্ত করুন।');
    } catch (error) {
      console.warn('Annotation download failed:', error);
      setAnnotationFeedback('ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setAnnotationBusy('');
    }
  }, [buildAnnotatedCanvas]);

  const handleCopyAnnotationImage = useCallback(async () => {
    setAnnotationBusy('image');
    setAnnotationFeedback('');
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
        throw new Error('clipboard-image-unsupported');
      }
      const canvas = await buildAnnotatedCanvas();
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(result => (result ? resolve(result) : reject(new Error('blob-failed'))), 'image/png');
      });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setAnnotationFeedback('ছবি কপি হয়েছে — এখন AI চ্যাটে পেস্ট করতে পারেন।');
    } catch (error) {
      console.warn('Annotation image copy failed:', error);
      setAnnotationFeedback('ব্রাউজার ছবি কপি সমর্থন করেনি — PNG ডাউনলোড করে সংযুক্ত করুন।');
    } finally {
      setAnnotationBusy('');
    }
  }, [buildAnnotatedCanvas]);

  const themeStyles = useMemo(() => {
    if (activeTheme === 'aurora-ui') {
      return {
        id: 'aurora-ui',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#E2F7F4] via-[#EEF9F6] to-[#E3EFFB] text-slate-800',
        header: 'bg-gradient-to-r from-[#005C53] via-[#042940] to-[#0D3B66] border-b border-cyan-400/40 text-cyan-50 shadow-xl shadow-teal-950/20 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-[#042940]/80 text-cyan-50 border-cyan-400/40 backdrop-blur-xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-xl ring-1 ring-cyan-300/20 transition-all duration-300',
        brandSubtext: 'text-cyan-200',
        brandDot: 'bg-emerald-300 shadow-emerald-300 shadow-md animate-pulse',
        card: 'bg-white/95 backdrop-blur-md border border-teal-200/90 rounded-2xl sm:rounded-3xl text-slate-800 shadow-[0_12px_32px_rgba(4,41,64,0.09),0_0_15px_rgba(0,92,83,0.06)]',
        subCard: 'bg-gradient-to-br from-[#EEFAF8] to-[#EAF2FA] border border-teal-200/70 rounded-2xl text-slate-800',
        input: 'bg-white border border-teal-300 text-slate-800 placeholder-teal-600/40 focus:ring-2 focus:ring-teal-500 focus:border-cyan-500 rounded-xl shadow-xs',
        buttonPrimary: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 active:scale-[0.98] text-white font-bold rounded-xl transition shadow-lg shadow-teal-600/25',
        navActive: 'bg-white text-teal-950 shadow-sm font-black ring-1 ring-cyan-400',
        navInactive: 'text-cyan-100 hover:bg-white/10',
        badgeChild: 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white font-black shadow-xs',
        badgeGen: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black shadow-xs',
        borderGen: 'border-l-emerald-600',
        borderChild: 'border-l-cyan-600',
        dateActive: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-800 ring-1 ring-cyan-400 shadow-xs font-bold',
        submitButton: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold active:scale-95 disabled:opacity-40 shadow-lg shadow-teal-600/30 border border-cyan-300',
        bottomNav: 'bg-gradient-to-r from-[#005C53]/[0.03] via-[#042940]/[0.03] to-[#0D3B66]/[0.03] backdrop-blur-md text-cyan-50',
        presetActive: 'bg-teal-700 text-white border-teal-800 shadow-sm font-bold',
        quickSymBtn: 'bg-teal-50/90 hover:bg-teal-100 text-teal-950 border-teal-200',
        accentBadge: 'bg-teal-50 text-teal-900 border-teal-200',
        settingsBorder: 'border-teal-300',
        settingsText: 'text-teal-800',
        // TV Mood — Aurora UI
        tvHeaderBanner: 'bg-gradient-to-br from-[#005C53]/95 via-[#042940]/92 to-[#0D3B66]/95 backdrop-blur-2xl border border-cyan-300/45 ring-1 ring-white/10 shadow-[0_22px_60px_-18px_rgba(0,255,213,0.35),0_8px_20px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.22)]',
        tvClockCard: 'bg-white/10 backdrop-blur-2xl border border-cyan-400/40 text-cyan-50 shadow-[0_0_25px_rgba(6,182,212,0.3)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-200 to-blue-200',
        tvClockDate: 'text-cyan-200/90',
        tvDocName: 'text-cyan-300',
        tvCurrentCard: 'bg-gradient-to-br from-[#021B23] via-[#042940] to-[#005C53] text-cyan-50 border-2 border-cyan-400 shadow-[0_14px_45px_rgba(0,92,83,0.45),inset_0_1px_3px_rgba(255,255,255,0.25)]',
        tvCurrentDot: 'bg-cyan-400',
        tvCurrentTitle: 'text-cyan-300',
        tvCurrentAge: 'text-cyan-200',
        tvChamberBadge: 'bg-cyan-400 text-slate-950 font-black',
        tvTokenCurrent: 'text-cyan-100 drop-shadow-[0_4px_25px_rgba(6,182,212,0.7)]',
        tvCurrentSubBadge: 'bg-cyan-950/70 border border-cyan-400/40',
        tvNextCard: 'bg-gradient-to-br from-[#042940] via-[#0D3B66] to-[#021B23] text-emerald-50 border-2 border-emerald-400 shadow-[0_14px_40px_rgba(16,185,129,0.35)]',
        tvNextDot: 'bg-emerald-400',
        tvNextTitle: 'text-emerald-300',
        tvNextBadge: 'bg-emerald-400 text-slate-950 font-black',
        tvTokenNext: 'text-emerald-300 drop-shadow-[0_4px_20px_rgba(52,211,153,0.6)]',
        tvNextAge: 'text-emerald-200',
        tvNextSubBox: 'bg-emerald-950/70 border border-emerald-400/40',
        tvListCard: 'bg-gradient-to-br from-[#021B23]/95 via-slate-950/90 to-[#042940]/90 backdrop-blur-2xl border border-cyan-400/35 shadow-[0_14px_40px_rgba(0,0,0,0.6)]',
        tvCountBadge: 'bg-[#042940] text-cyan-300 border border-cyan-500/40',
        tvListItem: 'bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-400/25',
        tvTokenList: 'text-cyan-300',
        tvStatusBadge: 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/40'
      };
    }
    if (activeTheme === 'gradient-mesh-ui') {
      return {
        id: 'gradient-mesh-ui',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#FDF2F8] to-[#FFF7ED] text-slate-800',
        header: 'bg-gradient-to-r from-[#6366F1] via-[#D946EF] to-[#F59E0B] border-b border-white/25 text-white shadow-xl shadow-fuchsia-900/20 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-slate-950/45 text-white border-white/30 backdrop-blur-xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-xl ring-1 ring-white/20 transition-all duration-300',
        brandSubtext: 'text-pink-100',
        brandDot: 'bg-amber-300 shadow-amber-300 shadow-md animate-pulse',
        card: 'bg-white/95 backdrop-blur-md border border-fuchsia-100/90 rounded-2xl sm:rounded-3xl text-slate-800 shadow-[0_12px_32px_rgba(217,70,239,0.09),0_4px_14px_rgba(99,102,241,0.05)]',
        subCard: 'bg-gradient-to-br from-[#FAF5FF] to-[#FFF1F2] border border-purple-100 rounded-2xl text-slate-800',
        input: 'bg-white border border-pink-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-400 focus:border-purple-400 rounded-xl shadow-xs',
        buttonPrimary: 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 active:scale-[0.98] text-white font-bold rounded-xl transition shadow-lg shadow-fuchsia-500/25',
        navActive: 'bg-white text-fuchsia-950 shadow-sm font-black ring-1 ring-fuchsia-400',
        navInactive: 'text-pink-100 hover:bg-white/10',
        badgeChild: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black shadow-xs',
        badgeGen: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black shadow-xs',
        borderGen: 'border-l-indigo-500',
        borderChild: 'border-l-pink-500',
        dateActive: 'bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 text-white border-pink-700 ring-1 ring-pink-400 shadow-xs font-bold',
        submitButton: 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-white font-bold active:scale-95 disabled:opacity-40 shadow-lg shadow-fuchsia-500/30 border border-pink-300',
        bottomNav: 'bg-gradient-to-r from-[#4F46E5]/[0.03] via-[#C026D3]/[0.03] to-[#D97706]/[0.03] backdrop-blur-md text-white',
        presetActive: 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white border-purple-700 shadow-sm font-bold',
        quickSymBtn: 'bg-pink-50/80 hover:bg-pink-100 text-slate-900 border-pink-200',
        accentBadge: 'bg-purple-50 text-purple-900 border-purple-200',
        settingsBorder: 'border-pink-300',
        settingsText: 'text-fuchsia-800',
        // TV Mood — Gradient Mesh UI
        tvHeaderBanner: 'bg-gradient-to-br from-indigo-950/95 via-fuchsia-950/92 to-amber-950/95 backdrop-blur-2xl border border-fuchsia-300/45 ring-1 ring-white/10 shadow-[0_22px_60px_-18px_rgba(217,70,239,0.5),0_8px_20px_-10px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.22)]',
        tvClockCard: 'bg-white/10 backdrop-blur-2xl border border-fuchsia-400/40 text-pink-50 shadow-[0_0_25px_rgba(217,70,239,0.3)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-amber-200',
        tvClockDate: 'text-pink-200/90',
        tvDocName: 'text-amber-300',
        tvCurrentCard: 'bg-gradient-to-br from-[#1E1B4B] via-[#4A044E] to-[#451A03] text-pink-50 border-2 border-fuchsia-400 shadow-[0_14px_45px_rgba(217,70,239,0.4),inset_0_1px_3px_rgba(255,255,255,0.25)]',
        tvCurrentDot: 'bg-fuchsia-400',
        tvCurrentTitle: 'text-fuchsia-300',
        tvCurrentAge: 'text-pink-200',
        tvChamberBadge: 'bg-fuchsia-400 text-slate-950 font-black',
        tvTokenCurrent: 'text-fuchsia-100 drop-shadow-[0_4px_25px_rgba(217,70,239,0.7)]',
        tvCurrentSubBadge: 'bg-fuchsia-950/70 border border-fuchsia-400/40',
        tvNextCard: 'bg-gradient-to-br from-[#451A03] via-[#31102A] to-[#1E1B4B] text-amber-50 border-2 border-amber-400 shadow-[0_14px_40px_rgba(245,158,11,0.35)]',
        tvNextDot: 'bg-amber-400',
        tvNextTitle: 'text-amber-300',
        tvNextBadge: 'bg-amber-400 text-slate-950 font-black',
        tvTokenNext: 'text-amber-300 drop-shadow-[0_4px_20px_rgba(245,158,11,0.6)]',
        tvNextAge: 'text-amber-200',
        tvNextSubBox: 'bg-amber-950/70 border border-amber-400/40',
        tvListCard: 'bg-gradient-to-br from-[#1E1B4B]/95 via-slate-950/90 to-[#4A044E]/90 backdrop-blur-2xl border border-fuchsia-400/35 shadow-[0_14px_40px_rgba(0,0,0,0.6)]',
        tvCountBadge: 'bg-[#1E1B4B] text-fuchsia-300 border border-fuchsia-500/40',
        tvListItem: 'bg-fuchsia-950/40 hover:bg-fuchsia-950/60 border border-fuchsia-400/25',
        tvTokenList: 'text-amber-400',
        tvStatusBadge: 'bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-500/40'
      };
    }
    if (activeTheme === 'aurora-glassmorphism-ui') {
      return {
        id: 'aurora-glassmorphism-ui',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#DCFCE7] via-[#E0F2FE] to-[#F3E8FF] text-slate-800',
        header: 'bg-gradient-to-r from-emerald-600/85 via-teal-600/85 to-indigo-600/85 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/40 text-white shadow-xl shadow-teal-900/15 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-white/20 text-white border-white/40 backdrop-blur-2xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.5)] ring-1 ring-white/30 transition-all duration-300',
        brandSubtext: 'text-cyan-100',
        brandDot: 'bg-cyan-300 shadow-cyan-300 shadow-lg animate-pulse',
        card: 'bg-white/85 backdrop-blur-xl border border-white/90 rounded-2xl sm:rounded-3xl text-slate-800 shadow-[0_12px_40px_rgba(13,148,136,0.09),0_4px_16px_rgba(99,102,241,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)]',
        subCard: 'bg-white/65 backdrop-blur-lg border border-white/80 rounded-2xl text-slate-800 shadow-[inset_0_1px_2px_rgba(255,255,255,0.95)]',
        input: 'bg-white/90 backdrop-blur-md border border-teal-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-cyan-400 rounded-xl shadow-xs',
        buttonPrimary: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 hover:from-emerald-600 hover:to-indigo-600 active:scale-[0.98] text-white font-bold rounded-xl transition shadow-[0_8px_20px_rgba(20,184,166,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]',
        navActive: 'bg-white/90 backdrop-blur-md text-teal-950 shadow-md font-black ring-1 ring-cyan-400',
        navInactive: 'text-cyan-100 hover:bg-white/15',
        badgeChild: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black shadow-xs',
        badgeGen: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-xs',
        borderGen: 'border-l-teal-500',
        borderChild: 'border-l-purple-500',
        dateActive: 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white border-teal-700 ring-1 ring-cyan-300 shadow-sm font-bold',
        submitButton: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 hover:from-emerald-600 hover:to-indigo-600 text-white font-bold active:scale-95 disabled:opacity-40 shadow-lg shadow-teal-500/30 border border-white/50',
        bottomNav: 'bg-gradient-to-r from-emerald-700/[0.03] via-teal-700/[0.03] to-indigo-800/[0.03] backdrop-blur-md text-white',
        presetActive: 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white border-teal-700 shadow-sm font-bold',
        quickSymBtn: 'bg-white/80 hover:bg-white text-teal-950 border-teal-200/80 shadow-2xs',
        accentBadge: 'bg-white/85 text-teal-900 border-teal-200/80',
        settingsBorder: 'border-teal-300/80',
        settingsText: 'text-teal-800',
        // TV Mood — Aurora Glassmorphism
        tvHeaderBanner: 'bg-gradient-to-br from-emerald-950/92 via-teal-950/88 to-indigo-950/94 backdrop-blur-2xl border border-white/25 ring-1 ring-white/10 shadow-[0_22px_60px_-18px_rgba(16,185,129,0.45),0_8px_20px_-10px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.30)]',
        tvClockCard: 'bg-white/10 backdrop-blur-2xl border border-white/40 text-cyan-50 shadow-[0_0_25px_rgba(6,182,212,0.35)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200',
        tvClockDate: 'text-cyan-200/90',
        tvDocName: 'text-cyan-300',
        tvCurrentCard: 'bg-gradient-to-br from-emerald-950/90 via-teal-950/90 to-indigo-950/90 backdrop-blur-2xl text-cyan-50 border-2 border-cyan-300 shadow-[0_14px_45px_rgba(6,182,212,0.45),inset_0_1px_3px_rgba(255,255,255,0.35)]',
        tvCurrentDot: 'bg-cyan-300',
        tvCurrentTitle: 'text-cyan-200',
        tvCurrentAge: 'text-cyan-100',
        tvChamberBadge: 'bg-cyan-300 text-slate-950 font-black',
        tvTokenCurrent: 'text-cyan-100 drop-shadow-[0_4px_25px_rgba(6,182,212,0.7)]',
        tvCurrentSubBadge: 'bg-white/10 backdrop-blur-md border border-white/30',
        tvNextCard: 'bg-gradient-to-br from-indigo-950/90 via-slate-900/90 to-teal-950/90 backdrop-blur-2xl text-purple-100 border-2 border-purple-300 shadow-[0_14px_40px_rgba(168,85,247,0.35),inset_0_1px_3px_rgba(255,255,255,0.25)]',
        tvNextDot: 'bg-purple-300',
        tvNextTitle: 'text-purple-200',
        tvNextBadge: 'bg-purple-300 text-slate-950 font-black',
        tvTokenNext: 'text-purple-200 drop-shadow-[0_4px_20px_rgba(168,85,247,0.6)]',
        tvNextAge: 'text-purple-100',
        tvNextSubBox: 'bg-white/10 backdrop-blur-md border border-white/30',
        tvListCard: 'bg-gradient-to-br from-slate-950/90 via-teal-950/85 to-indigo-950/85 backdrop-blur-2xl border border-white/25 shadow-[0_14px_40px_rgba(0,0,0,0.6)]',
        tvCountBadge: 'bg-indigo-950/80 text-cyan-300 border border-white/25',
        tvListItem: 'bg-white/10 hover:bg-white/15 border border-white/20',
        tvTokenList: 'text-cyan-300',
        tvStatusBadge: 'bg-cyan-500/25 text-cyan-100 border border-cyan-400/40'
      };
    }
    if (activeTheme === 'immersive-ui') {
      return {
        id: 'immersive-ui',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0D1524] to-[#0A101D] text-slate-800',
        header: 'bg-gradient-to-r from-[#030712] via-[#0F172A] to-[#1E293B] border-b border-cyan-500/40 text-cyan-50 shadow-2xl shadow-black/60 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-[#030712]/90 text-cyan-400 border-cyan-500/50 backdrop-blur-xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-2xl ring-1 ring-cyan-400/25 transition-all duration-300',
        brandSubtext: 'text-cyan-300/90',
        brandDot: 'bg-cyan-400 shadow-cyan-400 shadow-md animate-pulse',
        card: 'bg-white/95 backdrop-blur-xl border border-cyan-200/80 rounded-2xl sm:rounded-3xl text-slate-800 shadow-[0_14px_35px_rgba(2,6,23,0.15),0_0_20px_rgba(6,182,212,0.08)]',
        subCard: 'bg-[#F0F9FF] border border-cyan-200/70 rounded-2xl text-slate-800',
        input: 'bg-white border border-cyan-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-blue-500 rounded-xl shadow-xs',
        buttonPrimary: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl transition shadow-lg shadow-cyan-600/30',
        navActive: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-black ring-1 ring-cyan-300',
        navInactive: 'text-cyan-200/80 hover:bg-white/10 hover:text-white',
        badgeChild: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-xs',
        badgeGen: 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-black shadow-xs',
        borderGen: 'border-l-cyan-600',
        borderChild: 'border-l-blue-600',
        dateActive: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-blue-700 ring-1 ring-cyan-400 shadow-xs font-bold',
        submitButton: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-bold active:scale-95 disabled:opacity-40 shadow-lg shadow-cyan-600/30 border border-cyan-400',
        bottomNav: 'bg-[#030712]/[0.03] backdrop-blur-md text-cyan-100',
        presetActive: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-blue-700 shadow-sm font-bold',
        quickSymBtn: 'bg-cyan-50/80 hover:bg-cyan-100 text-slate-900 border-cyan-200',
        accentBadge: 'bg-cyan-50 text-cyan-900 border-cyan-200',
        settingsBorder: 'border-cyan-300',
        settingsText: 'text-cyan-800',
        // TV Mood — Immersive UI
        tvHeaderBanner: 'bg-gradient-to-br from-[#030712]/96 via-[#071A1F]/92 to-[#0B1220]/96 backdrop-blur-2xl border border-cyan-400/45 ring-1 ring-cyan-400/10 shadow-[0_22px_60px_-18px_rgba(6,182,212,0.42),0_0_26px_rgba(6,182,212,0.16),inset_0_1px_0_rgba(255,255,255,0.14)]',
        tvClockCard: 'bg-cyan-950/10 backdrop-blur-2xl border border-cyan-500/40 text-cyan-50 shadow-[0_0_25px_rgba(6,182,212,0.3)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-200',
        tvClockDate: 'text-cyan-300/90',
        tvDocName: 'text-cyan-400',
        tvCurrentCard: 'bg-gradient-to-br from-[#030712] via-[#0F172A] to-[#1E293B] text-cyan-50 border-2 border-cyan-400 shadow-[0_14px_45px_rgba(6,182,212,0.45),inset_0_1px_3px_rgba(6,182,212,0.3)]',
        tvCurrentDot: 'bg-cyan-400',
        tvCurrentTitle: 'text-cyan-300',
        tvCurrentAge: 'text-cyan-200',
        tvChamberBadge: 'bg-cyan-400 text-slate-950 font-black',
        tvTokenCurrent: 'text-cyan-100 drop-shadow-[0_4px_25px_rgba(6,182,212,0.7)]',
        tvCurrentSubBadge: 'bg-[#030712]/80 border border-cyan-500/40',
        tvNextCard: 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#030712] text-blue-50 border-2 border-blue-400 shadow-[0_14px_40px_rgba(59,130,246,0.35)]',
        tvNextDot: 'bg-blue-400',
        tvNextTitle: 'text-blue-300',
        tvNextBadge: 'bg-blue-400 text-slate-950 font-black',
        tvTokenNext: 'text-blue-300 drop-shadow-[0_4px_20px_rgba(59,130,246,0.6)]',
        tvNextAge: 'text-blue-200',
        tvNextSubBox: 'bg-[#030712]/80 border border-blue-500/40',
        tvListCard: 'bg-[#030712]/95 backdrop-blur-2xl border border-cyan-500/35 shadow-[0_14px_40px_rgba(0,0,0,0.9)]',
        tvCountBadge: 'bg-[#0F172A] text-cyan-300 border border-cyan-500/40',
        tvListItem: 'bg-[#0F172A]/70 hover:bg-[#1E293B]/80 border border-cyan-500/25',
        tvTokenList: 'text-cyan-400',
        tvStatusBadge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
      };
    }
    if (activeTheme === 'organic-ui') {
      return {
        id: 'organic-ui',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#F2F7F4] via-[#F6F9F5] to-[#EEF4EE] text-[#2D3A30]',
        header: 'bg-gradient-to-r from-[#3D5A45] via-[#4A6B53] to-[#587B62] border-b border-[#2F4736] text-[#F3F8F4] shadow-md shadow-[#2F4736]/20 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-[#263A2C]/60 text-[#F3F8F4] border-white/20 backdrop-blur-xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-xl ring-1 ring-white/15 transition-all duration-300',
        brandSubtext: 'text-[#CDE3D2]',
        brandDot: 'bg-[#94D1A3] shadow-[#94D1A3]',
        card: 'bg-[#FCFDFB] border border-[#D5E3D8] rounded-2xl sm:rounded-3xl text-[#2D3A30] shadow-[0_10px_25px_-5px_rgba(61,90,69,0.08),0_4px_10px_-2px_rgba(45,58,48,0.03)]',
        subCard: 'bg-[#F1F6F2] border border-[#D9E6DC] rounded-2xl text-[#2D3A30]',
        input: 'bg-[#FCFDFB] border border-[#BDD1C2] text-[#2D3A30] placeholder-[#7E9684] focus:ring-2 focus:ring-[#4A6B53] focus:border-[#4A6B53] rounded-xl shadow-xs',
        buttonPrimary: 'bg-[#4A6B53] hover:bg-[#3D5A45] active:scale-[0.98] text-white font-bold rounded-xl transition shadow-md shadow-[#4A6B53]/25',
        navActive: 'bg-[#FCFDFB] text-[#263A2C] shadow-sm font-black ring-1 ring-[#4A6B53]',
        navInactive: 'text-[#CDE3D2] hover:bg-[#3D5A45]/60',
        badgeChild: 'bg-gradient-to-br from-[#E07A5F] to-[#C9684D] text-white font-black shadow-xs',
        badgeGen: 'bg-gradient-to-br from-[#4A6B53] to-[#3D5A45] text-white font-black shadow-xs',
        borderGen: 'border-l-[#4A6B53]',
        borderChild: 'border-l-[#E07A5F]',
        dateActive: 'bg-[#4A6B53] text-white border-[#3D5A45] ring-1 ring-[#94D1A3] shadow-xs font-bold',
        submitButton: 'bg-[#4A6B53] hover:bg-[#3D5A45] active:scale-95 disabled:opacity-40 disabled:hover:bg-[#4A6B53] shadow-md shadow-[#4A6B53]/25 border border-[#81A88B]',
        bottomNav: 'bg-gradient-to-r from-[#3D5A45]/[0.03] via-[#4A6B53]/[0.03] to-[#587B62]/[0.03] backdrop-blur-md text-[#F3F8F4]',
        presetActive: 'bg-[#4A6B53] text-white border-[#3D5A45] shadow-sm font-bold',
        quickSymBtn: 'bg-[#F4F8F5] hover:bg-[#E8F0EA] text-[#2D3A30] border-[#BDD1C2]',
        accentBadge: 'bg-[#E8F0EA] text-[#263A2C] border-[#BDD1C2]',
        settingsBorder: 'border-[#BDD1C2]',
        settingsText: 'text-[#3D5A45]',
        // TV Mood — Organic UI
        tvHeaderBanner: 'bg-gradient-to-br from-[#263A2C]/95 via-[#334D3B]/92 to-[#3D5A45]/95 backdrop-blur-2xl border border-[#94D1A3]/45 ring-1 ring-white/10 shadow-[0_22px_60px_-18px_rgba(148,209,163,0.35),0_8px_20px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.20)]',
        tvClockCard: 'bg-white/10 backdrop-blur-2xl border border-[#81A88B]/40 text-[#F3F8F4] shadow-[0_0_25px_rgba(148,209,163,0.25)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-[#CDE3D2] via-[#94D1A3] to-[#81A88B]',
        tvClockDate: 'text-[#CDE3D2]',
        tvDocName: 'text-[#94D1A3]',
        tvCurrentCard: 'bg-gradient-to-br from-[#1C2C21] via-[#263A2C] to-[#18251C] text-[#F3F8F4] border-2 border-[#81A88B] shadow-[0_14px_45px_rgba(61,90,69,0.45),inset_0_1px_3px_rgba(255,255,255,0.2)]',
        tvCurrentDot: 'bg-[#94D1A3]',
        tvCurrentTitle: 'text-[#94D1A3]',
        tvCurrentAge: 'text-[#CDE3D2]',
        tvChamberBadge: 'bg-[#81A88B] text-slate-950 font-black',
        tvTokenCurrent: 'text-[#F3F8F4] drop-shadow-[0_4px_25px_rgba(129,168,139,0.6)]',
        tvCurrentSubBadge: 'bg-[#18251C]/75 border border-[#81A88B]/40',
        tvNextCard: 'bg-gradient-to-br from-[#3D251C] via-[#263A2C] to-[#1C2C21] text-[#F3F8F4] border-2 border-[#E07A5F] shadow-[0_14px_40px_rgba(224,122,95,0.35)]',
        tvNextDot: 'bg-[#E07A5F]',
        tvNextTitle: 'text-[#E07A5F]',
        tvNextBadge: 'bg-[#E07A5F] text-white font-black',
        tvTokenNext: 'text-[#E07A5F] drop-shadow-[0_4px_20px_rgba(224,122,95,0.6)]',
        tvNextAge: 'text-[#FBE8DE]',
        tvNextSubBox: 'bg-[#18251C]/75 border border-[#E07A5F]/40',
        tvListCard: 'bg-gradient-to-br from-[#18251C]/95 via-slate-900/90 to-[#263A2C]/90 backdrop-blur-2xl border border-[#81A88B]/35 shadow-[0_14px_40px_rgba(28,44,33,0.5)]',
        tvCountBadge: 'bg-[#1C2C21] text-[#94D1A3] border border-[#81A88B]/35',
        tvListItem: 'bg-[#263A2C]/50 hover:bg-[#334D3B]/60 border border-[#81A88B]/25',
        tvTokenList: 'text-[#94D1A3]',
        tvStatusBadge: 'bg-[#81A88B]/25 text-[#CDE3D2] border border-[#81A88B]/40'
      };
    }
    if (activeTheme === 'dental-mint') {
      return {
        id: 'dental-mint',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#E6F7F5] via-[#F4FAF8] to-[#FFF5F0] text-slate-800',
        header: 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 border-b border-teal-800/40 text-white shadow-md shadow-teal-900/10 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-teal-900/40 text-white border-white/20 backdrop-blur-xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-xl ring-1 ring-white/15 transition-all duration-300',
        brandSubtext: 'text-teal-200',
        brandDot: 'bg-teal-300 shadow-teal-300',
        card: 'bg-white/95 backdrop-blur-md border border-teal-100/90 rounded-2xl sm:rounded-3xl text-slate-800 shadow-[0_10px_25px_-5px_rgba(20,184,166,0.08),0_4px_12px_-2px_rgba(0,0,0,0.03)]',
        subCard: 'bg-[#F0FAF8] border border-teal-100/80 rounded-2xl text-slate-800',
        input: 'bg-white border border-teal-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 rounded-xl shadow-xs',
        buttonPrimary: 'bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-white font-bold rounded-xl transition shadow-md shadow-teal-500/25',
        navActive: 'bg-white text-teal-950 shadow-sm font-black ring-1 ring-teal-400',
        navInactive: 'text-teal-100 hover:bg-teal-700/60',
        badgeChild: 'bg-gradient-to-br from-[#FF7A59] to-[#F97316] text-white font-black shadow-xs',
        badgeGen: 'bg-gradient-to-br from-teal-600 to-teal-700 text-white font-black shadow-xs',
        borderGen: 'border-l-teal-500',
        borderChild: 'border-l-[#FF7A59]',
        dateActive: 'bg-teal-600 text-white border-teal-700 ring-1 ring-teal-400 shadow-xs',
        submitButton: 'bg-teal-500 hover:bg-teal-600 active:scale-95 disabled:opacity-40 disabled:hover:bg-teal-500 shadow-md shadow-teal-600/25 border border-teal-300',
        bottomNav: 'bg-gradient-to-r from-teal-700/[0.03] via-teal-600/[0.03] to-emerald-600/[0.03] backdrop-blur-md text-white',
        presetActive: 'bg-teal-600 text-white border-teal-700 shadow-sm',
        quickSymBtn: 'bg-teal-50 hover:bg-teal-100 text-teal-950 border-teal-200',
        accentBadge: 'bg-teal-50 text-teal-800 border-teal-200',
        settingsBorder: 'border-teal-300',
        settingsText: 'text-teal-800',
        // TV Mood — Dental Mint & Peach
        tvHeaderBanner: 'bg-gradient-to-br from-teal-800/95 via-teal-700/92 to-emerald-700/95 backdrop-blur-2xl border border-teal-200/50 ring-1 ring-white/10 shadow-[0_22px_60px_-18px_rgba(45,212,191,0.45),0_8px_20px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.22)]',
        tvClockCard: 'bg-white/10 backdrop-blur-2xl border border-teal-300/40 text-teal-50 shadow-[0_0_25px_rgba(20,184,166,0.3)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-emerald-200 to-cyan-200',
        tvClockDate: 'text-teal-200',
        tvDocName: 'text-teal-200',
        tvCurrentCard: 'bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 text-white border-2 border-teal-400 shadow-[0_14px_45px_rgba(20,184,166,0.4),inset_0_1px_3px_rgba(255,255,255,0.25)]',
        tvCurrentDot: 'bg-teal-300',
        tvCurrentTitle: 'text-teal-300',
        tvCurrentAge: 'text-teal-200',
        tvChamberBadge: 'bg-teal-400 text-slate-950 font-black',
        tvTokenCurrent: 'text-white drop-shadow-[0_4px_25px_rgba(20,184,166,0.6)]',
        tvCurrentSubBadge: 'bg-teal-900/60 border border-teal-400/30',
        tvNextCard: 'bg-gradient-to-br from-[#2D1B18] via-slate-900 to-[#1F1715] text-white border-2 border-[#FF7A59] shadow-[0_14px_40px_rgba(255,122,89,0.35)]',
        tvNextDot: 'bg-[#FF7A59]',
        tvNextTitle: 'text-[#FF7A59]',
        tvNextBadge: 'bg-[#FF7A59] text-white font-black',
        tvTokenNext: 'text-[#FF7A59] drop-shadow-[0_4px_20px_rgba(255,122,89,0.6)]',
        tvNextAge: 'text-orange-200',
        tvNextSubBox: 'bg-[#2D1B18]/70 border border-[#FF7A59]/40',
        tvListCard: 'bg-gradient-to-br from-teal-950/95 via-slate-900/90 to-emerald-950/90 backdrop-blur-2xl border border-teal-400/35 shadow-[0_14px_40px_rgba(13,148,136,0.3)]',
        tvCountBadge: 'bg-teal-900 text-teal-200 border border-teal-400/40',
        tvListItem: 'bg-teal-900/40 hover:bg-teal-900/60 border border-teal-400/25',
        tvTokenList: 'text-[#FF7A59]',
        tvStatusBadge: 'bg-teal-500/25 text-teal-200 border border-teal-400/35'
      };
    }
    if (activeTheme === 'luxe-frosted-glass') {
      return {
        id: 'luxe-frosted-glass',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#EAE7DF] via-[#F4F1EA] to-[#DFE6E2] text-slate-800',
        header: 'bg-[#181F26] border-b border-amber-400/30 text-amber-100 shadow-xl shadow-black/30 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-[#10151B]/80 text-amber-100 border-amber-400/30 backdrop-blur-2xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-2xl ring-1 ring-amber-400/20 transition-all duration-300',
        brandSubtext: 'text-amber-300/90',
        brandDot: 'bg-amber-400 shadow-amber-400 shadow-md',
        card: 'bg-white/90 backdrop-blur-xl border border-amber-200/80 rounded-2xl sm:rounded-3xl text-slate-800 shadow-[0_12px_32px_rgba(24,31,38,0.08),0_0_15px_rgba(245,158,11,0.06)]',
        subCard: 'bg-[#F9F6F0] border border-amber-200/70 rounded-2xl text-slate-800',
        input: 'bg-white border border-amber-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-xl shadow-xs',
        buttonPrimary: 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98] text-slate-950 font-black rounded-xl transition shadow-lg shadow-amber-500/20',
        navActive: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md font-black ring-1 ring-amber-300',
        navInactive: 'text-amber-100/70 hover:bg-white/10 hover:text-white',
        badgeChild: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs',
        badgeGen: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black shadow-xs',
        borderGen: 'border-l-teal-600',
        borderChild: 'border-l-amber-500',
        dateActive: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-500 ring-1 ring-amber-300 font-black shadow-sm',
        submitButton: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black active:scale-95 disabled:opacity-40 disabled:hover:from-amber-500 shadow-lg shadow-amber-500/25 border border-amber-300',
        bottomNav: 'bg-[#181F26]/[0.03] backdrop-blur-md text-amber-100',
        presetActive: 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm',
        quickSymBtn: 'bg-amber-50/80 hover:bg-amber-100 text-slate-900 border-amber-200',
        accentBadge: 'bg-amber-50 text-amber-900 border-amber-200',
        settingsBorder: 'border-amber-300',
        settingsText: 'text-amber-800',
        // TV Mood — Luxe Frosted Glass
        tvHeaderBanner: 'bg-gradient-to-br from-[#181F26]/96 via-[#1F2937]/92 to-[#181F26]/96 backdrop-blur-2xl border border-amber-300/45 ring-1 ring-white/10 shadow-[0_22px_60px_-18px_rgba(251,191,36,0.35),0_8px_20px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.16)]',
        tvClockCard: 'bg-amber-950/10 backdrop-blur-2xl border border-amber-400/40 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.3)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-100',
        tvClockDate: 'text-amber-200',
        tvDocName: 'text-amber-300',
        tvCurrentCard: 'bg-gradient-to-br from-[#181F26] via-[#10151B] to-[#1E293B] text-amber-100 border-2 border-amber-400 shadow-[0_14px_45px_rgba(245,158,11,0.35),inset_0_1px_3px_rgba(255,255,255,0.25)]',
        tvCurrentDot: 'bg-amber-400',
        tvCurrentTitle: 'text-amber-300',
        tvCurrentAge: 'text-amber-200',
        tvChamberBadge: 'bg-amber-400 text-slate-950 font-black',
        tvTokenCurrent: 'text-amber-100 drop-shadow-[0_4px_25px_rgba(245,158,11,0.6)]',
        tvCurrentSubBadge: 'bg-[#10151B]/70 border border-amber-400/30',
        tvNextCard: 'bg-gradient-to-br from-amber-950/80 via-[#181F26] to-[#10151B] text-amber-50 border-2 border-amber-400/80 shadow-[0_14px_40px_rgba(245,158,11,0.35)]',
        tvNextDot: 'bg-amber-300',
        tvNextTitle: 'text-amber-200',
        tvNextBadge: 'bg-amber-400 text-slate-950 font-black',
        tvTokenNext: 'text-amber-300 drop-shadow-[0_4px_20px_rgba(245,158,11,0.6)]',
        tvNextAge: 'text-amber-200',
        tvNextSubBox: 'bg-[#181F26]/70 border border-amber-400/40',
        tvListCard: 'bg-[#10151B]/95 backdrop-blur-2xl border border-amber-400/35 shadow-[0_14px_40px_rgba(0,0,0,0.7)]',
        tvCountBadge: 'bg-[#181F26] text-amber-300 border border-amber-400/40',
        tvListItem: 'bg-white/5 hover:bg-white/10 border border-amber-400/25',
        tvTokenList: 'text-amber-400',
        tvStatusBadge: 'bg-amber-500/25 text-amber-200 border border-amber-400/35'
      };
    }
    if (activeTheme === 'puffy-3d-clay') {
      return {
        id: 'puffy-3d-clay',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#EDE9FE] via-[#F3E8FF] to-[#FCE7F3] text-purple-950',
        header: 'bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 border-b-2 border-purple-400/40 text-white shadow-lg shadow-purple-600/20 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-purple-950/40 text-white border-white/30 backdrop-blur-xl border-2 rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_8px_20px_rgba(147,51,234,0.25)] ring-1 ring-white/20 transition-all duration-300',
        brandSubtext: 'text-purple-200',
        brandDot: 'bg-fuchsia-300 shadow-fuchsia-300 shadow-md',
        card: 'bg-white/95 backdrop-blur-md border-2 border-purple-200/90 rounded-2xl sm:rounded-3xl text-purple-950 shadow-[0_12px_28px_rgba(168,85,247,0.14),inset_0_-2px_4px_rgba(168,85,247,0.05)]',
        subCard: 'bg-[#FAF5FF] border-2 border-purple-100 rounded-2xl text-purple-950 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)]',
        input: 'bg-white border-2 border-purple-200 text-purple-950 placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 rounded-xl shadow-xs',
        buttonPrimary: 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 active:scale-[0.98] text-white font-black rounded-xl transition shadow-[0_6px_16px_rgba(147,51,234,0.3),inset_0_1px_2px_rgba(255,255,255,0.4)]',
        navActive: 'bg-white text-purple-950 shadow-md font-black ring-2 ring-purple-400',
        navInactive: 'text-purple-100 hover:bg-purple-700/60',
        badgeChild: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black shadow-xs',
        badgeGen: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black shadow-xs',
        borderGen: 'border-l-purple-500',
        borderChild: 'border-l-pink-500',
        dateActive: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-purple-700 ring-2 ring-purple-300 font-black shadow-sm',
        submitButton: 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-black active:scale-95 disabled:opacity-40 disabled:hover:from-violet-500 shadow-md shadow-purple-600/30 border border-purple-300',
        bottomNav: 'bg-gradient-to-r from-violet-700/[0.03] via-purple-600/[0.03] to-fuchsia-600/[0.03] backdrop-blur-md text-purple-100',
        presetActive: 'bg-purple-600 text-white border-purple-700 font-black shadow-sm',
        quickSymBtn: 'bg-purple-50 hover:bg-purple-100 text-purple-950 border-purple-200',
        accentBadge: 'bg-purple-100 text-purple-900 border-purple-200',
        settingsBorder: 'border-purple-300',
        settingsText: 'text-purple-800',
        // TV Mood — Puffy 3D Clay
        tvHeaderBanner: 'bg-gradient-to-br from-violet-800/95 via-purple-700/92 to-fuchsia-800/95 backdrop-blur-2xl border-2 border-purple-200/50 ring-1 ring-white/10 shadow-[0_22px_60px_-18px_rgba(168,85,247,0.5),0_8px_20px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.22)]',
        tvClockCard: 'bg-white/10 backdrop-blur-2xl border-2 border-purple-300/40 text-purple-100 shadow-[0_0_25px_rgba(168,85,247,0.3)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-purple-200 to-pink-200',
        tvClockDate: 'text-purple-200',
        tvDocName: 'text-fuchsia-300',
        tvCurrentCard: 'bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-950 text-white border-2 border-purple-300 shadow-[0_14px_45px_rgba(168,85,247,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)]',
        tvCurrentDot: 'bg-fuchsia-300',
        tvCurrentTitle: 'text-purple-200',
        tvCurrentAge: 'text-purple-100',
        tvChamberBadge: 'bg-purple-300 text-purple-950 font-black',
        tvTokenCurrent: 'text-purple-100 drop-shadow-[0_4px_25px_rgba(168,85,247,0.6)]',
        tvCurrentSubBadge: 'bg-purple-900/60 border border-purple-300/30',
        tvNextCard: 'bg-gradient-to-br from-purple-950/90 via-slate-900 to-fuchsia-950/70 text-purple-100 border-2 border-pink-400 shadow-[0_14px_40px_rgba(236,72,153,0.35)]',
        tvNextDot: 'bg-pink-400',
        tvNextTitle: 'text-pink-300',
        tvNextBadge: 'bg-pink-400 text-slate-950 font-black',
        tvTokenNext: 'text-pink-300 drop-shadow-[0_4px_20px_rgba(236,72,153,0.6)]',
        tvNextAge: 'text-pink-200',
        tvNextSubBox: 'bg-pink-950/60 border border-pink-400/40',
        tvListCard: 'bg-gradient-to-br from-purple-950/95 via-slate-950/90 to-violet-950/90 backdrop-blur-2xl border-2 border-purple-400/35 shadow-[0_14px_40px_rgba(147,51,234,0.35)]',
        tvCountBadge: 'bg-purple-900 text-purple-200 border border-purple-400/40',
        tvListItem: 'bg-purple-900/40 hover:bg-purple-900/60 border border-purple-300/25',
        tvTokenList: 'text-pink-400',
        tvStatusBadge: 'bg-purple-500/25 text-purple-200 border border-purple-300/35'
      };
    }
    if (activeTheme === 'sooti-art-clay') {
      return {
        id: 'sooti-art-clay',
        wrapper: 'min-h-screen bg-[#F7F2EB] text-[#4A3E39]',
        header: 'bg-gradient-to-r from-[#BA7A5D] via-[#C48366] to-[#AD6E50] border-b border-[#9E6044] text-white shadow-md shadow-[#AD6E50]/20 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-[#874E35]/50 text-white border-white/25 backdrop-blur-xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-xl ring-1 ring-white/15 transition-all duration-300',
        brandSubtext: 'text-[#FBE8DE]',
        brandDot: 'bg-[#FFD1BC] shadow-[#FFD1BC]',
        card: 'bg-[#FFFDF9] border border-[#E8DED3] rounded-2xl sm:rounded-3xl text-[#4A3E39] shadow-[0_10px_25px_-5px_rgba(186,122,93,0.12),0_4px_10px_-2px_rgba(74,62,57,0.04)]',
        subCard: 'bg-[#F5EDE3] border border-[#E3D3C4] rounded-2xl text-[#4A3E39]',
        input: 'bg-[#FFFDF9] border border-[#D5C2B1] text-[#4A3E39] placeholder-[#9C8B7F] focus:ring-2 focus:ring-[#BA7A5D] focus:border-[#BA7A5D] rounded-xl shadow-xs',
        buttonPrimary: 'bg-[#BA7A5D] hover:bg-[#A86A4E] active:scale-[0.98] text-white font-bold rounded-xl transition shadow-md shadow-[#BA7A5D]/25',
        navActive: 'bg-[#FFFDF9] text-[#783D24] shadow-sm font-black ring-1 ring-[#BA7A5D]',
        navInactive: 'text-[#FBE8DE] hover:bg-[#A86A4E]/60',
        badgeChild: 'bg-gradient-to-br from-[#D96B43] to-[#C4572E] text-white font-black shadow-xs',
        badgeGen: 'bg-gradient-to-br from-[#728C99] to-[#597482] text-white font-black shadow-xs',
        borderGen: 'border-l-[#728C99]',
        borderChild: 'border-l-[#D96B43]',
        dateActive: 'bg-[#BA7A5D] text-white border-[#A86A4E] ring-1 ring-[#BA7A5D] shadow-xs font-bold',
        submitButton: 'bg-[#BA7A5D] hover:bg-[#A86A4E] active:scale-95 disabled:opacity-40 disabled:hover:bg-[#BA7A5D] shadow-md shadow-[#BA7A5D]/25 border border-[#DEAC93]',
        bottomNav: 'bg-gradient-to-r from-[#BA7A5D]/[0.03] via-[#C48366]/[0.03] to-[#AD6E50]/[0.03] backdrop-blur-md text-[#FBE8DE]',
        presetActive: 'bg-[#BA7A5D] text-white border-[#A86A4E] shadow-sm',
        quickSymBtn: 'bg-[#FAF3EB] hover:bg-[#F2E5D5] text-[#4A3E39] border-[#D5C2B1]',
        accentBadge: 'bg-[#F3E7DC] text-[#783D24] border-[#E0CEBF]',
        settingsBorder: 'border-[#D5C2B1]',
        settingsText: 'text-[#783D24]',
        // TV Mood — Sooti Art Clay
        tvHeaderBanner: 'bg-gradient-to-br from-[#874E35]/95 via-[#9E6044]/92 to-[#AD6E50]/95 backdrop-blur-2xl border border-[#FFD1BC]/45 ring-1 ring-white/10 shadow-[0_22px_60px_-18px_rgba(255,209,188,0.35),0_8px_20px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.22)]',
        tvClockCard: 'bg-white/10 backdrop-blur-2xl border border-[#E0A88F]/40 text-[#FBE8DE] shadow-[0_0_25px_rgba(186,122,93,0.3)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFD1BC] via-[#FBE8DE] to-[#DEAC93]',
        tvClockDate: 'text-[#FFD1BC]',
        tvDocName: 'text-[#FFD1BC]',
        tvCurrentCard: 'bg-gradient-to-br from-[#4F2E20] via-[#663C2B] to-[#3B1F14] text-[#FBE8DE] border-2 border-[#E0A88F] shadow-[0_14px_45px_rgba(186,122,93,0.4),inset_0_1px_3px_rgba(255,255,255,0.25)]',
        tvCurrentDot: 'bg-[#FFD1BC]',
        tvCurrentTitle: 'text-[#FFD1BC]',
        tvCurrentAge: 'text-[#FBE8DE]',
        tvChamberBadge: 'bg-[#E0A88F] text-slate-950 font-black',
        tvTokenCurrent: 'text-[#FFD1BC] drop-shadow-[0_4px_25px_rgba(224,168,143,0.6)]',
        tvCurrentSubBadge: 'bg-[#3B1F14]/70 border border-[#E0A88F]/40',
        tvNextCard: 'bg-gradient-to-br from-[#663C2B] via-slate-900 to-[#4F2E20] text-[#FBE8DE] border-2 border-[#D96B43] shadow-[0_14px_40px_rgba(217,107,67,0.35)]',
        tvNextDot: 'bg-[#D96B43]',
        tvNextTitle: 'text-[#D96B43]',
        tvNextBadge: 'bg-[#D96B43] text-white font-black',
        tvTokenNext: 'text-[#D96B43] drop-shadow-[0_4px_20px_rgba(217,107,67,0.6)]',
        tvNextAge: 'text-[#FFD1BC]',
        tvNextSubBox: 'bg-[#4F2E20]/70 border border-[#D96B43]/40',
        tvListCard: 'bg-gradient-to-br from-[#3B1F14]/95 via-slate-900/90 to-[#4F2E20]/90 backdrop-blur-2xl border border-[#E0A88F]/35 shadow-[0_14px_40px_rgba(79,46,32,0.45)]',
        tvCountBadge: 'bg-[#4F2E20] text-[#FFD1BC] border border-[#E0A88F]/40',
        tvListItem: 'bg-[#874E35]/40 hover:bg-[#874E35]/60 border border-[#FFD1BC]/25',
        tvTokenList: 'text-[#D96B43]',
        tvStatusBadge: 'bg-[#BA7A5D]/25 text-[#FFD1BC] border border-[#E0A88F]/40'
      };
    }
    if (activeTheme === 'zomo-neo-cloud') {
      return {
        id: 'zomo-neo-cloud',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#EDE9FE] via-[#F5F3FF] to-[#E0E7FF] text-slate-800',
        header: 'bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] border-b border-purple-800/40 text-white shadow-lg shadow-purple-900/20 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-[#3B0764]/50 text-white border-white/20 backdrop-blur-xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-xl ring-1 ring-white/15 transition-all duration-300',
        brandSubtext: 'text-purple-200',
        brandDot: 'bg-cyan-300 shadow-cyan-300 shadow-md',
        card: 'bg-white/95 backdrop-blur-md border border-purple-100 rounded-2xl sm:rounded-3xl text-slate-800 shadow-[0_12px_30px_-5px_rgba(109,40,217,0.12),0_4px_12px_-2px_rgba(0,0,0,0.03)]',
        subCard: 'bg-[#F5F3FF] border border-purple-100 rounded-2xl text-slate-800',
        input: 'bg-white border border-purple-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 rounded-xl shadow-xs',
        buttonPrimary: 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] active:scale-[0.98] text-white font-bold rounded-xl transition shadow-md shadow-purple-500/25',
        navActive: 'bg-white text-purple-950 shadow-sm font-black ring-1 ring-purple-400',
        navInactive: 'text-purple-100 hover:bg-purple-700/60',
        badgeChild: 'bg-gradient-to-br from-[#EC4899] to-[#F43F5E] text-white font-black shadow-xs',
        badgeGen: 'bg-gradient-to-br from-[#7C3AED] to-[#6366F1] text-white font-black shadow-xs',
        borderGen: 'border-l-purple-500',
        borderChild: 'border-l-pink-500',
        dateActive: 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white border-purple-700 ring-1 ring-purple-400 shadow-xs font-bold',
        submitButton: 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] text-white active:scale-95 disabled:opacity-40 disabled:hover:from-[#7C3AED] shadow-md shadow-purple-600/25 border border-purple-300',
        bottomNav: 'bg-gradient-to-r from-[#5B21B6]/[0.03] via-[#6D28D9]/[0.03] to-[#7C3AED]/[0.03] backdrop-blur-md text-white',
        presetActive: 'bg-purple-600 text-white border-purple-700 shadow-sm',
        quickSymBtn: 'bg-purple-50 hover:bg-purple-100 text-purple-950 border-purple-200',
        accentBadge: 'bg-purple-50 text-purple-800 border-purple-200',
        settingsBorder: 'border-purple-300',
        settingsText: 'text-purple-800',
        // TV Mood — Zomo Neo-Cloud
        tvHeaderBanner: 'bg-gradient-to-br from-[#3B0764]/95 via-[#5B21B6]/92 to-[#6D28D9]/95 backdrop-blur-2xl border border-purple-200/45 ring-1 ring-white/10 shadow-[0_22px_60px_-18px_rgba(139,92,246,0.5),0_8px_20px_-10px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.22)]',
        tvClockCard: 'bg-white/10 backdrop-blur-2xl border border-cyan-400/40 text-purple-100 shadow-[0_0_25px_rgba(6,182,212,0.3)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-200 to-indigo-200',
        tvClockDate: 'text-cyan-200',
        tvDocName: 'text-cyan-300',
        tvCurrentCard: 'bg-gradient-to-br from-[#2E1065] via-[#3B0764] to-[#1E1B4B] text-white border-2 border-cyan-400 shadow-[0_14px_45px_rgba(124,58,237,0.4),inset_0_1px_3px_rgba(255,255,255,0.25)]',
        tvCurrentDot: 'bg-cyan-300',
        tvCurrentTitle: 'text-cyan-300',
        tvCurrentAge: 'text-purple-200',
        tvChamberBadge: 'bg-cyan-400 text-slate-950 font-black',
        tvTokenCurrent: 'text-cyan-200 drop-shadow-[0_4px_25px_rgba(6,182,212,0.7)]',
        tvCurrentSubBadge: 'bg-[#2E1065]/70 border border-cyan-400/40',
        tvNextCard: 'bg-gradient-to-br from-[#3B0764] via-slate-900 to-[#2E1065] text-purple-100 border-2 border-purple-400 shadow-[0_14px_40px_rgba(168,85,247,0.35)]',
        tvNextDot: 'bg-purple-400',
        tvNextTitle: 'text-purple-300',
        tvNextBadge: 'bg-purple-400 text-white font-black',
        tvTokenNext: 'text-purple-300 drop-shadow-[0_4px_20px_rgba(168,85,247,0.6)]',
        tvNextAge: 'text-purple-200',
        tvNextSubBox: 'bg-[#2E1065]/70 border border-purple-400/40',
        tvListCard: 'bg-gradient-to-br from-[#1E1B4B]/95 via-slate-950/90 to-[#2E1065]/90 backdrop-blur-2xl border border-purple-400/35 shadow-[0_14px_40px_rgba(109,40,217,0.35)]',
        tvCountBadge: 'bg-[#3B0764] text-purple-200 border border-purple-400/40',
        tvListItem: 'bg-[#3B0764]/40 hover:bg-[#3B0764]/60 border border-purple-300/25',
        tvTokenList: 'text-cyan-300',
        tvStatusBadge: 'bg-purple-500/25 text-purple-200 border border-purple-400/40'
      };
    }
    if (activeTheme === 'dark-gold-luxe') {
      return {
        id: 'dark-gold-luxe',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#0A0A0D] via-[#131118] to-[#0A0A0D] text-[#E9E2D0]',
        header: 'bg-gradient-to-r from-[#0A0A0D] via-[#1A150B] to-[#0A0A0D] border-b border-[#E8B93A]/40 text-[#F7D65A] shadow-xl shadow-black/60 relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-[#0A0A0D]/85 text-[#F7D65A] border-[#E8B93A]/40 backdrop-blur-xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-2xl ring-1 ring-[#E8B93A]/20 transition-all duration-300',
        brandSubtext: 'text-[#D9A21C]',
        brandDot: 'bg-[#E8B93A] shadow-[#E8B93A] shadow-md animate-pulse',
        card: 'bg-[#15141A]/95 backdrop-blur-xl border border-[#E8B93A]/25 rounded-2xl sm:rounded-3xl text-[#E9E2D0] shadow-[0_12px_32px_rgba(0,0,0,0.55),0_0_18px_rgba(232,185,58,0.08)]',
        subCard: 'bg-[#1C1B22] border border-[#E8B93A]/20 rounded-2xl text-[#E9E2D0]',
        input: 'bg-[#0F0E13] border border-[#E8B93A]/30 text-[#E9E2D0] placeholder-[#8A7E5E] focus:ring-2 focus:ring-[#E8B93A] focus:border-[#F2C24A] rounded-xl shadow-xs',
        buttonPrimary: 'bg-gradient-to-r from-[#C8901C] via-[#E8B93A] to-[#F7D65A] hover:from-[#A6790A] hover:to-[#F2C24A] active:scale-[0.98] text-[#1A1408] font-black rounded-xl transition shadow-lg shadow-[#E8B93A]/25',
        navActive: 'bg-gradient-to-r from-[#E8B93A] to-[#F7D65A] text-[#1A1408] shadow-md font-black ring-1 ring-[#F7D65A]',
        navInactive: 'text-[#D9A21C]/80 hover:bg-[#E8B93A]/10 hover:text-[#F7D65A]',
        badgeChild: 'bg-gradient-to-r from-[#C8901C] to-[#E8B93A] text-[#1A1408] font-black shadow-xs',
        badgeGen: 'bg-gradient-to-r from-[#C8901C] to-[#C8901C] text-[#F7D65A] font-black shadow-xs',
        borderGen: 'border-l-[#E8B93A]',
        borderChild: 'border-l-[#F7D65A]',
        dateActive: 'amh-gold-marked bg-gradient-to-r from-[#E8B93A] to-[#F7D65A] text-[#1A1408] border-[#C8901C] ring-1 ring-[#F7D65A] shadow-xs font-black',
        submitButton: 'amh-gold-marked bg-gradient-to-r from-[#C8901C] via-[#E8B93A] to-[#F7D65A] hover:from-[#A6790A] hover:to-[#F2C24A] text-[#1A1408] font-black active:scale-95 disabled:opacity-40 shadow-lg shadow-[#E8B93A]/30 border border-[#F7D65A]/60',
        bottomNav: 'bg-[#0A0A0D]/[0.55] backdrop-blur-md text-[#F7D65A]',
        presetActive: 'amh-gold-marked bg-gradient-to-r from-[#E8B93A] to-[#F7D65A] text-[#1A1408] border-[#C8901C] shadow-sm font-black',
        quickSymBtn: 'bg-[#1C1B22] hover:bg-[#26242E] text-[#F2C24A] border-[#E8B93A]/30',
        accentBadge: 'bg-[#E8B93A]/12 text-[#F2C24A] border-[#E8B93A]/30',
        settingsBorder: 'border-[#E8B93A]/30',
        settingsText: 'text-[#F2C24A]',
        // TV Mood — Dark Gold Luxe
        tvHeaderBanner: 'bg-gradient-to-br from-[#0A0A0D]/96 via-[#1A150B]/94 to-[#0A0A0D]/96 backdrop-blur-2xl border border-[#E8B93A]/45 ring-1 ring-[#E8B93A]/10 shadow-[0_22px_60px_-18px_rgba(232,185,58,0.35),0_8px_20px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.14)]',
        tvClockCard: 'bg-[#15141A]/80 backdrop-blur-2xl border border-[#E8B93A]/40 text-[#F7D65A] shadow-[0_0_25px_rgba(232,185,58,0.25)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-[#F7D65A] via-[#E8B93A] to-[#C8901C]',
        tvClockDate: 'text-[#D9A21C]',
        tvDocName: 'text-[#F2C24A]',
        tvCurrentCard: 'bg-gradient-to-br from-[#1A150B] via-[#0A0A0D] to-[#15141A] text-[#F7D65A] border-2 border-[#E8B93A] shadow-[0_14px_45px_rgba(232,185,58,0.4),inset_0_1px_3px_rgba(255,255,255,0.18)]',
        tvCurrentDot: 'bg-[#F7D65A]',
        tvCurrentTitle: 'text-[#F2C24A]',
        tvCurrentAge: 'text-[#D9A21C]',
        tvChamberBadge: 'bg-[#E8B93A] text-[#1A1408] font-black',
        tvTokenCurrent: 'text-[#F7D65A] drop-shadow-[0_4px_25px_rgba(232,185,58,0.7)]',
        tvCurrentSubBadge: 'bg-[#0A0A0D]/80 border border-[#E8B93A]/40',
        tvNextCard: 'bg-gradient-to-br from-[#15141A] via-[#0A0A0D] to-[#1A150B] text-[#F7D65A] border-2 border-[#F7D65A] shadow-[0_14px_40px_rgba(245,215,110,0.35)]',
        tvNextDot: 'bg-[#F7D65A]',
        tvNextTitle: 'text-[#F2C24A]',
        tvNextBadge: 'bg-[#F7D65A] text-[#1A1408] font-black',
        tvTokenNext: 'text-[#F7D65A] drop-shadow-[0_4px_20px_rgba(245,215,110,0.6)]',
        tvNextAge: 'text-[#D9A21C]',
        tvNextSubBox: 'bg-[#0A0A0D]/80 border border-[#E8B93A]/40',
        tvListCard: 'bg-[#0F0E13]/95 backdrop-blur-2xl border border-[#E8B93A]/35 shadow-[0_14px_40px_rgba(0,0,0,0.8)]',
        tvCountBadge: 'bg-[#1A150B] text-[#F2C24A] border border-[#E8B93A]/40',
        tvListItem: 'bg-[#15141A]/70 hover:bg-[#1C1B22]/80 border border-[#E8B93A]/25',
        tvTokenList: 'text-[#F7D65A]',
        tvStatusBadge: 'bg-[#E8B93A]/20 text-[#F2C24A] border border-[#E8B93A]/40'
      };
    }
    if (activeTheme === 'obsidian-neumorphic') {
      return {
        id: 'obsidian-neumorphic',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#1a1a23] via-[#15151d] to-[#1c1c26] text-[#f3f4fa]',
        header: 'bg-[#1b1b25] border-b border-[#2b2b3a] text-[#f3f4fa] shadow-[0_6px_20px_rgba(0,0,0,0.45)] relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-[#1e1e29] text-[#f3f4fa] border border-[#2e2e3d] rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-[6px_6px_16px_rgba(0,0,0,0.5),-4px_-4px_12px_rgba(70,70,95,0.12)] transition-all duration-300',
        brandSubtext: 'text-[#9a9cb0]',
        brandDot: 'bg-[#22d3ee] shadow-[#22d3ee] shadow-md animate-pulse',
        card: 'bg-[#1e1e29] border border-[#2b2b3a] rounded-2xl sm:rounded-3xl text-[#f3f4fa] shadow-[8px_8px_20px_rgba(0,0,0,0.5),-6px_-6px_16px_rgba(70,70,95,0.10)]',
        subCard: 'bg-[#1a1a24] border border-[#272734] rounded-2xl text-[#e8eaf2] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.45),inset_-2px_-2px_5px_rgba(70,70,95,0.08)]',
        input: 'bg-[#16161e] border border-[#2d2d3c] text-[#f3f4fa] placeholder-[#6b6e80] focus:ring-2 focus:ring-[#8b7cf6] focus:border-[#8b7cf6] rounded-xl shadow-xs',
        buttonPrimary: 'bg-gradient-to-r from-[#7c6cf0] to-[#9a8bff] hover:from-[#6d5ce0] hover:to-[#8a7bf0] active:scale-[0.98] text-white font-bold rounded-xl transition shadow-[0_6px_18px_rgba(124,108,240,0.35)]',
        navActive: 'bg-[#22222e] text-[#c9bcff] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(80,80,110,0.12)] font-black ring-1 ring-[#8b7cf6]/50',
        navInactive: 'text-[#9a9cb0] hover:bg-[#24242f] hover:text-white',
        badgeChild: 'bg-gradient-to-r from-[#22d3ee] to-[#38bdf8] text-[#0b1220] font-black shadow-xs',
        badgeGen: 'bg-gradient-to-r from-[#7c6cf0] to-[#a78bfa] text-white font-black shadow-xs',
        borderGen: 'border-l-[#7c6cf0]',
        borderChild: 'border-l-[#22d3ee]',
        dateActive: 'bg-gradient-to-r from-[#7c6cf0] to-[#9a8bff] text-white border-[#6d5ce0] ring-1 ring-[#a78bfa]/50 shadow-xs font-bold',
        submitButton: 'bg-gradient-to-r from-[#7c6cf0] to-[#9a8bff] hover:from-[#6d5ce0] hover:to-[#8a7bf0] text-white font-bold active:scale-95 disabled:opacity-40 shadow-[0_6px_18px_rgba(124,108,240,0.35)] border border-[#a78bfa]/50',
        bottomNav: 'bg-[#15151d]/[0.55] backdrop-blur-md text-[#c9bcff]',
        presetActive: 'bg-gradient-to-r from-[#7c6cf0] to-[#9a8bff] text-white border-[#6d5ce0] shadow-sm font-bold',
        quickSymBtn: 'bg-[#1a1a24] hover:bg-[#24242f] text-[#c9bcff] border-[#2d2d3c]',
        accentBadge: 'bg-[#7c6cf0]/15 text-[#c9bcff] border-[#8b7cf6]/30',
        settingsBorder: 'border-[#2d2d3c]',
        settingsText: 'text-[#c9bcff]',
        // TV Mood — Obsidian Neumorphic
        tvHeaderBanner: 'bg-gradient-to-br from-[#1b1b25]/96 via-[#15151d]/94 to-[#1e1e29]/96 backdrop-blur-2xl border border-[#8b7cf6]/40 shadow-[0_22px_60px_-18px_rgba(124,108,240,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]',
        tvClockCard: 'bg-[#1e1e29]/85 border border-[#2b2b3a] text-[#f3f4fa] shadow-[0_0_25px_rgba(139,124,246,0.25)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#8b7cf6] to-[#22d3ee]',
        tvClockDate: 'text-[#9a9cb0]',
        tvDocName: 'text-[#c9bcff]',
        tvCurrentCard: 'bg-gradient-to-br from-[#22222e] via-[#1a1a24] to-[#1e1e29] text-[#f3f4fa] border-2 border-[#8b7cf6] shadow-[0_14px_45px_rgba(124,108,240,0.4)]',
        tvCurrentDot: 'bg-[#a78bfa]',
        tvCurrentTitle: 'text-[#c9bcff]',
        tvCurrentAge: 'text-[#9a9cb0]',
        tvChamberBadge: 'bg-[#8b7cf6] text-[#0b1220] font-black',
        tvTokenCurrent: 'text-[#c9bcff] drop-shadow-[0_4px_25px_rgba(139,124,246,0.7)]',
        tvCurrentSubBadge: 'bg-[#1a1a24]/80 border border-[#8b7cf6]/40',
        tvNextCard: 'bg-gradient-to-br from-[#1e1e29] via-[#15151d] to-[#22222e] text-[#f3f4fa] border-2 border-[#22d3ee] shadow-[0_14px_40px_rgba(34,211,238,0.3)]',
        tvNextDot: 'bg-[#22d3ee]',
        tvNextTitle: 'text-[#67e8f9]',
        tvNextBadge: 'bg-[#22d3ee] text-[#0b1220] font-black',
        tvTokenNext: 'text-[#67e8f9] drop-shadow-[0_4px_20px_rgba(34,211,238,0.6)]',
        tvNextAge: 'text-[#9a9cb0]',
        tvNextSubBox: 'bg-[#1a1a24]/80 border border-[#22d3ee]/40',
        tvListCard: 'bg-[#16161e]/95 backdrop-blur-2xl border border-[#2b2b3a] shadow-[0_14px_40px_rgba(0,0,0,0.8)]',
        tvCountBadge: 'bg-[#22222e] text-[#c9bcff] border border-[#8b7cf6]/40',
        tvListItem: 'bg-[#1e1e29]/70 hover:bg-[#24242f]/80 border border-[#2b2b3a]',
        tvTokenList: 'text-[#a78bfa]',
        tvStatusBadge: 'bg-[#8b7cf6]/20 text-[#c9bcff] border border-[#8b7cf6]/40'
      };
    }
    if (activeTheme === 'neon-glass') {
      return {
        id: 'neon-glass',
        wrapper: 'min-h-screen bg-gradient-to-br from-[#0a0c14] via-[#0b0e1a] to-[#090b12] text-[#eef1fb]',
        header: 'bg-[#0c0f1a]/85 backdrop-blur-xl border-b border-[#3b82f6]/25 text-[#dbe6ff] shadow-[0_8px_30px_rgba(0,0,0,0.6)] relative sm:sticky sm:top-0 z-40',
        brandBox: 'w-full sm:w-auto bg-[#0e1220]/80 text-[#dbe6ff] border border-[#3b82f6]/25 backdrop-blur-xl rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-[0_0_25px_rgba(59,130,246,0.15)] ring-1 ring-[#6366f1]/20 transition-all duration-300',
        brandSubtext: 'text-[#8f97b3]',
        brandDot: 'bg-[#22d3ee] shadow-[#22d3ee] shadow-md animate-pulse',
        card: 'bg-[#12141d]/80 backdrop-blur-xl border border-[#3b82f6]/20 rounded-2xl sm:rounded-3xl text-[#eef1fb] shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]',
        subCard: 'bg-[#0f1220]/85 border border-[#6366f1]/18 rounded-2xl text-[#eef1fb]',
        input: 'bg-[#0b0e17] border border-[#3b82f6]/25 text-[#eef1fb] placeholder-[#5b6478] focus:ring-2 focus:ring-[#6366f1] focus:border-[#3b82f6] rounded-xl shadow-xs',
        buttonPrimary: 'bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] hover:from-[#2f6fe0] hover:to-[#7c4fe0] active:scale-[0.98] text-white font-bold rounded-xl transition shadow-[0_8px_22px_rgba(99,102,241,0.4)]',
        navActive: 'bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white shadow-md font-black ring-1 ring-[#a78bfa]/50',
        navInactive: 'text-[#8f97b3] hover:bg-[#1a1f2e] hover:text-white',
        badgeChild: 'bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] text-[#061018] font-black shadow-xs',
        badgeGen: 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-black shadow-xs',
        borderGen: 'border-l-[#6366f1]',
        borderChild: 'border-l-[#22d3ee]',
        dateActive: 'bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white border-[#6366f1] ring-1 ring-[#a78bfa]/50 shadow-xs font-bold',
        submitButton: 'bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] hover:from-[#2f6fe0] hover:to-[#7c4fe0] text-white font-bold active:scale-95 disabled:opacity-40 shadow-[0_8px_22px_rgba(99,102,241,0.4)] border border-[#a78bfa]/40',
        bottomNav: 'bg-[#0a0c14]/[0.55] backdrop-blur-md text-[#dbe6ff]',
        presetActive: 'bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white border-[#6366f1] shadow-sm font-bold',
        quickSymBtn: 'bg-[#0f1220] hover:bg-[#1a1f2e] text-[#9ec5ff] border-[#3b82f6]/25',
        accentBadge: 'bg-[#3b82f6]/15 text-[#9ec5ff] border-[#6366f1]/30',
        settingsBorder: 'border-[#3b82f6]/25',
        settingsText: 'text-[#9ec5ff]',
        // TV Mood — Neon Glass Dashboard
        tvHeaderBanner: 'bg-gradient-to-br from-[#0a0c14]/96 via-[#0e1220]/94 to-[#120a1f]/96 backdrop-blur-2xl border border-[#6366f1]/40 shadow-[0_22px_60px_-18px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.06)]',
        tvClockCard: 'bg-[#0f1220]/85 backdrop-blur-2xl border border-[#3b82f6]/30 text-[#dbe6ff] shadow-[0_0_25px_rgba(59,130,246,0.25)]',
        tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] via-[#818cf8] to-[#a78bfa]',
        tvClockDate: 'text-[#8f97b3]',
        tvDocName: 'text-[#9ec5ff]',
        tvCurrentCard: 'bg-gradient-to-br from-[#0e1220] via-[#12141d] to-[#1a1030] text-[#eef1fb] border-2 border-[#3b82f6] shadow-[0_14px_45px_rgba(59,130,246,0.4)]',
        tvCurrentDot: 'bg-[#60a5fa]',
        tvCurrentTitle: 'text-[#9ec5ff]',
        tvCurrentAge: 'text-[#8f97b3]',
        tvChamberBadge: 'bg-[#3b82f6] text-[#061018] font-black',
        tvTokenCurrent: 'text-[#bfdbfe] drop-shadow-[0_4px_25px_rgba(59,130,246,0.7)]',
        tvCurrentSubBadge: 'bg-[#0b0e17]/80 border border-[#3b82f6]/40',
        tvNextCard: 'bg-gradient-to-br from-[#12141d] via-[#0a0c14] to-[#1a1030] text-[#eef1fb] border-2 border-[#8b5cf6] shadow-[0_14px_40px_rgba(139,92,246,0.4)]',
        tvNextDot: 'bg-[#a78bfa]',
        tvNextTitle: 'text-[#c4b5fd]',
        tvNextBadge: 'bg-[#8b5cf6] text-[#0b0618] font-black',
        tvTokenNext: 'text-[#c4b5fd] drop-shadow-[0_4px_20px_rgba(139,92,246,0.6)]',
        tvNextAge: 'text-[#8f97b3]',
        tvNextSubBox: 'bg-[#0b0e17]/80 border border-[#8b5cf6]/40',
        tvListCard: 'bg-[#0b0e17]/95 backdrop-blur-2xl border border-[#3b82f6]/25 shadow-[0_14px_40px_rgba(0,0,0,0.85)]',
        tvCountBadge: 'bg-[#0f1220] text-[#9ec5ff] border border-[#3b82f6]/40',
        tvListItem: 'bg-[#12141d]/70 hover:bg-[#1a1f2e]/80 border border-[#3b82f6]/20',
        tvTokenList: 'text-[#93c5fd]',
        tvStatusBadge: 'bg-[#3b82f6]/20 text-[#bfdbfe] border border-[#3b82f6]/40'
      };
    }
    return {
      id: 'plain-green',
      wrapper: 'min-h-screen bg-slate-100 text-slate-800',
      header: 'bg-emerald-800 border-b border-emerald-900 text-white shadow-md relative sm:sticky sm:top-0 z-40',
      brandBox: 'w-full sm:w-auto bg-emerald-900/60 text-white border-white/20 backdrop-blur-xl border rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-2.5 shadow-xl shadow-black/25 ring-1 ring-white/15 transition-all duration-300',
      brandSubtext: 'text-emerald-200',
      brandDot: 'bg-emerald-400 shadow-emerald-400',
      card: 'bg-white border border-slate-200 rounded-2xl text-slate-800 shadow-sm',
      subCard: 'bg-slate-50 border border-slate-200 rounded-xl text-slate-800',
      input: 'bg-slate-50 border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white rounded-xl',
      buttonPrimary: 'bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition shadow-sm',
      navActive: 'bg-slate-100 text-emerald-900 shadow-sm font-black',
      navInactive: 'text-emerald-100 hover:bg-emerald-700/60',
      badgeChild: 'bg-blue-600 text-white',
      badgeGen: 'bg-emerald-700 text-white',
      borderGen: 'border-l-emerald-600',
      borderChild: 'border-l-blue-500',
      dateActive: 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-1 ring-emerald-500',
      submitButton: 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 disabled:hover:bg-emerald-600 shadow-md shadow-emerald-700/30 border border-emerald-400',
      bottomNav: 'bg-emerald-800/[0.03] backdrop-blur-md text-white',
      presetActive: 'bg-emerald-700 text-white border-emerald-800 shadow-sm',
      quickSymBtn: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300',
      accentBadge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      settingsBorder: 'border-emerald-300',
      settingsText: 'text-emerald-800',
      // TV Mood — Plain Green
      tvHeaderBanner: 'bg-gradient-to-br from-emerald-900/95 via-emerald-800/92 to-teal-900/95 backdrop-blur-2xl border border-emerald-300/45 ring-1 ring-white/10 shadow-[0_22px_60px_-18px_rgba(16,185,129,0.45),0_8px_20px_-10px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.22)]',
      tvClockCard: 'bg-white/10 backdrop-blur-2xl border border-emerald-400/40 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.3)]',
      tvClockText: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200',
      tvClockDate: 'text-emerald-200',
      tvDocName: 'text-emerald-300',
      tvCurrentCard: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white border-2 border-emerald-400 shadow-[0_14px_45px_rgba(16,185,129,0.4),inset_0_1px_3px_rgba(255,255,255,0.25)]',
      tvCurrentDot: 'bg-emerald-400',
      tvCurrentTitle: 'text-emerald-300',
      tvCurrentAge: 'text-emerald-200',
      tvChamberBadge: 'bg-emerald-400 text-slate-950 font-black',
      tvTokenCurrent: 'text-white drop-shadow-[0_4px_25px_rgba(16,185,129,0.7)]',
      tvCurrentSubBadge: 'bg-emerald-900/60 border border-emerald-400/30',
      tvNextCard: 'bg-gradient-to-br from-slate-900 via-amber-950 to-slate-950 text-amber-50 border-2 border-amber-400 shadow-[0_14px_40px_rgba(245,158,11,0.35)]',
      tvNextDot: 'bg-amber-400',
      tvNextTitle: 'text-amber-300',
      tvNextBadge: 'bg-amber-400 text-slate-950 font-black',
      tvTokenNext: 'text-amber-400 drop-shadow-[0_4px_20px_rgba(245,158,11,0.6)]',
      tvNextAge: 'text-amber-200',
      tvNextSubBox: 'bg-amber-950/70 border border-amber-400/40',
      tvListCard: 'bg-gradient-to-br from-emerald-950/95 via-slate-950/90 to-teal-950/90 backdrop-blur-2xl border border-emerald-400/35 shadow-[0_14px_40px_rgba(0,0,0,0.5)]',
      tvCountBadge: 'bg-emerald-900 text-emerald-200 border border-emerald-400/40',
      tvListItem: 'bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-400/25',
      tvTokenList: 'text-amber-400',
      tvStatusBadge: 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/35'
    };  }, [activeTheme]);

  // মেইন প্যানেল ফরগ্রাউন্ড শিট — থিমের পেজ-ব্যাকগ্রাউন্ডের সাথে মিলিয়ে
  const mainPanelSurface = useMemo(() => {
    const surface = String(themeStyles.wrapper || '')
      .split(/\s+/)
      .filter(cls => /^(bg-|from-|via-|to-)/.test(cls) && !cls.startsWith('bg-clip'))
      .join(' ');
    return surface || 'bg-white';
  }, [themeStyles]);

  // হেডার বারের বেকগ্রাউন্ড (Backward Layer — z-10) ও টেক্সট কালার ক্লাস আলাদা করা
  const headerBackdropClass = useMemo(() => {
    return String(themeStyles.header || '')
      .split(/\s+/)
      .filter(cls => cls && !/^(relative|sticky|fixed|static|top-|z-|sm:sticky|sm:top-|sm:z-)/.test(cls))
      .join(' ');
  }, [themeStyles]);

  const headerTextColorClass = useMemo(() => {
    return String(themeStyles.header || '')
      .split(/\s+/)
      .filter(cls => cls.startsWith('text-'))
      .join(' ') || 'text-white';
  }, [themeStyles]);

  const upcomingSevenDays = useMemo(() => {
    const list = [];
    const baseDate = new Date();
    for (let i = 0; i <= 6; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const iso = localDateKey(d);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = String(d.getFullYear());
      const formattedDDMMYYYY = `${dd}/${mm}/${yyyy}`;
      const formattedShortDDMM = `${dd}/${mm}`;
      let label = '';
      // লাইভ কিউ স্ট্রিপে আপেক্ষিক দিন: আজ, কাল, + ২দিন … + ৬দিন
      let relativeLabel = '';
      if (i === 0) {
        label = 'আজ';
        relativeLabel = 'আজ';
      } else if (i === 1) {
        label = 'কাল';
        relativeLabel = 'কাল';
      } else {
        relativeLabel = `+ ${toBengaliDigits(i)}দিন`;
        label = relativeLabel;
      }

      list.push({ isoDate: iso, label, relativeLabel, formattedDDMMYYYY, formattedShortDDMM });
    }
    return list;
  }, [currentTimeTick]);

  useEffect(() => {
    const syncClock = () => { if (typeof document === 'undefined' || document.visibilityState === 'visible') setCurrentTimeTick(Date.now()); };
    const timer = setInterval(syncClock, 15000);
    document.addEventListener('visibilitychange', syncClock);
    window.addEventListener('focus', syncClock);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', syncClock);
      window.removeEventListener('focus', syncClock);
    };
  }, []);

  // রাত ১২টা পার হলে আজকের তারিখ ও ডিফল্ট তারিখগুলো নিজে থেকেই পরের দিনে বদলে যায়
  useEffect(() => {
    const nextKey = localDateKey();
    if (nextKey === TODAY_KEY) return;
    const prevKey = TODAY_KEY;
    TODAY_KEY = nextKey;
    const keepIfFuture = (d) => (d && d > prevKey ? d : nextKey);
    setAppointmentDate(keepIfFuture);
    setQueueSelectedDate(keepIfFuture);
    setReportSelectedDate(keepIfFuture);
    setCustomSerialDate(keepIfFuture);
    setIdFormRegDate(keepIfFuture);
    setCurrentTimeTick(Date.now());
  }, [currentTimeTick]);

  const latestStateRef = useRef({
    patientsByDate,
    patientIdDirectory,
    deletedDates,
    deletedPatientIds,
    deletedRecords,
    teamMembers,
    closedDates,
    chamberStartTime,
    avgServiceMinutes,
    whatsappTemplate,
    clinicNameState,
    doctorTitleState,
    patientIdPrefix,
    registrationRuleConfig,
    pendingApplications,
    settingsUpdatedAt: 0
  });

  useEffect(() => {
    latestStateRef.current = {
      ...latestStateRef.current,
      patientsByDate,
      patientIdDirectory,
      deletedDates,
      deletedPatientIds,
      deletedRecords,
      teamMembers,
      closedDates,
      chamberStartTime,
      avgServiceMinutes,
      whatsappTemplate,
      clinicNameState,
      doctorTitleState,
      patientIdPrefix,
      registrationRuleConfig,
      pendingApplications
    };
  }, [
    patientsByDate,
    patientIdDirectory,
    deletedDates,
    deletedPatientIds,
    deletedRecords,
    teamMembers,
    closedDates,
    chamberStartTime,
    avgServiceMinutes,
    whatsappTemplate,
    clinicNameState,
    doctorTitleState,
    patientIdPrefix,
    registrationRuleConfig,
    pendingApplications
  ]);

  // ——— TV সেটিংস ডিভাইস-সিঙ্ক (v2) ———
  // প্রয়োগ ফাংশন (state payload ও টপিক-প্যাকেট দুই জায়গা থেকেই কল হয়)
  const applyTvConfigParsed = (inc) => {
    if (!tvSyncEnabledRef.current) return false; // সিঙ্ক বন্ধ — কারোর পাঠানো TV সেটিংস প্রয়োগ করব না
    try {
      if (!inc || !inc.boards || typeof inc.boards !== 'object') return false;
      // last-writer-wins: incoming এডিট-টাইম আমাদের চেয়ে পুরোনো হলে উপেক্ষা — ডিফল্ট/স্টেল ডিভাইস fresh সেটিংস ফিরিয়ে দিতে পারবে না
      const inAt = Number(inc.editedAt) || 0;
      if (inAt < (tvConfigEditedAtRef.current || 0)) return false;
      tvSkipBroadcastRef.current = true;
      tvLastSentJsonRef.current = JSON.stringify(inc);
      if (inAt > (tvConfigEditedAtRef.current || 0)) { tvConfigEditedAtRef.current = inAt; persistTvEditedAt(); }
      setTvBoardsConfig(inc.boards);
      if ([1, 2, 3, 4].includes(Number(inc.defaultVariant))) setTvDefaultVariant(Number(inc.defaultVariant));
      if (Number.isFinite(Number(inc.rotationSeconds))) setTvTenRotationSeconds(Math.min(120, Math.max(3, Number(inc.rotationSeconds))));
      if (typeof inc.rotationEnabled === 'boolean') setTvTenRotationEnabled(inc.rotationEnabled);
      if (typeof inc.sound === 'boolean') setTvSoundEnabled(inc.sound);
      if (typeof inc.brightness === 'boolean') setTvAutoBrightness(inc.brightness);
      if (inc.marquee && typeof inc.marquee === 'object') setTvMarquee({ enabled: !!inc.marquee.enabled, text: String(inc.marquee.text || ''), speed: clampCount(inc.marquee.speed, 5, 120) || 20 });
      if (typeof inc.highlight === 'boolean') setTvHighlightOnCall(inc.highlight);
      if (typeof inc.welcome === 'boolean') setTvWelcome(inc.welcome);
      if (inc.voice && typeof inc.voice === 'object') setTvVoice({ enabled: !!inc.voice.enabled, rate: Math.min(2, Math.max(0.5, Number(inc.voice.rate) || 1)), repeat: clampCount(inc.voice.repeat, 1, 3) || 1 });
      if (inc.beep && typeof inc.beep === 'object') setTvBeep({ type: ['beep', 'chime'].includes(inc.beep.type) ? inc.beep.type : 'beep', volume: Math.min(1, Math.max(0, Number(inc.beep.volume))), repeat: clampCount(inc.beep.repeat, 1, 3) || 1 });
      if ([2, 3, 4].includes(Number(inc.hColumns))) setTvHColumns(Number(inc.hColumns));
      if (Array.isArray(inc.textPresets)) setTvTextPresets(inc.textPresets.slice(0, 30));
      if (Array.isArray(inc.designPresets)) setTvDesignPresets(inc.designPresets.slice(0, 30));
      return true;
    } catch { return false; }
  };
  const tvsetTopicRef = useRef('');
  const lastTvSetTsRef = useRef(0);
  // ছোট প্যাকেট সরাসরি সব সংযুক্ত ব্রোকারে পাঠায় (patient-স্টেটের বিশাল প্যাকেটের উপর নির্ভর নয়)
  const publishTvSetToPeers = (json) => {
    if (!tvSyncEnabledRef.current) return; // সিঙ্ক বন্ধ — নিজের TV সেটিংস অন্য ডিভাইসে পাঠাব না
    try {
      if (!json || !tvsetTopicRef.current) return;
      const pkt = JSON.stringify({ action: 'TVSET', json, ts: getNextLogicalTime(), senderId: clientSessionId.current, senderName: currentUser?.name || 'স্টাফ' });
      (mqttClientsRef.current || []).forEach((c) => { try { if (c && c.connected) c.publish(tvsetTopicRef.current, pkt); } catch {} });
      try { if (bcRef.current) bcRef.current.postMessage({ tvsetPacket: pkt }); } catch {}
    } catch {}
  };

  const applyIncomingSyncPayload = useCallback((rawPacket, options = {}) => {
    if (!rawPacket || typeof rawPacket !== 'object') return false;

    const data = rawPacket.state && typeof rawPacket.state === 'object'
      ? { ...rawPacket, ...rawPacket.state }
      : rawPacket;

    if (!options.allowSelf && data.senderId && data.senderId === clientSessionId.current) {
      return false;
    }

    if (!options.forceApply && data.messageId) {
      if (processedMsgIdsRef.current.has(data.messageId)) return false;
      processedMsgIdsRef.current.add(data.messageId);
      if (processedMsgIdsRef.current.size > 500) {
        const firstKey = processedMsgIdsRef.current.values().next().value;
        processedMsgIdsRef.current.delete(firstKey);
      }
    }

    const incomingVer = Number(data.updatedAt) || 0;
    if (incomingVer > logicalClockRef.current) {
      logicalClockRef.current = incomingVer;
    }

    const safeRoomKey = normalizeRoomKey(syncChannelId);
    const currentLocal = latestStateRef.current;

    let incPatientsMap = null;
    if (data.patientsByDate && typeof data.patientsByDate === 'object') {
      incPatientsMap = data.patientsByDate;
    } else if (data.patientsByDateJson) {
      try {
        incPatientsMap = JSON.parse(data.patientsByDateJson);
      } catch {}
    }

    let incDirList = null;
    if (Array.isArray(data.patientIdDirectory)) {
      incDirList = data.patientIdDirectory;
    } else if (data.patientIdDirectoryJson) {
      try {
        incDirList = JSON.parse(data.patientIdDirectoryJson);
      } catch {}
    }

    let incDeletedDates = null;
    if (data.deletedDates && typeof data.deletedDates === 'object') {
      incDeletedDates = data.deletedDates;
    } else if (data.deletedDatesJson) {
      try {
        incDeletedDates = JSON.parse(data.deletedDatesJson);
      } catch {}
    }

    let incTeamList = null;
    if (Array.isArray(data.teamMembers)) {
      incTeamList = data.teamMembers;
    } else if (data.teamMembersJson) {
      try {
        incTeamList = JSON.parse(data.teamMembersJson);
      } catch {}
    }

    let incDeletedPatients = null;
    if (data.deletedPatientIds && typeof data.deletedPatientIds === 'object') {
      incDeletedPatients = data.deletedPatientIds;
    } else if (data.deletedPatientIdsJson) {
      try {
        incDeletedPatients = JSON.parse(data.deletedPatientIdsJson);
      } catch {}
    }

    let incDeletedRecords = null;
    if (data.deletedRecords && typeof data.deletedRecords === 'object') {
      incDeletedRecords = data.deletedRecords;
    } else if (data.deletedRecordsJson) {
      try {
        incDeletedRecords = JSON.parse(data.deletedRecordsJson);
      } catch {}
    }

    const mergedDeletedDates = { ...(currentLocal.deletedDates || {}) };
    if (incDeletedDates && typeof incDeletedDates === 'object') {
      Object.entries(incDeletedDates).forEach(([dKey, ts]) => {
        const numTs = Number(ts) || 0;
        if (numTs > (mergedDeletedDates[dKey] || 0)) {
          mergedDeletedDates[dKey] = numTs;
        }
        if (numTs > logicalClockRef.current) {
          logicalClockRef.current = numTs;
        }
      });
    }

    const mergedDeletedPatients = { ...(currentLocal.deletedPatientIds || {}) };
    if (incDeletedPatients && typeof incDeletedPatients === 'object') {
      Object.entries(incDeletedPatients).forEach(([pId, ts]) => {
        const numTs = Number(ts) || 0;
        if (numTs > (mergedDeletedPatients[pId] || 0)) {
          mergedDeletedPatients[pId] = numTs;
        }
        if (numTs > logicalClockRef.current) {
          logicalClockRef.current = numTs;
        }
      });
    }
    if (incDeletedPatients && !incPatientsMap) incPatientsMap = {};

    // ডিলিট-রেকর্ড মার্জ: তারিখ অনুযায়ী id দিয়ে ইউনিয়ন (ডুপ্লিকেট এড়ানো)
    const mergedDeletedRecords = { ...(currentLocal.deletedRecords || {}) };
    if (incDeletedRecords && typeof incDeletedRecords === 'object') {
      Object.entries(incDeletedRecords).forEach(([dKey, list]) => {
        if (!Array.isArray(list)) return;
        const existing = Array.isArray(mergedDeletedRecords[dKey]) ? mergedDeletedRecords[dKey] : [];
        const byId = new Map(existing.map((r) => [r && r.id, r]));
        list.forEach((r) => { if (r && r.id && !byId.has(r.id)) byId.set(r.id, r); });
        mergedDeletedRecords[dKey] = Array.from(byId.values()).sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
      });
    }

    // আবেদন তালিকা মার্জ: id অনুযায়ী নতুন timestamp জিতে নেয়
    let incApplications = null;
    if (Array.isArray(data.pendingApplications)) {
      incApplications = data.pendingApplications;
    } else if (data.pendingApplicationsJson) {
      try {
        incApplications = JSON.parse(data.pendingApplicationsJson);
      } catch {}
    }

    let finalApplications = Array.isArray(currentLocal.pendingApplications) ? currentLocal.pendingApplications : [];
    if (Array.isArray(incApplications)) {
      const appMap = new Map();
      finalApplications.forEach((a) => {
        if (a && a.id) appMap.set(a.id, a);
      });
      incApplications.forEach((a) => {
        if (!a || !a.id) return;
        const incTs = Number(a.updatedTimestamp || a.appliedAtTimestamp || 0);
        if (incTs > logicalClockRef.current) logicalClockRef.current = incTs;
        const existing = appMap.get(a.id);
        if (!existing) {
          appMap.set(a.id, a);
          return;
        }
        const locTs = Number(existing.updatedTimestamp || existing.appliedAtTimestamp || 0);
        if (incTs >= locTs) appMap.set(a.id, { ...existing, ...a });
      });
      finalApplications = Array.from(appMap.values())
        .sort((a, b) => (b.appliedAtTimestamp || 0) - (a.appliedAtTimestamp || 0))
        .slice(0, 120);
      setPendingApplications(finalApplications);
    }
    let finalPatientsMap = currentLocal.patientsByDate;
    if (incPatientsMap && typeof incPatientsMap === 'object') {
      const nextMap = {};
      const allDates = new Set([
        ...Object.keys(currentLocal.patientsByDate || {}),
        ...Object.keys(incPatientsMap || {})
      ]);

      allDates.forEach((dKey) => {
        const delTs = Number(mergedDeletedDates[dKey]) || 0;
        const locArr = Array.isArray(currentLocal.patientsByDate?.[dKey]) ? currentLocal.patientsByDate[dKey] : [];
        const incArr = Array.isArray(incPatientsMap?.[dKey]) ? incPatientsMap[dKey] : [];
        const byId = new Map();

        locArr.forEach((p) => {
          if (!p || !p.id) return;
          const pTs = Number(p.updatedTimestamp || p.completedTimestamp || p.calledTimestamp || p.registeredTimestamp || 0);
          if (pTs > logicalClockRef.current) logicalClockRef.current = pTs;
          // টম্বস্টন শুধু তখনই রোগীকে বাদ দেবে যদি ডিলিট-সময় রোগীর শেষ আপডেটের সমান বা পরে হয়;
          // ফেরত আনা রোগীর updatedTimestamp টম্বস্টনের চেয়ে নতুন হলে সে টিকে থাকবে
          const tomb = Number(mergedDeletedPatients[p.id]) || 0;
          if (tomb && tomb >= pTs) return;
          if (delTs > 0 && pTs <= delTs) return;
          byId.set(p.id, p);
        });

        incArr.forEach((p) => {
          if (!p || !p.id) return;
          const pTs = Number(p.updatedTimestamp || p.completedTimestamp || p.calledTimestamp || p.registeredTimestamp || 0);
          if (pTs > logicalClockRef.current) logicalClockRef.current = pTs;
          const tomb = Number(mergedDeletedPatients[p.id]) || 0;
          if (tomb && tomb >= pTs) return;
          if (delTs > 0 && pTs <= delTs) return;
          const existing = byId.get(p.id);
          if (!existing) {
            byId.set(p.id, p);
          } else {
            const exTs = Number(existing.updatedTimestamp || existing.completedTimestamp || existing.calledTimestamp || existing.registeredTimestamp || 0);
            if (pTs >= exTs) {
              byId.set(p.id, { ...existing, ...p });
            }
          }
        });

        const combined = Array.from(byId.values()).sort(
          (a, b) => (a.registeredTimestamp || 0) - (b.registeredTimestamp || 0)
        );
        const usedSerials = new Set();
        const collisionResolved = combined.map((p) => {
          let s = Number(p.serialNumber) || (p.isChildUnder4 ? 2 : 1);
          if (!usedSerials.has(s)) {
            usedSerials.add(s);
            return p;
          }
          while (usedSerials.has(s)) {
            s += 2;
          }
          usedSerials.add(s);
          return { ...p, serialNumber: s };
        });

        collisionResolved.sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0));
        nextMap[dKey] = collisionResolved;
      });

      finalPatientsMap = nextMap;
      setPatientsByDate(finalPatientsMap);
    }

    let finalDirList = currentLocal.patientIdDirectory;
    if (Array.isArray(incDirList)) {
      const dirMap = new Map();
      (Array.isArray(currentLocal.patientIdDirectory) ? currentLocal.patientIdDirectory : []).forEach((rec) => {
        const key = rec?.patientCode || rec?.id;
        if (key) dirMap.set(key, rec);
      });
      incDirList.forEach((rec) => {
        const key = rec?.patientCode || rec?.id;
        if (!key) return;
        const incTs = Number(rec.updatedTimestamp || rec.registeredTimestamp || 0);
        if (incTs > logicalClockRef.current) logicalClockRef.current = incTs;
        const existing = dirMap.get(key);
        if (!existing) {
          dirMap.set(key, rec);
        } else {
          const locTs = Number(existing.updatedTimestamp || existing.registeredTimestamp || 0);
          if (incTs >= locTs) {
            dirMap.set(key, { ...existing, ...rec });
          }
        }
      });
      finalDirList = Array.from(dirMap.values()).sort(
        (a, b) => (b.registeredTimestamp || 0) - (a.registeredTimestamp || 0)
      );
      setPatientIdDirectory(finalDirList);
    }

    setDeletedDates(mergedDeletedDates);
    setDeletedPatientIds(mergedDeletedPatients);
    try {
      localStorage.setItem(`amh_deleted_patients_${safeRoomKey}`, JSON.stringify(mergedDeletedPatients));
    } catch {}
    setDeletedRecords(mergedDeletedRecords);
    try {
      localStorage.setItem(`amh_deleted_records_${safeRoomKey}`, JSON.stringify(mergedDeletedRecords));
    } catch {}

    const isNewerSettings = incomingVer >= (currentLocal.settingsUpdatedAt || 0);
    let finalTeam = currentLocal.teamMembers;
    if (Array.isArray(incTeamList) && incTeamList.length > 0 && isNewerSettings) {
      const normalizedTeam = incTeamList.map(m =>
        (m && (m.id === 'ADMIN-01' || m.isAdmin) && m.name === 'প্রধান অ্যাডমিন' && m.pin === 'Admin123')
          ? { ...m, name: 'উবায়দুল', pin: ';' }
          : m
      );
      finalTeam = normalizedTeam;
      setTeamMembers(normalizedTeam);
      setCurrentUser(prev =>
        (prev && (prev.id === 'ADMIN-01' || prev.isAdmin) && prev.name === 'প্রধান অ্যাডমিন')
          ? { ...prev, name: 'উবায়দুল', pin: ';' }
          : prev
      );
    }

    let finalPrefix = currentLocal.patientIdPrefix;
    if (data.patientIdPrefix && isNewerSettings) {
      finalPrefix = data.patientIdPrefix;
      setPatientIdPrefix(data.patientIdPrefix);
    }

    let finalTemplate = currentLocal.whatsappTemplate;
    if (data.whatsappTemplate && isNewerSettings) {
      const incomingTemplate = normalizeWhatsappTemplate(data.whatsappTemplate);
      finalTemplate = incomingTemplate;
      setWhatsappTemplate(incomingTemplate);
      setTempDraftInput(incomingTemplate);
    }

    let finalChamberTime = currentLocal.chamberStartTime;
    if (data.chamberStartTime && isNewerSettings) {
      finalChamberTime = data.chamberStartTime;
      setChamberStartTime(data.chamberStartTime);
    }

    let finalAvgMins = currentLocal.avgServiceMinutes;
    if (data.avgServiceMinutes && isNewerSettings) {
      finalAvgMins = Number(data.avgServiceMinutes) || 3;
      setAvgServiceMinutes(finalAvgMins);
    }

    if (data.clinicNameState && isNewerSettings) {
      setClinicNameState(data.clinicNameState);
      setTempClinicName(data.clinicNameState);
    }
    if (data.doctorTitleState && isNewerSettings) {
      setDoctorTitleState(data.doctorTitleState);
      setTempDoctorTitle(data.doctorTitleState);
    }

    let incClosedDates = null;
    if (Array.isArray(data.closedDates)) {
      incClosedDates = data.closedDates;
    } else if (data.closedDatesJson) {
      try {
        incClosedDates = JSON.parse(data.closedDatesJson);
      } catch {}
    }
    let finalClosedDates = currentLocal.closedDates || [];
    if (Array.isArray(incClosedDates) && isNewerSettings) {
      finalClosedDates = incClosedDates;
      setClosedDates(incClosedDates);
      try {
        localStorage.setItem('amh_closed_dates', JSON.stringify(incClosedDates));
      } catch {}
    }

    let incRuleConfig = null;
    if (data.registrationRuleConfig && typeof data.registrationRuleConfig === 'object') {
      incRuleConfig = data.registrationRuleConfig;
    } else if (data.registrationRuleConfigJson) {
      try {
        incRuleConfig = JSON.parse(data.registrationRuleConfigJson);
      } catch {}
    }
    let finalRuleConfig = currentLocal.registrationRuleConfig;
    if (incRuleConfig && typeof incRuleConfig === 'object' && isNewerSettings) {
      finalRuleConfig = { ...(currentLocal.registrationRuleConfig || {}), ...incRuleConfig };
      setRegistrationRuleConfig(finalRuleConfig);
      if (finalRuleConfig.ageLimitYears !== undefined) {
        setTempRuleAgeLimit(toBengaliDigits(finalRuleConfig.ageLimitYears));
      }
      try {
        localStorage.setItem('amh_registration_rule_config', JSON.stringify(finalRuleConfig));
      } catch {}
    }

    // TV সেটিংস ডিভাইস-সিঙ্ক: incoming payload-এ tvConfigJson থাকলে প্রয়োগ কর
    let incTvConfig = null;
    if (data.tvConfigJson && typeof data.tvConfigJson === 'string') {
      try { incTvConfig = JSON.parse(data.tvConfigJson); } catch {}
    } else if (data.tvConfigJson && typeof data.tvConfigJson === 'object') {
      incTvConfig = data.tvConfigJson;
    }
    if (incTvConfig && incTvConfig.boards && typeof incTvConfig.boards === 'object' && isNewerSettings) {
      applyTvConfigParsed(incTvConfig);
    }

    latestStateRef.current = {
      ...currentLocal,
      patientsByDate: finalPatientsMap,
      patientIdDirectory: finalDirList,
      deletedDates: mergedDeletedDates,
      deletedPatientIds: mergedDeletedPatients,
      deletedRecords: mergedDeletedRecords,
      teamMembers: finalTeam,
      chamberStartTime: finalChamberTime,
      avgServiceMinutes: finalAvgMins,
      whatsappTemplate: finalTemplate,
      patientIdPrefix: finalPrefix,
      registrationRuleConfig: finalRuleConfig,
      pendingApplications: finalApplications,
      tvConfigJson: (data.tvConfigJson && typeof data.tvConfigJson === 'string') ? data.tvConfigJson : ((currentLocal && currentLocal.tvConfigJson) || null),
      settingsUpdatedAt: Math.max(currentLocal.settingsUpdatedAt || 0, incomingVer)
    };

    try {
      localStorage.setItem(`amh_patients_${safeRoomKey}`, JSON.stringify(finalPatientsMap));
      localStorage.setItem(`amh_directory_${safeRoomKey}`, JSON.stringify(finalDirList));
      localStorage.setItem(`amh_deleted_dates_${safeRoomKey}`, JSON.stringify(mergedDeletedDates));
      localStorage.setItem(`amh_deleted_patients_${safeRoomKey}`, JSON.stringify(mergedDeletedPatients));
      localStorage.setItem(`amh_deleted_records_${safeRoomKey}`, JSON.stringify(mergedDeletedRecords));
      localStorage.setItem(`amh_applications_${safeRoomKey}`, JSON.stringify(finalApplications));
      localStorage.setItem(`amh_sync_payload_${safeRoomKey}`, JSON.stringify({
        updatedAt: Math.max(incomingVer, Date.now()),
        patientsByDate: finalPatientsMap,
        patientIdDirectory: finalDirList,
        deletedDates: mergedDeletedDates,
        deletedPatientIds: mergedDeletedPatients,
        deletedRecords: mergedDeletedRecords,
        teamMembers: finalTeam,
        chamberStartTime: finalChamberTime,
        avgServiceMinutes: finalAvgMins,
        whatsappTemplate: finalTemplate,
        patientIdPrefix: finalPrefix,
        registrationRuleConfig: finalRuleConfig,
        pendingApplications: finalApplications
      }));
    } catch {}

    const timeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSyncedAtText(timeStr);
    setSyncStatus('connected');
    return true;
  }, [syncChannelId]);

  const syncFlushRef = useRef({ timer: null, task: null, lastAt: 0 });
  const scheduleSyncFlush = useCallback((task) => {
    const slot = syncFlushRef.current;
    const now = Date.now();
    if (!slot.timer && now - slot.lastAt >= SYNC_COALESCE_MS) {
      slot.lastAt = now;
      task();
      return;
    }
    slot.task = task;
    if (slot.timer) clearTimeout(slot.timer);
    slot.timer = setTimeout(() => {
      slot.timer = null;
      const pendingTask = slot.task;
      slot.task = null;
      slot.lastAt = Date.now();
      if (pendingTask) pendingTask();
    }, SYNC_COALESCE_MS);
  }, []);

  const broadcastFullState = useCallback(async (
    nextPatientsMap,
    nextTeam,
    nextChamberTime,
    nextAvgMins,
    nextTemplate,
    nextDir,
    nextClinicName,
    nextDocTitle,
    nextPrefix,
    nextDeletedDates,
    nextClosedDates,
    nextRuleConfig,
    nextApplications
  ) => {
    const nowVer = getNextLogicalTime();
    const safeRoomKey = normalizeRoomKey(syncChannelId);
    const msgId = `${clientSessionId.current}-${nowVer}-${Math.random().toString(36).substring(2, 7)}`;
    processedMsgIdsRef.current.add(msgId);

    const cur = latestStateRef.current;
    const currentPatients = nextPatientsMap !== undefined ? nextPatientsMap : cur.patientsByDate;
    const currentTeam = nextTeam !== undefined ? nextTeam : cur.teamMembers;
    const currentDir = nextDir !== undefined ? nextDir : cur.patientIdDirectory;
    const currentDeleted = nextDeletedDates !== undefined ? nextDeletedDates : cur.deletedDates;
    const currentDeletedPatients = cur.deletedPatientIds || {};
    const currentDeletedRecords = cur.deletedRecords || {};
    const currentChamber = nextChamberTime !== undefined ? nextChamberTime : cur.chamberStartTime;
    const currentAvg = nextAvgMins !== undefined ? nextAvgMins : cur.avgServiceMinutes;
    const currentTpl = nextTemplate !== undefined ? nextTemplate : cur.whatsappTemplate;
    const currentClinic = nextClinicName !== undefined ? nextClinicName : cur.clinicNameState;
    const currentDoc = nextDocTitle !== undefined ? nextDocTitle : cur.doctorTitleState;
    const currentPrefix = nextPrefix !== undefined ? nextPrefix : cur.patientIdPrefix;
    const currentClosed = nextClosedDates !== undefined ? nextClosedDates : (cur.closedDates || []);
    const currentRule = nextRuleConfig !== undefined ? nextRuleConfig : cur.registrationRuleConfig;
    const currentApplications = nextApplications !== undefined ? nextApplications : (cur.pendingApplications || []);

    latestStateRef.current = {
      patientsByDate: currentPatients,
      patientIdDirectory: currentDir,
      deletedDates: currentDeleted,
      deletedPatientIds: currentDeletedPatients,
      deletedRecords: currentDeletedRecords,
      teamMembers: currentTeam,
      chamberStartTime: currentChamber,
      avgServiceMinutes: currentAvg,
      whatsappTemplate: currentTpl,
      clinicNameState: currentClinic,
      doctorTitleState: currentDoc,
      patientIdPrefix: currentPrefix,
      closedDates: currentClosed,
      registrationRuleConfig: currentRule,
      pendingApplications: currentApplications,
      tvConfigJson: (latestStateRef.current && latestStateRef.current.tvConfigJson) || null,
      settingsUpdatedAt: nowVer
    };

    const packetObj = {
      action: 'UPDATE_SYNC',
      messageId: msgId,
      updatedAt: nowVer,
      senderId: clientSessionId.current,
      senderName: currentUser?.name || 'স্টাফ',
      patientsByDate: currentPatients,
      patientIdDirectory: currentDir,
      deletedDates: currentDeleted,
      deletedPatientIds: currentDeletedPatients,
      deletedRecords: currentDeletedRecords,
      teamMembers: currentTeam,
      chamberStartTime: currentChamber,
      avgServiceMinutes: currentAvg,
      whatsappTemplate: currentTpl,
      clinicNameState: currentClinic,
      doctorTitleState: currentDoc,
      patientIdPrefix: currentPrefix,
      closedDates: currentClosed,
      closedDatesJson: JSON.stringify(currentClosed || []),
      registrationRuleConfig: currentRule,
      registrationRuleConfigJson: JSON.stringify(currentRule || {}),
      pendingApplications: currentApplications,
      pendingApplicationsJson: JSON.stringify(currentApplications || []),
      tvConfigJson: (latestStateRef.current && latestStateRef.current.tvConfigJson) || null
    };

    const packetJsonStr = JSON.stringify(packetObj);

    const runSyncTransport = () => {
      try {
        localStorage.setItem(`amh_patients_${safeRoomKey}`, JSON.stringify(currentPatients));
        localStorage.setItem(`amh_directory_${safeRoomKey}`, JSON.stringify(currentDir));
        localStorage.setItem(`amh_deleted_dates_${safeRoomKey}`, JSON.stringify(currentDeleted));
        localStorage.setItem(`amh_deleted_patients_${safeRoomKey}`, JSON.stringify(currentDeletedPatients));
        localStorage.setItem(`amh_deleted_records_${safeRoomKey}`, JSON.stringify(currentDeletedRecords));
        localStorage.setItem(`amh_applications_${safeRoomKey}`, JSON.stringify(currentApplications || []));
        localStorage.setItem(`amh_sync_payload_${safeRoomKey}`, packetJsonStr);
        localStorage.setItem('amh_closed_dates', JSON.stringify(currentClosed));
        if (currentRule) localStorage.setItem('amh_registration_rule_config', JSON.stringify(currentRule));
        localStorage.setItem(`amh_sync_ver_${safeRoomKey}`, String(nowVer));
      } catch {}

      try {
        if (bcRef.current) {
          bcRef.current.postMessage(packetObj);
        } else if (typeof BroadcastChannel !== 'undefined') {
          const tempBc = new BroadcastChannel(`clinic_sync_${safeRoomKey}`);
          tempBc.postMessage(packetObj);
          setTimeout(() => {
            try { tempBc.close(); } catch {}
          }, 800);
        }
      } catch {}

      if (cloudSyncEnabled && cloudUser) {
        setSyncStatus('syncing');
        void writeClinicState(safeRoomKey, packetObj)
          .then(() => {
            setSyncStatus('connected');
            setLastSyncedAtText(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          })
          .catch((err) => {
            console.error('Supabase clinic state save failed:', err);
            setSyncStatus('disconnected');
            setSyncToast('ক্লাউডে সেভ হয়নি—ইন্টারনেট/ডেটাবেস সংযোগ পরীক্ষা করুন');
          });
      }
    };
    scheduleSyncFlush(runSyncTransport);


    const timeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSyncedAtText(timeStr);
    if (!cloudSyncEnabled) setSyncStatus('disconnected');
  }, [cloudSyncEnabled, cloudUser, syncChannelId, currentUser, getNextLogicalTime]);

  const flushPendingSync = useCallback(() => {
    const slot = syncFlushRef.current;
    if (!slot.task) return;
    const pendingTask = slot.task;
    slot.task = null;
    if (slot.timer) { clearTimeout(slot.timer); slot.timer = null; }
    slot.lastAt = Date.now();
    try { pendingTask(); } catch {}
  }, []);

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flushPendingSync(); };
    window.addEventListener('pagehide', flushPendingSync);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', flushPendingSync);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [flushPendingSync]);

  // TV সেটিংস বদলালে পুরো স্টেট-প্যাকেটে tvConfigJson পাঠাও — অন্য ডিভাইস (ফোন/টিভি) প্রয়োগ করবে।
  // প্রথম রান-এ ব্রডকাস্ট নয়; রিমোট-অ্যাপ্লাইতে skip ফ্ল্যাগ যাতে রি-ব্রডকাস্ট-লুপ না হয়।
  useEffect(() => {
    try {
      if (!tvSyncEnabled) { tvLastSentJsonRef.current = JSON.stringify(collectTvConfig()); return; } // সিঙ্ক বন্ধ — কিছু পাঠাব না (চালু করলে পরবর্তী পরিবর্তনে পাঠাবে)
      if (tvInitBroadcastRef.current) { tvInitBroadcastRef.current = false; tvLastSentJsonRef.current = JSON.stringify(collectTvConfig()); return; }
      if (tvSkipBroadcastRef.current) { tvSkipBroadcastRef.current = false; tvLastSentJsonRef.current = JSON.stringify(collectTvConfig()); return; } // রিমোট-অ্যাপ্লাই — নিজে থেকে আবার পাঠাব না
      // লোকাল এডিট — সবচেয়ে নতুন টাইমস্ট্যাম্প দিয়ে পাঠাই (last-writer-wins), যাতে পুরোনো/ডিফল্ট ডিভাইস এটি ফিরিয়ে দিতে না পারে
      tvConfigEditedAtRef.current = Date.now();
      persistTvEditedAt();
      const json = JSON.stringify(collectTvConfig());
      if (tvLastSentJsonRef.current === json) return;
      if (!isAuthenticated) return;
      tvLastSentJsonRef.current = json;
      latestStateRef.current = { ...(latestStateRef.current || {}), tvConfigJson: json };
      broadcastFullState();
      publishTvSetToPeers(json);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tvBoardsConfig, tvDefaultVariant, tvTenRotationSeconds, tvTenRotationEnabled, tvSoundEnabled, tvAutoBrightness, tvMarquee, tvHighlightOnCall, tvWelcome, tvVoice, tvBeep, tvHColumns, tvSyncEnabled]);

  useEffect(() => {
    const safeRoomKey = normalizeRoomKey(syncChannelId);
    const stateTopic = `amh_sync_v7/${safeRoomKey}/state`;
    const cmdTopic = `amh_sync_v7/${safeRoomKey}/cmd`;
    const tvsetTopic = `amh_sync_v7/${safeRoomKey}/tvset`;
    tvsetTopicRef.current = tvsetTopic;
    let isMounted = true;

    try {
      localStorage.setItem('amh_active_room_key', safeRoomKey);
    } catch {}

    try {
      const localCached = localStorage.getItem(`amh_sync_payload_${safeRoomKey}`);
      if (localCached) {
        applyIncomingSyncPayload(JSON.parse(localCached), { allowSelf: true, forceApply: true });
      }
    } catch {}

    const handleStorageChange = (e) => {
      if (e.key === `amh_sync_payload_${safeRoomKey}` && e.newValue) {
        try {
          applyIncomingSyncPayload(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel(`clinic_sync_${safeRoomKey}`);
        bcRef.current = bc;
        bc.onmessage = (ev) => {
          if (ev.data && ev.data.tvsetPacket) {
            try {
              const pkt = JSON.parse(ev.data.tvsetPacket);
              if (pkt && pkt.senderId !== clientSessionId.current && typeof pkt.json === 'string') {
                const ts = Number(pkt.ts) || 0;
                if (ts > lastTvSetTsRef.current) {
                  lastTvSetTsRef.current = ts;
                  if (ts > logicalClockRef.current) logicalClockRef.current = ts;
                  try { if (pkt.json !== JSON.stringify(collectTvConfig())) applyTvConfigParsed(JSON.parse(pkt.json)); } catch {}
                }
              }
            } catch {}
            return;
          }
          if (ev.data) applyIncomingSyncPayload(ev.data);
        };
      } catch {}
    }

    const hasLocalDataToShare = () => {
      const cur = latestStateRef.current;
      const totalPatients = Object.values(cur.patientsByDate || {}).reduce(
        (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
        0
      );
      const totalIds = Array.isArray(cur.patientIdDirectory) ? cur.patientIdDirectory.length : 0;
      return totalPatients > 0 || totalIds > 0;
    };

    const chunkAssembler = createChunkAssembler((assembledPacket) => {
      if (!isMounted) return;
      applyIncomingSyncPayload(assembledPacket);
    });

    const activeClients = [];
    const updateConnectedCount = () => {
      if (!isMounted) return;
      const count = activeClients.filter((c) => c && c.connected).length;
      setConnectedBrokersCount(count);
      if (count > 0) setSyncStatus('connected');
    };

    MQTT_BROKERS.forEach((brokerUrl, idx) => {
      const conn = createNativeMqttConnection({
        brokerUrl,
        clientId: `amh7_${idx}_${Math.random().toString(36).substring(2, 10)}`,
        topics: [stateTopic, cmdTopic, tvsetTopic],
        onConnect: () => {
          if (!isMounted) return;
          updateConnectedCount();

          try {
            conn.publish(
              cmdTopic,
              JSON.stringify({
                action: 'REQUEST_SYNC',
                senderId: clientSessionId.current,
                senderName: currentUser?.name || 'স্টাফ',
                time: Date.now()
              })
            );
          } catch {}

          if (hasLocalDataToShare()) {
            const cur = latestStateRef.current;
            const ver = getNextLogicalTime();
            const fullPacket = JSON.stringify({
              action: 'FULL_SYNC',
              messageId: `${clientSessionId.current}-init-${ver}`,
              updatedAt: ver,
              senderId: clientSessionId.current,
              senderName: currentUser?.name || 'স্টাফ',
              patientsByDate: cur.patientsByDate,
              patientIdDirectory: cur.patientIdDirectory,
              deletedDates: cur.deletedDates,
              deletedPatientIds: cur.deletedPatientIds || {},
              teamMembers: cur.teamMembers,
              chamberStartTime: cur.chamberStartTime,
              avgServiceMinutes: cur.avgServiceMinutes,
              whatsappTemplate: cur.whatsappTemplate,
              clinicNameState: cur.clinicNameState,
              doctorTitleState: cur.doctorTitleState,
              patientIdPrefix: cur.patientIdPrefix,
              registrationRuleConfig: cur.registrationRuleConfig,
              tvConfigJson: cur.tvConfigJson || null
            });
            publishWithChunking([conn], stateTopic, fullPacket, clientSessionId.current);
          }

          // কানেক্টের সঙ্গে সঙ্গে নিজের TV সেটিংসও প্রকাশ — অন্য ডিভাইস তখনই আপডেট হবে
          try { publishTvSetToPeers(JSON.stringify(collectTvConfig())); } catch {}
        },
        onDisconnect: updateConnectedCount,
        onMessage: (topic, rawText) => {
          if (!isMounted || !rawText) return;
          try {
            if (topic === tvsetTopic) {
              const pkt = JSON.parse(rawText);
              if (pkt && pkt.action === 'TVSET' && pkt.senderId !== clientSessionId.current && typeof pkt.json === 'string') {
                const ts = Number(pkt.ts) || 0;
                if (ts > lastTvSetTsRef.current) {
                  lastTvSetTsRef.current = ts;
                  if (ts > logicalClockRef.current) logicalClockRef.current = ts;
                  try {
                    if (pkt.json !== JSON.stringify(collectTvConfig())) applyTvConfigParsed(JSON.parse(pkt.json));
                  } catch {}
                }
              }
            } else if (topic === stateTopic) {
              chunkAssembler.process(rawText);
            } else if (topic === cmdTopic) {
              const packet = JSON.parse(rawText);
              if (!packet || packet.senderId === clientSessionId.current) return;

              if (packet.action === 'REQUEST_SYNC') {
                if (hasLocalDataToShare()) {
                  const cur = latestStateRef.current;
                  const replyVer = getNextLogicalTime();
                  const replyPacket = JSON.stringify({
                    action: 'FULL_SYNC',
                    messageId: `${clientSessionId.current}-${replyVer}`,
                    updatedAt: replyVer,
                    senderId: clientSessionId.current,
                    senderName: currentUser?.name || 'স্টাফ',
                    patientsByDate: cur.patientsByDate,
                    patientIdDirectory: cur.patientIdDirectory,
                    deletedDates: cur.deletedDates,
                    deletedPatientIds: cur.deletedPatientIds || {},
                    teamMembers: cur.teamMembers,
                    chamberStartTime: cur.chamberStartTime,
                    avgServiceMinutes: cur.avgServiceMinutes,
                    whatsappTemplate: cur.whatsappTemplate,
                    clinicNameState: cur.clinicNameState,
                    doctorTitleState: cur.doctorTitleState,
                    patientIdPrefix: cur.patientIdPrefix,
                    registrationRuleConfig: cur.registrationRuleConfig,
                    tvConfigJson: cur.tvConfigJson || null
                  });
                  publishWithChunking(activeClients, stateTopic, replyPacket, clientSessionId.current);
                }
              } else if (packet.action === 'PING_TEST') {
                setSyncToast(`📱 "${packet.senderName || 'অন্য ডিভাইস'}" থেকে সিঙ্ক সিগন্যাল এসেছে!`);
                setTimeout(() => setSyncToast(''), 3500);
                try {
                  conn.publish(
                    cmdTopic,
                    JSON.stringify({
                      action: 'PONG_TEST',
                      senderId: clientSessionId.current,
                      senderName: currentUser?.name || 'স্টাফ',
                      time: Date.now()
                    })
                  );
                } catch {}
              } else if (packet.action === 'PONG_TEST') {
                setSyncToast(`⚡ "${packet.senderName || 'অন্য ডিভাইস'}" সাড়া দিয়েছে! লাইভ সংযুক্ত।`);
                setTimeout(() => setSyncToast(''), 4000);
              }
            }
          } catch (err) {
            console.warn('MQTT message error:', err);
          }
        }
      });
      activeClients.push(conn);
    });
    mqttClientsRef.current = activeClients;

    // হার্টবিট: প্রতি ৪৫ সেকেন্ডে নিজের TV সেটিংস প্রকাশ — যে ডিভাইস অফлайн ছিল/রিলোড হয়েছে
    // সেটি ৪৫ সেকেন্ডের মধ্যে সবার নতুনতম সেটিংস নিজে থেকেই টেনে নেবে (সমান কনটেন্ট হলে বাকিরা উপেক্ষা করে)
    const tvsetBeatId = setInterval(() => {
      try {
        if (isMounted) publishTvSetToPeers(JSON.stringify(collectTvConfig()));
      } catch {}
    }, 45000);

    let unsubscribeSnapshot = null;
    if (cloudUser && cloudSyncEnabled) {
      let latestRemoteTimestamp = 0;
      let hasLoadedSnapshot = false;
      const pollClinicState = async () => {
        try {
          const snapshot = await readClinicSnapshot(safeRoomKey);
          if (!isMounted) return;
          if (snapshot.payload && snapshot.updatedAt > latestRemoteTimestamp) {
            latestRemoteTimestamp = snapshot.updatedAt;
            applyIncomingSyncPayload(snapshot.payload, {
              allowSelf: true,
              forceApply: !hasLoadedSnapshot
            });
            hasLoadedSnapshot = true;
          }
          setConnectedBrokersCount(1);
          setSyncStatus('connected');
        } catch (err) {
          if (!isMounted) return;
          setConnectedBrokersCount(0);
          setSyncStatus('disconnected');
          console.error('Server-side clinic state read failed:', err);
        }
      };
      void pollClinicState();
      const pollId = setInterval(() => void pollClinicState(), 5000);
      unsubscribeSnapshot = () => clearInterval(pollId);
    } else {
      setConnectedBrokersCount(0);
      setSyncStatus('disconnected');
    }

    return () => {
      isMounted = false;
      clearInterval(tvsetBeatId);
      window.removeEventListener('storage', handleStorageChange);
      chunkAssembler.destroy();
      if (bc) {
        try { bc.close(); } catch {}
        bcRef.current = null;
      }
      activeClients.forEach((client) => {
        try { client.close(); } catch {}
      });
      mqttClientsRef.current = [];
      if (unsubscribeSnapshot) {
        try { unsubscribeSnapshot(); } catch {}
      }
    };
  }, [cloudSyncEnabled, cloudUser, syncChannelId, applyIncomingSyncPayload, getNextLogicalTime, currentUser]);

  const handleManualSyncRefresh = useCallback(async () => {
    setSyncStatus('syncing');
    const safeRoomKey = normalizeRoomKey(syncChannelId);
    if (!cloudSyncEnabled || !cloudUser) {
      setSyncStatus('disconnected');
      setSyncToast('ক্লাউড সিঙ্ক বন্ধ; তথ্য এই ডিভাইসেই আছে');
      setTimeout(() => setSyncToast(''), 3000);
      return;
    }

    try {
      const cloudState = await readClinicState(safeRoomKey);
      if (cloudState) applyIncomingSyncPayload(cloudState, { allowSelf: true, forceApply: true });
      setSyncStatus('connected');
    } catch (error) {
      console.error('Supabase manual refresh failed:', error);
      setSyncStatus('disconnected');
      setSyncToast('ক্লাউড ডেটা রিফ্রেশ করা যায়নি');
      return;
    }

    setSyncToast('✓ মোবাইল ও ওয়েব লাইভ সিঙ্ক সফলভাবে সম্পন্ন হয়েছে!');
    setTimeout(() => setSyncToast(''), 3000);
  }, [cloudSyncEnabled, cloudUser, syncChannelId, applyIncomingSyncPayload]);

  const updateDatePatientsList = (targetDate, newListForDate) => {
    try {
      queueUndoStackRef.current.push(JSON.stringify(patientsByDate));
      if (queueUndoStackRef.current.length > 30) queueUndoStackRef.current.shift();
    } catch {}
    const updatedMap = { ...patientsByDate, [targetDate]: newListForDate };
    setPatientsByDate(updatedMap);
    broadcastFullState(updatedMap, teamMembers, chamberStartTime, avgServiceMinutes, whatsappTemplate, patientIdDirectory, undefined, undefined, patientIdPrefix, deletedDates);
  };

  // Ctrl+Z — কিউ প্যানেলের শেষ অ্যাকশন ফিরিয়ে আনা
  const undoLastQueueAction = () => {
    const stack = queueUndoStackRef.current;
    if (!stack || stack.length === 0) {
      setSyncToast('↶ আন্ডু করার মতো কোনো অ্যাকশন নেই');
      setTimeout(() => setSyncToast(''), 2500);
      return false;
    }
    try {
      const snapshot = JSON.parse(stack.pop());
      setPatientsByDate(snapshot);
      broadcastFullState(snapshot, teamMembers, chamberStartTime, avgServiceMinutes, whatsappTemplate, patientIdDirectory, undefined, undefined, patientIdPrefix, deletedDates);
      setSyncToast('↶ শেষ অ্যাকশন আন্ডু হয়েছে');
      setTimeout(() => setSyncToast(''), 2500);
      return true;
    } catch {
      return false;
    }
  };

  const updateTeamList = (updatedTeam) => {
    setTeamMembers(updatedTeam);
    broadcastFullState(patientsByDate, updatedTeam, chamberStartTime, avgServiceMinutes, whatsappTemplate, patientIdDirectory, undefined, undefined, patientIdPrefix, deletedDates);
  };

  const toggleDateChamberStatus = useCallback((isoDate) => {
    setClosedDates(prev => {
      const isAlreadyClosed = prev.includes(isoDate);
      const nextClosed = isAlreadyClosed ? prev.filter(d => d !== isoDate) : [...prev, isoDate];
      try {
        localStorage.setItem('amh_closed_dates', JSON.stringify(nextClosed));
      } catch {}
      broadcastFullState(
        patientsByDate,
        teamMembers,
        chamberStartTime,
        avgServiceMinutes,
        whatsappTemplate,
        patientIdDirectory,
        undefined,
        undefined,
        patientIdPrefix,
        undefined,
        nextClosed
      );
      setSyncToast(isAlreadyClosed ? `✓ ${isoDate} চেম্বার খোলা (On) করা হয়েছে` : `🛑 ${isoDate} চেম্বার বন্ধ (Off) নির্ধারণ করা হয়েছে`);
      setTimeout(() => setSyncToast(''), 3000);
      return nextClosed;
    });
  }, [patientsByDate, teamMembers, chamberStartTime, avgServiceMinutes, whatsappTemplate, patientIdDirectory, patientIdPrefix, broadcastFullState]);

  const handleDeviceLogin = async (e) => {
    e.preventDefault();
    const member = teamMembers.find(m => m.id === loginUserId);
    if (!member) {
      setLoginError('সঠিক ইউজার নির্বাচন করুন!');
      return;
    }
    if (onCloudLogin) {
      if (!/^\d{8}$/.test(loginPassword)) {
        setLoginError('৮ অঙ্কের numeric password লিখুন।');
        return;
      }
      setLoginBusy(true);
      try {
        await onCloudLogin(loginPassword);
      } catch (error) {
        setLoginError(error instanceof Error ? error.message : 'নিরাপদ লগইন করা যায়নি।');
        setLoginBusy(false);
        return;
      }
      setLoginBusy(false);
    } else if (requireLoginPassword) {
      if (!loginPassword || member.pin !== loginPassword) {
        setLoginError('ভুল পাসওয়ার্ড / পিন কোড! সঠিক পাসওয়ার্ড দেওয়া আবশ্যক।');
        return;
      }
    }
    setCurrentUser(member);
    setIsAuthenticated(true);
    setLoginError('');
    setLoginPassword('');
    try {
      sessionStorage.setItem('amh_session_authenticated', 'true');
      localStorage.setItem('amh_login_day', localDateKey());
      localStorage.setItem('amh_remember_me', rememberMe ? '1' : '0');
    } catch {}
    persistActiveUserId(member.id);
    if (!member.isAdmin && activeTab === 'team') {
      setActiveTab('register');
    }
    // লগিনের পর আগে TV মোডে থাকলে সাধারণ প্যানেলে ফিরে আসবে (অ্যাডমিন/স্টাফ লগিনে TV নয়)
    if (activeTab === 'tv') {
      setActiveTab('queue');
    }
    // মোবাইল ভিউতে লগিন করার সময় হেডার মিনিমাইজ করে রাখা হবে
    if (typeof window !== 'undefined' && (window.innerWidth <= 768 || /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent))) {
      setIsHeaderMinimized(true);
    }
  };

  // লগআউট হ্যান্ডলার — সেশন মুছে ফেলা
  const handleLogout = async () => {
    setIsAuthenticated(false);
    setLoginPassword('');
    setLoginError('');
    // ট্যাব রিসেট — নাহলে 'tv' স্টেটে থেকে পরের লগিনে আবার TV মোডে ঢুকে যেত
    setActiveTab('register');
    persistActiveUserId(null); // লগআউটের পর রিফ্রেশ করলে আর এই অ্যাকাউন্টে ঢুকবে না
    try {
      sessionStorage.removeItem('amh_session_authenticated');
      localStorage.removeItem('amh_login_day');
      localStorage.setItem('amh_remember_me', '0');
    } catch {}
    setRememberMe(false);
    if (onCloudLogout) {
      try {
        await onCloudLogout();
      } catch (error) {
        console.error('Could not end the secure clinic session:', error);
        setLoginError('নিরাপদ সেশন বন্ধ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।');
      }
    }
  };

  // দিন বদলালে (রিমেম্বার মি বন্ধ থাকলে) স্বয়ংক্রিয়ভাবে লগইন স্ক্রিনে ফিরিয়ে দেয় — "প্রতিদিন একবার লগইন" নিয়ম বজায় রাখতে
  useEffect(() => {
    if (!isAuthenticated) return;
    const recheck = () => {
      try {
        if (localStorage.getItem('amh_remember_me') === '1') return;
        const loginDay = localStorage.getItem('amh_login_day');
        if (loginDay && loginDay !== localDateKey()) {
          setIsAuthenticated(false);
          sessionStorage.removeItem('amh_session_authenticated');
          if (onCloudLogout) void onCloudLogout();
        }
      } catch {}
    };
    const id = setInterval(recheck, 60000);
    const onVis = () => { if (!document.hidden) recheck(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [isAuthenticated, onCloudLogout]);

  // গেস্ট লগইন হ্যান্ডলার (পাসওয়ার্ড ছাড়া সিরিয়াল ও কিউ দেখার জন্য)
  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallPromptEvent(e); };
    const onInstalled = () => { setPwaInstalled(true); setInstallPromptEvent(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // নতুন ভার্সন এলে ছোট নোটিশ (প্রথম ইনস্টলে দেখায় না)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const hadController = Boolean(navigator.serviceWorker.controller);
    const onMessage = (e) => {
      if (e && e.data && e.data.type === 'AMH_SW_UPDATED' && hadController) setSwUpdateReady(true);
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, []);

  const handleInstallPwa = async () => {
    if (!installPromptEvent) return;
    try {
      installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      if (choice && choice.outcome === 'accepted') setPwaInstalled(true);
    } catch {}
    setInstallPromptEvent(null);
  };

  const handleGuestLogin = () => {
    setCurrentUser(GUEST_SESSION_USER);
    // গেস্টের আবেদনে মোবাইল নম্বর ও সময় বাধ্যতামূলক — ফর্মে ঘর দুটি খোলা রাখা হয়
    setOpenPhonePanel(true);
    setIsAuthenticated(true);
    setLoginError('');
    setLoginPassword('');
    setActiveTab('queue');
    persistActiveUserId(GUEST_SESSION_USER.id);
    try { sessionStorage.setItem('amh_session_authenticated', 'true'); localStorage.setItem('amh_login_day', localDateKey()); localStorage.setItem('amh_remember_me', rememberMe ? '1' : '0'); } catch {}
    if (typeof window !== 'undefined' && (window.innerWidth <= 768 || /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent))) {
      setIsHeaderMinimized(true);
    }
  };

  // TV MOOD লগইন হ্যান্ডলার (শুধুমাত্র লাইভ ডিসপ্লে প্যানেল দেখার জন্য)
  const handleTvModeLogin = () => {
    setCurrentUser(TV_SESSION_USER);
    setIsAuthenticated(true);
    setLoginError('');
    setLoginPassword('');
    setActiveTab('tv');
    persistActiveUserId(TV_SESSION_USER.id);
    try { sessionStorage.setItem('amh_session_authenticated', 'true'); localStorage.setItem('amh_login_day', localDateKey()); localStorage.setItem('amh_remember_me', rememberMe ? '1' : '0'); } catch {}
  };

  const executeAdminAction = (actionType, targetData) => {
    if (actionType === 'DELETE_DATE_HISTORY') {
      const targetDate = targetData;
      const previousEntries = patientsByDate[targetDate] || [];
      setLastDeletedDateBackup({ date: targetDate, patients: previousEntries });

      const delTs = getNextLogicalTime();
      const nextDeletedDates = { ...deletedDates, [targetDate]: delTs };
      setDeletedDates(nextDeletedDates);

      const updatedMap = { ...patientsByDate };
      delete updatedMap[targetDate];
      setPatientsByDate(updatedMap);
      broadcastFullState(updatedMap, teamMembers, chamberStartTime, avgServiceMinutes, whatsappTemplate, patientIdDirectory, undefined, undefined, patientIdPrefix, nextDeletedDates);
    } else if (actionType === 'EDIT_MEMBER') {
      const { id, name, role, pin } = targetData;
      const updated = teamMembers.map(m => (m.id === id ? { ...m, name, role, pin } : m));
      updateTeamList(updated);
      if (currentUser?.id === id) {
        const active = updated.find(m => m.id === id);
        if (active) setCurrentUser(active);
      }
      setEditingMember(null);
    } else if (actionType === 'DELETE_MEMBER') {
      const memberId = targetData;
      if (teamMembers.length <= 1) return;
      const updated = teamMembers.filter(m => m.id !== memberId);
      updateTeamList(updated);
      if (currentUser?.id === memberId) setCurrentUser(updated[0]);
      setEditingMember(null);
    }
  };

  const triggerAdminAction = (actionType, targetData, title, description) => {
    if (currentUser?.isAdmin) {
      executeAdminAction(actionType, targetData);
      return;
    }
    setAdminAuthModal({
      isOpen: true,
      actionType,
      targetData,
      title: title || 'অ্যাডমিন অনুমোদন আবশ্যক',
      description: description || 'এই কাজটি সম্পন্ন করতে অ্যাডমিন পাসওয়ার্ড দিন',
      error: '',
      passwordInput: ''
    });
  };

  const handleConfirmAdminAuth = (e) => {
    e.preventDefault();
    const adminUser = teamMembers.find(m => m.isAdmin) || { pin: ';' };
    if (adminAuthModal.passwordInput !== adminUser.pin && adminAuthModal.passwordInput !== ';') {
      setAdminAuthModal(prev => ({ ...prev, error: 'ভুল অ্যাডমিন পাসওয়ার্ড!' }));
      return;
    }
    executeAdminAction(adminAuthModal.actionType, adminAuthModal.targetData);
    setAdminAuthModal({
      isOpen: false,
      actionType: null,
      targetData: null,
      title: '',
      description: '',
      error: '',
      passwordInput: ''
    });
  };

  const handleRestoreDeletedData = () => {
    if (!lastDeletedDateBackup) return;
    const { date, patients: backupList } = lastDeletedDateBackup;
    const restoreTs = getNextLogicalTime();
    const restoredPatients = backupList.map(p => ({ ...p, updatedTimestamp: restoreTs }));
    const nextDeletedDates = { ...deletedDates };
    delete nextDeletedDates[date];
    setDeletedDates(nextDeletedDates);
    const updatedMap = { ...patientsByDate, [date]: restoredPatients };
    setPatientsByDate(updatedMap);
    broadcastFullState(updatedMap, teamMembers, chamberStartTime, avgServiceMinutes, whatsappTemplate, patientIdDirectory, undefined, undefined, patientIdPrefix, nextDeletedDates);
    setLastDeletedDateBackup(null);
  };

  const getProjectedCallTime = useCallback((patient, listForDate) => {
    if (patient.status !== 'WAITING') {
      if (patient.status === 'CALLED') return 'বর্তমানে ডাকা হচ্ছে';
      if (patient.status === 'COMPLETED') return 'সেবা সম্পন্ন';
      if (patient.status === 'ABSENT') return 'অনুপস্থিত';
      return 'স্থগিত / বাতিল';
    }

    const currentList = listForDate || [];
    const waitingSorted = currentList.filter(p => p.status === 'WAITING').sort((a, b) => a.serialNumber - b.serialNumber);
    const index = waitingSorted.findIndex(p => p.id === patient.id);
    // চেম্বারের ভিতরে (ডাকা হয়েছে) যতজন আছেন, প্রত্যেকের জন্য গড় সময় যোগ করে তারপর থেকে পরবর্তী রোগীর ডাক শুরু
    const calledCount = currentList.filter(p => p.status === 'CALLED').length;
    const waitMins = Math.max(0, calledCount + index) * avgServiceMinutes;

    let baseMs = Date.now();
    if (chamberStartTime) {
      const [h, m] = chamberStartTime.split(':').map(Number);
      const chamberDate = new Date();
      chamberDate.setHours(h || 16, m || 0, 0, 0);
      if (patient.appointmentDate !== TODAY_KEY || chamberDate.getTime() > baseMs) {
        baseMs = chamberDate.getTime();
      }
    }

    const projectedDate = new Date(baseMs + waitMins * 60000);
    const clockStr = projectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `সম্ভাব্য ডাক: ${clockStr} (~${toBengaliDigits(waitMins)} মিনিট)`;
  }, [avgServiceMinutes, chamberStartTime]);

  // TV তালিকার প্রতিটি রোগীর সম্ভাব্য ডাকের শুধু সময় (ঘড়ি) বের করা
  const getTvProjectedCallClock = useCallback((patient) => {
    const list = patientsByDate[queueSelectedDate || TODAY_KEY] || [];
    const waitingSorted = list.filter(p => p.status === 'WAITING').sort((a, b) => a.serialNumber - b.serialNumber);
    const index = waitingSorted.findIndex(p => p.id === patient.id);
    if (index < 0) return '';
    const calledCount = list.filter(p => p.status === 'CALLED').length;
    const waitMins = Math.max(0, calledCount + index) * avgServiceMinutes;

    let baseMs = Date.now();
    if (chamberStartTime) {
      const [h, m] = chamberStartTime.split(':').map(Number);
      const chamberDate = new Date();
      chamberDate.setHours(h || 16, m || 0, 0, 0);
      if (patient.appointmentDate !== TODAY_KEY || chamberDate.getTime() > baseMs) {
        baseMs = chamberDate.getTime();
      }
    }

    const clockStr = new Date(baseMs + waitMins * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return toBengaliDigits(clockStr);
  }, [patientsByDate, queueSelectedDate, avgServiceMinutes, chamberStartTime]);

  const buildPatientNotificationMessage = useCallback((patient, listForDate) => {
    if (!patient) return whatsappTemplate;

    const appDate = patient.appointmentDate || TODAY_KEY;
    const targetList = listForDate || patientsByDate[appDate] || [];
    
    // Look up if patient is in active queue
    const queuePatient = targetList.find(p => 
      (patient.patientCode && p.patientCode === patient.patientCode) ||
      (p.id && p.id === patient.id) ||
      (patient.phoneNumber && p.phoneNumber && p.phoneNumber === patient.phoneNumber)
    ) || patient;

    const dateLabel = formatDateToDDMMYYYY(appDate);
    const category = queuePatient.isChildUnder4 ? 'শিশু কোটা' : 'সাধারণ কোটা';
    
    const serialStr = queuePatient.serialNumber 
      ? toBengaliDigits(queuePatient.serialNumber) 
      : (patient.patientCode ? toBengaliDigits(patient.patientCode) : 'নিবন্ধিত');
      
    const estCall = queuePatient.serialNumber 
      ? getProjectedCallTime(queuePatient, targetList) 
      : 'চেম্বার সময়সূচী অনুযায়ী';

    let msg = whatsappTemplate;
    msg = msg.replace(/{patientName}/g, patient.name || '');
    msg = msg.replace(/{patientCode}/g, patient.patientCode || '');
    msg = msg.replace(/{serialNumber}/g, serialStr);
    msg = msg.replace(/{category}/g, category);
    msg = msg.replace(/{dateLabel}/g, dateLabel);
    msg = msg.replace(/{appointmentDate}/g, toBengaliDigits(appDate));
    msg = msg.replace(/{estCall}/g, estCall);
    const statusKey = String(queuePatient.status || '').toUpperCase();
    const statusLabel = statusKey === 'CALLED'
      ? 'ডাকা হয়েছে'
      : statusKey === 'COMPLETED'
      ? 'সেবা সম্পন্ন'
      : statusKey === 'WAITING'
      ? 'অপেক্ষমাণ'
      : 'নিবন্ধিত';
    msg = msg.replace(/{currentstatus}/gi, statusLabel);
    return msg;
  }, [upcomingSevenDays, getProjectedCallTime, patientsByDate, whatsappTemplate]);

  const handleSendWhatsApp = useCallback((patient, listForDate) => {
    if (!patient || !patient.phoneNumber) return;
    const normalizedPhone = normalizeBangladeshPhone(patient.phoneNumber);
    const targetPhone = normalizedPhone || ('880' + parseBengaliDigits(patient.phoneNumber).replace(/[^0-9]/g, '').replace(/^0+/, ''));
    const msg = buildPatientNotificationMessage(patient, listForDate);
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  }, [buildPatientNotificationMessage]);

  const allocateNextSerialByRule = useCallback((isUnderAgeGroup, targetDatePatients, blockedSerials) => {
    const blocked = blockedSerials instanceof Set
      ? blockedSerials
      : new Set((Array.isArray(blockedSerials) ? blockedSerials : []).map(n => Number(n) || 0));
    const rule = registrationRuleConfig || {
      enabled: true,
      ageLimitYears: 4,
      underAgeParity: 'EVEN',
      overAgeParity: 'ODD'
    };
    const usedSerials = (Array.isArray(targetDatePatients) ? targetDatePatients : [])
      .map(p => Number(p && p.serialNumber ? p.serialNumber : 0) || 0);
    const nextSequential = () => {
      const maxUsed = usedSerials.length > 0 ? Math.max(...usedSerials) : 0;
      let candidate = maxUsed >= 1 ? maxUsed + 1 : 1;
      while (blocked.has(candidate)) candidate += 1;
      return candidate;
    };
    if (!rule.enabled) return nextSequential();
    const targetParity = isUnderAgeGroup ? (rule.underAgeParity || 'EVEN') : (rule.overAgeParity || 'ODD');
    if (targetParity === 'SEQUENTIAL') return nextSequential();
    if (targetParity === 'EVEN') {
      const existingEven = usedSerials.filter(sn => sn > 0 && sn % 2 === 0);
      const maxEven = existingEven.length > 0 ? Math.max(...existingEven) : 0;
      let candidate = maxEven >= 2 ? maxEven + 2 : 2;
      while (blocked.has(candidate)) candidate += 2;
      return candidate;
    }
    const existingOdd = usedSerials.filter(sn => sn > 0 && sn % 2 !== 0);
    const maxOdd = existingOdd.length > 0 ? Math.max(...existingOdd) : -1;
    let candidate = maxOdd >= 1 ? maxOdd + 2 : 1;
    while (blocked.has(candidate)) candidate += 2;
    return candidate;
  }, [registrationRuleConfig]);

  const registrationRuleDescriptionText = useMemo(() => {
    const rule = registrationRuleConfig || {
      enabled: true,
      ageLimitYears: 4,
      underAgeParity: 'EVEN',
      overAgeParity: 'ODD',
      customRuleNotice: ''
    };
    if (rule.customRuleNotice && rule.customRuleNotice.trim()) {
      return rule.customRuleNotice.trim();
    }
    const ageBn = toBengaliDigits(rule.ageLimitYears ?? 4);
    if (!rule.enabled) {
      return `সকল বয়সের রোগীর জন্য ক্রমিক সংখ্যা (#১, #২, #৩...) অনুযায়ী সিরিয়াল বরাদ্দ হবে (শিশু কোটা সীমা: < ${ageBn} বছর)`;
    }
    const parityLabel = (p) => {
      if (p === 'EVEN') return 'জোড় সংখ্যা (#২, #৪...)';
      if (p === 'ODD') return 'বিজোড় সংখ্যা (#১, #৩...)';
      return 'ক্রমিক সংখ্যা (#১, #২, #৩...)';
    };
    return `বয়স ${ageBn} বছরের কম হলে ${parityLabel(rule.underAgeParity)}, ${ageBn} বছর বা তদূর্ধ্ব হলে ${parityLabel(rule.overAgeParity)} বরাদ্দ হবে`;
  }, [registrationRuleConfig]);

  const registrationRuleShortText = useMemo(() => {
    const rule = registrationRuleConfig || {
      enabled: true,
      ageLimitYears: 4,
      underAgeParity: 'EVEN',
      overAgeParity: 'ODD'
    };
    const shortParity = (p) => {
      if (p === 'EVEN') return 'জোড়';
      if (p === 'ODD') return 'বিজোড়';
      return 'ক্রমিক';
    };
    const ageBn = toBengaliDigits(rule.ageLimitYears ?? 4);
    if (!rule.enabled) return 'সাধারণ ক্রমিক (১, ২, ৩…)';
    return `শিশু (<${ageBn}): ${shortParity(rule.underAgeParity)} · সাধারণ (${ageBn}+): ${shortParity(rule.overAgeParity)}`;
  }, [registrationRuleConfig]);

  // ---- গেস্ট সিরিয়াল আবেদন: আবেদনের মুহূর্তে টোকেন বুকিং ----
  const blockedSerialsByDate = useMemo(() => {
    const map = new Map();
    (Array.isArray(pendingApplications) ? pendingApplications : []).forEach((a) => {
      if (!a || !a.appointmentDate) return;
      const serial = applicationSerialOf(a);
      if (!serial) return;
      if (!map.has(a.appointmentDate)) map.set(a.appointmentDate, new Set());
      map.get(a.appointmentDate).add(serial);
    });
    return map;
  }, [pendingApplications]);

  const blockedSerialsFor = useCallback(
    (dateKey) => blockedSerialsByDate.get(dateKey) || EMPTY_SERIAL_BLOCK,
    [blockedSerialsByDate]
  );

  // বাতিল/সরানো আবেদনের টোকেন কিউতে ফাঁকা থাকে — পরবর্তী রোগীকে সেই নম্বর দেওয়া হয় না
  const vacantSerialsByDate = useMemo(() => {
    const map = new Map();
    (Array.isArray(pendingApplications) ? pendingApplications : []).forEach((a) => {
      if (!isVacantApplication(a) || !a.appointmentDate) return;
      if (!map.has(a.appointmentDate)) map.set(a.appointmentDate, []);
      map.get(a.appointmentDate).push(applicationSerialOf(a));
    });
    map.forEach((list) => list.sort((x, y) => x - y));
    return map;
  }, [pendingApplications]);

  const visibleApplications = useMemo(() => {
    const list = (Array.isArray(pendingApplications) ? pendingApplications : []).filter(a => a && a.status !== 'DISMISSED');
    const rank = (a) => (a.status === 'PENDING' ? 0 : 1);
    return [...list].sort((a, b) => (rank(a) - rank(b)) || ((b.updatedTimestamp || 0) - (a.updatedTimestamp || 0)));
  }, [pendingApplications]);

  const pendingApplicationCount = useMemo(
    () => (Array.isArray(pendingApplications) ? pendingApplications : []).filter(a => a?.status === 'PENDING').length,
    [pendingApplications]
  );

  const guestOwnApplications = useMemo(() => {
    const key = normalizeBangladeshPhone(guestPhoneLookup);
    if (!key) return [];
    return (Array.isArray(pendingApplications) ? pendingApplications : [])
      .filter(a => a?.normalizedPhone === key && a.status !== 'DISMISSED')
      .sort((a, b) => (b.updatedTimestamp || 0) - (a.updatedTimestamp || 0));
  }, [pendingApplications, guestPhoneLookup]);

  const showGuestFormError = (message) => {
    setGuestFormError(message);
    setTimeout(() => setGuestFormError(''), 7000);
  };

  const broadcastApplications = (nextApps) => {
    broadcastFullState(
      undefined, undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined, undefined, undefined,
      nextApps
    );
  };

  // গেস্ট আবেদন জমা: সঠিক বাংলাদেশি মোবাইল নম্বর বাধ্যতামূলক; আবেদনের মুহূর্তের টোকেন বুক হয়
  const submitGuestApplication = () => {
    const normalized = normalizeBangladeshPhone(phoneNumber);
    if (!normalized) {
      setOpenPhonePanel(true);
      showGuestFormError('আবেদনের জন্য সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: ০১৭১২৩৪৫৬৭৮)।');
      setTimeout(() => phoneNumberInputRef.current?.focus(), 60);
      return false;
    }
    const targetDate = appointmentDate || TODAY_KEY;
    if (closedDates.includes(targetDate)) {
      setOpenDatePanel(true);
      showGuestFormError('নির্বাচিত তারিখে চেম্বার বন্ধ/ছুটি রয়েছে — অন্য তারিখ বেছে নিন।');
      return false;
    }
    const engY = Number(parseBengaliDigits(ageYears)) || 0;
    const engM = Number(parseBengaliDigits(ageMonths)) || 0;
    const engD = Number(parseBengaliDigits(ageDays)) || 0;
    const totalAge = engY + engM / 12 + engD / 365;
    const ruleAgeLimit = Number(registrationRuleConfig?.ageLimitYears ?? 4);
    const isChildUnder4 = totalAge < ruleAgeLimit;
    const targetDatePatients = patientsByDate[targetDate] || [];
    const stamp = getNextLogicalTime();
    // বর্তমান কিউ দেখে টোকেন বুক করা হয় — অনুমোদন না হলে এই নম্বরটি ফাঁকা থাকবে
    const reservedSerial = allocateNextSerialByRule(isChildUnder4, targetDatePatients, blockedSerialsFor(targetDate));

    const app = {
      id: `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'PENDING',
      name: patientName.trim(),
      ageYears: engY,
      ageMonths: engM,
      ageDays: engD,
      totalAge,
      isChildUnder4,
      appointmentDate: targetDate,
      reservedSerial,
      phoneNumber: phoneNumber.trim(),
      normalizedPhone: normalized,
      symptoms: symptoms.trim(),
      appliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      appliedAtTimestamp: stamp,
      updatedTimestamp: stamp,
      appliedByName: currentUser?.name || 'গেস্ট'
    };

    const nextApps = [app, ...(Array.isArray(pendingApplications) ? pendingApplications : [])].slice(0, 120);
    setPendingApplications(nextApps);
    try {
      localStorage.setItem('amh_guest_phone', phoneNumber.trim());
    } catch {}
    setGuestPhoneLookup(phoneNumber.trim());
    broadcastApplications(nextApps);

    setPatientName('');
    setPhoneNumber('');
    setSymptoms('');
    setAgeDays('০');
    setSyncToast(`✓ আবেদন পাঠানো হয়েছে — টোকেন #${toBengaliDigits(reservedSerial)} আপনার নামে বুক রইল; অনুমোদনের পর এটিই আপনার সিরিয়াল হবে।`);
    setTimeout(() => setSyncToast(''), 6000);
    setTimeout(() => { patientNameInputRef.current?.focus(); }, 60);
    return true;
  };

  const approveGuestApplication = (app) => {
    if (!app || app.status === 'APPROVED') return;
    if (currentUser?.isGuest || currentUser?.isTvMode) {
      showGuestFormError('শুধুমাত্র এডমিন/স্টাফ আবেদন অনুমোদন করতে পারবেন।');
      return;
    }
    const targetDate = app.appointmentDate || TODAY_KEY;
    if (closedDates.includes(targetDate)) {
      setSyncToast('✕ এই তারিখে চেম্বার বন্ধ — আগে তারিখ বদলান বা আবেদন বাতিল করুন।');
      setTimeout(() => setSyncToast(''), 4000);
      return;
    }

    const targetDatePatients = patientsByDate[targetDate] || [];
    const usedSerialSet = new Set(targetDatePatients.map(p => Number(p && p.serialNumber ? p.serialNumber : 0) || 0));
    const bookedSerial = applicationSerialOf(app);
    const serialTaken = bookedSerial > 0 && usedSerialSet.has(bookedSerial);
    const nextSerial = serialTaken
      ? allocateNextSerialByRule(app.isChildUnder4, targetDatePatients, blockedSerialsFor(targetDate))
      : bookedSerial;
    const stamp = getNextLogicalTime();
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nextNumber = String(allPatientIdRecords.length + 1).padStart(5, '0');
    const generatedPatientCode = `${patientIdPrefix || 'AMH'}-${nextNumber}`;
    const idRecord = {
      id: `PID-${Date.now()}`,
      patientCode: generatedPatientCode,
      name: app.name,
      ageYears: app.ageYears,
      ageMonths: app.ageMonths,
      ageDays: app.ageDays,
      totalAge: app.totalAge,
      isChildUnder4: app.isChildUnder4,
      phoneNumber: app.phoneNumber,
      bloodGroup: '',
      symptoms: app.symptoms || '',
      createdDate: targetDate,
      lastVisitDate: targetDate,
      registeredAt: timeFormatted,
      registeredTimestamp: stamp,
      updatedTimestamp: stamp,
      registeredByName: currentUser?.name || 'স্টাফ'
    };
    const nextDir = [idRecord, ...patientIdDirectory.filter(d => d.patientCode !== generatedPatientCode)];
    setPatientIdDirectory(nextDir);

    const newPatient = {
      id: `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientCode: generatedPatientCode,
      serialNumber: nextSerial,
      name: app.name,
      ageYears: app.ageYears,
      ageMonths: app.ageMonths,
      ageDays: app.ageDays,
      totalAge: app.totalAge,
      isChildUnder4: app.isChildUnder4,
      appointmentDate: targetDate,
      phoneNumber: app.phoneNumber,
      symptoms: app.symptoms || '',
      status: 'WAITING',
      applicationId: app.id,
      reservedSerial: nextSerial,
      registeredAt: timeFormatted,
      registeredTimestamp: stamp,
      updatedTimestamp: stamp,
      registeredByName: `${app.name} (গেস্ট আবেদন)`
    };

    const updatedMap = { ...patientsByDate, [targetDate]: [...targetDatePatients, newPatient] };
    setPatientsByDate(updatedMap);

    const nextApps = (Array.isArray(pendingApplications) ? pendingApplications : []).map(a =>
      a.id === app.id
        ? {
            ...a,
            status: 'APPROVED',
            reservedSerial: nextSerial,
            grantedSerial: nextSerial,
            grantedPatientId: newPatient.id,
            grantedPatientCode: generatedPatientCode,
            decidedByName: currentUser?.name || 'স্টাফ',
            decidedAt: timeFormatted,
            updatedTimestamp: getNextLogicalTime()
          }
        : a
    );
    setPendingApplications(nextApps);
    broadcastFullState(
      updatedMap, teamMembers, chamberStartTime, avgServiceMinutes, whatsappTemplate,
      nextDir, undefined, undefined, patientIdPrefix, deletedDates, undefined, undefined, nextApps
    );

    setSyncToast(serialTaken
      ? `✓ আবেদন অনুমোদিত — বুক টোকেন #${toBengaliDigits(bookedSerial)} ব্যবহৃত, তাই টোকেন #${toBengaliDigits(nextSerial)} বরাদ্দ (${app.name})`
      : `✓ আবেদন অনুমোদিত — টোকেন #${toBengaliDigits(nextSerial)} বরাদ্দ হয়েছে (${app.name})`);
    setTimeout(() => setSyncToast(''), 5500);
  };

  const rejectGuestApplication = (app, reason) => {
    if (!app || app.status === 'REJECTED') return;
    if (currentUser?.isGuest || currentUser?.isTvMode) return;
    const nextApps = (Array.isArray(pendingApplications) ? pendingApplications : []).map(a =>
      a.id === app.id
        ? {
            ...a,
            status: 'REJECTED',
            rejectReason: String(reason || '').trim() || 'অনুমোদন করা হয়নি',
            decidedByName: currentUser?.name || 'স্টাফ',
            decidedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            updatedTimestamp: getNextLogicalTime()
          }
        : a
    );
    setPendingApplications(nextApps);
    broadcastApplications(nextApps);
    setSyncToast(`✕ আবেদন বাতিল — টোকেন #${toBengaliDigits(applicationSerialOf(app))} ফাঁকা থাকবে (${app.name})`);
    setTimeout(() => setSyncToast(''), 5000);
  };

  const dismissGuestApplication = (app) => {
    if (!app || currentUser?.isGuest || currentUser?.isTvMode) return;
    const nextApps = (Array.isArray(pendingApplications) ? pendingApplications : []).map(a =>
      a.id === app.id ? { ...a, status: 'DISMISSED', updatedTimestamp: getNextLogicalTime() } : a
    );
    setPendingApplications(nextApps);
    broadcastApplications(nextApps);
    setSyncToast('আবেদনটি তালিকা থেকে সরানো হয়েছে');
    setTimeout(() => setSyncToast(''), 4000);
  };
  const handleRegisterPatient = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!patientName.trim() || isSubmitting) {
      if (!patientName.trim()) {
        patientNameInputRef.current?.focus();
      }
      return;
    }

    // গেস্ট সরাসরি সিরিয়াল নেয় না — আবেদন জমা হয়, অনুমোদনের পর সিরিয়াল বরাদ্দ হবে
    if (currentUser?.isGuest) {
      submitGuestApplication();
      return;
    }

    setIsSubmitting(true);
    const engY = Number(parseBengaliDigits(ageYears)) || 0;
    const engM = Number(parseBengaliDigits(ageMonths)) || 0;
    const engD = Number(parseBengaliDigits(ageDays)) || 0;
    const totalAge = engY + engM / 12 + engD / 365;
    const ruleAgeLimit = Number(registrationRuleConfig?.ageLimitYears ?? 4);
    const isChildUnder4 = totalAge < ruleAgeLimit;
    const targetDate = appointmentDate || TODAY_KEY;

    const targetDatePatients = patientsByDate[targetDate] || [];
    const nextSerial = allocateNextSerialByRule(isChildUnder4, targetDatePatients, blockedSerialsFor(targetDate));

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const hasPhone = Boolean(phoneNumber.trim());
    let generatedPatientCode = null;
    let nextDir = patientIdDirectory;

    if (hasPhone) {
      const nextNumber = String(allPatientIdRecords.length + 1).padStart(5, '0');
      generatedPatientCode = customPatientIdInput.trim() || `${patientIdPrefix || 'AMH'}-${nextNumber}`;

      const idRecord = {
        id: `PID-${Date.now()}`,
        patientCode: generatedPatientCode,
        name: patientName.trim(),
        ageYears: engY,
        ageMonths: engM,
        ageDays: engD,
        totalAge,
        isChildUnder4,
        phoneNumber: phoneNumber.trim(),
        bloodGroup: '',
        symptoms: symptoms.trim(),
        createdDate: targetDate,
        lastVisitDate: targetDate,
        registeredAt: timeFormatted,
        registeredTimestamp: getNextLogicalTime(),
        updatedTimestamp: getNextLogicalTime(),
        registeredByName: currentUser?.name || 'স্টাফ'
      };
      nextDir = [idRecord, ...patientIdDirectory.filter(d => d.patientCode !== generatedPatientCode)];
      setPatientIdDirectory(nextDir);
    }

    const regStamp = getNextLogicalTime();
    const newPatient = {
      id: `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientCode: generatedPatientCode,
      serialNumber: nextSerial,
      name: patientName.trim(),
      ageYears: engY,
      ageMonths: engM,
      ageDays: engD,
      totalAge,
      isChildUnder4,
      appointmentDate: targetDate,
      phoneNumber: phoneNumber.trim(),
      symptoms: symptoms.trim(),
      status: 'WAITING',
      registeredAt: timeFormatted,
      registeredTimestamp: regStamp,
      updatedTimestamp: regStamp,
      registeredByName: currentUser?.name || 'স্টাফ'
    };

    const updatedForDate = [...targetDatePatients, newPatient];
    const updatedMap = { ...patientsByDate, [targetDate]: updatedForDate };
    setPatientsByDate(updatedMap);
    broadcastFullState(
      updatedMap,
      teamMembers,
      chamberStartTime,
      avgServiceMinutes,
      whatsappTemplate,
      nextDir,
      undefined,
      undefined,
      patientIdPrefix
    );

    setPatientName('');
    setPhoneNumber('');
    setSymptoms('');
    setAgeDays('০');
    setCustomPatientIdInput('');
    setIsSubmitting(false);
    setTimeout(() => {
      patientNameInputRef.current?.focus();
    }, 50);
    setSyncToast(`✓ টোকেন #${toBengaliDigits(nextSerial)} (${newPatient.name}) এর সিরিয়াল নিশ্চিত হয়েছে!`);
    setTimeout(() => setSyncToast(''), 4000);
  };

  // প্রতিটি নতুন "ডাকা হচ্ছে" রোগীর জন্য বিপ — যে ডিভাইস ডাকছে সেখানেও (টিভি বোর্ডের ইফেক্ট রিমোট ডাক সামলায়)।
  // একই ডিভাইসে দ্বৈত বিপ এড়াতে TV-ইফেক্টের কী-ট্র্যাকার আগেই সেট করা হয়।
  const notifyNewCallSound = (patient) => {
    try {
      if (!patient) return;
      tvLastCallKeyRef.current = `${patient.id}|${patient.updatedTimestamp || patient.calledAt || ''}`;
      if (tvSoundEnabled) playTvCallBeep();
    } catch {}
  };

  const handleCallNextPatient = () => {
    const listForSelectedDate = patientsByDate[queueSelectedDate] || [];
    const waitingPatients = listForSelectedDate.filter(p => p.status === 'WAITING');
    if (waitingPatients.length === 0) return;

    const sortedWaiting = [...waitingPatients].sort((a, b) => a.serialNumber - b.serialNumber);
    const nextPatient = sortedWaiting[0];
    const baseStamp = getNextLogicalTime();

    const updated = listForSelectedDate.map((p) => {
      if (p.id === nextPatient.id) {
        const prevTs = Number(p.updatedTimestamp || p.completedTimestamp || p.calledTimestamp || p.registeredTimestamp || 0);
        const nextTs = Math.max(baseStamp, prevTs + 1);
        logicalClockRef.current = Math.max(logicalClockRef.current, nextTs);
        return { ...p, status: 'CALLED', calledTimestamp: nextTs, updatedTimestamp: nextTs };
      }
      return p;
    });
    notifyNewCallSound(updated.find(p => p.id === nextPatient.id));
    updateDatePatientsList(queueSelectedDate, updated);
  };

  const handleCompleteAndCallNext = () => {
    const listForSelectedDate = patientsByDate[queueSelectedDate] || [];
    const waitingPatients = listForSelectedDate.filter(p => p.status === 'WAITING');
    const calledPatients = listForSelectedDate.filter(p => p.status === 'CALLED');

    if (waitingPatients.length === 0 && calledPatients.length === 0) return;

    let nextPatient = null;
    if (waitingPatients.length > 0) {
      const sortedWaiting = [...waitingPatients].sort((a, b) => a.serialNumber - b.serialNumber);
      nextPatient = sortedWaiting[0];
    }
    const baseStamp = getNextLogicalTime();

    const updated = listForSelectedDate.map((p) => {
      const prevTs = Number(p.updatedTimestamp || p.completedTimestamp || p.calledTimestamp || p.registeredTimestamp || 0);
      const nextTs = Math.max(baseStamp, prevTs + 1);
      if (p.status === 'CALLED') {
        logicalClockRef.current = Math.max(logicalClockRef.current, nextTs);
        return { ...p, status: 'COMPLETED', completedTimestamp: nextTs, updatedTimestamp: nextTs };
      }
      if (nextPatient && p.id === nextPatient.id) {
        logicalClockRef.current = Math.max(logicalClockRef.current, nextTs);
        return { ...p, status: 'CALLED', calledTimestamp: nextTs, updatedTimestamp: nextTs };
      }
      return p;
    });

    if (nextPatient) notifyNewCallSound(updated.find(p => p.id === nextPatient.id));
    updateDatePatientsList(queueSelectedDate, updated);
  };

  const handleUpdateStatus = (patientId, newStatus) => {
    const listForSelectedDate = patientsByDate[queueSelectedDate] || [];
    const baseStamp = getNextLogicalTime();
    const updated = listForSelectedDate.map((p) => {
      if (p.id === patientId) {
        const prevTs = Number(p.updatedTimestamp || p.completedTimestamp || p.calledTimestamp || p.registeredTimestamp || 0);
        const nextTs = Math.max(baseStamp, prevTs + 1);
        logicalClockRef.current = Math.max(logicalClockRef.current, nextTs);
        return { ...p, status: newStatus, updatedTimestamp: nextTs };
      }
      return p;
    });
    if (newStatus === 'CALLED') notifyNewCallSound(updated.find(p => p.id === patientId));
    updateDatePatientsList(queueSelectedDate, updated);
  };

  // "ভিতরে যান" — রোগী চেম্বারে প্রবেশ করেছে বলে চিহ্নিত করা (inChamber ফ্ল্যাগ টগল); স্ট্যাটাস অপরিবর্তিত থাকে,
  // ফলে রোগী মূল কিউতেও থাকে এবং TV-বোর্ডের "চেম্বারের ভিতরে যান" প্যানেলে নাম দেখায়। সিঙ্কের জন্য রোগী-অবজেক্টেই বসে।
  const toggleInChamber = (patientId) => {
    const listForSelectedDate = patientsByDate[queueSelectedDate] || [];
    const baseStamp = getNextLogicalTime();
    const updated = listForSelectedDate.map((p) => {
      if (p.id === patientId) {
        const prevTs = Number(p.updatedTimestamp || p.completedTimestamp || p.calledTimestamp || p.registeredTimestamp || 0);
        const nextTs = Math.max(baseStamp, prevTs + 1);
        logicalClockRef.current = Math.max(logicalClockRef.current, nextTs);
        return { ...p, inChamber: !p.inChamber, updatedTimestamp: nextTs };
      }
      return p;
    });
    updateDatePatientsList(queueSelectedDate, updated);
  };

  // ---- কিউ মাল্টি-মার্কিং ----
  const toggleMarkQueuePatient = useCallback((id) => {
    setMarkedQueueIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const clearMarkedQueue = useCallback(() => {
    setMarkedQueueIds(prev => (prev.size ? new Set() : prev));
  }, []);

  // একসাথে অনেককেই একটি স্ট্যাটাসে নেওয়া (একবার map + একবার setState/broadcast)
  const handleUpdateStatusBulk = (ids, newStatus) => {
    const idSet = new Set(ids);
    const listForSelectedDate = patientsByDate[queueSelectedDate] || [];
    const baseStamp = getNextLogicalTime();
    let bump = 0;
    const updated = listForSelectedDate.map((p) => {
      if (idSet.has(p.id) && p.status !== newStatus) {
        const prevTs = Number(p.updatedTimestamp || p.completedTimestamp || p.calledTimestamp || p.registeredTimestamp || 0);
        const nextTs = Math.max(baseStamp, prevTs + (++bump));
        logicalClockRef.current = Math.max(logicalClockRef.current, nextTs);
        return { ...p, status: newStatus, updatedTimestamp: nextTs };
      }
      return p;
    });
    if (newStatus === 'CALLED') {
      // বাল্ক ডাকে প্রতি নতুন কলড রোগীর জন্য বিপ (সর্বোচ্চ ৪টি, ধাপে ধাপে); ইফেক্ট-ডুপ এড়াতে সবার কী আগেই মার্ক
      const newly = updated.filter((p) => {
        if (!idSet.has(p.id) || p.status !== 'CALLED') return false;
        const orig = listForSelectedDate.find((o) => o.id === p.id);
        return orig && orig.status !== 'CALLED';
      });
      newly.forEach((p) => { try { tvLastCallKeyRef.current = `${p.id}|${p.updatedTimestamp || p.calledAt || ''}`; } catch {} });
      const top = newly.sort((a, b) => (b.updatedTimestamp || 0) - (a.updatedTimestamp || 0))[0];
      if (top) {
        if (tvSoundEnabled) playTvCallBeep();
        newly.slice(0, 4).forEach((p, i) => { if (p === top || i > 3) return; setTimeout(() => { if (tvSoundEnabled) playTvCallBeep(); }, (i + 1) * 800); });
      }
    }
    updateDatePatientsList(queueSelectedDate, updated);
  };

  // মার্কড থাকলে সব মার্কডে, নাহলে শুধু ক্লিক করা সারিতে অ্যাকশন প্রয়োগ
  const runQueueStatusAction = (newStatus, clickedId) => {
    const ids = markedQueueIds.size > 0 ? Array.from(markedQueueIds) : [clickedId];
    handleUpdateStatusBulk(ids, newStatus);
    if (markedQueueIds.size > 0) {
      clearMarkedQueue();
      const statusLabels = { COMPLETED: 'সেবা সম্পন্ন', CALLED: 'ডাকা', ABSENT: 'অনুপস্থিত', CANCELLED: 'বাতিল', WAITING: 'অপেক্ষমান' };
      setSyncToast(`✅ ${toBengaliDigits(ids.length)} জনকে "${statusLabels[newStatus] || newStatus}" করা হলো`);
      setTimeout(() => setSyncToast(''), 2600);
    }
  };

  // ডিলিট ক্লিক: মার্কড থাকলে সব মার্কড, নাহলে কেবল এটি — কনফার্ম মডাল দেখাবে
  const handleDeleteClick = (patient) => {
    const ids = markedQueueIds.size > 0 ? Array.from(markedQueueIds) : [patient.id];
    setQueueDeleteIds(ids);
    setQueueDeleteTarget(patient);
  };

  const activeQueuePatients = useMemo(() => {
    const sourceList = patientsByDate[queueSelectedDate] || [];
    let result = [...sourceList];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || String(p.serialNumber).includes(q) || (p.phoneNumber && p.phoneNumber.includes(q))
      );
    }

    if (filterStatus === 'CHILD') result = result.filter(p => p.isChildUnder4);
    else if (filterStatus === 'GENERAL') result = result.filter(p => !p.isChildUnder4);
    else if (filterStatus === 'WAITING') result = result.filter(p => p.status === 'WAITING');
    else if (filterStatus === 'CALLED') result = result.filter(p => p.status === 'CALLED');
    else if (filterStatus === 'COMPLETED') result = result.filter(p => p.status === 'COMPLETED');

    // মূল কিউ তালিকায় শুধু 'ডাকা হচ্ছে' (CALLED) ও 'পরবর্তী/অপেক্ষমান' (WAITING) থাকবে;
    // অনুপস্থিত / বাতিল / সেবা সম্পন্ন রোগীরা মূল তালিকা থেকে বাদ (তাদের আলাদা পপ-আপ প্যানেলে দেখা যায়)।
    // ডিলিট করা রোগী আগেই তালিকা থেকে স্থায়ীভাবে মুছে যায়, তাই এখানে আসে না।
    result = result.filter(p => p.status === 'WAITING' || p.status === 'CALLED');

    result.sort((a, b) => a.serialNumber - b.serialNumber);
    return result;
  }, [patientsByDate, queueSelectedDate, filterStatus, searchQuery]);

  const completedQueuePatients = useMemo(() => {
    const sourceList = patientsByDate[queueSelectedDate] || [];
    return [...sourceList]
      .filter((p) => p.status === 'COMPLETED')
      .sort((a, b) => a.serialNumber - b.serialNumber);
  }, [patientsByDate, queueSelectedDate]);

  const absentQueuePatients = useMemo(() => {
    const sourceList = patientsByDate[queueSelectedDate] || [];
    return [...sourceList]
      .filter((p) => p.status === 'ABSENT')
      .sort((a, b) => a.serialNumber - b.serialNumber);
  }, [patientsByDate, queueSelectedDate]);

  const cancelledQueuePatients = useMemo(() => {
    const sourceList = patientsByDate[queueSelectedDate] || [];
    return [...sourceList]
      .filter((p) => p.status === 'CANCELLED')
      .sort((a, b) => a.serialNumber - b.serialNumber);
  }, [patientsByDate, queueSelectedDate]);

  const deletedQueueRecords = useMemo(() => {
    const list = deletedRecords[queueSelectedDate];
    if (!Array.isArray(list)) return [];
    // যে রোগীর id বর্তমানে কিউতে সক্রিয় (ফেরত দেওয়া হয়েছে) তাকে ডিলিট-তালিকা থেকে বাদ দেওয়া হয়
    const liveIds = new Set((patientsByDate[queueSelectedDate] || []).map((p) => p && p.id));
    return list
      .filter((r) => r && r.id && !liveIds.has(r.id))
      .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  }, [deletedRecords, queueSelectedDate, patientsByDate]);

  // টোকেন লেবেল (A ও B লাইনে আলাদা ক্রম: ১-A, ২-A... ও ১-B, ২-B...) ও লাইভ "বর্তমান সিরিয়াল" (চেম্বারে-থাকা বাদে সামনের ক্রম)
  // A = সাধারণ (বড়) রোগী, B = শিশু রোগী। দুই ক্যাটাগরিই থাকলে তবেই A/B বসে; নাহলে শুধু ১,২,৩।
  const queueTokenInfo = useMemo(() => {
    const full = [...(patientsByDate[queueSelectedDate] || [])]
      .filter((p) => p && p.id)
      .sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0));
    const hasChild = full.some((p) => p.isChildUnder4);
    const hasGeneral = full.some((p) => !p.isChildUnder4);
    const showSuffix = hasChild && hasGeneral;
    const tokenLabelById = new Map();
    let aCount = 0;
    let bCount = 0;
    full.forEach((p) => {
      const isChild = p.isChildUnder4;
      if (isChild) bCount += 1; else aCount += 1;
      const num = isChild ? bCount : aCount;
      const letter = isChild ? 'B' : 'A';
      tokenLabelById.set(p.id, showSuffix ? `${toBengaliDigits(num)}-${letter}` : toBengaliDigits(num));
    });
    // লাইভ বর্তমান সিরিয়াল: শুধু WAITING রোগীদের ক্রম (ডাকা-হওয়া/চেম্বারে-থাকা বাদ)
    const currentSerialById = new Map();
    const waiting = full.filter((p) => p.status === 'WAITING');
    waiting.forEach((p, i) => { currentSerialById.set(p.id, toBengaliDigits(i + 1)); });
    return { tokenLabelById, currentSerialById, showSuffix };
  }, [patientsByDate, queueSelectedDate]);

  // অনুপস্থিত / বাতিল / ডিলিট — সাধারণ পপ-আপ তালিকা প্যানেল রেন্ডারার
  const renderQueueListPanel = ({ open, onClose, title, count, icon, accent, emptyText, rows }) => {
    if (!open || typeof document === 'undefined') return null;
    return createPortal(
      <div onClick={onClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 animate-fadeIn cursor-pointer" role="presentation">
        <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className={`${themeStyles.card} w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border-2 ${accent.border} shadow-2xl cursor-default overflow-hidden`}>
          <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-200/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm ${accent.chipBg}`}>{icon}</div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">{title}</h3>
                <p className="text-[11px] font-semibold text-slate-600">{formatDateToDDMMYYYY(queueSelectedDate)} • মোট {toBengaliDigits(count)} জন</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label={`${title} তালিকা বন্ধ করুন`} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0">✕</button>
          </div>
          <div className="p-3 sm:p-4 space-y-2 overflow-y-auto">
            {count === 0 ? (
              <div className={`p-8 text-center rounded-2xl border border-dashed ${accent.border} ${accent.softBg}`}>
                <p className="text-sm font-bold text-slate-600">{emptyText}</p>
              </div>
            ) : rows}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // কিউ ইনলাইন ভিউ: বেছে নেওয়া ট্যাব অনুযায়ী তালিকা পপ-আপ ছাড়াই নিচের লিস্টে দেখানো হয়
  const renderQueueViewList = () => {
    const emptyBox = (msg, tone) => (
      <div className={`p-8 text-center rounded-2xl border border-dashed ${tone}`}>
        <p className="text-sm font-bold text-slate-600">{msg}</p>
      </div>
    );

    if (queueView === 'absent') {
      if (absentQueuePatients.length === 0) return emptyBox('এই তারিখে কোনো অনুপস্থিত রোগী নেই', 'border-rose-300 bg-rose-50/50');
      return absentQueuePatients.map((patient) => (
        <div key={patient.id} className="rounded-2xl border border-rose-300 bg-rose-50/70 p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm">
              <span className="text-[9px] uppercase leading-none opacity-80">{"Token "}</span>
              <span className="text-sm leading-none mt-0.5">{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)}</span>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 truncate">{patient.name}</h4>
              <div className="text-[11px] font-semibold text-slate-600 flex flex-wrap gap-x-2"><span>{toBengaliDigits(patient.ageYears)}y {toBengaliDigits(patient.ageMonths)}m {toBengaliDigits(patient.ageDays || 0)}d</span>{patient.phoneNumber ? <span className="font-mono">{patient.phoneNumber}</span> : null}</div>
            </div>
          </div>
          <button type="button" onClick={() => handleUpdateStatus(patient.id, 'WAITING')} className="h-8 px-2.5 flex items-center gap-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border border-cyan-300 rounded-lg transition cursor-pointer shadow-xs text-[11px] font-black shrink-0" title="অপেক্ষমান তালিকায় ফিরিয়ে আনুন" aria-label={`${patient.name} কে অপেক্ষমান তালিকায় ফিরিয়ে আনুন`}><RotateCcw className="w-4 h-4 text-cyan-700" /> ফেরত</button>
        </div>
      ));
    }

    if (queueView === 'cancelled') {
      if (cancelledQueuePatients.length === 0) return emptyBox('এই তারিখে কোনো বাতিল রোগী নেই', 'border-amber-300 bg-amber-50/50');
      return cancelledQueuePatients.map((patient) => (
        <div key={patient.id} className="rounded-2xl border border-amber-300 bg-amber-50/70 p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm">
              <span className="text-[9px] uppercase leading-none opacity-80">{"Token "}</span>
              <span className="text-sm leading-none mt-0.5">{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)}</span>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 truncate">{patient.name}</h4>
              <div className="text-[11px] font-semibold text-slate-600 flex flex-wrap gap-x-2"><span>{toBengaliDigits(patient.ageYears)}y {toBengaliDigits(patient.ageMonths)}m {toBengaliDigits(patient.ageDays || 0)}d</span>{patient.phoneNumber ? <span className="font-mono">{patient.phoneNumber}</span> : null}</div>
            </div>
          </div>
          <button type="button" onClick={() => handleUpdateStatus(patient.id, 'WAITING')} className="h-8 px-2.5 flex items-center gap-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border border-cyan-300 rounded-lg transition cursor-pointer shadow-xs text-[11px] font-black shrink-0" title="অপেক্ষমান তালিকায় ফিরিয়ে আনুন" aria-label={`${patient.name} কে অপেক্ষমান তালিকায় ফিরিয়ে আনুন`}><RotateCcw className="w-4 h-4 text-cyan-700" /> ফেরত</button>
        </div>
      ));
    }

    if (queueView === 'deleted') {
      if (deletedQueueRecords.length === 0) return emptyBox('এখনো কোনো রোগী ডিলিট করা হয়নি', 'border-red-300 bg-red-50/50');
      return deletedQueueRecords.map((rec) => (
        <div key={rec.id} className="rounded-2xl border border-red-300 bg-red-50/70 p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm">
              <span className="text-[9px] uppercase leading-none opacity-80">{"Token "}</span>
              <span className="text-sm leading-none mt-0.5">{toLatinDigits(queueTokenInfo.tokenLabelById.get(rec.id) || `#${rec.serialNumber}`)}</span>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 truncate">{rec.name}</h4>
              <div className="text-[11px] font-semibold text-slate-600">ডিলিট: {rec.deletedAt ? new Date(rec.deletedAt).toLocaleString('bn-BD', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</div>
            </div>
          </div>
          <button type="button" onClick={() => handleRestoreDeletedRecord(rec)} className="h-8 px-2.5 flex items-center gap-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border border-cyan-300 rounded-lg transition cursor-pointer shadow-xs text-[11px] font-black shrink-0" title="কিউতে ফেরত আনুন" aria-label={`${rec.name} কে কিউতে ফেরত আনুন`}><RotateCcw className="w-4 h-4 text-cyan-700" /> ফেরত</button>
        </div>
      ));
    }

    if (queueView === 'completed') {
      if (completedQueuePatients.length === 0) return emptyBox('এই তারিখে কোনো সেবা সম্পন্ন রোগী নেই', 'border-emerald-300 bg-emerald-50/50');
      return completedQueuePatients.map((patient) => (
        <div key={patient.id} className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm">
              <span className="text-[9px] uppercase leading-none opacity-80">{"Token "}</span>
              <span className="text-sm leading-none mt-0.5">{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-black text-slate-900 truncate">{patient.name}</h4>
                {patient.patientCode && (
                  <span className="text-[10px] font-mono font-black bg-white text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded-md">ID: {patient.patientCode}</span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-slate-600 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                <span>{toBengaliDigits(patient.ageYears)}y {toBengaliDigits(patient.ageMonths)}m {toBengaliDigits(patient.ageDays || 0)}d</span>
                {patient.phoneNumber && <span className="font-mono">{patient.phoneNumber}</span>}
                <span>{patient.registeredAt}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0" role="group" aria-label={`${patient.name} এর অ্যাকশন`}>
            <button type="button" onClick={() => handleOpenEditQueuePatient(patient)} className="h-8 w-8 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 rounded-lg transition cursor-pointer shadow-2xs" title="রোগীর তথ্য সংশোধন করুন" aria-label={`${patient.name} এর তথ্য সংশোধন করুন`}><Edit2 className="w-4 h-4 text-amber-700" /></button>
            {patient.phoneNumber && (
              <button type="button" onClick={() => handleSendWhatsApp(patient, patientsByDate[queueSelectedDate] || [])} className="h-8 w-8 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded-lg transition cursor-pointer shadow-2xs" title={`WhatsApp বার্তা পাঠান (${patient.phoneNumber})`} aria-label={`${patient.name} কে WhatsApp বার্তা পাঠান`}><MessageCircle className="w-4 h-4 text-emerald-700" /></button>
            )}
            <button type="button" disabled className="h-8 w-8 flex items-center justify-center bg-emerald-700 text-white border border-emerald-800 rounded-lg cursor-not-allowed shadow-inner" title="ইতোমধ্যে সেবা সম্পন্ন" aria-label={`${patient.name} ইতোমধ্যে সেবা সম্পন্ন`}><CheckCircle className="w-4 h-4" /></button>
            <button type="button" onClick={() => handleUpdateStatus(patient.id, 'CALLED')} className="h-8 w-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300 rounded-lg transition cursor-pointer shadow-xs" title="পুনরায় ডাকুন (মূল কিউতে ফিরবে)" aria-label={`${patient.name} কে পুনরায় ডাকুন`}><PhoneForwarded className="w-4 h-4" /></button>
            <button type="button" onClick={() => handleUpdateStatus(patient.id, 'ABSENT')} className="h-8 w-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 rounded-lg transition cursor-pointer shadow-xs" title="অনুপস্থিত চিহ্নিত করুন" aria-label={`${patient.name} কে অনুপস্থিত চিহ্নিত করুন`}><UserX className="w-4 h-4" /></button>
            <button type="button" onClick={() => handleUpdateStatus(patient.id, 'CANCELLED')} className="h-8 w-8 flex items-center justify-center bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-lg transition cursor-pointer shadow-xs" title="বাতিল চিহ্নিত করুন" aria-label={`${patient.name} কে বাতিল চিহ্নিত করুন`}><XCircle className="w-4 h-4" /></button>
            <button type="button" onClick={() => handleUpdateStatus(patient.id, 'WAITING')} className="h-8 w-8 flex items-center justify-center bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border border-cyan-300 rounded-lg transition cursor-pointer shadow-xs" title="পুনরায় অপেক্ষমান তালিকায় ফিরিয়ে আনুন" aria-label={`${patient.name} কে অপেক্ষমান তালিকায় ফিরিয়ে আনুন`}><RotateCcw className="w-4 h-4 text-cyan-700" /></button>
          </div>
        </div>
      ));
    }

    if (queueView === 'all') {
      const sections = [
        { label: 'অনুপস্থিত', tone: 'text-rose-700 border-rose-300 bg-rose-50/70', list: absentQueuePatients },
        { label: 'বাতিল', tone: 'text-amber-700 border-amber-300 bg-amber-50/70', list: cancelledQueuePatients },
        { label: 'ডিলিট', tone: 'text-red-700 border-red-300 bg-red-50/70', list: deletedQueueRecords },
        { label: 'সেবা সম্পন্ন', tone: 'text-emerald-700 border-emerald-300 bg-emerald-50/70', list: completedQueuePatients },
      ];
      const total = sections.reduce((n, s) => n + s.list.length, 0);
      if (total === 0) return emptyBox('এই তারিখে কোনো অনুপস্থিত/বাতিল/ডিলিট/সেবা-সম্পন্ন রোগী নেই', 'border-violet-300 bg-violet-50/50');
      return (
        <div className="space-y-3">
          {sections.map((sec) => (
            <div key={sec.label}>
              <div className={`text-[11px] font-black mb-1 ${sec.tone.split(' ')[0]}`}>{sec.label} — {toBengaliDigits(sec.list.length)} জন</div>
              {sec.list.length === 0 ? (
                <p className="text-[11px] font-semibold text-slate-400 px-1">— নেই</p>
              ) : (
                sec.list.map((p) => (
                  <div key={sec.label + '-' + p.id} className={`rounded-xl border px-2.5 py-1.5 mb-1 flex items-center justify-between gap-2 ${sec.tone}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] font-black text-slate-700">{toLatinDigits(queueTokenInfo.tokenLabelById.get(p.id) || (p.serialNumber ? `#${p.serialNumber}` : '—'))}</span>
                      <span className="text-sm font-black text-slate-900 truncate">{p.name || '(রোগী)'}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">{p.ageYears != null ? `${toBengaliDigits(p.ageYears)}y` : ''}</span>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      );
    }

    // normal (সাধারণ)
    if (activeQueuePatients.length === 0) {
      return (
        <SpotlightCard>
          <div className={`${themeStyles.card} p-10 text-center space-y-2`}>
            <Users className="w-10 h-10 opacity-30 mx-auto" />
            <p className="text-sm font-bold opacity-70">
              {completedQueuePatients.length > 0 ? 'কিউতে কোনো সক্রিয় রোগী নেই — "সেবা সম্পন্ন" বোতামে চাপুন' : 'এই তারিখে কোনো রোগী তালিকাভুক্ত নেই'}
            </p>
          </div>
        </SpotlightCard>
      );
    }
    return activeQueuePatients.map((patient) => (
      <QueuePatientRow
        key={patient.id}
        patient={patient}
        isSelected={patient.id === selectedQueuePatientId}
        isMarked={markedQueueIds.has(patient.id)}
        hasMarks={markedQueueIds.size > 0}
        projectedCallTime={getProjectedCallTime(patient, activeQueuePatients)}
        isGuest={!!currentUser?.isGuest}
        isAdmin={!!currentUser?.isAdmin}
        themeStyles={themeStyles}
        actionsRef={queueRowActionsRef}
        registerCard={registerQueueCard}
        tokenLabel={queueTokenInfo.tokenLabelById.get(patient.id)}
        currentSerial={queueTokenInfo.currentSerialById.get(patient.id)}
      />
    ));
  };

  const selectedQueuePatient = useMemo(
    () => activeQueuePatients.find((p) => p.id === selectedQueuePatientId) || null,
    [activeQueuePatients, selectedQueuePatientId]
  );

  const reportDatePatients = useMemo(() => {
    return patientsByDate[reportSelectedDate] || [];
  }, [patientsByDate, reportSelectedDate]);

  // সার্চ ফিল্টার ছাড়া সম্পূর্ণ Patient ID তালিকা — নেভিগেশন ব্যাজে মোট সংখ্যা দেখানোর জন্য
  const allPatientIdCombined = useMemo(() => {
    const mapByCode = new Map();
    patientIdDirectory.forEach(entry => {
      const code = entry.patientCode || entry.id;
      mapByCode.set(code, {
        ...entry,
        patientCode: code
      });
    });
    Object.entries(patientsByDate).forEach(([dateKey, list]) => {
      if (!Array.isArray(list)) return;
      list.forEach((p) => {
        if (!p.patientCode) return;
        const existing = mapByCode.get(p.patientCode);
        mapByCode.set(p.patientCode, {
          ...existing,
          ...p,
          patientCode: p.patientCode,
          lastVisitDate: dateKey,
          lastSerialNumber: p.serialNumber
        });
      });
    });
    return Array.from(mapByCode.values());
  }, [patientsByDate, patientIdDirectory]);

  const patientIdTotalCount = allPatientIdCombined.length;

  const allPatientIdRecords = useMemo(() => {
    let combined = allPatientIdCombined;
    if (patientIdSearch.trim()) {
      const q = patientIdSearch.trim().toLowerCase();
      combined = combined.filter(
        item => (item.patientCode && item.patientCode.toLowerCase().includes(q)) ||
                (item.name && item.name.toLowerCase().includes(q)) ||
                (item.phoneNumber && item.phoneNumber.toLowerCase().includes(q)) ||
                (item.bloodGroup && item.bloodGroup.toLowerCase().includes(q))
      );
    }
    return [...combined].sort((a, b) => (b.registeredTimestamp || 0) - (a.registeredTimestamp || 0));
  }, [allPatientIdCombined, patientIdSearch]);

  // TV MOOD ডিসপ্লে ডাটা: বর্তমানে দেখা হচ্ছে, পরবর্তী রোগী, এবং পরবর্তী ১০ জনের তালিকা
  const tvCurrentCalledPatient = useMemo(() => {
    const list = patientsByDate[queueSelectedDate || TODAY_KEY] || [];
    const called = list.filter(p => p.status === 'CALLED');
    if (called.length === 0) return null;
    return [...called].sort((a, b) => Number(b.calledTimestamp || b.updatedTimestamp || 0) - Number(a.calledTimestamp || a.updatedTimestamp || 0))[0];
  }, [patientsByDate, queueSelectedDate]);

  const tvCalledPatientsSorted = useMemo(() => {
    const list = patientsByDate[queueSelectedDate || TODAY_KEY] || [];
    return list
      .filter((p) => p.status === 'CALLED')
      .sort((a, b) => Number(a.serialNumber) - Number(b.serialNumber));
  }, [patientsByDate, queueSelectedDate]);

  // বর্তমান চেম্বার প্যানেলের রোগীসংখ্যা অনুযায়ী ধাপে ধাপে টেক্সট/আইকনের সাইজ: ১=সর্বোচ্চ, ২=মাঝারি, ৩=সাধারণ, ৪+=তালিকা
  const tvCalledSize = (() => {
    const n = tvCalledPatientsSorted.length;
    const tier = n <= 1 ? 'max' : n === 2 ? 'mid' : n === 3 ? 'norm' : 'many';
    const isVert = tvLayoutMode === 'vertical';
    const map = {
      max:  { wrap: isVert ? 'flex flex-wrap content-center gap-2' : 'flex flex-col justify-center gap-4', pad:'py-3 sm:py-4', box:'w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32', label:'text-xs sm:text-base lg:text-lg', num:'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl', name:'text-3xl sm:text-4xl lg:text-5xl', age:'text-lg sm:text-xl lg:text-2xl', live:'text-base sm:text-lg lg:text-xl' },
      mid:  { wrap: isVert ? 'flex flex-wrap content-center gap-2' : 'flex flex-col justify-center gap-3', pad:'py-2.5 sm:py-3', box:'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24', label:'text-[11px] sm:text-sm lg:text-base', num:'text-2xl sm:text-3xl lg:text-4xl', name:'text-2xl sm:text-3xl lg:text-4xl', age:'text-base sm:text-lg lg:text-xl', live:'text-sm sm:text-base lg:text-lg' },
      norm: { wrap: isVert ? 'flex flex-wrap content-center gap-2' : 'flex flex-col justify-center gap-2', pad:'py-2', box:'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16', label:'text-[11px] sm:text-xs lg:text-sm', num:'text-xl sm:text-2xl lg:text-3xl', name:'text-xl sm:text-2xl lg:text-3xl', age:'text-sm sm:text-base lg:text-lg', live:'text-xs sm:text-base lg:text-lg' },
      many: { wrap:'flex flex-wrap content-stretch gap-1', pad: isVert ? 'py-1' : 'py-1', box: isVert ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] lg:w-[30px] lg:h-[30px]', label: isVert ? 'text-[10px] sm:text-[11px]' : 'text-[7px] sm:text-[8px] lg:text-[8px]', num: isVert ? 'text-xl sm:text-2xl' : 'text-[9px] sm:text-[11px] lg:text-xs', name: isVert ? 'text-2xl sm:text-3xl' : 'text-[9px] sm:text-[11px] lg:text-xs', age: isVert ? 'text-base sm:text-lg' : 'text-[7px] sm:text-[8px] lg:text-[9px]', live: isVert ? 'text-[7px]' : 'text-[7px] sm:text-[8px] lg:text-[9px]' },
    };
    return map[tier];
  })();

  const tvTenText = tvLayoutMode === 'vertical' ? { badge: 'w-8 h-8 text-[18px]', serial: 'text-[22px]', name: 'text-[22px]', sub: 'text-[16px]', proj: 'text-[16px]', align: 'text-right' } : { badge: 'w-8 h-8 text-base lg:text-lg', serial: 'text-lg sm:text-xl lg:text-2xl', name: 'text-base sm:text-lg lg:text-xl', sub: 'text-sm sm:text-base lg:text-lg', proj: 'text-sm sm:text-base lg:text-lg', align: 'text-left' };
  const tvWaitingPatientsList = useMemo(() => {
    const list = patientsByDate[queueSelectedDate || TODAY_KEY] || [];
    const waiting = list.filter(p => p.status === 'WAITING');
    return [...waiting].sort((a, b) => a.serialNumber - b.serialNumber);
  }, [patientsByDate, queueSelectedDate]);
  // স্বাগত স্ক্রিনের এক্সিট আইকন: বন্ধ করলে নতুন রোগী আসা পর্যন্ত পপআপ থাকবে না (তখন আবার রিসেট)
  const [tvWelcomeDismissed, setTvWelcomeDismissed] = useState(false);
  useEffect(() => { if (tvCalledPatientsSorted.length > 0 || tvWaitingPatientsList.length > 0) setTvWelcomeDismissed(false); }, [tvCalledPatientsSorted, tvWaitingPatientsList]);

  const tvNextPatient = useMemo(() => {
    return tvWaitingPatientsList.length > 0 ? tvWaitingPatientsList[0] : null;
  }, [tvWaitingPatientsList]);

  // "পরবর্তী ১০ জনের" তালিকা প্রতি নির্ধারিত বিরতিতে পরের ১০ জনে সরে যায়, শেষে আবার শুরুতে ফেরে।
  const [tvTenPage, setTvTenPage] = useState(0);
  // তালিকার প্রতি পাতায় ১০ জন দেখায়।
  const TV_TENLIST_PAGE_SIZE = 10;
  const tvTenPageSize = TV_TENLIST_PAGE_SIZE;
  useEffect(() => {
    if (activeTab !== 'tv' || !tvTenRotationEnabled) return;
    const id = setInterval(() => setTvTenPage((p) => p + 1), Math.max(3, tvTenRotationSeconds) * 1000);
    return () => clearInterval(id);
  }, [activeTab, tvTenRotationSeconds, tvTenRotationEnabled]);
  const tvUpcomingAll = useMemo(() => tvWaitingPatientsList.slice(1), [tvWaitingPatientsList]);
  const tvTenTotalPages = Math.max(1, Math.ceil(tvUpcomingAll.length / tvTenPageSize));
  const tvTenCurrentPage = tvTenPage % tvTenTotalPages;
  const tvTenStartIndex = tvTenCurrentPage * tvTenPageSize;
  const tvUpcomingTenPatients = useMemo(
    () => tvUpcomingAll.slice(tvTenStartIndex, tvTenStartIndex + tvTenPageSize),
    [tvUpcomingAll, tvTenStartIndex, tvTenPageSize]
  );

  // নতুন ডাকে বিপ ও/অথবা কণ্ঠ ঘোষণা (সেটিংসে চালু থাকলে)
  useEffect(() => {
    if ((!tvSoundEnabled && !tvVoice.enabled) || !isAuthenticated) return;
    if (activeTab !== 'tv' && !(currentUser?.isTvMode || currentUser?.role === 'tv')) return;
    const top = tvCalledPatientsSorted?.[0];
    const key = top ? `${top.id}|${top.updatedTimestamp || top.calledAt || ''}` : '';
    if (tvLastCallKeyRef.current === null) { tvLastCallKeyRef.current = key; return; }
    if (key && key !== tvLastCallKeyRef.current) {
      if (tvSoundEnabled) playTvCallBeep();
      if (tvVoice.enabled) speakTvCall(top);
    }
    tvLastCallKeyRef.current = key;
  }, [tvSoundEnabled, tvVoice, isAuthenticated, activeTab, currentUser, tvCalledPatientsSorted]);

  const tvAbsentPatients = useMemo(() => {
    const list = patientsByDate[queueSelectedDate || TODAY_KEY] || [];
    const absent = list.filter(p => p.status === 'ABSENT');
    return [...absent].sort((a, b) => a.serialNumber - b.serialNumber);
  }, [patientsByDate, queueSelectedDate]);

  // "চেম্বারের ভিতরে যান" প্যানেল: যাদের "ভিতরে যান" বাটন চাপা হয়েছে (inChamber), কিন্তু এখনও সেবা-সম্পন্ন/বাতিল/অনুপস্থিত নয়
  const tvInsidePatients = useMemo(() => {
    const list = patientsByDate[queueSelectedDate || TODAY_KEY] || [];
    const inside = list.filter(p => p.inChamber === true && p.status !== 'COMPLETED' && p.status !== 'CANCELLED' && p.status !== 'ABSENT');
    return [...inside].sort((a, b) => a.serialNumber - b.serialNumber);
  }, [patientsByDate, queueSelectedDate]);

  // —— TV-2 স্ক্রিন-ফিট: পুরো বোর্ড টিভির উচ্চতার (১০৮p) ভেতরেই বসবে — লম্বা হলে স্বয়ংক্রিয়ভাবে ছোট, স্ক্রল লাগবে না ——
  const tv2FitRef = useRef<HTMLDivElement | null>(null);
  const fitTv2ToScreen = useCallback(() => {
    const el = tv2FitRef.current;
    if (!el) return;
    // zoom=1-এ ফিরিয়ে মাপি না (তাতে পুরো বোর্ড প্রতিবার বড়→ছোট "লাফাত")।
    // বরং বর্তমান zoom থেকেই আসল উচ্চতা বের করি, আর ০.০১-এর বেশি বদল না হলে zoom ছুঁই না।
    const curZoom = parseFloat(el.style.zoom || '1') || 1;
    const rect = el.getBoundingClientRect();
    const naturalH = curZoom > 0 ? rect.height / curZoom : rect.height;
    const avail = (window.innerHeight || 1080) - rect.top;
    if (naturalH <= 0 || avail <= 0) return;
    let s = Math.min(1, avail / naturalH);
    if (Math.abs(s - 1) < 0.01) s = 1;
    if (Math.abs(s - curZoom) > 0.01) el.style.zoom = String(s);
  }, []);
  useLayoutEffect(() => {
    if (activeTab === 'tv' && tvVariant === 2) fitTv2ToScreen();
  }, [activeTab, tvVariant, fitTv2ToScreen, tvBoardsConfig, tvCalledPatientsSorted.length, tvUpcomingTenPatients.length, tvAbsentPatients.length, tvRotationDeg]);
  useEffect(() => {
    const onResize = () => { if (activeTab === 'tv' && tvVariant === 2) fitTv2ToScreen(); };
    window.addEventListener('resize', onResize);
    const iv = setInterval(() => { if (activeTab === 'tv' && tvVariant === 2) fitTv2ToScreen(); }, 2000); // লেআউট/ফন্ট বসার পর চূড়ান্ত ঠিক করা (hysteresis-এ ফ্ল্যাশ নেই)
    return () => { window.removeEventListener('resize', onResize); clearInterval(iv); };
  }, [activeTab, tvVariant, fitTv2ToScreen]);

  const todayPatientsList = patientsByDate[TODAY_KEY] || [];
  const selectedDateAllList = patientsByDate[queueSelectedDate] || [];
  const selectedDateWaitingCount = selectedDateAllList.filter(p => p.status === 'WAITING').length;
  const selectedDateCalledCount = selectedDateAllList.filter(p => p.status === 'CALLED').length;

  const todayWaitingCount = todayPatientsList.filter(p => p.status === 'WAITING').length;
  const todayCalledCount = todayPatientsList.filter(p => p.status === 'CALLED').length;
  const activeLiveQueueCount = (queueSelectedDate && queueSelectedDate !== TODAY_KEY)
    ? (selectedDateCalledCount + selectedDateWaitingCount)
    : (todayCalledCount + todayWaitingCount);

  // রিপোর্ট ট্যাবের সংক্ষিপ্ত সারসংক্ষেপ (রেন্ডারেই হিসাব হয়, যাতে কার্ডের সংখ্যার সঙ্গে সবসময় মেলে)
  const reportCompactList = patientsByDate[reportSelectedDate] || [];
  const reportCompactStats = useMemo(() => {
    const list = reportCompactList;
    const total = list.length;
    const waiting = list.filter(p => p.status === 'WAITING').length;
    const called = list.filter(p => p.status === 'CALLED').length;
    const completed = list.filter(p => p.status === 'COMPLETED').length;
    const child = list.filter(p => p.isChildUnder4).length;
    return { list, total, waiting, called, completed, child, general: total - child };
  }, [reportCompactList]);

  const reportCompactListSorted = useMemo(
    () => [...reportCompactStats.list].sort((a, b) => (Number(a.serialNumber) || 0) - (Number(b.serialNumber) || 0)),
    [reportCompactStats.list]
  );

  const totalRegisteredCount = useMemo(
    () => Object.values(patientsByDate || {}).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0),
    [patientsByDate]
  );

  const handleCopyShareLink = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const url = `${origin}${pathname}?room=${syncChannelId}&user=laden`;
    const success = await safeCopyToClipboard(url);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    setIdFormDob(dobVal);
    if (dobVal) {
      const computed = calculateAgeFromDob(dobVal);
      if (computed) {
        setIdFormAgeYears(toBengaliDigits(computed.years));
        setIdFormAgeMonths(toBengaliDigits(computed.months));
        setIdFormAgeDays(toBengaliDigits(computed.days));
      }
    }
  };

  const handleCreatePatientIdRecord = (e) => {
    e.preventDefault();
    if (!idFormName.trim() || !idFormPhone.trim()) return;

    const dobAge = idFormDob ? calculateAgeFromDob(idFormDob) : null;
    const engY = dobAge ? dobAge.years : (Number(parseBengaliDigits(idFormAgeYears)) || 0);
    const engM = dobAge ? dobAge.months : (Number(parseBengaliDigits(idFormAgeMonths)) || 0);
    const engD = dobAge ? dobAge.days : (Number(parseBengaliDigits(idFormAgeDays)) || 0);
    const totalAge = engY + engM / 12 + engD / 365;
    const ruleAgeLimit = Number(registrationRuleConfig?.ageLimitYears ?? 4);
    const isChildUnder4 = totalAge < ruleAgeLimit;
    const nextNumber = String(allPatientIdRecords.length + 1).padStart(5, '0');
    const newCode = customPatientIdInput.trim() || `${patientIdPrefix || 'AMH'}-${nextNumber}`;
    const now = new Date();
    const regDate = idFormRegDate || TODAY_KEY;
    const record = {
      id: `PID-${Date.now()}`,
      patientCode: newCode,
      name: idFormName.trim(),
      dob: idFormDob || '',
      ageYears: engY,
      ageMonths: engM,
      ageDays: engD,
      totalAge,
      isChildUnder4,
      phoneNumber: idFormPhone.trim(),
      bloodGroup: idFormBloodGroup.trim(),
      symptoms: idFormNotes.trim(),
      createdDate: regDate,
      lastVisitDate: regDate,
      registeredAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      registeredTimestamp: getNextLogicalTime(),
      updatedTimestamp: getNextLogicalTime(),
      registeredByName: currentUser?.name || 'স্টাফ'
    };
    const nextDir = [record, ...patientIdDirectory];
    setPatientIdDirectory(nextDir);
    broadcastFullState(patientsByDate, teamMembers, chamberStartTime, avgServiceMinutes, whatsappTemplate, nextDir, undefined, undefined, patientIdPrefix);
    setIdFormName('');
    setIdFormPhone('');
    setIdFormDob('');
    setIdFormRegDate(TODAY_KEY);
    setIdFormBloodGroup('');
    setIdFormNotes('');
    setIdFormAgeYears('২৫');
    setIdFormAgeMonths('০');
    setIdFormAgeDays('০');
    setCustomPatientIdInput('');
    setSelectedIdCardPatient(record);
  };

  // Patient ID দিয়ে রোগী খুঁজে সরাসরি সিরিয়াল বুক করা
  const registerIdMatches = useMemo(() => {
    const q = registerIdSearch.trim().toLowerCase();
    if (!q) return [];
    return (Array.isArray(patientIdDirectory) ? patientIdDirectory : [])
      .filter(r => r && String(r.patientCode || '').toLowerCase().includes(q))
      .slice(0, 3);
  }, [registerIdSearch, patientIdDirectory]);

  const handleAddSerialWithDate = (record, chosenDate) => {
    if (!record) return;
    const targetDate = chosenDate || TODAY_KEY;
    const targetDatePatients = patientsByDate[targetDate] || [];
    const now = new Date();
    const adjAge = getRealtimeAdjustedAge(record);
    const calculatedTotalAge = adjAge.years + adjAge.months / 12 + adjAge.days / 365;
    const ruleAgeLimit = Number(registrationRuleConfig?.ageLimitYears ?? 4);
    const isChildUnder4Now = calculatedTotalAge < ruleAgeLimit;
    const nextSerial = allocateNextSerialByRule(isChildUnder4Now, targetDatePatients, blockedSerialsFor(targetDate));

    const newPatient = {
      id: `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientCode: record.patientCode,
      serialNumber: nextSerial,
      name: record.name,
      ageYears: adjAge.years,
      ageMonths: adjAge.months,
      ageDays: adjAge.days,
      totalAge: calculatedTotalAge,
      isChildUnder4: isChildUnder4Now,
      appointmentDate: targetDate,
      phoneNumber: record.phoneNumber || '',
      symptoms: record.symptoms || '',
      status: 'WAITING',
      registeredAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      registeredTimestamp: getNextLogicalTime(),
      updatedTimestamp: getNextLogicalTime(),
      registeredByName: currentUser?.name || 'স্টাফ'
    };
    updateDatePatientsList(targetDate, [...targetDatePatients, newPatient]);
    const dateLabel = formatDateToDDMMYYYY(targetDate);
    setQuickSerialToast(`✓ ${record.name} (${record.patientCode})-কে ${dateLabel} (${toBengaliDigits(targetDate)})-এর সিরিয়াল #${toBengaliDigits(nextSerial)}-এ নিবন্ধিত করা হয়েছে!`);
    setTimeout(() => setQuickSerialToast(''), 3500);
  };

  const handleBookSerialForRecord = (record) => {
    if (!record) return;
    // আগে তারিখ/নিশ্চিতকরণ প্যানেল খোলে — ID ও হেলথ কার্ড প্যানেলের মতোই
    setDateSelectPatient(record);
    setRegisterIdSearch('');
  };

  const handleUnlockAdminPanel = (e) => {
    e.preventDefault();
    const adminUser = teamMembers.find(m => m.isAdmin) || { pin: ';' };
    if (adminPanelUnlockPin.trim() === adminUser.pin || adminPanelUnlockPin.trim() === ';') {
      setAdminPanelUnlocked(true);
      setCurrentUser(adminUser);
      if (adminUser?.id) persistActiveUserId(adminUser.id);
      setAdminPanelUnlockPin('');
      setAdminPanelUnlockError('');
    } else {
      setAdminPanelUnlockError('ভুল অ্যাডমিন পিন / পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।');
    }
  };

  const handleOpenEditQueuePatient = (patient) => {
    setEditingQueuePatient(patient);
    setEditQueueName(patient.name || '');
    setEditQueueAgeYears(toBengaliDigits(patient.ageYears ?? 0));
    setEditQueueAgeMonths(toBengaliDigits(patient.ageMonths ?? 0));
    setEditQueueAgeDays(toBengaliDigits(patient.ageDays ?? 0));
    setEditQueuePhone(patient.phoneNumber || '');
    setEditQueueSymptoms(patient.symptoms || '');
    setEditQueueSerial(toBengaliDigits(patient.serialNumber || ''));
    setEditQueueDate(patient.appointmentDate || queueSelectedDate || TODAY_KEY);
    setEditQueueStatus(patient.status || 'WAITING');
    setEditQueueIsChild(Boolean(patient.isChildUnder4));
    setEditQueueAdminPin('');
    setEditQueueAdminError('');
  };

  const handleConfirmDeleteQueuePatient = () => {
    const target = queueDeleteTarget;
    if (!target) return;
    const ids = (queueDeleteIds && queueDeleteIds.length ? queueDeleteIds : [target.id]);
    const idSet = new Set(ids);
    const deleteTs = getNextLogicalTime();
    const nextTombstones = { ...deletedPatientIds };
    ids.forEach((id) => { nextTombstones[id] = deleteTs; });
    const nextList = (patientsByDate[queueSelectedDate] || []).filter((p) => !idSet.has(p.id));
    const updatedMap = { ...patientsByDate, [queueSelectedDate]: nextList };

    // "ডিলিট" প্যানেলের জন্য মুছে-যাওয়া রোগীর রেকর্ড সংরক্ষণ (ফেরত আনার সুবিধার্থে পূর্ণ রোগী-স্ন্যাপশটও রাখা হয়)
    const deletedNow = (patientsByDate[queueSelectedDate] || [])
      .filter((p) => idSet.has(p.id))
      .map((p) => ({ id: p.id, name: p.name, serialNumber: p.serialNumber, deletedAt: deleteTs, patient: p }));
    const prevRecords = Array.isArray(deletedRecords[queueSelectedDate]) ? deletedRecords[queueSelectedDate] : [];
    const recById = new Map(prevRecords.map((r) => [r.id, r]));
    deletedNow.forEach((r) => recById.set(r.id, r));
    const nextRecords = { ...deletedRecords, [queueSelectedDate]: Array.from(recById.values()).sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0)) };

    setDeletedPatientIds(nextTombstones);
    setDeletedRecords(nextRecords);
    setPatientsByDate(updatedMap);
    latestStateRef.current = {
      ...latestStateRef.current,
      patientsByDate: updatedMap,
      deletedPatientIds: nextTombstones,
      deletedRecords: nextRecords
    };
    broadcastFullState(updatedMap, teamMembers, chamberStartTime, avgServiceMinutes, whatsappTemplate, patientIdDirectory, undefined, undefined, patientIdPrefix, deletedDates);
    setQueueDeleteTarget(null);
    setQueueDeleteIds(null);
    clearMarkedQueue();
  };

  // ডিলিট-তালিকা থেকে রোগী ফেরত কিউতে আনা (একই id, নতুন updatedTimestamp → টম্বস্টন override হয়ে সিঙ্কে টিকে থাকে)
  const handleRestoreDeletedRecord = (rec) => {
    if (!rec || !rec.id) return;
    const date = queueSelectedDate;
    const list = Array.isArray(patientsByDate[date]) ? patientsByDate[date] : [];
    if (list.some((p) => p && p.id === rec.id)) {
      setSyncToast('এই রোগী ইতিমধ্যে কিউতে আছেন');
      setTimeout(() => setSyncToast(''), 2500);
      return;
    }
    const src = rec.patient || {};
    const stamp = getNextLogicalTime();
    const restored = {
      id: rec.id,
      patientCode: src.patientCode || rec.patientCode || '',
      serialNumber: Number(rec.serialNumber) || Number(src.serialNumber) || 1,
      name: rec.name || src.name || '',
      ageYears: Number(src.ageYears) || 0,
      ageMonths: Number(src.ageMonths) || 0,
      ageDays: Number(src.ageDays) || 0,
      totalAge: Number(src.totalAge) || 0,
      isChildUnder4: !!src.isChildUnder4,
      appointmentDate: date,
      phoneNumber: src.phoneNumber || '',
      symptoms: src.symptoms || '',
      status: 'WAITING',
      registeredAt: src.registeredAt || '',
      registeredTimestamp: Number(src.registeredTimestamp) || stamp,
      updatedTimestamp: stamp,
      registeredByName: src.registeredByName || (currentUser?.name || 'স্টাফ')
    };
    const nextList = [...list, restored].sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0));
    const updatedMap = { ...patientsByDate, [date]: nextList };
    setPatientsByDate(updatedMap);
    latestStateRef.current = { ...latestStateRef.current, patientsByDate: updatedMap };
    broadcastFullState(updatedMap, teamMembers, chamberStartTime, avgServiceMinutes, whatsappTemplate, patientIdDirectory, undefined, undefined, patientIdPrefix, deletedDates);
    setSyncToast(`✓ ${restored.name} কিউতে ফেরত আনা হয়েছে`);
    setTimeout(() => setSyncToast(''), 2600);
  };
  const handleConfirmDeletePatientIdRecord = () => {
    const target = idCardDeleteTarget;
    if (!target) return;
    const code = target.patientCode || target.id;
    if (!code) {
      setIdCardDeleteTarget(null);
      return;
    }
    const deleteTs = getNextLogicalTime();
    const nextTombstones = { ...(deletedPatientIds || {}) };
    const nextPatientsMap = {};
    Object.entries(patientsByDate || {}).forEach(([dateKey, list]) => {
      if (!Array.isArray(list)) {
        nextPatientsMap[dateKey] = list;
        return;
      }
      const kept = [];
      list.forEach((p) => {
        if (p && (p.patientCode || p.id) === code) {
          if (p.id) nextTombstones[p.id] = deleteTs;
        } else {
          kept.push(p);
        }
      });
      nextPatientsMap[dateKey] = kept;
    });
    const nextDir = (Array.isArray(patientIdDirectory) ? patientIdDirectory : []).filter(d => (d.patientCode || d.id) !== code);

    setDeletedPatientIds(nextTombstones);
    setPatientsByDate(nextPatientsMap);
    setPatientIdDirectory(nextDir);
    latestStateRef.current = {
      ...latestStateRef.current,
      patientsByDate: nextPatientsMap,
      patientIdDirectory: nextDir,
      deletedPatientIds: nextTombstones
    };
    broadcastFullState(nextPatientsMap, teamMembers, chamberStartTime, avgServiceMinutes, whatsappTemplate, nextDir, undefined, undefined, patientIdPrefix, deletedDates);
    setIdCardDeleteTarget(null);
  };

  // কিউ প্যানেলে ডিফল্টভাবে প্রথম রোগী নির্বাচিত থাকে; ফিল্টার/তারিখ বদলালে আবার প্রথমে ফিরে আসে
  useEffect(() => {
    if (activeTab !== 'queue') return;
    if (!activeQueuePatients.length) {
      if (selectedQueuePatientId !== null) setSelectedQueuePatientId(null);
      return;
    }
    if (!activeQueuePatients.some((p) => p.id === selectedQueuePatientId)) {
      setSelectedQueuePatientId(activeQueuePatients[0].id);
    }
  }, [activeTab, activeQueuePatients, selectedQueuePatientId]);

  const focusQueueCard = useCallback((patientId) => {
    if (typeof window === 'undefined') return;
    window.requestAnimationFrame(() => {
      const card = queueCardRefs.current.get(patientId);
      if (!card) return;
      card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      card.focus({ preventScroll: true });
    });
  }, []);

  const moveQueueSelection = useCallback((direction) => {
    if (!activeQueuePatients.length) return;
    const currentIndex = activeQueuePatients.findIndex((p) => p.id === selectedQueuePatientId);
    // র‍্যাপ নয় — প্রথম সারিতে ↑ চাপলে প্রথমেই থাকে, শেষ সারিতে ↓ চাপলে শেষেই থাকে (লাফিয়ে ৩০ নম্বরে যায় না)
    const nextIndex = currentIndex < 0
      ? (direction > 0 ? 0 : activeQueuePatients.length - 1)
      : Math.min(activeQueuePatients.length - 1, Math.max(0, currentIndex + direction));
    const next = activeQueuePatients[nextIndex];
    if (!next) return;
    setSelectedQueuePatientId(next.id);
    focusQueueCard(next.id);
  }, [activeQueuePatients, selectedQueuePatientId, focusQueueCard]);

  // ওয়েব ভিউ কিবোর্ড শর্টকাট: ^E এডিট, ^M WhatsApp, ^D রিকল, ^A অনুপস্থিত, ^K বাতিল, ^R রিডো, ^Space সেবা সম্পন্ন; ↑↓ রোগী নির্বাচন
  useEffect(() => {
    if (activeTab !== 'queue') return undefined;

    const isTypingTarget = (el) => {
      if (!el) return false;
      const tag = (el.tagName || '').toUpperCase();
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const handleQueueKeyboard = (event) => {
      const blocked = currentUser?.isGuest || editingQueuePatient || dateSelectPatient || adminAuthModal.isOpen || showQrModal ||
        selectedIdCardPatient || queueDeleteTarget || idCardDeleteTarget || completedPanelOpen || editingPatientIdRecord || selectAndAskMode || inlineEditMode ||
        annotationOpen || headerAskMenuOpen || exportMenuOpen || Boolean(selectedElementInfo);
      if (blocked || isTypingTarget(event.target)) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        event.preventDefault();
        moveQueueSelection(event.key === 'ArrowDown' ? 1 : -1);
        return;
      }

      if (!event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const shortcut = event.key === ' ' ? 'space' : event.key.toLowerCase();
    if (shortcut === 'z') { event.preventDefault(); undoLastQueueAction(); return; }
      if (!['e', 'm', 'd', 'a', 'k', 'r', 'space'].includes(shortcut)) return;

      const patient = selectedQueuePatient || activeQueuePatients[0];
      if (!patient) return;
      event.preventDefault();
      if (patient.id !== selectedQueuePatientId) setSelectedQueuePatientId(patient.id);

      switch (shortcut) {
        case 'e':
          handleOpenEditQueuePatient(patient);
          break;
        case 'm':
          if (patient.phoneNumber) handleSendWhatsApp(patient, activeQueuePatients);
          break;
        case 'space':
          if (patient.status !== 'COMPLETED') handleUpdateStatus(patient.id, 'COMPLETED');
          break;
        case 'd':
          if (patient.status !== 'CALLED') handleUpdateStatus(patient.id, 'CALLED');
          break;
        case 'a':
          if (patient.status !== 'ABSENT') handleUpdateStatus(patient.id, 'ABSENT');
          break;
        case 'k':
          if (patient.status !== 'CANCELLED') handleUpdateStatus(patient.id, 'CANCELLED');
          break;
        case 'r':
          if (patient.status !== 'WAITING') handleUpdateStatus(patient.id, 'WAITING');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleQueueKeyboard);
    return () => window.removeEventListener('keydown', handleQueueKeyboard);
  }, [
    activeTab,
    activeQueuePatients,
    selectedQueuePatient,
    selectedQueuePatientId,
    moveQueueSelection,
    currentUser?.isGuest,
    editingQueuePatient,
    dateSelectPatient,
    adminAuthModal.isOpen,
    showQrModal,
    selectedIdCardPatient,
    queueDeleteTarget,
    idCardDeleteTarget,
    completedPanelOpen,
    editingPatientIdRecord,
    selectAndAskMode,
    inlineEditMode,
    annotationOpen,
    headerAskMenuOpen,
    exportMenuOpen,
    selectedElementInfo
  ]);

  const handleSaveEditedQueuePatient = (e) => {
    e.preventDefault();
    if (!editingQueuePatient || !editQueueName.trim()) return;

    const engY = Number(parseBengaliDigits(editQueueAgeYears)) || 0;
    const engM = Number(parseBengaliDigits(editQueueAgeMonths)) || 0;
    const engD = Number(parseBengaliDigits(editQueueAgeDays)) || 0;
    const totalAge = engY + engM / 12 + engD / 365;
    const autoChild = totalAge < 4.0;
    const isChild = editQueueIsChild ?? autoChild;

    const parsedSerial = Number(parseBengaliDigits(editQueueSerial)) || editingQueuePatient.serialNumber || 1;
    const isSerialChanged = parsedSerial !== editingQueuePatient.serialNumber;

    if (isSerialChanged && !currentUser?.isAdmin) {
      const adminUser = teamMembers.find(m => m.isAdmin) || { pin: ';' };
      const isCorrectPin = (editQueueAdminPin.trim() === adminUser.pin || editQueueAdminPin.trim() === ';');
      if (!isCorrectPin) {
        setEditQueueAdminError('অ্যাডমিন সুরক্ষিত: সঠিক অ্যাডমিন পিন / পাসওয়ার্ড দিন।');
        return;
      }
    }

    const oldDate = editingQueuePatient.appointmentDate || queueSelectedDate || TODAY_KEY;
    const newDate = editQueueDate || oldDate;

    const updatedPatient = {
      ...editingQueuePatient,
      name: editQueueName.trim(),
      ageYears: engY,
      ageMonths: engM,
      ageDays: engD,
      totalAge,
      isChildUnder4: isChild,
      serialNumber: parsedSerial,
      appointmentDate: newDate,
      phoneNumber: editQueuePhone.trim(),
      symptoms: editQueueSymptoms.trim(),
      status: editQueueStatus,
      updatedTimestamp: getNextLogicalTime()
    };

    const updatedPatientsByDate = { ...patientsByDate };

    if (oldDate === newDate) {
      const currentList = updatedPatientsByDate[oldDate] || [];
      updatedPatientsByDate[oldDate] = currentList.map(p =>
        p.id === editingQueuePatient.id ? updatedPatient : p
      );
    } else {
      const oldList = (updatedPatientsByDate[oldDate] || []).filter(p => p.id !== editingQueuePatient.id);
      updatedPatientsByDate[oldDate] = oldList;
      const newList = [...(updatedPatientsByDate[newDate] || []), updatedPatient];
      updatedPatientsByDate[newDate] = newList;
    }

    setPatientsByDate(updatedPatientsByDate);

    if (editingQueuePatient.patientCode || editingQueuePatient.phoneNumber) {
      const updatedDir = patientIdDirectory.map(p => {
        if (
          (editingQueuePatient.patientCode && p.patientCode === editingQueuePatient.patientCode) ||
          p.id === editingQueuePatient.id ||
          (editingQueuePatient.phoneNumber && p.phoneNumber === editingQueuePatient.phoneNumber)
        ) {
          return {
            ...p,
            name: updatedPatient.name,
            ageYears: updatedPatient.ageYears,
            ageMonths: updatedPatient.ageMonths,
            ageDays: updatedPatient.ageDays,
            totalAge: updatedPatient.totalAge,
            isChildUnder4: updatedPatient.isChildUnder4,
            phoneNumber: updatedPatient.phoneNumber,
            symptoms: updatedPatient.symptoms,
            updatedTimestamp: getNextLogicalTime()
          };
        }
        return p;
      });
      setPatientIdDirectory(updatedDir);
    }

    broadcastFullState(
      updatedPatientsByDate,
      teamMembers,
      chamberStartTime,
      avgServiceMinutes,
      whatsappTemplate,
      patientIdDirectory,
      clinicNameState,
      doctorTitleState,
      patientIdPrefix,
      undefined,
      closedDates
    );

    setEditingQueuePatient(null);
    setQuickSerialToast(`✓ ${updatedPatient.name} (টোকেন #${toBengaliDigits(parsedSerial)})-এর তথ্য সফলভাবে সংশোধন করা হয়েছে!`);
    setTimeout(() => setQuickSerialToast(''), 3500);
  };

  const handleQuickAddSerialFromId = (record) => {
    setDateSelectPatient(record);
    setCustomSerialDate(TODAY_KEY);
  };

  const patientIdFileInputRef = useRef(null);
  const reportsFileInputRef = useRef(null);
  const [reportsExportMenuOpen, setReportsExportMenuOpen] = useState(false);

  const handleOpenEditPatientId = (rec) => {
    const adjAge = getRealtimeAdjustedAge(rec);
    setEditingPatientIdRecord(rec);
    setEditPidCode(rec.patientCode || '');
    setEditPidName(rec.name || '');
    setEditPidDob(rec.dob || '');
    setEditPidAgeYears(toBengaliDigits(adjAge.years));
    setEditPidAgeMonths(toBengaliDigits(adjAge.months));
    setEditPidAgeDays(toBengaliDigits(adjAge.days));
    setEditPidPhone(rec.phoneNumber || '');
    setEditPidBloodGroup(rec.bloodGroup || '');
    setEditPidNotes(rec.symptoms || '');
  };

  const handleEditPidDobChange = (e) => {
    const val = e.target.value;
    setEditPidDob(val);
    if (val) {
      const computed = calculateAgeFromDob(val);
      if (computed) {
        setEditPidAgeYears(toBengaliDigits(computed.years));
        setEditPidAgeMonths(toBengaliDigits(computed.months));
        setEditPidAgeDays(toBengaliDigits(computed.days));
      }
    }
  };

  const handleSaveEditedPatientId = (e) => {
    e.preventDefault();
    if (!editingPatientIdRecord || !editPidName.trim() || !editPidPhone.trim()) return;

    const newCode = (editPidCode.trim() || editingPatientIdRecord.patientCode).toUpperCase();
    const oldCode = editingPatientIdRecord.patientCode;

    const dobAge = editPidDob ? calculateAgeFromDob(editPidDob) : null;
    const engY = dobAge ? dobAge.years : (Number(parseBengaliDigits(editPidAgeYears)) || 0);
    const engM = dobAge ? dobAge.months : (Number(parseBengaliDigits(editPidAgeMonths)) || 0);
    const engD = dobAge ? dobAge.days : (Number(parseBengaliDigits(editPidAgeDays)) || 0);
    const totalAge = engY + engM / 12 + engD / 365;
    const ruleAgeLimit = Number(registrationRuleConfig?.ageLimitYears ?? 4);
    const isChildUnder4 = totalAge < ruleAgeLimit;

    const editStamp = getNextLogicalTime();
    const updatedRecord = {
      ...editingPatientIdRecord,
      patientCode: newCode,
      name: editPidName.trim(),
      dob: editPidDob || '',
      ageYears: engY,
      ageMonths: engM,
      ageDays: engD,
      totalAge,
      isChildUnder4,
      phoneNumber: editPidPhone.trim(),
      bloodGroup: editPidBloodGroup.trim(),
      symptoms: editPidNotes.trim(),
      updatedTimestamp: editStamp
    };

    const nextDir = patientIdDirectory.map(item =>
      (item.patientCode === oldCode || item.id === editingPatientIdRecord.id)
        ? updatedRecord
        : item
    );
    const existsInDir = nextDir.some(item => item.id === editingPatientIdRecord.id || item.patientCode === newCode);
    const finalDir = existsInDir ? nextDir : [updatedRecord, ...nextDir];

    setPatientIdDirectory(finalDir);

    const updatedPatientsByDate = {};
    Object.entries(patientsByDate).forEach(([dateKey, list]) => {
      if (Array.isArray(list)) {
        updatedPatientsByDate[dateKey] = list.map(p =>
          (p.patientCode === oldCode || (p.name === editingPatientIdRecord.name && p.phoneNumber === editingPatientIdRecord.phoneNumber))
            ? {
                ...p,
                patientCode: newCode,
                name: updatedRecord.name,
                ageYears: updatedRecord.ageYears,
                ageMonths: updatedRecord.ageMonths,
                ageDays: updatedRecord.ageDays,
                totalAge: updatedRecord.totalAge,
                isChildUnder4: updatedRecord.isChildUnder4,
                phoneNumber: updatedRecord.phoneNumber,
                symptoms: updatedRecord.symptoms
              }
            : p
        );
      } else {
        updatedPatientsByDate[dateKey] = list;
      }
    });
    setPatientsByDate(updatedPatientsByDate);

    broadcastFullState(
      updatedPatientsByDate,
      teamMembers,
      chamberStartTime,
      avgServiceMinutes,
      whatsappTemplate,
      finalDir,
      clinicNameState,
      doctorTitleState,
      patientIdPrefix,
      undefined,
      closedDates
    );

    setEditingPatientIdRecord(null);
    setPatientIdImportToast(`✓ Patient ID (${newCode}) তথ্য আপডেট হয়েছে!`);
    setTimeout(() => setPatientIdImportToast(''), 3500);
  };

  const handleTriggerReportsImport = () => {
    if (reportsFileInputRef.current) {
      reportsFileInputRef.current.value = '';
      reportsFileInputRef.current.click();
    }
  };

  const handleExportDayQueueCsv = (targetDate) => {
    const list = patientsByDate[targetDate] || [];
    if (list.length === 0) {
      setSyncToast(`⚠️ ${formatDateToDDMMYYYY(targetDate)} তারিখে কোনো রোগীর সিরিয়াল রেকর্ড নেই।`);
      setTimeout(() => setSyncToast(''), 3000);
      return;
    }
    const headers = ['টোকেন নম্বর', 'রোগীর নাম', 'বয়স (বছর)', 'বয়স (মাস)', 'বয়স (দিন)', 'ক্যাটাগরি', 'সিরিয়াল স্ট্যাটাস', 'মোবাইল নম্বর', 'সমস্যা/নোট', 'সময়', 'সিরিয়ালের তারিখ', 'Patient ID', 'এন্ট্রি প্রদানকারী'];
    const escapeCsv = (val) => {
      const str = String(val === undefined || val === null ? '' : val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const rows = list.map(p => [
      escapeCsv(p.serialNumber),
      escapeCsv(p.name || ''),
      escapeCsv(p.ageYears || 0),
      escapeCsv(p.ageMonths || 0),
      escapeCsv(p.ageDays || 0),
      escapeCsv(p.isChildUnder4 ? 'শিশু' : 'প্রাপ্তবয়স্ক'),
      escapeCsv(p.status || 'WAITING'),
      escapeCsv(p.phoneNumber || ''),
      escapeCsv(p.symptoms || ''),
      escapeCsv(p.registeredAt || ''),
      escapeCsv(p.appointmentDate || targetDate),
      escapeCsv(p.patientCode || ''),
      escapeCsv(p.registeredByName || '')
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AMH_Serials_${formatDateToDDMMYYYY(targetDate).replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSyncToast(`✓ ${formatDateToDDMMYYYY(targetDate)} তারিখের ${toBengaliDigits(list.length)}টি সিরিয়াল এক্সপোর্ট হয়েছে!`);
    setTimeout(() => setSyncToast(''), 3000);
  };

  const handleExportAllQueueCsv = () => {
    const allDates = Object.keys(patientsByDate);
    let allEntries = [];
    allDates.forEach(d => {
      const list = patientsByDate[d] || [];
      list.forEach(p => allEntries.push({ ...p, appointmentDate: p.appointmentDate || d }));
    });
    if (allEntries.length === 0) {
      setSyncToast('⚠️ এক্সপোর্ট করার মতো কোনো রোগীর সিরিয়াল রেকর্ড নেই।');
      setTimeout(() => setSyncToast(''), 3000);
      return;
    }
    allEntries.sort((a, b) => (b.registeredTimestamp || 0) - (a.registeredTimestamp || 0));
    const headers = ['টোকেন নম্বর', 'রোগীর নাম', 'বয়স (বছর)', 'বয়স (মাস)', 'বয়স (দিন)', 'ক্যাটাগরি', 'সিরিয়াল স্ট্যাটাস', 'মোবাইল নম্বর', 'সমস্যা/নোট', 'সময়', 'সিরিয়ালের তারিখ', 'Patient ID', 'এন্ট্রি প্রদানকারী'];
    const escapeCsv = (val) => {
      const str = String(val === undefined || val === null ? '' : val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const rows = allEntries.map(p => [
      escapeCsv(p.serialNumber),
      escapeCsv(p.name || ''),
      escapeCsv(p.ageYears || 0),
      escapeCsv(p.ageMonths || 0),
      escapeCsv(p.ageDays || 0),
      escapeCsv(p.isChildUnder4 ? 'শিশু' : 'প্রাপ্তবয়স্ক'),
      escapeCsv(p.status || 'WAITING'),
      escapeCsv(p.phoneNumber || ''),
      escapeCsv(p.symptoms || ''),
      escapeCsv(p.registeredAt || ''),
      escapeCsv(p.appointmentDate || TODAY_KEY),
      escapeCsv(p.patientCode || ''),
      escapeCsv(p.registeredByName || '')
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AMH_All_Serials_Backup_${formatDateToDDMMYYYY(new Date()).replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSyncToast(`✓ সর্বমোট ${toBengaliDigits(allEntries.length)}টি রোগীর সিরিয়াল এক্সপোর্ট হয়েছে!`);
    setTimeout(() => setSyncToast(''), 3000);
  };

  const handleExportFullClinicJson = () => {
    const dataToExport = {
      app: 'Ansari Medical Hall (AMH V4.0)',
      exportType: 'Full_Clinic_Database_Backup',
      exportDate: new Date().toISOString(),
      patientsByDate,
      patientIdDirectory,
      closedDates,
      teamMembers,
      patientIdPrefix,
      gDriveConfig: {
        webhookUrl: gDriveWebhookUrl,
        clientId: gDriveClientId,
        folderUrl: gDriveFolderUrl,
        folderId: gDriveFolderId,
        autoDownload: gDriveAutoDownloadEnabled,
        autoBackup: gDriveAutoBackupEnabled
      }
    };
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AMH_Full_Clinic_Backup_${formatDateToDDMMYYYY(new Date()).replace(/\//g, '-')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSyncToast('✓ সম্পূর্ণ ক্লিনিক ব্যাকআপ ফাইল (.json) ডাউনলোড হয়েছে!');
    setTimeout(() => setSyncToast(''), 3000);
  };

  // ==============================================================
  // GOOGLE DRIVE রিয়েল অথেন্টিকেশন, REST API আপলোড ও স্বয়ংক্রিয় (৩০ মিনিট পর পর) ব্যাকআপ ইঞ্জিন
  // ==============================================================
  const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var folderName = "AMH_Clinic_Backups";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    var raw = e.postData.contents;
    var parsed = JSON.parse(raw);
    var fileName = parsed.fileName || ("AMH_Full_Backup_" + new Date().toISOString().slice(0,10) + ".json");
    var existing = folder.getFilesByName("AMH_Latest_Auto_Backup.json");
    if (existing.hasNext()) {
      existing.next().setContent(raw);
    } else {
      folder.createFile("AMH_Latest_Auto_Backup.json", raw, MimeType.PLAIN_TEXT);
    }
    var file = folder.createFile(fileName, raw, MimeType.PLAIN_TEXT);
    return ContentService.createTextOutput(JSON.stringify({ status: "ok", fileId: file.getId(), url: file.getUrl() })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const [gDriveAutoBackupEnabled, setGDriveAutoBackupEnabled] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('amh_gdrive_auto_backup_enabled');
        return saved !== null ? JSON.parse(saved) : true;
      }
    } catch {}
    return true;
  });

  const [gDriveAutoDownloadEnabled, setGDriveAutoDownloadEnabled] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('amh_gdrive_auto_download');
        return saved !== null ? JSON.parse(saved) : false;
      }
    } catch {}
    return false;
  });

  const [gDriveClientId, setGDriveClientId] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('amh_gdrive_client_id') || DEFAULT_GDRIVE_CLIENT_ID;
      }
    } catch {}
    return DEFAULT_GDRIVE_CLIENT_ID;
  });

  const [gDriveAccessToken, setGDriveAccessToken] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('amh_gdrive_access_token') || DEFAULT_GDRIVE_ACCESS_TOKEN;
      }
    } catch {}
    return DEFAULT_GDRIVE_ACCESS_TOKEN;
  });

  const [gDriveUserEmail, setGDriveUserEmail] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('amh_gdrive_user_email') || '';
      }
    } catch {}
    return '';
  });

  const [gDriveWebhookUrl, setGDriveWebhookUrl] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('amh_gdrive_webhook_url') || DEFAULT_GDRIVE_WEBHOOK_URL;
      }
    } catch {}
    return DEFAULT_GDRIVE_WEBHOOK_URL;
  });

  const [gDriveFolderUrl, setGDriveFolderUrl] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('amh_gdrive_folder_url') || 'https://drive.google.com/drive/my-drive';
      }
    } catch {}
    return 'https://drive.google.com/drive/my-drive';
  });

  const [gDriveFolderId, setGDriveFolderId] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('amh_gdrive_folder_id') || '';
      }
    } catch {}
    return '';
  });

  const [gDriveConfigOpen, setGDriveConfigOpen] = useState(false);
  const [gDriveSyncing, setGDriveSyncing] = useState(false);
  const [gDriveAuthLoading, setGDriveAuthLoading] = useState(false);
  const [copiedScriptCode, setCopiedScriptCode] = useState(false);
  const [gDriveConfigSaveSuccess, setGDriveConfigSaveSuccess] = useState(false);

  const [gDriveBackupLogs, setGDriveBackupLogs] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('amh_gdrive_backup_logs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}
    return [];
  });

  const [gDriveLastBackupTime, setGDriveLastBackupTime] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return Number(localStorage.getItem('amh_gdrive_last_backup_ts')) || 0;
      }
    } catch {}
    return 0;
  });

  // যেকোনো পরিবর্তন সাথে সাথে ব্রাউজারে স্থায়ীভাবে সংরক্ষণ রাখা
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('amh_gdrive_webhook_url', gDriveWebhookUrl || '');
        localStorage.setItem('amh_gdrive_access_token', gDriveAccessToken || '');
        localStorage.setItem('amh_gdrive_client_id', gDriveClientId || '');
        localStorage.setItem('amh_gdrive_folder_url', gDriveFolderUrl || '');
        localStorage.setItem('amh_gdrive_folder_id', gDriveFolderId || '');
        localStorage.setItem('amh_gdrive_auto_download', JSON.stringify(Boolean(gDriveAutoDownloadEnabled)));
        localStorage.setItem('amh_gdrive_auto_backup_enabled', JSON.stringify(Boolean(gDriveAutoBackupEnabled)));
        localStorage.setItem(
          'amh_gdrive_full_config',
          JSON.stringify({
            webhookUrl: gDriveWebhookUrl || '',
            accessToken: gDriveAccessToken || '',
            clientId: gDriveClientId || '',
            folderUrl: gDriveFolderUrl || '',
            folderId: gDriveFolderId || '',
            autoDownload: Boolean(gDriveAutoDownloadEnabled),
            autoBackup: Boolean(gDriveAutoBackupEnabled),
            userEmail: gDriveUserEmail || ''
          })
        );
      }
    } catch {}
  }, [
    gDriveWebhookUrl,
    gDriveAccessToken,
    gDriveClientId,
    gDriveFolderUrl,
    gDriveFolderId,
    gDriveAutoDownloadEnabled,
    gDriveAutoBackupEnabled,
    gDriveUserEmail
  ]);

  // ক্লাউড (Firestore) থেকে পূর্বে সংরক্ষিত Google Drive কনফিগারেশন লোড করা (যেন ক্যাশ মুছলেও হারিয়ে না যায়)
  useEffect(() => {
    if (!db || !cloudUser) return;
    let isMounted = true;
    const loadCloudDriveConfig = async () => {
      try {
        const safeRoomKey = normalizeRoomKey(syncChannelId);
        const cfgRef = doc(db, 'artifacts', appId, 'public', 'data', 'clinic_gdrive_configs', safeRoomKey);
        const snap = await getDoc(cfgRef);
        if (isMounted && snap.exists()) {
          const d = snap.data();
          if (d.webhookUrl && !localStorage.getItem('amh_gdrive_webhook_url')) {
            setGDriveWebhookUrl(d.webhookUrl);
          }
          if (d.clientId && !localStorage.getItem('amh_gdrive_client_id')) {
            setGDriveClientId(d.clientId);
          }
          if (d.folderUrl && (!localStorage.getItem('amh_gdrive_folder_url') || localStorage.getItem('amh_gdrive_folder_url') === 'https://drive.google.com/drive/my-drive')) {
            setGDriveFolderUrl(d.folderUrl);
          }
          if (d.folderId && !localStorage.getItem('amh_gdrive_folder_id')) {
            setGDriveFolderId(d.folderId);
          }
          if (d.accessToken && !localStorage.getItem('amh_gdrive_access_token')) {
            setGDriveAccessToken(d.accessToken);
          }
        }
      } catch {}
    };
    loadCloudDriveConfig();
    return () => {
      isMounted = false;
    };
  }, [cloudUser, syncChannelId]);

  const handleSaveGDriveSettings = useCallback(async () => {
    const fId = extractDriveFolderId(gDriveFolderUrl) || gDriveFolderId;
    if (fId) setGDriveFolderId(fId);

    const configPayload = {
      webhookUrl: (gDriveWebhookUrl || '').trim(),
      accessToken: (gDriveAccessToken || '').trim(),
      clientId: (gDriveClientId || '').trim(),
      folderUrl: (gDriveFolderUrl || 'https://drive.google.com/drive/my-drive').trim(),
      folderId: fId || '',
      autoDownload: Boolean(gDriveAutoDownloadEnabled),
      autoBackup: Boolean(gDriveAutoBackupEnabled),
      userEmail: gDriveUserEmail || '',
      updatedAt: Date.now()
    };

    try {
      localStorage.setItem('amh_gdrive_webhook_url', configPayload.webhookUrl);
      localStorage.setItem('amh_gdrive_access_token', configPayload.accessToken);
      localStorage.setItem('amh_gdrive_client_id', configPayload.clientId);
      localStorage.setItem('amh_gdrive_folder_url', configPayload.folderUrl);
      localStorage.setItem('amh_gdrive_folder_id', configPayload.folderId);
      localStorage.setItem('amh_gdrive_auto_download', JSON.stringify(configPayload.autoDownload));
      localStorage.setItem('amh_gdrive_auto_backup_enabled', JSON.stringify(configPayload.autoBackup));
      localStorage.setItem('amh_gdrive_full_config', JSON.stringify(configPayload));
    } catch {}

    if (db && cloudUser) {
      try {
        const safeRoomKey = normalizeRoomKey(syncChannelId);
        const cfgRef = doc(db, 'artifacts', appId, 'public', 'data', 'clinic_gdrive_configs', safeRoomKey);
        await setDoc(cfgRef, configPayload, { merge: true });
      } catch {}
    }

    setGDriveConfigSaveSuccess(true);
    setTimeout(() => setGDriveConfigSaveSuccess(false), 3000);
    setSyncToast('✓ Google Drive সংযোগ ও অথেন্টিকেশন সেটআপ স্থায়ীভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSyncToast(''), 3500);
  }, [
    gDriveWebhookUrl,
    gDriveAccessToken,
    gDriveClientId,
    gDriveFolderUrl,
    gDriveFolderId,
    gDriveAutoDownloadEnabled,
    gDriveAutoBackupEnabled,
    gDriveUserEmail,
    cloudUser,
    syncChannelId
  ]);

  // অ্যাপের সকল পরিবর্তন (রোগীর সিরিয়াল, আইডি ডিরেক্টরি, টিম, রুলস, থিম, সময়, ড্রাইভ কনফিগ) স্বয়ংক্রিয়ভাবে ব্রাউজারে স্থায়ী সংরক্ষণ
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('amh_saved_team_members', JSON.stringify(teamMembers));
        localStorage.setItem('amh_chamber_start_time', chamberStartTime);
        localStorage.setItem('amh_avg_service_minutes', String(avgServiceMinutes));
        localStorage.setItem('amh_whatsapp_template', whatsappTemplate);
        localStorage.setItem('amh_clinic_name', clinicNameState);
        localStorage.setItem('amh_doctor_title', doctorTitleState);
        localStorage.setItem('amh_patient_id_prefix', patientIdPrefix);
        localStorage.setItem('amh_registration_rule_config', JSON.stringify(registrationRuleConfig));
        localStorage.setItem('amh_closed_dates', JSON.stringify(closedDates));
      }
    } catch {}
  }, [
    teamMembers,
    chamberStartTime,
    avgServiceMinutes,
    whatsappTemplate,
    clinicNameState,
    doctorTitleState,
    patientIdPrefix,
    registrationRuleConfig,
    closedDates
  ]);

  const handleSaveAllSystemChanges = useCallback(async () => {
    await handleSaveGDriveSettings();
    await broadcastFullState(
      patientsByDate,
      teamMembers,
      chamberStartTime,
      avgServiceMinutes,
      whatsappTemplate,
      patientIdDirectory,
      clinicNameState,
      doctorTitleState,
      patientIdPrefix,
      deletedDates,
      closedDates,
      registrationRuleConfig
    );
    setSyncToast('✓ ড্যাশবোর্ডের সকল পরিবর্তন ব্রাউজার ও ক্লাউডে স্থায়ীভাবে সেইভ হয়েছে!');
    setTimeout(() => setSyncToast(''), 3500);
  }, [
    handleSaveGDriveSettings,
    broadcastFullState,
    patientsByDate,
    teamMembers,
    chamberStartTime,
    avgServiceMinutes,
    whatsappTemplate,
    patientIdDirectory,
    clinicNameState,
    doctorTitleState,
    patientIdPrefix,
    deletedDates,
    closedDates,
    registrationRuleConfig
  ]);

  // Google Drive ফোল্ডার লিংক থেকে স্বয়ংক্রিয়ভাবে Folder ID বের করা
  const extractDriveFolderId = (urlOrId) => {
    if (!urlOrId) return '';
    const trimmed = urlOrId.trim();
    const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
    if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) return trimmed;
    return '';
  };

  // Google Identity Services (GIS) স্ক্রিপ্ট ডাইনামিক লোডার ও OAuth পপ-আপ অথেন্টিকেশন
  const handleAuthenticateGoogleDrive = useCallback(async () => {
    setGDriveAuthLoading(true);
    try {
      // পদ্ধতি ১: যদি ইউজার Google OAuth Client ID দিয়ে থাকেন তবে Google Identity Services (GIS) দিয়ে সরাসরি টোকেন নেওয়া
      if (gDriveClientId && gDriveClientId.trim().includes('.apps.googleusercontent.com')) {
        if (typeof window !== 'undefined' && !window.google?.accounts?.oauth2) {
          await new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript) {
              existingScript.addEventListener('load', resolve);
              existingScript.addEventListener('error', reject);
              return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (window.google?.accounts?.oauth2) {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: gDriveClientId.trim(),
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
            callback: async (tokenResponse) => {
              setGDriveAuthLoading(false);
              if (tokenResponse && tokenResponse.access_token) {
                const token = tokenResponse.access_token;
                const expiry = Date.now() + (Number(tokenResponse.expires_in || 3599) * 1000);
                setGDriveAccessToken(token);
                try {
                  localStorage.setItem('amh_gdrive_access_token', token);
                  localStorage.setItem('amh_gdrive_token_expiry', String(expiry));
                } catch {}

                // ইউজারের ইমেইল আনা
                try {
                  const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (infoRes.ok) {
                    const info = await infoRes.json();
                    if (info.email) {
                      setGDriveUserEmail(info.email);
                      try { localStorage.setItem('amh_gdrive_user_email', info.email); } catch {}
                    }
                  }
                } catch {}

                setSyncToast('✓ Google Drive অ্যাকাউন্ট সফলভাবে সংযুক্ত হয়েছে!');
                setTimeout(() => setSyncToast(''), 3500);
              } else {
                setSyncToast('⚠️ Google Drive অথেন্টিকেশন বাতিল হয়েছে।');
                setTimeout(() => setSyncToast(''), 3000);
              }
            }
          });
          tokenClient.requestAccessToken({ prompt: 'consent' });
          return;
        }
      }

      // পদ্ধতি ২: Firebase GoogleAuthProvider পপ-আপ দিয়ে সরাসরি Google Drive সাইন-ইন
      if (auth) {
        try {
          const provider = new GoogleAuthProvider();
          provider.addScope('https://www.googleapis.com/auth/drive.file');
          const result = await signInWithPopup(auth, provider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          const email = result?.user?.email || 'Google User';
          if (token) {
            const expiry = Date.now() + 3500 * 1000;
            setGDriveAccessToken(token);
            setGDriveUserEmail(email);
            try {
              localStorage.setItem('amh_gdrive_access_token', token);
              localStorage.setItem('amh_gdrive_token_expiry', String(expiry));
              localStorage.setItem('amh_gdrive_user_email', email);
            } catch {}
            setGDriveAuthLoading(false);
            setSyncToast(`✓ Google Drive সংযুক্ত হয়েছে (${email})!`);
            setTimeout(() => setSyncToast(''), 3500);
            return;
          }
        } catch (fbErr) {
          console.warn('Firebase Google popup notice:', fbErr);
        }
      }

      // পদ্ধতি ৩: যদি পপ-আপ ব্লক থাকে বা Client ID/Webhook না থাকে, তবে সেটিংস প্যানেল খুলে দেওয়া
      setGDriveAuthLoading(false);
      setGDriveConfigOpen(true);
      setSyncToast('⚙️ সরাসরি ড্রাইভে অটো-আপলোডের জন্য ওয়েবহুক লিংক বা Access Token/Client ID দিন');
      setTimeout(() => setSyncToast(''), 4000);
    } catch (err) {
      setGDriveAuthLoading(false);
      setGDriveConfigOpen(true);
      setSyncToast('⚠️ ব্রাউজার পপ-আপ ব্লক করেছে—সেটিংস থেকে ওয়েবহুক বা টোকেন সংযুক্ত করুন।');
      setTimeout(() => setSyncToast(''), 4000);
    }
  }, [gDriveClientId]);

  // সরাসরি Google Drive REST API v3 (Multipart Upload) দিয়ে ফাইল তৈরি বা আপডেট করা
  const uploadToGoogleDriveRestApi = async (token, fileName, jsonStr, targetFolderId) => {
    try {
      const metadata = {
        name: fileName,
        mimeType: 'application/json'
      };
      if (targetFolderId) {
        metadata.parents = [targetFolderId];
      }

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const multipartBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        jsonStr +
        closeDelim;

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (res.status === 401) {
        // টোকেন মেয়াদোত্তীর্ণ
        setGDriveAccessToken('');
        try { localStorage.removeItem('amh_gdrive_access_token'); } catch {}
        return { ok: false, expired: true };
      }

      if (res.ok) {
        const data = await res.json();
        return { ok: true, fileId: data.id, webViewLink: data.webViewLink };
      }
      return { ok: false };
    } catch (e) {
      console.warn('Google Drive REST API upload error:', e);
      return { ok: false };
    }
  };

  const performGoogleDriveFullBackup = useCallback(async (mode = 'MANUAL', forceDownloadFile = false) => {
    setGDriveSyncing(true);
    const cur = latestStateRef.current;
    const now = new Date();
    const nowTs = now.getTime();
    const dateStr = formatDateToDDMMYYYY(now);
    const safeDate = dateStr.replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fileName = `AMH_Full_Backup_${safeDate}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.json`;

    const allSerialEntries = [];
    Object.keys(cur.patientsByDate || {}).forEach((dKey) => {
      const arr = Array.isArray(cur.patientsByDate[dKey]) ? cur.patientsByDate[dKey] : [];
      arr.forEach((p) => allSerialEntries.push({ ...p, appointmentDate: p.appointmentDate || dKey }));
    });

    const totalSerialsCount = allSerialEntries.length;
    const totalDirectoryCount = Array.isArray(cur.patientIdDirectory) ? cur.patientIdDirectory.length : 0;

    // কমপ্যাক্ট CSV স্ট্রিং (যাতে ওয়েবহুক বা যেকোনো স্ক্রিপ্ট চাইলে সরাসরি Google Sheet বা CSV হিসেবেও পড়তে পারে)
    const csvRows = [
      ['টোকেন নম্বর', 'রোগীর নাম', 'বয়স (বছর)', 'বয়স (মাস)', 'বয়স (দিন)', 'ক্যাটাগরি', 'স্ট্যাটাস', 'মোবাইল নম্বর', 'সমস্যা/নোট', 'সময়', 'তারিখ', 'Patient ID'].join(','),
      ...allSerialEntries.map(p => [
        p.serialNumber || '',
        `"${String(p.name || '').replace(/"/g, '""')}"`,
        p.ageYears || 0,
        p.ageMonths || 0,
        p.ageDays || 0,
        p.isChildUnder4 ? 'শিশু' : 'প্রাপ্তবয়স্ক',
        p.status || 'WAITING',
        `"${String(p.phoneNumber || '')}"`,
        `"${String(p.symptoms || '').replace(/"/g, '""')}"`,
        `"${String(p.registeredAt || '')}"`,
        p.appointmentDate || TODAY_KEY,
        p.patientCode || ''
      ].join(','))
    ].join('\n');

    const fullBackupPayload = {
      app: 'Ansari Medical Hall (AMH V8.0)',
      fileName,
      backupSource: 'Google_Drive_Full_Backup_Engine',
      backupMode: mode === 'AUTO' ? 'স্বয়ংক্রিয় (৩০ মিনিট অন্তর)' : 'ম্যানুয়াল (সম্পূর্ণ ডাটা)',
      backupTimestamp: nowTs,
      backupDateISO: now.toISOString(),
      backupDateFormatted: `${dateStr} ${timeStr}`,
      roomCode: normalizeRoomKey(syncChannelId),
      clinicName: cur.clinicNameState,
      doctorTitle: cur.doctorTitleState,
      summary: {
        totalSerialsCount,
        totalPatientIdCount: totalDirectoryCount,
        totalDatesCount: Object.keys(cur.patientsByDate || {}).length
      },
      patientsByDate: cur.patientsByDate || {},
      allSerialsFlatList: allSerialEntries,
      patientIdDirectory: cur.patientIdDirectory || [],
      serialsCsvText: csvRows,
      closedDates: cur.closedDates || [],
      teamMembers: cur.teamMembers || [],
      patientIdPrefix: cur.patientIdPrefix || 'AMH',
      chamberStartTime: cur.chamberStartTime || '16:00',
      avgServiceMinutes: cur.avgServiceMinutes || 3,
      whatsappTemplate: cur.whatsappTemplate || '',
      registrationRuleConfig: cur.registrationRuleConfig || {}
    };

    const jsonStr = JSON.stringify(fullBackupPayload, null, 2);
    let driveUploaded = false;
    let cloudDelivered = false;
    let uploadedMethodLabel = '';

    // ১. যদি Google OAuth Access Token সংযুক্ত থাকে -> সরাসরি Google Drive REST API v3 তে ফাইল আপলোড
    if (gDriveAccessToken && gDriveAccessToken.trim()) {
      const folderId = extractDriveFolderId(gDriveFolderId || gDriveFolderUrl);
      const apiRes = await uploadToGoogleDriveRestApi(gDriveAccessToken.trim(), fileName, jsonStr, folderId);
      if (apiRes.ok) {
        driveUploaded = true;
        cloudDelivered = true;
        uploadedMethodLabel = 'Google Drive API';
      }
    }

    // ২. যদি Google Apps Script Webhook URL সংযুক্ত থাকে -> সরাসরি Google Drive ফোল্ডারে পোস্ট করা
    if (!driveUploaded && gDriveWebhookUrl && gDriveWebhookUrl.trim().startsWith('http')) {
      try {
        await fetch(gDriveWebhookUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: jsonStr
        });
        driveUploaded = true;
        cloudDelivered = true;
        uploadedMethodLabel = 'Drive Webhook';
      } catch (err) {
        console.warn('Google Drive Webhook sync notice:', err);
      }
    }

    // ৩. ক্লাউড ডাটাবেজ (Firestore) ও রিয়েল-টাইম MQTT ব্যাকআপ চ্যানেলে সংরক্ষণ
    if (db && cloudUser) {
      try {
        const safeRoomKey = normalizeRoomKey(syncChannelId);
        const backupDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'clinic_gdrive_backups', safeRoomKey);
        await setDoc(
          backupDocRef,
          {
            lastBackupAt: nowTs,
            lastBackupTimeText: `${dateStr} • ${timeStr}`,
            backupMode: mode,
            totalSerialsCount,
            totalDirectoryCount,
            backupPayloadJson: jsonStr
          },
          { merge: true }
        );
        cloudDelivered = true;
      } catch {}
    }

    // ৪. যদি সরাসরি ম্যানুয়াল ব্যাকআপ চাপেন এবং OAuth/Webhook সংযুক্ত না থাকে, অথবা Auto-Download চালু থাকে -> সরাসরি ডিভাইসে/ড্রাইভ সিঙ্ক ফোল্ডারে ফাইল সেভ করা
    const shouldDownloadFile =
      forceDownloadFile ||
      (mode === 'MANUAL' && !driveUploaded) ||
      (mode === 'AUTO' && gDriveAutoDownloadEnabled && !driveUploaded);

    if (shouldDownloadFile) {
      try {
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {}
    }

    // ৫. ব্রাউজার ও লোকাল স্ন্যাপশট লগে সংরক্ষণ (সর্বশেষ ১৫টি ব্যাকআপ স্ন্যাপশট)
    const logEntry = {
      id: `GDBK-${nowTs}`,
      timestamp: nowTs,
      dateText: dateStr,
      timeText: timeStr,
      mode: mode === 'AUTO' ? 'অটো (৩০ মি.)' : 'ম্যানুয়াল',
      serialsCount: totalSerialsCount,
      patientIdsCount: totalDirectoryCount,
      driveUploaded,
      methodLabel: uploadedMethodLabel || (shouldDownloadFile ? 'ফাইল কপি' : 'ক্লাউড স্ন্যাপশট'),
      cloudSynced: cloudDelivered,
      payload: fullBackupPayload
    };

    setGDriveBackupLogs((prev) => {
      const updated = [logEntry, ...prev].slice(0, 15);
      try {
        localStorage.setItem('amh_gdrive_backup_logs', JSON.stringify(updated));
        localStorage.setItem('amh_gdrive_latest_full_backup', jsonStr);
        localStorage.setItem('amh_gdrive_last_backup_ts', String(nowTs));
      } catch {}
      return updated;
    });

    setGDriveLastBackupTime(nowTs);
    setGDriveSyncing(false);

    if (driveUploaded) {
      setSyncToast(`☁️ Google Drive-এ সরাসরি ফাইল কপি সম্পন্ন (${toBengaliDigits(totalSerialsCount)} সিরিয়াল, ${toBengaliDigits(totalDirectoryCount)} ID)!`);
    } else if (shouldDownloadFile) {
      setSyncToast(`💾 সম্পূর্ণ ব্যাকআপ ফাইল (${fileName}) ডাউনলোড ও সংরক্ষিত হয়েছে!`);
    } else {
      setSyncToast(`✓ অটো-ব্যাকআপ সম্পন্ন (${toBengaliDigits(totalSerialsCount)} সিরিয়াল, ${toBengaliDigits(totalDirectoryCount)} ID)`);
    }
    setTimeout(() => setSyncToast(''), 4000);
  }, [syncChannelId, gDriveAccessToken, gDriveFolderId, gDriveFolderUrl, gDriveWebhookUrl, gDriveAutoDownloadEnabled, cloudUser]);

  // প্রতি ৩০ মিনিট (১৮,০০,০০০ মিলিসেকেন্ড) পর পর স্বয়ংক্রিয় Google Drive ব্যাকআপ টাইমার
  useEffect(() => {
    if (!gDriveAutoBackupEnabled) return;
    const THIRTY_MINUTES_MS = 30 * 60 * 1000;

    const now = Date.now();
    const cur = latestStateRef.current;
    const hasData =
      Object.values(cur.patientsByDate || {}).some((arr) => Array.isArray(arr) && arr.length > 0) ||
      (Array.isArray(cur.patientIdDirectory) && cur.patientIdDirectory.length > 0);

    if (hasData && (!gDriveLastBackupTime || now - gDriveLastBackupTime >= THIRTY_MINUTES_MS)) {
      performGoogleDriveFullBackup('AUTO', false);
    }

    const timerId = setInterval(() => {
      performGoogleDriveFullBackup('AUTO', false);
    }, THIRTY_MINUTES_MS);

    return () => clearInterval(timerId);
  }, [gDriveAutoBackupEnabled, gDriveLastBackupTime, performGoogleDriveFullBackup]);

  const handleRestoreFromGDriveLog = (logItem) => {
    if (!logItem || !logItem.payload) return;
    const p = logItem.payload;
    if (p.patientsByDate && typeof p.patientsByDate === 'object') {
      setPatientsByDate(p.patientsByDate);
    }
    if (Array.isArray(p.patientIdDirectory)) {
      setPatientIdDirectory(p.patientIdDirectory);
    }
    broadcastFullState(
      p.patientsByDate || patientsByDate,
      p.teamMembers || teamMembers,
      p.chamberStartTime || chamberStartTime,
      p.avgServiceMinutes || avgServiceMinutes,
      p.whatsappTemplate || whatsappTemplate,
      p.patientIdDirectory || patientIdDirectory,
      p.clinicName || clinicNameState,
      p.doctorTitle || doctorTitleState,
      p.patientIdPrefix || patientIdPrefix,
      deletedDates,
      p.closedDates || closedDates,
      p.registrationRuleConfig || registrationRuleConfig
    );
    setSyncToast(`✓ ${logItem.dateText} (${logItem.timeText})-এর ব্যাকআপ থেকে সম্পূর্ণ রোগীর তালিকা ও সিরিয়াল পুনরুদ্ধার হয়েছে!`);
    setTimeout(() => setSyncToast(''), 4000);
  };

  const handleProcessReportsImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text || typeof text !== 'string') return;

        if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
          const parsed = JSON.parse(text);
          let updatedPatients = { ...patientsByDate };
          let updatedDir = [...patientIdDirectory];

          if (parsed.patientsByDate && typeof parsed.patientsByDate === 'object') {
            Object.keys(parsed.patientsByDate).forEach(d => {
              const incomingList = parsed.patientsByDate[d] || [];
              const existingList = updatedPatients[d] || [];
              const mergedMap = new Map();
              existingList.forEach(p => mergedMap.set(p.id, p));
              incomingList.forEach(p => mergedMap.set(p.id, { ...(mergedMap.get(p.id) || {}), ...p }));
              updatedPatients[d] = Array.from(mergedMap.values());
            });
            setPatientsByDate(updatedPatients);
          }

          if (Array.isArray(parsed.patientIdDirectory)) {
            const dirMap = new Map();
            updatedDir.forEach(p => dirMap.set(p.patientCode || p.id, p));
            parsed.patientIdDirectory.forEach(p => dirMap.set(p.patientCode || p.id, { ...(dirMap.get(p.patientCode || p.id) || {}), ...p }));
            updatedDir = Array.from(dirMap.values());
            setPatientIdDirectory(updatedDir);
          }

          broadcastFullState(
            updatedPatients,
            teamMembers,
            chamberStartTime,
            avgServiceMinutes,
            whatsappTemplate,
            updatedDir,
            undefined,
            undefined,
            patientIdPrefix,
            deletedDates
          );

          setSyncToast('✓ সফলভাবে সম্পূর্ণ ডাটাবেজ ব্যাকআপ ইমপোর্ট ও সিঙ্ক হয়েছে!');
          setTimeout(() => setSyncToast(''), 4000);
          return;
        }

        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) throw new Error('ফাইলে কোনো ডাটা পাওয়া যায়নি');

        const headerLine = lines[0].toLowerCase();
        const dataRows = lines.slice(1);
        let importedCount = 0;

        if (headerLine.includes('টোকেন') || headerLine.includes('serial') || headerLine.includes('status')) {
          let updatedMap = { ...patientsByDate };
          dataRows.forEach((row, idx) => {
            const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (!cols[1]) return;
            const serialNum = parseInt(parseBengaliDigits(cols[0]), 10) || (idx + 1);
            const name = cols[1];
            const y = parseInt(parseBengaliDigits(cols[2]), 10) || 0;
            const m = parseInt(parseBengaliDigits(cols[3]), 10) || 0;
            const d = parseInt(parseBengaliDigits(cols[4]), 10) || 0;
            const status = ['WAITING', 'CALLED', 'COMPLETED', 'ABSENT', 'CANCELLED'].includes(cols[6]) ? cols[6] : 'WAITING';
            const phone = cols[7] || '';
            const sym = cols[8] || '';
            const time = cols[9] || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const targetDate = cols[10] || reportSelectedDate || TODAY_KEY;
            const code = cols[11] || '';

            const newPatient = {
              id: `PAT-IMP-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
              serialNumber: serialNum,
              name,
              ageYears: y,
              ageMonths: m,
              ageDays: d,
              totalAge: y + m / 12 + d / 365,
              isChildUnder4: (y + m / 12 + d / 365) < Number(registrationRuleConfig?.ageLimitYears ?? 4),
              status,
              phoneNumber: phone,
              symptoms: sym,
              registeredAt: time,
              appointmentDate: targetDate,
              patientCode: code,
              registeredByName: currentUser?.name || 'ইমপোর্ট',
              registeredTimestamp: Date.now()
            };

            const existingList = updatedMap[targetDate] || [];
            updatedMap[targetDate] = [...existingList, newPatient];
            importedCount++;
          });

          setPatientsByDate(updatedMap);
          broadcastFullState(
            updatedMap,
            teamMembers,
            chamberStartTime,
            avgServiceMinutes,
            whatsappTemplate,
            patientIdDirectory,
            undefined,
            undefined,
            patientIdPrefix,
            deletedDates
          );

          setSyncToast(`✓ সফলভাবে ${toBengaliDigits(importedCount)}টি রোগীর সিরিয়াল এন্ট্রি ইমপোর্ট হয়েছে!`);
          setTimeout(() => setSyncToast(''), 4000);
        } else {
          handleProcessImportedFile(e);
        }
      } catch (err) {
        setSyncToast(`⚠️ ফাইল ইমপোর্টে ত্রুটি: ${err.message}`);
        setTimeout(() => setSyncToast(''), 4000);
      }
    };
    reader.readAsText(file);
  };

    const handleTriggerPatientIdImport = () => {
    if (patientIdFileInputRef.current) {
      patientIdFileInputRef.current.value = '';
      patientIdFileInputRef.current.click();
    }
  };

  const handleExportPatientIdsCsv = () => {
    if (allPatientIdRecords.length === 0) {
      setPatientIdImportToast('⚠️ কোনো Patient ID রেকর্ড নেই।');
      setTimeout(() => setPatientIdImportToast(''), 3500);
      return;
    }
    const headers = ['Patient ID', 'রোগীর নাম', 'বয়স (বছর)', 'বয়স (মাস)', 'বয়স (দিন)', 'জন্ম তারিখ', 'মোবাইল নম্বর', 'রক্তের গ্রুপ', 'নোট', 'নিবন্ধন তারিখ'];
    const escapeCsv = (val) => {
      const str = String(val === undefined || val === null ? '' : val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = allPatientIdRecords.map(p => [
      escapeCsv(p.patientCode || p.id),
      escapeCsv(p.name || ''),
      escapeCsv(p.ageYears || 0),
      escapeCsv(p.ageMonths || 0),
      escapeCsv(p.ageDays || 0),
      escapeCsv(p.dob || ''),
      escapeCsv(p.phoneNumber || ''),
      escapeCsv(p.bloodGroup || ''),
      escapeCsv(p.symptoms || ''),
      escapeCsv(p.createdDate || TODAY_KEY)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AMH_Patient_IDs_${TODAY_KEY}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPatientIdsJson = () => {
    if (allPatientIdRecords.length === 0) {
      setPatientIdImportToast('⚠️ কোনো Patient ID রেকর্ড নেই।');
      setTimeout(() => setPatientIdImportToast(''), 3500);
      return;
    }
    const dataToExport = {
      app: 'Ansari Medical Hall (AMH V4.0)',
      exportType: 'Patient_ID_Directory',
      exportDate: new Date().toISOString(),
      patientIdPrefix,
      totalRecords: allPatientIdRecords.length,
      records: allPatientIdRecords
    };
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AMH_Patient_IDs_Backup_${TODAY_KEY}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProcessImportedFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text || typeof text !== 'string') return;

        let parsedRecords = [];

        if (file.name.endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            parsedRecords = parsed;
          } else if (parsed && Array.isArray(parsed.records)) {
            parsedRecords = parsed.records;
            if (parsed.patientIdPrefix && !patientIdPrefix) {
              setPatientIdPrefix(parsed.patientIdPrefix);
            }
          } else {
            throw new Error('অবৈধ JSON ফাইল।');
          }
        } else {
          const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length < 2) throw new Error('CSV ফাইলে ডেটা পাওয়া যায়নি।');
          const parseCsvLine = (line) => {
            const values = [];
            let inQuotes = false;
            let current = '';
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  current += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());
            return values;
          };

          const rows = lines.slice(1).map(parseCsvLine);
          parsedRecords = rows.map((cols, idx) => {
            const code = cols[0] || `${patientIdPrefix || 'AMH'}-${String(idx + 1).padStart(5, '0')}`;
            const name = cols[1] || '';
            const y = Number(parseBengaliDigits(cols[2])) || 0;
            const m = Number(parseBengaliDigits(cols[3])) || 0;
            const d = Number(parseBengaliDigits(cols[4])) || 0;
            const dob = cols[5] || '';
            const phone = cols[6] || '';
            const bg = cols[7] || '';
            const sym = cols[8] || '';
            const regDate = cols[9] || TODAY_KEY;
            const totalAge = y + m / 12 + d / 365;

            return {
              id: `PID-IMP-${Date.now()}-${idx}`,
              patientCode: code,
              name,
              dob,
              ageYears: y,
              ageMonths: m,
              ageDays: d,
              totalAge,
              isChildUnder4: totalAge < Number(registrationRuleConfig?.ageLimitYears ?? 4),
              phoneNumber: phone,
              bloodGroup: bg,
              symptoms: sym,
              createdDate: regDate,
              lastVisitDate: regDate,
              registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              registeredTimestamp: Date.now(),
              registeredByName: currentUser?.name || 'ইমপোর্ট'
            };
          }).filter(p => p.name || p.phoneNumber);
        }

        const existingMap = new Map();
        patientIdDirectory.forEach(rec => {
          if (rec.patientCode) existingMap.set(rec.patientCode, rec);
        });

        let newCount = 0;
        let updateCount = 0;

        parsedRecords.forEach(rec => {
          const code = rec.patientCode;
          if (code && existingMap.has(code)) {
            existingMap.set(code, { ...existingMap.get(code), ...rec });
            updateCount++;
          } else if (code) {
            existingMap.set(code, rec);
            newCount++;
          }
        });

        const updatedDir = Array.from(existingMap.values());
        setPatientIdDirectory(updatedDir);

        broadcastFullState(
          patientsByDate,
          teamMembers,
          chamberStartTime,
          avgServiceMinutes,
          whatsappTemplate,
          updatedDir,
          undefined,
          undefined,
          patientIdPrefix
        );

        setPatientIdImportToast(`✓ সফলভাবে ${toBengaliDigits(newCount)}টি নতুন ও ${toBengaliDigits(updateCount)}টি পূর্বের Patient ID সিঙ্ক হয়েছে!`);
        setTimeout(() => setPatientIdImportToast(''), 4500);
      } catch (err) {
        setPatientIdImportToast(`⚠️ ফাইল ইমপোর্টে ত্রুটি: ${err.message}`);
        setTimeout(() => setPatientIdImportToast(''), 4000);
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_PREVIEW_CSS }} />
        <SpotlightCard className="max-w-md w-full">
        <div className="w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-700">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t.clinicName}</h1>
            <p className="text-xs font-semibold text-slate-500">স্টাফ ও অ্যাডমিন লগইন পোর্টাল</p>
          </div>

          <form onSubmit={handleDeviceLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">স্টাফ নির্বাচন করুন:</label>
              <select
                value={loginUserId}
                onChange={(e) => setLoginUserId(e.target.value)}
                aria-label="স্টাফ নির্বাচন করুন"
                className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              >
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.isAdmin ? '★ অ্যাডমিন' : ''}
                  </option>
                ))}
              </select>
            </div>

            {requireLoginPassword || onCloudLogin ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {onCloudLogin ? '৮ অঙ্কের numeric password:' : 'পাসওয়ার্ড / পিন কোড:'}
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    inputMode={onCloudLogin ? 'numeric' : undefined}
                    pattern={onCloudLogin ? '\\d{8}' : undefined}
                    maxLength={onCloudLogin ? 8 : undefined}
                    placeholder={onCloudLogin ? '৮ অঙ্ক লিখুন' : 'পাসওয়ার্ড / পিন কোড লিখুন'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(onCloudLogin ? normalizeNumericPin(e.target.value).slice(0, 8) : e.target.value);
                      setLoginError('');
                    }}
                    className="w-full px-3 py-3 pr-12 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(prev => !prev)}
                    aria-label={showLoginPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                    title={showLoginPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                    className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-slate-500 hover:text-emerald-700 rounded-r-xl transition cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <SpotlightCard variant="sub">
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>পাসওয়ার্ড যাচাই বন্ধ রয়েছে — সরাসরি প্রবেশ করতে পারবেন</span>
                </div>
              </SpotlightCard>
            )}

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  const v = e.target.checked;
                  setRememberMe(v);
                  try { localStorage.setItem('amh_remember_me', v ? '1' : '0'); } catch {}
                }}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
              <span>রিমেম্বার মি — এই ডিভাইসে লগইন মনে রাখুন (পরে পাসওয়ার্ড লাগবে না)</span>
            </label>

            <button
              type="submit"
              disabled={loginBusy}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loginBusy ? 'যাচাই হচ্ছে…' : onCloudLogin || requireLoginPassword ? 'নিরাপদে লগইন করুন' : 'সরাসরি প্রবেশ করুন (পাসওয়ার্ড ছাড়া)'}</span>
            </button>
          </form>

          {/* বিকল্প কুইক লগইন অপশন: গেস্ট লগইন ও TV MOOD */}
          {!onCloudLogin && <div className="pt-2 border-t border-slate-200 space-y-2.5">
            <div className="text-[11px] font-bold text-center text-slate-500 uppercase tracking-wider">
              পাসওয়ার্ড ছাড়া প্রবেশ
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* ১. গেস্ট লগইন (পাসওয়ার্ড ছাড়া, সবার জন্য উন্মুক্ত) */}
              <SpotlightCard variant="sub">
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full py-3 px-3.5 bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 rounded-xl text-slate-800 transition flex items-center justify-between cursor-pointer shadow-xs"
                  title="পাসওয়ার্ড ছাড়া সিরিয়াল ও লাইভ কিউ দেখুন"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-sm shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black text-slate-900 text-sm leading-tight">দর্শক হিসেবে দেখুন</span>
                      <span className="text-[11px] text-slate-600 block leading-tight mt-0.5">পাসওয়ার্ড ছাড়া সিরিয়াল ও লাইভ কিউ দেখুন</span>
                    </div>
                  </div>
                  <span className="text-teal-800 font-black text-xs shrink-0 ml-2">প্রবেশ →</span>
                </button>
              </SpotlightCard>

              {/* ২. TV MOOD */}
              <SpotlightCard variant="sub" dark>
                <button
                  type="button"
                  onClick={handleTvModeLogin}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 border border-indigo-500/40 rounded-xl text-white text-xs font-bold transition flex items-center justify-between cursor-pointer shadow-md"
                  title="টিভির জন্য লাইভ ডিসপ্লে বোর্ড"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                      <Tv className="w-3.5 h-3.5 text-indigo-300" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black text-amber-300 leading-tight">TV MOOD</span>
                      <span className="text-[9px] text-slate-300 block leading-tight">লাইভ ডিসপ্লে বোর্ড</span>
                    </div>
                  </div>
                  <span className="text-amber-400 font-black text-[11px]">চালু →</span>
                </button>
              </SpotlightCard>
            </div>
          </div>}
        </div>
        </SpotlightCard>
      </div>
    );
  }

  // বটম নেভিগেশন: ৩% ব্যাকগ্রাউন্ডে লাইট থিমে গাঢ় লেবেল, ডার্ক থিমে আগের হালকা লেবেল
  const isDarkBottomNav = activeTheme === 'immersive-ui' || activeTheme === 'dark-gold-luxe' || activeTheme === 'obsidian-neumorphic' || activeTheme === 'neon-glass';
  const bottomNavLabelActiveClass = isDarkBottomNav ? 'text-white' : 'text-slate-900';
  const bottomNavLabelInactiveClass = isDarkBottomNav ? 'text-white/75' : 'text-slate-700';
  const bottomNavCountClass = isDarkBottomNav
    ? 'text-rose-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
    : 'text-rose-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]';

  // স্ক্রিন ৯০°/২৭০° ঘোরানো থাকলে TV পেজকে viewport-height-এ আটকে রাখা হয় না;
  // নাহলে ম্যানুয়ালি হরাইজন্টাল ভিউ বেছে নিলে কনটেন্ট কেটে যেত।
  const isTvScreenSideways = tvRotationDeg === 90 || tvRotationDeg === 270;
  // portrait board-কে আর এক-স্ক্রিনে জোর করে ফিট (bound) করা হয় না — content-অনুযায়ী
  // স্বাভাবিক (scroll) রাখা হয়, যাতে ১০-তালিকা/পরবর্তী রোগীর কার্ডে নাম/তথ্য কাটা না পড়ে।
  const isTvPortraitBoard = isTvScreenSideways && tvLayoutMode === 'vertical';

  // TV বোর্ডের স্ক্রিন-অরিয়েন্টেশন কন্ট্রোল বার (TV-1-এর হুবহু একই) — TV-2/3/4-তেও বসানো হয়।
  // dark=true হলে হালকা আইকন (গাঢ় বোর্ড), নাহলে গাঢ় আইকন (হালকা বোর্ড) যাতে সব ব্যাকগ্রাউন্ডে দেখা যায়।
  const tvOrientationBar = (dark, anchor = 'panel') => {
    const btn = `h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-transparent transition-colors cursor-pointer flex items-center justify-center shrink-0 ${dark ? 'text-white hover:text-indigo-200 [text-shadow:0_1px_4px_rgba(0,0,0,0.85)]' : 'text-slate-700 hover:text-indigo-600 [text-shadow:0_1px_4px_rgba(255,255,255,0.9)]'}`;
    const ic = 'w-4 h-4 sm:w-[18px] sm:h-[18px]';
    // anchor='panel' → প্যানেলের উপরে (TV-2); anchor='center' → পুরো ডিসপ্লের কেন্দ্রে (TV-3/4)
    const pos = anchor === 'center' ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'absolute -top-3 left-1/2 -translate-x-1/2';
    return (
      <div className={`${pos} z-50 flex items-center gap-1.5 select-none pointer-events-auto`} role="toolbar" aria-label="TV ডিসপ্লে ভিউ ও স্ক্রিন অরিয়েন্টেশন নিয়ন্ত্রণ">
        <button type="button" onClick={() => handleRotateTvDisplay(-1)} className={btn} title={`স্ক্রিন বাম দিকে ৯০° ঘোরান (বর্তমান: ${toBengaliDigits(tvRotationDeg)}°)`} aria-label="স্ক্রিন বাম দিকে ৯০ ডিগ্রি ঘোরান"><RotateCcw className={ic} /></button>
        <button type="button" onClick={handleResetTvDisplayRotation} className={btn} title={`স্ক্রিন রিসেট করুন — স্বাভাবিক ল্যান্ডস্কেপ (০°) (বর্তমান: ${toBengaliDigits(tvRotationDeg)}°)`} aria-label="স্ক্রিন রিসেট করুন, স্বাভাবিক ল্যান্ডস্কেপ শূন্য ডিগ্রি"><RefreshCw className={ic} /></button>
        <button type="button" onClick={() => handleRotateTvDisplay(1)} className={btn} title={`স্ক্রিন ডান দিকে ৯০° ঘোরান (বর্তমান: ${toBengaliDigits(tvRotationDeg)}° ভিউ)`} aria-label="স্ক্রিন ডান দিকে ৯০ ডিগ্রি ঘোরান"><RotateCw className={ic} /></button>
      </div>
    );
  };

  // "চেম্বারের ভিতরে যান" প্যানেল — যেসব রোগীর "ভিতরে যান" চাপা হয়েছে তাদের নাম/টোকেন দেখায়।
  // dark=true গাঢ় বোর্ডের জন্য (TV-1/TV-3), false হালকা (TV-2/TV-4)। grow=true হলে উচ্চতা ভরে নেয়।
  const tvInsidePanel = (n, dark, grow, boxStyle) => {
    const c = dark
      ? { box: `rounded-3xl border-2 border-indigo-300/50 bg-gradient-to-br from-indigo-950/85 to-slate-900/90 text-white p-2.5 sm:p-3 flex flex-col min-h-0 shadow-2xl ${grow ? 'lg:flex-1 lg:min-h-0' : ''}`, hr: 'amh-tv-inside-hr border-b border-white/20 pb-1 mb-2 flex items-center gap-2 shrink-0', head: 'text-lg sm:text-xl font-black uppercase tracking-wide text-indigo-200', chip: 'text-xs sm:text-sm bg-indigo-500/30 text-indigo-100 border border-indigo-300/40 px-2 py-0.5 rounded-full font-mono shrink-0', list: 'flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-1.5 overflow-y-auto', item: 'flex items-center gap-2 rounded-xl px-2.5 py-1.5 bg-white/10 border border-white/15 min-w-0', tok: 'font-mono font-black text-indigo-200 text-lg leading-none shrink-0', nm: 'font-black text-white truncate leading-tight text-lg flex-1 min-w-0', age: 'text-lg font-bold text-white/75 leading-tight shrink-0 whitespace-nowrap', empty: 'text-sm font-bold text-white/60 py-3 text-center' }
      : { box: `bg-white/90 border border-emerald-200 rounded-2xl shadow-sm p-3 flex flex-col min-h-0 ${grow ? 'lg:flex-1 lg:min-h-0' : ''}`, hr: 'amh-tv-inside-hr border-b border-emerald-100 pb-1.5 mb-2 flex items-center gap-2 shrink-0', head: 'text-lg sm:text-xl font-black uppercase tracking-wide text-emerald-800', chip: 'text-sm bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono shrink-0', list: 'flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto', item: 'flex items-center gap-2 rounded-xl px-2.5 py-1.5 border border-slate-200 bg-slate-50 min-w-0', tok: 'font-mono font-black text-emerald-700 text-lg leading-none shrink-0', nm: 'font-black text-slate-900 truncate leading-tight text-lg flex-1 min-w-0', age: 'text-lg font-bold text-slate-600 leading-tight shrink-0 whitespace-nowrap', empty: 'text-sm font-bold text-slate-500 py-3 text-center' };
    return (
      <div data-tp="inside" data-el="panel" style={boxStyle || undefined} className={`${c.box}${tvPanelHidden(n, 'inside')}`}>
        <div className={c.hr}><span data-el="header" className={c.head}>চেম্বারের ভিতরে যান</span>{tvInsidePatients.length > 0 && <span className={c.chip}>{toBengaliDigits(Math.min(tvInsidePatients.length, 2))} জন</span>}</div>
        {tvInsidePatients.length > 0 ? (
          <div className={c.list}>
            {tvInsidePatients.slice(0, 2).map((p) => (
              <div key={p.id} data-el="sub" className={c.item}>
                <span style={tvTokenStyle} data-el="token" className={c.tok}>{toLatinDigits(queueTokenInfo.tokenLabelById.get(p.id) || `#${p.serialNumber}`)}</span>
                <span style={tvNameStyle} data-el="name" className={c.nm}>{p.name}</span>
                <span data-el="age" className={c.age}>বয়স: {toBengaliDigits(p.ageYears || 0)} বছর</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={c.empty}>চেম্বারে এখন কেউ ভিতরে নেই — কিউ থেকে "ভিতরে যান" চাপলে এখানে নাম দেখাবে</div>
        )}
      </div>
    );
  };

  queueRowActionsRef.current = {
    handleUpdateStatus,
    handleOpenEditQueuePatient,
    handleSendWhatsApp,
    setQueueDeleteTarget,
    selectPatient: setSelectedQueuePatientId,
    toggleMarkQueuePatient,
    runQueueStatusAction,
    handleDeleteClick,
    toggleInChamber,
    queuePatients: activeQueuePatients
  };

  return (
    <div
      onClickCapture={handlePageInspectClick}
      onMouseMoveCapture={handlePageInspectMove}
      className={`${themeStyles.wrapper} ${activeTheme === 'dark-gold-luxe' ? 'amh-theme-dark-gold' : activeTheme === 'obsidian-neumorphic' ? 'amh-theme-obsidian' : activeTheme === 'neon-glass' ? 'amh-theme-neon' : activeTheme === 'aurora-ui' ? 'amh-t-aurora' : activeTheme === 'gradient-mesh-ui' ? 'amh-t-mesh' : activeTheme === 'aurora-glassmorphism-ui' ? 'amh-t-auroraglass' : activeTheme === 'immersive-ui' ? 'amh-t-immersive' : activeTheme === 'organic-ui' ? 'amh-t-organic' : activeTheme === 'dental-mint' ? 'amh-t-dental' : activeTheme === 'luxe-frosted-glass' ? 'amh-t-luxefrost' : activeTheme === 'plain-green' ? 'amh-t-plaingreen' : activeTheme === 'puffy-3d-clay' ? 'amh-t-puffy' : activeTheme === 'sooti-art-clay' ? 'amh-t-sooti' : activeTheme === 'zomo-neo-cloud' ? 'amh-t-zomo' : ''} flex flex-col font-sans ${(activeTab === 'tv' || currentUser?.isTvMode || currentUser?.role === 'tv') ? (isTvPortraitBoard ? 'pb-0 lg:h-full lg:overflow-hidden' : 'pb-0') : 'amh-bottomnav-pad pb-28 sm:pb-24'} transition-colors duration-300 $ ${(activeTab === 'tv' || currentUser?.isTvMode || currentUser?.role === 'tv') ? 'bg-black bg-none' : ''}{
        selectAndAskMode
          ? 'cursor-crosshair ring-4 ring-amber-400 select-none'
          : inlineEditMode
          ? 'cursor-crosshair ring-4 ring-emerald-400 select-none'
          : ''
      }`}
    >
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_PREVIEW_CSS }} />

      {/* মেইন ব্যাকগ্রাউন্ড ওয়াটারমার্ক — সর্বোচ্চ জুমে হালকা লোগো */}
      {!(activeTab === 'tv' || currentUser?.isTvMode || currentUser?.role === 'tv') && (
        <div
          aria-hidden="true"
          data-select-ask-ignore="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
        >
          <img
            src="/images/amh-logo-watermark.webp"
            alt=""
            draggable={false}
            className="absolute left-1/2 top-1/2 h-[115vmin] w-[115vmin] max-w-full -translate-x-1/2 -translate-y-1/2 object-contain amh-wm"
            style={{
              opacity: isDarkBottomNav ? 0.05 : 0.08,
              filter: isDarkBottomNav ? 'invert(1) grayscale(1) brightness(1.8)' : 'none'
            }}
          />
        </div>
      )}

      {syncToast && (
        <div data-select-ask-ignore="true" className="bg-emerald-600 text-white px-4 py-2 text-xs font-black text-center shadow-lg sticky top-0 z-50 animate-fadeIn flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Select & Ask Active Inspector Banner */}
      {selectAndAskMode && (
        <div
          data-select-ask-ignore="true"
          className="bg-amber-400 text-slate-950 px-3.5 py-2.5 text-xs font-black flex items-center justify-between shadow-xl z-50 sticky top-0 border-b border-amber-600 animate-fadeIn"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 bg-slate-950 text-amber-300 px-2.5 py-1 rounded-full text-[11px] shadow-xs">
              <MousePointerClick className="w-3.5 h-3.5 animate-bounce" />
              Select &amp; Ask {selectedElementsList.length > 0 ? `(${toBengaliDigits(selectedElementsList.length)}টি উপাদান নির্বাচিত)` : 'মোড সক্রিয়'}
            </span>

            {isCtrlMultiMode && (
              <span className="bg-rose-600 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                Ctrl মোড চালু
              </span>
            )}

            <span className="font-bold text-slate-900 hidden md:inline">
              {selectedElementsList.length > 0
                ? 'Ctrl চেপে আরও উপাদান যোগ করুন, অথবা [সম্পন্ন করুন] চাপুন।'
                : 'যেকোনো উপাদানে ক্লিক করুন। একাধিক উপাদান সিলেক্ট করতে Ctrl চেপে ক্লিক করুন।'}
            </span>

            {hoveredElementInfo && (
              <span className="bg-slate-950/90 text-amber-300 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border border-amber-300/40 truncate max-w-xs shadow-xs">
                🎯 {hoveredElementInfo.role} — "{hoveredElementInfo.text.slice(0, 25)}..."
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {selectedElementsList.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedElementInfo(selectedElementsList[0]);
                    setSelectAndAskMode(false);
                    setHoverHighlightRect(null);
                    setHoveredElementInfo(null);
                  }}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-300 rounded-lg text-[11px] font-black cursor-pointer transition shadow-md border border-amber-400 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>সম্পন্ন করুন ({toBengaliDigits(selectedElementsList.length)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedElementsList([])}
                  className="px-2 py-1 bg-black/20 hover:bg-black/30 text-slate-950 rounded-lg text-[11px] font-bold cursor-pointer transition"
                  title="নির্বাচিত তালিকা খালি করুন"
                >
                  রিসেট
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const generalInfo = {
                    tag: 'general',
                    role: 'সাধারণ প্রম্পট',
                    section: `${activeTab} প্যানেল`,
                    text: `${activeTab} প্যানেলের সার্বিক বিষয়`
                  };
                  setSelectedElementsList([generalInfo]);
                  setSelectedElementInfo(generalInfo);
                  setSelectAndAskMode(false);
                  setHoverHighlightRect(null);
                  setHoveredElementInfo(null);
                }}
                className="px-2.5 py-1 bg-white/80 hover:bg-white text-slate-950 rounded-lg text-[11px] font-bold cursor-pointer transition shadow-xs"
              >
                সরাসরি লিখুন
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectAndAskMode(false);
                setSelectedElementsList([]);
                setHoverHighlightRect(null);
                setHoveredElementInfo(null);
              }}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold cursor-pointer shadow-xs transition"
            >
              বাতিল (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Edit text inline Active Banner */}
      {inlineEditMode && !inlineEditor && (
        <div
          data-select-ask-ignore="true"
          className="bg-emerald-500 text-white px-3.5 py-2.5 text-xs font-black flex items-center justify-between gap-2 shadow-xl z-50 sticky top-0 border-b border-emerald-700 animate-fadeIn"
        >
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="flex items-center gap-1.5 bg-slate-950 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] shadow-xs shrink-0">
              <Type className="w-3.5 h-3.5" />
              Edit text inline
            </span>
            <span className="font-bold text-emerald-50 hidden md:inline">
              যেকোনো লেখার ওপর ক্লিক করুন — পুরনো লেখা বদলে নতুন লেখা লিখুন, প্রয়োজনে নতুন লাইনও যোগ করুন।
            </span>
            <span className="font-bold text-emerald-50 md:hidden text-[10px]">যেকোনো লেখায় ক্লিক করুন</span>

            {inlineEditHint && (
              <span
                className="pointer-events-none fixed left-2 right-2 top-14 z-[60] bg-rose-600 text-white px-3 py-2 rounded-xl text-[10px] font-bold shadow-xl border border-rose-300/50"
                role="status"
              >
                {inlineEditHint}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={cancelInlineEdit}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold cursor-pointer shadow-xs transition shrink-0"
          >
            বাতিল (Esc)
          </button>
        </div>
      )}

      {/* Live Multiple Selected Elements Outline and Number Badges */}
      {selectAndAskMode &&
        selectedElementsList.map((item, idx) => (
          <div
            key={item.id || idx}
            data-select-ask-ignore="true"
            style={{
              position: item.rect?.isFixed ? 'fixed' : 'absolute',
              top: item.rect?.top || 0,
              left: item.rect?.left || 0,
              width: item.rect?.width || 0,
              height: item.rect?.height || 0,
              pointerEvents: 'none',
              border: '3px solid #f59e0b',
              boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.6), inset 0 0 14px rgba(245, 158, 11, 0.35)',
              backgroundColor: 'rgba(245, 158, 11, 0.22)',
              borderRadius: '12px',
              zIndex: 99998
            }}
          >
            <div className="absolute -top-3.5 -left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              {toBengaliDigits(idx + 1)}
            </div>
          </div>
        ))}

      {/* Live Hover Outline on targeted elements */}
      {(selectAndAskMode || inlineEditMode) && hoverHighlightRect && (
        <div
          data-select-ask-ignore="true"
          style={{
            position: hoverHighlightRect.isFixed ? 'fixed' : 'absolute',
            top: hoverHighlightRect.top,
            left: hoverHighlightRect.left,
            width: hoverHighlightRect.width,
            height: hoverHighlightRect.height,
            pointerEvents: 'none',
            border: inlineEditMode ? '3px dashed #10b981' : '3px solid #f59e0b',
            boxShadow: inlineEditMode
              ? '0 0 0 3px rgba(16, 185, 129, 0.55), inset 0 0 14px rgba(16, 185, 129, 0.3)'
              : '0 0 0 3px rgba(245, 158, 11, 0.6), inset 0 0 14px rgba(245, 158, 11, 0.35)',
            backgroundColor: inlineEditMode ? 'rgba(16, 185, 129, 0.16)' : 'rgba(245, 158, 11, 0.22)',
            borderRadius: '12px',
            zIndex: 99999,
            transition: 'all 0.04s ease-out'
          }}
        >
          {inlineEditMode && (
            <span className="absolute -top-8 left-0 bg-emerald-600 text-white font-black text-[10px] px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-emerald-300/60">
              ✏️ ক্লিক করে এডিট করুন
            </span>
          )}
        </div>
      )}

      {/* Header bar — সবাই দেখতে পাবে, শুধু TV Mood লগইনে হাইড: ১) বেকগ্রাউন্ড বেকওয়ার্ডে (z-10), ২) মেইন প্যানেল মিডওয়ার্ডে (z-20), ৩) সাব-প্যানেলগুলো আপওয়ার্ডে (z-30/z-50) */}
      {!(currentUser?.isTvMode || currentUser?.role === 'tv') && (
      <>
      {/* লেয়ার ১ (বেকওয়ার্ড): থিমের হেডার ব্যাকগ্রাউন্ড — মোবাইলে আলাদা fixed স্তর, z-10 */}
      <div
        aria-hidden="true"
        data-amh-header-bg="true"
        data-select-ask-ignore="true"
        className="sticky top-0 z-10 h-0 w-full shrink-0 overflow-visible pointer-events-none max-sm:fixed max-sm:top-0 max-sm:inset-x-0 max-sm:z-10"
      >
        <div
          className={`${headerBackdropClass} relative w-full overflow-hidden rounded-b-[26px] border-b border-white/35 shadow-[0_14px_34px_-16px_rgba(16,185,129,0.60)] transition-all duration-300`}
          style={{ height: headerBarHeight > 0 ? `${headerBarHeight}px` : (isHeaderMinimized ? '60px' : '92px') }}
        >
          {/* ৩ডি গ্লাস মরফিজম: ফ্রস্টেড ব্লার স্তর */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 backdrop-blur-lg bg-white/10" />
          {/* ৩ডি গভীরতা: উপরে আলো, নিচে ছায়া */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/20" />
          {/* গ্লোয়িং বর্ডার: উপরের হাইলাইট ও নিচের নিওন রেখা */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/85 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-emerald-300/90 to-transparent blur-[0.6px]" />
        </div>
      </div>
      {/* লেয়ার ৩ (আপওয়ার্ড): হেডারের গ্লাস সাব-প্যানেলগুলো — মোবাইলে fixed, z-40 (মেইন প্যানেল z-20-এর উপরে) */}
      <div className={`sticky top-0 shrink-0 ${headerAskMenuOpen ? 'z-50' : 'z-30'} max-sm:fixed max-sm:top-0 max-sm:inset-x-0 max-sm:z-40`}>
      <header
        ref={headerBarRef}
        className={`relative bg-transparent border-0 shadow-none ${headerTextColorClass} transition-colors duration-300`}
      >

        <div className={`max-w-7xl mx-auto px-4 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 ${
          isHeaderMinimized ? 'py-1.5 sm:py-2' : 'py-2.5 sm:py-3'
        }`}>
          <div className="relative z-30 flex items-center gap-3 w-full sm:w-auto">
            {isHeaderMinimized ? (
              <button
                type="button"
                onClick={toggleHeaderMinimize}
                aria-expanded={!isHeaderMinimized}
                aria-label="হেডার প্রসারিত করুন"
                className="w-full sm:w-auto min-h-[44px] bg-white/10 max-sm:!bg-slate-950/30 hover:bg-white/20 text-white backdrop-blur-xl border border-white/25 rounded-xl px-3 py-1.5 shadow-lg shadow-black/20 transition-all duration-300 flex items-center justify-between sm:justify-start gap-2.5 cursor-pointer text-left [text-shadow:0.6px_0_0_rgba(0,0,0,0.75),-0.6px_0_0_rgba(0,0,0,0.75),0_0.6px_0_rgba(0,0,0,0.75),0_-0.6px_0_rgba(0,0,0,0.75),0_0_2px_rgba(0,0,0,0.35)]"
                title="হেডার বড় (ম্যাক্সিমাইজ) করতে ক্লিক করুন"
              >
                <div className="flex items-center gap-2">
                  <img
                    src="/images/amh-logo-watermark.webp"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="w-8 h-8 shrink-0 rounded-full bg-white/50 object-contain p-0.5"
                  />
                  <span className="text-sm font-black tracking-tight text-white">{t.clinicName}</span>
                  <span className="text-xs font-medium hidden sm:inline text-emerald-300/90">• {formatBengaliHeaderDate(new Date())}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-white/10 px-1.5 py-0.5 rounded-md sm:hidden">
                  <span>বড় করুন</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </button>
            ) : (
              <div className={`relative isolate overflow-hidden max-sm:w-full rounded-2xl sm:rounded-3xl border border-white/25 bg-white/10 max-sm:!bg-slate-950/30 backdrop-blur-xl shadow-lg shadow-black/20 px-4 sm:px-5 py-3 sm:py-2.5 transition-all duration-300 [text-shadow:0.6px_0_0_rgba(0,0,0,0.75),-0.6px_0_0_rgba(0,0,0,0.75),0_0.6px_0_rgba(0,0,0,0.75),0_-0.6px_0_rgba(0,0,0,0.75),0_0_2px_rgba(0,0,0,0.35)]`}>
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/20 via-white/[0.04] to-transparent" />
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/85 to-transparent" />
                  <div className="relative z-10 flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-white/50 border-2 border-emerald-300/50 shadow-lg shadow-black/25 flex items-center justify-center overflow-hidden">
                      <img
                        src="/images/amh-logo-watermark.webp"
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <h1 className="text-2xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-md">
                        {t.clinicName}
                      </h1>
                      <p className={`text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center sm:justify-start gap-1.5 opacity-95 ${themeStyles.brandSubtext || 'text-emerald-200'}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse shadow-xs ${themeStyles.brandDot || 'bg-emerald-400 shadow-emerald-400'}`}></span>
                        <span className="font-semibold">{formatBengaliHeaderDate(new Date())}</span>
                      </p>
                    </div>
                  </div>
                </div>
            )}
          </div>

          <div className="relative z-30 flex items-center justify-end w-full sm:w-auto" data-select-ask-ignore="true">
            <div className="flex items-center gap-1 sm:gap-1.5 max-sm:w-full rounded-2xl border border-white/25 bg-white/10 max-sm:!bg-slate-950/30 backdrop-blur-xl px-1.5 py-1 shadow-lg shadow-black/20 [text-shadow:0.6px_0_0_rgba(0,0,0,0.75),-0.6px_0_0_rgba(0,0,0,0.75),0_0.6px_0_rgba(0,0,0,0.75),0_-0.6px_0_rgba(0,0,0,0.75),0_0_2px_rgba(0,0,0,0.35)]">
            {/* Select & Ask বাটন */}
            {currentUser?.isAdmin && (
            <div className="relative shrink-0 hidden sm:block">
              <div className="flex items-center rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setInlineEditMode(false);
                    setInlineEditor(null);
                    setInlineEditDraft('');
                    setSelectAndAskMode(prev => !prev);
                    setHeaderAskMenuOpen(false);
                    setHoverHighlightRect(null);
                    setHoveredElementInfo(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:p-2 rounded-lg text-xs font-bold cursor-pointer transition ${
                    selectAndAskMode
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300 animate-pulse'
                      : 'hover:bg-white/15 text-white'
                  }`}
                  title={selectAndAskMode ? "উপাদান নির্বাচন মোড বন্ধ করুন" : "Select & Ask (Alt+S) — যেকোনো অংশে ক্লিক করে সিলেক্ট করুন"}
                  aria-label="Select & Ask"
                >
                  <MousePointerClick className={`icon-outline-black w-4 h-4 sm:w-3.5 sm:h-3.5 ${selectAndAskMode ? 'animate-bounce text-slate-950' : 'text-amber-300'}`} />
                  {selectAndAskMode && (
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setHeaderAskMenuOpen(!headerAskMenuOpen)}
                  className={`w-8 h-9 sm:w-auto sm:h-auto px-1 sm:py-2 rounded-lg transition cursor-pointer text-white ${headerAskMenuOpen ? 'bg-white/25' : 'hover:bg-white/15'}`}
                  title="Select &amp; Ask কুইক মেনু"
                  aria-label="Select and Ask কুইক মেনু খুলুন"
                  aria-expanded={headerAskMenuOpen}
                >
                  <ChevronDown className={`icon-outline-black w-3.5 h-3.5 mx-auto transition-transform duration-200 ${headerAskMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Quick Menu — portal হিসেবে রেন্ডার হয়, তাই মোবাইলেও পুরো স্ক্রিনে খোলে */}
              {headerAskMenuOpen && createPortal(
                <div
                  data-select-ask-ignore="true"
                  className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
                  onClick={() => setHeaderAskMenuOpen(false)}
                >
                  <SpotlightCard dark className="w-full max-w-md mt-2 sm:mt-10">
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Select & Ask কুইক মেনু"
                    onClick={(event) => event.stopPropagation()}
                    className="w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl p-3 sm:p-4 shadow-2xl border border-slate-700 bg-slate-900 text-white text-xs space-y-2.5"
                  >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-700">
                    <div className="flex items-center gap-1.5 font-black text-amber-400">
                      <MousePointerClick className="w-3.5 h-3.5" />
                      <span>Select &amp; Ask কুইক মেনু</span>
                    </div>
                    <button type="button" onClick={() => setHeaderAskMenuOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer flex items-center justify-center" aria-label="মেনু বন্ধ করুন">✕</button>
                  </div>

                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1.5">
                      <SpotlightCard variant="sub" dark>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectAndAskMode(false);
                            setSelectedElementInfo(null);
                            setSelectedElementsList([]);
                            setAskPromptInput('');
                            setInlineEditor(null);
                            setInlineEditDraft('');
                            setInlineEditHint('');
                            setInlineEditMode(true);
                            setHeaderAskMenuOpen(false);
                            setHoverHighlightRect(null);
                            setHoveredElementInfo(null);
                          }}
                          className="w-full h-full text-left p-2.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 transition cursor-pointer min-h-[78px] flex flex-col justify-between group"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                              <Type className="w-4 h-4" />
                            </span>
                            <span className="font-black text-[11px] text-emerald-200 leading-tight">Edit text inline</span>
                          </div>
                          <div className="text-[9px] text-slate-300 leading-snug mt-1.5">
                            যেকোনো লেখা বদলান বা নতুন লাইন লিখুন
                          </div>
                        </button>
                      </SpotlightCard>

                      <SpotlightCard variant="sub" dark>
                        <button
                          type="button"
                          onClick={() => {
                            setHeaderAskMenuOpen(false);
                            startAnnotationCapture();
                          }}
                          className="w-full h-full text-left p-2.5 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 transition cursor-pointer min-h-[78px] flex flex-col justify-between group"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                              <Pencil className="w-4 h-4" />
                            </span>
                            <span className="font-black text-[11px] text-sky-200 leading-tight">Draw Annotation</span>
                          </div>
                          <div className="text-[9px] text-slate-300 leading-snug mt-1.5">
                            বক্স বা গোল মেরে ছবি তুলে দিন
                          </div>
                        </button>
                      </SpotlightCard>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setInlineEditMode(false);
                        setInlineEditor(null);
                        setInlineEditDraft('');
                        setSelectAndAskMode(true);
                        setHeaderAskMenuOpen(false);
                        setHoverHighlightRect(null);
                        setHoveredElementInfo(null);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎯</span>
                        <div>
                          <div className="font-bold text-amber-300">উপাদান নির্বাচন মোড</div>
                          <div className="text-[10px] text-slate-300">যেকোনো বাটন বা লেখায় ক্লিক করুন</div>
                        </div>
                      </div>
                      <span className="text-[9px] bg-slate-800 text-amber-400 font-mono px-1.5 py-0.5 rounded">Alt+S</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const generalInfo = {
                          tag: 'general',
                          role: 'সাধারণ প্রম্পট',
                          section: `${activeTab} প্যানেল`,
                          text: `${activeTab} প্যানেলের সার্বিক ফিচার ও ডিজাইন`
                        };
                        setSelectedElementsList([generalInfo]);
                        setSelectedElementInfo(generalInfo);
                        setHeaderAskMenuOpen(false);
                        setSelectAndAskMode(false);
                        setInlineEditMode(false);
                        setInlineEditor(null);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-2 transition cursor-pointer"
                    >
                      <span className="text-base">✍️</span>
                      <div>
                        <div className="font-bold text-slate-200">সরাসরি প্রম্পট লিখুন</div>
                        <div className="text-[10px] text-slate-400">সিলেক্ট না করে সাধারণ নির্দেশ দিন</div>
                      </div>
                    </button>
                  </div>

                  {promptHistory.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span>🕒 সাম্প্রতিক নির্দেশাবলী:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPromptHistory([]);
                            try { localStorage.removeItem('amh_select_ask_history'); } catch {}
                          }}
                          className="hover:text-rose-400 cursor-pointer"
                        >
                          ক্লিয়ার
                        </button>
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {promptHistory.slice(0, 4).map((hist) => (
                          <div
                            key={hist.id}
                            onClick={async () => {
                              await safeCopyToClipboard(hist.formatted);
                              setCopiedPrompt(true);
                              setTimeout(() => setCopiedPrompt(false), 1500);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 cursor-pointer transition flex items-center justify-between text-[11px]"
                            title="ক্লিক করে আবার কপি করুন"
                          >
                            <div className="truncate mr-2">
                              <span className="text-amber-400 font-semibold block truncate">"{hist.target}"</span>
                              <span className="text-slate-400 block text-[9px] truncate">{hist.instruction}</span>
                            </div>
                            <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </SpotlightCard>
                </div>,
                document.body
              )}
            </div>
            )}

            {/* TV বোর্ড — এক প্যানেলে ৪টি ভ্যারিয়েন্ট (থিম-ড্রপডাউনের মতো), শুধুমাত্র অ্যাডমিন দেখতে পাবে */}
            {currentUser?.isAdmin && (
              <div className="relative shrink-0" data-select-ask-ignore="true">
                <button
                  type="button"
                  onClick={() => setTvMenuOpen(o => !o)}
                  aria-expanded={tvMenuOpen}
                  aria-label="TV বোর্ড নির্বাচন করুন"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                    activeTab === 'tv'
                      ? 'bg-indigo-500/25 text-white border-indigo-300/50 font-black'
                      : 'bg-transparent text-indigo-100 border-transparent hover:bg-white/10'
                  }`}
                  title="TV বোর্ড নির্বাচন করুন"
                >
                  <Tv className="icon-outline-black w-3.5 h-3.5 text-indigo-300" />
                  <span className="[text-shadow:0.6px_0_0_rgba(0,0,0,0.75),-0.6px_0_0_rgba(0,0,0,0.75),0_0.6px_0_rgba(0,0,0,0.75),0_-0.6px_0_rgba(0,0,0,0.75),0_0_2px_rgba(0,0,0,0.35)]">{activeTab === 'tv' ? `TV-${tvVariant}` : 'TV'}</span>
                  <ChevronDown className={`icon-outline-black w-3 h-3 transition-transform duration-200 ${tvMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {tvMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setTvMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-white/25 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-1.5 text-white animate-fadeIn">
                      <div className="px-2 py-1 text-[10px] font-black tracking-wide text-indigo-300">TV বোর্ড নির্বাচন</div>
                      {[1, 2, 3, 4].filter((n) => tvBoardsConfig[n]?.enabled).length === 0 ? (
                        <div className="px-2.5 py-3 text-[11px] text-slate-300">কোনো বোর্ড চালু নেই — অ্যাডমিন প্যানেল থেকে চালু করুন।</div>
                      ) : (
                        [1, 2, 3, 4].filter((n) => tvBoardsConfig[n]?.enabled).map((n) => {
                          const desc = { 1: 'গ্রাফিক্স/ইফেক্টসহ (মূল)', 2: 'ইফেক্ট ছাড়া, সফট মিন্ট হালকা', 3: 'গ্রাফিক্স/ইফেক্টসহ (চওড়া)', 4: 'ইফেক্ট ছাড়া, সফট মিন্ট হালকা' }[n];
                          const active = activeTab === 'tv' && tvVariant === n;
                          const isDefault = tvDefaultVariant === n;
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => { openTvVariant(n); setTvMenuOpen(false); }}
                              className={`w-full text-left px-2.5 py-2 rounded-xl transition cursor-pointer ${active ? 'bg-indigo-500/30 ring-1 ring-indigo-300/50' : 'hover:bg-white/10'}`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black truncate">{tvBoardsConfig[n]?.label || `TV-${n}`}</span>
                                <span className="flex items-center gap-1 shrink-0">
                                  {isDefault && <span className="text-[9px] font-bold text-cyan-300">ডিফল্ট</span>}
                                  {active && <span className="text-[9px] font-bold text-emerald-300">সক্রিয়</span>}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-300 leading-snug mt-0.5">{desc}</div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* সক্রিয় প্যানেলের নাম (সিঙ্ক আইকনের বাম পাশে) — মোবাইলে জায়গা বাঁচাতে হাইড */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-white select-none shrink-0"
              title="বর্তমান সক্রিয় প্যানেল"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span className="text-[11px] sm:text-xs font-black tracking-wide text-amber-300">
                {activePanelName}
              </span>
            </div>

            <button
              onClick={handleManualSyncRefresh}
              className={`flex items-center gap-1.5 p-2.5 sm:px-3 sm:py-2.5 rounded-xl border text-[11px] font-bold cursor-pointer transition ${
                syncStatus === 'syncing' ? 'bg-emerald-500/25 text-emerald-50 border-emerald-300/50' : 'bg-transparent text-emerald-100 border-transparent hover:bg-white/10'
              }`}
              title="লাইভ সিঙ্ক রিফ্রেশ"
              aria-label="লাইভ সিঙ্ক রিফ্রেশ করুন"
            >
              <RefreshCw className={`icon-outline-black w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-300 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span className={`w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            </button>

            <div className="flex items-center gap-2 max-sm:ml-auto max-sm:mr-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs text-white">
              <span className={`w-2 h-2 rounded-full ${currentUser?.isAdmin ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
              <span className="font-bold truncate max-w-[100px] sm:max-w-none">{currentUser?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 text-xs font-bold rounded-xl text-rose-100 hover:bg-rose-500/20 transition cursor-pointer flex items-center justify-center shrink-0"
              title="লগআউট"
              aria-label="লগআউট করুন"
            >
              <LogOut className="icon-outline-black w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>

            <button
              type="button"
              onClick={toggleHeaderMinimize}
              className="w-11 h-11 rounded-xl border border-transparent transition cursor-pointer flex items-center justify-center shrink-0 hover:bg-white/10 text-white"
              title={isHeaderMinimized ? "হেডার প্রসারিত করুন" : "হেডার মিনিমাইজ করুন"}
              aria-label={isHeaderMinimized ? "হেডার প্রসারিত করুন" : "হেডার মিনিমাইজ করুন"}
              aria-expanded={!isHeaderMinimized}
            >
              {isHeaderMinimized ? <ChevronDown className="icon-outline-black w-5 h-5 sm:w-4 sm:h-4" /> : <ChevronUp className="icon-outline-black w-5 h-5 sm:w-4 sm:h-4" />}
            </button>
            </div>
          </div>
        </div>

</header>
      </div>
      </>
      )}

      {swUpdateReady && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white px-3 py-2 shadow-2xl border border-emerald-400/40">
          <span className="text-[11px] font-bold">নতুন ভার্সন এসেছে</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
          >
            রিফ্রেশ
          </button>
        </div>
      )}

      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`amh-main relative z-20 ${currentUser?.isTvMode || currentUser?.role === 'tv' ? '' : '-mt-2'} ${activeTab === 'tvconfig' ? 'max-w-[1700px]' : 'max-w-7xl'} mx-auto px-3 sm:px-4 ${(activeTab === 'tv' || currentUser?.isTvMode || currentUser?.role === 'tv') ? (isTvPortraitBoard ? 'py-1.5 sm:py-2 lg:flex-1 lg:flex lg:flex-col lg:min-h-0 lg:overflow-hidden' : 'py-2.5 sm:py-4') : 'py-5 max-sm:pb-24'} w-full flex-1 touch-pan-y select-none sm:select-auto ${(activeTab === 'tv' || currentUser?.isTvMode || currentUser?.role === 'tv') ? 'rounded-none' : 'rounded-t-3xl'} shadow-[0_-14px_36px_rgba(2,6,23,0.22)] border-t border-white/40 ${(activeTab === 'tv' || currentUser?.isTvMode || currentUser?.role === 'tv') ? 'bg-black' : ''}`}
      >
        {/* মেইন প্যানেলের ব্যাকগ্রাউন্ড লেয়ার — শুধু ব্যাকগ্রাউন্ড ৯০% ট্রান্সপারেন্ট, কনটেন্ট ফুল-অপাক */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 rounded-t-3xl ${mainPanelSurface} opacity-10 ${(activeTab === 'tv' || currentUser?.isTvMode || currentUser?.role === 'tv') ? 'hidden' : ''}`}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes panelSlideFromRight {
            from { transform: translateX(36px); opacity: 0.15; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes panelSlideFromLeft {
            from { transform: translateX(-36px); opacity: 0.15; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-panel-slide-left {
            animation: panelSlideFromRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-panel-slide-right {
            animation: panelSlideFromLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}} />



        <div key={activeTab} className={`relative z-10 ${(activeTab === 'tv' || currentUser?.isTvMode || currentUser?.role === 'tv') && isTvPortraitBoard ? 'lg:flex-1 lg:flex lg:flex-col lg:min-h-0' : ''} ${slideDirection === 'left' ? 'animate-panel-slide-left' : 'animate-panel-slide-right'}`}>
        {/* ============================================================== */}
        {/* TV MOOD — লাইভ ক্লিনিক ওটিপি / কিউ ডিসপ্লে বোর্ড (হরাইজন্টাল ও ভার্টিক্যাল ভিউ সাপোর্ট) */}
        {/* শুধুমাত্র অ্যাডমিন এবং TV Mood ইউজার ছাড়া অন্য কেউ দেখতে পাবে না */}
        {/* ============================================================== */}
        {/* ===== TV-1: ভার্টিক্যাল বোর্ড (গ্রাফিক্স/ইফেক্টসহ) — স্বাধীন কপি ===== */}
        {activeTab === 'tv' && (currentUser?.isAdmin || currentUser?.isTvMode || currentUser?.role === 'tv') && (
          <style data-amh-tv-el>{getTvElementCss(tvBoardsConfig[tvVariant]) + getTvDesignCss(tvBoardsConfig[tvVariant])}</style>
        )}
        {activeTab === 'tv' && tvVariant === 1 && (currentUser?.isAdmin || currentUser?.isTvMode || currentUser?.role === 'tv') && (
          <div
            onPointerMove={revealTvControls}
            onPointerDown={revealTvControls}
            onFocusCapture={revealTvControls}
            style={getTvBoardStyle(1)}
            className={`amh-tv1-board mx-auto relative animate-fadeIn select-none w-full ${isTvPortraitBoard ? 'max-w-none' : 'max-w-4xl'} px-1 sm:px-3 py-1 flex flex-col gap-2.5 sm:gap-3 bg-black text-white ${isTvPortraitBoard ? 'lg:flex-1 lg:min-h-0 lg:overflow-hidden' : ''}`}
          >
            {/* TV নিয়ন্ত্রণ আইকন এখন ইনলাইন: 'পরবর্তী রোগী' ও 'পরবর্তী ১০ জনের সিরিয়াল তালিকা' প্যানেলের মাঝের ফাঁকে সবসময় দৃশ্যমান (ব্যাকগ্রাউন্ডবিহীন, অটো-হাইড নেই) — নিচের ডান কলামে অবস্থিত */}

            <>
            {/* ২. নিচের মূল অংশ: হরাইজন্টাল ভিউতে পাশাপাশি (এক স্ক্রিনে) এবং ভার্টিক্যাল ভিউতে উপর-নিচে লম্বালম্বি */}
            <div className={`${isTvPortraitBoard ? 'flex flex-col lg:flex-1 lg:min-h-0' : 'grid grid-cols-1 lg:grid-rows-[2fr_3fr_1fr]'} gap-2.5 sm:gap-3.5 items-stretch`}>
              {/* বাম কলাম (হরাইজন্টালে ৭ কলাম, ভার্টিক্যালে পূর্ণ প্রস্থ): বর্তমানে দেখা হচ্ছে + পরবর্তী রোগী */}
              <div style={tvGroupFlex(1, ['called', 'inside', 'next'])} className={`lg:min-h-0 flex flex-col gap-2.5 sm:gap-3.5`}>
                {/* প্যানেল ২: বর্তমানে দেখা হচ্ছে (চলমান) */}
                <SpotlightCard dark data-tp="called" data-el="panel" style={tvPanelFlex(1, 'called')} className={`lg:flex-1 lg:min-h-0${tvPanelHidden(1, 'called')}`}>
                  <div style={{ backgroundImage: "linear-gradient(140deg, rgba(2,22,14,0.62) 0%, rgba(2,22,14,0.82) 100%), url('/images/tv-green.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} data-el="panel" className={`${themeStyles.tvCurrentCard || 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white border-2 border-emerald-400'} h-full pt-1 pb-1.5 px-2 sm:pt-1 sm:pb-2 sm:px-2.5 lg:pt-1 lg:pb-2.5 lg:px-3 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between`}>
                    <div className="relative flex items-center justify-center gap-2 border-b border-white/20 h-[32px] mb-1 shrink-0">
                      <div className="flex items-center min-w-0">
                        <span style={{ fontFamily: "'Padmo', 'SolaimanLipi', 'Hind Siliguri', sans-serif" }} data-el="header" className={`text-[28px] leading-none font-black uppercase tracking-wide block truncate ${themeStyles.tvCurrentTitle || 'text-emerald-300'}`}>
                          বর্তমানে চেম্বারের ভিতর অবস্থান করতে পারবেন
                        </span>
                      </div>
                      {/* এডমিন: টিভি থেকে ফেরত — লগআউট নয়, শেষে যে প্যানেলে কাজ করছিলেন সেই প্যানেলেই ফিরে যায় (লগিন স্ক্রিনে নয়)।
                          TV MOOD সেশন: আগের মতো লগআউট আইকন। */}
                      {currentUser?.isAdmin ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab(lastNonTvTabRef.current || 'queue')}
                          title="স্বাভাবিক মোডে ফিরুন"
                          aria-label="স্বাভাবিক মোডে ফিরুন"
                          className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-transparent text-white/90 hover:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleLogout}
                          title="লগআউট"
                          aria-label="লগআউট করুন"
                          className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-transparent text-white/90 hover:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {tvCalledPatientsSorted.length > 0 ? (
                      <div className={`flex-1 min-h-0 py-0 ${tvCalledSize.wrap}`}>
                        {tvCalledPatientsSorted.slice(0, tvCount(1, 'called', 4)).map((patient, idx) => (
                          <div
                            key={patient.id}
                            data-el="sub" className={`flex items-center gap-2 sm:gap-2.5 rounded-2xl px-2.5 sm:px-3 border w-[calc(50%-2px)] ${tvCalledSize.pad} ${
                              idx === 0 ? 'bg-white/10 border-emerald-300/40' : 'bg-white/[0.04] border-white/15'
                            }${tvHighlightOnCall && idx === 0 ? ' amh-tv-pulse' : ''}`}
                          >
                            <div className="min-w-0 flex-1 flex flex-col gap-0.5 overflow-hidden">
                              <div className="flex items-baseline gap-2 sm:gap-3 min-w-0">
                                <span style={tvTokenStyle} data-el="token" className={`${tvCalledSize.num} font-black leading-none shrink-0 ${idx === 0 ? 'text-emerald-300' : 'text-white/85'}`}>{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)};</span>
                                <h3 style={tvNameStyle} data-el="name" className={`font-black text-white truncate leading-tight ${(patient.name?.length || 0) > 20 ? 'text-lg sm:text-xl' : (patient.name?.length || 0) > 12 ? 'text-xl sm:text-2xl' : tvCalledSize.name}`}>
                                  {patient.name}
                                </h3>
                              </div>
                              <span data-el="age" className="text-base sm:text-lg opacity-85 font-bold whitespace-nowrap">
                                বয়স: {toBengaliDigits(patient.ageYears || 0)} বছর
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 py-3 sm:py-4 text-center flex flex-col items-center justify-center space-y-1">
                        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto">
                          <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">বর্তমানে চেম্বারে কোনো রোগী উপস্থিত নেই</h3>
                        <p className="text-base lg:text-lg">রোগী ডাকলে এখানে নাম দেখা যাবে</p>
                      </div>
                    )}
                  </div>
                </SpotlightCard>

                {tvInsidePanel(1, true, false, tvPanelFlex(1, 'inside'))}

                {/* প্যানেল ৩: পরবর্তী রোগী (প্রস্তুত থাকুন) */}
                <SpotlightCard dark data-tp="next" data-el="panel" style={tvPanelFlex(1, 'next')} className={`lg:flex-1 lg:min-h-0${tvPanelHidden(1, 'next')}`}>
                  <div
                    style={{
                      backgroundColor: '#7A2E05',
                      backgroundImage: "linear-gradient(140deg, rgba(30,10,0,0.08) 0%, rgba(30,10,0,0.40) 60%, rgba(18,5,0,0.74) 100%), url('/images/tv-yellow.jpg')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    data-el="panel" className="h-full pt-1 pb-1.5 px-2 sm:pt-1 sm:pb-2 sm:px-2.5 lg:pt-1 lg:pb-2.5 lg:px-3 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 flex flex-col border-2 border-orange-300/45 text-white"
                  >
                    <div className="relative flex items-center justify-center gap-2 border-b border-white/25 h-[32px] mb-1 shrink-0">
                      <div className="flex items-center min-w-0">
                        <span style={{ fontFamily: "'Padmo', 'SolaimanLipi', 'Hind Siliguri', sans-serif" }} data-el="header" className={`text-[28px] leading-none font-black uppercase tracking-wide block truncate text-orange-50 [text-shadow:0_1px_6px_rgba(40,10,0,0.6)]`}>
                          পরবর্তী রোগী
                        </span>
                      </div>
                    </div>

                    {tvNextPatient ? (
                      <div className="flex-1 min-h-0 flex items-center">
                        <div data-el="sub" className="flex-1 min-w-0 rounded-2xl border border-white/15 bg-white/[0.04] px-3 sm:px-4 py-2 flex flex-col gap-0.5 overflow-hidden">
                          <div className="flex items-baseline gap-2 sm:gap-3 min-w-0">
                            <span style={tvTokenStyle} data-el="token" className={`font-black font-mono leading-none shrink-0 text-white ${
                              (tvNextPatient.name?.length || 0) > 20 ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-3xl sm:text-4xl lg:text-5xl'
                            }`}>{toLatinDigits(queueTokenInfo.tokenLabelById.get(tvNextPatient.id) || `#${tvNextPatient.serialNumber}`)};</span>
                            <h4 style={tvNameStyle} data-el="name" className={`font-black text-white truncate leading-tight [text-shadow:0_2px_12px_rgba(30,8,0,0.6)] ${
                              (tvNextPatient.name?.length || 0) > 28 ? 'text-2xl sm:text-3xl lg:text-4xl'
                              : (tvNextPatient.name?.length || 0) > 18 ? 'text-3xl sm:text-4xl lg:text-5xl'
                              : (tvNextPatient.name?.length || 0) > 12 ? 'text-4xl sm:text-5xl lg:text-5xl'
                              : 'text-4xl sm:text-5xl lg:text-5xl'
                            }`}>
                              {tvNextPatient.name}
                            </h4>
                          </div>
                          <p data-el="age" className="text-[20px] lg:text-[22px] font-bold text-orange-100">
                            বয়স: {toBengaliDigits(tvNextPatient.ageYears || 0)} বছর
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-h-0 text-center flex flex-col items-center justify-center space-y-1">
                        <div className="w-16 h-16 rounded-full bg-black/35 border border-white/25 text-white flex items-center justify-center mx-auto">
                          <Clock className="w-8 h-8 text-orange-100" />
                        </div>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white [text-shadow:0_2px_12px_rgba(30,8,0,0.6)]">বর্তমানে কোনো পরবর্তী অপেক্ষমান রোগী নেই</h3>
                        <p className="text-base lg:text-lg text-orange-100/80">নতুন রোগী সিরিয়াল দিলে এখানে স্বয়ংক্রিয়ভাবে ভেসে উঠবে</p>
                      </div>
                    )}
                  </div>
                </SpotlightCard>

              </div>

              {/* ডান কলাম (হরাইজন্টালে ৫ কলাম, ভার্টিক্যালে নিচে পূর্ণ প্রস্থ): পরবর্তী ১০ জনের সিরিয়াল তালিকা */}
              <div style={tvPanelFlex(1, 'tenList')} className={`lg:min-h-0 flex flex-col relative`}>
                {/* TV নিয়ন্ত্রণ আইকন — 'পরবর্তী রোগী' ও 'পরবর্তী ১০ জনের সিরিয়াল তালিকা' প্যানেলের মাঝের ফাঁকে, সবসময় দৃশ্যমান, ব্যাকগ্রাউন্ডবিহীন */}
                <div
                  className="pointer-events-auto absolute -top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 select-none"
                  role="toolbar"
                  aria-label="TV ডিসপ্লে ভিউ ও স্ক্রিন অরিয়েন্টেশন নিয়ন্ত্রণ"
                >
                  <button
                    type="button"
                    onClick={() => handleRotateTvDisplay(-1)}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-transparent text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] hover:text-indigo-200 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title={`স্ক্রিন বাম দিকে ৯০° ঘোরান (বর্তমান: ${toBengaliDigits(tvRotationDeg)}°)`}
                    aria-label="স্ক্রিন বাম দিকে ৯০ ডিগ্রি ঘোরান"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleResetTvDisplayRotation}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-transparent text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] hover:text-indigo-200 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title={`স্ক্রিন রিসেট করুন — স্বাভাবিক ল্যান্ডস্কেপ (০°) (বর্তমান: ${toBengaliDigits(tvRotationDeg)}°)`}
                    aria-label="স্ক্রিন রিসেট করুন, স্বাভাবিক ল্যান্ডস্কেপ শূন্য ডিগ্রি"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRotateTvDisplay(1)}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-transparent text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] hover:text-indigo-200 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title={`স্ক্রিন ডান দিকে ৯০° ঘোরান (বর্তমান: ${toBengaliDigits(tvRotationDeg)}° ভিউ)`}
                    aria-label="স্ক্রিন ডান দিকে ৯০ ডিগ্রি ঘোরান"
                  >
                    <RotateCw className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>

                <SpotlightCard dark data-tp="tenList" data-el="panel" className={`flex-1 lg:min-h-0${tvPanelHidden(1, 'tenList')}`}>
                  <div
                    style={{
                      backgroundColor: '#7A0A45',
                      backgroundImage: "linear-gradient(140deg, rgba(45,0,25,0.10) 0%, rgba(45,0,25,0.42) 60%, rgba(26,0,16,0.76) 100%), url('/images/tv-list-magenta.jpg')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    data-el="panel" className="h-full rounded-3xl pt-1 pb-1.5 px-2 sm:pt-1 sm:pb-2 sm:px-2.5 lg:pt-1 lg:pb-2.5 lg:px-3 shadow-2xl flex flex-col justify-between gap-1 transition-all duration-300 border-2 border-fuchsia-200/45 text-white"
                  >
                    <div className="relative flex items-center justify-center gap-2 border-b border-white/20 h-[32px] mb-1 shrink-0">
                      <div className="flex items-center justify-center min-w-0 gap-1.5">
                        <span style={{ fontFamily: "'Padmo', 'SolaimanLipi', 'Hind Siliguri', sans-serif" }} data-el="header" className="text-[28px] leading-none font-black uppercase tracking-wide block truncate text-fuchsia-50 [text-shadow:0_1px_6px_rgba(50,0,30,0.65)]">
                          পরবর্তী অপেক্ষমাণ রোগীদের সিরিয়াল তালিকা
                        </span>
                        <span className="text-sm lg:text-base bg-[#2E0018]/75 text-fuchsia-100 border border-fuchsia-200/35 px-2 py-0.5 rounded-full font-mono shrink-0">
                          {toBengaliDigits(tvWaitingPatientsList.length)} জন
                        </span>
                      </div>
                    </div>

                    {tvUpcomingTenPatients.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 flex-1 auto-rows-fr content-stretch overflow-y-auto pr-0.5 min-h-0 py-0">
                        {tvUpcomingTenPatients.map((patient, index) => (
                          <SpotlightCard key={patient.id} data-el="sub" variant="sub" dark className="h-full" surfaceClassName="h-full !bg-transparent">
                            <div
                              className="h-full px-1.5 py-1 rounded-2xl bg-white/[0.01] ring-1 ring-white/30 backdrop-blur-[1px] flex flex-col justify-between gap-0.5 transition-all duration-200 shadow-xs"
                            >
                              <div className="flex items-center gap-1.5 min-w-0 w-full">
                                <span className={`rounded-full bg-black/40 text-fuchsia-100 ${tvTenText.badge} font-mono font-black flex items-center justify-center shrink-0 border border-fuchsia-200/20`}>
                                  {toBengaliDigits(tvTenStartIndex + index + 1)}
                                </span>
                                <span style={tvTokenStyle} data-el="token" className={`font-mono ${tvTenText.serial} font-black text-white [text-shadow:0_2px_10px_rgba(45,0,25,0.7)] shrink-0`}>
                                  {toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)}
                                </span>
                                <div className={`min-w-0 flex-1 ${tvTenText.align}`}>
                                  <div style={tvNameStyle} data-el="name" className={`${(patient.name?.length || 0) > 20 ? 'text-[14px]' : 'text-[24px]'} font-black text-fuchsia-50 truncate leading-tight`}>
                                    {patient.name}
                                  </div>
                                  <div data-el="age" className={`${tvTenText.sub} text-fuchsia-100/85 leading-tight mt-1`}>
                                    বয়স: {toBengaliDigits(patient.ageYears || 0)} বছর
                                  </div>
                                </div>
                              </div>
                              <div data-el="call" className={`${tvTenText.proj} font-bold text-fuchsia-300/95 leading-tight w-full text-left whitespace-nowrap`}>
                                সম্ভাব্য ডাক: {getTvProjectedCallClock(patient)}
                              </div>
                            </div>
                          </SpotlightCard>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 py-6 text-center flex items-center justify-center text-base lg:text-lg font-bold text-fuchsia-100/85">
                        তালিকায় কোনো অতিরিক্ত অপেক্ষমান রোগী নেই
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              </div>

                {/* প্যানেল ৪: অনুপস্থিত রোগী */}
                <SpotlightCard dark data-tp="absent" data-el="panel" style={tvPanelFlex(1, 'absent')} className={`lg:min-h-0${tvPanelHidden(1, 'absent')}`}>
                  <div
                    style={{
                      backgroundColor: '#3F3F46',
                      backgroundImage: "linear-gradient(140deg, rgba(24,24,27,0.35) 0%, rgba(24,24,27,0.72) 100%), url('/images/tv-blue.jpg')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    data-el="panel" className="h-full pt-1 pb-1.5 px-2 sm:pt-1 sm:pb-2 sm:px-2.5 lg:pt-1 lg:pb-2.5 lg:px-3 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 flex flex-col border-2 border-rose-300/40 text-white"
                  >
                    <div className="relative flex items-center justify-center gap-2 border-b border-white/25 h-[32px] mb-1 shrink-0">
                      <div className="flex items-center justify-center min-w-0 gap-1.5">
                        <span style={{ fontFamily: "'Padmo', 'SolaimanLipi', 'Hind Siliguri', sans-serif" }} data-el="header" className="text-[28px] leading-none font-black uppercase tracking-wide block truncate text-rose-50 min-w-0 [text-shadow:0_1px_6px_rgba(40,10,0,0.6)]">
                          অনুপস্থিত
                        </span>
                        {tvAbsentPatients.length > 0 && (
                          <span className="text-sm lg:text-base bg-[#3F3F46]/70 text-rose-100 border border-rose-200/35 px-2 py-0.5 rounded-full font-mono shrink-0">
                            {toBengaliDigits(tvAbsentPatients.length)} জন
                          </span>
                        )}
                      </div>
                    </div>
                    {tvAbsentPatients.length > 0 ? (
                      <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-2 gap-1.5 sm:gap-2 lg:gap-2.5">
                        {tvAbsentPatients.slice(0, tvCount(1, 'absent', 8)).map(p => (
                          <div key={p.id} data-el="sub" className="flex flex-col items-center justify-center gap-1 px-1.5 py-1 rounded-xl bg-black/30 border border-white/20 min-w-0 overflow-hidden">
                            <span style={tvTokenStyle} data-el="token" className="font-mono font-black text-rose-100 text-[28px] leading-none">{toLatinDigits(queueTokenInfo.tokenLabelById.get(p.id) || `#${p.serialNumber}`)}</span>
                            <span style={tvNameStyle} data-el="name" className="block w-full text-center font-bold text-white text-lg sm:text-xl lg:text-[22px] 2xl:text-2xl leading-tight truncate">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-2 text-center">
                        <p className="text-sm sm:text-base lg:text-lg text-rose-100/80">এখনো কোনো রোগী অনুপস্থিত করা হয়নি</p>
                      </div>
                    )}
                  </div>
                </SpotlightCard>
            </div>
            </>
          </div>
        )}

        {/* ===== TV-2: ভার্টিক্যাল বোর্ড (ইফেক্ট ছাড়া, সফট মিন্ট হালকা) — স্বাধীন কপি ===== */}
        {activeTab === 'tv' && tvVariant === 2 && (currentUser?.isAdmin || currentUser?.isTvMode || currentUser?.role === 'tv') && typeof document !== 'undefined' && createPortal(
          <div style={getTvBoardStyle(2)} className="fixed inset-0 z-40 overflow-auto bg-black text-white">
            {/* ফেরত / লগআউট */}
            {currentUser?.isAdmin ? (
              <button type="button" onClick={() => setActiveTab(lastNonTvTabRef.current || 'queue')} title="স্বাভাবিক মোডে ফিরুন" aria-label="স্বাভাবিক মোডে ফিরুন"
                className="fixed right-3 top-3 z-50 h-9 w-9 rounded-full bg-white/90 border border-emerald-300 text-emerald-700 hover:bg-white shadow-sm transition cursor-pointer flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleLogout} title="লগআউট" aria-label="লগআউট করুন"
                className="fixed right-3 top-3 z-50 h-9 w-9 rounded-full bg-white/90 border border-emerald-300 text-rose-600 hover:bg-white shadow-sm transition cursor-pointer flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </button>
            )}
            {tvOrientationBar(false, 'center')}
            <div ref={tv2FitRef} className="mx-auto max-w-4xl px-3 py-4 flex flex-col gap-3">
              {/* চলমান */}
              <div data-tp="called" data-el="panel" className={`bg-white/90 border border-emerald-200 rounded-2xl shadow-sm p-3${tvPanelHidden(2, 'called')}`}>
                <div className="border-b border-emerald-100 pb-1.5 mb-2">
                  <span data-el="header" className="text-lg sm:text-xl font-black uppercase tracking-wide text-emerald-800">বর্তমানে চেম্বারের ভিতর অবস্থান করতে পারবেন</span>
                </div>
                {tvCalledPatientsSorted.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tvCalledPatientsSorted.slice(0, tvCount(2, 'called', 4)).map((patient, idx) => (
                      <div key={patient.id} data-el="sub" className={`rounded-xl px-3 py-2 border ${idx === 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}${tvHighlightOnCall && idx === 0 ? ' amh-tv-pulse' : ''}`}>
                        <div className="flex items-baseline gap-2 min-w-0">
                          <span style={tvTokenStyle} data-el="token" className={`text-xl font-black leading-none shrink-0 ${idx === 0 ? 'text-emerald-700' : 'text-slate-700'}`}>{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)};</span>
                          <h3 style={tvNameStyle} data-el="name" className="font-black text-slate-900 truncate leading-tight text-lg">{patient.name}</h3>
                        </div>
                        <span data-el="age" className="text-sm font-bold text-slate-600">বয়স: {toBengaliDigits(patient.ageYears || 0)} বছর</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <h3 className="text-xl font-black text-slate-800">বর্তমানে চেম্বারে কোনো রোগী উপস্থিত নেই</h3>
                    <p className="text-sm text-slate-500">রোগী ডাকলে এখানে নাম দেখা যাবে</p>
                  </div>
                )}
              </div>
              {tvInsidePanel(2, false, false)}
              {/* পরবর্তী */}
              <div data-tp="next" data-el="panel" className={`bg-white/90 border border-emerald-200 rounded-2xl shadow-sm p-3${tvPanelHidden(2, 'next')}`}>
                <div className="border-b border-emerald-100 pb-1.5 mb-2">
                  <span data-el="header" className="text-lg sm:text-xl font-black uppercase tracking-wide text-emerald-800">পরবর্তী রোগী</span>
                </div>
                {tvNextPatient ? (
                  <div data-el="sub" className="flex items-baseline gap-3 min-w-0">
                    <span style={tvTokenStyle} data-el="token" className="font-mono font-black leading-none text-slate-900 text-4xl">{toLatinDigits(queueTokenInfo.tokenLabelById.get(tvNextPatient.id) || `#${tvNextPatient.serialNumber}`)};</span>
                    <h4 style={tvNameStyle} data-el="name" className="font-black text-slate-900 truncate leading-tight text-3xl">{tvNextPatient.name}</h4>
                    <p data-el="age" className="text-base font-bold text-slate-600 shrink-0">বয়স: {toBengaliDigits(tvNextPatient.ageYears || 0)} বছর</p>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <h3 className="text-xl font-black text-slate-800">বর্তমানে কোনো পরবর্তী অপেক্ষমাণ রোগী নেই</h3>
                    <p className="text-sm text-slate-500">নতুন রোগী সিরিয়াল দিলে এখানে স্বয়ংক্রিয়ভাবে ভেসে উঠবে</p>
                  </div>
                )}
              </div>
              {/* পরবর্তী ১০ জন */}
              <div data-tp="tenList" data-el="panel" className={`bg-white/90 border border-emerald-200 rounded-2xl shadow-sm p-3${tvPanelHidden(2, 'tenList')}`}>
                <div className="border-b border-emerald-100 pb-1.5 mb-2 flex items-center gap-2">
                  <span data-el="header" className="text-lg sm:text-xl font-black uppercase tracking-wide text-emerald-800">পরবর্তী অপেক্ষমাণ রোগীদের সিরিয়াল তালিকা</span>
                  <span className="text-sm bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono shrink-0">{toBengaliDigits(tvWaitingPatientsList.length)} জন</span>
                </div>
                {tvUpcomingTenPatients.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tvUpcomingTenPatients.map((patient, index) => (
                      <div key={patient.id} data-el="sub" className="rounded-xl px-2.5 py-2 border border-slate-200 bg-slate-50 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-sm font-mono font-black w-7 h-7 flex items-center justify-center shrink-0">{toBengaliDigits(tvTenStartIndex + index + 1)}</span>
                          <span style={tvTokenStyle} data-el="token" className="font-mono font-black text-slate-900 shrink-0">{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)}</span>
                          <span style={tvNameStyle} data-el="name" className="font-black text-slate-900 truncate leading-tight flex-1">{patient.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span data-el="age" className="text-slate-600 font-bold">বয়স: {toBengaliDigits(patient.ageYears || 0)} বছর</span>
                          <span data-el="call" className="text-teal-700 font-bold">সম্ভাব্য ডাক: {getTvProjectedCallClock(patient)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm font-bold text-slate-500">তালিকায় কোনো অতিরিক্ত অপেক্ষমান রোগী নেই</div>
                )}
              </div>
              {/* অনুপস্থিত */}
              <div data-tp="absent" data-el="panel" className={`bg-white/90 border border-emerald-200 rounded-2xl shadow-sm p-3${tvPanelHidden(2, 'absent')}`}>
                <div className="border-b border-emerald-100 pb-1.5 mb-2 flex items-center gap-2">
                  <span data-el="header" className="text-lg sm:text-xl font-black uppercase tracking-wide text-rose-700">অনুপস্থিত</span>
                  {tvAbsentPatients.length > 0 && <span className="text-sm bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-mono shrink-0">{toBengaliDigits(tvAbsentPatients.length)} জন</span>}
                </div>
                {tvAbsentPatients.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {tvAbsentPatients.slice(0, tvCount(2, 'absent', 8)).map(p => (
                      <div key={p.id} data-el="sub" className="flex flex-col items-center justify-center gap-0.5 px-1.5 py-2 rounded-xl bg-rose-50 border border-rose-200 min-w-0 overflow-hidden">
                        <span style={tvTokenStyle} data-el="token" className="font-mono font-black text-rose-700 text-xl leading-none">{toLatinDigits(queueTokenInfo.tokenLabelById.get(p.id) || `#${p.serialNumber}`)}</span>
                        <span style={tvNameStyle} data-el="name" className="block w-full text-center font-bold text-slate-800 text-sm leading-tight truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-center text-sm text-slate-500">এখনো কোনো রোগী অনুপস্থিত করা হয়নি</div>
                )}
              </div>
            </div>
          </div>
          , document.body
        )}

        {/* ===== TV-3: হরাইজেন্টাল বোর্ড (গ্রাফিক্স/ইফেক্টসহ) — স্বাধীন কপি ===== */}
        {activeTab === 'tv' && tvVariant === 3 && (currentUser?.isAdmin || currentUser?.isTvMode || currentUser?.role === 'tv') && typeof document !== 'undefined' && createPortal(
          <div style={getTvBoardStyle(3)} className="fixed inset-0 z-40 overflow-auto bg-black text-white">
            {currentUser?.isAdmin ? (
              <button type="button" onClick={() => setActiveTab(lastNonTvTabRef.current || 'queue')} title="স্বাভাবিক মোডে ফিরুন" aria-label="স্বাভাবিক মোডে ফিরুন"
                className="fixed right-3 top-3 z-50 h-9 w-9 rounded-full bg-white/10 border border-white/25 text-white hover:bg-white/20 transition cursor-pointer flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleLogout} title="লগআউট" aria-label="লগআউট করুন"
                className="fixed right-3 top-3 z-50 h-9 w-9 rounded-full bg-white/10 border border-white/25 text-white hover:bg-white/20 transition cursor-pointer flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <div className={`w-full h-full p-3 grid grid-cols-1 ${tvHColumns === 2 ? 'lg:grid-cols-2' : tvHColumns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3`}>
              {/* কলাম ১: চলমান + পরবর্তী */}
              <div className="flex flex-col gap-3 min-h-0">
                <div style={{ backgroundColor: '#064E3B' }} data-tp="called" data-el="panel" className={`flex-1 min-h-0 rounded-3xl shadow-2xl border-2 border-emerald-400 p-3 flex flex-col${tvPanelHidden(3, 'called')}`}>
                  <div className="border-b border-white/20 pb-1 mb-2"><span data-el="header" className="text-2xl font-black uppercase tracking-wide text-emerald-300">বর্তমানে চেম্বারের ভিতর অবস্থান করতে পারবেন</span></div>
                  {tvCalledPatientsSorted.length > 0 ? (
                    <div className="flex-1 min-h-0 grid grid-cols-1 gap-2 overflow-y-auto">
                      {tvCalledPatientsSorted.slice(0, tvCount(3, 'called', 4)).map((patient, idx) => (
                        <div key={patient.id} data-el="sub" className={`flex items-center gap-2 rounded-2xl px-3 py-2 border ${idx === 0 ? 'bg-white/10 border-emerald-300/40' : 'bg-white/[0.04] border-white/15'}${tvHighlightOnCall && idx === 0 ? ' amh-tv-pulse' : ''}`}>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2 min-w-0">
                              <span style={tvTokenStyle} data-el="token" className={`text-xl font-black leading-none shrink-0 ${idx === 0 ? 'text-emerald-300' : 'text-white/85'}`}>{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)};</span>
                              <h3 style={tvNameStyle} data-el="name" className="font-black text-white truncate leading-tight text-lg">{patient.name}</h3>
                            </div>
                            <span data-el="age" className="text-sm opacity-85 font-bold">বয়স: {toBengaliDigits(patient.ageYears || 0)} বছর</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 text-center flex flex-col items-center justify-center"><h3 className="text-2xl font-black text-white">বর্তমানে চেম্বারে কোনো রোগী উপস্থিত নেই</h3></div>
                  )}
                </div>
                {tvInsidePanel(3, true, true, { backgroundImage: 'none', backgroundColor: '#1E1B4B' })}
              </div>
              {/* কলাম ২: পরবর্তী + অনুপস্থিত */}
              <div className="flex flex-col gap-3 min-h-0">
                <div style={{ backgroundColor: '#7A2E05' }} data-tp="next" data-el="panel" className={`flex-1 min-h-0 rounded-3xl shadow-2xl border-2 border-orange-300/45 p-3 flex flex-col${tvPanelHidden(3, 'next')}`}>
                  <div className="border-b border-white/25 pb-1 mb-2"><span data-el="header" className="text-2xl font-black uppercase tracking-wide text-orange-50">পরবর্তী রোগী</span></div>
                  {tvNextPatient ? (
                    <div className="flex-1 min-h-0 flex items-center">
                      <div className="flex-1 min-w-0 rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-2">
                        <div data-el="sub" className="flex items-baseline gap-3 min-w-0">
                          <span style={tvTokenStyle} data-el="token" className="font-mono font-black leading-none text-white text-4xl">{toLatinDigits(queueTokenInfo.tokenLabelById.get(tvNextPatient.id) || `#${tvNextPatient.serialNumber}`)};</span>
                          <h4 style={tvNameStyle} data-el="name" className="font-black text-white truncate leading-tight text-3xl">{tvNextPatient.name}</h4>
                        </div>
                        <p data-el="age" className="text-base font-bold text-orange-100">বয়স: {toBengaliDigits(tvNextPatient.ageYears || 0)} বছর</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 text-center flex flex-col items-center justify-center"><h3 className="text-2xl font-black text-white">বর্তমানে কোনো পরবর্তী অপেক্ষমান রোগী নেই</h3></div>
                  )}
                </div>
              <div style={{ backgroundColor: '#3F3F46' }} data-tp="absent" data-el="panel" className={`flex-1 min-h-0 rounded-3xl shadow-2xl border-2 border-rose-300/40 p-3 flex flex-col${tvPanelHidden(3, 'absent')}`}>
                <div className="border-b border-white/25 pb-1 mb-2 flex items-center gap-2"><span data-el="header" className="text-2xl font-black uppercase tracking-wide text-rose-50">অনুপস্থিত</span>{tvAbsentPatients.length > 0 && <span className="text-sm bg-[#3F3F46]/70 text-rose-100 border border-rose-200/35 px-2 py-0.5 rounded-full font-mono shrink-0">{toBengaliDigits(tvAbsentPatients.length)} জন</span>}</div>
                {tvAbsentPatients.length > 0 ? (
                  <div className="flex-1 min-h-0 grid grid-cols-2 content-start gap-2 overflow-y-auto">
                    {tvAbsentPatients.slice(0, tvCount(3, 'absent', 8)).map(p => (
                      <div key={p.id} data-el="sub" className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl bg-black/30 border border-white/20 min-w-0 overflow-hidden">
                        <span style={tvTokenStyle} data-el="token" className="font-mono font-black text-rose-100 text-2xl leading-none">{toLatinDigits(queueTokenInfo.tokenLabelById.get(p.id) || `#${p.serialNumber}`)}</span>
                        <span style={tvNameStyle} data-el="name" className="block w-full text-center font-bold text-white text-sm leading-tight truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-center text-rose-100/80">এখনো কোনো রোগী অনুপস্থিত করা হয়নি</div>
                )}
              </div>
              </div>
              {/* কলাম ৩: পরবর্তী ১০ জনের */}
              <div style={{ backgroundColor: '#7A0A45' }} data-tp="tenList" data-el="panel" className={`relative min-h-0 rounded-3xl shadow-2xl border-2 border-fuchsia-200/45 p-3 flex flex-col${tvPanelHidden(3, 'tenList')}`}>
                {tvOrientationBar(true, 'center')}
                <div className="border-b border-white/20 pb-1 mb-2 flex items-center gap-2"><span data-el="header" className="text-2xl font-black uppercase tracking-wide text-fuchsia-50">পরবর্তী অপেক্ষমাণ রোগীদের সিরিয়াল তালিকা</span><span className="text-sm bg-[#2E0018]/75 text-fuchsia-100 border border-fuchsia-200/35 px-2 py-0.5 rounded-full font-mono shrink-0">{toBengaliDigits(tvWaitingPatientsList.length)} জন</span></div>
                {tvUpcomingTenPatients.length > 0 ? (
                  <div className="flex-1 min-h-0 grid grid-cols-1 gap-1.5 overflow-y-auto">
                    {tvUpcomingTenPatients.map((patient, index) => (
                      <div key={patient.id} data-el="sub" className="px-2.5 py-1.5 rounded-2xl bg-white/[0.03] ring-1 ring-white/25 flex items-center gap-2 min-w-0">
                        <span className="rounded-full bg-black/40 text-fuchsia-100 text-sm font-mono font-black w-7 h-7 flex items-center justify-center shrink-0 border border-fuchsia-200/20">{toBengaliDigits(tvTenStartIndex + index + 1)}</span>
                        <span style={tvTokenStyle} data-el="token" className="font-mono font-black text-white shrink-0">{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)}</span>
                        <div className="min-w-0 flex-1">
                          <div style={tvNameStyle} data-el="name" className="font-black text-fuchsia-50 truncate leading-tight">{patient.name}</div>
                          <div data-el="age" className="text-fuchsia-100/85 text-xs leading-tight">বয়স: {toBengaliDigits(patient.ageYears || 0)} বছর · সম্ভাব্য ডাক: {getTvProjectedCallClock(patient)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 text-center flex items-center justify-center font-bold text-fuchsia-100/85">তালিকায় কোনো অতিরিক্ত অপেক্ষমান রোগী নেই</div>
                )}
              </div>
            </div>
          </div>
          , document.body
        )}

        {/* ===== TV-4: হরাইজেন্টাল বোর্ড (ইফেক্ট ছাড়া, সফট মিন্ট হালকা) — স্বাধীন কপি ===== */}
        {activeTab === 'tv' && tvVariant === 4 && (currentUser?.isAdmin || currentUser?.isTvMode || currentUser?.role === 'tv') && typeof document !== 'undefined' && createPortal(
          <div style={getTvBoardStyle(4)} className="fixed inset-0 z-40 overflow-auto bg-black text-white">
            {currentUser?.isAdmin ? (
              <button type="button" onClick={() => setActiveTab(lastNonTvTabRef.current || 'queue')} title="স্বাভাবিক মোডে ফিরুন" aria-label="স্বাভাবিক মোডে ফিরুন"
                className="fixed right-3 top-3 z-50 h-9 w-9 rounded-full bg-white/90 border border-emerald-300 text-emerald-700 hover:bg-white shadow-sm transition cursor-pointer flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleLogout} title="লগআউট" aria-label="লগআউট করুন"
                className="fixed right-3 top-3 z-50 h-9 w-9 rounded-full bg-white/90 border border-emerald-300 text-rose-600 hover:bg-white shadow-sm transition cursor-pointer flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <div className={`w-full h-full p-3 grid grid-cols-1 ${tvHColumns === 2 ? 'lg:grid-cols-2' : tvHColumns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3`}>
              <div className="flex flex-col gap-3 min-h-0">
                <div style={{ backgroundColor: '#064E3B' }} data-tp="called" data-el="panel" className={`flex-1 min-h-0 rounded-2xl shadow-sm border-2 border-emerald-400/60 p-3 flex flex-col${tvPanelHidden(4, 'called')}`}>
                  <div className="border-b border-white/20 pb-1.5 mb-2"><span data-el="header" className="text-xl font-black uppercase tracking-wide text-emerald-200">বর্তমানে চেম্বারের ভিতর অবস্থান করতে পারবেন</span></div>
                  {tvCalledPatientsSorted.length > 0 ? (
                    <div className="flex-1 min-h-0 grid grid-cols-1 gap-2 overflow-y-auto">
                      {tvCalledPatientsSorted.slice(0, tvCount(4, 'called', 4)).map((patient, idx) => (
                        <div key={patient.id} data-el="sub" className={`rounded-xl px-3 py-2 border ${idx === 0 ? 'bg-white/10 border-emerald-300/40' : 'bg-white/[0.04] border-white/15'}${tvHighlightOnCall && idx === 0 ? ' amh-tv-pulse' : ''}`}>
                          <div className="flex items-baseline gap-2 min-w-0">
                            <span style={tvTokenStyle} data-el="token" className={`text-xl font-black leading-none shrink-0 ${idx === 0 ? 'text-emerald-300' : 'text-white/85'}`}>{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)};</span>
                            <h3 style={tvNameStyle} data-el="name" className="font-black text-white truncate leading-tight text-lg">{patient.name}</h3>
                          </div>
                          <span data-el="age" className="text-sm font-bold text-emerald-100/80">বয়স: {toBengaliDigits(patient.ageYears || 0)} বছর</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 text-center flex flex-col items-center justify-center"><h3 className="text-xl font-black text-white">বর্তমানে চেম্বারে কোনো রোগী উপস্থিত নেই</h3></div>
                  )}
                </div>
                {tvInsidePanel(4, true, true, { backgroundImage: 'none', backgroundColor: '#064E3B' })}
              </div>
              <div className="flex flex-col gap-3 min-h-0">
                <div style={{ backgroundColor: '#065F46' }} data-tp="next" data-el="panel" className={`flex-1 min-h-0 rounded-2xl shadow-sm border-2 border-emerald-300/45 p-3 flex flex-col${tvPanelHidden(4, 'next')}`}>
                  <div className="border-b border-white/25 pb-1.5 mb-2"><span data-el="header" className="text-xl font-black uppercase tracking-wide text-emerald-50">পরবর্তী রোগী</span></div>
                  {tvNextPatient ? (
                    <div className="flex-1 min-h-0 flex items-center">
                      <div className="flex-1 min-w-0 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
                        <div data-el="sub" className="flex items-baseline gap-3 min-w-0">
                          <span style={tvTokenStyle} data-el="token" className="font-mono font-black leading-none text-white text-3xl">{toLatinDigits(queueTokenInfo.tokenLabelById.get(tvNextPatient.id) || `#${tvNextPatient.serialNumber}`)};</span>
                          <h4 style={tvNameStyle} data-el="name" className="font-black text-white truncate leading-tight text-2xl">{tvNextPatient.name}</h4>
                        </div>
                        <p data-el="age" className="text-sm font-bold text-emerald-100/85">বয়স: {toBengaliDigits(tvNextPatient.ageYears || 0)} বছর</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 text-center flex flex-col items-center justify-center"><h3 className="text-xl font-black text-white">বর্তমানে কোনো পরবর্তী অপেক্ষমান রোগী নেই</h3></div>
                  )}
                </div>
                <div style={{ backgroundColor: '#4C0519' }} data-tp="absent" data-el="panel" className={`flex-1 min-h-0 rounded-2xl shadow-sm border-2 border-rose-300/40 p-3 flex flex-col${tvPanelHidden(4, 'absent')}`}>
                  <div className="border-b border-white/25 pb-1.5 mb-2 flex items-center gap-2"><span data-el="header" className="text-xl font-black uppercase tracking-wide text-rose-50">অনুপস্থিত</span>{tvAbsentPatients.length > 0 && <span className="text-sm bg-rose-400/20 text-rose-100 border border-rose-200/35 px-2 py-0.5 rounded-full font-mono shrink-0">{toBengaliDigits(tvAbsentPatients.length)} জন</span>}</div>
                  {tvAbsentPatients.length > 0 ? (
                    <div className="flex-1 min-h-0 grid grid-cols-2 content-start gap-2 overflow-y-auto">
                      {tvAbsentPatients.slice(0, tvCount(4, 'absent', 8)).map(p => (
                        <div key={p.id} data-el="sub" className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl bg-black/30 border border-white/20 min-w-0 overflow-hidden">
                          <span style={tvTokenStyle} data-el="token" className="font-mono font-black text-rose-100 text-2xl leading-none">{toLatinDigits(queueTokenInfo.tokenLabelById.get(p.id) || `#${p.serialNumber}`)}</span>
                          <span style={tvNameStyle} data-el="name" className="block w-full text-center font-bold text-white text-sm leading-tight truncate">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 text-center text-rose-100/80">এখনো কোনো রোগী অনুপস্থিত করা হয়নি</div>
                  )}
                </div>
              </div>
              <div style={{ backgroundColor: '#064E3B' }} data-tp="tenList" data-el="panel" className={`relative min-h-0 rounded-2xl shadow-sm border-2 border-emerald-300/45 p-3 flex flex-col${tvPanelHidden(4, 'tenList')}`}>
                {tvOrientationBar(false, 'center')}
                <div className="border-b border-white/20 pb-1.5 mb-2 flex items-center gap-2"><span data-el="header" className="text-xl font-black uppercase tracking-wide text-emerald-50">পরবর্তী অপেক্ষমাণ রোগীদের সিরিয়াল তালিকা</span><span className="text-sm bg-emerald-400/20 text-emerald-100 border border-emerald-200/35 px-2 py-0.5 rounded-full font-mono shrink-0">{toBengaliDigits(tvWaitingPatientsList.length)} জন</span></div>
                {tvUpcomingTenPatients.length > 0 ? (
                  <div className="flex-1 min-h-0 grid grid-cols-1 gap-1.5 overflow-y-auto">
                    {tvUpcomingTenPatients.map((patient, index) => (
                      <div key={patient.id} data-el="sub" className="px-2.5 py-1.5 rounded-xl bg-white/[0.03] ring-1 ring-white/25 flex items-center gap-2 min-w-0">
                        <span className="rounded-full bg-black/40 text-emerald-100 border border-emerald-200/20 text-sm font-mono font-black w-7 h-7 flex items-center justify-center shrink-0">{toBengaliDigits(tvTenStartIndex + index + 1)}</span>
                        <span style={tvTokenStyle} data-el="token" className="font-mono font-black text-white shrink-0">{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)}</span>
                        <div className="min-w-0 flex-1">
                          <div style={tvNameStyle} data-el="name" className="font-black text-emerald-50 truncate leading-tight">{patient.name}</div>
                          <div data-el="age" className="text-emerald-100/85 text-xs leading-tight">বয়স: {toBengaliDigits(patient.ageYears || 0)} বছর · সম্ভাব্য ডাক: {getTvProjectedCallClock(patient)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 text-center flex items-center justify-center font-bold text-emerald-100/85">তালিকায় কোনো অতিরিক্ত অপেক্ষমান রোগী নেই</div>
                )}
              </div>
            </div>
          </div>
          , document.body
        )}

        {/* TV মোডে সাধারণ ওভারলে: খালি হলে স্বাগত স্ক্রিন + নিচে চলমান ঘোষণা (যেকোনো ভ্যারিয়েন্টে, body-পোর্টালে) */}
        {activeTab === 'tv' && typeof document !== 'undefined' && createPortal(
          <>{renderTvWelcome()}{renderTvMarquee()}</>,
          document.body
        )}

        {/* গেস্ট সিরিয়াল আবেদন — এডমিন/স্টাফ অনুমোদন প্যানেল (অনুমোদন না করলে কিউ-তে সিরিয়াল বরাদ্দ হয় না) */}
        {activeTab === 'register' && !currentUser?.isGuest && visibleApplications.length > 0 && (
          <SpotlightCard className="max-w-xl mx-auto mb-3">
          <div className={`${themeStyles.card} p-4 sm:p-5 space-y-3`}>
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <h2 className="text-sm font-black text-slate-900 truncate">সিরিয়াল আবেদন</h2>
                {pendingApplicationCount > 0 && (
                  <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-lg shrink-0">
                    অপেক্ষমাণ {toBengaliDigits(pendingApplicationCount)}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold opacity-70 shrink-0 text-right">
                {vacantSerialsByDate.get(TODAY_KEY)?.length > 0
                  ? `আবেদনের টোকেন বুক · ফাঁকা: ${vacantSerialsByDate.get(TODAY_KEY).map(n => `#${toBengaliDigits(n)}`).join(', ')}`
                  : 'আবেদনের মুহূর্তে টোকেন বুক হয়'}
              </span>
            </div>

            <div className="space-y-2">
              {visibleApplications.map((app) => {
                const chipClass = app.status === 'APPROVED'
                  ? 'bg-emerald-600 text-white'
                  : app.status === 'REJECTED'
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-500 text-white';
                return (
                  <SpotlightCard variant="sub" key={app.id}>
                  <div className={`${themeStyles.subCard} p-3 rounded-2xl`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-black text-slate-900 truncate">{app.name}</p>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${chipClass}`}>
                            {appStatusLabel(app.status)}
                          </span>
                          {app.isChildUnder4 && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-100 text-sky-900">শিশু কোটা</span>
                          )}
                        </div>
                        <p className="text-[11px] opacity-85 flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          <a href={`tel:${app.normalizedPhone || app.phoneNumber}`} className="font-bold hover:underline break-all">
                            {toBengaliDigits(app.phoneNumber || '')}
                          </a>
                        </p>
                        <p className="text-[11px] opacity-80">
                          বয়স {toBengaliDigits(app.ageYears || 0)} বছর · তারিখ {formatDateToDDMMYYYY(app.appointmentDate)} · বুক টোকেন #{toBengaliDigits(applicationSerialOf(app) || '—')}
                        </p>
                        {app.symptoms && (
                          <p className="text-[11px] opacity-70 truncate">লক্ষণ: {app.symptoms}</p>
                        )}
                        <p className="text-[10px] opacity-60">
                          {toBengaliDigits(app.appliedAt || '')} {app.appliedByName ? `· ${app.appliedByName}` : ''}
                          {app.status === 'APPROVED'
                            ? ` · অনুমোদিত ${app.decidedByName || ''} ${toBengaliDigits(app.decidedAt || '')} → টোকেন #${toBengaliDigits(app.grantedSerial || '')}`
                            : ''}
                          {app.status === 'REJECTED' ? ` · ${app.rejectReason || 'অনুমোদিত হয়নি'} — টোকেন #${toBengaliDigits(applicationSerialOf(app))} ফাঁকা থাকবে` : ''}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col gap-1.5 items-end">
                        {app.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => approveGuestApplication(app)}
                              aria-label={`${app.name} এর আবেদন অনুমোদন করুন`}
                              className="min-h-[36px] px-2.5 rounded-lg text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition cursor-pointer shadow-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              অনুমোদন
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectGuestApplication(app)}
                              aria-label={`${app.name} এর আবেদন বাতিল করুন`}
                              className="min-h-[36px] px-2.5 rounded-lg text-[11px] font-black bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1 transition cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              বাতিল
                            </button>
                          </>
                        )}
                        {app.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => {
                              const list = patientsByDate[app.appointmentDate] || [];
                              const granted = list.find(p => p.id === app.grantedPatientId) || list.find(p => Number(p.serialNumber) === Number(app.grantedSerial));
                              if (granted) handleSendWhatsApp(granted, list);
                            }}
                            aria-label={`${app.name} কে হোয়াটসঅ্যাপে সিরিয়াল পাঠান`}
                            title="হোয়াটসঅ্যাপে সিরিয়াল পাঠান"
                            className="min-h-[36px] px-2.5 rounded-lg text-[11px] font-black bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1 transition cursor-pointer shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            পাঠান
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => dismissGuestApplication(app)}
                          aria-label="আবেদনটি তালিকা থেকে সরান"
                          title="তালিকা থেকে সরান"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>
          </SpotlightCard>
        )}

        {/* গেস্টের নিজের আবেদনের অবস্থা (এই ডিভাইসের নম্বর অনুযায়ী) */}
        {activeTab === 'register' && currentUser?.isGuest && guestOwnApplications.length > 0 && (
          <SpotlightCard className="max-w-xl mx-auto mb-3">
          <div className={`${themeStyles.card} p-4 sm:p-5 space-y-2.5`}>
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <h2 className="text-sm font-black text-slate-900">আমার আবেদন</h2>
              <span className="text-[10px] font-bold opacity-70 ml-auto">
                {toBengaliDigits(guestOwnApplications.length)} টি
              </span>
            </div>
            {guestOwnApplications.map((app) => (
              <SpotlightCard variant="sub" key={app.id}>
              <div className={`${themeStyles.subCard} p-3 rounded-2xl flex items-start justify-between gap-2`}>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-black text-slate-900 truncate">{app.name}</p>
                  <p className="text-[11px] opacity-80">
                    তারিখ {formatDateToDDMMYYYY(app.appointmentDate)} · টোকেন #{toBengaliDigits(applicationSerialOf(app) || '—')}
                  </p>
                  {app.status === 'APPROVED' && (
                    <p className="text-[11px] font-black text-emerald-700">
                      অনুমোদিত — আপনার টোকেন #{toBengaliDigits(app.grantedSerial || '')} নিশ্চিত হয়েছে
                    </p>
                  )}
                  {app.status === 'REJECTED' && (
                    <p className="text-[11px] font-bold text-rose-700">{app.rejectReason || 'অনুমোদিত হয়নি'}</p>
                  )}
                  {app.status === 'PENDING' && (
                    <p className="text-[11px] font-bold text-amber-700">টোকেন #{toBengaliDigits(applicationSerialOf(app))} আপনার নামে বুক আছে — অনুমোদন করলে এই নম্বরটিই আপনার সিরিয়াল হবে</p>
                  )}
                </div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 ${app.status === 'APPROVED' ? 'bg-emerald-600 text-white' : app.status === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
                  {appStatusLabel(app.status)}
                </span>
              </div>
              </SpotlightCard>
            ))}
          </div>
          </SpotlightCard>
        )}
        {/* Registration Panel */}
        {activeTab === 'register' && (
          <SpotlightCard className="max-w-xl mx-auto">
          <div className={`${themeStyles.card} p-5 sm:p-6 space-y-4`}>
            <div className="border-b border-slate-200 pb-2.5 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-black text-slate-900">{t.navRegister}</h2>
                {currentUser?.isGuest && (
                  <p className="text-[11px] opacity-75">
                    বাংলাদেশি মোবাইল নম্বর দিয়ে আবেদন করুন — আবেদনের মুহূর্তেই একটি টোকেন আপনার নামে বুক হবে, এডমিন/স্টাফ অনুমোদন করলে সেই টোকেনই আপনার সিরিয়াল হবে।
                  </p>
                )}
              </div>
              {!currentUser?.isGuest && (
                <div className="w-full sm:w-60 shrink-0 space-y-1">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
                    <Search className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Patient ID দিয়ে সিরিয়াল বুক করুন</span>
                  </label>
                  <input
                    type="text"
                    value={registerIdSearch}
                    onChange={(e) => setRegisterIdSearch(e.target.value)}
                    placeholder="যেমন: AMH-00001"
                    aria-label="Patient ID লিখে রোগী খুঁজুন"
                    className={`w-full px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none ${themeStyles.input}`}
                  />
                  {registerIdSearch.trim() && (
                    <div className="space-y-1">
                      {registerIdMatches.length === 0 ? (
                        <p className="text-[10px] font-bold text-rose-700">এই ID-তে কোনো রোগী পাওয়া যায়নি</p>
                      ) : (
                        registerIdMatches.map((rec) => (
                          <div key={rec.patientCode} className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-slate-900 truncate">{rec.name}</p>
                              <p className="text-[9px] font-mono font-bold text-slate-600">{rec.patientCode}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleBookSerialForRecord(rec)}
                              aria-label={`${rec.name} কে সিরিয়াল দিন`}
                              className="shrink-0 min-h-[30px] px-2 rounded-lg text-[10px] font-black bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-xs"
                            >
                              সিরিয়াল দিন
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-3.5">
              <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end">
                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-xs font-bold mb-1 truncate">{t.patientName}</label>
                  <input
                    ref={patientNameInputRef}
                    type="text"
                    required
                    lang="bn"
                    enterKeyHint="next"
                    placeholder={t.namePlaceholder}
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.keyCode === 13) {
                        e.preventDefault();
                        if (ageYears.trim() && patientName.trim()) {
                          handleRegisterPatient(e);
                        } else if (ageYearsInputRef.current) {
                          ageYearsInputRef.current.focus();
                        }
                      }
                    }}
                    className={`w-full px-3 py-3 text-sm font-semibold focus:outline-none ${themeStyles.input}`}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-xs font-bold mb-1 truncate">{t.ageYears}</label>
                  <input
                    ref={ageYearsInputRef}
                    type="text"
                    inputMode="numeric"
                    required
                    enterKeyHint="go"
                    placeholder="২৫"
                    value={ageYears}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9০-৯]/g, '');
                      setAgeYears(val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.keyCode === 13) {
                        e.preventDefault();
                        if (!patientName.trim()) {
                          patientNameInputRef.current?.focus();
                        } else {
                          handleRegisterPatient(e);
                        }
                      }
                    }}
                    className={`w-full px-2 py-3 text-sm font-bold text-center focus:outline-none ${themeStyles.input}`}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-xs font-bold mb-1 truncate">{t.ageMonths}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    enterKeyHint="go"
                    placeholder="০"
                    value={ageMonths}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9০-৯]/g, '');
                      setAgeMonths(val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.keyCode === 13) {
                        e.preventDefault();
                        if (!patientName.trim()) {
                          patientNameInputRef.current?.focus();
                        } else {
                          handleRegisterPatient(e);
                        }
                      }
                    }}
                    className={`w-full px-2 py-3 text-sm font-bold text-center focus:outline-none ${themeStyles.input}`}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-xs font-bold mb-1 truncate">{t.ageDays}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    enterKeyHint="go"
                    placeholder="০"
                    value={ageDays}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9০-৯]/g, '');
                      setAgeDays(val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.keyCode === 13) {
                        e.preventDefault();
                        if (!patientName.trim()) {
                          patientNameInputRef.current?.focus();
                        } else {
                          handleRegisterPatient(e);
                        }
                      }
                    }}
                    className={`w-full px-2 py-3 text-sm font-bold text-center focus:outline-none ${themeStyles.input}`}
                  />
                </div>
              </div>

              {/* Age presets + ডান পাশে আইকন-অনলি সিরিয়াল নিশ্চিত বাটন */}
              <div className="pt-1 flex items-stretch gap-2">
                <SpotlightCard variant="sub" className="flex-1 min-w-0">
                <div className={`${themeStyles.subCard} p-3 rounded-2xl transition flex flex-col justify-between h-full`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.quickPresets}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenAgePanel(!openAgePanel)}
                      aria-label={openAgePanel ? 'দ্রুত বয়স নির্বাচন লুকান' : 'দ্রুত বয়স নির্বাচন দেখুন'}
                      aria-expanded={openAgePanel}
                      className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-200 opacity-75 hover:opacity-100 transition cursor-pointer"
                    >
                      {openAgePanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {openAgePanel && (
                    <div className="grid grid-cols-7 sm:grid-cols-[repeat(14,minmax(0,1fr))] gap-1 sm:gap-0.5 pt-2">
                      {AGE_PRESETS.map((p) => {
                        const isSelected = parseBengaliDigits(ageYears) === String(p.years) && parseBengaliDigits(ageMonths) === String(p.months);
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setAgeYears(toBengaliDigits(p.years));
                              setAgeMonths(toBengaliDigits(p.months));
                            }}
                            className={`min-h-[42px] w-full px-0.5 py-1 text-[10px] sm:text-[10px] font-bold leading-none whitespace-nowrap rounded-md border transition cursor-pointer flex items-center justify-center ${
                              isSelected ? `${themeStyles.presetActive || 'bg-emerald-700 text-white border-emerald-800'} shadow-sm` : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                </SpotlightCard>

                <button
                  type="submit"
                  disabled={isSubmitting || !patientName.trim()}
                  aria-label={isSubmitting ? 'সংরক্ষণ হচ্ছে…' : (currentUser?.isGuest ? 'সিরিয়ালের জন্য আবেদন পাঠান' : 'সিরিয়াল নিশ্চিত করুন')}
                  aria-busy={isSubmitting}
                  title={isSubmitting ? 'সংরক্ষণ হচ্ছে…' : (currentUser?.isGuest ? 'সিরিয়ালের জন্য আবেদন পাঠান' : 'সিরিয়াল নিশ্চিত করুন')}
                  className={`shrink-0 w-16 sm:w-20 rounded-2xl ${themeStyles.submitButton || 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/30 border border-emerald-400'} text-white flex items-center justify-center transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                >
                  {currentUser?.isGuest ? <FileText className="w-7 h-7 text-white shrink-0" /> : <UserPlus className="w-7 h-7 text-white shrink-0" />}
                </button>
              </div>

              <div className="space-y-2.5 pt-1">
                <SpotlightCard variant="sub">
                <div className={`${themeStyles.subCard} p-3 rounded-2xl transition`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>তারিখ: <strong className="font-mono text-emerald-700">{formatDateToDDMMYYYY(appointmentDate)}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenDatePanel(!openDatePanel)}
                      aria-label={openDatePanel ? 'তারিখ নির্বাচন লুকান' : 'তারিখ নির্বাচন দেখুন'}
                      aria-expanded={openDatePanel}
                      className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-200 opacity-75 hover:opacity-100 transition cursor-pointer"
                    >
                      {openDatePanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {openDatePanel && (
                    <div className="pt-2">
                      <div className="grid grid-cols-7 gap-1 w-full">
                        {upcomingSevenDays.map((d) => {
                          const isSelected = appointmentDate === d.isoDate;
                          const isClosed = closedDates.includes(d.isoDate);
                          return (
                            <button
                              key={d.isoDate}
                              type="button"
                              onClick={() => setAppointmentDate(d.isoDate)}
                              aria-pressed={isSelected}
                              aria-label={`${d.relativeLabel}${isClosed ? ', চেম্বার বন্ধ' : ''} তারিখ নির্বাচন করুন`}
                              className={`min-h-[44px] py-1.5 px-0.5 text-center rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                                isSelected
                                  ? `${themeStyles.dateActive || 'bg-emerald-700 text-white border-emerald-800 ring-1 ring-emerald-500'} shadow-sm`
                                  : isClosed
                                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-950 ring-1 ring-rose-400'
                                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                              }`}
                            >
                              <span className="leading-tight text-[11px] whitespace-nowrap">{d.relativeLabel}</span>
                              {isClosed && (
                                <span className="text-[9px] font-black text-rose-600 leading-none mt-0.5">
                                  (বন্ধ)
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {closedDates.includes(appointmentDate) && (
                        <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-center gap-2 text-xs font-bold mt-2 animate-fadeIn">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>সতর্কতা: নির্বাচিত তারিখে চেম্বার বন্ধ/ছুটি রয়েছে!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </SpotlightCard>

                <SpotlightCard variant="sub">
                <div className={`${themeStyles.subCard} p-3 rounded-2xl transition`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>মোবাইল নম্বর {currentUser?.isGuest && <span className="text-rose-600">*</span>}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenPhonePanel(!openPhonePanel)}
                      aria-label={openPhonePanel ? 'মোবাইল নম্বর লুকান' : 'মোবাইল নম্বর দেখুন'}
                      aria-expanded={openPhonePanel}
                      className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-200 opacity-75 hover:opacity-100 transition cursor-pointer"
                    >
                      {openPhonePanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {openPhonePanel && (
                    <div className="pt-2 space-y-1">
                      <input
                        type="tel"
                        inputMode="tel"
                        enterKeyHint="go"
                        aria-label="মোবাইল নম্বর"
                        placeholder="যেমন: 01712345678"
                        value={phoneNumber}
                        ref={phoneNumberInputRef}
                        aria-required={currentUser?.isGuest}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.keyCode === 13) {
                            e.preventDefault();
                            if (patientName.trim()) {
                              handleRegisterPatient(e);
                            } else {
                              patientNameInputRef.current?.focus();
                            }
                          }
                        }}
                        className={`w-full px-3 py-3 text-sm font-semibold focus:outline-none ${themeStyles.input}`}
                      />
                    </div>
                  )}
                </div>
                </SpotlightCard>

                {/* গেস্ট আবেদন: আবেদনের মুহূর্তে বুক হওয়া টোকেনের প্রিভিউ */}
                {currentUser?.isGuest && guestFormError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-start gap-2 text-xs font-bold animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{guestFormError}</span>
                  </div>
                )}
                <SpotlightCard variant="sub">
                <div className={`${themeStyles.subCard} p-3 rounded-2xl transition`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      <span>প্রধান লক্ষণ / উপসর্গ</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenSymptomsPanel(!openSymptomsPanel)}
                      aria-label={openSymptomsPanel ? 'উপসর্গ লুকান' : 'উপসর্গ দেখুন'}
                      aria-expanded={openSymptomsPanel}
                      className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-200 opacity-75 hover:opacity-100 transition cursor-pointer"
                    >
                      {openSymptomsPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {openSymptomsPanel && (
                    <div className="pt-2 space-y-2">
                      <input
                        type="text"
                        enterKeyHint="go"
                        aria-label="প্রধান লক্ষণ বা উপসর্গ"
                        placeholder="যেমন: ৩ দিন ধরে জ্বর, সর্দি ও তীব্র কাশি"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.keyCode === 13) {
                            e.preventDefault();
                            if (patientName.trim()) {
                              handleRegisterPatient(e);
                            } else {
                              patientNameInputRef.current?.focus();
                            }
                          }
                        }}
                        className={`w-full px-3 py-3 text-sm font-semibold focus:outline-none ${themeStyles.input}`}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {['জ্বর ও ঠান্ডা', 'কাশি ও শ্বাসকষ্ট', 'পেটব্যথা', 'বমি ভাব', 'দুর্বলতা'].map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => setSymptoms(prev => (prev ? `${prev}, ${sym}` : sym))}
                            aria-label={`উপসর্গ যোগ করুন: ${sym}`}
                            className={`amh-gold-marked min-h-[44px] text-[11px] px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition shadow-2xs ${themeStyles.quickSymBtn || 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'}`}
                          >
                            +{sym}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </SpotlightCard>
              </div>

            </form>
          </div>
          </SpotlightCard>
        )}

        {/* Live Queue Panel */}
        {activeTab === 'queue' && (
          <div className={currentUser?.isGuest ? 'space-y-2.5' : 'space-y-2.5 xl:space-y-0 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-3 xl:items-start'}>
            <div className="space-y-2.5 min-w-0">
            {/* চেম্বার বন্ধ থাকলে কিউ নোটিশ */}
            {closedDates.includes(queueSelectedDate) && (
              <SpotlightCard variant="sub">
                <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center justify-between text-rose-950 shadow-xs animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-rose-950">এই তারিখে চেম্বার বন্ধ / ছুটি</h4>
                      <p className="text-[11px] text-rose-800">
                        ডাক্তার চেম্বারে উপস্থিত থাকবেন না। সেটিংস প্যানেল থেকে পুনরায় চেম্বার চালু করা যাবে।
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-1 rounded-lg shrink-0">
                    চেম্বার অফ
                  </span>
                </div>
              </SpotlightCard>
            )}

            {/* কিউ ভিউ-সুইচার: নিচের তালিকায় কোন লিস্ট দেখানো হবে (pop-up ছাড়া) */}
            {!currentUser?.isGuest && (queueToolbarHidden ? (
              <div className="flex items-center justify-end gap-1.5 px-0.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQueueToolbarHidden(false)}
                  aria-label="টুলবার দেখান (পূর্বাবস্থায় ফেরান)"
                  title="টুলবার দেখান"
                  className="flex items-center justify-center w-[40px] h-[42px] rounded-lg border transition cursor-pointer shadow-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 px-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQueueToolbarMinimized((m) => !m)}
                  aria-label={queueToolbarMinimized ? 'টুলবার বড় করুন' : 'টুলবার ছোট করুন'}
                  title={queueToolbarMinimized ? 'টুলবার বড় করুন' : 'টুলবার ছোট করুন'}
                  aria-expanded={!queueToolbarMinimized}
                  className="flex items-center justify-center w-[40px] h-[42px] rounded-lg border transition cursor-pointer shadow-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                >
                  {queueToolbarMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {!queueToolbarMinimized && (<>
              <button
                type="button"
                onClick={() => setQueueSelectedDate((d) => shiftDateKey(d, -1))}
                aria-label="পূর্ববর্তী তারিখ"
                title="পূর্ববর্তী তারিখ"
                className="flex items-center justify-center w-[40px] h-[42px] rounded-lg transition cursor-pointer text-emerald-700 hover:bg-slate-100/70"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div
                role="button"
                tabIndex={-1}
                aria-label={`তারিখ ${formatDateToDDMMYYYY(queueSelectedDate)}`}
                title="তারিখ"
                className="amh-queue-date flex items-center justify-center w-[72px] h-[42px] font-mono text-[12px] font-black whitespace-nowrap"
              >
                {formatDateToDDMMYYYY(queueSelectedDate)}
              </div>
              <button
                type="button"
                onClick={() => setQueueSelectedDate((d) => shiftDateKey(d, 1))}
                aria-label="পরবর্তী তারিখ"
                title="পরবর্তী তারিখ"
                className="flex items-center justify-center w-[40px] h-[42px] rounded-lg transition cursor-pointer text-emerald-700 hover:bg-slate-100/70"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setQueueSelectedDate(TODAY_KEY)}
                aria-label="আজকের তারিখে ফিরুন"
                title="আজকের তারিখে ফিরুন"
                className="relative flex flex-col items-center justify-center gap-0 w-[46px] h-[42px] rounded-lg border transition cursor-pointer shadow-xs bg-sky-50/90 text-sky-800 border-sky-300 hover:bg-sky-100"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-[9px] font-black leading-none mt-0">আজ</span>
              </button>
                </>)}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                {!queueToolbarMinimized && (<>
              <button
                type="button"
                onClick={() => setQueueView('normal')}
                aria-pressed={queueView === 'normal'}
                aria-label={`সাধারণ তালিকা দেখুন, ${toBengaliDigits(activeQueuePatients.length)} জন`}
                title="সক্রিয় কিউ — অনুপস্থিত/বাতিল/ডিলিট/সেবা-সম্পন্ন বাদে"
                className={`relative flex flex-col items-center justify-center gap-0 w-[46px] h-[42px] rounded-lg border transition cursor-pointer shadow-xs ${queueView === 'normal' ? 'bg-slate-800 text-white border-slate-900 ring-2 ring-slate-300' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
              >
                <UserCheck className="w-4 h-4" />
                <span className="text-[9px] font-black leading-none mt-0">সাধারণ</span>
                <span className="absolute -top-2 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-slate-800 text-white text-[16px] font-black leading-none ring-2 ring-white/80 shadow-sm">{toBengaliDigits(activeQueuePatients.length)}</span>
              </button>
              <button
                type="button"
                onClick={() => setQueueView('all')}
                aria-pressed={queueView === 'all'}
                aria-label={`সকল রোগীর তালিকা দেখুন, মোট ${toBengaliDigits(absentQueuePatients.length + cancelledQueuePatients.length + deletedQueueRecords.length + completedQueuePatients.length)} জন`}
                title="অনুপস্থিত + বাতিল + ডিলিট + সেবা সম্পন্ন — সব একসাথে"
                className={`relative flex flex-col items-center justify-center gap-0 w-[46px] h-[42px] rounded-lg border transition cursor-pointer shadow-xs ${queueView === 'all' ? 'bg-violet-700 text-white border-violet-800 ring-2 ring-violet-300' : 'bg-violet-50/90 text-violet-900 border-violet-300 hover:bg-violet-100'}`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[9px] font-black leading-none mt-0">সকল</span>
                <span className="absolute -top-2 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-slate-800 text-white text-[16px] font-black leading-none ring-2 ring-white/80 shadow-sm">{toBengaliDigits(absentQueuePatients.length + cancelledQueuePatients.length + deletedQueueRecords.length + completedQueuePatients.length)}</span>
              </button>
              <button
                type="button"
                onClick={() => setQueueView('absent')}
                aria-pressed={queueView === 'absent'}
                aria-label={`অনুপস্থিত রোগীদের তালিকা দেখুন, মোট ${toBengaliDigits(absentQueuePatients.length)} জন`}
                title="অনুপস্থিত রোগীদের তালিকা"
                className={`relative flex flex-col items-center justify-center gap-0 w-[46px] h-[42px] rounded-lg border transition cursor-pointer shadow-xs ${queueView === 'absent' ? 'bg-rose-200 text-rose-900 border-rose-500 ring-2 ring-rose-400' : 'bg-rose-50/90 text-rose-900 border-rose-300 hover:bg-rose-100'}`}
              >
                <AbsentIcon className="w-6 h-6" />
                <span className="text-[9px] font-black leading-none mt-0">অনুপ.</span>
                <span className="absolute -top-2 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-slate-800 text-white text-[16px] font-black leading-none ring-2 ring-white/80 shadow-sm">{toBengaliDigits(absentQueuePatients.length)}</span>
              </button>
              <button
                type="button"
                onClick={() => setQueueView('cancelled')}
                aria-pressed={queueView === 'cancelled'}
                aria-label={`বাতিল রোগীদের তালিকা দেখুন, মোট ${toBengaliDigits(cancelledQueuePatients.length)} জন`}
                title="বাতিল রোগীদের তালিকা"
                className={`relative flex items-center justify-center gap-0 w-[46px] h-[42px] rounded-lg transition cursor-pointer shadow-xs ${queueView === 'cancelled' ? 'bg-amber-200 text-amber-900 ring-2 ring-amber-400' : 'bg-amber-50/90 text-amber-900 hover:bg-amber-100'}`}
              >
                <CancelIcon className="w-6 h-6" />
                <span className="absolute -top-2 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-slate-800 text-white text-[16px] font-black leading-none ring-2 ring-white/80 shadow-sm">{toBengaliDigits(cancelledQueuePatients.length)}</span>
              </button>
              <button
                type="button"
                onClick={() => setQueueView('deleted')}
                aria-pressed={queueView === 'deleted'}
                aria-label={`ডিলিট করা রোগীদের তালিকা দেখুন, মোট ${toBengaliDigits(deletedQueueRecords.length)} জন`}
                title="ডিলিট করা রোগীদের তালিকা"
                className={`relative flex items-center justify-center gap-0 w-[46px] h-[42px] rounded-lg transition cursor-pointer shadow-xs ${queueView === 'deleted' ? 'bg-red-200 text-red-900 ring-2 ring-red-400' : 'bg-red-50/90 text-red-900 hover:bg-red-100'}`}
              >
                <DeleteIcon className="w-6 h-6" />
                <span className="absolute -top-2 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-slate-800 text-white text-[16px] font-black leading-none ring-2 ring-white/80 shadow-sm">{toBengaliDigits(deletedQueueRecords.length)}</span>
              </button>
                <button
                  type="button"
                  onClick={() => setQueueView('completed')}
                  aria-pressed={queueView === 'completed'}
                  aria-label={`সেবা সম্পন্ন রোগীদের তালিকা দেখুন, মোট ${toBengaliDigits(completedQueuePatients.length)} জন`}
                  title="সেবা সম্পন্ন রোগীদের তালিকা"
                  className={`relative flex flex-col items-center justify-center gap-0 w-[46px] h-[42px] rounded-lg border transition cursor-pointer shadow-xs ${queueView === 'completed' ? 'bg-emerald-200 text-emerald-900 border-emerald-500 ring-2 ring-emerald-400' : 'bg-emerald-50/90 text-emerald-900 border-emerald-300 hover:bg-emerald-100'}`}
                >
                  <DoneIcon className="w-6 h-6" />
                  <span className="text-[9px] font-black leading-none mt-0">সম্পন্ন</span>
                  <span className="absolute -top-2 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-slate-800 text-white text-[16px] font-black leading-none ring-2 ring-white/80 shadow-sm">{toBengaliDigits(completedQueuePatients.length)}</span>
                </button>
                </>)}
                <button
                  type="button"
                  onClick={() => setQueueToolbarHidden(true)}
                  aria-label="টুলবার লুকান"
                  title="টুলবার লুকান"
                  className="flex items-center justify-center w-[40px] h-[42px] rounded-lg border transition cursor-pointer shadow-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
                </div>
              </div>
            ))}

            {/* রোগীর তালিকা — বেছে নেওয়া ভিউ অনুযায়ী ইনলাইন */}
            {(() => {
              const meta = {
                normal:    { label: 'সাধারণ (সক্রিয় কিউ)', count: activeQueuePatients.length },
                all:       { label: 'সকল — অনুপস্থিত + বাতিল + ডিলিট + সেবা সম্পন্ন', count: absentQueuePatients.length + cancelledQueuePatients.length + deletedQueueRecords.length + completedQueuePatients.length },
                absent:    { label: 'অনুপস্থিত', count: absentQueuePatients.length },
                cancelled: { label: 'বাতিল', count: cancelledQueuePatients.length },
                deleted:   { label: 'ডিলিট', count: deletedQueueRecords.length },
                completed: { label: 'সেবা সম্পন্ন', count: completedQueuePatients.length },
              }[queueView] || { label: 'সাধারণ', count: activeQueuePatients.length };
              return (
                <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
                  <span className="text-[11px] font-black text-slate-700 truncate">{meta.label}</span>
                  <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">{formatDateToDDMMYYYY(queueSelectedDate)} • মোট {toBengaliDigits(meta.count)} জন</span>
                </div>
              );
            })()}
            <div className="space-y-2.5 sm:space-y-1.5 max-h-[calc(100dvh-18.25rem)] sm:max-h-[calc(100dvh-16.5rem)] min-h-[220px] overflow-y-auto overscroll-contain pr-1">
              {renderQueueViewList()}
            </div>

            {/* রোগী ডিলিট নিশ্চিতকরণ (শুধুমাত্র অ্যাডমিন) */}
            {queueDeleteTarget && typeof document !== 'undefined' && createPortal(
              <div
                onClick={() => setQueueDeleteTarget(null)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 animate-fadeIn cursor-pointer"
                role="presentation"
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delete-patient-title"
                  onClick={(e) => e.stopPropagation()}
                  className={`${themeStyles.card} w-full max-w-md rounded-3xl border-2 border-rose-500 shadow-2xl cursor-default overflow-hidden`}
                >
                  <div className="p-4 sm:p-5 space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 id="delete-patient-title" className="text-sm sm:text-base font-black text-slate-900">{(queueDeleteIds && queueDeleteIds.length > 1) ? `${toBengaliDigits(queueDeleteIds.length)} জন রোগী ডিলিট করবেন?` : 'রোগী ডিলিট করবেন?'}</h3>
                        <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                          {queueDeleteTarget.name} • টোকেন #{toBengaliDigits(queueDeleteTarget.serialNumber)}{(queueDeleteIds && queueDeleteIds.length > 1) ? ` (+ আরও ${toBengaliDigits(queueDeleteIds.length - 1)} জন মার্কড)` : ''} • {formatDateToDDMMYYYY(queueSelectedDate)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3 font-semibold">
                      কিউ তালিকা থেকে {queueDeleteIds && queueDeleteIds.length > 1 ? `${toBengaliDigits(queueDeleteIds.length)} জনের এন্ট্রি` : 'এই রোগীর এন্ট্রি'} স্থায়ীভাবে মুছে যাবে। এটি ফিরিয়ে আনা যাবে না।
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setQueueDeleteTarget(null)}
                        className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-black border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDeleteQueuePatient}
                        className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 shadow-sm transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ডিলিট করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
            </div>

            {!currentUser?.isGuest && (
              <aside className="hidden xl:block xl:sticky min-w-0" style={{ top: (headerBarHeight || 90) + 10 }} aria-label="TV MOOD সংক্ষিপ্ত লাইভ বোর্ড">
                <div className="rounded-3xl overflow-hidden border border-emerald-400/45 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white shadow-[0_18px_45px_rgba(2,6,23,0.35)]">
                  <div className="px-3.5 py-3 border-b border-white/15 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-emerald-400/20 border border-emerald-300/50 text-emerald-200 flex items-center justify-center shrink-0">
                        <Tv className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black tracking-wide text-emerald-200 leading-tight">TV MOOD · লাইভ বোর্ড</h3>
                        <p className="text-[10px] font-semibold text-white/55 leading-tight">টিভিতে যা দেখানো হচ্ছে</p>
                      </div>
                    </div>
                    <span                     className="amh-gold-marked text-[10px] font-black bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full shrink-0">
                      {toBengaliDigits(selectedDateWaitingCount + selectedDateCalledCount)} জন
                    </span>
                  </div>

                  <div className="p-3 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-black text-emerald-300 tracking-wide">বর্তমানে চেম্বারে</p>
                        {tvCalledPatientsSorted.length > 3 && (
                          <span className="text-[9px] font-bold text-emerald-200/80">+{toBengaliDigits(tvCalledPatientsSorted.length - 3)} জন</span>
                        )}
                      </div>
                      {tvCalledPatientsSorted.length > 0 ? (
                        <div className="space-y-1.5">
                          {tvCalledPatientsSorted.slice(0, 3).map((patient, index) => (
                            <div
                              key={patient.id}
                              className={`flex items-center gap-2 rounded-xl px-2 py-1.5 border ${
                                index === 0 ? 'bg-emerald-400/15 border-emerald-300/55' : 'bg-white/5 border-white/10'
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 font-black ${index === 0 ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-white border border-white/15'}`}>
                                <span className="text-[8px] leading-none opacity-80">টোকেন</span>
                                <span className="text-[11px] leading-none mt-0.5">{queueTokenInfo.tokenLabelById.get(patient.id) || `#${toBengaliDigits(patient.serialNumber)}`}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12px] font-black leading-tight truncate">{patient.name}</p>
                                <p className="text-[10px] opacity-70 leading-tight">বয়স: {toBengaliDigits(patient.ageYears || 0)} বছর</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] font-bold opacity-55 px-1 py-1">এখন কোনো রোগী চেম্বারে নেই</p>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-amber-300 tracking-wide mb-1.5">পরবর্তী রোগীরা</p>
                      {tvWaitingPatientsList.length > 0 ? (
                        <div className="space-y-1">
                          {tvWaitingPatientsList.slice(0, 5).map((patient, index) => (
                            <div key={patient.id} className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2 py-1">
                              <span className="w-4 text-[9px] font-mono font-bold text-white/50 shrink-0">{toBengaliDigits(index + 1)}</span>
                              <span className="font-mono text-[11px] font-black text-amber-300 shrink-0">{queueTokenInfo.tokenLabelById.get(patient.id) || `#${toBengaliDigits(patient.serialNumber)}`}</span>
                              <span className="text-[11px] font-bold truncate flex-1">{patient.name}</span>
                              <span className="text-[9px] font-bold text-cyan-200/90 shrink-0">{getTvProjectedCallClock(patient)}</span>
                            </div>
                          ))}
                          {tvWaitingPatientsList.length > 5 && (
                            <p className="text-[9px] font-bold text-white/60 px-1 pt-1">আরও {toBengaliDigits(tvWaitingPatientsList.length - 5)} জন অপেক্ষমাণ</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] font-bold opacity-55 px-1 py-1">অপেক্ষমান কোনো রোগী নেই</p>
                      )}
                    </div>

                    {(currentUser?.isAdmin || currentUser?.isTvMode || currentUser?.role === 'tv') && (
                      <button
                        type="button"
                        onClick={() => openTvVariant(tvDefaultVariant)}
                        className="amh-gold-marked w-full min-h-[38px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>পূর্ণ TV MOOD খুলুন</span>
                      </button>
                    )}
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}

        {/* Patient ID Panel */}
        {activeTab === 'patientId' && (
          <div className="max-w-6xl mx-auto space-y-4">
            <input
              type="file"
              ref={patientIdFileInputRef}
              onChange={handleProcessImportedFile}
              accept=".csv,.json,text/csv,application/json"
              className="hidden"
            />

            {patientIdImportToast && (
              <div className="bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-between shadow-lg animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-300" />
                  <span>{patientIdImportToast}</span>
                </div>
              </div>
            )}

            {quickSerialToast && (
              <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{quickSerialToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('queue')}
                  className="px-2.5 py-1 bg-white text-emerald-900 rounded-lg text-[11px] font-black cursor-pointer"
                >
                  সিরিয়াল দেখুন →
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <SpotlightCard className="lg:col-span-6">
              <div className={`${themeStyles.card} p-4 space-y-3 h-full lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto`}>
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900">Patient ID তৈরি ও নিবন্ধন</h2>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreatePatientIdRecord} className="space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                      <label className="block text-[11px] font-bold mb-1">ID প্রিফিক্স</label>
                      <input
                        type="text"
                        value={patientIdPrefix}
                        onChange={(e) => setPatientIdPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        placeholder="AMH"
                        className={`w-full px-2.5 py-2 text-xs font-mono font-black uppercase text-center focus:outline-none ${themeStyles.input}`}
                      />
                    </div>
                    <div className="col-span-8">
                      <label className="block text-[11px] font-bold mb-1">কাস্টম Patient ID (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={customPatientIdInput}
                        onChange={(e) => setCustomPatientIdInput(e.target.value)}
                        placeholder={`ফাঁকা রাখলে অটো: ${patientIdPrefix || 'AMH'}-${String(allPatientIdRecords.length + 1).padStart(5, '0')}`}
                        className={`w-full px-3 py-2 text-xs font-mono font-bold focus:outline-none ${themeStyles.input}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">রোগীর নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ আব্দুল করিম"
                      value={idFormName}
                      onChange={(e) => setIdFormName(e.target.value)}
                      className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                      <label className="block text-[11px] font-bold mb-1">বয়স (বছর)</label>
                      <input
                        type="text"
                        value={idFormAgeYears}
                        onChange={(e) => setIdFormAgeYears(e.target.value.replace(/[^0-9০-৯]/g, ''))}
                        placeholder="২৫"
                        className={`w-full px-2 py-2 text-xs font-bold text-center focus:outline-none ${themeStyles.input}`}
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-[11px] font-bold mb-1">বয়স (মাস)</label>
                      <input
                        type="text"
                        value={idFormAgeMonths}
                        onChange={(e) => setIdFormAgeMonths(e.target.value.replace(/[^0-9০-৯]/g, ''))}
                        placeholder="০"
                        className={`w-full px-2 py-2 text-xs font-bold text-center focus:outline-none ${themeStyles.input}`}
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-[11px] font-bold mb-1">বয়স (দিন)</label>
                      <input
                        type="text"
                        value={idFormAgeDays}
                        onChange={(e) => setIdFormAgeDays(e.target.value.replace(/[^0-9০-৯]/g, ''))}
                        placeholder="০"
                        className={`w-full px-2 py-2 text-xs font-bold text-center focus:outline-none ${themeStyles.input}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      required
                      placeholder="যেমন: 01712345678"
                      value={idFormPhone}
                      onChange={(e) => setIdFormPhone(e.target.value)}
                      className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                    />
                  </div>

                  <SpotlightCard variant="sub">
                    <div className={`${themeStyles.subCard} p-3 rounded-2xl space-y-2 border border-slate-200`}>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold mb-1 opacity-80 text-slate-700">
                            জন্ম তারিখ (ঐচ্ছিক):
                          </label>
                          <input
                            type="date"
                            value={idFormDob}
                            onChange={handleDobChange}
                            className={`w-full px-2.5 py-1.5 text-xs font-bold focus:outline-none ${themeStyles.input}`}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold mb-1 opacity-80 text-slate-700">
                            নিবন্ধন তারিখ:
                          </label>
                          <input
                            type="date"
                            value={idFormRegDate}
                            onChange={(e) => setIdFormRegDate(e.target.value)}
                            className={`w-full px-2.5 py-1.5 text-xs font-bold focus:outline-none ${themeStyles.input}`}
                          />
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>

                  <SpotlightCard variant="sub">
                    <div className={`${themeStyles.subCard} p-3 rounded-2xl border border-slate-200`}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-xs font-bold text-slate-800">রক্তের গ্রুপ</label>
                        <select
                          value={idFormBloodGroup}
                          onChange={(e) => setIdFormBloodGroup(e.target.value)}
                          className={`w-40 px-2.5 py-1.5 text-xs font-bold focus:outline-none ${themeStyles.input}`}
                        >
                          <option value="">নির্বাচন (ঐচ্ছিক)</option>
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </SpotlightCard>

                  <div>
                    <label className="block text-xs font-bold mb-1">রোগীর সংক্ষিপ্ত নোট / ঠিকানা</label>
                    <input
                      type="text"
                      placeholder="যেমন: ডায়াবেটিস / ময়মনসিংহ"
                      value={idFormNotes}
                      onChange={(e) => setIdFormNotes(e.target.value)}
                      className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`amh-gold-marked w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${themeStyles.buttonPrimary}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন Patient ID কার্ড তৈরি করুন</span>
                  </button>
                </form>
              </div>
              </SpotlightCard>

              <SpotlightCard className="lg:col-span-6 lg:h-[calc(100dvh-9rem)]" allowOverflow>
              <div className={`${themeStyles.card} p-4 space-y-3 h-full flex flex-col min-h-0`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-3">
                  <h3 className="text-sm sm:text-base font-black flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-slate-900">
                    <span>নিবন্ধিত রোগীর তালিকা</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold whitespace-nowrap">
                      {toBengaliDigits(allPatientIdRecords.length)} জন
                    </span>
                  </h3>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleTriggerPatientIdImport}
                        className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition flex items-center justify-center cursor-pointer shadow-xs shrink-0"
                        title="ইমপোর্ট"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setExportMenuOpen(prev => !prev)}
                          className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition flex items-center justify-center gap-0.5 cursor-pointer shadow-xs shrink-0"
                          title="এক্সপোর্ট"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-700" />
                          <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                        </button>

                        {exportMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setExportMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 z-40 space-y-1 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                handleExportPatientIdsCsv();
                                setExportMenuOpen(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 font-semibold text-slate-700 transition cursor-pointer"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>CSV ফাইল (.csv)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleExportPatientIdsJson();
                                setExportMenuOpen(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 font-semibold text-slate-700 transition cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span>JSON ব্যাকআপ (.json)</span>
                            </button>
                          </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="relative flex-1 sm:min-w-[170px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        type="text"
                        value={patientIdSearch}
                        onChange={(e) => setPatientIdSearch(e.target.value)}
                        placeholder="খুঁজুন..."
                        className={`w-full pl-8 pr-3 py-1.5 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[55vh] lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto pr-1">
                  {allPatientIdRecords.map((rec) => (
                    <SpotlightCard
                      key={rec.patientCode + '-' + (rec.id || '')}
                      variant="sub"
                    >
                    <div
                      className={`${themeStyles.subCard} p-2 sm:p-2.5 rounded-2xl border border-slate-200 space-y-1.5 transition`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-200 pb-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="amh-gold-marked px-2 py-0.5 rounded-lg bg-emerald-700 text-white font-mono font-black text-[11px] text-center shrink-0 shadow-xs flex items-center gap-1.5">
                            <span className="text-[8px] uppercase opacity-75 font-sans">ID</span>
                            <span>{rec.patientCode}</span>
                          </div>

                          <h4 className="text-[13px] font-black text-slate-900 truncate max-w-[140px] sm:max-w-none">{rec.name}</h4>

                          <span
                            className="text-[10px] font-bold opacity-85 bg-slate-200 px-1.5 py-0.5 rounded-md text-slate-700"
                            title={`রিয়েল-টাইম বয়স: ${getRealtimeAdjustedAge(rec).formattedFull}`}
                          >
                            {getRealtimeAdjustedAge(rec).formattedCompact}
                          </span>

                          {rec.bloodGroup && (
                            <span className="text-[9px] font-black bg-rose-100 text-rose-700 border border-rose-300 px-1.5 py-0.5 rounded-md">
                              {rec.bloodGroup}
                            </span>
                          )}

                          {rec.phoneNumber && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="flex items-center gap-1 text-[10px] font-semibold opacity-85 bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-700">
                                <Phone className="w-3 h-3 opacity-70" />
                                <span>{rec.phoneNumber}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSendWhatsApp(rec)}
                                className="flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-1.5 py-0.5 rounded-md transition cursor-pointer shadow-2xs"
                                title="WhatsApp-এ বার্তা পাঠান (সেটিংস টেমপ্লেট অনুযায়ী)"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-700" />
                                <span>WhatsApp</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                        <div className="text-[10.5px] opacity-75 truncate text-slate-600">
                          {rec.symptoms ? (
                            <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded-md inline-block truncate max-w-md">
                              📝 {rec.symptoms}
                            </span>
                          ) : (
                            <span className="text-[11px] opacity-50 italic">কোনো অতিরিক্ত নোট নেই</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={async () => {
                              await safeCopyToClipboard(rec.patientCode);
                              setCopiedPatientId(rec.patientCode);
                              setTimeout(() => setCopiedPatientId(''), 2000);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                          >
                            {copiedPatientId === rec.patientCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedPatientId === rec.patientCode ? 'কপি হয়েছে' : 'ID কপি'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditPatientId(rec)}
                            className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>এডিট</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedIdCardPatient(rec)}
                            className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>ID কার্ড</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickAddSerialFromId(rec)}
                            className="amh-gold-marked px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-xs transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>সিরিয়াল দিন</span>
                          </button>
                          {currentUser?.isAdmin && (
                            <button
                              type="button"
                              onClick={() => setIdCardDeleteTarget(rec)}
                              className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                              title="এই রোগীর ID ও হেলথ কার্ড মুছে ফেলুন (শুধু অ্যাডমিন)"
                              aria-label={`${rec.name} এর ID কার্ড ডিলিট করুন`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ডিলিট</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
              </SpotlightCard>
            </div>
            {idCardDeleteTarget && typeof document !== 'undefined' && createPortal(
              <div
                onClick={() => setIdCardDeleteTarget(null)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 animate-fadeIn cursor-pointer"
                role="presentation"
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delete-idcard-title"
                  onClick={(e) => e.stopPropagation()}
                  className={`${themeStyles.card} w-full max-w-md rounded-3xl border-2 border-rose-500 shadow-2xl cursor-default overflow-hidden`}
                >
                  <div className="p-4 sm:p-5 space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 id="delete-idcard-title" className="text-sm sm:text-base font-black text-slate-900">ID ও হেলথ কার্ড ডিলিট করবেন?</h3>
                        <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                          {idCardDeleteTarget.name} • ID {idCardDeleteTarget.patientCode}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3 font-semibold">
                      এই রোগীর ID/হেলথ কার্ড এবং কিউ-এর সব এন্ট্রি স্থায়ীভাবে মুছে যাবে। এটি ফিরিয়ে আনা যাবে না।
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIdCardDeleteTarget(null)}
                        className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-black border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDeletePatientIdRecord}
                        className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 shadow-sm transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ডিলিট করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        )}

        {/* Reports Panel */}
        {activeTab === 'reports' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <input
              type="file"
              ref={reportsFileInputRef}
              onChange={handleProcessReportsImportFile}
              accept=".csv,.json,text/csv,application/json"
              className="hidden"
            />
            {/* স্থানান্তরিত: মাল্টি-মোবাইল ক্লাউড সিঙ্ক চ্যানেল (সবার উপরে) */}
            <SpotlightCard>
            <div className={`${themeStyles.card} p-5 space-y-3`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black flex items-center gap-1.5 text-slate-900">
                    <Wifi className="w-4 h-4 text-emerald-700" />
                    <span>মাল্টি-মোবাইল ক্লাউড সিঙ্ক চ্যানেল</span>
                  </h3>
                  <p className="text-xs opacity-70">যেকোনো ডিভাইস থেকে একই রুম কোড দিলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyShareLink}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'লিংক কপি'}</span>
                  </button>
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="p-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-300 rounded-xl transition cursor-pointer text-slate-800"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <SpotlightCard variant="sub">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-emerald-900">
                  <span className={`w-2.5 h-2.5 rounded-full ${syncStatus === 'connected' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`}></span>
                  <span>রুম কোড: <strong className="font-mono text-emerald-800">{normalizeRoomKey(syncChannelId)}</strong></span>
                  {lastSyncedAtText && (
                    <>
                      <span>•</span>
                      <span>সর্বশেষ সিঙ্ক: {lastSyncedAtText}</span>
                    </>
                  )}
                </div>
              </SpotlightCard>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <input
                  type="text"
                  value={roomInputDraft}
                  onChange={(e) => setRoomInputDraft(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className={`flex-1 px-3 py-2 text-xs font-mono font-bold focus:outline-none ${themeStyles.input}`}
                  placeholder="রুম কোড লিখুন"
                />
                <button
                  type="button"
                  onClick={() => {
                    const clean = normalizeRoomKey(roomInputDraft);
                    setSyncChannelId(clean);
                    setRoomInputDraft(clean);
                    setSyncToast(`✓ সিঙ্ক রুম "${clean}"-এ সংযুক্ত করা হয়েছে!`);
                    setTimeout(() => setSyncToast(''), 3000);
                  }}
                  className="amh-gold-marked px-3 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>রুম সেট করুন</span>
                </button>
                <button
                  type="button"
                  onClick={handleManualSyncRefresh}
                  className="px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
                >
                  <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>এখনই সিঙ্ক করুন</span>
                </button>
              </div>

              {/* ============================================================== */}
              {/* GOOGLE DRIVE অটোমেটিক (৩০ মিনিট পর পর) ও ম্যানুয়াল ফুল ব্যাকআপ প্যানেল */}
              {/* ============================================================== */}
              {currentUser?.isAdmin && (
              <div className="mt-3 pt-3 border-t border-slate-200/90">
                <SpotlightCard variant="sub">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-emerald-50/80 border border-blue-200/90 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Cloud className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          Google Drive ব্যাকআপ
                        </h4>
                        {/* সংযোগ স্ট্যাটাস ব্যাজ */}
                        {gDriveAccessToken || (gDriveWebhookUrl && gDriveWebhookUrl.trim().startsWith('http')) ? (
                          <span className="amh-gold-marked text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>{gDriveUserEmail ? `সংযুক্ত (${gDriveUserEmail.split('@')[0]})` : 'ড্রাইভ সংযুক্ত'}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setGDriveConfigOpen(true)}
                            className="amh-gold-marked text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1 cursor-pointer shadow-2xs transition"
                            title="সরাসরি Google Drive-এ কপি করতে সংযোগ সেটআপ করুন"
                          >
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>ড্রাইভ সংযুক্ত করুন</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ডান পাশের কন্ট্রোল: ড্রাইভ কানেক্ট, অটো ৩০মি টগল ও সেটিংস */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={gDriveAuthLoading}
                        onClick={handleAuthenticateGoogleDrive}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition cursor-pointer flex items-center gap-1 ${
                          gDriveAccessToken || (gDriveWebhookUrl && gDriveWebhookUrl.trim().startsWith('http'))
                            ? 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100'
                            : 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700 shadow-2xs'
                        }`}
                        title="Google অ্যাকাউন্ট অথেন্টিকেশন বা ওয়েবহুক সংযুক্ত করুন"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>
                          {gDriveAuthLoading
                            ? 'সংযুক্ত হচ্ছে...'
                            : gDriveAccessToken || (gDriveWebhookUrl && gDriveWebhookUrl.trim().startsWith('http'))
                            ? 'পুনঃসংযোগ'
                            : 'Google লগইন'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !gDriveAutoBackupEnabled;
                          setGDriveAutoBackupEnabled(nextVal);
                          try {
                            localStorage.setItem('amh_gdrive_auto_backup_enabled', JSON.stringify(nextVal));
                          } catch {}
                          setSyncToast(
                            nextVal
                              ? '✓ ৩০ মিনিট অটো-ব্যাকআপ চালু!'
                              : '⚠️ অটো-ব্যাকআপ বন্ধ।'
                          );
                          setTimeout(() => setSyncToast(''), 3000);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition cursor-pointer flex items-center gap-1 ${
                          gDriveAutoBackupEnabled
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="অটো ব্যাকআপ চালু/বন্ধ"
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{gDriveAutoBackupEnabled ? 'অটো: ON' : 'অটো: OFF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGDriveConfigOpen((prev) => !prev)}
                        className={`p-1.5 rounded-xl border transition cursor-pointer ${
                          gDriveConfigOpen
                            ? 'bg-blue-600 text-white border-blue-700'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                        title="ড্রাইভ অথেন্টিকেশন ও সেটিংস"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* সংক্ষিপ্ত স্ট্যাটাস বার */}
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <SpotlightCard variant="sub">
                      <div className="bg-white/90 border border-blue-200/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between h-full">
                        <span className="text-slate-600 font-bold">সর্বশেষ:</span>
                        <span className="font-mono font-black text-blue-900">
                          {gDriveLastBackupTime
                            ? new Date(gDriveLastBackupTime).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                            : 'হয়নি'}
                        </span>
                      </div>
                    </SpotlightCard>

                    <SpotlightCard variant="sub">
                      <div className="bg-white/90 border border-blue-200/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between h-full">
                        <span className="text-slate-600 font-bold">পরবর্তী:</span>
                        <span className="font-mono font-black text-emerald-700">
                          {gDriveAutoBackupEnabled
                            ? gDriveLastBackupTime
                              ? `${toBengaliDigits(
                                  Math.max(1, Math.ceil((30 * 60 * 1000 - (( currentTimeTick || Date.now() ) - gDriveLastBackupTime)) / 60000))
                                )} মি.`
                              : '৩০ মি.'
                            : 'বন্ধ'}
                        </span>
                      </div>
                    </SpotlightCard>

                    <SpotlightCard variant="sub">
                      <div className="bg-white/90 border border-blue-200/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between h-full">
                        <span className="text-slate-600 font-bold">ডাটা:</span>
                        <span className="font-bold text-slate-900">
                          {toBengaliDigits(totalRegisteredCount)}টি • {toBengaliDigits(allPatientIdRecords.length)} ID
                        </span>
                      </div>
                    </SpotlightCard>
                  </div>

                  {/* সংক্ষিপ্ত ম্যানুয়াল বাটনসমূহ */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={gDriveSyncing}
                      onClick={() => performGoogleDriveFullBackup('MANUAL', false)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Cloud className={`w-3.5 h-3.5 ${gDriveSyncing ? 'animate-bounce' : ''}`} />
                      <span>{gDriveSyncing ? 'কপি হচ্ছে...' : 'ম্যানুয়াল ব্যাকআপ'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => performGoogleDriveFullBackup('MANUAL', true)}
                      className="amh-gold-marked flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                      title="সম্পূর্ণ ব্যাকআপ ডাউনলোড (.json)"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>ডাউনলোড (.json)</span>
                    </button>

                    <a
                      href={gDriveFolderUrl || 'https://drive.google.com/drive/my-drive'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="Google Drive খুলুন"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span>ড্রাইভ</span>
                    </a>
                  </div>

                  {/* Google Drive অথেন্টিকেশন ও অটো-আপলোড সেটিংস প্যানেল */}
                  {gDriveConfigOpen && (
                    <SpotlightCard variant="sub">
                    <div className="p-3 rounded-xl bg-white border-2 border-blue-300 space-y-3 animate-fadeIn text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-black text-slate-900 flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-blue-600" />
                          <span>Google Drive সংযোগ ও অথেন্টিকেশন সেটআপ</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setGDriveConfigOpen(false)}
                          className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* উপায় ১: সবচেয়ে সহজ ও স্থায়ী উপায় — Google Apps Script Webhook (কখনো লগআউট হয় না) */}
                      <SpotlightCard variant="sub">
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-black text-[11px] text-blue-950">
                            ১. স্থায়ী অটো-ব্যাকআপ লিংক (Apps Script Webhook — পাসওয়ার্ড/টোকেন মেয়াদ শেষ হয় না):
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              await safeCopyToClipboard(GOOGLE_APPS_SCRIPT_CODE);
                              setCopiedScriptCode(true);
                              setTimeout(() => setCopiedScriptCode(false), 2500);
                            }}
                            className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition"
                          >
                            {copiedScriptCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedScriptCode ? 'স্ক্রিপ্ট কপি হয়েছে!' : 'Apps Script কোড কপি করুন'}</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-bold">script.google.com</a>-এ গিয়ে নতুন প্রজেক্ট খুলে উপরের কোডটি পেস্ট করুন এবং <strong>Deploy &rarr; New deployment &rarr; Web app (Who has access: Anyone)</strong> দিয়ে প্রাপ্ত Web App URL নিচে বসান:
                        </p>
                        <input
                          type="url"
                          value={gDriveWebhookUrl}
                          onChange={(e) => {
                            setGDriveWebhookUrl(e.target.value);
                            try {
                              localStorage.setItem('amh_gdrive_webhook_url', e.target.value);
                            } catch {}
                          }}
                          placeholder="https://script.google.com/macros/s/.../exec"
                          className={`w-full px-2.5 py-1.5 text-xs font-mono ${themeStyles.input}`}
                        />
                      </div>
                      </SpotlightCard>

                      {/* উপায় ২: সরাসরি Google Drive API OAuth Token / Client ID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            ২. Google OAuth Access Token (সরাসরি API):
                          </label>
                          <input
                            type="password"
                            value={gDriveAccessToken}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              setGDriveAccessToken(val);
                              try {
                                localStorage.setItem('amh_gdrive_access_token', val);
                                localStorage.setItem('amh_gdrive_token_expiry', String(Date.now() + 3600 * 1000));
                              } catch {}
                            }}
                            placeholder="ya29.a0..."
                            className={`w-full px-2.5 py-1.5 text-xs font-mono ${themeStyles.input}`}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Google OAuth Client ID (পপ-আপ লগইনের জন্য):
                          </label>
                          <input
                            type="text"
                            value={gDriveClientId}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              setGDriveClientId(val);
                              try {
                                localStorage.setItem('amh_gdrive_client_id', val);
                              } catch {}
                            }}
                            placeholder="xxxx.apps.googleusercontent.com"
                            className={`w-full px-2.5 py-1.5 text-xs font-mono ${themeStyles.input}`}
                          />
                        </div>
                      </div>

                      {/* ড্রাইভ ফোল্ডার লিংক ও ৩০ মিনিট অটো ফাইল ডাউনলোড অপশন */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            ড্রাইভ ফোল্ডার লিংক:
                          </label>
                          <input
                            type="url"
                            value={gDriveFolderUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGDriveFolderUrl(val);
                              const fId = extractDriveFolderId(val);
                              if (fId) setGDriveFolderId(fId);
                              try {
                                localStorage.setItem('amh_gdrive_folder_url', val);
                                if (fId) localStorage.setItem('amh_gdrive_folder_id', fId);
                              } catch {}
                            }}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className={`w-full px-2.5 py-1.5 text-xs font-mono ${themeStyles.input}`}
                          />
                        </div>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={gDriveAutoDownloadEnabled}
                            onChange={(e) => {
                              const next = e.target.checked;
                              setGDriveAutoDownloadEnabled(next);
                              try {
                                localStorage.setItem('amh_gdrive_auto_download', JSON.stringify(next));
                              } catch {}
                            }}
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          />
                          <span className="text-[11px] font-bold text-slate-800">
                            প্রতি ৩০ মিনিটে অটো ব্যাকআপ ফাইল পিসিতেও ডাউনলোড হবে
                          </span>
                        </label>
                      </div>

                      {/* স্থায়ীভাবে সংরক্ষণ বাটন ও অটো-সেভ স্ট্যাটাস */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>টাইপ করার সাথে সাথে স্বয়ংক্রিয়ভাবে ব্রাউজার ও ক্লাউডে সংরক্ষিত হচ্ছে</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSaveAllSystemChanges}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            {gDriveConfigSaveSuccess ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>স্থায়ীভাবে সেইভ হয়েছে!</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                <span>সেটআপ স্থায়ীভাবে সেইভ করুন</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* সাম্প্রতিক ব্যাকআপ হিস্ট্রি ও ১-ক্লিকে রিস্টোর তালিকা */}
                      {gDriveBackupLogs.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <div className="text-[11px] font-black text-slate-700">
                            সাম্প্রতিক ব্যাকআপ ({toBengaliDigits(gDriveBackupLogs.length)}টি):
                          </div>
                          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                            {gDriveBackupLogs.slice(0, 5).map((log) => (
                              <div
                                key={log.id}
                                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]"
                              >
                                <div className="truncate">
                                  <span className="font-bold text-slate-800">{log.dateText} • {log.timeText}</span>
                                  <span className="ml-1.5 px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                    {log.mode}
                                  </span>
                                  {log.methodLabel && (
                                    <span className="ml-1 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                      {log.methodLabel}
                                    </span>
                                  )}
                                  <span className="ml-1.5 text-slate-500">
                                    ({toBengaliDigits(log.serialsCount)} সিরিয়াল, {toBengaliDigits(log.patientIdsCount)} আইডি)
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRestoreFromGDriveLog(log)}
                                  className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] shrink-0 cursor-pointer transition"
                                  title="এই ব্যাকআপ স্ন্যাপশট থেকে সম্পূর্ণ ডাটা রিস্টোর করুন"
                                >
                                  রিস্টোর করুন
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    </SpotlightCard>
                  )}
                </div>
                </SpotlightCard>
              </div>
              )}
            </div>
            </SpotlightCard>

              {/* দৈনিক রিপোর্ট সারাংশ কার্ড */}
            <SpotlightCard allowOverflow>
            <div className={`${themeStyles.card} p-5 sm:p-6 space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">{t.navReports}</h2>
                  <p className="text-xs opacity-70">তারিখ নির্বাচন করে পূর্ববর্তী ও পরবর্তী দিনের রিপোর্ট দেখুন</p>
                </div>

                {/* ইমপোর্ট ও এক্সপোর্ট শুধু আইকন বাটন */}
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  {/* ১. ইমপোর্ট আইকন বাটন */}
                  <button
                    type="button"
                    onClick={handleTriggerReportsImport}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition cursor-pointer shadow-xs"
                    title="রোগীর সিরিয়াল ও এন্ট্রি ফাইল ইমপোর্ট করুন (.csv / .json)"
                    aria-label="ইমপোর্ট"
                  >
                    <Upload className="w-4 h-4 text-slate-700" />
                  </button>

                  {/* ২. এক্সপোর্ট আইকন বাটন ও ড্রপডাউন মেনু */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setReportsExportMenuOpen(prev => !prev)}
                      className="amh-gold-marked p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition cursor-pointer shadow-xs flex items-center justify-center"
                      title="রোগীর সিরিয়ালের তালিকা ও সকল এন্ট্রি এক্সপোর্ট করুন"
                      aria-label="এক্সপোর্ট"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>

                    {/* এক্সপোর্ট মেনু ড্রপডাউন */}
                    {reportsExportMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setReportsExportMenuOpen(false)} />
                        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-2.5 z-40 space-y-1 animate-fadeIn text-xs">
                          <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 border-b border-slate-800">
                            এক্সপোর্ট অপশন নির্বাচন করুন
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setReportsExportMenuOpen(false);
                              handleExportDayQueueCsv(reportSelectedDate);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 transition flex items-center gap-2.5 cursor-pointer font-bold text-emerald-300"
                          >
                            <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-400" />
                            <div>
                              <div>{formatDateToDDMMYYYY(reportSelectedDate)} তারিখের সিরিয়াল (.csv)</div>
                              <div className="text-[10px] font-normal text-slate-400">নির্বাচিত দিনের রোগীর সিরিয়াল তালিকা</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setReportsExportMenuOpen(false);
                              handleExportAllQueueCsv();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 transition flex items-center gap-2.5 cursor-pointer font-bold text-amber-300"
                          >
                            <FileSpreadsheet className="w-4 h-4 shrink-0 text-amber-400" />
                            <div>
                              <div>সকল তারিখের সকল সিরিয়াল (.csv)</div>
                              <div className="text-[10px] font-normal text-slate-400">সব দিনের সর্বমোট রোগীর সিরিয়াল</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setReportsExportMenuOpen(false);
                              handleExportPatientIdsCsv();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 transition flex items-center gap-2.5 cursor-pointer font-bold text-teal-300"
                          >
                            <FileSpreadsheet className="w-4 h-4 shrink-0 text-teal-400" />
                            <div>
                              <div>সকল রোগীর Patient ID তালিকা (.csv)</div>
                              <div className="text-[10px] font-normal text-slate-400">স্থায়ী ডিরেক্টরির সকল রোগীর এন্ট্রি</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setReportsExportMenuOpen(false);
                              handleExportFullClinicJson();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 transition flex items-center gap-2.5 cursor-pointer font-bold text-indigo-300 border-t border-slate-800 mt-1 pt-1.5"
                          >
                            <Download className="w-4 h-4 shrink-0 text-indigo-400" />
                            <div>
                              <div>সম্পূর্ণ ক্লিনিক ব্যাকআপ (.json)</div>
                              <div className="text-[10px] font-normal text-slate-400">সিরিয়াল ও Patient ID সহ ফুল ডাটা ব্যাকআপ</div>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={reportSelectedDate}
                  onChange={(e) => setReportSelectedDate(e.target.value)}
                  className={`px-3 py-1.5 text-xs font-bold focus:outline-none ${themeStyles.input}`}
                />
                <button
                  type="button"
                  onClick={() => setReportSelectedDate((d) => shiftDateKey(d, -1))}
                  aria-label="আগের দিনের রিপোর্ট"
                  title="আগের দিনের রিপোর্ট"
                  className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded-xl border border-slate-300 transition cursor-pointer text-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReportSelectedDate(TODAY_KEY)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold border border-slate-300 transition cursor-pointer text-slate-800"
                >
                  আজ
                </button>
                <button
                  type="button"
                  onClick={() => setReportSelectedDate((d) => shiftDateKey(d, 1))}
                  aria-label="পরের দিনের রিপোর্ট"
                  title="পরের দিনের রিপোর্ট"
                  className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded-xl border border-slate-300 transition cursor-pointer text-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {currentUser?.isAdmin && (
                  <button
                    onClick={() =>
                      triggerAdminAction(
                        'DELETE_DATE_HISTORY',
                        reportSelectedDate,
                        'তারিখের রেকর্ড মুছুন',
                        `${formatDateToDDMMYYYY(reportSelectedDate)} তারিখের সকল রোগীর তালিকা মুছে ফেলতে অ্যাডমিন পাসওয়ার্ড দিন`
                      )
                    }
                    className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {currentUser?.isAdmin && lastDeletedDateBackup && (
                  <button
                    onClick={handleRestoreDeletedData}
                    className="p-2 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-800 border border-teal-300 transition cursor-pointer animate-pulse"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SpotlightCard variant="sub">
                <div className={`p-3 rounded-xl border border-slate-200 h-full ${themeStyles.subCard}`}>
                  <span className="text-xs font-bold opacity-70 block text-slate-700">মোট রোগী</span>
                  <span className="block text-2xl leading-none mt-1 tabular-nums font-black text-slate-900">{toBengaliDigits(reportDatePatients.length)}</span>
                </div>
              </SpotlightCard>
              <SpotlightCard variant="sub">
                <div className="p-3 bg-blue-100 rounded-xl border border-blue-200 h-full">
                  <span className="text-xs font-bold text-blue-800 block">শিশু (&lt; {toBengaliDigits(registrationRuleConfig?.ageLimitYears ?? 4)} বছর)</span>
                  <span className="block text-2xl leading-none mt-1 tabular-nums font-black text-blue-900">{toBengaliDigits(reportDatePatients.filter(p => p.isChildUnder4).length)}</span>
                </div>
              </SpotlightCard>
              <SpotlightCard variant="sub">
                <div className="p-3 bg-emerald-100 rounded-xl border border-emerald-200 h-full">
                  <span className="text-xs font-bold text-emerald-800 block">সাধারণ (≥ {toBengaliDigits(registrationRuleConfig?.ageLimitYears ?? 4)} বছর)</span>
                  <span className="block text-2xl leading-none mt-1 tabular-nums font-black text-emerald-900">{toBengaliDigits(reportDatePatients.filter(p => !p.isChildUnder4).length)}</span>
                </div>
              </SpotlightCard>
              <SpotlightCard variant="sub">
                <div className="p-3 bg-amber-100 rounded-xl border border-amber-200 h-full">
                  <span className="text-xs font-bold text-amber-800 block">সেবা সম্পন্ন</span>
                  <span className="block text-2xl leading-none mt-1 tabular-nums font-black text-amber-900">{toBengaliDigits(reportDatePatients.filter(p => p.status === 'COMPLETED').length)}</span>
                </div>
              </SpotlightCard>
            </div>
          </div>
          </SpotlightCard>

              {/* বিস্তারিত রিপোর্ট তালিকা (সংক্ষিপ্ত) */}
              <SpotlightCard variant="sub">
                <div className={`${themeStyles.card} px-3 py-2.5 space-y-2`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      রিপোর্ট সারসংক্ষেপ
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-600">{formatDateToDDMMYYYY(reportSelectedDate)}</span>
                      <span className="text-[10px] font-black text-slate-800">মোট {toBengaliDigits(reportCompactStats.total)}</span>
                      <span className="text-[10px] font-black text-sky-700">অপেক্ষমাণ {toBengaliDigits(reportCompactStats.waiting)}</span>
                      <span className="text-[10px] font-black text-amber-700">ডাকা {toBengaliDigits(reportCompactStats.called)}</span>
                      <span className="text-[10px] font-black text-emerald-700">সম্পন্ন {toBengaliDigits(reportCompactStats.completed)}</span>
                    </div>
                  </div>
                  {reportCompactStats.total > 0 ? (
                    <div className="space-y-1 max-h-[320px] overflow-y-auto pr-0.5">
                      {reportCompactListSorted
                        .map((p) => {
                          const statusKey = String(p.status || '').toUpperCase();
                          const isCalled = statusKey === 'CALLED';
                          const isDone = statusKey === 'COMPLETED';
                          const stamp = isDone ? (p.completedTimestamp || p.updatedTimestamp) : isCalled ? (p.calledTimestamp || p.updatedTimestamp) : 0;
                          const timeText = stamp ? new Date(Number(stamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                          const chipClass = isCalled
                            ? 'bg-amber-100 border-amber-300 text-amber-900'
                            : isDone
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-slate-100 border-slate-300 text-slate-700';
                          const badgeClass = isCalled
                            ? 'bg-amber-500 text-white'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700';
                          const label = isCalled ? 'ডাকা হয়েছে' : isDone ? 'সেবা সম্পন্ন' : 'অপেক্ষমাণ';
                          return (
                            <div key={p.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/80 border border-slate-200">
                              <span className={`shrink-0 w-9 text-center px-1 py-0.5 rounded text-[10px] font-black font-mono border ${chipClass}`}>
                                #{toBengaliDigits(p.serialNumber)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-black text-slate-900 truncate">{p.name}</p>
                                <p className="text-[9px] font-bold text-slate-600 truncate">
                                  বয়স {formatCompactAge(p)} · {label}{timeText ? ` · ${toBengaliDigits(timeText)}` : ''}
                                </p>
                              </div>
                              <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black ${badgeClass}`}>
                                {isDone ? 'সম্পন্ন' : isCalled ? 'ডাকা' : 'অপেক্ষমাণ'}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-500">এই তারিখে কোনো রোগী নেই</p>
                  )}
                </div>
              </SpotlightCard>
        </div>
        )}

        {/* Admin Panel (সরাসরি অ্যাডমিনের জন্য উন্মুক্ত, কোনো অতিরিক্ত পাসওয়ার্ড ছাড়া) */}
        {activeTab === 'team' && currentUser?.isAdmin && (
          <div className="max-w-4xl mx-auto space-y-4">
            <SpotlightCard variant="sub">
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>এডমিন প্যানেল • অ্যাডমিন ড্যাশবোর্ড সরাসরি সক্রিয়</span>
                </div>
              </div>
            </SpotlightCard>

                {/* লগইন পাসওয়ার্ড রিকোয়ার্ড অন/অফ বাটন */}
                <SpotlightCard dark>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black transition-colors ${
                      requireLoginPassword ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-white">লগইন করার সময় পাসওয়ার্ড যাচাই</h4>
                        <span className={`${requireLoginPassword ? 'amh-gold-marked ' : ''}text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          requireLoginPassword
                            ? 'bg-emerald-400 text-slate-950 font-black shadow-xs'
                            : 'bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold'
                        }`}>
                          {requireLoginPassword ? 'চালু (ON) • পাসওয়ার্ড আবশ্যক' : 'বন্ধ (OFF) • পাসওয়ার্ড ছাড়া প্রবেশ'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {requireLoginPassword
                          ? 'চালু করা আছে: প্রতিবার লগইন করার সময় স্টাফ বা অ্যাডমিন অ্যাকাউন্টের জন্য সঠিক পাসওয়ার্ড / পিন দেওয়া বাধ্যতামূলক।'
                          : 'বন্ধ করা আছে: কোনো পাসওয়ার্ড লাগবে না—স্টাফ বা অ্যাডমিন নির্বাচন করে সরাসরি এক ক্লিকে সিস্টেমে প্রবেশ করা যাবে।'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !requireLoginPassword;
                      setRequireLoginPassword(nextVal);
                      try {
                        localStorage.setItem('amh_require_login_password', JSON.stringify(nextVal));
                        if (nextVal) {
                          sessionStorage.removeItem('amh_session_authenticated');
                        } else {
                          sessionStorage.setItem('amh_session_authenticated', 'true');
                        }
                      } catch {}
                      setSyncToast(nextVal ? '✓ পাসওয়ার্ড সুরক্ষা চালু হয়েছে (প্রতিবার লগইনে পাসওয়ার্ড লাগবে)' : '✓ পাসওয়ার্ড সুরক্ষা বন্ধ হয়েছে (পাসওয়ার্ড ছাড়া সরাসরি লগইন)');
                      setTimeout(() => setSyncToast(''), 3500);
                    }}
                    className={`amh-gold-marked relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-md ${
                      requireLoginPassword ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    title={requireLoginPassword ? 'পাসওয়ার্ড যাচাই বন্ধ করতে ক্লিক করুন' : 'পাসওয়ার্ড যাচাই চালু করতে ক্লিক করুন'}
                  >
                    <span
                      className={`amh-gold-marked-thumb pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        requireLoginPassword ? 'translate-x-8' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                </SpotlightCard>

                <SpotlightCard>
                <div className={`${themeStyles.card} p-5 space-y-4`}>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-slate-200 pb-2 text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>এডমিন প্যানেল ও টিম সদস্য ব্যবস্থাপনা</span>
                  </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {teamMembers.map(member => {
                  const isActive = currentUser?.id === member.id;
                  return (
                    <SpotlightCard key={member.id} variant="sub">
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between transition h-full ${
                        isActive ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : `${themeStyles.subCard} border-slate-200`
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 ${member.color || 'bg-slate-600'}`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900">{member.name}</span>
                            {isActive && <span className="bg-emerald-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">সক্রিয়</span>}
                            {member.isAdmin && <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-rose-300">অ্যাডমিন</span>}
                          </div>
                          <span className="text-[11px] opacity-70 font-medium block text-slate-600">{member.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {currentUser?.isAdmin && (
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setEditName(member.name);
                              setEditRole(member.role);
                              setEditPin(member.pin);
                            }}
                            className="p-1.5 opacity-80 hover:opacity-100 hover:bg-slate-200 rounded-lg transition border border-slate-300 cursor-pointer text-slate-700"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!isActive && (
                          <button
                            onClick={() => { setCurrentUser(member); persistActiveUserId(member.id); }}
                            className="px-2.5 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition border border-slate-300 cursor-pointer"
                          >
                            সুইচ
                          </button>
                        )}
                      </div>
                    </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>
            </SpotlightCard>

            {/* নতুন নিবন্ধনের বয়স ও জোড়/বিজোড় সিরিয়াল রুলস সেটিংস কার্ড */}
            <SpotlightCard>
            <div className={`${themeStyles.subCard} p-5 space-y-4 border-2 ${themeStyles.settingsBorder || 'border-emerald-400'}`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 flex-wrap gap-2">
                <div className={`flex items-center gap-2 font-black text-xs ${themeStyles.settingsText || 'text-emerald-800'}`}>
                  <Settings className="w-4 h-4 text-emerald-600" />
                  <span>বয়স ও সিরিয়াল রুলস</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextConfig = {
                        ...registrationRuleConfig,
                        enabled: !registrationRuleConfig.enabled
                      };
                      setRegistrationRuleConfig(nextConfig);
                      try {
                        localStorage.setItem('amh_registration_rule_config', JSON.stringify(nextConfig));
                      } catch {}
                      broadcastFullState(
                        patientsByDate,
                        teamMembers,
                        chamberStartTime,
                        avgServiceMinutes,
                        whatsappTemplate,
                        patientIdDirectory,
                        clinicNameState,
                        doctorTitleState,
                        patientIdPrefix,
                        deletedDates,
                        closedDates,
                        nextConfig
                      );
                    }}
                    className={`amh-gold-marked px-2.5 py-1 rounded-full text-[10px] font-black transition cursor-pointer flex items-center gap-1 border ${
                      registrationRuleConfig?.enabled
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {registrationRuleConfig?.enabled ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>রুলস চালু</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>সাধারণ ক্রমিক</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <SpotlightCard variant="sub">
                <div className="p-3 rounded-xl bg-white/95 border border-emerald-200 text-xs text-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">বর্তমান রুলস:</div>
                  <div className="font-bold text-slate-900">{registrationRuleShortText}</div>
                </div>
              </SpotlightCard>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* বয়স সীমা নির্ধারণ ঘর */}
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">
                    বয়স সীমা:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tempRuleAgeLimit}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9০-৯.]/g, '');
                        setTempRuleAgeLimit(raw);
                        const num = Number(parseBengaliDigits(raw));
                        if (!isNaN(num) && num >= 0) {
                          const nextConfig = {
                            ...registrationRuleConfig,
                            ageLimitYears: num
                          };
                          setRegistrationRuleConfig(nextConfig);
                        }
                      }}
                      placeholder="যেমন: ৪"
                      className={`w-full px-3 py-2 text-xs font-black font-mono focus:outline-none ${themeStyles.input}`}
                    />
                    <span className="text-xs font-bold text-slate-600 shrink-0">বছর</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    ডিফল্ট: ৪ বছর
                  </span>
                </div>

                {/* নির্ধারিত বয়সের নিচে হলে সিরিয়াল ধরন */}
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">
                    বয়স {toBengaliDigits(registrationRuleConfig?.ageLimitYears ?? 4)} বছরের নিচে:
                  </label>
                  <select
                    value={registrationRuleConfig?.underAgeParity || 'EVEN'}
                    onChange={(e) => {
                      const nextConfig = {
                        ...registrationRuleConfig,
                        underAgeParity: e.target.value
                      };
                      setRegistrationRuleConfig(nextConfig);
                    }}
                    disabled={!registrationRuleConfig?.enabled}
                    className={`w-full px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer ${themeStyles.input} ${
                      !registrationRuleConfig?.enabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="EVEN">জোড় (#২, #৪…)</option>
                    <option value="ODD">বিজোড় (#১, #৩…)</option>
                    <option value="SEQUENTIAL">ক্রমিক (#১, #২…)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    শিশু কোটার নিয়ম
                  </span>
                </div>

                {/* নির্ধারিত বয়স বা তদূর্ধ্ব হলে সিরিয়াল ধরন */}
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">
                    বয়স {toBengaliDigits(registrationRuleConfig?.ageLimitYears ?? 4)} বছর বা বেশি:
                  </label>
                  <select
                    value={registrationRuleConfig?.overAgeParity || 'ODD'}
                    onChange={(e) => {
                      const nextConfig = {
                        ...registrationRuleConfig,
                        overAgeParity: e.target.value
                      };
                      setRegistrationRuleConfig(nextConfig);
                    }}
                    disabled={!registrationRuleConfig?.enabled}
                    className={`w-full px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer ${themeStyles.input} ${
                      !registrationRuleConfig?.enabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="ODD">বিজোড় (#১, #৩…)</option>
                    <option value="EVEN">জোড় (#২, #৪…)</option>
                    <option value="SEQUENTIAL">ক্রমিক (#১, #২…)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    সাধারণ কোটার নিয়ম
                  </span>
                </div>
              </div>

              {/* কাস্টম রুলস টেক্সট / নোটিশ ঘর */}
              <div className="pt-1">
                <label className="block text-xs font-bold mb-1 text-slate-700">
                  কাস্টম বার্তা (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  value={registrationRuleConfig?.customRuleNotice || ''}
                  onChange={(e) => {
                    const nextConfig = {
                      ...registrationRuleConfig,
                      customRuleNotice: e.target.value
                    };
                    setRegistrationRuleConfig(nextConfig);
                  }}
                  placeholder="ফাঁকা রাখলে স্বয়ংক্রিয় বার্তা"
                  className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                />
              </div>

              {/* রিসেট ও সংরক্ষণ বাটন */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    const defaultConfig = {
                      enabled: true,
                      ageLimitYears: 4,
                      underAgeParity: 'EVEN',
                      overAgeParity: 'ODD',
                      customRuleNotice: ''
                    };
                    setRegistrationRuleConfig(defaultConfig);
                    setTempRuleAgeLimit('৪');
                    try {
                      localStorage.setItem('amh_registration_rule_config', JSON.stringify(defaultConfig));
                    } catch {}
                    broadcastFullState(
                      patientsByDate,
                      teamMembers,
                      chamberStartTime,
                      avgServiceMinutes,
                      whatsappTemplate,
                      patientIdDirectory,
                      clinicNameState,
                      doctorTitleState,
                      patientIdPrefix,
                      deletedDates,
                      closedDates,
                      defaultConfig
                    );
                    setRuleSaveSuccess(true);
                    setTimeout(() => setRuleSaveSuccess(false), 2500);
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ডিফল্ট রুলস</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const parsedAge = Number(parseBengaliDigits(tempRuleAgeLimit));
                    const finalAge = !isNaN(parsedAge) && parsedAge >= 0 ? parsedAge : 4;
                    const finalConfig = {
                      ...registrationRuleConfig,
                      ageLimitYears: finalAge
                    };
                    setRegistrationRuleConfig(finalConfig);
                    setTempRuleAgeLimit(toBengaliDigits(finalAge));
                    try {
                      localStorage.setItem('amh_registration_rule_config', JSON.stringify(finalConfig));
                    } catch {}
                    broadcastFullState(
                      patientsByDate,
                      teamMembers,
                      chamberStartTime,
                      avgServiceMinutes,
                      whatsappTemplate,
                      patientIdDirectory,
                      clinicNameState,
                      doctorTitleState,
                      patientIdPrefix,
                      deletedDates,
                      closedDates,
                      finalConfig
                    );
                    setRuleSaveSuccess(true);
                    setTimeout(() => setRuleSaveSuccess(false), 2500);
                  }}
                  className="amh-gold-marked px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                >
                  {ruleSaveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{ruleSaveSuccess ? 'রুলস সংরক্ষিত হয়েছে!' : 'রুলস সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </div>
            </SpotlightCard>

          </div>
        )}

        {/* Settings Panel */}
        {activeTab === 'settings' && (
          <SpotlightCard className="max-w-2xl mx-auto">
          <div className={`${themeStyles.card} p-6 space-y-5`}>
              {/* TV বোর্ড কনফিগারেশন — শুধুমাত্র এডমিনের জন্য (সেটিংস প্যানেলে) */}


              {/* মোবাইল অ্যাপ (PWA) ইনস্টল */}
              {!pwaInstalled && (
                <SpotlightCard variant="sub">
                  <div className={`${themeStyles.subCard} p-4 space-y-2`}>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">মোবাইল অ্যাপ হিসেবে ইনস্টল করুন</h4>
                        <p className="text-[10px] font-bold text-slate-600">হোম স্ক্রিনে আইকন হবে, ফুল-স্ক্রিনে খুলবে, ইন্টারনেট ছাড়াও আগের ডেটা দেখাবে।</p>
                      </div>
                    </div>
                    {installPromptEvent ? (
                      <button
                        type="button"
                        onClick={handleInstallPwa}
                        className="amh-gold-marked w-full min-h-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer transition"
                      >
                        অ্যাপ ইনস্টল করুন
                      </button>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-600 leading-snug">
                        Chrome: উপরে ডান দিকের ⋮ মেনু → <strong>Add to Home screen / Install app</strong>। iPhone (Safari): Share বাটন → <strong>Add to Home Screen</strong>।
                      </p>
                    )}
                  </div>
                </SpotlightCard>
              )}
            <SpotlightCard variant="sub">
            <div className={`${themeStyles.subCard} p-5`}>
              <div className="flex items-center gap-1.5 sm:gap-3">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-normal sm:tracking-wider text-slate-700 shrink-0 whitespace-nowrap">থিম নির্বাচন করুন:</label>
                <div className="relative flex-1 min-w-0">
                  <select
                    value={activeTheme}
                    onChange={(e) => {
                      const newTheme = e.target.value;
                      setActiveTheme(newTheme);
                      try {
                        localStorage.setItem('amh_active_theme', newTheme);
                      } catch {}
                    }}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-bold appearance-none cursor-pointer ${themeStyles.input}`}
                  >
                    {THEMES.map(th => (
                      <option key={th.id} value={th.id}>
                        {th.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>
              <p className="text-[10px] font-bold text-slate-500 mt-1">শর্টকাট: <kbd className="px-1 py-0.5 rounded border border-slate-300 bg-white/80 font-mono">Ctrl+T</kbd> / <kbd className="px-1 py-0.5 rounded border border-slate-300 bg-white/80 font-mono">Ctrl+Alt+T</kbd> — চাপলেই পরের থিম</p>
              </div>
            </div>
            </SpotlightCard>

            {/* চেম্বার ও সময় সেটিংস কার্ড */}
            <SpotlightCard variant="sub">
            <div className={`${themeStyles.subCard} p-5 space-y-4 border ${themeStyles.settingsBorder || 'border-emerald-300'}`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className={`flex items-center gap-2 font-black text-xs ${themeStyles.settingsText || 'text-emerald-800'}`}>
                  <Clock className="w-4 h-4" />
                  <span>চেম্বার ও সময় সেটিংস (লাইভ কিউ ক্যালকুলেশন)</span>
                </div>
              </div>

              {/* ৭ দিনের চেম্বার অন/অফ শিডিউল (ছুটি ও বন্ধের দিন নির্ধারণ) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-x-3 flex-nowrap">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>৭ দিনের চেম্বার অন/অফ শিডিউল:</span>
                  </label>
                  {/* চেয়ার শুরুর সময় ও রোগী প্রতি গড় সময় — শিরোনামের ডান পাশে এক লাইনে */}
                  <div className="flex items-center gap-2 ml-auto flex-nowrap">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="text-[10px] font-bold text-slate-700 whitespace-nowrap">চেয়ার শুরুর সময়:</label>
                      <input
                        type="time"
                        value={chamberStartTime}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          setChamberStartTime(newTime);
                          broadcastFullState(patientsByDate, teamMembers, newTime, avgServiceMinutes, whatsappTemplate, patientIdDirectory, undefined, undefined, patientIdPrefix, undefined, closedDates);
                        }}
                        className={`px-1.5 py-1 text-[11px] font-bold focus:outline-none ${themeStyles.input}`}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="text-[10px] font-bold text-slate-700 whitespace-nowrap">রোগী প্রতি গড় সময়:</label>
                      <select
                        value={avgServiceMinutes}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAvgServiceMinutes(val);
                          broadcastFullState(patientsByDate, teamMembers, chamberStartTime, val, whatsappTemplate, patientIdDirectory, undefined, undefined, patientIdPrefix, undefined, closedDates);
                        }}
                        className={`px-1.5 py-1 text-[11px] font-bold focus:outline-none cursor-pointer ${themeStyles.input}`}
                      >
                        <option value="2">২ মি.</option>
                        <option value="3">৩ মি. (ডিফল্ট)</option>
                        <option value="5">৫ মি.</option>
                        <option value="7">৭ মি.</option>
                        <option value="10">১০ মি.</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-0.5">
                  {upcomingSevenDays.map((d) => {
                    const isClosed = closedDates.includes(d.isoDate);
                    return (
                      <button
                        key={d.isoDate}
                        type="button"
                        onClick={() => toggleDateChamberStatus(d.isoDate)}
                        className={`py-1 px-1 rounded-xl border text-center transition cursor-pointer select-none flex flex-col items-center justify-center gap-0.5 shadow-2xs ${
                          isClosed
                            ? 'bg-rose-50 border-rose-300 text-rose-950 hover:bg-rose-100 ring-1 ring-rose-400'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100 ring-1 ring-emerald-400'
                        }`}
                        title={`${d.label} (${d.isoDate}): ক্লিক করে ${isClosed ? 'চেম্বার চালু' : 'চেম্বার বন্ধ'} করুন`}
                      >
                        <span className="text-[11px] font-black tracking-tight">{d.label}</span>
                        <div>
                          {isClosed ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white shadow-2xs">
                              <XCircle className="w-2.5 h-2.5" />
                              <span>বন্ধ (Off)</span>
                            </span>
                          ) : (
                            <span className="amh-gold-marked inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-700 text-white shadow-2xs">
                              <CheckCircle className="w-2.5 h-2.5" />
                              <span>খোলা (On)</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>
            </SpotlightCard>

            {/* Clinic Info Settings */}
            <SpotlightCard variant="sub">
            <div className={`${themeStyles.subCard} p-5 space-y-3 border border-slate-300`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2 font-black text-xs text-slate-900">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>ক্লিনিক তথ্য</span>
                </div>
                {!currentUser?.isAdmin && (
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">ভিউ অনলি</span>
                )}
              </div>

              {currentUser?.isAdmin ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700">ক্লিনিক বা প্রতিষ্ঠানের নাম:</label>
                    <input
                      type="text"
                      value={tempClinicName}
                      onChange={(e) => setTempClinicName(e.target.value)}
                      className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700">চিকিৎসকের নাম ও পদবি:</label>
                    <input
                      type="text"
                      value={tempDoctorTitle}
                      onChange={(e) => setTempDoctorTitle(e.target.value)}
                      className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setClinicNameState(tempClinicName);
                        setDoctorTitleState(tempDoctorTitle);
                        broadcastFullState(
                          patientsByDate,
                          teamMembers,
                          chamberStartTime,
                          avgServiceMinutes,
                          whatsappTemplate,
                          patientIdDirectory,
                          tempClinicName,
                          tempDoctorTitle,
                          patientIdPrefix,
                          undefined,
                          closedDates
                        );
                        setClinicSaveSuccess(true);
                        setTimeout(() => setClinicSaveSuccess(false), 2500);
                      }}
                      className="amh-gold-marked px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                    >
                      {clinicSaveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{clinicSaveSuccess ? 'আপডেট হয়েছে!' : 'তথ্য সংরক্ষণ করুন'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs pt-1 opacity-90 font-medium text-slate-800">
                  <p><strong>প্রতিষ্ঠান:</strong> {clinicNameState}</p>
                  <p><strong>চিকিৎসক:</strong> {doctorTitleState}</p>
                </div>
              )}
            </div>
            </SpotlightCard>

            {/* WhatsApp / SMS মেসেজ ড্রাফট সেটিংস কার্ড */}
            <SpotlightCard variant="sub">
            <div className={`${themeStyles.subCard} p-5 space-y-3 border-2 border-emerald-500/40`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>মেসেজ ড্রাফট এডিট (WhatsApp / SMS টেমপ্লেট)</span>
                </div>
                {currentUser?.isAdmin ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-800 px-2 py-0.5 rounded-full font-bold">অ্যাডমিন কন্ট্রোল</span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">ভিউ অনলি</span>
                )}
              </div>

              {currentUser?.isAdmin ? (
                <>
                  <textarea
                    rows={8}
                    value={tempDraftInput}
                    onChange={(e) => setTempDraftInput(e.target.value)}
                    className={`w-full p-3 text-xs font-mono font-semibold focus:outline-none ${themeStyles.input}`}
                    placeholder="WhatsApp মেসেজ টেমপ্লেট লিখুন..."
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] opacity-65 text-slate-600">
                      ব্যবহারযোগ্য ট্যাগ: {'{patientName}, {serialNumber}, {category}, {dateLabel}, {appointmentDate}, {estCall}'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappTemplate(tempDraftInput);
                        broadcastFullState(
                          patientsByDate,
                          teamMembers,
                          chamberStartTime,
                          avgServiceMinutes,
                          tempDraftInput,
                          patientIdDirectory,
                          clinicNameState,
                          doctorTitleState,
                          patientIdPrefix,
                          undefined,
                          closedDates
                        );
                        setDraftSaveSuccess(true);
                        setTimeout(() => setDraftSaveSuccess(false), 2500);
                      }}
                      className="amh-gold-marked px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
                    >
                      {draftSaveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{draftSaveSuccess ? 'সেইভ হয়েছে!' : 'ড্রাফট সেইভ করুন'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-xs pt-1 opacity-90 font-mono bg-white/70 p-3 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap">
                  {whatsappTemplate}
                </div>
              )}
            </div>
            </SpotlightCard>
          </div>
          </SpotlightCard>
        )}
        {/* ===== টিভি সেটআপ প্যানেল — শুধুমাত্র এডমিন (নেভ-বারের নতুন বাটন থেকে) ===== */}
              {activeTab === 'tvconfig' && currentUser?.isAdmin && (() => {
                const pvBoard = tvPreviewBoard();
                const pvPortrait = pvBoard === 1 || pvBoard === 2;
                const pvW = pvPortrait ? 1080 : 1920;
                const pvH = pvPortrait ? 1920 : 1080;
                const pvSC = 0.30;
                const pvBoxW = Math.round(pvW * pvSC);
                const pvBoxH = Math.round(pvH * pvSC);
                return (
                <div className="w-full max-w-[1700px] mx-auto px-1">
                  <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-3 items-start">
                    {/* বাম: ফিক্সড লাইভ প্রিভিউ প্যানেল — শুধু ডেস্কটপে, মোবাইলে দেখানো হয় না */}
                    <div data-select-ask-ignore="true" className="hidden lg:block sticky self-start rounded-2xl border border-slate-300 bg-white/95 shadow-2xl overflow-y-auto text-slate-900" style={{ width: pvBoxW + 2, top: 'calc(var(--amh-header-h, 112px) + 26px)', maxHeight: 'calc(100dvh - var(--amh-header-h, 112px) - 40px)' }}>
                      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-violet-50 flex-wrap">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tv className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="text-[11px] font-black truncate">লাইভ প্রিভিউ — {tvBoardsConfig[pvBoard]?.label || TV_BOARD_DEFAULT_LABELS[pvBoard]}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {[1, 2, 3, 4].map((nn) => (
                            <button key={nn} type="button" onClick={() => setTvPreview((p) => ({ ...p, board: nn }))} className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border transition cursor-pointer ${pvBoard === nn ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300 hover:text-slate-800'}`}>TV-{nn}</button>
                          ))}
                        </div>
                      </div>
                      <div className="relative bg-black overflow-hidden" style={{ width: pvBoxW, height: pvBoxH }}>
                        <iframe key={pvBoard} title="টিভি বোর্ড লাইভ প্রিভিউ" src={`${window.location.origin}${window.location.pathname}?tv=${pvBoard}&mini=1`} style={{ width: pvW, height: pvH, border: 0, transform: `scale(${pvSC})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
                      </div>
                      <div className="px-3 py-1.5 text-[9px] font-bold text-slate-500 border-t border-slate-200 bg-white/90">সেটিংসের প্রতিটি বদল এখানে হুবহু দেখা যাবে — রঙ, ফন্ট, লেআউট, ইফেক্ট, মার্কি, স্বাগত স্ক্রিন সব।</div>
                    </div>
                  <div className="@container min-w-0">
                <SpotlightCard className="w-full">
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-200 shadow-2xl text-slate-900">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shrink-0"><Tv className="w-4.5 h-4.5" /></span>
                      <h4 className="text-base font-black text-slate-900 tracking-tight">TV বোর্ড কনফিগারেশন</h4>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button" onClick={() => { const next = !tvSyncEnabled; if (next) { tvLastSentJsonRef.current = null; tvInitBroadcastRef.current = false; } setTvSyncEnabled(next); setSyncToast(next ? '✓ ডিভাইস-সিঙ্ক চালু — এখন বদল সব ডিভাইসে ছড়াবে' : '⏸ ডিভাইস-সিঙ্ক বন্ধ — এই ডিভাইস আলাদাভাবে চলবে'); setTimeout(() => setSyncToast(''), 3000); }} className={`amh-gold-marked inline-flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2 py-1 border transition cursor-pointer shrink-0 ${tvSyncEnabled ? 'text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-500 border-slate-300 bg-slate-100 hover:bg-slate-200'}`} title={tvSyncEnabled ? 'ডিভাইস-সিঙ্ক চালু — বন্ধ করতে চাপুন' : 'ডিভাইস-সিঙ্ক বন্ধ — চালু করতে চাপুন'} aria-pressed={tvSyncEnabled}>
                        <span className={`amh-gold-marked relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors ${tvSyncEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}><span className={`amh-gold-marked-thumb pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition ${tvSyncEnabled ? 'translate-x-3.5' : 'translate-x-0.5'}`} /></span>
                        সিঙ্ক {tvSyncEnabled ? 'চালু' : 'বন্ধ'}
                      </button>
                      <span className={`${tvSyncEnabled ? 'amh-gold-marked ' : ''}inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-1 border ${tvSyncEnabled ? 'text-emerald-700 border-emerald-300 bg-emerald-50' : 'text-slate-500 border-slate-300 bg-slate-100'}`} title="TV সেটিংস বদলালে সেগুলো Supabase ডেটাবেসের মাধ্যমে সব অনুমোদিত ডিভাইসে সিঙ্ক হয়"><RefreshCw className={`w-3 h-3 ${tvSyncEnabled ? '' : 'opacity-50'}`} />{tvSyncEnabled ? 'সেটিংস ডিভাইসে সিঙ্ক হয়' : 'সিঙ্ক বন্ধ (শুধু এই ডিভাইস)'}</span>
                      <button
                        type="button"
                        onClick={() => { resetAllTvConfig(); setSyncToast('✓ সব TV সেটিংস ডিফল্টে ফেরানো হয়েছে'); setTimeout(() => setSyncToast(''), 3000); }}
                        className="text-[10px] font-bold text-rose-600 border border-rose-300 rounded-lg px-2 py-1 hover:bg-rose-50 transition cursor-pointer shrink-0"
                        title="সব TV কনফিগ ডিফল্টে ফিরিয়ে নিন"
                      >সব রিসেট</button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-3">প্রতিটি বোর্ড চালু/বন্ধ, নাম, কোন প্যানেল দেখাবে, সংখ্যা, ফন্ট সাইজ ও রঙ — এখান থেকে আলাদাভাবে ঠিক করুন। নিচে সাধারণ (গ্লোবাল) সেটিংস। TV সেটিংস এখন সব ডিভাইসে সিঙ্ক হয় — একটি ডিভাইসে বদলালে ফোন/টিভিতেও বসে যাবে।</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 @min-[1200px]:grid-cols-4 gap-2 items-start">
                    {[1, 2, 3, 4].map((n) => {
                      const cfg = tvBoardsConfig[n] || {};
                      const PANEL_LABELS = { called: 'চলমান', next: 'পরবর্তী', tenList: '১০ জন', absent: 'অনুপস্থিত', inside: 'ভিতরে' };
                      return (
                        tvCardUiGet(n).hidden ? (
                          <div key={n} className={`flex items-center justify-between gap-2 rounded-2xl border border-l-4 px-3 py-2 shadow-sm ${TV_CARD_TINTS[n].bg} ${TV_CARD_TINTS[n].rail} ${TV_CARD_TINTS[n].border}`}>
                            <span className="min-w-0 truncate text-xs font-bold text-slate-600">{cfg.label || `TV-${n}`} · লুকানো আছে</span>
                            <button type="button" onClick={() => setTvCardUiFor(n, { hidden: false })} className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 rounded-lg border border-slate-300 bg-white px-2 py-1 cursor-pointer" title="আবার দেখান"><Eye className="w-3.5 h-3.5" /> দেখান</button>
                          </div>
                        ) : (
                        <div key={n} className={`rounded-2xl border border-l-4 px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow duration-200 ${TV_CARD_TINTS[n].bg} ${TV_CARD_TINTS[n].rail} ${TV_CARD_TINTS[n].border} ${cfg.enabled ? '' : 'opacity-75'}`}>
                          {/* সারি ১: চালু, নাম, ডিফল্ট(★), খুলুন, মিনিমাইজ/হাইড — নতুন সাজ */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => updateTvBoard(n, { enabled: !cfg.enabled })}
                              className={`amh-gold-marked relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${cfg.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              title={cfg.enabled ? 'বন্ধ করুন' : 'চালু করুন'} aria-label={`TV-${n} চালু/বন্ধ`}
                            >
                              <span className={`amh-gold-marked-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${cfg.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                            <input
                              type="text" value={cfg.label ?? ''}
                              onChange={(e) => updateTvBoard(n, { label: e.target.value })}
                              onBlur={() => { if (!(cfg.label || '').trim()) updateTvBoard(n, { label: TV_BOARD_DEFAULT_LABELS[n] }); }}
                              placeholder={`TV-${n}`}
                              className="min-w-0 flex-1 px-3 py-1.5 text-sm font-black rounded-full border border-white/80 bg-white/95 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-300" aria-label={`TV-${n} এর নাম`}
                            />
                            <button
                              type="button" onClick={() => setTvDefaultVariant(n)}
                              className={`${tvChip(tvDefaultVariant === n, 'amber')} ${tvDefaultVariant === n ? 'amh-gold-marked' : ''}`}
                              title={tvDefaultVariant === n ? 'ডিফল্ট বোর্ড (টক মোডে এটিই খোলে)' : 'ডিফল্ট বোর্ড হিসেবে ঠিক করুন'}
                            ><Star className="w-3 h-3" />{tvDefaultVariant === n ? 'ডিফল্ট' : 'ডিফল্ট করুন'}</button>
                            <button
                              type="button" onClick={() => openTvVariant(n)}
                              className="inline-flex shrink-0 items-center gap-1 text-[10px] font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-full px-3 py-1.5 shadow-sm transition cursor-pointer whitespace-nowrap" title="এই বোর্ডটি এখনই খুলে দেখুন"
                            ><Play className="w-3 h-3" />খুলুন</button>
                            {/* মিনিমাইজ ও হাইড — এক প্যাক */}
                            <div className="inline-flex shrink-0 items-center rounded-full border border-slate-300 bg-white/90 divide-x divide-slate-200 shadow-sm">
                              <button type="button" onClick={() => setTvCardUiFor(n, { minimized: !tvCardUiGet(n).minimized })} className={`inline-flex items-center justify-center h-6.5 w-7 rounded-l-full cursor-pointer transition ${tvCardUiGet(n).minimized ? 'text-slate-500 hover:text-indigo-700' : 'bg-slate-700 text-white rounded-l-full'}`} title={tvCardUiGet(n).minimized ? 'বড় করে দেখান' : 'ছোট করুন'} aria-label="মিনিমাইজ/এক্সপ্যান্ড">{tvCardUiGet(n).minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}</button>
                              <button type="button" onClick={() => setTvCardUiFor(n, { hidden: true })} className="inline-flex items-center justify-center h-6.5 w-7 rounded-r-full text-slate-500 hover:text-rose-600 cursor-pointer transition" title="এই কার্ডটি লুকান" aria-label="লুকান"><EyeOff className="w-4 h-4" /></button>
                            </div>
                          </div>

                        </div>
                      ));
                    })}

                  {/* খোলা বোর্ডের পুরো সেটিংস — পুরো প্রস্থ জুড়ে, হেডার সারির নিচে */}
                  {[1, 2, 3, 4].map((n) => {
                    const cfg = tvBoardsConfig[n] || {};
                    const PANEL_LABELS = { called: 'চলমান', next: 'পরবর্তী', tenList: '১০ জন', absent: 'অনুপস্থিত', inside: 'ভিতরে' };
                    if (!(cfg.enabled && !tvCardUiGet(n).hidden && !tvCardUiGet(n).minimized)) return null;
                    return (
                      <div key={'body-' + n} className={`col-span-full mt-2.5 rounded-2xl border px-3.5 py-3 shadow-md ${TV_CARD_TINTS[n].border} ${TV_CARD_TINTS[n].bg}`}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className={`inline-block h-2.5 w-2.5 rounded-full ${TV_CARD_TINTS[n].dot}`} />
                          <span className="text-xs font-black text-slate-800">{cfg.label || TV_BOARD_DEFAULT_LABELS[n]}</span>
                          <span className="text-[9px] font-bold text-slate-400">— এই বোর্ডের খোলা সেটিংস</span>
                          <span className="flex-1 border-b border-dashed border-slate-400/50" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[auto_auto] sm:justify-start gap-2.5 text-[11px]">
                                <div className="tv-quad col-span-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {/* প্যানেল দেখান — পিল টগল */}
                                  <div className={TV_FIELD_BOX}>
                                    {tvFieldLabel(LayoutGrid, 'প্যানেল দেখান')}
                                    <div className="flex flex-wrap gap-1.5">
                                      {['called', 'next', 'tenList', 'absent', 'inside'].map((k) => {
                                        const on = cfg.panels?.[k] !== false;
                                        return (
                                          <button key={k} type="button" onClick={() => updateTvBoardNested(n, 'panels', { [k]: !on })} className={tvChip(on, 'emerald')} aria-pressed={on}>
                                            {on ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}{PANEL_LABELS[k]}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {/* সংখ্যা — লেবেল-উপরে ইনপুট */}
                                  <div className={TV_FIELD_BOX}>
                                    {tvFieldLabel(Hash, 'সংখ্যা')}
                                    <div className="flex flex-wrap gap-2.5">
                                      {[{ k: 'called', l: 'চলমান', min: 1, max: 8, fb: 4 }, { k: 'tenList', l: 'তালিকা', min: 3, max: 20, fb: 10 }, { k: 'absent', l: 'অনুপস্থিত', min: 1, max: 20, fb: 8 }].map((f) => (
                                        <label key={f.k} className="flex flex-col items-center gap-0.5">
                                          <span className="text-[9px] font-black text-slate-500">{f.l}</span>
                                          <input type="number" min={f.min} max={f.max} value={cfg.counts?.[f.k] ?? f.fb} onChange={(e) => updateTvBoardNested(n, 'counts', { [f.k]: clampCount(e.target.value, f.min, f.max) })} className="w-14 px-1 py-1 text-center text-sm font-mono font-black rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  {/* ফন্ট সাইজ — সেগমেন্ট */}
                                  <div className={TV_FIELD_BOX}>
                                    {tvFieldLabel(Type, 'ফন্ট সাইজ')}
                                    <div className={TV_SEG_WRAP}>
                                      {[{ v: 'sm', l: 'ছোট' }, { v: 'md', l: 'মাঝারি' }, { v: 'lg', l: 'বড়' }].map((o) => (
                                        <button key={o.v} type="button" onClick={() => updateTvBoard(n, { fontScale: o.v })} className={tvSeg((cfg.fontScale ?? 'md') === o.v)}>{o.l}</button>
                                      ))}
                                    </div>
                                  </div>
                                  {/* রঙ — গোল সোয়াচ */}
                                  <div className={TV_FIELD_BOX}>
                                    {tvFieldLabel(Palette, 'রঙ', 'খালি = ডিফল্ট')}
                                    <div className="flex flex-wrap items-end gap-3">
                                      {[{ k: 'token', l: 'টোকেন', fb: '#4f46e5' }, { k: 'name', l: 'নাম', fb: '#0f172a' }, { k: 'bg', l: 'ব্যাকগ্রাউন্ড', fb: '#ecfdf5' }].map((f) => (
                                        <label key={f.k} className="flex flex-col items-center gap-0.5 cursor-pointer select-none">
                                          <input type="color" value={cfg.colors?.[f.k] || f.fb} onChange={(e) => updateTvBoardNested(n, 'colors', { [f.k]: e.target.value })} className="h-7 w-7 p-0 rounded-lg border-2 border-white shadow cursor-pointer bg-white ring-1 ring-slate-300 hover:ring-indigo-400 transition" />
                                          <span className="text-[9px] font-black text-slate-500">{f.l}</span>
                                        </label>
                                      ))}
                                      <button type="button" onClick={() => updateTvBoard(n, { colors: { bg: '', token: '', name: '' } })} className="mb-3.5 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border border-slate-300 bg-white/90 text-slate-500 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer select-none whitespace-nowrap"><Undo2 className="w-3 h-3" />মুছে ডিফল্ট</button>
                                    </div>
                                  </div>
                                </div>
                                {/* উপাদান-ভিত্তিক চেইন এডিটর (১ প্যানেল → ২ উপাদান → ৩ মান) */}
                                <div className={TV_FIELD_BOX + " min-[1100px]:w-[480px] min-[1100px]:shrink-0"}>
                                  {tvFieldLabel(MousePointerClick, 'উপাদান কাস্টমাইজ', '১ প্যানেল → ২ উপাদান → ৩ মান')}
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                    <span className={tvStepNum(!!tvChainSel[n]?.panel)}>১</span>
                                    {TV_PANEL_KEYS.map((p) => (
                                      <button key={p} type="button" onClick={() => tvChainSet(n, { panel: p })} className={tvChip(tvChainSel[n]?.panel === p, 'indigo')}>{TV_PANEL_LABELS[p]}</button>
                                    ))}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                    <span className={tvStepNum(!!tvChainSel[n]?.el)}>২</span>
                                    {TV_ELEMENT_KEYS.map((el) => (
                                      <button key={el} type="button" onClick={() => tvChainSet(n, { el })} className={tvChip(tvChainSel[n]?.el === el, 'teal')}>{TV_ELEMENT_LABELS[el]}</button>
                                    ))}
                                  </div>
                                  {(() => {
                                    const sel = tvChainSel[n] || { panel: 'called', el: 'token' };
                                    const st = (cfg.styles && cfg.styles[sel.panel] && cfg.styles[sel.panel][sel.el]) || {};
                                    return (
                                      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-inner">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-black text-indigo-700 whitespace-nowrap"><span className={tvStepNum(true)}>৩</span>{TV_PANEL_LABELS[sel.panel]} → {TV_ELEMENT_LABELS[sel.el]}</span>
                                          <label className="inline-flex items-center gap-1 min-w-0"><span className="text-[10px] font-bold text-slate-500">সাইজ</span>
                                            <button type="button" aria-label="ফন্ট ছোট করুন" title="ফন্ট ছোট (-২px)" onClick={() => { const cur = Number(st.size) || 16; setTvElStyle(n, sel.panel, sel.el, { size: clampCount(cur - 2, 8, 200) }); }} className="h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 active:scale-95 cursor-pointer transition"><Minus className="w-3.5 h-3.5" /></button>
                                            <input type="number" min={8} max={200} value={st.size ?? ''} placeholder="ডিফল্ট" onChange={(e) => { const v = e.target.value === '' ? undefined : clampCount(e.target.value, 8, 200); setTvElStyle(n, sel.panel, sel.el, { size: v }); }} className="w-12 min-w-0 px-1 py-1 text-sm font-mono font-bold text-center rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                            <button type="button" aria-label="ফন্ট বড় করুন" title="ফন্ট বড় (+২px)" onClick={() => { const cur = Number(st.size) || 16; setTvElStyle(n, sel.panel, sel.el, { size: clampCount(cur + 2, 8, 200) }); }} className="h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 active:scale-95 cursor-pointer transition"><Plus className="w-3.5 h-3.5" /></button>
                                          </label>
                                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none"><span className="text-[10px] font-bold text-slate-500">কালার</span><input type="color" value={st.color || '#000000'} onChange={(e) => setTvElStyle(n, sel.panel, sel.el, { color: e.target.value })} className="h-7 w-7 p-0 rounded-lg border-2 border-white shadow cursor-pointer bg-white ring-1 ring-slate-300" />{st.color ? <button type="button" onClick={() => setTvElStyle(n, sel.panel, sel.el, { color: '' })} className="text-[9px] font-bold text-rose-500 underline hover:text-rose-700 cursor-pointer">মুছুন</button> : null}</label>
                                          <span className="inline-flex items-center gap-1 min-w-0"><span className="text-[10px] font-bold text-slate-500">অবস্থান</span><span className={`${TV_SEG_WRAP} hidden sm:inline-flex`}>
                                            <button type="button" onClick={() => setTvElStyle(n, sel.panel, sel.el, { align: undefined })} className={tvSeg(!st.align)} title="ডিফল্ট">ডিফল্ট</button>
                                            <button type="button" onClick={() => setTvElStyle(n, sel.panel, sel.el, { align: 'left' })} className={tvSeg(st.align === 'left')} title="বাঁ"><AlignLeft className="w-3 h-3" /></button>
                                            <button type="button" onClick={() => setTvElStyle(n, sel.panel, sel.el, { align: 'center' })} className={tvSeg(st.align === 'center')} title="মাঝ"><AlignCenter className="w-3 h-3" /></button>
                                            <button type="button" onClick={() => setTvElStyle(n, sel.panel, sel.el, { align: 'right' })} className={tvSeg(st.align === 'right')} title="ডান"><AlignRight className="w-3 h-3" /></button>
                                          </span>
                                            <select value={st.align || ''} onChange={(e) => setTvElStyle(n, sel.panel, sel.el, { align: e.target.value === '' ? undefined : e.target.value })} className="sm:hidden max-w-28 px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-300 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300" aria-label="টেক্সট অবস্থান"><option value="">ডিফল্ট</option><option value="left">বাঁ</option><option value="center">মাঝখানে</option><option value="right">ডান</option></select>
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                                {/* প্যানেল-ডিজাইন চেইন (১ প্যানেল → ২ টার্গেট → ৩ ফিল/ইফেক্ট — একাধিক ইফেক্ট স্ট্যাক করা যায়) */}
                                <div className={TV_FIELD_BOX + " min-[1100px]:w-[480px] min-[1100px]:shrink-0"}>
                                  {tvFieldLabel(Layers, 'প্যানেল ডিজাইন', '২–৩ ইফেক্ট একসাথে — ১ম নিচে, শেষেরটা সবার উপরে')}
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                    <span className={tvStepNum(!!tvDesignSel[n]?.panel)}>১</span>
                                    {TV_PANEL_KEYS.map((p) => (
                                      <button key={p} type="button" onClick={() => tvDesignSet(n, { panel: p })} className={tvChip(tvDesignSel[n]?.panel === p, 'indigo')}>{TV_PANEL_LABELS[p]}</button>
                                    ))}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                    <span className={tvStepNum(!!tvDesignSel[n]?.target)}>২</span>
                                    {TV_DESIGN_TARGETS.map((t) => (
                                      <button key={t} type="button" onClick={() => tvDesignSet(n, { target: t })} className={tvChip(tvDesignSel[n]?.target === t, 'teal')}>{TV_DESIGN_TARGET_LABELS[t]}</button>
                                    ))}
                                  </div>
                                  {(() => {
                                    const sel = tvDesignSel[n] || { panel: 'called', target: 'panel' };
                                    const d = (cfg.design && cfg.design[sel.panel] && cfg.design[sel.panel][sel.target]) || {};
                                    const dList = Array.isArray(d.presets) ? d.presets : (d.preset ? [d.preset] : []);
                                    const colorable = dList.some(p => !['neuLight', 'neuDark', 'metal', 'glass'].includes(p));
                                    return (
                                      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-inner space-y-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-black text-indigo-700 whitespace-nowrap"><span className={tvStepNum(true)}>৩</span>{TV_PANEL_LABELS[sel.panel]} → {TV_DESIGN_TARGET_LABELS[sel.target]}{dList.length ? <span className="ml-1 font-mono">[{dList.map(() => '').map((_, i) => toBengaliDigits(i + 1)).join('·')}]</span> : null}</span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {TV_DESIGN_PRESETS.map((pr) => {
                                            const idx = pr.id ? dList.indexOf(pr.id) : -1;
                                            const isActive = pr.id ? idx >= 0 : dList.length === 0;
                                            return (
                                              <button key={pr.id || 'default'} type="button" onClick={() => toggleTvDesignPreset(n, sel.panel, sel.target, pr.id)} className={tvChip(isActive, 'slate')} title={idx >= 0 ? `লেয়ার ${toBengaliDigits(idx + 1)} — আবার চাপলে সরে যাবে` : 'এই ইফেক্ট যোগ করুন'}>
                                                {idx >= 0 ? <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-white text-slate-800 text-[9px] font-black shrink-0">{toBengaliDigits(idx + 1)}</span> : null}{pr.label}
                                              </button>
                                            );
                                          })}
                                        </div>
                                        {colorable && (
                                          <div className="flex flex-wrap items-end gap-3">
                                            {[{ k: 'base', l: 'বেস রঙ', fb: '#1f2937' }, { k: 'accent', l: 'অ্যাকসেন্ট', fb: '#38bdf8' }].map((f) => (
                                              <label key={f.k} className="flex flex-col items-center gap-0.5 cursor-pointer select-none">
                                                <input type="color" value={d[f.k] || f.fb} onChange={(e) => setTvPanelDesign(n, sel.panel, sel.target, { [f.k]: e.target.value })} className="h-7 w-7 p-0 rounded-lg border-2 border-white shadow cursor-pointer bg-white ring-1 ring-slate-300 hover:ring-indigo-400 transition" />
                                                <span className="text-[9px] font-black text-slate-500">{f.l}</span>
                                              </label>
                                            ))}
                                          </div>
                                        )}
                                        {dList.includes('pic') && (
                                          <div className="space-y-1.5">
                                            <input type="text" value={(d.pic || '').startsWith('data:') ? '(লোকাল ছবি নির্বাচিত)' : (d.pic || '')} placeholder="ছবির লিঙ্ক (খালি = ডিফল্ট টিভি ছবি)" onChange={(e) => setTvPanelDesign(n, sel.panel, sel.target, { pic: e.target.value })} className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                            <label
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) tvPicFromFile(f, (url) => setTvPanelDesign(n, sel.panel, sel.target, { pic: url })); }}
                              className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 px-3 py-2.5 text-center cursor-pointer hover:bg-indigo-100/70 transition select-none">
                                              <Upload className="w-4 h-4 text-indigo-600 shrink-0" />
                                              <span className="text-[10px] font-bold text-indigo-700">ছবি টেনে এখানে ছাড়ুন, অথবা চাপ দিয়ে ফোন/পিসি থেকে নিন</span>
                                              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) tvPicFromFile(f, (url) => setTvPanelDesign(n, sel.panel, sel.target, { pic: url })); e.target.value = ''; }} />
                                            </label>
                                            {(d.pic || '').startsWith('data:') && (
                                              <button type="button" onClick={() => setTvPanelDesign(n, sel.panel, sel.target, { pic: '' })} className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-300 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer select-none"><X className="w-3 h-3" />লোকাল ছবি সরান</button>
                                            )}
                                          </div>
                                        )}
                                        {dList.length > 0 && (
                                          <div><button type="button" onClick={() => toggleTvDesignPreset(n, sel.panel, sel.target, '')} className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer select-none whitespace-nowrap"><X className="w-3 h-3" />সব ইফেক্ট মুছুন (ডিফল্ট)</button></div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div className="col-span-full grid grid-cols-2 gap-2.5">
                                <div className={TV_FIELD_BOX}>
                                  {tvFieldLabel(Save, 'টেক্সট প্রিসেট', 'সেভ করলে বারবার লাগানো যাবে')}
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <input value={tvTextPresetName} onChange={(e) => setTvTextPresetName(e.target.value)} placeholder="নাম লিখুন" maxLength={24} className="min-w-0 flex-1 px-2 py-1 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" aria-label="টেক্সট প্রিসেটের নাম" />
                                    <button type="button" onClick={() => saveTvTextPreset(n)} className={tvChip(false, 'indigo')}><Save className="w-3 h-3" />সেভ</button>
                                  </div>
                                  {tvTextPresets.length === 0 ? (
                                    <p className="text-[10px] font-bold text-slate-400">এখনো কোনো টেক্সট প্রিসেট নেই — বাঁ বক্সে সাইজ/রঙ/অবস্থান ঠিক করে এখানে নাম দিয়ে সেভ করুন।</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {tvTextPresets.map((p) => (
                                        <span key={p.id} className="inline-flex items-stretch rounded-full border border-indigo-200 bg-indigo-50 overflow-hidden">
                                          <button type="button" onClick={() => applyTvTextPreset(n, p)} className="text-[10px] font-bold px-2.5 py-1 text-indigo-700 hover:bg-indigo-100 cursor-pointer transition whitespace-nowrap" title={`${TV_PANEL_LABELS[p.panel] || ''} থেকে নেওয়া — প্রয়োগ করুন`}>{p.name}</button>
                                          <button type="button" onClick={() => setTvTextPresets(list => list.filter(x => x.id !== p.id))} className="px-1.5 inline-flex items-center text-rose-500 hover:bg-rose-50 cursor-pointer transition" title="প্রিসেট মুছুন"><Trash2 className="w-3 h-3" /></button>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {/* ডিজাইন প্রিসেট — ইফেক্ট-লেয়ারের সেট একসাথে সেভ, যেকোনো প্যানেলে এক ক্লিকে প্রয়োগ */}
                                <div className={TV_FIELD_BOX}>
                                  {tvFieldLabel(Save, 'ডিজাইন প্রিসেট', 'ইফেক্টের সেট সেভ করে যেকোনো জায়গায় লাগান')}
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <input value={tvDesignPresetName} onChange={(e) => setTvDesignPresetName(e.target.value)} placeholder="নাম লিখুন" maxLength={24} className="min-w-0 flex-1 px-2 py-1 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" aria-label="ডিজাইন প্রিসেটের নাম" />
                                    <button type="button" onClick={() => saveTvDesignPreset(n)} className={tvChip(false, 'indigo')}><Save className="w-3 h-3" />সেভ</button>
                                  </div>
                                  {tvDesignPresets.length === 0 ? (
                                    <p className="text-[10px] font-bold text-slate-400">এখনো কোনো ডিজাইন প্রিসেট নেই — বাঁ বক্সে ইফেক্ট/রঙ সাজিয়ে এখানে নাম দিয়ে সেভ করুন।</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {tvDesignPresets.map((p) => (
                                        <span key={p.id} className="inline-flex items-stretch rounded-full border border-violet-200 bg-violet-50 overflow-hidden">
                                          <button type="button" onClick={() => applyTvDesignPreset(n, p)} className="text-[10px] font-bold px-2.5 py-1 text-violet-700 hover:bg-violet-100 cursor-pointer transition whitespace-nowrap" title={`লেয়ার: ${(p.layers || []).map(l => (TV_DESIGN_PRESETS.find(x => x.id === l) || {}).label || l).join(' → ')} — প্রয়োগ করুন`}>{p.name}</button>
                                          <button type="button" onClick={() => setTvDesignPresets(list => list.filter(x => x.id !== p.id))} className="px-1.5 inline-flex items-center text-rose-500 hover:bg-rose-50 cursor-pointer transition" title="প্রিসেট মুছুন"><Trash2 className="w-3 h-3" /></button>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>

                  {/* গ্লোবাল সেটিংস */}
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-3 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex items-center justify-between gap-2 lg:col-span-2">
                      <div className="inline-flex items-center gap-2 text-[11px] font-black text-slate-700"><span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-white shrink-0"><Settings className="w-3.5 h-3.5" /></span>সাধারণ সেটিংস (সব বোর্ডে প্রযোজ্য)</div>
                      <button
                        type="button"
                        onClick={resetTvGlobals}
                        className="text-[10px] font-bold text-rose-600 border border-rose-300 rounded-full px-2 py-0.5 hover:bg-rose-50 transition cursor-pointer shrink-0"
                        title="এই ব্লকের সব মান ডিফল্টে ফিরিয়ে নিন (বোর্ড কার্ডের সেটিংস ও মার্কির লেখা অক্ষত থাকবে)"
                      >ডিফল্টে ফিরুন</button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">'পরবর্তী ১০ জন' অটো-রোটেশন</div>
                        <div className="text-[10px] text-slate-500">তালিকা ঘুরবে কি স্থির থাকবে, ও কত সেকেন্ড পর পর</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min={3} max={120} value={tvTenRotationSeconds} onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) setTvTenRotationSeconds(Math.min(120, Math.max(3, v))); }} className="w-14 px-2 py-1 text-sm font-mono font-bold text-center rounded-lg border border-slate-200 bg-white" aria-label="রোটেশন সেকেন্ড" />
                        <button type="button" onClick={() => setTvTenRotationEnabled(o => !o)} className={`amh-gold-marked relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${tvTenRotationEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-label="অটো-রোটেশন চালু/বন্ধ"><span className={`amh-gold-marked-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${tvTenRotationEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">নতুন ডাকে বিপ/শব্দ</div>
                        <div className="text-[10px] text-slate-500">রোগী ডাকা হলে টিভিতে ছোট সংকেত বাজবে</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">{tvSampleBtn(() => playTvCallBeep(), 'বিপ/শব্দের নমুনা শুনুন')}<button type="button" onClick={() => setTvSoundEnabled(o => !o)} className={`amh-gold-marked relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${tvSoundEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-label="সাউন্ড চালু/বন্ধ"><span className={`amh-gold-marked-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${tvSoundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">দিন/রাত অনুযায়ী উজ্জ্বলতা</div>
                        <div className="text-[10px] text-slate-500">রাতের বেলা বোর্ড স্বয়ংক্রিয়ভাবে একটু ম্লান হবে</div>
                      </div>
                      <button type="button" onClick={() => setTvAutoBrightness(o => !o)} className={`amh-gold-marked relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${tvAutoBrightness ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-label="অটো-উজ্জ্বলতা চালু/বন্ধ"><span className={`amh-gold-marked-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${tvAutoBrightness ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
                    </div>

                    {/* নিচে চলমান ঘোষণা (মার্কি) */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">নিচে চলমান ঘোষণা (মার্কি)</div>
                        <div className="text-[10px] text-slate-500">বোর্ডের নিচে ডান দিক থেকে বাঁয়ে চলমান লেখা</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">{tvSampleBtn(() => speakTvSample(tvMarquee.text || 'দয়া করে নিজের টোকেন নম্বর শুনুন'), 'ঘোষণার নমুনা শুনুন')}<button type="button" onClick={() => setTvMarquee(o => ({ ...o, enabled: !o.enabled }))} className={`amh-gold-marked relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${tvMarquee.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-label="মার্কি চালু/বন্ধ"><span className={`amh-gold-marked-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${tvMarquee.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
                    </div>
                    {tvMarquee.enabled && (
                      <div className="rounded-lg border border-slate-200 bg-white/70 px-2.5 py-2 space-y-1.5">
                        <input type="text" value={tvMarquee.text} onChange={(e) => setTvMarquee(o => ({ ...o, text: e.target.value }))} placeholder="যেমন: দয়া করে নিজের টোকেন নম্বর শুনুন" className="w-full px-2 py-1 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" aria-label="মার্কির লেখা" />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500">গতি (সেকেন্ড — কম মানে দ্রুত)</span>
                          <input type="number" min={5} max={120} value={tvMarquee.speed} onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) setTvMarquee(o => ({ ...o, speed: Math.min(120, Math.max(5, v)) })); }} className="w-14 px-2 py-1 text-sm font-mono font-bold text-center rounded-lg border border-slate-200 bg-white" aria-label="মার্কির গতি" />
                        </div>
                      </div>
                    )}

                    {/* ডাকার রোগী হাইলাইট */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">ডাকার রোগী হাইলাইট</div>
                        <div className="text-[10px] text-slate-500">সর্বশেষ ডাকা রোগীর কার্ডে স্পন্দন (pulse)</div>
                      </div>
                      <button type="button" onClick={() => setTvHighlightOnCall(o => !o)} className={`amh-gold-marked relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${tvHighlightOnCall ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-label="হাইলাইট চালু/বন্ধ"><span className={`amh-gold-marked-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${tvHighlightOnCall ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
                    </div>

                    {/* খালি কিউ হলে স্বাগত স্ক্রিন */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">খালি কিউ হলে স্বাগত স্ক্রিন</div>
                        <div className="text-[10px] text-slate-500">কিউ ফাঁকা থাকলে ব্র্যান্ডের 'স্বাগতম' পাতা দেখাবে</div>
                      </div>
                      <button type="button" onClick={() => setTvWelcome(o => !o)} className={`amh-gold-marked relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${tvWelcome ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-label="_swabhikramon_scrin"><span className={`amh-gold-marked-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${tvWelcome ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
                    </div>

                    {/* কণ্ঠ ঘোষণা (TTS) */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">কণ্ঠ ঘোষণা (TTS)</div>
                        <div className="text-[10px] text-slate-500">ডাকলে "টোকেন …" পড়ে শোনানো হবে</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">{tvSampleBtn(() => speakTvSample('টোকেন 1-A — দয়া করে চেম্বারে আসুন'), 'কণ্ঠ ঘোষণার নমুনা শুনুন')}<button type="button" onClick={() => setTvVoice(o => ({ ...o, enabled: !o.enabled }))} className={`amh-gold-marked relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${tvVoice.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-label="konno_ghoshona"><span className={`amh-gold-marked-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${tvVoice.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
                    </div>
                    {tvVoice.enabled && (
                      <div className="rounded-lg border border-slate-200 bg-white/70 px-2.5 py-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        <label className="flex items-center gap-1.5"><span className="text-[10px] font-bold text-slate-500">গতি</span><input type="number" min={0.5} max={2} step={0.1} value={tvVoice.rate} onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) setTvVoice(o => ({ ...o, rate: Math.min(2, Math.max(0.5, v)) })); }} className="w-14 px-2 py-1 text-sm font-mono font-bold text-center rounded-lg border border-slate-200 bg-white" aria-label="kkonther_gotir" /></label>
                        <label className="flex items-center gap-1.5"><span className="text-[10px] font-bold text-slate-500">রিপিট</span><select value={tvVoice.repeat} onChange={(e) => setTvVoice(o => ({ ...o, repeat: Number(e.target.value) }))} className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" aria-label="kkonther_repeat"><option value={1}>১ বার</option><option value={2}>২ বার</option><option value={3}>৩ বার</option></select></label>
                        <div className="w-full text-[9px] font-bold text-slate-400 leading-snug">শব্দ না শুনলে ব্রাউজারে একবার বাংলা ভয়েস যোগ করুন — Edge: Settings → Voice access → Add voices → "বাংলা (Bangladesh)"; Chrome/Windows: Settings → Time & language → Speech → Add voices → বাংলা</div>
                      </div>
                    )}

                    {/* শব্দের ধরন / ভলিউম / রিপিট (বিপ চালু থাকলে) */}
                    {tvSoundEnabled && (
                      <div className="rounded-lg border border-slate-200 bg-white/70 px-2.5 py-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        <label className="flex items-center gap-1.5"><span className="text-[10px] font-bold text-slate-500">শব্দের ধরন</span><select value={tvBeep.type} onChange={(e) => setTvBeep(o => ({ ...o, type: e.target.value }))} className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" aria-label="shobder_dhoron"><option value="beep">বিপ</option><option value="chime">চাইম</option></select></label>
                        <label className="flex items-center gap-1.5"><span className="text-[10px] font-bold text-slate-500">ভলিউম</span><input type="range" min={0} max={1} step={0.05} value={tvBeep.volume} onChange={(e) => setTvBeep(o => ({ ...o, volume: Number(e.target.value) }))} className="w-24 accent-emerald-500" aria-label="shobder_volume" /></label>
                        <label className="flex items-center gap-1.5"><span className="text-[10px] font-bold text-slate-500">রিপিট</span><select value={tvBeep.repeat} onChange={(e) => setTvBeep(o => ({ ...o, repeat: Number(e.target.value) }))} className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" aria-label="shobder_repeat"><option value={1}>১ বার</option><option value={2}>২ বার</option><option value={3}>৩ বার</option></select></label>
                      </div>
                    )}

                    {/* হরাইজেন্টাল কলাম সংখ্যা (TV-3 ও TV-4) */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">হরাইজেন্টাল কলাম সংখ্যা</div>
                        <div className="text-[10px] text-slate-500">TV-3 ও TV-4 বোর্ডে 'পরবর্তী ১০ জন' কলাম</div>
                      </div>
                      <select value={tvHColumns} onChange={(e) => setTvHColumns(Number(e.target.value))} className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" aria-label="kolom_songkha"><option value={2}>২</option><option value={3}>৩</option><option value={4}>৪</option></select>
                    </div>
                  </div>
                </div>
                </SpotlightCard>
                  </div>
                </div>
              </div>
                );
              })()}
              </div>
      </main>

      {/* ===== Edit text inline — ইনলাইন এডিটর ===== */}
      {inlineEditor && (() => {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 844;
        const isMobileEditor = viewportWidth < 640;
        const editorWidth = Math.min(Math.max(inlineEditor.rect.width + 24, 288), viewportWidth - 16);
        const editorLeft = Math.max(8, Math.min(inlineEditor.rect.left - 4, viewportWidth - editorWidth - 8));
        const editorTop = isMobileEditor
          ? 12
          : (inlineEditor.rect.bottom + 14 + 250 < viewportHeight
              ? inlineEditor.rect.bottom + 14
              : Math.max(12, inlineEditor.rect.top - 250));
        const editorRows = Math.min(9, Math.max(2, inlineEditDraft.split('\n').length + Math.floor(inlineEditDraft.length / 44)));
        const hasInlineChanges = inlineEditDraft !== inlineEditor.text;

        return (
          <div data-select-ask-ignore="true" className="fixed inset-0 z-[80]">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
              onClick={cancelInlineEdit}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Edit text inline — লেখা সম্পাদনা"
              className="absolute"
              style={{
                top: editorTop,
                left: editorLeft,
                width: editorWidth,
                maxHeight: `calc(100dvh - ${Math.max(editorTop, 12)}px - 12px)`
              }}
            >
              <div className="rounded-2xl border-2 border-emerald-400 bg-slate-950 text-white shadow-[0_24px_70px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col" style={{ maxHeight: 'inherit' }}>
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-500 text-slate-950 shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Type className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px] font-black truncate">Edit text inline</span>
                    <span className="text-[9px] bg-slate-950/20 px-1.5 py-0.5 rounded hidden sm:inline truncate max-w-[140px]">
                      {inlineEditor.info.section}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={cancelInlineEdit}
                    className="w-7 h-7 rounded-lg bg-slate-950/15 hover:bg-slate-950/25 flex items-center justify-center cursor-pointer shrink-0"
                    aria-label="লেখা সম্পাদনা বাতিল করুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2.5 space-y-2 overflow-y-auto">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 min-w-0">
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold shrink-0">
                      {inlineEditor.info.role}
                    </span>
                    <span className="truncate" title={inlineEditor.text}>পুরনো: “{inlineEditor.text.replace(/\s+/g, ' ').slice(0, 90)}”</span>
                  </div>

                  <textarea
                    ref={inlineEditorRef}
                    value={inlineEditDraft}
                    onChange={(event) => setInlineEditDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        cancelInlineEdit();
                      } else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                        event.preventDefault();
                        applyInlineEdit();
                      }
                    }}
                    rows={editorRows}
                    autoFocus
                    spellCheck={false}
                    aria-label="নতুন লেখা লিখুন"
                    className="w-full resize-y min-h-[112px] max-h-[38vh] rounded-xl bg-white text-slate-900 border-2 border-emerald-400/60 p-3 font-semibold leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    style={{
                      fontFamily: inlineEditor.style.fontFamily,
                      fontSize: `${Math.min(20, Math.max(13, parseFloat(inlineEditor.style.fontSize) || 14))}px`,
                      letterSpacing: inlineEditor.style.letterSpacing,
                      textAlign: inlineEditor.style.textAlign === 'center' || inlineEditor.style.textAlign === 'right'
                        ? inlineEditor.style.textAlign
                        : 'left'
                    }}
                  />

                  <p className="text-[10px] text-slate-400 leading-snug">
                    সেভ করলে অ্যাপে সরাসরি বদলাবে না — AI-এর জন্য “পুরনো → নতুন” নির্দেশ তৈরি হবে এবং প্রম্পট প্যানেল খুলবে। Ctrl/⌘ + Enter দিয়েও সেভ করা যায়।
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold ${hasInlineChanges ? 'text-emerald-300' : 'text-slate-500'}`}>
                      {hasInlineChanges ? '● পরিবর্তন আছে' : 'কোনো পরিবর্তন নেই'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={cancelInlineEdit}
                        className="min-h-[38px] px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-bold cursor-pointer transition"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={applyInlineEdit}
                        disabled={!hasInlineChanges}
                        className="min-h-[38px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black cursor-pointer transition shadow-md flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Check className="w-3.5 h-3.5" />
                        নির্দেশ তৈরি করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== Draw Annotation — স্ক্রিনশট + ড্রয়িং ওয়ার্কস্পেস ===== */}
      {annotationOpen && (
        <div
          data-annotation-ignore="true"
          data-select-ask-ignore="true"
          role="dialog"
          aria-modal="true"
          aria-label="Draw Annotation — ছবিতে মার্ক করুন"
          className="fixed inset-0 z-[85] bg-slate-950 text-white flex flex-col"
        >
          <div className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5 bg-slate-900 border-b border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center shrink-0">
                <Pencil className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black leading-tight">Draw Annotation</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                  বক্স বা গোল দিয়ে জায়গা চিহ্নিত করুন • {activePanelName}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAnnotationWorkspace}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0 transition"
              aria-label="Draw Annotation বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {annotationStage === 'capturing' && (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
              <h4 className="text-base font-black">বর্তমান প্যানেলের স্ক্রিনশট নেওয়া হচ্ছে…</h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                আপনার বর্তমান স্ক্রল ও প্যানেল অনুযায়ী ছবি তৈরি হচ্ছে। কয়েক সেকেন্ড অপেক্ষা করুন।
              </p>
            </div>
          )}

          {annotationStage === 'error' && (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-rose-300 flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black">স্ক্রিনশট নেওয়া যায়নি</h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{annotationError}</p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={startAnnotationCapture}
                  className="min-h-[42px] px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  আবার চেষ্টা করুন
                </button>
                <button
                  type="button"
                  onClick={closeAnnotationWorkspace}
                  className="min-h-[42px] px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs cursor-pointer transition"
                >
                  বন্ধ করুন
                </button>
              </div>
              <p className="text-[10px] text-slate-500 max-w-xs">
                টিপ: পেজ পুরোপুরি লোড হওয়ার পর আবার চেষ্টা করুন। প্রয়োজনে স্ক্রিনশটের বদলে PNG ডাউনলোড অপশন ব্যবহার করুন।
              </p>
            </div>
          )}

          {annotationStage === 'ready' && annotationImage && (
            <>
              <div
                ref={annotationStageRef}
                className="relative flex-1 min-h-0 flex items-center justify-center p-2 sm:p-3 overflow-hidden"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(14,165,233,0.14), transparent 55%), linear-gradient(180deg, #0b1220 0%, #020617 100%)'
                }}
              >
                <img
                  ref={annotationImgRef}
                  src={annotationImage.dataUrl}
                  alt="অ্যানোটেশনের জন্য নেওয়া পেজের স্ক্রিনশট"
                  onLoad={updateAnnotationRenderRect}
                  onDragStart={(event) => event.preventDefault()}
                  draggable={false}
                  className="block max-w-full max-h-full w-auto h-auto select-none rounded-xl shadow-2xl ring-1 ring-white/20"
                />

                {annotationRenderRect && (
                  <svg
                    ref={annotationSvgRef}
                    className="absolute touch-none select-none z-10"
                    style={{
                      left: annotationRenderRect.left,
                      top: annotationRenderRect.top,
                      width: annotationRenderRect.width,
                      height: annotationRenderRect.height,
                      cursor: 'crosshair'
                    }}
                    viewBox={`0 0 ${annotationImage.width} ${annotationImage.height}`}
                    preserveAspectRatio="none"
                    onPointerDown={handleAnnotationPointerDown}
                    onPointerMove={handleAnnotationPointerMove}
                    onPointerUp={(event) => finishAnnotationStroke(event, true)}
                    onPointerCancel={(event) => finishAnnotationStroke(event, false)}
                  >
                    {annotationShapes.map(shape => (
                      <AnnotationShapeSvg key={shape.id} shape={shape} strokeWidth={annotationStrokeWidth} />
                    ))}
                    {annotationDraftShape && (
                      <g opacity="0.9">
                        <AnnotationShapeSvg shape={annotationDraftShape} strokeWidth={annotationStrokeWidth} />
                      </g>
                    )}
                  </svg>
                )}

                {annotationShapes.length === 0 && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-slate-950/85 border border-sky-400/40 text-sky-100 text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm whitespace-nowrap">
                    টুল বেছে নিয়ে ছবির উপরে টেনে বক্স/গোল আঁকুন
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-white/10 bg-slate-900 px-2.5 sm:px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                <div className="max-w-5xl mx-auto space-y-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-700 rounded-xl p-0.5 shrink-0">
                      {ANNOTATION_TOOLS.map(tool => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => setAnnotationTool(tool.id)}
                          aria-pressed={annotationTool === tool.id}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition cursor-pointer ${
                            annotationTool === tool.id
                              ? 'bg-sky-500 text-slate-950 shadow-md'
                              : 'text-slate-300 hover:bg-white/10'
                          }`}
                          title={`${tool.label} টুল`}
                          aria-label={`${tool.label} টুল`}
                        >
                          {tool.id === 'rect' && <Square className="w-4 h-4" />}
                          {tool.id === 'ellipse' && <Circle className="w-4 h-4" />}
                          {tool.id === 'arrow' && <ArrowUpRight className="w-4 h-4" />}
                          {tool.id === 'pen' && <Pencil className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>

                    <div className="w-px h-7 bg-slate-700 shrink-0" />

                    <div className="flex items-center gap-0.5 shrink-0">
                      {ANNOTATION_COLORS.map(color => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setAnnotationColor(color.value)}
                          aria-pressed={annotationColor === color.value}
                          aria-label={`${color.label} রঙ`}
                          title={`${color.label} রঙ`}
                          className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition ${
                            annotationColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:bg-white/10'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: color.value }} />
                        </button>
                      ))}
                    </div>

                    <div className="w-px h-7 bg-slate-700 shrink-0" />

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAnnotationShapes(prev => prev.slice(0, -1))}
                        disabled={annotationShapes.length === 0}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="শেষ চিহ্নটি মুছুন"
                        aria-label="শেষ চিহ্নটি মুছুন"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnnotationShapes([])}
                        disabled={annotationShapes.length === 0}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 text-rose-300 flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="সব চিহ্ন মুছুন"
                        aria-label="সব চিহ্ন মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="ml-auto shrink-0 text-[10px] font-bold text-slate-400 tabular-nums">
                      {toBengaliDigits(annotationShapes.length)}টি চিহ্ন
                    </span>
                  </div>

                  <input
                    type="text"
                    value={annotationNote}
                    onChange={(event) => setAnnotationNote(event.target.value)}
                    placeholder="ঐচ্ছিক: চিহ্নিত জায়গায় কী পরিবর্তন চান লিখুন…"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    aria-label="অ্যানোটেশনের নির্দেশ"
                  />

                  {annotationFeedback && (
                    <div className="text-[10px] font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{annotationFeedback}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={handleDownloadAnnotation}
                      disabled={Boolean(annotationBusy)}
                      className="min-h-[42px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md disabled:opacity-50"
                    >
                      {annotationBusy === 'download' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      PNG ডাউনলোড
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyAnnotationImage}
                      disabled={Boolean(annotationBusy)}
                      className="min-h-[42px] px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                    >
                      {annotationBusy === 'image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      ছবি কপি
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyAnnotationPrompt}
                      disabled={Boolean(annotationBusy)}
                      className="min-h-[42px] px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md disabled:opacity-50"
                    >
                      {annotationBusy === 'prompt' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                      নির্দেশ কপি
                    </button>
                    <button
                      type="button"
                      onClick={closeAnnotationWorkspace}
                      className="min-h-[42px] px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs cursor-pointer transition"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {}
      {(selectedElementInfo || selectedElementsList.length > 0) && (
        <div
          data-select-ask-ignore="true"
          onClick={() => {
            setSelectedElementInfo(null);
            setSelectedElementsList([]);
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn cursor-pointer"
        >
          <SpotlightCard dark className="w-[96vw] max-w-6xl xl:max-w-7xl h-[92vh] max-h-[94vh]">
          <div
            onClick={(e) => e.stopPropagation()}
            className="cursor-default bg-slate-900 text-white w-full h-full p-4 sm:p-6 shadow-2xl flex flex-col border-2 border-amber-400 rounded-3xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/40 shadow-inner">
                  <MousePointerClick className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                    {selectedElementsList.length > 1
                      ? `Select & Ask — বহু-উপাদান নির্দেশনা (${toBengaliDigits(selectedElementsList.length)}টি)`
                      : 'Select & Ask নিয়ন্ত্রণ ও প্রম্পট জেনারেটর'}
                    <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      সক্রিয়
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedElementsList.length > 1
                      ? 'নির্বাচিত উপাদানগুলোর জন্য সমন্বিত পরিবর্তনের নির্দেশ লিখুন বা ১০০টি প্রিসেট থেকে বেছে নিন'
                      : 'সহজে পড়তে ও দ্রুত সিলেক্ট করতে সর্বোচ্চ বড় আকারের প্যানেলে সাজানো প্রম্পট জেনারেটর'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedElementInfo(null);
                  setSelectedElementsList([]);
                }}
                className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 flex items-center justify-center text-sm font-bold opacity-80 hover:opacity-100 cursor-pointer transition border border-white/10"
                title="প্যানেল বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Split view */}
            <div className="flex-1 overflow-y-auto lg:overflow-hidden pt-3 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-0">
              {/* বাম পাশ: ১০০টি প্রিসেট ব্রাউজার */}
              <div className="lg:col-span-7 flex flex-col space-y-2.5 h-full min-h-0">
                <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
                  <label className="block text-xs font-black text-slate-200 flex items-center gap-1.5">
                    <span className="text-amber-400">⚡</span>
                    <span>দ্রুত প্রিসেট নির্দেশ ব্রাউজার (এক ক্লিকে যোগ করুন):</span>
                  </label>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30 shadow-xs">
                    মোট ১০০টি প্রিসেট
                  </span>
                </div>

                {/* ড্রপডাউন সিলেক্টর */}
                <div className="relative shrink-0">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const found = SELECT_ASK_PRESETS.find(p => p.label === val);
                      if (found) {
                        setAskPromptInput(prev => prev ? `${prev}। ${found.prompt}` : found.prompt);
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 text-slate-100 border border-slate-600 text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
                  >
                    <option value="" disabled>
                      -- ড্রপডাউন থেকে ১০০টি প্রিসেট নির্দেশ বেছে নিন (এক ক্লিকে যোগ) --
                    </option>
                    {PRESET_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <optgroup key={cat.id} label={cat.label} className="bg-slate-900 font-black text-amber-300">
                        {SELECT_ASK_PRESETS.filter(p => p.category === cat.id).map(p => (
                          <option key={p.id} value={p.label} className="bg-slate-800 text-white font-medium py-1">
                            #{toBengaliDigits(p.id)}. {p.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>

                {/* ফিল্টার কন্ট্রোল ও সার্চ বার */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-slate-300" />
                    <input
                      type="text"
                      value={presetSearchTerm}
                      onChange={(e) => setPresetSearchTerm(e.target.value)}
                      placeholder="🔍 প্রিসেট খুঁজুন (যেমন: মুছে, ফন্ট, সবুজ, মোবাইল, বাটন)..."
                      className="w-full pl-9 pr-8 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    {presetSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setPresetSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full shrink-0">
                    {PRESET_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPresetCategoryFilter(cat.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer border ${
                          presetCategoryFilter === cat.id
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* স্ক্রোলেবল গ্রিড ব্রাউজার */}
                <div className="flex-1 overflow-y-auto pr-1 rounded-2xl border border-slate-800 p-2 bg-slate-950/60 space-y-1.5 min-h-[200px]">
                  {filteredPresetsList.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400 space-y-1">
                      <p>কোনো প্রিসেট পাওয়া যায়নি</p>
                      <button
                        type="button"
                        onClick={() => { setPresetSearchTerm(''); setPresetCategoryFilter('all'); }}
                        className="text-amber-400 font-bold underline cursor-pointer"
                      >
                        সবগুলো প্রিসেট দেখুন
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredPresetsList.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setAskPromptInput(prev => prev ? `${prev}। ${p.prompt}` : p.prompt);
                          }}
                          className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex flex-col justify-between gap-1 group shadow-xs ${
                            p.priority === 'urgent'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-200'
                              : p.priority === 'high'
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-200'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] group-hover:text-amber-300 transition-colors flex items-center gap-1.5 truncate">
                              <span className="opacity-50 text-[10px] font-mono shrink-0">#{toBengaliDigits(p.id)}</span>
                              <span className="truncate">{p.label}</span>
                            </span>
                            <Plus className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 shrink-0 transition" />
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-normal">
                            {p.prompt}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ডান পাশ: নির্বাচিত উপাদান ও প্রম্পট কম্পোজার */}
              <div className="lg:col-span-5 flex flex-col space-y-3 h-full min-h-0 justify-between">
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {/* নির্বাচিত উপাদান তথ্য */}
                  {selectedElementsList.length > 1 ? (
                    <div className="bg-slate-800 p-3.5 rounded-2xl text-xs space-y-2 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1">
                          🎯 নির্বাচিত উপাদানসমূহ ({toBengaliDigits(selectedElementsList.length)}টি):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedElementInfo(null);
                            setSelectedElementsList([]);
                            setSelectAndAskMode(true);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          পুনরায় নির্বাচন করুন
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {selectedElementsList.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                                {toBengaliDigits(idx + 1)}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] shrink-0">
                                {item.role}
                              </span>
                              <span className="font-semibold text-slate-200 truncate">"{item.text}"</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-medium shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              {item.section}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-800 p-3.5 rounded-2xl text-xs space-y-2.5 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1">
                          🎯 নির্বাচিত উপাদান তথ্য:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedElementInfo(null);
                            setSelectedElementsList([]);
                            setSelectAndAskMode(true);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          অন্য উপাদান নির্বাচন
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                          {selectedElementInfo?.role || selectedElementsList[0]?.role}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                          {selectedElementInfo?.section || selectedElementsList[0]?.section}
                        </span>
                        <span className="px-2 py-1 rounded-xl bg-black/40 text-xs font-mono opacity-70">
                          &lt;{selectedElementInfo?.tag || selectedElementsList[0]?.tag}&gt;
                        </span>
                      </div>

                      <p className="font-bold text-slate-100 bg-slate-900 p-2.5 rounded-xl break-words border border-slate-700 text-xs sm:text-sm leading-relaxed">
                        "{selectedElementInfo?.text || selectedElementsList[0]?.text}"
                      </p>
                    </div>
                  )}

                  {/* কাস্টম প্রম্পট টেক্সটএরিয়া */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-slate-200">
                        {selectedElementsList.length > 1
                          ? 'নির্বাচিত উপাদানগুলোর পরিবর্তনের চূড়ান্ত নির্দেশ:'
                          : 'আপনার সুনির্দিষ্ট পরিবর্তনের চূড়ান্ত নির্দেশ:'}
                      </label>
                      {askPromptInput && (
                        <button
                          type="button"
                          onClick={() => setAskPromptInput('')}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer underline"
                        >
                          মুছে ফেলুন
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={5}
                      autoFocus
                      placeholder={
                        selectedElementsList.length > 1
                          ? 'বাম পাশের ১০০টি প্রিসেটে ক্লিক করুন অথবা নিজে লিখুন...'
                          : 'বাম পাশের ১০০টি প্রিসেট থেকে ক্লিক করুন অথবা নিজে লিখুন (যেমন: এই বাটনের ব্যাকগ্রাউন্ড হালকা সবুজ করুন)...'
                      }
                      value={askPromptInput}
                      onChange={(e) => setAskPromptInput(e.target.value)}
                      className="w-full p-3.5 text-xs sm:text-sm font-semibold bg-slate-800 border border-slate-700 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[140px] leading-relaxed"
                    />
                  </div>
                </div>

                {/* অ্যাকশন বাটনসমূহ */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-700 gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedElementInfo(null);
                      setSelectedElementsList([]);
                    }}
                    className="px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer transition"
                  >
                    বাতিল
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      let formatted = '';
                      if (selectedElementsList.length > 1) {
                        const itemsDesc = selectedElementsList
                          .map((item, idx) => `${idx + 1}. ${item.role} (<${item.tag}>): "${item.text}" — ${item.section}`)
                          .join('\n');
                        formatted = `🎯 [Select & Ask বহু-উপাদান নির্দেশ - AMH V4.0]\nনির্বাচিত উপাদানসমূহ (${selectedElementsList.length}টি):\n${itemsDesc}\n\n• পরিবর্তন নির্দেশ: ${askPromptInput || 'নির্বাচিত উপাদানগুলোর ডিজাইন ও কার্যকারিতা উন্নয়ন করুন'}`;
                      } else {
                        const targetItem = selectedElementInfo || selectedElementsList[0];
                        formatted = `🎯 [Select & Ask নির্দেশ - AMH V4.0]\n• উপাদান: ${targetItem.role} (<${targetItem.tag}>)\n• সেকশন: ${targetItem.section}\n• বর্তমান টেক্সট: "${targetItem.text}"\n• পরিবর্তন নির্দেশ: ${askPromptInput || 'ডিজাইন ও কার্যকারিতা উন্নয়ন করুন'}`;
                      }

                      const success = await safeCopyToClipboard(formatted);
                      if (success) {
                        setCopiedPrompt(true);
                        try {
                          const primaryText = selectedElementsList.length > 1
                            ? `${selectedElementsList.length}টি উপাদান (${selectedElementsList[0].text.slice(0, 15)}...)`
                            : (selectedElementInfo?.text || selectedElementsList[0]?.text);
                          const newHist = [
                            {
                              id: Date.now(),
                              target: primaryText,
                              instruction: askPromptInput || 'ডিজাইন ও কার্যকারিতা উন্নয়ন',
                              formatted,
                              time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                            },
                            ...promptHistory.filter(h => h.target !== primaryText)
                          ].slice(0, 8);
                          setPromptHistory(newHist);
                          localStorage.setItem('amh_select_ask_history', JSON.stringify(newHist));
                        } catch (err) {
                          console.warn('History save error:', err);
                        }

                        setTimeout(() => {
                          setCopiedPrompt(false);
                          setSelectedElementInfo(null);
                          setSelectedElementsList([]);
                          setAskPromptInput('');
                        }, 1500);
                      }
                    }}
                    className={`px-5 py-2.5 text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition ${
                      copiedPrompt
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                        : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                    }`}
                  >
                    {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPrompt ? 'কপি হয়েছে! চ্যাটে পেস্ট করুন' : 'ফরম্যাটেড নির্দেশ কপি করুন'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </SpotlightCard>
        </div>
      )}

      {/* Patient ID সম্পাদনা (Edit) মডাল */}
      {editingPatientIdRecord && (
        <div
          onClick={() => setEditingPatientIdRecord(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn cursor-pointer"
        >
          <SpotlightCard className="max-w-md w-full">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${themeStyles.card} cursor-default w-full p-5 sm:p-6 shadow-2xl space-y-4 border-2 border-amber-400 rounded-3xl max-h-[92vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-black">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Patient ID তথ্য সম্পাদনা</span>
                    <span className="font-mono text-amber-600 text-xs font-bold">({editingPatientIdRecord.patientCode})</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">আইডি কোড, রোগীর নাম, বয়স, ফোন ও অন্যান্য বিবরণ আপডেট করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPatientIdRecord(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedPatientId} className="space-y-3">
              {/* পেশেন্ট আইডি কোড */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">পেশেন্ট আইডি কোড (Patient ID Code) *</label>
                <input
                  type="text"
                  required
                  value={editPidCode}
                  onChange={(e) => setEditPidCode(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-mono font-bold focus:outline-none ${themeStyles.input}`}
                  placeholder="যেমন: AMH-00001"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">রোগীর নাম *</label>
                <input
                  type="text"
                  required
                  value={editPidName}
                  onChange={(e) => setEditPidName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                />
              </div>

              {/* বয়স */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <label className="block text-[11px] font-bold mb-1 text-slate-700">বয়স (বছর)</label>
                  <input
                    type="text"
                    value={editPidAgeYears}
                    onChange={(e) => {
                      setEditPidAgeYears(e.target.value.replace(/[^0-9০-৯]/g, ''));
                      setEditPidDob('');
                    }}
                    className={`w-full px-2 py-2 text-xs font-bold text-center focus:outline-none ${themeStyles.input}`}
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-[11px] font-bold mb-1 text-slate-700">বয়স (মাস)</label>
                  <input
                    type="text"
                    value={editPidAgeMonths}
                    onChange={(e) => {
                      setEditPidAgeMonths(e.target.value.replace(/[^0-9০-৯]/g, ''));
                      setEditPidDob('');
                    }}
                    className={`w-full px-2 py-2 text-xs font-bold text-center focus:outline-none ${themeStyles.input}`}
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-[11px] font-bold mb-1 text-slate-700">বয়স (দিন)</label>
                  <input
                    type="text"
                    value={editPidAgeDays}
                    onChange={(e) => {
                      setEditPidAgeDays(e.target.value.replace(/[^0-9০-৯]/g, ''));
                      setEditPidDob('');
                    }}
                    className={`w-full px-2 py-2 text-xs font-bold text-center focus:outline-none ${themeStyles.input}`}
                  />
                </div>
              </div>

              {/* জন্ম তারিখ */}
              <div>
                <label className="block text-[11px] font-bold mb-1 text-slate-600">
                  জন্ম তারিখ (অটো বয়স গণনা):
                </label>
                <input
                  type="date"
                  value={editPidDob}
                  onChange={handleEditPidDobChange}
                  className={`w-full px-2.5 py-1.5 text-xs font-bold focus:outline-none ${themeStyles.input}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={editPidPhone}
                  onChange={(e) => setEditPidPhone(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">রক্তের গ্রুপ</label>
                <select
                  value={editPidBloodGroup}
                  onChange={(e) => setEditPidBloodGroup(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs font-bold focus:outline-none ${themeStyles.input}`}
                >
                  <option value="" className="bg-white text-slate-900">নির্বাচন (ঐচ্ছিক)</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg} className="bg-white text-slate-900">{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">রোগীর সংক্ষিপ্ত নোট / উপসর্গ</label>
                <input
                  type="text"
                  value={editPidNotes}
                  onChange={(e) => setEditPidNotes(e.target.value)}
                  placeholder="যেমন: ডায়াবেটিস / ময়মনসিংহ"
                  className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPatientIdRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
          </SpotlightCard>
        </div>
      )}

      {/* ডিজিটাল Patient Health Card মডাল */}
      {selectedIdCardPatient && (
        <div
          onClick={() => setSelectedIdCardPatient(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <SpotlightCard className="max-w-md w-full">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${themeStyles.card} cursor-default w-full p-6 shadow-2xl space-y-4 border-2 border-indigo-500 rounded-3xl`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900">ডিজিটাল Patient ID কার্ড</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIdCardPatient(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer transition"
              >
                ✕
              </button>
            </div>

                    <SpotlightCard variant="sub" dark>
                    <div
                      className="@container relative w-full overflow-hidden rounded-[22px] border border-amber-300/50 shadow-xl"
                      style={{ aspectRatio: '1.7 / 1', background: 'linear-gradient(135deg,#C79A3B 0%,#EFD79B 28%,#BE8C2C 62%,#F2E2B0 100%)' }}
                    >
                      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 350" preserveAspectRatio="none" aria-hidden="true">
                        <defs>
                          <linearGradient id="amh-card-seam" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#F7E7B5" />
                            <stop offset="55%" stopColor="#D9B45F" />
                            <stop offset="100%" stopColor="#A97B26" />
                          </linearGradient>
                        </defs>
                        <path d="M238,0 C290,52 194,110 236,163 C282,220 208,272 254,350 L600,350 L600,0 Z" fill="#0B0C0E" />
                        <path d="M238,0 C290,52 194,110 236,163 C282,220 208,272 254,350" fill="none" stroke="url(#amh-card-seam)" strokeWidth="3" />
                      </svg>

                      <div className="relative z-10 flex h-full w-full">
                        {/* বাম: ক্লিনিক পরিচিতি + QR */}
                        <div className="flex w-[38%] shrink-0 flex-col items-center justify-between px-1.5 py-2 text-center">
                          <div className="space-y-0.5">
                            <img
                              src="/images/amh-logo-watermark.png"
                              alt="Clinic logo"
                              className="mx-auto h-[11cqw] w-[11cqw] object-contain"
                            />
                            <p className="whitespace-nowrap text-[3.5cqw] font-black leading-tight text-[#2A1D07]">{clinicNameState}</p>
                            <p className="whitespace-nowrap text-[4.1cqw] font-black leading-tight text-[#2A1D07]">{splitDoctorTitle(doctorTitleState).name}</p>
                            <p className="whitespace-nowrap text-[2.7cqw] font-bold leading-tight text-[#5A4118]">{splitDoctorTitle(doctorTitleState).qualification}</p>
                            <p className="whitespace-nowrap text-[2cqw] font-black tracking-[0.14em] text-[#7A5A1E]">PATIENT HEALTH CARD</p>
                          </div>
                          <div className="rounded-md bg-white p-1 shadow-md">
                            <img
                              id="digital-card-qr-img"
                              crossOrigin="anonymous"
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(
                                'https://amh3-4wrai3j1ldp.qoder.website/'
                              )}`}
                              alt="Patient QR"
                              className="h-[16cqw] w-[16cqw] rounded-sm"
                            />
                          </div>
                        </div>

                        {/* ডান: রোগীর তথ্য */}
                        <div className="flex min-w-0 flex-1 flex-col gap-3 pt-3 pb-3 pr-3 pl-[9%] text-white">
                          <div>
                            <p className="truncate text-[4.1cqw] font-black tracking-wide leading-tight">{selectedIdCardPatient.name}</p>
                            <p className="mt-0.5 truncate text-[3.1cqw] font-black tracking-[0.1em] text-amber-200/90">{selectedIdCardPatient.patientCode}</p>
                            <div className="mt-1.5 h-px w-full bg-amber-300/75" />
                          </div>

                          <div className="flex flex-1 flex-col justify-center space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-[5.6cqw] w-[5.6cqw] shrink-0 items-center justify-center rounded-full border border-amber-300/70 text-amber-200"><User className="h-[2.9cqw] w-[2.9cqw]" /></span>
                              <span className="truncate text-[3.3cqw]"><span className="text-amber-100/70">বয়স: </span><strong className="font-black">{getRealtimeAdjustedAge(selectedIdCardPatient).formattedFull}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-[5.6cqw] w-[5.6cqw] shrink-0 items-center justify-center rounded-full border border-amber-300/70 text-amber-200"><Phone className="h-[2.9cqw] w-[2.9cqw]" /></span>
                              <span className="truncate text-[3.3cqw]"><span className="text-amber-100/70">মোবাইল: </span><strong className="font-black">{selectedIdCardPatient.phoneNumber || 'অনির্ধারিত'}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-[5.6cqw] w-[5.6cqw] shrink-0 items-center justify-center rounded-full border border-amber-300/70 text-amber-200"><Activity className="h-[2.9cqw] w-[2.9cqw]" /></span>
                              <span className="truncate text-[3.3cqw]"><span className="text-amber-100/70">রক্তের গ্রুপ: </span><strong className="font-black">{selectedIdCardPatient.bloodGroup || 'অনির্ধারিত'}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-[5.6cqw] w-[5.6cqw] shrink-0 items-center justify-center rounded-full border border-amber-300/70 text-amber-200"><Calendar className="h-[2.9cqw] w-[2.9cqw]" /></span>
                              <span className="truncate text-[3.3cqw]"><span className="text-amber-100/70">{selectedIdCardPatient.dob ? 'জন্ম তারিখ: ' : 'রেজিস্ট্রেশন: '}</span><strong className="font-black">{formatDateToDDMMYYYY(selectedIdCardPatient.dob || selectedIdCardPatient.createdDate || selectedIdCardPatient.lastVisitDate || TODAY_KEY)}</strong></span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                    </SpotlightCard>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              {/* ১. ছবি (PNG) হিসেবে ডাউনলোড */}
              <button
                type="button"
                onClick={() => {
                  try {
                    const ageText = getRealtimeAdjustedAge(selectedIdCardPatient).formattedFull;
                    const canvas = generateCardCanvas(selectedIdCardPatient, clinicNameState, doctorTitleState, ageText);
                    if (!canvas) return;
                    const dataUrl = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = `Patient_Card_${selectedIdCardPatient.patientCode || 'ID'}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setPatientIdImportToast('✓ পেশেন্ট কার্ডের ছবি (PNG) সফলভাবে ডাউনলোড হয়েছে!');
                    setTimeout(() => setPatientIdImportToast(''), 3000);
                  } catch (err) {
                    console.error('Download error', err);
                  }
                }}
                className="px-3 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                title="কার্ডটি হাই-রেজোলিউশন ছবি (PNG) ফরম্যাটে ডাউনলোড করুন"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ছবি (PNG) ডাউনলোড</span>
              </button>

              {/* ২. PDF ডাউনলোড / প্রিন্ট */}
              <button
                type="button"
                onClick={() => {
                  try {
                    const ageText = getRealtimeAdjustedAge(selectedIdCardPatient).formattedFull;
                    const printWindow = window.open('', '_blank', 'width=850,height=600');
                    if (!printWindow) return;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      'https://amh3-4wrai3j1ldp.qoder.website/'
                    )}`;
                  const cardCss = `@page{size:auto;margin:10mm;}@font-face{font-family:'Hind Siliguri';src:url('${window.location.origin}/fonts/HindSiliguri-Regular.ttf') format('truetype');font-weight:400;font-display:swap;}@font-face{font-family:'PadmoDigits';src:url('${window.location.origin}/fonts/PadmoUNICODE.ttf') format('truetype');font-weight:100 900;font-display:swap;unicode-range:U+09E6-09EF,U+0030-0039;}*{box-sizing:border-box;}body{font-family:'PadmoDigits','Hind Siliguri','Noto Sans Bengali',system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:90vh;margin:0;background:#F3F4F6;}.card{position:relative;width:640px;height:376px;border-radius:24px;overflow:hidden;box-shadow:0 14px 34px rgba(0,0,0,.28);border:1px solid rgba(169,123,38,.55);background:linear-gradient(135deg,#C79A3B 0%,#EFD79B 28%,#BE8C2C 62%,#F2E2B0 100%);}.wave{position:absolute;inset:0;width:100%;height:100%;}.inner{position:relative;z-index:2;display:flex;height:100%;}.left{width:38%;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:14px 10px;text-align:center;}.logo{width:48px;height:48px;object-fit:contain;}.clinic{font-size:13px;font-weight:900;color:#2A1D07;line-height:1.2;margin-top:4px;white-space:nowrap;}.dname{font-size:15px;font-weight:900;color:#2A1D07;line-height:1.2;margin-top:2px;white-space:nowrap;}.doc{font-size:9px;font-weight:700;color:#5A4118;line-height:1.25;margin-top:2px;white-space:nowrap;}.tag{font-size:7px;font-weight:900;letter-spacing:.18em;color:#7A5A1E;margin-top:4px;}.qrbox{background:#fff;padding:4px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.18);}.qr{width:76px;height:76px;display:block;}.right{flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:14px 14px 14px 6px;color:#fff;}.pname{font-size:17px;font-weight:900;letter-spacing:.02em;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.pmeta{font-size:10.5px;font-weight:900;letter-spacing:.16em;color:rgba(253,230,138,.92);margin-top:3px;}.rule{height:1px;background:rgba(252,211,77,.75);margin-top:8px;}.rows{display:flex;flex-direction:column;gap:6px;}.row{display:flex;align-items:center;gap:7px;font-size:13px;}.dot{width:18px;height:18px;border-radius:999px;border:1px solid rgba(252,211,77,.7);display:inline-flex;align-items:center;justify-content:center;font-size:6px;color:#FDE68A;flex:none;}.lbl{color:rgba(254,243,199,.72);}.val{font-weight:900;color:#fff;}`;
                  printWindow.document.write(`<!DOCTYPE html><html><head><title>Patient_Card_${selectedIdCardPatient.patientCode}</title><meta charset="utf-8"/><style>${cardCss}</style></head><body><div class="card"><svg class="wave" viewBox="0 0 600 350" preserveAspectRatio="none"><defs><linearGradient id="seam" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7E7B5"/><stop offset="55%" stop-color="#D9B45F"/><stop offset="100%" stop-color="#A97B26"/></linearGradient></defs><path d="M238,0 C290,52 194,110 236,163 C282,220 208,272 254,350 L600,350 L600,0 Z" fill="#0B0C0E"/><path d="M238,0 C290,52 194,110 236,163 C282,220 208,272 254,350" fill="none" stroke="url(#seam)" stroke-width="3"/></svg><div class="inner"><div class="left"><div><img class="logo" src="${window.location.origin}/images/amh-logo-watermark.png" alt="logo"/><div class="clinic">${clinicNameState}</div><div class="dname">${String(doctorTitleState || '').split(/[,،]/)[0].trim()}</div><div class="doc">${String(doctorTitleState || '').split(/[,،]/).slice(1).join(', ').trim()}</div><div class="tag">PATIENT HEALTH CARD</div></div><div class="qrbox"><img class="qr" src="${qrUrl}" alt="QR"/></div></div><div class="right"><div><div class="pname">${selectedIdCardPatient.name}</div><div class="pmeta">${selectedIdCardPatient.patientCode} · PATIENT HEALTH CARD</div><div class="rule"></div></div><div class="rows"><div class="row"><span class="dot">●</span><span class="lbl">বয়স:</span><span class="val">${ageText}</span></div><div class="row"><span class="dot">●</span><span class="lbl">মোবাইল:</span><span class="val">${selectedIdCardPatient.phoneNumber || 'অনির্ধারিত'}</span></div><div class="row"><span class="dot">●</span><span class="lbl">রক্তের গ্রুপ:</span><span class="val">${selectedIdCardPatient.bloodGroup || 'অনির্ধারিত'}</span></div><div class="row"><span class="dot">●</span><span class="lbl">${selectedIdCardPatient.dob ? 'জন্ম তারিখ:' : 'রেজিস্ট্রেশন:'}</span><span class="val">${toBengaliDigits(selectedIdCardPatient.dob || selectedIdCardPatient.createdDate || selectedIdCardPatient.lastVisitDate || TODAY_KEY)}</span></div></div></div></div></div><script>window.onload=function(){setTimeout(function(){window.print();},350);};</script></body></html>`);
                    printWindow.document.close();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-3 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                title="কার্ডটি PDF হিসেবে সংরক্ষণ বা প্রিন্ট করুন"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF / প্রিন্ট</span>
              </button>

              {/* ৩. রোগীর WhatsApp-এ সরাসরি কার্ড প্রেরণ */}
              <button
                type="button"
                onClick={async () => {
                  const normalizedPhone = normalizeBangladeshPhone(selectedIdCardPatient.phoneNumber);
                  const targetPhone = normalizedPhone || ('880' + parseBengaliDigits(selectedIdCardPatient.phoneNumber || '').replace(/[^0-9]/g, '').replace(/^0+/, ''));
                  const ageText = getRealtimeAdjustedAge(selectedIdCardPatient).formattedFull;
                  const cardDateLbl = selectedIdCardPatient.dob ? 'জন্ম তারিখ' : 'নিবন্ধনের তারিখ';
                  const cardDateVal = formatDateToDDMMYYYY(selectedIdCardPatient.dob || selectedIdCardPatient.createdDate || selectedIdCardPatient.lastVisitDate || TODAY_KEY);
                  const cardMsg = `🪪 *ডিজিটাল পেশেন্ট আইডি কার্ড*\n🏥 *${clinicNameState}*\n${doctorTitleState}\n----------------------------------\n🆔 পেশেন্ট আইডি: ${selectedIdCardPatient.patientCode}\n👤 রোগীর নাম: ${selectedIdCardPatient.name}\n🎂 বয়স (রিয়েল-টাইম): ${ageText}\n📱 মোবাইল নম্বর: ${selectedIdCardPatient.phoneNumber || 'অনির্ধারিত'}\n🩸 রক্তের গ্রুপ: ${selectedIdCardPatient.bloodGroup || 'অনির্ধারিত'}\n📅 ${cardDateLbl}: ${cardDateVal}\n${selectedIdCardPatient.symptoms ? `📝 নোট: ${selectedIdCardPatient.symptoms}\n` : ''}----------------------------------\n🔗 নতুন সিরিয়াল দিতে ও অপেক্ষমান তালিকা দেখতে ভিজিট করুন: https://sites.google.com/view/amh3`;

                  // মোবাইল ডিভাইসে নেটিভ শেয়ার শিটের মাধ্যমে সরাসরি ইমেজ ফাইল WhatsApp-এ পাঠানোর চেষ্টা
                  if (typeof navigator !== 'undefined' && navigator.canShare) {
                    try {
                      const canvas = generateCardCanvas(selectedIdCardPatient, clinicNameState, doctorTitleState, ageText);
                      if (canvas) {
                        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                        if (blob) {
                          const file = new File([blob], `Patient_Card_${selectedIdCardPatient.patientCode}.png`, { type: 'image/png' });
                          if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                              title: `পেশেন্ট কার্ড - ${selectedIdCardPatient.name}`,
                              text: cardMsg,
                              files: [file]
                            });
                            return;
                          }
                        }
                      }
                    } catch (err) {}
                  }

                  // সরাসরি wa.me লিংক
                  if (targetPhone) {
                    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(cardMsg)}`, '_blank');
                  }
                }}
                className="px-3.5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                title="রোগীর নম্বরে WhatsApp-এ ডিজিটাল আইডি কার্ড পাঠান"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp কার্ড পাঠান</span>
              </button>

              {/* ৪. সিরিয়াল দিন (তারিখ বাছাই) */}
              <button
                type="button"
                onClick={() => {
                  setDateSelectPatient(selectedIdCardPatient);
                  setCustomSerialDate(TODAY_KEY);
                  setSelectedIdCardPatient(null);
                }}
                className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                title="তারিখ বাছাই করে এই রোগীর জন্য সিরিয়াল নিবন্ধন করুন"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>সিরিয়াল দিন</span>
              </button>

              {/* ৫. বন্ধ করুন */}
              <button
                type="button"
                onClick={() => setSelectedIdCardPatient(null)}
                className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
          </SpotlightCard>
        </div>
      )}

      {/* রোগীর সিরিয়াল ও রেজিস্ট্রেশন তথ্য সংশোধন মডাল */}
      {editingQueuePatient && (
        <div
          onClick={() => setEditingQueuePatient(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn cursor-pointer"
        >
          <SpotlightCard className="max-w-lg w-full">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${themeStyles.card} cursor-default w-full p-5 sm:p-6 shadow-2xl space-y-4 border-2 border-amber-500 rounded-3xl max-h-[92vh] overflow-y-auto`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Edit2 className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>সিরিয়াল তথ্য সংশোধন (এডিট)</span>
                    <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                      #{toBengaliDigits(editingQueuePatient.serialNumber)}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    নিবন্ধনের সময় হওয়া যেকোনো ভুলত্রুটি এখান থেকে সহজেই সংশোধন করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingQueuePatient(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditedQueuePatient} className="space-y-3.5">
              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">রোগীর নাম *</label>
                <input
                  type="text"
                  required
                  value={editQueueName}
                  onChange={(e) => setEditQueueName(e.target.value)}
                  placeholder="রোগীর নাম লিখুন"
                  className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                />
              </div>

              {/* Age (Years, Months, Days) */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">বয়স (বছর, মাস, দিন)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="বছর"
                      value={editQueueAgeYears}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditQueueAgeYears(val);
                        const y = Number(parseBengaliDigits(val)) || 0;
                        const m = Number(parseBengaliDigits(editQueueAgeMonths)) || 0;
                        const d = Number(parseBengaliDigits(editQueueAgeDays)) || 0;
                        setEditQueueIsChild((y + m / 12 + d / 365) < Number(registrationRuleConfig?.ageLimitYears ?? 4));
                      }}
                      className={`w-full px-2.5 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                    />
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">বছর</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="মাস"
                      value={editQueueAgeMonths}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditQueueAgeMonths(val);
                        const y = Number(parseBengaliDigits(editQueueAgeYears)) || 0;
                        const m = Number(parseBengaliDigits(val)) || 0;
                        const d = Number(parseBengaliDigits(editQueueAgeDays)) || 0;
                        setEditQueueIsChild((y + m / 12 + d / 365) < Number(registrationRuleConfig?.ageLimitYears ?? 4));
                      }}
                      className={`w-full px-2.5 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                    />
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">মাস</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="দিন"
                      value={editQueueAgeDays}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditQueueAgeDays(val);
                        const y = Number(parseBengaliDigits(editQueueAgeYears)) || 0;
                        const m = Number(parseBengaliDigits(editQueueAgeMonths)) || 0;
                        const d = Number(parseBengaliDigits(val)) || 0;
                        setEditQueueIsChild((y + m / 12 + d / 365) < Number(registrationRuleConfig?.ageLimitYears ?? 4));
                      }}
                      className={`w-full px-2.5 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                    />
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">দিন</span>
                  </div>
                </div>
              </div>

              {/* Mobile Number & Token Serial Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    value={editQueuePhone}
                    onChange={(e) => setEditQueuePhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>টোকেন নম্বর (#)</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-md">
                      অ্যাডমিন সুরক্ষিত
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editQueueSerial}
                    onChange={(e) => {
                      setEditQueueSerial(e.target.value);
                      setEditQueueAdminError('');
                    }}
                    placeholder="যেমন: ১, ২, ৩..."
                    className={`w-full px-3 py-2 text-xs font-bold font-mono focus:outline-none ${themeStyles.input}`}
                  />
                </div>
              </div>

              {/* টোকেন নম্বর পরিবর্তনের জন্য অ্যাডমিন সুরক্ষিত ভেরিফিকেশন */}
              {Number(parseBengaliDigits(editQueueSerial)) !== editingQueuePatient.serialNumber && (
                currentUser?.isAdmin ? (
                  <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>অ্যাডমিন সুরক্ষিত: আপনি অ্যাডমিন হিসেবে সরাসরি টোকেন নম্বর পরিবর্তন করতে পারবেন।</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                      <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>অ্যাডমিন সুরক্ষিত: টোকেন নম্বর পরিবর্তনের জন্য অ্যাডমিন অনুমোদন দিন</span>
                    </div>
                    <div>
                      <input
                        type="password"
                        autoFocus
                        value={editQueueAdminPin}
                        onChange={(e) => {
                          setEditQueueAdminPin(e.target.value);
                          setEditQueueAdminError('');
                        }}
                        placeholder="অ্যাডমিন পিন / পাসওয়ার্ড লিখুন"
                        className={`w-full px-3 py-2 text-xs font-bold focus:outline-none bg-white rounded-xl border ${
                          editQueueAdminError ? 'border-rose-500 ring-2 ring-rose-400' : 'border-amber-300'
                        }`}
                      />
                    </div>
                    {editQueueAdminError && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{editQueueAdminError}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-amber-800 font-medium leading-tight">
                      🛡️ এই পরিবর্তনটি অ্যাডমিন সুরক্ষিত—অনুমোদিত অ্যাডমিন ছাড়া সাধারণ স্টাফরা টোকেন নম্বর পরিবর্তন করতে পারবেন না।
                    </p>
                  </div>
                )
              )}

              {/* Appointment Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">সিরিয়ালের তারিখ: <strong className="font-mono text-emerald-700">{formatDateToDDMMYYYY(editQueueDate)}</strong></label>
                  <input
                    type="date"
                    value={editQueueDate}
                    onChange={(e) => setEditQueueDate(e.target.value)}
                    className={`w-full px-3 py-2 text-xs font-bold focus:outline-none ${themeStyles.input}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">সিরিয়াল স্ট্যাটাস</label>
                  <select
                    value={editQueueStatus}
                    onChange={(e) => setEditQueueStatus(e.target.value)}
                    className={`w-full px-3 py-2 text-xs font-bold focus:outline-none ${themeStyles.input}`}
                  >
                    <option value="WAITING">অপেক্ষমান (WAITING)</option>
                    <option value="CALLED">বর্তমানে ডাকা হচ্ছে (CALLED)</option>
                    <option value="COMPLETED">সেবা সম্পন্ন (COMPLETED)</option>
                    <option value="ABSENT">অনুপস্থিত (ABSENT)</option>
                    <option value="CANCELLED">স্থগিত / বাতিল (CANCELLED)</option>
                  </select>
                </div>
              </div>

              {/* Quota Checkbox */}
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="editQueueChildCheck"
                  checked={editQueueIsChild}
                  onChange={(e) => setEditQueueIsChild(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="editQueueChildCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  শিশু কোটা (বয়স {toBengaliDigits(registrationRuleConfig?.ageLimitYears ?? 4)} বছরের কম / {registrationRuleConfig?.underAgeParity === 'ODD' ? 'বিজোড় সংখ্যা' : registrationRuleConfig?.underAgeParity === 'SEQUENTIAL' ? 'ক্রমিক সংখ্যা' : 'জোড় সংখ্যা'})
                </label>
              </div>

              {/* Symptoms / Notes */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">উপসর্গ / রোগের বিবরণ / নোট</label>
                <textarea
                  rows={2}
                  value={editQueueSymptoms}
                  onChange={(e) => setEditQueueSymptoms(e.target.value)}
                  placeholder="যেমন: জ্বর, সর্দি, কাশি, পেটে ব্যথা..."
                  className={`w-full px-3 py-2 text-xs font-semibold focus:outline-none ${themeStyles.input}`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingQueuePatient(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সংশোধন সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
          </SpotlightCard>
        </div>
      )}

      {/* তারিখ নির্বাচন ও সিরিয়াল নিবন্ধন মডাল */}
      {dateSelectPatient && (
        <div
          onClick={() => setDateSelectPatient(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn cursor-pointer"
        >
          <SpotlightCard className="max-w-md w-full">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${themeStyles.card} cursor-default w-full p-5 sm:p-6 shadow-2xl space-y-4 border-2 border-emerald-500 rounded-3xl max-h-[92vh] overflow-y-auto`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>সিরিয়াল নিবন্ধনের তারিখ নির্বাচন</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 font-bold">
                    রোগী: <span className="text-emerald-700">{dateSelectPatient.name}</span> ({dateSelectPatient.patientCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDateSelectPatient(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Quick 7-Day Buttons */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                দ্রুত নির্বাচন করুন (আগামী ৭ দিন):
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                {upcomingSevenDays.map((d) => {
                  const isClosed = closedDates.includes(d.isoDate);
                  const count = (patientsByDate[d.isoDate] || []).length;
                  const isToday = d.isoDate === TODAY_KEY;
                  return (
                    <button
                      type="button"
                      key={d.isoDate}
                      title={`${d.relativeLabel} (${formatDateToDDMMYYYY(d.isoDate)}) — ${isClosed ? 'বন্ধ' : `খোলা, সিরিয়াল: ${toBengaliDigits(count)}`}`}
                      onClick={() => {
                        handleAddSerialWithDate(dateSelectPatient, d.isoDate);
                        setDateSelectPatient(null);
                      }}
                      className={`py-1.5 px-1 rounded-lg border text-center transition cursor-pointer select-none flex flex-col items-center justify-center gap-0.5 shadow-2xs hover:shadow-xs ${
                        isToday
                          ? 'border-emerald-500 bg-emerald-50/90 hover:bg-emerald-100 ring-1 ring-emerald-400'
                          : isClosed
                          ? 'border-rose-200 bg-rose-50/60 hover:bg-rose-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-black text-slate-900 leading-tight whitespace-nowrap">
                        {d.relativeLabel}
                      </span>
                      <span className={`text-[9px] font-bold leading-none whitespace-nowrap ${isClosed ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {isClosed ? 'বন্ধ' : `খোলা (${toBengaliDigits(count)})`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Date Input */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                অথবা অন্য যেকোনো তারিখ নির্বাচন করুন:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customSerialDate}
                  onChange={(e) => setCustomSerialDate(e.target.value)}
                  min={TODAY_KEY}
                  className={`flex-1 px-3 py-2 text-xs font-bold focus:outline-none ${themeStyles.input}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!customSerialDate) return;
                    handleAddSerialWithDate(dateSelectPatient, customSerialDate);
                    setDateSelectPatient(null);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>নিশ্চিত করুন</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">
                তারিখ সিলেক্ট করলেই সেই দিনের সিরিয়াল তালিকা তৈরি হবে
              </span>
              <button
                type="button"
                onClick={() => setDateSelectPatient(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
          </SpotlightCard>
        </div>
      )}

      {adminAuthModal.isOpen && (
        <div
          onClick={() => setAdminAuthModal((prev) => ({ ...prev, isOpen: false, passwordInput: '', error: '' }))}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <SpotlightCard className="max-w-xs w-full">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${themeStyles.card} cursor-default w-full p-5 shadow-2xl space-y-4`}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-rose-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">{adminAuthModal.title}</h3>
              <p className="text-xs opacity-75 mt-1 text-slate-600">{adminAuthModal.description}</p>
            </div>

            <form onSubmit={handleConfirmAdminAuth} className="space-y-3">
              <div>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="অ্যাডমিন পাসওয়ার্ড দিন"
                  value={adminAuthModal.passwordInput}
                  onChange={(e) => setAdminAuthModal(prev => ({ ...prev, passwordInput: e.target.value, error: '' }))}
                  className={`w-full text-center text-sm font-bold py-2 focus:outline-none ${themeStyles.input}`}
                />
                {adminAuthModal.error && (
                  <p className="text-xs font-bold text-rose-600 text-center mt-1.5 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{adminAuthModal.error}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAdminAuthModal(prev => ({ ...prev, isOpen: false }))}
                  className="w-1/2 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button type="submit" className={`w-1/2 py-2 text-xs font-bold cursor-pointer ${themeStyles.buttonPrimary}`}>
                  নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
          </SpotlightCard>
        </div>
      )}

      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <SpotlightCard className="max-w-sm w-full">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${themeStyles.card} cursor-default w-full p-6 text-center space-y-4`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-900">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>মোবাইল স্ক্যান ও সিঙ্ক</span>
              </h3>
              <button onClick={() => setShowQrModal(false)} className="text-sm opacity-70 hover:opacity-100 cursor-pointer">
                ✕
              </button>
            </div>

            <SpotlightCard variant="sub" className="mx-auto w-fit">
              <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `${typeof window !== 'undefined' ? window.location.origin : ''}${typeof window !== 'undefined' ? window.location.pathname : ''}?room=${syncChannelId}&user=laden`
                  )}`}
                  alt="QR Code"
                  className="w-44 h-44 rounded-lg"
                />
              </div>
            </SpotlightCard>

            <SpotlightCard variant="sub">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                <span>📱 মোবাইলে স্ক্যান করলে সরাসরি <strong>"লাদেন"</strong> হিসেবে কানেক্ট হবে</span>
              </div>
            </SpotlightCard>

            <button
              onClick={handleCopyShareLink}
              className={`w-full py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer rounded-xl shadow-md transition ${themeStyles.buttonPrimary}`}
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
            </button>
          </div>
          </SpotlightCard>
        </div>
      )}

      {/* ফিক্সড বটম নেভিগেশন বার - টিভি মোডে সম্পূর্ণ অদৃশ্য থাকবে */}
      {!currentUser?.isTvMode && currentUser?.role !== 'tv' && activeTab !== 'tv' && (
      <nav
        aria-label="Fixed Bottom Navigation"
        className={`amh-bottomnav isolate ${
          themeStyles.bottomNav
        } text-white transition-all duration-300`}
        style={{
          // সম্পূর্ণ ট্রান্সপারেন্ট — শুধু লেখা ও আইকন দৃশ্যমান (অবস্থান .amh-bottomnav CSS-এ, ডেস্কটপে ডান রেল)
          background: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none',
          border: 'none',
          // লাইট থিমে গাঢ় লেবেল; ডার্ক থিমে সাদা লেবেলের জন্য শ্যাডো
          textShadow: isDarkBottomNav
            ? '0 1px 2px rgba(0, 0, 0, 0.85), 0 0 4px rgba(0, 0, 0, 0.5)'
            : '0 1px 2px rgba(255, 255, 255, 0.95), 0 0 6px rgba(255, 255, 255, 0.85)',
          // হালকা ৫% ফ্রস্টেড ব্লার — ব্যাকগ্রাউন্ড এখনো সম্পূর্ণ ট্রান্সপারেন্ট
          WebkitBackdropFilter: 'blur(2px) saturate(105%)',
          backdropFilter: 'blur(2px) saturate(105%)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          willChange: 'transform, backdrop-filter'
        }}
      >
        <div className={`amh-bottomnav-inner relative z-10 mx-auto px-1 sm:px-4 ${currentUser?.isAdmin ? 'max-w-3xl' : 'max-w-2xl'}`}>
          {/* কলাম সংখ্যা রোল-অনুযায়ী: গেস্ট ২ (নতুন+কিউ), স্টাফ ৫ (লগআউট হেডারেই), এডমিন ৭ (টিভি সেটআপসহ — সবার ডানে) */}
          <div className={`amh-bottomnav-grid grid ${currentUser?.isGuest ? 'grid-cols-2 max-w-sm mx-auto' : currentUser?.isAdmin ? 'grid-cols-7' : 'grid-cols-5'} items-center gap-1 sm:gap-2.5 pt-0 pb-0`}>
            {/* ১. নতুন সিরিয়াল */}
            <button
              type="button"
              onClick={(e) => {
                if (selectAndAskMode) {
                  handlePageInspectClick(e);
                  return;
                }
                setActiveTab('register');
              }}
              title={pendingApplicationCount > 0 ? `আবেদন অপেক্ষমাণ: ${toBengaliDigits(pendingApplicationCount)} টি` : "নতুন সিরিয়াল"}
              aria-label={pendingApplicationCount > 0 ? `আবেদন অপেক্ষমাণ: ${toBengaliDigits(pendingApplicationCount)} টি` : "নতুন সিরিয়াল"}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-[15px] px-1 sm:px-2 bg-transparent transition-transform duration-200 cursor-pointer select-none opacity-100 ${
                activeTab === 'register' ? 'amh-nav-icon-neon amh-nav-neon-violet' : 'hover:scale-105'
              }`}
            >
              <span className="amh-nav-glass g-violet" aria-hidden="true" />
              <span className="relative inline-flex items-center justify-center">
                {activeTab === 'register' ? (
                  <img
                    src="/icons/add-user-animated.gif"
                    alt=""
                    aria-hidden="true"
                    className="w-[39px] h-[39px] shrink-0 object-contain pointer-events-none select-none"
                  />
                ) : (
                  <img
                    src="/icons/add-user-static.png"
                    alt=""
                    aria-hidden="true"
                    className="w-[39px] h-[39px] shrink-0 object-contain pointer-events-none select-none"
                  />
                )}
                {!currentUser?.isGuest && pendingApplicationCount > 0 && (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute -top-[17px] sm:-top-[20px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[14px] sm:text-[15px] font-black leading-none tracking-tight ${bottomNavCountClass}`}
                  >
                    {toBengaliDigits(pendingApplicationCount)}
                  </span>
                )}
              </span>
              <span className={`text-[15px] font-bold leading-none ${activeTab === 'register' ? bottomNavLabelActiveClass : bottomNavLabelInactiveClass}`}>নতুন</span>
            </button>

            {/* ২. লাইভ কিউ */}
            <button
              type="button"
              onClick={(e) => {
                if (selectAndAskMode) {
                  handlePageInspectClick(e);
                  return;
                }
                setActiveTab('queue');
              }}
              title={`লাইভ কিউ — অপেক্ষমাণ ${toBengaliDigits(selectedDateWaitingCount)} জন`}
              aria-label={`লাইভ কিউ — অপেক্ষমাণ ${toBengaliDigits(selectedDateWaitingCount)} জন`}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-[15px] px-1 sm:px-2 bg-transparent transition-transform duration-200 cursor-pointer select-none opacity-100 ${
                activeTab === 'queue' ? 'amh-nav-icon-neon amh-nav-neon-blue' : 'hover:scale-105'
              }`}
            >
              <span className="amh-nav-glass g-blue" aria-hidden="true" />
              <span className="relative inline-flex items-center justify-center">
                {activeTab === 'queue' ? (
                  <img
                    src="/icons/queue-animated.gif"
                    alt=""
                    aria-hidden="true"
                    className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none"
                  />
                ) : (
                  <img
                    src="/icons/queue-static.png"
                    alt=""
                    aria-hidden="true"
                    className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-[8px] sm:-top-[11px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[14px] sm:text-[15px] font-black leading-none tracking-tight ${bottomNavCountClass}`}
                >
                  {toBengaliDigits(selectedDateWaitingCount)}
                </span>
              </span>
              <span className={`text-[15px] font-bold leading-none ${activeTab === 'queue' ? bottomNavLabelActiveClass : bottomNavLabelInactiveClass}`}>কিউ</span>
            </button>

            {/* ৩. Patient ID (গেস্টদের জন্য লুকায়িত) */}
            {!currentUser?.isGuest && (
            <button
              type="button"
              onClick={(e) => {
                if (selectAndAskMode) {
                  handlePageInspectClick(e);
                  return;
                }
                setActiveTab('patientId');
              }}
              title={`Patient ID — মোট ${toBengaliDigits(patientIdTotalCount)} জন`}
              aria-label={`Patient ID — মোট ${toBengaliDigits(patientIdTotalCount)} জন`}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-[15px] px-1 sm:px-2 bg-transparent transition-transform duration-200 cursor-pointer select-none opacity-100 ${
                activeTab === 'patientId' ? 'amh-nav-icon-neon amh-nav-neon-teal' : 'hover:scale-105'
              }`}
            >
              <span className="amh-nav-glass g-teal" aria-hidden="true" />
              <span className="relative inline-flex items-center justify-center">
                {activeTab === 'patientId' ? (
                  <img
                    src="/icons/idcard-animated.gif"
                    alt=""
                    aria-hidden="true"
                    className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none"
                  />
                ) : (
                  <img
                    src="/icons/idcard-static.png"
                    alt=""
                    aria-hidden="true"
                    className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-[8px] sm:-top-[11px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[14px] sm:text-[15px] font-black leading-none tracking-tight ${bottomNavCountClass}`}
                >
                  {toBengaliDigits(patientIdTotalCount)}
                </span>
              </span>
              <span className={`text-[15px] font-bold leading-none ${activeTab === 'patientId' ? bottomNavLabelActiveClass : bottomNavLabelInactiveClass}`}>আইডি</span>
            </button>
            )}

            {/* ৪. দৈনিক রিপোর্ট ও ক্লাউড সিঙ্ক (গেস্টদের জন্য লুকায়িত) */}
            {!currentUser?.isGuest && (
            <button
              type="button"
              onClick={(e) => {
                if (selectAndAskMode) {
                  handlePageInspectClick(e);
                  return;
                }
                setActiveTab('reports');
              }}
              title="দৈনিক রিপোর্ট ও ক্লাউড সিঙ্ক"
              aria-label="দৈনিক রিপোর্ট ও ক্লাউড সিঙ্ক"
              className={`relative flex flex-col items-center justify-center gap-0.5 py-[15px] px-1 sm:px-2 bg-transparent transition-transform duration-200 cursor-pointer select-none opacity-100 ${
                activeTab === 'reports' ? 'amh-nav-icon-neon amh-nav-neon-amber' : 'hover:scale-105'
              }`}
            >
              <span className="amh-nav-glass g-amber" aria-hidden="true" />
              <span className="relative inline-flex items-center justify-center">
                {activeTab === 'reports' ? (
                  <img src="/icons/report-animated.gif" alt="" aria-hidden="true" className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none" />
                ) : (
                  <img src="/icons/report-static.png" alt="" aria-hidden="true" className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none" />
                )}
              </span>
              <span className={`text-[15px] font-bold leading-none ${activeTab === 'reports' ? bottomNavLabelActiveClass : bottomNavLabelInactiveClass}`}>রিপোর্ট</span>
            </button>
            )}

            {/* ৫. এডমিন প্যানেল (শুধুমাত্র অ্যাডমিন দেখতে পাবে) */}
            {currentUser?.isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  if (selectAndAskMode) {
                    handlePageInspectClick(e);
                    return;
                  }
                  setActiveTab('team');
                }}
                title="এডমিন প্যানেল"
                aria-label="এডমিন প্যানেল"
                className={`relative flex flex-col items-center justify-center gap-0.5 py-[15px] px-1 sm:px-2 bg-transparent transition-transform duration-200 cursor-pointer select-none opacity-100 ${
                  activeTab === 'team' ? 'amh-nav-icon-neon amh-nav-neon-rose' : 'hover:scale-105'
                }`}
              >
                <span className="amh-nav-glass g-rose" aria-hidden="true" />
                <span className="relative inline-flex items-center justify-center">
                  {activeTab === 'team' ? (
                    <img src="/icons/admin-animated.gif" alt="" aria-hidden="true" className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none" />
                  ) : (
                    <img src="/icons/admin-static.png" alt="" aria-hidden="true" className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none" />
                  )}
                </span>
                <span className={`text-[15px] font-bold leading-none ${activeTab === 'team' ? bottomNavLabelActiveClass : bottomNavLabelInactiveClass}`}>অ্যাডমিন</span>
              </button>
            )}

            {/* ৬. সেটিংস (গেস্টদের জন্য লুকায়িত) */}
            {!currentUser?.isGuest && (
            <button
              type="button"
              onClick={(e) => {
                if (selectAndAskMode) {
                  handlePageInspectClick(e);
                  return;
                }
                setActiveTab('settings');
              }}
              title="সেটিংস"
              aria-label="সেটিংস"
              className={`relative flex flex-col items-center justify-center gap-0.5 py-[15px] px-1 sm:px-2 bg-transparent transition-transform duration-200 cursor-pointer select-none opacity-100 ${
                activeTab === 'settings' ? 'amh-nav-icon-neon amh-nav-neon-lime' : 'hover:scale-105'
              }`}
            >
              <span className="amh-nav-glass g-lime" aria-hidden="true" />
              <span className="relative inline-flex items-center justify-center">
                {activeTab === 'settings' ? (
                  <img src="/icons/settings-animated.gif" alt="" aria-hidden="true" className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none" />
                ) : (
                  <img src="/icons/settings-static.png" alt="" aria-hidden="true" className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none" />
                )}
              </span>
              <span className={`text-[15px] font-bold leading-none ${activeTab === 'settings' ? bottomNavLabelActiveClass : bottomNavLabelInactiveClass}`}>সেটিংস</span>
            </button>
            )}

            {/* ৭. টিভি সেটআপ — শুধুমাত্র এডমিন (TV বোর্ড কনফিগারেশনের নতুন প্যানেল) */}
            {currentUser?.isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                if (selectAndAskMode) {
                  handlePageInspectClick(e);
                  return;
                }
                setActiveTab('tvconfig');
              }}
              title="টিভি সেটআপ"
              aria-label="টিভি সেটআপ"
              className={`relative flex flex-col items-center justify-center gap-0.5 py-[15px] px-1 sm:px-2 bg-transparent transition-transform duration-200 cursor-pointer select-none opacity-100 ${
                activeTab === 'tvconfig' ? 'amh-nav-icon-neon amh-nav-neon-violet' : 'hover:scale-105'
              }`}
            >
              <span className="amh-nav-glass g-sky" aria-hidden="true" />
              <span className="relative inline-flex items-center justify-center">
                {activeTab === 'tvconfig' ? (
                  <img src="/icons/tv-animated.gif" alt="" aria-hidden="true" className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none" />
                ) : (
                  <img src="/icons/tv-static.png" alt="" aria-hidden="true" className="w-[44px] h-[44px] shrink-0 object-contain pointer-events-none select-none" />
                )}
              </span>
              <span className={`text-[15px] font-bold leading-none ${activeTab === 'tvconfig' ? bottomNavLabelActiveClass : bottomNavLabelInactiveClass}`}>টিভি</span>
            </button>
            )}
          </div>
        </div>
      </nav>
      )}
    </div>
  );
}
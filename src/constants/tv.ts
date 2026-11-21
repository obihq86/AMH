/**
 * TV Board Constants and Configuration
 * Centralized TV board defaults, presets, and configuration
 */

import { clampCount } from '../modules/constants';

// TV Board Default Labels
export const TV_BOARD_DEFAULT_LABELS = {
  1: 'TV-1 · ভার্টিক্যাল',
  2: 'TV-2 · ভার্টিক্যাল',
  3: 'TV-3 · হরাইজেন্টাল',
  4: 'TV-4 · হরাইজেন্টাল',
} as const;

// TV Font Zoom Levels
export const TV_FONT_ZOOM = {
  sm: 0.85,
  md: 1,
  lg: 1.18,
} as const;

// TV Card Tints for Settings UI
export const TV_CARD_TINTS = {
  1: { bg: 'bg-gradient-to-br from-sky-50 to-sky-100', border: 'border-sky-300', rail: 'border-l-sky-500', dot: 'bg-sky-500' },
  2: { bg: 'bg-gradient-to-br from-teal-50 to-emerald-100', border: 'border-teal-300', rail: 'border-l-teal-500', dot: 'bg-teal-600' },
  3: { bg: 'bg-gradient-to-br from-amber-50 to-orange-100', border: 'border-amber-300', rail: 'border-l-amber-500', dot: 'bg-amber-500' },
  4: { bg: 'bg-gradient-to-br from-rose-50 to-pink-100', border: 'border-rose-300', rail: 'border-l-rose-500', dot: 'bg-rose-500' },
} as const;

// TV Panel Keys and Labels
export const TV_PANEL_KEYS = ['called', 'next', 'tenList', 'absent', 'inside'] as const;
export const TV_PANEL_LABELS = {
  called: 'চলমান',
  next: 'পরবর্তী',
  tenList: '১০ জন',
  absent: 'অনুপস্থিত',
  inside: 'ভিতরে',
} as const;

// TV Element Keys and Labels
export const TV_ELEMENT_KEYS = ['header', 'token', 'name', 'age', 'call'] as const;
export const TV_ELEMENT_LABELS = {
  header: 'হেডার',
  token: 'টোকেন',
  name: 'নাম',
  age: 'বয়স',
  call: 'সম্ভাব্য ডাক',
} as const;

// TV Element CSS Variable Mapping
export const TV_EL_VAR = {
  header: { color: '--tv-header-c', size: '--tv-header-size', align: '--tv-header-align' },
  token: { color: '--tv-token', size: '--tv-token-size', align: '--tv-token-align' },
  name: { color: '--tv-name', size: '--tv-name-size', align: '--tv-name-align' },
  age: { color: '--tv-age-c', size: '--tv-age-size', align: '--tv-age-align' },
  call: { color: '--tv-call-c', size: '--tv-call-size', align: '--tv-call-align' },
} as const;

// TV Design Targets
export const TV_DESIGN_TARGETS = ['panel', 'sub'] as const;
export const TV_DESIGN_TARGET_LABELS = {
  panel: 'প্যানেল',
  sub: 'সাব-প্যানেল',
} as const;

// TV Design Presets
export const TV_DESIGN_PRESETS = [
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
] as const;

// TV Theme Presets
export const TV_THEME_PRESETS = [
  { id: 'default', label: 'ডিফল্ট', colors: { bg: '', token: '', name: '' } },
  { id: 'mint', label: 'মিন্ট', colors: { bg: '#ecfdf5', token: '#0d9488', name: '#0f172a' } },
  { id: 'ocean', label: 'ওশান', colors: { bg: '#eff6ff', token: '#2563eb', name: '#0f172a' } },
  { id: 'sunset', label: 'সানসেট', colors: { bg: '#fff7ed', token: '#ea580c', name: '#1c1917' } },
  { id: 'rose', label: 'রোজ', colors: { bg: '#fff1f2', token: '#e11d48', name: '#1f2937' } },
  { id: 'dark', label: 'ডার্ক', colors: { bg: '#0f172a', token: '#34d399', name: '#f8fafc' } },
] as const;

// TV1 Panel Heights (fixed, not from settings)
export const TV1_PANEL_HEIGHTS = {
  called: 22,
  inside: 12,
  next: 14,
  tenList: 38,
  absent: 14,
} as const;

// Default TV Board Configuration
export function defaultTvBoardConfig(n: number) {
  return {
    enabled: true,
    label: TV_BOARD_DEFAULT_LABELS[n as keyof typeof TV_BOARD_DEFAULT_LABELS] || `TV-${n}`,
    panels: { called: true, next: true, tenList: true, absent: true, inside: true },
    counts: { called: 4, tenList: 10, absent: 8 },
    heights: { called: 11, inside: 11, next: 11, tenList: 50, absent: 16 },
    fontScale: 'md' as const,
    colors: { bg: '', token: '', name: '' },
    styles: {},
    design: {},
  };
}

// Clamp percentage for heights (fallback to default if invalid)
export function clampPct(v: any, fb: number, lo = 2, hi = 95): number {
  const x = Math.round(Number(v));
  return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : fb;
}

// TV Field/Chip Styles for Settings UI
export const TV_CHIP_TONES = {
  indigo: 'bg-indigo-600 text-white border-indigo-600 shadow-sm',
  teal: 'bg-teal-600 text-white border-teal-600 shadow-sm',
  emerald: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
  slate: 'bg-slate-800 text-white border-slate-800 shadow-sm',
  amber: 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm',
} as const;

export const TV_FIELD_BOX = 'min-w-0 rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2.5 shadow-sm';
export const TV_SEG_WRAP = 'inline-flex rounded-full border border-slate-300 bg-white p-0.5';

// Panel hidden helper
export function tvPanelHidden(n: number, key: string, tvBoardsConfig: any): string {
  return tvBoardsConfig[n]?.panels?.[key] === false ? ' hidden' : '';
}

// Count helper
export function tvCount(n: number, key: string, fallback: number, tvBoardsConfig: any): number {
  return clampCount(tvBoardsConfig[n]?.counts?.[key], 1, 20) || fallback;
}

// Panel flex style
export function tvPanelFlex(n: number, key: string, tvBoardsConfig: any) {
  return { flexGrow: TV1_PANEL_HEIGHTS[key as keyof typeof TV1_PANEL_HEIGHTS] ?? 10, flexBasis: '0%', flexShrink: 1, minHeight: 0 };
}

// Group flex style
export function tvGroupFlex(n: number, keys: string[], tvBoardsConfig: any) {
  return { flexGrow: keys.reduce((a, k) => a + (TV1_PANEL_HEIGHTS[k as keyof typeof TV1_PANEL_HEIGHTS] ?? 10), 0), flexBasis: '0%', flexShrink: 1, minHeight: 0 };
}

// TV Board Style Generator
export function getTvBoardStyle(n: number, tvBoardsConfig: any, tvAutoBrightness: boolean) {
  const cfg = tvBoardsConfig[n] || {};
  const zoom = TV_FONT_ZOOM[cfg.fontScale as keyof typeof TV_FONT_ZOOM] || 1;
  let brightness = 1;
  if (tvAutoBrightness) {
    const h = new Date().getHours();
    brightness = (h >= 19 || h < 6) ? 0.8 : ((h >= 6 && h < 9) || (h >= 17 && h < 19)) ? 0.92 : 1;
  }
  const c = cfg.colors || {};
  const style: any = { zoom, filter: `brightness(${brightness})` };
  if (c.bg) style.background = c.bg;
  if (c.token) style['--tv-token'] = c.token;
  if (c.name) style['--tv-name'] = c.name;
  return style;
}

// Token/Name inline styles
export const tvTokenStyle = { color: 'var(--tv-token)' };
export const tvNameStyle = { color: 'var(--tv-name)' };

// TV Design Parts Generator
export function tvDesignParts(preset: string, base: string, accent: string, pic: string) {
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
}

// Combine multiple design effects
export function tvDesignCombine(list: string[], base: string, accent: string, pic: string): string {
  const arr = (Array.isArray(list) ? list : (list ? [list] : [])).filter(Boolean).slice(-3);
  if (!arr.length) return '';
  const parts = arr.map(p => tvDesignParts(p, base, accent, pic));
  const imgs: string[] = [];
  const sizes: string[] = [];
  const repeats: string[] = [];
  [...parts].reverse().forEach(x => (x.layers || []).forEach(l => { imgs.push(l.image); sizes.push(l.size || 'auto'); repeats.push(l.repeat || 'repeat'); }));
  const bottomColor = parts.find(x => x.bgColor);
  let d = '';
  if (bottomColor) d += `background-color:${bottomColor.bgColor}!important;`;
  else if (imgs.length) d += `background-color:transparent!important;`;
  if (imgs.length) {
    d += `background-image:${imgs.join(',')}!important;background-size:${sizes.join(',')}!important;background-repeat:${repeats.join(',')}!important;`;
  }
  const topVal = (key: string) => { for (let i = parts.length - 1; i >= 0; i--) if (parts[i][key]) return parts[i][key]; return null; };
  const bs = topVal('boxShadow'); if (bs) d += `box-shadow:${bs}!important;`;
  const bd = topVal('borderCss'); if (bd) d += `border:${bd}!important;`;
  const cc = topVal('cssColor'); if (cc) d += `color:${cc}!important;`;
  const bk = topVal('backdrop'); if (bk) d += `backdrop-filter:${bk}!important;-webkit-backdrop-filter:${bk}!important;`;
  return d;
}

// Single preset to CSS declaration
export function tvDesignDecl(preset: string, base: string, accent: string, pic: string): string {
  return tvDesignCombine([preset], base, accent, pic);
}

// Generate CSS from board config styles
export function getTvElementCss(boardCfg: any): string {
  if (!boardCfg || !boardCfg.styles) return '';
  const escColor = (v: string) => String(v).replace(/[^a-zA-Z0-9_(),.\/#\s-]/g, '');
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
}

// Generate CSS from board config design
export function getTvDesignCss(boardCfg: any): string {
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
}
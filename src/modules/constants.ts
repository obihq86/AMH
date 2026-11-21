export const DEFAULT_CHANNEL_ID = 'ansari-medical-hall-queue-2026';
export const SERVER_CLOUD_USER = Object.freeze({ id: 'server-session' });

export const localDateKey = (date = new Date()) => {
  const d = date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const TODAY_KEY = localDateKey();

export const DEFAULT_GDRIVE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxsPWgk2oCtPonqureAavt31CGJmtjYRHAGGHDH7ygoPs-wPVhYfxjpLbm6dsZBUqBW8g/exec';
export const DEFAULT_GDRIVE_ACCESS_TOKEN = '';
export const DEFAULT_GDRIVE_CLIENT_ID = '280458758298-te0gq3q3jnqee0ca9gpa8itujltu6hne.apps.googleusercontent.com';

export const shiftDateKey = (dateKey, days) => {
  const base = new Date(`${dateKey || localDateKey()}T00:00:00`);
  if (isNaN(base.getTime())) return localDateKey();
  base.setDate(base.getDate() + days);
  return localDateKey(base);
};

export const DEFAULT_TEAM_MEMBERS = [
  { id: 'STAFF-01', name: 'লাদেন', role: 'রিসেপশনিস্ট', pin: '1111', color: 'bg-emerald-600', isAdmin: false },
  { id: 'STAFF-02', name: 'সুজন', role: 'রিসেপশনিস্ট', pin: '2222', color: 'bg-blue-600', isAdmin: false },
  { id: 'ADMIN-01', name: 'উবায়দুল', role: 'অ্যাডমিনিস্ট্রেটর', pin: ';', color: 'bg-rose-700', isAdmin: true }
];

export const GUEST_SESSION_USER = { id: 'GUEST-01', name: 'গেস্ট (দর্শক)', role: 'গেস্ট', pin: '', color: 'bg-teal-600', isAdmin: false, isGuest: true };
export const TV_SESSION_USER = { id: 'TV-01', name: 'TV MOOD', role: 'tv', pin: '', color: 'bg-indigo-700', isAdmin: false, isTvMode: true };
export const EMPTY_SERIAL_BLOCK = new Set();

export const AGE_PRESETS = [
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

export const normalizeNumericPin = (value) => String(value).replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).replace(/\D/g, '');

export const appStatusLabel = (status) => {
  if (status === 'APPROVED') return 'অনুমোদিত';
  if (status === 'REJECTED') return 'বাতিল';
  if (status === 'DISMISSED') return 'সরানো';
  return 'অপেক্ষমাণ';
};

export const applicationSerialOf = (app) => {
  const granted = Number(app && app.grantedSerial ? app.grantedSerial : 0) || 0;
  if (granted > 0) return granted;
  return Number(app && app.reservedSerial ? app.reservedSerial : 0) || 0;
};

export const isVacantApplication = (app) => Boolean(app) && app.status !== 'PENDING' && !(Number(app.grantedSerial) > 0) && applicationSerialOf(app) > 0;

export const toLatinDigits = (v) => String(v ?? '').replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09E6));

export const splitDoctorTitle = (title) => {
  const parts = String(title || '').split(/[,،]/);
  return { name: (parts[0] || '').trim(), qualification: parts.slice(1).join(', ').trim() };
};

export const SYNC_COALESCE_MS = 120;

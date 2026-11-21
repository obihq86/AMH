export const normalizeNumericPin = (value) => String(value).replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).replace(/\D/g, '');

export const localDateKey = (date = new Date()) => {
  const d = date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const shiftDateKey = (dateKey, days) => {
  const base = new Date(`${dateKey || localDateKey()}T00:00:00`);
  if (isNaN(base.getTime())) return localDateKey();
  base.setDate(base.getDate() + days);
  return localDateKey(base);
};

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

export const resolveStoredUserId = (savedId, GUEST_SESSION_USER, TV_SESSION_USER, DEFAULT_TEAM_MEMBERS) => {
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

export const persistActiveUserId = (id, IS_MINI_PREVIEW) => {
  try {
    if (IS_MINI_PREVIEW) return;
    if (id) localStorage.setItem('amh_active_user_id', id);
    else localStorage.removeItem('amh_active_user_id');
  } catch {}
};

export const resolveUrlSessionUser = (TV_SESSION_USER) => {
  try {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const u = (params.get('user') || '').toLowerCase();
    const tv = params.get('tv') || window.location.pathname.match(/^\/tv([1-4])\/?$/i)?.[1];
    if (u === 'tv' || u === 'tv-01' || ['1', '2', '3', '4'].includes(tv)) return TV_SESSION_USER;
  } catch {}
  return null;
};

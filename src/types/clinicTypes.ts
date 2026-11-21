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
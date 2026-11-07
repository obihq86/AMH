// তারিখকে সার্বজনীন dd/mm/yyyy ফরম্যাটে লিখা ও দেখানোর ফাংশন
export function formatDateToDDMMYYYY(dateInput) {
  if (!dateInput) return '';
  try {
    let d;
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
      const parts = dateInput.trim().split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      d = new Date(y, m, day);
    } else {
      d = new Date(dateInput);
    }
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear());
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

export function toBengaliDigits(num) {
  if (num === null || num === undefined) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, w => bnDigits[parseInt(w, 10)]);
}

// বাংলা সম্পূর্ণ তারিখ ফরম্যাটার: আজ শনিবার, ২৪ অক্টোবর ২০২৬
export function formatBengaliFullDate(dateInput = new Date()) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const BENGALI_DAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const BENGALI_MONTHS = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const dayName = BENGALI_DAYS[d.getDay()];
    const dayNum = toBengaliDigits(d.getDate());
    const monthName = BENGALI_MONTHS[d.getMonth()];
    const yearNum = toBengaliDigits(d.getFullYear());
    return `আজ ${dayName}, ${dayNum} ${monthName} ${yearNum}`;
  } catch {
    return '';
  }
}

// হেডারের জন্য সংক্ষিপ্ত বাংলা তারিখ: মঙ্গলবার ২৭ অক্টোবর ২০২৬
export function formatBengaliHeaderDate(dateInput = new Date()) {
  return formatBengaliFullDate(dateInput)
    .replace(/^আজ\s*/, '')
    .replace(/,/g, '')
    .trim();
}

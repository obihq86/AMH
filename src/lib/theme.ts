// থিম ও অনুবাদ — অ্যাপের কাঠামো থেকে আলাদা করা
export const TRANSLATIONS = {
  bn: {
    appTitle: 'নতুন সিরিয়াল',
    clinicName: 'আনছারী মেডিকেল হল',
    doctorTitle: 'মোঃ উবায়দুল হক, ডিপ্লোমা ইন মেডিকেল ফ্যাকাল্টি',
    navRegister: 'নতুন সিরিয়াল',
    navQueue: 'লাইভ সিরিয়াল তালিকা',
    navReports: 'দৈনিক রিপোর্ট ও ক্লাউড সিঙ্ক',
    navTeam: 'এডমিন প্যানেল',
    navPatientId: 'Patient ID',
    navSettings: 'সেটিংস',
    ageDays: 'বয়স - দিন',
    patientName: 'রোগীর নাম *',
    namePlaceholder: 'যেমন: মোঃ সাকিব আহমেদ / রহিমা খাতুন',
    ageYears: 'বয়স - বছর *',
    ageMonths: 'বয়স - মাস',
    addBtn: 'সিরিয়াল নিশ্চিত করুন',
    quickPresets: 'দ্রুত বয়স নির্বাচন',
    callNextBtn: 'রোগী ডাকুন',
    completedBtn: 'সম্পন্ন',
    callBtn: 'ডাকুন'
  }
};

export const THEMES = [
  { id: 'aurora-ui', name: 'Aurora UI (Northern Lights)' },
  { id: 'gradient-mesh-ui', name: 'Gradient Mesh UI' },
  { id: 'aurora-glassmorphism-ui', name: 'Aurora UI Gradient with Glassmorphism' },
  { id: 'immersive-ui', name: 'Immersive UI (Deep Focus)' },
  { id: 'organic-ui', name: 'Organic UI (Earthy Botanical)' },
  { id: 'dental-mint', name: 'Dental Mint & Peach (Clinic UI)' },
  { id: 'luxe-frosted-glass', name: 'Luxe Frosted Glass' },
  { id: 'plain-green', name: 'Plain UI (Green)' },
  { id: 'puffy-3d-clay', name: 'Puffy 3D Clay' },
  { id: 'sooti-art-clay', name: 'Sooti Art Clay' },
  { id: 'zomo-neo-cloud', name: 'Zomo Neo-Cloud' },
  { id: 'dark-gold-luxe', name: 'Dark Gold Luxe (VIP)' },
  { id: 'obsidian-neumorphic', name: 'Obsidian Neumorphic (Violet)' },
  { id: 'neon-glass', name: 'Neon Glass Dashboard (Blue-Purple)' }
].sort((a, b) => a.name.localeCompare(b.name));

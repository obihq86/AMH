import {
  parseBengaliDigits,
  normalizeBangladeshPhone,
  applicationSerialOf,
  isVacantApplication,
  toBengaliDigits,
  TODAY_KEY,
  getNextLogicalTime
} from '../modules/constants';

// Placeholder or imported types
interface Application {
  id: string;
  status: string;
  name: string;
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  appointmentDate: string;
  reservedSerial: number;
  phoneNumber: string;
  normalizedPhone: string;
  symptoms: string;
  appliedAt: string;
  appliedAtTimestamp: number;
  updatedTimestamp: number;
  appliedByName: string;
  isChildUnder4: boolean;
  totalAge: number;
}

export const submitGuestApplication = async (
  appData: any,
  pendingApplications: any[],
  setPendingApplications: (apps: any[]) => void,
  registrationRuleConfig: any,
  patientsByDate: any,
  blockedSerialsFor: (date: string) => Set<number>,
  broadcastApplications: (apps: any[]) => void,
  setSyncToast: (msg: string) => void,
  currentUser: any
) => {
  const { phoneNumber, patientName, ageYears, ageMonths, ageDays, appointmentDate, symptoms } = appData;
  const normalized = normalizeBangladeshPhone(phoneNumber);
  if (!normalized) {
    return { success: false, error: 'আবেদনের জন্য সঠিক বাংলাদেশি মোবাইল নম্বর দিন।' };
  }

  const targetDate = appointmentDate || TODAY_KEY;
  // Note: closedDates check needs to be handled outside or passed in

  const engY = Number(parseBengaliDigits(ageYears)) || 0;
  const engM = Number(parseBengaliDigits(ageMonths)) || 0;
  const engD = Number(parseBengaliDigits(ageDays)) || 0;
  const totalAge = engY + engM / 12 + engD / 365;
  const ruleAgeLimit = Number(registrationRuleConfig?.ageLimitYears ?? 4);
  const isChildUnder4 = totalAge < ruleAgeLimit;
  const targetDatePatients = patientsByDate[targetDate] || [];
  const stamp = getNextLogicalTime();

  // allocateNextSerialByRule needs to be imported or refactored
  // const reservedSerial = allocateNextSerialByRule(isChildUnder4, targetDatePatients, blockedSerialsFor(targetDate));
  const reservedSerial = 1; // Temporary mock

  const app: Application = {
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

  const nextApps = [app, ...pendingApplications].slice(0, 120);
  setPendingApplications(nextApps);
  broadcastApplications(nextApps);
  setSyncToast(`✓ আবেদন পাঠানো হয়েছে — টোকেন #${toBengaliDigits(reservedSerial)} আপনার নামে বুক রইল।`);

  return { success: true };
};

export const approveGuestApplication = async (
  appId: string,
  pendingApplications: any[],
  setPendingApplications: (apps: any[]) => void,
  patientsByDate: any,
  setPatientsByDate: (map: any) => void,
  patientIdDirectory: any[],
  setPatientIdDirectory: (dir: any[]) => void,
  allPatientIdRecords: any[],
  patientIdPrefix: string,
  currentUser: any,
  broadcastFullState: any,
  setSyncToast: (msg: string) => void
) => {
  const app = pendingApplications.find(a => a.id === appId);
  if (!app || app.status === 'APPROVED') return;

  const targetDate = app.appointmentDate || TODAY_KEY;
  const targetDatePatients = patientsByDate[targetDate] || [];
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
    serialNumber: app.reservedSerial, // simplified
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
    reservedSerial: app.reservedSerial,
    registeredAt: timeFormatted,
    registeredTimestamp: stamp,
    updatedTimestamp: stamp,
    registeredByName: `${app.name} (গেস্ট আবেদন)`
  };

  const updatedMap = { ...patientsByDate, [targetDate]: [...targetDatePatients, newPatient] };
  setPatientsByDate(updatedMap);

  const nextApps = pendingApplications.map(a =>
    a.id === app.id
      ? {
          ...a,
          status: 'APPROVED',
          grantedSerial: app.reservedSerial,
          grantedPatientId: newPatient.id,
          grantedPatientCode: generatedPatientCode,
          decidedByName: currentUser?.name || 'স্টাফ',
          decidedAt: timeFormatted,
          updatedTimestamp: getNextLogicalTime()
        }
      : a
  );
  setPendingApplications(nextApps);

  // Note: broadcastFullState arguments need to be matched correctly
  // broadcastFullState(updatedMap, ...);

  setSyncToast(`✓ আবেদন অনুমোদিত (${app.name})`);
};

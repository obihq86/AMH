import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import App from '../Ansari Medical Hall - Patient Manager_V8.0';
import {
  authenticateClinicPin,
  checkClinicSession,
  readClinicState,
  signOutClinic,
  verifyClinicAccess,
  writeClinicState
} from './lib/clinicApi';

const DEFAULT_ROOM = 'ansari-medical-hall-queue-2026';

function getRoomId() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('room') || localStorage.getItem('amh_active_room_key') || DEFAULT_ROOM;
  const value = raw.trim();
  if (value.includes('লাদেন') || value.toLowerCase().includes('laden')) return 'laden';
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, '') || DEFAULT_ROOM;
}

function getLocalPayload(roomId: string): Record<string, unknown> | null {
  const cached = localStorage.getItem(`amh_sync_payload_${roomId}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch (error) {
      console.error('Could not read the local sync cache:', error);
    }
  }

  const readJson = (key: string, fallback: unknown) => {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Could not read local data for ${key}:`, error);
      return fallback;
    }
  };
  const patientsByDate = readJson(`amh_patients_${roomId}`, null);
  const patientIdDirectory = readJson(`amh_directory_${roomId}`, null);
  if (!patientsByDate && !patientIdDirectory) return null;

  return {
    action: 'FULL_SYNC',
    messageId: `migration-${Date.now()}`,
    updatedAt: Date.now(),
    patientsByDate: patientsByDate || {},
    patientIdDirectory: patientIdDirectory || [],
    deletedDates: readJson(`amh_deleted_dates_${roomId}`, {}),
    deletedPatientIds: readJson(`amh_deleted_patients_${roomId}`, {}),
    deletedRecords: readJson(`amh_deleted_records_${roomId}`, {}),
    pendingApplications: readJson(`amh_applications_${roomId}`, [])
  };
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-10 text-slate-800">
      <section className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h1 className="mb-4 text-xl font-bold text-emerald-900">Ansari Medical Hall</h1>
        {children}
      </section>
    </main>
  );
}

export default function SupabaseGate() {
  const [sessionReady, setSessionReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [syncMode, setSyncMode] = useState<'checking' | 'choice' | 'ready' | 'local'>('checking');
  const [roomId] = useState(getRoomId);
  const [hasLocalData, setHasLocalData] = useState(false);

  useEffect(() => {
    let active = true;
    checkClinicSession().then((isAuthenticated) => {
      if (!active) return;
      setAuthenticated(isAuthenticated);
      setSessionReady(true);
    }).catch((error: unknown) => {
      if (!active) return;
      setErrorText(error instanceof Error ? error.message : 'নিরাপদ সেশন যাচাই করা যায়নি।');
      setSessionReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      setAuthenticated(false);
      setSyncMode('checking');
    };
    window.addEventListener('clinic-session-expired', handleExpiredSession);
    return () => window.removeEventListener('clinic-session-expired', handleExpiredSession);
  }, []);

  const checkCloudState = useCallback(async () => {
    if (!authenticated) return;
    setSyncMode('checking');
    setErrorText('');
    try {
      await verifyClinicAccess();
      const remoteState = await readClinicState(roomId);
      if (remoteState) {
        setSyncMode('ready');
        return;
      }
      const hasData = getLocalPayload(roomId) !== null;
      setHasLocalData(hasData);
      setSyncMode(hasData ? 'choice' : 'ready');
    } catch (error) {
      console.error('Could not load the Supabase clinic state:', error);
      setErrorText(error instanceof Error ? error.message : 'Supabase database connection failed.');
      setSyncMode('checking');
    }
  }, [authenticated, roomId]);

  useEffect(() => {
    if (authenticated) void checkCloudState();
  }, [authenticated, checkCloudState]);

  const handleCloudLogin = useCallback(async (pin: string) => {
    setErrorText('');
    await authenticateClinicPin(pin);
    setAuthenticated(true);
    setSyncMode('checking');
  }, []);

  const handleImport = async () => {
    const payload = getLocalPayload(roomId);
    if (!payload) {
      setHasLocalData(false);
      setSyncMode('ready');
      return;
    }
    setBusy(true);
    setErrorText('');
    try {
      await writeClinicState(roomId, payload);
      setSyncMode('ready');
    } catch (error) {
      console.error('Could not migrate local clinic data:', error);
      setErrorText(error instanceof Error ? error.message : 'Could not move local data to Supabase.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOutClinic();
    setAuthenticated(false);
    setSyncMode('checking');
  };

  if (!sessionReady) {
    return <Panel><p>নিরাপদ সংযোগ যাচাই হচ্ছে…</p></Panel>;
  }

  if (!authenticated) {
    return (
      <App
        cloudSyncEnabled={false}
        onCloudLogin={handleCloudLogin}
        onCloudLogout={handleSignOut}
      />
    );
  }

  if (syncMode === 'checking') {
    return (
      <Panel>
        <p>নিরাপদ ডেটাবেস সংযোগ যাচাই হচ্ছে…</p>
        {errorText && (
          <div className="mt-4 space-y-3">
            <p role="alert" className="text-sm text-red-700">{errorText}</p>
            <p className="text-sm">Server PIN gateway-এর environment secrets ও Supabase migration যাচাই করে আবার চেষ্টা করুন।</p>
            <button onClick={() => void checkCloudState()} className="rounded-lg bg-emerald-800 px-4 py-2 text-white">আবার চেষ্টা</button>
          </div>
        )}
      </Panel>
    );
  }

  if (syncMode === 'choice') {
    return (
      <Panel>
        <h2 className="text-lg font-semibold">পুরোনো ডিভাইসের তথ্য পাওয়া গেছে</h2>
        <p className="mt-2 text-sm leading-6">
          এই ব্রাউজারে রোগীর তথ্য আছে, কিন্তু Supabase ক্লাউডে এখনো কোনো রেকর্ড নেই। আপনার সম্মতি ছাড়া তথ্য কপি করা হবে না।
        </p>
        {errorText && <p role="alert" className="mt-3 text-sm text-red-700">{errorText}</p>}
        <div className="mt-5 space-y-3">
          <button disabled={busy} onClick={() => void handleImport()} className="w-full rounded-lg bg-emerald-800 p-3 font-semibold text-white disabled:opacity-60">
            {busy ? 'নিরাপদে কপি হচ্ছে…' : 'এই ডিভাইসের তথ্য ক্লাউডে কপি করুন'}
          </button>
          <button disabled={busy} onClick={() => setSyncMode('local')} className="w-full rounded-lg border border-slate-300 p-3 font-semibold">
            এখন নয় — এই ডিভাইসে স্থানীয়ভাবে চালান
          </button>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <App
        cloudSyncEnabled={syncMode === 'ready'}
        onCloudLogin={syncMode === 'ready' ? handleCloudLogin : undefined}
        onCloudLogout={handleSignOut}
      />
      {syncMode === 'local' ? (
        <button onClick={() => void checkCloudState()} className="fixed bottom-3 left-3 z-[10000] rounded-full bg-amber-700 px-3 py-2 text-xs font-semibold text-white shadow-lg">
          ক্লাউড সিঙ্ক চালু করুন
        </button>
      ) : null}
      {hasLocalData && syncMode === 'local' && (
        <div className="fixed bottom-14 left-3 z-[10000] rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow">
          ক্লাউড সিঙ্ক বন্ধ; তথ্য এই ডিভাইসেই থাকবে।
        </div>
      )}
    </>
  );
}

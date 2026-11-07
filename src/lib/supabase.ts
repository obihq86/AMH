import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY
  || ''
).trim();

export const supabaseConfigError = !supabaseUrl || !supabaseKey
  ? 'Supabase URL and publishable key are required.'
  : null;

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });

export async function verifyClinicAccess() {
  if (!supabase) throw new Error(supabaseConfigError || 'Supabase is not configured.');

  const { data, error } = await supabase.rpc('is_authorized_clinic_user');
  if (error) throw error;
  if (data !== true) throw new Error('এই Supabase account-কে clinic database ব্যবহারের অনুমতি দেওয়া হয়নি।');
}

export async function readClinicState(roomId: string) {
  if (!supabase) throw new Error(supabaseConfigError || 'Supabase is not configured.');

  const { data, error } = await supabase
    .from('clinic_sync_state')
    .select('payload')
    .eq('room_id', roomId)
    .maybeSingle();

  if (error) throw error;
  return data?.payload ?? null;
}

export async function writeClinicState(roomId: string, payload: Record<string, unknown>) {
  if (!supabase) throw new Error(supabaseConfigError || 'Supabase is not configured.');

  const { error } = await supabase
    .from('clinic_sync_state')
    .upsert({
      room_id: roomId,
      payload,
      updated_at: Number(payload.updatedAt) || Date.now()
    });

  if (error) throw error;
}

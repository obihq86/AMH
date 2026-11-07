create table if not exists public.clinic_login_attempts (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  failed_attempts integer not null default 0,
  locked_until timestamptz
);

alter table public.clinic_login_attempts enable row level security;
revoke all on public.clinic_login_attempts from anon, authenticated;
grant all on public.clinic_login_attempts to service_role;

create or replace function public.check_clinic_login_limit(p_ip_hash text)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_started_at timestamptz;
  v_locked_until timestamptz;
begin
  insert into public.clinic_login_attempts (ip_hash)
  values (p_ip_hash)
  on conflict (ip_hash) do nothing;

  select attempts.window_started_at, attempts.locked_until
    into v_window_started_at, v_locked_until
    from public.clinic_login_attempts as attempts
    where attempts.ip_hash = p_ip_hash
    for update;

  if v_locked_until is not null and v_locked_until > now() then
    return query select false, greatest(1, ceil(extract(epoch from (v_locked_until - now())))::integer);
    return;
  end if;

  if v_window_started_at < now() - interval '15 minutes' then
    update public.clinic_login_attempts
      set window_started_at = now(), failed_attempts = 0, locked_until = null
      where ip_hash = p_ip_hash;
  end if;

  return query select true, 0;
end
$$;

create or replace function public.record_clinic_login_attempt(p_ip_hash text, p_success boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_started_at timestamptz;
  v_failed_attempts integer;
begin
  insert into public.clinic_login_attempts (ip_hash)
  values (p_ip_hash)
  on conflict (ip_hash) do nothing;

  select attempts.window_started_at, attempts.failed_attempts
    into v_window_started_at, v_failed_attempts
    from public.clinic_login_attempts as attempts
    where attempts.ip_hash = p_ip_hash
    for update;

  if p_success then
    update public.clinic_login_attempts
      set window_started_at = now(), failed_attempts = 0, locked_until = null
      where ip_hash = p_ip_hash;
    return;
  end if;

  if v_window_started_at < now() - interval '15 minutes' then
    v_failed_attempts := 0;
    v_window_started_at := now();
  end if;

  v_failed_attempts := v_failed_attempts + 1;
  update public.clinic_login_attempts
    set window_started_at = v_window_started_at,
        failed_attempts = v_failed_attempts,
        locked_until = case
          when v_failed_attempts >= 5 then now() + interval '15 minutes'
          else null
        end
    where ip_hash = p_ip_hash;
end
$$;

revoke all on function public.check_clinic_login_limit(text) from public, anon, authenticated;
revoke all on function public.record_clinic_login_attempt(text, boolean) from public, anon, authenticated;
grant execute on function public.check_clinic_login_limit(text) to service_role;
grant execute on function public.record_clinic_login_attempt(text, boolean) to service_role;

revoke all on public.clinic_sync_state from anon, authenticated;
grant all on public.clinic_sync_state to service_role;

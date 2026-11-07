create table if not exists public.clinic_authorized_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.clinic_authorized_users enable row level security;
grant select on public.clinic_authorized_users to authenticated;

drop policy if exists "users can view own clinic access" on public.clinic_authorized_users;
create policy "users can view own clinic access"
  on public.clinic_authorized_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_authorized_clinic_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.clinic_authorized_users
    where user_id = (select auth.uid())
  )
$$;

revoke all on function public.is_authorized_clinic_user() from public;
grant execute on function public.is_authorized_clinic_user() to authenticated;

create table if not exists public.clinic_sync_state (
  room_id text primary key,
  payload jsonb not null,
  updated_at bigint not null
);

alter table public.clinic_sync_state enable row level security;

grant select, insert, update on public.clinic_sync_state to authenticated;

create or replace function public.keep_latest_clinic_sync_state()
returns trigger
language plpgsql
as $$
begin
  if new.updated_at < old.updated_at then
    return old;
  end if;
  return new;
end
$$;

drop trigger if exists clinic_sync_state_keep_latest on public.clinic_sync_state;
create trigger clinic_sync_state_keep_latest
  before update on public.clinic_sync_state
  for each row
  execute function public.keep_latest_clinic_sync_state();

drop policy if exists "authenticated clinic access" on public.clinic_sync_state;
create policy "authenticated clinic access"
  on public.clinic_sync_state
  for all
  to authenticated
  using (public.is_authorized_clinic_user())
  with check (public.is_authorized_clinic_user());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'clinic_sync_state'
  ) then
    alter publication supabase_realtime add table public.clinic_sync_state;
  end if;
end
$$;

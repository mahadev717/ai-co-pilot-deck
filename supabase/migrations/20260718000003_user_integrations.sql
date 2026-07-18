-- ================================================================
-- Per-user integration links + credentials
-- Run in Supabase SQL editor after the base schema
-- ================================================================

create table if not exists public.user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_id text not null,
  connected boolean not null default false,
  account_label text,
  credentials jsonb not null default '{}'::jsonb,
  last_synced text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider_id)
);

create index if not exists user_integrations_user_id_idx
  on public.user_integrations (user_id);

alter table public.user_integrations enable row level security;

drop policy if exists "Users manage own integrations" on public.user_integrations;
create policy "Users manage own integrations" on public.user_integrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

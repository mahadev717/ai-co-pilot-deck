-- ================================================================
-- Startup Copilot OS — Missing tables (profiles already exists)
-- Project: yepegkqkvhtuihmbkpiu
-- Run in: https://supabase.com/dashboard/project/yepegkqkvhtuihmbkpiu/sql/new
-- ================================================================

-- Ensure profiles has expected columns
alter table public.profiles add column if not exists company text;
alter table public.profiles add column if not exists role text default 'founder';
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Workspace
create table if not exists public.user_workspace (
  user_id uuid primary key references auth.users (id) on delete cascade,
  integrations jsonb not null default '[]'::jsonb,
  agents jsonb not null default '[]'::jsonb,
  chat_history jsonb not null default '[]'::jsonb,
  notifications jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  arr numeric not null default 0,
  health text not null check (health in ('healthy', 'at-risk', 'churned')),
  last_active text not null default 'Today',
  tickets_open integer not null default 0,
  nps integer not null default 50,
  stage text not null check (stage in ('trial', 'active', 'enterprise', 'churned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customers_user_id_idx on public.customers (user_id);

-- Revenue
create table if not exists public.revenue_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null,
  mrr numeric not null default 0,
  new_mrr numeric not null default 0,
  churned_mrr numeric not null default 0,
  expansion_mrr numeric not null default 0,
  customers integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);
create index if not exists revenue_snapshots_user_id_idx on public.revenue_snapshots (user_id);

-- Team
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  role text not null,
  avatar text not null default '',
  prs_this_week integer not null default 0,
  commits_this_week integer not null default 0,
  status text not null check (status in ('active', 'away', 'blocked')),
  last_active text not null default 'Just now',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists team_members_user_id_idx on public.team_members (user_id);

-- Metrics
create table if not exists public.business_metrics (
  user_id uuid primary key references auth.users (id) on delete cascade,
  mrr numeric not null default 248910,
  customers integer not null default 3204,
  burn_rate numeric not null default 87000,
  cash_on_hand numeric not null default 1200000,
  team_prs integer not null default 12,
  updated_at timestamptz not null default now()
);

-- Signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'founder'), '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.user_workspace (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.business_metrics (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed function
create or replace function public.seed_demo_data(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.customers where user_id = p_user_id;
  insert into public.customers (user_id, name, arr, health, last_active, tickets_open, nps, stage) values
    (p_user_id, 'Lumen AI', 14400, 'at-risk', '18 days ago', 3, 42, 'enterprise'),
    (p_user_id, 'Northwind Labs', 8800, 'at-risk', '12 days ago', 1, 51, 'active'),
    (p_user_id, 'Cascadia Corp', 4900, 'at-risk', '5 days ago', 4, 38, 'active'),
    (p_user_id, 'TechVault Inc', 24000, 'healthy', 'Today', 0, 78, 'enterprise'),
    (p_user_id, 'SkyBase Systems', 18200, 'healthy', 'Yesterday', 1, 82, 'enterprise'),
    (p_user_id, 'Orbital Data', 6600, 'healthy', '2 days ago', 0, 71, 'active'),
    (p_user_id, 'Vertex Analytics', 3600, 'healthy', 'Today', 0, 89, 'active'),
    (p_user_id, 'Quantum Works', 2400, 'churned', '32 days ago', 0, 22, 'churned');

  delete from public.revenue_snapshots where user_id = p_user_id;
  insert into public.revenue_snapshots (user_id, month, mrr, new_mrr, churned_mrr, expansion_mrr, customers) values
    (p_user_id, 'Jan', 120000, 18000, 5200, 8000, 1500),
    (p_user_id, 'Feb', 145000, 24000, 4800, 9200, 1800),
    (p_user_id, 'Mar', 168000, 28000, 5100, 12000, 2100),
    (p_user_id, 'Apr', 190000, 32000, 4200, 14800, 2500),
    (p_user_id, 'May', 220000, 38000, 3800, 16000, 2900),
    (p_user_id, 'Jun', 248910, 52400, 3200, 18700, 3204);

  delete from public.team_members where user_id = p_user_id;
  insert into public.team_members (user_id, name, role, avatar, prs_this_week, commits_this_week, status, last_active) values
    (p_user_id, 'Alex Chen', 'Lead Engineer', 'AC', 8, 31, 'active', '2 min ago'),
    (p_user_id, 'Sarah Kim', 'Frontend Dev', 'SK', 5, 18, 'active', '15 min ago'),
    (p_user_id, 'Marcus Webb', 'Backend Dev', 'MW', 4, 22, 'blocked', '1 hr ago'),
    (p_user_id, 'Priya Nair', 'Product Designer', 'PN', 1, 3, 'active', '5 min ago'),
    (p_user_id, 'Jordan Lee', 'DevOps', 'JL', 3, 14, 'away', '3 hrs ago'),
    (p_user_id, 'Emma Davis', 'Sales Lead', 'ED', 0, 0, 'active', 'Just now');

  insert into public.business_metrics (user_id, mrr, customers, burn_rate, cash_on_hand, team_prs)
  values (p_user_id, 248910, 3204, 87000, 1200000, 12)
  on conflict (user_id) do update set
    mrr = excluded.mrr,
    customers = excluded.customers,
    burn_rate = excluded.burn_rate,
    cash_on_hand = excluded.cash_on_hand,
    team_prs = excluded.team_prs,
    updated_at = now();
end;
$$;

grant execute on function public.seed_demo_data(uuid) to authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.user_workspace enable row level security;
alter table public.customers enable row level security;
alter table public.revenue_snapshots enable row level security;
alter table public.team_members enable row level security;
alter table public.business_metrics enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can read own workspace" on public.user_workspace;
create policy "Users can read own workspace" on public.user_workspace for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own workspace" on public.user_workspace;
create policy "Users can insert own workspace" on public.user_workspace for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own workspace" on public.user_workspace;
create policy "Users can update own workspace" on public.user_workspace for update using (auth.uid() = user_id);

drop policy if exists "Users manage own customers" on public.customers;
create policy "Users manage own customers" on public.customers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own revenue" on public.revenue_snapshots;
create policy "Users manage own revenue" on public.revenue_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own team" on public.team_members;
create policy "Users manage own team" on public.team_members
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own metrics" on public.business_metrics;
create policy "Users manage own metrics" on public.business_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ================================================================
-- Leave / holiday requests (per company account)
-- Run in Supabase SQL editor
-- ================================================================

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  employee_name text not null,
  employee_email text not null,
  leave_type text not null check (leave_type in ('annual', 'sick', 'personal', 'unpaid', 'other')),
  start_date date not null,
  end_date date not null,
  days integer not null default 1,
  reason text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_note text,
  email_sent boolean not null default false,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leave_requests_user_id_idx on public.leave_requests (user_id);
create index if not exists leave_requests_status_idx on public.leave_requests (user_id, status);

alter table public.leave_requests enable row level security;

drop policy if exists "Users manage own leave requests" on public.leave_requests;
create policy "Users manage own leave requests" on public.leave_requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

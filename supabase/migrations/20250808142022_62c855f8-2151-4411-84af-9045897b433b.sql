-- Create required tables with secure RLS and sensible defaults
-- NOTE: We avoid FK constraints to auth.users per best practices

-- Enable pgcrypto for gen_random_uuid if not already
create extension if not exists pgcrypto;

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid(),
  shop_name text,
  owner_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Incomes table
create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  amount numeric(12,2) not null check (amount >= 0),
  category text not null,
  date date not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.incomes enable row level security;

-- Expenses table
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  amount numeric(12,2) not null check (amount >= 0),
  category text not null,
  date date not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

-- Policies: each user can only access their own rows
-- PROFILES
create policy if not exists "Profiles: users can view own"
  on public.profiles for select using (auth.uid() = user_id);
create policy if not exists "Profiles: users can insert own"
  on public.profiles for insert with check (auth.uid() = user_id);
create policy if not exists "Profiles: users can update own"
  on public.profiles for update using (auth.uid() = user_id);
create policy if not exists "Profiles: users can delete own"
  on public.profiles for delete using (auth.uid() = user_id);

-- INCOMES
create policy if not exists "Incomes: users can view own"
  on public.incomes for select using (auth.uid() = user_id);
create policy if not exists "Incomes: users can insert own"
  on public.incomes for insert with check (auth.uid() = user_id);
create policy if not exists "Incomes: users can update own"
  on public.incomes for update using (auth.uid() = user_id);
create policy if not exists "Incomes: users can delete own"
  on public.incomes for delete using (auth.uid() = user_id);

-- EXPENSES
create policy if not exists "Expenses: users can view own"
  on public.expenses for select using (auth.uid() = user_id);
create policy if not exists "Expenses: users can insert own"
  on public.expenses for insert with check (auth.uid() = user_id);
create policy if not exists "Expenses: users can update own"
  on public.expenses for update using (auth.uid() = user_id);
create policy if not exists "Expenses: users can delete own"
  on public.expenses for delete using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_incomes_user_date on public.incomes(user_id, date desc);
create index if not exists idx_expenses_user_date on public.expenses(user_id, date desc);

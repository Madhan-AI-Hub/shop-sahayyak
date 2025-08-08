-- Create required tables with secure RLS
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

-- Drop old policies if they exist
-- PROFILES
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;
-- INCOMES
drop policy if exists incomes_select_own on public.incomes;
drop policy if exists incomes_insert_own on public.incomes;
drop policy if exists incomes_update_own on public.incomes;
drop policy if exists incomes_delete_own on public.incomes;
-- EXPENSES
drop policy if exists expenses_select_own on public.expenses;
drop policy if exists expenses_insert_own on public.expenses;
drop policy if exists expenses_update_own on public.expenses;
drop policy if exists expenses_delete_own on public.expenses;

-- Create policies (no IF NOT EXISTS in Postgres)
-- PROFILES
create policy profiles_select_own on public.profiles for select using (auth.uid() = user_id);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = user_id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = user_id);
create policy profiles_delete_own on public.profiles for delete using (auth.uid() = user_id);

-- INCOMES
create policy incomes_select_own on public.incomes for select using (auth.uid() = user_id);
create policy incomes_insert_own on public.incomes for insert with check (auth.uid() = user_id);
create policy incomes_update_own on public.incomes for update using (auth.uid() = user_id);
create policy incomes_delete_own on public.incomes for delete using (auth.uid() = user_id);

-- EXPENSES
create policy expenses_select_own on public.expenses for select using (auth.uid() = user_id);
create policy expenses_insert_own on public.expenses for insert with check (auth.uid() = user_id);
create policy expenses_update_own on public.expenses for update using (auth.uid() = user_id);
create policy expenses_delete_own on public.expenses for delete using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_incomes_user_date on public.incomes(user_id, date desc);
create index if not exists idx_expenses_user_date on public.expenses(user_id, date desc);

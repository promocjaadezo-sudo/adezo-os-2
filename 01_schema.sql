-- ADEZO OS 2.0 BUILD 002
-- Supabase / PostgreSQL production foundation
-- Run in Supabase SQL Editor as the first migration.

create extension if not exists "pgcrypto";

-- 1. Dictionaries
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null,
  role text not null default 'sales' check (role in ('ceo','sales','admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.salespeople (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null unique,
  email text,
  monthly_revenue_goal numeric(14,2) not null default 0,
  monthly_lead_goal integer not null default 0,
  monthly_offer_goal integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  target_margin_pct numeric(5,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  postal_code text,
  premium_zone text,
  priority text,
  created_at timestamptz not null default now(),
  unique(city, coalesce(postal_code,''), coalesce(premium_zone,''))
);

-- 2. Core sales tables
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_created_at timestamptz,
  client_name text not null,
  phone text,
  email text,
  city text,
  postal_code text,
  model_id uuid references public.models(id) on delete set null,
  model_name_raw text,
  source text,
  salesperson_id uuid references public.salespeople(id) on delete set null,
  status text not null default 'new',
  budget numeric(14,2) not null default 0,
  lead_score integer check (lead_score between 0 and 100),
  temperature text check (temperature in ('hot','warm','cold') or temperature is null),
  notes text,
  external_id text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  offer_date date,
  client_name_snapshot text,
  model_id uuid references public.models(id) on delete set null,
  salesperson_id uuid references public.salespeople(id) on delete set null,
  value numeric(14,2) not null default 0,
  status text not null default 'draft',
  win_probability integer not null default 10 check (win_probability between 0 and 100),
  next_contact_at date,
  notes text,
  external_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.lost (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references public.offers(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  salesperson_id uuid references public.salespeople(id) on delete set null,
  lost_date date not null default current_date,
  reason text,
  lost_value numeric(14,2) not null default 0,
  return_probability integer check (return_probability between 0 and 100),
  will_return text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete cascade,
  salesperson_id uuid references public.salespeople(id) on delete set null,
  due_date date not null,
  status text not null default 'open' check (status in ('open','done','cancelled','snoozed')),
  priority text not null default 'medium' check (priority in ('critical','high','medium','low')),
  task_type text not null default 'follow_up',
  value_snapshot numeric(14,2) not null default 0,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Marketing and relationship tables
create table if not exists public.marketing (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  source text not null,
  campaign text,
  cost numeric(14,2) not null default 0,
  clicks integer not null default 0,
  impressions integer not null default 0,
  leads_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.business_relationships (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('architect','developer','partner')),
  name text not null,
  city text,
  status text,
  potential_value numeric(14,2) not null default 0,
  next_contact_at date,
  owner_id uuid references public.salespeople(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Daily snapshots for predictive sales
create table if not exists public.daily_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null default current_date unique,
  closed_sales numeric(14,2) not null default 0,
  active_pipeline numeric(14,2) not null default 0,
  weighted_pipeline numeric(14,2) not null default 0,
  open_leads integer not null default 0,
  active_offers integer not null default 0,
  dead_leads integer not null default 0,
  money_leak numeric(14,2) not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_leads_salesperson on public.leads(salesperson_id);
create index if not exists idx_leads_created_at on public.leads(created_at);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_offers_salesperson on public.offers(salesperson_id);
create index if not exists idx_offers_status on public.offers(status);
create index if not exists idx_offers_lead on public.offers(lead_id);
create index if not exists idx_followups_due on public.followups(due_date, status);
create index if not exists idx_followups_salesperson on public.followups(salesperson_id);
create index if not exists idx_lost_salesperson on public.lost(salesperson_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at before update on public.leads for each row execute function public.set_updated_at();

drop trigger if exists trg_offers_updated_at on public.offers;
create trigger trg_offers_updated_at before update on public.offers for each row execute function public.set_updated_at();

drop trigger if exists trg_followups_updated_at on public.followups;
create trigger trg_followups_updated_at before update on public.followups for each row execute function public.set_updated_at();

drop trigger if exists trg_relationships_updated_at on public.business_relationships;
create trigger trg_relationships_updated_at before update on public.business_relationships for each row execute function public.set_updated_at();

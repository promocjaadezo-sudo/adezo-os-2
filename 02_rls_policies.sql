-- ADEZO OS 2.0 BUILD 002
-- Row Level Security policies for CEO / Sales roles.
-- Run after 01_schema.sql.

alter table public.profiles enable row level security;
alter table public.salespeople enable row level security;
alter table public.models enable row level security;
alter table public.locations enable row level security;
alter table public.leads enable row level security;
alter table public.offers enable row level security;
alter table public.lost enable row level security;
alter table public.followups enable row level security;
alter table public.marketing enable row level security;
alter table public.business_relationships enable row level security;
alter table public.daily_snapshots enable row level security;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid() and is_active = true
$$;

create or replace function public.current_salesperson_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.salespeople where profile_id = auth.uid() and is_active = true limit 1
$$;

create or replace function public.is_ceo_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_user_role() in ('ceo','admin'), false)
$$;

-- Profiles
create policy "profiles_select_own_or_ceo" on public.profiles
for select using (id = auth.uid() or public.is_ceo_or_admin());

create policy "profiles_update_own" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

-- Dictionaries readable by logged users
create policy "salespeople_select_authenticated" on public.salespeople
for select using (auth.role() = 'authenticated');

create policy "models_select_authenticated" on public.models
for select using (auth.role() = 'authenticated');

create policy "locations_select_authenticated" on public.locations
for select using (auth.role() = 'authenticated');

-- CEO/admin manage dictionaries
create policy "salespeople_write_ceo" on public.salespeople
for all using (public.is_ceo_or_admin()) with check (public.is_ceo_or_admin());

create policy "models_write_ceo" on public.models
for all using (public.is_ceo_or_admin()) with check (public.is_ceo_or_admin());

create policy "locations_write_ceo" on public.locations
for all using (public.is_ceo_or_admin()) with check (public.is_ceo_or_admin());

-- Leads: CEO sees all, sales sees only own rows
create policy "leads_select_role" on public.leads
for select using (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id());

create policy "leads_insert_role" on public.leads
for insert with check (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id());

create policy "leads_update_role" on public.leads
for update using (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id())
with check (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id());

-- Offers
create policy "offers_select_role" on public.offers
for select using (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id());

create policy "offers_insert_role" on public.offers
for insert with check (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id());

create policy "offers_update_role" on public.offers
for update using (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id())
with check (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id());

-- Lost
create policy "lost_select_role" on public.lost
for select using (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id());

create policy "lost_write_role" on public.lost
for all using (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id())
with check (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id());

-- Followups
create policy "followups_select_role" on public.followups
for select using (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id());

create policy "followups_write_role" on public.followups
for all using (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id())
with check (public.is_ceo_or_admin() or salesperson_id = public.current_salesperson_id());

-- Marketing and snapshots CEO/admin only
create policy "marketing_select_ceo" on public.marketing
for select using (public.is_ceo_or_admin());

create policy "marketing_write_ceo" on public.marketing
for all using (public.is_ceo_or_admin()) with check (public.is_ceo_or_admin());

create policy "snapshots_select_ceo" on public.daily_snapshots
for select using (public.is_ceo_or_admin());

create policy "snapshots_write_ceo" on public.daily_snapshots
for all using (public.is_ceo_or_admin()) with check (public.is_ceo_or_admin());

-- Relationships: CEO sees all, sales sees owned only
create policy "relationships_select_role" on public.business_relationships
for select using (public.is_ceo_or_admin() or owner_id = public.current_salesperson_id());

create policy "relationships_write_role" on public.business_relationships
for all using (public.is_ceo_or_admin() or owner_id = public.current_salesperson_id())
with check (public.is_ceo_or_admin() or owner_id = public.current_salesperson_id());

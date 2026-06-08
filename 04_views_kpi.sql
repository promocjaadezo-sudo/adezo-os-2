-- ADEZO OS 2.0 BUILD 002
-- KPI views for V30 logic moved to database.

create or replace view public.v_ceo_kpi as
select
  coalesce(sum(case when lower(o.status) like '%wygr%' then o.value else 0 end),0) as closed_sales,
  coalesce(sum(case when lower(o.status) not like '%wygr%' and lower(o.status) not like '%przegr%' then o.value else 0 end),0) as active_pipeline,
  coalesce(sum(case when lower(o.status) not like '%wygr%' and lower(o.status) not like '%przegr%' then o.value * o.win_probability / 100.0 else 0 end),0) as weighted_pipeline,
  count(distinct l.id) filter (where l.id is not null) as total_leads,
  count(distinct o.id) filter (where o.id is not null) as total_offers,
  count(distinct l.id) filter (
    where l.created_at < now() - interval '14 days'
    and not exists (select 1 from public.offers ox where ox.lead_id = l.id)
  ) as dead_leads
from public.leads l
full outer join public.offers o on o.lead_id = l.id;

create or replace view public.v_money_leak as
select
  coalesce((select sum(lost_value) from public.lost),0) as lost_value,
  coalesce((select sum(budget) from public.leads l where l.created_at < now() - interval '14 days' and not exists (select 1 from public.offers o where o.lead_id = l.id)),0) as dead_leads_value,
  coalesce((select sum(value) from public.offers where next_contact_at < current_date and lower(status) not like '%wygr%' and lower(status) not like '%przegr%'),0) as overdue_offers_value;

create or replace view public.v_salesperson_performance as
select
  sp.id,
  sp.name,
  sp.monthly_revenue_goal,
  count(distinct l.id) as leads_count,
  count(distinct o.id) as offers_count,
  coalesce(sum(case when lower(o.status) like '%wygr%' then o.value else 0 end),0) as closed_sales,
  coalesce(sum(case when lower(o.status) not like '%wygr%' and lower(o.status) not like '%przegr%' then o.value * o.win_probability / 100.0 else 0 end),0) as weighted_pipeline,
  count(distinct l.id) filter (
    where l.created_at < now() - interval '14 days'
    and not exists (select 1 from public.offers ox where ox.lead_id = l.id)
  ) as dead_leads
from public.salespeople sp
left join public.leads l on l.salesperson_id = sp.id
left join public.offers o on o.salesperson_id = sp.id
group by sp.id, sp.name, sp.monthly_revenue_goal;

create or replace view public.v_followups_today as
select
  f.*,
  l.client_name,
  l.phone,
  l.city,
  o.value as offer_value,
  sp.name as salesperson_name
from public.followups f
left join public.leads l on l.id = f.lead_id
left join public.offers o on o.id = f.offer_id
left join public.salespeople sp on sp.id = f.salesperson_id
where f.status = 'open'
order by f.due_date asc, f.value_snapshot desc;

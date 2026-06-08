-- ADEZO OS 2.0 BUILD 002
-- Seed initial ADEZO dictionaries.

insert into public.models(name, category, is_active) values
('Valletta','Drzwi premium',true),
('Helsinki','Drzwi premium',true),
('Astana','Drzwi premium',true),
('Tirana','Drzwi premium',true),
('Stockholm','Drzwi premium',true),
('Tallin','Drzwi premium',true),
('Lizbona','Drzwi premium',true),
('Kopenhaga','Drzwi premium',true),
('Wilno','Drzwi premium',true),
('Epsom','Drzwi premium',true),
('San Marino','Drzwi premium',true),
('Haga','Drzwi premium',true),
('Amsterdam','Drzwi premium',true)
on conflict(name) do nothing;

insert into public.salespeople(name, monthly_revenue_goal, monthly_lead_goal, monthly_offer_goal, is_active) values
('Magda K',176000,60,22,true),
('Magda B',176000,60,22,true)
on conflict(name) do nothing;

-- ADEZO OS 2.0 - REAL DATA SEED (BUILD 006B)
-- Ten plik zasila system realnymi danymi handlowymi, modelami i handlowcami.
-- Można go uruchomić bezpośrednio w Supabase SQL Editor.

-- Wyczyść istniejące przykładowe dane (kaskadowo usuwa powiązane rekordy)
truncate table public.followups cascade;
truncate table public.lost cascade;
truncate table public.offers cascade;
truncate table public.leads cascade;
truncate table public.salespeople cascade;
truncate table public.models cascade;

-- 1. Zasilenie handlowców (Salespeople)
-- Dopasowane do ról i adresów e-mail z BUILD 006A
insert into public.salespeople (id, name, email, monthly_revenue_goal, monthly_lead_goal, monthly_offer_goal, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'CEO ADEZO', 'ceo@adezo.pl', 2500000.00, 40, 20, true),
  ('22222222-2222-2222-2222-222222222222', 'Magda K', 'magda.k@adezo.pl', 1200000.00, 25, 12, true),
  ('33333333-3333-3333-3333-333333333333', 'Magda B', 'magda.b@adezo.pl', 1200000.00, 25, 12, true)
on conflict (name) do update set
  email = excluded.email,
  monthly_revenue_goal = excluded.monthly_revenue_goal,
  monthly_lead_goal = excluded.monthly_lead_goal,
  monthly_offer_goal = excluded.monthly_offer_goal,
  is_active = excluded.is_active;

-- 2. Zasilenie modeli domów (Models)
insert into public.models (id, name, category, target_margin_pct, is_active)
values
  ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'Tirana', 'Nowoczesna Stodoła', 15.00, true),
  ('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 'Astana', 'Klasyczna Rezydencja', 18.00, true),
  ('cccccccc-3333-3333-3333-cccccccccccc', 'Chaga', 'Ekologiczny / Drewniany', 12.00, true),
  ('dddddddd-4444-4444-4444-dddddddddddd', 'Waleta', 'Kompaktowy Miejski', 14.00, true)
on conflict (name) do update set
  category = excluded.category,
  target_margin_pct = excluded.target_margin_pct,
  is_active = excluded.is_active;

-- 3. Zasilenie leadów (Leads) - Minimum 10 realistycznych leadów dla Adezo
insert into public.leads (id, client_name, phone, email, city, model_id, source, salesperson_id, status, budget, temperature, notes, created_at, updated_at)
values
  -- Lead 1: Pozyskany (WON) przez Magdę K
  ('f1000000-0000-0000-0000-000000000001', 'Jan Kowalski - Polskie Sady Sp. z o.o.', '601202303', 'j.kowalski@polsady.pl', 'Gdańsk', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'Google Ads', '22222222-2222-2222-2222-222222222222', 'won', 750000.00, 'hot', 'Chce budować stan deweloperski Tirany u siebie na działce rekreacyjnej pod Gdańskiem.', now() - interval '30 days', now() - interval '5 days'),
  
  -- Lead 2: W kontakcie (CONTACTED) u Magdy B
  ('f1000000-0000-0000-0000-000000000002', 'Anna i Piotr Nowakowie', '505404303', 'nowakowie.poczta@gmail.com', 'Poznań', 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 'Meta Ads', '33333333-3333-3333-3333-333333333333', 'contacted', 950000.00, 'warm', 'Interesuje ich Astana z garażem dwustanowiskowym. Oczekują na poprawki finansowe.', now() - interval '25 days', now() - interval '2 days'),

  -- Lead 3: Nowy (NEW) przydzielony Magdzie K
  ('f1000000-0000-0000-0000-000000000003', 'Tomasz Lewandowski', '789123456', 'lewandowski.t@wp.pl', 'Wrocław', 'cccccccc-3333-3333-3333-cccccccccccc', 'Organic', '22222222-2222-2222-2222-222222222222', 'new', 640000.00, 'warm', 'Zgłoszenie przez formularz SEO na model Chaga. Klient planuje start inwestycji na jesień.', now() - interval '3 days', now() - interval '3 days'),

  -- Lead 4: Odrzucony (DISQUALIFIED) u Magdy B
  ('f1000000-0000-0000-0000-000000000004', 'Krzysztof Wiśniewski', '888777666', 'wisnia@onet.pl', 'Kraków', 'dddddddd-4444-4444-4444-dddddddddddd', 'Polecenie', '33333333-3333-3333-3333-333333333333', 'disqualified', 520000.00, 'cold', 'Brak własnych środków, decyzja odmowna banku odnośnie zdolności kredytowej.', now() - interval '40 days', now() - interval '20 days'),

  -- Lead 5: Zweryfikowany (QUALIFIED) u Magdy K
  ('f1000000-0000-0000-0000-000000000005', 'Karolina i Michał Zielińscy', '512987654', 'zielinscy.buduja@gmail.com', 'Warszawa', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'Meta Ads', '22222222-2222-2222-2222-222222222222', 'qualified', 800000.00, 'hot', 'Działka budowlana w Piasecznie z pozwoleniem na budowę pod model Tirana.', now() - interval '14 days', now() - interval '4 days'),

  -- Lead 6: W kontakcie (CONTACTED) u Magdy B
  ('f1000000-0000-0000-0000-000000000006', 'Firma INVEST-DOM', '604321098', 'biuro@investdom.pl', 'Gdynia', 'dddddddd-4444-4444-4444-dddddddddddd', 'Google Ads', '33333333-3333-3333-3333-333333333333', 'contacted', 1200000.00, 'warm', 'Deweloper pyta o możliwość budowy bliźniaka na bazie projektu Waleta.', now() - interval '18 days', now() - interval '1 day'),

  -- Lead 7: Nowy (NEW) - Nieprzypisany (brak handlowca)
  ('f1000000-0000-0000-0000-000000000007', 'Robert Kamiński', '533111222', 'r.kaminski@interia.pl', 'Szczecin', 'cccccccc-3333-3333-3333-cccccccccccc', 'Organic', null, 'new', 680000.00, 'cold', 'Zgłoszenie w niedzielę wieczorem. Interesuje go projekt Chaga.', now() - interval '1 day', now() - interval '1 day'),

  -- Lead 8: Zweryfikowany (QUALIFIED) u Magdy B
  ('f1000000-0000-0000-0000-000000000008', 'Magdalena Woźniak', '730222333', 'm.wozniak@luxhouse.com', 'Łódź', 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 'Polecenie', '33333333-3333-3333-3333-333333333333', 'qualified', 1050000.00, 'hot', 'Gotowa koncepcja zagospodarowania, wybiera dom Astana.', now() - interval '8 days', now() - interval '6 days'),

  -- Lead 9: Martwy (new, ale bez kontaktu od dawna) u Magdy K
  ('f1000000-0000-0000-0000-000000000009', 'Stefan Batory', '666555444', 'batory@poczta.pl', 'Lublin', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'Google Ads', '22222222-2222-2222-2222-222222222222', 'new', 720000.00, 'cold', 'Brak kontaktu po pierwszym mailu. Próba dodzwonienia się nie powiodła.', now() - interval '45 days', now() - interval '30 days'),

  -- Lead 10: W kontakcie (CONTACTED) u Magdy B
  ('f1000000-0000-0000-0000-000000000010', 'Patryk Mazur', '501777888', 'p.mazur@wp.pl', 'Rzeszów', 'dddddddd-4444-4444-4444-dddddddddddd', 'Meta Ads', '33333333-3333-3333-3333-333333333333', 'contacted', 610000.00, 'warm', 'Analizuje umowę pod model Waleta. Pyta o pompę ciepła w standardzie.', now() - interval '12 days', now() - interval '2 days');

-- 4. Zasilenie ofert (Offers) - Minimum 8 realistycznych ofert
-- (Niektóre kolumny to rozszerzenie z BUILD 005)
insert into public.offers (id, lead_id, created_at, offer_date, client_name_snapshot, model_id, salesperson_id, value, status, win_probability, next_contact_at, notes, updated_at)
values
  -- Oferta 1: Powiązana z Lead 1 (WON) - Magda K
  ('e1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', now() - interval '20 days', (current_date - interval '20 days')::date, 'Jan Kowalski - Polskie Sady Sp. z o.o.', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 742000.00, 'won', 100, (current_date + interval '10 days')::date, 'Oferta zaakceptowana przez inwestora. Umowa podpisana. Przekazano do działu produkcji.', now()),

  -- Oferta 2: Powiązana z Lead 2 (NEGOTIATION) - Magda B
  ('e1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', now() - interval '15 days', (current_date - interval '15 days')::date, 'Anna i Piotr Nowakowie', 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 925000.00, 'negotiation', 60, (current_date + interval '2 days')::date, 'Przesłano specyfikację techniczną. Inwestorzy rozmawiają z doradcą kredytowym.', now()),

  -- Oferta 3: Powiązana z Lead 5 (SENT) - Magda K
  ('e1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000005', now() - interval '10 days', (current_date - interval '10 days')::date, 'Karolina i Michał Zielińscy', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 785000.00, 'sent', 70, (current_date + interval '4 days')::date, 'Oferta wysłana. Klient zadowolony z wyceny, oczekuje ostatecznej decyzji od geodety.', now()),

  -- Oferta 4: Powiązana z Lead 6 (SENT) - Magda B
  ('e1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000006', now() - interval '12 days', (current_date - interval '12 days')::date, 'Firma INVEST-DOM', 'dddddddd-4444-4444-4444-dddddddddddd', '33333333-3333-3333-3333-333333333333', 1150000.00, 'sent', 40, (current_date + interval '5 days')::date, 'Kompletna oferta na bliźniaka Waleta. Deweloper liczy rentowność inwestycji.', now()),

  -- Oferta 5: Powiązana z Lead 8 (NEGOTIATION) - Magda B
  ('e1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000008', now() - interval '5 days', (current_date - interval '5 days')::date, 'Magdalena Woźniak', 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 1040000.00, 'negotiation', 85, (current_date + interval '1 day')::date, 'Klientka dzwoniła z pytaniem o rabat 2% przy szybkiej wpłacie. Bardzo blisko zamknięcia.', now()),

  -- Oferta 6: Powiązana z Lead 4 (LOST) - Magda B
  ('e1000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000004', now() - interval '25 days', (current_date - interval '25 days')::date, 'Krzysztof Wiśniewski', 'dddddddd-4444-4444-4444-dddddddddddd', '33333333-3333-3333-3333-333333333333', 510000.00, 'lost', 0, null, 'Niedotrzymanie terminu finansowego. Temat odrzucony i zamknięty w przegranych.', now()),

  -- Oferta 7: Powiązana z Lead 10 (DRAFT) - Magda B
  ('e1000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000010', now() - interval '2 days', (current_date - interval '2 days')::date, 'Patryk Mazur', 'dddddddd-4444-4444-4444-dddddddddddd', '33333333-3333-3333-3333-333333333333', 595000.00, 'draft', 30, (current_date + interval '6 days')::date, 'Szkic oferty na model Waleta w wersji ekonomicznej.', now()),

  -- Oferta 8: Powiązana z Lead 9 (DRAFT stale - Wyciek Pieniędzy) - Magda K
  ('e1000000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000009', now() - interval '30 days', (current_date - interval '30 days')::date, 'Stefan Batory', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 715000.00, 'draft', 10, null, 'Szkic starszy niż 14 dni, nadaje się jako Wyciek Pieniędzy.', now());

-- Zasilenie opcjonalnej utraty ofert (lost)
insert into public.lost (offer_id, lead_id, salesperson_id, lost_date, reason, lost_value, return_probability, will_return, notes)
values
  ('e1000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', (current_date - interval '20 days')::date, 'Brak finansowania', 510000.00, 20, 'maybe', 'Może wrócić pod koniec roku po dopłacie rządowej.');

-- 5. Zasilenie followupów (Followups) - Minimum 6 followupów
insert into public.followups (id, lead_id, offer_id, salesperson_id, due_date, status, priority, task_type, value_snapshot, notes)
values
  -- Followup 1: Powiązany z ofertą Zielińskich (OPEN)
  ('d1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', (current_date + interval '4 days')::date, 'open', 'high', 'call', 785000.00, 'Telefon kontrolny w sprawie zgody geodezyjnej i podpisania umowy w Warszawie.'),

  -- Followup 2: Powiązany z Nowakowami (OPEN)
  ('d1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', (current_date + interval '2 days')::date, 'open', 'medium', 'follow_up', 925000.00, 'Odpisanie na maila i omówienie nowego harmonogramu płatności.'),

  -- Followup 3: Powiązany z Magdaleną Woźniak (OPEN)
  ('d1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', (current_date + interval '1 day')::date, 'open', 'critical', 'negotiation', 1040000.00, 'Kluczowe połączenie: propozycja kompromisu na marży i potwierdzenie rezerwacji ekipy montażowej.'),

  -- Followup 4: Starszy wykonany followup dla Kowalskiego (DONE)
  ('d1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', (current_date - interval '18 days')::date, 'done', 'high', 'meeting', 742000.00, 'Spotkanie w biurze handlowym w celach uściślenia rysunków projektowych.'),

  -- Followup 5: Zaległy followup u Patryka Mazura (SNOOZED)
  ('d1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000010', 'e1000000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333', (current_date - interval '2 days')::date, 'snoozed', 'medium', 'call', 595000.00, 'Zadzwonić, gdy inwestor wróci z delegacji.'),

  -- Followup 6: Otwarty followup dla nowego leada bez oferty (OPEN)
  ('d1000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000003', null, '22222222-2222-2222-2222-222222222222', (current_date + interval '3 days')::date, 'open', 'low', 'call', 640000.00, 'Pierwszy kontakt głosowy, dopytanie o status działki i uzbrojenie mediów.');

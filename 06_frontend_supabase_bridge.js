// ADEZO OS 2.0 BUILD 002
// Frontend bridge example for existing V30 design.
// Replace CSV load() with Supabase JSON loaders.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'PASTE_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'PASTE_SUPABASE_ANON_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function loadAdezoData() {
  const [
    profileRes,
    leadsRes,
    offersRes,
    lostRes,
    followupsRes,
    salespeopleRes,
    modelsRes,
    marketingRes,
    kpiRes,
    moneyLeakRes,
    performanceRes
  ] = await Promise.all([
    supabase.from('profiles').select('*').limit(1),
    supabase.from('leads').select('*, models(name), salespeople(name)').order('created_at', { ascending: false }),
    supabase.from('offers').select('*, leads(client_name, phone, city), models(name), salespeople(name)').order('created_at', { ascending: false }),
    supabase.from('lost').select('*, leads(client_name), salespeople(name)').order('lost_date', { ascending: false }),
    supabase.from('followups').select('*, leads(client_name, phone, city), offers(value), salespeople(name)').order('due_date'),
    supabase.from('salespeople').select('*').order('name'),
    supabase.from('models').select('*').order('name'),
    supabase.from('marketing').select('*').order('date', { ascending: false }),
    supabase.from('v_ceo_kpi').select('*').single(),
    supabase.from('v_money_leak').select('*').single(),
    supabase.from('v_salesperson_performance').select('*')
  ]);

  const responses = [profileRes, leadsRes, offersRes, lostRes, followupsRes, salespeopleRes, modelsRes, marketingRes, kpiRes, moneyLeakRes, performanceRes];
  const firstError = responses.find(r => r.error)?.error;
  if (firstError) throw firstError;

  return {
    profile: profileRes.data?.[0] || null,
    leads: leadsRes.data || [],
    offers: offersRes.data || [],
    lost: lostRes.data || [],
    followups: followupsRes.data || [],
    salespeople: salespeopleRes.data || [],
    models: modelsRes.data || [],
    marketing: marketingRes.data || [],
    kpi: kpiRes.data || {},
    moneyLeak: moneyLeakRes.data || {},
    salespersonPerformance: performanceRes.data || []
  };
}

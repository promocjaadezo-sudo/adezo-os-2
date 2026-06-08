export type UserRole = "ceo" | "sales" | "admin";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Salesperson {
  id: string;
  profile_id: string | null;
  name: string;
  email: string | null;
  monthly_revenue_goal: number;
  monthly_lead_goal: number;
  monthly_offer_goal: number;
  is_active: boolean;
  created_at: string;
}

export interface Model {
  id: string;
  name: string;
  category: string | null;
  target_margin_pct: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  created_at: string;
  source_created_at: string | null;
  client_name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  postal_code: string | null;
  model_id: string | null;
  model_name_raw: string | null;
  source: string | null;
  salesperson_id: string | null;
  status: string;
  budget: number;
  lead_score: number | null;
  temperature: "hot" | "warm" | "cold" | null;
  notes: string | null;
  external_id: string | null;
  created_by: string | null;
  updated_at: string;
  models?: { name: string } | null;
  salespeople?: { name: string } | null;
}

export interface Offer {
  id: string;
  lead_id: string | null;
  created_at: string;
  offer_date: string | null;
  client_name_snapshot: string | null;
  model_id: string | null;
  salesperson_id: string | null;
  value: number;
  status: string;
  win_probability: number;
  next_contact_at: string | null;
  notes: string | null;
  external_id: string | null;
  updated_at: string;
  offer_number?: string | null;
  margin?: number | null;
  sent_at?: string | null;
  leads?: { client_name: string; phone: string | null; city: string | null } | null;
  models?: { name: string } | null;
  salespeople?: { name: string } | null;
}

export interface Lost {
  id: string;
  offer_id: string | null;
  lead_id: string | null;
  salesperson_id: string | null;
  lost_date: string;
  reason: string | null;
  lost_value: number;
  return_probability: number | null;
  will_return: string | null;
  notes: string | null;
  created_at: string;
  leads?: { client_name: string } | null;
  salespeople?: { name: string } | null;
}

export interface Followup {
  id: string;
  lead_id: string | null;
  offer_id: string | null;
  salesperson_id: string | null;
  due_date: string;
  status: "open" | "done" | "cancelled" | "snoozed";
  priority: "critical" | "high" | "medium" | "low";
  task_type: string;
  value_snapshot: number;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string | null;
  phone?: string | null;
  city?: string | null;
  offer_value?: number | null;
  salesperson_name?: string | null;
  leads?: { client_name: string; phone: string | null; city: string | null } | null;
  offers?: { value: number } | null;
  salespeople?: { name: string } | null;
}

export interface Marketing {
  id: string;
  date: string;
  source: string;
  campaign: string | null;
  cost: number;
  clicks: number;
  impressions: number;
  leads_count: number;
  notes: string | null;
  created_at: string;
}

export interface CeoKpi {
  closed_sales: number;
  active_pipeline: number;
  weighted_pipeline: number;
  total_leads: number;
  total_offers: number;
  dead_leads: number;
}

export interface MoneyLeak {
  lost_value: number;
  dead_leads_value: number;
  overdue_offers_value: number;
}

export interface SalespersonPerformance {
  id: string;
  name: string;
  monthly_revenue_goal: number;
  leads_count: number;
  offers_count: number;
  closed_sales: number;
  weighted_pipeline: number;
  dead_leads: number;
}

export interface AdezoData {
  profile: Profile | null;
  leads: Lead[];
  offers: Offer[];
  lost: Lost[];
  followups: Followup[];
  salespeople: Salesperson[];
  models: Model[];
  marketing: Marketing[];
  kpi: CeoKpi;
  moneyLeak: MoneyLeak;
  salespersonPerformance: SalespersonPerformance[];
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  description?: string;
}

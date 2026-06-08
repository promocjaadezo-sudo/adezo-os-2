import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdezoData,
  CeoKpi,
  Followup,
  Lead,
  MoneyLeak,
  Offer,
  SalespersonPerformance,
} from "./types";

async function safeQuery<T>(
  queryPromise: PromiseLike<{ data: T | null; error: unknown }>,
  fallbackValue: T,
  queryLabel: string
): Promise<T> {
  try {
    const { data, error } = await queryPromise;
    if (error) {
      const msg = error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
      console.warn(`[Supabase SafeQuery Warning] Failed to fetch ${queryLabel}:`, msg);
      return fallbackValue;
    }
    return data ?? fallbackValue;
  } catch (err) {
    console.error(`[Supabase SafeQuery Error] Unexpected exception for ${queryLabel}:`, err);
    return fallbackValue;
  }
}

function getSalespersonDisplayName(salesperson: Record<string, unknown>): string {
  const maybeName = salesperson.name;
  if (typeof maybeName === "string" && maybeName.length > 0) {
    return maybeName;
  }

  const maybeFullName = salesperson.full_name;
  if (typeof maybeFullName === "string" && maybeFullName.length > 0) {
    return maybeFullName;
  }

  const maybeEmail = salesperson.email;
  if (typeof maybeEmail === "string" && maybeEmail.length > 0) {
    return maybeEmail;
  }

  return "—";
}

function isWinningStatus(status: string | null | undefined): boolean {
  const normalized = (status ?? "").toLowerCase();
  return normalized.includes("wygr") || normalized.includes("won");
}

function isLosingStatus(status: string | null | undefined): boolean {
  const normalized = (status ?? "").toLowerCase();
  return normalized.includes("przegr") || normalized.includes("lost");
}

function attachSalespersonNames<T extends { salesperson_id: string | null; salespeople?: { name: string } | null }>(
  rows: T[],
  salespeopleById: Map<string, string>
): T[] {
  return rows.map((row) => {
    if (!row.salesperson_id) {
      return row;
    }

    const salespersonName = salespeopleById.get(row.salesperson_id);
    if (!salespersonName) {
      return row;
    }

    return {
      ...row,
      salespeople: { name: salespersonName },
    };
  });
}

function computeSalespersonPerformance(
  salespeopleRaw: Record<string, unknown>[],
  leads: Lead[],
  offers: Offer[]
): SalespersonPerformance[] {
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

  return salespeopleRaw.map((salesperson) => {
    const salespersonId = String(salesperson.id ?? "");
    const salespersonLeads = leads.filter((lead) => lead.salesperson_id === salespersonId);
    const salespersonOffers = offers.filter((offer) => offer.salesperson_id === salespersonId);

    const closedSales = salespersonOffers
      .filter((offer) => isWinningStatus(offer.status))
      .reduce((sum, offer) => sum + Number(offer.value ?? 0), 0);

    const weightedPipeline = salespersonOffers
      .filter((offer) => !isWinningStatus(offer.status) && !isLosingStatus(offer.status))
      .reduce(
        (sum, offer) => sum + (Number(offer.value ?? 0) * Number(offer.win_probability ?? 0)) / 100,
        0
      );

    const deadLeads = salespersonLeads.filter((lead) => {
      const createdAt = new Date(lead.created_at).getTime();
      const hasOffer = offers.some((offer) => offer.lead_id === lead.id);
      return createdAt < fourteenDaysAgo && !hasOffer;
    }).length;

    return {
      id: salespersonId,
      name: getSalespersonDisplayName(salesperson),
      monthly_revenue_goal: Number(salesperson.monthly_revenue_goal ?? 0),
      leads_count: salespersonLeads.length,
      offers_count: salespersonOffers.length,
      closed_sales: closedSales,
      weighted_pipeline: weightedPipeline,
      dead_leads: deadLeads,
    };
  });
}

export async function loadAdezoData(
  supabase: SupabaseClient
): Promise<AdezoData> {
  const [
    leadsRaw,
    offersRaw,
    lostRaw,
    followupsRaw,
    salespeopleRaw,
    modelsRaw,
    marketingRaw,
    kpiData,
    moneyLeakRaw,
  ] = await Promise.all([
    safeQuery(supabase.from("leads").select("*").order("created_at", { ascending: false }), [] as Record<string, unknown>[], "leads"),
    safeQuery(supabase.from("offers").select("*").order("created_at", { ascending: false }), [] as Record<string, unknown>[], "offers"),
    safeQuery(supabase.from("lost").select("*").order("lost_date", { ascending: false }), [] as Record<string, unknown>[], "lost"),
    safeQuery(supabase.from("followups").select("*"), [] as Record<string, unknown>[], "followups"),
    safeQuery(supabase.from("salespeople").select("*"), [] as Record<string, unknown>[], "salespeople"),
    safeQuery(supabase.from("models").select("*").order("name"), [] as Record<string, unknown>[], "models"),
    safeQuery(supabase.from("marketing").select("*").order("date", { ascending: false }), [] as Record<string, unknown>[], "marketing"),
    safeQuery(supabase.from("v_ceo_kpi").select("*").maybeSingle(), null as Record<string, unknown> | null, "v_ceo_kpi"),
    safeQuery(supabase.from("v_money_leak").select("*").maybeSingle(), null as Record<string, unknown> | null, "v_money_leak"),
  ]);

  const profile = null;

  // Budowanie map indeksowych produktów (models), kontaktów (leads) oraz ofert (offers) dla łączenia w pamięci
  const modelsById = new Map<string, Record<string, unknown>>(
    modelsRaw.map((m) => [String(m.id ?? ""), m])
  );

  const leadsById = new Map<string, Record<string, unknown>>(
    leadsRaw.map((l) => [String(l.id ?? ""), l])
  );

  const offersById = new Map<string, Record<string, unknown>>(
    offersRaw.map((o) => [String(o.id ?? ""), o])
  );

  // Rekonstrukcja relacji Lead -> Model
  const resolvedLeads = leadsRaw.map((l) => {
    const modelObj = l.model_id ? modelsById.get(String(l.model_id)) : null;
    const modelName = modelObj && typeof modelObj.name === "string" ? modelObj.name : "";
    return {
      ...l,
      models: l.model_id ? { name: modelName || String(l.model_name_raw || "") } : null,
    };
  }) as unknown as Lead[];

  // Rekonstrukcja relacji Offer -> Lead, Model
  const resolvedOffers = offersRaw.map((o) => {
    const l = o.lead_id ? leadsById.get(String(o.lead_id)) : null;
    const modelObj = o.model_id ? modelsById.get(String(o.model_id)) : null;
    const modelName = modelObj && typeof modelObj.name === "string" ? modelObj.name : "";
    return {
      ...o,
      models: o.model_id ? { name: modelName } : null,
      leads: l ? { client_name: String(l.client_name ?? ""), phone: l.phone ? String(l.phone) : null, city: l.city ? String(l.city) : null } : null,
    };
  }) as unknown as Offer[];

  // Rekonstrukcja relacji Lost -> Lead
  const resolvedLost = lostRaw.map((lostItem) => {
    const l = lostItem.lead_id ? leadsById.get(String(lostItem.lead_id)) : null;
    return {
      ...lostItem,
      leads: l ? { client_name: String(l.client_name ?? "") } : null,
    };
  }) as unknown as AdezoData["lost"];

  // Rekonstrukcja relacji Followup -> Lead, Offer
  const resolvedFollowups = followupsRaw.map((f) => {
    const l = f.lead_id ? leadsById.get(String(f.lead_id)) : null;
    const o = f.offer_id ? offersById.get(String(f.offer_id)) : null;
    return {
      ...f,
      leads: l ? { client_name: String(l.client_name ?? ""), phone: l.phone ? String(l.phone) : null, city: l.city ? String(l.city) : null } : null,
      offers: o ? { value: Number(o.value ?? 0) } : null,
      // Spłaszczone pola pomocnicze, używane w UI
      client_name: l ? String(l.client_name ?? "") : null,
      phone: l && l.phone ? String(l.phone) : null,
      city: l && l.city ? String(l.city) : null,
      offer_value: o ? Number(o.value ?? 0) : null,
    };
  }) as unknown as Followup[];

  const salespeopleById = new Map<string, string>(
    salespeopleRaw
      .map((salesperson) => [String(salesperson.id ?? ""), getSalespersonDisplayName(salesperson)] as const)
      .filter(([id]) => id.length > 0)
  );

  const leads = attachSalespersonNames(resolvedLeads, salespeopleById);
  const offers = attachSalespersonNames(resolvedOffers, salespeopleById);
  const lost = attachSalespersonNames(resolvedLost, salespeopleById);
  const followups = attachSalespersonNames(resolvedFollowups, salespeopleById).sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
  const salespersonPerformance = computeSalespersonPerformance(salespeopleRaw, leads, offers);

  // Rekonstrukcja dynamicznych KPI i wycieków pieniężnych bezpośrednio w pamięci aplikacji dla niezrównanej precyzji w czasie rzeczywistym
  const dynamicClosedSales = resolvedOffers
    .filter((o) => isWinningStatus(o.status))
    .reduce((sum, o) => sum + Number(o.value ?? 0), 0);

  const dynamicActiveOffers = resolvedOffers
    .filter((o) => !isWinningStatus(o.status) && !isLosingStatus(o.status));

  const dynamicActivePipeline = dynamicActiveOffers
    .reduce((sum, o) => sum + Number(o.value ?? 0), 0);

  const dynamicWeightedPipeline = dynamicActiveOffers
    .reduce((sum, o) => sum + (Number(o.value ?? 0) * Number(o.win_probability ?? 0)) / 100, 0);

  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const leadsWithOffers = new Set(resolvedOffers.map((o) => o.lead_id).filter(Boolean));
  const dynamicDeadLeadsCount = resolvedLeads.filter((l) => {
    const created = new Date(l.created_at).getTime();
    return created < fourteenDaysAgo && !leadsWithOffers.has(l.id);
  }).length;

  const kpi: CeoKpi = {
    closed_sales: dynamicClosedSales || Number(kpiData?.closed_sales ?? 0),
    active_pipeline: dynamicActivePipeline || Number(kpiData?.active_pipeline ?? 0),
    weighted_pipeline: dynamicWeightedPipeline || Number(kpiData?.weighted_pipeline ?? 0),
    total_leads: resolvedLeads.length || Number(kpiData?.total_leads ?? 0),
    total_offers: resolvedOffers.length || Number(kpiData?.total_offers ?? 0),
    dead_leads: dynamicDeadLeadsCount || Number(kpiData?.dead_leads ?? 0),
  };

  // Dynamic Money Leak
  const todayStr = new Date().toISOString().split("T")[0];
  const dynamicLostValue = resolvedOffers
    .filter((o) => isLosingStatus(o.status))
    .reduce((sum, o) => sum + Number(o.value ?? 0), 0) + 
    lostRaw.reduce((sum, l) => sum + Number(l.lost_value ?? 0), 0);

  const dynamicDeadLeadsValue = resolvedLeads
    .filter((l) => !leadsWithOffers.has(l.id) && new Date(l.created_at).getTime() < fourteenDaysAgo)
    .reduce((sum, l) => sum + Number(l.budget ?? 0), 0);

  const dynamicOverdueOffersValue = resolvedOffers
    .filter((o) => !isWinningStatus(o.status) && !isLosingStatus(o.status) && o.next_contact_at && o.next_contact_at < todayStr)
    .reduce((sum, o) => sum + Number(o.value ?? 0), 0);

  const moneyLeak: MoneyLeak = {
    lost_value: dynamicLostValue || Number(moneyLeakRaw?.lost_value ?? 0),
    dead_leads_value: dynamicDeadLeadsValue || Number(moneyLeakRaw?.dead_leads_value ?? 0),
    overdue_offers_value: dynamicOverdueOffersValue || Number(moneyLeakRaw?.overdue_offers_value ?? 0),
  };

  return {
    profile: profile as unknown as AdezoData["profile"],
    leads,
    offers,
    lost,
    followups,
    salespeople: salespeopleRaw as unknown as AdezoData["salespeople"],
    models: modelsRaw as unknown as AdezoData["models"],
    marketing: marketingRaw as unknown as AdezoData["marketing"],
    kpi,
    moneyLeak,
    salespersonPerformance,
  };
}

export function getDeadLeads(leads: Lead[], offers: Offer[]): Lead[] {
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const leadsWithOffers = new Set(
    offers.map((o) => o.lead_id).filter(Boolean)
  );

  return leads.filter((lead) => {
    const created = new Date(lead.created_at).getTime();
    return created < fourteenDaysAgo && !leadsWithOffers.has(lead.id);
  });
}

export function computeCeoScore(kpi: CeoKpi, moneyLeak: MoneyLeak): number {
  const activePipeline = Number(kpi?.active_pipeline ?? 0);
  const weightedPipeline = Number(kpi?.weighted_pipeline ?? 0);
  const totalLeads = Number(kpi?.total_leads ?? 0);
  const totalOffers = Number(kpi?.total_offers ?? 0);
  const deadLeads = Number(kpi?.dead_leads ?? 0);
  const closedSales = Number(kpi?.closed_sales ?? 0);
  const lostValue = Number(moneyLeak?.lost_value ?? 0);
  const deadLeadsValue = Number(moneyLeak?.dead_leads_value ?? 0);

  const pipelineRatio =
    activePipeline > 0
      ? (weightedPipeline / activePipeline) * 100
      : 0;
  const conversionRate =
    totalLeads > 0
      ? (totalOffers / totalLeads) * 100
      : 0;
  const deadLeadPenalty =
    totalLeads > 0 ? (deadLeads / totalLeads) * 100 : 0;
  const leakRatio =
    closedSales + activePipeline > 0
      ? ((lostValue + deadLeadsValue) /
          (closedSales + activePipeline)) *
        100
      : 0;

  const score =
    pipelineRatio * 0.25 +
    conversionRate * 0.25 +
    (100 - deadLeadPenalty) * 0.25 +
    (100 - Math.min(leakRatio, 100)) * 0.25;

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function getOpenFollowups(followups: Followup[]): Followup[] {
  return followups.filter((f) => f.status === "open");
}

export function getOverdueFollowups(followups: Followup[]): Followup[] {
  const today = new Date().toISOString().split("T")[0];
  return followups.filter(
    (f) => f.status === "open" && f.due_date < today
  );
}

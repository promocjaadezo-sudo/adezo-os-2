import type { AdezoData, Followup, Lead, Offer } from "@/lib/types";

export type AlertSeverity = "danger" | "warning" | "gold";

export interface OwnerAlert {
  title: string;
  description: string;
  severity: AlertSeverity;
  metric: string;
}

export interface MagdaTask {
  id: string;
  due_date: string;
  client_name: string;
  task_type: string;
  priority: Followup["priority"];
  owner: string;
}

export interface DailyTrendPoint {
  date: string;
  leads: number;
  offers: number;
  followups: number;
  overdue: number;
}

export interface Build009Snapshot {
  ceoScore: number;
  hotLeads: Lead[];
  leadsWithoutContact: Lead[];
  offersWithoutFollowup: Offer[];
  tasksForMagdas: MagdaTask[];
  dailyOpenFollowups: Followup[];
  dailyOverdueFollowups: Followup[];
  dailyNewLeads: Lead[];
  dailyActiveOffers: Offer[];
  dailyTrend: DailyTrendPoint[];
  ownerAlerts: OwnerAlert[];
  monthlyGoal: number;
  closedSales: number;
  weightedPipeline: number;
  projectedRevenue: number;
  forecastGap: number;
  forecastAchievementPct: number;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
}

function isClosedOfferStatus(status: string | null | undefined): boolean {
  const normalized = normalizeText(status);
  return normalized.includes("wygr") || normalized.includes("przegr") || normalized.includes("won") || normalized.includes("lost");
}

function isLeadClosedStatus(status: string | null | undefined): boolean {
  const normalized = normalizeText(status);
  return normalized.includes("wygr") || normalized.includes("odrz") || normalized.includes("disq") || normalized.includes("przegr");
}

function getTodayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  const now = new Date();

  for (let index = n - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
}

function getFollowupOwnerName(followup: Followup): string {
  if (followup.salespeople?.name) {
    return followup.salespeople.name;
  }

  if (followup.salesperson_name) {
    return followup.salesperson_name;
  }

  return "Zespół";
}

export function createBuild009Snapshot(data: AdezoData, ceoScore: number): Build009Snapshot {
  const today = getTodayIsoDate();
  const trendDates = getLastNDates(7);

  const activeLeads = data.leads.filter((lead) => !isLeadClosedStatus(lead.status));
  const activeOffers = data.offers.filter((offer) => !isClosedOfferStatus(offer.status));

  const hotLeads = activeLeads
    .filter((lead) => lead.temperature === "hot")
    .sort((a, b) => Number(b.budget ?? 0) - Number(a.budget ?? 0))
    .slice(0, 12);

  const leadsWithoutContact = activeLeads
    .filter((lead) => !data.followups.some((followup) => followup.lead_id === lead.id))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 12);

  const offersWithoutFollowup = activeOffers
    .filter(
      (offer) =>
        !data.followups.some(
          (followup) =>
            followup.offer_id === offer.id ||
            (offer.lead_id && followup.lead_id === offer.lead_id)
        )
    )
    .sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0))
    .slice(0, 12);

  const dailyOpenFollowups = data.followups
    .filter((followup) => followup.status === "open" && followup.due_date === today)
    .sort((a, b) => Number(b.value_snapshot ?? 0) - Number(a.value_snapshot ?? 0));

  const dailyOverdueFollowups = data.followups
    .filter((followup) => followup.status === "open" && followup.due_date < today)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const dailyNewLeads = activeLeads.filter((lead) => lead.created_at.startsWith(today));

  const dailyActiveOffers = activeOffers.filter((offer) => {
    const createdToday = offer.created_at.startsWith(today);
    const sentToday = typeof offer.sent_at === "string" && offer.sent_at.startsWith(today);
    const offerDateToday = typeof offer.offer_date === "string" && offer.offer_date.startsWith(today);
    return createdToday || sentToday || offerDateToday;
  });

  const dailyTrend = trendDates.map((date) => {
    const leads = activeLeads.filter((lead) => lead.created_at.startsWith(date)).length;

    const offers = activeOffers.filter((offer) => {
      const createdToday = offer.created_at.startsWith(date);
      const sentToday = typeof offer.sent_at === "string" && offer.sent_at.startsWith(date);
      const offerDateToday = typeof offer.offer_date === "string" && offer.offer_date.startsWith(date);
      return createdToday || sentToday || offerDateToday;
    }).length;

    const followups = data.followups.filter(
      (followup) => followup.status === "open" && followup.due_date === date
    ).length;

    const overdue = data.followups.filter(
      (followup) => followup.status === "open" && followup.due_date < date
    ).length;

    return {
      date: date.slice(5),
      leads,
      offers,
      followups,
      overdue,
    };
  });

  const tasksForMagdas = data.followups
    .filter((followup) => {
      if (followup.status !== "open") {
        return false;
      }

      const owner = getFollowupOwnerName(followup);
      return normalizeText(owner).includes("magda");
    })
    .map((followup) => ({
      id: followup.id,
      due_date: followup.due_date,
      client_name: followup.client_name ?? followup.leads?.client_name ?? "—",
      task_type: followup.task_type,
      priority: followup.priority,
      owner: getFollowupOwnerName(followup),
    }))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 14);

  const monthlyGoal = Math.max(
    1,
    data.salespeople.reduce((sum, salesperson) => sum + Number(salesperson.monthly_revenue_goal ?? 0), 0)
  );
  const closedSales = Number(data.kpi.closed_sales ?? 0);
  const weightedPipeline = Number(data.kpi.weighted_pipeline ?? 0);
  const projectedRevenue = closedSales + weightedPipeline * 0.65;
  const forecastGap = Math.max(0, monthlyGoal - projectedRevenue);
  const forecastAchievementPct = Math.min(100, (projectedRevenue / monthlyGoal) * 100);

  const ownerAlerts: OwnerAlert[] = [];

  if (dailyOverdueFollowups.length > 0) {
    ownerAlerts.push({
      title: "Przeterminowane działania follow-up",
      description: "Otwarte zadania po terminie mogą obniżyć konwersję i CEO Score.",
      severity: "danger",
      metric: `${dailyOverdueFollowups.length} zadań`,
    });
  }

  if (offersWithoutFollowup.length > 0) {
    ownerAlerts.push({
      title: "Oferty bez następnego kroku",
      description: "Brak follow-upu po wysłaniu oferty zwiększa ryzyko utraty sprzedaży.",
      severity: "warning",
      metric: `${offersWithoutFollowup.length} ofert`,
    });
  }

  if (leadsWithoutContact.length > 0) {
    ownerAlerts.push({
      title: "Leady bez pierwszego kontaktu",
      description: "Nowe leady bez reakcji zespołu sprzedaży generują wyciek przychodów.",
      severity: "warning",
      metric: `${leadsWithoutContact.length} leadów`,
    });
  }

  if (forecastAchievementPct < 75) {
    ownerAlerts.push({
      title: "Forecast miesiąca poniżej celu",
      description: "Wymagane działania ownera: priorytetyzacja HOT leadów i zamknięć.",
      severity: "gold",
      metric: `${forecastAchievementPct.toFixed(0)}% celu`,
    });
  }

  if (ownerAlerts.length === 0) {
    ownerAlerts.push({
      title: "System operacyjny sprzedaży stabilny",
      description: "Brak krytycznych alertów. Możesz skupić się na skali i marży.",
      severity: "gold",
      metric: "Status GREEN",
    });
  }

  return {
    ceoScore,
    hotLeads,
    leadsWithoutContact,
    offersWithoutFollowup,
    tasksForMagdas,
    dailyOpenFollowups,
    dailyOverdueFollowups,
    dailyNewLeads,
    dailyActiveOffers,
    dailyTrend,
    ownerAlerts,
    monthlyGoal,
    closedSales,
    weightedPipeline,
    projectedRevenue,
    forecastGap,
    forecastAchievementPct,
  };
}

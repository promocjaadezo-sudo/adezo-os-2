import type {
  CampaignDerivedMetrics,
  CampaignEntity,
  LeadEntity,
  LeadTemperature,
  OfferEntity,
  OfferStatus,
} from "./types";

export function calculateLeadScore(lead: LeadEntity): number {
  let score = 0;
  if (lead.budget >= 30000) score += 35;
  else if (lead.budget >= 20000) score += 20;
  else score += 10;

  if (lead.source === "architect" || lead.source === "client_referral") score += 25;
  else if (lead.source === "meta" || lead.source === "google") score += 15;
  else score += 10;

  if (lead.phone) score += 10;
  if (lead.email) score += 10;

  if (lead.status === "qualified" || lead.status === "offer_needed") score += 20;

  return Math.min(100, score);
}

export function calculateLeadTemperature(score: number): LeadTemperature {
  if (score >= 70) return "HOT";
  if (score >= 45) return "WARM";
  return "COLD";
}

export function calculateCampaignRoi(metrics: CampaignDerivedMetrics): {
  roas: number;
  cpl: number;
  cps: number;
  hotLeadRate: number;
} {
  const roas = metrics.revenue / Math.max(1, metrics.cost);
  const cpl = metrics.cost / Math.max(1, metrics.leads);
  const cps = metrics.cost / Math.max(1, metrics.sales);
  const hotLeadRate = metrics.hotLeads / Math.max(1, metrics.leads) * 100;
  return { roas, cpl, cps, hotLeadRate };
}

export function calculateOfferAging(offer: OfferEntity, referenceDate = new Date()): number {
  const baseDate = offer.sentAt ?? offer.createdAt;
  const created = new Date(baseDate).getTime();
  const now = referenceDate.getTime();
  return Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
}

export function calculateForecast(offers: OfferEntity[]): {
  sold: number;
  weightedOpen: number;
  forecast: number;
} {
  const sold = offers.filter((offer) => offer.status === "won").reduce((sum, offer) => sum + offer.value, 0);
  const weightedOpen = offers
    .filter((offer) => offer.status !== "won" && offer.status !== "lost")
    .reduce((sum, offer) => sum + offer.value * offer.winProbability, 0);

  const forecast = Math.round((sold + weightedOpen) / 1000) * 1000;
  return { sold, weightedOpen: Math.round(weightedOpen), forecast };
}

export function calculateRevenueGap(plan: number, forecast: number): number {
  return Math.max(0, plan - forecast);
}

export function calculateDataCompleteness<T extends object>(entity: T, requiredFields: Array<keyof T>): {
  completenessPct: number;
  missingFields: Array<keyof T>;
} {
  const missingFields = requiredFields.filter((field) => {
    const value = entity[field as keyof T];
    return value === undefined || value === null || value === "";
  });

  const completenessPct = Math.round((1 - missingFields.length / Math.max(1, requiredFields.length)) * 100);
  return { completenessPct, missingFields };
}

export function buildNextBestAction(input: {
  lead?: LeadEntity;
  offer?: OfferEntity;
  campaign?: CampaignEntity;
  campaignRoi?: { roas: number; cpl: number; hotLeadRate: number; sales: number };
  agingDays?: number;
}): string {
  if (input.campaign && input.campaignRoi) {
    if (input.campaignRoi.roas > 5) return "Skaluj kampanię o +15% budżetu.";
    if (input.campaignRoi.cpl > 300 && input.campaignRoi.sales === 0) return "Wstrzymaj kampanię i popraw target.";
    if (input.campaignRoi.hotLeadRate < 10) return "Popraw grupę odbiorców i kreację pod HOT intent.";
    return "Obserwuj kampanię i utrzymaj testy A/B.";
  }

  if (input.offer) {
    const aging = input.agingDays ?? calculateOfferAging(input.offer);
    if (aging > 3 && input.offer.status !== "won" && input.offer.status !== "lost") {
      return "Wykonaj follow-up oferty dziś i ustaw datę decyzji.";
    }
    if (input.offer.status === "measurement_done") {
      return "Telefon po pomiarze w oknie 24h.";
    }
    return "Podtrzymaj kontakt i monitoruj status oferty.";
  }

  if (input.lead) {
    const score = input.lead.score ?? calculateLeadScore(input.lead);
    const temperature = input.lead.temperature ?? calculateLeadTemperature(score);
    if (temperature === "HOT") return "Kontakt telefoniczny < 2h.";
    if (temperature === "WARM") return "Kwalifikacja potrzeb i budżetu dzisiaj.";
    return "Sekwencja nurture i ponowny kontakt w 48h.";
  }

  return "Brak danych do rekomendacji.";
}

export function isOfferOpen(status: OfferStatus): boolean {
  return status !== "won" && status !== "lost";
}

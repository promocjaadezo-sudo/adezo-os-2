import type { OperatingDataStore } from "@/lib/operating-model/types";
import type { DataProviderStatus } from "@/lib/providers/data-provider";
import type { RevenueTruthSnapshot } from "@/lib/revenue-truth-layer";

export type BriefPriority = "critical" | "high" | "medium";

export type BriefRuleCode =
  | "PLAN_GAP"
  | "CAMPAIGN_COST_NO_SALES"
  | "HOT_LEAD_NO_CONTACT"
  | "OFFER_FOLLOWUP_DELAY"
  | "HIGH_VALUE_VISIBILITY"
  | "CRM_DATA_INCOMPLETE"
  | "TIRANA_LEADS_NO_SALES";

export interface BriefRuleFinding {
  code: BriefRuleCode;
  priority: BriefPriority;
  title: string;
  details: string;
  owners: Array<"CEO" | "Magda 1" | "Magda 2" | "Marketing">;
  dataSources: Array<"GA4" | "Google Ads" | "Excel CRM" | "Revenue Truth Layer">;
  evidence: {
    count?: number;
    amount?: number;
    ids?: string[];
  };
}

function hoursSince(value?: string): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

function daysSince(value?: string): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
}

export function evaluateBriefPriorityRules(input: {
  truth: RevenueTruthSnapshot;
  store: OperatingDataStore;
  providerStatus: DataProviderStatus;
}): BriefRuleFinding[] {
  const { truth, store, providerStatus } = input;
  const findings: BriefRuleFinding[] = [];

  if (truth.summary.plan > 0 && truth.summary.revenue < truth.summary.plan) {
    findings.push({
      code: "PLAN_GAP",
      priority: "critical",
      title: "Forecast poniżej planu",
      details: `Do planu brakuje ${truth.summary.gapToPlan.toLocaleString("pl-PL")} zł.`,
      owners: ["CEO", "Marketing", "Magda 1", "Magda 2"],
      dataSources: ["Revenue Truth Layer", "Excel CRM"],
      evidence: { amount: truth.summary.gapToPlan },
    });
  }

  const costNoSales = truth.rows.filter((row) => row.cost > 0 && row.sales <= 0);
  if (costNoSales.length > 0) {
    findings.push({
      code: "CAMPAIGN_COST_NO_SALES",
      priority: "critical",
      title: "Kampanie wydają budżet bez sprzedaży",
      details: `Wykryto ${costNoSales.length} kampanii z kosztem bez sprzedaży.`,
      owners: ["Marketing", "CEO"],
      dataSources: ["Google Ads", "Revenue Truth Layer"],
      evidence: {
        count: costNoSales.length,
        amount: costNoSales.reduce((sum, row) => sum + row.cost, 0),
        ids: costNoSales.map((row) => row.campaignName),
      },
    });
  }

  const hotLeadsNoContact = store.leads.filter((lead) => {
    const isHot = lead.temperature === "HOT";
    const lagHours = hoursSince(lead.lastContactAt || lead.createdAt);
    return isHot && lagHours > 2;
  });
  if (hotLeadsNoContact.length > 0) {
    findings.push({
      code: "HOT_LEAD_NO_CONTACT",
      priority: "critical",
      title: "HOT lead bez kontaktu",
      details: `${hotLeadsNoContact.length} HOT leadów czeka na kontakt >2h.`,
      owners: ["Magda 1", "Magda 2"],
      dataSources: ["Excel CRM", "Revenue Truth Layer"],
      evidence: { count: hotLeadsNoContact.length, ids: hotLeadsNoContact.map((lead) => lead.id) },
    });
  }

  const offersNoFollowup = store.offers.filter((offer) => {
    const isOpen = offer.status !== "won" && offer.status !== "lost";
    const lagDays = daysSince(offer.lastFollowupAt || offer.sentAt || offer.createdAt);
    return isOpen && lagDays > 3;
  });
  if (offersNoFollowup.length > 0) {
    findings.push({
      code: "OFFER_FOLLOWUP_DELAY",
      priority: "high",
      title: "Oferty bez follow-up > 3 dni",
      details: `${offersNoFollowup.length} ofert wymaga pilnego follow-upu.`,
      owners: ["Magda 1", "Magda 2"],
      dataSources: ["Excel CRM", "Revenue Truth Layer"],
      evidence: { count: offersNoFollowup.length, ids: offersNoFollowup.map((offer) => offer.id) },
    });
  }

  const highValueLeads = store.leads.filter((lead) => lead.budget > 30000).length;
  const highValueOffers = store.offers.filter((offer) => offer.value > 30000 && offer.status !== "lost").length;
  const highValueCount = highValueLeads + highValueOffers;
  if (highValueCount > 0) {
    findings.push({
      code: "HIGH_VALUE_VISIBILITY",
      priority: "high",
      title: "Wysokowartościowe okazje > 30 000 zł",
      details: `${highValueCount} szans wymaga widoczności CEO.`,
      owners: ["CEO"],
      dataSources: ["Excel CRM", "Revenue Truth Layer"],
      evidence: { count: highValueCount },
    });
  }

  if (providerStatus.incompleteRows > 0 || providerStatus.incompleteFields > 0) {
    findings.push({
      code: "CRM_DATA_INCOMPLETE",
      priority: "high",
      title: "CRM DATA INCOMPLETE",
      details: `${providerStatus.incompleteRows} wierszy i ${providerStatus.incompleteFields} pól wymaga uzupełnienia.`,
      owners: ["Magda 1", "Magda 2", "CEO"],
      dataSources: ["Excel CRM", "Revenue Truth Layer"],
      evidence: {
        count: providerStatus.incompleteRows,
        amount: providerStatus.incompleteFields,
      },
    });
  }

  const tiranaNoSales = truth.rows.filter(
    (row) => row.campaignName.toLowerCase().includes("tirana") && row.leads > 0 && row.sales <= 0,
  );
  if (tiranaNoSales.length > 0) {
    findings.push({
      code: "TIRANA_LEADS_NO_SALES",
      priority: "high",
      title: "Tirana generuje leady bez sprzedaży",
      details: `Wykryto ${tiranaNoSales.length} kampanii Tirana do review oferty/follow-up.`,
      owners: ["Marketing", "Magda 1", "Magda 2", "CEO"],
      dataSources: ["GA4", "Google Ads", "Excel CRM", "Revenue Truth Layer"],
      evidence: {
        count: tiranaNoSales.length,
        ids: tiranaNoSales.map((row) => row.campaignName),
      },
    });
  }

  return findings.sort((left, right) => {
    const rank = { critical: 0, high: 1, medium: 2 };
    return rank[left.priority] - rank[right.priority];
  });
}

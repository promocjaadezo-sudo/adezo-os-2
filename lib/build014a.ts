export type SalesOwner = "Magda 1" | "Magda 2";

export interface DisciplineLead {
  id: string;
  owner: SalesOwner;
  clientName: string;
  leadSource?: string | null;
  leadTemperature?: "HOT" | "WARM" | "COLD" | null;
  investmentStage?: "projekt" | "stan surowy" | "wykończenie" | "remont" | null;
  nextStepDate?: string | null;
  commissionStatus?: "eligible" | "pending" | "blocked" | null;
}

export interface IncompleteLeadRecord extends DisciplineLead {
  missingFields: string[];
  dataIncomplete: boolean;
  inForecast: boolean;
  inCommission: boolean;
  briefReady: boolean;
  salespersonMessage: string;
}

export interface Build014ASnapshot {
  leads: IncompleteLeadRecord[];
  totals: {
    complete: number;
    incomplete: number;
  };
  byOwner: Array<{
    owner: SalesOwner;
    total: number;
    incomplete: number;
    dataQualityScore: number;
    briefReady: boolean;
    commissionReady: boolean;
  }>;
  missingFieldStats: Array<{ field: string; count: number }>;
  commissionReadiness: {
    ready: boolean;
    blockedLeads: number;
  };
  briefReadiness: {
    ready: boolean;
    blockedOwners: SalesOwner[];
  };
}

const REQUIRED_FIELDS: Array<keyof Pick<
  DisciplineLead,
  "leadSource" | "leadTemperature" | "investmentStage" | "nextStepDate" | "commissionStatus"
>> = ["leadSource", "leadTemperature", "investmentStage", "nextStepDate", "commissionStatus"];

const MOCK_LEADS: DisciplineLead[] = [
  {
    id: "DD-001",
    owner: "Magda 1",
    clientName: "Kamil Nowak",
    leadSource: "Google Ads",
    leadTemperature: "HOT",
    investmentStage: "wykończenie",
    nextStepDate: "2026-06-09",
    commissionStatus: "eligible",
  },
  {
    id: "DD-002",
    owner: "Magda 1",
    clientName: "Anna Zaremba",
    leadSource: "Meta Ads",
    leadTemperature: "WARM",
    investmentStage: "stan surowy",
    nextStepDate: null,
    commissionStatus: "pending",
  },
  {
    id: "DD-003",
    owner: "Magda 1",
    clientName: "Michał Bąk",
    leadSource: null,
    leadTemperature: "HOT",
    investmentStage: "projekt",
    nextStepDate: "2026-06-10",
    commissionStatus: "blocked",
  },
  {
    id: "DD-004",
    owner: "Magda 2",
    clientName: "Joanna Kłos",
    leadSource: "Google Ads",
    leadTemperature: "HOT",
    investmentStage: "remont",
    nextStepDate: "2026-06-08",
    commissionStatus: "eligible",
  },
  {
    id: "DD-005",
    owner: "Magda 2",
    clientName: "Rafał Pietrzak",
    leadSource: "Meta Ads",
    leadTemperature: null,
    investmentStage: "stan surowy",
    nextStepDate: null,
    commissionStatus: "pending",
  },
  {
    id: "DD-006",
    owner: "Magda 2",
    clientName: "Alicja Wrona",
    leadSource: "Referral",
    leadTemperature: "WARM",
    investmentStage: "wykończenie",
    nextStepDate: "2026-06-11",
    commissionStatus: "eligible",
  },
];

const FIELD_LABELS: Record<string, string> = {
  leadSource: "lead source",
  leadTemperature: "lead temperature",
  investmentStage: "investment stage",
  nextStepDate: "next step date",
  commissionStatus: "commission status",
};

function getMissingFields(lead: DisciplineLead): string[] {
  return REQUIRED_FIELDS.filter((field) => !lead[field]).map((field) => FIELD_LABELS[field]);
}

function createSalesMessage(missingFields: string[]): string {
  if (missingFields.length === 0) return "Lead kompletny. Wchodzi do planu, briefu i prowizji.";
  return `Nie mogę policzyć Twojej premii ani wygenerować pełnego Daily Brief, bo ten lead ma braki danych. Uzupełnij pola, a system doda go do planu sprzedaży. Brakuje: ${missingFields.join(", ")}.`;
}

export function createBuild014ASnapshot(): Build014ASnapshot {
  const leads: IncompleteLeadRecord[] = MOCK_LEADS.map((lead) => {
    const missingFields = getMissingFields(lead);
    const dataIncomplete = missingFields.length > 0;

    return {
      ...lead,
      missingFields,
      dataIncomplete,
      inForecast: !dataIncomplete,
      inCommission: !dataIncomplete,
      briefReady: !dataIncomplete,
      salespersonMessage: createSalesMessage(missingFields),
    };
  });

  const complete = leads.filter((lead) => !lead.dataIncomplete).length;
  const incomplete = leads.filter((lead) => lead.dataIncomplete).length;

  const owners: SalesOwner[] = ["Magda 1", "Magda 2"];
  const byOwner = owners.map((owner) => {
    const ownerLeads = leads.filter((lead) => lead.owner === owner);
    const ownerIncomplete = ownerLeads.filter((lead) => lead.dataIncomplete).length;
    const dataQualityScore = ownerLeads.length === 0 ? 100 : Math.round(((ownerLeads.length - ownerIncomplete) / ownerLeads.length) * 100);

    return {
      owner,
      total: ownerLeads.length,
      incomplete: ownerIncomplete,
      dataQualityScore,
      briefReady: ownerIncomplete === 0,
      commissionReady: ownerIncomplete === 0,
    };
  });

  const missingFieldCounter = new Map<string, number>();
  leads.forEach((lead) => {
    lead.missingFields.forEach((field) => {
      missingFieldCounter.set(field, (missingFieldCounter.get(field) ?? 0) + 1);
    });
  });

  const missingFieldStats = Array.from(missingFieldCounter.entries())
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count);

  const commissionReadiness = {
    ready: incomplete === 0,
    blockedLeads: incomplete,
  };

  const blockedOwners = byOwner.filter((owner) => !owner.briefReady).map((owner) => owner.owner);
  const briefReadiness = {
    ready: blockedOwners.length === 0,
    blockedOwners,
  };

  return {
    leads,
    totals: { complete, incomplete },
    byOwner,
    missingFieldStats,
    commissionReadiness,
    briefReadiness,
  };
}

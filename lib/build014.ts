export type ActionPriority = "highest" | "high" | "medium" | "low";
export type ActionOwner = "Magda 1" | "Magda 2";

export interface ActionLead {
  id: string;
  clientName: string;
  owner: ActionOwner;
  temperature: "HOT" | "WARM" | "COLD";
  model: "Tirana" | "Astana" | "Chaga" | "Waleta";
  budget: number;
  campaignSource: string;
  lastContactHoursAgo: number;
  offerLastFollowupDaysAgo: number | null;
  hasOffer: boolean;
  hasCompetitorQuote: boolean;
}

export interface DailyDecisionTask {
  id: string;
  owner: ActionOwner;
  clientName: string;
  whyNow: string;
  callGoal: string;
  nextStatusToClick: "called" | "followup_scheduled" | "offer_sent" | "recovered";
  priority: ActionPriority;
  type: "immediate_call" | "followup" | "recovery" | "ceo_priority";
}

export interface Build014Snapshot {
  leads: ActionLead[];
  dailyTasks: DailyDecisionTask[];
  immediateCalls: DailyDecisionTask[];
  followupTasks: DailyDecisionTask[];
  recoveryTasks: DailyDecisionTask[];
  overdueOwners: Array<{ owner: ActionOwner; overdueCount: number }>;
  activitySummary: Array<{ owner: ActionOwner; actionsDoneToday: number; callsDone: number; followupsDone: number }>;
}

const MOCK_LEADS: ActionLead[] = [
  {
    id: "MA-001",
    clientName: "Kamil Nowak",
    owner: "Magda 1",
    temperature: "HOT",
    model: "Tirana",
    budget: 42000,
    campaignSource: "Google Ads - Tirana High Intent",
    lastContactHoursAgo: 4,
    offerLastFollowupDaysAgo: 4,
    hasOffer: true,
    hasCompetitorQuote: true,
  },
  {
    id: "MA-002",
    clientName: "Anna Zaremba",
    owner: "Magda 2",
    temperature: "HOT",
    model: "Astana",
    budget: 36000,
    campaignSource: "Meta Ads - Astana",
    lastContactHoursAgo: 3,
    offerLastFollowupDaysAgo: 1,
    hasOffer: true,
    hasCompetitorQuote: false,
  },
  {
    id: "MA-003",
    clientName: "Michał Bąk",
    owner: "Magda 1",
    temperature: "WARM",
    model: "Chaga",
    budget: 28000,
    campaignSource: "Meta Ads - Chaga",
    lastContactHoursAgo: 220,
    offerLastFollowupDaysAgo: null,
    hasOffer: false,
    hasCompetitorQuote: true,
  },
  {
    id: "MA-004",
    clientName: "Joanna Kłos",
    owner: "Magda 2",
    temperature: "WARM",
    model: "Waleta",
    budget: 55000,
    campaignSource: "Google Ads - Waleta",
    lastContactHoursAgo: 36,
    offerLastFollowupDaysAgo: 5,
    hasOffer: true,
    hasCompetitorQuote: true,
  },
  {
    id: "MA-005",
    clientName: "Rafał Pietrzak",
    owner: "Magda 1",
    temperature: "COLD",
    model: "Tirana",
    budget: 18000,
    campaignSource: "Meta Ads - Tirana Video",
    lastContactHoursAgo: 120,
    offerLastFollowupDaysAgo: null,
    hasOffer: false,
    hasCompetitorQuote: false,
  },
  {
    id: "MA-006",
    clientName: "Alicja Wrona",
    owner: "Magda 2",
    temperature: "HOT",
    model: "Tirana",
    budget: 61000,
    campaignSource: "Google Ads - Tirana",
    lastContactHoursAgo: 5,
    offerLastFollowupDaysAgo: 6,
    hasOffer: true,
    hasCompetitorQuote: true,
  },
];

function priorityForLead(lead: ActionLead): ActionPriority {
  if (lead.temperature === "HOT" && lead.model === "Tirana" && lead.campaignSource.toLowerCase().includes("tirana")) {
    return "highest";
  }

  if (lead.budget > 30000 || lead.temperature === "HOT") {
    return "high";
  }

  if (lead.temperature === "WARM") {
    return "medium";
  }

  return "low";
}

function buildTasks(leads: ActionLead[]): DailyDecisionTask[] {
  const tasks: DailyDecisionTask[] = [];

  leads.forEach((lead) => {
    const priority = priorityForLead(lead);

    if (lead.temperature === "HOT" && lead.lastContactHoursAgo > 2) {
      tasks.push({
        id: `T-${lead.id}-CALL`,
        owner: lead.owner,
        clientName: lead.clientName,
        whyNow: "HOT lead bez kontaktu > 2h",
        callGoal: "Umówić rozmowę finalizującą i potwierdzić termin decyzji.",
        nextStatusToClick: "called",
        priority,
        type: "immediate_call",
      });
    }

    if (lead.hasOffer && (lead.offerLastFollowupDaysAgo ?? 0) > 3) {
      tasks.push({
        id: `T-${lead.id}-FOLLOWUP`,
        owner: lead.owner,
        clientName: lead.clientName,
        whyNow: "Oferta bez follow-upu > 3 dni",
        callGoal: "Przebić blokadę decyzyjną i domknąć kolejny krok.",
        nextStatusToClick: "followup_scheduled",
        priority: priority === "low" ? "medium" : priority,
        type: "followup",
      });
    }

    if (lead.temperature === "WARM" && lead.lastContactHoursAgo > 24 * 7) {
      tasks.push({
        id: `T-${lead.id}-RECOVERY`,
        owner: lead.owner,
        clientName: lead.clientName,
        whyNow: "WARM lead bez kontaktu > 7 dni",
        callGoal: "Odzyskać uwagę klienta i kwalifikować termin zakupu.",
        nextStatusToClick: "recovered",
        priority: "medium",
        type: "recovery",
      });
    }

    if (lead.budget > 30000) {
      tasks.push({
        id: `T-${lead.id}-CEO`,
        owner: lead.owner,
        clientName: lead.clientName,
        whyNow: "Lead premium > 30 000 zł",
        callGoal: "Priorytetowe prowadzenie i szybkie zamknięcie procesu ofertowego.",
        nextStatusToClick: "offer_sent",
        priority: priority === "highest" ? "highest" : "high",
        type: "ceo_priority",
      });
    }
  });

  return tasks.sort((a, b) => {
    const rank: Record<ActionPriority, number> = {
      highest: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return rank[b.priority] - rank[a.priority];
  });
}

export function createBuild014Snapshot(): Build014Snapshot {
  const leads = MOCK_LEADS;
  const dailyTasks = buildTasks(leads);

  const immediateCalls = dailyTasks.filter((task) => task.type === "immediate_call");
  const followupTasks = dailyTasks.filter((task) => task.type === "followup");
  const recoveryTasks = dailyTasks.filter((task) => task.type === "recovery");

  const overdueOwners: Build014Snapshot["overdueOwners"] = (["Magda 1", "Magda 2"] as ActionOwner[]).map((owner) => ({
    owner,
    overdueCount: leads.filter((lead) => lead.owner === owner && lead.lastContactHoursAgo > 48).length,
  }));

  const activitySummary: Build014Snapshot["activitySummary"] = [
    { owner: "Magda 1", actionsDoneToday: 11, callsDone: 6, followupsDone: 5 },
    { owner: "Magda 2", actionsDoneToday: 9, callsDone: 5, followupsDone: 4 },
  ];

  return {
    leads,
    dailyTasks,
    immediateCalls,
    followupTasks,
    recoveryTasks,
    overdueOwners,
    activitySummary,
  };
}

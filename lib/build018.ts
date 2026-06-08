export type ReferralLeadSource = "architect" | "client_referral" | "partner_referral";
export type ReferralLeadOwner = "Magda 1" | "Magda 2" | "CEO";
export type ReferralLeadStatus = "new" | "qualified" | "offer_sent" | "won" | "lost";

export interface ReferralLead {
  id: string;
  clientName: string;
  source: ReferralLeadSource;
  partnerName: string;
  owner?: ReferralLeadOwner;
  status: ReferralLeadStatus;
  value: number;
  temperature: "HOT" | "WARM" | "COLD";
  createdDaysAgo: number;
}

export interface ArchitectPartner {
  name: string;
  leadsProvided: number;
  wonDeals: number;
  wonRevenue: number;
  lastContactDaysAgo: number;
}

export interface ClientInstallRecord {
  id: string;
  clientName: string;
  daysSinceInstall: number;
  nps: number;
  requestedRecommendation: boolean;
  owner: "Magda 1" | "Magda 2";
}

export interface ReferralSourceBoard {
  referralLeads: number;
  architectLeads: number;
  highPriorityLeads: number;
  missingOwnerLeads: number;
}

export interface ArchitectPartnerPipelineItem {
  architect: string;
  leadsProvided: number;
  wonDeals: number;
  wonRevenue: number;
  vip: boolean;
  nextAction: string;
}

export interface ClientRecommendationItem {
  clientName: string;
  owner: "Magda 1" | "Magda 2";
  daysSinceInstall: number;
  askNow: boolean;
  action: string;
}

export interface PartnerLeadQualityItem {
  partnerName: string;
  source: ReferralLeadSource;
  leadCount: number;
  hotLeadPct: number;
  wonPct: number;
  qualityScore: number;
  insight: string;
}

export interface ReferralFollowupTask {
  id: string;
  who: string;
  type: "partner_followup" | "client_referral_ask" | "owner_assignment";
  owner: "Magda 1" | "Magda 2" | "CEO";
  priority: "highest" | "high" | "medium";
  task: string;
  whyNow: string;
}

export interface ReferralRevenueSummary {
  wonDeals: number;
  wonRevenue: number;
  conversionPct: number;
  referralPipelineValue: number;
  paidDependencyReductionNote: string;
}

export interface Build018Snapshot {
  leads: ReferralLead[];
  architects: ArchitectPartner[];
  clientInstalls: ClientInstallRecord[];
  sourceBoard: ReferralSourceBoard;
  architectPipeline: ArchitectPartnerPipelineItem[];
  clientRecommendationTracker: ClientRecommendationItem[];
  partnerLeadQuality: PartnerLeadQualityItem[];
  followupQueue: ReferralFollowupTask[];
  revenueSummary: ReferralRevenueSummary;
  ceoAlerts: string[];
  decisionSummary: string;
}

const MOCK_LEADS: ReferralLead[] = [
  { id: "REF-018-001", clientName: "Katarzyna Lada", source: "architect", partnerName: "Arch. M. Zielińska", owner: "Magda 1", status: "qualified", value: 68000, temperature: "HOT", createdDaysAgo: 3 },
  { id: "REF-018-002", clientName: "Tomasz Witek", source: "client_referral", partnerName: "Klient: S. Michalak", owner: "Magda 2", status: "offer_sent", value: 42000, temperature: "HOT", createdDaysAgo: 5 },
  { id: "REF-018-003", clientName: "Aneta Ogon", source: "architect", partnerName: "Arch. K. Baran", owner: "Magda 1", status: "won", value: 74000, temperature: "HOT", createdDaysAgo: 20 },
  { id: "REF-018-004", clientName: "Michał Krawiec", source: "partner_referral", partnerName: "Partner: Studio Forma", owner: "Magda 2", status: "new", value: 31000, temperature: "WARM", createdDaysAgo: 2 },
  { id: "REF-018-005", clientName: "Ewa Lis", source: "client_referral", partnerName: "Klient: P. Kozik", status: "new", value: 39000, temperature: "HOT", createdDaysAgo: 1 },
  { id: "REF-018-006", clientName: "Marek Dudek", source: "architect", partnerName: "Arch. M. Zielińska", owner: "Magda 2", status: "won", value: 52000, temperature: "WARM", createdDaysAgo: 25 },
  { id: "REF-018-007", clientName: "Iwona Gracz", source: "architect", partnerName: "Arch. P. Lorenc", owner: "Magda 1", status: "offer_sent", value: 47000, temperature: "WARM", createdDaysAgo: 8 },
  { id: "REF-018-008", clientName: "Rafał Pena", source: "client_referral", partnerName: "Klient: M. Kłos", owner: "Magda 2", status: "lost", value: 29000, temperature: "WARM", createdDaysAgo: 17 },
];

const MOCK_ARCHITECTS: ArchitectPartner[] = [
  { name: "Arch. M. Zielińska", leadsProvided: 7, wonDeals: 3, wonRevenue: 126000, lastContactDaysAgo: 18 },
  { name: "Arch. K. Baran", leadsProvided: 4, wonDeals: 1, wonRevenue: 74000, lastContactDaysAgo: 35 },
  { name: "Arch. P. Lorenc", leadsProvided: 3, wonDeals: 0, wonRevenue: 0, lastContactDaysAgo: 12 },
];

const MOCK_INSTALLS: ClientInstallRecord[] = [
  { id: "INS-018-001", clientName: "Sylwia Michalak", daysSinceInstall: 16, nps: 10, requestedRecommendation: false, owner: "Magda 2" },
  { id: "INS-018-002", clientName: "Paweł Kozik", daysSinceInstall: 19, nps: 9, requestedRecommendation: false, owner: "Magda 1" },
  { id: "INS-018-003", clientName: "Maja Kłos", daysSinceInstall: 9, nps: 10, requestedRecommendation: false, owner: "Magda 2" },
  { id: "INS-018-004", clientName: "Adam Wróblewski", daysSinceInstall: 28, nps: 8, requestedRecommendation: true, owner: "Magda 1" },
];

function isHighPriorityLead(lead: ReferralLead): boolean {
  return lead.source === "architect" || lead.source === "client_referral";
}

function createSourceBoard(leads: ReferralLead[]): ReferralSourceBoard {
  const referralLeads = leads.filter((lead) => lead.source === "client_referral" || lead.source === "partner_referral").length;
  const architectLeads = leads.filter((lead) => lead.source === "architect").length;
  const highPriorityLeads = leads.filter(isHighPriorityLead).length;
  const missingOwnerLeads = leads.filter((lead) => !lead.owner).length;

  return { referralLeads, architectLeads, highPriorityLeads, missingOwnerLeads };
}

function createArchitectPipeline(architects: ArchitectPartner[]): ArchitectPartnerPipelineItem[] {
  return architects
    .map((architect) => {
      const vip = architect.wonRevenue > 50000;
      return {
        architect: architect.name,
        leadsProvided: architect.leadsProvided,
        wonDeals: architect.wonDeals,
        wonRevenue: architect.wonRevenue,
        vip,
        nextAction:
          architect.lastContactDaysAgo > 30
            ? "Skontaktuj dziś: update realizacji + prośba o 2 leady premium"
            : vip
              ? "Utrzymaj relację VIP: case premium i priorytetowe terminy"
              : "Podtrzymaj relację: follow-up partnerski w tym tygodniu",
      };
    })
    .sort((left, right) => right.wonRevenue - left.wonRevenue);
}

function createClientRecommendationTracker(installs: ClientInstallRecord[]): ClientRecommendationItem[] {
  return installs
    .map((install) => {
      const askNow = install.daysSinceInstall >= 14 && !install.requestedRecommendation;
      return {
        clientName: install.clientName,
        owner: install.owner,
        daysSinceInstall: install.daysSinceInstall,
        askNow,
        action: askNow
          ? "Wyślij prośbę o polecenie dziś (po 14 dniach od montażu)."
          : install.requestedRecommendation
            ? "Polecenie już obsłużone — podtrzymaj relację."
            : "Jeszcze nie proś o polecenie; wróć po 14 dniach.",
      };
    })
    .sort((left, right) => Number(right.askNow) - Number(left.askNow));
}

function createPartnerLeadQuality(leads: ReferralLead[]): PartnerLeadQualityItem[] {
  const partners = Array.from(new Set(leads.map((lead) => `${lead.source}::${lead.partnerName}`)));

  return partners
    .map((partnerKey) => {
      const [sourceRaw, partnerName] = partnerKey.split("::");
      const source = sourceRaw as ReferralLeadSource;
      const partnerLeads = leads.filter((lead) => lead.partnerName === partnerName && lead.source === source);
      const hotLeadPct = partnerLeads.filter((lead) => lead.temperature === "HOT").length / Math.max(1, partnerLeads.length) * 100;
      const wonPct = partnerLeads.filter((lead) => lead.status === "won").length / Math.max(1, partnerLeads.length) * 100;
      const qualityScore = hotLeadPct * 0.6 + wonPct * 0.4;

      return {
        partnerName,
        source,
        leadCount: partnerLeads.length,
        hotLeadPct,
        wonPct,
        qualityScore,
        insight:
          qualityScore >= 60
            ? "Partner daje leady premium — warto zwiększyć częstotliwość kontaktu."
            : qualityScore >= 35
              ? "Partner stabilny, ale potrzebuje lepszego briefu leadowego."
              : "Niska jakość leadów — doprecyzuj kryteria lub ogranicz kanał.",
      };
    })
    .sort((left, right) => right.qualityScore - left.qualityScore);
}

function createFollowupQueue(
  leads: ReferralLead[],
  architects: ArchitectPartner[],
  installs: ClientInstallRecord[]
): ReferralFollowupTask[] {
  const tasks: ReferralFollowupTask[] = [];

  architects.forEach((architect) => {
    if (architect.lastContactDaysAgo > 30) {
      tasks.push({
        id: `TASK-PARTNER-${architect.name}`,
        who: architect.name,
        type: "partner_followup",
        owner: "CEO",
        priority: "high",
        task: "Kontakt partnerski: podziękuj za leady i poproś o kolejne 2 rekomendacje.",
        whyNow: "Brak kontaktu z partnerem > 30 dni.",
      });
    }
  });

  installs.forEach((install) => {
    if (install.daysSinceInstall >= 14 && !install.requestedRecommendation) {
      tasks.push({
        id: `TASK-CLIENT-${install.id}`,
        who: install.clientName,
        type: "client_referral_ask",
        owner: install.owner,
        priority: "high",
        task: "Poproś klienta o polecenie i kontakt do znajomego/architekta.",
        whyNow: "Po udanym montażu minęło >=14 dni.",
      });
    }
  });

  leads.forEach((lead) => {
    if (!lead.owner) {
      tasks.push({
        id: `TASK-OWNER-${lead.id}`,
        who: lead.clientName,
        type: "owner_assignment",
        owner: "CEO",
        priority: "highest",
        task: "Przypisz opiekuna do leada partnerskiego i uruchom pierwszy kontakt.",
        whyNow: "Lead partnerski bez opiekuna wymaga decyzji CEO.",
      });
    }
  });

  const priorityOrder: Record<ReferralFollowupTask["priority"], number> = { highest: 3, high: 2, medium: 1 };
  return tasks.sort((left, right) => priorityOrder[right.priority] - priorityOrder[left.priority]).slice(0, 12);
}

function createRevenueSummary(leads: ReferralLead[]): ReferralRevenueSummary {
  const wonLeads = leads.filter((lead) => lead.status === "won");
  const wonDeals = wonLeads.length;
  const wonRevenue = wonLeads.reduce((sum, lead) => sum + lead.value, 0);
  const conversionPct = wonDeals / Math.max(1, leads.length) * 100;
  const referralPipelineValue = leads
    .filter((lead) => lead.status === "new" || lead.status === "qualified" || lead.status === "offer_sent")
    .reduce((sum, lead) => sum + lead.value, 0);

  return {
    wonDeals,
    wonRevenue,
    conversionPct,
    referralPipelineValue,
    paidDependencyReductionNote:
      "Kanał referral/architect podnosi udział leadów organicznych premium, dzięki czemu budżet paid można przesunąć na skalowanie tylko najlepszych kampanii.",
  };
}

export function createBuild018Snapshot(): Build018Snapshot {
  const leads = MOCK_LEADS;
  const architects = MOCK_ARCHITECTS;
  const clientInstalls = MOCK_INSTALLS;

  const sourceBoard = createSourceBoard(leads);
  const architectPipeline = createArchitectPipeline(architects);
  const clientRecommendationTracker = createClientRecommendationTracker(clientInstalls);
  const partnerLeadQuality = createPartnerLeadQuality(leads);
  const followupQueue = createFollowupQueue(leads, architects, clientInstalls);
  const revenueSummary = createRevenueSummary(leads);

  const ceoAlerts: string[] = [];

  if (sourceBoard.missingOwnerLeads > 0) {
    ceoAlerts.push(`ALERT CEO: ${sourceBoard.missingOwnerLeads} lead(ów) partnerskich bez opiekuna.`);
  }

  const overduePartners = architects.filter((architect) => architect.lastContactDaysAgo > 30).length;
  if (overduePartners > 0) {
    ceoAlerts.push(`ALERT RELACJI: ${overduePartners} partner(ów) bez kontaktu > 30 dni.`);
  }

  const vipArchitects = architectPipeline.filter((item) => item.vip).length;

  const topArchitect = architectPipeline[0];
  const topQualityPartner = partnerLeadQuality[0];
  const readyClients = clientRecommendationTracker.filter((client) => client.askNow).length;

  const decisionSummary =
    `Top architekt sprzedażowy: ${topArchitect?.architect ?? "—"}. ` +
    `Najlepszy partner jakości leadów: ${topQualityPartner?.partnerName ?? "—"}. ` +
    `Dziś poproś o polecenie ${readyClients} klient(ów); partnerów VIP: ${vipArchitects}.`;

  return {
    leads,
    architects,
    clientInstalls,
    sourceBoard,
    architectPipeline,
    clientRecommendationTracker,
    partnerLeadQuality,
    followupQueue,
    revenueSummary,
    ceoAlerts,
    decisionSummary,
  };
}

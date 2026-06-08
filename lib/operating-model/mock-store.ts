import type { OperatingDataStore } from "./types";
import { calculateLeadScore, calculateLeadTemperature } from "./helpers";

const RAW_STORE: OperatingDataStore = {
  leads: [
    { id: "LD-001", clientName: "Klient A", phone: "500111222", email: "a@demo.pl", source: "meta", campaignId: "CMP-001", owner: "Magda 1", modelInterest: "Tirana", budget: 45000, createdAt: "2026-06-01T08:00:00Z", lastContactAt: "2026-06-08T07:30:00Z", status: "qualified" },
    { id: "LD-002", clientName: "Klient B", phone: "500111223", email: "b@demo.pl", source: "google", campaignId: "CMP-004", owner: "Magda 1", modelInterest: "Astana", budget: 36000, createdAt: "2026-06-02T08:00:00Z", status: "offer_needed" },
    { id: "LD-003", clientName: "Klient C", phone: "500111224", source: "meta", campaignId: "CMP-001", owner: "Magda 2", modelInterest: "Tirana", budget: 32000, createdAt: "2026-06-03T08:00:00Z", status: "qualified" },
    { id: "LD-004", clientName: "Klient D", source: "architect", owner: "Magda 2", modelInterest: "Tirana", budget: 70000, createdAt: "2026-06-03T08:00:00Z", status: "new" },
    { id: "LD-005", clientName: "Klient E", phone: "500111225", source: "client_referral", owner: "Magda 2", modelInterest: "Waleta", budget: 29000, createdAt: "2026-06-04T08:00:00Z", status: "contacted" },
    { id: "LD-006", clientName: "Klient F", phone: "500111226", source: "google", campaignId: "CMP-002", owner: "Magda 1", modelInterest: "Astana", budget: 24000, createdAt: "2026-06-05T08:00:00Z", status: "qualified" },
    { id: "LD-007", clientName: "Klient G", source: "meta", campaignId: "CMP-003", modelInterest: "Chaga", budget: 22000, createdAt: "2026-06-06T08:00:00Z", status: "new" },
    { id: "LD-008", clientName: "Klient H", phone: "500111228", email: "h@demo.pl", source: "google", campaignId: "CMP-004", owner: "Magda 1", modelInterest: "Tirana", budget: 52000, createdAt: "2026-06-02T08:00:00Z", status: "qualified" },
    { id: "LD-009", clientName: "Klient I", source: "meta", campaignId: "CMP-005", owner: "Magda 2", modelInterest: "Waleta", budget: 21000, createdAt: "2026-06-07T08:00:00Z", status: "contacted" },
    { id: "LD-010", clientName: "Klient J", phone: "500111229", source: "architect", owner: "Magda 1", modelInterest: "Tirana", budget: 64000, createdAt: "2026-06-07T08:00:00Z", status: "qualified" },
  ],
  offers: [
    { id: "OF-001", leadId: "LD-001", campaignId: "CMP-001", owner: "Magda 1", model: "Tirana", value: 38000, status: "negotiation", createdAt: "2026-06-02T08:00:00Z", sentAt: "2026-06-03T08:00:00Z", lastFollowupAt: "2026-06-06T08:00:00Z", winProbability: 0.82 },
    { id: "OF-002", leadId: "LD-002", campaignId: "CMP-004", owner: "Magda 1", model: "Astana", value: 31000, status: "measurement_done", createdAt: "2026-06-02T08:00:00Z", sentAt: "2026-06-04T08:00:00Z", winProbability: 0.75 },
    { id: "OF-003", leadId: "LD-003", campaignId: "CMP-001", owner: "Magda 2", model: "Tirana", value: 26000, status: "sent", createdAt: "2026-06-03T08:00:00Z", sentAt: "2026-06-05T08:00:00Z", winProbability: 0.7 },
    { id: "OF-004", leadId: "LD-004", owner: "Magda 2", model: "Tirana", value: 42000, status: "negotiation", createdAt: "2026-06-03T08:00:00Z", sentAt: "2026-06-04T08:00:00Z", winProbability: 0.6 },
    { id: "OF-005", leadId: "LD-005", owner: "Magda 2", model: "Waleta", value: 28000, status: "sent", createdAt: "2026-06-04T08:00:00Z", sentAt: "2026-06-05T08:00:00Z", winProbability: 0.55 },
    { id: "OF-006", leadId: "LD-006", campaignId: "CMP-002", owner: "Magda 1", model: "Astana", value: 34000, status: "sent", createdAt: "2026-06-05T08:00:00Z", sentAt: "2026-06-05T08:00:00Z", winProbability: 0.66 },
    { id: "OF-007", leadId: "LD-008", campaignId: "CMP-004", owner: "Magda 1", model: "Tirana", value: 120000, status: "won", createdAt: "2026-05-10T08:00:00Z", sentAt: "2026-05-12T08:00:00Z", winProbability: 1, decisionReason: "Domknięta premium" },
    { id: "OF-008", leadId: "LD-010", owner: "Magda 1", model: "Tirana", value: 70000, status: "won", createdAt: "2026-05-11T08:00:00Z", sentAt: "2026-05-13T08:00:00Z", winProbability: 1, decisionReason: "Polecenie architekta" },
    { id: "OF-009", leadId: "LD-009", campaignId: "CMP-005", owner: "Magda 2", model: "Waleta", value: 45000, status: "won", createdAt: "2026-05-12T08:00:00Z", sentAt: "2026-05-14T08:00:00Z", winProbability: 1, decisionReason: "Szybka decyzja" }
  ],
  campaigns: [
    { id: "CMP-001", name: "Meta Tirana Premium Lookalike", platform: "Meta", model: "Tirana", monthlyBudget: 22000, status: "active" },
    { id: "CMP-002", name: "Google Astana Search Generic", platform: "Google", model: "Astana", monthlyBudget: 14000, status: "active" },
    { id: "CMP-003", name: "Meta Chaga Broad", platform: "Meta", model: "Chaga", monthlyBudget: 17000, status: "active" },
    { id: "CMP-004", name: "Google Tirana High Intent", platform: "Google", model: "Tirana", monthlyBudget: 9000, status: "active" },
    { id: "CMP-005", name: "Meta Waleta Remarketing", platform: "Meta", model: "Waleta", monthlyBudget: 7000, status: "active" }
  ],
  magdaTasks: [
    { id: "TSK-001", owner: "Magda 1", title: "4 follow-upy ofert premium", linkedOfferId: "OF-001", dueAt: "2026-06-08T14:00:00Z", priority: "highest", done: false },
    { id: "TSK-002", owner: "Magda 2", title: "3 telefony HOT", linkedLeadId: "LD-003", dueAt: "2026-06-08T12:00:00Z", priority: "highest", done: false }
  ],
  partners: [
    { id: "PRT-001", name: "Architekt VIP Zielińska", kind: "architect", lastContactAt: "2026-05-01T08:00:00Z", owner: "CEO" },
    { id: "PRT-002", name: "Studio Forma", kind: "partner", lastContactAt: "2026-06-01T08:00:00Z", owner: "Magda 1" }
  ],
  forecasts: [{ monthKey: "2026-06", revenuePlan: 400000 }],
};

export function getOperatingStore(): OperatingDataStore {
  const cloned: OperatingDataStore = JSON.parse(JSON.stringify(RAW_STORE));

  cloned.leads = cloned.leads.map((lead) => {
    const score = calculateLeadScore(lead);
    const temperature = calculateLeadTemperature(score);
    return { ...lead, score, temperature };
  });

  return cloned;
}

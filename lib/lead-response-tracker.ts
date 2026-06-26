import { calculateLeadScore, calculateLeadTemperature } from "@/lib/operating-model/helpers";
import type { LeadEntity, OperatingDataStore } from "@/lib/operating-model/types";

export type LeadCategory = "HOT" | "WARM" | "COLD";

export interface LeadResponseRecord {
  leadId: string;
  clientName: string;
  category: LeadCategory;
  owner: "Magda 1" | "Magda 2" | "UNASSIGNED";
  source: string;
  budget: number;
  createdAt: string;
  lastContactAt?: string;
  firstResponseMinutes: number | null;
  minutesWithoutContact: number;
  contacted: boolean;
  isVipArchitectLead: boolean;
}

function toMinutes(from: string, to: string): number {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60)));
}

function resolveLeadCategory(lead: LeadEntity): LeadCategory {
  if (lead.temperature) return lead.temperature;
  const score = lead.score ?? calculateLeadScore(lead);
  return calculateLeadTemperature(score);
}

export function buildLeadResponseTracker(store: OperatingDataStore): LeadResponseRecord[] {
  const nowIso = new Date().toISOString();

  return store.leads
    .map((lead) => {
      const category = resolveLeadCategory(lead);
      const owner = lead.owner || "UNASSIGNED";
      const hasContact = Boolean(lead.lastContactAt);

      const firstResponseMinutes = hasContact
        ? toMinutes(lead.createdAt, lead.lastContactAt as string)
        : null;

      const minutesWithoutContact = hasContact
        ? Math.max(0, toMinutes(lead.lastContactAt as string, nowIso))
        : toMinutes(lead.createdAt, nowIso);

      return {
        leadId: lead.id,
        clientName: lead.clientName,
        category,
        owner,
        source: lead.source,
        budget: lead.budget,
        createdAt: lead.createdAt,
        lastContactAt: lead.lastContactAt,
        firstResponseMinutes,
        minutesWithoutContact,
        contacted: hasContact,
        isVipArchitectLead: lead.source === "architect" && lead.budget >= 50000,
      } satisfies LeadResponseRecord;
    })
    .sort((left, right) => right.budget - left.budget);
}

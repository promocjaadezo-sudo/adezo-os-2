import type { CrmMissingFieldKey, CrmMissingFieldsReport } from "@/lib/crm-missing-fields-report";
import type { LiveDataStatusSnapshot } from "@/lib/live-data-status";

export interface DataTrustActionItem {
  field: CrmMissingFieldKey;
  label: string;
  recordsToFix: number;
  recoverablePoints: number;
  recommendation: string;
}

export interface DataTrustActionPlan {
  currentScore: number;
  targetScore: number;
  recoverablePointsFromCrm: number;
  projectedScoreAfterCrmFix: number;
  recordsToFix: number;
  actions: DataTrustActionItem[];
  minimalSetToTarget: DataTrustActionItem[];
  canReachTargetWithCrmOnly: boolean;
  blockers: string[];
}

const FIELD_WEIGHT: Record<CrmMissingFieldKey, number> = {
  status: 1.1,
  owner: 1.3,
  value: 1.4,
  contactDate: 1,
  offerDate: 0.9,
  salesResult: 1.2,
  lostReason: 1.1,
};

const FIELD_RECOMMENDATION: Record<CrmMissingFieldKey, string> = {
  status: "Uzupełnij status rekordu w CRM.",
  owner: "Przypisz opiekuna do rekordu.",
  value: "Uzupełnij wartość oferty/sprzedaży.",
  contactDate: "Uzupełnij datę kontaktu.",
  offerDate: "Uzupełnij datę oferty.",
  salesResult: "Uzupełnij wynik sprzedaży.",
  lostReason: "Uzupełnij powód przegranej dla utraconych rekordów.",
};

function distributePoints(weighted: Array<{ key: CrmMissingFieldKey; weight: number }>, totalPoints: number): Map<CrmMissingFieldKey, number> {
  const map = new Map<CrmMissingFieldKey, number>();
  if (totalPoints <= 0 || weighted.length === 0) return map;

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return map;

  let allocated = 0;
  for (let i = 0; i < weighted.length; i += 1) {
    const item = weighted[i];
    const remaining = totalPoints - allocated;
    if (remaining <= 0) {
      map.set(item.key, 0);
      continue;
    }

    const raw = Math.round((item.weight / totalWeight) * totalPoints);
    const points = i === weighted.length - 1 ? remaining : Math.max(0, Math.min(remaining, raw));
    map.set(item.key, points);
    allocated += points;
  }

  return map;
}

function buildBlockers(live: LiveDataStatusSnapshot, projectedScoreAfterCrmFix: number, target: number): string[] {
  const blockers: string[] = [];

  if (live.completeness.ga4 < 100) {
    blockers.push(`GA4 completeness ${live.completeness.ga4}% blokuje pełny wynik trust.`);
  }
  if (live.completeness.ads < 100) {
    blockers.push(`Ads completeness ${live.completeness.ads}% blokuje pełny wynik trust.`);
  }
  if (projectedScoreAfterCrmFix < target) {
    blockers.push(
      `Nawet pełne uzupełnienie CRM podnosi trust do ${projectedScoreAfterCrmFix}%. Do ${target}% wymagane są także poprawki GA4/Ads.`,
    );
  }

  return blockers;
}

export function createDataTrustActionList(input: {
  live: LiveDataStatusSnapshot;
  report: CrmMissingFieldsReport;
  targetScore?: number;
}): DataTrustActionPlan {
  const targetScore = input.targetScore ?? 70;
  const currentScore = input.live.dataTrustScore;
  const crmGap = Math.max(0, 100 - input.live.completeness.crm);

  // CRM impacts only 1/3 of total trust score in current model.
  const maxCrmRecoverable = Math.floor(crmGap / 3);

  const weighted = input.report.grouped
    .filter((group) => group.count > 0)
    .map((group) => ({
      key: group.field,
      weight: group.count * FIELD_WEIGHT[group.field],
    }));

  const pointsByField = distributePoints(weighted, maxCrmRecoverable);

  const actions: DataTrustActionItem[] = input.report.grouped
    .filter((group) => group.count > 0)
    .map((group) => ({
      field: group.field,
      label: group.label,
      recordsToFix: group.count,
      recoverablePoints: pointsByField.get(group.field) ?? 0,
      recommendation: FIELD_RECOMMENDATION[group.field],
    }))
    .sort((left, right) => right.recoverablePoints - left.recoverablePoints || right.recordsToFix - left.recordsToFix);

  const recoverablePointsFromCrm = actions.reduce((sum, action) => sum + action.recoverablePoints, 0);
  const projectedScoreAfterCrmFix = Math.min(100, currentScore + recoverablePointsFromCrm);
  const needed = Math.max(0, targetScore - currentScore);

  const minimalSetToTarget: DataTrustActionItem[] = [];
  let covered = 0;
  for (const action of actions) {
    if (covered >= needed) break;
    minimalSetToTarget.push(action);
    covered += action.recoverablePoints;
  }

  const canReachTargetWithCrmOnly = projectedScoreAfterCrmFix >= targetScore;

  return {
    currentScore,
    targetScore,
    recoverablePointsFromCrm,
    projectedScoreAfterCrmFix,
    recordsToFix: input.report.recordsToFix,
    actions,
    minimalSetToTarget,
    canReachTargetWithCrmOnly,
    blockers: buildBlockers(input.live, projectedScoreAfterCrmFix, targetScore),
  };
}

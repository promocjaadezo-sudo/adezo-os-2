export interface CampaignMatchCandidate {
  id?: string;
  campaignName?: string;
  source?: string;
  medium?: string;
}

export interface CampaignMatchResult {
  key: string;
  score: number;
  matched: boolean;
  reason: string;
  candidate?: CampaignMatchCandidate;
}

function normalize(value?: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toTokens(value?: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length >= 3);
}

function overlapScore(left?: string, right?: string): number {
  const a = toTokens(left);
  const b = new Set(toTokens(right));
  if (a.length === 0 || b.size === 0) return 0;
  const overlap = a.filter((token) => b.has(token)).length;
  return overlap / Math.max(a.length, b.size);
}

export function buildAttributionKey(source?: string, medium?: string, campaignName?: string): string {
  const src = normalize(source) || "unknown-source";
  const med = normalize(medium) || "unknown-medium";
  const cmp = normalize(campaignName) || "unknown-campaign";
  return `${src}|${med}|${cmp}`;
}

export function matchCampaignToCrm(
  crmCampaignName: string | undefined,
  candidates: CampaignMatchCandidate[],
): CampaignMatchResult {
  if (!crmCampaignName) {
    return {
      key: buildAttributionKey(undefined, undefined, undefined),
      score: 0,
      matched: false,
      reason: "CRM campaign missing",
    };
  }

  let best: { candidate: CampaignMatchCandidate; score: number } | null = null;

  for (const candidate of candidates) {
    const nameScore = overlapScore(crmCampaignName, candidate.campaignName);
    const sourceScore = overlapScore(crmCampaignName, candidate.source);
    const mediumScore = overlapScore(crmCampaignName, candidate.medium);
    const score = Math.max(nameScore, sourceScore * 0.4, mediumScore * 0.25);

    if (!best || score > best.score) {
      best = { candidate, score };
    }
  }

  if (!best || best.score < 0.34) {
    return {
      key: buildAttributionKey(undefined, undefined, crmCampaignName),
      score: best?.score || 0,
      matched: false,
      reason: "No GA4/Ads campaign match",
    };
  }

  return {
    key: buildAttributionKey(best.candidate.source, best.candidate.medium, best.candidate.campaignName || crmCampaignName),
    score: best.score,
    matched: true,
    reason: "Matched by campaign token overlap",
    candidate: best.candidate,
  };
}

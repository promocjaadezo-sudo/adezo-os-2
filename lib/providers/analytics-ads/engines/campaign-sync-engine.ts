import type { AdsProvider, CampaignSyncRecord, DateRange } from "../types";

export interface CampaignSyncSummary {
  records: CampaignSyncRecord[];
  totalCost: number;
  totalClicks: number;
  totalImpressions: number;
}

export class CampaignSyncEngine {
  async run(provider: AdsProvider, range: DateRange): Promise<CampaignSyncSummary> {
    const records = await provider.getCampaigns(range);

    return {
      records,
      totalCost: records.reduce((sum, row) => sum + row.cost, 0),
      totalClicks: records.reduce((sum, row) => sum + row.clicks, 0),
      totalImpressions: records.reduce((sum, row) => sum + row.impressions, 0),
    };
  }
}

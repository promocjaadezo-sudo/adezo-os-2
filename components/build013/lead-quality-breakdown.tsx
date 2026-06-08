import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function variant(rec: "skaluj" | "obserwuj" | "zatrzymaj") {
  if (rec === "skaluj") return "success" as const;
  if (rec === "zatrzymaj") return "danger" as const;
  return "warning" as const;
}

export function LeadQualityBreakdown({
  campaigns,
}: {
  campaigns: Array<{
    campaignSource: string;
    leads: number;
    hotLeads: number;
    hotRatePct: number;
    avgScore: number;
    recommendation: "skaluj" | "obserwuj" | "zatrzymaj";
  }>;
}) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <PieChart className="h-4 w-4 text-gold" /> Lead Quality Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaigns.map((campaign) => (
          <div key={campaign.campaignSource} className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{campaign.campaignSource}</p>
              <Badge variant={variant(campaign.recommendation)}>{campaign.recommendation}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Leady: {campaign.leads} · HOT: {campaign.hotLeads} · HOT rate: {campaign.hotRatePct.toFixed(1)}% · Avg score: {campaign.avgScore.toFixed(1)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

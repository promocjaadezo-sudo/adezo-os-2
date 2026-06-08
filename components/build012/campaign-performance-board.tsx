import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data/data-table";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { CampaignPerformance } from "@/lib/build012";

function recommendationVariant(value: CampaignPerformance["recommendation"]) {
  if (value === "skaluj") return "success" as const;
  if (value === "zatrzymaj") return "danger" as const;
  return "warning" as const;
}

export function CampaignPerformanceBoard({ campaigns }: { campaigns: CampaignPerformance[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <BarChart3 className="h-4 w-4 text-gold" /> Campaign Performance Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={[
            {
              key: "campaign",
              header: "Kampania",
              cell: (row: CampaignPerformance) => (
                <div>
                  <p className="font-medium">{row.campaignName}</p>
                  <p className="text-xs text-muted-foreground">{row.platform} · {row.model}</p>
                </div>
              ),
            },
            { key: "leads", header: "Leady", cell: (row: CampaignPerformance) => formatNumber(row.leads) },
            { key: "hot", header: "HOT", cell: (row: CampaignPerformance) => formatNumber(row.hotLeads) },
            { key: "offers", header: "Oferty", cell: (row: CampaignPerformance) => formatNumber(row.offers) },
            { key: "sales", header: "Sprzedaże", cell: (row: CampaignPerformance) => formatNumber(row.sales) },
            { key: "revenue", header: "Przychód", cell: (row: CampaignPerformance) => formatCurrency(row.revenue) },
            {
              key: "recommendation",
              header: "Rekomendacja",
              cell: (row: CampaignPerformance) => (
                <Badge variant={recommendationVariant(row.recommendation)}>{row.recommendation}</Badge>
              ),
            },
          ]}
          data={campaigns}
          emptyMessage="Brak danych kampanii"
        />
      </CardContent>
    </Card>
  );
}

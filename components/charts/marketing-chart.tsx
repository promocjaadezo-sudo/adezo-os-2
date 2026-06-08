"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Marketing } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface MarketingChartProps {
  data: Marketing[];
}

export function MarketingChart({ data }: MarketingChartProps) {
  const chartData = [...data]
    .reverse()
    .slice(-12)
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString("pl-PL", {
        month: "short",
        day: "numeric",
      }),
      cost: m.cost,
      leads: m.leads_count,
      cpl: m.leads_count > 0 ? m.cost / m.leads_count : 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Marketing ROI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
              <XAxis
                dataKey="date"
                stroke="hsl(220 10% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="hsl(220 10% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(220 10% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220 18% 8%)",
                  border: "1px solid hsl(220 14% 16%)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="leads"
                stroke="hsl(42 65% 55%)"
                strokeWidth={2}
                dot={false}
                name="Leads"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cost"
                stroke="hsl(0 65% 50%)"
                strokeWidth={2}
                dot={false}
                name="Cost"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

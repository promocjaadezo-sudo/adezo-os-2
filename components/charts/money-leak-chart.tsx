"use client";

import { useState, useEffect } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import type { MoneyLeak } from "@/lib/types";

interface MoneyLeakChartProps {
  data: MoneyLeak;
}

const COLORS = [
  "hsl(0 65% 50%)",
  "hsl(38 90% 55%)",
  "hsl(220 14% 40%)",
];

export function MoneyLeakChart({ data }: MoneyLeakChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [
    { name: "Lost Deals", value: data.lost_value },
    { name: "Dead Leads", value: data.dead_leads_value },
    { name: "Overdue Offers", value: data.overdue_offers_value },
  ].filter((d) => d.value > 0);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Money Leak Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Money Leak Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-12">
            No revenue leakage detected
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Money Leak Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220 18% 8%)",
                  border: "1px solid hsl(220 14% 16%)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Total leak: <span className="text-danger font-semibold">{formatCurrency(total)}</span>
        </p>
      </CardContent>
    </Card>
  );
}

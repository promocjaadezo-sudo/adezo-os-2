"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalespersonPerformance } from "@/lib/types";

interface PerformanceBarChartProps {
  data: SalespersonPerformance[];
}

export function PerformanceBarChart({ data }: PerformanceBarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data.map((sp) => ({
    name: sp.name.split(" ")[0],
    closed: sp.closed_sales,
    goal: sp.monthly_revenue_goal,
    pipeline: sp.weighted_pipeline,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          {!mounted ? (
            <div className="h-full w-full">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(220 10% 55%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(220 10% 55%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220 18% 8%)",
                    border: "1px solid hsl(220 14% 16%)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="closed" fill="hsl(42 65% 55%)" radius={[4, 4, 0, 0]} name="Closed" />
                <Bar dataKey="pipeline" fill="hsl(142 60% 45%)" radius={[4, 4, 0, 0]} name="Pipeline" />
                <Bar dataKey="goal" fill="hsl(220 14% 25%)" radius={[4, 4, 0, 0]} name="Goal" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

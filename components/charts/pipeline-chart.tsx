"use client";

import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

interface PipelineChartProps {
  data: { name: string; pipeline: number; weighted: number; closed: number }[];
}

export function PipelineChart({ data }: PipelineChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-display text-lg">Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          {!mounted ? (
            <div className="h-full w-full">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(42 65% 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(42 65% 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="weightedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 60% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 60% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                    color: "hsl(45 15% 92%)",
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Area
                  type="monotone"
                  dataKey="pipeline"
                  stroke="hsl(42 65% 55%)"
                  fill="url(#pipelineGrad)"
                  strokeWidth={2}
                  name="Pipeline"
                />
                <Area
                  type="monotone"
                  dataKey="weighted"
                  stroke="hsl(142 60% 45%)"
                  fill="url(#weightedGrad)"
                  strokeWidth={2}
                  name="Weighted"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

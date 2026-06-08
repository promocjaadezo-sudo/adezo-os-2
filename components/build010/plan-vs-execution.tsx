"use client";

import { BarChart3 } from "lucide-react";
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
import type { PlanExecutionPoint } from "@/lib/build010";

export function PlanVsExecution({ data }: { data: PlanExecutionPoint[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <BarChart3 className="h-4 w-4 text-gold" /> Plan vs wykonanie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
              <XAxis dataKey="period" stroke="hsl(220 10% 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(220 18% 8%)",
                  border: "1px solid hsl(220 14% 16%)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="plan" name="Plan" fill="hsl(220 10% 40%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="execution" name="Wykonanie" fill="hsl(42 65% 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

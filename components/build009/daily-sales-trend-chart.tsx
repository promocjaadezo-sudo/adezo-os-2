"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyTrendPoint } from "@/lib/build009";

export function DailySalesTrendChart({ data }: { data: DailyTrendPoint[] }) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="font-display text-lg">Trend dzienny (7 dni)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
              <XAxis
                dataKey="date"
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
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220 18% 8%)",
                  border: "1px solid hsl(220 14% 16%)",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="leads" name="Leady" stroke="hsl(42 65% 55%)" strokeWidth={2} />
              <Line type="monotone" dataKey="offers" name="Oferty" stroke="hsl(142 60% 45%)" strokeWidth={2} />
              <Line type="monotone" dataKey="followups" name="Followupy" stroke="hsl(220 70% 65%)" strokeWidth={2} />
              <Line type="monotone" dataKey="overdue" name="Overdue" stroke="hsl(0 65% 50%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

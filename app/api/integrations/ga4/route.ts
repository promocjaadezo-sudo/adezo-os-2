import { NextResponse } from "next/server";
import { getGa4LiveMetrics } from "@/lib/ga4-live";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getGa4LiveMetrics();

  return NextResponse.json({
    provider: "ga4",
    propertyId: result.propertyId,
    status: result.status,
    message: result.message,
    metrics: result.metrics,
  });
}
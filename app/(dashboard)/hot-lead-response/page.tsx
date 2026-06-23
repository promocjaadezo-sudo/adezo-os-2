import { Flame } from "lucide-react";
import { redirect } from "next/navigation";
import { HotLeadPriorityBoard } from "@/components/data/hot-lead-priority-board";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { createHotLeadResponseSnapshot } from "@/lib/hot-lead-response-engine";
import { getPreviewDataModeLabel, isPreviewTestModeEnabled } from "@/lib/preview-test-mode";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HotLeadResponsePage() {
  const previewTestMode = isPreviewTestModeEnabled();
  const previewDataMode = getPreviewDataModeLabel();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase() || "";
  const isCeo = userEmail.endsWith("@adezo.pl") || userEmail.includes("ceo");

  if (!previewTestMode && user && !isCeo) {
    redirect("/dashboard");
  }

  const snapshot = await createHotLeadResponseSnapshot({
    previewMode: previewTestMode,
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Hot Lead Response"
        description="BUILD 035: natychmiastowa reakcja na leady premium, monitoring SLA i wpływ na forecast sprzedaży."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <Flame className="h-3.5 w-3.5" />
          SLA RESPONSE MODE
        </div>
      </PageHeader>

      {previewTestMode ? (
        <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2">
          <Badge variant="warning">PREVIEW TEST MODE</Badge>
          <p className="text-sm text-muted-foreground">Data mode: {previewDataMode}</p>
        </div>
      ) : null}

      <HotLeadPriorityBoard snapshot={snapshot} />
    </div>
  );
}

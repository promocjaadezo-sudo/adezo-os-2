import { Bot } from "lucide-react";
import { redirect } from "next/navigation";
import { AutomatedBriefPreviewPanel } from "@/components/data/automated-brief-preview-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { createAutomatedRevenueBriefSnapshot } from "@/lib/automated-revenue-brief-engine";
import { getPreviewDataModeLabel, isPreviewTestModeEnabled } from "@/lib/preview-test-mode";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AutomatedRevenueBriefPage() {
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

  const snapshot = await createAutomatedRevenueBriefSnapshot({
    previewMode: previewTestMode,
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Automated Revenue Brief"
        description="BUILD 033: automatyczny silnik briefów dziennych oparty o Revenue Truth Layer i reguły działań na dziś."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
          <Bot className="h-3.5 w-3.5" />
          PREMIUM BRIEF MODE
        </div>
      </PageHeader>

      {previewTestMode ? (
        <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2">
          <Badge variant="warning">PREVIEW TEST MODE</Badge>
          <p className="text-sm text-muted-foreground">Data mode: {previewDataMode}</p>
        </div>
      ) : null}

      <AutomatedBriefPreviewPanel snapshot={snapshot} />
    </div>
  );
}

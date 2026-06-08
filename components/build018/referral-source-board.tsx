import { Handshake, Users } from "lucide-react";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { formatNumber } from "@/lib/format";
import type { ReferralSourceBoard } from "@/lib/build018";

export function ReferralSourceBoardModule({ board }: { board: ReferralSourceBoard }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Handshake className="h-4 w-4 text-gold" />
        <h2 className="font-display text-lg">Referral Source Board</h2>
      </div>
      <KpiGrid className="lg:grid-cols-4">
        <KpiCard title="Leady z poleceń" value={formatNumber(board.referralLeads)} subtitle="Klienci + partnerzy" variant="gold" />
        <KpiCard title="Leady od architektów" value={formatNumber(board.architectLeads)} subtitle="Kanał partnerski" variant="warning" icon={Users} />
        <KpiCard title="Leady high priority" value={formatNumber(board.highPriorityLeads)} subtitle="Architekt + referral klienta" variant="success" />
        <KpiCard title="Brak opiekuna" value={formatNumber(board.missingOwnerLeads)} subtitle="Alert CEO" variant={board.missingOwnerLeads > 0 ? "danger" : "success"} />
      </KpiGrid>
    </section>
  );
}

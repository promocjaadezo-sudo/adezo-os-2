import { DataTable } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Lead, Offer } from "@/lib/types";

interface LeadPriorityBoardProps {
  hotLeads: Lead[];
  leadsWithoutContact: Lead[];
  offersWithoutFollowup: Offer[];
}

export function LeadPriorityBoard({
  hotLeads,
  leadsWithoutContact,
  offersWithoutFollowup,
}: LeadPriorityBoardProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl">Lead Priority Board</h2>

      <DataTable
        title="HOT leady (priorytet ownera)"
        columns={[
          {
            key: "client",
            header: "Klient",
            cell: (lead: Lead) => lead.client_name,
          },
          {
            key: "model",
            header: "Model",
            cell: (lead: Lead) => lead.models?.name ?? lead.model_name_raw ?? "—",
          },
          {
            key: "budget",
            header: "Budżet",
            className: "text-right",
            cell: (lead: Lead) => formatCurrency(lead.budget),
          },
          {
            key: "owner",
            header: "Handlowiec",
            cell: (lead: Lead) => lead.salespeople?.name ?? "—",
          },
        ]}
        data={hotLeads}
        emptyMessage="Brak HOT leadów w tej chwili."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DataTable
          title="Leady bez kontaktu"
          columns={[
            {
              key: "client",
              header: "Klient",
              cell: (lead: Lead) => lead.client_name,
            },
            {
              key: "created",
              header: "Utworzono",
              cell: (lead: Lead) => formatDate(lead.created_at),
            },
            {
              key: "risk",
              header: "Ryzyko",
              cell: () => <Badge variant="warning">Brak follow-upu</Badge>,
            },
          ]}
          data={leadsWithoutContact}
          emptyMessage="Każdy lead ma przypisany pierwszy kontakt."
        />

        <DataTable
          title="Oferty bez follow-upu"
          columns={[
            {
              key: "number",
              header: "Oferta",
              cell: (offer: Offer) => offer.offer_number ?? `OF-${offer.id.slice(0, 6).toUpperCase()}`,
            },
            {
              key: "client",
              header: "Klient",
              cell: (offer: Offer) => offer.client_name_snapshot ?? offer.leads?.client_name ?? "—",
            },
            {
              key: "value",
              header: "Wartość",
              className: "text-right",
              cell: (offer: Offer) => formatCurrency(offer.value),
            },
            {
              key: "risk",
              header: "Ryzyko",
              cell: () => <Badge variant="danger">Brak następnego kroku</Badge>,
            },
          ]}
          data={offersWithoutFollowup}
          emptyMessage="Wszystkie aktywne oferty mają zaplanowany follow-up."
        />
      </div>
    </section>
  );
}

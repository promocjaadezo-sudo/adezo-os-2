import { TrendingDown, XCircle, Skull, Clock, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadAdezoData } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { MoneyLeakChart } from "@/components/charts/money-leak-chart";
import { DataTable } from "@/components/data/data-table";
import { formatDate } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemperatureBadge } from "@/components/data/status-badge";
import type { Lost, Lead, Offer } from "@/lib/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MoneyLeakPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.email?.toLowerCase() !== "ceo@adezo.pl") {
    redirect("/dashboard");
  }

  const data = await loadAdezoData(supabase);
  const { moneyLeak } = data;

  const totalLeak =
    moneyLeak.lost_value +
    moneyLeak.dead_leads_value +
    moneyLeak.overdue_offers_value;

  // Wyliczenia dynamiczne Money Leak Categories
  const leadyBezKontaktu = data.leads.filter(
    (l) => !data.followups.some((f) => f.lead_id === l.id)
  );

  const ofertyBezFollowupu = data.offers.filter(
    (o) => !data.followups.some((f) => f.offer_id === o.id || (o.lead_id && f.lead_id === o.lead_id))
  );

  const fourteenDaysAgoTime = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const ofertyStarszeNiz14Dni = data.offers.filter(
    (o) => 
      new Date(o.created_at).getTime() < fourteenDaysAgoTime &&
      !o.status.toLowerCase().includes("wygr") &&
      !o.status.toLowerCase().includes("przegr")
  );

  const activeLeady = data.leads.filter(
    (l) => !l.status.toLowerCase().includes("wygr") && !l.status.toLowerCase().includes("odrz") && !l.status.toLowerCase().includes("disq")
  );
  const leadyZagrozoneUtrata = activeLeady.filter(
    (l) => {
      const isHotOrWarm = l.temperature === "hot" || l.temperature === "warm";
      const hasOverdueFollowup = data.followups.some(
        (f) => f.lead_id === l.id && f.status === "open" && f.due_date < new Date().toISOString().split("T")[0]
      );
      const isOldAndNoOffer = new Date(l.created_at).getTime() < fourteenDaysAgoTime && !data.offers.some((o) => o.lead_id === l.id);
      return isHotOrWarm && (hasOverdueFollowup || isOldAndNoOffer);
    }
  );

  // Kolumny dla poszczególnych kategorii
  const bKontaktuCols = [
    {
      key: "client",
      header: "Klient",
      cell: (l: Lead) => l.client_name,
    },
    {
      key: "city",
      header: "Miasto",
      cell: (l: Lead) => l.city ?? "—",
    },
    {
      key: "budget",
      header: "Budżet",
      cell: (l: Lead) => formatCurrency(l.budget),
      className: "text-right",
    },
    {
      key: "created",
      header: "Kwalifikacja",
      cell: (l: Lead) => formatDate(l.created_at),
    }
  ];

  const oBezFollowCols = [
    {
      key: "no",
      header: "Numer oferty",
      cell: (o: Offer) => o.offer_number ?? `OF-${o.id.slice(0, 4).toUpperCase()}`,
    },
    {
      key: "client",
      header: "Klient (Snapshot)",
      cell: (o: Offer) => o.client_name_snapshot ?? "—",
    },
    {
      key: "value",
      header: "Wartość",
      cell: (o: Offer) => formatCurrency(o.value),
      className: "text-right font-medium",
    },
    {
      key: "probability",
      header: "Szansa wygranej",
      cell: (o: Offer) => `${o.win_probability}%`,
      className: "text-center",
    }
  ];

  const oStareCols = [
    {
      key: "no",
      header: "Numer oferty",
      cell: (o: Offer) => o.offer_number ?? `OF-${o.id.slice(0, 4).toUpperCase()}`,
    },
    {
      key: "client",
      header: "Klient",
      cell: (o: Offer) => o.client_name_snapshot ?? "—",
    },
    {
      key: "value",
      header: "Wartość",
      cell: (o: Offer) => formatCurrency(o.value),
      className: "text-right font-medium",
    },
    {
      key: "sent",
      header: "Wysłano",
      cell: (o: Offer) => o.sent_at ? formatDate(o.sent_at) : formatDate(o.created_at),
    }
  ];

  const lZagrozoneCols = [
    {
      key: "client",
      header: "Klient",
      cell: (l: Lead) => l.client_name,
    },
    {
      key: "temp",
      header: "Temperatura",
      cell: (l: Lead) => <TemperatureBadge temperature={l.temperature} />,
      className: "text-center",
    },
    {
      key: "budget",
      header: "Budżet",
      cell: (l: Lead) => formatCurrency(l.budget),
      className: "text-right font-medium",
    },
    {
      key: "reason",
      header: "Zagrożenie",
      cell: (l: Lead) => {
        const hasOverdue = data.followups.some(
          (f) => f.lead_id === l.id && f.status === "open" && f.due_date < new Date().toISOString().split("T")[0]
        );
        return hasOverdue ? (
          <span className="text-red-400 font-medium">Przeterminowane zadanie followup</span>
        ) : (
          <span className="text-amber-400 font-medium">Brak oferty po 14 dniach</span>
        );
      }
    }
  ];

  const lostColumns = [
    {
      key: "client",
      header: "Klient",
      cell: (l: Lost) => l.leads?.client_name ?? "—",
    },
    {
      key: "salesperson",
      header: "Handlowca",
      cell: (l: Lost) => l.salespeople?.name ?? "—",
    },
    {
      key: "date",
      header: "Data utraty",
      cell: (l: Lost) => formatDate(l.lost_date),
    },
    {
      key: "reason",
      header: "Powód",
      cell: (l: Lost) => l.reason ?? "—",
    },
    {
      key: "value",
      header: "Utracona wartość",
      cell: (l: Lost) => (
        <span className="text-danger font-medium">
          {formatCurrency(l.lost_value)}
        </span>
      ),
      className: "text-right",
    },
    {
      key: "return",
      header: "Szansa powrotu %",
      cell: (l: Lost) =>
        l.return_probability != null ? `${l.return_probability}%` : "—",
      className: "text-center",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Wyciek Pieniędzy"
        description="Analiza utraconych przychodów i szacowanie szans na ich odzyskanie."
      />

      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Suma wycieku"
          value={formatCurrency(totalLeak)}
          icon={TrendingDown}
          variant="danger"
        />
        <KpiCard
          title="Utracone oferty"
          value={formatCurrency(moneyLeak.lost_value)}
          icon={XCircle}
          variant="danger"
        />
        <KpiCard
          title="Wartość martwych leadów"
          value={formatCurrency(moneyLeak.dead_leads_value)}
          icon={Skull}
          variant="warning"
        />
        <KpiCard
          title="Zaległe oferty"
          value={formatCurrency(moneyLeak.overdue_offers_value)}
          icon={Clock}
          variant="warning"
        />
      </KpiGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <MoneyLeakChart data={moneyLeak} />
        <KpiCard
          title="Potencjał odzyskania"
          value={formatCurrency(
            data.lost.reduce(
              (sum, l) =>
                sum + l.lost_value * ((l.return_probability ?? 0) / 100),
              0
            )
          )}
          subtitle="Na podstawie szacowanego prawdopodobieństwa powrotu"
          variant="gold"
          className="h-fit"
        />
      </div>

      {/* DYNAMICZNE KATEGORIE INTEGRACJI MONEY LEAK */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-gold" />
            Dynamiczny Silnik Wycieków (Live)
          </h2>
          <p className="text-sm text-muted-foreground">
            Wychwytywanie krytycznych zaniedbań w procesie handlowym na żywo.
          </p>
        </div>

        <Tabs defaultValue="kontakt" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="kontakt" className="text-sm">
              Bez kontaktu ({leadyBezKontaktu.length})
            </TabsTrigger>
            <TabsTrigger value="followup" className="text-sm">
              Oferty bez zadań ({ofertyBezFollowupu.length})
            </TabsTrigger>
            <TabsTrigger value="14dni" className="text-sm">
              Oferty stare &gt; 14 dni ({ofertyStarszeNiz14Dni.length})
            </TabsTrigger>
            <TabsTrigger value="zagrozone" className="text-sm">
              Leady zagrożone ({leadyZagrozoneUtrata.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kontakt">
            <DataTable
              title="Leady zupełnie pozbawione kontaktu (Brak follow-upu)"
              columns={bKontaktuCols}
              data={leadyBezKontaktu}
              emptyMessage="Wspaniale! Wszystkie zarejestrowane leady mają przypisane zadania follow-up."
            />
          </TabsContent>

          <TabsContent value="followup">
            <DataTable
              title="Otwarte oferty bez przypisanych zadań następnego kontaktu"
              columns={oBezFollowCols}
              data={ofertyBezFollowupu}
              emptyMessage="Świetnie! Każda aktywna oferta ma zaplanowane dalsze kroki."
            />
          </TabsContent>

          <TabsContent value="14dni">
            <DataTable
              title="Oferty aktywne unieruchomione w leju dłużej niż 14 dni"
              columns={oStareCols}
              data={ofertyStarszeNiz14Dni}
              emptyMessage="Brak aktywnych starych ofert, uwięzionych na tym etapie."
            />
          </TabsContent>

          <TabsContent value="zagrozone">
            <DataTable
              title="Kluczowe leady zagrożone bezpowrotną utratą"
              columns={lZagrozoneCols}
              data={leadyZagrozoneUtrata}
              emptyMessage="Brak zidentyfikowanych gorących leadów bez aktualnej opieki handlowej."
            />
          </TabsContent>
        </Tabs>
      </div>

      <DataTable
        title="Utracone oferty (Archiwum historyczne)"
        columns={lostColumns}
        data={data.lost}
        emptyMessage="Brak zarejestrowanych utraconych ofert"
      />
    </div>
  );
}

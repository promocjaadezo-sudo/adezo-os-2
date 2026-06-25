import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Skull,
  CalendarClock,
  Award,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { loadAdezoData, computeCeoScore, getOpenFollowups } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { PipelineChart } from "@/components/charts/pipeline-chart";
import { PerformanceBarChart } from "@/components/charts/performance-bar-chart";
import { DataTable } from "@/components/data/data-table";
import { StatusBadge, PriorityBadge, TemperatureBadge } from "@/components/data/status-badge";
import { formatDateShort } from "@/lib/format";
import type { AdezoData, Followup, Lead, Offer, Salesperson } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

function getEmptyAdezoData(): AdezoData {
  return {
    profile: null,
    leads: [],
    offers: [],
    lost: [],
    followups: [],
    salespeople: [],
    models: [],
    marketing: [],
    kpi: {
      closed_sales: 0,
      active_pipeline: 0,
      weighted_pipeline: 0,
      total_leads: 0,
      total_offers: 0,
      dead_leads: 0,
    },
    moneyLeak: {
      lost_value: 0,
      dead_leads_value: 0,
      overdue_offers_value: 0,
    },
    salespersonPerformance: [],
  };
}

function hasRuntimeSupabaseEnv() {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url && anonKey && !url.includes("your-project.supabase.co") && anonKey !== "your-anon-key");
}

function getSalespersonName(email?: string): string {
  if (!email) return "Handlowiec";
  const normalized = email.toLowerCase();
  
  if (normalized === "magda.k@adezo.pl" || normalized.includes("magda.k")) return "Magda K";
  if (normalized === "magda.b@adezo.pl" || normalized.includes("magda.b")) return "Magda B";
  
  const namePart = email.split("@")[0] || "";
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

export default async function DashboardPage() {
  let email = "";
  let data = getEmptyAdezoData();

  if (hasRuntimeSupabaseEnv()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email || "";
    data = await loadAdezoData(supabase);
  }
  
  const isCeo = email.toLowerCase().endsWith("@adezo.pl") || email.toLowerCase().includes("ceo");

  if (!isCeo) {
    const spName = getSalespersonName(email);
    
    // Znajdź handlowca w bazie danych
    const activeSalesperson = data.salespeople.find((sp: Salesperson) => 
      (sp.email && sp.email.toLowerCase() === email.toLowerCase()) || 
      (sp.name.toLowerCase() === spName.toLowerCase())
    );
    const spId = activeSalesperson?.id;

    // Filtruj dane dla konkretnego handlowca
    const mojeLeady = data.leads.filter((l) => 
      l.salesperson_id === spId || 
      (l.salespeople?.name && l.salespeople.name === spName)
    );

    const mojeOferty = data.offers.filter((o) => 
      o.salesperson_id === spId || 
      (o.salespeople?.name && o.salespeople.name === spName)
    );

    const mojeFollowupy = data.followups.filter((f) => 
      f.salesperson_id === spId || 
      (f.salesperson_name && f.salesperson_name === spName) ||
      (f.salespeople?.name && f.salespeople.name === spName)
    );

    const aktywneOferty = mojeOferty.filter((o) => 
      !o.status.toLowerCase().includes("wygr") && 
      !o.status.toLowerCase().includes("przegr")
    );

    const sumaWartosciOfert = aktywneOferty.reduce((sum, o) => sum + Number(o.value || 0), 0);
    const otwarteFollowupy = mojeFollowupy.filter((f) => f.status === "open");

    const leadColumns = [
      {
        key: "client_name",
        header: "Klient",
        cell: (l: Lead) => (
          <div>
            <p className="font-medium">{l.client_name}</p>
            {l.city && <p className="text-xs text-muted-foreground">{l.city}</p>}
          </div>
        )
      },
      {
        key: "model",
        header: "Model",
        cell: (l: Lead) => l.models?.name ?? l.model_name_raw ?? "—"
      },
      {
        key: "status",
        header: "Status",
        cell: (l: Lead) => <StatusBadge status={l.status} />
      },
      {
        key: "temp",
        header: "Temp.",
        cell: (l: Lead) => <TemperatureBadge temperature={l.temperature} />
      },
      {
        key: "budget",
        header: "Budżet",
        cell: (l: Lead) => formatCurrency(l.budget),
        className: "text-right"
      },
      {
        key: "created_at",
        header: "Utworzono",
        cell: (l: Lead) => formatDateShort(l.created_at)
      }
    ];

    const offerColumns = [
      {
        key: "client",
        header: "Klient",
        cell: (o: Offer) => o.client_name_snapshot ?? o.leads?.client_name ?? "—"
      },
      {
        key: "model",
        header: "Model",
        cell: (o: Offer) => o.models?.name ?? "—"
      },
      {
        key: "status",
        header: "Status",
        cell: (o: Offer) => <StatusBadge status={o.status} />
      },
      {
        key: "probability",
        header: "Szansa %",
        cell: (o: Offer) => `${o.win_probability}%`,
        className: "text-center"
      },
      {
        key: "value",
        header: "Wartość",
        cell: (o: Offer) => formatCurrency(o.value),
        className: "text-right font-medium"
      },
      {
        key: "next_contact",
        header: "Następny kontakt",
        cell: (o: Offer) => o.next_contact_at ? formatDateShort(o.next_contact_at) : "—"
      }
    ];

    const followupColumnsDesk = [
      {
        key: "client",
        header: "Klient",
        cell: (f: Followup) => f.leads?.client_name ?? f.client_name ?? "—"
      },
      {
        key: "due",
        header: "Termin",
        cell: (f: Followup) => formatDateShort(f.due_date)
      },
      {
        key: "priority",
        header: "Priorytet",
        cell: (f: Followup) => <PriorityBadge priority={f.priority} />
      },
      {
        key: "status",
        header: "Status",
        cell: (f: Followup) => <StatusBadge status={f.status} />
      },
      {
        key: "value",
        header: "Wartość",
        cell: (f: Followup) => formatCurrency(f.value_snapshot),
        className: "text-right font-medium"
      }
    ];

    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <PageHeader
          title={`Magda Desk — ${spName}`}
          description="Twój spersonalizowany widok operacyjny sprzedaży, leadów, ofert i zadań."
        />

        <KpiGrid className="lg:grid-cols-4">
          <KpiCard
            title="Moje leady"
            value={formatNumber(mojeLeady.length)}
            icon={Users}
            variant="gold"
          />
          <KpiCard
            title="Aktywne oferty"
            value={formatNumber(aktywneOferty.length)}
            icon={FileText}
            variant="success"
          />
          <KpiCard
            title="Otwarte zadania"
            value={formatNumber(otwarteFollowupy.length)}
            icon={CalendarClock}
            variant="warning"
          />
          <KpiCard
            title="Suma wartości"
            value={formatCurrency(sumaWartosciOfert)}
            icon={DollarSign}
            variant="gold"
          />
        </KpiGrid>

        <Tabs defaultValue="leady" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="leady">Moje Leady ({mojeLeady.length})</TabsTrigger>
            <TabsTrigger value="oferty">Moje Oferty ({mojeOferty.length})</TabsTrigger>
            <TabsTrigger value="followupy">Moje Followupy ({mojeFollowupy.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leady">
            <DataTable
              title="Lista Moich Leadów"
              columns={leadColumns}
              data={mojeLeady}
              emptyMessage="Brak przypisanych leadów"
            />
          </TabsContent>
          
          <TabsContent value="oferty">
            <DataTable
              title="Lista Moich Ofert"
              columns={offerColumns}
              data={mojeOferty}
              emptyMessage="Brak przypisanych ofert"
            />
          </TabsContent>
          
          <TabsContent value="followupy">
            <DataTable
              title="Lista Moich Zadań (Followups)"
              columns={followupColumnsDesk}
              data={mojeFollowupy}
              emptyMessage="Brak przypisanych followupów"
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  const ceoScore = computeCeoScore(data.kpi, data.moneyLeak);
  const openFollowups = getOpenFollowups(data.followups).slice(0, 5);

  const pipelineChartData = [
    {
      name: "Current",
      pipeline: data.kpi.active_pipeline,
      weighted: data.kpi.weighted_pipeline,
      closed: data.kpi.closed_sales,
    },
  ];

  const followupColumns = [
    {
      key: "client",
      header: "Klient",
      cell: (f: Followup) =>
        f.leads?.client_name ?? f.client_name ?? "—",
    },
    {
      key: "due",
      header: "Termin",
      cell: (f: Followup) => formatDateShort(f.due_date),
    },
    {
      key: "priority",
      header: "Priorytet",
      cell: (f: Followup) => <PriorityBadge priority={f.priority} />,
    },
    {
      key: "value",
      header: "Wartość",
      cell: (f: Followup) => formatCurrency(f.value_snapshot),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Dashboard CEO"
        description="Przegląd wyników sprzedaży, kondycji lejka i ocen zespołu dla kadry kierowniczej."
      >
        <Link href="/ceo-score">
          <Button variant="gold" size="sm">
            <Award className="h-4 w-4" />
            Wynik: {ceoScore}
          </Button>
        </Link>
      </PageHeader>

      <KpiGrid>
        <KpiCard
          title="Zamknięta sprzedaż"
          value={formatCurrency(data.kpi.closed_sales)}
          icon={DollarSign}
          variant="gold"
        />
        <KpiCard
          title="Aktywny lejek"
          value={formatCurrency(data.kpi.active_pipeline)}
          icon={TrendingUp}
          variant="success"
        />
        <KpiCard
          title="Ważony lejek"
          value={formatCurrency(data.kpi.weighted_pipeline)}
          subtitle="Skorygowany o prawdopodobieństwo"
          icon={TrendingUp}
        />
        <KpiCard
          title="Suma leadów"
          value={formatNumber(data.kpi.total_leads)}
          icon={Users}
        />
        <KpiCard
          title="Aktywne oferty"
          value={formatNumber(data.kpi.total_offers)}
          icon={FileText}
        />
        <KpiCard
          title="Martwe leady"
          value={formatNumber(data.kpi.dead_leads)}
          icon={Skull}
          variant="danger"
        />
        <KpiCard
          title="Otwarte followupy"
          value={formatNumber(openFollowups.length)}
          icon={CalendarClock}
          variant="warning"
        />
        <KpiCard
          title="Wynik CEO"
          value={`${ceoScore}/100`}
          icon={Award}
          variant="gold"
        />
      </KpiGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <PipelineChart data={pipelineChartData} />
        <PerformanceBarChart data={data.salespersonPerformance} />
      </div>

      <DataTable
        title="Nadchodzące followupy"
        columns={followupColumns}
        data={openFollowups}
        emptyMessage="Brak otwartych followupów"
      />
    </div>
  );
}

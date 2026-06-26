import { AlertTriangle, CheckCircle2, Clock3, Database, Link2, ShieldAlert, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IntegrationHealthItem, IntegrationUiStatus } from "@/lib/integrations-health";

function statusVariant(status: IntegrationUiStatus): "success" | "warning" | "danger" | "secondary" {
  if (status === "CONNECTED") return "success";
  if (status === "FALLBACK") return "warning";
  if (status === "ERROR") return "danger";
  return "secondary";
}

function statusIcon(status: IntegrationUiStatus) {
  if (status === "CONNECTED") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === "FALLBACK") return <AlertTriangle className="h-4 w-4 text-warning" />;
  if (status === "ERROR") return <XCircle className="h-4 w-4 text-danger" />;
  return <ShieldAlert className="h-4 w-4 text-muted-foreground" />;
}

export function IntegrationHealthPanel({
  activeProvider,
  totalRecords,
  auth,
}: {
  activeProvider: string;
  totalRecords: number;
  auth: {
    currentMode: "mock" | "service_account" | "oauth_user";
    ga4AuthStatus: string;
    googleAdsAuthStatus: string;
    fallbackReason: string;
  };
}) {
  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Database className="h-4 w-4 text-gold" /> Integration Health Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
        <p>
          Aktywny provider: <Badge variant="gold">{activeProvider}</Badge>
        </p>
        <p>
          Łączna liczba rekordów: <span className="font-semibold text-foreground">{totalRecords}</span>
        </p>
        <p>
          Current auth mode: <Badge variant="secondary">{auth.currentMode}</Badge>
        </p>
        <p className="sm:col-span-2">
          GA4 auth status: <span className="font-medium text-foreground">{auth.ga4AuthStatus}</span>
        </p>
        <p className="sm:col-span-2">
          Google Ads auth status: <span className="font-medium text-foreground">{auth.googleAdsAuthStatus}</span>
        </p>
        <p className="sm:col-span-2">
          Fallback reason: <span className="font-medium text-foreground">{auth.fallbackReason}</span>
        </p>
      </CardContent>
    </Card>
  );
}

export function SyncStatusCenter({ items }: { items: IntegrationHealthItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Link2 className="h-4 w-4 text-gold" /> Sync Status Center
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.key} className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{item.name}</span>
              {statusIcon(item.status)}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
              {item.active ? <Badge variant="gold">ACTIVE</Badge> : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LastSyncMonitor({ items, globalLastSyncAt }: { items: IntegrationHealthItem[]; globalLastSyncAt: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Clock3 className="h-4 w-4 text-gold" /> Last Sync Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          Ostatnia synchronizacja globalna: <span className="font-medium text-foreground">{new Date(globalLastSyncAt).toLocaleString("pl-PL")}</span>
        </p>
        {items.map((item) => (
          <p key={item.key}>
            {item.name}: <span className="font-medium text-foreground">{new Date(item.lastSyncAt).toLocaleString("pl-PL")}</span>
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

export function ErrorMonitor({ items }: { items: IntegrationHealthItem[] }) {
  const withErrors = items.filter((item) => item.lastError && item.lastError !== "-");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <AlertTriangle className="h-4 w-4 text-warning" /> Error Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {withErrors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak aktywnych błędów integracji.</p>
        ) : (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {withErrors.map((item) => (
              <li key={item.key} className="rounded-md border border-warning/40 bg-warning/5 p-2">
                <span className="font-medium text-foreground">{item.name}:</span> {item.lastError}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function ProviderStatusDashboard({ items }: { items: IntegrationHealthItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Database className="h-4 w-4 text-gold" /> Provider Status Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium">{item.name}</p>
              <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
            </div>
            <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
              <p>Aktywny: {item.active ? "TAK" : "NIE"}</p>
              <p>Rekordy: {item.records}</p>
              <p>Ostatni sync: {new Date(item.lastSyncAt).toLocaleString("pl-PL")}</p>
              <p>Ostatni błąd: {item.lastError}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

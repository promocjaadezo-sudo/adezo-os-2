"use client";

import React, { useState } from "react";
import { 
  Users, Flame, Thermometer, Snowflake, Search, Plus, Edit2, Trash2, AlertCircle
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { StatusBadge, TemperatureBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Lead, Model, Salesperson } from "@/lib/types";

interface LeadsClientProps {
  initialLeads: Lead[];
  models: Model[];
  salespeople: Salesperson[];
}

export function LeadsClient({ initialLeads, models, salespeople }: LeadsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [salespersonFilter, setSalespersonFilter] = useState("all");

  // Formularze / Widoczność Modalek
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Stany formularza
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [modelId, setModelId] = useState("");
  const [budget, setBudget] = useState(0);
  const [source, setSource] = useState("");
  const [salespersonId, setSalespersonId] = useState("");
  const [status, setStatus] = useState("new");
  const [temperature, setTemperature] = useState<"hot" | "warm" | "cold" | "">("warm");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setClientName("");
    setPhone("");
    setEmail("");
    setCity("");
    setModelId("");
    setBudget(0);
    setSource("");
    setSalespersonId("");
    setStatus("new");
    setTemperature("warm");
    setNotes("");
    setErrorMsg("");
  };

  const openAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setClientName(lead.client_name || "");
    setPhone(lead.phone || "");
    setEmail(lead.email || "");
    setCity(lead.city || "");
    setModelId(lead.model_id || "");
    setBudget(Number(lead.budget || 0));
    setSource(lead.source || "");
    setSalespersonId(lead.salesperson_id || "");
    setStatus(lead.status || "new");
    setTemperature(lead.temperature || "");
    setNotes(lead.notes || "");
    setErrorMsg("");
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg("Nazwa klienta jest wymagana.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        client_name: clientName,
        phone: phone || null,
        email: email || null,
        city: city || null,
        model_id: modelId || null,
        budget: budget || 0,
        source: source || null,
        salesperson_id: salespersonId || null,
        status: status,
        temperature: temperature || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("leads")
        .insert([payload]);

      if (error) {
        setErrorMsg(`Błąd bazy danych: ${error.message}`);
        setLoading(false);
        return;
      }

      // Lokalna aktualizacja i przeładowanie routera
      setIsAddOpen(false);
      resetForm();
      router.refresh();
      
      const { data: freshLeads } = await supabase.from("leads").select("*");
      if (freshLeads) {
        // Rekonstrukcja powiązań w locie dla stanu lokalnego
        const enriched = freshLeads.map((lf) => ({
          ...lf,
          models: lf.model_id ? { name: models.find((m) => m.id === lf.model_id)?.name || "" } : null,
          salespeople: lf.salesperson_id ? { name: salespeople.find((s) => s.id === lf.salesperson_id)?.name || "" } : null,
        })) as Lead[];
        setLeads(enriched);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Wystąpił nieoczekiwany błąd: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    if (!clientName.trim()) {
      setErrorMsg("Nazwa klienta jest wymagana.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        client_name: clientName,
        phone: phone || null,
        email: email || null,
        city: city || null,
        model_id: modelId || null,
        budget: budget || 0,
        source: source || null,
        salesperson_id: salespersonId || null,
        status: status,
        temperature: temperature || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("leads")
        .update(payload)
        .eq("id", selectedLead.id);

      if (error) {
        setErrorMsg(`Błąd bazy danych: ${error.message}`);
        setLoading(false);
        return;
      }

      setIsEditOpen(false);
      setSelectedLead(null);
      resetForm();
      router.refresh();

      const { data: freshLeads } = await supabase.from("leads").select("*");
      if (freshLeads) {
        const enriched = freshLeads.map((lf) => ({
          ...lf,
          models: lf.model_id ? { name: models.find((m) => m.id === lf.model_id)?.name || "" } : null,
          salespeople: lf.salesperson_id ? { name: salespeople.find((s) => s.id === lf.salesperson_id)?.name || "" } : null,
        })) as Lead[];
        setLeads(enriched);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Wystąpił nieoczekiwany błąd: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tego leada? Spowoduje to kaskadowe usunięcie powiązanych ofert i followupów.")) {
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId);

      if (error) {
        setErrorMsg(`Nie udało się usunąć: ${error.message}`);
        setLoading(false);
        return;
      }

      setIsEditOpen(false);
      setSelectedLead(null);
      resetForm();
      router.refresh();

      const { data: freshLeads } = await supabase.from("leads").select("*");
      if (freshLeads) {
        const enriched = freshLeads.map((lf) => ({
          ...lf,
          models: lf.model_id ? { name: models.find((m) => m.id === lf.model_id)?.name || "" } : null,
          salespeople: lf.salesperson_id ? { name: salespeople.find((s) => s.id === lf.salesperson_id)?.name || "" } : null,
        })) as Lead[];
        setLeads(enriched);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Błąd krytyczny: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtrowanie leadów
  const filteredLeads = leads.filter((l) => {
    // szukajka
    const sTerm = searchQuery.toLowerCase();
    const matchesSearch = 
      (l.client_name || "").toLowerCase().includes(sTerm) ||
      (l.city || "").toLowerCase().includes(sTerm) ||
      (l.phone || "").toLowerCase().includes(sTerm) ||
      (l.email || "").toLowerCase().includes(sTerm) ||
      (l.source || "").toLowerCase().includes(sTerm) ||
      (l.notes || "").toLowerCase().includes(sTerm);

    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    
    const matchesSalesperson = 
      salespersonFilter === "all" || 
      l.salesperson_id === salespersonFilter ||
      (salespersonFilter === "none" && !l.salesperson_id);

    return matchesSearch && matchesStatus && matchesSalesperson;
  });

  // KPI i statystyki dla aktualnie przefiltrowanych leadów
  const hot = filteredLeads.filter((l) => l.temperature === "hot").length;
  const warm = filteredLeads.filter((l) => l.temperature === "warm").length;
  const cold = filteredLeads.filter((l) => l.temperature === "cold").length;
  const totalBudget = filteredLeads.reduce((sum, l) => sum + Number(l.budget || 0), 0);

  // Wszystkie unikalne statusy z bazy do filtra
  const statuses = Array.from(new Set(leads.map((l) => l.status).filter(Boolean)));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* KPI */}
      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Suma leadów"
          value={formatNumber(filteredLeads.length)}
          icon={Users}
          variant="gold"
        />
        <KpiCard
          title="Gorące"
          value={formatNumber(hot)}
          icon={Flame}
          variant="danger"
        />
        <KpiCard
          title="Ciepłe"
          value={formatNumber(warm)}
          icon={Thermometer}
          variant="warning"
        />
        <KpiCard
          title="Zimne"
          value={formatNumber(cold)}
          icon={Snowflake}
        />
      </KpiGrid>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <KpiCard
          title="Budżet lejka (filtr)"
          value={formatCurrency(totalBudget)}
          subtitle={`Śr. ${formatCurrency(filteredLeads.length ? totalBudget / filteredLeads.length : 0)} na leada`}
          variant="gold"
          className="max-w-sm w-full sm:w-auto"
        />

        <Button onClick={openAdd} variant="gold" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Dodaj leada
        </Button>
      </div>

      {/* PASEK WYSZUKIWANIA I FILTROWANIA */}
      <Card className="border-gold/10 bg-card/40 backdrop-blur-xl">
        <CardContent className="p-4 sm:p-6 grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground mr-1" />
            <Input
              placeholder="Szukaj (klient, miasto, e-mail...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/20 border-gold/10 focus-visible:ring-gold/30 text-white"
            />
          </div>

          <div>
            <select
              title="Filtruj po statusie"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
            >
              <option value="all" className="bg-zinc-950">Wszystkie statusy</option>
              {statuses.map((st) => (
                <option key={st} value={st} className="bg-zinc-950">
                  {st.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              title="Filtruj po handlowcu"
              value={salespersonFilter}
              onChange={(e) => setSalespersonFilter(e.target.value)}
              className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
            >
              <option value="all" className="bg-zinc-950">Wszyscy handlowcy</option>
              <option value="none" className="bg-zinc-950">Nieprzypisani</option>
              {salespeople.map((sp) => (
                <option key={sp.id} value={sp.id} className="bg-zinc-950">
                  {sp.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* TABELA LEADÓW */}
      <Card className="border-gold/10 bg-card/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-gold/10 bg-gold/5 text-xs uppercase text-gold tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Klient / Miasto</th>
                <th className="px-6 py-4">Model</th>
                <th className="px-6 py-4">Budżet</th>
                <th className="px-6 py-4">Handlowca</th>
                <th className="px-6 py-4">Źródło</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Temp.</th>
                <th className="px-6 py-4 text-center">Utworzono</th>
                <th className="px-6 py-4 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5 text-zinc-300">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                    Brak wyników spełniających kryteria wyszukiwania.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-gold/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4" onClick={() => openEdit(lead)}>
                      <div>
                        <p className="font-semibold text-white group-hover:text-gold transition-colors">
                          {lead.client_name}
                        </p>
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          {lead.phone && <span>Tel: {lead.phone}</span>}
                          {lead.email && <span>E-mail: {lead.email}</span>}
                          {lead.city && <span className="text-gold/60">{lead.city}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={() => openEdit(lead)}>
                      {lead.models?.name ?? lead.model_name_raw ?? "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-white" onClick={() => openEdit(lead)}>
                      {formatCurrency(lead.budget)}
                    </td>
                    <td className="px-6 py-4" onClick={() => openEdit(lead)}>
                      {lead.salespeople?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-xs" onClick={() => openEdit(lead)}>
                      {lead.source ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={() => openEdit(lead)}>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-center" onClick={() => openEdit(lead)}>
                      <TemperatureBadge temperature={lead.temperature} />
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-muted-foreground" onClick={() => openEdit(lead)}>
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={(e) => { e.stopPropagation(); openEdit(lead); }} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-gold"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* FORM MODAL: DODAWANIE LEADA */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="left" className="sm:max-w-lg overflow-y-auto bg-zinc-950 border-gold/10 text-white z-50">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-gold">Dodaj Nowego Leada</SheetTitle>
          </SheetHeader>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName" className="text-zinc-200">Klient / Nazwa firmy *</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="np. Kowalski Jan / Adezo Sp. z o.o."
                className="bg-black/40 border-gold/10 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-zinc-200">Telefon</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+48 123 456 789"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-200">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="klient@firma.pl"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city" className="text-zinc-200">Miasto</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="np. Warszawa"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget" className="text-zinc-200">Budżet (zł)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="650000"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="model" className="text-zinc-200">Wybrany Model</Label>
                <select
                  id="model"
                  title="Wybrany Model"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="" className="bg-zinc-950">Wybierz model...</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id} className="bg-zinc-950">{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salesperson" className="text-zinc-200">Przypisz Handlowca</Label>
                <select
                  id="salesperson"
                  title="Przypisz Handlowca"
                  value={salespersonId}
                  onChange={(e) => setSalespersonId(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="" className="bg-zinc-950">Przypisz handlowca...</option>
                  {salespeople.map((sp) => (
                    <option key={sp.id} value={sp.id} className="bg-zinc-950">{sp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="statusSelect" className="text-zinc-200">Status</Label>
                <select
                  id="statusSelect"
                  title="Status leada"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="new" className="bg-zinc-950">Nowy (new)</option>
                  <option value="contacted" className="bg-zinc-950">W kontakcie (contacted)</option>
                  <option value="qualified" className="bg-zinc-950">Zweryfikowany (qualified)</option>
                  <option value="disqualified" className="bg-zinc-950">Odrzucony (disqualified)</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tempSelect" className="text-zinc-200">Temperatura</Label>
                <select
                  id="tempSelect"
                  title="Temperatura leada"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value as "hot" | "warm" | "cold" | "")}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="" className="bg-zinc-950">Brak temperatury (—)</option>
                  <option value="hot" className="bg-zinc-950">Gorący (hot)</option>
                  <option value="warm" className="bg-zinc-950">Ciepły (warm)</option>
                  <option value="cold" className="bg-zinc-950">Zimny (cold)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="source" className="text-zinc-200">Źródło lead’a</Label>
              <Input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="np. Facebook, Google, Polecenie"
                className="bg-black/40 border-gold/10 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-zinc-200">Notatki / Przypisy</Label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Wpisz istotne informacje dotyczące leada..."
                className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white h-24 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} disabled={loading}>
                Anuluj
              </Button>
              <Button type="submit" variant="gold" className="px-6" disabled={loading}>
                {loading ? "Dodawanie..." : "Stwórz leada"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* FORM MODAL: EDYCJA LEADA */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="left" className="sm:max-w-lg overflow-y-auto bg-zinc-950 border-gold/10 text-white z-50">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-gold">Edytuj Leada</SheetTitle>
          </SheetHeader>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="clientNameEdit" className="text-zinc-200">Klient / Nazwa firmy *</Label>
              <Input
                id="clientNameEdit"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="np. Kowalski Jan / Adezo Sp. z o.o."
                className="bg-black/40 border-gold/10 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phoneEdit" className="text-zinc-200">Telefon</Label>
                <Input
                  id="phoneEdit"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+48 123 456 789"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emailEdit" className="text-zinc-200">E-mail</Label>
                <Input
                  id="emailEdit"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="klient@firma.pl"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cityEdit" className="text-zinc-200">Miasto</Label>
                <Input
                  id="cityEdit"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="np. Warszawa"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budgetEdit" className="text-zinc-200">Budżet (zł)</Label>
                <Input
                  id="budgetEdit"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="650000"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="modelEdit" className="text-zinc-200">Wybrany Model</Label>
                <select
                  id="modelEdit"
                  title="Wybierz model"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="" className="bg-zinc-950">Wybierz model...</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id} className="bg-zinc-950">{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salespersonEdit" className="text-zinc-200">Przypisz Handlowca</Label>
                <select
                  id="salespersonEdit"
                  title="Przypisz handlowca"
                  value={salespersonId}
                  onChange={(e) => setSalespersonId(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="" className="bg-zinc-950">Przypisz handlowca...</option>
                  {salespeople.map((sp) => (
                    <option key={sp.id} value={sp.id} className="bg-zinc-950">{sp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="statusSelectEdit" className="text-zinc-200">Status</Label>
                <select
                  id="statusSelectEdit"
                  title="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="new" className="bg-zinc-950">Nowy (new)</option>
                  <option value="contacted" className="bg-zinc-950">W kontakcie (contacted)</option>
                  <option value="qualified" className="bg-zinc-950">Zweryfikowany (qualified)</option>
                  <option value="disqualified" className="bg-zinc-950">Odrzucony (disqualified)</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tempSelectEdit" className="text-zinc-200">Temperatura</Label>
                <select
                  id="tempSelectEdit"
                  title="Temperatura"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value as "hot" | "warm" | "cold" | "")}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="" className="bg-zinc-950">Brak temperatury (—)</option>
                  <option value="hot" className="bg-zinc-950">Gorący (hot)</option>
                  <option value="warm" className="bg-zinc-950">Ciepły (warm)</option>
                  <option value="cold" className="bg-zinc-950">Zimny (cold)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sourceEdit" className="text-zinc-200">Źródło lead’a</Label>
              <Input
                id="sourceEdit"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="np. Facebook, Google, Polecenie"
                className="bg-black/40 border-gold/10 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notesEdit" className="text-zinc-200">Notatki / Przypisy</Label>
              <textarea
                id="notesEdit"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notatki o leadzie..."
                title="Notatki o leadzie"
                className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white h-24 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-400" 
                onClick={() => selectedLead && handleDelete(selectedLead.id)} 
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Usuń leada
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} disabled={loading}>
                  Anuluj
                </Button>
                <Button type="submit" variant="gold" className="px-6" disabled={loading}>
                  {loading ? "Zapisywanie..." : "Zapisz zmiany"}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

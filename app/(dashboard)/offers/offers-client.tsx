"use client";

import React, { useState } from "react";
import { 
  FileText, DollarSign, TrendingUp, Clock, Plus, Edit2, Trash2, AlertCircle, Search
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";
import { KpiCard, KpiGrid } from "@/components/kpi/kpi-card";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Offer, Lead, Model, Salesperson } from "@/lib/types";

interface OffersClientProps {
  initialOffers: Offer[];
  leads: Lead[];
  models: Model[];
  salespeople: Salesperson[];
}

export function OffersClient({ initialOffers, leads, models, salespeople }: OffersClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Formularze / Widoczność Modalek
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Stany formularza oferty
  const [offerNumber, setOfferNumber] = useState("");
  const [leadId, setLeadId] = useState("");
  const [modelId, setModelId] = useState("");
  const [value, setValue] = useState(0);
  const [margin, setMargin] = useState(0);
  const [winProbability, setWinProbability] = useState(10);
  const [status, setStatus] = useState("draft");
  const [salespersonId, setSalespersonId] = useState("");
  const [sentAt, setSentAt] = useState("");
  const [nextContactAt, setNextContactAt] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setOfferNumber("");
    setLeadId("");
    setModelId("");
    setValue(0);
    setMargin(0);
    setWinProbability(10);
    setStatus("draft");
    setSalespersonId("");
    setSentAt("");
    setNextContactAt("");
    setNotes("");
    setErrorMsg("");
  };

  const openAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEdit = (offer: Offer) => {
    setSelectedOffer(offer);
    setOfferNumber(offer.offer_number || "");
    setLeadId(offer.lead_id || "");
    setModelId(offer.model_id || "");
    setValue(Number(offer.value || 0));
    setMargin(Number(offer.margin || 0));
    setWinProbability(Number(offer.win_probability || 10));
    setStatus(offer.status || "draft");
    setSalespersonId(offer.salesperson_id || "");
    setSentAt(offer.sent_at ? offer.sent_at.split("T")[0] : "");
    setNextContactAt(offer.next_contact_at || "");
    setNotes(offer.notes || "");
    setErrorMsg("");
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      setErrorMsg("Powiązany lead/klient jest wymagany.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      // Wyciągnij snapshot nazwy klienta z przypisanego leada
      const leadObj = leads.find((l) => l.id === leadId);
      const clientSnapshot = leadObj ? leadObj.client_name : "";

      const payload = {
        offer_number: offerNumber || null,
        lead_id: leadId,
        model_id: modelId || null,
        value: value || 0,
        margin: margin || 0,
        win_probability: winProbability,
        status: status,
        salesperson_id: salespersonId || null,
        sent_at: sentAt ? new Date(sentAt).toISOString() : null,
        next_contact_at: nextContactAt || null,
        client_name_snapshot: clientSnapshot,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("offers")
        .insert([payload]);

      if (error) {
        setErrorMsg(`Błąd bazy danych: ${error.message}`);
        setLoading(false);
        return;
      }

      setIsAddOpen(false);
      resetForm();
      router.refresh();

      // Odśwież lokalną listę
      const { data: freshOffers } = await supabase.from("offers").select("*");
      if (freshOffers) {
        const enriched = freshOffers.map((of) => ({
          ...of,
          models: of.model_id ? { name: models.find((m) => m.id === of.model_id)?.name || "" } : null,
          salespeople: of.salesperson_id ? { name: salespeople.find((s) => s.id === of.salesperson_id)?.name || "" } : null,
          leads: of.lead_id ? { 
            client_name: leads.find((l) => l.id === of.lead_id)?.client_name || "",
            phone: leads.find((l) => l.id === of.lead_id)?.phone || null,
            city: leads.find((l) => l.id === of.lead_id)?.city || null
          } : null,
        })) as Offer[];
        setOffers(enriched);
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
    if (!selectedOffer) return;
    if (!leadId) {
      setErrorMsg("Powiązany lead/klient jest wymagany.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const leadObj = leads.find((l) => l.id === leadId);
      const clientSnapshot = leadObj ? leadObj.client_name : "";

      const payload = {
        offer_number: offerNumber || null,
        lead_id: leadId,
        model_id: modelId || null,
        value: value || 0,
        margin: margin || 0,
        win_probability: winProbability,
        status: status,
        salesperson_id: salespersonId || null,
        sent_at: sentAt ? new Date(sentAt).toISOString() : null,
        next_contact_at: nextContactAt || null,
        client_name_snapshot: clientSnapshot,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("offers")
        .update(payload)
        .eq("id", selectedOffer.id);

      if (error) {
        setErrorMsg(`Błąd bazy danych: ${error.message}`);
        setLoading(false);
        return;
      }

      setIsEditOpen(false);
      setSelectedOffer(null);
      resetForm();
      router.refresh();

      const { data: freshOffers } = await supabase.from("offers").select("*");
      if (freshOffers) {
        const enriched = freshOffers.map((of) => ({
          ...of,
          models: of.model_id ? { name: models.find((m) => m.id === of.model_id)?.name || "" } : null,
          salespeople: of.salesperson_id ? { name: salespeople.find((s) => s.id === of.salesperson_id)?.name || "" } : null,
          leads: of.lead_id ? { 
            client_name: leads.find((l) => l.id === of.lead_id)?.client_name || "",
            phone: leads.find((l) => l.id === of.lead_id)?.phone || null,
            city: leads.find((l) => l.id === of.lead_id)?.city || null
          } : null,
        })) as Offer[];
        setOffers(enriched);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Wystąpił nieoczekiwany błąd: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę ofertę?")) {
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", offerId);

      if (error) {
        setErrorMsg(`Nie udało się usunąć: ${error.message}`);
        setLoading(false);
        return;
      }

      setIsEditOpen(false);
      setSelectedOffer(null);
      resetForm();
      router.refresh();

      const { data: freshOffers } = await supabase.from("offers").select("*");
      if (freshOffers) {
        const enriched = freshOffers.map((of) => ({
          ...of,
          models: of.model_id ? { name: models.find((m) => m.id === of.model_id)?.name || "" } : null,
          salespeople: of.salesperson_id ? { name: salespeople.find((s) => s.id === of.salesperson_id)?.name || "" } : null,
          leads: of.lead_id ? { 
            client_name: leads.find((l) => l.id === of.lead_id)?.client_name || "",
            phone: leads.find((l) => l.id === of.lead_id)?.phone || null,
            city: leads.find((l) => l.id === of.lead_id)?.city || null
          } : null,
        })) as Offer[];
        setOffers(enriched);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Błąd krytyczny: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtrowanie ofert
  const filteredOffers = offers.filter((o) => {
    const sTerm = searchQuery.toLowerCase();
    const matchesSearch = 
      (o.offer_number || "").toLowerCase().includes(sTerm) ||
      (o.client_name_snapshot || "").toLowerCase().includes(sTerm) ||
      (o.leads?.client_name || "").toLowerCase().includes(sTerm) ||
      (o.notes || "").toLowerCase().includes(sTerm);

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI
  const activeOffers = filteredOffers.filter(
    (o) =>
      !o.status.toLowerCase().includes("wygr") &&
      !o.status.toLowerCase().includes("przegr")
  );
  const totalValue = activeOffers.reduce((sum, o) => sum + Number(o.value || 0), 0);
  const weightedValue = activeOffers.reduce(
    (sum, o) => sum + Number(o.value || 0) * (Number(o.win_probability || 0) / 100),
    0
  );
  const today = new Date().toISOString().split("T")[0];
  const overdue = activeOffers.filter(
    (o) => o.next_contact_at && o.next_contact_at < today
  ).length;

  const statuses = Array.from(new Set(offers.map((o) => o.status).filter(Boolean)));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* KPI */}
      <KpiGrid className="lg:grid-cols-4">
        <KpiCard
          title="Aktywne oferty"
          value={formatNumber(activeOffers.length)}
          icon={FileText}
          variant="gold"
        />
        <KpiCard
          title="Wartość lejka"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
        />
        <KpiCard
          title="Wartość ważona"
          value={formatCurrency(weightedValue)}
          icon={TrendingUp}
          variant="success"
        />
        <KpiCard
          title="Zaległe kontakty"
          value={formatNumber(overdue)}
          icon={Clock}
          variant={overdue > 0 ? "danger" : "default"}
        />
      </KpiGrid>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <p className="text-zinc-400 text-sm">
          Zarządzaj ofertami przesyłanymi do klientów i ich marżą.
        </p>

        <Button onClick={openAdd} variant="gold" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Dodaj ofertę
        </Button>
      </div>

      {/* FILTROWANIE */}
      <Card className="border-gold/10 bg-card/40 backdrop-blur-xl">
        <CardContent className="p-4 sm:p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground mr-1" />
            <Input
              placeholder="Szukaj (numer oferty, klient...)"
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
        </CardContent>
      </Card>

      {/* TABELA OFERT */}
      <Card className="border-gold/10 bg-card/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-gold/10 bg-gold/5 text-xs uppercase text-gold tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Numer oferty</th>
                <th className="px-6 py-4">Klient (Lead)</th>
                <th className="px-6 py-4">Model</th>
                <th className="px-6 py-4">Handlowca</th>
                <th className="px-6 py-4 text-right">Wartość (zł)</th>
                <th className="px-6 py-4 text-right">Marża (zł)</th>
                <th className="px-6 py-4 text-center">Szansa</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center font-normal">Wysłano</th>
                <th className="px-6 py-4 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5 text-zinc-300">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                    Brak ofert spełniających kryteria wyszukiwania.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                  <tr 
                    key={offer.id} 
                    className="hover:bg-gold/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-semibold text-white group-hover:text-gold" onClick={() => openEdit(offer)}>
                      {offer.offer_number ?? `OF-DECO-${offer.id.slice(0, 4).toUpperCase()}`}
                    </td>
                    <td className="px-6 py-4" onClick={() => openEdit(offer)}>
                      {offer.client_name_snapshot ?? offer.leads?.client_name ?? "—"}
                    </td>
                    <td className="px-6 py-4" onClick={() => openEdit(offer)}>
                      {offer.models?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4" onClick={() => openEdit(offer)}>
                      {offer.salespeople?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white" onClick={() => openEdit(offer)}>
                      {formatCurrency(offer.value)}
                    </td>
                    <td className="px-6 py-4 text-right text-gold" onClick={() => openEdit(offer)}>
                      {formatCurrency(offer.margin ?? 0)}
                    </td>
                    <td className="px-6 py-4 text-center font-medium" onClick={() => openEdit(offer)}>
                      {offer.win_probability}%
                    </td>
                    <td className="px-6 py-4 text-center" onClick={() => openEdit(offer)}>
                      <StatusBadge status={offer.status} />
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-muted-foreground" onClick={() => openEdit(offer)}>
                      {offer.sent_at ? formatDate(offer.sent_at) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={(e) => { e.stopPropagation(); openEdit(offer); }} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-gold"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(offer.id); }} 
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

      {/* DIALOG: DODAJ OFERTE */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="left" className="sm:max-w-lg overflow-y-auto bg-zinc-950 border-gold/10 text-white z-50">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-gold">Nowa Oferta</SheetTitle>
          </SheetHeader>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="offerNo" className="text-zinc-200">Numer oferty</Label>
                <Input
                  id="offerNo"
                  value={offerNumber}
                  onChange={(e) => setOfferNumber(e.target.value)}
                  placeholder="np. OF-2026-001"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="leadSelect" className="text-zinc-200">Przypisz do klienta (Lead) *</Label>
                <select
                  id="leadSelect"
                  title="Przypisz do klienta"
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                  required
                >
                  <option value="" className="bg-zinc-950">Wybierz leada...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id} className="bg-zinc-950">
                      {l.client_name} ({l.city || "brak lokalizacji"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="modelSelect" className="text-zinc-200">Wybierz Model Domu</Label>
                <select
                  id="modelSelect"
                  title="Wybierz Model Domu"
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
                <Label htmlFor="spSelect" className="text-zinc-200">Przypisz Handlowca</Label>
                <select
                  id="spSelect"
                  title="Przypisz Handlowca"
                  value={salespersonId}
                  onChange={(e) => setSalespersonId(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="" className="bg-zinc-950">Wybierz handlowca...</option>
                  {salespeople.map((sp) => (
                    <option key={sp.id} value={sp.id} className="bg-zinc-950">{sp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="val" className="text-zinc-200">Wartość oferty (zł)</Label>
                <Input
                  id="val"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  placeholder="550000"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="marg" className="text-zinc-200">Marża oferty (zł)</Label>
                <Input
                  id="marg"
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  placeholder="85000"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prob" className="text-zinc-200">Prawdopodobieństwo wygranej (%)</Label>
                <Input
                  id="prob"
                  type="number"
                  min={0}
                  max={100}
                  value={winProbability}
                  onChange={(e) => setWinProbability(Number(e.target.value))}
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stat" className="text-zinc-200">Status oferty</Label>
                <select
                  id="stat"
                  title="Status oferty"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="draft" className="bg-zinc-950">Szkic (draft)</option>
                  <option value="sent" className="bg-zinc-950">Wysłana (sent)</option>
                  <option value="negotiation" className="bg-zinc-950">Negocjacje (negotiation)</option>
                  <option value="won" className="bg-zinc-950">Pozyskana (won)</option>
                  <option value="lost" className="bg-zinc-950">Przegrana (lost)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sentDate" className="text-zinc-200">Data wysłania oferty</Label>
                <Input
                  id="sentDate"
                  type="date"
                  value={sentAt}
                  onChange={(e) => setSentAt(e.target.value)}
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactDate" className="text-zinc-200">Następny kontakt</Label>
                <Input
                  id="contactDate"
                  type="date"
                  value={nextContactAt}
                  onChange={(e) => setNextContactAt(e.target.value)}
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="not" className="text-zinc-200">Uwagi / Warunki oferty</Label>
              <textarea
                id="not"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="np. Dodatkowy pakiet izolacyjny, darmowy montaż..."
                title="Uwagi o ofercie"
                className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white h-24 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} disabled={loading}>
                Anuluj
              </Button>
              <Button type="submit" variant="gold" className="px-6" disabled={loading}>
                {loading ? "Dodawanie..." : "Stwórz ofertę"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* DIALOG: EDYTUJ OFERTE */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="left" className="sm:max-w-lg overflow-y-auto bg-zinc-950 border-gold/10 text-white z-50">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-gold">Edytuj Ofertę</SheetTitle>
          </SheetHeader>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="offerNoEdit" className="text-zinc-200">Numer oferty</Label>
                <Input
                  id="offerNoEdit"
                  value={offerNumber}
                  onChange={(e) => setOfferNumber(e.target.value)}
                  placeholder="np. OF-2026-001"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="leadSelectEdit" className="text-zinc-200">Przypisz do klienta (Lead) *</Label>
                <select
                  id="leadSelectEdit"
                  title="Przypisz do klienta"
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                  required
                >
                  <option value="" className="bg-zinc-950">Wybierz leada...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id} className="bg-zinc-950">
                      {l.client_name} ({l.city || "brak lokalizacji"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="modelSelectEdit" className="text-zinc-200">Wybierz Model Domu</Label>
                <select
                  id="modelSelectEdit"
                  title="Wybierz Model Domu"
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
                <Label htmlFor="spSelectEdit" className="text-zinc-200">Przypisz Handlowca</Label>
                <select
                  id="spSelectEdit"
                  title="Przypisz Handlowca"
                  value={salespersonId}
                  onChange={(e) => setSalespersonId(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="" className="bg-zinc-950">Wybierz handlowca...</option>
                  {salespeople.map((sp) => (
                    <option key={sp.id} value={sp.id} className="bg-zinc-950">{sp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="valEdit" className="text-zinc-200">Wartość oferty (zł)</Label>
                <Input
                  id="valEdit"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  placeholder="550000"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="margEdit" className="text-zinc-200">Marża oferty (zł)</Label>
                <Input
                  id="margEdit"
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  placeholder="85000"
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="probEdit" className="text-zinc-200">Prawdopodobieństwo wygranej (%)</Label>
                <Input
                  id="probEdit"
                  type="number"
                  min={0}
                  max={100}
                  value={winProbability}
                  onChange={(e) => setWinProbability(Number(e.target.value))}
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statEdit" className="text-zinc-200">Status oferty</Label>
                <select
                  id="statEdit"
                  title="Status oferty"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                >
                  <option value="draft" className="bg-zinc-950">Szkic (draft)</option>
                  <option value="sent" className="bg-zinc-950">Wysłana (sent)</option>
                  <option value="negotiation" className="bg-zinc-950">Negocjacje (negotiation)</option>
                  <option value="won" className="bg-zinc-950">Pozyskana (won)</option>
                  <option value="lost" className="bg-zinc-950">Przegrana (lost)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sentDateEdit" className="text-zinc-200">Data wysłania oferty</Label>
                <Input
                  id="sentDateEdit"
                  type="date"
                  value={sentAt}
                  onChange={(e) => setSentAt(e.target.value)}
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactDateEdit" className="text-zinc-200">Następny kontakt</Label>
                <Input
                  id="contactDateEdit"
                  type="date"
                  value={nextContactAt}
                  onChange={(e) => setNextContactAt(e.target.value)}
                  className="bg-black/40 border-gold/10 text-white"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notEdit" className="text-zinc-200">Uwagi / Warunki oferty</Label>
              <textarea
                id="notEdit"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Np. warunki płatności, czas realizacji..."
                title="Uwagi o ofercie"
                className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white h-24 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-400" 
                onClick={() => selectedOffer && handleDelete(selectedOffer.id)} 
                disabled={loading}
              >
                Usuń ofertę
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

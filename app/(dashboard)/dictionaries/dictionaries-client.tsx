"use client";

import React, { useState } from "react";
import { 
  UserCheck, Home, Shield, ShieldAlert, Plus, Power, ToggleLeft, ToggleRight, Loader2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Salesperson, Model } from "@/lib/types";

interface DictionariesClientProps {
  initialSalespeople: Salesperson[];
  initialModels: Model[];
}

export function DictionariesClient({ initialSalespeople, initialModels }: DictionariesClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [salespeople, setSalespeople] = useState<Salesperson[]>(initialSalespeople);
  const [models, setModels] = useState<Model[]>(initialModels);

  // Statusy i ładowanie
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Rejestracja nowego handlowca
  const [spName, setSpName] = useState("");
  const [spEmail, setSpEmail] = useState("");
  const [revGoal, setSpRevGoal] = useState<number>(1200000);

  // Dodawanie nowego modelu
  const [modelName, setModelName] = useState("");
  const [modelCat, setModelCat] = useState("");
  const [modelMargin, setModelMargin] = useState<number>(15);

  const handleAddSalesperson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spName.trim()) {
      setErrorMsg("Nazwa handlowca jest wymagana!");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        name: spName.trim(),
        email: spEmail.trim() || null,
        monthly_revenue_goal: revGoal,
        monthly_lead_goal: 25,
        monthly_offer_goal: 12,
        is_active: true
      };

      const { error } = await supabase
        .from("salespeople")
        .insert([payload]);

      if (error) {
        setErrorMsg(`Błąd bazy danych: ${error.message}`);
        setLoading(false);
        return;
      }

      setSpName("");
      setSpEmail("");
      router.refresh();

      const { data: fresh } = await supabase.from("salespeople").select("*");
      if (fresh) {
        setSalespeople(fresh as Salesperson[]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Wystąpił błąd: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSalesperson = async (sp: Salesperson) => {
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase
        .from("salespeople")
        .update({ is_active: !sp.is_active })
        .eq("id", sp.id);

      if (error) {
        setErrorMsg(`Nie udało się zmienić statusu: ${error.message}`);
        setLoading(false);
        return;
      }

      router.refresh();
      const { data: fresh } = await supabase.from("salespeople").select("*");
      if (fresh) {
        setSalespeople(fresh as Salesperson[]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Wystąpił błąd: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim()) {
      setErrorMsg("Nazwa modelu jest wymagana!");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        name: modelName.trim(),
        category: modelCat.trim() || "Inne",
        target_margin_pct: modelMargin,
        is_active: true
      };

      const { error } = await supabase
        .from("models")
        .insert([payload]);

      if (error) {
        setErrorMsg(`Błąd bazy danych: ${error.message}`);
        setLoading(false);
        return;
      }

      setModelName("");
      setModelCat("");
      router.refresh();

      const { data: fresh } = await supabase.from("models").select("*");
      if (fresh) {
        setModels(fresh as Model[]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Wystąpił błąd: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModel = async (model: Model) => {
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase
        .from("models")
        .update({ is_active: !model.is_active })
        .eq("id", model.id);

      if (error) {
        setErrorMsg(`Nie udało się zmienić statusu: ${error.message}`);
        setLoading(false);
        return;
      }

      router.refresh();
      const { data: fresh } = await supabase.from("models").select("*");
      if (fresh) {
        setModels(fresh as Model[]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Wystąpił błąd: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <Card className="border-red-500/20 bg-red-500/10">
          <CardContent className="p-4 flex items-center gap-3 text-red-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{errorMsg}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="salespeople" className="space-y-6">
        <TabsList className="bg-black/20 border border-gold/10 p-1 rounded-lg">
          <TabsTrigger value="salespeople" className="gap-2 text-zinc-400 data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            <UserCheck className="h-4 w-4" />
            Handlowcy ({salespeople.length})
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2 text-zinc-400 data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            <Home className="h-4 w-4" />
            Modele domów ({models.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: HANDLOWCY */}
        <TabsContent value="salespeople" className="space-y-6 outline-none focus:outline-none">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Formularz dodawania */}
            <Card className="border-gold/10 bg-card/40 backdrop-blur-xl lg:col-span-1 h-fit">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-gold/10 pb-3">
                  <Shield className="h-5 w-5 text-gold" />
                  <h3 className="font-bold text-white text-md">Dodaj Handlowca</h3>
                </div>
                <form onSubmit={handleAddSalesperson} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="spName" className="text-zinc-300 font-semibold text-sm">Imię i nazwisko *</Label>
                    <Input 
                      id="spName"
                      placeholder="np. Magda K"
                      value={spName}
                      onChange={(e) => setSpName(e.target.value)}
                      className="bg-black/40 border-gold/10 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="spEmail" className="text-zinc-300 font-semibold text-sm">Email</Label>
                    <Input 
                      id="spEmail"
                      type="email"
                      placeholder="np. magda.k@adezo.pl"
                      value={spEmail}
                      onChange={(e) => setSpEmail(e.target.value)}
                      className="bg-black/40 border-gold/10 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="spGoal" className="text-zinc-300 font-semibold text-sm">Cel miesięczny (zł)</Label>
                    <Input 
                      id="spGoal"
                      type="number"
                      placeholder="1200000"
                      value={revGoal}
                      onChange={(e) => setSpRevGoal(Number(e.target.value))}
                      className="bg-black/40 border-gold/10 text-white"
                    />
                  </div>
                  <Button type="submit" variant="gold" className="w-full shrink-0" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Dodaj Handlowca
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Tabela/Widok listy */}
            <Card className="border-gold/10 bg-card/60 lg:col-span-2">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-white text-lg border-b border-gold/5 pb-2">Lista Handlowców</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-zinc-300">
                    <thead className="text-xs uppercase bg-black/30 text-gold border-b border-gold/5">
                      <tr>
                        <th className="px-4 py-3">Nazwisko i Imię</th>
                        <th className="px-4 py-3">Adres E-mail</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Akcja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/5">
                      {salespeople.map((sp) => (
                        <tr key={sp.id} className="hover:bg-gold/5 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">{sp.name}</td>
                          <td className="px-4 py-3 text-zinc-400">{sp.email || "—"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sp.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                              <Power className="h-3 w-3" />
                              {sp.is_active ? "Aktywny" : "Nieaktywny"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`text-xs ${sp.is_active ? 'hover:text-red-400 hover:bg-red-500/10' : 'hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                              onClick={() => handleToggleSalesperson(sp)}
                              disabled={loading}
                              title="Zmień status aktywności"
                            >
                              {sp.is_active ? (
                                <span className="flex items-center gap-1"><ToggleRight className="h-5 w-5 text-emerald-400" />Dezaktywuj</span>
                              ) : (
                                <span className="flex items-center gap-1"><ToggleLeft className="h-5 w-5 text-zinc-400" />Aktywuj</span>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: MODELE DOMÓW */}
        <TabsContent value="models" className="space-y-6 outline-none focus:outline-none">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Formularz dodawania */}
            <Card className="border-gold/10 bg-card/40 backdrop-blur-xl lg:col-span-1 h-fit">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-gold/10 pb-3">
                  <ShieldAlert className="h-5 w-5 text-gold" />
                  <h3 className="font-bold text-white text-md">Dodaj Model</h3>
                </div>
                <form onSubmit={handleAddModel} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="modelName" className="text-zinc-300 font-semibold text-sm">Nazwa modelu *</Label>
                    <Input 
                      id="modelName"
                      placeholder="np. Tirana"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="bg-black/40 border-gold/10 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="modelCat" className="text-zinc-300 font-semibold text-sm">Kategoria</Label>
                    <Input 
                      id="modelCat"
                      placeholder="np. Nowoczesna Stodoła"
                      value={modelCat}
                      onChange={(e) => setModelCat(e.target.value)}
                      className="bg-black/40 border-gold/10 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="modelMargin" className="text-zinc-300 font-semibold text-sm">Marża docelowa (%)</Label>
                    <Input 
                      id="modelMargin"
                      type="number"
                      placeholder="15"
                      value={modelMargin}
                      onChange={(e) => setModelMargin(Number(e.target.value))}
                      className="bg-black/40 border-gold/10 text-white"
                    />
                  </div>
                  <Button type="submit" variant="gold" className="w-full shrink-0" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Dodaj Model domku
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Tabela/Widok listy */}
            <Card className="border-gold/10 bg-card/60 lg:col-span-2">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-white text-lg border-b border-gold/5 pb-2">Katalog Modelów</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-zinc-300">
                    <thead className="text-xs uppercase bg-black/30 text-gold border-b border-gold/5">
                      <tr>
                        <th className="px-4 py-3">Nazwa modelu</th>
                        <th className="px-4 py-3">Kategoria</th>
                        <th className="px-4 py-3 text-center">Marża (%)</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Akcja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/5">
                      {models.map((model) => (
                        <tr key={model.id} className="hover:bg-gold/5 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">{model.name}</td>
                          <td className="px-4 py-3 text-zinc-400">{model.category || "—"}</td>
                          <td className="px-4 py-3 text-center font-mono text-gold">{model.target_margin_pct || "—"}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${model.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                              <Power className="h-3 w-3" />
                              {model.is_active ? "Aktywny" : "Nieaktywny"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`text-xs ${model.is_active ? 'hover:text-red-400 hover:bg-red-500/10' : 'hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                              onClick={() => handleToggleModel(model)}
                              disabled={loading}
                              title="Zmień status aktywności"
                            >
                              {model.is_active ? (
                                <span className="flex items-center gap-1"><ToggleRight className="h-5 w-5 text-emerald-400" />Dezaktywuj</span>
                              ) : (
                                <span className="flex items-center gap-1"><ToggleLeft className="h-5 w-5 text-zinc-400" />Aktywuj</span>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

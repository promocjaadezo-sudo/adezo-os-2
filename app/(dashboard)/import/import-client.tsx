"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, Play
} from "lucide-react";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import type { Salesperson } from "@/lib/types";

interface ImportClientProps {
  salespeople: Salesperson[];
}

export function ImportClient({ salespeople }: ImportClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<unknown[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({
    client_name: "",
    phone: "",
    email: "",
    city: "",
    salesperson_name: "",
    status: "",
    budget: ""
  });

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const dbFields = [
    { key: "client_name", label: "Klient (Nazwa firmy / Imię i Nazwisko) *", required: true },
    { key: "phone", label: "Specyfikacja Telefonu", required: false },
    { key: "email", label: "Adres E-mail", required: false },
    { key: "city", label: "Lokalizacja / Miasto", required: false },
    { key: "salesperson_name", label: "Handlowiec (Imię i Nazwisko / Email)", required: false },
    { key: "status", label: "Status (np. new, qualified...)", required: false },
    { key: "budget", label: "Budżet inwestycji", required: false }
  ];

  // Odczytanie pliku
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg("");
    setSuccessCount(null);
    setProgress(0);

    const reader = new FileReader();

    if (selectedFile.name.endsWith(".csv")) {
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          // Parsowanie CSV uwzględniające przecinki lub średniki
          const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length === 0) {
            setErrorMsg("Plik CSV jest pusty.");
            return;
          }

          const parsedArr = lines.map(line => {
            // Uproszczone rozbijanie uwzględniające cudzysłowy
            const matches = line.match(/(".*?"|[^";,]+|(?=";)|(?=,))/g) || [];
            return matches.map(cell => cell.replace(/^"|"$/g, "").trim());
          });

          const parsedHeaders = parsedArr[0];
          setHeaders(parsedHeaders);
          setRawRows(parsedArr.slice(1));
          autoMapHeaders(parsedHeaders);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setErrorMsg(`Błąd czytania CSV: ${msg}`);
        }
      };
      reader.readAsText(selectedFile, "UTF-8");
    } else {
      // XLSX / XLS
      reader.onload = (evt) => {
        try {
          const binary = evt.target?.result;
          const workbook = XLSX.read(binary, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

          if (data.length === 0) {
            setErrorMsg("Zeszyt Excel jest pusty.");
            return;
          }

          const parsedHeaders = (data[0] as unknown[]).map(String);
          setHeaders(parsedHeaders);
          setRawRows(data.slice(1) as unknown[][]);
          autoMapHeaders(parsedHeaders);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setErrorMsg(`Błąd czytania pliku Excel: ${msg}`);
        }
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  // Automatyczne dopasowanie nagłówków do pól bazy danych
  const autoMapHeaders = (detectedHeaders: string[]) => {
    const newMapping: Record<string, string> = {
      client_name: "",
      phone: "",
      email: "",
      city: "",
      salesperson_name: "",
      status: "",
      budget: ""
    };

    const normalize = (s: string) => s.toLowerCase().trim().replace(/[\s\-_]/g, "");

    detectedHeaders.forEach((h, index) => {
      const normHeader = normalize(h);
      const val = String(index);

      if (normHeader.includes("klient") || normHeader.includes("nazwisko") || normHeader.includes("firma")) {
        newMapping.client_name = val;
      } else if (normHeader.includes("telefon") || normHeader.includes("tel") || normHeader.includes("phone")) {
        newMapping.phone = val;
      } else if (normHeader.includes("email") || normHeader.includes("mail")) {
        newMapping.email = val;
      } else if (normHeader.includes("miasto") || normHeader.includes("city") || normHeader.includes("miejscowo")) {
        newMapping.city = val;
      } else if (normHeader.includes("handlowiec") || normHeader.includes("sprzedawca") || normHeader.includes("sales")) {
        newMapping.salesperson_name = val;
      } else if (normHeader.includes("status")) {
        newMapping.status = val;
      } else if (normHeader.includes("kwota") || normHeader.includes("budzet") || normHeader.includes("budget") || normHeader.includes("warto")) {
        newMapping.budget = val;
      }
    });

    setMapping(newMapping);
  };

  const handleMappingChange = (field: string, colIdxStr: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: colIdxStr
    }));
  };

  // Obsługa startu procesu importowania
  const handleExecuteImport = async () => {
    if (!mapping.client_name) {
      setErrorMsg("Mapowanie pola 'Klient' jest wymagane, aby zaimportować rekord.");
      return;
    }
    setErrorMsg("");
    setImporting(true);
    setProgress(0);

    const clientIdx = Number(mapping.client_name);
    const phoneIdx = mapping.phone ? Number(mapping.phone) : -1;
    const emailIdx = mapping.email ? Number(mapping.email) : -1;
    const cityIdx = mapping.city ? Number(mapping.city) : -1;
    const spIdx = mapping.salesperson_name ? Number(mapping.salesperson_name) : -1;
    const statusIdx = mapping.status ? Number(mapping.status) : -1;
    const budgetIdx = mapping.budget ? Number(mapping.budget) : -1;

    let success = 0;
    const total = rawRows.length;

    for (let i = 0; i < total; i++) {
      const row = rawRows[i];
      const clientVal = row[clientIdx] ? String(row[clientIdx]).trim() : "";
      
      if (!clientVal) {
        // Pomiń puste wiersze klienta (BUILD 006C: Jeśli brakuje klienta, rekord jest pomijany)
        continue;
      }

      const phoneVal = phoneIdx !== -1 && row[phoneIdx] ? String(row[phoneIdx]).trim() : null;
      const emailVal = emailIdx !== -1 && row[emailIdx] ? String(row[emailIdx]).trim() : null;
      const cityVal = cityIdx !== -1 && row[cityIdx] ? String(row[cityIdx]).trim() : null;
      const budgetRaw = budgetIdx !== -1 && row[budgetIdx] ? parseFloat(String(row[budgetIdx]).replace(/[^\d.,]/g, "").replace(",", ".")) : 0;
      const budgetVal = isNaN(budgetRaw) ? 0 : budgetRaw;

      // Status
      let statusVal = "new";
      if (statusIdx !== -1 && row[statusIdx]) {
        const rawStatus = String(row[statusIdx]).toLowerCase().trim();
        if (rawStatus.includes("kontakt") || rawStatus.includes("sent") || rawStatus.includes("wysł")) {
          statusVal = "contacted";
        } else if (rawStatus.includes("kwal") || rawStatus.includes("zweryf") || rawStatus.includes("qual")) {
          statusVal = "qualified";
        } else if (rawStatus.includes("odrz") || rawStatus.includes("disq") || rawStatus.includes("przegr")) {
          statusVal = "disqualified";
        }
      }

      // Handlowiec lookup (BUILD 006C: Jeśli brakuje, przypisz de facto jako null i system rozpozna go jako nieprzypisanego)
      let salespersonIdVal: string | null = null;
      if (spIdx !== -1 && row[spIdx]) {
        const rawSp = String(row[spIdx]).toLowerCase().trim();
        const matchedSp = salespeople.find((sp) => 
          sp.name.toLowerCase().includes(rawSp) || 
          (sp.email && sp.email.toLowerCase().includes(rawSp))
        );
        if (matchedSp) {
          salespersonIdVal = matchedSp.id;
        }
      }

      try {
        const { error } = await supabase.from("leads").insert([{
          client_name: clientVal,
          phone: phoneVal,
          email: emailVal,
          city: cityVal,
          budget: budgetVal,
          status: statusVal,
          salesperson_id: salespersonIdVal,
          source: "Import CSV/Excel",
          temperature: "warm",
          updated_at: new Date().toISOString()
        }]);

        if (!error) {
          success++;
        }
      } catch (err) {
        console.error("Single row insert error:", err);
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setImporting(false);
    setSuccessCount(success);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Card className="border-gold/10 bg-card/40 backdrop-blur-xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gold/10 rounded-xl p-8 bg-black/10 hover:bg-gold/5 transition-all text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv, .xlsx, .xls"
              className="hidden"
              title="Wybierz plik do importu"
            />
            {file ? (
              <div className="space-y-3">
                <FileSpreadsheet className="h-12 w-12 text-gold mx-auto animate-pulse" />
                <div>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ({formatNumber(rawRows.length)} wierszy danych do odwzorowania)
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gold/80 hover:text-gold"
                >
                  Zmień plik
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-zinc-500 mx-auto" />
                <div>
                  <p className="font-medium text-white">Przeciągnij plik tutaj lub kliknij poniżej</p>
                  <p className="text-xs text-muted-foreground mt-1">Obsługiwane formaty: .CSV, .XLSX (Excel)</p>
                </div>
                <Button variant="gold" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Wybierz Plik z Dysku
                </Button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Zaimportowano baze pomyślnie!</span>
              </div>
              <p className="text-sm">
                Dodano <strong>{successCount}</strong> nowych unikalnych rekordów leadów do bazy dancyh Supabase.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PARAMETRY MAPOWANIA */}
      {file && rawRows.length > 0 && successCount === null && (
        <Card className="border-gold/10 bg-card/60 animate-fade-in">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col space-y-1 border-b border-gold/10 pb-4">
              <h3 className="text-lg font-bold text-gold">Mapowanie Kolumn Pliku</h3>
              <p className="text-sm text-zinc-400">
                Połącz kolumny wykryte w pliku z właściwościami bazy handlowej w systemie Adezo.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {dbFields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-zinc-300">
                      {field.label}
                    </Label>
                    <select
                      title={field.label}
                      value={mapping[field.key] || ""}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className="w-full rounded-md border border-gold/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
                    >
                      <option value="">-- Pomiń to pole --</option>
                      {headers.map((h, idx) => (
                        <option key={idx} value={String(idx)}>
                          Kolumna: {h || `Kolumna ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* PODGLĄD MAPOWANIA PIERWSZYCH 3 REKORDÓW Z ANALITYKĄ WALIDACJI (BUILD 006C) */}
              <div className="space-y-4 bg-black/20 p-5 rounded-lg border border-gold/5 animate-fade-in text-zinc-300">
                <div className="border-b border-gold/10 pb-2 mb-3">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide text-gold">Analiza Walidacji Pliku:</h4>
                  <div className="grid grid-cols-2 text-xs gap-y-2 mt-2 font-mono text-zinc-400">
                    <div>Wierszy danych:</div>
                    <div className="text-white font-bold">{rawRows.length}</div>

                    <div>Brak klienta:</div>
                    <div className="text-red-400 font-bold">
                      {rawRows.filter((r) => !r[Number(mapping.client_name)]).length} <span className="text-[10px] text-zinc-500">(rekord pominięty)</span>
                    </div>

                    <div>Brak telefonu:</div>
                    <div className="text-orange-400 font-bold">
                      {rawRows.filter((r) => !mapping.phone || !r[Number(mapping.phone)]).length}
                    </div>

                    <div>Brak handlowca:</div>
                    <div className="text-yellow-400 font-bold">
                      {rawRows.filter((r) => !mapping.salesperson_name || !r[Number(mapping.salesperson_name)]).length} <span className="text-[10px] text-zinc-500">(→ Nieprzypisany)</span>
                    </div>

                    <div>Brak modelu:</div>
                    <div className="text-yellow-400 font-bold">
                      {rawRows.length} <span className="text-[10px] text-zinc-500">(→ Inne)</span>
                    </div>

                    <div>Brak budżetu:</div>
                    <div className="text-blue-400 font-bold">
                      {rawRows.filter((r) => !mapping.budget || !r[Number(mapping.budget)]).length} <span className="text-[10px] text-zinc-500">(→ 0)</span>
                    </div>
                  </div>
                </div>

                <h4 className="font-bold text-white text-sm uppercase tracking-wide text-gold">Podgląd Pierwszych Rekordów:</h4>

                <div className="space-y-3 divide-y divide-gold/5 max-h-[400px] overflow-y-auto">
                  {rawRows.slice(0, 3).map((row, rowIdx) => {
                    const mappedClient = mapping.client_name ? row[Number(mapping.client_name)] : "—";
                    const mappedPhone = mapping.phone ? row[Number(mapping.phone)] : "—";
                    const mappedEmail = mapping.email ? row[Number(mapping.email)] : "—";
                    const mappedCity = mapping.city ? row[Number(mapping.city)] : "—";
                    const mappedBudget = mapping.budget ? row[Number(mapping.budget)] : "—";

                    return (
                      <div key={rowIdx} className="space-y-1.5 pt-3 first:pt-0">
                        <p className="text-xs font-semibold text-gold">REKORD #{rowIdx + 1}</p>
                        <div className="grid grid-cols-2 text-xs gap-x-2 gap-y-1 text-zinc-400">
                          <span className="font-medium text-zinc-300">Klient:</span>
                          <span className="text-white truncate">{String(mappedClient || "—")}</span>
                          
                          <span className="font-medium text-zinc-300">Telefon:</span>
                          <span>{String(mappedPhone || "—")}</span>
                          
                          <span className="font-medium text-zinc-300">E-mail:</span>
                          <span className="truncate">{String(mappedEmail || "—")}</span>
                          
                          <span className="font-medium text-zinc-300">Lokalizacja:</span>
                          <span>{String(mappedCity || "—")}</span>

                          <span className="font-medium text-zinc-300">Budżet:</span>
                          <span className="font-semibold text-white">{String(mappedBudget || "—")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6">
                  {importing ? (
                    <Button variant="outline" className="w-full text-gold border-gold/30 hover:bg-gold/10" disabled>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importowanie danych... {progress}%
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleExecuteImport} 
                      variant="gold" 
                      className="w-full font-bold shadow-luxury-md"
                      disabled={!mapping.client_name}
                    >
                      <Play className="h-4 w-4 mr-2" /> Wykonaj import ({rawRows.length} rekordów)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

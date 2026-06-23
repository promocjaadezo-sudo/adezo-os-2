import { readdirSync } from "node:fs";
import { join } from "node:path";
import * as XLSX from "xlsx";

export type CrmMissingFieldKey =
  | "status"
  | "owner"
  | "value"
  | "contactDate"
  | "offerDate"
  | "salesResult"
  | "lostReason";

export interface CrmMissingFieldIssue {
  recordRef: string;
  missing: CrmMissingFieldKey[];
}

export interface CrmMissingFieldGroup {
  field: CrmMissingFieldKey;
  label: string;
  count: number;
  records: string[];
}

export interface CrmMissingFieldsReport {
  generatedAt: string;
  sourceFile: string;
  totalRecords: number;
  recordsToFix: number;
  issues: CrmMissingFieldIssue[];
  grouped: CrmMissingFieldGroup[];
}

const FIELD_LABELS: Record<CrmMissingFieldKey, string> = {
  status: "status",
  owner: "opiekun",
  value: "wartość",
  contactDate: "data kontaktu",
  offerDate: "data oferty",
  salesResult: "wynik sprzedaży",
  lostReason: "powód przegranej",
};

function normalize(value?: string): string {
  return (value || "").trim().toLowerCase();
}

function parseNumber(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || raw === "") return undefined;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined;
  const value = String(raw).replace(/\s/g, "").replace(",", ".");
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function parseDate(raw: unknown): string | undefined {
  if (raw === null || raw === undefined || raw === "") return undefined;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString();

  const value = String(raw).trim();
  if (!value) return undefined;

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();

  const m = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!m) return undefined;

  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function rowText(row: unknown[], index: number): string | undefined {
  if (index < 0) return undefined;
  const raw = row[index];
  if (raw === null || raw === undefined) return undefined;
  const text = String(raw).trim();
  return text || undefined;
}

function resolveCrmFilePath(): { filePath: string; fileName: string } {
  const envPath = process.env.ADEZO_EXCEL_CRM_FILE;
  if (envPath && envPath.trim()) {
    const filePath = envPath.trim();
    const fileName = filePath.split(/[/\\]/).pop() || filePath;
    return { filePath, fileName };
  }

  const crmDir = join(process.cwd(), "crm");
  const candidates = readdirSync(crmDir)
    .filter((name) => name.toLowerCase().endsWith(".xlsx"))
    .filter((name) => !name.startsWith("~$"))
    .sort((left, right) => (left > right ? -1 : 1));

  const preferred = candidates.find((name) => name.includes("BUILD034K_CRM_CLEANUP_FINAL_NEW")) || candidates[0];
  if (!preferred) throw new Error("Brak pliku CRM Excel (.xlsx) w katalogu crm.");

  return {
    filePath: join(crmDir, preferred),
    fileName: preferred,
  };
}

function findHeaderRow(rows: unknown[][]): number {
  for (let index = 0; index < Math.min(rows.length, 25); index += 1) {
    const cells = (rows[index] || []).map((cell) => normalize(String(cell || "")));
    if (cells.some((c) => c.includes("nr oferty")) && cells.some((c) => c.includes("status"))) {
      return index;
    }
  }
  return 3;
}

function findColumnIndex(headers: string[], aliases: string[], fallback = -1): number {
  const normalizedHeaders = headers.map((h) => normalize(h));
  for (const alias of aliases) {
    const idx = normalizedHeaders.findIndex((header) => header.includes(normalize(alias)));
    if (idx >= 0) return idx;
  }
  return fallback;
}

function isLostRow(status?: string, salesResult?: string): boolean {
  const value = `${normalize(status)} ${normalize(salesResult)}`;
  return value.includes("utracon") || value.includes("przegran") || value.includes("lost") || value.includes("nie");
}

function maskOfferId(offerId?: string): string {
  if (!offerId) return "NO-OFFER";
  const cleaned = offerId.trim();
  if (cleaned.length <= 4) return "***";
  return `${cleaned.slice(0, 2)}***${cleaned.slice(-2)}`;
}

export async function createCrmMissingFieldsReport(): Promise<CrmMissingFieldsReport> {
  try {
    const { filePath, fileName } = resolveCrmFilePath();
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const crmSheet = workbook.Sheets["CRM_MAGDY"] || workbook.Sheets[workbook.SheetNames[0]];
    if (!crmSheet) {
      throw new Error("Nie znaleziono arkusza CRM_MAGDY w pliku CRM.");
    }

    const rawRows = XLSX.utils.sheet_to_json(crmSheet, { header: 1, defval: null, raw: true }) as unknown[][];
    const headerRowIndex = findHeaderRow(rawRows);
    const headers = (rawRows[headerRowIndex] || []).map((cell, idx) => {
      const text = String(cell || "").trim();
      return text || `COL_${idx + 1}`;
    });

    const idxDataKont = findColumnIndex(headers, ["DATA KOLEJNEGO KONTAKTU", "DATA KONTAKTU"]);
    const idxNrOferty = findColumnIndex(headers, ["NR OFERTY", "NUMER OFERTY"]);
    const idxObsluga = findColumnIndex(headers, ["OBSLUGA", "OPIEKUN", "MAGDA"]);
    const idxKwota = findColumnIndex(headers, ["KWOTA", "WARTOSC", "WARTOŚĆ"]);
    const idxStatus = findColumnIndex(headers, ["STATUS"]);
    const idxDataOferty = findColumnIndex(headers, ["DATA OFERTY", "OFERTA DATA"]);
    const idxWynikSprzedazy = findColumnIndex(headers, ["WYNIK SPRZEDAZY", "WYNIK SPRZEDAŻY", "WYNIK"]);
    const idxPowodPrzegranej = findColumnIndex(headers, ["POWOD PRZEGRANEJ", "POWÓD PRZEGRANEJ", "REASON LOST"]);

    const groupedMap = new Map<CrmMissingFieldKey, Set<string>>();
    const allKeys: CrmMissingFieldKey[] = ["status", "owner", "value", "contactDate", "offerDate", "salesResult", "lostReason"];
    for (const key of allKeys) groupedMap.set(key, new Set());

    const issues: CrmMissingFieldIssue[] = [];
    let totalRecords = 0;

    for (let rowIndex = headerRowIndex + 1; rowIndex < rawRows.length; rowIndex += 1) {
      const row = rawRows[rowIndex] || [];
      const nrOferty = rowText(row, idxNrOferty);
      if (!nrOferty) continue;
      totalRecords += 1;

      const status = rowText(row, idxStatus);
      const owner = rowText(row, idxObsluga);
      const value = parseNumber(row[idxKwota]);
      const contactDate = parseDate(row[idxDataKont]);
      const offerDate = parseDate(row[idxDataOferty]);
      const salesResult = rowText(row, idxWynikSprzedazy);
      const lostReason = rowText(row, idxPowodPrzegranej);
      const missing: CrmMissingFieldKey[] = [];

      const recordRef = `ROW-${rowIndex + 1}/${maskOfferId(nrOferty)}`;

      if (!status) {
        missing.push("status");
        groupedMap.get("status")?.add(recordRef);
      }
      if (!owner) {
        missing.push("owner");
        groupedMap.get("owner")?.add(recordRef);
      }
      if (!value || value <= 0) {
        missing.push("value");
        groupedMap.get("value")?.add(recordRef);
      }
      if (!contactDate) {
        missing.push("contactDate");
        groupedMap.get("contactDate")?.add(recordRef);
      }
      if (!offerDate) {
        missing.push("offerDate");
        groupedMap.get("offerDate")?.add(recordRef);
      }
      if (!salesResult) {
        missing.push("salesResult");
        groupedMap.get("salesResult")?.add(recordRef);
      }
      if (isLostRow(status, salesResult) && !lostReason) {
        missing.push("lostReason");
        groupedMap.get("lostReason")?.add(recordRef);
      }

      if (missing.length > 0) {
        issues.push({
          recordRef,
          missing,
        });
      }
    }

    const grouped: CrmMissingFieldGroup[] = allKeys
      .map((key) => {
        const refs = Array.from(groupedMap.get(key) || []);
        return {
          field: key,
          label: FIELD_LABELS[key],
          count: refs.length,
          records: refs,
        };
      })
      .sort((left, right) => right.count - left.count);

    return {
      generatedAt: new Date().toISOString(),
      sourceFile: fileName,
      totalRecords,
      recordsToFix: issues.length,
      issues,
      grouped,
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      sourceFile: "",
      totalRecords: 0,
      recordsToFix: 0,
      issues: [],
      grouped: [
        { field: "status", label: FIELD_LABELS.status, count: 0, records: [] },
        { field: "owner", label: FIELD_LABELS.owner, count: 0, records: [] },
        { field: "value", label: FIELD_LABELS.value, count: 0, records: [] },
        { field: "contactDate", label: FIELD_LABELS.contactDate, count: 0, records: [] },
        { field: "offerDate", label: FIELD_LABELS.offerDate, count: 0, records: [] },
        { field: "salesResult", label: FIELD_LABELS.salesResult, count: 0, records: [] },
        { field: "lostReason", label: FIELD_LABELS.lostReason, count: 0, records: [] },
      ],
    };
  }
}

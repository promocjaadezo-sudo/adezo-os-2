import type { ExcelCrmRow } from "./excel-crm-mapper";

export interface ExcelCrmValidationSummary {
  incompleteRows: number;
  incompleteFields: number;
  missingByField: Record<
    "status" | "owner" | "value" | "contactDate" | "offerDate" | "salesResult",
    number
  >;
  warnings: string[];
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

export function validateExcelCrmRows(rows: ExcelCrmRow[]): ExcelCrmValidationSummary {
  const missingByField = {
    status: 0,
    owner: 0,
    value: 0,
    contactDate: 0,
    offerDate: 0,
    salesResult: 0,
  };

  let incompleteRows = 0;
  let incompleteFields = 0;

  for (const row of rows) {
    let rowHasMissing = false;

    if (isEmpty(row.status)) {
      missingByField.status += 1;
      incompleteFields += 1;
      rowHasMissing = true;
    }
    if (isEmpty(row.obsluga)) {
      missingByField.owner += 1;
      incompleteFields += 1;
      rowHasMissing = true;
    }
    if (row.kwota == null || Number.isNaN(row.kwota) || row.kwota <= 0) {
      missingByField.value += 1;
      incompleteFields += 1;
      rowHasMissing = true;
    }
    if (isEmpty(row.dataKontaktu)) {
      missingByField.contactDate += 1;
      incompleteFields += 1;
      rowHasMissing = true;
    }
    if (isEmpty(row.dataOferty)) {
      missingByField.offerDate += 1;
      incompleteFields += 1;
      rowHasMissing = true;
    }
    if (isEmpty(row.wynikSprzedazy)) {
      missingByField.salesResult += 1;
      incompleteFields += 1;
      rowHasMissing = true;
    }

    if (rowHasMissing) incompleteRows += 1;
  }

  const warnings: string[] = [];
  if (incompleteRows > 0) {
    warnings.push(`DATA INCOMPLETE: ${incompleteRows} wierszy wymaga uzupełnienia.`);
  }
  if (missingByField.status > 0) warnings.push(`Brak statusu: ${missingByField.status}`);
  if (missingByField.owner > 0) warnings.push(`Brak opiekuna/Magdy: ${missingByField.owner}`);
  if (missingByField.value > 0) warnings.push(`Brak wartości: ${missingByField.value}`);
  if (missingByField.contactDate > 0) warnings.push(`Brak daty kontaktu: ${missingByField.contactDate}`);
  if (missingByField.offerDate > 0) warnings.push(`Brak daty oferty: ${missingByField.offerDate}`);
  if (missingByField.salesResult > 0) warnings.push(`Brak wyniku sprzedaży: ${missingByField.salesResult}`);

  return {
    incompleteRows,
    incompleteFields,
    missingByField,
    warnings,
  };
}

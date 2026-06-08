import { getOperatingStore } from "@/lib/operating-model/mock-store";
import type { DataProvider } from "./types";
import { createStatus } from "./utils";

function parseCsvRows(input: string): string[][] {
  return input
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

export class CsvProvider implements DataProvider {
  readonly name = "csv" as const;

  async getStore() {
    const store = getOperatingStore();

    const csvSample = `id,clientName,source,budget,status\nLD-011,Klient CSV,google,28000,new`;
    const rows = parseCsvRows(csvSample);

    if (rows.length > 1) {
      const [id, clientName, source, budget, status] = rows[1];
      store.leads.push({
        id,
        clientName,
        source: (source as "google") || "google",
        budget: Number(budget || 0),
        createdAt: new Date().toISOString(),
        status: (status as "new") || "new",
      });
    }

    return store;
  }

  async getStatus() {
    const store = await this.getStore();
    return createStatus({
      provider: this.name,
      store,
      message: "CSV provider aktywny.",
    });
  }
}

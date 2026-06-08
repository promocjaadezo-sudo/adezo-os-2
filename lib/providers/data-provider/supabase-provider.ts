import { getOperatingStore } from "@/lib/operating-model/mock-store";
import type { DataProvider } from "./types";
import { createStatus } from "./utils";

export class SupabaseProvider implements DataProvider {
  readonly name = "supabase" as const;

  async getStore() {
    return getOperatingStore();
  }

  async getStatus() {
    const store = await this.getStore();
    return createStatus({
      provider: this.name,
      store,
      message: "Supabase provider (stub) — używane dane mock do czasu pełnej integracji.",
    });
  }
}

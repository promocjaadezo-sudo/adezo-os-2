import { getOperatingStore } from "@/lib/operating-model/mock-store";
import type { DataProvider } from "./types";
import { createStatus } from "./utils";

export class MockProvider implements DataProvider {
  readonly name = "mock" as const;

  async getStore() {
    return getOperatingStore();
  }

  async getStatus() {
    const store = await this.getStore();
    return createStatus({
      provider: this.name,
      store,
      configured: true,
      syncState: "ok",
      message: "Tryb demonstracyjny: używane są dane mock.",
    });
  }
}

import { getOperatingStore } from "@/lib/operating-model/mock-store";
import type { DataProvider } from "./types";
import { createStatus } from "./utils";

export class FirebaseProvider implements DataProvider {
  readonly name = "firebase" as const;

  async getStore() {
    return getOperatingStore();
  }

  async getStatus() {
    const store = await this.getStore();
    return createStatus({
      provider: this.name,
      store,
      message: "Firebase provider (stub) — używane dane mock do czasu pełnej integracji.",
    });
  }
}

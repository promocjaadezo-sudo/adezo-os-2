export type CredentialsMode = "mock" | "service_account" | "oauth_user";

export function resolveCredentialsModeSwitch(value: string | undefined): CredentialsMode {
  const normalized = (value || "mock").trim().toLowerCase();

  if (normalized === "service_account") {
    return "service_account";
  }

  if (normalized === "oauth_user") {
    return "oauth_user";
  }

  return "mock";
}

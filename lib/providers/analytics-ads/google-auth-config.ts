import { resolveCredentialsModeSwitch, type CredentialsMode } from "./credentials-mode-switch";

export interface GoogleAuthConfig {
  requestedMode: CredentialsMode;
  oauthConnected: boolean;
  ownerEmail: string;
}

export function resolveGoogleAuthConfig(): GoogleAuthConfig {
  return {
    requestedMode: resolveCredentialsModeSwitch(process.env.ADEZO_GOOGLE_AUTH_MODE),
    oauthConnected: (process.env.ADEZO_GOOGLE_OAUTH_CONNECTED || "false").toLowerCase() === "true",
    ownerEmail: (process.env.ADEZO_GOOGLE_OAUTH_OWNER_EMAIL || "").trim(),
  };
}

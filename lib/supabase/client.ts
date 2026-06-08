import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  console.log("SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("SUPABASE_KEY_EXISTS", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { url, anonKey } = requireSupabaseEnv();

  return createBrowserClient(
    url,
    anonKey
  );
}

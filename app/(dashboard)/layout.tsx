import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

function hasRuntimeSupabaseEnv() {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url && anonKey && !url.includes("your-project.supabase.co") && anonKey !== "your-anon-key");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail: string | null = null;

  if (hasRuntimeSupabaseEnv()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userEmail = user?.email || null;
  }

  return <DashboardShell userEmail={userEmail}>{children}</DashboardShell>;
}

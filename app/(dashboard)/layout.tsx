import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { url, anonKey } = getSupabaseEnv();
  let userEmail: string | null = null;

  if (url && anonKey) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userEmail = user?.email || null;
  }

  return <DashboardShell userEmail={userEmail}>{children}</DashboardShell>;
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarClock,
  UserCheck,
  Home,
  Megaphone,
  LineChart,
  TrendingDown,
  Skull,
  Award,
  LogOut,
  Upload,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  FileText,
  CalendarClock,
  UserCheck,
  Home,
  Megaphone,
  LineChart,
  TrendingDown,
  Skull,
  Award,
  Upload,
  ShieldAlert,
};

export function Sidebar({ initialUserEmail }: { initialUserEmail?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail || null);

  useEffect(() => {
    if (initialUserEmail) return;
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    }
    fetchUser();
  }, [initialUserEmail]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isCeo = userEmail?.toLowerCase().endsWith("@adezo.pl") || userEmail?.includes("ceo");
  const filteredNavItems = isCeo
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.href === "/dashboard").map((item) => ({
        ...item,
        title: "Magda Desk",
      }));

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card/50 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 border border-gold/20">
          <span className="text-gold font-display font-bold text-lg">A</span>
        </div>
        <div>
          <p className="font-display font-semibold text-sm tracking-wide">ADEZO</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            OS 2.0
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
            const isExact = pathname === item.href;
            const isSubPage = item.href !== "/dashboard" && pathname.startsWith(item.href);
            const isActive = isExact || isSubPage;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-gold/10 text-gold shadow-[inset_0_0_12px_rgba(212,175,55,0.1)] border-l-2 border-gold -ml-[2px]"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Wyloguj się
        </Button>
      </div>
    </aside>
  );
}

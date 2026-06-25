"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarClock,
  Menu,
  LineChart,
  Upload,
  ShieldAlert,
  UserCheck,
  Home,
  Megaphone,
  TrendingDown,
  Skull,
  Award,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";

const MOBILE_QUICK_NAV = [
  { href: "/ceo-dashboard", icon: LayoutDashboard, label: "CEO" },
  { href: "/sales-command-center", icon: CalendarClock, label: "Command" },
  { href: "/leads", icon: Users, label: "Leady" },
  { href: "/followups", icon: CalendarClock, label: "Follow" },
];

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

export function MobileNav({ initialUserEmail }: { initialUserEmail?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail || null);

  useEffect(() => {
    if (initialUserEmail) return;

    const { url, anonKey } = getSupabaseEnv();
    if (!url || !anonKey) return;

    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    }
    fetchUser();
  }, [initialUserEmail]);

  const isCeo = userEmail?.toLowerCase().endsWith("@adezo.pl") || userEmail?.includes("ceo");
  const filteredNavItems = isCeo
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.href === "/dashboard").map((item) => ({
        ...item,
        title: "Magda Desk",
      }));

  const filteredQuickNav = isCeo
    ? MOBILE_QUICK_NAV
    : [{ href: "/dashboard", icon: LayoutDashboard, label: "Magda Desk" }];

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 border border-gold/20">
            <span className="text-gold font-display font-bold">A</span>
          </div>
          <span className="font-display font-semibold text-sm">ADEZO OS 2.0</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card border-border p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="font-display text-left">Nawigacja</SheetTitle>
            </SheetHeader>
            <nav className="p-3 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-gold/10 text-gold"
                        : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/90 backdrop-blur-xl">
        <div className="flex items-center justify-around h-16 px-2">
          {filteredQuickNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[64px]",
                  isActive ? "text-gold" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

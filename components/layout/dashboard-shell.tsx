import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
}

export function DashboardShell({ children, userEmail }: DashboardShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar initialUserEmail={userEmail} />
      <MobileNav initialUserEmail={userEmail} />
      <main className="lg:pl-64">
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 pb-24 lg:pb-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Building2, LayoutDashboard, Users, CreditCard, ScanLine, CalendarClock, Dumbbell, ClipboardList,
  Package, Wallet, ShieldCheck, QrCode, Settings, History, Menu, X, Search, Bell, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCloud } from "./CloudProvider";
import { useStore } from "@/lib/store";
import { initials } from "@/lib/mock";
import { Button } from "./ui/button";

const nav = [
  { to: "/gym", label: "Gym Profile", icon: Building2 },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/members", label: "Members", icon: Users },
  { to: "/memberships", label: "Memberships", icon: CreditCard },
  { to: "/attendance", label: "Attendance", icon: ScanLine },
  { to: "/sessions", label: "Daily Sessions", icon: CalendarClock },
  { to: "/trainers", label: "Trainers", icon: Dumbbell },
  { to: "/workouts", label: "Workout Programs", icon: ClipboardList },
  { to: "/products", label: "Products & Inventory", icon: Package },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/staff", label: "Staff & Roles", icon: ShieldCheck },
  { to: "/qr", label: "QR Management", icon: QrCode },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/activity", label: "Activity Logs", icon: History },
] as const;

export function GymShell({ children }: { children: ReactNode }) {
  const c=useCloud(); const gym=useStore(s=>s.gym);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-6">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">IH</span>
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-semibold text-sidebar-accent-foreground">IRONHAUS</div>
          <div className="text-[11px] text-muted-foreground">Gym OS · {gym.code}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {nav.map((n) => {
          const active = path === n.to || path.startsWith(n.to + "/");
          return (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
              <n.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Button variant="ghost" className="w-full justify-start" onClick={()=>void c.logout()}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {sidebar}
          <button aria-label="Close menu" className="flex-1 bg-background/70" onClick={() => setOpen(false)} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur sm:px-8">
          <button aria-label="Open menu" className="lg:hidden" onClick={() => setOpen(true)}>{open ? <X /> : <Menu className="h-5 w-5" />}</button>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0" />
            <input placeholder="Search members, transactions…" className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground" />
          </div>
          <button aria-label="Notifications" className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border bg-card">
            <Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
          {c.role !== 'Owner' && <Button asChild size="sm" variant="outline"><Link to="/gyms">Switch gym</Link></Button>}<div className="hidden items-center gap-2 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display text-xs font-semibold text-primary">{initials(c.profile?.full_name??"")}</span>
            <div className="text-xs"><div className="font-semibold">{c.profile?.full_name}</div><div className="text-muted-foreground">{c.role}</div></div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useCloud } from '@/components/CloudProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Inbox, Building2, Users, LogOut, Receipt } from 'lucide-react';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/super-admin')({
  head: () => seo('Platform administration', 'IronHaus platform super admin: gym requests, approved gyms, clients and platform metrics.'),
  component: SuperAdminLayout,
});

const nav = [
  { to: '/super-admin', label: 'Platform Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/super-admin/requests', label: 'Gym Requests', icon: Inbox },
  { to: '/super-admin/gyms', label: 'Approved Gyms', icon: Building2 },
  { to: '/super-admin/clients', label: 'Clients', icon: Users },
  { to: '/super-admin/expenses', label: 'Expenses & Bills', icon: Receipt },
] as const;

function SuperAdminLayout() {
  const c = useCloud();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (c.role !== 'super_admin') return <div className="p-12">Administrator access required.</div>;
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary font-display font-bold text-primary-foreground">IH</span>
          <div>
            <div className="font-display text-lg font-semibold">IRONHAUS Platform</div>
            <div className="text-xs text-muted-foreground">Super Admin · fictional demo data</div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void c.logout()}><LogOut className="h-4 w-4" /> Sign out</Button>
      </div>
      <nav className="mb-8 flex flex-wrap gap-2">
        {nav.map((n) => {
          const active = 'exact' in n && n.exact ? path === n.to : path.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to}
              className={cn('flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                active ? 'border-primary/40 bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <n.icon className={cn('h-4 w-4', active && 'text-primary')} />{n.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </div>
  );
}

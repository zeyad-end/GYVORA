import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { PageHeader, StatCard, Panel } from '@/components/kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Building2, CreditCard, Users, Wallet, TrendingUp, UserPlus } from 'lucide-react';
import { useDemoStore, PERIODS, periodRange, inRange, platformTotals, type Period } from '@/lib/demo';
import { egp } from '@/lib/mock';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/super-admin/')({
  head: () => seo('Platform dashboard', 'Fictional platform metrics: gyms, subscriptions, clients and demo revenue.'),
  component: PlatformDashboard,
});

function PlatformDashboard() {
  const gyms = useDemoStore((s) => s.gyms);
  const clients = useDemoStore((s) => s.clients);
  const revenue = useDemoStore((s) => s.revenue);
  const expenses = useDemoStore((s) => s.expenses);
  const [period, setPeriod] = useState<Period>('year');
  const [custom, setCustom] = useState({ from: '2026-01-01', to: '2026-12-31' });

  const { from, to } = periodRange(period, custom);
  const filteredRevenue = useMemo(() => revenue.filter((r) => inRange(r.date, from, to)), [revenue, from.getTime(), to.getTime()]);
  const totalRevenue = filteredRevenue.reduce((sum, r) => sum + r.amount, 0);
  const totals = platformTotals(revenue, expenses, from, to);
  const newGyms = gyms.filter((g) => inRange(g.start, from, to)).length;
  const activeSubs = gyms.filter((g) => g.status === 'Active').length;

  // Monthly revenue bars across the selected range.
  const bars = useMemo(() => {
    const months: { label: string; amount: number }[] = [];
    const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 1);
    while (cursor <= end && months.length < 24) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const amount = filteredRevenue
        .filter((r) => {
          const d = new Date(r.date + 'T12:00:00');
          return d.getFullYear() === y && d.getMonth() === m;
        })
        .reduce((s, r) => s + r.amount, 0);
      months.push({ label: cursor.toLocaleString('en-US', { month: 'short', year: '2-digit' }), amount });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }, [filteredRevenue, from.getTime(), to.getTime()]);
  const maxBar = Math.max(1, ...bars.map((b) => b.amount));

  return (
    <div>
      <PageHeader title="Platform Dashboard" subtitle="All figures are fictional demo data — no real payments were collected." />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {PERIODS.map((p) => (
          <Button key={p.id} size="sm" variant={period === p.id ? 'default' : 'outline'} onClick={() => setPeriod(p.id)}>{p.label}</Button>
        ))}
        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <Input type="date" value={custom.from} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} className="h-9 w-auto" />
            <span className="text-sm text-muted-foreground">to</span>
            <Input type="date" value={custom.to} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} className="h-9 w-auto" />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Approved gyms" value={String(gyms.length)} icon={Building2} delta={`+${newGyms} in period`} tone="good" />
        <StatCard label="Active subscriptions" value={String(activeSubs)} icon={CreditCard} delta={`${gyms.length - activeSubs} frozen`} />
        <StatCard label="Total clients" value={String(clients.length)} icon={Users} delta="Across all gyms" />
        <StatCard label="Subscription Revenue (demo)" value={egp(totalRevenue)} icon={Wallet} delta="Saved demo subscription records" />
        <StatCard label="Expenses (demo)" value={egp(totals.expenses)} icon={Wallet} delta="Platform only · selected period" />
        <StatCard label="Net (demo)" value={`${totals.net < 0 ? '−' : ''}${egp(totals.net)}`} icon={Wallet} delta="Demo revenue minus demo expenses" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Subscription revenue (demo)" className="lg:col-span-2">
          {bars.length === 0 && <p className="py-6 text-sm text-muted-foreground">No revenue in this period.</p>}
          <div className="flex h-44 items-end gap-2">
            {bars.map((b) => (
              <div key={b.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className={cn('w-full rounded-t bg-primary/80')} style={{ height: `${Math.max(2, (b.amount / maxBar) * 150)}px` }} title={`${b.label}: ${egp(b.amount)}`} />
                <span className="w-full truncate text-center text-[10px] text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Growth">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary"><TrendingUp className="h-4 w-4" /></span>
              <div><div className="font-display text-xl font-semibold">{newGyms}</div><div className="text-xs text-muted-foreground">New gyms in period</div></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary"><UserPlus className="h-4 w-4" /></span>
              <div><div className="font-display text-xl font-semibold">{clients.length}</div><div className="text-xs text-muted-foreground">Clients on platform</div></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary"><Wallet className="h-4 w-4" /></span>
              <div><div className="font-display text-xl font-semibold">{filteredRevenue.length}</div><div className="text-xs text-muted-foreground">Demo transactions in period</div></div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, UserCheck, UserX, ScanLine, TrendingUp, TrendingDown, PiggyBank, Banknote, UserPlus, CalendarPlus, RefreshCcw, Receipt, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, PageHeader, StatCard } from "@/components/kit";
import { activity, attendanceSeries, revenueSeries } from "@/lib/mock";
import { seo } from "@/lib/seo";
import { useStore } from '@/lib/store';
import { dailySummary } from '@/lib/gym-updates';
import { localDate } from '@/lib/gym-period';
import { money as egp, currencyOf } from "@/lib/store";

export const Route = createFileRoute("/_gym/dashboard")({
  head: () => seo("Dashboard", "Live overview of members, check-ins, revenue and expenses."),
  component: Dashboard,
});

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false };
const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 } };

function Dashboard() {
  const transactions = useStore(s => s.transactions);
  const gym = useStore(s => s.gym);
  const expenses = dailySummary(transactions, localDate());
  return (
    <>
      <PageHeader title="Dashboard" subtitle={`${new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })} · ${gym.name}`} />
      <div className="mb-6 flex flex-wrap gap-2">
        <Button asChild><Link to="/members"><UserPlus className="h-4 w-4" />Add Member</Link></Button>
        <Button asChild variant="secondary"><Link to="/sessions"><CalendarPlus className="h-4 w-4" />Register Session</Link></Button>
        <Button asChild variant="secondary"><Link to="/memberships"><RefreshCcw className="h-4 w-4" />Renew Membership</Link></Button>
        <Button asChild variant="secondary"><Link to="/finance"><Receipt className="h-4 w-4" />Add Expense</Link></Button>
        <Button asChild variant="secondary"><Link to="/attendance"><QrCode className="h-4 w-4" />Scan Member QR</Link></Button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total members" value="482" icon={Users} delta="+18 this month" tone="good" />
        <StatCard label="Active" value="391" icon={UserCheck} delta="81% of total" />
        <StatCard label="Expired" value="91" icon={UserX} delta="12 expiring this week" tone="bad" />
        <StatCard label="Today's check-ins" value="164" icon={ScanLine} delta="+9% vs last Wed" tone="good" />
        <StatCard label="Today's revenue" value={egp(18420)} icon={TrendingUp} delta="+12% vs avg" tone="good" />
        <StatCard label="Today's expenses" value={egp(expenses.total)} icon={TrendingDown} delta={`${expenses.count} paid expense invoices`} />
        <StatCard label="Net profit" value={egp(15220)} icon={PiggyBank} tone="good" delta="Today" />
        <StatCard label="Cash balance" value={egp(286900)} icon={Banknote} delta="All accounts" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Revenue vs expenses" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={revenueSeries}>
                <defs><linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="1" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" {...axis} /><YAxis {...axis} width={50} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip {...tip} />
                <Area dataKey="revenue" stroke="var(--chart-1)" fill="url(#rv)" strokeWidth={2} />
                <Area dataKey="expenses" stroke="var(--chart-4)" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Recent activity">
          <ul className="space-y-4">
            {activity.slice(0, 5).map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0"><div className="text-sm">{a.action}</div><div className="text-xs text-muted-foreground">{a.user} · {a.time}</div></div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Membership growth">
          <div className="h-52"><ResponsiveContainer><LineChart data={revenueSeries}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis {...axis} width={35} /><Tooltip {...tip} /><Line dataKey="members" stroke="var(--chart-2)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Attendance this week">
          <div className="h-52"><ResponsiveContainer><BarChart data={attendanceSeries}><XAxis dataKey="day" {...axis} /><Tooltip {...tip} cursor={{ fill: "var(--secondary)" }} /><Bar dataKey="visits" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Expense overview">
          <div className="h-52"><ResponsiveContainer><BarChart data={revenueSeries}><XAxis dataKey="month" {...axis} /><Tooltip {...tip} cursor={{ fill: "var(--secondary)" }} /><Bar dataKey="expenses" fill="var(--chart-3)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Panel>
      </div>
    </>
  );
}

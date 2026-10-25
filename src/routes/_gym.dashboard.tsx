import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, UserCheck, UserX, ScanLine, TrendingUp, TrendingDown, PiggyBank, Banknote, UserPlus, CalendarPlus, RefreshCcw, Receipt, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, PageHeader, StatCard } from "@/components/kit";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { dashboardTotals, gymToday } from "@/lib/gym-reporting";
import { membershipStatus } from "@/lib/membership-link";
import { cashSummary } from "@/lib/gym-updates";
import { seo } from "@/lib/seo";
import { useStore } from '@/lib/store';
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
  const sessions = useStore(s => s.sessions);
  const members = useStore(s => s.members);
  const attendance = useStore(s => s.attendance);
  const events = useStore(s => s.membershipEvents) ?? [];
  const today = gymToday(gym);
  const [date, setDate] = useState(today);
  const totals = dashboardTotals(sessions, events, transactions, date);
  const active = members.filter(m => membershipStatus(m, date) !== 'Expired').length;
  const cash = cashSummary(transactions, { from: '0001-01-01', to: date });
  const revenueSeries = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(`${date}T12:00:00`); day.setDate(day.getDate() - 6 + i);
    const key = localDate(day); const values = dashboardTotals(sessions, events, transactions, key);
    return { date: key, month: key.slice(5), revenue: values.revenue, expenses: values.expenses, members: events.filter(e => e.kind === 'created' && e.date <= key).length };
  });
  const attendanceSeries = revenueSeries.map(r => ({ day: r.month, visits: attendance.filter(a => a.date === r.date).length }));
  const activity = events.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,5).map(e => ({ action: `${e.kind === 'created' ? 'Membership created' : 'Membership renewed'} · ${members.find(m => m.id === e.memberId)?.name ?? 'Membership'}`, user: egp(e.price), time: e.date }));
  return (
    <>
      <PageHeader title="Dashboard" subtitle={`${date} · ${gym.name}`} actions={<Input aria-label="Dashboard date" type="date" className="w-auto" value={date} onChange={e => { if(e.target.value) setDate(e.target.value); }} />} />
      <div className="mb-6 flex flex-wrap gap-2">
        <Button asChild><Link to="/members"><UserPlus className="h-4 w-4" />Add Member</Link></Button>
        <Button asChild variant="secondary"><Link to="/sessions"><CalendarPlus className="h-4 w-4" />Register Session</Link></Button>
        <Button asChild variant="secondary"><Link to="/memberships"><RefreshCcw className="h-4 w-4" />Renew Membership</Link></Button>
        <Button asChild variant="secondary"><Link to="/finance"><Receipt className="h-4 w-4" />Add Expense</Link></Button>
        <Button asChild variant="secondary"><Link to="/attendance"><QrCode className="h-4 w-4" />Scan Member QR</Link></Button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total members" value={String(members.length)} icon={Users} delta="Saved memberships" tone="good" />
        <StatCard label="Active" value={String(active)} icon={UserCheck} delta="On selected date" />
        <StatCard label="Expired" value={String(members.length - active)} icon={UserX} delta="On selected date" tone="bad" />
        <StatCard label="Today's check-ins" value={String(attendance.filter(a => a.date === date).length)} icon={ScanLine} delta="Selected date" tone="good" />
        <StatCard label="Today's revenue" value={egp(totals.revenue)} icon={TrendingUp} delta={`${egp(totals.sessionRevenue)} sessions · ${egp(totals.subscriptions)} subscriptions`} tone="good" />
        <StatCard label="Today's expenses" value={egp(totals.expenses)} icon={TrendingDown} delta={`${totals.expenseCount} paid expense invoices`} />
        <StatCard label="Net profit" value={`${totals.net < 0 ? "−" : ""}${egp(totals.net)}`} icon={PiggyBank} tone="good" delta="Selected date" />
        <StatCard label="Cash balance" value={`${cash.net < 0 ? "−" : ""}${egp(cash.net)}`} icon={Banknote} delta="Saved Finance invoices" />
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
        <Panel title="Recorded membership growth">
          <div className="h-52"><ResponsiveContainer><LineChart data={revenueSeries}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis {...axis} width={35} /><Tooltip {...tip} /><Line dataKey="members" stroke="var(--chart-2)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Attendance · last 7 days">
          <div className="h-52"><ResponsiveContainer><BarChart data={attendanceSeries}><XAxis dataKey="day" {...axis} /><Tooltip {...tip} cursor={{ fill: "var(--secondary)" }} /><Bar dataKey="visits" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Expense overview">
          <div className="h-52"><ResponsiveContainer><BarChart data={revenueSeries}><XAxis dataKey="month" {...axis} /><Tooltip {...tip} cursor={{ fill: "var(--secondary)" }} /><Bar dataKey="expenses" fill="var(--chart-3)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Panel>
      </div>
    </>
  );
}

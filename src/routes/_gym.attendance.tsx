import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScanLine, Search, CheckCircle2, Users, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, DataTable, PageHeader, Panel, StatCard, StatusPill, td } from "@/components/kit";
import { members } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/attendance")({
  head: () => seo("Attendance", "Check members in manually or by scanning their QR code."),
  component: Attendance,
});

function Attendance() {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<(typeof members)[number] | null>(null);
  const results = q ? members.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())).slice(0, 4) : [];
  return (
    <>
      <PageHeader title="Attendance" subtitle="Manual or QR check-in" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Today" value="164" icon={Users} delta="+9% vs last week" tone="good" />
        <StatCard label="Peak hour" value="19:00" icon={Clock} />
        <StatCard label="Avg visits / member" value="3.4 / wk" icon={TrendingUp} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="QR check-in">
          <button onClick={() => setPicked(members[1])} className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-surface">
            <ScanLine className="h-12 w-12 text-primary" /><span className="text-sm">Tap to simulate scan</span>
          </button>
        </Panel>
        <Panel title="Manual check-in">
          <div className="flex items-center gap-2 rounded-lg border bg-surface px-3"><Search className="h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search member" className="border-0 bg-transparent shadow-none focus-visible:ring-0" /></div>
          <ul className="mt-3 space-y-1">{results.map((m) => <li key={m.id}><button onClick={() => { setPicked(m); setQ(""); }} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-secondary"><Avatar initials={m.initials} size="sm" /><span className="text-sm">{m.name}</span></button></li>)}</ul>
          {picked && (
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-primary/40 bg-accent p-4">
              <Avatar initials={picked.initials} />
              <div className="min-w-0 flex-1"><div className="font-medium">{picked.name}</div><div className="text-xs text-muted-foreground">{picked.plan} · expires {picked.expiry}</div><div className="mt-1"><StatusPill status={picked.status} /></div></div>
              <Button disabled={picked.status === "Expired"} onClick={() => { toast.success(`${picked.name} checked in`); setPicked(null); }}><CheckCircle2 className="h-4 w-4" />Confirm</Button>
            </div>
          )}
        </Panel>
      </div>
      <Panel title="Today's attendance" className="mt-6">
        <DataTable head={["Member", "Plan", "Time", "Method"]}>
          {members.slice(0, 6).map((m, i) => (
            <tr key={m.id}><td className={td}><div className="flex items-center gap-3"><Avatar initials={m.initials} size="sm" />{m.name}</div></td><td className={td}>{m.plan}</td><td className={`${td} text-muted-foreground`}>{`${21 - i}:${(i * 13) % 60}`.padEnd(5, "0")}</td><td className={td}>{i % 2 ? "Manual" : "QR"}</td></tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}

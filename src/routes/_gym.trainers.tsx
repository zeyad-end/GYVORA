import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/kit";
import { members, trainers, workouts, initials } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/trainers")({
  head: () => seo("Trainers", "Your coaching team, their members, schedules and programs."),
  component: Trainers,
});

function Trainers() {
  const [sel, setSel] = useState(trainers[0]!);
  return (
    <>
      <PageHeader title="Trainers" actions={<Button><Plus className="h-4 w-4" />Add trainer</Button>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          {trainers.map((t) => (
            <button key={t.id} onClick={() => setSel(t)} className={`panel flex w-full items-center gap-4 p-4 text-left ${sel.id === t.id ? "border-primary/50" : ""}`}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent font-display font-semibold text-primary">{initials(t.name.replace("Coach ", ""))}</span>
              <div className="min-w-0"><div className="font-medium">{t.name}</div><div className="text-xs text-primary">{t.specialty}</div><div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{t.phone}</div></div>
            </button>
          ))}
        </div>
        <div className="space-y-6 lg:col-span-2">
          <Panel title={`${sel.name} · Assigned members (${sel.members})`}>
            <div className="flex flex-wrap gap-2">{members.slice(0, 7).map((m) => <span key={m.id} className="rounded-full bg-secondary px-3 py-1.5 text-xs">{m.name}</span>)}</div>
          </Panel>
          <Panel title="Weekly schedule">
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                <div key={d} className="rounded-lg bg-surface p-2"><div className="eyebrow">{d}</div><div className={`mt-2 rounded-md py-1 ${i === 4 ? "text-muted-foreground" : "bg-accent text-primary"}`}>{i === 4 ? "Off" : "17–22"}</div></div>
              ))}
            </div>
          </Panel>
          <Panel title="Workout programs">
            <ul className="space-y-2 text-sm">{workouts.map((w) => <li key={w.name} className="flex justify-between rounded-lg bg-surface p-3"><span>{w.name}</span><span className="text-muted-foreground">{w.exercises.length} exercises</span></li>)}</ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

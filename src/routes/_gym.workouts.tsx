import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, PageHeader, Panel, td } from "@/components/kit";
import { workouts } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/workouts")({
  head: () => seo("Workout programs", "Build workout plans with exercises, sets, reps and trainer notes."),
  component: () => (
    <>
      <PageHeader title="Workout programs" actions={<Button><Plus className="h-4 w-4" />New program</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        {workouts.map((w) => (
          <Panel key={w.name} title={w.name} action={<span className="text-xs text-primary">{w.trainer}</span>}>
            <DataTable head={["Exercise", "Sets", "Reps"]}>
              {w.exercises.map((e) => <tr key={e.name}><td className={td}>{e.name}</td><td className={td}>{e.sets}</td><td className={td}>{e.reps}</td></tr>)}
            </DataTable>
            <div className="mt-4 rounded-lg bg-surface p-3 text-sm text-muted-foreground"><span className="eyebrow mr-2">Trainer notes</span>{w.notes}</div>
          </Panel>
        ))}
      </div>
    </>
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, Field, PageHeader, Panel, selectCls, td } from "@/components/kit";
import { setState, useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/workouts")({
  head: () => seo("Workout programs", "Build workout plans with exercises, sets, reps and trainer notes."),
  component: Workouts,
});

const emptyRow = () => ({ name: "", sets: 3, reps: "10" });

function Workouts() {
  const workouts = useStore((s) => s.workouts);
  const trainers = useStore((s) => s.trainers);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [trainer, setTrainer] = useState(trainers[0]?.name ?? "");
  const [rows, setRows] = useState([emptyRow()]);

  return (
    <>
      <PageHeader title="Workout programs" actions={<Button onClick={() => { setName(""); setRows([emptyRow()]); setOpen(true); }}><Plus className="h-4 w-4" />New program</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        {workouts.map((w) => (
          <Panel key={w.name} title={w.name} action={<span className="text-xs text-primary">{w.trainer}</span>}>
            <DataTable head={["Exercise", "Sets", "Reps"]}>
              {w.exercises.map((e, i) => <tr key={i}><td className={td}>{e.name}</td><td className={td}>{e.sets}</td><td className={td}>{e.reps}</td></tr>)}
            </DataTable>
            {w.notes && <div className="mt-4 rounded-lg bg-surface p-3 text-sm text-muted-foreground"><span className="eyebrow mr-2">Trainer notes</span>{w.notes}</div>}
          </Panel>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader><DialogTitle>New program</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const exercises = rows.filter((r) => r.name.trim()).map((r) => ({ ...r, name: r.name.trim() }));
            if (!exercises.length) { toast.error("Add at least one exercise"); return; }
            setState((s) => ({ workouts: [...s.workouts, { name: name.trim(), trainer, notes: "", exercises }] }));
            toast.success("Program created");
            setOpen(false);
          }}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Program name"><Input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Trainer"><select className={selectCls} value={trainer} onChange={(e) => setTrainer(e.target.value)}>{trainers.map((t) => <option key={t.id}>{t.name}</option>)}</select></Field>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_5rem_5rem_auto] gap-2 text-xs text-muted-foreground"><span>Exercise name</span><span>Sets</span><span>Reps</span><span className="w-9" /></div>
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_5rem_5rem_auto] gap-2">
                  <Input maxLength={60} value={r.name} placeholder="e.g. Deadlift" onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  <Input type="number" min={1} value={r.sets} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, sets: Number(e.target.value) } : x))} />
                  <Input maxLength={10} value={r.reps} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, reps: e.target.value } : x))} />
                  <Button type="button" size="icon" variant="ghost" aria-label="Remove exercise" disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="secondary" onClick={() => setRows([...rows, emptyRow()])}><Plus className="h-4 w-4" />Add exercise</Button>
            </div>
            <DialogFooter><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

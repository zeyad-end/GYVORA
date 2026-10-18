import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProgramEditor, ExerciseImage } from "@/components/ProgramEditor";
import type { Workout } from "@/lib/store";
import { Plus, Trash2, Pencil } from "lucide-react";
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
  const [editing,setEditing]=useState<Workout|null>(null);
  const workouts = useStore((s) => s.workouts);
  const trainers = useStore((s) => s.trainers);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [trainer, setTrainer] = useState(trainers[0]?.name ?? "");
  const [rows, setRows] = useState([emptyRow()]);

  return (
    <>
      <PageHeader title="Workout programs" actions={<Button onClick={() => { setEditing(null); setName(""); setRows([emptyRow()]); setOpen(true); }}><Plus className="h-4 w-4" />New program</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        {workouts.map((w) => (
          <Panel key={w.name} title={w.name} action={<Button size="sm" variant="secondary" onClick={()=>{setEditing(w);setOpen(true);}}><Pencil className="h-4 w-4"/>Edit program</Button>}>
            <DataTable head={["Exercise", "Sets", "Reps", "Image"]}>
              {w.exercises.map((e, i) => <tr key={i}><td className={td}>{e.name}</td><td className={td}>{e.sets}</td><td className={td}>{e.reps}</td><td className={td}><ExerciseImage path={e.image}/></td></tr>)}
            </DataTable>
            {w.notes && <div className="mt-4 rounded-lg bg-surface p-3 text-sm text-muted-foreground"><span className="eyebrow mr-2">Trainer notes</span>{w.notes}</div>}
          </Panel>
        ))}
      </div>

      <ProgramEditor open={open} onClose={()=>setOpen(false)} program={editing} onSave={p=>setState(s=>({workouts:editing?s.workouts.map(w=>w===editing?p:w):[...s.workouts,p]}))}/>

    </>
  );
}

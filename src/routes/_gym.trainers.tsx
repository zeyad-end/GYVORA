import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, PageHeader, Panel } from "@/components/kit";
import { initials } from "@/lib/mock";
import { readFile, saveState, useStore, type Trainer } from "@/lib/store";
import { TrainerSchedule } from "@/components/TrainerSchedule";
import { defaultSchedule, scheduleSchema } from "@/lib/gym-updates";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/trainers")({
  head: () => seo("Trainers", "Your coaching team, their members, schedules and programs."),
  component: Trainers,
});

function TrainerAvatar({ t, size = "h-12 w-12" }: { t: Trainer; size?: string }) {
  return t.image ? (
    <img src={t.image} alt={t.name} className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <span
      className={`grid ${size} shrink-0 place-items-center rounded-full bg-accent font-display font-semibold text-primary`}
    >
      {initials(t.name.replace("Coach ", ""))}
    </span>
  );
}

function Trainers() {
  const trainers = useStore((s) => s.trainers);
  const members = useStore((s) => s.members);
  const workouts = useStore((s) => s.workouts);
  const [selId, setSelId] = useState(trainers[0]?.id ?? "");
  const sel = trainers.find((t) => t.id === selId) ?? trainers[0];
  const [open, setOpen] = useState(false);
  const [img, setImg] = useState("");
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Trainers"
        actions={
          <Button
            onClick={() => {
              setImg("");
              setSchedule(defaultSchedule());
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add trainer
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          {trainers.map((t) => (
            <Button
              variant="ghost"
              key={t.id}
              onClick={() => setSelId(t.id)}
              className={`panel flex h-auto w-full justify-start items-center gap-4 p-4 text-left ${sel?.id === t.id ? "border-primary/50" : ""}`}
            >
              <TrainerAvatar t={t} />
              <div className="min-w-0">
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-primary">{t.specialty}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {t.phone}
                </div>
              </div>
            </Button>
          ))}
        </div>
        {sel && (
          <div className="space-y-6 lg:col-span-2">
            <Panel title={`${sel.name} · Assigned members`}>
              <div className="flex flex-wrap gap-2">
                {members
                  .filter((m) => m.trainer === sel.name)
                  .concat(members.slice(0, 4))
                  .slice(0, 7)
                  .map((m) => (
                    <span key={m.id} className="rounded-full bg-secondary px-3 py-1.5 text-xs">
                      {m.name}
                    </span>
                  ))}
              </div>
            </Panel>
            <Panel
              title="Weekly schedule"
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setScheduleId(sel.id);
                    setSchedule((sel.schedule ?? defaultSchedule()).map((d) => ({ ...d })));
                    setScheduleOpen(true);
                  }}
                >
                  Edit Schedule
                </Button>
              }
            >
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {(sel.schedule ?? defaultSchedule()).map((d) => (
                  <div key={d.day} className="min-w-0 rounded-md bg-surface p-2">
                    <div className="eyebrow">{d.day.slice(0, 3)}</div>
                    <div
                      className={`mt-2 text-xs ${d.available ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {d.available ? (
                        <>
                          {d.start}
                          <br />
                          {d.end}
                        </>
                      ) : (
                        "Off"
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Workout programs">
              <ul className="space-y-2 text-sm">
                {workouts
                  .filter((w) => w.trainer === sel.name)
                  .map((w) => (
                    <li key={w.name} className="flex justify-between rounded-lg bg-surface p-3">
                      <span>{w.name}</span>
                      <span className="text-muted-foreground">{w.exercises.length} exercises</span>
                    </li>
                  ))}
              </ul>
            </Panel>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add trainer</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              try {
                const validated = scheduleSchema.parse(schedule);
                const t: Trainer = {
                  id: crypto.randomUUID(),
                  image: img,
                  name: String(d.get("name")).trim(),
                  specialty: String(d.get("specialty")).trim(),
                  phone: String(d.get("phone")).trim(),
                  bio: "",
                  members: 0,
                  schedule: validated,
                };
                await saveState((s) => ({ trainers: [...s.trainers, t] }));
                setSelId(t.id);
                toast.success("Trainer added");
                setOpen(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not save trainer");
              }
            }}
          >
            <Field label="Trainer name">
              <Input name="name" required maxLength={60} />
            </Field>
            <Field label="Specialty">
              <Input name="specialty" required maxLength={60} />
            </Field>
            <Field label="Phone number">
              <Input name="phone" required maxLength={30} />
            </Field>
            <Field label="Profile image">
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setImg(await readFile(f));
                }}
              />
            </Field>
            {img && <img src={img} alt="Preview" className="h-16 w-16 rounded-full object-cover" />}
            <TrainerSchedule value={schedule} onChange={setSchedule} />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit weekly schedule</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const validated = scheduleSchema.parse(schedule);
                await saveState((s) => ({
                  trainers: s.trainers.map((t) =>
                    t.id === scheduleId ? { ...t, schedule: validated } : t,
                  ),
                }));
                toast.success("Schedule saved");
                setScheduleOpen(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not save schedule");
              }
            }}
          >
            <TrainerSchedule value={schedule} onChange={setSchedule} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setScheduleOpen(false)}>
                Cancel
              </Button>
              <Button>Save schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

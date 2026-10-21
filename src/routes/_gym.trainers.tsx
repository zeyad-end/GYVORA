import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Plus, Pencil, Trash2 } from "lucide-react";
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
import { trainerProfileSchema, updateTrainerProfile, deleteTrainerProfile } from "@/lib/trainer-profiles";

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
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
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
              setEditing(null);
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
            <div key={t.id} className={`panel flex items-center gap-1 pr-2 ${sel?.id === t.id ? "border-primary/50" : ""}`}>
            <Button
              variant="ghost"
              key={t.id}
              onClick={() => setSelId(t.id)}
              className="flex h-auto min-w-0 flex-1 justify-start items-center gap-4 whitespace-normal p-4 text-left"
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
            <Button size="icon" variant="ghost" className="shrink-0" aria-label={`Edit ${t.name}`} title={`Edit ${t.name}`}
              onClick={() => { setEditing(t); setImg(t.image); setOpen(true); }}>
              <Pencil className="h-4 w-4" />
            </Button>
            </div>
          ))}
          {!trainers.length && <p className="text-sm text-muted-foreground">No trainers</p>}
        </div>
        {sel && (
          <div className="space-y-6 lg:col-span-2">
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
            <DialogTitle>{editing ? "Edit trainer" : "Add trainer"}</DialogTitle>
          </DialogHeader>
          <form
            key={editing?.id ?? "new"}
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy || uploading) return;
              const d = new FormData(e.currentTarget);
              setBusy(true);
              try {
                const profile = trainerProfileSchema.parse({ name: String(d.get("name")), specialty: String(d.get("specialty")), phone: String(d.get("phone")), image: img });
                if (editing) {
                  await saveState((s) => ({ trainers: updateTrainerProfile(s.trainers, editing.id, profile) }));
                  toast.success("Trainer saved");
                  setOpen(false);
                  return;
                }
                const validated = scheduleSchema.parse(schedule);
                const t: Trainer = {
                  id: crypto.randomUUID(),
                  ...profile,
                  bio: "",
                  members: 0,
                  schedule: validated,
                };
                await saveState((s) => ({ trainers: [...s.trainers, t] }));
                setSelId(t.id);
                toast.success("Trainer added");
                setOpen(false);
              } catch (error) {
                toast.error(error && typeof error === "object" && "issues" in error ? "Enter a valid name, specialty and phone number" : error instanceof Error ? error.message : "Could not save trainer");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Trainer name">
              <Input aria-label="Trainer name" name="name" required maxLength={60} defaultValue={editing?.name ?? ""} />
            </Field>
            <Field label="Specialty">
              <Input aria-label="Specialty" name="specialty" required maxLength={60} defaultValue={editing?.specialty ?? ""} />
            </Field>
            <Field label="Phone number">
              <Input aria-label="Phone number" name="phone" required maxLength={30} defaultValue={editing?.phone ?? ""} />
            </Field>
            <Field label="Profile image">
              <Input
                type="file"
                aria-label="Profile image"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading || busy}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setUploading(true);
                  try {
                    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 5 * 1024 * 1024) throw new Error("Choose a JPG, PNG or WebP image under 5 MB");
                    setImg(await readFile(f));
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Could not load image");
                  } finally { setUploading(false); }
                }}
              />
            </Field>
            {img && <img src={img} alt="Preview" className="h-16 w-16 rounded-full object-cover" />}
            {!editing && <TrainerSchedule value={schedule} onChange={setSchedule} />}
            <DialogFooter>
              {editing && <Button type="button" variant="destructive" disabled={busy || uploading} onClick={async () => {
                if (!window.confirm(`Delete ${editing.name} from this gym's trainer list?`)) return;
                setBusy(true);
                try {
                  await saveState((s) => ({ trainers: deleteTrainerProfile(s.trainers, editing.id) }));
                  toast.success("Trainer deleted");
                  setOpen(false);
                } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete trainer"); }
                finally { setBusy(false); }
              }}><Trash2 className="h-4 w-4" />Delete trainer</Button>}
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy || uploading}>{busy ? "Saving…" : "Save"}</Button>
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

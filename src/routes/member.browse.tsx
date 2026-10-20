import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useCloud } from "@/components/CloudProvider";
import { ClientShell } from "@/components/ClientShell";
import { ClientGymCard } from "@/components/ClientGymCard";
import { ExerciseImage } from "@/components/ProgramEditor";
import { Button } from "@/components/ui/button";
import type { Workout } from "@/lib/store";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { getDemoSession, saveDemoProgram } from "@/lib/demo";
import { copyProgram } from "@/lib/programs";
import { clientGymContent, useClientGyms } from "@/lib/client-portal";
export const Route = createFileRoute("/member/browse")({
  head: () =>
    seo(
      "Browse gym programs",
      "Choose a joined or subscribed gym and save independent workout copies.",
    ),
  component: Browse,
});
function Browse() {
  const c = useCloud();
  const p = useClientGyms();
  const [selected, setSelected] = useState("");
  const [rows, setRows] = useState<Workout[]>([]);
  const [busy, setBusy] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    setRows([]);
    if (!selected || !p.accessible.some((g) => g.id === selected)) return;
    let active = true;
    void clientGymContent(selected)
      .then((x) => {
        if (active) setRows(x.workouts);
      })
      .catch((e) => toast.error(String(e)));
    return () => {
      active = false;
    };
  }, [selected, p.accessible.length]);
  return (
    <ClientShell title="Browse Gym Programs">
      {!selected ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {p.accessible.map((g) => (
            <ClientGymCard
              key={g.id}
              gym={g}
              actions={<Button onClick={() => setSelected(g.id)}>View Programs</Button>}
            />
          ))}
        </div>
      ) : (
        <>
          <Button variant="outline" onClick={() => setSelected("")}>
            Choose another gym
          </Button>
          <h2 className="my-6 text-xl font-semibold">
            {p.accessible.find((g) => g.id === selected)?.name}
          </h2>
          <div className="space-y-8">
            {rows.map((w, i) => {
              const key = selected + ":" + i;
              return (
                <section key={key} className="border-b pb-6">
                  <h3 className="text-lg font-semibold">{w.name}</h3>
                  <ul className="my-4 space-y-3">
                    {w.exercises.map((e, j) => (
                      <li key={j} className="flex items-center justify-between gap-4">
                        <div>
                          {e.name}
                          <p className="text-sm text-muted-foreground">
                            {e.sets} sets · {e.reps} reps
                          </p>
                        </div>
                        <ExerciseImage path={e.image} />
                      </li>
                    ))}
                  </ul>
                  <Button
                    disabled={busy === key || saved.includes(key)}
                    onClick={async () => {
                      if (!c.profile) return;
                      setBusy(key);
                      try {
                        const independent = copyProgram(w);
                        if (getDemoSession()) saveDemoProgram(c.profile.id, independent);
                        else {
                          const { error } = await supabase
                            .from("client_programs")
                            .insert({
                              user_id: c.profile.id,
                              definition: independent as unknown as Json,
                            });
                          if (error) throw error;
                        }
                        setSaved((s) => [...s, key]);
                        toast.success("Program saved to your personal workouts");
                      } catch (e) {
                        toast.error(String(e));
                      } finally {
                        setBusy("");
                      }
                    }}
                  >
                    {saved.includes(key) ? "Saved" : "Save Program"}
                  </Button>
                </section>
              );
            })}
          </div>
          {!rows.length && <p className="py-8 text-muted-foreground">No programs available.</p>}
        </>
      )}
      {!p.accessible.length && (
        <p className="py-8 text-muted-foreground">No joined or subscribed gyms yet.</p>
      )}
    </ClientShell>
  );
}

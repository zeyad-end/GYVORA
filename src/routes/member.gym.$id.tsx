import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClientShell } from "@/components/ClientShell";
import { Button } from "@/components/ui/button";
import { ExerciseImage } from "@/components/ProgramEditor";
import { clientGymContent, useClientGyms, type ClientGymContent } from "@/lib/client-portal";
import { seo } from "@/lib/seo";
import { egp } from "@/lib/mock";
export const Route = createFileRoute("/member/gym/$id")({
  head: () =>
    seo(
      "Gym client profile",
      "View your gym profile, available workout programs, products and trainers.",
    ),
  component: GymProfile,
});
function GymProfile() {
  const { id } = Route.useParams();
  const p = useClientGyms();
  const gym = p.accessible.find((g) => g.id === id);
  const [tab, setTab] = useState("Gym Profile");
  const [content, setContent] = useState<ClientGymContent | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!gym) return;
    let active = true;
    void clientGymContent(id)
      .then((x) => {
        if (active) setContent(x);
      })
      .catch((e) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, [id, !!gym]);
  return (
    <ClientShell title={gym?.name ?? "Gym"}>
      {!gym ? (
        <p>Join this gym to open its client pages.</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {["Gym Profile", "Workout Programs", "Products", "Trainers"].map((t) => (
              <Button key={t} variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
                {t}
              </Button>
            ))}
          </div>
          {error && <p role="alert">{error}</p>}
          {tab === "Gym Profile" && (
            <div className="space-y-4">
              <ExerciseImage path={gym.image} />
              <p>{gym.description}</p>
              <p className="text-muted-foreground">{gym.location}</p>
            </div>
          )}
          {tab === "Workout Programs" && (
            <div className="space-y-5">
              {content?.workouts.map((w, i) => (
                <section key={i} className="border-b pb-4">
                  <h2 className="text-lg font-semibold">{w.name}</h2>
                  {w.exercises.map((e, j) => (
                    <div key={j} className="flex items-center justify-between gap-3 py-2">
                      <div>
                        {e.name}
                        <p className="text-sm text-muted-foreground">
                          {e.sets} sets · {e.reps} reps
                        </p>
                      </div>
                      <ExerciseImage path={e.image} />
                    </div>
                  ))}
                </section>
              ))}
              {!content?.workouts.length && <p>No programs available.</p>}
            </div>
          )}
          {tab === "Products" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {content?.products.map((x, i) => (
                <article key={i} className="rounded-lg border p-4">
                  <ExerciseImage path={x.image} />
                  <h2>{x.name}</h2>
                  <p className="text-primary">{egp(x.price)}</p>
                </article>
              ))}
              {!content?.products.length && <p>No products available.</p>}
            </div>
          )}
          {tab === "Trainers" && (
            <div className="space-y-5">
              {content?.trainers.map((x, i) => (
                <section key={i} className="border-b pb-4">
                  <ExerciseImage path={x.image} />
                  <h2 className="text-lg font-semibold">{x.name}</h2>
                  <p className="text-primary">{x.specialty}</p>
                  <p>{x.bio}</p>
                </section>
              ))}
              {!content?.trainers.length && <p>No trainers available.</p>}
            </div>
          )}
        </>
      )}
    </ClientShell>
  );
}

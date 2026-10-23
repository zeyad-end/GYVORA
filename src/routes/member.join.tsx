import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScanLine } from "lucide-react";
import { ClientShell } from "@/components/ClientShell";
import { ClientGymCard } from "@/components/ClientGymCard";
import { QRScanner } from "@/components/QRScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClientGyms } from "@/lib/client-portal";
import { seo } from "@/lib/seo";
import { toast } from "sonner";
import { getDemoSession } from '@/lib/demo';
import { useCloud } from '@/components/CloudProvider';
export const Route = createFileRoute("/member/join")({
  head: () =>
    seo("Join a gym", "Find and join gyms by name, Gym ID or QR without purchasing a membership."),
  component: Join,
});
function Join() {
  const p = useClientGyms();
  const c=useCloud();
  const canJoin=(id:string)=>!!getDemoSession()||p.memberships.some(m=>m.gymId===id)||c.gyms.some(g=>g.id===id);
  const [query, setQuery] = useState("");
  const [scan, setScan] = useState(false);
  const [busy, setBusy] = useState("");
  const results = p.directory.filter(
    (g) => !query || g.id === query || g.name.toLowerCase().includes(query.toLowerCase()),
  );
  async function change(id: string, action: "join" | "leave") {
    if (
      action === "leave" &&
      !window.confirm(
        "Remove this joined gym? Your membership history, attendance and saved workouts will remain.",
      )
    )
      return;
    setBusy(id);
    try {
      await p.change(id, action);
      toast.success(action === "join" ? "Gym added — no membership purchased" : "Gym removed");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <ClientShell title="Join a Gym">
      <div className="mb-6 flex gap-3">
        <Input
          aria-label="Gym name or Gym ID"
          placeholder="Gym name or Gym ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="outline" onClick={() => setScan(true)}>
          <ScanLine className="h-4 w-4" />
          Scan Gym QR
        </Button>
      </div>
      {p.error && <p role="alert">{p.error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((g) => (
          <ClientGymCard
            key={g.id}
            gym={g}
            actions={
              <Button
                disabled={busy === g.id || !canJoin(g.id) || p.links.some((l) => l.gymId === g.id)}
                onClick={() => void change(g.id, "join")}
              >
                {p.links.some((l) => l.gymId === g.id) ? "Joined" : !canJoin(g.id)?'Owner approval required':"Join / Add"}
              </Button>
            }
          />
        ))}
      </div>
      {!results.length && <p className="py-6 text-muted-foreground">No matching gyms.</p>}
      <h2 className="mb-4 mt-10 text-xl font-semibold">My Joined Gyms</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {p.joined.map((g) => (
          <ClientGymCard
            key={g.id}
            gym={g}
            actions={
              <Button
                variant="outline"
                disabled={busy === g.id}
                onClick={() => void change(g.id, "leave")}
              >
                Leave / Remove
              </Button>
            }
          />
        ))}
      </div>
      {!p.joined.length && <p className="text-muted-foreground">No joined gyms yet.</p>}
      <QRScanner
        title="Scan Gym QR"
        manualLabel="Gym ID"
        open={scan}
        onClose={() => setScan(false)}
        onScan={(value) => {
          const id = value.replace(/^ironhaus:gym:/, "");
          if (!p.directory.some((g) => g.id === id)) {
            toast.error("No matching Gym ID");
            return false;
          }
          setQuery(id);
          return true;
        }}
      />
    </ClientShell>
  );
}

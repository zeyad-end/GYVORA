import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable, PageHeader, Panel, td } from "@/components/kit";
import { egp, trainers } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/sessions")({
  head: () => seo("Daily sessions", "Register pay-per-session visits with automatic revenue tracking."),
  component: Sessions,
});

const sel = "h-10 w-full rounded-md border bg-surface px-3 text-sm";

function Sessions() {
  const [name, setName] = useState("");
  const [list, setList] = useState([
    { name: "Karim Nabil", type: "CrossFit", trainer: "Coach Tamer", price: 150, method: "Cash" },
    { name: "Hana Mostafa", type: "Personal Training", trainer: "Coach Hossam", price: 400, method: "Card" },
  ]);
  return (
    <>
      <PageHeader title="Daily sessions" subtitle="For customers paying per session" />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Register session" className="lg:col-span-2" action={<Button size="sm" variant="secondary" onClick={() => setName("Layla Hassan")}><ScanLine className="h-4 w-4" />Scan QR</Button>}>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            setList([{ name: name || "Walk-in", type: String(d.get("type")), trainer: String(d.get("trainer")), price: Number(d.get("price")) || 0, method: String(d.get("method")) }, ...list]);
            toast.success("Session saved · revenue & member history updated");
            setName("");
          }}>
            <div className="space-y-2"><Label>Member name</Label><Input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="bg-surface" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Session type</Label><select name="type" className={sel}>{["CrossFit", "Personal Training", "Boxing", "Yoga", "Gym day pass"].map((s) => <option key={s}>{s}</option>)}</select></div>
              <div className="space-y-2"><Label>Trainer</Label><select name="trainer" className={sel}>{trainers.map((t) => <option key={t.id}>{t.name}</option>)}</select></div>
              <div className="space-y-2"><Label>Price (EGP)</Label><Input name="price" type="number" min={0} defaultValue={150} className="bg-surface" /></div>
              <div className="space-y-2"><Label>Payment</Label><select name="method" className={sel}>{["Cash", "Card", "Wallet"].map((s) => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" defaultValue="2026-10-07" className="bg-surface" /></div>
            <Button type="submit" className="w-full">Save session</Button>
          </form>
        </Panel>
        <Panel title="Today's sessions" className="lg:col-span-3">
          <DataTable head={["Member", "Type", "Trainer", "Payment", "Price"]}>
            {list.map((s, i) => <tr key={i}><td className={td}>{s.name}</td><td className={td}>{s.type}</td><td className={`${td} text-muted-foreground`}>{s.trainer}</td><td className={td}>{s.method}</td><td className={`${td} text-primary`}>{egp(s.price)}</td></tr>)}
          </DataTable>
        </Panel>
      </div>
    </>
  );
}

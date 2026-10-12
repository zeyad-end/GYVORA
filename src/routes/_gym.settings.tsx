import { createFileRoute } from "@tanstack/react-router";
import { Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Panel } from "@/components/kit";
import { gym } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/settings")({
  head: () => seo("Settings", "Gym information, branding, currency, language, notifications and branches."),
  component: Settings,
});

const sel = "h-10 w-full rounded-md border bg-surface px-3 text-sm";

function Settings() {
  return (
    <>
      <PageHeader title="Settings" actions={<Button>Save changes</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Gym information">
          <div className="space-y-4">
            <div className="space-y-2"><Label>Gym name</Label><Input defaultValue={gym.name} className="bg-surface" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input defaultValue={gym.phone} className="bg-surface" /></div>
            <div className="space-y-2"><Label>Address</Label><Input defaultValue={gym.location} className="bg-surface" /></div>
          </div>
        </Panel>
        <Panel title="Logo & regional">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground">IH</span>
            <Button variant="secondary"><Upload className="h-4 w-4" />Upload logo</Button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Currency</Label><select className={sel}><option>EGP</option><option>USD</option><option>SAR</option><option>AED</option></select></div>
            <div className="space-y-2"><Label>Language</Label><select className={sel}><option>English</option><option>العربية</option></select></div>
          </div>
        </Panel>
        <Panel title="Notifications">
          <div className="space-y-4">
            {["Membership expiring reminders", "Daily revenue summary", "Low stock alerts", "New member sign-ups"].map((n, i) => (
              <div key={n} className="flex items-center justify-between text-sm"><span>{n}</span><Switch defaultChecked={i !== 3} /></div>
            ))}
          </div>
        </Panel>
        <Panel title="Branches" action={<Button size="sm" variant="secondary"><Plus className="h-4 w-4" />Add branch</Button>}>
          <ul className="space-y-2 text-sm">
            {[["Garden City", "Main · 482 members"], ["New Cairo", "Opening Dec 2026"]].map(([b, s]) => <li key={b} className="flex justify-between rounded-lg bg-surface p-3"><span className="font-medium">{b}</span><span className="text-muted-foreground">{s}</span></li>)}
          </ul>
        </Panel>
      </div>
    </>
  );
}

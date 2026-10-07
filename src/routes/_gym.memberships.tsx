import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/kit";
import { plans } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/memberships")({
  head: () => seo("Membership plans", "Create and manage membership plans, durations and pricing."),
  component: () => (
    <>
      <PageHeader title="Membership plans" subtitle="Create and manage your plans" actions={<Button><Plus className="h-4 w-4" />New plan</Button>} />
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((p, i) => (
          <div key={p.id} className={`panel flex flex-col p-6 ${p.featured ? "border-primary/50" : ""}`}>
            <div className="flex items-center justify-between"><span className="eyebrow">{p.duration}</span>{p.featured && <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">Most popular</span>}</div>
            <h2 className="mt-3 text-2xl font-semibold">{p.name}</h2>
            <div className="mt-4 font-display text-3xl text-primary">EGP {p.price.toLocaleString()}</div>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-muted-foreground">{p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" />{f}</li>)}</ul>
            <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground"><span>{[184, 156, 51][i]} active members</span><Button size="sm" variant="secondary"><Pencil className="h-3.5 w-3.5" />Edit</Button></div>
          </div>
        ))}
      </div>
    </>
  ),
});

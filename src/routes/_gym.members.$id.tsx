import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft } from "lucide-react";
import { Avatar, Panel, StatusPill } from "@/components/kit";
import { members, workouts } from "@/lib/mock";

export const Route = createFileRoute("/_gym/members/$id")({
  loader: ({ params }) => {
    const m = members.find((x) => x.id === params.id);
    if (!m) throw notFound();
    return m;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.name} — IRONHAUS Gym OS` }, { name: "description", content: `Member profile for ${loaderData.name}.` }, { property: "og:title", content: loaderData.name }, { property: "og:description", content: "Member profile" }]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  component: MemberProfile,
});

function MemberProfile() {
  const m = Route.useLoaderData();
  const w = workouts[0]!;
  return (
    <div className="space-y-6">
      <Link to="/members" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Members</Link>
      <div className="panel flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <Avatar initials={m.initials} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold">{m.name}</h1><StatusPill status={m.status} /></div>
          <div className="mt-1 text-sm text-muted-foreground">{m.id} · {m.phone} · {m.email}</div>
        </div>
        <div className="w-fit rounded-xl bg-foreground p-3"><QRCodeSVG value={`ironhaus:member:${m.id}`} size={96} bgColor="transparent" fgColor="currentColor" className="text-background" /></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Membership">
          <dl className="space-y-3 text-sm">
            {[["Current plan", m.plan], ["Start date", m.start], ["Expiry date", m.expiry], ["Remaining", `${m.remaining} days`]].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
            ))}
          </dl>
        </Panel>
        <Panel title="Body measurements">
          <div className="grid grid-cols-2 gap-3">
            {[["Weight", "72 kg"], ["Height", "176 cm"], ["Body fat", "18%"], ["BMI", "23.2"]].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-surface p-3"><div className="eyebrow">{k}</div><div className="mt-1 font-display text-lg">{v}</div></div>
            ))}
          </div>
        </Panel>
        <Panel title="Notes"><p className="text-sm text-muted-foreground">Prefers evening sessions. Mild knee sensitivity — avoid deep lunges. Goal: strength + fat loss.</p></Panel>
        <Panel title="Attendance history">
          <ul className="space-y-2 text-sm">{["Oct 7 · 19:42", "Oct 5 · 20:10", "Oct 3 · 18:55", "Oct 1 · 19:30"].map((d) => <li key={d} className="flex justify-between"><span>Check-in</span><span className="text-muted-foreground">{d}</span></li>)}</ul>
        </Panel>
        <Panel title="Session history">
          <ul className="space-y-2 text-sm">{[["CrossFit", "Coach Tamer"], ["PT", "Coach Hossam"], ["Boxing", "Coach Rana"]].map(([s, t]) => <li key={s} className="flex justify-between"><span>{s}</span><span className="text-muted-foreground">{t}</span></li>)}</ul>
        </Panel>
        <Panel title="Payment history">
          <ul className="space-y-2 text-sm">{[["Premium renewal", "EGP 2,100"], ["PT session", "EGP 400"], ["Whey protein", "EGP 1,850"]].map(([s, a]) => <li key={s} className="flex justify-between"><span>{s}</span><span className="text-primary">{a}</span></li>)}</ul>
        </Panel>
        <Panel title={`Workout program · ${w.name}`} className="lg:col-span-3">
          <div className="grid gap-2 sm:grid-cols-4">{w.exercises.map((e) => <div key={e.name} className="rounded-lg bg-surface p-3"><div className="text-sm font-medium">{e.name}</div><div className="text-xs text-muted-foreground">{e.sets} × {e.reps}</div></div>)}</div>
        </Panel>
      </div>
    </div>
  );
}

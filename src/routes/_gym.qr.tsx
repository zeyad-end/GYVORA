import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, PageHeader, Panel, StatusPill } from "@/components/kit";
import { gym, members } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/qr")({
  head: () => seo("QR management", "Generate the gym registration QR and member QR cards."),
  component: QR,
});

function QR() {
  const [q, setQ] = useState("");
  const [m, setM] = useState(members[0]);
  const list = members.filter((x) => x.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  return (
    <>
      <PageHeader title="QR management" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Gym registration QR">
          <div className="mx-auto w-fit rounded-2xl bg-foreground p-5"><QRCodeSVG value={`ironhaus:gym:${gym.code}`} size={180} bgColor="transparent" fgColor="currentColor" className="text-background" /></div>
          <div className="mt-4 text-center text-sm">Gym code <span className="font-display font-semibold text-primary">{gym.code}</span></div>
          <Button variant="secondary" className="mt-4 w-full"><Download className="h-4 w-4" />Download</Button>
        </Panel>
        <Panel title="Find member">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search member" className="bg-surface" />
          <ul className="mt-3 space-y-1">{list.map((x) => <li key={x.id}><button onClick={() => setM(x)} className={`flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm hover:bg-secondary ${m.id === x.id ? "bg-secondary" : ""}`}><Avatar initials={x.initials} size="sm" />{x.name}</button></li>)}</ul>
        </Panel>
        <Panel title="Membership card">
          <div className="rounded-2xl border border-primary/40 bg-accent p-5">
            <div className="flex items-center justify-between"><span className="font-display text-sm font-semibold">IRONHAUS</span><StatusPill status={m.status} /></div>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div className="min-w-0"><div className="truncate font-display text-lg font-semibold">{m.name}</div><div className="text-xs text-muted-foreground">{m.id} · {m.plan}</div><div className="text-xs text-muted-foreground">Exp. {m.expiry}</div></div>
              <div className="rounded-lg bg-foreground p-2"><QRCodeSVG value={`ironhaus:member:${m.id}`} size={72} bgColor="transparent" fgColor="currentColor" className="text-background" /></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2"><Button variant="secondary"><Download className="h-4 w-4" />Download</Button><Button onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button></div>
        </Panel>
      </div>
    </>
  );
}

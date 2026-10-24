import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Plus, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, DataTable, PageHeader, Panel, StatusPill, td } from "@/components/kit";
import { useStore, type Member } from "@/lib/store";
import { MemberDialog } from "@/components/MemberDialog";
import { seo } from "@/lib/seo";
import { useCloud } from '@/components/CloudProvider';
import { GymSubscriptionStatus } from '@/components/GymSubscriptionStatus';
import { membershipStatus } from '@/lib/membership-link';
import { localDate } from '@/lib/gym-period';
import { CloudClients } from '@/components/CloudClients';
import { getDemoSession } from '@/lib/demo';
import { canChange } from '@/lib/gym-permissions';

export const Route = createFileRoute("/_gym/members/")({
  head: () => seo("Members", "Search, filter and manage every member of your gym."),
  component: Members,
});

function Members() {
  const c=useCloud();
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const storedMembers = useStore((s) => s.members);
  const members=storedMembers.map(m=>({...m,status:membershipStatus(m,localDate())}));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const rows = members.filter((m) => (f === "All" || m.status === f) && (m.name + m.phone + (m.gyvoraId??'')).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <MemberDialog open={open} onOpenChange={setOpen} member={editing} />
      <PageHeader title="Members" subtitle={`${members.length} members`}
        actions={<><Button variant="secondary"><Download className="h-4 w-4" />Export</Button>{c.role==='Owner'&&<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Add Member</Button>}</>} />
      <div className="mb-5"><GymSubscriptionStatus gymId={c.gymId}/></div>
      <Panel>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, phone or GYVORA ID" className="h-10 bg-surface sm:max-w-xs" />
          <div className="flex gap-1 rounded-lg border bg-surface p-1">
            {["All", "Active", "Expiring", "Expired"].map((s) => (
              <button key={s} onClick={() => setF(s)} className={`rounded-md px-3 py-1.5 text-xs ${f === s ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>{s}</button>
            ))}
          </div>
        </div>
        <DataTable head={["Member", "Phone", "Plan", "Sessions left", "Expires", "Status", ""]}>
          {rows.map((m) => (
            <tr key={m.id}>
              <td className={td}><div className="flex items-center gap-3"><Avatar initials={m.initials} size="sm" /><div><div className="font-medium">{m.name}</div><div className="break-all text-xs text-muted-foreground">{m.gyvoraId??m.id}</div></div></div></td>
              <td className={`${td} text-muted-foreground`}>{m.phone}</td>
              <td className={td}>{m.plan}</td>
              <td className={td}>{m.type === "Limited" ? <span className={m.sessionsLeft === 0 ? "text-destructive" : "text-primary"}>{m.sessionsLeft} / {m.sessionsTotal}</span> : <span className="text-muted-foreground">Unlimited</span>}</td>
              <td className={`${td} text-muted-foreground`}>{m.expiry}</td>
              <td className={td}><StatusPill status={m.status} /></td>
              <td className={`${td} text-right`}>
                <div className="flex justify-end gap-1">
                  <Button asChild size="icon" variant="ghost"><Link to="/members/$id" params={{ id: m.id }} aria-label="View"><Eye className="h-4 w-4" /></Link></Button>
                  {canChange(c.role,c.permissions,'Members','edit')&&<Button size="icon" variant="ghost" aria-label="Edit" onClick={() => { setEditing(storedMembers.find(x=>x.id===m.id)??null); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
      {!getDemoSession() && c.role==='Owner' && c.gymId && <div className="mt-8"><CloudClients gymId={c.gymId}/></div>}
    </>
  );
}

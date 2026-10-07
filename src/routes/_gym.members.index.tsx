import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Plus, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, DataTable, PageHeader, Panel, StatusPill, td } from "@/components/kit";
import { members } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/members/")({
  head: () => seo("Members", "Search, filter and manage every member of your gym."),
  component: Members,
});

function Members() {
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const rows = members.filter((m) => (f === "All" || m.status === f) && (m.name + m.phone).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Members" subtitle={`${members.length} members · auto-generated QR for each`}
        actions={<><Button variant="secondary"><Download className="h-4 w-4" />Export</Button><Button><Plus className="h-4 w-4" />Add Member</Button></>} />
      <Panel>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone" className="h-10 bg-surface sm:max-w-xs" />
          <div className="flex gap-1 rounded-lg border bg-surface p-1">
            {["All", "Active", "Expiring", "Expired"].map((s) => (
              <button key={s} onClick={() => setF(s)} className={`rounded-md px-3 py-1.5 text-xs ${f === s ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>{s}</button>
            ))}
          </div>
        </div>
        <DataTable head={["Member", "Phone", "Plan", "Expiry", "Status", ""]}>
          {rows.map((m) => (
            <tr key={m.id}>
              <td className={td}><div className="flex items-center gap-3"><Avatar initials={m.initials} size="sm" /><div><div className="font-medium">{m.name}</div><div className="text-xs text-muted-foreground">{m.id}</div></div></div></td>
              <td className={`${td} text-muted-foreground`}>{m.phone}</td>
              <td className={td}>{m.plan}</td>
              <td className={`${td} text-muted-foreground`}>{m.expiry}</td>
              <td className={td}><StatusPill status={m.status} /></td>
              <td className={`${td} text-right`}>
                <div className="flex justify-end gap-1">
                  <Button asChild size="icon" variant="ghost"><Link to="/members/$id" params={{ id: m.id }} aria-label="View"><Eye className="h-4 w-4" /></Link></Button>
                  <Button size="icon" variant="ghost" aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}

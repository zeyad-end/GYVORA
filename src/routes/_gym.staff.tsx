import { createFileRoute } from "@tanstack/react-router";
import { Plus, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, DataTable, PageHeader, Panel, td } from "@/components/kit";
import { staff } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/staff")({
  head: () => seo("Staff & roles", "Manage staff accounts and role-based permissions."),
  component: Staff,
});

const areas = ["Members", "Attendance", "Sessions", "Payments", "Finance", "Workout programs", "Settings"];
const access: Record<string, string[]> = {
  Owner: areas,
  Admin: areas.filter((a) => a !== "Settings"),
  Reception: ["Members", "Attendance", "Sessions", "Payments"],
  Trainer: ["Members", "Workout programs"],
};

function Staff() {
  return (
    <>
      <PageHeader title="Staff & roles" actions={<Button><Plus className="h-4 w-4" />Add staff</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Staff list">
          <ul className="divide-y">
            {staff.map((s) => (
              <li key={s.email} className="flex items-center gap-3 py-3">
                <Avatar initials={s.name.split(" ").map((p) => p[0]).join("")} size="sm" />
                <div className="min-w-0 flex-1"><div className="text-sm font-medium">{s.name}</div><div className="truncate text-xs text-muted-foreground">{s.email}</div></div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{s.role}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Permissions">
          <DataTable head={["Area", ...Object.keys(access)]}>
            {areas.map((a) => (
              <tr key={a}><td className={td}>{a}</td>{Object.keys(access).map((r) => <td key={r} className={td}>{access[r].includes(a) ? <Check className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground" />}</td>)}</tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </>
  );
}

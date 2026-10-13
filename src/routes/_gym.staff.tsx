import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { setState, useStore } from "@/lib/store";
import { Plus, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, DataTable, Field, PageHeader, Panel, selectCls, td } from "@/components/kit";
import { initials } from "@/lib/mock";
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
  const staff = useStore((s) => s.staff);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add staff</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            setState((s) => ({ staff: [...s.staff, { name: String(d.get("name")).trim(), email: String(d.get("email")).trim(), phone: String(d.get("phone")).trim(), role: String(d.get("role")) }] }));
            toast.success("Staff member added");
            setOpen(false);
          }}>
            <Field label="Full name"><Input name="name" required maxLength={80} /></Field>
            <Field label="Email"><Input name="email" type="email" required maxLength={120} /></Field>
            <Field label="Phone number"><Input name="phone" required maxLength={30} /></Field>
            <Field label="Role"><select name="role" className={selectCls} defaultValue="Reception">{Object.keys(access).map((r) => <option key={r}>{r}</option>)}</select></Field>
            <DialogFooter><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <PageHeader title="Staff & roles" actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add staff</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Staff list">
          <ul className="divide-y">
            {staff.map((s) => (
              <li key={s.email} className="flex items-center gap-3 py-3">
                <Avatar initials={initials(s.name)} size="sm" />
                <div className="min-w-0 flex-1"><div className="text-sm font-medium">{s.name}</div><div className="truncate text-xs text-muted-foreground">{s.email}</div></div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{s.role}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Permissions">
          <DataTable head={["Area", ...Object.keys(access)]}>
            {areas.map((a) => (
              <tr key={a}><td className={td}>{a}</td>{Object.keys(access).map((r) => <td key={r} className={td}>{access[r]?.includes(a) ? <Check className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground" />}</td>)}</tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, selectCls } from "@/components/kit";
import { initials } from "@/lib/mock";
import { getState, setState, useStore, type Member } from "@/lib/store";

const blank = () => ({ name: "", phone: "", email: "", plan: "Basic", type: "Unlimited" as Member["type"], sessionsTotal: 20, start: new Date().toISOString().slice(0, 10), expiry: "", trainer: "", notes: "" });

function statusFor(expiry: string): Member["status"] {
  const d = (new Date(expiry).getTime() - Date.now()) / 86400000;
  return d < 0 ? "Expired" : d <= 14 ? "Expiring" : "Active";
}

export function MemberDialog({ open, onOpenChange, member }: { open: boolean; onOpenChange: (o: boolean) => void; member?: Member | null }) {
  const plans = useStore((s) => s.plans);
  const trainers = useStore((s) => s.trainers);
  const [f, setF] = useState(blank());
  useEffect(() => {
    if (open) setF(member ? { name: member.name, phone: member.phone, email: member.email, plan: member.plan, type: member.type, sessionsTotal: member.sessionsTotal || 20, start: member.start, expiry: member.expiry, trainer: member.trainer, notes: member.notes } : blank());
  }, [open, member]);
  const up = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.expiry < f.start) { toast.error("End date must be after start date"); return; }
    const total = f.type === "Limited" ? Math.max(1, Math.floor(f.sessionsTotal)) : 0;
    const base = { ...f, sessionsTotal: total, initials: initials(f.name), status: statusFor(f.expiry), remaining: Math.max(0, Math.ceil((new Date(f.expiry).getTime() - Date.now()) / 86400000)) };
    if (member) {
      const left = f.type === "Limited" ? (member.type === "Limited" ? Math.min(member.sessionsLeft + (total - member.sessionsTotal), total) : total) : 0;
      setState((s) => ({ members: s.members.map((m) => m.id === member.id ? { ...m, ...base, sessionsLeft: Math.max(0, left) } : m) }));
      toast.success("Member updated");
    } else {
      const id = `M-${1040 + getState().members.length + Math.floor(Math.random() * 900)}`;
      setState((s) => ({ members: [{ id, ...base, sessionsLeft: total }, ...s.members] }));
      toast.success(`${f.name} added · QR generated`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader><DialogTitle>{member ? "Edit member" : "Add member"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" className="sm:col-span-2"><Input required maxLength={80} value={f.name} onChange={(e) => up({ name: e.target.value })} /></Field>
          <Field label="Phone number"><Input required maxLength={30} value={f.phone} onChange={(e) => up({ phone: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" maxLength={120} value={f.email} onChange={(e) => up({ email: e.target.value })} /></Field>
          <Field label="Membership plan"><select className={selectCls} value={f.plan} onChange={(e) => up({ plan: e.target.value })}>{plans.map((p) => <option key={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Membership type"><select className={selectCls} value={f.type} onChange={(e) => up({ type: e.target.value as Member["type"] })}><option value="Unlimited">Unlimited membership</option><option value="Limited">Limited sessions</option></select></Field>
          {f.type === "Limited" && (
            <Field label="Number of sessions" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {[10, 20, 30, 50].map((n) => <Button key={n} type="button" size="sm" variant={f.sessionsTotal === n ? "default" : "secondary"} onClick={() => up({ sessionsTotal: n })}>{n}</Button>)}
                <Input type="number" min={1} max={999} required value={f.sessionsTotal} onChange={(e) => up({ sessionsTotal: Number(e.target.value) })} className="w-24" />
              </div>
            </Field>
          )}
          <Field label="Start date"><Input type="date" required value={f.start} onChange={(e) => up({ start: e.target.value })} /></Field>
          <Field label="End date"><Input type="date" required value={f.expiry} onChange={(e) => up({ expiry: e.target.value })} /></Field>
          <Field label="Trainer" className="sm:col-span-2"><select className={selectCls} value={f.trainer} onChange={(e) => up({ trainer: e.target.value })}><option value="">No trainer</option>{trainers.map((t) => <option key={t.id}>{t.name}</option>)}</select></Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea maxLength={500} value={f.notes} onChange={(e) => up({ notes: e.target.value })} /></Field>
          <DialogFooter className="gap-2 sm:col-span-2">
            {member && <Button type="button" variant="destructive" className="sm:mr-auto" onClick={() => { setState((s) => ({ members: s.members.filter((m) => m.id !== member.id) })); toast.success("Member deleted"); onOpenChange(false); }}>Delete member</Button>}
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{member ? "Save changes" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

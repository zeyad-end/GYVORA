import { useServerFn } from "@tanstack/react-start";
import { lookupClient } from "@/lib/cloud.functions";
import { useCloud } from "./CloudProvider";
import { QRScanner } from "./QRScanner";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, selectCls } from "@/components/kit";
import { initials } from "@/lib/mock";
import { getState, saveState, useStore, type Member } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { assertUniqueClientMembership } from '@/lib/membership-link';
import { getDemoSession, lookupDemoClient } from '@/lib/demo';
import { isGyvoraId } from '@/lib/gyvora-id';

const blank = () => ({ name: "", phone: "", email: "", plan: "Basic", type: "Unlimited" as Member["type"], sessionsTotal: 20, start: new Date().toISOString().slice(0, 10), expiry: "", trainer: "", notes: "" });

function statusFor(expiry: string): Member["status"] {
  const d = (new Date(expiry).getTime() - Date.now()) / 86400000;
  return d < 0 ? "Expired" : d <= 14 ? "Expiring" : "Active";
}

export function MemberDialog({ open, onOpenChange, member, renew, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; member?: Member | null; renew?: boolean; onSaved?: (m: Member) => void }) {
  const c=useCloud();const lookup=useServerFn(lookupClient);const [scan,setScan]=useState(false);const [memberId,setMemberId]=useState("");const [clientId,setClientId]=useState<string|undefined>();const [lookupBusy,setLookupBusy]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const [legacyQrId,setLegacyQrId]=useState<string>();
  async function findClient(value:string, fromCamera=false){const id=value.trim().replace(/^ironhaus:member:/,"");if(!id){toast.error("Enter a GYVORA ID, name, QR code or email");return false;}setLookupBusy(true);setClientId(undefined);try{const p=getDemoSession()?lookupDemoClient(c.gymId,id):await lookup({data:{gymId:c.gymId,memberId:id}});assertUniqueClientMembership(getState().members,p.id,member?.id);up({name:p.full_name,email:p.email,phone:p.phone});setClientId(p.id);setLegacyQrId(p.member_id);setMemberId(p.gyvora_id??p.member_id);toast.success("Client found. Confirm their details before saving.");return true;}catch(e){if(fromCamera)throw e;toast.error(e instanceof Error?e.message:"Client not found");return false;}finally{setLookupBusy(false);}}
  const plans = useStore((s) => s.plans);
  const trainers = useStore((s) => s.trainers);
  const [f, setF] = useState(blank());
  useEffect(() => {
    if(open){setClientId(member?.clientId);setLegacyQrId(member?.memberQrId);setMemberId("");setError('');}
    if (open) setF(member ? { name: member.name, phone: member.phone, email: member.email, plan: member.plan, type: member.type, sessionsTotal: member.sessionsTotal || 20, start: member.start, expiry: member.expiry, trainer: member.trainer, notes: member.notes } : {...blank(),plan:plans[0]?.name??""});
  }, [open, member]);
  const up = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.expiry < f.start) { toast.error("End date must be after start date"); return; }
    setBusy(true);setError('');
    try {
    if(!c.gymId.startsWith('demo-')&&!clientId)throw new Error('Look up and confirm an existing user before saving their membership.');
    assertUniqueClientMembership(getState().members,clientId,member?.id);
    const total = f.type === "Limited" ? Math.max(1, Math.floor(f.sessionsTotal)) : 0;
    const base = { ...f, ...(clientId?{clientId,memberQrId:legacyQrId||member?.memberQrId,...(isGyvoraId(memberId)?{gyvoraId:memberId}:{})}:{}), sessionsTotal: total, initials: initials(f.name), status: statusFor(f.expiry), remaining: Math.max(0, Math.ceil((new Date(f.expiry).getTime() - Date.now()) / 86400000)) };
    if (member) {
      const left = renew ? total : (f.type === "Limited" ? (member.type === "Limited" ? Math.min(member.sessionsLeft + (total - member.sessionsTotal), total) : total) : 0);
      const updated = { ...member, ...base, sessionsLeft: Math.max(0, left) };
      await saveState((s) => ({ members: s.members.map((m) => m.id === member.id ? updated : m) }));
      onSaved?.(updated);
    } else {
      const id = generateId();
      await saveState((s) => ({ members: [{ id, ...base, sessionsLeft: total }, ...s.members] }));
      
    }
    toast.success(member?'Membership updated':'Membership saved');onOpenChange(false);
    } catch(e) {setError(e instanceof Error?e.message:'Could not save membership. Please try again.');} finally {setBusy(false);}
  };

  async function remove() {
    if(!member||!window.confirm('Delete this gym subscription?'))return;
    setBusy(true);setError('');
    try {await saveState(s=>({members:s.members.filter(m=>m.id!==member.id)}));toast.success('Membership removed; history retained');onOpenChange(false);}
    catch(e){setError(e instanceof Error?e.message:'Could not delete membership. Please try again.');}
    finally {setBusy(false);}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader><DialogTitle>{member ? "Edit member" : "Add member"}</DialogTitle></DialogHeader>
        <QRScanner open={scan} onClose={()=>setScan(false)} onScan={v=>findClient(v,true)}/>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          {!member&&<div className="space-y-3 border-b pb-4 sm:col-span-2"><Button type="button" variant="secondary" onClick={()=>setScan(true)}>Scan Member QR</Button><Field label="GYVORA ID, name, QR code or email"><div className="flex gap-2"><Input aria-label="GYVORA ID, name, QR code or email" value={memberId} onChange={e=>{setMemberId(e.target.value);setClientId(undefined);}}/><Button type="button" disabled={lookupBusy||busy} onClick={()=>void findClient(memberId)}>{lookupBusy?"Finding…":"Look up"}</Button></div></Field><Button type="button" variant="link" className="px-0" onClick={()=>{setClientId(undefined);setMemberId("");up({name:"",email:"",phone:""});}}>Manual entry</Button>{clientId&&<p className="break-words text-sm text-success">Confirm existing client · {f.name} · {f.email||'Email not provided'} · {f.phone||'Phone not provided'} · {memberId}</p>}</div>}
          <Field label="Full name" className="sm:col-span-2"><Input required maxLength={80} value={f.name} onChange={(e) => up({ name: e.target.value })} /></Field>
          <Field label="Phone number"><Input required={!clientId} maxLength={30} value={f.phone} onChange={(e) => up({ phone: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" maxLength={120} value={f.email} onChange={(e) => up({ email: e.target.value })} /></Field>
          <Field label="Membership plan"><select aria-label="Membership plan" required className={selectCls} value={f.plan} onChange={(e) => up({ plan: e.target.value })}>{plans.map((p) => <option key={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Membership type"><select className={selectCls} value={f.type} onChange={(e) => up({ type: e.target.value as Member["type"] })}><option value="Unlimited">Unlimited membership</option><option value="Limited">Limited sessions</option></select></Field>
          {f.type === "Limited" && (
            <Field label="Number of sessions" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {[10, 20, 30, 50].map((n) => <Button key={n} type="button" size="sm" variant={f.sessionsTotal === n ? "default" : "secondary"} onClick={() => up({ sessionsTotal: n })}>{n}</Button>)}
                <Input type="number" min={1} max={999} required value={f.sessionsTotal} onChange={(e) => up({ sessionsTotal: Number(e.target.value) })} className="w-24" />
              </div>
            </Field>
          )}
          <Field label="Start date"><Input aria-label="Start date" type="date" required value={f.start} onChange={(e) => up({ start: e.target.value })} /></Field>
          <Field label="End date"><Input aria-label="End date" type="date" required value={f.expiry} onChange={(e) => up({ expiry: e.target.value })} /></Field>
          <Field label="Trainer" className="sm:col-span-2"><select className={selectCls} value={f.trainer} onChange={(e) => up({ trainer: e.target.value })}><option value="">No trainer</option>{trainers.map((t) => <option key={t.id}>{t.name}</option>)}</select></Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea maxLength={500} value={f.notes} onChange={(e) => up({ notes: e.target.value })} /></Field>
          <DialogFooter className="gap-2 sm:col-span-2">
            {member && <Button type="button" disabled={busy} variant="destructive" className="sm:mr-auto" onClick={()=>void remove()}>Delete member</Button>}
            <Button type="button" disabled={busy} variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy||lookupBusy||!plans.length}>{busy?'Saving…':member ? "Save changes" : "Save"}</Button>
          </DialogFooter>
          {error&&<p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}

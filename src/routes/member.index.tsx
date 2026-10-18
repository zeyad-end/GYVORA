import { createFileRoute, Link } from "@tanstack/react-router";
import {useCloud} from "@/components/CloudProvider";
import {PendingInvitations} from "@/components/PendingInvitations";
import {Button} from "@/components/ui/button";
import {useStore} from "@/lib/store";
import {initials} from "@/lib/mock";
import { QrCode, CreditCard, CalendarCheck, ClipboardList, Wallet, Plus, LogOut } from "lucide-react";
import { Avatar, StatusPill } from "@/components/kit";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/member/")({
  head: () => seo("My dashboard", "Your membership status, QR code and training at a glance."),
  component: MemberHome,
});

const actions = [
  { label: "My QR Code", icon: QrCode, to: "/member/qr" },
  { label: "My Membership", icon: CreditCard, to: "/member/membership" },
  { label: "Attendance History", icon: CalendarCheck, to: "/member/attendance" },
  { label: "Workout Program", icon: ClipboardList, to: "/member/workouts" },
  { label: "Join a Gym", icon: Plus, to: "/member/join" },
] as const;

function MemberHome() {
  const c=useCloud();const membership=useStore(s=>s.members.find(m=>m.clientId===c.profile?.id));const remaining=membership?Math.max(0,Math.ceil((new Date(membership.expiry).getTime()-Date.now())/86400000)):0;
  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-8">
      <div className="flex items-center justify-between">
        <Link to="/member/settings" className="flex items-center gap-3">
          <Avatar initials={initials(c.profile?.full_name??"")} />
          <div><div className="text-xs text-muted-foreground">Good evening</div><div className="font-display font-semibold">{c.profile?.full_name}</div></div>
        </Link>
        <Button variant="outline" size="icon" aria-label="Sign out" onClick={()=>void c.logout()}><LogOut className="h-4 w-4" /></Button>
      </div>

      <div className="panel mt-6 p-6">
        <div className="flex items-center justify-between"><span className="eyebrow">{membership?.plan??"No membership"}</span><StatusPill status={membership?.status??"Not linked"} /></div>
        <div className="mt-6 flex items-end gap-2"><span className="font-display text-5xl font-semibold text-primary">{remaining}</span><span className="pb-2 text-sm text-muted-foreground">days remaining</span></div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full w-1/2 rounded-full bg-primary" /></div>
        <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{c.gyms.find(g=>g.id===c.gymId)?.name??"No gym linked"}</span><span>{membership?`Expires ${membership.expiry}`:""}</span></div>
      </div>

      <PendingInvitations/><Button asChild className="mt-5" variant="outline"><Link to="/gyms">Your gyms</Link></Button>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link key={a.label} to={a.to} className="panel flex flex-col gap-6 p-4 transition-colors hover:border-primary/40">
            <a.icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

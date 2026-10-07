import { createFileRoute, Link } from "@tanstack/react-router";
import { QrCode, CreditCard, CalendarCheck, ClipboardList, Wallet, Plus, LogOut } from "lucide-react";
import { Avatar, StatusPill } from "@/components/kit";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/member/")({
  head: () => seo("My dashboard", "Your membership status, QR code and training at a glance."),
  component: MemberHome,
});

const actions = [
  { label: "My QR Code", icon: QrCode, to: "/member/qr" },
  { label: "My Membership", icon: CreditCard, to: "/member/qr" },
  { label: "Attendance History", icon: CalendarCheck, to: "/member" },
  { label: "Workout Program", icon: ClipboardList, to: "/member" },
  { label: "Payments", icon: Wallet, to: "/member" },
  { label: "Join a Gym", icon: Plus, to: "/member/join" },
] as const;

function MemberHome() {
  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials="LH" />
          <div><div className="text-xs text-muted-foreground">Good evening</div><div className="font-display font-semibold">Layla Hassan</div></div>
        </div>
        <Link to="/" aria-label="Sign out" className="grid h-9 w-9 place-items-center rounded-lg border bg-card"><LogOut className="h-4 w-4" /></Link>
      </div>

      <div className="panel mt-6 p-6">
        <div className="flex items-center justify-between"><span className="eyebrow">Premium plan</span><StatusPill status="Active" /></div>
        <div className="mt-6 flex items-end gap-2"><span className="font-display text-5xl font-semibold text-primary">47</span><span className="pb-2 text-sm text-muted-foreground">days remaining</span></div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full w-1/2 rounded-full bg-primary" /></div>
        <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>IRONHAUS Performance Club</span><span>Expires Nov 23, 2026</span></div>
      </div>

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

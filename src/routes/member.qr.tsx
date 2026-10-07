import { createFileRoute, Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft } from "lucide-react";
import { StatusPill } from "@/components/kit";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/member/qr")({
  head: () => seo("My QR code", "Show your QR code for check-in, sessions and identification."),
  component: MemberQR,
});

function MemberQR() {
  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-8">
      <Link to="/member" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
      <div className="panel mt-6 p-8 text-center">
        <span className="eyebrow">Scan at reception</span>
        <div className="mx-auto mt-6 w-fit rounded-3xl bg-foreground p-6">
          <QRCodeSVG value="ironhaus:member:M-1041" size={240} bgColor="transparent" fgColor="currentColor" className="text-background" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Layla Hassan</h1>
        <div className="mt-1 text-sm text-muted-foreground">Member ID · M-1041</div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl bg-secondary p-4"><div className="eyebrow">Status</div><div className="mt-2"><StatusPill status="Active" /></div></div>
          <div className="rounded-xl bg-secondary p-4"><div className="eyebrow">Expires</div><div className="mt-2 font-display font-semibold">Nov 23, 2026</div></div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Use for gym check-in · session registration · member identification</p>
      </div>
    </div>
  );
}

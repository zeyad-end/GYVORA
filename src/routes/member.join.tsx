import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ScanLine, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/member/join")({
  head: () => seo("Join a gym", "Connect your account to a gym by scanning its QR or entering its code."),
  component: Join,
});

function Join() {
  const [joined, setJoined] = useState(false);
  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-8">
      <Link to="/member" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
      <h1 className="mt-6 text-2xl font-semibold">Join a gym</h1>
      <p className="mt-1 text-sm text-muted-foreground">Connect your account with your club.</p>
      <div className="mt-8 space-y-4"><p className="text-sm text-muted-foreground">Show your Member ID or personal QR to reception. Staff will link your existing account to the gym when creating your subscription.</p><Button asChild><Link to="/member/qr">Show my QR code</Link></Button><Button asChild variant="outline"><Link to="/gyms">Your gyms</Link></Button></div>
    </div>
  );
}

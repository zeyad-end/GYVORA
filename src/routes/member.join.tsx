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
      {joined ? (
        <div className="panel mt-6 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <div className="mt-4 font-display text-lg font-semibold">Connected to IRONHAUS</div>
          <Button asChild className="mt-6 w-full"><Link to="/member">Back to dashboard</Link></Button>
        </div>
      ) : (
        <>
          <button onClick={() => setJoined(true)} className="panel mt-6 flex aspect-square w-full flex-col items-center justify-center gap-4 border-dashed">
            <ScanLine className="h-14 w-14 text-primary" />
            <span className="font-medium">Scan gym QR code</span>
            <span className="text-xs text-muted-foreground">Point your camera at the code at reception</span>
          </button>
          <div className="my-6 text-center text-xs text-muted-foreground">or enter gym code</div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setJoined(true); }}>
            <Input required maxLength={12} placeholder="IRH-2048" className="h-11 bg-card uppercase" />
            <Button type="submit" className="h-11">Connect</Button>
          </form>
        </>
      )}
    </div>
  );
}

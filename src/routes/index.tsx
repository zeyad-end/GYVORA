import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";
import cover from "@/assets/gym-cover.jpg";

export const Route = createFileRoute("/")({
  head: () => seo("Sign in", "Sign in to IRONHAUS as a member or a gym account."),
  component: Login,
});

function Login() {
  const [mode, setMode] = useState<"user" | "gym">("gym");
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={cover} alt="Premium gym interior" className="absolute inset-0 h-full w-full object-cover" width={1600} height={640} />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute bottom-12 left-12 right-12">
          <span className="eyebrow">Gym OS</span>
          <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight">Run your club like a high‑performance athlete.</h2>
          <p className="mt-3 max-w-md text-muted-foreground">Members, attendance, sessions, trainers and finance — one premium workspace.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary font-display font-bold text-primary-foreground">IH</span>
            <span className="font-display text-lg font-semibold">IRONHAUS</span>
          </div>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose how you want to sign in.</p>

          <div className="mt-8 grid grid-cols-2 gap-2 rounded-xl border bg-card p-1">
            {([["user", "Individual", User], ["gym", "Gym Account", Building2]] as const).map(([k, l, Icon]) => (
              <button key={k} onClick={() => setMode(k)}
                className={cn("flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors", mode === k ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}>
                <Icon className="h-4 w-4" />{l}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); navigate({ to: mode === "gym" ? "/gym" : "/member" }); }}>
            <div className="space-y-2">
              <Label>{mode === "gym" ? "Gym email" : "Email or phone number"}</Label>
              <Input required placeholder={mode === "gym" ? "owner@yourgym.com" : "you@mail.com or +20…"} className="h-11 bg-card" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><Label>Password</Label>
                {mode === "user" && <a href="#" className="text-xs text-primary">Forgot password?</a>}
              </div>
              <Input required type="password" placeholder="••••••••" className="h-11 bg-card" />
            </div>
            <Button type="submit" className="h-11 w-full">Sign in</Button>
          </form>
          {mode === "user" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              New here? <Link to="/register" className="font-medium text-primary">Create account</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

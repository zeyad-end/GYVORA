import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCloud } from "@/components/CloudProvider";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Building2, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";
import { type DemoAccountType } from "@/lib/demo";
import { enterPrototype, getPrototypePreference, savePrototypePreference } from "@/lib/prototype-login";
import cover from "@/assets/gyvora-login-hero.jpg.asset.json";
import { AppBrand } from '@/components/AppBrand';
import { SocialSignIn } from "@/components/SocialSignIn";

export const Route = createFileRoute("/")({
  head: () => seo("Demo login", "Enter the GYVORA local prototype as a Gym Account, Client / Individual, or Platform Super Admin."),
  component: Login,
});

function Login() {
  const [destination, setDestination] = useState<DemoAccountType>("gym");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const cloud = useCloud();

  useEffect(() => {
    const preference = getPrototypePreference();
    if (preference) {
      setDestination(preference.destination);
      setName(preference.name);
      setEmail(preference.email);
      setRemember(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) savePrototypePreference({ destination, name, email }, remember);
  }, [destination, name, email, remember, ready]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const to = enterPrototype({ destination, name, email }, remember);
    await cloud.refresh();
    await navigate({ to });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={cover.url} alt="Gym training racks and weight plates" className="absolute inset-0 h-full w-full object-cover" width={675} height={1200} />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute bottom-12 left-12 right-12">
          <span className="eyebrow">Gym OS</span>
          <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight">Run your club like a high‑performance athlete.</h2>
          <p className="mt-3 max-w-md text-muted-foreground">Members, attendance, sessions, trainers and finance — one premium workspace.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <AppBrand large className="mb-8" />
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Demo access · No real authentication</p>

          <div className="mt-8 grid grid-cols-3 gap-1 rounded-lg border bg-card p-1" role="group" aria-label="Demo destination">
            {([["gym", "Gym Account", Building2], ["individual", "Client / Individual", User], ["dashboard", "Dashboard", LayoutDashboard]] as const).map(([key, label, Icon]) => (
              <Button type="button" variant="ghost" key={key} onClick={() => setDestination(key)} aria-pressed={destination === key}
                className={cn("h-16 min-w-0 flex-col gap-1 rounded-md px-1 text-xs font-medium transition-colors", destination === key ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}>
                <Icon className="h-4 w-4 shrink-0" /><span className="whitespace-normal text-center leading-tight">{label}</span>
              </Button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={signIn} noValidate>
            <div className="space-y-2"><Label htmlFor="demo-name">Name</Label><Input id="demo-name" name="name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" className="h-11 bg-card" /></div>
            <div className="space-y-2">
              <Label htmlFor="demo-email">Email</Label>
              <Input id="demo-email" name="identifier" type="text" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" placeholder="Demo email" className="h-11 bg-card" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><Label htmlFor="demo-password">Password</Label>
                <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => toast.info("Password recovery is unavailable in demo mode. You can log in with any values or leave the fields blank.")}>Forgot Password?</Button>
              </div>
              <Input id="demo-password" name="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="off" type="password" placeholder="••••••••" className="h-11 bg-card" />
            </div>
            <div className="flex items-center gap-2"><Checkbox id="demo-remember" checked={remember} onCheckedChange={value => setRemember(value === true)} /><Label htmlFor="demo-remember" className="text-sm font-normal">Remember Me</Label></div>
            <Button type="submit" className="h-11 w-full">Login</Button>
          </form>
          <SocialSignIn />
        </div>
      </div>
    </div>
  );
}

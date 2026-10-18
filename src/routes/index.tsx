import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { toast } from "sonner";
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
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function signIn(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setBusy(true);
    const d=new FormData(e.currentTarget);
    try { const parsed=z.object({name:z.string().trim().min(1).max(100),identifier:z.string().trim().min(3).max(255),password:z.string().min(1).max(128)}).parse({name:d.get('name'),identifier:d.get('identifier'),password:d.get('password')});
      if(!parsed.identifier.includes('@'))throw new Error('Phone sign-in requires an SMS provider in Cloud → Users → Auth Settings → Phone. Please use your email.');
      z.string().email().parse(parsed.identifier);
      const {error:authError}=await supabase.auth.signInWithPassword({email:parsed.identifier,password:parsed.password}); if(authError)throw authError;
      await supabase.auth.signOut();
      const {error:otpError}=await supabase.auth.signInWithOtp({email:parsed.identifier,options:{shouldCreateUser:false,emailRedirectTo:window.location.origin+'/verify-otp'}});if(otpError)throw otpError;
      sessionStorage.setItem('ironhaus-otp-email',parsed.identifier);sessionStorage.setItem('ironhaus-remember',d.get('remember')?'yes':'no');
      await navigate({to:'/verify-otp'});
    }catch(e){setError(e instanceof Error?e.message:'Sign-in failed');}finally{setBusy(false);}
  }

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

          <form className="mt-6 space-y-4" onSubmit={signIn}>
            <div className="space-y-2"><Label>Full Name</Label><Input name="name" required maxLength={100} autoComplete="name" className="h-11 bg-card" /></div>
            <div className="space-y-2">
              <Label>{mode === "gym" ? "Gym email" : "Email or phone number"}</Label>
              <Input name="identifier" autoComplete="username" maxLength={255} required placeholder={mode === "gym" ? "owner@yourgym.com" : "you@mail.com or +20…"} className="h-11 bg-card" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><Label>Password</Label>
                <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={async()=>{const email=window.prompt("Your account email");if(!email)return;const v=z.string().email().safeParse(email.trim());if(!v.success){toast.error("Enter a valid email");return;}const {error}=await supabase.auth.resetPasswordForEmail(v.data,{redirectTo:window.location.origin+"/reset-password"});error?toast.error(error.message):toast.success("Check your email for the password reset link");}}>Forgot password?</Button>
              </div>
              <Input name="password" autoComplete="current-password" maxLength={128} required type="password" placeholder="••••••••" className="h-11 bg-card" />
            </div>
            <label className="flex items-center gap-2 text-sm"><input name="remember" type="checkbox" />Remember Me</label>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={busy} type="submit" className="h-11 w-full">{busy?"Signing in…":"Sign in"}</Button>
          </form>
          {(
            <p className="mt-6 text-center text-sm text-muted-foreground">
              New here? <Link to="/register" className="font-medium text-primary">Create account</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

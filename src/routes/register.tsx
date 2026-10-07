import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/register")({
  head: () => seo("Create account", "Create your IRONHAUS member account and get your personal QR code."),
  component: Register,
});

function Register() {
  const [done, setDone] = useState<{ name: string; id: string } | null>(null);
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="panel w-full max-w-lg p-8">
        {done ? (
          <div className="text-center">
            <span className="eyebrow">Account created</span>
            <h1 className="mt-2 text-2xl font-semibold">Your personal QR is ready</h1>
            <div className="mx-auto mt-6 w-fit rounded-2xl bg-foreground p-5">
              <QRCodeSVG value={`ironhaus:member:${done.id}`} size={200} bgColor="transparent" fgColor="currentColor" className="text-background" />
            </div>
            <div className="mt-4 font-display text-lg">{done.name}</div>
            <div className="text-sm text-muted-foreground">Member ID {done.id}</div>
            <Button asChild className="mt-8 w-full"><Link to="/member">Go to my dashboard</Link></Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">A personal QR code is generated automatically.</p>
            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(e) => {
              e.preventDefault();
              const name = String(new FormData(e.currentTarget).get("name") || "Member").slice(0, 80);
              setDone({ name, id: `M-${Math.floor(2000 + Math.random() * 7000)}` });
            }}>
              <Field label="Full name" name="name" className="sm:col-span-2" />
              <Field label="Phone number" name="phone" type="tel" />
              <Field label="Email" name="email" type="email" />
              <Field label="Password" name="password" type="password" />
              <Field label="Date of birth" name="dob" type="date" />
              <div className="space-y-2 sm:col-span-2">
                <Label>Gender</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Male", "Female"].map((g) => (
                    <label key={g} className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm has-[:checked]:border-primary">
                      <input type="radio" name="gender" value={g} required className="accent-[var(--primary)]" />{g}
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" className="h-11 sm:col-span-2">Create account</Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">Already a member? <Link to="/" className="text-primary">Sign in</Link></p>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, className, ...p }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Input required maxLength={120} className="h-11 bg-card" {...p} />
    </div>
  );
}

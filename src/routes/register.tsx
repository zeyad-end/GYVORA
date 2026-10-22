import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useCloud } from '@/components/CloudProvider';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/kit';
import { seo } from '@/lib/seo';
import { registerDemoAccount, setDemoSession, sessionKindFor, demoDestination, type DemoAccountType } from '@/lib/demo';
import { registrationSchema } from '@/lib/registration';
import { AppBrand } from '@/components/AppBrand';

export const Route = createFileRoute('/register')({
  head: () => seo('Create account', 'Register your GYVORA client, owner or staff account.'),
  component: Register,
});

const ACCOUNT_TYPES: { value: DemoAccountType; label: string; hint: string }[] = [
  { value: 'gym', label: 'Gym Account', hint: 'Gym Owner — run your club' },
  { value: 'individual', label: 'Individual', hint: 'Client — member portal' },
  { value: 'dashboard', label: 'Dashboard', hint: 'Platform business owner (Super Admin)' },
];

function Register() {
  const navigate = useNavigate();
  const cloud = useCloud();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState<DemoAccountType | ''>('');
  const [contact, setContact] = useState<'phone' | 'email'>('phone');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const d = new FormData(e.currentTarget);
    try {
      const p = registrationSchema.parse(Object.fromEntries(d));
      // Prototype: demo accounts are stored locally and isolated from production auth.
      const id = p.email || p.phone || `gym:${p.full_name.toLowerCase().replace(/\s+/g, '-')}`;
      const acc = registerDemoAccount(p.full_name, id, p.password, p.account_type, p.phone);
      setDemoSession(sessionKindFor(acc.type), acc.email);
      await cloud.refresh();
      await navigate({ to: demoDestination(acc) });
    } catch (err) {
      setError(err instanceof z.ZodError ? (err.issues[0]?.message ?? 'Check the form') : err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <AppBrand large className="mb-8" />
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm">Account type</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {ACCOUNT_TYPES.map((t) => (
                <label key={t.value} className="flex cursor-pointer flex-col gap-1 rounded-md border p-3 text-sm has-checked:border-primary has-checked:bg-secondary">
                  <span className="flex items-center gap-2 font-medium">
                     <input required type="radio" name="account_type" value={t.value} checked={accountType === t.value} onChange={() => { setAccountType(t.value); setError(''); }} />
                    {t.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Full Name" className="sm:col-span-2">
            <Input name="full_name" required maxLength={100} />
          </Field>
           {accountType === 'individual' && <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm">Contact detail</legend><div className="flex gap-4">{(['phone', 'email'] as const).map(value => <label key={value} className="flex items-center gap-2 text-sm"><input type="radio" checked={contact === value} onChange={() => setContact(value)}/>{value === 'phone' ? 'Phone Number' : 'Email'}</label>)}</div></fieldset>}
           {(accountType === 'dashboard' || (accountType === 'individual' && contact === 'email')) && <Field label="Email" className="sm:col-span-2"><Input name="email" type="email" required maxLength={255}/></Field>}
           {accountType === 'gym' && <><Field label="Phone Number (optional)"><Input name="phone" type="tel" maxLength={30} placeholder="Demo values are fine"/></Field><Field label="Email (optional)"><Input name="email" type="email" maxLength={255}/></Field><p className="text-xs text-muted-foreground sm:col-span-2">Prototype account — fictional details are fine. No phone, SMS or email verification.</p></>}
           {accountType === 'individual' && contact === 'phone' && <Field label="Phone Number" className="sm:col-span-2"><Input name="phone" type="tel" required maxLength={30}/></Field>}
          <Field label="Password" className="sm:col-span-2">
            <Input name="password" type="password" required minLength={8} maxLength={128} />
          </Field>
           {accountType === 'individual' && <><Field label="Date of birth">
            <Input name="dob" type="date" />
           </Field>
          <Field label="Gender">
            <select name="gender" className="h-10 w-full rounded-md border bg-card px-3">
              <option value="">Not specified</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </Field></>}
          {error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy} className="sm:col-span-2">
            {busy ? 'Creating account…' : 'Create account'}
          </Button>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Already have an account?{' '}
            <Link to="/" className="text-primary">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

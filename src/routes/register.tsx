import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/kit';
import { seo } from '@/lib/seo';
import { setDemoSession } from '@/lib/demo';
import { registrationSchema } from '@/lib/registration';
import { supabase } from '@/integrations/supabase/client';
import { readFile } from '@/lib/store';
import { AppBrand } from '@/components/AppBrand';
import { createVerifiedAccount, sendSignupCode } from '@/lib/signup.functions';

export const Route = createFileRoute('/register')({
  head: () => seo('Create account', 'Create your persistent GYVORA gym owner or client account.'),
  component: Register,
});
const ACCOUNT_TYPES = [
  { value: 'gym', label: 'Gym Account', hint: 'Gym Owner — run your club' },
  { value: 'individual', label: 'Client', hint: 'Client — member portal' },
] as const;
function Register() {
  const navigate = useNavigate();
  const sendCode = useServerFn(sendSignupCode);
  const createAccount = useServerFn(createVerifiedAccount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState<'gym' | 'individual' | ''>('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<Awaited<ReturnType<typeof sendCode>> | null>(null);
  const [notice, setNotice] = useState('');
  async function send(channel: 'email' | 'phone') {
    setBusy(true); setError(''); setChallenge(null); setCode('');
    try {
      const result = await sendCode({data:{channel,contact:channel === 'email' ? email : phone}});
      setChallenge(result); setNotice(result.message);
    } catch(err) { setError(err instanceof Error ? err.message : 'Could not send code.'); }
    finally { setBusy(false); }
  }
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    const d = new FormData(e.currentTarget);
    try {
      const account = registrationSchema.parse(Object.fromEntries(d));
      if (!challenge || !code.trim()) throw new Error('Send a code to your email or phone, then enter the code.');
      const file = d.get('photo');
      if (file instanceof File && file.size && (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 750000)) throw new Error('Choose a JPG, PNG or WebP photo under 750 KB.');
      const photo = file instanceof File && file.size ? await readFile(file) : '';
      await createAccount({data:{account,token:challenge.token,code,photo}});
      setDemoSession(null);
      await supabase.auth.signOut();
      await navigate({to:'/', search:{created:true}});
    } catch(err) {
      setError(err instanceof z.ZodError ? (err.issues[0]?.message ?? 'Check the form') : err instanceof Error ? err.message : 'Registration failed');
    } finally { setBusy(false); }
  }
  function changed() { setChallenge(null); setCode(''); setNotice(''); }
  return <div className="flex min-h-screen items-center justify-center px-6 py-12"><div className="w-full max-w-lg">
    <AppBrand large className="mb-8"/>
    <h1 className="text-2xl font-semibold">Create your account</h1>
    <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm">Account type</legend><div className="grid grid-cols-2 gap-2">
        {ACCOUNT_TYPES.map(t => <label key={t.value} className="flex cursor-pointer flex-col gap-1 rounded-md border p-3 text-sm has-checked:border-primary has-checked:bg-secondary"><span className="flex items-center gap-2 font-medium"><input required type="radio" name="account_type" value={t.value} checked={accountType === t.value} onChange={() => {setAccountType(t.value);setError('');}}/>{t.label}</span><span className="text-xs text-muted-foreground">{t.hint}</span></label>)}
      </div></fieldset>
      <Field label="Full Name" className="sm:col-span-2"><Input name="full_name" required maxLength={100} autoComplete="name"/></Field>
      <Field label="Email" className="sm:col-span-2"><div className="flex gap-2"><Input name="email" type="email" maxLength={255} value={email} onChange={e => {setEmail(e.target.value);changed();}}/><Button type="button" variant="outline" disabled={busy || !email.trim()} aria-label="Send code to email" onClick={() => void send('email')}>Send code</Button></div></Field>
      <Field label="Phone Number" className="sm:col-span-2"><div className="flex gap-2"><Input name="phone" type="tel" maxLength={30} placeholder="+20…" value={phone} onChange={e => {setPhone(e.target.value);changed();}}/><Button type="button" variant="outline" disabled={busy || !phone.trim()} aria-label="Send code to phone" onClick={() => void send('phone')}>Send code</Button></div></Field>
      {notice && <p role="status" className="text-sm text-muted-foreground sm:col-span-2">{notice}</p>}
      {challenge && <Field label="Verification code" className="sm:col-span-2"><Input required value={code} onChange={e => setCode(e.target.value)} maxLength={128} autoComplete="one-time-code"/></Field>}
      <Field label="Password" className="sm:col-span-2"><Input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password"/></Field>
      {accountType === 'individual' && <><Field label="Profile photo (optional)" className="sm:col-span-2"><Input name="photo" type="file" accept="image/jpeg,image/png,image/webp"/></Field><Field label="Date of birth"><Input name="dob" type="date"/></Field><Field label="Gender"><select name="gender" className="h-10 w-full rounded-md border bg-card px-3"><option value="">Not specified</option><option>Male</option><option>Female</option></select></Field></>}
      {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
      <Button type="submit" disabled={busy} className="sm:col-span-2">{busy ? 'Creating account…' : 'Create account'}</Button>
      <p className="text-sm text-muted-foreground sm:col-span-2">Already have an account? <Link to="/" className="text-primary">Sign in</Link></p>
    </form>
  </div></div>;
}

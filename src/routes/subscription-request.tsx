import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { MessageCircle } from 'lucide-react';
import { useCloud } from '@/components/CloudProvider';
import { supabase } from '@/integrations/supabase/client';
import { requestSubscription } from '@/lib/cloud.functions';
import { getDemoSessionInfo, getDemoAccount, updateDemoAccount, submitDemoGymRequest, demoRequestStatus, useDemoStore, whatsappLink } from '@/lib/demo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, PageHeader } from '@/components/kit';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/subscription-request')({
  head: () => seo('Gym subscription request', 'Request administrator approval for your IronHaus gym subscription.'),
  component: Request,
});

const OPTIONS = [
  { value: 'Monthly Plan', label: 'Monthly Subscription', hint: 'Billed every month — flexible, cancel any time.' },
  { value: 'Annual Plan', label: 'Annual Subscription', hint: 'One yearly agreement for the full twelve months.' },
] as const;

function Request() {
  const c = useCloud();
  const navigate = useNavigate();
  const router = useRouter();
  const submit = useServerFn(requestSubscription);
  const whatsapp = useDemoStore((s) => s.platformWhatsapp);
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [gymName, setGymName] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const demo = getDemoSessionInfo();
  const demoAcc = getDemoAccount();
  const isDemoOwner = demo?.kind === 'owner';

  useEffect(() => {
    setGymName((n) => n || demoAcc?.name || '');
    if (isDemoOwner) {
      setStatus(demo?.email ? (demoRequestStatus(demo.email) ?? '') : '');
      return;
    }
    if (c.profile)
      void supabase.from('owner_requests').select('status').eq('user_id', c.profile.id).maybeSingle()
        .then(({ data }) => setStatus(data?.status ?? ''));
  }, [c.profile?.id]);

  async function onSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!plan) return setError('Select Monthly or Annual Subscription before sending.');
    if (!gymName.trim()) return setError('Enter your gym name.');
    setBusy(true);
    setError('');
    try {
      if (isDemoOwner) {
        submitDemoGymRequest(gymName, plan); // returns the existing pending request instead of duplicating
        if (demoAcc) updateDemoAccount(demoAcc.email, { requestPending: true });
      } else {
        await submit({ data: { name: gymName, plan: plan as 'Monthly Plan' | 'Annual Plan' } });
      }
      setStatus('Pending');
      setConfirmOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  async function onSkip() {
    if (demoAcc) updateDemoAccount(demoAcc.email, { skipped: true });
    setConfirmOpen(false);
    await c.refresh();
    await navigate({ to: '/dashboard' });
  }

  function onCancel() {
    if (window.history.length > 1) router.history.back();
    else void navigate({ to: '/' });
  }

  const planLabel = OPTIONS.find((o) => o.value === plan)?.label ?? 'a subscription';
  const waText = `Hello, I'm ${demoAcc?.name || demo?.name || 'a gym owner'} (${gymName || 'my gym'}). I have a question about my ${planLabel} request.`;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <PageHeader title="Gym subscription" />
      {status && !confirmOpen ? (
        <div className="space-y-4">
          <p role="status">
            {status === 'Pending'
              ? 'Your request has been sent and is waiting for approval from an administrator.'
              : status === 'Approved'
                ? 'Your gym subscription is approved.'
                : 'Your subscription request was rejected. Contact the administrator.'}
          </p>
          {status === 'Approved' && <Button asChild><Link to="/dashboard">Open your gym</Link></Button>}
          {status === 'Pending' && isDemoOwner && !demoAcc?.skipped && (
            <Button type="button" variant="outline" onClick={onSkip}>Skip — enter with prototype demo access</Button>
          )}
          {isDemoOwner && demoAcc?.skipped && status !== 'Approved' && (
            <p className="text-sm text-muted-foreground">Prototype demo access is on. Your request remains Pending — this is not an approved or paid subscription. <Link to="/dashboard" className="text-primary">Open dashboard</Link></p>
          )}
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSend} noValidate>
          <Field label="Gym name"><Input value={gymName} onChange={(e) => setGymName(e.target.value)} maxLength={100} /></Field>
          <fieldset className="space-y-3" role="radiogroup">
            <legend className="mb-2 text-sm">Choose a subscription</legend>
            {OPTIONS.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-start gap-3 rounded-md border p-4 has-checked:border-primary has-checked:bg-secondary">
                <input type="radio" name="plan" value={o.value} checked={plan === o.value} onChange={() => { setPlan(o.value); setError(''); }} className="mt-1" />
                <span><span className="block font-medium">{o.label}</span><span className="block text-sm text-muted-foreground">{o.hint}</span></span>
              </label>
            ))}
          </fieldset>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4 text-primary" />
            {whatsapp ? (
              <span>Questions about your request? <a className="text-primary" href={whatsappLink(whatsapp, waText)} target="_blank" rel="noopener noreferrer">Contact us on WhatsApp.</a></span>
            ) : (
              <span>Questions about your request? WhatsApp contact isn't set yet — the platform administrator can add the number in Platform Settings.</span>
            )}
          </p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={busy} className="flex-1">{busy ? 'Sending…' : 'Send'}</Button>
          </div>
        </form>
      )}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request sent</DialogTitle>
            <DialogDescription>Your request has been sent and is waiting for approval from an administrator.</DialogDescription>
          </DialogHeader>
          {isDemoOwner && <p className="text-xs text-muted-foreground">Skip opens the Gym Owner dashboard with prototype demo access. Your request stays Pending — it is not approved or paid.</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Done</Button>
            {isDemoOwner && <Button onClick={onSkip}>Skip</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

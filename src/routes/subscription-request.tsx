import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useCloud } from '@/components/CloudProvider';
import { supabase } from '@/integrations/supabase/client';
import { requestSubscription } from '@/lib/cloud.functions';
import { getDemoSessionInfo, getDemoAccount, updateDemoAccount, submitDemoGymRequest, getDemoState } from '@/lib/demo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, PageHeader } from '@/components/kit';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/subscription-request')({
  head: () => seo('Gym subscription request', 'Request administrator approval for your IronHaus gym subscription.'),
  component: Request,
});

function Request() {
  const c = useCloud();
  const navigate = useNavigate();
  const submit = useServerFn(requestSubscription);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const demo = getDemoSessionInfo();
  const demoAcc = getDemoAccount();
  const isDemoOwner = demo?.kind === 'owner';

  useEffect(() => {
    if (isDemoOwner) {
      setStatus(getDemoState().requests.find(r=>r.email===demo?.email&&r.submittedAt)?.status ?? (demoAcc?.requestPending ? 'Pending' : ''));
      return;
    }
    if (c.profile)
      void supabase
        .from('owner_requests')
        .select('status')
        .eq('user_id', c.profile.id)
        .maybeSingle()
        .then(({ data }) => setStatus(data?.status ?? ''));
  }, [c.profile?.id]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const d = new FormData(e.currentTarget);
      if (isDemoOwner) {
        // Prototype: store a fictional pending request locally.
        submitDemoGymRequest(String(d.get('name')),String(d.get('plan')));
        if(demoAcc)updateDemoAccount(demoAcc.email, { requestPending: true });
        setStatus('Pending');
        return;
      }
      await submit({ data: { name: String(d.get('name')), plan: String(d.get('plan')) as 'Monthly Plan' | '3 Months Plan' | 'Annual Plan' } });
      setStatus('Pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  async function onSkip() {
    if (!isDemoOwner) return;
    if(demoAcc)updateDemoAccount(demoAcc.email, { skipped: true });
    await c.refresh();
    await navigate({ to: '/dashboard' });
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <PageHeader title="Gym subscription" />
      {status ? (
        <>
          <p role="status">
            {status === 'Pending'
              ? 'Your subscription request has been sent successfully and is waiting for admin approval.'
              : status === 'Approved'
                ? 'Your gym subscription is approved.'
                : 'Your subscription request was rejected. Contact the administrator.'}
          </p>
          {status === 'Approved' && (
            <Button asChild className="mt-6">
              <Link to="/gyms">Open your gym</Link>
            </Button>
          )}
        </>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="Gym name">
            <Input name="name" required maxLength={100} />
          </Field>
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm">Select a plan</legend>
            {['Monthly Plan', '3 Months Plan', 'Annual Plan'].map((p) => (
              <label key={p} className="flex items-center gap-3 rounded-md border p-4">
                <input type="radio" required name="plan" value={p} />
                {p}
              </label>
            ))}
          </fieldset>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <Button disabled={busy} className="w-full">
            {busy ? 'Submitting…' : 'Submit request'}
          </Button>
        </form>
      )}
      {isDemoOwner && !demoAcc?.skipped && !demo?.directAccess && (
        <div className="mt-8 rounded-md border border-dashed p-4">
          <p className="text-sm text-muted-foreground">Prototype only: skip the approval wait and explore the Gym Owner dashboard with demo access. This is not a paid or approved subscription.</p>
          <Button type="button" variant="outline" className="mt-3 w-full" onClick={onSkip}>
            Skip — enter with demo access
          </Button>
        </div>
      )}
      {isDemoOwner && demoAcc?.skipped && (
        <p className="mt-8 text-sm text-muted-foreground">Demo access — subscription approval skipped.</p>
      )}
    </div>
  );
}

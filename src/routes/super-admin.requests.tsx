import { createFileRoute } from '@tanstack/react-router';
import { PageHeader, DataTable, td, StatusPill } from '@/components/kit';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDemoStore, approveRequest, rejectRequest } from '@/lib/demo';
import { seo } from '@/lib/seo';
import { usePlatformAdmin } from '@/components/PlatformAdminProvider';

export const Route = createFileRoute('/super-admin/requests')({
  validateSearch: (search: Record<string,unknown>) => ({request: typeof search['request'] === 'string' ? search['request'] : undefined}),
  head: () => seo('Gym requests', 'Review fictional pending gym subscription requests.'),
  component: Requests,
});

function Requests() {
  const {request}=Route.useSearch();
  const {notifications}=usePlatformAdmin();
  const selected=notifications.find(n=>n.requestId===request);
  const requests = useDemoStore((s) => s.requests);
  const pending = requests.filter((r) => r.status === 'Pending');
  const decided = requests.filter((r) => r.status !== 'Pending');

  function decide(id: string, gymName: string, approve: boolean) {
    if (!window.confirm(`${approve ? 'Approve' : 'Reject'} ${gymName}?`)) return;
    if (approve) {
      approveRequest(id);
      toast.success(`${gymName} approved — added to Approved Gyms (demo).`);
    } else {
      rejectRequest(id);
      toast.success(`${gymName} rejected (demo).`);
    }
  }

  return (
    <div>
      <PageHeader title="Gym Requests" subtitle={`Pending gym requests: ${pending.length} · fictional demo data, no real emails or payments.`} />
      {selected&&<section className="mb-6 border-y py-4" aria-label="Selected request"><h2 className="font-semibold">Review: {selected.gymName}</h2><p className="mt-2 text-sm">Owner: {selected.ownerName} · Plan: {selected.plan}</p><p className="mt-1 text-sm text-muted-foreground">{new Date(selected.date).toLocaleString()} · {selected.status}</p></section>}
      <DataTable head={['Gym Name', 'Phone', 'Email', 'Plan', 'Request Date', 'Decision']}>
        {pending.map((r) => (
          <tr key={r.id} className={r.id===request?'bg-secondary':''}>
            <td className={td}>{r.gymName}</td>
            <td className={td}>{r.phone}</td>
            <td className={td}>{r.email}</td>
            <td className={td}>{r.plan}</td>
            <td className={td}>{r.requestDate}</td>
            <td className={td}>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => decide(r.id, r.gymName, true)}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => decide(r.id, r.gymName, false)}>Reject</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
      {!pending.length && <p className="py-6 text-muted-foreground">No pending requests.</p>}
      {decided.length > 0 && (
        <>
          <h3 className="mb-3 mt-10 text-sm font-semibold">Decided</h3>
          <DataTable head={['Gym Name', 'Plan', 'Request Date', 'Status']}>
            {decided.map((r) => (
              <tr key={r.id}>
                <td className={td}>{r.gymName}</td>
                <td className={td}>{r.plan}</td>
                <td className={td}>{r.requestDate}</td>
                <td className={td}><StatusPill status={r.status === 'Approved' ? 'Active' : 'Expired'} /></td>
              </tr>
            ))}
          </DataTable>
        </>
      )}
    </div>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader, DataTable, td, StatusPill, Field, selectCls } from '@/components/kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useDemoStore, editGym, setGymStatus, deleteGym, PLAN_PRICES, type ApprovedGym } from '@/lib/demo';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/super-admin/gyms')({
  head: () => seo('Approved gyms', 'Manage fictional approved gyms and their subscriptions.'),
  component: Gyms,
});

function Gyms() {
  const gyms = useDemoStore((s) => s.gyms);
  const [editing, setEditing] = useState<ApprovedGym | null>(null);
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('Basic');

  function openEdit(g: ApprovedGym) {
    setEditing(g);
    setName(g.name);
    setPlan(g.plan);
  }

  function saveEdit() {
    if (!editing) return;
    if (!name.trim()) {
      toast.error('Gym name is required');
      return;
    }
    editGym(editing.id, { name: name.trim(), plan });
    toast.success('Gym updated (demo).');
    setEditing(null);
  }

  return (
    <div>
      <PageHeader title="Approved Gyms" subtitle="Active and frozen subscriptions · fictional demo data." />
      <DataTable head={['Gym Name', 'Phone', 'Email', 'Plan', 'Start', 'End', 'Status', 'Actions']}>
        {gyms.map((g) => (
          <tr key={g.id}>
            <td className={td}>{g.name}</td>
            <td className={td}>{g.phone}</td>
            <td className={td}>{g.email}</td>
            <td className={td}>{g.plan}</td>
            <td className={td}>{g.start}</td>
            <td className={td}>{g.end}</td>
            <td className={td}><StatusPill status={g.status === 'Active' ? 'Active' : 'Expired'} /></td>
            <td className={td}>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(g)}>Edit</Button>
                {g.status === 'Active' ? (
                  <Button size="sm" variant="secondary" onClick={() => { setGymStatus(g.id, 'Frozen'); toast.success(`${g.name} frozen (demo).`); }}>Freeze</Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => { setGymStatus(g.id, 'Active'); toast.success(`${g.name} reactivated (demo).`); }}>Reactivate</Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => { if (window.confirm(`Delete ${g.name}? This removes the demo gym only.`)) { deleteGym(g.id); toast.success(`${g.name} deleted (demo).`); } }}>Delete</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
      {!gyms.length && <p className="py-6 text-muted-foreground">No approved gyms yet. Approve a request to add one.</p>}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="dialog" aria-modal="true" aria-label="Edit gym">
          <div className="panel w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold">Edit gym</h3>
            <div className="mt-4 space-y-4">
              <Field label="Gym name"><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></Field>
              <Field label="Subscription plan">
                <select className={selectCls} value={plan} onChange={(e) => setPlan(e.target.value)}>
                  {Object.keys(PLAN_PRICES).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <p className="text-xs text-muted-foreground">Changing the plan recalculates the subscription end date from the start date.</p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

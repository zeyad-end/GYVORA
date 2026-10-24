import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { listAdminGyms, setGymFrozen, deleteGymAccount } from '@/lib/platform-admin.functions';
import { Button } from './ui/button';
import { DataTable, PageHeader, td } from './kit';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

type AdminGym = Awaited<ReturnType<typeof listAdminGyms>>[number];

export function CloudGyms() {
  const list = useServerFn(listAdminGyms);
  const freeze = useServerFn(setGymFrozen);
  const remove = useServerFn(deleteGymAccount);
  const [rows, setRows] = useState<AdminGym[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [freezing, setFreezing] = useState<AdminGym | null>(null);
  const [note, setNote] = useState('');

  async function load() {
    try { setRows(await list({})); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load gyms. Please reload.'); }
  }
  useEffect(() => { void load(); }, []);

  async function confirmFreeze() {
    if (!freezing) return;
    setBusy(true); setError('');
    try {
      await freeze({ data: { gymId: freezing.id, frozen: true, note } });
      toast.success(`${freezing.name} frozen — the owner is blocked from the dashboard.`);
      setFreezing(null); setNote('');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not freeze the gym.'); }
    finally { setBusy(false); }
  }

  async function unfreeze(g: AdminGym) {
    if (!window.confirm(`Unfreeze ${g.name}? The owner regains dashboard access.`)) return;
    setBusy(true); setError('');
    try {
      await freeze({ data: { gymId: g.id, frozen: false } });
      toast.success(`${g.name} reactivated.`);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not unfreeze the gym.'); }
    finally { setBusy(false); }
  }

  async function deleteAccount(g: AdminGym) {
    if(!window.confirm(`Delete ${g.name}? Gym access will be permanently disabled. A dedicated owner's sign-in will also be disabled. Historical records and unrelated accounts are retained.`))return;
    setBusy(true);setError('');
    try {const result=await remove({data:{gymId:g.id}});toast.success(result.ownerDisabled?'Gym deleted and owner sign-in disabled.':'Gym deleted. The shared owner account retains unrelated access.');await load();}
    catch(e){setError(e instanceof Error?e.message:'Could not delete the gym.');await load();}
    finally{setBusy(false);}
  }

  return (
    <div>
      <PageHeader title="Approved Gyms" subtitle={`Total approved gyms: ${rows.filter(g=>!g.deleted).length}`} />
      {error && <p role="alert" className="mb-4 text-destructive">{error}</p>}
      <DataTable head={['#', 'Gym Name', 'Owner', 'Plan', 'Status', 'Freeze note', 'Actions']}>
        {rows.map((g, i) => (
          <tr key={g.id}>
            <td className={td}>{i + 1}</td>
            <td className={td}>{g.name}</td>
            <td className={td}>{g.ownerName || '—'}{g.ownerEmail ? <span className="block text-xs text-muted-foreground">{g.ownerEmail}</span> : null}</td>
            <td className={td}>{g.plan || '—'}</td>
             <td className={td}><span className={g.deleted||g.frozen ? 'text-destructive' : 'text-success'}>{g.deleted?'Deleted':g.frozen ? 'Frozen' : 'Active'}</span></td>
            <td className={td}>{g.frozen && g.freezeNote ? g.freezeNote : '—'}</td>
            <td className={td}>
               <div className="flex flex-wrap gap-2">{!g.deleted && (g.frozen
                ? <Button size="sm" variant="secondary" disabled={busy} onClick={() => void unfreeze(g)}>Unfreeze</Button>
                 : <Button size="sm" variant="secondary" disabled={busy} onClick={() => { setFreezing(g); setNote(''); }}>Freeze</Button>)}
                 <Button size="sm" variant="destructive" disabled={busy} onClick={()=>void deleteAccount(g)}>{g.deleted?'Retry deactivation':'Delete'}</Button></div>
            </td>
          </tr>
        ))}
      </DataTable>
      {!rows.length && <p className="py-6 text-muted-foreground">No approved gyms yet. Approve a request to add one.</p>}

      <Dialog open={!!freezing} onOpenChange={(open) => { if (!open) setFreezing(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Freeze {freezing?.name}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">The gym owner will be blocked from the dashboard until you unfreeze the account. You can add a reason below — it will be shown to the owner.</p>
          <label className="block text-sm">
            Notes (optional)
            <Textarea className="mt-2" rows={4} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for freezing this account…" />
          </label>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFreezing(null)}>Cancel</Button>
            <Button variant="destructive" disabled={busy} onClick={() => void confirmFreeze()}>{busy ? 'Freezing…' : 'Freeze account'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

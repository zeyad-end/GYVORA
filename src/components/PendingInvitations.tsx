import {useEffect,useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import type {Database} from '@/integrations/supabase/types';
import {useCloud} from './CloudProvider';
import {Button} from './ui/button';
import {toast} from 'sonner';
import {getDemoSession} from '@/lib/demo';
export function PendingInvitations(){const c=useCloud();const [rows,setRows]=useState<Database['public']['Tables']['staff_invitations']['Row'][]>([]);async function load(){if(getDemoSession()){setRows([]);return;}if(!c.profile)return;const {data}=await supabase.from('staff_invitations').select('*').eq('email',c.profile.email.toLowerCase()).eq('status','Pending').gt('expires_at',new Date().toISOString());setRows(data??[]);}useEffect(()=>{void load();},[c.profile?.email]);return <div className="space-y-3">{rows.map(i=><div key={i.id} className="border-b py-4"><p className="font-medium">IronHaus Gym invited you to join as {i.role}.</p><div className="mt-3 flex gap-2">{[true,false].map(accept=><Button key={String(accept)} variant={accept?'default':'outline'} onClick={async()=>{const {error}=await supabase.rpc('respond_invitation',{invitation_id:i.id,accept});if(error)toast.error(error.message);else{toast.success(accept?'Invitation accepted':'Invitation declined');await load();await c.refresh();}}}>{accept?'Accept':'Decline'}</Button>)}</div></div>)}</div>}
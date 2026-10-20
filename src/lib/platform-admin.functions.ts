import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

export const getPlatformNotifications = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const {data:allowed,error:roleError}=await context.supabase.rpc('is_super_admin');
  if(roleError || !allowed)throw new Error('Administrator access required');
  const {data:rows,error}=await context.supabase.from('platform_request_notifications').select('id,request_id,created_at,read_at').eq('recipient_id',context.userId).order('created_at',{ascending:false});
  if(error)throw new Error('Could not load notifications.');
  const {data:requests,error:requestError}=await context.supabase.from('owner_requests').select('*');
  if(requestError)throw new Error('Could not load gym requests.');
  const ids=[...new Set((requests??[]).map(r=>r.user_id))];
  const {data:profiles}=ids.length ? await context.supabase.from('profiles').select('id,full_name').in('id',ids) : {data:[]};
  return (rows??[]).flatMap(n=>{const r=requests?.find(r=>r.id===n.request_id);return r ? [{id:n.id,requestId:r.id,gymName:r.gym_name,ownerName:profiles?.find(p=>p.id===r.user_id)?.full_name || 'Name not recorded',plan:r.plan,date:r.created_at,status:r.status,read:!!n.read_at}] : [];});
});
export const markPlatformNotificationsRead=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({ids:z.array(z.string().uuid()).max(1000)}).parse(input)).handler(async({data,context})=>{
  const {data:allowed}=await context.supabase.rpc('is_super_admin');if(!allowed)throw new Error('Administrator access required');
  if(!data.ids.length)return true;
  const {error}=await context.supabase.from('platform_request_notifications').update({read_at:new Date().toISOString()}).eq('recipient_id',context.userId).in('id',data.ids);if(error)throw new Error('Could not mark notifications as read.');return true;
});
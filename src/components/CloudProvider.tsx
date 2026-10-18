import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useRouter, useRouterState, Link } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { bindPersistence, hydrateState, getState, type State } from '@/lib/store';
import { gym as gymSeed } from '@/lib/mock';
import { saveRecords, getStaff } from '@/lib/cloud.functions';
import { Button } from './ui/button';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];
type GymRow = Database['public']['Tables']['gyms']['Row'];
type Context = { profile: Profile|null; gyms: GymRow[]; gymId: string; role: string; permissions: string[]; verified: boolean; loading: boolean; refresh: ()=>Promise<void>; selectGym:(id:string)=>Promise<void>; logout:()=>Promise<void> };
const CloudContext=createContext<Context>({profile:null,gyms:[],gymId:'',role:'',permissions:[],verified:false,loading:true,refresh:async()=>{},selectGym:async()=>{},logout:async()=>{}});
export const useCloud=()=>useContext(CloudContext);
export function CloudProvider({children}:{children:ReactNode}) {
 const router=useRouter(); const save=useServerFn(saveRecords); const staffFetch=useServerFn(getStaff);
 const [profile,setProfile]=useState<Profile|null>(null);const [gyms,setGyms]=useState<GymRow[]>([]);const [gymId,setGymId]=useState('');const [role,setRole]=useState('');const [permissions,setPermissions]=useState<string[]>([]);const [verified,setVerified]=useState(false);const [loading,setLoading]=useState(true);
 async function loadGym(id:string) { bindPersistence(undefined);const {data:rows,error}=await supabase.from('gym_records').select('*').eq('gym_id',id);if(error)throw error; const {data:r}=await supabase.from('user_roles').select('*').eq('gym_id',id).eq('user_id',profile?.id??'').maybeSingle();setRole(r?.role??'');setPermissions(r?.permissions??[]);
  const base:State={gym:{...gymSeed,name:gyms.find(g=>g.id===id)?.name??'IronHaus',logo:'',cover:'',gallery:[],hoursByDay:[]},members:[],plans:[],products:[],trainers:[],workouts:[],staff:[],sessions:[],attendance:[],staffAttendance:[],recurring:[]};
  for(const row of rows??[]) { if(row.kind==='gym')base.gym=row.data as unknown as State['gym'];else if(row.kind in base && row.kind!=='staff') { const key=row.kind as Exclude<keyof State,'gym'>; (base[key] as unknown[]).push(row.data); } }
  if(r?.role!=='Client') {try {base.staff=await staffFetch({data:{gymId:id}});}catch{base.staff=[];} }
  hydrateState(base);setGymId(id);
  bindPersistence(async(changes)=>{try { const formatted=Object.entries(changes).filter(([k])=>k!=='staff').map(([kind,value])=>({kind,rows:(kind==='gym'?[value]:value as unknown[]).map((v,i)=>{const obj=v as Record<string,unknown>;return {...obj,id:obj['id']??(kind==='gym'?'profile':obj['name']??String(i))};})})); await save({data:{gymId:id,changes:formatted as Parameters<typeof save>[0]['data']['changes']}});hydrateState({...getState(),...changes});toast.success('Changes saved'); }catch(e){toast.error(e instanceof Error?e.message:'Could not save changes');} });
 }
 async function refresh(){ setLoading(true);try {const {data:{user}}=await supabase.auth.getUser();if(!user){setProfile(null);setVerified(false);setGyms([]);setGymId('');bindPersistence(undefined);return;}const {data:p,error}=await supabase.from('profiles').select('*').eq('id',user.id).single();if(error)throw error;setProfile(p);const {data:v}=await supabase.rpc('otp_verified');setVerified(Boolean(v));if(v){const {data:g}=await supabase.from('gyms').select('*');setGyms(g??[]); const {data:admin}=await supabase.from('user_roles').select('role').eq('user_id',user.id).eq('role','super_admin').maybeSingle();if(admin)setRole('super_admin');}}catch(e){toast.error(e instanceof Error?e.message:'Could not load your account');}finally{setLoading(false);} }
 useEffect(()=>{void refresh();const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event))return;queueMicrotask(()=>{void refresh();void router.invalidate();});});return()=>{subscription.unsubscribe();bindPersistence(undefined);};},[]);
 useEffect(()=>{if(profile&&verified&&gyms.length===1)void loadGym(gyms[0]?.id??'').catch(e=>toast.error(String(e)));},[profile?.id,verified,gyms]);
 async function logout(){await supabase.auth.signOut();bindPersistence(undefined);setGymId('');await refresh();await router.navigate({to:'/'});}
 return <CloudContext.Provider value={{profile,gyms,gymId,role,permissions,verified,loading,refresh,selectGym:loadGym,logout}}>{children}</CloudContext.Provider>;
}
export function AccessBoundary({children}:{children:ReactNode}) {const c=useCloud();const path=useRouterState({select:s=>s.location.pathname});const publicPaths=['/','/register','/auth','/verify-otp','/reset-password'];if(publicPaths.includes(path))return children;if(c.loading)return <div className="p-12 text-muted-foreground">Loading your account…</div>;if(!c.profile)return <div className="mx-auto max-w-md p-10"><h1 className="text-2xl">Sign in to IronHaus</h1><Button asChild className="mt-6"><Link to="/">Sign in</Link></Button></div>;if(!c.verified)return <div className="p-10"><h1 className="text-2xl">Verify your account</h1><Button asChild className="mt-6"><Link to="/verify-otp">Verify OTP</Link></Button></div>;if(path.startsWith('/member')||path==='/subscription-request'||path==='/super-admin'||path==='/gyms')return children;if(!c.gymId)return <div className="p-10"><h1 className="text-2xl">Select your gym</h1><Button asChild className="mt-6"><Link to={c.profile.account_type==='owner'&&c.gyms.length===0?'/subscription-request':'/gyms'}>Continue</Link></Button></div>;if(c.role==='Client')return <div className="p-10"><h1 className="text-2xl">Gym staff access required</h1><Button asChild className="mt-6"><Link to="/member">My account</Link></Button></div>;return children;}
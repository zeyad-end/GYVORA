import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCloud } from '@/components/CloudProvider';
import { AppBrand } from '@/components/AppBrand';
import { Field } from '@/components/kit';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { setDemoSession } from '@/lib/demo';
import { seo } from '@/lib/seo';
export const Route = createFileRoute('/client-sign-in')({head:()=>seo('Client sign in','Sign in to your saved GYVORA client account.'),component:ClientSignIn});
function ClientSignIn() {
  const cloud=useCloud(); const navigate=useNavigate(); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  return <div className="flex min-h-screen items-center justify-center px-6 py-12"><div className="w-full max-w-md"><AppBrand large className="mb-8"/><h1 className="text-2xl font-semibold">Client sign in</h1><form method="post" className="mt-6 space-y-4" onSubmit={async e=>{e.preventDefault();const form=new FormData(e.currentTarget);setBusy(true);setError('');try{setDemoSession(null);const {error}=await supabase.auth.signInWithPassword({email:String(form.get('email')),password:String(form.get('password'))});if(error)throw new Error('Sign-in failed. Check your email and password, or whether your account is deactivated.');const {data:enabled}=await supabase.rpc('otp_verified');if(!enabled){await supabase.auth.signOut();throw new Error('This account has been deactivated.');}await cloud.refresh();await navigate({to:'/member'});}catch(e){setError(e instanceof Error?e.message:'Sign-in failed');}finally{setBusy(false);}}}><Field label="Email"><Input name="email" type="email" required/></Field><Field label="Password"><Input name="password" type="password" required/></Field>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" className="w-full" disabled={busy}>{busy?'Signing in…':'Sign in'}</Button><p className="text-sm text-muted-foreground"><Link to="/register" className="text-primary">Create account</Link></p></form></div></div>;
}
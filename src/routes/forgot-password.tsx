import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppBrand } from '@/components/AppBrand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/kit';
import { seo } from '@/lib/seo';
export const Route = createFileRoute('/forgot-password')({head:()=>seo('Forgot password','Request a secure GYVORA email password reset.'),component:ForgotPassword});
function ForgotPassword() {
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  return <div className="mx-auto max-w-md px-6 py-16"><AppBrand large className="mb-8"/><h1 className="text-2xl font-semibold">Forgot password?</h1><form className="mt-6 space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');try{const email=String(new FormData(e.currentTarget).get('email'));const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});if(error)throw error;setMessage('If this email has an account, a reset link will be sent.');}catch(err){setMessage(err instanceof Error?err.message:'Could not request a reset.');}finally{setBusy(false);}}}><Field label="Email"><Input type="email" name="email" required autoComplete="email"/></Field><Button disabled={busy}>{busy?'Sending…':'Send reset link'}</Button></form><p className="mt-4 text-sm text-muted-foreground">Phone-only password recovery requires a configured verification provider. No temporary codes can reset an account password.</p>{message&&<p role="status" className="mt-4 text-sm">{message}</p>}<Link to="/" className="mt-6 block text-primary">Back to login</Link></div>;
}
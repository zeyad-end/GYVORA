import { createMiddleware } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { currentSessionToken } from './session-token';

export const attachCurrentSession = createMiddleware({ type: 'function' }).client(async ({ next }) => {
  const token = await currentSessionToken(supabase.auth);
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});

// Fail before sending a private lookup when the owner has no provider session.
export const requireLookupSession = createMiddleware({ type: 'function' }).client(async ({ next }) => {
  const token = await currentSessionToken(supabase.auth, true);
  return next({ headers: { Authorization: `Bearer ${token}` } });
});
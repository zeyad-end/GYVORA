import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { registrationSchema } from './registration';
import { normalizeContact, temporaryVerificationEnabled, verifyTemporaryCode } from './signup-verifier';

const contactSchema = z.object({ channel: z.enum(['email', 'phone']), contact: z.string().trim().min(1).max(255) });
async function hashToken(token: string) {
  const bytes = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}
export const sendSignupCode = createServerFn({ method: 'POST' }).inputValidator(input => contactSchema.parse(input)).handler(async ({ data }) => {
  // Replace this guard/adapter with real provider send+verify; never relax the production guard.
  verifyTemporaryCode('send', temporaryVerificationEnabled(import.meta.env.DEV, process.env['NODE_ENV']));
  const contact = normalizeContact(data.channel, data.contact);
  if (data.channel === 'email') z.string().email().parse(contact);
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const token = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
  const { error } = await supabaseAdmin.from('signup_verification_challenges').insert({ token_hash: await hashToken(token), channel: data.channel, contact });
  if (error) throw new Error('Could not start verification. Please try again.');
  return { token, channel: data.channel, contact, message: 'Preview verification: no email or SMS was sent. Enter any non-empty code.' };
});

export const createVerifiedAccount = createServerFn({ method: 'POST' }).inputValidator(input => z.object({
  account: registrationSchema,
  token: z.string().regex(/^[a-f0-9]{64}$/),
  code: z.string().trim().min(1).max(128),
  photo: z.string().max(1100000).default(''),
}).parse(input)).handler(async ({ data }) => {
  verifyTemporaryCode(data.code, temporaryVerificationEnabled(import.meta.env.DEV, process.env['NODE_ENV']));
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const now = new Date().toISOString();
  const tokenHash = await hashToken(data.token);
  const { data: challenge, error } = await supabaseAdmin.from('signup_verification_challenges').select('*').eq('token_hash', tokenHash).is('consumed_at', null).gt('expires_at', now).maybeSingle();
  if (error || !challenge) throw new Error('Verification expired or already used. Send a new code.');
  const account = data.account;
  const email = account.email ? normalizeContact('email', account.email) : '';
  const phone = account.phone ? normalizeContact('phone', account.phone) : '';
  if (challenge.contact !== (challenge.channel === 'email' ? email : phone)) throw new Error('Contact changed. Send a new code.');
  // Atomic single use; account creation cannot be replayed with the same challenge.
  const consumed = await supabaseAdmin.from('signup_verification_challenges').update({ consumed_at: now }).eq('token_hash', tokenHash).is('consumed_at', null).gt('expires_at', now).select('token_hash');
  if (consumed.error || consumed.data?.length !== 1) throw new Error('Verification already used. Send a new code.');
  const result = await supabaseAdmin.auth.admin.createUser({
    ...(email ? { email, email_confirm: true } : {}),
    ...(phone ? { phone, phone_confirm: true } : {}),
    password: account.password,
    user_metadata: { full_name: account.full_name, phone, photo: data.photo, account_type: account.account_type === 'gym' ? 'owner' : 'client' },
  });
  if (result.error || !result.data.user) throw new Error('Account creation failed. The contact may already be registered. Send a new code and try again.');
  return { created: true };
});
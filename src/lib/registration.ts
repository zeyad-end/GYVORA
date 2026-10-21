import { z } from 'zod';
export const registrationSchema = z.object({
 full_name: z.string().trim().min(1).max(100),
 phone: z.string().trim().max(30).default(''),
 email: z.union([z.string().trim().email().max(255), z.literal('')]).default(''),
 password: z.string().min(8).max(128),
 account_type: z.enum(['gym', 'individual', 'dashboard']),
}).superRefine((value, ctx) => {
 if (value.account_type === 'gym' && !value.phone) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Phone Number is required for a Gym Account.' });
 if (value.account_type === 'individual' && !value.phone && !value.email) ctx.addIssue({ code: 'custom', path: ['email'], message: 'Enter either a Phone Number or Email.' });
 if (value.account_type === 'dashboard' && !value.email) ctx.addIssue({ code: 'custom', path: ['email'], message: 'Email is required for a Dashboard account.' });
});
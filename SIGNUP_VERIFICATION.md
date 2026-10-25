# Account creation and verification

`/register` is the normal Gym Account / Client signup page; `/` performs provider password login by email or international phone, then checks the persisted profile type and trusted admin role. Signup never grants an Owner role or approval: the existing subscription request flow remains required.

## Temporary verifier boundary

`src/lib/signup.functions.ts` checks `temporaryVerificationEnabled(import.meta.env.DEV, process.env['NODE_ENV'])` inside **both** server handlers before loading privileged credentials. Vite production builds replace DEV with false, and a production runtime independently disables it. A hostname, browser flag, query parameter or request body cannot enable it. Thus the published production app does not send temporary challenges or create arbitrary-code accounts. Signup fails closed with a provider-unavailable notice until real verification is installed; password login for existing accounts still works.

Development challenges are server-generated 256-bit random tokens stored only as SHA-256 hashes in a service-role-only RLS table. They expire in ten minutes, bind to the selected contact, and are consumed atomically once. The development adapter accepts any nonempty code and explicitly states no SMS/email was sent. Accounts created this way are real persisted development test accounts, not proof of contact ownership. Do not use real customer contacts for preview tests. Development-created confirmed test accounts remain in this project's shared backend; publishing does not erase them.

## Replacing the adapter

Replace the temporary send and verify calls with server-only provider adapters. Store the provider challenge/reference with the same exact normalized contact, enforce expiry, retry/rate limits and single consumption. Confirm the provider result before calling account creation. Never enable the temporary adapter in production or make its enable flag client-controlled. Provider credentials belong in Cloud secrets, not frontend code. Email confirmation settings are not globally weakened; only the accounts explicitly verified through this flow are confirmed at creation.

For both supplied email and phone, verify each contact separately before production confirmation; development currently confirms the supplied test contacts after one bound challenge. Native phone/password login must also be enabled by the account provider. Phone-only recovery intentionally fails closed until a real recovery provider is configured; existing email recovery uses the public reset-password page.
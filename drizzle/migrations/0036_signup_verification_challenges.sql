CREATE TABLE public.signup_verification_challenges (
 token_hash text PRIMARY KEY,
 channel text NOT NULL CHECK (channel IN ('email','phone')),
 contact text NOT NULL,
 expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
 consumed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.signup_verification_challenges TO service_role;
REVOKE ALL ON public.signup_verification_challenges FROM anon, authenticated;
ALTER TABLE public.signup_verification_challenges ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.signup_verification_challenges IS 'Server-only signup challenges; no passwords. Production provider verification must precede consumption.';
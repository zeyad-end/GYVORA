CREATE OR REPLACE FUNCTION public.otp_verified() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT auth.uid() IS NOT NULL $$;
COMMENT ON FUNCTION public.otp_verified() IS 'OTP step removed: returns true for any provider-authenticated session. Name kept so existing policies keep working.';
COMMENT ON TABLE public.login_challenges IS 'DEPRECATED: OTP login flow removed';
COMMENT ON TABLE public.verified_sessions IS 'DEPRECATED: OTP login flow removed';
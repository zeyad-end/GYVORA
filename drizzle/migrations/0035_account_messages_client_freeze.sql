CREATE TABLE public.account_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id uuid,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
GRANT SELECT ON public.account_messages TO authenticated;
GRANT ALL ON public.account_messages TO service_role;
ALTER TABLE public.account_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_account_messages ON public.account_messages FOR SELECT TO authenticated USING (recipient_id = auth.uid());

ALTER TABLE public.profiles ADD COLUMN frozen_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN freeze_note text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.client_frozen() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND frozen_at IS NOT NULL)
$$;

CREATE OR REPLACE FUNCTION public.set_client_frozen(target uuid, frozen boolean, note text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Administrator access required'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target AND role IN ('Owner','super_admin')) THEN RAISE EXCEPTION 'Gym owners and administrators cannot be frozen here'; END IF;
  UPDATE public.profiles
    SET frozen_at = CASE WHEN frozen THEN now() ELSE NULL END,
        freeze_note = CASE WHEN frozen THEN left(coalesce(note,''),1000) ELSE '' END
    WHERE id = target AND account_type IN ('client','staff');
  IF NOT FOUND THEN RAISE EXCEPTION 'Client account not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_account_message(target uuid, body text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Administrator access required'; END IF;
  IF length(trim(body)) = 0 OR length(body) > 2000 THEN RAISE EXCEPTION 'Message must be 1-2000 characters'; END IF;
  INSERT INTO public.account_messages (recipient_id, sender_id, body) VALUES (target, auth.uid(), trim(body)) RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

DROP POLICY own_client_links ON public.client_gym_links;
CREATE POLICY own_client_links ON public.client_gym_links FOR ALL TO authenticated
  USING ((user_id = auth.uid()) AND otp_verified() AND NOT public.client_frozen())
  WITH CHECK ((user_id = auth.uid()) AND otp_verified() AND client_has_gym_approval(gym_id) AND NOT public.client_frozen());

DROP POLICY own_programs ON public.client_programs;
CREATE POLICY own_programs ON public.client_programs FOR ALL TO authenticated
  USING ((user_id = auth.uid()) AND otp_verified() AND NOT public.client_frozen())
  WITH CHECK ((user_id = auth.uid()) AND otp_verified() AND NOT public.client_frozen());

DROP POLICY own_membership_history ON public.client_membership_history;
CREATE POLICY own_membership_history ON public.client_membership_history FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) AND otp_verified() AND NOT public.client_frozen());
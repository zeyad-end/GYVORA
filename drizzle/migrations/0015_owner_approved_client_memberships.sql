CREATE UNIQUE INDEX gym_one_client_membership ON public.gym_records(gym_id,client_id) WHERE kind='members' AND client_id IS NOT NULL;

CREATE FUNCTION public.guard_client_membership_link() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.kind='members' AND NEW.client_id IS NOT NULL AND (TG_OP='INSERT' OR OLD.client_id IS DISTINCT FROM NEW.client_id) THEN
  IF auth.uid() IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND gym_id=NEW.gym_id AND role='Owner') THEN RAISE EXCEPTION 'Only gym owners can add an existing client'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.owner_requests WHERE gym_id=NEW.gym_id AND status='Approved') THEN RAISE EXCEPTION 'Gym subscription approval is required before adding clients'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=NEW.client_id AND account_type IN ('client','staff')) THEN RAISE EXCEPTION 'Existing client account required'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_client_membership_link BEFORE INSERT OR UPDATE ON public.gym_records FOR EACH ROW EXECUTE FUNCTION public.guard_client_membership_link();

CREATE FUNCTION public.client_has_gym_approval(g uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT auth.uid() IS NOT NULL AND (EXISTS(SELECT 1 FROM public.gym_records WHERE gym_id=g AND kind='members' AND client_id=auth.uid()) OR EXISTS(SELECT 1 FROM public.user_roles WHERE gym_id=g AND user_id=auth.uid() AND role!='Client'))
$$;
REVOKE ALL ON FUNCTION public.client_has_gym_approval(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.client_has_gym_approval(uuid) TO authenticated;
ALTER POLICY own_client_links ON public.client_gym_links USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND public.client_has_gym_approval(gym_id));

CREATE OR REPLACE FUNCTION public.client_gym_content(g uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.client_has_gym_approval(g) THEN RAISE EXCEPTION 'A gym owner must add or approve you before you can access this gym'; END IF;
 SELECT jsonb_build_object('workouts',coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'name',data->>'name','trainer',data->>'trainer','notes',data->>'notes','exercises',data->'exercises')) FROM public.gym_records WHERE gym_id=g AND kind='workouts'),'[]'::jsonb),'products',coalesce((SELECT jsonb_agg(jsonb_build_object('name',data->>'name','price',data->'price','image',data->>'image')) FROM public.gym_records WHERE gym_id=g AND kind='products'),'[]'::jsonb),'trainers',coalesce((SELECT jsonb_agg(jsonb_build_object('name',data->>'name','specialty',data->>'specialty','bio',data->>'bio','image',data->>'image')) FROM public.gym_records WHERE gym_id=g AND kind='trainers'),'[]'::jsonb)) INTO result;
 RETURN result;
END $$;

CREATE FUNCTION public.gym_subscription_summary(g uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.client_has_gym_approval(g) AND NOT public.gym_access(g,'Settings') THEN RAISE EXCEPTION 'Gym membership or owner access required'; END IF;
 SELECT jsonb_build_object('status',status,'plan',plan,'submitted',created_at::date,'approved',decided_at::date) INTO result FROM public.owner_requests WHERE gym_id=g AND status='Approved';
 RETURN coalesce(result,jsonb_build_object('status','Not recorded','plan','Not recorded'));
END $$;
REVOKE ALL ON FUNCTION public.gym_subscription_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gym_subscription_summary(uuid) TO authenticated;
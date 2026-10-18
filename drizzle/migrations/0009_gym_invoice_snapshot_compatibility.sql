CREATE OR REPLACE FUNCTION public.guard_gym_invoice_and_plan() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE highest integer; existing_number text;
BEGIN
 IF TG_OP = 'DELETE' THEN
  IF OLD.kind = 'transactions' AND OLD.data ? 'number' THEN RAISE EXCEPTION 'Numbered invoices must be archived to preserve their invoice number'; END IF;
  IF OLD.kind = 'plans' AND EXISTS(SELECT 1 FROM public.gym_records WHERE gym_id = OLD.gym_id AND kind = 'members' AND data->>'plan' = OLD.data->>'name') THEN RAISE EXCEPTION 'This plan is assigned to members. Move their memberships to another plan before deleting it.'; END IF;
  RETURN OLD;
 END IF;
 IF NEW.kind = 'transactions' THEN
  SELECT data->>'number' INTO existing_number FROM public.gym_records WHERE gym_id=NEW.gym_id AND kind='transactions' AND id=NEW.id;
  IF existing_number IS NOT NULL THEN
   IF NEW.data->>'number' IS DISTINCT FROM existing_number THEN RAISE EXCEPTION 'Invoice numbers cannot change'; END IF;
  ELSIF NEW.data ? 'number' THEN
   SELECT coalesce(max((data->>'number')::integer),0) INTO highest FROM public.gym_records WHERE gym_id=NEW.gym_id AND kind='transactions' AND data ? 'number';
   IF (NEW.data->>'number')::integer != highest + 1 THEN RAISE EXCEPTION 'Invoice number changed. Reload before creating the invoice.'; END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;
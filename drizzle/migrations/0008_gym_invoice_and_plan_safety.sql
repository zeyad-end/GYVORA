CREATE OR REPLACE FUNCTION public.guard_gym_invoice_and_plan() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE highest integer;
BEGIN
 IF TG_OP = 'DELETE' THEN
  IF OLD.kind = 'transactions' AND OLD.data ? 'number' THEN RAISE EXCEPTION 'Numbered invoices must be archived to preserve their invoice number'; END IF;
  IF OLD.kind = 'plans' AND EXISTS(SELECT 1 FROM public.gym_records WHERE gym_id = OLD.gym_id AND kind = 'members' AND data->>'plan' = OLD.data->>'name') THEN RAISE EXCEPTION 'This plan is assigned to members. Move their memberships to another plan before deleting it.'; END IF;
  RETURN OLD;
 END IF;
 IF NEW.kind = 'transactions' AND NEW.data ? 'number' THEN
  IF TG_OP = 'UPDATE' AND OLD.data ? 'number' THEN
   IF NEW.data->>'number' IS DISTINCT FROM OLD.data->>'number' THEN RAISE EXCEPTION 'Invoice numbers cannot change'; END IF;
  ELSE
   SELECT coalesce(max((data->>'number')::integer),0) INTO highest FROM public.gym_records WHERE gym_id=NEW.gym_id AND kind='transactions' AND data ? 'number';
   IF (NEW.data->>'number')::integer != highest + 1 THEN RAISE EXCEPTION 'Invoice number changed. Reload before creating the invoice.'; END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_gym_invoice_plan BEFORE INSERT OR UPDATE OR DELETE ON public.gym_records FOR EACH ROW EXECUTE FUNCTION public.guard_gym_invoice_and_plan();
CREATE UNIQUE INDEX gym_invoice_number_unique ON public.gym_records (gym_id, ((data->>'number')::integer)) WHERE kind='transactions' AND data ? 'number';
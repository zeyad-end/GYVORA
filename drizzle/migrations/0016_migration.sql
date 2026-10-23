CREATE OR REPLACE FUNCTION public.admin_request_list()
RETURNS TABLE(id uuid, gym_name text, plan text, status text, created_at timestamptz, decided_at timestamptz, owner_name text, owner_email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT r.id, r.gym_name, r.plan, r.status, r.created_at, r.decided_at,
         COALESCE(NULLIF(p.full_name,''), '—'), COALESCE(NULLIF(p.email,''), '—')
  FROM public.owner_requests r
  LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE public.is_super_admin()
  ORDER BY r.created_at DESC
$$;
REVOKE ALL ON FUNCTION public.admin_request_list() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_request_list() TO authenticated;
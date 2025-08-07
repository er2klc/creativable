-- Set explicit, secure search_path for both functions (idempotent)
ALTER FUNCTION public.update_updated_at_column() SET search_path TO public;
ALTER FUNCTION public.is_team_member_of_post(uuid, uuid) SET search_path TO public;
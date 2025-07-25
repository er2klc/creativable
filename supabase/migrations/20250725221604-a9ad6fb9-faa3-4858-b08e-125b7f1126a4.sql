-- Fix search path security warning for the function
DROP FUNCTION IF EXISTS public.is_team_member(uuid, uuid);

CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid uuid, user_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
  );
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER STABLE SET search_path = public;
-- Drop the policy first, then recreate the function with search_path
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;

-- Drop and recreate the function with proper search_path
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

-- Recreate the policy
CREATE POLICY "Users can view team members of their teams" 
ON public.team_members 
FOR SELECT 
USING (
  public.is_team_member(team_members.team_id, auth.uid())
);
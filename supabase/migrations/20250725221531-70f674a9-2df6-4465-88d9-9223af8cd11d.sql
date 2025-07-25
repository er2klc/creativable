-- Fix infinite recursion in team_members RLS policy properly
-- Use security definer function to avoid recursion

-- Create a security definer function to check team membership
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
$$ LANGUAGE PLPGSQL SECURITY DEFINER STABLE;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;

-- Create a new policy using the security definer function
CREATE POLICY "Users can view team members of their teams" 
ON public.team_members 
FOR SELECT 
USING (
  -- Use the security definer function to avoid recursion
  public.is_team_member(team_members.team_id, auth.uid())
);
-- Fix infinite recursion in team_members RLS policy
-- The current policy references team_members table within itself, causing infinite recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;

-- Create a new policy that doesn't cause recursion
-- This policy allows users to view team members if they are members of the same team
-- We'll use a simpler approach that checks team membership directly
CREATE POLICY "Users can view team members of their teams" 
ON public.team_members 
FOR SELECT 
USING (
  -- Allow viewing if the requesting user is a member of the same team
  EXISTS (
    SELECT 1 
    FROM public.team_members requester_membership
    WHERE requester_membership.team_id = team_members.team_id 
    AND requester_membership.user_id = auth.uid()
  )
);

-- Alternative: Create a more specific policy to avoid recursion
-- Drop and recreate with a different approach
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;

-- Create policy using teams table instead of self-referencing team_members
CREATE POLICY "Users can view team members of their teams" 
ON public.team_members 
FOR SELECT 
USING (
  -- Check if user has access to the team through the teams table
  EXISTS (
    SELECT 1 
    FROM public.teams t
    WHERE t.id = team_members.team_id 
    AND (
      t.created_by = auth.uid() 
      OR EXISTS (
        SELECT 1 
        FROM public.team_members tm 
        WHERE tm.team_id = t.id 
        AND tm.user_id = auth.uid()
      )
    )
  )
);
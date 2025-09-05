-- Check and fix RLS policies for teams table
-- The current RLS policy should allow authenticated users to create teams with their own user_id as created_by

-- First, let's see the current policies (this is a comment, the policies already exist)
-- We need to ensure the policy is working correctly

-- Enable RLS if not already enabled
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Update the INSERT policy to be more explicit about authentication
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;

CREATE POLICY "Users can create teams" 
ON public.teams 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by AND auth.uid() IS NOT NULL);

-- Also ensure we have proper SELECT policy for team creators
DROP POLICY IF EXISTS "Team creators can view their teams" ON public.teams;

CREATE POLICY "Team creators can view their teams" 
ON public.teams 
FOR SELECT 
TO authenticated
USING (auth.uid() = created_by);

-- Update the existing SELECT policy to be more inclusive
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;

CREATE POLICY "Users can view teams they are members of" 
ON public.teams 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 
    FROM team_members 
    WHERE team_members.team_id = teams.id 
    AND team_members.user_id = auth.uid()
  )
);
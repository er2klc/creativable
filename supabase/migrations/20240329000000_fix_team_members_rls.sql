-- Drop existing policy if it exists
DROP POLICY IF EXISTS "team_members_insert_policy" ON "public"."team_members";

-- Create new policy that allows users to join teams via join code
CREATE POLICY "team_members_insert_policy"
ON "public"."team_members"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_id 
    AND (
      -- Allow team owners to add members
      teams.created_by = auth.uid() 
      OR 
      -- Allow users to join via join code
      EXISTS (
        SELECT 1 FROM teams 
        WHERE teams.id = team_id 
        AND teams.join_code IS NOT NULL
      )
    )
  )
);
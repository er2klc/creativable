
CREATE OR REPLACE FUNCTION public.get_user_teams(uid uuid)
 RETURNS SETOF teams
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if user is super admin
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = uid 
    AND is_super_admin = true
  ) THEN
    -- Return all teams for super admin
    RETURN QUERY SELECT * FROM teams ORDER BY order_index ASC;
  ELSE
    -- Return only teams where user is creator or member
    RETURN QUERY
    SELECT DISTINCT t.*
    FROM teams t
    WHERE t.created_by = uid
    OR EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.team_id = t.id 
      AND tm.user_id = uid
    )
    ORDER BY t.order_index ASC;
  END IF;
END;
$function$;

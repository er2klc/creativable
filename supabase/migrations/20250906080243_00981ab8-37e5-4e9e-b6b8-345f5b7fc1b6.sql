-- Add the missing delete_team_cascade function
CREATE OR REPLACE FUNCTION public.delete_team_cascade(team_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete team members
  DELETE FROM team_members WHERE team_id = team_id_param;
  
  -- Delete team posts  
  DELETE FROM team_posts WHERE team_id = team_id_param;
  
  -- Delete team events
  DELETE FROM team_events WHERE team_id = team_id_param;
  
  -- Delete team categories
  DELETE FROM team_categories WHERE team_id = team_id_param;
  
  -- Delete team news
  DELETE FROM team_news WHERE team_id = team_id_param;
  
  -- Delete team member points
  DELETE FROM team_member_points WHERE team_id = team_id_param;
  
  -- Delete team point events  
  DELETE FROM team_point_events WHERE team_id = team_id_param;
  
  -- Delete team member activity log
  DELETE FROM team_member_activity_log WHERE team_id = team_id_param;
  
  -- Delete team calendar events
  DELETE FROM team_calendar_events WHERE team_id = team_id_param;
  
  -- Delete team direct messages
  DELETE FROM team_direct_messages WHERE team_id = team_id_param;
  
  -- Finally delete the team
  DELETE FROM teams WHERE id = team_id_param;
END;
$$;
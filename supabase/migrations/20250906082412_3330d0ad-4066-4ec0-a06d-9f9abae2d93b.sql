-- Fix critical security issues in database

-- 1. Update functions to have proper search_path to prevent security vulnerabilities
CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid uuid, user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_team_member_of_post(post_uuid uuid, user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.team_posts tp
    JOIN public.team_members tm ON tm.team_id = tp.team_id
    WHERE tp.id = post_uuid AND tm.user_id = user_uuid
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_platform_access(platform_uuid uuid, user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is platform creator
  IF EXISTS (
    SELECT 1 FROM elevate_platforms ep 
    WHERE ep.id = platform_uuid AND ep.created_by = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  -- Check direct user access
  IF EXISTS (
    SELECT 1 FROM elevate_user_access eua
    WHERE eua.platform_id = platform_uuid AND eua.user_id = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  -- Check team access
  IF EXISTS (
    SELECT 1 FROM elevate_team_access eta
    JOIN team_members tm ON eta.team_id = tm.team_id
    WHERE eta.platform_id = platform_uuid AND tm.user_id = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_can_manage_platform_access(platform_uuid uuid, user_uuid uuid, target_user_uuid uuid, granted_by_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- User can manage their own access
  IF user_uuid = target_user_uuid THEN
    RETURN true;
  END IF;
  
  -- User who granted access can manage it
  IF user_uuid = granted_by_uuid THEN
    RETURN true;
  END IF;
  
  -- Platform creator can manage all access
  IF EXISTS (
    SELECT 1 FROM elevate_platforms ep
    WHERE ep.id = platform_uuid AND ep.created_by = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_unique_lead(p_user_id uuid, p_name text, p_platform text, p_username text, p_pipeline_id uuid, p_phase_id uuid)
 RETURNS TABLE(id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    new_lead_id UUID;
BEGIN
    -- Insert the new lead and return the ID
    INSERT INTO public.leads (
        user_id,
        name,
        platform,
        social_media_username,
        pipeline_id,
        phase_id,
        industry,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_name,
        p_platform,
        p_username,
        p_pipeline_id,
        p_phase_id,
        'Social Media', -- Default industry for social media leads
        NOW(),
        NOW()
    ) RETURNING leads.id INTO new_lead_id;
    
    RETURN QUERY SELECT new_lead_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.award_team_points(p_team_id uuid, p_user_id uuid, p_points integer, p_reason text, p_event_type text DEFAULT 'manual_award'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_points INTEGER := 0;
  current_level INTEGER := 0;
  new_level INTEGER := 0;
BEGIN
  -- Get current points
  SELECT points, level INTO current_points, current_level
  FROM team_member_points 
  WHERE team_id = p_team_id AND user_id = p_user_id;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    current_points := 0;
    current_level := 0;
  END IF;
  
  -- Calculate new values
  current_points := current_points + p_points;
  new_level := FLOOR(current_points / 100); -- 100 points = 1 level
  
  -- Update or insert points record
  INSERT INTO team_member_points (team_id, user_id, points, level)
  VALUES (p_team_id, p_user_id, current_points, new_level)
  ON CONFLICT (team_id, user_id) 
  DO UPDATE SET 
    points = current_points,
    level = new_level,
    updated_at = now();
    
  -- Create point event record
  INSERT INTO team_point_events (team_id, user_id, event_type, points_change, metadata)
  VALUES (p_team_id, p_user_id, p_event_type, p_points, jsonb_build_object('reason', p_reason));
  
  RETURN jsonb_build_object(
    'success', true,
    'new_points', current_points,
    'new_level', new_level,
    'points_awarded', p_points
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_team_cascade(team_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Update match_similar_content function with proper search_path
CREATE OR REPLACE FUNCTION public.match_similar_content(query_embedding vector, match_threshold double precision DEFAULT 0.78, match_count integer DEFAULT 10)
 RETURNS TABLE(id uuid, content text, similarity double precision)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid as id,
    'No content available'::text as content,
    0.0::float as similarity
  LIMIT match_count;
END;
$function$;

-- Update get_user_teams function with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_teams(uid uuid)
 RETURNS SETOF teams
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
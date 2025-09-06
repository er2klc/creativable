-- Fix team_member_points table relation with profiles
ALTER TABLE team_member_points DROP CONSTRAINT IF EXISTS team_member_points_user_id_fkey;
ALTER TABLE team_member_points ADD CONSTRAINT team_member_points_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing columns to team_hidden_snaps
ALTER TABLE team_hidden_snaps ADD COLUMN IF NOT EXISTS hidden_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing recurring_pattern check constraint to team_calendar_events
ALTER TABLE team_calendar_events DROP CONSTRAINT IF EXISTS recurring_pattern_check;
ALTER TABLE team_calendar_events ADD CONSTRAINT recurring_pattern_check 
  CHECK (recurring_pattern IN ('none', 'daily', 'weekly', 'monthly'));

-- Update existing invalid recurring patterns
UPDATE team_calendar_events SET recurring_pattern = 'none' WHERE recurring_pattern NOT IN ('none', 'daily', 'weekly', 'monthly');

-- Add missing message column to notifications (for new notifications schema)
ALTER TABLE notifications DROP COLUMN IF EXISTS content;
UPDATE notifications SET message = COALESCE(message, 'Notification') WHERE message IS NULL;
ALTER TABLE notifications ALTER COLUMN message SET NOT NULL;

-- Fix team_point_events function parameters
CREATE OR REPLACE FUNCTION award_team_points(
  p_team_id UUID,
  p_user_id UUID, 
  p_points INTEGER,
  p_reason TEXT,
  p_event_type TEXT DEFAULT 'manual_award'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
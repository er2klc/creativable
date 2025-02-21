
-- Fix award_team_points function
CREATE OR REPLACE FUNCTION public.award_team_points(
  p_team_id uuid,
  p_user_id uuid,
  p_event_type text,
  p_points integer,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    current_points INTEGER;
    new_level INTEGER;
    old_level INTEGER;
BEGIN
    -- Check if user is a team member
    IF NOT EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = p_team_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'User is not a member of this team';
    END IF;

    -- Get current points and level
    SELECT points, level INTO current_points, old_level
    FROM team_member_points
    WHERE team_id = p_team_id AND user_id = p_user_id;

    -- Calculate new total points
    current_points := COALESCE(current_points, 0) + p_points;

    -- Calculate new level based on total points
    new_level := CASE
        WHEN current_points >= 5000 THEN 10
        WHEN current_points >= 4000 THEN 9
        WHEN current_points >= 3000 THEN 8
        WHEN current_points >= 2000 THEN 7
        WHEN current_points >= 1500 THEN 6
        WHEN current_points >= 1000 THEN 5
        WHEN current_points >= 500 THEN 4
        WHEN current_points >= 250 THEN 3
        WHEN current_points >= 100 THEN 2
        WHEN current_points >= 50 THEN 1
        ELSE 0
    END;

    -- Insert point event with timestamp
    INSERT INTO team_point_events (
        team_id, 
        user_id, 
        event_type, 
        points, 
        metadata,
        earned_at
    )
    VALUES (
        p_team_id, 
        p_user_id, 
        p_event_type, 
        p_points, 
        p_metadata,
        CURRENT_TIMESTAMP
    );

    -- Update or insert member points
    INSERT INTO team_member_points (team_id, user_id, points, level)
    VALUES (p_team_id, p_user_id, current_points, new_level)
    ON CONFLICT (team_id, user_id)
    DO UPDATE SET 
        points = EXCLUDED.points,
        level = EXCLUDED.level,
        updated_at = CURRENT_TIMESTAMP;

    -- Create level up notification if level increased
    IF new_level > COALESCE(old_level, 0) THEN
        INSERT INTO notifications (
            user_id,
            title,
            content,
            type,
            metadata
        )
        VALUES (
            p_user_id,
            'Level aufgestiegen! 🎉',
            'Herzlichen Glückwunsch! Du hast Level ' || new_level::text || ' erreicht!',
            'level_up',
            jsonb_build_object(
                'team_id', p_team_id,
                'old_level', old_level,
                'new_level', new_level,
                'points', current_points
            )
        );
    END IF;

    -- Create points notification
    INSERT INTO notifications (
        user_id,
        title,
        content,
        type,
        metadata
    )
    VALUES (
        p_user_id,
        'Neue Punkte erhalten! 🌟',
        'Du hast ' || p_points::text || ' Punkte erhalten: ' || p_event_type,
        'points_awarded',
        jsonb_build_object(
            'team_id', p_team_id,
            'points', p_points,
            'event_type', p_event_type,
            'total_points', current_points,
            'current_level', new_level
        )
    );
END;
$function$;

-- Create function for leaderboard rewards
CREATE OR REPLACE FUNCTION public.award_leaderboard_rewards()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- 7-Tage Rewards
    WITH top_7_days AS (
        SELECT 
            user_id, 
            team_id,
            ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY points DESC) as rank
        FROM team_points_7_days
    )
    SELECT award_team_points(
        team_id,
        user_id,
        'weekly_leaderboard_reward',
        CASE 
            WHEN rank = 1 THEN 300
            WHEN rank = 2 THEN 200
            WHEN rank = 3 THEN 100
        END,
        jsonb_build_object('rank', rank)
    )
    FROM top_7_days
    WHERE rank <= 3;

    -- 30-Tage Rewards
    WITH top_30_days AS (
        SELECT 
            user_id, 
            team_id,
            ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY points DESC) as rank
        FROM team_points_30_days
    )
    SELECT award_team_points(
        team_id,
        user_id,
        'monthly_leaderboard_reward',
        CASE 
            WHEN rank = 1 THEN 500
            WHEN rank = 2 THEN 300
            WHEN rank = 3 THEN 200
        END,
        jsonb_build_object('rank', rank)
    )
    FROM top_30_days
    WHERE rank <= 3;
END;
$function$;

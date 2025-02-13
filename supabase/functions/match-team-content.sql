
CREATE OR REPLACE FUNCTION get_contextual_contacts(
    p_user_id UUID,
    p_context TEXT,  -- 'last', 'phase', 'posts'
    p_phase_id UUID DEFAULT NULL,
    p_keyword TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    platform TEXT,
    social_media_username TEXT,
    social_media_profile_image_url TEXT,
    social_media_followers INTEGER,
    social_media_following INTEGER,
    phase_id UUID,
    phase_name TEXT,
    last_interaction_date TIMESTAMPTZ,
    last_post_content TEXT,
    last_post_date TIMESTAMPTZ,
    sort_order INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH recent_posts AS (
        SELECT 
            lead_id,
            content as last_post_content,
            posted_at as last_post_date,
            ROW_NUMBER() OVER (PARTITION BY lead_id ORDER BY posted_at DESC) as rn
        FROM social_media_posts
        WHERE user_id = p_user_id
    )
    SELECT DISTINCT
        l.id,
        l.name,
        l.platform,
        l.social_media_username,
        l.social_media_profile_image_url,
        l.social_media_followers,
        l.social_media_following,
        l.phase_id,
        pp.name as phase_name,
        l.last_interaction_date,
        rp.last_post_content,
        rp.last_post_date,
        CASE 
            WHEN p_context = 'last' THEN 
                EXTRACT(EPOCH FROM l.last_interaction_date)::INTEGER
            WHEN p_context = 'phase' THEN 
                EXTRACT(EPOCH FROM l.last_interaction_date)::INTEGER
            ELSE 
                EXTRACT(EPOCH FROM rp.last_post_date)::INTEGER
        END as sort_order
    FROM leads l
    LEFT JOIN pipeline_phases pp ON pp.id = l.phase_id
    LEFT JOIN recent_posts rp ON rp.lead_id = l.id AND rp.rn = 1
    WHERE 
        l.user_id = p_user_id
        AND (
            -- Last contact
            (p_context = 'last' AND l.last_interaction_date IS NOT NULL)
            OR
            -- Specific phase
            (p_context = 'phase' AND l.phase_id = p_phase_id)
            OR
            -- Posts containing keyword
            (p_context = 'posts' AND rp.last_post_content ILIKE '%' || p_keyword || '%')
        )
    ORDER BY sort_order DESC NULLS LAST
    LIMIT p_limit;
END;
$$;

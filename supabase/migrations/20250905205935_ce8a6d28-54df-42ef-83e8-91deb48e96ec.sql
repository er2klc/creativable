-- Update the create_unique_lead function to include industry parameter
CREATE OR REPLACE FUNCTION public.create_unique_lead(
    p_user_id UUID,
    p_name TEXT,
    p_platform TEXT,
    p_username TEXT,
    p_pipeline_id UUID,
    p_phase_id UUID
) RETURNS TABLE(id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Add unique constraint for leads
ALTER TABLE leads
ADD CONSTRAINT unique_lead_per_user_platform 
UNIQUE (user_id, social_media_username, platform);

-- Create function for atomic lead creation
CREATE OR REPLACE FUNCTION create_unique_lead(
  p_user_id UUID,
  p_name TEXT,
  p_platform TEXT,
  p_username TEXT,
  p_pipeline_id UUID,
  p_phase_id UUID
) RETURNS leads AS $$
DECLARE
  v_lead leads;
BEGIN
  INSERT INTO leads (
    user_id,
    name,
    platform,
    social_media_username,
    pipeline_id,
    phase_id,
    industry
  ) VALUES (
    p_user_id,
    p_name,
    p_platform,
    lower(p_username), -- Ensure lowercase storage
    p_pipeline_id,
    p_phase_id,
    'Not Specified'
  )
  RETURNING * INTO v_lead;

  RETURN v_lead;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Contact already exists' USING ERRCODE = '23505';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for case-insensitive username search
CREATE INDEX idx_leads_username_platform ON leads (lower(social_media_username), platform, user_id);

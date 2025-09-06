-- Add missing columns to existing tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personality_type TEXT;
ALTER TABLE team_posts ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create missing tables
CREATE TABLE IF NOT EXISTS team_member_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_level_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  level INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_field_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  field_group TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_shortcuts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  target_id TEXT,
  target_slug TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signature_html TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_bios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bio_text TEXT NOT NULL,
  bio_type TEXT DEFAULT 'personal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create views for team points aggregation
CREATE OR REPLACE VIEW team_points_7_days AS
SELECT 
  tmp.team_id,
  tmp.user_id,
  p.display_name,
  p.avatar_url,
  COALESCE(tmp.points, 0) as points,
  COALESCE(tmp.level, 0) as level
FROM team_member_points tmp
JOIN profiles p ON tmp.user_id = p.id
WHERE tmp.updated_at >= now() - interval '7 days';

CREATE OR REPLACE VIEW team_points_30_days AS
SELECT 
  tmp.team_id,
  tmp.user_id,
  p.display_name,
  p.avatar_url,
  COALESCE(tmp.points, 0) as points,
  COALESCE(tmp.level, 0) as level
FROM team_member_points tmp
JOIN profiles p ON tmp.user_id = p.id
WHERE tmp.updated_at >= now() - interval '30 days';

CREATE OR REPLACE VIEW team_category_post_counts AS
SELECT 
  tc.id as category_id,
  tc.team_id,
  COUNT(tp.id) as post_count
FROM team_categories tc
LEFT JOIN team_posts tp ON tp.category_id = tc.id
GROUP BY tc.id, tc.team_id;

-- Enable RLS on new tables
ALTER TABLE team_member_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_level_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_field_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_shortcuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Team members can view activity log" ON team_member_activity_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = team_member_activity_log.team_id 
    AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can view level rewards" ON team_level_rewards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = team_level_rewards.team_id 
    AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own contact field settings" ON contact_field_settings
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own dashboard shortcuts" ON dashboard_shortcuts
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own signatures" ON user_signatures
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bios" ON user_bios
FOR ALL USING (auth.uid() = user_id);
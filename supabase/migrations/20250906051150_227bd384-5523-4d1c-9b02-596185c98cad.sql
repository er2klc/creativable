-- Create missing tables and columns

-- Add missing column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT;

-- Add missing column to user_links
ALTER TABLE user_links ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Create team_member_points table
CREATE TABLE IF NOT EXISTS team_member_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_calendar_events table
CREATE TABLE IF NOT EXISTS team_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  color TEXT DEFAULT '#3B82F6',
  is_team_event BOOLEAN DEFAULT false,
  is_admin_only BOOLEAN DEFAULT false,
  is_multi_day BOOLEAN DEFAULT false,
  recurring_pattern TEXT DEFAULT 'none',
  recurring_day_of_week INTEGER,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_calendar_disabled_events table
CREATE TABLE IF NOT EXISTS team_calendar_disabled_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES team_calendar_events(id) ON DELETE CASCADE,
  disabled_date DATE NOT NULL,
  disabled_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, disabled_date)
);

-- Create team_point_events table
CREATE TABLE IF NOT EXISTS team_point_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  points_change INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_hidden_snaps table
CREATE TABLE IF NOT EXISTS team_hidden_snaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snap_id TEXT NOT NULL,
  hidden_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id, snap_id)
);

-- Create linkedin_scan_jobs table
CREATE TABLE IF NOT EXISTS linkedin_scan_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add missing columns to presentation tables
ALTER TABLE presentation_view_sessions ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE presentation_view_sessions ADD COLUMN IF NOT EXISTS max_progress INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE team_member_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_calendar_disabled_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_point_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_hidden_snaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_scan_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for team_member_points
CREATE POLICY "Team members can view points of their team" ON team_member_points
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_member_points.team_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own points" ON team_member_points
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for team_calendar_events
CREATE POLICY "Team members can view team calendar events" ON team_calendar_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_calendar_events.team_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create calendar events" ON team_calendar_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_calendar_events.team_id 
      AND tm.user_id = auth.uid()
    ) AND auth.uid() = created_by
  );

CREATE POLICY "Event creators can update their events" ON team_calendar_events
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Event creators can delete their events" ON team_calendar_events
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for team_calendar_disabled_events
CREATE POLICY "Team members can view disabled events" ON team_calendar_disabled_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_calendar_events tce
      JOIN team_members tm ON tm.team_id = tce.team_id
      WHERE tce.id = team_calendar_disabled_events.event_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage disabled events" ON team_calendar_disabled_events
  FOR ALL USING (auth.uid() = disabled_by);

-- Create RLS policies for team_point_events
CREATE POLICY "Team members can view point events of their team" ON team_point_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_point_events.team_id 
      AND tm.user_id = auth.uid()
    )
  );

-- Create RLS policies for team_hidden_snaps
CREATE POLICY "Users can manage their own hidden snaps" ON team_hidden_snaps
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for linkedin_scan_jobs
CREATE POLICY "Users can manage their own LinkedIn scan jobs" ON linkedin_scan_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM leads l 
      WHERE l.id = linkedin_scan_jobs.lead_id 
      AND l.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_member_points_team_user ON team_member_points(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_calendar_events_team_id ON team_calendar_events(team_id);
CREATE INDEX IF NOT EXISTS idx_team_calendar_events_start_time ON team_calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_team_point_events_team_user ON team_point_events(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_scan_jobs_lead_id ON linkedin_scan_jobs(lead_id);
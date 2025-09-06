-- Create team_member_stats table
CREATE TABLE IF NOT EXISTS team_member_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_given INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- Enable RLS on team_member_stats
ALTER TABLE team_member_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for team_member_stats
CREATE POLICY "Team members can view stats of their team"
  ON team_member_stats FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = team_member_stats.team_id 
    AND tm.user_id = auth.uid()
  ));

CREATE POLICY "Team members can update their own stats"
  ON team_member_stats FOR ALL
  USING (auth.uid() = user_id);

-- Create team_member_follows table
CREATE TABLE IF NOT EXISTS team_member_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id, team_id)
);

-- Enable RLS on team_member_follows
ALTER TABLE team_member_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for team_member_follows
CREATE POLICY "Users can view follows in their teams"
  ON team_member_follows FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = team_member_follows.team_id 
    AND tm.user_id = auth.uid()
  ));

CREATE POLICY "Users can follow/unfollow in their teams"
  ON team_member_follows FOR ALL
  USING (auth.uid() = follower_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_member_stats_team_user ON team_member_stats(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_member_follows_follower ON team_member_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_team_member_follows_following ON team_member_follows(following_id);
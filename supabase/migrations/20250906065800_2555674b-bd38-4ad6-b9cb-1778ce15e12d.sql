-- Fix missing columns and ensure all tables exist
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE team_posts ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create team_post_reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES team_posts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on team_post_reactions
ALTER TABLE team_post_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for team_post_reactions
CREATE POLICY "Users can manage their own reactions" 
ON team_post_reactions FOR ALL 
USING (auth.uid() = created_by);

-- Add unique constraint to prevent duplicate reactions
ALTER TABLE team_post_reactions 
ADD CONSTRAINT unique_user_post_reaction 
UNIQUE (post_id, created_by);

-- Update team_categories to ensure created_by exists
ALTER TABLE team_categories ADD COLUMN IF NOT EXISTS created_by UUID;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_team_post_reactions_post_id ON team_post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_team_post_reactions_user ON team_post_reactions(created_by);
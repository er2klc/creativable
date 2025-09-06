-- Add missing slug column to team_categories
ALTER TABLE public.team_categories ADD COLUMN slug TEXT;

-- Generate slug from name for existing categories
UPDATE public.team_categories 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), 'ä', 'ae')) 
WHERE slug IS NULL;

-- Make slug NOT NULL and UNIQUE
ALTER TABLE public.team_categories ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_team_categories_team_slug ON public.team_categories (team_id, slug);

-- Create team_post_subscriptions table
CREATE TABLE public.team_post_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.team_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  subscribed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on team_post_subscriptions
ALTER TABLE public.team_post_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for team_post_subscriptions
CREATE POLICY "Users can manage their own subscriptions" 
ON public.team_post_subscriptions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create team_post_reports table
CREATE TABLE public.team_post_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.team_posts(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on team_post_reports
ALTER TABLE public.team_post_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for team_post_reports
CREATE POLICY "Users can report posts" 
ON public.team_post_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Team creators can view reports" 
ON public.team_post_reports 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM team_posts tp 
  JOIN teams t ON tp.team_id = t.id 
  WHERE tp.id = team_post_reports.post_id AND t.created_by = auth.uid()
));
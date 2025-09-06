-- Create team_news table
CREATE TABLE public.team_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_news ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Team members can view team news" 
ON public.team_news 
FOR SELECT 
USING (is_team_member(team_id, auth.uid()));

CREATE POLICY "Team members can create news" 
ON public.team_news 
FOR INSERT 
WITH CHECK (is_team_member(team_id, auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "News creators can update their news" 
ON public.team_news 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "News creators can delete their news" 
ON public.team_news 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE TRIGGER update_team_news_updated_at
BEFORE UPDATE ON public.team_news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
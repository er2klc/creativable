-- Add missing content column to phase_based_analyses
ALTER TABLE public.phase_based_analyses ADD COLUMN IF NOT EXISTS content TEXT;

-- Create partner_onboarding_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.partner_onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL,
  phase_id UUID NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own partner onboarding progress" 
ON public.partner_onboarding_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- Ensure presentation_pages table exists with all required columns
CREATE TABLE IF NOT EXISTS public.presentation_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  slug TEXT,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_url_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for presentation_pages
ALTER TABLE public.presentation_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for presentation_pages
CREATE POLICY "Users can manage own presentation pages" 
ON public.presentation_pages 
FOR ALL 
USING (auth.uid() = user_id);
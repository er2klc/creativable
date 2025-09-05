-- Add missing content column to phase_based_analyses
ALTER TABLE public.phase_based_analyses ADD COLUMN IF NOT EXISTS content TEXT;

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

-- Enable RLS for presentation_pages if not already enabled
ALTER TABLE public.presentation_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for presentation_pages (drop first if exists)
DROP POLICY IF EXISTS "Users can manage own presentation pages" ON public.presentation_pages;
CREATE POLICY "Users can manage own presentation pages" 
ON public.presentation_pages 
FOR ALL 
USING (auth.uid() = user_id);
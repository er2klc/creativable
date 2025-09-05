-- Add missing columns to pipeline_phases table (already exists from previous migration)
-- This is a no-op as we already added this column

-- Add missing columns to presentation_views table
ALTER TABLE public.presentation_views 
ADD COLUMN IF NOT EXISTS view_history JSONB,
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- Add missing columns to presentation_pages table
ALTER TABLE public.presentation_pages
ADD COLUMN IF NOT EXISTS presentation_url TEXT;

-- Create imap_settings table
CREATE TABLE IF NOT EXISTS public.imap_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  server TEXT,
  port INTEGER,
  username TEXT,
  password TEXT,
  last_sync_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on imap_settings
ALTER TABLE public.imap_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for imap_settings
CREATE POLICY "Users can manage their own IMAP settings" 
ON public.imap_settings 
FOR ALL 
USING (auth.uid() = user_id);
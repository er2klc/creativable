-- Add missing columns to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS last_selected_pipeline_id UUID,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS products_services TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS usp TEXT,
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS superchat_api_key TEXT,
ADD COLUMN IF NOT EXISTS default_message_template TEXT;

-- Add missing columns to pipeline_phases table
ALTER TABLE public.pipeline_phases 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add missing columns to social media posts or create table if needed
CREATE TABLE IF NOT EXISTS public.linkedin_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_query TEXT NOT NULL,
  scan_status TEXT NOT NULL DEFAULT 'pending',
  leads_found INTEGER DEFAULT 0,
  platform TEXT NOT NULL DEFAULT 'LinkedIn',
  processing_progress INTEGER DEFAULT 0,
  current_file TEXT,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create presentation_view_sessions table
CREATE TABLE IF NOT EXISTS public.presentation_view_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for new tables
ALTER TABLE public.linkedin_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own LinkedIn scans" 
ON public.linkedin_scans 
FOR ALL 
USING (auth.uid() = user_id);

-- Add view_history column to presentation_views if missing
ALTER TABLE public.presentation_views 
ADD COLUMN IF NOT EXISTS view_history JSONB DEFAULT '{}';

-- Add presentationUrl column to presentation_pages if missing  
ALTER TABLE public.presentation_pages 
ADD COLUMN IF NOT EXISTS presentation_url TEXT;

-- Add network_marketing_id to leads table if missing
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS network_marketing_id TEXT;
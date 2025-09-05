-- Add missing columns to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS last_selected_pipeline_id UUID,
ADD COLUMN IF NOT EXISTS superchat_api_key TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS products_services TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS usp TEXT,
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS default_message_template TEXT;

-- Add missing columns to leads table  
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS usp TEXT;

-- Add missing columns to pipeline_phases table
ALTER TABLE public.pipeline_phases
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Create presentation_view_sessions table
CREATE TABLE IF NOT EXISTS public.presentation_view_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on presentation_view_sessions
ALTER TABLE public.presentation_view_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for presentation view sessions
CREATE POLICY "Anyone can manage presentation view sessions" 
ON public.presentation_view_sessions 
FOR ALL 
USING (true);
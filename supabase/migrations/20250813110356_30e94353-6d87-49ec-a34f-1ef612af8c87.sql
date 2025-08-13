-- Create comprehensive database structure for the application

-- First, let's add missing columns to the leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS social_media_interests TEXT[];
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS social_media_bio TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS current_company_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS apify_instagram_data JSONB;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_action TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_action_date TIMESTAMP WITH TIME ZONE;

-- Create lead_business_match table
CREATE TABLE IF NOT EXISTS public.lead_business_match (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  match_score NUMERIC(3,2),
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(lead_id, user_id)
);

-- Enable RLS on lead_business_match
ALTER TABLE public.lead_business_match ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lead_business_match
CREATE POLICY "Users can manage their own business matches" 
ON public.lead_business_match 
FOR ALL 
USING (auth.uid() = user_id);

-- Add missing column to pipeline_phases if not exists
ALTER TABLE public.pipeline_phases ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add missing columns to elevate_platforms if needed
ALTER TABLE public.elevate_platforms ADD COLUMN IF NOT EXISTS invite_code TEXT;

-- Create function to generate invite codes
CREATE OR REPLACE FUNCTION generate_invite_code() RETURNS TEXT AS $$
BEGIN
  RETURN substring(md5(random()::text) from 1 for 8);
END;
$$ LANGUAGE plpgsql;

-- Add default invite codes for existing platforms
UPDATE public.elevate_platforms 
SET invite_code = generate_invite_code() 
WHERE invite_code IS NULL;

-- Add updated_at trigger for lead_business_match
CREATE TRIGGER update_lead_business_match_updated_at
  BEFORE UPDATE ON public.lead_business_match
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('elevate-documents', 'elevate-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for elevate-documents
CREATE POLICY "Authenticated users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'elevate-documents' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view accessible documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'elevate-documents' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Document creators can delete their documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'elevate-documents' AND 
  auth.uid()::text = (metadata->>'uploadedBy')
);

-- Create storage policies for team-logos
CREATE POLICY "Anyone can view team logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'team-logos');

CREATE POLICY "Authenticated users can upload team logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'team-logos' AND 
  auth.role() = 'authenticated'
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_social_media_interests ON public.leads USING GIN(social_media_interests);
CREATE INDEX IF NOT EXISTS idx_leads_is_favorite ON public.leads(is_favorite);
CREATE INDEX IF NOT EXISTS idx_leads_last_action_date ON public.leads(last_action_date);
CREATE INDEX IF NOT EXISTS idx_lead_business_match_lead_id ON public.lead_business_match(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_business_match_user_id ON public.lead_business_match(user_id);
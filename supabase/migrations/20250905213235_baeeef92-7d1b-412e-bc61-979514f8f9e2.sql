-- Add missing SMTP settings table
CREATE TABLE IF NOT EXISTS public.smtp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  host TEXT NOT NULL,
  port INTEGER DEFAULT 587,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  use_tls BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own SMTP settings" 
ON public.smtp_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Add missing columns to settings table
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS instagram_connected BOOLEAN DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS facebook_connected BOOLEAN DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tiktok_connected BOOLEAN DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS linkedin_connected BOOLEAN DEFAULT false;

-- Add missing database function
CREATE OR REPLACE FUNCTION public.check_time_discrepancy()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'server_time', NOW(),
    'utc_time', NOW() AT TIME ZONE 'UTC'
  );
END;
$$;

-- Create trigger for smtp_settings timestamps
CREATE TRIGGER update_smtp_settings_updated_at
BEFORE UPDATE ON public.smtp_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
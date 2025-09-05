-- Add missing apify_api_key column to settings table
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS apify_api_key TEXT;

-- Add missing facebook_app_id column to settings table  
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS facebook_app_id TEXT;
-- Add missing columns to settings table for integrations
ALTER TABLE public.settings 
  ADD COLUMN IF NOT EXISTS about_me TEXT,
  ADD COLUMN IF NOT EXISTS instagram_connected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS linkedin_connected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS facebook_connected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tiktok_connected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS presentation_views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS social_media_connected BOOLEAN DEFAULT FALSE;

-- Add missing column to pipeline_phases table
ALTER TABLE public.pipeline_phases 
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Fix partner_onboarding_progress table structure
-- Remove status column if it exists (it's not in the database schema)
ALTER TABLE public.partner_onboarding_progress 
  DROP COLUMN IF EXISTS status;
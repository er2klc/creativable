-- Add missing columns to social_media_scan_history table
ALTER TABLE public.social_media_scan_history 
ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_file TEXT,
ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT false;
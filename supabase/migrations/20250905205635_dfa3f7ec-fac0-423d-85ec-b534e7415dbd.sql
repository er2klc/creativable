-- Add missing columns to social_media_posts table
ALTER TABLE public.social_media_posts 
ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_file TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT;
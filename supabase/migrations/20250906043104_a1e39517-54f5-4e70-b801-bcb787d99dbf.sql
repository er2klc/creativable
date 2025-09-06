-- Remove all email-related tables and functions
DROP TABLE IF EXISTS public.email_attachments CASCADE;
DROP TABLE IF EXISTS public.email_folders CASCADE;
DROP TABLE IF EXISTS public.email_sync_status CASCADE;
DROP TABLE IF EXISTS public.emails CASCADE;
DROP TABLE IF EXISTS public.imap_settings CASCADE;
DROP TABLE IF EXISTS public.smtp_settings CASCADE;
DROP TABLE IF EXISTS public.api_email_settings CASCADE;

-- Remove email-related columns from settings table
ALTER TABLE public.settings 
DROP COLUMN IF EXISTS email_configured,
DROP COLUMN IF EXISTS last_email_sync,
DROP COLUMN IF EXISTS email_sync_enabled,
DROP COLUMN IF EXISTS time_discrepancy_detected,
DROP COLUMN IF EXISTS time_discrepancy_minutes;
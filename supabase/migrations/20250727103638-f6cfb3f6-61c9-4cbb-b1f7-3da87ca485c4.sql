-- Add missing contact_type column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contact_type TEXT;
-- Add missing company_name column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_name TEXT;
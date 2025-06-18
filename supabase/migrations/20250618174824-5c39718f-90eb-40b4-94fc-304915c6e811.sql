
-- Phase 1: Create missing tables and fix database structure

-- Create elevate_user_progress table
CREATE TABLE IF NOT EXISTS public.elevate_user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lerninhalte_id UUID NOT NULL REFERENCES elevate_lerninhalte(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lerninhalte_id)
);

-- Create elevate_lerninhalte_notes table
CREATE TABLE IF NOT EXISTS public.elevate_lerninhalte_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lerninhalte_id UUID NOT NULL REFERENCES elevate_lerninhalte(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to existing tables
ALTER TABLE elevate_platforms ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE elevate_platforms ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update slugs for existing platforms (set to lowercase name with hyphens)
UPDATE elevate_platforms 
SET slug = LOWER(REPLACE(name, ' ', '-')) 
WHERE slug IS NULL;

-- Make slug NOT NULL after setting values
ALTER TABLE elevate_platforms ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint on slug
ALTER TABLE elevate_platforms ADD CONSTRAINT elevate_platforms_slug_unique UNIQUE (slug);

-- Enable RLS on new tables
ALTER TABLE public.elevate_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevate_lerninhalte_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for elevate_user_progress
CREATE POLICY "Users can view their own progress" 
  ON public.elevate_user_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
  ON public.elevate_user_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON public.elevate_user_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
  ON public.elevate_user_progress 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for elevate_lerninhalte_notes
CREATE POLICY "Users can view their own notes" 
  ON public.elevate_lerninhalte_notes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
  ON public.elevate_lerninhalte_notes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
  ON public.elevate_lerninhalte_notes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
  ON public.elevate_lerninhalte_notes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create missing function for notifications
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(user_id_input UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true 
  WHERE user_id = user_id_input 
  AND read = false 
  AND deleted_at IS NULL;
END;
$$;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE elevate_user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE elevate_lerninhalte_notes;

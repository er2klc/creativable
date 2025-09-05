-- Create storage bucket for contact avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contact-avatars', 'contact-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for contact avatars
INSERT INTO storage.objects (bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata)
SELECT 'contact-avatars', '.emptyFolderPlaceholder', null, now(), now(), now(), '{}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM storage.objects WHERE bucket_id = 'contact-avatars'
);

-- Create RLS policies for contact avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload contact avatars'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload contact avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''contact-avatars'')';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Contact avatars are publicly viewable'
  ) THEN
    EXECUTE 'CREATE POLICY "Contact avatars are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = ''contact-avatars'')';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update contact avatars'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update contact avatars" ON storage.objects FOR UPDATE USING (bucket_id = ''contact-avatars'')';
  END IF;
END $$;

-- Add missing columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS last_social_media_scan TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS social_media_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS social_media_categories TEXT[];
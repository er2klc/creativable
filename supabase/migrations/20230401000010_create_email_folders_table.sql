
-- Create email folders table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  type TEXT NOT NULL, -- inbox, sent, drafts, etc.
  special_use TEXT,
  flags JSONB DEFAULT '{}',
  total_messages INTEGER DEFAULT 0,
  unread_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, path)
);

-- Add RLS policies for email folders
ALTER TABLE email_folders ENABLE ROW LEVEL SECURITY;

-- Add policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = 'email_folders' AND policyname = 'Users can view their own email folders'
    ) THEN
        CREATE POLICY "Users can view their own email folders"
        ON email_folders FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = 'email_folders' AND policyname = 'Users can insert their own email folders'
    ) THEN
        CREATE POLICY "Users can insert their own email folders"
        ON email_folders FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = 'email_folders' AND policyname = 'Users can update their own email folders'
    ) THEN
        CREATE POLICY "Users can update their own email folders"
        ON email_folders FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = 'email_folders' AND policyname = 'Users can delete their own email folders'
    ) THEN
        CREATE POLICY "Users can delete their own email folders"
        ON email_folders FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Add indexes for faster lookups if they don't exist
CREATE INDEX IF NOT EXISTS email_folders_user_id_idx ON email_folders (user_id);
CREATE INDEX IF NOT EXISTS email_folders_path_idx ON email_folders (path);

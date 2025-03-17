
-- Create email folders table
CREATE TABLE IF NOT EXISTS email_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  type TEXT NOT NULL, -- inbox, sent, drafts, etc.
  special_use TEXT,
  flags JSONB,
  total_messages INTEGER DEFAULT 0,
  unread_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, path)
);

-- Add RLS policies for email folders
ALTER TABLE email_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email folders"
  ON email_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email folders"
  ON email_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email folders"
  ON email_folders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email folders"
  ON email_folders FOR DELETE
  USING (auth.uid() = user_id);

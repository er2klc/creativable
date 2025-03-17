
-- Create emails table to store email messages
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  folder TEXT NOT NULL,
  subject TEXT,
  from_name TEXT,
  from_email TEXT,
  to_name TEXT,
  to_email TEXT,
  cc TEXT[] DEFAULT '{}',
  bcc TEXT[] DEFAULT '{}',
  content TEXT,
  html_content TEXT,
  text_content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  flags JSONB,
  headers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

-- Add RLS policies for emails
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emails"
  ON emails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emails"
  ON emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emails"
  ON emails FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails"
  ON emails FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS emails_user_id_idx ON emails (user_id);
CREATE INDEX IF NOT EXISTS emails_message_id_idx ON emails (message_id);
CREATE INDEX IF NOT EXISTS emails_folder_idx ON emails (folder);
CREATE INDEX IF NOT EXISTS emails_read_idx ON emails (read);
CREATE INDEX IF NOT EXISTS emails_starred_idx ON emails (starred);

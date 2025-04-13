-- Create email_attachments table to store email attachments
CREATE TABLE IF NOT EXISTS email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER NOT NULL DEFAULT 0,
  file_content TEXT, -- Base64-encoded file content
  content_id TEXT,   -- For inline images
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for email_attachments
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email attachments"
  ON email_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM emails 
    WHERE emails.id = email_attachments.email_id 
    AND emails.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own email attachments"
  ON email_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM emails 
    WHERE emails.id = email_attachments.email_id 
    AND emails.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own email attachments"
  ON email_attachments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM emails 
    WHERE emails.id = email_attachments.email_id 
    AND emails.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM emails 
    WHERE emails.id = email_attachments.email_id 
    AND emails.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own email attachments"
  ON email_attachments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM emails 
    WHERE emails.id = email_attachments.email_id 
    AND emails.user_id = auth.uid()
  ));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS email_attachments_email_id_idx ON email_attachments (email_id);

-- Grant service role access for syncing process
GRANT ALL ON email_attachments TO service_role; 

-- Create table to track email sync status per folder for background syncing
CREATE TABLE IF NOT EXISTS email_sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder TEXT NOT NULL DEFAULT 'INBOX',
  last_sync_time TIMESTAMP WITH TIME ZONE,
  items_synced INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, folder)
);

-- Add RLS policies
ALTER TABLE email_sync_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync status"
  ON email_sync_status
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync status"
  ON email_sync_status
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync status"
  ON email_sync_status
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS email_sync_status_user_folder_idx ON email_sync_status (user_id, folder);

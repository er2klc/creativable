
-- Add missing columns to emails table
ALTER TABLE emails 
ADD COLUMN IF NOT EXISTS uid INTEGER;

-- Add missing columns to email_sync_status table
ALTER TABLE email_sync_status
ADD COLUMN IF NOT EXISTS last_uid INTEGER,
ADD COLUMN IF NOT EXISTS sync_in_progress BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_items INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS emails_uid_idx ON emails(uid);
CREATE INDEX IF NOT EXISTS emails_user_id_folder_idx ON emails(user_id, folder);


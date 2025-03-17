
-- Create index for faster folder lookups
CREATE INDEX IF NOT EXISTS email_folders_user_id_idx ON email_folders (user_id);
CREATE INDEX IF NOT EXISTS email_folders_path_idx ON email_folders (path);
CREATE INDEX IF NOT EXISTS emails_folder_idx ON emails (folder);

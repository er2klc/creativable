
-- Add missing UID column to emails table if it doesn't exist
DO $$ 
BEGIN
  -- Check if columns exist before adding them
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'emails'
    AND column_name = 'uid'
  ) THEN
    ALTER TABLE emails ADD COLUMN uid INTEGER;
    CREATE INDEX IF NOT EXISTS emails_uid_idx ON emails(uid);
  END IF;

  -- Ensure all required columns exist in email_sync_status
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_sync_status'
    AND column_name = 'last_uid'
  ) THEN
    ALTER TABLE email_sync_status ADD COLUMN last_uid INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_sync_status'
    AND column_name = 'sync_in_progress'
  ) THEN
    ALTER TABLE email_sync_status ADD COLUMN sync_in_progress BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_sync_status'
    AND column_name = 'total_items'
  ) THEN
    ALTER TABLE email_sync_status ADD COLUMN total_items INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_sync_status'
    AND column_name = 'last_error'
  ) THEN
    ALTER TABLE email_sync_status ADD COLUMN last_error TEXT;
  END IF;
END $$;

-- Create a function to reset the email sync state (separate from DO block)
CREATE OR REPLACE FUNCTION public.reset_email_sync(user_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Delete sync status entries
  DELETE FROM email_sync_status WHERE user_id = user_id_param;
  
  -- Update IMAP settings
  UPDATE imap_settings
  SET 
    last_sync_date = NULL,
    historical_sync = false,
    syncing_historical = false,
    last_sync_status = NULL,
    sync_progress = 0,
    updated_at = NOW()
  WHERE user_id = user_id_param;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Email sync state reset successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Failed to reset email sync state',
      'error', SQLERRM
    );
END;
$$;

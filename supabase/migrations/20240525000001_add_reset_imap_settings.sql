
-- Create function to reset IMAP settings for a user
CREATE OR REPLACE FUNCTION public.reset_imap_settings(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset IMAP settings dates to current time and clean historical sync
  UPDATE imap_settings 
  SET 
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP,
    last_sync_date = NULL,
    historical_sync_date = NULL,
    historical_sync = false,
    syncing_historical = false,
    sync_status = NULL,
    sync_progress = NULL,
    historical_sync_progress = 0,
    last_verification_status = NULL,
    last_verified_at = NULL
  WHERE user_id = user_id_param;

  -- Clean any existing email sync status
  DELETE FROM email_sync_status 
  WHERE user_id = user_id_param;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error resetting IMAP settings: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant permissions to use this function
GRANT EXECUTE ON FUNCTION public.reset_imap_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_imap_settings(UUID) TO service_role;

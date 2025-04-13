-- Create the missing cleanup_user_email_data function
CREATE OR REPLACE FUNCTION public.cleanup_user_email_data(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lösche E-Mail-Daten für den Benutzer
  DELETE FROM emails WHERE user_id = user_id_param;
  
  -- Lösche E-Mail-Ordner für den Benutzer
  DELETE FROM email_folders WHERE user_id = user_id_param;
  
  -- Lösche E-Mail-Synchronisierungsstatus für den Benutzer
  DELETE FROM email_sync_status WHERE user_id = user_id_param;
  
  -- Lösche E-Mail-Anhänge (falls Tabelle existiert)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'email_attachments'
  ) THEN
    -- Lösche Anhänge für E-Mails des Benutzers
    DELETE FROM email_attachments 
    WHERE email_id IN (SELECT id FROM emails WHERE user_id = user_id_param);
  END IF;
  
  -- Setze IMAP-Einstellungen zurück (ohne vollständige Löschung)
  UPDATE imap_settings 
  SET 
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
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Fehler beim Bereinigen der E-Mail-Daten: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant permissions for the new function
GRANT EXECUTE ON FUNCTION public.cleanup_user_email_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_user_email_data(UUID) TO service_role; 
-- Bereinigung nicht mehr benötigter Email-Tabellen

-- Lösche die veraltete 'received_emails'-Tabelle, die durch 'emails' ersetzt wurde
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'received_emails'
  ) THEN
    DROP TABLE IF EXISTS received_emails;
  END IF;
END $$;

-- Stelle sicher, dass E-Mail-Synchronisierungsstatus korrekt konfiguriert ist
DO $$
BEGIN
  -- Prüfe, ob die email_sync_status-Tabelle existiert
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'email_sync_status'
  ) THEN
    -- Stelle sicher, dass alle erforderlichen Spalten existieren
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'email_sync_status'
      AND column_name = 'sync_in_progress'
    ) THEN
      ALTER TABLE email_sync_status ADD COLUMN sync_in_progress BOOLEAN DEFAULT FALSE;
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
    
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'email_sync_status'
      AND column_name = 'total_items'
    ) THEN
      ALTER TABLE email_sync_status ADD COLUMN total_items INTEGER DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Erstelle oder aktualisiere eine Funktion zur vollständigen Bereinigung der E-Mail-Daten eines Benutzers
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

-- Berechtigungen für die neue Funktion
GRANT EXECUTE ON FUNCTION public.cleanup_user_email_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_user_email_data(UUID) TO service_role; 
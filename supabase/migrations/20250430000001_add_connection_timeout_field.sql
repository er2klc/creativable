-- Add connection_timeout field to imap_settings table
DO $$ 
BEGIN
  -- Prüfe, ob das Feld bereits existiert
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'imap_settings'
    AND column_name = 'connection_timeout'
  ) THEN
    -- Füge das Feld connection_timeout hinzu
    ALTER TABLE imap_settings ADD COLUMN connection_timeout INTEGER DEFAULT 30000;
    
    -- Kommentar zum Feld hinzufügen
    COMMENT ON COLUMN imap_settings.connection_timeout IS 'Zeit in Millisekunden, die auf eine Verbindung gewartet wird.';
  END IF;
END $$; 
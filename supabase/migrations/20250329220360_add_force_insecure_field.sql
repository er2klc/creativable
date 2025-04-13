-- Add force_insecure field to imap_settings table
DO $$ 
BEGIN
  -- Prüfe, ob das Feld bereits existiert
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'imap_settings'
    AND column_name = 'force_insecure'
  ) THEN
    -- Füge das Feld force_insecure hinzu
    ALTER TABLE imap_settings ADD COLUMN force_insecure BOOLEAN DEFAULT false;
    
    -- Kommentar zum Feld hinzufügen
    COMMENT ON COLUMN imap_settings.force_insecure IS 'Wenn true, wird die TLS-Verbindung komplett umgangen und eine unsichere Verbindung verwendet. Nur für Problemfälle.';
  END IF;
END $$; 
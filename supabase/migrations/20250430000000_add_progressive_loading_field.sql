-- Add progressive_loading field to imap_settings table
DO $$ 
BEGIN
  -- Prüfe, ob das Feld bereits existiert
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'imap_settings'
    AND column_name = 'progressive_loading'
  ) THEN
    -- Füge das Feld progressive_loading hinzu
    ALTER TABLE imap_settings ADD COLUMN progressive_loading BOOLEAN DEFAULT true;
    
    -- Kommentar zum Feld hinzufügen
    COMMENT ON COLUMN imap_settings.progressive_loading IS 'Wenn aktiviert, werden E-Mails schrittweise geladen, um Performanz zu verbessern.';
  END IF;
END $$; 
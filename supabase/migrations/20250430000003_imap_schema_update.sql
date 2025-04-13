-- Aktualisiere das Schema der IMAP-Einstellungen
DO $$ 
BEGIN
  -- Stelle sicher, dass force_insecure existiert
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'imap_settings'
    AND column_name = 'force_insecure'
  ) THEN
    ALTER TABLE imap_settings ADD COLUMN force_insecure BOOLEAN DEFAULT false;
    COMMENT ON COLUMN imap_settings.force_insecure IS 'Wenn true, wird die TLS-Verbindung komplett umgangen und eine unsichere Verbindung verwendet.';
  END IF;

  -- Stelle sicher, dass progressive_loading existiert
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'imap_settings'
    AND column_name = 'progressive_loading'
  ) THEN
    ALTER TABLE imap_settings ADD COLUMN progressive_loading BOOLEAN DEFAULT true;
    COMMENT ON COLUMN imap_settings.progressive_loading IS 'Wenn aktiviert, werden E-Mails schrittweise geladen, um Performanz zu verbessern.';
  END IF;

  -- Stelle sicher, dass connection_timeout existiert und aktualisiere den Standardwert
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'imap_settings'
    AND column_name = 'connection_timeout'
  ) THEN
    ALTER TABLE imap_settings ALTER COLUMN connection_timeout SET DEFAULT 120000;
  ELSE
    ALTER TABLE imap_settings ADD COLUMN connection_timeout INTEGER DEFAULT 120000;
  END IF;
  COMMENT ON COLUMN imap_settings.connection_timeout IS 'Zeit in Millisekunden, die auf eine Verbindung gewartet wird. Empfohlener Wert: 120000 (2 Minuten)';

  -- Stelle sicher, dass secure Feld einen Standardwert hat
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'imap_settings'
    AND column_name = 'secure'
  ) THEN
    ALTER TABLE imap_settings ALTER COLUMN secure SET DEFAULT true;
  END IF;
END $$; 
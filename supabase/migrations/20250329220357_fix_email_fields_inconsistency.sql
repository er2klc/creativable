-- Behebe Inkonsistenzen zwischen html_content und body in der emails-Tabelle

-- Überprüfen, ob beide Spalten existieren und falls ja, Daten von body nach html_content übertragen
DO $$ 
BEGIN
  -- Prüfe, ob die Spalte 'body' existiert
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'emails'
    AND column_name = 'body'
  ) THEN
    -- Prüfe, ob auch html_content existiert
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'emails'
      AND column_name = 'html_content'
    ) THEN
      -- Übertrage Daten von body nach html_content, falls html_content NULL ist
      UPDATE emails
      SET html_content = body
      WHERE html_content IS NULL AND body IS NOT NULL;
      
      -- Entferne die body-Spalte, da wir jetzt html_content standardmäßig verwenden
      ALTER TABLE emails DROP COLUMN IF EXISTS body;
    ELSE
      -- Wenn html_content nicht existiert, füge es hinzu und übertrage Daten
      ALTER TABLE emails ADD COLUMN html_content TEXT;
      UPDATE emails SET html_content = body WHERE body IS NOT NULL;
      -- Entferne die body-Spalte
      ALTER TABLE emails DROP COLUMN IF EXISTS body;
    END IF;
  ELSE
    -- Stelle sicher, dass html_content existiert
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'emails'
      AND column_name = 'html_content'
    ) THEN
      ALTER TABLE emails ADD COLUMN html_content TEXT;
    END IF;
  END IF;
  
  -- Stelle sicher, dass text_content existiert
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'emails'
    AND column_name = 'text_content'
  ) THEN
    ALTER TABLE emails ADD COLUMN text_content TEXT;
  END IF;
  
  -- Stelle sicher, dass content nicht existiert oder entfernt wird
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'emails'
    AND column_name = 'content'
  ) THEN
    -- Übertrage Daten von content nach text_content, falls text_content NULL ist
    UPDATE emails
    SET text_content = content
    WHERE text_content IS NULL AND content IS NOT NULL;
    
    -- Entferne die content-Spalte
    ALTER TABLE emails DROP COLUMN IF EXISTS content;
  END IF;
END $$; 
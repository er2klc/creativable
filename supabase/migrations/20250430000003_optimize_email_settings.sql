
-- Optimize email settings for better connections and reliability
DO $$ 
BEGIN
  -- Update schema for IMAP settings with better defaults
  ALTER TABLE imap_settings 
    ALTER COLUMN connection_timeout SET DEFAULT 120000, -- 2 minutes default timeout
    ALTER COLUMN secure SET DEFAULT true,
    ALTER COLUMN port SET DEFAULT 993;

  -- Add connection_type field for better clarity in UI
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'imap_settings'
    AND column_name = 'connection_type'
  ) THEN
    ALTER TABLE imap_settings ADD COLUMN connection_type TEXT DEFAULT 'SSL/TLS';
  END IF;
  
  -- Update schema for SMTP settings with better defaults
  ALTER TABLE smtp_settings
    ALTER COLUMN secure SET DEFAULT true,
    ALTER COLUMN port SET DEFAULT 587;
    
  -- Add connection_type field to SMTP settings
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'smtp_settings'
    AND column_name = 'connection_type'
  ) THEN
    ALTER TABLE smtp_settings ADD COLUMN connection_type TEXT DEFAULT 'STARTTLS';
  END IF;
  
  -- Add connection_timeout field to SMTP settings if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'smtp_settings'
    AND column_name = 'connection_timeout'
  ) THEN
    ALTER TABLE smtp_settings ADD COLUMN connection_timeout INTEGER DEFAULT 60000;
  END IF;
END $$;

-- Update existing records with optimized settings
UPDATE imap_settings 
SET 
  connection_timeout = 120000,
  connection_type = 'SSL/TLS'
WHERE connection_timeout < 60000;

-- Add helpful comments to the schema
COMMENT ON COLUMN imap_settings.connection_type IS 'Type of secure connection (SSL/TLS, STARTTLS, None)';
COMMENT ON COLUMN smtp_settings.connection_type IS 'Type of secure connection (SSL/TLS, STARTTLS, None)';

-- Erhöhe den Standardwert für connection_timeout für bessere Stabilität
UPDATE imap_settings SET connection_timeout = 120000 WHERE connection_timeout < 120000;

-- Füge einen Kommentar zum Feld connection_timeout hinzu
COMMENT ON COLUMN imap_settings.connection_timeout IS 'Zeit in Millisekunden, die auf eine Verbindung gewartet wird. Empfohlener Wert: 120000 (2 Minuten)'; 
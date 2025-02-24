
-- Erstelle die Policies für smtp_settings
BEGIN;

-- Lösche existierende Policies
DROP POLICY IF EXISTS "Users can view their own smtp settings" ON smtp_settings;
DROP POLICY IF EXISTS "Users can insert their own smtp settings" ON smtp_settings;
DROP POLICY IF EXISTS "Users can update their own smtp settings" ON smtp_settings;
DROP POLICY IF EXISTS "Users can delete their own smtp settings" ON smtp_settings;

-- Aktiviere RLS
ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;

-- Neue Policies mit Einzelaccount-Beschränkung
CREATE POLICY "Users can view their own smtp settings"
  ON smtp_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own smtp settings"
  ON smtp_settings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND NOT EXISTS (
      SELECT 1 FROM smtp_settings 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own smtp settings"
  ON smtp_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own smtp settings"
  ON smtp_settings FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;


-- E-Mail-Tracking-Tabelle erstellen
CREATE TABLE IF NOT EXISTS email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE,
  tracking_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS-Richtlinien hinzufügen
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;

-- Richtlinien erstellen
CREATE POLICY "Users can read their own email tracking data"
  ON email_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email tracking data"
  ON email_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert any email tracking data"
  ON email_tracking
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Index für schnellere Abfragen hinzufügen
CREATE INDEX IF NOT EXISTS email_tracking_lead_id_idx ON email_tracking (lead_id);
CREATE INDEX IF NOT EXISTS email_tracking_user_id_idx ON email_tracking (user_id);

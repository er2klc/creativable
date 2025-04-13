
-- Create table for API email settings
CREATE TABLE IF NOT EXISTS api_email_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 993,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'INBOX',
  tls BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for email synchronization status
CREATE TABLE IF NOT EXISTS email_sync_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder TEXT NOT NULL,
  last_sync_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, folder)
);

-- Create RLS policies for api_email_settings
ALTER TABLE api_email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY api_email_settings_select ON api_email_settings
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY api_email_settings_insert ON api_email_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY api_email_settings_update ON api_email_settings
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY api_email_settings_delete ON api_email_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for email_sync_status
ALTER TABLE email_sync_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_sync_status_select ON email_sync_status
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY email_sync_status_insert ON email_sync_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY email_sync_status_update ON email_sync_status
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY email_sync_status_delete ON email_sync_status
  FOR DELETE USING (auth.uid() = user_id);

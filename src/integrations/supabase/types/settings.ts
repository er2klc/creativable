// Settings types for the application
export interface SettingsType {
  id: string;
  user_id: string;
  language: string;
  openai_api_key?: string;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
  // Add other settings fields as needed
  [key: string]: any;
}

export interface EmailSettingsType {
  id: string;
  user_id: string;
  email_provider: string;
  email_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Alias for compatibility
export type Settings = SettingsType;
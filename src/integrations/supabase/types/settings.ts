
import { BaseSettings } from './settings/base';
import { ApiKeySettings } from './settings/api-keys';
import { BusinessSettings } from './settings/business';
import { SocialMediaSettings } from './settings/social-media';

export interface Settings extends BaseSettings, ApiKeySettings, BusinessSettings, SocialMediaSettings {
  // Add smtp_configured explicitly since we're using it in EmailSettings.tsx
  smtp_configured?: boolean;
}

export interface SettingsInsert extends Partial<Settings> {
  user_id: string;
}

export interface SettingsUpdate extends Partial<Settings> {}

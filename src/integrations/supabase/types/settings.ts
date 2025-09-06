import { BaseSettings } from './settings/base';
import { ApiKeySettings } from './settings/api-keys';
import { BusinessSettings } from './settings/business';
import { SocialMediaSettings } from './settings/social-media';
import { EmailSettings } from './settings/email';

export interface Settings extends BaseSettings, ApiKeySettings, BusinessSettings, SocialMediaSettings, EmailSettings {
  
}

export interface SettingsInsert extends Partial<Settings> {
  user_id: string;
}

export interface SettingsUpdate extends Partial<Settings> {}

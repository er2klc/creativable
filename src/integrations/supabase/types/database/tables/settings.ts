import { Settings, SettingsInsert, SettingsUpdate } from '../../settings';

export interface SettingTables {
  settings: {
    Row: Settings;
    Insert: SettingsInsert;
    Update: SettingsUpdate;
  };
}
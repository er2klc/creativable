export interface PlatformAuthStatus {
  id: string;
  user_id: string;
  platform: string;
  is_connected: boolean;
  auth_token: string; // Client ID für OAuth Apps
  refresh_token: string; // Client Secret für OAuth Apps
  access_token?: string; // OAuth Access Token
  expires_at: string;
  created_at: string;
  updated_at: string;
}
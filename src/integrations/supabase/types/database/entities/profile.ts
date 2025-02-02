export interface Profile {
  id: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  email?: string;
  display_name?: string;
  is_super_admin?: boolean;
  avatar_url?: string;
}
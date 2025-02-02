export interface Platform {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  created_by: string;
  invite_code?: string | null;
  logo_url?: string | null;
  linked_modules?: string[] | null;
  image_url?: string | null;
  slug?: string | null;
}

export interface PlatformModule {
  id: string;
  platform_id: string;
  title: string;
  description?: string | null;
  order_index?: number;
  created_at?: string;
  created_by: string;
  module_order?: number;
}
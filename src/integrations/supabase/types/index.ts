
export interface Tables<T extends keyof Database['public']['Tables']> {
  [key: string]: any;
}

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          name: string;
          platform: string;
          status?: string;
          email?: string | null;
          phone_number?: string | null;
          phase_id?: string;
          pipeline_id?: string;
          social_media_profile_image_url?: string | null;
          is_favorite?: boolean;
        };
      };
      phases: {
        Row: {
          id: string;
          name: string;
          order_index: number;
          pipeline_id: string;
        };
      };
      // Add other tables as needed
    };
  };
}

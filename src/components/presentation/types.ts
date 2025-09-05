
export interface PresentationPageData {
  id: string;
  title: string;
  video_url: string;
  lead_id: string;
  user: {
    profiles: {
      display_name: string;
      avatar_url: string;
    };
  };
  lead: {
    name: string;
    social_media_profile_image_url: string;
  };
}

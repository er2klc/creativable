interface LinkedInProfile {
  fullName?: string;
  name?: string;
  summary?: string;
  about?: string;
  followers?: number;
  connections?: number;
  profileImage?: string;
  avatar?: string;
  currentCompany?: {
    name?: string;
    title?: string;
  };
  experience?: any[];
  activity?: any[];
  location?: string;
  headline?: string;
  industry?: string;
}

export function processLinkedInData(profileData: LinkedInProfile) {
  console.log('Processing LinkedIn profile data:', JSON.stringify(profileData, null, 2));

  return {
    scanHistory: {
      followers_count: profileData.followers || 0,
      following_count: profileData.connections || 0,
      posts_count: profileData.activity?.length || 0,
      profile_data: {
        headline: profileData.headline,
        summary: profileData.summary,
        location: profileData.location,
        industry: profileData.industry,
      },
      experience: profileData.experience || [],
      success: true,
      scanned_at: new Date().toISOString()
    },
    leadData: {
      name: profileData.fullName || profileData.name,
      social_media_bio: profileData.summary || profileData.about,
      social_media_profile_image_url: profileData.profileImage || profileData.avatar,
      current_company_name: profileData.currentCompany?.name || profileData.experience?.[0]?.companyName,
      position: profileData.currentCompany?.title || profileData.experience?.[0]?.title,
      city: profileData.location,
      social_media_followers: profileData.followers || 0,
      social_media_following: profileData.connections || 0,
      experience: profileData.experience || [],
      last_social_media_scan: new Date().toISOString()
    }
  };
}
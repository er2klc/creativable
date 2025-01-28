export function processLinkedInData(profileData: any) {
  console.log('Processing LinkedIn data:', profileData);

  const scanHistory = {
    platform: 'LinkedIn',
    followers_count: profileData.followers || 0,
    following_count: profileData.connections || 0,
    posts_count: profileData.activity?.length || 0,
    engagement_rate: null,
    success: true,
    profile_data: {
      headline: profileData.headline || '',
      summary: profileData.summary || '',
      location: profileData.location || '',
      industry: profileData.industry || '',
    },
    experience: profileData.experience || [],
    education: profileData.education || [],
    skills: profileData.skills || [],
    certifications: profileData.certifications || [],
    languages: profileData.languages || [],
    recommendations: profileData.recommendations || []
  };

  const leadData = {
    social_media_bio: profileData.summary || '',
    social_media_interests: profileData.skills || [],
    social_media_followers: profileData.followers || 0,
    social_media_following: profileData.connections || 0,
    social_media_posts: profileData.activity || [],
    last_social_media_scan: new Date().toISOString(),
    experience: profileData.experience || [],
    current_company_name: profileData.experience?.[0]?.company || null,
    linkedin_id: profileData.profileId || null
  };

  return { scanHistory, leadData };
}
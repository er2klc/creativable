export function processLinkedInData(profileData: any) {
  console.log('Processing LinkedIn data:', JSON.stringify(profileData, null, 2));

  // Extract website from summary if present
  const websiteMatch = profileData.basic_info?.summary?.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/);
  const website = websiteMatch ? websiteMatch[0] : null;

  // Prepare lead data - only include fields that exist in the leads table
  const leadData = {
    name: profileData.basic_info?.fullname || '',
    social_media_bio: profileData.basic_info?.summary || '',
    city: profileData.basic_info?.location?.full || null,
    company_name: profileData.experience?.[0]?.company || null,
    position: profileData.experience?.[0]?.title || null,
    current_company_name: profileData.experience?.find((exp: any) => exp.is_current)?.company || null,
    linkedin_id: profileData.profile_id || null,
    avatar_url: profileData.profile_picture || null,
    website: website,
    social_media_username: profileData.profile_url?.split('/in/')?.[1]?.replace(/\/$/, '') || null,
    social_media_followers: profileData.followers_count || 0,
    social_media_following: profileData.connections_count || 0,
    education_summary: createEducationSummary(profileData.education)
  };

  // Prepare scan history data
  const scanHistory = {
    platform: 'LinkedIn',
    followers_count: profileData.followers_count || 0,
    following_count: profileData.connections_count || 0,
    success: true,
    profile_data: {
      basic_info: profileData.basic_info || {},
      headline: profileData.headline || '',
      summary: profileData.basic_info?.summary || '',
      location: profileData.basic_info?.location || {},
      industry: profileData.industry || '',
    },
    experience: profileData.experience || [],
    education: profileData.education || [],
    skills: profileData.skills || [],
    languages: profileData.languages || [],
    recommendations: profileData.recommendations || []
  };

  return { scanHistory, leadData };
}

function createEducationSummary(education: any[]): string {
  if (!education || !Array.isArray(education) || education.length === 0) {
    return '';
  }

  // Get the highest/latest education entry
  const latestEducation = education[0];
  if (!latestEducation) return '';

  const degree = latestEducation.degree || 'Studied';
  const school = latestEducation.school || '';

  return `${degree}, ${school}`.trim();
}
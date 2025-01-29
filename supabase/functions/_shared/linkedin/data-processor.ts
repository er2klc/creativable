export function processLinkedInData(profileData: any) {
  console.log('Processing LinkedIn data:', JSON.stringify(profileData, null, 2));

  // Extract website from summary if present
  const websiteMatch = profileData.basic_info?.summary?.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/);
  const website = websiteMatch ? websiteMatch[0] : null;

  // Process languages array
  const languages = profileData.languages?.map((lang: any) => lang.language).filter(Boolean) || [];

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
    education_summary: createEducationSummary(profileData.education),
    languages: languages,
    last_social_media_scan: new Date().toISOString()
  };

  // Prepare experience posts
  const experiencePosts = (profileData.experience || []).map((exp: any) => ({
    id: `${profileData.profile_id}-exp-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: null, // Will be set when saving
    post_type: 'experience',
    company: exp.company || '',
    position: exp.title || '',
    location: exp.location || '',
    start_date: exp.start_date ? new Date(exp.start_date).toISOString() : null,
    end_date: exp.end_date ? new Date(exp.end_date).toISOString() : null,
    content: exp.description || '',
    metadata: {
      is_current: exp.is_current || false,
      company_linkedin_url: exp.company_linkedin_url || null,
      company_logo: exp.company_logo || null
    }
  }));

  // Prepare education posts
  const educationPosts = (profileData.education || []).map((edu: any) => ({
    id: `${profileData.profile_id}-edu-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: null, // Will be set when saving
    post_type: 'education',
    school: edu.school || '',
    degree: edu.degree || '',
    start_date: edu.start_date ? new Date(edu.start_date).toISOString() : null,
    end_date: edu.end_date ? new Date(edu.end_date).toISOString() : null,
    school_linkedin_url: edu.school_linkedin_url || null,
    content: edu.description || '',
    metadata: {
      field_of_study: edu.field_of_study || null,
      activities: edu.activities || null,
      school_logo: edu.school_logo || null
    }
  }));

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

  return { 
    scanHistory, 
    leadData,
    posts: [...experiencePosts, ...educationPosts]
  };
}

function createEducationSummary(education: any[]): string {
  if (!education || !Array.isArray(education) || education.length === 0) {
    return '';
  }

  const latestEducation = education[0];
  if (!latestEducation) return '';

  const degree = latestEducation.degree || 'Studied';
  const school = latestEducation.school || '';

  return `${degree}, ${school}`.trim();
}
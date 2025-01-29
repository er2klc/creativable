import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function processLinkedInData(profileData: any, leadId: string) {
  console.log('Processing LinkedIn data for lead:', leadId);
  
  // Helper function to safely format dates
  function formatDate(date: any): string | null {
    if (!date) return null;
    
    try {
      // Handle different date formats
      if (typeof date === 'object' && date.year) {
        const month = date.month || 1;
        const day = date.day || 1;
        return new Date(date.year, month - 1, day).toISOString();
      }
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  }

  // Prepare lead data update
  const leadUpdate = {
    name: [profileData.firstName, profileData.lastName].filter(Boolean).join(' '),
    social_media_username: profileData.publicIdentifier || profileData.profile_url?.split('/in/')?.[1]?.replace(/\/$/, ''),
    social_media_profile_image_url: profileData.pictureUrl || null,
    city: profileData.geoLocationName || null,
    region: profileData.geoCountryName || null,
    social_media_followers: profileData.followersCount || 0,
    social_media_following: profileData.connectionsCount || 0,
    industry: profileData.industryName || null,
    social_media_bio: profileData.summary || profileData.headline || null,
    position: profileData.occupation || profileData.headline || null,
    current_company_name: profileData.positions?.[0]?.companyName || null,
    last_social_media_scan: new Date().toISOString()
  };

  // Process positions (work experience)
  const experiencePosts = (profileData.positions || []).map((position: any) => ({
    id: `${leadId}-exp-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: leadId,
    post_type: 'position',
    company: position.companyName || '',
    position: position.title || '',
    location: position.locationName || '',
    start_date: formatDate(position.timePeriod?.startDate),
    end_date: formatDate(position.timePeriod?.endDate),
    content: position.description || '',
    media_urls: position.company?.logo ? [position.company.logo] : [],
    metadata: {
      is_current: position.timePeriod?.endDate ? false : true,
      company_linkedin_url: position.companyUrl || null
    }
  }));

  // Process education
  const educationPosts = (profileData.education || []).map((edu: any) => ({
    id: `${leadId}-edu-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: leadId,
    post_type: 'education',
    school: edu.schoolName || '',
    degree: edu.degreeName || '',
    content: edu.fieldOfStudy || '',
    start_date: formatDate(edu.timePeriod?.startDate),
    end_date: formatDate(edu.timePeriod?.endDate),
    school_linkedin_url: edu.schoolUrl || null,
    metadata: {
      degree_name: edu.degreeName || null,
      field_of_study: edu.fieldOfStudy || null
    }
  }));

  return {
    leadUpdate,
    experiencePosts,
    educationPosts
  };
}
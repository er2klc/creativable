import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function processLinkedInData(profileData: any, leadId: string) {
  console.log('Processing LinkedIn data for lead:', leadId);
  
  // Helper function to safely format dates
  function formatDate(date: any): string | null {
    if (!date) return null;
    
    try {
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

  // Prepare lead data update according to mapping
  const leadUpdate = {
    linkedin_id: profileData.id || null,
    name: [profileData.firstName, profileData.lastName].filter(Boolean).join(' '),
    social_media_username: profileData.publicIdentifier || profileData.profile_url?.split('/in/')?.[1]?.replace(/\/$/, ''),
    social_media_profile_image_url: profileData.pictureUrl || null,
    city: profileData.geoLocationName || profileData.city || null,
    social_media_followers: profileData.followersCount || 0,
    social_media_following: profileData.connectionsCount || 0, // Store connections count here
    industry: profileData.industryName || null,
    social_media_bio: profileData.summary || null,
    position: profileData.headline || profileData.occupation || null,
    current_company_name: profileData.positions?.[0]?.companyName || null,
    website: profileData.companyLinkedinUrl || null,
    languages: Array.isArray(profileData.languages) ? profileData.languages : [],
    social_media_interests: Array.isArray(profileData.skills) ? profileData.skills : [],
    education_summary: Array.isArray(profileData.education) ? 
      profileData.education.map((edu: any) => 
        `${edu.schoolName || ''} - ${edu.degreeName || ''} ${edu.fieldOfStudy ? `(${edu.fieldOfStudy})` : ''}`
      ).join('; ') : null,
    experience: profileData.positions || [],
    last_social_media_scan: new Date().toISOString()
  };

  // Process positions into linkedin_posts
  const experiencePosts = (profileData.positions || []).map((position: any) => ({
    id: `${leadId}-exp-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: leadId,
    post_type: 'experience',
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

  // Process education entries
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

  // Combine all posts
  const allPosts = [
    ...experiencePosts,
    ...educationPosts
  ];

  return {
    leadUpdate,
    allPosts
  };
}
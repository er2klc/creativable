import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function processLinkedInData(profileData: any, leadId: string) {
  console.log('Processing LinkedIn data for lead:', leadId);
  console.log('Raw profile data:', JSON.stringify(profileData, null, 2));
  
  // Extract LinkedIn ID from URL if available
  const linkedinId = profileData.url ? profileData.url.split('/in/')[1]?.replace(/\/$/, '') : null;
  
  // Prepare lead data update
  const leadUpdate = {
    // Basic info
    name: profileData.basic_info?.fullname || profileData.full_name || '',
    social_media_username: linkedinId || '',
    linkedin_id: linkedinId,
    
    // Profile image
    social_media_profile_image_url: profileData.avatar || null,
    
    // Profile URL
    website: profileData.url || '',
    
    // Location
    city: profileData.city || '',
    region: profileData.country_code || '',
    
    // Network size
    social_media_followers: profileData.connections || 0,
    
    // Current position
    current_company_name: profileData.current_company?.name || '',
    position: profileData.current_company?.title || '',
    
    // Bio
    social_media_bio: profileData.about || '',
    
    // Scan timestamp
    last_social_media_scan: new Date().toISOString()
  };

  console.log('Processed lead update:', JSON.stringify(leadUpdate, null, 2));

  // Helper function to safely format dates
  function formatDate(dateInput: any): string | null {
    if (!dateInput) return null;
    
    try {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch (error) {
      console.error('Error formatting date:', dateInput, error);
      return null;
    }
  }

  // Process experience entries
  const experiencePosts = (profileData.experience || []).map((exp: any) => ({
    id: `exp-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: leadId,
    post_type: 'experience',
    company: exp.company || '',
    position: exp.title || '',
    location: exp.location || '',
    start_date: formatDate(exp.start_date),
    end_date: formatDate(exp.end_date),
    content: exp.description || '',
    media_urls: exp.company_logo_url ? [exp.company_logo_url] : [],
    posted_at: formatDate(exp.start_date)
  }));

  console.log('Processed experience posts:', JSON.stringify(experiencePosts, null, 2));

  // Process education entries
  const educationPosts = (profileData.education || []).map((edu: any) => ({
    id: `edu-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: leadId,
    post_type: 'education',
    school: edu.title || '',
    degree: edu.degree || '',
    field_of_study: edu.field || '',
    school_linkedin_url: edu.url || null,
    start_date: formatDate(edu.start_date),
    end_date: formatDate(edu.end_date),
    content: edu.description || '',
    media_urls: edu.institute_logo_url ? [edu.institute_logo_url] : [],
    posted_at: formatDate(edu.start_date)
  }));

  console.log('Processed education posts:', JSON.stringify(educationPosts, null, 2));

  // Process activity posts
  const activityPosts = (profileData.activity || []).map((activity: any) => ({
    id: `act-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: leadId,
    post_type: 'activity',
    content: activity.title || '',
    url: activity.link || null,
    media_urls: activity.img ? [activity.img] : [],
    reactions: activity.interaction || {},
    posted_at: formatDate(activity.date) || new Date().toISOString()
  }));

  console.log('Processed activity posts:', JSON.stringify(activityPosts, null, 2));

  return {
    leadUpdate,
    linkedinPosts: [...experiencePosts, ...educationPosts, ...activityPosts]
  };
}
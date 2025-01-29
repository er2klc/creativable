import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function processLinkedInData(profileData: any, leadId: string) {
  console.log('Processing LinkedIn data for lead:', leadId);
  
  // Prepare lead data update
  const leadUpdate = {
    // Name handling - use fullname if available, otherwise username
    name: profileData.basic_info?.fullname || profileData.social_media_username || '',
    
    // Store LinkedIn username
    social_media_username: profileData.basic_info?.username || profileData.profile_url?.split('/in/')?.[1]?.replace(/\/$/, '') || '',
    
    // Store profile image URL
    social_media_profile_image_url: profileData.avatar_url || null,
    
    // Store LinkedIn ID if available
    linkedin_id: profileData.linkedin_id || null,
    
    // Store location data
    city: profileData.basic_info?.location?.full || '',
    
    // Store languages as array
    languages: (profileData.languages || []).map((lang: any) => lang.language),
    
    // Store social media stats
    social_media_followers: profileData.connections || 0,
    
    // Store bio/summary
    social_media_bio: profileData.basic_info?.summary || '',
    
    // Store current position and company
    position: profileData.experience?.[0]?.title || '',
    current_company_name: profileData.experience?.[0]?.company || '',
    
    // Update scan timestamp
    last_social_media_scan: new Date().toISOString()
  };

  // Helper function to safely format dates
  function formatDate(year: any, month: any = '01'): string | null {
    if (!year) return null;
    
    try {
      const date = new Date(`${year}-${month}-01`);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  }

  // Prepare experience posts
  const experiencePosts = (profileData.experience || []).map((exp: any) => ({
    id: `${leadId}-exp-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: leadId,
    post_type: 'experience',
    company: exp.company || '',
    position: exp.title || '',
    location: exp.location || '',
    start_date: formatDate(exp.start_date?.year, exp.start_date?.month),
    end_date: formatDate(exp.end_date?.year, exp.end_date?.month),
    content: exp.description || '',
    metadata: {
      is_current: exp.is_current || false,
      company_linkedin_url: exp.company_linkedin_url || null
    }
  }));

  // Prepare education posts
  const educationPosts = (profileData.education || []).map((edu: any) => ({
    id: `${leadId}-edu-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: leadId,
    post_type: 'education',
    school: edu.school || '',
    degree: edu.degree || '',
    start_date: formatDate(edu.start_year),
    end_date: formatDate(edu.end_year),
    school_linkedin_url: edu.school_linkedin_url || null,
    content: edu.description || '',
    metadata: {
      field_of_study: edu.field_of_study || null
    }
  }));

  return {
    leadUpdate,
    experiencePosts,
    educationPosts
  };
}
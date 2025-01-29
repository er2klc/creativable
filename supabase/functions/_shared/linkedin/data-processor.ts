import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Database } from '../../../types/database';

export async function processLinkedInData(profileData: any, leadId: string) {
  console.log('Processing LinkedIn data for lead:', leadId);
  
  // Prepare lead data update
  const leadUpdate = {
    name: profileData.full_name || '',
    social_media_bio: profileData.summary || '',
    city: profileData.location?.full || '',
    position: profileData.experience?.[0]?.title || '',
    current_company_name: profileData.experience?.[0]?.company || '',
    education_summary: profileData.education?.map((edu: any) => 
      `${edu.degree || ''} at ${edu.school || ''}`
    ).join(', ') || '',
    website: profileData.website || '',
    languages: profileData.languages?.map((lang: any) => lang.language) || [],
    social_media_followers: profileData.followers_count || 0,
    social_media_following: profileData.connections_count || 0,
    social_media_profile_image_url: profileData.profile_picture_url || null,
    avatar_url: profileData.profile_picture_url || null,
    last_social_media_scan: new Date().toISOString()
  };

  // Helper function to safely format dates
  function formatDate(dateInput: any): string | null {
    if (!dateInput) return null;
    
    // Handle string dates
    if (typeof dateInput === 'string') {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? null : date.toISOString();
    }
    
    // Handle object dates with year/month format
    if (typeof dateInput === 'object' && dateInput.year) {
      const year = dateInput.year;
      const month = dateInput.month || '01';
      const day = '01';
      
      const date = new Date(`${year}-${month}-${day}`);
      return isNaN(date.getTime()) ? null : date.toISOString();
    }
    
    return null;
  }

  // Prepare experience posts
  const experiencePosts = (profileData.experience || []).map((exp: any) => ({
    id: `${profileData.profile_id}-exp-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: leadId,
    post_type: 'experience',
    company: exp.company || '',
    position: exp.title || '',
    location: exp.location || '',
    start_date: formatDate(exp.start_date),
    end_date: formatDate(exp.end_date),
    content: exp.description || '',
    metadata: {
      is_current: exp.is_current || false,
      company_linkedin_url: exp.company_linkedin_url || null
    },
    posted_at: formatDate(exp.start_date)
  }));

  // Prepare education posts
  const educationPosts = (profileData.education || []).map((edu: any) => ({
    id: `${profileData.profile_id}-edu-${Math.random().toString(36).substr(2, 9)}`,
    lead_id: leadId,
    post_type: 'education',
    school: edu.school || '',
    degree: edu.degree || '',
    start_date: formatDate(edu.start_date),
    end_date: formatDate(edu.end_date),
    school_linkedin_url: edu.school_linkedin_url || null,
    content: edu.description || '',
    metadata: {
      field_of_study: edu.field_of_study || null,
      activities: edu.activities || null
    },
    posted_at: formatDate(edu.start_date)
  }));

  return {
    leadUpdate,
    experiencePosts,
    educationPosts
  };
}
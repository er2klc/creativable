
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePresentationView = (pageId: string | undefined, leadId: string | undefined) => {
  const [viewId, setViewId] = useState<string | null>(null);

  const createView = async (pageData: any) => {
    try {
      const ipResponse = await fetch('https://api.db-ip.com/v2/free/self');
      const ipData = await ipResponse.json();
      const location = `${ipData.city || ''}, ${ipData.countryName || ''}`;

      const { data: viewData, error: viewError } = await supabase
        .from('presentation_views')
        .insert([
          {
            page_id: pageData.id,
            lead_id: leadId,
            video_progress: 0,
            completed: false,
            ip_address: ipData.ipAddress,
            location: location,
            metadata: {
              type: 'youtube',
              event_type: 'video_opened',
              title: pageData.title,
              url: pageData.video_url,
              ip: ipData.ipAddress,
              location: location
            }
          }
        ])
        .select()
        .single();

      if (viewError) {
        console.error('Error creating view record:', viewError);
      } else {
        setViewId(viewData.id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateProgress = async (progress: number, pageData: any) => {
    if (!viewId || !pageData) return;

    const isCompleted = progress >= 95;
    
    try {
      const ipResponse = await fetch('https://api.db-ip.com/v2/free/self');
      const ipData = await ipResponse.json();
      const location = `${ipData.city || ''}, ${ipData.countryName || ''}`;

      const metadata = {
        type: 'youtube',
        event_type: isCompleted ? 'video_completed' : 'video_progress',
        title: pageData.title,
        url: pageData.video_url,
        ip: ipData.ipAddress,
        location: location
      };

      const { error } = await supabase
        .from('presentation_views')
        .update({
          video_progress: progress,
          completed: isCompleted,
          ip_address: ipData.ipAddress,
          location: location,
          metadata
        })
        .eq('id', viewId);

      if (error) {
        console.error('Error updating view progress:', error);
      }
    } catch (error) {
      console.error('Error fetching IP data:', error);
    }
  };

  return {
    viewId,
    createView,
    updateProgress
  };
};


import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIPLocation } from './useIPLocation';

export const usePresentationView = (pageId: string | undefined, leadId: string | undefined) => {
  const [viewId, setViewId] = useState<string | null>(null);
  const ipLocationData = useIPLocation();

  const createView = async (pageData: any) => {
    if (!ipLocationData || !leadId || !pageData) {
      console.error('Missing required data for createView:', { ipLocationData, leadId, pageData });
      return;
    }

    try {
      console.log('Creating presentation view with data:', {
        pageId: pageData.id,
        leadId,
        ipAddress: ipLocationData.ipAddress,
        location: ipLocationData.location
      });

      const { data: viewData, error: viewError } = await supabase
        .from('presentation_views')
        .insert([
          {
            page_id: pageData.id,
            lead_id: leadId,
            video_progress: 0,
            completed: false,
            ip_address: ipLocationData.ipAddress,
            location: ipLocationData.location,
            metadata: {
              type: 'youtube',
              event_type: 'video_opened',
              title: pageData.title,
              url: pageData.video_url,
              ip: ipLocationData.ipAddress,
              location: ipLocationData.location
            }
          }
        ])
        .select()
        .single();

      if (viewError) {
        console.error('Error creating view record:', viewError);
      } else {
        console.log('Successfully created view record:', viewData);
        setViewId(viewData.id);
      }
    } catch (error) {
      console.error('Error creating presentation view:', error);
    }
  };

  const updateProgress = async (progress: number, pageData: any) => {
    if (!viewId || !pageData || !ipLocationData) {
      console.error('Missing required data for updateProgress:', { viewId, pageData, ipLocationData });
      return;
    }

    const isCompleted = progress >= 95;
    
    try {
      console.log('Updating presentation view progress:', {
        viewId,
        progress,
        isCompleted
      });

      const metadata = {
        type: 'youtube',
        event_type: isCompleted ? 'video_completed' : 'video_progress',
        title: pageData.title,
        url: pageData.video_url,
        ip: ipLocationData.ipAddress,
        location: ipLocationData.location
      };

      const { error } = await supabase
        .from('presentation_views')
        .update({
          video_progress: progress,
          completed: isCompleted,
          ip_address: ipLocationData.ipAddress,
          location: ipLocationData.location,
          metadata
        })
        .eq('id', viewId);

      if (error) {
        console.error('Error updating view progress:', error);
      } else {
        console.log('Successfully updated view progress');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    viewId,
    createView,
    updateProgress
  };
};

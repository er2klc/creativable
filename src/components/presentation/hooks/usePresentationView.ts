import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIPLocation } from './useIPLocation';
import { toast } from 'sonner';
import { PresentationPageData } from '../types';

export const usePresentationView = (pageId: string | undefined, leadId: string | undefined) => {
  const [viewId, setViewId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCreatingView, setIsCreatingView] = useState(false);
  const ipLocationData = useIPLocation();
  const MAX_RETRIES = 3;

  const createView = useCallback(async (pageData: PresentationPageData) => {
    if (!pageData || !leadId || !pageData.id || isCreatingView) {
      console.log('Skipping view creation - missing data or already creating:', {
        hasPageData: !!pageData,
        hasLeadId: !!leadId,
        hasPageId: !!pageData?.id,
        isCreatingView
      });
      return;
    }

    // Wait for IP data with retry mechanism
    if (!ipLocationData && retryCount < MAX_RETRIES) {
      console.log('Waiting for IP data, retry:', retryCount + 1);
      setTimeout(() => setRetryCount(prev => prev + 1), 1000);
      return;
    }

    try {
      setIsCreatingView(true);
      console.log('Creating presentation view with data:', {
        pageId: pageData.id,
        leadId,
        ipAddress: ipLocationData?.ipAddress || 'unknown',
        location: ipLocationData?.location || 'Unknown Location'
      });

      const { data: viewData, error: viewError } = await supabase
        .from('presentation_views')
        .insert([
          {
            page_id: pageData.id,
            lead_id: leadId,
            video_progress: 0,
            completed: false,
            ip_address: ipLocationData?.ipAddress || 'unknown',
            location: ipLocationData?.location || 'Unknown Location',
            metadata: {
              type: 'youtube',
              event_type: 'video_opened',
              title: pageData.title,
              url: pageData.video_url,
              ip: ipLocationData?.ipAddress || 'unknown',
              location: ipLocationData?.location || 'Unknown Location'
            }
          }
        ])
        .select()
        .single();

      if (viewError) {
        console.error('Error creating view record:', viewError);
        toast.error('Failed to create view record');
      } else {
        console.log('Successfully created view record:', viewData);
        setViewId(viewData.id);
      }
    } catch (error) {
      console.error('Error creating presentation view:', error);
      toast.error('Failed to create presentation view');
    } finally {
      setIsCreatingView(false);
    }
  }, [leadId, ipLocationData, retryCount, isCreatingView]);

  const updateProgress = async (progress: number, pageData: any) => {
    if (!viewId) {
      console.error('Missing viewId for updateProgress');
      return;
    }

    if (!pageData) {
      console.error('Missing pageData for updateProgress');
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
        ip: ipLocationData?.ipAddress || 'unknown',
        location: ipLocationData?.location || 'Unknown Location'
      };

      const { error } = await supabase
        .from('presentation_views')
        .update({
          video_progress: progress,
          completed: isCompleted,
          ip_address: ipLocationData?.ipAddress || 'unknown',
          location: ipLocationData?.location || 'Unknown Location',
          metadata
        })
        .eq('id', viewId);

      if (error) {
        console.error('Error updating view progress:', error);
        toast.error('Failed to update view progress');
      } else {
        console.log('Successfully updated view progress');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update progress');
    }
  };

  // Reset retry count when pageId changes
  useEffect(() => {
    setRetryCount(0);
    setIsCreatingView(false);
  }, [pageId]);

  return {
    viewId,
    createView,
    updateProgress
  };
};

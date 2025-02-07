
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

  // Reset state when pageId changes
  useEffect(() => {
    setRetryCount(0);
    setIsCreatingView(false);
    setViewId(null);
  }, [pageId]);

  const createView = useCallback(async (pageData: PresentationPageData) => {
    // If we already have a viewId or are creating, don't proceed
    if (viewId || isCreatingView) {
      return;
    }

    if (!pageData || !leadId || !pageData.id) {
      return;
    }

    // Wait for IP data with retry mechanism
    if (!ipLocationData && retryCount < MAX_RETRIES) {
      setTimeout(() => setRetryCount(prev => prev + 1), 1000);
      return;
    }

    try {
      setIsCreatingView(true);

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
              location: ipLocationData?.location || 'Unknown Location',
              id: null // This will be updated with the actual ID after insert
            }
          }
        ])
        .select()
        .single();

      if (viewError) {
        toast.error('Failed to create view record');
      } else {
        setViewId(viewData.id);
        // Update metadata with the actual ID
        const { error: updateError } = await supabase
          .from('presentation_views')
          .update({
            metadata: {
              ...viewData.metadata,
              id: viewData.id
            }
          })
          .eq('id', viewData.id);

        if (updateError) {
          console.error('Failed to update view metadata with ID:', updateError);
        }
      }
    } catch (error) {
      toast.error('Failed to create presentation view');
    } finally {
      setIsCreatingView(false);
    }
  }, [leadId, ipLocationData, retryCount, isCreatingView, viewId]);

  const updateProgress = async (progress: number, pageData: PresentationPageData) => {
    if (!viewId) {
      return;
    }

    const isCompleted = progress >= 95;
    
    try {
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
        toast.error('Failed to update view progress');
      }
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  return {
    viewId,
    createView,
    updateProgress,
    isCreatingView
  };
};


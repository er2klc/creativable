
import { useState, useCallback } from 'react';
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
    if (viewId || isCreatingView) {
      return;
    }

    if (!pageData || !leadId || !pageData.id) {
      return;
    }

    if (!ipLocationData && retryCount < MAX_RETRIES) {
      setTimeout(() => setRetryCount(prev => prev + 1), 1000);
      return;
    }

    try {
      setIsCreatingView(true);
      console.log('Creating new view...');

      const newViewId = crypto.randomUUID();
      const viewData = {
        id: newViewId,
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
          presentationUrl: pageData.presentationUrl,
          video_progress: 0,
          completed: false,
          id: newViewId
        }
      };

      const { error: viewError } = await supabase
        .from('presentation_views')
        .insert([viewData]);

      if (viewError) {
        console.error('Error creating view:', viewError);
        toast.error('Failed to create view record');
        return;
      }

      setViewId(newViewId);
      console.log('View created with ID:', newViewId);

    } catch (error) {
      console.error('Error in createView:', error);
      toast.error('Failed to create presentation view');
    } finally {
      setIsCreatingView(false);
    }
  }, [leadId, ipLocationData, retryCount, isCreatingView, viewId]);

  const updateProgress = async (progress: number, pageData: PresentationPageData) => {
    if (!viewId) {
      console.log('No viewId available for progress update');
      return;
    }

    const isCompleted = progress >= 95;

    try {
      const { data: currentView } = await supabase
        .from('presentation_views')
        .select('*')
        .eq('id', viewId)
        .single();

      if (!currentView) {
        console.error('Could not find view record');
        return;
      }

      const updatedMetadata = {
        ...currentView.metadata,
        type: 'youtube',
        event_type: isCompleted ? 'video_completed' : 'video_progress',
        title: pageData.title,
        url: pageData.video_url,
        ip: ipLocationData?.ipAddress || 'unknown',
        location: ipLocationData?.location || 'Unknown Location',
        presentationUrl: pageData.presentationUrl,
        video_progress: progress,
        completed: isCompleted,
        id: viewId
      };

      const { error } = await supabase
        .from('presentation_views')
        .update({
          video_progress: progress,
          completed: isCompleted,
          ip_address: ipLocationData?.ipAddress || 'unknown',
          location: ipLocationData?.location || 'Unknown Location',
          metadata: updatedMetadata
        })
        .eq('id', viewId);

      if (error) {
        console.error('Error updating progress:', error);
        toast.error('Failed to update view progress');
      } else {
        console.log('Progress updated successfully:', { progress, viewId });
      }
    } catch (error) {
      console.error('Error in updateProgress:', error);
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

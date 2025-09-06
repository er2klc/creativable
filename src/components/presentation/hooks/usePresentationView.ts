
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
    if (isCreatingView || !pageData || !leadId || !pageData.id) {
      return;
    }

    if (!ipLocationData && retryCount < MAX_RETRIES) {
      setTimeout(() => setRetryCount(prev => prev + 1), 1000);
      return;
    }

    try {
      setIsCreatingView(true);

      const { data: existingView, error: fetchError } = await supabase
        .from('presentation_views')
        .select('*')
        .eq('page_id', pageData.id)
        .eq('ip_address', ipLocationData?.ipAddress || 'unknown')
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing view:', fetchError);
        toast.error('Failed to check existing view');
        return;
      }

      if (existingView) {
        setViewId(existingView.id);
        return;
      }

      const newViewId = crypto.randomUUID();
      const initialHistoryEntry = {
        timestamp: new Date().toISOString(),
        progress: 0,
        event_type: 'video_opened'
      };

      const viewData = {
        id: newViewId,
        page_id: pageData.id,
        lead_id: leadId,
        video_progress: 0,
        completed: false,
        ip_address: ipLocationData?.ipAddress || 'unknown',
        location: ipLocationData?.location || 'Unknown Location',
        location_metadata: ipLocationData || {},
        metadata: {
          type: 'youtube',
          event_type: 'video_opened',
          title: pageData.title,
          url: pageData.video_url,
          ip: ipLocationData?.ipAddress || 'unknown',
          location: ipLocationData?.location || 'Unknown Location',
          presentationUrl: (pageData as any).presentation_url || (pageData as any).presentationUrl || "",
          video_progress: 0,
          completed: false,
          id: newViewId
        },
        view_history: [initialHistoryEntry],
        viewed_at: new Date().toISOString()
      };

      console.log('Creating new view with data:', viewData);

      const { error: insertError } = await supabase
        .from('presentation_views')
        .insert([viewData]);

      if (insertError) {
        console.error('Error creating view:', insertError);
        toast.error('Failed to create view record');
        return;
      }

      setViewId(newViewId);

    } catch (error) {
      console.error('Error in createView:', error);
      toast.error('Failed to create presentation view');
    } finally {
      setIsCreatingView(false);
    }
  }, [leadId, ipLocationData, retryCount, isCreatingView]);

  const updateProgress = async (progress: number, pageData: PresentationPageData) => {
    if (!viewId) {
      console.log('No viewId available for progress update');
      return;
    }

    const isCompleted = progress >= 95;

    try {
      const historyEntry = {
        timestamp: new Date().toISOString(),
        progress: progress,
        event_type: isCompleted ? 'video_completed' : 'video_progress'
      };

      // First get the current view history
      const { data: currentView, error: fetchError } = await supabase
        .from('presentation_views')
        .select('view_history')
        .eq('id', viewId)
        .single();

      if (fetchError) {
        console.error('Error fetching current view:', fetchError);
        return;
      }

      // Append the new history entry to the existing array
      const viewHistory = currentView?.view_history;
      const updatedHistory = Array.isArray(viewHistory) ? [...viewHistory, historyEntry] : [historyEntry];

      const updates = {
        video_progress: progress,
        completed: isCompleted,
        ip_address: ipLocationData?.ipAddress || 'unknown',
        location: ipLocationData?.location || 'Unknown Location',
        location_metadata: ipLocationData || {},
        metadata: {
          type: 'youtube',
          event_type: isCompleted ? 'video_completed' : 'video_progress',
          title: pageData.title,
          url: pageData.video_url,
          ip: ipLocationData?.ipAddress || 'unknown',
          location: ipLocationData?.location || 'Unknown Location',
          presentationUrl: (pageData as any).presentation_url || (pageData as any).presentationUrl || "",
          video_progress: progress,
          completed: isCompleted,
          id: viewId
        },
        view_history: updatedHistory,
        viewed_at: new Date().toISOString(),
        last_progress_update: new Date().toISOString()
      };

      console.log('Updating view with data:', { viewId, updates });

      const { error: updateError } = await supabase
        .from('presentation_views')
        .update(updates)
        .eq('id', viewId);

      if (updateError) {
        console.error('Error updating progress:', updateError);
        toast.error('Failed to update view progress');
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

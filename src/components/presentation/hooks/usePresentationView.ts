
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
    if (isCreatingView) {
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
      console.log('Checking for existing view...');

      // First check if there's an existing view for this IP
      const { data: existingView } = await supabase
        .from('presentation_views')
        .select('*')
        .eq('page_id', pageData.id)
        .eq('ip_address', ipLocationData?.ipAddress || 'unknown')
        .maybeSingle();

      if (existingView) {
        console.log('Found existing view:', existingView);
        setViewId(existingView.id);
        return;
      }

      console.log('Creating new view...');
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
        },
        view_history: [initialHistoryEntry]
      };

      const { error: viewError } = await supabase
        .from('presentation_views')
        .insert([viewData]);

      if (viewError) {
        if (viewError.code === '23505') { // Unique constraint violation
          console.log('Concurrent view creation detected, fetching existing view...');
          const { data: concurrentView } = await supabase
            .from('presentation_views')
            .select('*')
            .eq('page_id', pageData.id)
            .eq('ip_address', ipLocationData?.ipAddress || 'unknown')
            .maybeSingle();

          if (concurrentView) {
            setViewId(concurrentView.id);
            return;
          }
        }
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
  }, [leadId, ipLocationData, retryCount, isCreatingView]);

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

      const historyEntry = {
        timestamp: new Date().toISOString(),
        progress: progress,
        event_type: isCompleted ? 'video_completed' : 'video_progress'
      };

      const currentHistory = Array.isArray(currentView.view_history) 
        ? currentView.view_history 
        : [];

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
          metadata: updatedMetadata,
          view_history: [...currentHistory, historyEntry]
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

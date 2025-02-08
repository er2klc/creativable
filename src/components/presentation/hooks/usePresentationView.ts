
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIPLocation } from './useIPLocation';
import { toast } from 'sonner';
import { PresentationPageData } from '../types';

export const usePresentationView = (pageId: string | undefined, leadId: string | undefined) => {
  const [viewId, setViewId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCreatingView, setIsCreatingView] = useState(false);
  const progressQueueRef = useRef<{ progress: number; timestamp: string }[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ipLocationData = useIPLocation();
  const MAX_RETRIES = 3;
  const UPDATE_INTERVAL = 5000; // 5 seconds

  // Cleanup function for the update timeout
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

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

      const { data: existingView, error: fetchError } = await supabase
        .from('presentation_views')
        .select('*')
        .eq('page_id', pageData.id)
        .eq('ip_address', ipLocationData?.ipAddress || 'unknown')
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing view:', fetchError);
        return;
      }

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

      // Create a detailed location object
      const locationMetadata = {
        city: ipLocationData?.city || '',
        region: ipLocationData?.region || '',
        country: ipLocationData?.country || '',
        countryCode: ipLocationData?.countryCode || '',
        timezone: ipLocationData?.timezone || ''
      };

      const viewData = {
        id: newViewId,
        page_id: pageData.id,
        lead_id: leadId,
        video_progress: 0,
        completed: false,
        ip_address: ipLocationData?.ipAddress || 'unknown',
        location: ipLocationData?.location || 'Unknown Location',
        location_metadata: locationMetadata,
        metadata: {
          type: 'youtube',
          event_type: 'video_opened',
          title: pageData.title,
          url: pageData.video_url,
          id: newViewId,
          view_id: newViewId,
          ip: ipLocationData?.ipAddress || 'unknown',
          location: ipLocationData?.location || 'Unknown Location',
          location_metadata: locationMetadata,
          presentationUrl: pageData.presentationUrl,
          video_progress: 0,
          completed: false
        },
        view_history: [initialHistoryEntry]
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
  }, [leadId, ipLocationData, retryCount, isCreatingView]);

  const scheduleProgressUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      if (progressQueueRef.current.length === 0) return;

      const latestProgress = progressQueueRef.current[progressQueueRef.current.length - 1].progress;
      const progressHistory = [...progressQueueRef.current];
      progressQueueRef.current = []; // Clear the queue

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

        const isCompleted = latestProgress >= 95;
        const currentHistory = Array.isArray(currentView.view_history) 
          ? currentView.view_history 
          : [];

        const updatedMetadata = {
          ...currentView.metadata,
          type: 'youtube',
          event_type: isCompleted ? 'video_completed' : 'video_progress',
          video_progress: latestProgress,
          completed: isCompleted
        };

        const { error } = await supabase
          .from('presentation_views')
          .update({
            video_progress: latestProgress,
            completed: isCompleted,
            metadata: updatedMetadata,
            view_history: [...currentHistory, ...progressHistory]
          })
          .eq('id', viewId);

        if (error) {
          console.error('Error updating progress:', error);
          toast.error('Failed to update view progress');
        } else {
          console.log('Progress batch updated successfully:', { latestProgress, viewId });
        }
      } catch (error) {
        console.error('Error in batch progress update:', error);
        toast.error('Failed to update progress');
      }
    }, UPDATE_INTERVAL);
  }, [viewId]);

  const updateProgress = useCallback((progress: number, pageData: PresentationPageData) => {
    if (!viewId) {
      console.log('No viewId available for progress update');
      return;
    }

    // Add progress update to queue
    progressQueueRef.current.push({
      timestamp: new Date().toISOString(),
      progress: progress
    });

    // Schedule the next batch update
    scheduleProgressUpdate();
  }, [viewId, scheduleProgressUpdate]);

  return {
    viewId,
    createView,
    updateProgress,
    isCreatingView
  };
};

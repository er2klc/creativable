
import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PresentationPageData } from '../types';

export const useProgressUpdate = (viewId: string | null) => {
  const progressQueueRef = useRef<{ progress: number; timestamp: string }[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressRef = useRef<number>(0);
  const UPDATE_INTERVAL = 2000; // 2 seconds

  const scheduleProgressUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      if (progressQueueRef.current.length === 0) return;

      const latestProgress = progressQueueRef.current[progressQueueRef.current.length - 1].progress;
      
      console.log("Processing progress update:", {
        viewId,
        latestProgress,
        lastProgress: lastProgressRef.current,
        queueLength: progressQueueRef.current.length,
        currentTime: new Date().toISOString()
      });
      
      // Only update if progress has changed significantly (more than 0.5%)
      if (Math.abs(latestProgress - lastProgressRef.current) < 0.5) {
        progressQueueRef.current = [];
        return;
      }
      
      lastProgressRef.current = latestProgress;
      const progressHistory = [...progressQueueRef.current];
      progressQueueRef.current = []; // Clear the queue

      try {
        const { data: currentView, error: viewError } = await supabase
          .from('presentation_views')
          .select('*')
          .eq('id', viewId)
          .single();

        if (viewError) {
          throw viewError;
        }

        if (!currentView) {
          console.error('Could not find view record');
          return;
        }

        const roundedProgress = Math.round(latestProgress);
        const isCompleted = roundedProgress >= 95;
        const currentHistory = Array.isArray(currentView.view_history) 
          ? currentView.view_history 
          : [];

        console.log("Updating view progress:", {
          viewId,
          roundedProgress,
          isCompleted,
          currentHistoryLength: currentHistory.length,
          currentTime: new Date().toISOString()
        });

        const updatedMetadata = {
          ...currentView.metadata,
          type: 'youtube',
          event_type: isCompleted ? 'video_completed' : 'video_progress',
          video_progress: roundedProgress,
          completed: isCompleted,
          view_id: viewId,
          id: viewId
        };

        const { error: updateError } = await supabase
          .from('presentation_views')
          .update({
            video_progress: roundedProgress,
            completed: isCompleted,
            metadata: updatedMetadata,
            view_history: [...currentHistory, ...progressHistory],
            last_progress_update: new Date().toISOString()
          })
          .eq('id', viewId);

        if (updateError) {
          console.error('Error updating progress:', updateError);
          toast.error('Failed to update view progress');
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

    console.log("Adding progress update to queue:", { 
      progress, 
      viewId,
      timestamp: new Date().toISOString()
    });

    // Add progress update to queue
    progressQueueRef.current.push({
      timestamp: new Date().toISOString(),
      progress: progress
    });

    // Schedule the next batch update
    scheduleProgressUpdate();
  }, [viewId, scheduleProgressUpdate]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return { updateProgress };
};

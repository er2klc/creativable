
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PresentationPageData } from '../types';

export const useProgressUpdate = (viewId: string | null) => {
  const progressQueueRef = useRef<{ progress: number; timestamp: string }[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const UPDATE_INTERVAL = 2000; // 2 seconds for more frequent updates

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

  return { updateProgress };
};

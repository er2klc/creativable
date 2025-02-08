import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIPLocation } from './useIPLocation';
import { useProgressUpdate } from './useProgressUpdate';
import { toast } from 'sonner';
import { PresentationPageData } from '../types';

export const usePresentationView = (pageId: string | undefined, leadId: string | undefined) => {
  const [viewId, setViewId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCreatingView, setIsCreatingView] = useState(false);
  const ipLocationData = useIPLocation();
  const { updateProgress } = useProgressUpdate(viewId);
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

  // Cleanup function for the update timeout
  useEffect(() => {
    return () => {
      // Cleanup handled in useProgressUpdate
    };
  }, []);

  return {
    viewId,
    createView,
    updateProgress,
    isCreatingView
  };
};

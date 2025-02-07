
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PresentationPageData } from '../types';

export const usePresentationData = (pageId: string | undefined) => {
  const [pageData, setPageData] = useState<PresentationPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPresentationPage = async () => {
    if (!pageId) {
      setError("Invalid URL");
      setIsLoading(false);
      return;
    }

    try {
      const { data: pageData, error: pageError } = await supabase
        .from('presentation_pages')
        .select(`
          id,
          title,
          video_url,
          expires_at,
          is_url_active,
          user_id,
          lead:lead_id (
            id,
            name,
            social_media_profile_image_url
          ),
          creator:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('slug', pageId)
        .maybeSingle();

      if (pageError) {
        console.error('Error loading presentation page:', pageError);
        setError("Presentation not found");
        setIsLoading(false);
        return;
      }

      if (!pageData) {
        setError("Presentation not found");
        setIsLoading(false);
        return;
      }

      if (pageData.expires_at && new Date(pageData.expires_at) < new Date()) {
        setError("This presentation has expired");
        setIsLoading(false);
        return;
      }

      if (!pageData.is_url_active) {
        setError("This presentation is no longer available");
        setIsLoading(false);
        return;
      }

      const formattedPageData: PresentationPageData = {
        id: pageData.id,
        title: pageData.title,
        video_url: pageData.video_url,
        lead_id: pageData.lead.id,
        lead: {
          name: pageData.lead?.name || '',
          social_media_profile_image_url: pageData.lead?.social_media_profile_image_url || ''
        },
        user: {
          profiles: {
            display_name: pageData.creator?.display_name || '',
            avatar_url: pageData.creator?.avatar_url || ''
          }
        }
      };

      setPageData(formattedPageData);
      return formattedPageData;
    } catch (error) {
      console.error('Error:', error);
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pageData,
    isLoading,
    error,
    loadPresentationPage
  };
};

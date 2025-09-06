import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PresentationPageData } from '../types';
import type { Tables } from "@/integrations/supabase/types";

type PageRow = Pick<Tables<"presentation_pages">, "id"|"title"|"video_url"|"expires_at"|"is_url_active"|"user_id"|"lead_id">;
type ProfileRow = Pick<Tables<"profiles">, "display_name"|"avatar_url">;
type LeadRow = Pick<Tables<"leads">, "id"|"name"|"social_media_profile_image_url">;

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
      // Fetch page data
      const { data: page, error: pageError } = await supabase
        .from('presentation_pages')
        .select("id,title,video_url,expires_at,is_url_active,user_id,lead_id")
        .eq('slug', pageId)
        .single<PageRow>();

      if (pageError) {
        console.error('Error loading presentation page:', pageError);
        setError("Presentation not found");
        setIsLoading(false);
        return;
      }

      if (!page) {
        setError("Presentation not found");
        setIsLoading(false);
        return;
      }

      if (page.expires_at && new Date(page.expires_at) < new Date()) {
        setError("This presentation has expired");
        setIsLoading(false);
        return;
      }

      if (!page.is_url_active) {
        setError("This presentation is no longer available");
        setIsLoading(false);
        return;
      }

      // Fetch creator profile
      let creator: ProfileRow | null = null;
      if (page.user_id) {
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("display_name,avatar_url")
          .eq("id", page.user_id)
          .single<ProfileRow>();
        if (!profErr) creator = prof;
      }

      // Fetch lead data  
      let lead: LeadRow | null = null;
      if (page.lead_id) {
        const { data: leadData, error: leadErr } = await supabase
          .from("leads")
          .select("id,name,social_media_profile_image_url")
          .eq("id", page.lead_id)
          .single<LeadRow>();
        if (!leadErr) lead = leadData;
      }

      const formattedPageData: PresentationPageData = {
        id: page.id,
        title: page.title,
        video_url: page.video_url,
        lead_id: page.lead_id,
        lead: {
          name: lead?.name || '',
          social_media_profile_image_url: lead?.social_media_profile_image_url || ''
        },
        user: {
          profiles: {
            display_name: creator?.display_name || '',
            avatar_url: creator?.avatar_url || ''
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
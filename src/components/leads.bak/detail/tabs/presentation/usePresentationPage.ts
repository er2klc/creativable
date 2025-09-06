
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PresentationPage {
  id: string;
  lead_id: string;
  user_id: string;
  title: string;
  video_url?: string;
  document_url?: string;
  slug: string;
  created_at: string;
  expires_at?: string;
  is_url_active: boolean;
  resource_type?: 'youtube' | 'zoom' | 'document';
  resource_data?: any;
}

export function usePresentationPage(leadId: string, resourceType: string) {
  const { data = [], isLoading, error } = useQuery<PresentationPage[]>({
    queryKey: ['presentation-pages', leadId, resourceType],
    queryFn: async () => {
      // In einer echten Implementierung würden wir hier die Präsentationsseiten laden
      // Für dieses Beispiel geben wir eine leere Liste zurück
      return [];
    },
  });

  return {
    recentPages: data,
    isLoading,
    error
  };
}

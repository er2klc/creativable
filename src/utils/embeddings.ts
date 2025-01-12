import { supabase } from "@/integrations/supabase/client";

export type ContentType = 'personal' | 'team' | 'platform';

export const searchSimilarContent = async (query: string, contentType: ContentType, teamId?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('search-embeddings', {
      body: JSON.stringify({
        query,
        contentType,
        teamId
      })
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching similar content:', error);
    throw error;
  }
};
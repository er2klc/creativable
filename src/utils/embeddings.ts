import { supabase } from "@/integrations/supabase/client";

export type ContentType = 'personal' | 'team' | 'platform';

export const generateEmbeddings = async (
  contentType: ContentType,
  contentId: string,
  content: string,
  metadata: Record<string, any> = {},
  teamId?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('manage-embeddings', {
      body: JSON.stringify({
        contentType,
        contentId,
        content,
        metadata,
        teamId
      }),
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};

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
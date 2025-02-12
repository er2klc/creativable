
import { supabase } from "@/integrations/supabase/client";

export type ContentType = 'personal' | 'team' | 'platform' | 'lead' | 'document' | 'settings';

export interface ProcessingOptions {
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, any>;
}

export const processContentForEmbeddings = async (
  content: string,
  contentType: ContentType,
  options: ProcessingOptions = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase.functions.invoke('process-context-embeddings', {
      body: {
        userId: user.id,
        contentType,
        content,
        metadata: options.metadata || {},
        sourceType: options.sourceType,
        sourceId: options.sourceId
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error processing content for embeddings:', error);
    throw error;
  }
};

export const searchSimilarContent = async (query: string, contentType: ContentType, teamId?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase.rpc('match_similar_content', {
      query_text: query,
      match_threshold: 0.7,
      match_count: 5,
      user_id: user.id,
      content_type: contentType
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching similar content:', error);
    throw error;
  }
};

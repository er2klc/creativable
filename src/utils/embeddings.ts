import { supabase } from "@/integrations/supabase/client";

export const generateEmbeddings = async (
  teamId: string,
  contentType: 'video_transcript' | 'learning_content' | 'document',
  contentId: string,
  content: string,
  metadata: Record<string, any> = {}
) => {
  try {
    const { data, error } = await supabase.functions.invoke('manage-team-embeddings', {
      body: JSON.stringify({
        teamId,
        contentType,
        contentId,
        content,
        metadata
      }),
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};

export const searchSimilarContent = async (query: string, teamId: string) => {
  try {
    const { data: { embedding } } = await (await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-3-small'
      }),
    })).json();

    const { data, error } = await supabase
      .rpc('match_team_content', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 5,
        team_id: teamId
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching similar content:', error);
    throw error;
  }
};
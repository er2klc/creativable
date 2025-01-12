CREATE OR REPLACE FUNCTION match_team_content(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  team_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  content_type text,
  content_id uuid,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tce.id,
    tce.content,
    1 - (tce.embedding <=> query_embedding) as similarity,
    tce.content_type,
    tce.content_id,
    tce.metadata
  FROM team_content_embeddings tce
  WHERE tce.team_id = team_id
  AND 1 - (tce.embedding <=> query_embedding) > match_threshold
  ORDER BY tce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
CREATE OR REPLACE FUNCTION match_content(
  query_embedding vector,
  match_threshold double precision,
  match_count integer,
  content_type text
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity double precision,
  metadata jsonb,
  team_id uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.content,
    1 - (ce.embedding <=> query_embedding) as similarity,
    ce.metadata,
    ce.team_id
  FROM content_embeddings ce
  WHERE 
    ce.content_type = content_type
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
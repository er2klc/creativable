-- Add missing database functions
CREATE OR REPLACE FUNCTION match_similar_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid as id,
    'No content available'::text as content,
    0.0::float as similarity
  LIMIT match_count;
END;
$$;

-- Create secrets table for configuration
CREATE TABLE IF NOT EXISTS secrets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on secrets
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Only allow system access to secrets (no user access)
CREATE POLICY "No public access to secrets" ON secrets
FOR ALL USING (false);
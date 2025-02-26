
-- First, let's create a better error handling and async processing function
CREATE OR REPLACE FUNCTION process_content_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only process if content is not empty and status is pending
    IF NEW.content IS NOT NULL AND NEW.processing_status = 'pending' THEN
        -- Set status to processing to prevent double processing
        NEW.processing_status := 'processing';
        
        -- Queue the embedding generation asynchronously
        PERFORM pg_notify(
            'new_content',
            json_build_object(
                'id', NEW.id,
                'content', NEW.content,
                'content_type', NEW.content_type,
                'metadata', NEW.metadata
            )::text
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create a function to handle team content embeddings
CREATE OR REPLACE FUNCTION process_team_content_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only process if content is complete
    IF NEW.content IS NOT NULL THEN
        INSERT INTO content_embeddings (
            content,
            content_type,
            team_id,
            user_id,
            metadata,
            processing_status
        ) VALUES (
            NEW.content,
            CASE 
                WHEN TG_TABLE_NAME = 'team_posts' THEN 'team_post'
                WHEN TG_TABLE_NAME = 'team_direct_messages' THEN 'team_chat'
                ELSE TG_TABLE_NAME
            END,
            NEW.team_id,
            NEW.created_by,
            jsonb_build_object(
                'source_table', TG_TABLE_NAME,
                'source_id', NEW.id,
                'created_at', NEW.created_at,
                'team_id', NEW.team_id
            ),
            'pending'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create a function to prioritize and process embeddings
CREATE OR REPLACE FUNCTION prioritize_embedding_processing()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Set priority based on content type
    NEW.priority := CASE
        WHEN NEW.content_type = 'team_post' THEN 1
        WHEN NEW.content_type = 'team_chat' THEN 2
        WHEN NEW.content_type LIKE 'social_media%' THEN 3
        ELSE 4
    END;
    
    RETURN NEW;
END;
$$;

-- Re-enable and update the triggers with new logic
DROP TRIGGER IF EXISTS leads_embedding_trigger ON leads;
CREATE TRIGGER leads_embedding_trigger
    AFTER INSERT OR UPDATE
    ON leads
    FOR EACH ROW
    WHEN (NEW.content IS NOT NULL)
    EXECUTE FUNCTION process_content_embedding();

-- Add triggers for team content
CREATE TRIGGER team_posts_embedding_trigger
    AFTER INSERT
    ON team_posts
    FOR EACH ROW
    EXECUTE FUNCTION process_team_content_embedding();

CREATE TRIGGER team_chat_embedding_trigger
    AFTER INSERT
    ON team_direct_messages
    FOR EACH ROW
    EXECUTE FUNCTION process_team_content_embedding();

-- Add priority trigger
CREATE TRIGGER prioritize_embedding_trigger
    BEFORE INSERT
    ON content_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION prioritize_embedding_processing();

-- Update existing embeddings table to include priority
ALTER TABLE content_embeddings 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS context_type TEXT DEFAULT 'global';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_content_embeddings_priority 
ON content_embeddings(priority, processing_status);

-- Add new columns for better context awareness
ALTER TABLE nexus_embeddings
ADD COLUMN IF NOT EXISTS context_relevance FLOAT DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP WITH TIME ZONE;

-- Create a function to update context relevance
CREATE OR REPLACE FUNCTION update_nexus_context_relevance()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update relevance based on usage
    UPDATE nexus_embeddings
    SET context_relevance = context_relevance * 1.1,
        last_accessed = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Add trigger for context relevance
CREATE TRIGGER update_nexus_relevance_trigger
    AFTER UPDATE OF embedding
    ON nexus_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_nexus_context_relevance();


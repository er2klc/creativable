
-- First, let's create a better error handling and async processing function
CREATE OR REPLACE FUNCTION process_content_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Skip embedding creation for phase change notes
    IF NEW.metadata->>'type' = 'phase_change' THEN
        -- For phase change notes, still update the status but don't process
        NEW.processing_status := 'completed';
        RETURN NEW;
    END IF;

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

-- Recreate the trigger with the correct timing
DROP TRIGGER IF EXISTS leads_embedding_trigger ON leads;
CREATE TRIGGER leads_embedding_trigger
    AFTER INSERT OR UPDATE
    ON leads
    FOR EACH ROW
    WHEN (NEW.content IS NOT NULL)
    EXECUTE FUNCTION process_content_embedding();

-- Ensure all other related functions maintain their permissions
ALTER FUNCTION process_content_embedding() SECURITY DEFINER;

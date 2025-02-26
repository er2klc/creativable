
-- First, let's drop the existing trigger
DROP TRIGGER IF EXISTS leads_embedding_trigger ON leads;

-- Update the process_content_embedding function to properly handle different tables
CREATE OR REPLACE FUNCTION process_content_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only process content from the notes table
    IF TG_TABLE_NAME = 'leads' THEN
        -- For leads, just return without creating embeddings
        RETURN NEW;
    END IF;

    -- Handle notes table specifically
    IF TG_TABLE_NAME = 'notes' THEN
        -- Skip embedding creation for phase change notes
        IF NEW.metadata->>'type' = 'phase_change' THEN
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
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger only for notes table
CREATE TRIGGER notes_embedding_trigger
    BEFORE INSERT OR UPDATE
    ON notes
    FOR EACH ROW
    EXECUTE FUNCTION process_content_embedding();

-- Ensure proper permissions
ALTER FUNCTION process_content_embedding() SECURITY DEFINER;


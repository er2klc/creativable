-- Add foreign key constraints for team_direct_messages table
-- First check if constraints already exist and drop them if needed
DO $$ 
BEGIN
    -- Drop existing constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'team_direct_messages_sender_id_fkey' 
               AND table_name = 'team_direct_messages') THEN
        ALTER TABLE public.team_direct_messages DROP CONSTRAINT team_direct_messages_sender_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'team_direct_messages_receiver_id_fkey' 
               AND table_name = 'team_direct_messages') THEN
        ALTER TABLE public.team_direct_messages DROP CONSTRAINT team_direct_messages_receiver_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'team_direct_messages_team_id_fkey' 
               AND table_name = 'team_direct_messages') THEN
        ALTER TABLE public.team_direct_messages DROP CONSTRAINT team_direct_messages_team_id_fkey;
    END IF;
END $$;

-- Add the foreign key constraints
ALTER TABLE public.team_direct_messages 
ADD CONSTRAINT team_direct_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_direct_messages 
ADD CONSTRAINT team_direct_messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_direct_messages 
ADD CONSTRAINT team_direct_messages_team_id_fkey 
FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;
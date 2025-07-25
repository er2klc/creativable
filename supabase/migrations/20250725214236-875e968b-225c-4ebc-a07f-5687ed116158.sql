-- Add foreign key constraints to team_direct_messages table
ALTER TABLE public.team_direct_messages 
ADD CONSTRAINT team_direct_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_direct_messages 
ADD CONSTRAINT team_direct_messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_direct_messages 
ADD CONSTRAINT team_direct_messages_team_id_fkey 
FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;
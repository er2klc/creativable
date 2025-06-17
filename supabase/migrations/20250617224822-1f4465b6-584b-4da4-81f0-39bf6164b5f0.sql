
-- Add missing columns to settings table
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS registration_step INTEGER DEFAULT 1;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Add missing columns to notifications table
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_page TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create get_user_teams function
CREATE OR REPLACE FUNCTION public.get_user_teams(uid uuid)
 RETURNS SETOF teams
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if user is super admin
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = uid 
    AND is_super_admin = true
  ) THEN
    -- Return all teams for super admin
    RETURN QUERY SELECT * FROM teams ORDER BY order_index ASC;
  ELSE
    -- Return only teams where user is creator or member
    RETURN QUERY
    SELECT DISTINCT t.*
    FROM teams t
    WHERE t.created_by = uid
    OR EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.team_id = t.id 
      AND tm.user_id = uid
    )
    ORDER BY t.order_index ASC;
  END IF;
END;
$function$;

-- Insert initial changelog entry
INSERT INTO public.changelog_entries (version, title, description, type, status) 
VALUES ('1.0.0', 'Initial Release', 'Welcome to the platform!', 'feature', 'released')
ON CONFLICT DO NOTHING;

-- Add missing RLS policies for notifications (drop if exists first)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;  
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Fix foreign key constraint for team_direct_messages if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_direct_messages_sender_id_fkey'
    AND table_name = 'team_direct_messages'
  ) THEN
    ALTER TABLE public.team_direct_messages 
    ADD CONSTRAINT team_direct_messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_direct_messages_receiver_id_fkey'
    AND table_name = 'team_direct_messages'
  ) THEN
    ALTER TABLE public.team_direct_messages 
    ADD CONSTRAINT team_direct_messages_receiver_id_fkey 
    FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END
$$;


-- Create emails table for email management
CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID,
  message_id TEXT UNIQUE NOT NULL,
  subject TEXT,
  sender TEXT,
  recipient TEXT,
  content TEXT,
  html_content TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  read BOOLEAN DEFAULT FALSE,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_folders table
CREATE TABLE public.email_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES public.email_folders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_events table for calendar
CREATE TABLE public.team_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_admin_only BOOLEAN DEFAULT FALSE,
  is_90_day_run BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT,
  recurring_day_of_week INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create presentation_pages table
CREATE TABLE public.presentation_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create presentation_views table
CREATE TABLE public.presentation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.presentation_pages(id) ON DELETE CASCADE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table for file management
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vision_board_images table
CREATE TABLE public.vision_board_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shortcuts table
CREATE TABLE public.shortcuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  shortcut_key TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_media_posts table
CREATE TABLE public.social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  post_type TEXT NOT NULL,
  content TEXT,
  url TEXT,
  media_urls TEXT[],
  media_type TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create changelog_entries table
CREATE TABLE public.changelog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'feature',
  status TEXT DEFAULT 'released',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_board_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortcuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for emails
CREATE POLICY "Users can manage own emails" ON public.emails
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for email_folders
CREATE POLICY "Users can manage own email folders" ON public.email_folders
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for team_events
CREATE POLICY "Users can view team events of their teams" ON public.team_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.team_id = team_events.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create team events" ON public.team_events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can update their events" ON public.team_events
  FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for presentation_pages
CREATE POLICY "Users can manage own presentation pages" ON public.presentation_pages
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for presentation_views (no RLS - public access needed)
CREATE POLICY "Anyone can view presentation views" ON public.presentation_views
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create presentation views" ON public.presentation_views
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for documents
CREATE POLICY "Users can manage own documents" ON public.documents
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for vision_board_images
CREATE POLICY "Users can manage own vision board images" ON public.vision_board_images
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for shortcuts
CREATE POLICY "Users can manage own shortcuts" ON public.shortcuts
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for social_media_posts
CREATE POLICY "Users can manage own social media posts" ON public.social_media_posts
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for changelog_entries (public read access)
CREATE POLICY "Anyone can read changelog entries" ON public.changelog_entries
  FOR SELECT USING (true);

-- Only admins can manage changelog entries (will need admin function)
CREATE POLICY "Admins can manage changelog entries" ON public.changelog_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.is_super_admin = true)
    )
  );

-- Add foreign key constraint for email folders
ALTER TABLE public.emails ADD CONSTRAINT emails_folder_id_fkey 
  FOREIGN KEY (folder_id) REFERENCES public.email_folders(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_pipeline_phase ON public.leads(pipeline_id, phase_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_lead_id ON public.tasks(lead_id);
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_lead_id ON public.notes(lead_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_lead_id ON public.messages(lead_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_emails_user_id ON public.emails(user_id);
CREATE INDEX idx_emails_folder_id ON public.emails(folder_id);
CREATE INDEX idx_social_media_posts_lead_id ON public.social_media_posts(lead_id);

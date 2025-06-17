
-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Chatbot/AI-System Tabellen
CREATE TABLE public.chatbot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  openai_api_key TEXT,
  model TEXT DEFAULT 'gpt-3.5-turbo',
  temperature NUMERIC DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  source_type TEXT NOT NULL,
  source_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.nexus_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  source_type TEXT NOT NULL,
  source_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Elevate-Modul Tabellen (getrennt von allgemeinen platforms)
CREATE TABLE public.elevate_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.elevate_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID REFERENCES public.elevate_platforms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.elevate_user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID REFERENCES public.elevate_platforms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_type TEXT DEFAULT 'user',
  granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform_id, user_id)
);

CREATE TABLE public.elevate_team_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID REFERENCES public.elevate_platforms(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform_id, team_id)
);

-- Zusätzliche Elevate-Tabellen basierend auf dem Code
CREATE TABLE public.elevate_lerninhalte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.elevate_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  submodule_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.elevate_lerninhalte_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lerninhalte_id UUID REFERENCES public.elevate_lerninhalte(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Auth Status für LinkedIn Integration
CREATE TABLE public.platform_auth_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT FALSE,
  access_token TEXT,
  refresh_token TEXT,
  auth_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Social Media Scan History
CREATE TABLE public.social_media_scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  search_query TEXT,
  leads_found INTEGER DEFAULT 0,
  scan_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevate_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevate_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevate_user_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevate_team_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevate_lerninhalte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevate_lerninhalte_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_auth_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_scan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own chatbot settings" ON public.chatbot_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own content embeddings" ON public.content_embeddings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own nexus embeddings" ON public.nexus_embeddings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view accessible elevate platforms" ON public.elevate_platforms
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.elevate_user_access 
      WHERE platform_id = elevate_platforms.id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.elevate_team_access eta
      JOIN public.team_members tm ON eta.team_id = tm.team_id
      WHERE eta.platform_id = elevate_platforms.id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create elevate platforms" ON public.elevate_platforms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Platform creators can update their platforms" ON public.elevate_platforms
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Platform creators can delete their platforms" ON public.elevate_platforms
  FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view accessible elevate modules" ON public.elevate_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.elevate_platforms ep
      WHERE ep.id = elevate_modules.platform_id AND (
        auth.uid() = ep.created_by OR
        EXISTS (
          SELECT 1 FROM public.elevate_user_access 
          WHERE platform_id = ep.id AND user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.elevate_team_access eta
          JOIN public.team_members tm ON eta.team_id = tm.team_id
          WHERE eta.platform_id = ep.id AND tm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Platform creators can manage modules" ON public.elevate_modules
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can manage platform access" ON public.elevate_user_access
  FOR ALL USING (
    auth.uid() = user_id OR 
    auth.uid() = granted_by OR
    EXISTS (
      SELECT 1 FROM public.elevate_platforms ep
      WHERE ep.id = elevate_user_access.platform_id AND ep.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage team access" ON public.elevate_team_access
  FOR ALL USING (
    auth.uid() = granted_by OR
    EXISTS (
      SELECT 1 FROM public.elevate_platforms ep
      WHERE ep.id = elevate_team_access.platform_id AND ep.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view accessible lerninhalte" ON public.elevate_lerninhalte
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.elevate_modules em
      JOIN public.elevate_platforms ep ON em.platform_id = ep.id
      WHERE em.id = elevate_lerninhalte.module_id AND (
        auth.uid() = ep.created_by OR
        EXISTS (
          SELECT 1 FROM public.elevate_user_access 
          WHERE platform_id = ep.id AND user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.elevate_team_access eta
          JOIN public.team_members tm ON eta.team_id = tm.team_id
          WHERE eta.platform_id = ep.id AND tm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Platform creators can manage lerninhalte" ON public.elevate_lerninhalte
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can view accessible documents" ON public.elevate_lerninhalte_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.elevate_lerninhalte el
      JOIN public.elevate_modules em ON el.module_id = em.id
      JOIN public.elevate_platforms ep ON em.platform_id = ep.id
      WHERE el.id = elevate_lerninhalte_documents.lerninhalte_id AND (
        auth.uid() = ep.created_by OR
        EXISTS (
          SELECT 1 FROM public.elevate_user_access 
          WHERE platform_id = ep.id AND user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.elevate_team_access eta
          JOIN public.team_members tm ON eta.team_id = tm.team_id
          WHERE eta.platform_id = ep.id AND tm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Platform creators can manage documents" ON public.elevate_lerninhalte_documents
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can manage own platform auth status" ON public.platform_auth_status
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own scan history" ON public.social_media_scan_history
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_chatbot_settings_user_id ON public.chatbot_settings(user_id);
CREATE INDEX idx_content_embeddings_user_id ON public.content_embeddings(user_id);
CREATE INDEX idx_nexus_embeddings_user_id ON public.nexus_embeddings(user_id);
CREATE INDEX idx_elevate_platforms_created_by ON public.elevate_platforms(created_by);
CREATE INDEX idx_elevate_modules_platform_id ON public.elevate_modules(platform_id);
CREATE INDEX idx_elevate_user_access_platform_user ON public.elevate_user_access(platform_id, user_id);
CREATE INDEX idx_elevate_team_access_platform_team ON public.elevate_team_access(platform_id, team_id);
CREATE INDEX idx_platform_auth_status_user_platform ON public.platform_auth_status(user_id, platform);

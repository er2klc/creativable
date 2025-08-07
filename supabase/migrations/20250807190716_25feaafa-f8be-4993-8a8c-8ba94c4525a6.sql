-- Restore missing collaboration and content tables used by the app
-- Safe helpers and triggers

-- 1) Generic updated_at trigger function (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- 2) Helper to check team membership for a given post (avoids recursion in RLS)
CREATE OR REPLACE FUNCTION public.is_team_member_of_post(post_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.team_posts tp
    JOIN public.team_members tm ON tm.team_id = tp.team_id
    WHERE tp.id = post_uuid AND tm.user_id = user_uuid
  );
END;
$$;

-- =========================
-- Team Categories
-- =========================
CREATE TABLE IF NOT EXISTS public.team_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  is_public boolean DEFAULT true,
  icon text,
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_team_categories_team FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE
);

ALTER TABLE public.team_categories ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_categories' AND policyname = 'Team members can select categories'
  ) THEN
    CREATE POLICY "Team members can select categories" ON public.team_categories
    FOR SELECT USING (public.is_team_member(team_id, auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_categories' AND policyname = 'Team members can insert categories'
  ) THEN
    CREATE POLICY "Team members can insert categories" ON public.team_categories
    FOR INSERT WITH CHECK (public.is_team_member(team_id, auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_categories' AND policyname = 'Team members can update categories'
  ) THEN
    CREATE POLICY "Team members can update categories" ON public.team_categories
    FOR UPDATE USING (public.is_team_member(team_id, auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_categories' AND policyname = 'Team members can delete categories'
  ) THEN
    CREATE POLICY "Team members can delete categories" ON public.team_categories
    FOR DELETE USING (public.is_team_member(team_id, auth.uid()));
  END IF;
END $$;

-- Trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_team_categories_updated_at
    BEFORE UPDATE ON public.team_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- =========================
-- Team Category Settings
-- =========================
CREATE TABLE IF NOT EXISTS public.team_category_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  size text DEFAULT 'small',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_team_category_settings_category FOREIGN KEY (category_id) REFERENCES public.team_categories(id) ON DELETE CASCADE
);

ALTER TABLE public.team_category_settings ENABLE ROW LEVEL SECURITY;

-- Policies (authorize via parent category's team)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_category_settings' AND policyname = 'Team members can select category settings'
  ) THEN
    CREATE POLICY "Team members can select category settings" ON public.team_category_settings
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.team_categories tc
        WHERE tc.id = team_category_settings.category_id
          AND public.is_team_member(tc.team_id, auth.uid())
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_category_settings' AND policyname = 'Team members can insert category settings'
  ) THEN
    CREATE POLICY "Team members can insert category settings" ON public.team_category_settings
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.team_categories tc
        WHERE tc.id = team_category_settings.category_id
          AND public.is_team_member(tc.team_id, auth.uid())
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_category_settings' AND policyname = 'Team members can update category settings'
  ) THEN
    CREATE POLICY "Team members can update category settings" ON public.team_category_settings
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.team_categories tc
        WHERE tc.id = team_category_settings.category_id
          AND public.is_team_member(tc.team_id, auth.uid())
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_category_settings' AND policyname = 'Team members can delete category settings'
  ) THEN
    CREATE POLICY "Team members can delete category settings" ON public.team_category_settings
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.team_categories tc
        WHERE tc.id = team_category_settings.category_id
          AND public.is_team_member(tc.team_id, auth.uid())
      )
    );
  END IF;
END $$;

-- Trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_category_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_team_category_settings_updated_at
    BEFORE UPDATE ON public.team_category_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- =========================
-- Team Posts
-- =========================
CREATE TABLE IF NOT EXISTS public.team_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  category_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  pinned boolean DEFAULT false,
  file_urls text[] DEFAULT '{}',
  CONSTRAINT fk_team_posts_team FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_posts_category FOREIGN KEY (category_id) REFERENCES public.team_categories(id) ON DELETE SET NULL
);

ALTER TABLE public.team_posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_posts' AND policyname = 'Team members can select posts'
  ) THEN
    CREATE POLICY "Team members can select posts" ON public.team_posts
    FOR SELECT USING (public.is_team_member(team_id, auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_posts' AND policyname = 'Team members can insert posts'
  ) THEN
    CREATE POLICY "Team members can insert posts" ON public.team_posts
    FOR INSERT WITH CHECK (public.is_team_member(team_id, auth.uid()) AND created_by = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_posts' AND policyname = 'Owners or team creator can update posts'
  ) THEN
    CREATE POLICY "Owners or team creator can update posts" ON public.team_posts
    FOR UPDATE USING (
      created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.teams t WHERE t.id = team_posts.team_id AND t.created_by = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_posts' AND policyname = 'Owners or team creator can delete posts'
  ) THEN
    CREATE POLICY "Owners or team creator can delete posts" ON public.team_posts
    FOR DELETE USING (
      created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.teams t WHERE t.id = team_posts.team_id AND t.created_by = auth.uid()
      )
    );
  END IF;
END $$;

-- Trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_posts_updated_at'
  ) THEN
    CREATE TRIGGER update_team_posts_updated_at
    BEFORE UPDATE ON public.team_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- =========================
-- Team Post Comments
-- =========================
CREATE TABLE IF NOT EXISTS public.team_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL,
  CONSTRAINT fk_team_post_comments_post FOREIGN KEY (post_id) REFERENCES public.team_posts(id) ON DELETE CASCADE
);

ALTER TABLE public.team_post_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_post_comments' AND policyname = 'Team members can select comments'
  ) THEN
    CREATE POLICY "Team members can select comments" ON public.team_post_comments
    FOR SELECT USING (public.is_team_member_of_post(post_id, auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_post_comments' AND policyname = 'Team members can insert comments'
  ) THEN
    CREATE POLICY "Team members can insert comments" ON public.team_post_comments
    FOR INSERT WITH CHECK (public.is_team_member_of_post(post_id, auth.uid()) AND created_by = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_post_comments' AND policyname = 'Owners can update comments'
  ) THEN
    CREATE POLICY "Owners can update comments" ON public.team_post_comments
    FOR UPDATE USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_post_comments' AND policyname = 'Owners can delete comments'
  ) THEN
    CREATE POLICY "Owners can delete comments" ON public.team_post_comments
    FOR DELETE USING (created_by = auth.uid());
  END IF;
END $$;

-- Trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_post_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_team_post_comments_updated_at
    BEFORE UPDATE ON public.team_post_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- =========================
-- Phase Based Analyses (used by messaging/lead detail)
-- =========================
CREATE TABLE IF NOT EXISTS public.phase_based_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  phase_id uuid NOT NULL,
  analysis jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.phase_based_analyses ENABLE ROW LEVEL SECURITY;

-- Policies: Only owner of the lead can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'phase_based_analyses' AND policyname = 'Lead owner can select analyses'
  ) THEN
    CREATE POLICY "Lead owner can select analyses" ON public.phase_based_analyses
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.leads l
        WHERE l.id = phase_based_analyses.lead_id AND l.user_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'phase_based_analyses' AND policyname = 'Lead owner can insert analyses'
  ) THEN
    CREATE POLICY "Lead owner can insert analyses" ON public.phase_based_analyses
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.leads l
        WHERE l.id = phase_based_analyses.lead_id AND l.user_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'phase_based_analyses' AND policyname = 'Lead owner can update analyses'
  ) THEN
    CREATE POLICY "Lead owner can update analyses" ON public.phase_based_analyses
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.leads l
        WHERE l.id = phase_based_analyses.lead_id AND l.user_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'phase_based_analyses' AND policyname = 'Lead owner can delete analyses'
  ) THEN
    CREATE POLICY "Lead owner can delete analyses" ON public.phase_based_analyses
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.leads l
        WHERE l.id = phase_based_analyses.lead_id AND l.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Indexes for performance (idempotent creation)
CREATE INDEX IF NOT EXISTS idx_team_categories_team ON public.team_categories(team_id);
CREATE INDEX IF NOT EXISTS idx_team_category_settings_category ON public.team_category_settings(category_id);
CREATE INDEX IF NOT EXISTS idx_team_posts_team ON public.team_posts(team_id);
CREATE INDEX IF NOT EXISTS idx_team_posts_category ON public.team_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_team_post_comments_post ON public.team_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_phase_based_analyses_lead_phase ON public.phase_based_analyses(lead_id, phase_id);

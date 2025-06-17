
-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  industry TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  status TEXT DEFAULT 'lead',
  pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE SET NULL,
  phase_id UUID REFERENCES public.pipeline_phases(id) ON DELETE SET NULL,
  social_media_username TEXT,
  social_media_followers INTEGER,
  social_media_following INTEGER,
  social_media_engagement_rate DECIMAL,
  social_media_profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  color TEXT DEFAULT '#40E0D0',
  meeting_type TEXT,
  cancelled BOOLEAN DEFAULT FALSE,
  priority TEXT,
  order_index INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  color TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Users can manage own leads" ON public.leads
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for tasks
CREATE POLICY "Users can manage own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for notes
CREATE POLICY "Users can manage own notes" ON public.notes
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can manage own messages" ON public.messages
  FOR ALL USING (auth.uid() = user_id);

-- Create function to auto-create default pipeline for new users
CREATE OR REPLACE FUNCTION public.create_default_pipeline_for_user()
RETURNS TRIGGER AS $$
DECLARE
  pipeline_id UUID;
BEGIN
  -- Create default pipeline
  INSERT INTO public.pipelines (user_id, name, order_index)
  VALUES (NEW.id, 'Standard Pipeline', 0)
  RETURNING id INTO pipeline_id;
  
  -- Create default phases
  INSERT INTO public.pipeline_phases (pipeline_id, name, order_index)
  VALUES 
    (pipeline_id, 'Kontakt erstellt', 0),
    (pipeline_id, 'Kontaktaufnahme', 1),
    (pipeline_id, 'Kennenlernen', 2),
    (pipeline_id, 'Präsentation', 3),
    (pipeline_id, 'Follow-Up', 4);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to include pipeline creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  pipeline_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  -- Create default pipeline
  INSERT INTO public.pipelines (user_id, name, order_index)
  VALUES (NEW.id, 'Standard Pipeline', 0)
  RETURNING id INTO pipeline_id;
  
  -- Create default phases
  INSERT INTO public.pipeline_phases (pipeline_id, name, order_index)
  VALUES 
    (pipeline_id, 'Kontakt erstellt', 0),
    (pipeline_id, 'Kontaktaufnahme', 1),
    (pipeline_id, 'Kennenlernen', 2),
    (pipeline_id, 'Präsentation', 3),
    (pipeline_id, 'Follow-Up', 4);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

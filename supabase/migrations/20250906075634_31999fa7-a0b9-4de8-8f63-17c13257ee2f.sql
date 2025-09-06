-- Create tree-related tables for TreeGenerator functionality
CREATE TABLE IF NOT EXISTS tree_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(username),
  UNIQUE(slug)
);

CREATE TABLE IF NOT EXISTS tree_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES tree_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE tree_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own tree profiles" ON tree_profiles
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tree links" ON tree_links
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tree_profiles tp
    WHERE tp.id = tree_links.profile_id
    AND tp.user_id = auth.uid()
  )
);

-- Anyone can view tree profiles and links (for public tree pages)
CREATE POLICY "Tree profiles are publicly viewable" ON tree_profiles
FOR SELECT USING (true);

CREATE POLICY "Tree links are publicly viewable" ON tree_links
FOR SELECT USING (true);
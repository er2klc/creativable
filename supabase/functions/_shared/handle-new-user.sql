
-- First, ensure we're executing as the postgres role
SET ROLE postgres;

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.generate_profile_slug(character varying, character varying);
DROP FUNCTION IF EXISTS public.generate_profile_slug(text, text);
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the profile slug generator with proper security
CREATE OR REPLACE FUNCTION public.generate_profile_slug(display_name text, email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from display name or email
    base_slug := LOWER(REGEXP_REPLACE(
        COALESCE(display_name, SPLIT_PART(email, '@', 1)),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
    ));
    
    new_slug := base_slug;
    
    -- Check if slug exists and generate a new one if it does
    WHILE EXISTS (
        SELECT 1 FROM profiles 
        WHERE slug = new_slug
    ) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN new_slug;
END;
$$;

-- Ensure proper ownership and permissions for the slug generator
ALTER FUNCTION public.generate_profile_slug(text, text) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.generate_profile_slug(text, text) TO postgres;
GRANT EXECUTE ON FUNCTION public.generate_profile_slug(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_profile_slug(text, text) TO service_role;

-- Create the user handler with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pipeline_id uuid;
BEGIN
  -- First create the profile
  INSERT INTO public.profiles (
    id,
    display_name,
    email,
    avatar_url,
    slug
  )
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'display_name',
      new.email
    ),
    new.email,
    CASE floor(random() * 6)::int
      WHEN 0 THEN '/lovable-uploads/45d6a707-e026-4964-aac9-4f294a2b5a1c.png'
      WHEN 1 THEN '/lovable-uploads/fb3bc35e-5171-45ed-af5c-c7a30f599874.png'
      WHEN 2 THEN '/lovable-uploads/8a347328-8477-4903-9fe4-197194bc5929.png'
      WHEN 3 THEN '/lovable-uploads/02298249-f2cc-496d-8eb3-e214b1fa2a25.png'
      WHEN 4 THEN '/lovable-uploads/bb1acf4a-fd2c-4afe-b89d-b8924a83944c.png'
      ELSE '/lovable-uploads/16a38ed9-b681-4f77-9bf8-8ca9f8439556.png'
    END,
    generate_profile_slug(
      COALESCE(
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'display_name',
        new.email
      )::text,
      new.email::text
    )
  );

  -- Then create the pipeline and store its ID
  INSERT INTO pipelines (user_id, name, order_index)
  VALUES (new.id, 'Pipeline', 0)
  RETURNING id INTO pipeline_id;

  -- Finally create the phases using the pipeline_id
  INSERT INTO pipeline_phases (pipeline_id, name, order_index)
  VALUES 
    (pipeline_id, 'Kontakt erstellt', 0),
    (pipeline_id, 'Kontaktaufnahme', 1),
    (pipeline_id, 'Kennenlernen', 2),
    (pipeline_id, 'Präsentation', 3),
    (pipeline_id, 'Follow-Up', 4);

  RETURN new;
END;
$$;

-- Ensure proper ownership and permissions for the handler
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Ensure proper permissions on required tables
GRANT ALL ON public.profiles TO postgres, authenticated, service_role;
GRANT ALL ON public.pipelines TO postgres, authenticated, service_role;
GRANT ALL ON public.pipeline_phases TO postgres, authenticated, service_role;

-- Drop and recreate the trigger with proper ownership
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Reset role
RESET ROLE;

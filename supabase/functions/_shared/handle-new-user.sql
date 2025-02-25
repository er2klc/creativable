
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pipeline_id uuid;
BEGIN
  -- First create the profile
  INSERT INTO public.profiles (
    id,
    display_name,
    email,
    avatar_url
  )
  VALUES (
    new.id,
    COALESCE(
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
    END
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

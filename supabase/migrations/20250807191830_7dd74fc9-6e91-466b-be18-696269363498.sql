-- Ensure both functions run with a secure, explicit schema search path
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT n.nspname AS schema,
           p.proname AS name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname IN ('update_updated_at_column', 'is_team_member_of_post')
  ) LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public', r.schema, r.name, r.args);
  END LOOP;
END $$;

-- Optional: re-affirm functions exist in public schema (no-op if already there);
-- This keeps existing bodies intact while attaching search_path attribute
-- update_updated_at_column() typically has no args and returns trigger
-- If it doesn't exist yet, create a safe stub to avoid linter errors (will be replaced by your existing definition if present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'update_updated_at_column' AND n.nspname = 'public'
  ) THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS trigger
    LANGUAGE plpgsql
    SET search_path = public
    AS $$
    BEGIN
      NEW.updated_at := now();
      RETURN NEW;
    END;
    $$;
  END IF;
END $$;

-- Ensure the search_path is set even if multiple versions exist (overload safety)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT n.nspname AS schema,
           p.proname AS name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'update_updated_at_column'
  ) LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public', r.schema, r.name, r.args);
  END LOOP;
END $$;
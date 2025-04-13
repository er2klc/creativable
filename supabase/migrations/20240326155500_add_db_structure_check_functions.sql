
-- Function to check if a specific column exists in a table
CREATE OR REPLACE FUNCTION check_table_column(table_name text, column_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = check_table_column.table_name
    AND column_name = check_table_column.column_name
  ) INTO column_exists;
  
  RETURN json_build_object(
    'exists', column_exists,
    'table', table_name,
    'column', column_name
  );
END;
$$;

-- Function to check if multiple columns exist in a table
CREATE OR REPLACE FUNCTION check_table_columns(table_name text, column_names text[])
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  missing_columns text[] := '{}';
  all_exist boolean := true;
  column_name text;
BEGIN
  FOREACH column_name IN ARRAY column_names
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = check_table_columns.table_name
      AND column_name = column_name
    ) THEN
      missing_columns := array_append(missing_columns, column_name);
      all_exist := false;
    END IF;
  END LOOP;
  
  RETURN json_build_object(
    'all_exist', all_exist,
    'table', table_name,
    'missing_columns', missing_columns
  );
END;
$$;

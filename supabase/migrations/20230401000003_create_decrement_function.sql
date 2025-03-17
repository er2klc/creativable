
-- Create a simple decrement function for updating counters
CREATE OR REPLACE FUNCTION decrement(x integer) RETURNS integer AS $$
  SELECT GREATEST(0, $1 - 1)
$$ LANGUAGE SQL IMMUTABLE;

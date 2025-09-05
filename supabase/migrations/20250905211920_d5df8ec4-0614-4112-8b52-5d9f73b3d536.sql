-- Fix infinite recursion in elevate RLS policies by creating security definer functions

-- Create security definer function to check if user has platform access
CREATE OR REPLACE FUNCTION public.user_has_platform_access(platform_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Check if user is platform creator
  IF EXISTS (
    SELECT 1 FROM elevate_platforms ep 
    WHERE ep.id = platform_uuid AND ep.created_by = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  -- Check direct user access
  IF EXISTS (
    SELECT 1 FROM elevate_user_access eua
    WHERE eua.platform_id = platform_uuid AND eua.user_id = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  -- Check team access
  IF EXISTS (
    SELECT 1 FROM elevate_team_access eta
    JOIN team_members tm ON eta.team_id = tm.team_id
    WHERE eta.platform_id = platform_uuid AND tm.user_id = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create security definer function to check if user can manage platform access
CREATE OR REPLACE FUNCTION public.user_can_manage_platform_access(platform_uuid uuid, user_uuid uuid, target_user_uuid uuid, granted_by_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- User can manage their own access
  IF user_uuid = target_user_uuid THEN
    RETURN true;
  END IF;
  
  -- User who granted access can manage it
  IF user_uuid = granted_by_uuid THEN
    RETURN true;
  END IF;
  
  -- Platform creator can manage all access
  IF EXISTS (
    SELECT 1 FROM elevate_platforms ep
    WHERE ep.id = platform_uuid AND ep.created_by = user_uuid
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view accessible elevate platforms" ON public.elevate_platforms;
DROP POLICY IF EXISTS "Users can manage platform access" ON public.elevate_user_access;

-- Create new safe policies using security definer functions
CREATE POLICY "Users can view accessible elevate platforms" 
ON public.elevate_platforms 
FOR SELECT 
USING (user_has_platform_access(id, auth.uid()));

CREATE POLICY "Users can manage platform access" 
ON public.elevate_user_access 
FOR ALL 
USING (user_can_manage_platform_access(platform_id, auth.uid(), user_id, granted_by));
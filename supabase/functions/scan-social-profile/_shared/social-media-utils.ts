export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface SocialMediaStats {
  bio?: string | null;
  followers?: number | null;
  following?: number | null;
  posts?: number | null;
  connections?: number | null;
  isPrivate?: boolean | null;
  headline?: string | null;
  name?: string | null;
  company_name?: string | null;
  position?: string | null;
}
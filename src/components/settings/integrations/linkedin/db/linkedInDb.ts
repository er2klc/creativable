import { supabase } from "@/integrations/supabase/client";

export async function updatePlatformAuthStatus(userId: string, updates: {
  is_connected?: boolean;
  access_token?: string | null;
  auth_token?: string | null;
  refresh_token?: string | null;
  expires_at?: string | null;
}) {
  const { error: statusError } = await supabase
    .from('platform_auth_status')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('platform', 'linkedin')
    .eq('user_id', userId);

  if (statusError) throw statusError;
}

export async function loadLinkedInCredentials() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: platformAuth, error } = await supabase
      .from('platform_auth_status')
      .select('auth_token, refresh_token, access_token')
      .eq('platform', 'linkedin')
      .single();

    if (error) {
      console.error('Error loading LinkedIn credentials:', error);
      return null;
    }

    return platformAuth;
  } catch (error) {
    console.error('Error in loadLinkedInCredentials:', error);
    return null;
  }
}
import { supabase } from "@/integrations/supabase/client";

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  // Get LinkedIn credentials from platform_auth_status
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("No active session found");
  }

  const { data: platformAuth, error: credentialsError } = await supabase
    .from('platform_auth_status')
    .select('auth_token, refresh_token')
    .eq('platform', 'linkedin')
    .eq('user_id', session.user.id)
    .single();

  if (credentialsError || !platformAuth) {
    throw new Error('LinkedIn credentials not found');
  }

  const clientId = platformAuth.auth_token;
  const clientSecret = platformAuth.refresh_token;

  if (!clientId || !clientSecret) {
    throw new Error('LinkedIn credentials not configured');
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    console.error('Token exchange failed:', errorData);
    throw new Error(errorData.error_description || 'Failed to exchange code for token');
  }

  return await tokenResponse.json();
}

export async function revokeLinkedInToken(accessToken: string, clientId: string, clientSecret: string) {
  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: accessToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || 'Failed to revoke token');
    }
  } catch (error) {
    console.error('Error revoking LinkedIn token:', error);
    throw error;
  }
}
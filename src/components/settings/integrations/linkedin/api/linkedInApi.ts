import { supabase } from "@/integrations/supabase/client";

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  try {
    const { data: response, error } = await supabase.functions.invoke('linkedin-auth-callback', {
      body: {
        code,
        redirectUri,
      },
    });

    if (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error(error.message || 'Failed to exchange code for token');
    }

    return response;
  } catch (error) {
    console.error('Error in exchangeCodeForToken:', error);
    throw error;
  }
}

export async function revokeLinkedInToken(accessToken: string, clientId: string, clientSecret: string) {
  try {
    const { error } = await supabase.functions.invoke('linkedin-auth-callback', {
      body: {
        action: 'revoke',
        accessToken,
        clientId,
        clientSecret,
      },
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to revoke token');
    }
  } catch (error) {
    console.error('Error revoking LinkedIn token:', error);
    throw error;
  }
}
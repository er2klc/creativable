export const linkedInApi = {
  async refreshToken(refreshToken: string, clientId: string, clientSecret: string) {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('LinkedIn token refresh failed:', {
        status: response.status,
        body: errorData
      });
      throw new Error('Failed to refresh LinkedIn access token. Please reconnect your account.');
    }

    return await response.json();
  },

  validateProfileUrl(url: string): string {
    console.log('Validating LinkedIn URL:', url);
    
    if (!url) {
      throw new Error('LinkedIn profile URL is required');
    }

    // Handle different URL formats
    let profileId = '';
    
    // Format: linkedin.com/in/username
    if (url.includes('linkedin.com/in/')) {
      profileId = url.split('linkedin.com/in/')[1].split('/')[0].split('?')[0];
    } 
    // Format: Just the username
    else if (!url.includes('http') && !url.includes('/')) {
      profileId = url;
    }
    // Format: Full URL with https
    else if (url.match(/https?:\/\/(www\.)?linkedin\.com\/in\/([^\/\?]+)/)) {
      profileId = url.match(/https?:\/\/(www\.)?linkedin\.com\/in\/([^\/\?]+)/)[2];
    }

    if (!profileId) {
      console.error('Could not extract profile ID from URL:', url);
      throw new Error('Invalid LinkedIn profile URL format');
    }

    console.log('Extracted LinkedIn profile ID:', profileId);
    return profileId;
  },

  async validateToken(accessToken: string) {
    console.log('Starting LinkedIn token validation process...');
    
    try {
      // Check basic profile access with userinfo endpoint
      console.log('Checking basic profile access...');
      const meResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202304',
          'Content-Type': 'application/json',
        },
      });

      if (!meResponse.ok) {
        const errorText = await meResponse.text();
        console.error('LinkedIn /userinfo endpoint error:', {
          status: meResponse.status,
          statusText: meResponse.statusText,
          body: errorText,
          headers: Object.fromEntries(meResponse.headers.entries())
        });

        if (meResponse.status === 401) {
          throw new Error('LinkedIn access token is invalid or expired. Please reconnect your account.');
        }
        throw new Error(`LinkedIn profile access failed: ${errorText}`);
      }

      const profileData = await meResponse.json();
      console.log('Successfully validated basic profile access:', profileData);

      // Verify messaging permissions
      console.log('Checking messaging permissions...');
      const permissionsResponse = await fetch('https://api.linkedin.com/v2/userPermissions', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202304',
          'Content-Type': 'application/json',
        },
      });

      if (!permissionsResponse.ok) {
        const errorText = await permissionsResponse.text();
        console.error('LinkedIn permissions check failed:', {
          status: permissionsResponse.status,
          headers: Object.fromEntries(permissionsResponse.headers.entries()),
          body: errorText
        });
        throw new Error(`Failed to verify LinkedIn permissions: ${errorText}`);
      }

      const permissions = await permissionsResponse.json();
      console.log('Retrieved LinkedIn permissions:', permissions);

      const hasMessagingPermission = permissions.elements?.some(
        (p: any) => p.permission?.name === 'w_member_social' && p.status === 'APPROVED'
      );

      if (!hasMessagingPermission) {
        console.error('Missing required w_member_social permission');
        throw new Error('LinkedIn access token lacks messaging permissions. Please reconnect your account with all required permissions.');
      }

      console.log('Successfully validated all required permissions');
      return profileData;

    } catch (error) {
      console.error('Error during LinkedIn token validation:', error);
      throw error;
    }
  },

  async sendMessage(accessToken: string, recipientUrn: string, message: string, subject?: string) {
    console.log('Attempting to send LinkedIn message to:', recipientUrn);
    
    try {
      const messagePayload = {
        recipients: {
          values: [{
            person: `urn:li:person:${recipientUrn}`
          }]
        },
        body: message
      };

      if (subject) {
        messagePayload['subject'] = subject;
      }

      const response = await fetch('https://api.linkedin.com/v2/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202304',
        },
        body: JSON.stringify(messagePayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('LinkedIn messaging API error:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorData
        });

        if (response.status === 403) {
          throw new Error('Cannot send message. The recipient may not be a 1st-degree connection or your LinkedIn token lacks required permissions.');
        }

        throw new Error(`Failed to send LinkedIn message: ${errorData}`);
      }

      const result = await response.json();
      console.log('Successfully sent LinkedIn message:', result);
      return result;
    } catch (error) {
      console.error('Error sending LinkedIn message:', error);
      throw error;
    }
  }
};
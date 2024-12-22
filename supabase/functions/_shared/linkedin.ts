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
    if (!url.includes('linkedin.com/in/')) {
      throw new Error('Invalid LinkedIn profile URL');
    }
    return url.split('linkedin.com/in/')[1].split('/')[0].split('?')[0];
  },

  async validateToken(accessToken: string) {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202304',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('LinkedIn /me endpoint error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });

      if (response.status === 401) {
        throw new Error('LinkedIn access token is invalid. Please reconnect your account.');
      } else if (response.status === 403) {
        throw new Error('LinkedIn access token lacks required permissions. Please reconnect your account with all required permissions.');
      }

      throw new Error('LinkedIn access token validation failed. Please check your connection in settings.');
    }

    return await response.json();
  },

  async sendMessage(accessToken: string, profileId: string, message: string) {
    const response = await fetch('https://api.linkedin.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202304',
      },
      body: JSON.stringify({
        recipients: [`urn:li:member:${profileId}`],
        messageText: message
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('LinkedIn messaging API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });

      if (response.status === 403) {
        throw new Error('Cannot send message. The recipient may not be a 1st-degree connection or your LinkedIn token lacks required permissions.');
      }

      throw new Error(`Failed to send LinkedIn message: ${errorData}`);
    }

    return await response.json();
  }
};